import { createHash } from "node:crypto"
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"

export function computeContentHash(content) {
  const normalized = content.replace(/\r\n/g, "\n")
  return createHash("sha256").update(normalized, "utf8").digest("hex").slice(0, 12)
}

export function extractFrontmatterBlock(rawContent) {
  const match = rawContent.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  return match ? match[1] : null
}

export function extractFrontmatterField(rawContent, fieldName) {
  const block = extractFrontmatterBlock(rawContent)
  if (!block) return null
  const regex = new RegExp(`^${fieldName}\\s*:\\s*(.+)$`, "m")
  const match = block.match(regex)
  if (!match) return null
  let value = match[1].trim()
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1).trim()
  }
  return value.length > 0 ? value : null
}

export function findMarkdownRelativePaths(rootDir) {
  if (!existsSync(rootDir)) return []
  const results = []
  function walk(currentDir) {
    for (const entry of readdirSync(currentDir, { withFileTypes: true })) {
      const fullPath = path.join(currentDir, entry.name)
      if (entry.isDirectory()) {
        walk(fullPath)
      } else if (entry.name.endsWith(".md")) {
        results.push(path.relative(rootDir, fullPath).replace(/\\/g, "/"))
      }
    }
  }
  walk(rootDir)
  return results.sort()
}

export function checkI18nDirectory(repoRoot) {
  const enDir = path.join(repoRoot, "content")
  const idDir = path.join(repoRoot, "content-id")
  const idFiles = findMarkdownRelativePaths(idDir)
  const errors = []
  const staleFiles = []

  for (const relPath of idFiles) {
    const idPath = path.join(idDir, relPath)
    const enPath = path.join(enDir, relPath)
    const idRaw = readFileSync(idPath, "utf8")

    const title = extractFrontmatterField(idRaw, "title")
    if (!title) {
      errors.push(`Missing frontmatter title in content-id/${relPath}.`)
    }

    if (!existsSync(enPath)) {
      errors.push(
        `Translation file content-id/${relPath} is an orphan (no matching content/${relPath}).`,
      )
      continue
    }

    const enRaw = readFileSync(enPath, "utf8")
    const expectedHash = computeContentHash(enRaw)
    const actualHash = extractFrontmatterField(idRaw, "source_hash")
    if (actualHash !== expectedHash) {
      staleFiles.push({
        relPath,
        expectedHash,
        actualHash,
      })
    }
  }

  return {
    totalIdFiles: idFiles.length,
    errors,
    staleFiles,
  }
}

export function getI18nStatus(repoRoot) {
  const enDir = path.join(repoRoot, "content")
  const enFiles = findMarkdownRelativePaths(enDir)
  const { totalIdFiles, errors, staleFiles } = checkI18nDirectory(repoRoot)
  const idSet = new Set(findMarkdownRelativePaths(path.join(repoRoot, "content-id")))
  const missingFiles = enFiles.filter((relPath) => !idSet.has(relPath))

  const bySection = {}
  for (const relPath of enFiles) {
    const slashIdx = relPath.indexOf("/")
    const section = slashIdx === -1 ? "(root)" : relPath.slice(0, slashIdx)
    if (!bySection[section]) {
      bySection[section] = { total: 0, translated: 0 }
    }
    bySection[section].total++
    if (idSet.has(relPath)) {
      bySection[section].translated++
    }
  }

  const staleCount = staleFiles.length
  const upToDateCount = Math.max(0, totalIdFiles - staleCount - errors.length)

  return {
    totalEnFiles: enFiles.length,
    translatedCount: idFilesCountFromSet(idSet, enFiles),
    upToDateCount,
    staleCount,
    untranslatedCount: missingFiles.length,
    staleFiles,
    missingFiles,
    bySection,
    errors,
  }
}

function idFilesCountFromSet(idSet, enFiles) {
  let count = 0
  for (const relPath of enFiles) {
    if (idSet.has(relPath)) count++
  }
  return count
}

