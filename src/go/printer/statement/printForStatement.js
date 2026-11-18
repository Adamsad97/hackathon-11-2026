import * as DPrinter from "@duplojs/lang/printer";
import { createNodePrinter } from "..";
export const printForStatement = createNodePrinter((node, context) => {
    const header = node.initializer || node.post
        ? `${node.initializer ? context.renderNode(node.initializer) : ""}; ${node.condition ? context.renderNode(node.condition) : ""}; ${node.post ? context.renderNode(node.post) : ""}`
        : node.condition && context.renderNode(node.condition);
    return DPrinter.renderLine(["for", header, context.renderNode(node.body)]);
});
