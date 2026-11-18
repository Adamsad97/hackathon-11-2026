import { GoAST } from "@go";
import { TsAST } from "@typescript";
import { callExpressionTransformer } from "../../../shared";
import { printDependency, printFunctionIdentifier } from "./sharedDependency";
export async function printExpressionHandler(node, context) {
    if (TsAST.isCallExpression(node)) {
        return context.transform(node, [callExpressionTransformer]);
    }
    const packageName = context.registerSharedDependency(printDependency.value);
    return context.success({
        result: GoAST.createSelectorExpression({
            target: packageName,
            identifier: printFunctionIdentifier,
        }),
    });
}
