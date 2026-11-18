import { createNodePrinter } from "..";
export const printSelectReceiveAssignment = createNodePrinter((node, context) => `${context.renderNode(node.value)}${node.ok ? `, ${context.renderNode(node.ok)}` : ""} = ${context.renderNode(node.receive)}`);
