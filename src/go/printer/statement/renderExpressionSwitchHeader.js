import * as DPrinter from "@duplojs/lang/printer";
export function renderExpressionSwitchHeader(initializer, expression, context) {
    return DPrinter.renderLine([
        "switch",
        initializer && `${context.renderNode(initializer)};`,
        expression && context.renderNode(expression),
    ]);
}
