import * as DArray from "@duplojs/lang/array";
import * as DPrinter from "@duplojs/lang/printer";
export function renderCompositeElements(elements, context) {
    return elements.length === 0
        ? "{}"
        : DPrinter.renderParagraph([
            "{",
            DPrinter.renderParagraph(DArray.map(elements, (element) => `${context.renderNode(element, 0)},`), {
                indent: DPrinter.Indent.tab,
                indentLevel: context.depth + 1,
            }),
            `${context.indentation}}`,
        ]);
}
