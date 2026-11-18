import { createNodePrinter } from "..";
export const printDereferenceExpression = createNodePrinter((node, context) => `*(${context.renderNode(node.operand)})`);
