import { TsAST } from "@typescript";
import { GoAST } from "@go";
import { createTransformer, type Transformer } from "@transformer";
import * as DArray from "@duplojs/lang/array";
import * as DCommon from "@duplojs/lang/common";
import * as DEither from "@duplojs/lang/either";
import { expressionTransformers } from ".";
import { typeTransformers } from "../type";
import { blockStatementTransformer } from "../statement/block";

export const arrowFunctionTransformer: Transformer<GoAST.FunctionLiteral> = createTransformer(
	async(node, context) => {
		if (!TsAST.isArrowFunction(node)) {
			return context.notSupport();
		}

		if (node.modifiers?.some((modifier) => modifier.kind === TsAST.SyntaxKind.AsyncKeyword)) {
			return context.error(node, "un-support-async-arrow");
		}

		if (node.typeParameters) {
			return context.error(node, "un-support-arrow-type-parameters");
		}

		const parameters = await DCommon.asyncPipe(
			node.parameters,
			DArray.map(
				async(parameter) => {
					if (parameter.dotDotDotToken) {
						return context.error(parameter, "un-support-rest-parameter");
					}

					if (parameter.initializer) {
						return context.error(parameter, "un-support-parameter-initializer");
					}

					if (!TsAST.isIdentifier(parameter.name)) {
						return context.error(parameter, "params-name-is-not-identifier");
					}

					const parameterName = parameter.name.text;
					const typeNode = parameter.type ?? await context.transpilation.typeChecker.typeToTypeNode(
						await context.transpilation.typeChecker.getTypeAtLocation(parameter),
						parameter,
					) ?? TsAST.factory.createKeywordTypeNode(TsAST.SyntaxKind.AnyKeyword);

					return DCommon.asyncPipe(
						context.transform(typeNode, typeTransformers.value),
						DEither.whenIsRight(
							({ before, result }) => {
								if (!DArray.lengthEqual(before, 0)) {
									return context.error(parameter, "un-support-before-on-parameter");
								}

								return GoAST.createFunctionArgument({
									identifier: context.createSourceIdentifier(parameterName),
									type: result,
								});
							},
						),
					);
				},
			),
			DCommon.promiseAll,
			DArray.reduce(
				DArray.reduceFrom<readonly GoAST.FunctionArgument[]>([]),
				({ element, lastValue, next, exit }) => {
					if (DEither.isLeft(element)) {
						return exit(element);
					}

					return next(DArray.push(lastValue, element));
				},
			),
		);

		if (DEither.isLeft(parameters)) {
			return parameters;
		}

		const body = TsAST.isBlock(node.body)
			? await DCommon.asyncPipe(
				context.transform(node.body, [blockStatementTransformer]),
				DEither.unwrapRight,
			)
			: await DCommon.asyncPipe(
				context.transform(node.body, expressionTransformers.value),
				DEither.whenIsRight(
					({ before, result }) => ({
						before: [],
						result: GoAST.createBlockStatement({
							statements: DArray.concat(
								before,
								[
									GoAST.createReturnStatement({
										values: [result],
									}),
								],
							),
						}),
					}),
				),
			);

		if (DEither.isLeft(body)) {
			return body;
		}

		if (!DArray.lengthEqual(body.before, 0)) {
			return context.error(node.body, "un-support-before-on-arrow-body");
		}

		return context.success({
			result: GoAST.createFunctionLiteral({
				arguments: parameters,
				returnTypes: [GoAST.builtinTypeReferences.any],
				body: body.result,
			}),
		});
	},
);
