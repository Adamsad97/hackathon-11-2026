import { createNodePrinter } from "..";
import { renderCaseBody } from "./renderCaseBody";
export const printSelectCase = createNodePrinter((node, context) => renderCaseBody(`case ${context.renderNode(node.communication)}`, node.statements, context));
