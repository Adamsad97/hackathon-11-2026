import { createNodePrinter } from "..";
export const printReceiveExpression = createNodePrinter((node, context) => `<-(${context.renderNode(node.operand)})`);
