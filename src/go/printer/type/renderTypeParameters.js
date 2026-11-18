import { renderNodeList } from "..";
export function renderTypeParameters(parameters, context) {
    // La virgule finale distingue notamment [T *C,] d'une longueur de tableau.
    return parameters.length === 0
        ? ""
        : `[${renderNodeList(parameters, context)},]`;
}
