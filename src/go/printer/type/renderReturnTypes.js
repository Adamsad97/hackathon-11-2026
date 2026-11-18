import { renderNodeList } from "..";
export function renderReturnTypes(types, context) {
    return types.length === 0 ? "" : ` (${renderNodeList(types, context)})`;
}