export function scaffoldI18nFile(repoRoot, rawRelPath, options = {}) {
  const { force = false } = options
  const normalizedRel = rawRelPath
    .replace(/\\/g, "/")
    .replace(/^\.\//, "")
    .replace(/^content(?:-id)?\//, "")

  if (!normalizedRel.endsWith(".md")) {
    throw new Error(`Target path must end with .md: ${rawRelPath}`)
  }

  const enPath = path.join(repoRoot, "content", normalizedRel)
  if (!existsSync(enPath)) {
    throw new Error(`English source does not exist: content/${normalizedRel}`)
  }

  const idPath = path.join(repoRoot, "content-id", normalizedRel)
  if (existsSync(idPath) && !force) {
    throw new Error(`Target file already exists: content-id/${normalizedRel}`)
  }

  const enRaw = readFileSync(enPath, "utf8")
  const sourceHash = computeContentHash(enRaw)
  const enFrontmatter = extractFrontmatterBlock(enRaw)

  let frontmatterLines = enFrontmatter
    ? enFrontmatter
        .replace(/\r\n/g, "\n")
        .split("\n")
        .filter((line) => !/^source_hash\s*:/.test(line))
    : ['title: "Untitled"']

  frontmatterLines.push(`source_hash: "${sourceHash}"`)

  const output = `---\n${frontmatterLines.join("\n")}\n---\n\n<!-- TODO: Terjemahkan isi dari content/${normalizedRel} (source_hash: ${sourceHash}) -->\n`

  mkdirSync(path.dirname(idPath), { recursive: true })
  writeFileSync(idPath, output, "utf8")

  return {
    relPath: normalizedRel,
    sourceHash,
    targetPath: idPath,
  }
}

function runCli() {
  const [command, ...rest] = process.argv.slice(2)
  const repoRoot = process.cwd()

  if (command === "check") {
    const report = checkI18nDirectory(repoRoot)
    if (report.errors.length > 0) {
      console.error(`❌ i18n check failed with ${report.errors.length} error(s):`)
      for (const err of report.errors) {
        console.error(`  - ${err}`)
      }
      process.exit(1)
    }

    const staleMsg =
      report.staleFiles.length > 0
        ? ` (${report.staleFiles.length} stale source_hash warning(s))`
        : ""
    console.log(
      `✅ Validated ${report.totalIdFiles} Indonesian translation file(s) with 0 errors${staleMsg}.`,
    )
    if (report.staleFiles.length > 0) {
      for (const item of report.staleFiles) {
        console.log(
          `   ⚠ stale: content-id/${item.relPath} (has ${item.actualHash ?? "none"}, en is ${item.expectedHash})`,
        )
      }
    }
    return
  }

  if (command === "status") {
    const status = getI18nStatus(repoRoot)
    const pct =
      status.totalEnFiles > 0
        ? ((status.translatedCount / status.totalEnFiles) * 100).toFixed(1)
        : "0.0"

    console.log(
      `P3MD Indonesian Translation Status: ${status.translatedCount}/${status.totalEnFiles} pages (${pct}%)`,
    )
    console.log(
      `  Up to date: ${status.upToDateCount} | Stale source_hash: ${status.staleCount} | Untranslated: ${status.untranslatedCount}`,
    )
    console.log("\nCoverage by section:")
    for (const [section, counts] of Object.entries(status.bySection).sort(([a], [b]) =>
      a.localeCompare(b),
    )) {
      console.log(`  - ${section}: ${counts.translated}/${counts.total}`)
    }
    if (status.staleFiles.length > 0) {
      console.log("\nStale translations (EN changed since source_hash):")
      for (const item of status.staleFiles) {
        console.log(
          `  - content-id/${item.relPath} (${item.actualHash ?? "none"} -> ${item.expectedHash})`,
        )
      }
    }
    return
  }

  if (command === "scaffold") {
    const force = rest.includes("--force")
    const target = rest.find((arg) => !arg.startsWith("--"))
    if (!target) {
      console.error("Usage: npm run i18n:scaffold -- <relative-path.md> [--force]")
      process.exit(1)
    }
    const result = scaffoldI18nFile(repoRoot, target, { force })
    console.log(`Created content-id/${result.relPath} (source_hash: ${result.sourceHash}).`)
    return
  }

  console.error("Usage: node ./scripts/i18n-tools.mjs <check|status|scaffold>")
  process.exit(1)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli()
}
