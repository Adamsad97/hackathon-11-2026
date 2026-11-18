import { createNodePrinter, renderNodeList } from "..";
import { renderCaseBody } from "./renderCaseBody";
export const printTypeSwitchCase = createNodePrinter((node, context) => renderCaseBody(`case ${renderNodeList(node.types, context)}`, node.statements, context));
