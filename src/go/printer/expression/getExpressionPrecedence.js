import * as DModeling from "@duplojs/lang/modeling";
import * as DString from "@duplojs/lang/string";
import { getBinaryPrecedence } from "./getBinaryPrecedence";
export function getExpressionPrecedence(node, text) {
    if (DModeling.hasTagValue(node, "[node][expression]binary")) {
        return getBinaryPrecedence(node.operator);
    }
    if (DModeling.hasTagValue(node, [
        "[node][expression]unary",
        "[node][expression]address",
        "[node][expression]dereference",
        "[node][expression][statement]receive",
    ])
        || DString.startsWith(text, "-")
        || DString.startsWith(text, "+")) {
        return 6;
    }
    return 7;
}
