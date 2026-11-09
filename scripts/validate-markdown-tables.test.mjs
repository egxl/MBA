import assert from "node:assert/strict"
import { test } from "node:test"
import { escapeWikilinkPipesInLine, validateMarkdownTables } from "./validate-markdown-tables.mjs"

test("escapeWikilinkPipesInLine escapes unescaped pipes inside wikilinks only", () => {
  const input = "| Col 1 | [[concepts/target| Display Alias]] | Col 3 |"
  const expected = "| Col 1 | [[concepts/target\\| Display Alias]] | Col 3 |"
  assert.equal(escapeWikilinkPipesInLine(input), expected)

  const alreadyEscaped = "| Col 1 | [[concepts/target\\| Display Alias]] | Col 3 |"
  assert.equal(escapeWikilinkPipesInLine(alreadyEscaped), alreadyEscaped)
})

test("validateMarkdownTables flags unescaped pipe inside wikilink in table", () => {
  const content = `
| Header 1 | Header 2 |
| :------- | :------- |
| Valid    | [[target | alias]] |
`
  const errors = validateMarkdownTables(content, "test.md")
  assert.ok(errors.length > 0)
  assert.ok(errors.some((e) => e.message.includes("Unescaped pipe inside wikilink")))
})

test("validateMarkdownTables flags delimiter column count mismatch", () => {
  const content = `
| Header 1 | Header 2 | Header 3 |
| :------- | :------- |
| Row 1    | Row 2    | Row 3    |
`
  const errors = validateMarkdownTables(content, "test.md")
  assert.ok(errors.length > 0)
  assert.ok(
    errors.some((e) => e.message.includes("Table delimiter has 2 columns, but header has 3")),
  )
})

test("validateMarkdownTables flags data row column count mismatch", () => {
  const content = `
| Header 1 | Header 2 |
| :------- | :------- |
| Row 1    | Row 2    | Extra Col |
`
  const errors = validateMarkdownTables(content, "test.md")
  assert.ok(errors.length > 0)
  assert.ok(
    errors.some((e) => e.message.includes("Table data row has 3 columns, but header expects 2")),
  )
})

test("validateMarkdownTables passes clean tables with escaped wikilinks", () => {
  const content = `
| Header 1 | Header 2 | Header 3 |
| :------- | :------- | :------- |
| Data 1   | [[target\\|alias]] | Data 3   |
`
  const errors = validateMarkdownTables(content, "test.md")
  assert.equal(errors.length, 0)
})

test("validateMarkdownTables ignores tables inside code blocks", () => {
  const content = `
\`\`\`markdown
| Ignored | In Code |
| :--- |
| Row |
\`\`\`
`
  const errors = validateMarkdownTables(content, "test.md")
  assert.equal(errors.length, 0)
})
