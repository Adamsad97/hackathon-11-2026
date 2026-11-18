import * as DArray from "@duplojs/lang/array";
import * as DPrinter from "@duplojs/lang/printer";
export function renderArguments(functionArguments, variadicArgument, context) {
    const ordinary = DArray.map(functionArguments, (argument) => context.renderNode(argument));
    const variadic = variadicArgument
        ? [`${context.renderNode(variadicArgument.identifier)} ...${context.renderNode(variadicArgument.type)}`]
        : [];
    return `(${DPrinter.renderLine([...ordinary, ...variadic], { joinCharacter: ", " })})`;
}
