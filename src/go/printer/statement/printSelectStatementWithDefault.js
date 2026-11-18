import { createNodePrinter, renderBracedNodes } from "..";
export const printSelectStatementWithDefault = createNodePrinter((node, context) => `select ${renderBracedNodes([...node.casesBeforeDefault, node.defaultCase, ...node.casesAfterDefault], context)}`);
