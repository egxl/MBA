import fs from "fs"
import path from "path"

function walk(dir) {
  const res = []
  for (const item of fs.readdirSync(dir)) {
    const p = path.join(dir, item)
    if (fs.statSync(p).isDirectory()) res.push(...walk(p))
    else if (p.endsWith(".md")) res.push(p)
  }
  return res
}

const UI_SUFFIX_RE =
  /\s+(?:PDF|Microsoft PowerPoint|Microsoft Word|Microsoft Excel|Google Docs|Google Slides|Google Sheets|Google Forms|Image|Video|Audio|Text|Unknown File)$/i

function normalizeName(name) {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(UI_SUFFIX_RE, "")
    .replace(/[_\u2013\u2014'’]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
}

function stripExt(name) {
  return name.replace(/\.(?:pdf|pptx?|docx?|xlsx?|txt|m4a|png|jpe?g|mp4)$/i, "").trim()
}

const mdFiles = walk("content/courses")
const citedMap = new Map()

const backtickRegex = /`((?:raw|archive)\/courses\/[^`]+)`/g
for (const mf of mdFiles) {
  const content = fs.readFileSync(mf, "utf-8")
  let match
  while ((match = backtickRegex.exec(content)) !== null) {
    const clean = match[1].replace(/[,\.]$/, "").trim()
    if (!citedMap.has(clean)) citedMap.set(clean, new Set())
    citedMap.get(clean).add(mf)
  }
}

// Parse classroom_links.csv
const csvContent = fs.readFileSync("gclass_scraping/output/classroom_links.csv", "utf-8")
const csvLines = csvContent.split("\n")
const directFiles = new Map() // normalized filename -> {file_name, url, link_type, course_name}
const directByStem = new Map()
const courseFolders = new Map()
const nestedDriveFolders = []

for (let i = 1; i < csvLines.length; i++) {
  const line = csvLines[i].trim()
  if (!line) continue
  const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
  if (parts.length < 12) continue
  const cname = parts[0].replace(/^"|"$/g, "").trim()
  const topic = parts[3].replace(/^"|"$/g, "").trim()
  const fname = parts[8].replace(/^"|"$/g, "").trim()
  const ltype = parts[9].replace(/^"|"$/g, "").trim()
  const url = parts[11].replace(/^"|"$/g, "").trim()

  if (ltype === "drive_folder" && url) {
    if (fname.startsWith("Open folder for")) {
      const lower = fname.toLowerCase()
      if (lower.includes("mk 6")) courseFolders.set("mk6", url)
      else if (lower.includes("mk 5")) courseFolders.set("mk5", url)
      else if (lower.includes("mk 4")) courseFolders.set("mk4", url)
      else if (lower.includes("mk 3")) courseFolders.set("mk3", url)
      else if (lower.includes("mk 1")) courseFolders.set("mk1", url)
      else if (lower.includes("mk 2")) courseFolders.set("mk2", url)
    } else {
      nestedDriveFolders.push({ cname, topic, fname, url })
    }
  } else if (
    fname &&
    url &&
    ltype !== "none" &&
    (url.includes("drive.google.com") || url.includes("docs.google.com"))
  ) {
    const norm = normalizeName(fname)
    const entry = { fname, url, ltype, cname }
    directFiles.set(norm, entry)
    directByStem.set(stripExt(norm), entry)
  }
}

console.log("Total unique backticked local file paths in content/courses:", citedMap.size)
console.log("Unique normalized Drive/Docs file attachments in Classroom:", directFiles.size)
console.log(
  "Course Drive Folders:",
  courseFolders.size,
  "| Nested Classwork Drive Folders:",
  nestedDriveFolders.length,
)

let exactCount = 0
let stemCount = 0
let unmatchedCount = 0
const matchedExamples = []
const unmatchedByCourse = {}

for (const [localPath] of citedMap.entries()) {
  const baseName = path.basename(localPath)
  const norm = normalizeName(baseName)
  const stem = stripExt(norm)
  const courseMatch = localPath.match(/(?:raw|archive)\/courses\/([^\/]+)/)
  const courseKey = courseMatch ? courseMatch[1].toLowerCase() : "unknown"

  if (directFiles.has(norm)) {
    exactCount++
    if (matchedExamples.length < 10)
      matchedExamples.push(`${baseName} -> ${directFiles.get(norm).url}`)
  } else if (directByStem.has(stem)) {
    stemCount++
    if (matchedExamples.length < 10)
      matchedExamples.push(`${baseName} ~> ${directByStem.get(stem).url}`)
  } else {
    unmatchedCount++
    if (!unmatchedByCourse[courseKey]) unmatchedByCourse[courseKey] = []
    unmatchedByCourse[courseKey].push(baseName)
  }
}

console.log("\n--- Audit Summary ---")
console.log(`Exact Normalized 1:1 Matches : ${exactCount}`)
console.log(`Stem (ext-stripped) Matches  : ${stemCount}`)
console.log(`Total Direct 1:1 File Links  : ${exactCount + stemCount} / ${citedMap.size}`)
console.log(`Unmatched (Folder/Submission): ${unmatchedCount} / ${citedMap.size}`)

console.log("\nSample 1:1 Matches:")
matchedExamples.forEach((m) => console.log("  +", m))

console.log("\nUnmatched Breakdown (Candidate for Course/Topic Drive Folder or Local Submission):")
for (const [c, files] of Object.entries(unmatchedByCourse)) {
  console.log(
    `\n### ${c.toUpperCase()} (${files.length}) -> ${courseFolders.get(c.slice(0, 3)) || "N/A"}`,
  )
  files.forEach((f) => console.log(`  - ${f}`))
}
