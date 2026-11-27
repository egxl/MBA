import { VFile } from "vfile"
import { ValidLocale } from "../i18n"
import { ProcessedContent } from "../plugins/vfile"
import { clone } from "../util/clone"

function cloneProcessedContent([tree, file]: ProcessedContent): ProcessedContent {
  const clonedFile = new VFile({
    value: file.value,
    path: file.path,
    cwd: file.cwd,
  })
  clonedFile.history = [...file.history]
  clonedFile.data = clone(file.data)
  return [clone(tree), clonedFile]
}

/**
 * Merges parsed translated ID content over parsed EN content.
 * Matching `relativePath` entries use the translated ID tree/file;
 * missing entries clone the EN tree/file tagged as `fallback`.
 */
export function mergeLocaleOverlay(
  enContent: ProcessedContent[],
  idContent: ProcessedContent[],
  enLocale: ValidLocale,
  idLocale: ValidLocale,
): ProcessedContent[] {
  const idByRelPath = new Map<string, ProcessedContent>()
  for (const [tree, file] of idContent) {
    const relPath = file.data.relativePath
    if (!relPath) continue
    file.data.translationStatus = "translated"
    file.data.contentLocale = idLocale
    idByRelPath.set(relPath, [tree, file])
  }

  return enContent.map((entry) => {
    const relPath = entry[1].data.relativePath
    const translated = relPath ? idByRelPath.get(relPath) : undefined
    if (translated) {
      return translated
    }
    const [clonedTree, clonedFile] = cloneProcessedContent(entry)
    clonedFile.data.translationStatus = "fallback"
    clonedFile.data.contentLocale = enLocale
    return [clonedTree, clonedFile]
  })
}
