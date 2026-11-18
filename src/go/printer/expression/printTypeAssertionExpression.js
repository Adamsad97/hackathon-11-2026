import { createNodePrinter } from "..";
import { renderOperand } from "./renderOperand";
export const printTypeAssertionExpression = createNodePrinter((node, context) => `${renderOperand(node.target, context, 7)}.(${context.renderNode(node.typeReference)})`);
