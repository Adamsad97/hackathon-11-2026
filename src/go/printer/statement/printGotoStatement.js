import { createNodePrinter } from "..";
export const printGotoStatement = createNodePrinter((node, context) => `goto ${context.renderNode(node.label)}`);
