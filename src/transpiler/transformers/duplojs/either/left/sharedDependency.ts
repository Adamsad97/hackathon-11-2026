import * as DCommon from "@duplojs/lang/common";
import { GoAST } from "@go";
import { createSharedDependency } from "@transformer";
import { eitherInformationIdentifier } from "../success/sharedDependency";

export const leftFunctionIdentifier = GoAST.createIdentifier("EitherLeftOf");
export const leftTypeIdentifier = GoAST.createIdentifier("EitherLeft");
export const isLeftFunctionIdentifier = GoAST.createIdentifier("EitherIsLeft");
export const eitherLeftInterfaceIdentifier = GoAST.createIdentifier("eitherLeft");
export const eitherLeftValueIdentifier = GoAST.createIdentifier("eitherLeftValue");

export const eitherLeftDependency = DCommon.memo(() => {
	const generic = GoAST.createIdentifier("T");
	const nullType = GoAST.createIdentifier("JSNull");
	const undefinedType = GoAST.createIdentifier("JSUndefined");
	const information = GoAST.createIdentifier("information");
	const informationText = GoAST.createIdentifier("informationText");
	const text = GoAST.createIdentifier("text");
	const values = GoAST.createIdentifier("values");
	const value = GoAST.createIdentifier("value");
	const input = GoAST.createIdentifier("input");

	const typeParameter = GoAST.createTypeParameter({
		identifier: generic,
		constraint: GoAST.builtinTypeReferences.any,
	});
	const leftTypeReference = GoAST.createGenericTypeReference({
		typeReference: leftTypeIdentifier,
		typeArguments: DCommon.cast([generic]),
	});
	const leftAnyReference = GoAST.createGenericTypeReference({
		typeReference: leftTypeIdentifier,
		typeArguments: DCommon.cast([GoAST.builtinTypeReferences.any]),
	});
	const nullLiteral = GoAST.createStructLiteral({
		typeReference: nullType,
		elements: [],
	});

	return createSharedDependency({
		imports: [],
		init: [],
		declarations: [
			GoAST.createTypeDefinition({
				identifier: eitherLeftInterfaceIdentifier,
				type: GoAST.createInterfaceType({
					elements: [
						GoAST.createInterfaceMethod({
							identifier: eitherLeftValueIdentifier,
							arguments: [],
							returnTypes: [GoAST.builtinTypeReferences.any],
						}),
					],
				}),
			}),
			GoAST.createTypeDefinition({
				identifier: leftTypeIdentifier,
				generic: [typeParameter],
				type: GoAST.createStructType({
					fields: [
						GoAST.createStructField({
							identifier: GoAST.createIdentifier("Left"),
							typeReference: nullType,
							tag: "json:\"@duplojs/lang/kind/@DuplojsLangEither/left\"",
						}),
						GoAST.createStructField({
							identifier: GoAST.createIdentifier("Information"),
							typeReference: GoAST.builtinTypeReferences.string,
							tag: "json:\"@duplojs/lang/kind/@DuplojsLangEither/information\"",
						}),
						GoAST.createStructField({
							identifier: GoAST.createIdentifier("Value"),
							typeReference: generic,
							tag: "json:\"@duplojs/lang/kind/@DuplojsLangEither/value\"",
						}),
					],
				}),
			}),
			GoAST.createMethodDeclaration({
				identifier: eitherLeftValueIdentifier,
				receiver: [
					GoAST.createIdentifier("value"),
					leftTypeReference,
				],
				generic: [],
				arguments: [],
				returnTypes: [GoAST.builtinTypeReferences.any],
				body: GoAST.createBlockStatement({
					statements: [
						GoAST.createReturnStatement({
							values: [
								GoAST.createSelectorExpression({
									target: GoAST.createIdentifier("value"),
									identifier: GoAST.createIdentifier("Value"),
								}),
							],
						}),
					],
				}),
			}),
			GoAST.createMethodDeclaration({
				identifier: eitherInformationIdentifier,
				receiver: [
					GoAST.createIdentifier("value"),
					leftTypeReference,
				],
				generic: [],
				arguments: [],
				returnTypes: [GoAST.builtinTypeReferences.string],
				body: GoAST.createBlockStatement({
					statements: [
						GoAST.createReturnStatement({
							values: [
								GoAST.createSelectorExpression({
									target: GoAST.createIdentifier("value"),
									identifier: GoAST.createIdentifier("Information"),
								}),
							],
						}),
					],
				}),
			}),
			GoAST.createFunctionDeclaration({
				identifier: leftFunctionIdentifier,
				generic: [],
				arguments: [
					GoAST.createFunctionArgument({
						identifier: information,
						type: GoAST.builtinTypeReferences.any,
					}),
				],
				variadicArgument: GoAST.createFunctionArgument({
					identifier: values,
					type: GoAST.builtinTypeReferences.any,
				}),
				returnTypes: [GoAST.builtinTypeReferences.any],
				body: GoAST.createBlockStatement({
					statements: [
						GoAST.createShortVariableDeclarationStatement({
							identifier: text,
							initializer: GoAST.createStringLiteral({ value: "" }),
						}),
						GoAST.createTypeSwitchStatementWithoutDefault({
							expression: information,
							identifier: informationText,
							cases: [
								GoAST.createTypeSwitchCase({
									types: DCommon.cast([GoAST.builtinTypeReferences.string]),
									statements: [
										GoAST.createAssignmentStatement({
											targets: DCommon.cast([text]),
											values: DCommon.cast([informationText]),
										}),
									],
								}),
							],
						}),
						GoAST.createShortVariableDeclarationStatement({
							identifier: value,
							initializer: GoAST.createConversionExpression({
								typeReference: GoAST.builtinTypeReferences.any,
								operand: GoAST.createStructLiteral({
									typeReference: undefinedType,
									elements: [],
								}),
							}),
						}),
						GoAST.createIfStatement({
							condition: GoAST.createBinaryExpression({
								operator: ">",
								left: GoAST.createCallExpression({
									callee: GoAST.createIdentifier("len"),
									arguments: [values],
								}),
								right: GoAST.createIntegerLiteral({ value: BigInt(0) }),
							}),
							body: GoAST.createBlockStatement({
								statements: [
									GoAST.createAssignmentStatement({
										targets: DCommon.cast([value]),
										values: DCommon.cast([
											GoAST.createIndexExpression({
												target: values,
												index: GoAST.createIntegerLiteral({ value: BigInt(0) }),
											}),
										]),
									}),
								],
							}),
						}),
						GoAST.createReturnStatement({
							values: [
								GoAST.createStructLiteral({
									typeReference: leftAnyReference,
									elements: [
										GoAST.createKeyedElement({
											key: GoAST.createIdentifier("Left"),
											value: nullLiteral,
										}),
										GoAST.createKeyedElement({
											key: GoAST.createIdentifier("Information"),
											value: text,
										}),
										GoAST.createKeyedElement({
											key: GoAST.createIdentifier("Value"),
											value,
										}),
									],
								}),
							],
						}),
					],
				}),
			}),
			GoAST.createFunctionDeclaration({
				identifier: isLeftFunctionIdentifier,
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
									types: DCommon.cast([eitherLeftInterfaceIdentifier]),
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
