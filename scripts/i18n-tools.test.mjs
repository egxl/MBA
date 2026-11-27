import assert from "node:assert/strict"
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import test from "node:test"
import {
  checkI18nDirectory,
  computeContentHash,
  getI18nStatus,
  scaffoldI18nFile,
} from "./i18n-tools.mjs"

function makeTempRepo() {
  return mkdtempSync(path.join(tmpdir(), "p3md-i18n-test-"))
}

function writeRel(root, relPath, content) {
  const full = path.join(root, relPath)
  mkdirSync(path.dirname(full), { recursive: true })
  writeFileSync(full, content, "utf8")
  return full
}

test("computeContentHash normalizes CRLF to LF and returns 12-char sha256 hex", () => {
  const lf = computeContentHash('---\ntitle: "Home"\n---\nBody\n')
  const crlf = computeContentHash('---\r\ntitle: "Home"\r\n---\r\nBody\r\n')
  assert.equal(lf, crlf)
  assert.match(lf, /^[0-9a-f]{12}$/)
})

test("checkI18nDirectory passes on synchronized overlays and flags stale hashes non-blockingly", () => {
  const root = makeTempRepo()
  try {
    const enIndex = '---\ntitle: "Portal Home"\n---\nHello world.\n'
    const enAbout = '---\ntitle: "About"\n---\nUpdated English body.\n'
    writeRel(root, "content/index.md", enIndex)
    writeRel(root, "content/about.md", enAbout)

    writeRel(
      root,
      "content-id/index.md",
      `---\ntitle: "Beranda Portal"\nsource_hash: "${computeContentHash(enIndex)}"\n---\nHalo dunia.\n`,
    )
    writeRel(
      root,
      "content-id/about.md",
      '---\ntitle: "Tentang"\nsource_hash: "000000000000"\n---\nVersi lama.\n',
    )

    const report = checkI18nDirectory(root)
    assert.deepEqual(report.errors, [])
    assert.equal(report.totalIdFiles, 2)
    assert.deepEqual(report.staleFiles, [
      {
        relPath: "about.md",
        expectedHash: computeContentHash(enAbout),
        actualHash: "000000000000",
      },
    ])
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test("checkI18nDirectory rejects orphan ID files and missing frontmatter titles", () => {
  const root = makeTempRepo()
  try {
    writeRel(root, "content/index.md", '---\ntitle: "Portal"\n---\nBody\n')
    writeRel(root, "content-id/index.md", "---\ndescription: missing title\n---\nIsi\n")
    writeRel(root, "content-id/ghost.md", '---\ntitle: "Hantu"\n---\nOrphan\n')

    const report = checkI18nDirectory(root)
    assert.equal(report.errors.length, 2)
    assert.ok(report.errors.some((e) => e.includes("index.md") && e.includes("title")))
    assert.ok(report.errors.some((e) => e.includes("ghost.md") && e.includes("orphan")))
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test("getI18nStatus summarizes coverage, stale entries, and top-level breakdown", () => {
  const root = makeTempRepo()
  try {
    const enIndex = '---\ntitle: "Home"\n---\nHi\n'
    const enCourse = '---\ntitle: "Course"\n---\nCourse body\n'
    writeRel(root, "content/index.md", enIndex)
    writeRel(root, "content/courses/index.md", enCourse)
    writeRel(root, "content/courses/week-01.md", '---\ntitle: "Week 1"\n---\nUntranslated\n')

    writeRel(
      root,
      "content-id/index.md",
      `---\ntitle: "Beranda"\nsource_hash: "${computeContentHash(enIndex)}"\n---\nHalo\n`,
    )
    writeRel(
      root,
      "content-id/courses/index.md",
      '---\ntitle: "Kursus"\nsource_hash: "stale0000000"\n---\nKursus\n',
    )

    const status = getI18nStatus(root)
    assert.equal(status.totalEnFiles, 3)
    assert.equal(status.translatedCount, 2)
    assert.equal(status.upToDateCount, 1)
    assert.equal(status.staleCount, 1)
    assert.equal(status.untranslatedCount, 1)
    assert.deepEqual(status.bySection["courses"], { total: 2, translated: 1 })
    assert.deepEqual(status.bySection["(root)"], { total: 1, translated: 1 })
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test("scaffoldI18nFile creates content-id template with accurate source_hash", () => {
  const root = makeTempRepo()
  try {
    const enContent = '---\ntitle: "Week 01"\ntags:\n  - MK1\n---\n\nEnglish content.\n'
    writeRel(root, "content/courses/week-01.md", enContent)

    const result = scaffoldI18nFile(root, "courses/week-01.md")
    const expectedHash = computeContentHash(enContent)
    const written = readFileSync(result.targetPath, "utf8")

    assert.equal(result.sourceHash, expectedHash)
    assert.ok(written.includes(`source_hash: "${expectedHash}"`))
    assert.ok(written.includes('title: "Week 01"'))
    assert.throws(() => scaffoldI18nFile(root, "courses/week-01.md"), /already exists/i)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
