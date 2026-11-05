#!/usr/bin/env node

import { readdir, stat, mkdir, writeFile, readFile, copyFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { execFile } from "node:child_process"
import { promisify } from "node:util"

const execFileAsync = promisify(execFile)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, "..")

/**
 * Discovers pdftotext executable location.
 */
export async function findPdfToText() {
  const standardPaths = [
    "C:\\Users\\havergal.samosir\\AppData\\Local\\Programs\\MiKTeX\\miktex\\bin\\x64\\pdftotext.exe",
    "pdftotext",
  ]

  for (const candidate of standardPaths) {
    try {
      await execFileAsync(candidate, ["-v"])
      return candidate
    } catch (e) {
      if (e.stdout || e.stderr || e.code === 0) {
        return candidate
      }
    }
  }
  return "pdftotext"
}

/**
 * Extracts plain text from a single PDF using pdftotext CLI.
 */
export async function extractPdfText(pdftotextExe, pdfPath) {
  try {
    const { stdout } = await execFileAsync(pdftotextExe, [pdfPath, "-"])
    return stdout
  } catch (error) {
    console.error(`Failed to extract ${pdfPath}:`, error.message)
    return ""
  }
}

/**
 * Collects all PDF files recursively.
 */
export async function getAllPdfs(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  let pdfs = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name !== ".extracted") {
        const nested = await getAllPdfs(fullPath)
        pdfs = pdfs.concat(nested)
      }
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".pdf")) {
      pdfs.push(fullPath)
    }
  }
  return pdfs
}

/**
 * Runs tasks with a specified concurrency ceiling.
 */
export async function pLimit(items, limit, fn) {
  const results = new Array(items.length)
  const executing = new Set()

  for (let i = 0; i < items.length; i++) {
    const current = i
    const p = Promise.resolve().then(() => fn(items[current], current))
    results[current] = p
    executing.add(p)
    p.finally(() => executing.delete(p))

    if (executing.size >= limit) {
      await Promise.race(executing)
    }
  }

  return Promise.all(results)
}

