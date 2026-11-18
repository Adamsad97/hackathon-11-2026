import * as DCommon from "@duplojs/lang/common";
import { GoAST } from "@go";
import { createSharedDependency } from "@transformer";

export const stringToFunctionIdentifier = GoAST.createIdentifier("StringTo");

export const stringToDependency = DCommon.memo(() => {
	const value = GoAST.createIdentifier("value");

	return createSharedDependency({
		imports: [
			GoAST.createImportDeclaration({ path: "fmt" }),
		],
		init: [],
		declarations: [
			GoAST.createFunctionDeclaration({
				identifier: stringToFunctionIdentifier,
				generic: [],
				arguments: [
					GoAST.createFunctionArgument({
						identifier: value,
						type: GoAST.builtinTypeReferences.any,
					}),
				],
				returnTypes: [GoAST.builtinTypeReferences.any],
				body: GoAST.createBlockStatement({
					statements: [
						GoAST.createReturnStatement({
							values: [
								GoAST.createCallExpression({
									callee: GoAST.createSelectorExpression({
										target: GoAST.createIdentifier("fmt"),
										identifier: GoAST.createIdentifier("Sprint"),
									}),
									arguments: [value],
								}),
							],
						}),
					],
				}),
			}),
		],
	});
});
