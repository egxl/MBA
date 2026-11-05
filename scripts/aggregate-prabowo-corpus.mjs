#!/usr/bin/env node

import { readdir, stat, mkdir, writeFile, readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { execFile } from "node:child_process"
import { promisify } from "node:util"
import {
  findPdfToText,
  extractPdfText,
  getAllPdfs,
  pLimit,
} from "./aggregate-cohort-submissions.mjs"
import { extractTextFromOfficeXml } from "./prep-raw.mjs"

const execFileAsync = promisify(execFile)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, "..")

async function extractXlsxText(filePath) {
  const psScript = `
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $zip = [System.IO.Compression.ZipFile]::OpenRead('${filePath.replace(/'/g, "''")}')
    try {
      $entry = $zip.GetEntry('xl/sharedStrings.xml')
      if ($entry) {
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
  const { stdout } = await execFileAsync("powershell", ["-NoProfile", "-Command", psScript], {
    maxBuffer: 10 * 1024 * 1024,
  })
  return extractTextFromOfficeXml(stdout, "xlsx")
}

async function main() {
  const inboxDir = path.join(repoRoot, "inbox", "TUGAS RESUME PRABOWO")
  const archiveDir = path.join(
    repoRoot,
    "archive",
    "rabuan",
    "2026-05-prabowo-taklimat-and-paripurna",
  )
  const extractedDir = path.join(archiveDir, ".extracted")
  const textsDir = path.join(extractedDir, "texts")

  await mkdir(textsDir, { recursive: true })

  console.log("Discovering PDFs in:", inboxDir)
  const pdfExe = await findPdfToText()
  const pdfFiles = await getAllPdfs(inboxDir)
  console.log(`Found ${pdfFiles.length} PDF submissions.`)

  const corpus = []
  let processed = 0

  await pLimit(pdfFiles, 12, async (pdfPath) => {
    const text = await extractPdfText(pdfExe, pdfPath)
    const baseName = path.basename(pdfPath, ".pdf")
    const txtPath = path.join(textsDir, `${baseName}.txt`)
    await writeFile(txtPath, text, "utf8")

    const parts = pdfPath.split(path.sep)
    const gIndex = parts.findIndex((p) => p.startsWith("GRUP"))
    const groupName = gIndex >= 0 ? parts[gIndex] : "OTHER"
    const elemName = gIndex >= 0 && parts[gIndex + 1] ? parts[gIndex + 1] : "OTHER"

    // Metadata extraction
    let name = ""
    let helmNo = ""
    let element = ""
    let group = ""

    const nameMatch = text.match(/(?:nama\s*(?:lengkap)?|name)\s*:\s*([^\r\n]+)/i)
    if (nameMatch) name = nameMatch[1].trim()

    const helmMatch = text.match(
      /(?:no(?:\.?|mor)?\s*helm|nomor\s*serdik|serdik)\s*:\s*([^\r\n]+)/i,
    )
    if (helmMatch) helmNo = helmMatch[1].trim()

    const elemMatch = text.match(/(?:elemen|element)\s*:\s*([^\r\n]+)/i)
    if (elemMatch) element = elemMatch[1].trim()

    const groupMatch = text.match(/(?:grup|group)\s*:\s*([^\r\n]+)/i)
    if (groupMatch) group = groupMatch[1].trim()

    const lower = text.toLowerCase()

    const record = {
      file: path.basename(pdfPath),
      groupFolder: groupName,
      elementFolder: elemName,
      parsedName: name,
      parsedHelm: helmNo,
      parsedElement: element,
      parsedGroup: group,
      charCount: text.length,
      lineCount: text.split("\n").length,
      task1: {
        hasLengserKeprabon: lower.includes("lengser keprabon") || lower.includes("madeg pandit"),
        hasDeOost: lower.includes("de oost") || lower.includes("westerling"),
        hasBestMindBestHeart: lower.includes("best mind") || lower.includes("best heart"),
        hasEnaFrance: lower.includes("ena") || lower.includes("ecole") || lower.includes("école"),
        hasLiahGreenfeld:
          lower.includes("greenfeld") || lower.includes("greenfield") || lower.includes("liah"),
        hasBelandaPdb:
          lower.includes("belanda") &&
          (lower.includes("pdb") || lower.includes("gdp") || lower.includes("1600")),
        hasNetOutflow436:
          lower.includes("436") || (lower.includes("neraca") && lower.includes("surplus")),
        hasOutflow343: lower.includes("343"),
        hasRetained93: lower.includes("93") && lower.includes("miliar"),
        hasUnderinvoicing908:
          lower.includes("908") ||
          lower.includes("underinvoicing") ||
          lower.includes("under invoicing"),
        hasSingleDoorDanantara:
          lower.includes("pengekspor tunggal") ||
          lower.includes("danantara sumberdaya") ||
          lower.includes("satu pintu"),
        hasBumnProfit2Percent:
          lower.includes("2%") ||
          lower.includes("2 persen") ||
          lower.includes("10-15%") ||
          lower.includes("14-15%"),
        hasGajiHakim300:
          lower.includes("hakim") && (lower.includes("300") || lower.includes("gaji")),
      },
      task2: {
        hasParipurnaDpr: lower.includes("paripurna") || lower.includes("dpr"),
        hasKemPpkf: lower.includes("kem") || lower.includes("ppkf"),
        hasRapbn2027: lower.includes("2027") || lower.includes("rapbn"),
        hasPasal33Uud1945: lower.includes("pasal 33") || lower.includes("uud 1945"),
        hasSwasembadaPangan: lower.includes("swasembada") || lower.includes("ketahanan pangan"),
        hasMbg62Juta:
          lower.includes("makan bergizi") ||
          lower.includes("mbg") ||
          lower.includes("62,4") ||
          lower.includes("62.4"),
        hasDanantara1000B:
          lower.includes("1000") && (lower.includes("danantara") || lower.includes("sovereign")),
        hasKdmp1061:
          lower.includes("koperasi desa") ||
          lower.includes("kdmp") ||
          lower.includes("1061") ||
          lower.includes("1.061"),
        hasKdmpTarget:
          lower.includes("20 ribu") ||
          lower.includes("20.000") ||
          lower.includes("60 ribu") ||
          lower.includes("60.000"),
        hasPkpn8Klaster:
          lower.includes("8 klaster") ||
          lower.includes("pkpn") ||
          lower.includes("program kerja prioritas"),
      },
    }

    corpus.push(record)
    processed++
    if (processed % 50 === 0 || processed === pdfFiles.length) {
      console.log(`Extracted & analyzed ${processed}/${pdfFiles.length} files...`)
    }
  })

  // Extract ASPIRASI SERDIK
  const xlsxPath = path.join(inboxDir, "ASPIRASI SERDIK P3MD (Jawaban).xlsx")
  let aspirasiRaw = ""
  try {
    aspirasiRaw = await extractXlsxText(xlsxPath)
    await writeFile(path.join(archiveDir, "aspirasi-serdik-extracted.txt"), aspirasiRaw, "utf8")
    console.log("Successfully extracted ASPIRASI SERDIK P3MD (Jawaban).xlsx")
  } catch (err) {
    console.warn("Could not extract ASPIRASI SERDIK xlsx:", err.message)
  }

  // Summary aggregation
  const summary = {
    generatedAt: new Date().toISOString(),
    totalSubmissions: corpus.length,
    groups: corpus.reduce((acc, c) => {
      acc[c.groupFolder] = (acc[c.groupFolder] || 0) + 1
      return acc
    }, {}),
    elements: corpus.reduce((acc, c) => {
      acc[c.elementFolder] = (acc[c.elementFolder] || 0) + 1
      return acc
    }, {}),
    task1Frequencies: {
      lengserKeprabon: corpus.filter((c) => c.task1.hasLengserKeprabon).length,
      deOostFilm: corpus.filter((c) => c.task1.hasDeOost).length,
      bestMindBestHeart: corpus.filter((c) => c.task1.hasBestMindBestHeart).length,
      enaFranceModel: corpus.filter((c) => c.task1.hasEnaFrance).length,
      liahGreenfeldNationalism: corpus.filter((c) => c.task1.hasLiahGreenfeld).length,
      belandaPdbHistory: corpus.filter((c) => c.task1.hasBelandaPdb).length,
      netOutflow436B: corpus.filter((c) => c.task1.hasNetOutflow436).length,
      capitalFlight343B: corpus.filter((c) => c.task1.hasOutflow343).length,
      retainedInCountry93B: corpus.filter((c) => c.task1.hasRetained93).length,
      underinvoicing908B: corpus.filter((c) => c.task1.hasUnderinvoicing908).length,
      singleDoorExportDanantara: corpus.filter((c) => c.task1.hasSingleDoorDanantara).length,
      bumnRoa2PercentVsBench: corpus.filter((c) => c.task1.hasBumnProfit2Percent).length,
      gajiHakim300Percent: corpus.filter((c) => c.task1.hasGajiHakim300).length,
    },
    task2Frequencies: {
      paripurnaDpr: corpus.filter((c) => c.task2.hasParipurnaDpr).length,
      kemPpkf: corpus.filter((c) => c.task2.hasKemPpkf).length,
      rapbn2027: corpus.filter((c) => c.task2.hasRapbn2027).length,
      pasal33Uud1945: corpus.filter((c) => c.task2.hasPasal33Uud1945).length,
      swasembadaPangan: corpus.filter((c) => c.task2.hasSwasembadaPangan).length,
      makanBergiziGratis62Juta: corpus.filter((c) => c.task2.hasMbg62Juta).length,
      danantaraSovereignFund1000B: corpus.filter((c) => c.task2.hasDanantara1000B).length,
      koperasiDesaMerahPutih1061: corpus.filter((c) => c.task2.hasKdmp1061).length,
      kdmpExpansionTarget: corpus.filter((c) => c.task2.hasKdmpTarget).length,
      pkpn8Klaster: corpus.filter((c) => c.task2.hasPkpn8Klaster).length,
    },
  }

  const manifest = {
    archiveTitle: "Presidential Briefing & Address Ingestion Corpus",
    sourceDirectory: "inbox/TUGAS RESUME PRABOWO",
    archivedAt: new Date().toISOString(),
    filesCount: pdfFiles.length,
    xlsxPresent: aspirasiRaw.length > 0,
    deliverables: {
      hambalangSession: "content/rabuan/2026-05-24-prabowo-taklimat-hambalang.md",
      paripurnaSession: "content/rabuan/2026-05-20-prabowo-kem-ppkf-rapbn-2027.md",
      entityPresident: "content/entities/prabowo-subianto.md",
      conceptDoctrine: "content/concepts/best-mind-best-heart.md",
    },
  }

  await writeFile(
    path.join(archiveDir, "cohort-synthesis.json"),
    JSON.stringify({ summary, entries: corpus }, null, 2),
    "utf8",
  )

  await writeFile(
    path.join(archiveDir, "intake-manifest.json"),
    JSON.stringify(manifest, null, 2),
    "utf8",
  )

  console.log("\nAggregation successfully completed.")
  console.log("Archive directory:", archiveDir)
  console.log("Summary:\n", JSON.stringify(summary, null, 2))
}

main().catch((err) => {
  console.error("Aggregation failed:", err)
  process.exit(1)
})
