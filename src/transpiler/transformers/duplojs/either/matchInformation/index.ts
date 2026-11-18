import { type Transformer } from "@transformer";
import { GoAST } from "@go";
import { TsAST } from "@typescript";
import * as DArray from "@duplojs/lang/array";
import * as DCommon from "@duplojs/lang/common";
import * as DEither from "@duplojs/lang/either";
import { type BuildContext } from "../../../../context/build";
import { expressionTransformers } from "../../../expression";
import { applyDependency } from "../../../shared/apply/sharedDependency";
import { eitherLeftDependency } from "../left/sharedDependency";
import { eitherRightDependency } from "../right/sharedDependency";
import { eitherSuccessDependency } from "../success/sharedDependency";
import {
	eitherMatchInformationDependency,
	matchInformationFunctionIdentifier,
} from "./sharedDependency";

async function translateMatcher(
	node: TsAST.ObjectLiteralExpression,
	context: BuildContext,
) {
	const properties = await DCommon.asyncPipe(
		node.properties,
		DArray.map(
			async(property) => {
				if (!TsAST.isPropertyAssignment(property)) {
					return context.error(property, "un-support-matcher-property");
				}

				if (
					!TsAST.isIdentifier(property.name)
					&& !TsAST.isStringLiteral(property.name)
				) {
					return context.error(property.name, "un-support-property-name");
				}

				const name = property.name.text;

				return DCommon.asyncPipe(
					context.transform(property.initializer, expressionTransformers.value),
					DEither.whenIsRight(
						({ before, result }) => ({
							before,
							name,
							result,
						}),
					),
				);
			},
		),
		DCommon.promiseAll,
		DArray.reduce(
			DArray.reduceFrom<{
				before: readonly GoAST.Statement[];
				elements: readonly GoAST.KeyedElement[];
			}>({
				before: [],
				elements: [],
			}),
			({ element, lastValue, next, exit }) => {
				if (DEither.isLeft(element)) {
					return exit(element);
				}

				const propertyVariable = GoAST.createShortVariableDeclarationStatement({
					identifier: context.generateIdentifier(),
					initializer: element.result,
				});

				return next({
					before: DArray.concat(
						lastValue.before,
						element.before,
						[propertyVariable],
					),
					elements: DArray.push(
						lastValue.elements,
						GoAST.createKeyedElement({
							key: GoAST.createStringLiteral({ value: element.name }),
							value: propertyVariable.identifier,
						}),
					),
				});
			},
		),
	);

	if (DEither.isLeft(properties)) {
		return properties;
	}

	return context.success({
		before: properties.before,
		result: GoAST.createMapLiteral({
			typeReference: GoAST.createMapType({
				keyType: GoAST.builtinTypeReferences.string,
				valueType: GoAST.builtinTypeReferences.any,
			}),
			elements: properties.elements,
		}),
	});
}

export async function matchInformationExpressionHandler(
	node: TsAST.Node,
	context: BuildContext,
): Promise<ReturnType<Transformer<GoAST.Expression>["transformer"]>> {
	if (!TsAST.isCallExpression(node)) {
		const packageName = context.registerSharedDependency(eitherMatchInformationDependency.value);
		context.registerSharedDependency(eitherLeftDependency.value);
		context.registerSharedDependency(eitherRightDependency.value);
		context.registerSharedDependency(eitherSuccessDependency.value);
		context.registerSharedDependency(applyDependency.value);

		return context.success({
			result: GoAST.createSelectorExpression({
				target: packageName,
				identifier: matchInformationFunctionIdentifier,
			}),
		});
	}

	if (node.arguments.length !== 2) {
		return context.error(node, "match-information-arity");
	}

	const preparedArguments = await DCommon.asyncPipe(
		node.arguments,
		DArray.map(
			async(argumentNode) => {
				if (TsAST.isSpreadElement(argumentNode)) {
					return context.error(argumentNode, "un-support-spread-argument");
				}

				if (TsAST.isObjectLiteralExpression(argumentNode)) {
					return DCommon.asyncPipe(
						translateMatcher(argumentNode, context),
						DEither.unwrapRight,
					);
				}

				return DCommon.asyncPipe(
					context.transform(argumentNode, expressionTransformers.value),
					DEither.unwrapRight,
				);
			},
		),
		DCommon.promiseAll,
		DArray.reduce(
			DArray.reduceFrom<{
				before: readonly GoAST.Statement[];
				arguments: readonly GoAST.Expression[];
			}>({
				before: [],
				arguments: [],
			}),
			({ element, lastValue, next, exit }) => {
				if (DEither.isLeft(element)) {
					return exit(element);
				}

				const argumentVariable = GoAST.createShortVariableDeclarationStatement({
					identifier: context.generateIdentifier(),
					initializer: element.result,
				});

				return next({
					before: DArray.concat(
						lastValue.before,
						element.before,
						[argumentVariable],
					),
					arguments: DArray.push(
						lastValue.arguments,
						argumentVariable.identifier,
					),
				});
			},
		),
	);

	if (DEither.isLeft(preparedArguments)) {
		return preparedArguments;
	}

	const packageName = context.registerSharedDependency(eitherMatchInformationDependency.value);
	context.registerSharedDependency(eitherLeftDependency.value);
	context.registerSharedDependency(eitherRightDependency.value);
	context.registerSharedDependency(eitherSuccessDependency.value);
	context.registerSharedDependency(applyDependency.value);
	const functionVariable = GoAST.createShortVariableDeclarationStatement({
		identifier: context.generateIdentifier(),
		initializer: GoAST.createSelectorExpression({
			target: packageName,
			identifier: matchInformationFunctionIdentifier,
		}),
	});

	return context.success({
		before: DArray.concat(
			[functionVariable],
			preparedArguments.before,
		),
		result: GoAST.createCallExpression({
			callee: functionVariable.identifier,
			arguments: preparedArguments.arguments,
		}),
	});
}
