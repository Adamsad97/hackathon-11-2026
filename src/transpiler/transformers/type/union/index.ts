import * as DArray from "@duplojs/lang/array";
import * as DCommon from "@duplojs/lang/common";
import * as DEither from "@duplojs/lang/either";
import * as DString from "@duplojs/lang/string";
import { GoAST, GoPrinter } from "@go";
import { createTransformer, type Transformer } from "@transformer";
import { TsAST } from "@typescript";
import type { Type } from "typescript/async";
import type { BuildContext } from "../../../context/build";
import { typeTransformers } from "..";
import { transformCheckerType, type GoType } from "../checkerType";
import { createUnionTypeIdentifier, createUnionValueIdentifier, getUnionDependency, unionTagIdentifier } from "./sharedDependency";

export interface UnionMember {
	readonly key: string;
	readonly type: GoType;
}

export interface UnionRepresentation {
	// Membres dédoublonnés par représentation Go puis triés : l'ordre des membres
	// TypeScript n'influence pas le type Go, ce qui rend deux écritures d'une même union compatibles.
	readonly members: readonly UnionMember[];
	readonly type: GoType;
	readonly unionReference: GoAST.GenericTypeReference | undefined;
}

interface TranslatedCheckerType {
	readonly sourceType: Type;
	readonly key: string;
	readonly goType: GoType;
}

export interface CheckerUnion extends UnionRepresentation {
	// Types TypeScript traduits par chaque membre, à la même position que `members`.
	readonly sources: readonly (readonly Type[])[];
}

export function createUnionRepresentation(
	types: readonly GoType[],
	context: BuildContext,
): UnionRepresentation {
	const members = DCommon.pipe(
		types,
		DArray.reduce(
			DArray.reduceFrom<readonly UnionMember[]>([]),
			({ element, lastValue, next }) => {
				const key = GoPrinter.renderNode(element);

				return next(
					DArray.some(lastValue, (member) => member.key === key)
						? lastValue
						: DArray.push(lastValue, {
							key,
							type: element,
						}),
				);
			},
		),
		DArray.sort((first, second) => DString.sortCompare(first.key, second.key)),
	);

	const [firstMember] = members;
	const typeArguments = DArray.map(members, (member) => member.type);

	if (!firstMember || DArray.lengthEqual(members, 1) || !DArray.minElements(typeArguments, 1)) {
		return {
			members,
			type: firstMember?.type ?? GoAST.builtinTypeReferences.any,
			unionReference: undefined,
		};
	}

	const unionReference = GoAST.createGenericTypeReference({
		typeReference: GoAST.createPackageTypeReference({
			packageName: context.registerSharedDependency(getUnionDependency(members.length)),
			identifier: createUnionTypeIdentifier(members.length),
		}),
		typeArguments,
	});

	return {
		members,
		type: unionReference,
		unionReference,
	};
}

export const unionTypeTransformer: Transformer<GoType> = createTransformer(
	async(node, context) => {
		if (!TsAST.isUnionTypeNode(node)) {
			return context.notSupport();
		}

		const types = await DCommon.asyncPipe(
			node.types,
			DArray.map(
				(typeNode) => DCommon.asyncPipe(
					context.transform(typeNode, typeTransformers.value),
					DEither.unwrapRight,
				),
			),
			DCommon.promiseAll,
			DArray.reduce(
				DArray.reduceFrom<readonly GoType[]>([]),
				({ element, lastValue, next, exit }) => {
					if (DEither.isLeft(element)) {
						return exit(element);
					}

					if (!DArray.lengthEqual(element.before, 0)) {
						return exit(context.error(node, "un-support-before-on-union-member"));
					}

					return next(DArray.push(lastValue, element.result));
				},
			),
		);

		if (DEither.isLeft(types)) {
			return types;
		}

		return context.success({
			result: createUnionRepresentation(types, context).type,
		});
	},
);

export async function resolveCheckerUnion(
	type: Type,
	location: TsAST.Node,
	context: BuildContext,
) {
	const sourceTypes = type.isUnionType()
		? await type.getTypes() ?? [type]
		: [type];

	const translated = await DCommon.asyncPipe(
		sourceTypes,
		DArray.map(
			async(sourceType) => DEither.rightPipe(
				await transformCheckerType(sourceType, location, context),
				(goType) => DEither.success({
					sourceType,
					key: GoPrinter.renderNode(goType),
					goType,
				}),
			),
		),
		DCommon.promiseAll,
		DArray.reduce(
			DArray.reduceFrom<readonly TranslatedCheckerType[]>([]),
			({ element, lastValue, next, exit }) => {
				if (DEither.isLeft(element)) {
					return exit(element);
				}

				return next(DArray.push(lastValue, DEither.unwrapRight(element)));
			},
		),
	);

	if (DEither.isLeft(translated)) {
		return translated;
	}

	const representation = createUnionRepresentation(
		DArray.map(translated, ({ goType }) => goType),
		context,
	);

	return DEither.success<CheckerUnion>({
		...representation,
		sources: DArray.map(
			representation.members,
			(member) => DCommon.pipe(
				translated,
				DArray.filter(({ key }) => key === member.key),
				DArray.map(({ sourceType }) => sourceType),
			),
		),
	});
}