export const KELOMPOK_TO_BUMN = {
  1: { slug: "jasa-marga", name: "PT Jasa Marga (Persero) Tbk" },
  2: { slug: "jasa-marga", name: "PT Jasa Marga (Persero) Tbk" },
  3: { slug: "jasa-marga", name: "PT Jasa Marga (Persero) Tbk" },
  4: { slug: "jasa-marga", name: "PT Jasa Marga (Persero) Tbk" },
  5: { slug: "bank-rakyat-indonesia", name: "PT Bank Rakyat Indonesia (Persero) Tbk" },
  6: { slug: "injourney", name: "InJourney (PT Aviasi Pariwisata Indonesia)" },
  7: { slug: "injourney", name: "InJourney (PT Aviasi Pariwisata Indonesia)" },
  8: { slug: "injourney", name: "InJourney (PT Aviasi Pariwisata Indonesia)" },
  9: { slug: "pertamina-patra-niaga", name: "PT Pertamina Patra Niaga (ITJ Plumpang)" },
  10: { slug: "bank-rakyat-indonesia", name: "PT Bank Rakyat Indonesia (Persero) Tbk" },
  11: { slug: "pertamina-patra-niaga", name: "PT Pertamina Patra Niaga (ITJ Plumpang)" },
  12: { slug: "pertamina-patra-niaga", name: "PT Pertamina Patra Niaga (ITJ Plumpang)" },
  13: { slug: "pertamina-patra-niaga", name: "PT Pertamina Patra Niaga (ITJ Plumpang)" },
  14: { slug: "injourney", name: "InJourney (PT Aviasi Pariwisata Indonesia)" },
  15: { slug: "bank-rakyat-indonesia", name: "PT Bank Rakyat Indonesia (Persero) Tbk" },
  16: { slug: "pln-nusantara-power", name: "PT PLN Nusantara Power (UP Muara Karang)" },
  17: { slug: "telkom-neutradc", name: "Telkom Indonesia (NeutraDC Sentul)" },
  18: { slug: "telkom-neutradc", name: "Telkom Indonesia (NeutraDC Sentul)" },
  19: { slug: "telkom-neutradc", name: "Telkom Indonesia (NeutraDC Sentul)" },
  20: { slug: "bank-rakyat-indonesia", name: "PT Bank Rakyat Indonesia (Persero) Tbk" },
  21: { slug: "pln-nusantara-power", name: "PT PLN Nusantara Power (UP Muara Karang)" },
  22: { slug: "pln-nusantara-power", name: "PT PLN Nusantara Power (UP Muara Karang)" },
  23: { slug: "telkom-neutradc", name: "Telkom Indonesia (NeutraDC Sentul)" },
  24: { slug: "pln-nusantara-power", name: "PT PLN Nusantara Power (UP Muara Karang)" },
  25: { slug: "bank-syariah-indonesia", name: "PT Bank Syariah Indonesia Tbk (BSI)" },
  26: { slug: "sig-solusi-bangun-indonesia", name: "SIG / PT Solusi Bangun Indonesia (Narogong)" },
  27: { slug: "sig-solusi-bangun-indonesia", name: "SIG / PT Solusi Bangun Indonesia (Narogong)" },
  28: { slug: "sig-solusi-bangun-indonesia", name: "SIG / PT Solusi Bangun Indonesia (Narogong)" },
  29: { slug: "sig-solusi-bangun-indonesia", name: "SIG / PT Solusi Bangun Indonesia (Narogong)" },
  30: { slug: "bank-syariah-indonesia", name: "PT Bank Syariah Indonesia Tbk (BSI)" },
  31: { slug: "pupuk-indonesia", name: "PT Pupuk Indonesia & PT Pupuk Kujang Cikampek" },
  32: { slug: "pupuk-indonesia", name: "PT Pupuk Indonesia & PT Pupuk Kujang Cikampek" },
  33: { slug: "pupuk-indonesia", name: "PT Pupuk Indonesia & PT Pupuk Kujang Cikampek" },
  34: { slug: "pupuk-indonesia", name: "PT Pupuk Indonesia & PT Pupuk Kujang Cikampek" },
  35: { slug: "bank-syariah-indonesia", name: "PT Bank Syariah Indonesia Tbk (BSI)" },
  36: { slug: "pelabuhan-indonesia", name: "PT Pelabuhan Indonesia (Pelindo)" },
  37: { slug: "pelabuhan-indonesia", name: "PT Pelabuhan Indonesia (Pelindo)" },
  38: { slug: "pelabuhan-indonesia", name: "PT Pelabuhan Indonesia (Pelindo)" },
  39: { slug: "pelabuhan-indonesia", name: "PT Pelabuhan Indonesia (Pelindo)" },
  40: { slug: "bank-syariah-indonesia", name: "PT Bank Syariah Indonesia Tbk (BSI)" },
}

