import { createNodePrinter } from "..";
export const printCompoundAssignmentStatement = createNodePrinter((node, context) => `${context.renderNode(node.target)} ${node.operator} ${context.renderNode(node.value)}`);
