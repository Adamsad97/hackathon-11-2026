import * as DCommon from "@duplojs/lang/common";
import * as DEither from "@duplojs/lang/either";
import * as DString from "@duplojs/lang/string";
import { GoAST } from "@go";
import { TsAST } from "@typescript";
import { transform, sharedDependencyImportDeclaration, sharedDependencyPackageName } from "@transformer";
import { resolveDependencyFile, resolveReferenceModule } from "../resolvedReference";
export function createBuildContext(transpilation, file) {
    const context = {
        transpilation,
        file,
        transform: (data, transformers) => transform(data, transformers, context),
        error: (node, content) => DEither.left("transformation-error", {
            kind: TsAST.SyntaxKind[node.kind],
            parentKind: node.parent ? TsAST.SyntaxKind[node.parent.kind] : undefined,
            text: node.getText(),
            getNode: () => node,
            content,
            filePath: file.currentFilePath,
            projectWorkDirectory: transpilation.projectWorkDirectory,
        }),
        success: (payload) => DEither.right("transformation-success", {
            ...payload,
            before: payload.before ?? [],
        }),
        notSupport: () => DEither.left("transformation-not-supported", undefined),
        registerSharedDependency: (sharedDependency) => {
            transpilation.sharedDependencies.add(sharedDependency);
            file.imports.add(sharedDependencyImportDeclaration);
            return sharedDependencyPackageName;
        },
        resolveDependencyFile: (reference) => resolveDependencyFile(reference, context),
        resolveReferenceModule: (reference, moduleName, entryPattern) => resolveReferenceModule(reference, context, moduleName, entryPattern),
        registerDependencyFile: ({ filePath }) => {
            file.dependencyFiles.add(filePath);
            return context.createSourceIdentifier(filePath);
        },
        generateIdentifier: () => GoAST.createIdentifier(`Generated_${transpilation.increment()}`),
        createSourceIdentifier: (value) => DCommon.pipe(value, DString.replace(/[^a-zA-Z0-9_]/g, ({ matchedValue }) => DCommon.pipe(matchedValue.charCodeAt(0).toString(36), DString.padStart(4, "0"))), DString.prepend("Sourced_"), GoAST.createIdentifier),
    };
    return context;
}
