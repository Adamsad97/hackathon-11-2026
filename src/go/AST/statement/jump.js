import * as DModeling from "@duplojs/lang/modeling";
export const createReturnStatement = DModeling.createTaggedObjectFactory("[node][statement]return");
export const createBreakStatement = DModeling.createTaggedObjectFactory("[node][statement]break");
export const createContinueStatement = DModeling.createTaggedObjectFactory("[node][statement]continue");
export const createGotoStatement = DModeling.createTaggedObjectFactory("[node][statement]goto");
export const createFallthroughStatement = DModeling.createTaggedObjectFactory("[node][statement]fallthrough");
export const createLabeledStatement = DModeling.createTaggedObjectFactory("[node][statement]labeled");
