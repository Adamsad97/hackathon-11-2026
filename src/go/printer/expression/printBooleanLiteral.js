import * as DString from "@duplojs/lang/string";
import { createNodePrinter } from "..";
export const printBooleanLiteral = createNodePrinter((node) => DString.to(node.value));
