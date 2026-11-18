import { createNodePrinter } from "..";
export const printDeferStatement = createNodePrinter((node, context) => `defer ${context.renderNode(node.call)}`);
