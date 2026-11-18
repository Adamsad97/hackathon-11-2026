import * as DArray from "@duplojs/lang/array";
import { GoAST } from "@go";
export function createFile(params) {
    const declarations = DArray.lengthEqual(params.init, 0)
        ? params.declarations
        : DArray.push(params.declarations, GoAST.createFunctionDeclaration({
            identifier: GoAST.createIdentifier("init"),
            generic: [],
            returnTypes: [],
            arguments: [],
            body: GoAST.createBlockStatement({
                statements: params.init,
            }),
        }));
    return GoAST.createGoFile({
        packageName: params.packageName,
        imports: params.imports,
        declarations,
    });
}
