import { createNodePrinter } from "..";
export const printPointerType = createNodePrinter((node, context) => `*${context.renderNode(node.typeReference)}`);
