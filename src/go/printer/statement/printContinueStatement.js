import * as DPrinter from "@duplojs/lang/printer";
import { createNodePrinter } from "..";
export const printContinueStatement = createNodePrinter((node, context) => DPrinter.renderLine(["continue", node.label && context.renderNode(node.label)]));
