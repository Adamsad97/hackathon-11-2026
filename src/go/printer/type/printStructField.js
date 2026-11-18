import * as DPrinter from "@duplojs/lang/printer";
import { createNodePrinter, escapeQuotedValue } from "..";
export const printStructField = createNodePrinter((node, context) => DPrinter.renderLine([
    context.renderNode(node.identifier),
    context.renderNode(node.typeReference),
    node.tag !== undefined && escapeQuotedValue(node.tag),
]));
