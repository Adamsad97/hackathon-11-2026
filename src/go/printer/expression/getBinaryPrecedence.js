export function getBinaryPrecedence(operator) {
    const precedence = {
        "||": 1,
        "&&": 2,
        "==": 3,
        "!=": 3,
        "<": 3,
        "<=": 3,
        ">": 3,
        ">=": 3,
        "+": 4,
        "-": 4,
        "|": 4,
        "^": 4,
        "*": 5,
        "/": 5,
        "%": 5,
        "<<": 5,
        ">>": 5,
        "&": 5,
        "&^": 5,
    };
    return precedence[operator];
}
