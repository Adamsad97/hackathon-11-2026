import * as DModeling from "@duplojs/lang/modeling";
export function createKeyedElement(properties) {
    return DModeling.taggedObject("[node]literal-element-keyed", properties);
}
