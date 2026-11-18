import * as DCommon from "@duplojs/lang/common";
import { GoAST } from "@go";
import { createSharedDependency } from "@transformer";
import { applyFunctionIdentifier } from "../../../shared/apply/sharedDependency";

export const mapFunctionIdentifier = GoAST.createIdentifier("ArrayMap");

export const arrayMapDependency = DCommon.memo(() => {
	const theFunction = GoAST.createIdentifier("theFunction");
	const array = GoAST.createIdentifier("array");
	const values = GoAST.createIdentifier("values");
	const result = GoAST.createIdentifier("result");
	const element = GoAST.createIdentifier("element");
	const anySlice = GoAST.createSliceType({
		elementType: GoAST.builtinTypeReferences.any,
	});

	return createSharedDependency({
		imports: [],
		init: [],
		declarations: [
			GoAST.createFunctionDeclaration({
				identifier: mapFunctionIdentifier,
				generic: [],
				arguments: [
					GoAST.createFunctionArgument({
						identifier: theFunction,
						type: GoAST.builtinTypeReferences.any,
					}),
				],
				returnTypes: [GoAST.builtinTypeReferences.any],
				body: GoAST.createBlockStatement({
					statements: [
						GoAST.createReturnStatement({
							values: [
								GoAST.createFunctionLiteral({
									arguments: [
										GoAST.createFunctionArgument({
											identifier: array,
											type: GoAST.builtinTypeReferences.any,
										}),
									],
									returnTypes: [GoAST.builtinTypeReferences.any],
									body: GoAST.createBlockStatement({
										statements: [
											GoAST.createTypeSwitchStatementWithDefault({
												expression: array,
												identifier: values,
												casesBeforeDefault: [
													GoAST.createTypeSwitchCase({
														types: DCommon.cast([anySlice]),
														statements: [
															GoAST.createShortVariableDeclarationStatement({
																identifier: result,
																initializer: GoAST.createSliceLiteral({
																	typeReference: anySlice,
																	elements: [],
																}),
															}),
															GoAST.createRangeStatement({
																binding: GoAST.createRangeDeclaration({
																	key: GoAST.createIdentifier("_"),
																	value: element,
																}),
																expression: values,
																body: GoAST.createBlockStatement({
																	statements: [
																		GoAST.createAssignmentStatement({
																			targets: DCommon.cast([result]),
																			values: DCommon.cast([
																				GoAST.createCallExpression({
																					callee: GoAST.createIdentifier("append"),
																					arguments: [
																						result,
																						GoAST.createCallExpression({
																							callee: applyFunctionIdentifier,
																							arguments: [theFunction, element],
																						}),
																					],
																				}),
																			]),
																		}),
																	],
																}),
															}),
															GoAST.createReturnStatement({
																values: [result],
															}),
														],
													}),
												],
												defaultCase: GoAST.createDefaultCase({
													statements: [
														GoAST.createReturnStatement({
															values: [array],
														}),
													],
												}),
												casesAfterDefault: [],
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
