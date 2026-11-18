export function createNodePrinter(printer) {
    return (context) => (node) => printer(node, context);
}
