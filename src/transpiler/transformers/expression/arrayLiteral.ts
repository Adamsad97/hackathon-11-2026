import { TsAST } from "@typescript";
import { GoAST } from "@go";
import { createTransformer, type Transformer } from "@transformer";
import * as DArray from "@duplojs/lang/array";
import * as DCommon from "@duplojs/lang/common";
import * as DEither from "@duplojs/lang/either";
import { expressionTransformers } from ".";

export const arrayLiteralTransformer: Transformer<GoAST.SliceLiteral> = createTransformer(
	async(node, context) => {
		if (!TsAST.isArrayLiteralExpression(node)) {
			return context.notSupport();
		}

		const elements = await DCommon.asyncPipe(
			node.elements,
			DArray.map(
				async(element) => {
					if (TsAST.isSpreadElement(element) || TsAST.isOmittedExpression(element)) {
						return context.error(element, "un-support-array-element");
					}

					return DCommon.asyncPipe(
						context.transform(element, expressionTransformers.value),
						DEither.unwrapRight,
					);
				},
			),
			DCommon.promiseAll,
			DArray.reduce(
				DArray.reduceFrom<{
					before: readonly GoAST.Statement[];
					elements: readonly GoAST.Expression[];
				}>({
					before: [],
					elements: [],
				}),
				({ element, lastValue, next, exit }) => {
					if (DEither.isLeft(element)) {
						return exit(element);
					}

					const elementVariable = GoAST.createShortVariableDeclarationStatement({
						identifier: context.generateIdentifier(),
						initializer: element.result,
					});

					return next({
						before: DArray.concat(
							lastValue.before,
							element.before,
							[elementVariable],
						),
						elements: DArray.push(
							lastValue.elements,
							elementVariable.identifier,
						),
					});
				},
			),
		);

		if (DEither.isLeft(elements)) {
			return elements;
		}

		return context.success({
			before: elements.before,
			result: GoAST.createSliceLiteral({
				typeReference: GoAST.createSliceType({
					elementType: GoAST.builtinTypeReferences.any,
				}),
				elements: elements.elements,
			}),
		});
	},
);
