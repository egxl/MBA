#!/usr/bin/env node

import { readdir, stat, rename, mkdir, writeFile, readFile, rm } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { execFile } from "node:child_process"
import { promisify } from "node:util"
import crypto from "node:crypto"

const execFileAsync = promisify(execFile)

/**
 * Normalizes messy week folder names such as:
 * "Week 1" -> "week-01"
 * "Week 02" -> "week-02"
 * "week 6" -> "week-06"
 * "W3" -> "week-03"
 */
export function normalizeModuleFolderName(folderName) {
  if (!folderName || typeof folderName !== "string") return null
  const trimmed = folderName.trim()
  if (/^mid(?:term|-term)?$/i.test(trimmed)) {
    return "mid"
  }
  if (/^references?$/i.test(trimmed)) {
    return "references"
  }
  const match = trimmed.match(/^(?:week|w|minggu)[\s_-]*(\d{1,2})$/i)
  if (!match) return null
  const weekNum = String(parseInt(match[1], 10)).padStart(2, "0")
  return `week-${weekNum}`
}

export function normalizeWeekFolderName(folderName) {
  const mod = normalizeModuleFolderName(folderName)
  return mod && mod.startsWith("week-") ? mod : null
}

/**
 * Parses user input strings like:
 * "mk3 week 1" -> { course: "mk3", week: "week-01", isRabuan: false, isCourseRoot: false }
 * "mk 4 w6" -> { course: "mk4", week: "week-06", isRabuan: false, isCourseRoot: false }
 * "mk1/week-01" -> { course: "mk1", week: "week-01", isRabuan: false, isCourseRoot: false }
 * "mk2" -> { course: "mk2", week: null, isRabuan: false, isCourseRoot: true }
 * "rabuan" -> { course: null, week: null, isRabuan: true, isCourseRoot: false }
 */
export function parseTargetSpec(input) {
  if (!input || typeof input !== "string") return null
  const trimmed = input.trim().toLowerCase()
  if (trimmed === "rabuan" || trimmed === "archive/rabuan") {
    return { course: null, week: null, isRabuan: true, isCourseRoot: false }
  }

  const courseMatch = trimmed.match(/mk[\s_-]*([1-6])/i)
  const weekMatch = trimmed.match(/(?:week|w|minggu)[\s_-]*(\d{1,2})/i)

  if (courseMatch && weekMatch) {
    const course = `mk${courseMatch[1]}`
    const weekNum = String(parseInt(weekMatch[1], 10)).padStart(2, "0")
    return { course, week: `week-${weekNum}`, isRabuan: false, isCourseRoot: false }
  }

  if (courseMatch && !weekMatch) {
    const course = `mk${courseMatch[1]}`
    return { course, week: null, isRabuan: false, isCourseRoot: true }
  }

  return null
}

/**
 * Strips XML tags from Word document.xml or Excel sharedStrings.xml
 * into readable plain text / markdown paragraphs.
 */
export function extractTextFromOfficeXml(xmlContent, type = "docx") {
  if (!xmlContent) return ""
  if (type === "docx") {
    return xmlContent
      .replace(/<\/w:p>/gi, "\n\n")
      .replace(/<w:br[^>]*\/?>/gi, "\n")
      .replace(/<w:tab[^>]*\/?>/gi, "\t")
      .replace(/<\/w:tc>/gi, " | ")
      .replace(/<\/w:tr>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  }
  if (type === "xlsx") {
    return xmlContent
      .replace(/<\/si>/gi, "\n")
      .replace(/<\/t>/gi, " ")
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/\n{2,}/g, "\n")
      .trim()
  }
  return ""
}

/**
 * Scans text or PDF stream strings for steganographic / zero-width prompt injection markers.
 */
export function scanBufferForSafetyAnomalies(buffer, filename) {
  const sha256 = crypto.createHash("sha256").update(buffer).digest("hex")
  const text = buffer.toString("utf8")
  const findings = []

  // Check zero-width / format characters (excluding standard BOM at index 0)
  const zwMatches = text.match(/[\u200B\u200C\u200D\u2060\uFEFF]/g)
  const zwCount = zwMatches ? zwMatches.length : 0

  if (filename.toLowerCase().endsWith(".pdf")) {
    if (/\/JavaScript\b|\/JS\b/i.test(text)) {
      findings.push("Contains embedded /JavaScript action")
    }
    if (/\/OpenAction\b/i.test(text)) {
      findings.push("Contains /OpenAction trigger")
    }
    if (/3\s+Tr\b/.test(text)) {
      findings.push("Contains invisible text render mode (3 Tr)")
    }
  } else {
    if (zwCount > 5) {
      findings.push(`Contains ${zwCount} zero-width unicode characters`)
    }
    if (/ignore\s+all\s+previous\s+instructions/i.test(text)) {
      findings.push("Contains suspicious prompt-override phrase")
    }
  }

  return {
    filename,
    sha256,
    zwCount,
    status: findings.length === 0 ? "CLEAN" : "REVIEW",
    findings,
  }
}

