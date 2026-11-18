import * as DArray from "@duplojs/lang/array";
import * as DPrinter from "@duplojs/lang/printer";
export function renderNodeList(nodes, context, separator = ", ") {
    return DPrinter.renderLine(DArray.map(nodes, (node) => context.renderNode(node)), { joinCharacter: separator });
}
