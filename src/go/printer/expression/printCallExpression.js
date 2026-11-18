import * as DArray from "@duplojs/lang/array";
import * as DPrinter from "@duplojs/lang/printer";
import { createNodePrinter } from "..";
import { renderOperand } from "./renderOperand";
export const printCallExpression = createNodePrinter((node, context) => {
    const argumentsText = DPrinter.renderLine([
        node.typeArgument && context.renderNode(node.typeArgument),
        DArray.map(node.arguments, (argument) => context.renderNode(argument)),
        node.variadicArgument && `${context.renderNode(node.variadicArgument)}...`,
    ], { joinCharacter: ", " });
    return `${renderOperand(node.callee, context, 7)}(${argumentsText})`;
});
