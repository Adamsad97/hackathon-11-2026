import * as DArray from "@duplojs/lang/array";
import * as DCommon from "@duplojs/lang/common";
import * as DEither from "@duplojs/lang/either";
import type { GoAST } from "@go";
import { TsAST } from "@typescript";
import { NodeBuilderFlags, type Type } from "typescript/async";
import type { BuildContext } from "../../context/build";
import { typeTransformers } from ".";
export type GoType = GoAST.Type | GoAST.TypeReference;

export async function unwrapPromiseType(type: Type, context: BuildContext): Promise<Type> {
	const typeString = await context.transpilation.typeChecker.typeToString(type);
	if (typeString.startsWith("Promise<")) {
		const typeArgs = await context.transpilation.typeChecker.getTypeArguments(type as any);
		if (typeArgs && typeArgs[0]) {
			return typeArgs[0];
		}
	}
	return type;
}

// Traduit un type calculé par le checker (inféré, rétréci ou contextuel) avec les mêmes
// transformers que les annotations, afin que les deux chemins produisent la même représentation Go.
export async function transformCheckerType(
	type: Type,
	location: TsAST.Node,
	context: BuildContext,
) {
	const effectiveType = await unwrapPromiseType(type, context);
	const typeNode = await context.transpilation.typeChecker.typeToTypeNode(
		effectiveType,
		location,
		NodeBuilderFlags.NoTruncation,
	) ?? TsAST.factory.createKeywordTypeNode(TsAST.SyntaxKind.AnyKeyword);

	const result = await DCommon.asyncPipe(
		context.transform(typeNode, typeTransformers.value),
		DEither.unwrapRight,
	);

	if (DEither.isLeft(result)) {
		return result;
	}

	if (!DArray.lengthEqual(result.before, 0)) {
		return context.error(location, "un-support-before-on-type");
	}

	return DEither.success<GoType>(result.result);
}
