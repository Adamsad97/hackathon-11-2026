import { createNodePrinter } from "..";
export const printFloatLiteral = createNodePrinter((node) => node.value);
