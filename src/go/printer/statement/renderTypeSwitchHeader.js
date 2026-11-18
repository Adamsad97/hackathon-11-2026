import * as DPrinter from "@duplojs/lang/printer";
import { renderOperand } from "../expression";
export function renderTypeSwitchHeader(initializer, identifier, expression, context) {
    return DPrinter.renderLine([
        "switch",
        initializer && `${context.renderNode(initializer)};`,
        identifier && `${context.renderNode(identifier)} :=`,
        `${renderOperand(expression, context, 7)}.(type)`,
    ]);
}
