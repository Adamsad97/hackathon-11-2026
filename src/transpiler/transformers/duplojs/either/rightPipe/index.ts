import { type Transformer } from "@transformer";
import { GoAST } from "@go";
import { TsAST } from "@typescript";
import { type BuildContext } from "../../../../context/build";
import { callExpressionTransformer } from "../../../shared";
import { applyDependency } from "../../../shared/apply/sharedDependency";
import { eitherLeftDependency } from "../left/sharedDependency";
import { eitherRightDependency } from "../right/sharedDependency";
import { eitherIsRightDependency } from "../isRight/sharedDependency";
import { eitherSuccessDependency } from "../success/sharedDependency";
import { eitherRightPipeDependency, rightPipeFunctionIdentifier } from "./sharedDependency";

export async function rightPipeExpressionHandler(
	node: TsAST.Node,
	context: BuildContext,
): Promise<ReturnType<Transformer<GoAST.Expression>["transformer"]>> {
	if (TsAST.isCallExpression(node)) {
		if (node.arguments.length < 2) {
			return context.error(node, "right-pipe-arity");
		}

		return context.transform(node, [callExpressionTransformer]);
	}

	const packageName = context.registerSharedDependency(eitherRightPipeDependency.value);
	context.registerSharedDependency(eitherLeftDependency.value);
	context.registerSharedDependency(eitherRightDependency.value);
	context.registerSharedDependency(eitherIsRightDependency.value);
	context.registerSharedDependency(eitherSuccessDependency.value);
	context.registerSharedDependency(applyDependency.value);

	return context.success({
		result: GoAST.createSelectorExpression({
			target: packageName,
			identifier: rightPipeFunctionIdentifier,
		}),
	});
}