async function extractOfficeFileOnWindows(filePath, outTxtPath) {
  const ext = path.extname(filePath).toLowerCase()
  const innerXmlPath = ext === ".docx" ? "word/document.xml" : "xl/sharedStrings.xml"
  const psScript = `
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $zip = [System.IO.Compression.ZipFile]::OpenRead(${JSON.stringify(filePath)})
    try {
      $entry = $zip.GetEntry('${innerXmlPath}')
      if ($null -ne $entry) {
        $reader = New-Object System.IO.StreamReader($entry.Open())
        $xml = $reader.ReadToEnd()
        $reader.Close()
        [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
        Write-Output $xml
      }
    } finally {
      $zip.Dispose()
    }
  `
  try {
    const { stdout } = await execFileAsync("powershell.exe", ["-NoProfile", "-Command", psScript], {
      maxBuffer: 20 * 1024 * 1024,
    })
    if (stdout && stdout.trim()) {
      const extracted = extractTextFromOfficeXml(stdout, ext === ".docx" ? "docx" : "xlsx")
      if (extracted) {
        await writeFile(outTxtPath, extracted, "utf8")
        return true
      }
    }
  } catch {
    // Ignore extraction failure on locked/corrupt archives
  }
  return false
}

/**
 * Moves all files or subdirectories from inbox/ into the target archive directory.
 */
