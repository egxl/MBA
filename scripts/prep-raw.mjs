#!/usr/bin/env node

import { readdir, stat, rename, mkdir, writeFile, readFile } from "node:fs/promises"
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
export function normalizeWeekFolderName(folderName) {
  const trimmed = folderName.trim()
  const match = trimmed.match(/^(?:week|w|minggu)[\s_-]*(\d{1,2})$/i)
  if (!match) return null
  const weekNum = String(parseInt(match[1], 10)).padStart(2, "0")
  return `week-${weekNum}`
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

export async function prepRawDirectory(rawRootDir, options = { extractOffice: true }) {
  const summary = {
    renamedFolders: [],
    extractedFiles: [],
    safetyReports: [],
  }

  const coursesDir = path.join(rawRootDir, "courses")
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
          // Target already exists; keep as is
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

      // Process files inside week folder
      const files = await readdir(activeWeekPath, { withFileTypes: true })
      const extractedDir = path.join(activeWeekPath, ".extracted")
      const scanResults = []

      for (const file of files) {
        if (!file.isFile()) continue
        const fullFilePath = path.join(activeWeekPath, file.name)
        const ext = path.extname(file.name).toLowerCase()

        // 1. Extract .docx / .xlsx text for instant AI reading
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
              summary.extractedFiles.push(
                `${courseEntry.name}/${activeWeekName}/.extracted/${file.name}.txt`,
              )
            }
          }
        }

        // 2. Safety scan on assignment/case PDFs and .txt files
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
          course: courseEntry.name,
          week: activeWeekName,
          scannedAt: new Date().toISOString(),
          files: scanResults,
        }
        await writeFile(manifestPath, JSON.stringify(manifestData, null, 2), "utf8")
        summary.safetyReports.push({
          module: `${courseEntry.name}/${activeWeekName}`,
          totalFiles: scanResults.length,
          reviewCount: scanResults.filter((r) => r.status !== "CLEAN").length,
        })
      }
    }
  }

  return summary
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const rawRoot = path.resolve(fileURLToPath(new URL("../raw", import.meta.url)))
  const result = await prepRawDirectory(rawRoot)
  console.log(`[RAW PREP COMPLETE]`)
  console.log(`  - Normalized folders: ${result.renamedFolders.length}`)
  for (const r of result.renamedFolders) {
    console.log(`    * ${r.from} -> ${r.to}`)
  }
  console.log(`  - Office files extracted to .extracted/: ${result.extractedFiles.length}`)
  for (const f of result.extractedFiles) {
    console.log(`    * ${f}`)
  }
  console.log(`  - Modules safety-scanned: ${result.safetyReports.length}`)
}
