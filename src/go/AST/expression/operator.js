import * as DModeling from "@duplojs/lang/modeling";
import * as DCommon from "@duplojs/lang/common";
export const unaryOperators = DCommon.createEnum([
    "+",
    "-",
    "!",
    "^",
]);
export const binaryOperators = DCommon.createEnum([
    "+",
    "-",
    "*",
    "/",
    "%",
    "&",
    "|",
    "^",
    "&^",
    "<<",
    ">>",
    "&&",
    "||",
    "==",
    "!=",
    "<",
    "<=",
    ">",
    ">=",
]);
export function createUnaryExpression(properties) {
    return DModeling.taggedObject("[node][expression]unary", properties);
}
export function createBinaryExpression(properties) {
    return DModeling.taggedObject("[node][expression]binary", properties);
}
export const createAddressExpression = DModeling.createTaggedObjectFactory("[node][expression]address");
export const createDereferenceExpression = DModeling.createTaggedObjectFactory("[node][expression]dereference");
