import { createNodePrinter } from "..";
import { renderCompositeElements } from "./renderCompositeElements";
export const printSliceLiteral = createNodePrinter((node, context) => `(${context.renderNode(node.typeReference)}${renderCompositeElements(node.elements, context)})`);
