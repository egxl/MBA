import fs from "fs"
import path from "path"
import { fileURLToPath, pathToFileURL } from "node:url"

/**
 * Recursively scans a directory for markdown files.
 */
export function getMarkdownFiles(dir) {
  let results = []
  if (!fs.existsSync(dir)) return results
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...getMarkdownFiles(full))
    } else if (entry.name.endsWith(".md")) {
      results.push(full)
    }
  }
  return results
}

/**
 * Escapes unescaped pipes inside [[...]] within a table row line.
 */
export function escapeWikilinkPipesInLine(line) {
  return line.replace(/\[\[([^\]\n]+?)\]\]/g, (match, inner) => {
    if (/(?<!\\)\|/.test(inner)) {
      const fixedInner = inner.replace(/(?<!\\)\|/g, "\\|")
      return `[[${fixedInner}]]`
    }
    return match
  })
}

/**
 * Validates tables in a markdown file content.
 * Returns array of error objects: { file, line, message, snippet }
 */
export function validateMarkdownTables(content, filePath = "") {
  const errors = []
  const lines = content.split(/\r?\n/)
  let inCode = false
  const tables = []
  let currentTable = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.trim().startsWith("```")) {
      inCode = !inCode
      if (currentTable) {
        tables.push(currentTable)
        currentTable = null
      }
      continue
    }
    if (inCode) continue

    const trimmed = line.trim()
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      if (!currentTable) {
        currentTable = { startLine: i + 1, rows: [] }
      }
      currentTable.rows.push({ lineIndex: i, text: line, trimmed })
    } else {
      if (currentTable) {
        tables.push(currentTable)
        currentTable = null
      }
    }
  }
  if (currentTable) tables.push(currentTable)

  for (const t of tables) {
    if (t.rows.length < 2) continue
    const headerRow = t.rows[0]
    const delimRow = t.rows[1]

    // Check if delimRow is a table delimiter (| :--- | :--- |)
    const delimCells = delimRow.trimmed.slice(1, -1).split(/(?<!\\)\|/)
    const isDelimiter = delimCells.length > 0 && delimCells.every((c) => /^[\s:-]+$/.test(c))
    if (!isDelimiter) continue

    // 1. Check for unescaped pipes in wikilinks on any row
    for (const r of t.rows) {
      const wikilinkMatches = [...r.text.matchAll(/\[\[([^\]\n]+?)\]\]/g)]
      for (const m of wikilinkMatches) {
        if (/(?<!\\)\|/.test(m[1])) {
          errors.push({
            file: filePath,
            line: r.lineIndex + 1,
            snippet: m[0],
            message: `Unescaped pipe inside wikilink '${m[0]}' in table row. Use '\\|' (e.g. '[[target\\|alias]]') to prevent breaking table cell columns.`,
          })
        }
      }
    }

    const headerCells = headerRow.trimmed.slice(1, -1).split(/(?<!\\)\|/)
    const expectedCols = headerCells.length

    // 2. Check delimiter column count
    if (delimCells.length !== expectedCols) {
      errors.push({
        file: filePath,
        line: delimRow.lineIndex + 1,
        snippet: delimRow.trimmed.slice(0, 80),
        message: `Table delimiter has ${delimCells.length} columns, but header has ${expectedCols} columns.`,
      })
    }

    // 3. Check each data row column count
    for (let r = 2; r < t.rows.length; r++) {
      const dataRow = t.rows[r]
      const dataCells = dataRow.trimmed.slice(1, -1).split(/(?<!\\)\|/)
      if (dataCells.length !== expectedCols) {
        errors.push({
          file: filePath,
          line: dataRow.lineIndex + 1,
          snippet: dataRow.trimmed.slice(0, 80) + "...",
          message: `Table data row has ${dataCells.length} columns, but header expects ${expectedCols} columns.`,
        })
      }
    }
  }

  return errors
}

/**
 * Automatically fixes unescaped wikilink pipes in tables and delimiter column counts.
 */
export function fixMarkdownTablesInFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8")
  const lines = content.split(/\r?\n/)
  let inCode = false
  let modified = false

  // Step 1: Escape wikilink pipes in table rows
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.trim().startsWith("```")) {
      inCode = !inCode
      continue
    }
    if (inCode) continue

    const trimmed = line.trim()
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const fixed = escapeWikilinkPipesInLine(line)
      if (fixed !== line) {
        lines[i] = fixed
        modified = true
      }
    }
  }

  // Step 2: Fix delimiter rows where delimiter cols > header cols
  inCode = false
  let currentHeaderCols = 0
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.trim().startsWith("```")) {
      inCode = !inCode
      currentHeaderCols = 0
      continue
    }
    if (inCode) continue

    const trimmed = line.trim()
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const cells = trimmed.slice(1, -1).split(/(?<!\\)\|/)
      const isDelimiter = cells.length > 0 && cells.every((c) => /^[\s:-]+$/.test(c))
      if (!isDelimiter) {
        currentHeaderCols = cells.length
      } else if (currentHeaderCols > 0 && cells.length !== currentHeaderCols) {
        // Rebuild delimiter row with currentHeaderCols matching the first delimiter alignments
        const newDelim = "| " + Array(currentHeaderCols).fill(":---").join(" | ") + " |"
        lines[i] = newDelim
        modified = true
      }
    } else {
      currentHeaderCols = 0
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, lines.join("\n"), "utf8")
  }
  return modified
}

/**
 * Scans and validates all markdown tables across content directory.
 */
export function validateAllMarkdownTables(contentDir = "content") {
  const files = getMarkdownFiles(contentDir)
  const allErrors = []
  let totalChecked = 0

  for (const file of files) {
    totalChecked++
    const content = fs.readFileSync(file, "utf8")
    const errs = validateMarkdownTables(content, file)
    allErrors.push(...errs)
  }

  return { totalChecked, allErrors }
}

// CLI runner
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const shouldFix = process.argv.includes("--fix")
  const files = getMarkdownFiles("content")

  if (shouldFix) {
    let fixedCount = 0
    for (const f of files) {
      if (fixMarkdownTablesInFile(f)) {
        fixedCount++
      }
    }
    console.log(`[TABLE FIX] Automatically repaired table syntax in ${fixedCount} file(s).`)
  }

  const { totalChecked, allErrors } = validateAllMarkdownTables("content")
  if (allErrors.length > 0) {
    console.error(
      `\n❌ Markdown table validation failed with ${allErrors.length} error(s) across ${totalChecked} file(s):\n`,
    )
    for (const err of allErrors) {
      const relPath = path.relative(process.cwd(), err.file).replace(/\\/g, "/")
      console.error(`  - ${relPath}:${err.line} -> ${err.message}`)
      console.error(`    Snippet: ${err.snippet}\n`)
    }
    process.exit(1)
  } else {
    console.log(`✅ Validated markdown tables across ${totalChecked} file(s) with 0 errors.`)
    process.exit(0)
  }
}
