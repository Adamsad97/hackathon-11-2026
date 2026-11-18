import * as DModeling from "@duplojs/lang/modeling";
export function createCallExpression(properties) {
    return DModeling.taggedObject("[node][expression][statement]call", properties);
}
