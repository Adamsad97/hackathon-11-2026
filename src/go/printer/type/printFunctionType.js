import { createNodePrinter } from "..";
import { renderArguments } from "./renderArguments";
import { renderReturnTypes } from "./renderReturnTypes";
export const printFunctionType = createNodePrinter((node, context) => `func${renderArguments(node.arguments, node.variadicArgument, context)}${renderReturnTypes(node.returnTypes, context)}`);
