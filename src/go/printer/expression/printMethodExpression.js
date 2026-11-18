import { createNodePrinter } from "..";
export const printMethodExpression = createNodePrinter((node, context) => `(${context.renderNode(node.receiverType)}).${context.renderNode(node.identifier)}`);
