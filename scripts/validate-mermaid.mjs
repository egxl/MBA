import fs from "fs"
import path from "path"

/**
 * Validates a single Mermaid diagram block.
 * Returns an array of error objects: { line, message, snippet }
 */
export function validateMermaidBlock(code, filePath = "", startLine = 1) {
  const errors = []
  const lines = code.split("\n")

  // Check 1: Detect unquoted decision nodes {...} containing special characters (? & : / <= >= > <)
  // In Mermaid, text with special characters in diamond nodes MUST be wrapped in double quotes: {"..."}
  const decisionRegex = /\{([^{}"]*?[?:&/><=][^{}"]*?)\}/g
  let match
  while ((match = decisionRegex.exec(code)) !== null) {
    const matchedText = match[0]
    const matchedOffset = match.index
    // Determine line number
    const precedingText = code.slice(0, matchedOffset)
    const lineIndex = precedingText.split("\n").length - 1
    const lineNumber = startLine + lineIndex
    errors.push({
      file: filePath,
      line: lineNumber,
      snippet: matchedText.replace(/\n/g, " "),
      message: `Decision node has unquoted special characters: ${matchedText.replace(/\n/g, " ")}. Wrap in double quotes, e.g. {"${match[1].trim()}"}.`,
    })
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNumber = startLine + i

    // Check 2: Detect literal \n in labels (Mermaid requires <br/> for linebreaks)
    // Matches \n inside quoted or unquoted labels
    if (/\\[nN]/.test(line)) {
      errors.push({
        file: filePath,
        line: lineNumber,
        snippet: line.trim(),
        message: `Found literal '\\n' in Mermaid diagram. Use '<br/>' for line breaks inside diagram labels.`,
      })
    }
  }

  // Check 3: Check for mismatched double quotes in the block
  let inQuote = false
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const quoteCount = (line.match(/"/g) || []).length
    if (quoteCount % 2 !== 0) {
      // Line has an odd number of quotes
      inQuote = !inQuote
    }
  }
  if (inQuote) {
    errors.push({
      file: filePath,
      line: startLine,
      snippet: code.slice(0, 80) + "...",
      message: `Unmatched double quotes found in Mermaid block.`,
    })
  }

  // Check 4: Detect raw markdown list syntax in labels that cause "Unsupported markdown: list" in Mermaid
  // Matches \d+\.\s+ or [-*]\s+ at the start of a node/subgraph label or after <br/>
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNumber = startLine + i

    const listMatch = line.match(/(?:\[\s*"?|\{\s*"?|\(\s*"?|<br\s*\/?>)\s*(\d+\.|[-*])\s+/)
    if (listMatch) {
      errors.push({
        file: filePath,
        line: lineNumber,
        snippet: line.trim(),
        message: `Diagram label contains unescaped markdown list syntax "${listMatch[1]}". Mermaid's internal markdown parser cannot render lists and throws "Unsupported markdown: list". Use escaped digits (e.g. '1\\.') or explicit prefixes ('Step 1:', 'Stage 1:') and unicode bullets ('•') instead of '-' or '*'.`,
      })
    }
  }

  return errors
}

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
 * Main validator entry point.
 */
export function validateAllMermaid(contentDir = "content") {
  const files = getMarkdownFiles(contentDir)
  const allErrors = []
  let totalBlocks = 0

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8")
    const lines = content.split("\n")

    let inMermaid = false
    let mermaidLines = []
    let startLine = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (line.trim().startsWith("```mermaid")) {
        inMermaid = true
        mermaidLines = []
        startLine = i + 1
      } else if (inMermaid && line.trim().startsWith("```")) {
        inMermaid = false
        totalBlocks++
        const blockCode = mermaidLines.join("\n")
        const blockErrors = validateMermaidBlock(blockCode, file, startLine)
        allErrors.push(...blockErrors)
      } else if (inMermaid) {
        mermaidLines.push(line)
      }
    }
  }

  return { totalBlocks, allErrors }
}

import { pathToFileURL } from "node:url"

// Run CLI if called directly
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { totalBlocks, allErrors } = validateAllMermaid("content")

  if (allErrors.length > 0) {
    console.error(
      `\n❌ Mermaid validation failed with ${allErrors.length} error(s) across ${totalBlocks} diagram(s):\n`,
    )
    for (const err of allErrors) {
      const relPath = path.relative(process.cwd(), err.file).replace(/\\/g, "/")
      console.error(`  - ${relPath}:${err.line} -> ${err.message}`)
      console.error(`    Snippet: ${err.snippet}\n`)
    }
    process.exit(1)
  } else {
    console.log(`✅ Validated ${totalBlocks} Mermaid diagram(s) with 0 errors.`)
    process.exit(0)
  }
}
