import * as DCommon from "@duplojs/lang/common";
import { GoAST } from "@go";
import { createSharedDependency } from "@transformer";
import { eitherRightValueIdentifier } from "../success/sharedDependency";
import { eitherRightInterfaceIdentifier } from "../right/sharedDependency";
export const whenIsRightFunctionIdentifier = GoAST.createIdentifier("EitherWhenIsRight");
export const whenIsRightWithFunctionIdentifier = GoAST.createIdentifier("EitherWhenIsRightWith");
function createAnyFunctionType() {
    return GoAST.createFunctionType({
        arguments: [
            GoAST.createFunctionArgument({
                identifier: GoAST.createIdentifier("value"),
                type: GoAST.builtinTypeReferences.any,
            }),
        ],
        returnTypes: [GoAST.builtinTypeReferences.any],
    });
}
export const eitherWhenIsRightDependency = DCommon.memo(() => {
    const input = GoAST.createIdentifier("input");
    const theFunction = GoAST.createIdentifier("theFunction");
    const value = GoAST.createIdentifier("value");
    const anyFunctionType = createAnyFunctionType();
    return createSharedDependency({
        imports: [],
        init: [],
        declarations: [
            GoAST.createFunctionDeclaration({
                identifier: whenIsRightFunctionIdentifier,
                generic: [],
                arguments: [
                    GoAST.createFunctionArgument({
                        identifier: input,
                        type: GoAST.builtinTypeReferences.any,
                    }),
                    GoAST.createFunctionArgument({
                        identifier: theFunction,
                        type: anyFunctionType,
                    }),
                ],
                returnTypes: [GoAST.builtinTypeReferences.any],
                body: GoAST.createBlockStatement({
                    statements: [
                        GoAST.createTypeSwitchStatementWithDefault({
                            expression: input,
                            identifier: value,
                            casesBeforeDefault: [
                                GoAST.createTypeSwitchCase({
                                    types: DCommon.cast([eitherRightInterfaceIdentifier]),
                                    statements: [
                                        GoAST.createReturnStatement({
                                            values: [
                                                GoAST.createCallExpression({
                                                    callee: theFunction,
                                                    arguments: [
                                                        GoAST.createCallExpression({
                                                            callee: GoAST.createSelectorExpression({
                                                                target: value,
                                                                identifier: eitherRightValueIdentifier,
                                                            }),
                                                            arguments: [],
                                                        }),
                                                    ],
                                                }),
                                            ],
                                        }),
                                    ],
                                }),
                            ],
                            defaultCase: GoAST.createDefaultCase({
                                statements: [
                                    GoAST.createReturnStatement({
                                        values: [input],
                                    }),
                                ],
                            }),
                            casesAfterDefault: [],
                        }),
                    ],
                }),
            }),
            GoAST.createFunctionDeclaration({
                identifier: whenIsRightWithFunctionIdentifier,
                generic: [],
                arguments: [
                    GoAST.createFunctionArgument({
                        identifier: theFunction,
                        type: anyFunctionType,
                    }),
                ],
                returnTypes: [anyFunctionType],
                body: GoAST.createBlockStatement({
                    statements: [
                        GoAST.createReturnStatement({
                            values: [
                                GoAST.createFunctionLiteral({
                                    arguments: [
                                        GoAST.createFunctionArgument({
                                            identifier: input,
                                            type: GoAST.builtinTypeReferences.any,
                                        }),
                                    ],
                                    returnTypes: [GoAST.builtinTypeReferences.any],
                                    body: GoAST.createBlockStatement({
                                        statements: [
                                            GoAST.createReturnStatement({
                                                values: [
                                                    GoAST.createCallExpression({
                                                        callee: whenIsRightFunctionIdentifier,
                                                        arguments: [input, theFunction],
                                                    }),
                                                ],
                                            }),
                                        ],
                                    }),
                                }),
                            ],
                        }),
                    ],
                }),
            }),
        ],
    });
});
