import * as DPrinter from "@duplojs/lang/printer";
import { createNodePrinter } from "..";
export const printVariableDeclarationInitialized = createNodePrinter((node, context) => DPrinter.renderLine([
    "var",
    context.renderNode(node.identifier),
    node.typeReference && context.renderNode(node.typeReference),
    "=",
    context.renderNode(node.initializer),
]));
