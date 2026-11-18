import * as DCommon from "@duplojs/lang/common";
import { duploJSArrayExpressionTransformer } from "./array";
import { duploJSCommonExpressionTransformer } from "./common";
import { duploJSEitherDeclarationTransformer, duploJSEitherExpressionTransformer, duploJSEitherTypeTransformer } from "./either";
export const duploJSDeclarationTransformers = DCommon.memo(() => [duploJSEitherDeclarationTransformer]);
export const duploJSExpressionTransformers = DCommon.memo(() => [
    duploJSEitherExpressionTransformer,
    duploJSCommonExpressionTransformer,
    duploJSArrayExpressionTransformer,
]);
export const duploJSStatementTransformers = DCommon.memo(() => []);
export const duploJSTypeTransformers = DCommon.memo(() => [duploJSEitherTypeTransformer]);
