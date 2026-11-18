import * as DArray from "@duplojs/lang/array";
import * as DCommon from "@duplojs/lang/common";
import * as DEither from "@duplojs/lang/either";
import { GoAST } from "@go";
import { createTransformer, type Transformer } from "@transformer";
import { TsAST } from "@typescript";
import { typeTransformers } from ".";
import type { GoType } from "./checkerType";

// Un type fonction `(value: A) => B` devient le type fonction Go `func(A) B` : une fonction peut
// ainsi être rangée dans une variable (forme curryfiée d'une fonction DuploJS, par exemple).
// Un paramètre optionnel ou de reste n'a pas d'équivalent direct en Go.
export const functionTypeTransformer: Transformer<GoAST.FunctionType> = createTransformer(
	async(node, context) => {
		if (!TsAST.isFunctionTypeNode(node)) {
			return context.notSupport();
		}

		const translate = async(typeNode: TsAST.TypeNode) => {
			const translated = await DCommon.asyncPipe(
				context.transform(typeNode, typeTransformers.value),
				DEither.unwrapRight,
			);

			if (DEither.isLeft(translated)) {
				return translated;
			}

			return DArray.lengthEqual(translated.before, 0)
				? DEither.success<GoType>(translated.result)
				: context.error(node, "un-support-before-on-function-type");
		};

		const functionArguments: GoAST.FunctionArgument[] = [];

		for (const parameter of node.parameters) {
			if (!parameter.type || parameter.dotDotDotToken || parameter.questionToken) {
				return context.error(parameter, "function-type-parameter-not-supported");
			}

			const parameterType = await translate(parameter.type);

			if (DEither.isLeft(parameterType)) {
				return parameterType;
			}

			functionArguments.push(
				GoAST.createFunctionArgument({
					identifier: GoAST.createIdentifier("_"),
					type: DEither.unwrapRight(parameterType),
				}),
			);
		}

		if (!node.type) {
			return context.error(node, "function-type-without-return-type");
		}

		const returnType = await translate(node.type);

		if (DEither.isLeft(returnType)) {
			return returnType;
		}

		return context.success({
			result: GoAST.createFunctionType({
				arguments: functionArguments,
				returnTypes: [DEither.unwrapRight(returnType)],
			}),
		});
	},
);
