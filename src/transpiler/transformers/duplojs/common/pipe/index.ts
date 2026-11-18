import { type Transformer } from "@transformer";
import { GoAST } from "@go";
import { TsAST } from "@typescript";
import { type BuildContext } from "../../../../context/build";
import { callExpressionTransformer } from "../../../shared";
import { applyDependency } from "../../../shared/apply/sharedDependency";
import { commonPipeDependency, pipeFunctionIdentifier } from "./sharedDependency";

export async function pipeExpressionHandler(
	node: TsAST.Node,
	context: BuildContext,
): Promise<ReturnType<Transformer<GoAST.Expression>["transformer"]>> {
	if (TsAST.isCallExpression(node)) {
		if (node.arguments.length < 2) {
			return context.error(node, "pipe-arity");
		}

		return context.transform(node, [callExpressionTransformer]);
	}

	const packageName = context.registerSharedDependency(commonPipeDependency.value);
	context.registerSharedDependency(applyDependency.value);

	return context.success({
		result: GoAST.createSelectorExpression({
			target: packageName,
			identifier: pipeFunctionIdentifier,
		}),
	});
}
