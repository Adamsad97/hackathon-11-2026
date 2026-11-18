import { createNodePrinter } from "..";
export const printMapType = createNodePrinter((node, context) => `map[${context.renderNode(node.keyType)}]${context.renderNode(node.valueType)}`);
