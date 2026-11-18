import { GoAST } from "@go";
import type { TsAST } from "@typescript";
import { type BuildContext } from "../../../../context/build";
import { eitherFailDependency, failTypeIdentifier } from "./sharedDependency";

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
