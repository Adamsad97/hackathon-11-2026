import { createNodePrinter } from "..";
import { renderCaseBody } from "./renderCaseBody";
export const printDefaultCase = createNodePrinter((node, context) => renderCaseBody("default", node.statements, context));
