import fs from "fs"
import path from "path"

export const KNOWN_MERMAID_TYPES = new Set([
  // Process & Sequence
  "flowchart",
  "graph",
  "flowchart-elk",
  "sequenceDiagram",
  "stateDiagram",
  "stateDiagram-v2",
  "swimlane-beta",
  "agentflow-beta",
  "eventmodeling",
  // Quantitative & Charts
  "sankey-beta",
  "sankey",
  "xychart-beta",
  "xychart",
  "pie",
  "quadrantChart",
  "radar-beta",
  // Planning, Chronology & UX
  "timeline",
  "gantt",
  "journey",
  "kanban",
  // Hierarchy, Set & Conceptual
  "mindmap",
  "treemap",
  "treeView-beta",
  "venn-beta",
  "cynefin-beta",
  "block-beta",
  "block",
  // Data, Systems & Engineering
  "erDiagram",
  "classDiagram",
  "classDiagram-v2",
  "C4Context",
  "C4Container",
  "C4Component",
  "C4Dynamic",
  "C4Deployment",
  "architecture-beta",
  "architecture",
  "requirementDiagram",
  "requirement",
  "packet-beta",
  "packet",
  "gitGraph",
  "usecase-beta",
])

/**
 * Extracts the diagram type from the Mermaid block code.
 * Strips comments (%%) and frontmatter (---) to find the first statement keyword.
 */
