#!/usr/bin/env node

import { readdir, readFile, stat } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import matter from "gray-matter"

/**
 * Normalizes user input strings to identify targets:
 * - "mk2" -> { type: "course", course: "mk2" }
 * - "mk2 week 5" / "mk4 w7" -> { type: "week", course: "mk2", week: "week-05" }
 * - "mk2 mid" -> { type: "week", course: "mk2", week: "mid" }
 * - "concept:queuing-theory" / "concepts/queuing-theory" / "queuing-theory" (if exists) -> { type: "concept", slug: "queuing-theory" }
 * - "entity:ptba" / "entities/pt-bukit-asam" -> { type: "entity", slug: "pt-bukit-asam" }
 * - "case-alpine-ridge-cvp" -> { type: "article", query: "case-alpine-ridge-cvp" }
 * - "all-concepts" -> { type: "all-concepts" }
 * - "all-entities" -> { type: "all-entities" }
 */
export function parsePedagogyTargetSpec(input) {
  if (!input || typeof input !== "string") return null
  const trimmed = input.trim().toLowerCase().replace(/\\/g, "/")

  if (trimmed === "all-concepts" || trimmed === "concepts" || trimmed === "concepts/") {
    return { type: "all-concepts" }
  }
  if (trimmed === "all-entities" || trimmed === "entities" || trimmed === "entities/") {
    return { type: "all-entities" }
  }

  // Course + week/module match: e.g. "mk2 week 5", "mk4 w07", "mk2 mid"
  const courseMatch = trimmed.match(/mk[\s_-]*([1-6])/i)
  const weekMatch = trimmed.match(/(?:week|w|minggu)[\s_-]*(\d{1,2})/i)
  const midMatch = trimmed.match(/\b(?:mid|midterm|-term)\b/i)

  if (courseMatch && weekMatch) {
    const course = `mk${courseMatch[1]}`
    const weekNum = String(parseInt(weekMatch[1], 10)).padStart(2, "0")
    return { type: "week", course, week: `week-${weekNum}` }
  }
  if (courseMatch && midMatch) {
    const course = `mk${courseMatch[1]}`
    return { type: "week", course, week: "mid" }
  }
  if (
    courseMatch &&
    !weekMatch &&
    !midMatch &&
    (trimmed === `mk${courseMatch[1]}` || trimmed.startsWith(`mk${courseMatch[1]} `))
  ) {
    return { type: "course", course: `mk${courseMatch[1]}` }
  }

  // Concept match
  const conceptMatch = trimmed.match(/^(?:concepts?[\/:])?([a-z0-9-]+)(?:\.md)?$/i)
  if (trimmed.startsWith("concept:") || trimmed.startsWith("concepts/")) {
    return {
      type: "concept",
      slug: trimmed.replace(/^(?:concepts?[\/:])/, "").replace(/\.md$/, ""),
    }
  }

  // Entity match
  if (trimmed.startsWith("entity:") || trimmed.startsWith("entities/")) {
    return { type: "entity", slug: trimmed.replace(/^(?:entities?[\/:])/, "").replace(/\.md$/, "") }
  }

  // Specific path or filename query
  return { type: "query", query: trimmed }
}

/**
 * Resolves matched target files from the content directory based on user spec.
 */
