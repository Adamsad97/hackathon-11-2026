import { createNodePrinter } from "..";
import { renderOperand } from "./renderOperand";
export const printIndexExpression = createNodePrinter((node, context) => `${renderOperand(node.target, context, 7)}[${context.renderNode(node.index)}]`);
