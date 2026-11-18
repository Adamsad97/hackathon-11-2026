import * as DPrinter from "@duplojs/lang/printer";
import { createNodePrinter } from "..";
export const printIfStatement = createNodePrinter((node, context) => DPrinter.renderLine([
    "if",
    node.initializer && `${context.renderNode(node.initializer)};`,
    context.renderNode(node.condition),
    context.renderNode(node.body),
    node.elseBranch && `else ${context.renderNode(node.elseBranch)}`,
]));
