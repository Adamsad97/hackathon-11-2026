import * as DPrinter from "@duplojs/lang/printer";
import { createNodePrinter } from "..";
export const printBreakStatement = createNodePrinter((node, context) => DPrinter.renderLine(["break", node.label && context.renderNode(node.label)]));
