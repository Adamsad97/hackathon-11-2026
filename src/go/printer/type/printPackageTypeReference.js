import { createNodePrinter } from "..";
export const printPackageTypeReference = createNodePrinter((node, context) => `${context.renderNode(node.packageName)}.${context.renderNode(node.identifier)}`);
