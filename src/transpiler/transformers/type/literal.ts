import { GoAST } from "@go";
import { createTransformer, type Transformer } from "@transformer";
import { TsAST } from "@typescript";

export const literalTypeTransformer: Transformer<GoAST.BuiltinTypeReference> = createTransformer(
	(node, context) => {
		if (!TsAST.isLiteralTypeNode(node)) {
			return context.notSupport();
		}

		const literal = node.literal;
		const numericLiteral = TsAST.isPrefixUnaryExpression(literal)
			? literal.operand
			: literal;

		if (TsAST.isNumericLiteral(numericLiteral)) {
			return context.success({
				result: GoAST.builtinTypeReferences.float64,
			});
		}

		if (TsAST.isStringLiteral(literal)) {
			return context.success({
				result: GoAST.builtinTypeReferences.string,
			});
		}

		if (
			literal.kind === TsAST.SyntaxKind.TrueKeyword
			|| literal.kind === TsAST.SyntaxKind.FalseKeyword
		) {
			return context.success({
				result: GoAST.builtinTypeReferences.bool,
			});
		}

		return context.notSupport();
	},
);
