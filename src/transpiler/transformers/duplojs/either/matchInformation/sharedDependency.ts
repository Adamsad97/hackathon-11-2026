import * as DCommon from "@duplojs/lang/common";
import { GoAST } from "@go";
import { createSharedDependency } from "@transformer";
import { applyFunctionIdentifier } from "../../../shared/apply/sharedDependency";
import { eitherLeftInterfaceIdentifier, eitherLeftValueIdentifier } from "../left/sharedDependency";
import { eitherRightInterfaceIdentifier } from "../right/sharedDependency";
import { eitherInformationIdentifier, eitherRightValueIdentifier } from "../success/sharedDependency";

export const matchInformationFunctionIdentifier = GoAST.createIdentifier("EitherMatchInformation");
export const eitherDescribedInterfaceIdentifier = GoAST.createIdentifier("eitherDescribed");

export const eitherMatchInformationDependency = DCommon.memo(() => {
	const input = GoAST.createIdentifier("input");
	const matcher = GoAST.createIdentifier("matcher");
	const described = GoAST.createIdentifier("described");
	const value = GoAST.createIdentifier("value");
	const right = GoAST.createIdentifier("right");
	const left = GoAST.createIdentifier("left");

	const describedValue = (binding: GoAST.Identifier, method: GoAST.Identifier) => GoAST.createCallExpression({
		callee: GoAST.createSelectorExpression({
			target: binding,
			identifier: method,
		}),
		arguments: [],
	});

	return createSharedDependency({
		imports: [],
		init: [],
		declarations: [
			GoAST.createTypeDefinition({
				identifier: eitherDescribedInterfaceIdentifier,
				type: GoAST.createInterfaceType({
					elements: [
						GoAST.createInterfaceMethod({
							identifier: eitherInformationIdentifier,
							arguments: [],
							returnTypes: [GoAST.builtinTypeReferences.string],
						}),
					],
				}),
			}),
			GoAST.createFunctionDeclaration({
				identifier: matchInformationFunctionIdentifier,
				generic: [],
				arguments: [
					GoAST.createFunctionArgument({
						identifier: input,
						type: GoAST.builtinTypeReferences.any,
					}),
					GoAST.createFunctionArgument({
						identifier: matcher,
						type: GoAST.createMapType({
							keyType: GoAST.builtinTypeReferences.string,
							valueType: GoAST.builtinTypeReferences.any,
						}),
					}),
				],
				returnTypes: [GoAST.builtinTypeReferences.any],
				body: GoAST.createBlockStatement({
					statements: [
						GoAST.createTypeSwitchStatementWithDefault({
							expression: input,
							identifier: described,
							casesBeforeDefault: [
								GoAST.createTypeSwitchCase({
									types: DCommon.cast([eitherDescribedInterfaceIdentifier]),
									statements: [
										GoAST.createShortVariableDeclarationStatement({
											identifier: value,
											initializer: input,
										}),
										GoAST.createTypeSwitchStatementWithDefault({
											expression: input,
											identifier: right,
											casesBeforeDefault: [
												GoAST.createTypeSwitchCase({
													types: DCommon.cast([eitherRightInterfaceIdentifier]),
													statements: [
														GoAST.createAssignmentStatement({
															targets: DCommon.cast([value]),
															values: DCommon.cast([
																describedValue(right, eitherRightValueIdentifier),
															]),
														}),
													],
												}),
											],
											defaultCase: GoAST.createDefaultCase({
												statements: [
													GoAST.createTypeSwitchStatementWithoutDefault({
														expression: input,
														identifier: left,
														cases: [
															GoAST.createTypeSwitchCase({
																types: DCommon.cast([eitherLeftInterfaceIdentifier]),
																statements: [
																	GoAST.createAssignmentStatement({
																		targets: DCommon.cast([value]),
																		values: DCommon.cast([
																			describedValue(left, eitherLeftValueIdentifier),
																		]),
																	}),
																],
															}),
														],
													}),
												],
											}),
											casesAfterDefault: [],
										}),
										GoAST.createReturnStatement({
											values: [
												GoAST.createCallExpression({
													callee: applyFunctionIdentifier,
													arguments: [
														GoAST.createIndexExpression({
															target: matcher,
															index: describedValue(described, eitherInformationIdentifier),
														}),
														value,
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
		],
	});
});
