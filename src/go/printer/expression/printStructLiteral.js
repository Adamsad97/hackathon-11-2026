import { createNodePrinter } from "..";
import { renderCompositeElements } from "./renderCompositeElements";
export const printStructLiteral = createNodePrinter((node, context) => `(${context.renderNode(node.typeReference)}${renderCompositeElements(node.elements, context)})`);
