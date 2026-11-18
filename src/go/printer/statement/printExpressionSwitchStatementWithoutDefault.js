import { createNodePrinter, renderBracedNodes } from "..";
import { renderExpressionSwitchHeader } from "./renderExpressionSwitchHeader";
export const printExpressionSwitchStatementWithoutDefault = createNodePrinter((node, context) => `${renderExpressionSwitchHeader(node.initializer, node.expression, context)} ${renderBracedNodes(node.cases, context)}`);
