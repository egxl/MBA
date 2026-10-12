#!/usr/bin/env node

import { readdir, readFile } from "node:fs/promises"
import { fileURLToPath, pathToFileURL } from "node:url"
import matter from "gray-matter"

export function normalizeTitle(t) {
  if (!t) return ""
  return t
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ")
    .toLowerCase()
}

export async function findMarkdownFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const res = new URL(entry.name + (entry.isDirectory() ? "/" : ""), dir)
    if (entry.isDirectory()) {
      files.push(...(await findMarkdownFiles(res)))
    } else if (entry.name.endsWith(".md")) {
      files.push(res)
    }
  }
  return files
}

export function checkMarkdownContent(content, filename) {
  const errors = []
  const parsed = matter(content)
  const title = normalizeTitle(parsed.data?.title)
  if (!title) return errors

  const lines = content.split(/\r?\n/)
  let inFrontmatter = false
  let fmEnded = false
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (i === 0 && line === "---") {
      inFrontmatter = true
      continue
    }
    if (inFrontmatter && line === "---") {
      inFrontmatter = false
      fmEnded = true
      continue
    }
    if (fmEnded || !inFrontmatter) {
      if (line.startsWith("# ")) {
        const headingText = normalizeTitle(line.slice(2))
        if (headingText === title) {
          errors.push(
            `${filename}: body H1 "${line.slice(2).trim()}" duplicates frontmatter title "${parsed.data.title}"`,
          )
        }
      }
    }
  }
  return errors
}

export async function validateTitles(repoRoot) {
  const rootUrl =
    repoRoot instanceof URL
      ? repoRoot
      : pathToFileURL(repoRoot.endsWith("/") ? repoRoot : `${repoRoot}/`)
  const contentDir = new URL("content/", rootUrl)
  const mdFiles = await findMarkdownFiles(contentDir)
  const errors = []

  for (const fileUrl of mdFiles) {
    const relPath = fileURLToPath(fileUrl).replace(fileURLToPath(rootUrl), "").replace(/\\/g, "/")
    const content = await readFile(fileUrl, "utf8")
    const fileErrors = checkMarkdownContent(content, relPath)
    errors.push(...fileErrors)
  }

  return {
    filesChecked: mdFiles.length,
    errors,
  }
}

async function runCli() {
  const repoRoot = new URL("../", import.meta.url)
  const report = await validateTitles(repoRoot)

  if (report.errors.length > 0) {
    console.error(`Title validation failed (${report.errors.length} duplicate(s) found):`)
    for (const error of report.errors) console.error(`- ${error}`)
    process.exitCode = 1
    return
  }

  console.log(`Validated ${report.filesChecked} markdown files: 0 title duplicates found.`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await runCli()
}
