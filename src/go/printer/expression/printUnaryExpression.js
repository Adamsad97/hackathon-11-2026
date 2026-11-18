import { createNodePrinter } from "..";
export const printUnaryExpression = createNodePrinter((node, context) => `${node.operator}(${context.renderNode(node.operand)})`);