export function classifySubmission(text, filePath) {
  // Try extracting Kelompok number
  const kelM =
    text.match(/kelompok\s*[:/]?\s*(?:alp\s*)?(\d+)/i) ||
    filePath.match(/kelompok[_\s-]*(\d+)/i) ||
    filePath.match(/alp[_\s-]*(\d+)/i)
  let kNum = kelM ? parseInt(kelM[1], 10) : null

  if (kNum && KELOMPOK_TO_BUMN[kNum]) {
    return {
      kelompok: kNum,
      slug: KELOMPOK_TO_BUMN[kNum].slug,
      bumnName: KELOMPOK_TO_BUMN[kNum].name,
      matchType: "kelompok",
    }
  }

  // Fallback: Keyword matching in text
  const t = text.toLowerCase()
  if (/kujang|pupuk indonesia|pupuk kujang|cikampek/i.test(t)) {
    return {
      kelompok: kNum,
      slug: "pupuk-indonesia",
      bumnName: "PT Pupuk Indonesia & PT Pupuk Kujang Cikampek",
      matchType: "keyword",
    }
  }
  if (/brilink|kupedes|bank rakyat indonesia|bri unit|micro outlet|pasar jaya/i.test(t)) {
    return {
      kelompok: kNum,
      slug: "bank-rakyat-indonesia",
      bumnName: "PT Bank Rakyat Indonesia (Persero) Tbk",
      matchType: "keyword",
    }
  }
  if (/plumpang|patra niaga|integrated terminal jakarta|fuel terminal/i.test(t)) {
    return {
      kelompok: kNum,
      slug: "pertamina-patra-niaga",
      bumnName: "PT Pertamina Patra Niaga (ITJ Plumpang)",
      matchType: "keyword",
    }
  }
  if (/muara karang|pln nusantara power|pembangkitan muara karang|pltgu/i.test(t)) {
    return {
      kelompok: kNum,
      slug: "pln-nusantara-power",
      bumnName: "PT PLN Nusantara Power (UP Muara Karang)",
      matchType: "keyword",
    }
  }
  if (/tpks|tanjung priok|pelindo|pelabuhan indonesia|petikemas/i.test(t)) {
    return {
      kelompok: kNum,
      slug: "pelabuhan-indonesia",
      bumnName: "PT Pelabuhan Indonesia (Pelindo)",
      matchType: "keyword",
    }
  }
  if (/narogong|solusi bangun indonesia|semen indonesia|sbi|clinker|klinker/i.test(t)) {
    return {
      kelompok: kNum,
      slug: "sig-solusi-bangun-indonesia",
      bumnName: "SIG / PT Solusi Bangun Indonesia (Narogong)",
      matchType: "keyword",
    }
  }
  if (/neutradc|sentul|data center telkom|hyperscale data center/i.test(t)) {
    return {
      kelompok: kNum,
      slug: "telkom-neutradc",
      bumnName: "Telkom Indonesia (NeutraDC Sentul)",
      matchType: "keyword",
    }
  }
  if (/jasa marga|tollroad|jagorawi|jasamarga|gerbang tol/i.test(t)) {
    return {
      kelompok: kNum,
      slug: "jasa-marga",
      bumnName: "PT Jasa Marga (Persero) Tbk",
      matchType: "keyword",
    }
  }
  if (/injourney|sarinah|angkasa pura|aviata|airside|airport movement/i.test(t)) {
    return {
      kelompok: kNum,
      slug: "injourney",
      bumnName: "InJourney (PT Aviasi Pariwisata Indonesia)",
      matchType: "keyword",
    }
  }
  if (/bank syariah indonesia|bsi|layanan syariah|treasury & global market/i.test(t)) {
    return {
      kelompok: kNum,
      slug: "bank-syariah-indonesia",
      bumnName: "PT Bank Syariah Indonesia Tbk (BSI)",
      matchType: "keyword",
    }
  }

  // Fallback to Danantara Asset Management if associated with Telkom/Danantara
  if (/danantara asset management|danantara/i.test(t)) {
    return {
      kelompok: kNum,
      slug: "telkom-neutradc",
      bumnName: "Telkom Indonesia (NeutraDC Sentul)",
      matchType: "keyword-danantara",
    }
  }

  return { kelompok: kNum, slug: "unclassified", bumnName: "Unclassified", matchType: "none" }
}

export function extractMetadata(text, filePath) {
  let serdik = ""
  const serdikM =
    text.match(/(?:serdik|nomor serdik|no\.?\s*serdik)\s*[:/]?\s*(\d+)/i) ||
    path.basename(filePath).match(/^(\d+)_/)
  if (serdikM) serdik = serdikM[1]

  let name = ""
  const nameM = text.match(/nama(?:\s*lengkap)?\s*[:/]?\s*([^\r\n|•]+)/i)
  if (nameM) name = nameM[1].trim()

  let group = ""
  let elem = ""
  const geM =
    text.match(/grup[^\r\n/]*\/\s*elemen\s*[:/]?\s*([^\r\n|•]+)/i) ||
    filePath.match(/G(\d+)E(\d+)/i)
  if (geM) {
    if (geM[2]) {
      group = geM[1]
      elem = geM[2]
    } else {
      group = geM[1].trim()
    }
  }

  let instansi = ""
  const instM = text.match(/(?:asal\s*instansi|instansi|perusahaan\s*asal)\s*[:/]?\s*([^\r\n|•]+)/i)
  if (instM) instansi = instM[1].trim()

  return { serdik, name, group, elem, instansi }
}