export async function organizeInbox(repoRoot, targetSpec) {
  const parsed = typeof targetSpec === "string" ? parseTargetSpec(targetSpec) : targetSpec
  if (!parsed) {
    throw new Error(
      `Invalid target specification: "${targetSpec}". Expected e.g. "mk3 week 1", "mk2", or "rabuan".`,
    )
  }

  const inboxDir = path.join(repoRoot, "inbox")
  try {
    await mkdir(inboxDir, { recursive: true })
  } catch {}

  if (parsed.isCourseRoot) {
    const courseArchiveDir = path.join(repoRoot, "archive", "courses", parsed.course)
    await mkdir(courseArchiveDir, { recursive: true })

    const entries = await readdir(inboxDir, { withFileTypes: true })
    const moved = []
    const modules = []
    const recordedTargetDirs = new Set()

    for (const entry of entries) {
      if (entry.name === ".gitkeep" || entry.name === "README.md") continue
      const entryPath = path.join(inboxDir, entry.name)

      if (entry.isDirectory()) {
        const modName = normalizeModuleFolderName(entry.name)
        if (modName) {
          const targetDir = path.join(courseArchiveDir, modName)
          await mkdir(targetDir, { recursive: true })
          const subEntries = await readdir(entryPath, { withFileTypes: true })
          for (const sub of subEntries) {
            const src = path.join(entryPath, sub.name)
            const dest = path.join(targetDir, sub.name)
            await rename(src, dest)
            moved.push({
              from: path.join(entry.name, sub.name),
              to: path.relative(repoRoot, dest),
              absolutePath: dest,
            })
          }
          await rm(entryPath, { recursive: true, force: true })
          if (!recordedTargetDirs.has(targetDir)) {
            recordedTargetDirs.add(targetDir)
            modules.push({ label: `${parsed.course}/${modName}`, targetDir })
          }
        } else {
          // Check if this container folder (e.g., "MK 2 [PJ_Mey]", "MK 5 [PJ_Dzakia]") has subfolders or files
          const subEntries = await readdir(entryPath, { withFileTypes: true })
          for (const sub of subEntries) {
            if (sub.name.startsWith("~$")) {
              await rm(path.join(entryPath, sub.name), { force: true })
              continue
            }
            if (sub.isDirectory()) {
              const subModName = normalizeModuleFolderName(sub.name)
              if (subModName) {
                const targetDir = path.join(courseArchiveDir, subModName)
                await mkdir(targetDir, { recursive: true })
                const subFolder = path.join(entryPath, sub.name)
                const innerFiles = await readdir(subFolder, { withFileTypes: true })
                for (const inner of innerFiles) {
                  if (inner.name.startsWith("~$")) {
                    await rm(path.join(subFolder, inner.name), { force: true })
                    continue
                  }
                  const src = path.join(subFolder, inner.name)
                  const dest = path.join(targetDir, inner.name)
                  await rename(src, dest)
                  moved.push({
                    from: path.join(entry.name, sub.name, inner.name),
                    to: path.relative(repoRoot, dest),
                    absolutePath: dest,
                  })
                }
                await rm(subFolder, { recursive: true, force: true })
                if (!recordedTargetDirs.has(targetDir)) {
                  recordedTargetDirs.add(targetDir)
                  modules.push({ label: `${parsed.course}/${subModName}`, targetDir })
                }
              }
            } else if (sub.isFile()) {
              let subModName = "references"
              if (/mid(?:term|-term)?[-_ ]?exam/i.test(sub.name) || /exam|mid/i.test(sub.name)) {
                subModName = "mid"
              }
              const targetDir = path.join(courseArchiveDir, subModName)
              await mkdir(targetDir, { recursive: true })
              const src = path.join(entryPath, sub.name)
              const dest = path.join(targetDir, sub.name)
              await rename(src, dest)
              moved.push({
                from: path.join(entry.name, sub.name),
                to: path.relative(repoRoot, dest),
                absolutePath: dest,
              })
              if (!recordedTargetDirs.has(targetDir)) {
                recordedTargetDirs.add(targetDir)
                modules.push({ label: `${parsed.course}/${subModName}`, targetDir })
              }
            }
          }
          const remaining = await readdir(entryPath)
          if (remaining.length === 0) {
            await rm(entryPath, { recursive: true, force: true })
          }
        }
      }
    }

    return { targetDir: courseArchiveDir, moved, modules }
  }

  let targetDir = ""
  if (parsed.isRabuan) {
    targetDir = path.join(repoRoot, "archive", "rabuan")
  } else {
    targetDir = path.join(repoRoot, "archive", "courses", parsed.course, parsed.week)
  }

  await mkdir(targetDir, { recursive: true })

  const entries = await readdir(inboxDir, { withFileTypes: true })
  const moved = []

  for (const entry of entries) {
    if (entry.name === ".gitkeep" || entry.name === "README.md") continue
    const srcPath = path.join(inboxDir, entry.name)
    const destPath = path.join(targetDir, entry.name)

    let finalDest = destPath
    try {
      await stat(finalDest)
      const parsedPath = path.parse(entry.name)
      finalDest = path.join(targetDir, `${parsedPath.name}-${Date.now()}${parsedPath.ext}`)
    } catch {
      // Dest does not exist; use original name
    }

    await rename(srcPath, finalDest)
    moved.push({
      from: entry.name,
      to: path.relative(repoRoot, finalDest),
      absolutePath: finalDest,
    })
  }

  return { targetDir, moved }
}

/**
 * Processes files within a single target module directory (extracts office text + safety scans).
 * Does NOT touch or scan other courses/weeks.
 */
export async function prepTargetModule(
  targetModulePath,
  moduleLabel,
  options = { extractOffice: true },
) {
  const summary = {
    module: moduleLabel,
    extractedFiles: [],
    safetyReports: [],
  }

  let files = []
  try {
    files = await readdir(targetModulePath, { withFileTypes: true })
  } catch {
    return summary
  }

  const extractedDir = path.join(targetModulePath, ".extracted")
  const scanResults = []

  for (const file of files) {
    if (!file.isFile()) continue
    if (file.name === "README.md" || file.name === "intake-manifest.json") continue
    const fullFilePath = path.join(targetModulePath, file.name)
    const ext = path.extname(file.name).toLowerCase()

    if (options.extractOffice && (ext === ".docx" || ext === ".xlsx")) {
      await mkdir(extractedDir, { recursive: true })
      const outTxtPath = path.join(extractedDir, `${file.name}.txt`)
      let needsExtract = true
      try {
        const [srcStat, outStat] = await Promise.all([stat(fullFilePath), stat(outTxtPath)])
        if (outStat.mtimeMs >= srcStat.mtimeMs) {
          needsExtract = false
        }
      } catch {
        needsExtract = true
      }

      if (needsExtract && process.platform === "win32") {
        const ok = await extractOfficeFileOnWindows(fullFilePath, outTxtPath)
        if (ok) {
          summary.extractedFiles.push(path.relative(targetModulePath, outTxtPath))
        }
      }
    }

    if (ext === ".pdf" || ext === ".txt" || ext === ".md") {
      const buf = await readFile(fullFilePath)
      const scan = scanBufferForSafetyAnomalies(buf, file.name)
      scanResults.push(scan)
    }
  }

  if (scanResults.length > 0) {
    await mkdir(extractedDir, { recursive: true })
    const manifestPath = path.join(extractedDir, "intake-manifest.json")
    const manifestData = {
      module: moduleLabel,
      scannedAt: new Date().toISOString(),
      files: scanResults,
    }
    await writeFile(manifestPath, JSON.stringify(manifestData, null, 2), "utf8")
    summary.safetyReports.push({
      module: moduleLabel,
      totalFiles: scanResults.length,
      reviewCount: scanResults.filter((r) => r.status !== "CLEAN").length,
    })
  }

  return summary
}

