import test, { describe } from "node:test"
import assert from "node:assert"
import { VFile } from "vfile"
import { Root } from "hast"
import { ProcessedContent } from "../plugins/vfile"
import { FilePath, FullSlug } from "../util/path"
import { mergeLocaleOverlay } from "./localeOverlay"

function makeProcessed(slug: string, relPath: string, title: string): ProcessedContent {
  const tree: Root = {
    type: "root",
    children: [{ type: "text", value: title }],
  }
  const file = new VFile(title)
  file.data = {
    slug: slug as FullSlug,
    relativePath: relPath as FilePath,
    filePath: `content/${relPath}` as FilePath,
    frontmatter: { title, tags: [] },
    text: title,
  }
  return [tree, file]
}

describe("mergeLocaleOverlay", () => {
  test("overrides matching relativePath with translated ID entry and clones fallback EN entries", () => {
    const enIndex = makeProcessed("index", "index.md", "Portal Home")
    const enWeek = makeProcessed(
      "courses/mk1/week-01/index",
      "courses/mk1/week-01/index.md",
      "Week 01",
    )
    enIndex[1].data.translationStatus = "source"
    enIndex[1].data.contentLocale = "en-US"
    enWeek[1].data.translationStatus = "source"
    enWeek[1].data.contentLocale = "en-US"

    const idIndex = makeProcessed("index", "index.md", "Beranda Portal")

    const merged = mergeLocaleOverlay([enIndex, enWeek], [idIndex], "en-US", "id-ID")
    assert.strictEqual(merged.length, 2)

    const [mergedIndexTree, mergedIndexFile] = merged[0]
    assert.strictEqual(mergedIndexFile.data.frontmatter?.title, "Beranda Portal")
    assert.strictEqual(mergedIndexFile.data.translationStatus, "translated")
    assert.strictEqual(mergedIndexFile.data.contentLocale, "id-ID")
    assert.strictEqual((mergedIndexTree.children[0] as any).value, "Beranda Portal")

    const [mergedWeekTree, mergedWeekFile] = merged[1]
    assert.strictEqual(mergedWeekFile.data.frontmatter?.title, "Week 01")
    assert.strictEqual(mergedWeekFile.data.translationStatus, "fallback")
    assert.strictEqual(mergedWeekFile.data.contentLocale, "en-US")
    assert.notStrictEqual(mergedWeekTree, enWeek[0])
    assert.notStrictEqual(mergedWeekFile, enWeek[1])
  })
})
