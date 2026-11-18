import { type Transformer } from "@transformer";
import { GoAST } from "@go";
import { TsAST } from "@typescript";
import { type BuildContext } from "../../../../context/build";
import { callExpressionTransformer } from "../../../shared";
import { stringToDependency, stringToFunctionIdentifier } from "./sharedDependency";

export async function stringToExpressionHandler(
	node: TsAST.Node,
	context: BuildContext,
): Promise<ReturnType<Transformer<GoAST.Expression>["transformer"]>> {
	if (TsAST.isCallExpression(node)) {
		if (node.arguments.length !== 1) {
			return context.error(node, "string-to-arity");
		}

		return context.transform(node, [callExpressionTransformer]);
	}

	const packageName = context.registerSharedDependency(stringToDependency.value);

	return context.success({
		result: GoAST.createSelectorExpression({
			target: packageName,
			identifier: stringToFunctionIdentifier,
		}),
	});
}
