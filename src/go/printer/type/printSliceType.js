import { createNodePrinter } from "..";
export const printSliceType = createNodePrinter((node, context) => `[]${context.renderNode(node.elementType)}`);
