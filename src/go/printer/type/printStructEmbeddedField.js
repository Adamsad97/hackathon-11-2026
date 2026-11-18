import * as DPrinter from "@duplojs/lang/printer";
import { createNodePrinter, escapeQuotedValue } from "..";
export const printStructEmbeddedField = createNodePrinter((node, context) => DPrinter.renderLine([
    context.renderNode(node.typeReference),
    node.tag !== undefined && escapeQuotedValue(node.tag),
]));
