import { createNodePrinter } from "..";
export const printArrayType = createNodePrinter((node, context) => `[${context.renderNode(node.length)}]${context.renderNode(node.elementType)}`);
