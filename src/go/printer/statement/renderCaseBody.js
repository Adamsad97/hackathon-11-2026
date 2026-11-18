import * as DPrinter from "@duplojs/lang/printer";
import { renderNodeLines } from "..";
export function renderCaseBody(header, statements, context) {
    return DPrinter.renderParagraph([
        `${header}:`,
        statements.length > 0 && renderNodeLines(statements, context, context.depth + 1),
    ]);
}
