import { getExpressionPrecedence } from "./getExpressionPrecedence";
export function renderOperand(node, context, minimumPrecedence) {
    const text = context.renderNode(node);
    const precedence = getExpressionPrecedence(node, text);
    return precedence < minimumPrecedence ? `(${text})` : text;
}
