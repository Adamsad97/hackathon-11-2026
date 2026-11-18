import { createNodePrinter, escapeQuotedValue } from "..";
export const printRuneLiteral = createNodePrinter((node) => escapeQuotedValue(node.value, "'"));
