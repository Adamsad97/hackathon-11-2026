import * as DArray from "@duplojs/lang/array";
import { createTransformer, type Transformer } from "@transformer";
import { TsAST } from "@typescript";
import { typeTransformers } from ".";
import type { GoType } from "./checkerType";

const primitiveKinds: readonly TsAST.SyntaxKind[] = [
	TsAST.SyntaxKind.StringKeyword,
	TsAST.SyntaxKind.NumberKeyword,
	TsAST.SyntaxKind.BooleanKeyword,
];

// Une intersection entre une primitive et des types « marqueurs » (`string & Number`, produit
// par `DString.to`) n'existe qu'à la compilation : à l'exécution la valeur reste la primitive.
// Elle prend donc la représentation de cette primitive. Les autres intersections ne sont pas traduites.
export const intersectionTypeTransformer: Transformer<GoType> = createTransformer(
	(node, context) => {
		if (!TsAST.isIntersectionTypeNode(node)) {
			return context.notSupport();
		}

		const primitives = DArray.filter(
			node.types,
			(typeNode) => DArray.includes(primitiveKinds, typeNode.kind),
		);

		const [primitive] = primitives;

		if (!primitive || !DArray.lengthEqual(primitives, 1)) {
			return context.error(node, "intersection-not-supported");
		}

		return context.transform(primitive, typeTransformers.value);
	},
);
