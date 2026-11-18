import { GoAST } from "@go";
import { TsAST } from "@typescript";
import { callExpressionTransformer } from "../../../shared";
import { arrayCoalescingDependency, coalescingFunctionIdentifier } from "./sharedDependency";
export async function coalescingExpressionHandler(node, context) {
    if (TsAST.isCallExpression(node)) {
        return context.transform(node, [callExpressionTransformer]);
    }
    const packageName = context.registerSharedDependency(arrayCoalescingDependency.value);
    return context.success({
        result: GoAST.createSelectorExpression({
            target: packageName,
            identifier: coalescingFunctionIdentifier,
        }),
    });
}