export function extractDiagramType(code) {
  const lines = code.split(/\r?\n/)
  let inFrontmatter = false
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()
    if (!trimmed) continue
    if (trimmed.startsWith("%%")) continue
    if (trimmed === "---") {
      inFrontmatter = !inFrontmatter
      continue
    }
    if (inFrontmatter) continue

    const firstWord = trimmed.split(/[\s:(\[{]/)[0]
    return firstWord
  }
  return ""
}

/**
 * Validates a single Mermaid diagram block.
 * Returns an array of error objects: { line, message, snippet }
 */
export function validateMermaidBlock(code, filePath = "", startLine = 1) {
  const errors = []
  const lines = code.split("\n")
  const diagramType = extractDiagramType(code)

  if (diagramType && !KNOWN_MERMAID_TYPES.has(diagramType)) {
    errors.push({
      file: filePath,
      line: startLine,
      snippet: diagramType,
      message: `Unknown or unsupported Mermaid diagram type "${diagramType}". Must be one of valid Mermaid 20+ types (e.g. flowchart, quadrantChart, sankey-beta, xychart-beta, radar-beta, mindmap, timeline, gantt, pie, sequenceDiagram, erDiagram, classDiagram, stateDiagram-v2, kanban, block-beta).`,
    })
  }

  const isFlowchartOrGraph =
    diagramType === "flowchart" || diagramType === "graph" || diagramType === "flowchart-elk"

  // Check 1: Detect unquoted decision nodes {...} containing special characters (? & : / <= >= > <)
  // In Mermaid flowchart/graph, text with special characters in diamond nodes MUST be wrapped in double quotes: {"..."}
  // This check is strictly scoped to flowchart/graph to prevent flagging structural braces in erDiagram, classDiagram, stateDiagram-v2, etc.
  if (isFlowchartOrGraph) {
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
  // Flowchart/graph labels only
  if (isFlowchartOrGraph) {
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
  }

  // Check 5: Detect unquoted parentheses in edge labels |...|
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNumber = startLine + i

    const edgeRegex = /(?:-->|---|-.->|==>)\s*\|([^|\r\n]+)\|/g
    let edgeMatch
    while ((edgeMatch = edgeRegex.exec(line)) !== null) {
      const rawLabel = edgeMatch[1].trim()
      if (/[()]/.test(rawLabel) && !(rawLabel.startsWith('"') && rawLabel.endsWith('"'))) {
        errors.push({
          file: filePath,
          line: lineNumber,
          snippet: line.trim(),
          message: `Edge label contains unquoted parentheses: |${rawLabel}|. Wrap label text in double quotes, e.g. |"${rawLabel}"|.`,
        })
      }
    }
  }

  // Check 6: Detect single-column vertical chains in TD/TB/BT diagrams
  const isVertical = /^\s*(flowchart|graph)\s+(TD|TB|BT)\b/m.test(code)
  if (isVertical) {
    // Check for inline multi-step chain with 4+ arrows (5+ nodes)
    const longInlineChain =
      /([A-Za-z0-9_-]+)\s*(?:-->|---)\s*([A-Za-z0-9_-]+)\s*(?:-->|---)\s*([A-Za-z0-9_-]+)\s*(?:-->|---)\s*([A-Za-z0-9_-]+)\s*(?:-->|---)\s*([A-Za-z0-9_-]+)/
    const inlineMatch = code.match(longInlineChain)
    if (inlineMatch) {
      errors.push({
        file: filePath,
        line: startLine,
        snippet: inlineMatch[0],
        message: `Diagram has an excessively long single-column vertical chain in TD/BT direction. Convert to 'flowchart LR' or multi-column subgraphs to utilize page width and eliminate vertical waste.`,
      })
    }

    // Check for 3+ stacked subgraphs chained sequentially in vertical mode
    const subgraphBlocks = [
      ...code.matchAll(/subgraph\s+([A-Za-z0-9_-]+)(?:\[.*?\])?([\s\S]*?)end/g),
    ]
    if (subgraphBlocks.length >= 3) {
      const names = subgraphBlocks.map((b) => b[1])
      const directLink = new RegExp(
        `(${names.join("|")})\\s*(?:-->|---|-.->)\\s*(${names.join("|")})`,
      )
      let hasCrossLink = directLink.test(code)

      if (!hasCrossLink) {
        for (let i = 0; i < subgraphBlocks.length - 1; i++) {
          const currentNodes = [
            ...subgraphBlocks[i][2].matchAll(/([A-Za-z0-9_-]+)\s*(\[|\{|\()/g),
          ].map((m) => m[1])
          const nextNodes = [
            ...subgraphBlocks[i + 1][2].matchAll(/([A-Za-z0-9_-]+)\s*(\[|\{|\()/g),
          ].map((m) => m[1])
          if (currentNodes.length > 0 && nextNodes.length > 0) {
            const crossLinkRegex = new RegExp(
              `(?:${currentNodes.join("|")})\\s*(?:-->|---|-.->)\\s*(?:${nextNodes.join("|")})`,
            )
            if (crossLinkRegex.test(code)) {
              hasCrossLink = true
              break
            }
          }
        }
      }

      if (hasCrossLink) {
        errors.push({
          file: filePath,
          line: startLine,
          snippet: `Subgraphs: ${names.join(" -> ")}`,
          message: `Sequential subgraphs stacked vertically in TD direction. Convert outer flow to 'flowchart LR' (e.g. S1 --> S2 --> S3) with internal 'direction TB' for balanced columns.`,
        })
      }
    }
  }

  // Type-specific sanity checks
  if (diagramType === "sankey-beta" || diagramType === "sankey") {
    // Sankey diagrams must use CSV format: Source,Target,Value (no arrows -->)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line || line.startsWith("%%") || line.startsWith("sankey")) continue
      if (line.includes("-->")) {
        errors.push({
          file: filePath,
          line: startLine + i,
          snippet: line,
          message: `Sankey diagrams require CSV format 'Source,Target,Value' without flowchart arrows ('-->').`,
        })
      }
    }
  }

  if (diagramType === "quadrantChart") {
    // Should have x-axis and y-axis defined
    const hasXAxis = lines.some((l) => /^\s*x-axis\b/i.test(l))
    const hasYAxis = lines.some((l) => /^\s*y-axis\b/i.test(l))
    if (!hasXAxis || !hasYAxis) {
      errors.push({
        file: filePath,
        line: startLine,
        snippet: code.slice(0, 80),
        message: `quadrantChart should define both 'x-axis' and 'y-axis' labels.`,
      })
    }

    // Check quadrant label lengths to prevent SVG text overlap in 500-640px views
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const quadMatch = line.match(/^\s*quadrant-[1-4]\s+"?([^"\n\r]+)"?/i)
      if (quadMatch) {
        const text = quadMatch[1].trim()
        if (text.length > 28) {
          errors.push({
            file: filePath,
            line: startLine + i,
            snippet: line.trim(),
            message: `quadrantChart quadrant label "${text}" exceeds 28 characters (${text.length} chars). Keep labels concise (<= 28 chars) to prevent SVG text overlap in quadrant panes.`,
          })
        }
      }
    }
  }

  // Check 7: stateDiagram-v2 / stateDiagram vertical chain check
  if (diagramType === "stateDiagram-v2" || diagramType === "stateDiagram") {
    const hasDirectionLR = lines.some((l) => /^\s*direction\s+LR\b/i.test(l))
    const transitions = lines.filter((l) => /-->/.test(l))
    if (!hasDirectionLR && transitions.length >= 4) {
      errors.push({
        file: filePath,
        line: startLine,
        snippet: code.slice(0, 80).replace(/\n/g, " "),
        message: `stateDiagram has ${transitions.length} sequential transitions without 'direction LR'. Sequential state machines must declare 'direction LR' (with sub-states where relevant) to eliminate vertical waste.`,
      })
    }
  }

  // Check 8: timeline syntax validation (Mermaid 12.3.0 lexer breaks on ':' in section or title)
  if (diagramType === "timeline") {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (/^section\b/i.test(line) && line.includes(":")) {
        errors.push({
          file: filePath,
          line: startLine + i,
          snippet: line,
          message: `timeline section header contains a colon ':'. In Mermaid 12.3.0, ':' is a reserved event delimiter; colons in section headers crash the parser with "Cannot read properties of undefined (reading 'events')". Replace ':' with '—' or ' - '.`,
        })
      }
    }
  }

  // Check 9: xychart-beta semantic pyramid / funnel check
  if (diagramType === "xychart-beta" || diagramType === "xychart") {
    const hasPyramidTitle = lines.some((l) =>
      /title\s+["']?(?:piramida|pyramid|funnel|corong)\b/i.test(l),
    )
    if (hasPyramidTitle) {
      errors.push({
        file: filePath,
        line: startLine,
        snippet: code.slice(0, 80).replace(/\n/g, " "),
        message: `xychart-beta cannot render stepped pyramids or funnels; it produces Cartesian vertical bar charts. Use 'block-beta' trapezoid stepped pyramid or 'sankey-beta' waterfall instead.`,
      })
    }
  }

  return errors
}

/**
 * Checks non-mermaid code blocks for prohibited ASCII box art diagrams.
 */
export function detectAsciiBoxArt(code, filePath = "", startLine = 1) {
  const errors = []
  const unicodeBox = /┌[─-]+[┐┬]|──►|◄──/
  const asciiBox = /\+[-=]{4,}\+[\s\S]*?(?:\||\+[-=]{4,}\+)/

  if (unicodeBox.test(code) || (asciiBox.test(code) && /(?:-->|──►|\|)/.test(code))) {
    errors.push({
      file: filePath,
      line: startLine,
      snippet: code.trim().slice(0, 100).replace(/\n/g, " ") + "...",
      message: `Found ASCII/Unicode box diagram in code block. Per MBA Wiki standards, all visual mechanisms and process flows must use vector Mermaid.js diagrams (e.g. 'flowchart LR'), not ASCII art.`,
    })
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

    let inCodeBlock = false
    let isMermaid = false
    let codeBlockLines = []
    let startLine = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (!inCodeBlock && line.trim().startsWith("```")) {
        inCodeBlock = true
        isMermaid = line.trim().startsWith("```mermaid")
        codeBlockLines = []
        startLine = i + 1
      } else if (inCodeBlock && line.trim().startsWith("```")) {
        inCodeBlock = false
        const blockCode = codeBlockLines.join("\n")
        if (isMermaid) {
          totalBlocks++
          const blockErrors = validateMermaidBlock(blockCode, file, startLine)
          allErrors.push(...blockErrors)
        } else {
          const asciiErrors = detectAsciiBoxArt(blockCode, file, startLine)
          allErrors.push(...asciiErrors)
        }
      } else if (inCodeBlock) {
        codeBlockLines.push(line)
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
