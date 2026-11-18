export function createTranspilationContext(params) {
    let index = 0;
    const context = {
        typeChecker: params.typeChecker,
        projectWorkDirectory: params.projectWorkDirectory,
        sharedDependencies: new Set(),
        increment() {
            index += 1;
            return index;
        },
    };
    return context;
}
