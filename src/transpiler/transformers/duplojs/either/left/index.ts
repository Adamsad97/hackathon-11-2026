import { type Transformer } from "@transformer";
import { GoAST } from "@go";
import { TsAST } from "@typescript";
import * as DArray from "@duplojs/lang/array";
import * as DCommon from "@duplojs/lang/common";
import * as DEither from "@duplojs/lang/either";
import { type BuildContext } from "../../../../context/build";
import { callExpressionTransformer } from "../../../shared";
import { typeTransformers } from "../../../type";
import { eitherLeftDependency, leftFunctionIdentifier, leftTypeIdentifier } from "./sharedDependency";

export async function leftExpressionHandler(
	node: TsAST.Node,
	context: BuildContext,
): Promise<ReturnType<Transformer<GoAST.Expression>["transformer"]>> {
	if (TsAST.isCallExpression(node)) {
		if (node.arguments.length < 1 || node.arguments.length > 2) {
			return context.error(node, "left-arity");
		}

		return context.transform(node, [callExpressionTransformer]);
	}

	const packageName = context.registerSharedDependency(eitherLeftDependency.value);

	return context.success({
		result: GoAST.createSelectorExpression({
			target: packageName,
			identifier: leftFunctionIdentifier,
		}),
	});
}

export async function leftTypeHandler(
	node: TsAST.TypeReferenceNode | TsAST.ImportTypeNode,
	context: BuildContext,
) {
	const valueArgument = node.typeArguments && node.typeArguments.length >= 2
		? node.typeArguments[1]
		: undefined;
	const valueType = await DCommon.justExec(async() => {
		if (!valueArgument) {
			return {
				before: [],
				result: GoAST.builtinTypeReferences.any,
			};
		}

		return DCommon.asyncPipe(
			context.transform(valueArgument, typeTransformers.value),
			DEither.unwrapRight,
		);
	});

	if (DEither.isLeft(valueType)) {
		return valueType;
	}

	if (!DArray.lengthEqual(valueType.before, 0)) {
		return context.error(node, "un-support-before-on-left-type");
	}

	return context.success({
		result: GoAST.createGenericTypeReference({
			typeReference: GoAST.createPackageTypeReference({
				packageName: context.registerSharedDependency(eitherLeftDependency.value),
				identifier: leftTypeIdentifier,
			}),
			typeArguments: DCommon.cast([valueType.result]),
		}),
	});
}
