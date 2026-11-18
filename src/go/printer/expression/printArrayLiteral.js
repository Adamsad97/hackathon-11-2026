import { createNodePrinter } from "..";
import { renderCompositeElements } from "./renderCompositeElements";
export const printArrayLiteral = createNodePrinter((node, context) => `(${context.renderNode(node.typeReference)}${renderCompositeElements(node.elements, context)})`);
