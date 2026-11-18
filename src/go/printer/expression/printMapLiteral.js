import { createNodePrinter } from "..";
import { renderCompositeElements } from "./renderCompositeElements";
export const printMapLiteral = createNodePrinter((node, context) => `(${context.renderNode(node.typeReference)}${renderCompositeElements(node.elements, context)})`);
