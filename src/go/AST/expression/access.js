import * as DModeling from "@duplojs/lang/modeling";
export function createSelectorExpression(properties) {
    return DModeling.taggedObject("[node][expression]selector", properties);
}
export const createMethodExpression = DModeling.createTaggedObjectFactory("[node][expression]method");
export const createIndexExpression = DModeling.createTaggedObjectFactory("[node][expression]index");
export const createSliceExpression = DModeling.createTaggedObjectFactory("[node][expression]slice");
export const createFullSliceExpression = DModeling.createTaggedObjectFactory("[node][expression]slice-full");
export const createTypeAssertionExpression = DModeling.createTaggedObjectFactory("[node][expression]type-assertion");
