import { createNodePrinter, renderNodeList } from "..";
export const printInterfaceUnion = createNodePrinter((node, context) => renderNodeList(node.terms, context, " | "));
