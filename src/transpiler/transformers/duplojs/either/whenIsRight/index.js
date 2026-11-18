import { GoAST } from "@go";
import { TsAST } from "@typescript";
import * as DArray from "@duplojs/lang/array";
import * as DCommon from "@duplojs/lang/common";
import * as DEither from "@duplojs/lang/either";
import { expressionTransformers } from "../../../expression";
import { eitherRightDependency } from "../right/sharedDependency";
import { eitherWhenIsRightDependency, whenIsRightFunctionIdentifier, whenIsRightWithFunctionIdentifier, } from "./sharedDependency";
async function prepareCall(context, callee, argumentNodes) {
    const functionVariable = GoAST.createShortVariableDeclarationStatement({
        identifier: context.generateIdentifier(),
        initializer: callee,
    });
    const preparedArguments = await DCommon.asyncPipe(argumentNodes, DArray.map(async (argumentNode) => {
        if (TsAST.isSpreadElement(argumentNode)) {
            return context.error(argumentNode, "un-support-spread-argument");
        }
        return DCommon.asyncPipe(context.transform(argumentNode, expressionTransformers.value), DEither.unwrapRight);
    }), DCommon.promiseAll, DArray.reduce(DArray.reduceFrom({
        before: [],
        arguments: [],
    }), ({ element, lastValue, next, exit }) => {
        if (DEither.isLeft(element)) {
            return exit(element);
        }
        const argumentVariable = GoAST.createShortVariableDeclarationStatement({
            identifier: context.generateIdentifier(),
            initializer: element.result,
        });
        return next({
            before: DArray.concat(lastValue.before, element.before, [argumentVariable]),
            arguments: DArray.push(lastValue.arguments, argumentVariable.identifier),
        });
    }));
    if (DEither.isLeft(preparedArguments)) {
        return preparedArguments;
    }
    return context.success({
        before: DArray.concat([functionVariable], preparedArguments.before),
        result: GoAST.createCallExpression({
            callee: functionVariable.identifier,
            arguments: preparedArguments.arguments,
        }),
    });
}
export async function whenIsRightExpressionHandler(node, context) {
    const packageName = context.registerSharedDependency(eitherRightDependency.value);
    context.registerSharedDependency(eitherWhenIsRightDependency.value);
    const directFunction = GoAST.createSelectorExpression({
        target: packageName,
        identifier: whenIsRightFunctionIdentifier,
    });
    if (!TsAST.isCallExpression(node)) {
        return context.success({
            result: directFunction,
        });
    }
    if (DArray.lengthEqual(node.arguments, 1)) {
        return prepareCall(context, GoAST.createSelectorExpression({
            target: packageName,
            identifier: whenIsRightWithFunctionIdentifier,
        }), node.arguments);
    }
    if (DArray.lengthEqual(node.arguments, 2)) {
        return prepareCall(context, directFunction, node.arguments);
    }
    return context.error(node, "when-is-right-arity");
}
