import assert from "node:assert/strict"
import { test } from "node:test"

import { checkMarkdownContent, normalizeTitle, validateTitles } from "./validate-titles.mjs"

test("normalizeTitle strips outer quotes, smart quotes, and trims whitespace", () => {
  assert.equal(
    normalizeTitle(' "Week 11: Claiming Value (“Slicing the Pie”) & Anchoring Tactics" '),
    'week 11: claiming value ("slicing the pie") & anchoring tactics',
  )
})

test("checkMarkdownContent accepts markdown with no duplicate H1", () => {
  const content = `---
title: "Unique Title"
---

## Section Heading

Some content here.
`
  assert.deepEqual(checkMarkdownContent(content, "test.md"), [])
})

test("checkMarkdownContent flags H1 matching frontmatter title", () => {
  const content = `---
title: "Duplicate Title"
---

# Duplicate Title

## Section Heading
`
  const errors = checkMarkdownContent(content, "test.md")
  assert.equal(errors.length, 1)
  assert.match(errors[0], /duplicates frontmatter title/)
})

test("checkMarkdownContent allows H2/H3 even if wording matches", () => {
  const content = `---
title: "Topic"
---

## Topic

Details.
`
  assert.deepEqual(checkMarkdownContent(content, "test.md"), [])
})

test("validateTitles passes across all checked-in content files", async () => {
  const repoRoot = new URL("../", import.meta.url)
  const report = await validateTitles(repoRoot)
  assert.deepEqual(report.errors, [])
  assert.ok(report.filesChecked > 0)
})
