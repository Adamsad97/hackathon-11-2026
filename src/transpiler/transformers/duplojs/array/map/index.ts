import { type Transformer } from "@transformer";
import { GoAST } from "@go";
import { TsAST } from "@typescript";
import * as DArray from "@duplojs/lang/array";
import * as DEither from "@duplojs/lang/either";
import * as DModeling from "@duplojs/lang/modeling";
import { type BuildContext } from "../../../../context/build";
import { evaluateAllToVariables } from "../../../expression/evaluate";
import { transformCheckerType } from "../../../type";
import { arrayMapDependency, arrayMapIdentifier, arrayMapWithIdentifier } from "./sharedDependency";

// `DArray.map(array, theFunction)` et sa forme curryfiée `DArray.map(theFunction)`.
// Le callback ne reçoit que l'élément : le second paramètre (`{ index, self }`) n'est pas traduit.
export async function mapExpressionHandler(
	node: TsAST.Node,
	context: BuildContext,
): Promise<ReturnType<Transformer<GoAST.Expression>["transformer"]>> {
	if (!TsAST.isCallExpression(node)) {
		return context.error(node, "map-reference-without-call-not-supported");
	}

	const isCurried = DArray.lengthEqual(node.arguments, 1);

	if (!isCurried && !DArray.lengthEqual(node.arguments, 2)) {
		return context.error(node, "map-expects-one-or-two-arguments");
	}

	const { typeChecker } = context.transpilation;
	const theFunctionNode = node.arguments[node.arguments.length - 1];

	if (theFunctionNode && TsAST.isArrowFunction(theFunctionNode) && theFunctionNode.parameters.length > 1) {
		return context.error(theFunctionNode, "map-callback-params-not-supported");
	}

	const [arrayNode] = node.arguments;

	// Un tuple garde sa longueur dans son type : `map` produirait un tuple, pas une slice.
	if (!isCurried && arrayNode) {
		const arrayGoType = await transformCheckerType(
			await typeChecker.getTypeAtLocation(arrayNode),
			arrayNode,
			context,
		);

		if (DEither.isLeft(arrayGoType)) {
			return arrayGoType;
		}

		if (!DModeling.hasTagValue(DEither.unwrapRight(arrayGoType), "[node][type]slice")) {
			return context.error(arrayNode, "map-only-supports-arrays");
		}
	}

	const evaluated = await evaluateAllToVariables(node.arguments, context);

	if (DEither.isLeft(evaluated)) {
		return evaluated;
	}

	const { before, identifiers } = DEither.unwrapRight(evaluated);

	return context.success({
		before,
		result: GoAST.createCallExpression({
			callee: GoAST.createSelectorExpression({
				target: context.registerSharedDependency(arrayMapDependency.value),
				identifier: isCurried ? arrayMapWithIdentifier : arrayMapIdentifier,
			}),
			arguments: identifiers,
		}),
	});
}
