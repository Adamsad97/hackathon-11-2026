import * as DPrinter from "@duplojs/lang/printer";
export function createPrinterContext(depth, renderNode) {
    return {
        depth,
        indentation: DPrinter.renderLine([""], {
            indent: DPrinter.Indent.tab,
            indentLevel: depth,
        }),
        renderNode,
    };
}
