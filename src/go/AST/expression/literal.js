import * as DModeling from "@duplojs/lang/modeling";
import * as DCommon from "@duplojs/lang/common";
export const createIntegerLiteral = DModeling.createTaggedObjectFactory("[node][expression]literal-integer");
export const createFloatLiteral = DModeling.createTaggedObjectFactory("[node][expression]literal-float");
export const createImaginaryLiteral = DModeling.createTaggedObjectFactory("[node][expression]literal-imaginary");
export const createRuneLiteral = DModeling.createTaggedObjectFactory("[node][expression]literal-rune");
export const stringLiteralModes = DCommon.createEnum([
    "text",
    "bytes",
]);
export const createStringLiteral = DModeling.createTaggedObjectFactory("[node][expression]literal-string");
export const createBooleanLiteral = DModeling.createTaggedObjectFactory("[node][expression]literal-boolean");
export const createNilLiteral = DModeling.createTaggedObjectFactory("[node][expression]literal-nil");
