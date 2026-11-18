import { createNodePrinter } from "..";
import { renderOperand } from "./renderOperand";
export const printSliceExpression = createNodePrinter((node, context) => `${renderOperand(node.target, context, 7)}[${node.low ? context.renderNode(node.low) : ""}:${node.high ? context.renderNode(node.high) : ""}]`);
