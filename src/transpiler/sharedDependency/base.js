import * as DModeling from "@duplojs/lang/modeling";
import { GoAST } from "@go";
import { goModulePath } from "../sourcePackage";
export const createSharedDependency = DModeling.createTaggedObjectFactory("SharedDependency");
export const sharedDependencyPackageName = GoAST.createIdentifier("shard_dependencies");
export const sharedDependencyImportDeclaration = GoAST.createImportDeclaration({
    path: `${goModulePath}/${sharedDependencyPackageName.value}`,
});
