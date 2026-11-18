import { createNodePrinter } from "./createNodePrinter";
export const printIdentifier = createNodePrinter((node) => node.value);
