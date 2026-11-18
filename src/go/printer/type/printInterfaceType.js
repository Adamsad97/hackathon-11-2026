import { createNodePrinter, renderBracedNodes } from "..";
export const printInterfaceType = createNodePrinter((node, context) => `interface ${renderBracedNodes(node.elements, context)}`);
