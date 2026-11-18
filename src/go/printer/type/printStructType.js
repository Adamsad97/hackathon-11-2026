import { createNodePrinter, renderBracedNodes } from "..";
export const printStructType = createNodePrinter((node, context) => `struct ${renderBracedNodes(node.fields, context)}`);
