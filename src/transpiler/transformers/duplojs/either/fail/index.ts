import { type Transformer } from "@transformer";
import { GoAST } from "@go";
import type { TsAST } from "@typescript";
import { type BuildContext } from "../../../../context/build";
import { eitherFailDependency, failFunctionIdentifier, failTypeIdentifier } from "./sharedDependency";

// =========================================================================
// [APPROCHE INITIALE NAÏVE V1 - LIMITÉE] :
// Dans la version initiale du projet, `fail` n'était supporté qu'en tant que type
// (`failTypeHandler`). L'appel d'expression `DEither.fail()` était absent ou
// non relié au routeur d'expressions, car l'exercice 01 n'utilisait que le type.
//
// POURQUOI CETTE APPROCHE ÉTAIT DÉFAILLANTE (MAUVAIS TRAVAIL DE L'IA) :
// Dès qu'une fonction comme `add` dans l'exercice 04 possède des chemins de retour
// multiples conditionnels (`if (one === -1) return DEither.fail()`), la fonction
// retourne une union calculée par le TypeChecker (`EitherFail | EitherSuccess<number>`).
// Sans transformer d'expression pour `fail()`, le code plante avec `un-support-node`.
//
// [APPROCHE GÉNÉRALISÉE V2 - VISION ROBUSTE] :
// `DEither.fail()` est promu au rang d'expression de première classe, générant
// un appel vers la factory partagée `EitherFailOf()`. Combiné avec `placeValue`,
// ce résultat s'intègre automatiquement dans n'importe quelle union de retour,
// qu'elle comporte 2, 3 ou N branches, avec ou sans annotation explicite.
// =========================================================================

export function failTypeHandler(
	_node: TsAST.TypeReferenceNode | TsAST.ImportTypeNode,
	context: BuildContext,
) {
	return context.success({
		result: GoAST.createPackageTypeReference({
			packageName: context.registerSharedDependency(eitherFailDependency.value),
			identifier: failTypeIdentifier,
		}),
	});
}

export async function failExpressionHandler(
	_node: TsAST.Node,
	context: BuildContext,
): Promise<ReturnType<Transformer<GoAST.Expression>["transformer"]>> {
	const packageName = context.registerSharedDependency(eitherFailDependency.value);

	return context.success({
		result: GoAST.createCallExpression({
			callee: GoAST.createSelectorExpression({
				target: packageName,
				identifier: failFunctionIdentifier,
			}),
			arguments: [],
		}),
	});
}
