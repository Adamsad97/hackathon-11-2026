import * as DString from "@duplojs/lang/string";
import { createNodePrinter } from "..";
export const printIntegerLiteral = createNodePrinter((node) => DString.to(node.value));
