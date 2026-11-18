import { TsAST } from "@typescript";
import { GoAST } from "@go";
import { createTransformer, type Transformer } from "@transformer";
import * as DArray from "@duplojs/lang/array";
import * as DCommon from "@duplojs/lang/common";
import * as DEither from "@duplojs/lang/either";
import { expressionTransformers } from "../expression";

export const variableStatementTransformer: Transformer<GoAST.ShortVariableDeclarationStatement> = createTransformer(
	async(node, context) => {
		if (!TsAST.isVariableStatement(node)) {
			return context.notSupport();
		}

		const declarations = await DCommon.asyncPipe(
			node.declarationList.declarations,
			DArray.map(
				async(declaration) => {
					if (!TsAST.isIdentifier(declaration.name)) {
						return context.error(declaration, "variable-name-is-not-identifier");
					}

					if (!declaration.initializer) {
						return context.error(declaration, "un-support-uninitialized-variable");
					}

					const name = declaration.name;

					return DCommon.asyncPipe(
						context.transform(declaration.initializer, expressionTransformers.value),
						DEither.whenIsRight(
							({ before, result }) => ({
								before,
								statement: GoAST.createShortVariableDeclarationStatement({
									identifier: context.createSourceIdentifier(name.text),
									initializer: result,
								}),
							}),
						),
					);
				},
			),
			DCommon.promiseAll,
			DArray.reduce(
				DArray.reduceFrom<{
					before: readonly GoAST.Statement[];
					result: GoAST.ShortVariableDeclarationStatement | undefined;
				}>({
					before: [],
					result: undefined,
				}),
				({ element, lastValue, next, exit }) => {
					if (DEither.isLeft(element)) {
						return exit(element);
					}

					return next({
						before: DArray.concat(
							lastValue.before,
							lastValue.result ? [lastValue.result] : [],
							element.before,
						),
						result: element.statement,
					});
				},
			),
		);

		if (DEither.isLeft(declarations) || !declarations.result) {
			return DEither.isLeft(declarations)
				? declarations
				: context.notSupport();
		}

		return context.success({
			before: declarations.before,
			result: declarations.result,
		});
	},
);
