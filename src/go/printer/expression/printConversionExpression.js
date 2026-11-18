import { createNodePrinter } from "..";
export const printConversionExpression = createNodePrinter((node, context) => `(${context.renderNode(node.typeReference)})(${context.renderNode(node.operand)})`);
