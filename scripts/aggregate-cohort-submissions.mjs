#!/usr/bin/env node

import { readdir, stat, mkdir, writeFile, readFile } from "node:fs/promises"
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
  let index = 0
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

/**
 * Main aggregator logic.
 */
export async function runAggregation(targetDir) {
  const archiveDir =
    targetDir || path.join(repoRoot, "archive", "rabuan", "2026-09-04-indayati-professional-image")
  const extractedDir = path.join(archiveDir, ".extracted")
  const textsDir = path.join(extractedDir, "texts")

  await mkdir(textsDir, { recursive: true })

  const pdfExe = await findPdfToText()
  const pdfFiles = await getAllPdfs(archiveDir)
  console.log(`Discovered ${pdfFiles.length} PDF files in ${archiveDir}`)

  const mindIdPattern =
    /(?:mind[\s_-]*id|mineral\s*industri|bukit\s*asam|ptba|antam|aneka\s*tambang|timah|inalum|asahan\s*alumin|vale|freeport)/i

  const corpus = []
  let processedCount = 0

  await pLimit(pdfFiles, 8, async (filePath) => {
    const text = await extractPdfText(pdfExe, filePath)
    const baseName = path.basename(filePath, ".pdf")
    const txtPath = path.join(textsDir, `${baseName}.txt`)
    await writeFile(txtPath, text, "utf8")

    const isMindId = mindIdPattern.test(text) || mindIdPattern.test(filePath)

    // Extract basic metadata fields
    let name = ""
    let serdik = ""
    let instansi = ""

    const nameMatch = text.match(/(?:nama\s*(?:lengkap)?|name)\s*:\s*([^\r\n]+)/i)
    if (nameMatch) name = nameMatch[1].trim()

    const serdikMatch = text.match(/(?:nomor\s*)?serdik\s*:\s*(\d+)/i)
    if (serdikMatch) serdik = serdikMatch[1].trim()

    const instansiMatch = text.match(/(?:asal\s*)?instansi\s*:\s*([^\r\n]+)/i)
    if (instansiMatch) instansi = instansiMatch[1].trim()

    const entry = {
      file: path.basename(filePath),
      relPath: path.relative(archiveDir, filePath),
      name,
      serdik,
      instansi,
      isMindId,
      length: text.length,
    }

    const isBuckinghamSession = /buckingham|2026-09-30/i.test(archiveDir)
    const isPeopleMathSession = /people\s*math|2026-09-02-adh|2026-08-31/i.test(archiveDir)

    if (isPeopleMathSession) {
      Object.assign(entry, {
        mentionsADH: /agus\s*dwi\s*handaya|\badh\b/i.test(text),
        mentionsPPH: /\bpph\b|people\s*productivity.*happiness/i.test(text),
        mentionsPDR: /\bpdr\b|people\s*development\s*role/i.test(text),
        mentionsSEC: /\bsec\b|skill\s*(?:mapping|equation|excellence)/i.test(text),
        mentionsTAL: /\btal\b|tough\s*(?:&|and|dan)?\s*agile\s*learner/i.test(text),
        mentions3NIndividu:
          /(?:nyerap.*ngulang.*ngerefleksi|3n\s*(?:individu|pembelajar|learning))/i.test(text),
        mentions3NLeader: /(?:nagih.*nata.*nuntun|3n\s*(?:leader|pemimpin))/i.test(text),
        mentionsMetaSkill: /meta\s*skill|\bms\b|connecting\s*the\s*dots|unlearn/i.test(text),
        mentionsGivingFactors:
          /giving\s*factor|receiving\s*factor|\bgr\b.*\brr\b|learning\s*energy/i.test(text),
        mentionsSourceOfCharacter:
          /(?:source\s*of\s*character|takut.*kebiasaan.*belief|fear.*habit.*belief)/i.test(text),
        mentionsVbVp: /\bvb\b.*\bvp\b|kecepatan\s*belajar.*perubahan/i.test(text),
        mentionsHumanHealth: /human\s*health|\bhh\b|kesehatan\s*(?:fisik|mental)/i.test(text),
        mentionsHadjar: /hadjar|handjar/i.test(text),
        mentionsWika: /\bwika\b|wijaya\s*karya/i.test(text),
        mentionsTransformerLegacy: /transformer|legacy|warisan/i.test(text),
        mentionsBlueOcean: /blue\s*ocean|red\s*ocean/i.test(text),
        mentionsBIM: /\bbim\b|building\s*information\s*modeling|pt\s*pp|waskita/i.test(text),
        mentionsCreateFuture:
          /(?:menciptakan\s*masa\s*depan|create\s*(?:the\s*)?future|prediksi\s*masa\s*depan)/i.test(
            text,
          ),
        mentionsDoTheBest: /do\s*the\s*best/i.test(text),
        mentionsJujurAmanah: /(?:jujur.*amanah|berani\s*mencoba.*bertanggung\s*jawab)/i.test(text),
      })
    } else if (isBuckinghamSession) {
      Object.assign(entry, {
        mentionsBuckingham: /(?:buckingham|edward)/i.test(text),
        mentionsMinto: /(?:minto|pyramid\s*principle)/i.test(text),
        mentionsSCQA:
          /(?:scqa|situation.*complication.*question.*answer|situasi.*komplikasi.*pertanyaan.*jawaban)/i.test(
            text,
          ),
        mentionsMECE: /(?:mece|mutually\s*exclusive|kolektif.*lengkap)/i.test(text),
        mentionsBLUF:
          /(?:bluf|bottom\s*line\s*up\s*front|answer\s*first|jawaban\s*di\s*awal|kesimpulan\s*di\s*awal)/i.test(
            text,
          ),
        mentionsIronTriangle:
          /(?:iron\s*triangle|segitiga\s*besi|scope.*time.*cost|ruang\s*lingkup.*waktu.*biaya)/i.test(
            text,
          ),
        mentionsDruckerQuote:
          /(?:culture\s*eats\s*strategy|budaya\s*makan\s*strategi|sarapan)/i.test(text),
        mentionsEfficiencyVsEffectiveness:
          /(?:doing\s*things\s*right.*doing\s*the\s*right\s*things|efisien.*efektif|efektivitas.*efisiensi)/i.test(
            text,
          ),
        mentionsBorobudur: /(?:borobudur|candi|stupa|kamadhatu|rupadhatu|arupadhatu)/i.test(text),
        mentionsMeilano: /(?:irwan\s*meilano|meilano)/i.test(text),
        mentionsRiskFormula:
          /(?:hazard.*exposure.*vulnerability.*capacity|bahaya.*paparan.*kerentanan.*kapasitas|rumus\s*risiko)/i.test(
            text,
          ),
        mentionsWhyNationsFail:
          /(?:why\s*nations\s*fail|acemoglu|institusi\s*ekstraktif|institusi\s*inklusif)/i.test(
            text,
          ),
        mentionsTwoMegatrends:
          /(?:intelligence\s*becomes\s*abundant|risk\s*becomes\s*systemic|kecerdasan.*melimpah.*risiko.*sistemik)/i.test(
            text,
          ),
        mentionsTurkeyIllusion: /(?:turkey\s*illusion|kalkun|black\s*swan|nassim\s*taleb)/i.test(
          text,
        ),
        mentionsVulnerabilityLever:
          /(?:vulnerability\s*(?:adalah|merupakan)?\s*tuas|kerentanan.*tuas\s*tercepat)/i.test(
            text,
          ),
        mentionsTrustCapacity:
          /(?:kepercayaan\s*(?:adalah|merupakan)?\s*kapasitas|trust\s*is\s*capacity)/i.test(text),
        mentionsFiveSimulationLessons:
          /(?:lima\s*pelajaran|5\s*pelajaran|simulasi.*gempa|simulasi.*risiko)/i.test(text),
        mentionsRiskControlPrinciple:
          /(?:tidak\s*mengendalikan\s*hazard|mengendalikan\s*exposure.*vulnerability.*capacity)/i.test(
            text,
          ),
        mentionsMultiDimensionalInnovation:
          /(?:inovasi\s*sosial|inovasi\s*institusi|inovasi.*lebih.*teknologi)/i.test(text),
      })
    } else {
      Object.assign(entry, {
        mentions5C: /(?:5c|character.*competence)/i.test(text),
        mentionsTriangle: /(?:triangle\s*of\s*success|attitude.*knowledge.*skill)/i.test(text),
        mentions3S: /(?:3s|senyum.*sapa.*salam)/i.test(text),
        mentions3V: /(?:3v|visual.*vocal.*verbal)/i.test(text),
        mentionsJFK: /(?:kennedy|jfk|talent.*kesempatan)/i.test(text),
        mentionsAsymmetry: /(?:67|remember\s*me)/i.test(text),
        mentionsSpheresOfLife:
          /(?:family\s*life.*social\s*life.*professional|kehidupan\s*keluarga.*sosial)/i.test(text),
        mentionsMaturity: /(?:maturity|kematangan.*self\s*control)/i.test(text),
        mentionsService: /(?:melayani|pelayan|servant)/i.test(text),
        mentionsListening: /(?:listening\s*first|mendengarkan\s*lebih\s*banyak)/i.test(text),
      })
    }

    corpus.push(entry)

    processedCount++
    if (processedCount % 50 === 0 || processedCount === pdfFiles.length) {
      console.log(`Extracted ${processedCount}/${pdfFiles.length} files...`)
    }
  })

  const mindIdCount = corpus.filter((c) => c.isMindId).length
  console.log(
    `\nCorpus extraction complete. Total: ${corpus.length}, MIND ID & Subsidiaries: ${mindIdCount}`,
  )

  const isBuckinghamSession = /buckingham|2026-09-30/i.test(archiveDir)
  const isPeopleMathSession = /people\s*math|2026-09-02-adh|2026-08-31/i.test(archiveDir)

  const frequencies = isPeopleMathSession
    ? {
        adhCited: corpus.filter((c) => c.mentionsADH).length,
        pphEquation: corpus.filter((c) => c.mentionsPPH).length,
        pdrEquation: corpus.filter((c) => c.mentionsPDR).length,
        secSkillMapping: corpus.filter((c) => c.mentionsSEC).length,
        toughAgileLearner: corpus.filter((c) => c.mentionsTAL).length,
        threeNIndividu: corpus.filter((c) => c.mentions3NIndividu).length,
        threeNLeader: corpus.filter((c) => c.mentions3NLeader).length,
        metaSkill: corpus.filter((c) => c.mentionsMetaSkill).length,
        givingVsReceiving: corpus.filter((c) => c.mentionsGivingFactors).length,
        sourceOfCharacter: corpus.filter((c) => c.mentionsSourceOfCharacter).length,
        vbVsVpVelocity: corpus.filter((c) => c.mentionsVbVp).length,
        humanHealth: corpus.filter((c) => c.mentionsHumanHealth).length,
        hadjarCited: corpus.filter((c) => c.mentionsHadjar).length,
        wikaCited: corpus.filter((c) => c.mentionsWika).length,
        transformerAndLegacy: corpus.filter((c) => c.mentionsTransformerLegacy).length,
        blueVsRedOcean: corpus.filter((c) => c.mentionsBlueOcean).length,
        bimAndDigitalConstruction: corpus.filter((c) => c.mentionsBIM).length,
        createTheFuture: corpus.filter((c) => c.mentionsCreateFuture).length,
        doTheBestMaxim: corpus.filter((c) => c.mentionsDoTheBest).length,
        jujurAmanahTriad: corpus.filter((c) => c.mentionsJujurAmanah).length,
      }
    : isBuckinghamSession
      ? {
          buckingham: corpus.filter((c) => c.mentionsBuckingham).length,
          mintoPyramid: corpus.filter((c) => c.mentionsMinto).length,
          scqaFramework: corpus.filter((c) => c.mentionsSCQA).length,
          meceRule: corpus.filter((c) => c.mentionsMECE).length,
          blufAnswerFirst: corpus.filter((c) => c.mentionsBLUF).length,
          ironTriangle: corpus.filter((c) => c.mentionsIronTriangle).length,
          druckerCultureStrategy: corpus.filter((c) => c.mentionsDruckerQuote).length,
          efficiencyVsEffectiveness: corpus.filter((c) => c.mentionsEfficiencyVsEffectiveness)
            .length,
          borobudurMetaphor: corpus.filter((c) => c.mentionsBorobudur).length,
          irwanMeilano: corpus.filter((c) => c.mentionsMeilano).length,
          riskFormula: corpus.filter((c) => c.mentionsRiskFormula).length,
          whyNationsFail: corpus.filter((c) => c.mentionsWhyNationsFail).length,
          twoMegatrends: corpus.filter((c) => c.mentionsTwoMegatrends).length,
          turkeyIllusion: corpus.filter((c) => c.mentionsTurkeyIllusion).length,
          vulnerabilityFastestLever: corpus.filter((c) => c.mentionsVulnerabilityLever).length,
          trustIsCapacity: corpus.filter((c) => c.mentionsTrustCapacity).length,
          fiveSimulationLessons: corpus.filter((c) => c.mentionsFiveSimulationLessons).length,
          riskControlPrinciple: corpus.filter((c) => c.mentionsRiskControlPrinciple).length,
          multiDimensionalInnovation: corpus.filter((c) => c.mentionsMultiDimensionalInnovation)
            .length,
        }
      : {
          triangleOfSuccess: corpus.filter((c) => c.mentionsTriangle).length,
          fiveC: corpus.filter((c) => c.mentions5C).length,
          threeS: corpus.filter((c) => c.mentions3S).length,
          threeV: corpus.filter((c) => c.mentions3V).length,
          jfkQuote: corpus.filter((c) => c.mentionsJFK).length,
          asymmetryRule: corpus.filter((c) => c.mentionsAsymmetry).length,
          spheresOfLife: corpus.filter((c) => c.mentionsSpheresOfLife).length,
          maturityDyad: corpus.filter((c) => c.mentionsMaturity).length,
          serviceMindset: corpus.filter((c) => c.mentionsService).length,
          listeningFirst: corpus.filter((c) => c.mentionsListening).length,
        }

  const summary = {
    totalFiles: corpus.length,
    mindIdFilesCount: mindIdCount,
    frequencies,
    corpus,
  }

  const summaryPath = path.join(extractedDir, "cohort-summary.json")
  await writeFile(summaryPath, JSON.stringify(summary, null, 2), "utf8")
  console.log(`Summary written to ${summaryPath}`)

  return summary
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const targetIdx = process.argv.indexOf("--target")
  let targetDir = null
  if (targetIdx !== -1 && process.argv[targetIdx + 1]) {
    targetDir = process.argv[targetIdx + 1]
  } else if (process.argv[2] && !process.argv[2].startsWith("-")) {
    targetDir = process.argv[2]
  }
  if (targetDir && !path.isAbsolute(targetDir)) {
    targetDir = path.resolve(repoRoot, targetDir)
  }
  runAggregation(targetDir).catch((err) => {
    console.error("Aggregation error:", err)
    process.exit(1)
  })
}
