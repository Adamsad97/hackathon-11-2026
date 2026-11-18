import * as DModeling from "@duplojs/lang/modeling";
import * as DCommon from "@duplojs/lang/common";
export const channelDirections = DCommon.createEnum([
    "bidirectional",
    "send",
    "receive",
]);
export const createChannelType = DModeling.createTaggedObjectFactory("[node][type]channel");
