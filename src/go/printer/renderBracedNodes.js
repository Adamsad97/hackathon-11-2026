import * as DPrinter from "@duplojs/lang/printer";
import { renderNodeLines } from "./renderNodeLines";
export function renderBracedNodes(nodes, context) {
    return nodes.length === 0
        ? "{}"
        : DPrinter.renderParagraph([
            "{",
            renderNodeLines(nodes, context, context.depth + 1),
            `${context.indentation}}`,
        ]);
}
