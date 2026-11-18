import { createNodePrinter } from "./createNodePrinter";
export const printFunctionArgument = createNodePrinter((node, context) => `${context.renderNode(node.identifier)} ${context.renderNode(node.type)}`);
