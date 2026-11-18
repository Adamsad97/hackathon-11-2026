import { createNodePrinter, renderBracedNodes } from "..";
export const printBlockStatement = createNodePrinter((node, context) => renderBracedNodes(node.statements, context));
