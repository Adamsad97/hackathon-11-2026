import * as DArray from "@duplojs/lang/array";
import * as DPrinter from "@duplojs/lang/printer";
export function renderNodeLines(nodes, context, depth = context.depth) {
    return DPrinter.renderParagraph(DArray.map(nodes, (node) => context.renderNode(node, 0)), {
        indent: DPrinter.Indent.tab,
        indentLevel: depth,
    });
}
