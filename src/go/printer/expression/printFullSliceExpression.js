import { createNodePrinter } from "..";
import { renderOperand } from "./renderOperand";
export const printFullSliceExpression = createNodePrinter((node, context) => `${renderOperand(node.target, context, 7)}[${node.low ? context.renderNode(node.low) : ""}:${context.renderNode(node.high)}:${context.renderNode(node.max)}]`);
