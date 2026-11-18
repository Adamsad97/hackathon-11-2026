import { TsAST } from "@typescript";
import { createTransformer } from "@transformer";
import { typeTransformers } from ".";
export const parenthesizedTypeTransformer = createTransformer(async (node, context) => {
    if (!TsAST.isParenthesizedTypeNode(node)) {
        return context.notSupport();
    }
    return context.transform(node.type, typeTransformers.value);
});
