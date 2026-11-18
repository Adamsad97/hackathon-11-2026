import { createNodePrinter, renderBracedNodes } from "..";
import { renderTypeSwitchHeader } from "./renderTypeSwitchHeader";
export const printTypeSwitchStatementWithoutDefault = createNodePrinter((node, context) => `${renderTypeSwitchHeader(node.initializer, node.identifier, node.expression, context)} ${renderBracedNodes(node.cases, context)}`);
