import { createNodePrinter } from "..";
import { renderSelectorTarget } from "./renderSelectorTarget";
export const printSelectorExpression = createNodePrinter((node, context) => `${renderSelectorTarget(node.target, context)}.${context.renderNode(node.identifier)}`);
