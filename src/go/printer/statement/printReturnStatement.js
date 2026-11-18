import * as DPrinter from "@duplojs/lang/printer";
import { createNodePrinter, renderNodeList } from "..";
export const printReturnStatement = createNodePrinter((node, context) => DPrinter.renderLine(["return", node.values.length > 0 && renderNodeList(node.values, context)]));
