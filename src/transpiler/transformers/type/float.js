import { GoAST } from "@go";
import { createTransformer } from "@transformer";
import { TsAST } from "@typescript";
export const float64TypeTransformer = createTransformer((node, context) => {
    if (node.kind !== TsAST.SyntaxKind.NumberKeyword) {
        return context.notSupport();
    }
    return context.success({
        result: GoAST.builtinTypeReferences.float64,
    });
});
