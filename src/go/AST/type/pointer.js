import * as DModeling from "@duplojs/lang/modeling";
export function createPointerType(properties) {
    return DModeling.taggedObject("[node][type]pointer", properties);
}
