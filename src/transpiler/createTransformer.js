import * as DCommon from "@duplojs/lang/common";
import * as DEither from "@duplojs/lang/either";
import * as DModeling from "@duplojs/lang/modeling";
import { TsAST } from "@typescript";
import * as DGenerator from "@duplojs/lang/generator";
export function createTransformer(transformer) {
    return DModeling.taggedObject("Transformer", {
        transformer,
    });
}
export function transform(data, transformers, context) {
    return DCommon.asyncPipe(transformers, DGenerator.asyncReduce(DGenerator.reduceFrom(context.notSupport()), async ({ item, lastValue, next, exit, }) => DCommon.asyncPipe(item.transformer(data, context), DEither.whenHasInformationOtherwise("transformation-not-supported", () => next(lastValue), exit))), DEither.whenHasInformation("transformation-not-supported", () => DEither.left("notfound-transformer", {
        kind: TsAST.SyntaxKind[data.kind],
        parentKind: data.parent ? TsAST.SyntaxKind[data.parent.kind] : undefined,
        text: DCommon.pipe(DEither.safeCallback(() => data.getText()), DEither.whenIsRightOtherwise(DCommon.forward, () => "DisplayError")),
        getNode: () => data,
        filePath: context.file.currentFilePath,
        projectWorkDirectory: context.transpilation.projectWorkDirectory,
    })));
}
