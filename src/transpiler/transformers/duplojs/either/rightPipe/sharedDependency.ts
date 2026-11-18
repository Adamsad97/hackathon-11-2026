import * as DCommon from "@duplojs/lang/common";
import { GoAST } from "@go";
import { createSharedDependency } from "@transformer";
import { applyFunctionIdentifier } from "../../../shared/apply/sharedDependency";
import { isLeftFunctionIdentifier } from "../left/sharedDependency";
import { eitherRightInterfaceIdentifier } from "../right/sharedDependency";
import { isRightFunctionIdentifier } from "../isRight/sharedDependency";
import { eitherRightValueIdentifier, successFunctionIdentifier } from "../success/sharedDependency";

export const rightPipeFunctionIdentifier = GoAST.createIdentifier("EitherRightPipe");
export const eitherContentFunctionIdentifier = GoAST.createIdentifier("eitherContent");

function call(callee: GoAST.Expression, args: readonly GoAST.Expression[]) {
	return GoAST.createCallExpression({
		callee,
		arguments: args,
	});
}

export const eitherRightPipeDependency = DCommon.memo(() => {
	const input = GoAST.createIdentifier("input");
	const pipes = GoAST.createIdentifier("pipes");
	const acc = GoAST.createIdentifier("acc");
	const pipe = GoAST.createIdentifier("pipe");
	const value = GoAST.createIdentifier("value");

	const contentCall = (argument: GoAST.Expression) => call(eitherContentFunctionIdentifier, [argument]);

	return createSharedDependency({
		imports: [],
		init: [],
		declarations: [
			GoAST.createFunctionDeclaration({
				identifier: eitherContentFunctionIdentifier,
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
						GoAST.createTypeSwitchStatementWithDefault({
							expression: input,
							identifier: value,
							casesBeforeDefault: [
								GoAST.createTypeSwitchCase({
									types: DCommon.cast([eitherRightInterfaceIdentifier]),
									statements: [
										GoAST.createReturnStatement({
											values: [
												call(
													GoAST.createSelectorExpression({
														target: value,
														identifier: eitherRightValueIdentifier,
													}),
													[],
												),
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
				identifier: rightPipeFunctionIdentifier,
				generic: [],
				arguments: [
					GoAST.createFunctionArgument({
						identifier: input,
						type: GoAST.builtinTypeReferences.any,
					}),
				],
				variadicArgument: GoAST.createFunctionArgument({
					identifier: pipes,
					type: GoAST.builtinTypeReferences.any,
				}),
				returnTypes: [GoAST.builtinTypeReferences.any],
				body: GoAST.createBlockStatement({
					statements: [
						GoAST.createIfStatement({
							condition: call(isLeftFunctionIdentifier, [input]),
							body: GoAST.createBlockStatement({
								statements: [
									GoAST.createReturnStatement({
										values: [input],
									}),
								],
							}),
						}),
						GoAST.createShortVariableDeclarationStatement({
							identifier: acc,
							initializer: contentCall(input),
						}),
						GoAST.createRangeStatement({
							binding: GoAST.createRangeDeclaration({
								key: GoAST.createIdentifier("_"),
								value: pipe,
							}),
							expression: pipes,
							body: GoAST.createBlockStatement({
								statements: [
									GoAST.createAssignmentStatement({
										targets: DCommon.cast([acc]),
										values: DCommon.cast([
											call(applyFunctionIdentifier, [pipe, contentCall(acc)]),
										]),
									}),
									GoAST.createIfStatement({
										condition: call(isLeftFunctionIdentifier, [acc]),
										body: GoAST.createBlockStatement({
											statements: [
												GoAST.createReturnStatement({
													values: [acc],
												}),
											],
										}),
									}),
								],
							}),
						}),
						GoAST.createIfStatement({
							condition: call(isRightFunctionIdentifier, [acc]),
							body: GoAST.createBlockStatement({
								statements: [
									GoAST.createReturnStatement({
										values: [acc],
									}),
								],
							}),
						}),
						GoAST.createReturnStatement({
							values: [
								call(
									GoAST.createInstantiationExpression({
										target: successFunctionIdentifier,
										typeArguments: DCommon.cast([GoAST.builtinTypeReferences.any]),
									}),
									[acc],
								),
							],
						}),
					],
				}),
			}),
		],
	});
});