export async function resolvePedagogyTargets(repoRoot, targetSpec) {
  const contentDir = path.join(repoRoot, "content")
  const parsed = typeof targetSpec === "string" ? parsePedagogyTargetSpec(targetSpec) : targetSpec
  if (!parsed) return []

  const matchedFiles = []

  if (parsed.type === "all-concepts") {
    const dir = path.join(contentDir, "concepts")
    try {
      const entries = await readdir(dir, { withFileTypes: true })
      for (const e of entries) {
        if (e.isFile() && e.name.endsWith(".md") && e.name !== "index.md") {
          matchedFiles.push(path.join(dir, e.name))
        }
      }
    } catch {}
    return matchedFiles
  }

  if (parsed.type === "all-entities") {
    const dir = path.join(contentDir, "entities")
    try {
      const entries = await readdir(dir, { withFileTypes: true })
      for (const e of entries) {
        if (e.isFile() && e.name.endsWith(".md") && e.name !== "index.md") {
          matchedFiles.push(path.join(dir, e.name))
        }
      }
    } catch {}
    return matchedFiles
  }

  if (parsed.type === "concept") {
    const candidate = path.join(contentDir, "concepts", `${parsed.slug}.md`)
    try {
      await stat(candidate)
      matchedFiles.push(candidate)
    } catch {}
    return matchedFiles
  }

  if (parsed.type === "entity") {
    const candidate = path.join(contentDir, "entities", `${parsed.slug}.md`)
    try {
      await stat(candidate)
      matchedFiles.push(candidate)
    } catch {}
    return matchedFiles
  }

  if (parsed.type === "course" || parsed.type === "week") {
    const coursesDir = path.join(contentDir, "courses")
    let courseDirs = []
    try {
      courseDirs = await readdir(coursesDir, { withFileTypes: true })
    } catch {
      return []
    }

    const courseFolder = courseDirs.find(
      (d) => d.isDirectory() && d.name.toLowerCase().startsWith(`${parsed.course.toLowerCase()}-`),
    )
    if (!courseFolder) return []

    const fullCoursePath = path.join(coursesDir, courseFolder.name)

    if (parsed.type === "course") {
      // Gather all markdown files across this course
      async function walkCourse(dir) {
        const entries = await readdir(dir, { withFileTypes: true })
        for (const e of entries) {
          const res = path.join(dir, e.name)
          if (e.isDirectory()) {
            await walkCourse(res)
          } else if (e.isFile() && e.name.endsWith(".md")) {
            matchedFiles.push(res)
          }
        }
      }
      await walkCourse(fullCoursePath)
      return matchedFiles
    }

    if (parsed.type === "week") {
      const weekPath = path.join(fullCoursePath, parsed.week)
      try {
        const entries = await readdir(weekPath, { withFileTypes: true })
        for (const e of entries) {
          if (e.isFile() && e.name.endsWith(".md")) {
            matchedFiles.push(path.join(weekPath, e.name))
          }
        }
      } catch {}
      return matchedFiles
    }
  }

  if (parsed.type === "query") {
    // Search across content/ by filename or relative path match
    async function searchRecursive(dir) {
      const entries = await readdir(dir, { withFileTypes: true })
      for (const e of entries) {
        const full = path.join(dir, e.name)
        if (e.isDirectory()) {
          await searchRecursive(full)
        } else if (e.isFile() && e.name.endsWith(".md")) {
          const rel = path.relative(repoRoot, full).toLowerCase().replace(/\\/g, "/")
          const base = e.name.toLowerCase()
          if (
            rel.includes(parsed.query) ||
            base === parsed.query ||
            base === `${parsed.query}.md` ||
            base.includes(parsed.query)
          ) {
            matchedFiles.push(full)
          }
        }
      }
    }
    await searchRecursive(contentDir)
    return matchedFiles
  }

  return matchedFiles
}

/**
 * Analyzes markdown content for pedagogical anti-patterns:
 * 1. Stacked $$...$$ display math blocks without explanatory prose in between (formula dump).
 * 2. High section formula density (>= 3 formulas with thin prose).
 * 3. Corrupted frontmatter titles / modules (empty quotes or trailing stripped symbols).
 */
export function analyzeMarkdownPedagogy(content, relPath = "") {
  const issues = []
  const parsed = matter(content)
  const frontmatter = parsed.data || {}

  // 1. Check frontmatter titles & module strings for corruption (e.g. "Week 05: Cost Analysis,  & ")
  if (frontmatter.title) {
    if (
      /,\s*&\s*$/.test(frontmatter.title) ||
      /\b(?:week\s+\d+:\s*,\s*|:\s*\(\s*part)/i.test(frontmatter.title) ||
      /:\s*$/.test(frontmatter.title)
    ) {
      issues.push({
        type: "CORRUPTED_TITLE",
        severity: "ERROR",
        line: 2,
        message: `Frontmatter title appears corrupted or truncated: "${frontmatter.title}"`,
      })
    }
  }
  if (frontmatter.module === "") {
    issues.push({
      type: "EMPTY_MODULE",
      severity: "WARN",
      line: 6,
      message: `Frontmatter module field is empty string ("")`,
    })
  }

  const lines = content.split(/\r?\n/)

  // 2. Parse display math blocks ($$...$$)
  const mathBlocks = []
  let inBlock = false
  let blockStart = -1

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line.startsWith("$$")) {
      if (!inBlock) {
        inBlock = true
        blockStart = i + 1
        // Single-line display math: e.g. $$ formula $$
        if (line.length > 2 && line.endsWith("$$")) {
          inBlock = false
          mathBlocks.push({ startLine: i + 1, endLine: i + 1 })
        }
      } else {
        inBlock = false
        mathBlocks.push({ startLine: blockStart, endLine: i + 1 })
      }
    }
  }

  // 3. Detect consecutive display math blocks without sufficient prose in between
  for (let j = 0; j < mathBlocks.length - 1; j++) {
    const current = mathBlocks[j]
    const next = mathBlocks[j + 1]

    const gapLines = lines.slice(current.endLine, next.startLine - 1)
    const gapText = gapLines.join(" ").trim()
    const wordCount = gapText.split(/\s+/).filter(Boolean).length

    // If gap between two display formulas has fewer than 15 words of explanation
    if (wordCount < 15) {
      issues.push({
        type: "FORMULA_DUMP",
        severity: "ERROR",
        line: next.startLine,
        message: `Consecutive display formulas with only ${wordCount} word(s) of prose in between (lines ${current.startLine}-${current.endLine} and ${next.startLine}-${next.endLine}). Every formula requires intuition, variable decoder, or structural explanation.`,
      })
    }
  }

  // 4. Section-level formula density check
  // Group into sections by H2 / H3 headers
  const sections = []
  let currentSection = { title: "Introduction", line: 1, text: [], formulaCount: 0 }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (/^##+\s+/.test(line)) {
      sections.push(currentSection)
      currentSection = {
        title: line.replace(/^##+\s+/, "").trim(),
        line: i + 1,
        text: [],
        formulaCount: 0,
      }
    } else {
      currentSection.text.push(line)
      if (line.trim().startsWith("$$")) {
        currentSection.formulaCount++
      }
    }
  }
  sections.push(currentSection)

  for (const sec of sections) {
    // Normalizing display block starts (2 $$ markers per block)
    const formulaBlocksInSec = Math.floor(sec.formulaCount / 2)
    if (formulaBlocksInSec >= 3) {
      const secWords = sec.text
        .join(" ")
        .replace(/\$\$[\s\S]*?\$\$/g, "")
        .split(/\s+/)
        .filter(Boolean).length
      const wordsPerFormula = Math.round(secWords / formulaBlocksInSec)
      if (wordsPerFormula < 30) {
        issues.push({
          type: "HIGH_FORMULA_DENSITY",
          severity: "WARN",
          line: sec.line,
          message: `Section "${sec.title}" has ${formulaBlocksInSec} display formulas with only ~${wordsPerFormula} words/formula. Ensure each formula explains its first-principles intuition, prerequisite concepts, and operational meaning.`,
        })
      }
    }
  }

  return issues
}

