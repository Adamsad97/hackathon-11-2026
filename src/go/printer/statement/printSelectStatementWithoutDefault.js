import { createNodePrinter, renderBracedNodes } from "..";
export const printSelectStatementWithoutDefault = createNodePrinter((node, context) => `select ${renderBracedNodes(node.cases, context)}`);
