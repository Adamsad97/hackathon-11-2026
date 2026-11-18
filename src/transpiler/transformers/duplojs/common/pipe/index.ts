import { type Transformer } from "@transformer";
import { GoAST } from "@go";
import { TsAST } from "@typescript";
import * as DArray from "@duplojs/lang/array";
import * as DEither from "@duplojs/lang/either";
import { type BuildContext } from "../../../../context/build";
import { evaluateAllToVariables } from "../../../expression/evaluate";

// `pipe(input, f1, f2…)` : l'entrée et les fonctions sont évaluées dans l'ordre des arguments,
// puis chaque fonction reçoit le résultat de la précédente. Chaque résultat intermédiaire est
// stocké, ce qui conserve l'ordre des étapes sans imbriquer les appels.
export async function pipeExpressionHandler(
	node: TsAST.Node,
	context: BuildContext,
): Promise<ReturnType<Transformer<GoAST.Expression>["transformer"]>> {
	if (!TsAST.isCallExpression(node)) {
		return context.error(node, "pipe-reference-without-call-not-supported");
	}

	if (node.arguments.length < 2) {
		return context.error(node, "pipe-expects-input-and-functions");
	}

	const evaluated = await evaluateAllToVariables(node.arguments, context);

	if (DEither.isLeft(evaluated)) {
		return evaluated;
	}

	const { before, identifiers } = DEither.unwrapRight(evaluated);
	const [input, ...functions] = identifiers;
	const lastFunction = functions[functions.length - 1];

	if (!input || !lastFunction) {
		return context.error(node, "pipe-expects-input-and-functions");
	}

	const steps: GoAST.Statement[] = [];
	let current: GoAST.Expression = input;

	// Toutes les étapes sauf la dernière, dont l'appel est le résultat de l'expression.
	for (const theFunction of functions.slice(0, -1)) {
		const step = GoAST.createShortVariableDeclarationStatement({
			identifier: context.generateIdentifier(),
			initializer: GoAST.createCallExpression({
				callee: theFunction,
				arguments: [current],
			}),
		});

		steps.push(step);
		current = step.identifier;
	}

	return context.success({
		before: DArray.concat(before, steps),
		result: GoAST.createCallExpression({
			callee: lastFunction,
			arguments: [current],
		}),
	});
}
