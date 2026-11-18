import * as DCommon from "@duplojs/lang/common";
import { duploJSStatementTransformers } from "../duplojs";
import { sharedStatementTransformers } from "../shared";
import { blockStatementTransformer } from "./block";
import { ifStatementTransformer } from "./if";
import { returnStatementTransformer } from "./return";
import { variableStatementTransformer } from "./variable";
export const statementTransformers = DCommon.memo(() => [
    ...duploJSStatementTransformers.value,
    ...sharedStatementTransformers.value,
    blockStatementTransformer,
    returnStatementTransformer,
    variableStatementTransformer,
    ifStatementTransformer,
]);
