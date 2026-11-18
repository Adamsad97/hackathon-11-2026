import * as DPrinter from "@duplojs/lang/printer";
import { createNodePrinter } from "..";
export const printConstantDeclaration = createNodePrinter((node, context) => DPrinter.renderLine([
    "const",
    context.renderNode(node.identifier),
    node.typeReference && context.renderNode(node.typeReference),
    "=",
    context.renderNode(node.initializer),
]));
