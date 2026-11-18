import { type Transformer } from "@transformer";
import { GoAST } from "@go";
import { TsAST } from "@typescript";
import { IndexKind } from "typescript/async";
import * as DArray from "@duplojs/lang/array";
import * as DCommon from "@duplojs/lang/common";
import * as DEither from "@duplojs/lang/either";
import * as DModeling from "@duplojs/lang/modeling";
import { type BuildContext } from "../../../../context/build";
import { evaluateToVariable } from "../../../expression/evaluate";
import { transformCheckerType } from "../../../type";
import { eitherSuccessDependency, successFunctionIdentifier, successTypeIdentifier } from "../success/sharedDependency";
import {
	createMembersTest,
	filterSide,
	getEitherValue,
	getMemberValue,
	placeValue,
	resolveEitherInput,
} from "../members";

// `group([...])` : la transaction réussit seulement si chaque résultat est un `Right`. Le premier
// échec rencontré devient le résultat ; sinon les valeurs sont réunies, dans l'ordre, dans un `Success`.
// La boucle est placée dans une fonction Go appelée immédiatement : l'échec est un `return` anticipé.
export async function groupExpressionHandler(
	node: TsAST.Node,
	context: BuildContext,
): Promise<ReturnType<Transformer<GoAST.Expression>["transformer"]>> {
	if (!TsAST.isCallExpression(node)) {
		return context.error(node, "group-reference-without-call-not-supported");
	}

	const [groupNode] = node.arguments;

	if (!groupNode || !DArray.lengthEqual(node.arguments, 1)) {
		return context.error(node, "group-expects-one-argument");
	}

	const { typeChecker } = context.transpilation;
	const groupType = await typeChecker.getTypeAtLocation(groupNode);

	const groupGoType = await transformCheckerType(groupType, groupNode, context);

	if (DEither.isLeft(groupGoType)) {
		return groupGoType;
	}

	// Seul un tableau est traduit : un objet (`group({ a, b })`) demanderait une struct par forme.
	if (!DModeling.hasTagValue(DEither.unwrapRight(groupGoType), "[node][type]slice")) {
		return context.error(groupNode, "group-only-supports-arrays");
	}

	const elementType = await typeChecker.getIndexTypeOfType(groupType, IndexKind.Number);

	if (!elementType) {
		return context.error(groupNode, "group-element-type-not-resolved");
	}

	const elementInput = await resolveEitherInput(elementType, groupNode, context);

	if (DEither.isLeft(elementInput)) {
		return elementInput;
	}

	const either = DEither.unwrapRight(elementInput);
	const leftMembers = filterSide(either, "left");
	const rightMembers = filterSide(either, "right");
	const [rightMember] = rightMembers;

	// Un élément fonction (getter) ou une valeur qui n'est pas un Either ne sont pas traduits.
	if (!rightMember || !DArray.lengthEqual(rightMembers, 1) || !DArray.lengthEqual(filterSide(either, "other"), 0)) {
		return context.error(groupNode, "group-element-must-have-one-right-representation");
	}

	if (!DModeling.hasTagValue(rightMember.goType, "[node]type-reference-generic")) {
		return context.error(groupNode, "group-right-value-not-resolved");
	}

	const [valueGoType] = rightMember.goType.typeArguments;

	if (!valueGoType) {
		return context.error(groupNode, "group-right-value-not-resolved");
	}

	const group = await evaluateToVariable(groupNode, context);

	if (DEither.isLeft(group)) {
		return group;
	}

	const outputType = await typeChecker.getTypeAtLocation(node);
	const outputGoType = await transformCheckerType(outputType, node, context);

	if (DEither.isLeft(outputGoType)) {
		return outputGoType;
	}

	const element = context.generateIdentifier();
	const values = context.generateIdentifier();
	const valuesType = GoAST.createSliceType({ elementType: valueGoType });

	const leftReturns: GoAST.Statement[] = [];

	for (const member of leftMembers) {
		const returned = await placeValue({
			expression: getMemberValue(element, either, member),
			goType: member.goType,
			target: outputType,
			location: node,
			context,
		});

		if (DEither.isLeft(returned)) {
			return returned;
		}

		leftReturns.push(
			GoAST.createIfStatement({
				condition: createMembersTest(element, either, [member]),
				body: GoAST.createBlockStatement({
					statements: [GoAST.createReturnStatement({ values: [DEither.unwrapRight(returned)] })],
				}),
			}),
		);
	}

	const successGoType = GoAST.createGenericTypeReference({
		typeReference: GoAST.createPackageTypeReference({
			packageName: context.registerSharedDependency(eitherSuccessDependency.value),
			identifier: successTypeIdentifier,
		}),
		typeArguments: DCommon.cast([valuesType]),
	});

	const success = await placeValue({
		expression: GoAST.createCallExpression({
			callee: GoAST.createInstantiationExpression({
				target: GoAST.createSelectorExpression({
					target: context.registerSharedDependency(eitherSuccessDependency.value),
					identifier: successFunctionIdentifier,
				}),
				typeArguments: DCommon.cast([valuesType]),
			}),
			arguments: [values],
		}),
		goType: successGoType,
		target: outputType,
		location: node,
		context,
	});

	if (DEither.isLeft(success)) {
		return success;
	}

	return context.success({
		before: DEither.unwrapRight(group).before,
		result: GoAST.createCallExpression({
			callee: GoAST.createFunctionLiteral({
				arguments: [],
				returnTypes: [DEither.unwrapRight(outputGoType)],
				body: GoAST.createBlockStatement({
					statements: [
						// Capacité réservée : le nombre de valeurs est au plus celui des résultats.
						GoAST.createShortVariableDeclarationStatement({
							identifier: values,
							initializer: GoAST.createCallExpression({
								callee: GoAST.createIdentifier("make"),
								typeArgument: valuesType,
								arguments: [
									GoAST.createIntegerLiteral({ value: 0n }),
									GoAST.createCallExpression({
										callee: GoAST.createIdentifier("len"),
										arguments: [DEither.unwrapRight(group).identifier],
									}),
								],
							}),
						}),
						GoAST.createRangeStatement({
							binding: GoAST.createRangeDeclaration({
								key: GoAST.createIdentifier("_"),
								value: element,
							}),
							expression: DEither.unwrapRight(group).identifier,
							body: GoAST.createBlockStatement({
								statements: [
									...leftReturns,
									GoAST.createAssignmentStatement({
										targets: DCommon.cast([values]),
										values: DCommon.cast([
											GoAST.createCallExpression({
												callee: GoAST.createIdentifier("append"),
												arguments: [
													values,
													getEitherValue(getMemberValue(element, either, rightMember)),
												],
											}),
										]),
									}),
								],
							}),
						}),
						GoAST.createReturnStatement({ values: [DEither.unwrapRight(success)] }),
					],
				}),
			}),
			arguments: [],
		}),
	});
}
