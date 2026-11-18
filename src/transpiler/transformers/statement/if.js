import * as DArray from "@duplojs/lang/array";
import * as DCommon from "@duplojs/lang/common";
import * as DEither from "@duplojs/lang/either";
import * as DModeling from "@duplojs/lang/modeling";
import { GoAST } from "@go";
import { createTransformer } from "@transformer";
import { TsAST } from "@typescript";
import { expressionTransformers } from "../expression";
import { statementTransformers } from ".";
function asBlock(before, result) {
    if (DModeling.hasTagValue(result, "[node][statement]block")
        && DArray.lengthEqual(before, 0)) {
        return result;
    }
    return GoAST.createBlockStatement({
        statements: DArray.concat(before, [result]),
    });
}
export const ifStatementTransformer = createTransformer(async (node, context) => {
    if (!TsAST.isIfStatement(node)) {
        return context.notSupport();
    }
    const condition = await DCommon.asyncPipe(context.transform(node.expression, expressionTransformers.value), DEither.unwrapRight);
    if (DEither.isLeft(condition)) {
        return condition;
    }
    const thenBranch = await DCommon.asyncPipe(context.transform(node.thenStatement, statementTransformers.value), DEither.unwrapRight);
    if (DEither.isLeft(thenBranch)) {
        return thenBranch;
    }
    const elseStatement = node.elseStatement;
    const elseBranch = await DCommon.justExec(async () => {
        if (!elseStatement) {
            return undefined;
        }
        const branch = await DCommon.asyncPipe(context.transform(elseStatement, statementTransformers.value), DEither.unwrapRight);
        if (DEither.isLeft(branch)) {
            return branch;
        }
        if (TsAST.isIfStatement(elseStatement)
            && DModeling.hasTagValue(branch.result, "[node][statement]if")
            && DArray.lengthEqual(branch.before, 0)) {
            return branch.result;
        }
        return asBlock(branch.before, branch.result);
    });
    if (elseBranch && DEither.isLeft(elseBranch)) {
        return elseBranch;
    }
    return context.success({
        before: condition.before,
        result: GoAST.createIfStatement({
            condition: condition.result,
            body: asBlock(thenBranch.before, thenBranch.result),
            elseBranch,
        }),
    });
});
