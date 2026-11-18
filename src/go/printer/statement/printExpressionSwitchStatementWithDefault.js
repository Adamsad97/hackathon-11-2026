import { createNodePrinter, renderBracedNodes } from "..";
import { renderExpressionSwitchHeader } from "./renderExpressionSwitchHeader";
export const printExpressionSwitchStatementWithDefault = createNodePrinter((node, context) => `${renderExpressionSwitchHeader(node.initializer, node.expression, context)} ${renderBracedNodes([...node.casesBeforeDefault, node.defaultCase, ...node.casesAfterDefault], context)}`);
