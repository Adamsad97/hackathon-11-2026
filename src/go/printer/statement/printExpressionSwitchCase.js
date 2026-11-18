import { createNodePrinter, renderNodeList } from "..";
import { renderCaseBody } from "./renderCaseBody";
export const printExpressionSwitchCase = createNodePrinter((node, context) => renderCaseBody(`case ${renderNodeList(node.expressions, context)}`, node.statements, context));