/**
 * Main ingestion & archiving workflow.
 */
export async function runIngestion(srcInboxDir, targetArchiveDir) {
  const inbox = srcInboxDir || path.join(repoRoot, "inbox", "Business Immersion (7 Oktober)")
  const archive =
    targetArchiveDir || path.join(repoRoot, "archive", "program", "alp", "business-immersion-1")
  const extractedDir = path.join(archive, ".extracted")
  const textsDir = path.join(extractedDir, "texts")

  await mkdir(textsDir, { recursive: true })

  const pdfExe = await findPdfToText()
  const pdfFiles = await getAllPdfs(inbox)
  console.log(`Discovered ${pdfFiles.length} PDF files in ${inbox}`)

  const corpus = []
  const clusterCounts = {}

  await pLimit(pdfFiles, 16, async (filePath) => {
    const text = await extractPdfText(pdfExe, filePath)
    const baseName = path.basename(filePath)
    const meta = extractMetadata(text, filePath)
    const classification = classifySubmission(text, filePath)

    const record = {
      file: baseName,
      relPath: path.relative(inbox, filePath),
      ...meta,
      ...classification,
      length: text.length,
      // Thematic frequency markers
      hasChallengesTable: /tantangan utama.*dampak ke bisnis.*dugaan penyebab/i.test(text),
      mentionsSOP: /s&op|sales and operations planning|perencanaan operasi/i.test(text),
      mentionsDigitalization: /digital|sistem|aplikasi|otomasi|i-pubers|brimo|mypertamina/i.test(
        text,
      ),
      mentionsSafetyRisk: /k3|hse|safety|buffer zone|keamanan|bahaya|risiko/i.test(text),
      mentionsPSO: /pso|subsidi|penugasan|layanan publik|kewajiban/i.test(text),
    }

    corpus.push({ record, text })

    clusterCounts[classification.slug] = (clusterCounts[classification.slug] || 0) + 1
  })

  console.log("\nClassification results across 10 BUMN clusters:")
  for (const [slug, count] of Object.entries(clusterCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${slug.padEnd(30)} : ${count} submissions`)
  }

  // Copy files and write texts into company-specific directories
  console.log("\nArchiving PDFs and writing extracted texts...")
  for (const item of corpus) {
    const { record, text } = item
    const targetFolder = path.join(archive, record.slug)
    const targetTextFolder = path.join(textsDir, record.slug)
    await mkdir(targetFolder, { recursive: true })
    await mkdir(targetTextFolder, { recursive: true })

    const srcPath = path.join(inbox, record.relPath)
    const destPdfPath = path.join(targetFolder, record.file)
    await copyFile(srcPath, destPdfPath)

    const txtFile = path.basename(record.file, ".pdf") + ".txt"
    const destTxtPath = path.join(targetTextFolder, txtFile)
    await writeFile(destTxtPath, text, "utf8")
  }

  // Generate cohort summary JSON
  const summary = {
    generatedAt: new Date().toISOString(),
    totalSubmissions: corpus.length,
    clusters: clusterCounts,
    records: corpus.map((c) => c.record),
  }

  await writeFile(
    path.join(extractedDir, "cohort-summary.json"),
    JSON.stringify(summary, null, 2),
    "utf8",
  )
  console.log(
    `\nArchival complete. Summary written to ${path.join(extractedDir, "cohort-summary.json")}`,
  )
  return summary
}

// Direct execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runIngestion().catch((err) => {
    console.error("Aggregation failed:", err)
    process.exit(1)
  })
}
