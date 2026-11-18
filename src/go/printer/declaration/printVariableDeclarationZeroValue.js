import { createNodePrinter } from "..";
export const printVariableDeclarationZeroValue = createNodePrinter((node, context) => `var ${context.renderNode(node.identifier)} ${context.renderNode(node.typeReference)}`);
