import { createNodePrinter } from "..";
export const printGoStatement = createNodePrinter((node, context) => `go ${context.renderNode(node.call)}`);
