import * as DPrinter from "@duplojs/lang/printer";
import { createNodePrinter } from "./createNodePrinter";
import { escapeQuotedValue } from "./escapeQuotedValue";
export const printImportDeclaration = createNodePrinter((node, context) => {
    const alias = node.alias === "." ? "." : node.alias && context.renderNode(node.alias);
    return DPrinter.renderLine(["import", alias, escapeQuotedValue(node.path)]);
});
