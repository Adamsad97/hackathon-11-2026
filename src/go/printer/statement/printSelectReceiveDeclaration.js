import { createNodePrinter } from "..";
export const printSelectReceiveDeclaration = createNodePrinter((node, context) => `${context.renderNode(node.value)}${node.ok ? `, ${context.renderNode(node.ok)}` : ""} := ${context.renderNode(node.receive)}`);
