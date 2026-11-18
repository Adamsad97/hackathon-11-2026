import * as DCommon from "@duplojs/lang/common";
import { duploJSDeclarationTransformers } from "../duplojs";
import { sharedDeclarationTransformers } from "../shared";
import { functionDeclarationTransformer } from "./function";
export const declarationTransformers = DCommon.memo(() => [
    ...duploJSDeclarationTransformers.value,
    ...sharedDeclarationTransformers.value,
    functionDeclarationTransformer,
]);
