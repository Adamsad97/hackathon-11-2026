import { TsAST } from "@typescript";
import { GoAST } from "@go";
import { createTransformer, type Transformer } from "@transformer";
import * as DArray from "@duplojs/lang/array";
import * as DCommon from "@duplojs/lang/common";
import * as DEither from "@duplojs/lang/either";
import { typeTransformers } from ".";

export const unionTypeTransformer: Transformer<GoAST.BuiltinTypeReference<"any">> = createTransformer(
	async(node, context) => {
		if (!TsAST.isUnionTypeNode(node)) {
			return context.notSupport();
		}

		const members = await DCommon.asyncPipe(
			node.types,
			DArray.map(
				(member) => DCommon.asyncPipe(
					context.transform(member, typeTransformers.value),
					DEither.unwrapRight,
				),
			),
			DCommon.promiseAll,
			DArray.reduce(
				DArray.reduceFrom<undefined>(undefined),
				({ element, lastValue, next, exit }) => {
					if (DEither.isLeft(element)) {
						return exit(element);
					}

					if (!DArray.lengthEqual(element.before, 0)) {
						return exit(context.error(node, "un-support-before-on-union-type"));
					}

					return next(lastValue);
				},
			),
		);

		if (DEither.isLeft(members)) {
			return members;
		}

		return context.success({
			result: GoAST.builtinTypeReferences.any,
		});
	},
);
