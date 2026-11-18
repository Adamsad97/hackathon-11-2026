import { GoAST } from "@go";
import { eitherFailDependency, failTypeIdentifier } from "./sharedDependency";
export function failTypeHandler(node, context) {
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
