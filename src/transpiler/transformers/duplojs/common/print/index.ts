import { type Transformer } from "@transformer";
import { GoAST } from "@go";
import { TsAST } from "@typescript";
import * as DArray from "@duplojs/lang/array";
import * as DCommon from "@duplojs/lang/common";
import * as DEither from "@duplojs/lang/either";
import { TypeFlags } from "typescript/async";
import { type BuildContext } from "../../../../context/build";
import { expressionTransformers } from "../../../expression";
import { transformCheckerType } from "../../../type";
import { createInspector } from "./inspector";
import { inspectDependency, inspectRawStringIdentifier, printFunctionIdentifier } from "./sharedDependency";

export async function printExpressionHandler(
	node: TsAST.Node,
	context: BuildContext,
): Promise<ReturnType<Transformer<GoAST.Expression>["transformer"]>> {
	if (!TsAST.isCallExpression(node)) {
		return context.error(node, "print-reference-without-call-not-supported");
	}

	const [inputNode] = node.arguments;

	// Les paramètres `warn`, `error`, `columns` et `depth` changent le flux ou le format de sortie.
	if (!inputNode || !DArray.lengthEqual(node.arguments, 1)) {
		return context.error(node, "print-params-not-supported");
	}

	const input = await DCommon.asyncPipe(
		context.transform(inputNode, expressionTransformers.value),
		DEither.unwrapRight,
	);

	if (DEither.isLeft(input)) {
		return input;
	}

	const inputType = await context.transpilation.typeChecker.getTypeAtLocation(inputNode);

	const inputGoType = await transformCheckerType(inputType, inputNode, context);

	if (DEither.isLeft(inputGoType)) {
		return inputGoType;
	}

	const packageName = context.registerSharedDependency(inspectDependency.value);

	// `console.info` écrit une chaîne de premier niveau telle quelle, sans guillemets.
	const inspector = inputType.flags & TypeFlags.StringLike
		? DEither.success<GoAST.Expression>(
			GoAST.createSelectorExpression({
				target: packageName,
				identifier: inspectRawStringIdentifier,
			}),
		)
		: createInspector(DEither.unwrapRight(inputGoType), inputNode, context);

	if (DEither.isLeft(inspector)) {
		return inspector;
	}

	return context.success({
		before: input.before,
		result: GoAST.createCallExpression({
			callee: GoAST.createSelectorExpression({
				target: packageName,
				identifier: printFunctionIdentifier,
			}),
			arguments: [input.result, DEither.unwrapRight(inspector)],
		}),
	});
}
