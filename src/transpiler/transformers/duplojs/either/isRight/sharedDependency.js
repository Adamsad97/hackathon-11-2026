import * as DCommon from "@duplojs/lang/common";
import { GoAST } from "@go";
import { createSharedDependency } from "@transformer";
import { eitherRightInterfaceIdentifier } from "../right/sharedDependency";
export const isRightFunctionIdentifier = GoAST.createIdentifier("EitherIsRight");
export const eitherIsRightDependency = DCommon.memo(() => {
    const input = GoAST.createIdentifier("input");
    return createSharedDependency({
        imports: [],
        init: [],
        declarations: [
            GoAST.createFunctionDeclaration({
                identifier: isRightFunctionIdentifier,
                generic: [],
                arguments: [
                    GoAST.createFunctionArgument({
                        identifier: input,
                        type: GoAST.builtinTypeReferences.any,
                    }),
                ],
                returnTypes: [GoAST.builtinTypeReferences.bool],
                body: GoAST.createBlockStatement({
                    statements: [
                        GoAST.createTypeSwitchStatementWithDefault({
                            expression: input,
                            casesBeforeDefault: [
                                GoAST.createTypeSwitchCase({
                                    types: DCommon.cast([eitherRightInterfaceIdentifier]),
                                    statements: [
                                        GoAST.createReturnStatement({
                                            values: [GoAST.createBooleanLiteral({ value: true })],
                                        }),
                                    ],
                                }),
                            ],
                            defaultCase: GoAST.createDefaultCase({
                                statements: [
                                    GoAST.createReturnStatement({
                                        values: [GoAST.createBooleanLiteral({ value: false })],
                                    }),
                                ],
                            }),
                            casesAfterDefault: [],
                        }),
                    ],
                }),
            }),
        ],
    });
});
