import { createNodePrinter, renderNodeList } from "..";
export const printAssignmentStatement = createNodePrinter((node, context) => `${renderNodeList(node.targets, context)} = ${renderNodeList(node.values, context)}`);
