import * as DModeling from "@duplojs/lang/modeling";
import * as DCommon from "@duplojs/lang/common";
export const createAssignmentStatement = DModeling.createTaggedObjectFactory("[node][statement]assignment");
export const compoundAssignmentOperators = DCommon.createEnum([
    "+=",
    "-=",
    "*=",
    "/=",
    "%=",
    "&=",
    "|=",
    "^=",
    "&^=",
    "<<=",
    ">>=",
]);
export const createCompoundAssignmentStatement = DModeling.createTaggedObjectFactory("[node][statement]assignment-compound");
export const createShortVariableDeclarationStatement = DModeling.createTaggedObjectFactory("[node][statement]variable-short");
