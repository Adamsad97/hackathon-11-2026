import * as DModeling from "@duplojs/lang/modeling";
export function createIdentifier(value) {
    return DModeling.taggedObject("[node]identifier", {
        value,
    });
}
