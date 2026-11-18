import * as DCommon from "@duplojs/lang/common";
import { GoAST } from "@go";
import { createSharedDependency } from "@transformer";
import { applyFunctionIdentifier } from "../../../shared/apply/sharedDependency";

export const pipeFunctionIdentifier = GoAST.createIdentifier("Pipe");

export const commonPipeDependency = DCommon.memo(() => {
	const input = GoAST.createIdentifier("input");
	const functions = GoAST.createIdentifier("functions");
	const acc = GoAST.createIdentifier("acc");
	const step = GoAST.createIdentifier("step");

	return createSharedDependency({
		imports: [],
		init: [],
		declarations: [
			GoAST.createFunctionDeclaration({
				identifier: pipeFunctionIdentifier,
				generic: [],
				arguments: [
					GoAST.createFunctionArgument({
						identifier: input,
						type: GoAST.builtinTypeReferences.any,
					}),
				],
				variadicArgument: GoAST.createFunctionArgument({
					identifier: functions,
					type: GoAST.builtinTypeReferences.any,
				}),
				returnTypes: [GoAST.builtinTypeReferences.any],
				body: GoAST.createBlockStatement({
					statements: [
						GoAST.createShortVariableDeclarationStatement({
							identifier: acc,
							initializer: input,
						}),
						GoAST.createRangeStatement({
							binding: GoAST.createRangeDeclaration({
								key: GoAST.createIdentifier("_"),
								value: step,
							}),
							expression: functions,
							body: GoAST.createBlockStatement({
								statements: [
									GoAST.createAssignmentStatement({
										targets: DCommon.cast([acc]),
										values: DCommon.cast([
											GoAST.createCallExpression({
												callee: applyFunctionIdentifier,
												arguments: [step, acc],
											}),
										]),
									}),
								],
							}),
						}),
						GoAST.createReturnStatement({
							values: [acc],
						}),
					],
				}),
			}),
		],
	});
});
