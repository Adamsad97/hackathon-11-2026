import { createNodePrinter } from "..";
export const printTypeParameter = createNodePrinter((node, context) => `${context.renderNode(node.identifier)} ${context.renderNode(node.constraint)}`);
