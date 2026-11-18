import * as DCommon from "@duplojs/lang/common";
import { duploJSExpressionTransformers } from "../duplojs";
import { identifierTransformer } from "../common";
import { numericLiteralTransformer } from "./numericLiteral";
import { sharedExpressionTransformers } from "../shared";
import { binaryExpressionTransformer } from "./binary";
export const expressionTransformers = DCommon.memo(() => [
    ...duploJSExpressionTransformers.value,
    ...sharedExpressionTransformers.value,
    identifierTransformer,
    numericLiteralTransformer,
    binaryExpressionTransformer,
]);
