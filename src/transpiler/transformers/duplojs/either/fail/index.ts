import { GoAST } from "@go";
import { TsAST } from "@typescript";
import { type BuildContext } from "../../../../context/build";
import { eitherFailDependency, failTypeIdentifier } from "./sharedDependency";

export function failTypeHandler(
	node: TsAST.TypeReferenceNode | TsAST.ImportTypeNode,
	context: BuildContext,
) {
	if (node.typeArguments) {
		return context.notSupport();
	}

	return context.success({
		result: GoAST.createPackageTypeReference({
			packageName: context.registerSharedDependency(eitherFailDependency.value),
			identifier: failTypeIdentifier,
		}),
	});
}
