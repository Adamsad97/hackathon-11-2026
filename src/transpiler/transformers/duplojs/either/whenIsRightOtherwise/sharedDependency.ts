import * as DCommon from "@duplojs/lang/common";
import { GoAST } from "@go";
import { createSharedDependency } from "@transformer";
import { applyFunctionIdentifier } from "../../../shared/apply/sharedDependency";
import { eitherRightInterfaceIdentifier } from "../right/sharedDependency";
import { eitherRightValueIdentifier } from "../success/sharedDependency";

export const whenIsRightOtherwiseFunctionIdentifier = GoAST.createIdentifier("EitherWhenIsRightOtherwise");

export const eitherWhenIsRightOtherwiseDependency = DCommon.memo(() => {
	const input = GoAST.createIdentifier("input");
	const theFunction = GoAST.createIdentifier("theFunction");
	const otherwiseFunction = GoAST.createIdentifier("otherwiseFunction");
	const value = GoAST.createIdentifier("value");

	return createSharedDependency({
		imports: [],
		init: [],
		declarations: [
			GoAST.createFunctionDeclaration({
				identifier: whenIsRightOtherwiseFunctionIdentifier,
				generic: [],
				arguments: [
					GoAST.createFunctionArgument({
						identifier: theFunction,
						type: GoAST.builtinTypeReferences.any,
					}),
					GoAST.createFunctionArgument({
						identifier: otherwiseFunction,
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
											identifier: input,
											type: GoAST.builtinTypeReferences.any,
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
																		callee: applyFunctionIdentifier,
																		arguments: [
																			theFunction,
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
															values: [
																GoAST.createCallExpression({
																	callee: applyFunctionIdentifier,
																	arguments: [otherwiseFunction, input],
																}),
															],
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