function haveSameMembers(first: UnionRepresentation, second: UnionRepresentation) {
	return DArray.lengthEqual(first.members, second.members.length)
		&& DArray.every(first.members, (member, { index }) => member.key === second.members[index]?.key);
}

export function createUnionTagTest(
	expression: GoAST.Expression,
	union: UnionRepresentation,
	selectedIndexes: readonly number[],
): GoAST.Expression {
	if (DArray.lengthEqual(selectedIndexes, 0)) {
		return GoAST.createBooleanLiteral({ value: false });
	}

	if (DArray.lengthEqual(selectedIndexes, union.members.length)) {
		return GoAST.createBooleanLiteral({ value: true });
	}

	return DCommon.pipe(
		selectedIndexes,
		DArray.map(
			(index): GoAST.Expression => GoAST.createBinaryExpression({
				operator: "==",
				left: GoAST.createSelectorExpression({
					target: expression,
					identifier: unionTagIdentifier,
				}),
				right: GoAST.createIntegerLiteral({ value: BigInt(index) }),
			}),
		),
		DArray.reduce(
			DArray.reduceFrom<GoAST.Expression | undefined>(undefined),
			({ element, lastValue, next }) => next(
				lastValue
					? GoAST.createBinaryExpression({
						operator: "||",
						left: lastValue,
						right: element,
					})
					: element,
			),
		),
		(test) => test ?? GoAST.createBooleanLiteral({ value: false }),
	);
}

export interface ConvertCheckerTypeParams {
	readonly expression: GoAST.Expression;
	readonly source: Type;
	readonly target: Type;
	readonly location: TsAST.Node;
	readonly context: BuildContext;
}

// Place une valeur dans le membre correspondant de l'union attendue (retour, déclaration typée…).
export async function convertToCheckerType(params: ConvertCheckerTypeParams) {
	const { expression, source, target, location, context } = params;

	if (source.id === target.id) {
		return DEither.success(expression);
	}

	const targetUnion = await resolveCheckerUnion(target, location, context);

	if (DEither.isLeft(targetUnion)) {
		return targetUnion;
	}

	const { unionReference, members } = DEither.unwrapRight(targetUnion);

	if (!unionReference) {
		return DEither.success(expression);
	}

	const sourceUnion = await resolveCheckerUnion(source, location, context);

	if (DEither.isLeft(sourceUnion)) {
		return sourceUnion;
	}

	const sourceRepresentation = DEither.unwrapRight(sourceUnion);

	if (sourceRepresentation.unionReference) {
		return haveSameMembers(sourceRepresentation, DEither.unwrapRight(targetUnion))
			? DEither.success(expression)
			: context.error(location, "union-to-union-conversion-not-supported");
	}

	const index = DArray.findIndex(
		members,
		(member) => member.key === DArray.first(sourceRepresentation.members)?.key,
	);

	if (index === undefined) {
		return context.error(location, "union-member-not-found");
	}

	return DEither.success<GoAST.Expression>(
		GoAST.createStructLiteral({
			typeReference: unionReference,
			elements: [
				GoAST.createKeyedElement({
					key: unionTagIdentifier,
					value: GoAST.createIntegerLiteral({ value: BigInt(index) }),
				}),
				GoAST.createKeyedElement({
					key: createUnionValueIdentifier(index),
					value: expression,
				}),
			],
		}),
	);
}

export interface NarrowCheckerTypeParams {
	readonly expression: GoAST.Expression;
	readonly declared: Type;
	readonly narrowed: Type;
	readonly location: TsAST.Node;
	readonly context: BuildContext;
}

// Après un garde de type, TypeScript rétrécit une variable union : en Go la variable garde
// le type union, on lit donc directement le champ du membre sélectionné.
export async function narrowToCheckerType(params: NarrowCheckerTypeParams) {
	const { expression, declared, narrowed, location, context } = params;

	if (declared.id === narrowed.id || !declared.isUnionType()) {
		return DEither.success(expression);
	}

	const declaredUnion = await resolveCheckerUnion(declared, location, context);

	if (DEither.isLeft(declaredUnion)) {
		return declaredUnion;
	}

	const declaredRepresentation = DEither.unwrapRight(declaredUnion);

	if (!declaredRepresentation.unionReference) {
		return DEither.success(expression);
	}

	const narrowedUnion = await resolveCheckerUnion(narrowed, location, context);

	if (DEither.isLeft(narrowedUnion)) {
		return narrowedUnion;
	}

	const narrowedRepresentation = DEither.unwrapRight(narrowedUnion);

	if (narrowedRepresentation.unionReference) {
		return haveSameMembers(declaredRepresentation, narrowedRepresentation)
			? DEither.success(expression)
			: context.error(location, "union-narrowing-to-sub-union-not-supported");
	}

	const index = DArray.findIndex(
		declaredRepresentation.members,
		(member) => member.key === DArray.first(narrowedRepresentation.members)?.key,
	);

	if (index === undefined) {
		return context.error(location, "union-member-not-found");
	}

	return DEither.success<GoAST.Expression>(
		GoAST.createSelectorExpression({
			target: expression,
			identifier: createUnionValueIdentifier(index),
		}),
	);
}
