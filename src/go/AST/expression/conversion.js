import * as DModeling from "@duplojs/lang/modeling";
export function createConversionExpression(properties) {
    return DModeling.taggedObject("[node][expression]conversion", properties);
}
