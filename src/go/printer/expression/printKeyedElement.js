import { createNodePrinter } from "..";
export const printKeyedElement = createNodePrinter((node, context) => `${context.renderNode(node.key)}: ${context.renderNode(node.value)}`);
