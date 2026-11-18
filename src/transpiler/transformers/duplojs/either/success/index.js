import { GoAST } from "@go";
import { TsAST } from "@typescript";
import * as DArray from "@duplojs/lang/array";
import * as DCommon from "@duplojs/lang/common";
import * as DEither from "@duplojs/lang/either";
import { callExpressionTransformer } from "../../../shared";
import { typeTransformers } from "../../../type";
import { eitherSuccessDependency, successFunctionIdentifier, successTypeIdentifier } from "./sharedDependency";
export async function successExpressionHandler(node, context) {
    if (TsAST.isCallExpression(node)) {
        return context.transform(node, [callExpressionTransformer]);
    }
    const packageName = context.registerSharedDependency(eitherSuccessDependency.value);
    return context.success({
        result: GoAST.createSelectorExpression({
            target: packageName,
            identifier: successFunctionIdentifier,
        }),
    });
}
export async function successTypeHandler(node, context) {
    const argumentNode = node.typeArguments && DArray.first(node.typeArguments);
    if (!argumentNode) {
        return context.notSupport();
    }
    const argument = await DCommon.asyncPipe(context.transform(argumentNode, typeTransformers.value), DEither.unwrapRight);
    if (DEither.isLeft(argument)) {
        return argument;
    }
    return context.success({
        before: argument.before,
        result: GoAST.createGenericTypeReference({
            typeReference: GoAST.createPackageTypeReference({
                packageName: context.registerSharedDependency(eitherSuccessDependency.value),
                identifier: successTypeIdentifier,
            }),
            typeArguments: DCommon.cast([argument.result]),
        }),
    });
}