/**
 * CLI execution handler
 */
async function runCli() {
  const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)))
  const args = process.argv.slice(2)

  let targetArg = null
  let isScan = false

  for (let i = 0; i < args.length; i++) {
    if ((args[i] === "--target" || args[i] === "-t") && args[i + 1]) {
      targetArg = args[i + 1]
      break
    }
    if (args[i].startsWith("--target=")) {
      targetArg = args[i].split("=")[1]
      break
    }
    if (args[i] === "--scan" || args[i] === "-s") {
      isScan = true
    }
  }

  if (!targetArg && !isScan && args.length > 0 && !args[0].startsWith("-")) {
    targetArg = args.join(" ")
  }

  let targets = []
  if (isScan) {
    // Scan all published markdown files in content/
    async function collectAll(dir) {
      const entries = await readdir(dir, { withFileTypes: true })
      for (const e of entries) {
        const full = path.join(dir, e.name)
        if (e.isDirectory()) {
          await collectAll(full)
        } else if (e.isFile() && e.name.endsWith(".md")) {
          targets.push(full)
        }
      }
    }
    await collectAll(path.join(repoRoot, "content"))
  } else if (targetArg) {
    targets = await resolvePedagogyTargets(repoRoot, targetArg)
  } else {
    console.log("Pedagogy & Formula-Dump Auditor (`scripts/audit-pedagogy.mjs`)")
    console.log("\nUsage:")
    console.log('  node ./scripts/audit-pedagogy.mjs --target "mk2"')
    console.log('  node ./scripts/audit-pedagogy.mjs --target "mk2 week 5"')
    console.log('  node ./scripts/audit-pedagogy.mjs --target "queuing-theory"')
    console.log('  node ./scripts/audit-pedagogy.mjs --target "case-alpine-ridge-cvp"')
    console.log("  node ./scripts/audit-pedagogy.mjs --scan")
    process.exit(0)
  }

  if (targets.length === 0) {
    console.log(`[PEDAGOGY AUDIT] No matching markdown files found for target: "${targetArg}"`)
    process.exit(0)
  }

  console.log(`\n🔍 [PEDAGOGY AUDIT] Inspecting ${targets.length} file(s)...`)

  let totalErrors = 0
  let totalWarnings = 0
  const findingsByFile = []

  for (const filePath of targets) {
    const content = await readFile(filePath, "utf8")
    const relPath = path.relative(repoRoot, filePath).replace(/\\/g, "/")
    const issues = analyzeMarkdownPedagogy(content, relPath)

    if (issues.length > 0) {
      findingsByFile.push({ relPath, issues })
      for (const iss of issues) {
        if (iss.severity === "ERROR") totalErrors++
        if (iss.severity === "WARN") totalWarnings++
      }
    }
  }

  if (findingsByFile.length === 0) {
    console.log(
      `\x1b[32m[PEDAGOGY AUDIT PASSED]\x1b[0m 0 formula dumps or corrupted titles detected across ${targets.length} file(s).`,
    )
    process.exit(0)
  }

  console.log(
    `\nFound ${totalErrors} error(s) and ${totalWarnings} warning(s) across ${findingsByFile.length} file(s):\n`,
  )

  for (const f of findingsByFile) {
    console.log(`📄 \x1b[1m${f.relPath}\x1b[0m:`)
    for (const iss of f.issues) {
      const color = iss.severity === "ERROR" ? "\x1b[31m" : "\x1b[33m"
      console.log(`  ${color}[${iss.severity} L${iss.line}]\x1b[0m ${iss.message}`)
    }
    console.log("")
  }

  console.log(
    `Remediation: run \`/mba-enrich <target>\` to apply the First-Principles Accessibility Standard.`,
  )
  if (totalErrors > 0 && process.argv.includes("--strict")) {
    process.exit(1)
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  await runCli()
}
