import { GoAST } from "@go";
import { TsAST } from "@typescript";
import { callExpressionTransformer } from "../../../shared";
import { eitherRightDependency } from "../right/sharedDependency";
import { eitherIsRightDependency, isRightFunctionIdentifier } from "./sharedDependency";
export async function isRightExpressionHandler(node, context) {
    if (TsAST.isCallExpression(node)) {
        return context.transform(node, [callExpressionTransformer]);
    }
    const packageName = context.registerSharedDependency(eitherRightDependency.value);
    context.registerSharedDependency(eitherIsRightDependency.value);
    return context.success({
        result: GoAST.createSelectorExpression({
            target: packageName,
            identifier: isRightFunctionIdentifier,
        }),
    });
}
