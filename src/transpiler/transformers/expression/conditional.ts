import { TsAST } from "@typescript";
import { GoAST } from "@go";
import { createTransformer, type Transformer } from "@transformer";
import * as DArray from "@duplojs/lang/array";
import * as DCommon from "@duplojs/lang/common";
import * as DEither from "@duplojs/lang/either";
import { expressionTransformers } from ".";
import { typeTransformers } from "../type";

export const conditionalExpressionTransformer: Transformer<GoAST.Identifier> = createTransformer(
	async(node, context) => {
		if (!TsAST.isConditionalExpression(node)) {
			return context.notSupport();
		}

		const condition = await DCommon.asyncPipe(
			context.transform(node.condition, expressionTransformers.value),
			DEither.unwrapRight,
		);

		if (DEither.isLeft(condition)) {
			return condition;
		}

		const whenTrue = await DCommon.asyncPipe(
			context.transform(node.whenTrue, expressionTransformers.value),
			DEither.unwrapRight,
		);

		if (DEither.isLeft(whenTrue)) {
			return whenTrue;
		}

		const whenFalse = await DCommon.asyncPipe(
			context.transform(node.whenFalse, expressionTransformers.value),
			DEither.unwrapRight,
		);

		if (DEither.isLeft(whenFalse)) {
			return whenFalse;
		}

		const typeNode = await context.transpilation.typeChecker.typeToTypeNode(
			await context.transpilation.typeChecker.getTypeAtLocation(node),
			node,
		) ?? TsAST.factory.createKeywordTypeNode(TsAST.SyntaxKind.AnyKeyword);

		const resultType = await DCommon.asyncPipe(
			context.transform(typeNode, typeTransformers.value),
			DEither.unwrapRight,
		);

		if (DEither.isLeft(resultType)) {
			return resultType;
		}

		if (!DArray.lengthEqual(resultType.before, 0)) {
			return context.error(typeNode, "un-support-before-on-conditional-type");
		}

		const result = context.generateIdentifier();

		return context.success({
			before: DArray.concat(
				condition.before,
				[
					GoAST.createVariableDeclarationZeroValue({
						identifier: result,
						typeReference: resultType.result,
					}),
					GoAST.createIfStatement({
						condition: condition.result,
						body: GoAST.createBlockStatement({
							statements: DArray.concat(
								whenTrue.before,
								[
									GoAST.createAssignmentStatement({
										targets: DCommon.cast([result]),
										values: DCommon.cast([whenTrue.result]),
									}),
								],
							),
						}),
						elseBranch: GoAST.createBlockStatement({
							statements: DArray.concat(
								whenFalse.before,
								[
									GoAST.createAssignmentStatement({
										targets: DCommon.cast([result]),
										values: DCommon.cast([whenFalse.result]),
									}),
								],
							),
						}),
					}),
				],
			),
			result,
		});
	},
);
