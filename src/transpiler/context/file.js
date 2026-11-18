import * as DCommon from "@duplojs/lang/common";
import * as DEither from "@duplojs/lang/either";
import * as DPath from "@duplojs/lang/path";
export function createFileContext(sourceFile) {
    const currentFilePath = DCommon.pipe(sourceFile.path, DPath.createAbsolute, DEither.unwrapRight);
    if (DEither.isLeft(currentFilePath)) {
        return DEither.left("invalid-current-file-path", sourceFile.path);
    }
    const context = {
        sourceFile,
        currentFilePath,
        dependencyFiles: new Set(),
        declarations: new Set(),
        imports: new Set(),
    };
    return DEither.success(context);
}
