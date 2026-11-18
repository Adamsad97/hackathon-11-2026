import * as DCommon from "@duplojs/lang/common";
import { GoAST } from "@go";
import { createSharedDependency } from "@transformer";

export const applyFunctionIdentifier = GoAST.createIdentifier("Apply");

function selector(target: GoAST.Expression, name: string) {
	return GoAST.createSelectorExpression({
		target,
		identifier: GoAST.createIdentifier(name),
	});
}

function call(
	callee: GoAST.Expression,
	args: readonly GoAST.Expression[] = [],
) {
	return GoAST.createCallExpression({
		callee,
		arguments: args,
	});
}

function method(
	target: GoAST.Expression,
	name: string,
	args: readonly GoAST.Expression[] = [],
) {
	return call(selector(target, name), args);
}

function assign(target: GoAST.AssignmentTarget, value: GoAST.Expression) {
	return GoAST.createAssignmentStatement({
		targets: DCommon.cast([target]),
		values: DCommon.cast([value]),
	});
}

export const applyDependency = DCommon.memo(() => {
	const reflectPackage = GoAST.createIdentifier("reflect");
	const functionIdentifier = GoAST.createIdentifier("function");
	const argumentsIdentifier = GoAST.createIdentifier("arguments");
	const value = GoAST.createIdentifier("value");
	const functionType = GoAST.createIdentifier("functionType");
	const count = GoAST.createIdentifier("count");
	const inValues = GoAST.createIdentifier("in");
	const index = GoAST.createIdentifier("index");
	const parameterType = GoAST.createIdentifier("parameterType");
	const argumentValue = GoAST.createIdentifier("argumentValue");
	const results = GoAST.createIdentifier("results");
	const reflectValue = GoAST.createPackageTypeReference({
		packageName: reflectPackage,
		identifier: GoAST.createIdentifier("Value"),
	});

	const argumentAtIndex = GoAST.createIndexExpression({
		target: argumentsIdentifier,
		index,
	});
	const inAtIndex = GoAST.createIndexExpression({
		target: inValues,
		index,
	});
	const zeroParameter = assign(
		inAtIndex,
		call(selector(reflectPackage, "Zero"), [parameterType]),
	);

	return createSharedDependency({
		imports: [
			GoAST.createImportDeclaration({ path: "reflect" }),
		],
		init: [],
		declarations: [
			GoAST.createFunctionDeclaration({
				identifier: applyFunctionIdentifier,
				generic: [],
				arguments: [
					GoAST.createFunctionArgument({
						identifier: functionIdentifier,
						type: GoAST.builtinTypeReferences.any,
					}),
				],
				variadicArgument: GoAST.createFunctionArgument({
					identifier: argumentsIdentifier,
					type: GoAST.builtinTypeReferences.any,
				}),
				returnTypes: [GoAST.builtinTypeReferences.any],
				body: GoAST.createBlockStatement({
					statements: [
						GoAST.createShortVariableDeclarationStatement({
							identifier: value,
							initializer: call(selector(reflectPackage, "ValueOf"), [functionIdentifier]),
						}),
						GoAST.createShortVariableDeclarationStatement({
							identifier: functionType,
							initializer: method(value, "Type"),
						}),
						GoAST.createShortVariableDeclarationStatement({
							identifier: count,
							initializer: method(functionType, "NumIn"),
						}),
						GoAST.createShortVariableDeclarationStatement({
							identifier: inValues,
							initializer: GoAST.createCallExpression({
								callee: GoAST.createIdentifier("make"),
								typeArgument: GoAST.createSliceType({
									elementType: reflectValue,
								}),
								arguments: [count],
							}),
						}),
						GoAST.createForStatement({
							initializer: GoAST.createShortVariableDeclarationStatement({
								identifier: index,
								initializer: GoAST.createIntegerLiteral({ value: BigInt(0) }),
							}),
							condition: GoAST.createBinaryExpression({
								operator: "<",
								left: index,
								right: count,
							}),
							post: assign(
								index,
								GoAST.createBinaryExpression({
									operator: "+",
									left: index,
									right: GoAST.createIntegerLiteral({ value: BigInt(1) }),
								}),
							),
							body: GoAST.createBlockStatement({
								statements: [
									GoAST.createShortVariableDeclarationStatement({
										identifier: parameterType,
										initializer: method(functionType, "In", [index]),
									}),
									GoAST.createIfStatement({
										condition: GoAST.createBinaryExpression({
											operator: "||",
											left: GoAST.createBinaryExpression({
												operator: ">=",
												left: index,
												right: call(GoAST.createIdentifier("len"), [argumentsIdentifier]),
											}),
											right: GoAST.createBinaryExpression({
												operator: "==",
												left: argumentAtIndex,
												right: GoAST.createNilLiteral({}),
											}),
										}),
										body: GoAST.createBlockStatement({
											statements: [zeroParameter],
										}),
										elseBranch: GoAST.createBlockStatement({
											statements: [
												GoAST.createShortVariableDeclarationStatement({
													identifier: argumentValue,
													initializer: call(
														selector(reflectPackage, "ValueOf"),
														[argumentAtIndex],
													),
												}),
												GoAST.createIfStatement({
													condition: method(
														method(argumentValue, "Type"),
														"AssignableTo",
														[parameterType],
													),
													body: GoAST.createBlockStatement({
														statements: [assign(inAtIndex, argumentValue)],
													}),
													elseBranch: GoAST.createIfStatement({
														condition: method(
															method(argumentValue, "Type"),
															"ConvertibleTo",
															[parameterType],
														),
														body: GoAST.createBlockStatement({
															statements: [
																assign(
																	inAtIndex,
																	method(argumentValue, "Convert", [parameterType]),
																),
															],
														}),
														elseBranch: GoAST.createBlockStatement({
															statements: [zeroParameter],
														}),
													}),
												}),
											],
										}),
									}),
								],
							}),
						}),
						GoAST.createShortVariableDeclarationStatement({
							identifier: results,
							initializer: method(value, "Call", [inValues]),
						}),
						GoAST.createIfStatement({
							condition: GoAST.createBinaryExpression({
								operator: "==",
								left: call(GoAST.createIdentifier("len"), [results]),
								right: GoAST.createIntegerLiteral({ value: BigInt(0) }),
							}),
							body: GoAST.createBlockStatement({
								statements: [
									GoAST.createReturnStatement({
										values: [GoAST.createNilLiteral({})],
									}),
								],
							}),
						}),
						GoAST.createReturnStatement({
							values: [
								method(
									GoAST.createIndexExpression({
										target: results,
										index: GoAST.createIntegerLiteral({ value: BigInt(0) }),
									}),
									"Interface",
								),
							],
						}),
					],
				}),
			}),
		],
	});
});
