import * as DCommon from "@duplojs/lang/common";
import { GoAST } from "@go";
import { createSharedDependency } from "@transformer";

export const coalescingFunctionIdentifier = GoAST.createIdentifier("ArrayCoalescing");

export const arrayCoalescingDependency = DCommon.memo(() => {
	const value = GoAST.createIdentifier("value");
	const reflected = GoAST.createIdentifier("reflected");
	const reflectPackage = GoAST.createIdentifier("reflect");

	const kindCall = (method: string) => GoAST.createCallExpression({
		callee: GoAST.createSelectorExpression({
			target: reflected,
			identifier: GoAST.createIdentifier(method),
		}),
		arguments: [],
	});

	const kindEquals = (kind: string) => GoAST.createBinaryExpression({
		operator: "==",
		left: kindCall("Kind"),
		right: GoAST.createSelectorExpression({
			target: reflectPackage,
			identifier: GoAST.createIdentifier(kind),
		}),
	});

	return createSharedDependency({
		imports: [
			GoAST.createImportDeclaration({ path: "reflect" }),
		],
		init: [],
		declarations: [
			GoAST.createFunctionDeclaration({
				identifier: coalescingFunctionIdentifier,
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
						GoAST.createShortVariableDeclarationStatement({
							identifier: reflected,
							initializer: GoAST.createCallExpression({
								callee: GoAST.createSelectorExpression({
									target: reflectPackage,
									identifier: GoAST.createIdentifier("ValueOf"),
								}),
								arguments: [value],
							}),
						}),
						GoAST.createIfStatement({
							condition: GoAST.createBinaryExpression({
								operator: "&&",
								left: kindCall("IsValid"),
								right: GoAST.createBinaryExpression({
									operator: "||",
									left: kindEquals("Slice"),
									right: kindEquals("Array"),
								}),
							}),
							body: GoAST.createBlockStatement({
								statements: [
									GoAST.createReturnStatement({
										values: [value],
									}),
								],
							}),
						}),
						GoAST.createReturnStatement({
							values: [
								GoAST.createSliceLiteral({
									typeReference: GoAST.createSliceType({
										elementType: GoAST.builtinTypeReferences.any,
									}),
									elements: [value],
								}),
							],
						}),
					],
				}),
			}),
		],
	});
});
