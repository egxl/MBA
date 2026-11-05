import fs from "fs"
import path from "path"

function walk(dir) {
  let res = []
  for (const item of fs.readdirSync(dir)) {
    const p = path.join(dir, item)
    if (fs.statSync(p).isDirectory()) res.push(...walk(p))
    else if (p.endsWith(".md")) res.push(p)
  }
  return res
}

const mdFiles = walk("content/courses")
const citedMap = new Map()

const regex = /(?:raw|archive)\/courses\/[^`"'\)\n\r]+/g
for (const mf of mdFiles) {
  const content = fs.readFileSync(mf, "utf-8")
  const matches = content.match(regex) || []
  for (const m of matches) {
    const clean = m.replace(/[,\.]$/, "").trim()
    if (!citedMap.has(clean)) citedMap.set(clean, new Set())
    citedMap.get(clean).add(mf)
  }
}

console.log("Total unique local file paths cited in content/courses:", citedMap.size)

// Read scraped classroom_links.csv
const csvContent = fs.readFileSync("gclass_scraping/output/classroom_links.csv", "utf-8")
const csvLines = csvContent.split("\n")
const directFiles = new Map()
const courseFolders = new Map()

for (let i = 1; i < csvLines.length; i++) {
  const line = csvLines[i].trim()
  if (!line) continue
  // Simple CSV split (handling commas inside quotes if any)
  const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
  if (parts.length < 12) continue
  const cname = parts[0].replace(/^"|"$/g, "").trim()
  const fname = parts[8].replace(/^"|"$/g, "").trim()
  const ltype = parts[9].replace(/^"|"$/g, "").trim()
  const url = parts[11].replace(/^"|"$/g, "").trim()

  if (ltype === "drive_folder" && url) {
    // Check which MK course this folder belongs to
    const lower = fname.toLowerCase()
    if (lower.includes("mk 6") || lower.includes("business analytics"))
      courseFolders.set("mk6", url)
    else if (lower.includes("mk 5") || lower.includes("decision making"))
      courseFolders.set("mk5", url)
    else if (lower.includes("mk 4") || lower.includes("operations")) courseFolders.set("mk4", url)
    else if (lower.includes("mk 3") || lower.includes("marketing")) courseFolders.set("mk3", url)
    else if (lower.includes("mk 1") || lower.includes("organizational"))
      courseFolders.set("mk1", url)
    else if (lower.includes("mk 2") || lower.includes("financial")) courseFolders.set("mk2", url)
  } else if (fname && url && ltype !== "none") {
    directFiles.set(fname.toLowerCase(), url)
  }
}

console.log("\n--- Discovered Course Google Drive Folders ---")
for (const [k, v] of courseFolders.entries()) {
  console.log(`• ${k.toUpperCase()}: ${v}`)
}

let directCount = 0
let folderFallbackCount = 0
const unmatchedByCourse = {}

for (const [localPath, mds] of citedMap.entries()) {
  const baseName = path.basename(localPath)
  const baseLower = baseName.toLowerCase()
  const courseMatch = localPath.match(/(?:raw|archive)\/courses\/([^\/]+)/)
  const courseKey = courseMatch ? courseMatch[1].toLowerCase() : "unknown"

  if (directFiles.has(baseLower)) {
    directCount++
  } else {
    folderFallbackCount++
    if (!unmatchedByCourse[courseKey]) unmatchedByCourse[courseKey] = []
    unmatchedByCourse[courseKey].push(baseName)
  }
}

console.log("\n--- Audit Summary ---")
console.log(`Total Cited Local Files: ${citedMap.size}`)
console.log(`Direct 1:1 Google Drive File Matches: ${directCount}`)
console.log(`Files Without Direct Links (In Course Drive Folder): ${folderFallbackCount}`)

console.log("\n--- Detailed Breakdown of Files Located Inside Course Drive Folders ---")
for (const [c, files] of Object.entries(unmatchedByCourse)) {
  console.log(
    `\n### ${c.toUpperCase()} (${files.length} files) -> Folder: ${courseFolders.get(c.slice(0, 3)) || "General Classroom Drive"}`,
  )
  files.forEach((f) => console.log(`  - ${f}`))
}