/**
 * Global archive sweep - only run when explicitly requested via --all.
 */
export async function prepArchiveDirectory(archiveRootDir, options = { extractOffice: true }) {
  const summary = {
    renamedFolders: [],
    extractedFiles: [],
    safetyReports: [],
  }

  const coursesDir = path.join(archiveRootDir, "courses")
  let courseEntries = []
  try {
    courseEntries = await readdir(coursesDir, { withFileTypes: true })
  } catch {
    return summary
  }

  for (const courseEntry of courseEntries) {
    if (!courseEntry.isDirectory()) continue
    const coursePath = path.join(coursesDir, courseEntry.name)
    const weekEntries = await readdir(coursePath, { withFileTypes: true })

    for (const weekEntry of weekEntries) {
      if (!weekEntry.isDirectory()) continue
      const normalized = normalizeWeekFolderName(weekEntry.name)
      let activeWeekName = weekEntry.name
      let activeWeekPath = path.join(coursePath, weekEntry.name)

      if (normalized && normalized !== weekEntry.name) {
        const targetPath = path.join(coursePath, normalized)
        try {
          await stat(targetPath)
        } catch {
          await rename(activeWeekPath, targetPath)
          summary.renamedFolders.push({
            from: `${courseEntry.name}/${weekEntry.name}`,
            to: `${courseEntry.name}/${normalized}`,
          })
          activeWeekName = normalized
          activeWeekPath = targetPath
        }
      }

      const modResult = await prepTargetModule(
        activeWeekPath,
        `${courseEntry.name}/${activeWeekName}`,
        options,
      )
      summary.extractedFiles.push(...modResult.extractedFiles)
      summary.safetyReports.push(...modResult.safetyReports)
    }
  }

  return summary
}

/**
 * Inspects content/courses/ for existing notes in the target course/week
 * to identify potential collisions, existing satellites, and MOC syllabus status.
 */
