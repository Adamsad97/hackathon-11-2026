import { type Transformer } from "@transformer";
import { GoAST } from "@go";
import { TsAST } from "@typescript";
import type { Type } from "typescript/async";
import * as DArray from "@duplojs/lang/array";
import * as DCommon from "@duplojs/lang/common";
import * as DEither from "@duplojs/lang/either";
import { type BuildContext } from "../../../../context/build";
import { evaluateToVariable } from "../../../expression/evaluate";
import { transformCheckerType } from "../../../type";
import {
	createMembersTest,
	getCallbackTypes,
	getEitherValue,
	getFunctionTypes,
	getMemberValue,
	placeValue,
	resolveEitherInput,
	type EitherMember,
} from "../members";

interface MatcherCase {
	readonly information: string;
	readonly handler: GoAST.Identifier;
	readonly hasParameter: boolean;
	readonly returnType: Type;
	readonly location: TsAST.Node;
}

// Information littérale d'un type Either : le premier argument de `Left<"…", V>`, ou celle
// imposée par le type (`Success` porte toujours `"success"`, `Fail` toujours `"fail"`).
async function getInformation(source: Type, location: TsAST.Node, context: BuildContext) {
	const typeNode = await context.transpilation.typeChecker.typeToTypeNode(source, location);

	if (!typeNode || !TsAST.isTypeReferenceNode(typeNode)) {
		return undefined;
	}

	const name = TsAST.isIdentifier(typeNode.typeName)
		? typeNode.typeName.text
		: typeNode.typeName.right.text;

	if (name === "Success") {
		return "success";
	}

	if (name === "Fail") {
		return "fail";
	}

	const informationNode = typeNode.typeArguments?.[0];

	if (
		name !== "Left"
		|| !informationNode
		|| !TsAST.isLiteralTypeNode(informationNode)
		|| !TsAST.isStringLiteral(informationNode.literal)
	) {
		return undefined;
	}

	return informationNode.literal.text;
}

// Informations possibles d'un membre : une par type TypeScript représenté par ce membre
// (`Left<"division-by-zero", 0>` et `Left<"negative-operand", number>` partagent `EitherLeft[float64]`).
async function getMemberInformations(
	sources: readonly Type[],
	location: TsAST.Node,
	context: BuildContext,
) {
	const informations: string[] = [];

	for (const source of sources) {
		const information = await getInformation(source, location, context);

		if (information === undefined) {
			return undefined;
		}

		informations.push(information);
	}

	return informations;
}

