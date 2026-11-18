import * as DCommon from "@duplojs/lang/common";
import { GoAST } from "@go";
import { createSharedDependency } from "@transformer";
export const printFunctionIdentifier = GoAST.createIdentifier("Print");
export const printDependency = DCommon.memo(() => {
    const input = GoAST.createIdentifier("input");
    return createSharedDependency({
        imports: [
            GoAST.createImportDeclaration({ path: "fmt" }),
        ],
        init: [],
        declarations: [
            GoAST.createFunctionDeclaration({
                identifier: printFunctionIdentifier,
                generic: [],
                arguments: [
                    GoAST.createFunctionArgument({
                        identifier: input,
                        type: GoAST.builtinTypeReferences.any,
                    }),
                ],
                returnTypes: [GoAST.builtinTypeReferences.any],
                body: GoAST.createBlockStatement({
                    statements: [
                        GoAST.createCallExpression({
                            callee: GoAST.createSelectorExpression({
                                target: GoAST.createIdentifier("fmt"),
                                identifier: GoAST.createIdentifier("Println"),
                            }),
                            arguments: [input],
                        }),
                        GoAST.createReturnStatement({
                            values: [input],
                        }),
                    ],
                }),
            }),
        ],
    });
});
