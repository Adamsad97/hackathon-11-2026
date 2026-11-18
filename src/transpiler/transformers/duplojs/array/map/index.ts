import { type Transformer } from "@transformer";
import { GoAST } from "@go";
import { TsAST } from "@typescript";
import { type BuildContext } from "../../../../context/build";
import { callExpressionTransformer } from "../../../shared";
import { applyDependency } from "../../../shared/apply/sharedDependency";
import { arrayMapDependency, mapFunctionIdentifier } from "./sharedDependency";

export async function mapExpressionHandler(
	node: TsAST.Node,
	context: BuildContext,
): Promise<ReturnType<Transformer<GoAST.Expression>["transformer"]>> {
	if (TsAST.isCallExpression(node)) {
		if (node.arguments.length !== 1) {
			return context.error(node, "map-arity");
		}

		return context.transform(node, [callExpressionTransformer]);
	}

	const packageName = context.registerSharedDependency(arrayMapDependency.value);
	context.registerSharedDependency(applyDependency.value);

	return context.success({
		result: GoAST.createSelectorExpression({
			target: packageName,
			identifier: mapFunctionIdentifier,
		}),
	});
}