// `matchInformation(input, { information: handler, … })` : le traitement est choisi selon
// l'information du résultat et reçoit sa valeur. Le membre de l'union est choisi par son
// étiquette ; plusieurs `Left` peuvent partager une représentation Go, l'information (une chaîne)
// les départage alors à l'exécution. Une valeur qui n'est pas un Either est renvoyée telle quelle.
// La forme à un argument renvoie une fonction : elle devient une fonction littérale Go.
export async function matchInformationExpressionHandler(
	node: TsAST.Node,
	context: BuildContext,
): Promise<ReturnType<Transformer<GoAST.Expression>["transformer"]>> {
	if (!TsAST.isCallExpression(node)) {
		return context.error(node, "match-information-reference-without-call-not-supported");
	}

	const isCurried = DArray.lengthEqual(node.arguments, 1);

	if (!isCurried && !DArray.lengthEqual(node.arguments, 2)) {
		return context.error(node, "match-information-expects-one-or-two-arguments");
	}

	const { typeChecker } = context.transpilation;
	const [firstNode, secondNode] = node.arguments;
	const matcherNode = isCurried ? firstNode : secondNode;

	if (!firstNode || !matcherNode || !TsAST.isObjectLiteralExpression(matcherNode)) {
		return context.error(node, "match-information-expects-object-literal-matcher");
	}

	// Comme en JavaScript : l'entrée, puis chaque traitement dans l'ordre des propriétés.
	const input = isCurried
		? undefined
		: await evaluateToVariable(firstNode, context);

	if (input && DEither.isLeft(input)) {
		return input;
	}

	let before: readonly GoAST.Statement[] = input ? DEither.unwrapRight(input).before : [];
	const cases: MatcherCase[] = [];

	for (const property of matcherNode.properties) {
		if (
			!TsAST.isPropertyAssignment(property)
			|| !(TsAST.isIdentifier(property.name) || TsAST.isStringLiteral(property.name))
		) {
			return context.error(property, "match-information-property-not-supported");
		}

		const handler = await evaluateToVariable(property.initializer, context);

		if (DEither.isLeft(handler)) {
			return handler;
		}

		const handlerTypes = await getCallbackTypes(property.initializer, context);

		if (DEither.isLeft(handlerTypes)) {
			return handlerTypes;
		}

		const { parameters, returnType } = DEither.unwrapRight(handlerTypes);

		before = DArray.concat(before, DEither.unwrapRight(handler).before);
		cases.push({
			information: property.name.text,
			handler: DEither.unwrapRight(handler).identifier,
			hasParameter: !DArray.lengthEqual(parameters, 0),
			returnType,
			location: property.initializer,
		});
	}

	const callType = await typeChecker.getTypeAtLocation(node);

	const curriedTypes = isCurried
		? await getFunctionTypes(callType, node, context)
		: undefined;

	if (curriedTypes && DEither.isLeft(curriedTypes)) {
		return curriedTypes;
	}

	const curried = curriedTypes && DEither.unwrapRight(curriedTypes);
	const inputType = curried
		? curried.parameters[0]
		: await typeChecker.getTypeAtLocation(firstNode);
	const outputType = curried
		? curried.returnType
		: callType;
	const inputIdentifier = curried
		? context.generateIdentifier()
		: input && DEither.unwrapRight(input).identifier;

	if (!inputType || !inputIdentifier) {
		return context.error(node, "match-information-input-not-resolved");
	}

	const eitherInput = await resolveEitherInput(inputType, node, context);

	if (DEither.isLeft(eitherInput)) {
		return eitherInput;
	}

	const either = DEither.unwrapRight(eitherInput);

	const outputGoType = await transformCheckerType(outputType, node, context);

	if (DEither.isLeft(outputGoType)) {
		return outputGoType;
	}

	const result = context.generateIdentifier();
	const assign = (value: GoAST.Expression) => GoAST.createAssignmentStatement({
		targets: DCommon.cast([result]),
		values: DCommon.cast([value]),
	});

	// Instructions pour un membre de l'union : un `if` par information possible, ou la valeur
	// renvoyée telle quelle si le membre n'est pas un Either.
	const createMemberStatements = async(member: EitherMember) => {
		const memberValue = getMemberValue(inputIdentifier, either, member);

		if (member.side === "other") {
			return DEither.rightPipe(
				await placeValue({
					expression: memberValue,
					goType: member.goType,
					target: outputType,
					location: node,
					context,
				}),
				(value) => DEither.success<readonly GoAST.Statement[]>([assign(value)]),
			);
		}

		const informations = await getMemberInformations(either.union.sources[member.index] ?? [], node, context);

		if (!informations) {
			return context.error(node, "match-information-information-not-resolved");
		}

		const statements: GoAST.Statement[] = [];

		for (const matcherCase of cases) {
			if (!DArray.includes(informations, matcherCase.information)) {
				continue;
			}

			const returnGoType = await transformCheckerType(matcherCase.returnType, matcherCase.location, context);

			if (DEither.isLeft(returnGoType)) {
				return returnGoType;
			}

			const value = await placeValue({
				expression: GoAST.createCallExpression({
					callee: matcherCase.handler,
					arguments: matcherCase.hasParameter ? [getEitherValue(memberValue)] : [],
				}),
				goType: DEither.unwrapRight(returnGoType),
				target: outputType,
				location: matcherCase.location,
				context,
			});

			if (DEither.isLeft(value)) {
				return value;
			}

			const assignment = assign(DEither.unwrapRight(value));

			// Une seule information possible : pas de test à l'exécution.
			statements.push(
				DArray.lengthEqual(informations, 1)
					? assignment
					: GoAST.createIfStatement({
						condition: GoAST.createBinaryExpression({
							operator: "==",
							left: GoAST.createSelectorExpression({
								target: memberValue,
								identifier: GoAST.createIdentifier("Information"),
							}),
							right: GoAST.createStringLiteral({ value: matcherCase.information }),
						}),
						body: GoAST.createBlockStatement({ statements: [assignment] }),
					}),
			);
		}

		return DEither.success<readonly GoAST.Statement[]>(statements);
	};

	const branches: GoAST.Statement[] = [];

	for (const member of either.members) {
		const statements = await createMemberStatements(member);

		if (DEither.isLeft(statements)) {
			return statements;
		}

		branches.push(
			DArray.lengthEqual(either.members, 1)
				? GoAST.createBlockStatement({ statements: DEither.unwrapRight(statements) })
				: GoAST.createIfStatement({
					condition: createMembersTest(inputIdentifier, either, [member]),
					body: GoAST.createBlockStatement({ statements: DEither.unwrapRight(statements) }),
				}),
		);
	}

	const body = DArray.concat(
		[
			GoAST.createVariableDeclarationZeroValue({
				identifier: result,
				typeReference: DEither.unwrapRight(outputGoType),
			}),
		],
		branches,
	);

	if (curried && inputType) {
		const inputGoType = await transformCheckerType(inputType, node, context);

		if (DEither.isLeft(inputGoType)) {
			return inputGoType;
		}

		return context.success({
			before,
			result: GoAST.createFunctionLiteral({
				arguments: [
					GoAST.createFunctionArgument({
						identifier: inputIdentifier,
						type: DEither.unwrapRight(inputGoType),
					}),
				],
				returnTypes: [DEither.unwrapRight(outputGoType)],
				body: GoAST.createBlockStatement({
					statements: DArray.push(body, GoAST.createReturnStatement({ values: [result] })),
				}),
			}),
		});
	}

	return context.success({
		before: DArray.concat(before, body),
		result,
	});
}
