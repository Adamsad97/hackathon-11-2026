import { type Transformer } from "@transformer";
import { GoAST } from "@go";
import { TsAST } from "@typescript";
import * as DArray from "@duplojs/lang/array";
import * as DCommon from "@duplojs/lang/common";
import * as DEither from "@duplojs/lang/either";
import * as DModeling from "@duplojs/lang/modeling";
import { type BuildContext } from "../../../../context/build";
import { expressionTransformers } from "../../../expression";
import { transformCheckerType, typeTransformers } from "../../../type";
import { eitherLeftDependency, leftFunctionIdentifier, leftTypeIdentifier } from "./sharedDependency";

export async function leftExpressionHandler(
	node: TsAST.Node,
	context: BuildContext,
): Promise<ReturnType<Transformer<GoAST.Expression>["transformer"]>> {
	// Comme pour `success`, seule la forme appelée est traduite : la fonction est générique.
	if (!TsAST.isCallExpression(node)) {
		return context.error(node, "left-reference-without-call-not-supported");
	}

	const [informationNode, valueNode] = node.arguments;

	if (!informationNode || !valueNode || !DArray.lengthEqual(node.arguments, 2)) {
		return context.error(node, "left-expects-information-and-value");
	}

	const information = await DCommon.asyncPipe(
		context.transform(informationNode, expressionTransformers.value),
		DEither.unwrapRight,
	);

	if (DEither.isLeft(information)) {
		return information;
	}

	const informationVariable = GoAST.createShortVariableDeclarationStatement({
		identifier: context.generateIdentifier(),
		initializer: information.result,
	});

	const value = await DCommon.asyncPipe(
		context.transform(valueNode, expressionTransformers.value),
		DEither.unwrapRight,
	);

	if (DEither.isLeft(value)) {
		return value;
	}

	const leftType = await transformCheckerType(
		await context.transpilation.typeChecker.getTypeAtLocation(node),
		node,
		context,
	);

	if (DEither.isLeft(leftType)) {
		return leftType;
	}

	const leftTypeReference = DEither.unwrapRight(leftType);

	if (!DModeling.hasTagValue(leftTypeReference, "[node]type-reference-generic")) {
		return context.error(node, "left-type-not-resolved");
	}

	return context.success({
		// L'information est évaluée avant la valeur, comme les arguments JavaScript.
		before: DArray.concat(information.before, [informationVariable], value.before),
		result: GoAST.createCallExpression({
			callee: GoAST.createInstantiationExpression({
				target: GoAST.createSelectorExpression({
					target: context.registerSharedDependency(eitherLeftDependency.value),
					identifier: leftFunctionIdentifier,
				}),
				typeArguments: leftTypeReference.typeArguments,
			}),
			arguments: [informationVariable.identifier, value.result],
		}),
	});
}

// `Left<Information, Value>` : l'information devient une chaîne, seul le type de la valeur paramètre la struct Go.
export async function leftTypeHandler(
	node: TsAST.TypeReferenceNode | TsAST.ImportTypeNode,
	context: BuildContext,
) {
	const valueNode = node.typeArguments?.[1];

	if (!valueNode) {
		return context.error(node, "left-type-without-value-not-supported");
	}

	const value = await DCommon.asyncPipe(
		context.transform(valueNode, typeTransformers.value),
		DEither.unwrapRight,
	);

	if (DEither.isLeft(value)) {
		return value;
	}

	return context.success({
		before: value.before,
		result: GoAST.createGenericTypeReference({
			typeReference: GoAST.createPackageTypeReference({
				packageName: context.registerSharedDependency(eitherLeftDependency.value),
				identifier: leftTypeIdentifier,
			}),
			typeArguments: DCommon.cast([value.result]),
		}),
	});
}
