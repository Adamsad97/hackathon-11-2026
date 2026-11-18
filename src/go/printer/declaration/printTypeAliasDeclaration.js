import { createNodePrinter } from "..";
import { renderTypeParameters } from "../type";
export const printTypeAliasDeclaration = createNodePrinter((node, context) => `type ${context.renderNode(node.identifier)}${renderTypeParameters(node.generic ?? [], context)} = ${context.renderNode(node.type)}`);
