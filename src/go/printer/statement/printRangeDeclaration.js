import { createNodePrinter } from "..";
export const printRangeDeclaration = createNodePrinter((node, context) => `${context.renderNode(node.key)}${node.value ? `, ${context.renderNode(node.value)}` : ""} :=`);
