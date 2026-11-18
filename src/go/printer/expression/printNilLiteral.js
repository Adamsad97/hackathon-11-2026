import { createNodePrinter } from "..";
export const printNilLiteral = createNodePrinter(() => "nil");
