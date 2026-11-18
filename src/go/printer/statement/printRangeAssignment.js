import { createNodePrinter } from "..";
export const printRangeAssignment = createNodePrinter((node, context) => `${context.renderNode(node.key)}${node.value ? `, ${context.renderNode(node.value)}` : ""} =`);
