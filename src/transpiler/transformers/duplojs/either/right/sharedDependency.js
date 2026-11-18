import * as DCommon from "@duplojs/lang/common";
import { GoAST } from "@go";
import { createSharedDependency } from "@transformer";
import { eitherRightValueIdentifier } from "../success/sharedDependency";
export const eitherRightInterfaceIdentifier = GoAST.createIdentifier("eitherRight");
export const eitherRightDependency = DCommon.memo(() => createSharedDependency({
    imports: [],
    init: [],
    declarations: [
        GoAST.createTypeDefinition({
            identifier: eitherRightInterfaceIdentifier,
            type: GoAST.createInterfaceType({
                elements: [
                    GoAST.createInterfaceMethod({
                        identifier: eitherRightValueIdentifier,
                        arguments: [],
                        returnTypes: [GoAST.builtinTypeReferences.any],
                    }),
                ],
            }),
        }),
    ],
}));
