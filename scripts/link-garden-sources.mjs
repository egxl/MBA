#!/usr/bin/env node

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const UI_SUFFIX_RE =
  /\s+(?:PDF|Microsoft PowerPoint|Microsoft Word|Microsoft Excel|Google Docs|Google Slides|Google Sheets|Google Forms|Image|Video|Audio|Text|Unknown File)$/i

export function normalizeName(name) {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(UI_SUFFIX_RE, "")
    .replace(/[_\u2013\u2014'’]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
}

export function stripExt(name) {
  return name.replace(/\.(?:pdf|pptx?|docx?|xlsx?|txt|m4a|png|jpe?g|mp4)$/i, "").trim()
}

export function buildDriveLookup(csvContent) {
  const directFiles = new Map()
  const directByStem = new Map()
  const lines = csvContent.split(/\r?\n/)

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
    if (parts.length < 12) continue

    const fname = parts[8].replace(/^"|"$/g, "").trim()
    const ltype = parts[9].replace(/^"|"$/g, "").trim()
    const url = parts[11].replace(/^"|"$/g, "").trim()

    if (
      ltype === "drive_folder" ||
      ltype === "none" ||
      !fname ||
      !url ||
      (!url.includes("drive.google.com") && !url.includes("docs.google.com"))
    ) {
      continue
    }

    const norm = normalizeName(fname)
    if (!directFiles.has(norm)) directFiles.set(norm, url)
    const stem = stripExt(norm)
    if (stem && !directByStem.has(stem)) directByStem.set(stem, url)
  }

  return { directFiles, directByStem }
}

export function replaceLocalSourcePaths(content, lookup) {
  let replacedCount = 0
  // Match single-line backticked local paths; avoid crossing newlines or table pipes.
  const backtickPathRe = /`((?:raw|archive)\/courses\/[^`\r\n|]+)`/g

  const updated = content.replace(backtickPathRe, (fullMatch, localPath) => {
    const clean = localPath.replace(/[,\.]$/, "").trim()
    const baseName = path.posix.basename(clean)
    const norm = normalizeName(baseName)
    const url = lookup.directFiles.get(norm) || lookup.directByStem.get(stripExt(norm))
    if (!url) return fullMatch
    replacedCount++
    return `[\`${baseName}\`](${url})`
  })

  return { content: updated, replacedCount }
}

function walkMarkdown(dir) {
  const results = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) results.push(...walkMarkdown(full))
    else if (entry.isFile() && entry.name.endsWith(".md")) results.push(full)
  }
  return results
}

function main() {
  const csvPath = path.resolve("gclass_scraping/output/classroom_links.csv")
  const csvContent = fs.readFileSync(csvPath, "utf-8")
  const lookup = buildDriveLookup(csvContent)
  const files = walkMarkdown(path.resolve("content/courses"))

  let filesUpdated = 0
  let totalReplacements = 0

  for (const file of files) {
    const original = fs.readFileSync(file, "utf-8")
    const { content, replacedCount } = replaceLocalSourcePaths(original, lookup)
    if (replacedCount > 0 && content !== original) {
      fs.writeFileSync(file, content, "utf-8")
      filesUpdated++
      totalReplacements += replacedCount
    }
  }

  console.log(
    `[link-garden-sources] Updated ${filesUpdated} markdown file(s) with ${totalReplacements} direct Google Drive link(s).`,
  )
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main()
}