export async function auditTargetContent(repoRoot, targetSpec) {
  if (!targetSpec || !targetSpec.course) return null
  const coursesDir = path.join(repoRoot, "content", "courses")
  let courseDirs = []
  try {
    courseDirs = await readdir(coursesDir, { withFileTypes: true })
  } catch {
    return null
  }

  const courseMatch = courseDirs.find(
    (d) =>
      d.isDirectory() && d.name.toLowerCase().startsWith(targetSpec.course.toLowerCase() + "-"),
  )
  if (!courseMatch) return null

  const coursePath = path.join(coursesDir, courseMatch.name)
  const courseIndexPath = path.join(coursePath, "index.md")

  let mocInfo = null
  try {
    const courseIndexRaw = await readFile(courseIndexPath, "utf-8")
    if (targetSpec.week) {
      const weekNum = targetSpec.week.replace(/^week-0?/, "")
      const weekPattern = new RegExp(
        `\\*\\*Week\\s+0?${weekNum}\\*\\*\\s*\\|([^|]+)\\|([^|]+)\\|([^|]+)`,
        "i",
      )
      const match = courseIndexRaw.match(weekPattern)
      if (match) {
        mocInfo = {
          pillar: match[1].trim(),
          topic: match[2].trim().replace(/\*\*/g, ""),
          status: match[3].includes("Ingested") ? "Ingested" : "Scheduled (Pending Ingestion)",
        }
      }
    }
  } catch {
    // Ignore course index read errors
  }

  if (!targetSpec.week) {
    return {
      courseDir: courseMatch.name,
      mocInfo,
    }
  }

  const targetWeekDir = path.join(coursePath, targetSpec.week)
  let existingFiles = []
  let dirExists = false
  try {
    const entries = await readdir(targetWeekDir, { withFileTypes: true })
    dirExists = true
    existingFiles = entries.filter((e) => e.isFile() && e.name.endsWith(".md")).map((e) => e.name)
  } catch {
    dirExists = false
  }

  return {
    courseDir: courseMatch.name,
    targetWeek: targetSpec.week,
    targetWeekDir,
    dirExists,
    existingFiles,
    hasIndex: existingFiles.includes("index.md"),
    satellites: existingFiles.filter((f) => f !== "index.md"),
    mocInfo,
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)))
  const args = process.argv.slice(2)

  let targetArg = null
  let runAll = false
  for (let i = 0; i < args.length; i++) {
    if ((args[i] === "--target" || args[i] === "--to") && args[i + 1]) {
      targetArg = args[i + 1]
      break
    }
    if (args[i].startsWith("--target=")) {
      targetArg = args[i].split("=")[1]
      break
    }
    if (args[i] === "--all") {
      runAll = true
    }
  }

  if (targetArg) {
    try {
      const inboxResult = await organizeInbox(repoRoot, targetArg)
      if (inboxResult.modules && inboxResult.modules.length > 0) {
        console.log(`[INBOX COURSE ORGANIZED] -> ${inboxResult.targetDir}`)
        console.log(`  - Total files moved: ${inboxResult.moved.length}`)
        for (const mod of inboxResult.modules) {
          const moduleRes = await prepTargetModule(mod.targetDir, mod.label)
          console.log(
            `  - [${mod.label}] Extracted: ${moduleRes.extractedFiles.length}, Scans: ${moduleRes.safetyReports.length}`,
          )
        }
      } else {
        console.log(`[INBOX ORGANIZED] -> ${inboxResult.targetDir}`)
        console.log(`  - Files moved from inbox: ${inboxResult.moved.length}`)
        for (const m of inboxResult.moved) {
          console.log(`    * ${m.from} -> ${m.to}`)
        }

        const moduleRes = await prepTargetModule(inboxResult.targetDir, targetArg)
        console.log(`[TARGET MODULE PREP COMPLETE]`)
        console.log(`  - Office files extracted: ${moduleRes.extractedFiles.length}`)
        console.log(`  - Safety scan reports: ${moduleRes.safetyReports.length}`)
      }

      // Target content reconnaissance & collision audit
      const targetSpec = parseTargetSpec(targetArg)
      if (targetSpec && targetSpec.course) {
        const audit = await auditTargetContent(repoRoot, targetSpec)
        if (audit) {
          console.log(`\n[TARGET RECONNAISSANCE & CONFLICT AUDIT]`)
          if (audit.targetWeek) {
            console.log(
              `  - Target folder: content/courses/${audit.courseDir}/${audit.targetWeek}/`,
            )
            if (audit.mocInfo) {
              console.log(
                `  - Current MOC status: [${audit.mocInfo.status}] Topic: "${audit.mocInfo.topic}"`,
              )
            }
            if (audit.dirExists && audit.existingFiles.length > 0) {
              console.log(
                `  - Existing markdown notes (${audit.existingFiles.length}): ${audit.existingFiles.join(", ")}`,
              )
              console.log(`  - Conflict Guidance:`)
              console.log(`    * Master Hub (index.md): Full rewrite from primary evidence.`)
              console.log(`    * Satellites: Reconcile or purge obsolete placeholder files.`)
              console.log(`    * Syllabus: Reconcile MOC topic row if lecture title differs.`)
            } else {
              console.log(`  - Status: Clean slate (no existing markdown notes).`)
            }
          } else {
            console.log(`  - Target course: content/courses/${audit.courseDir}/`)
          }
        }
      }
    } catch (err) {
      console.error(`[ERROR] ${err.message}`)
      process.exit(1)
    }
  } else if (runAll) {
    const archiveRoot = path.join(repoRoot, "archive")
    const result = await prepArchiveDirectory(archiveRoot)
    console.log(`[GLOBAL ARCHIVE SWEEP COMPLETE]`)
    console.log(`  - Normalized folders: ${result.renamedFolders.length}`)
    console.log(`  - Office files extracted: ${result.extractedFiles.length}`)
    console.log(`  - Modules safety-scanned: ${result.safetyReports.length}`)
  } else {
    console.log("Usage:")
    console.log(
      '  node ./scripts/prep-raw.mjs --target "mk3 week 1"  (Ingests inbox into target module archive)',
    )
    console.log("  node ./scripts/prep-raw.mjs --all                 (Full archive sweep)")
  }
}
