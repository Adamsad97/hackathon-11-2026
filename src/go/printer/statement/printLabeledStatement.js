import { createNodePrinter } from "..";
export const printLabeledStatement = createNodePrinter((node, context) => `${context.renderNode(node.label)}: ${context.renderNode(node.statement)}`);
