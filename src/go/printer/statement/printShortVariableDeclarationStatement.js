import { createNodePrinter } from "..";
export const printShortVariableDeclarationStatement = createNodePrinter((node, context) => `${context.renderNode(node.identifier)} := ${context.renderNode(node.initializer)}`);
