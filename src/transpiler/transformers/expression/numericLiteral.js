import { TsAST } from "@typescript";
import { GoAST } from "@go";
import { createTransformer } from "@transformer";
export const numericLiteralTransformer = createTransformer((node, context) => {
    if (!TsAST.isNumericLiteral(node)) {
        return context.notSupport();
    }
    return context.success({
        result: GoAST.createConversionExpression({
            typeReference: GoAST.builtinTypeReferences.float64,
            operand: GoAST.createFloatLiteral({ value: node.text }),
        }),
    });
});
