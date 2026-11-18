import { createNodePrinter } from "..";
export const printAddressExpression = createNodePrinter((node, context) => `&(${context.renderNode(node.operand)})`);
