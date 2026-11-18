import { createNodePrinter, renderNodeList } from "..";
export const printGenericTypeReference = createNodePrinter((node, context) => `${context.renderNode(node.typeReference)}[${renderNodeList(node.typeArguments, context)}]`);
