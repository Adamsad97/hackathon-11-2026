import { createNodePrinter } from "..";
export const printTypeConstraint = createNodePrinter((node, context) => `~${context.renderNode(node.typeReference)}`);
