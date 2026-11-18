import { createNodePrinter, escapeQuotedValue } from "..";
export const printStringLiteral = createNodePrinter((node) => escapeQuotedValue(node.value, "\"", node.mode));
