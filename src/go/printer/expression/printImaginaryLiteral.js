import { createNodePrinter } from "..";
export const printImaginaryLiteral = createNodePrinter((node) => `${node.value}i`);
