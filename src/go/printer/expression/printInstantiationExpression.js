import { createNodePrinter, renderNodeList } from "..";
export const printInstantiationExpression = createNodePrinter((node, context) => `${context.renderNode(node.target)}[${renderNodeList(node.typeArguments, context)}]`);
