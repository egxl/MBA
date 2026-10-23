#!/usr/bin/env node

import { readdir, readFile, writeFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import matter from "gray-matter"

export async function syncWikiHubs(contentDirUrl) {
  const synced = { concepts: [], entities: [] }

  // 1. Auto-register missing Concepts in content/concepts/index.md
  try {
    const conceptsDir = new URL("concepts/", contentDirUrl)
    const conceptIndexFile = new URL("index.md", conceptsDir)
    let conceptIndexContent = await readFile(conceptIndexFile, "utf-8")
    const conceptEntries = await readdir(conceptsDir, { withFileTypes: true })

    for (const entry of conceptEntries) {
      if (entry.isFile() && entry.name.endsWith(".md") && entry.name !== "index.md") {
        const slug = entry.name.replace(/\.md$/, "")
        const expectedPattern = new RegExp(
          `\\[\\[(?:concepts\\/)?${slug}(?:\\\\?\\|[^\\]]+)?\\]\\]`,
          "i",
        )
        if (!expectedPattern.test(conceptIndexContent)) {
          const rawFile = await readFile(new URL(entry.name, conceptsDir), "utf-8")
          const parsed = matter(rawFile)
          const title = parsed.data?.title || slug
          const courses = Array.isArray(parsed.data?.courses_covered)
            ? parsed.data.courses_covered.join(" & ")
            : "Cross-Curricular"
          const newRow = `| **[[concepts/${slug}\\|${title}]]** | ${courses} | Core analytical framework and strategic mechanism | \`✅ Live\` |`

          // Insert at the end of the Master Concept Navigation Roster table
          const tableMarker = "## 🏛️ Six Core Business Pillars"
          const idx = conceptIndexContent.indexOf(tableMarker)
          if (idx !== -1) {
            const before = conceptIndexContent.slice(0, idx).trimEnd()
            const after = conceptIndexContent.slice(idx)
            // Find the "---" separator right before the marker
            const lastSep = before.lastIndexOf("\n---")
            if (lastSep !== -1) {
              conceptIndexContent =
                before.slice(0, lastSep).trimEnd() + "\n" + newRow + "\n\n---\n\n" + after
              synced.concepts.push(slug)
            }
          }
        }
      }
    }

    if (synced.concepts.length > 0) {
      await writeFile(conceptIndexFile, conceptIndexContent, "utf-8")
    }
  } catch {
    // Ignore sync write errors during read-only checks
  }

  // 2. Auto-register missing Entities in content/entities/index.md
  try {
    const entitiesDir = new URL("entities/", contentDirUrl)
    const entityIndexFile = new URL("index.md", entitiesDir)
    let entityIndexContent = await readFile(entityIndexFile, "utf-8")
    const entityEntries = await readdir(entitiesDir, { withFileTypes: true })

    for (const entry of entityEntries) {
      if (entry.isFile() && entry.name.endsWith(".md") && entry.name !== "index.md") {
        const slug = entry.name.replace(/\.md$/, "")
        const expectedPattern = new RegExp(
          `\\[\\[(?:entities\\/)?${slug}(?:\\\\?\\|[^\\]]+)?\\]\\]`,
          "i",
        )
        if (!expectedPattern.test(entityIndexContent)) {
          const rawFile = await readFile(new URL(entry.name, entitiesDir), "utf-8")
          const parsed = matter(rawFile)
          const title = parsed.data?.title || slug
          const role = Array.isArray(parsed.data?.roles)
            ? parsed.data.roles[0]
            : "Curriculum Profile"
          const bullet = `- **[[entities/${slug}|${title}]]**: ${role}.`

          const navMarker = "## 🧭 Navigation & Cross-References"
          const idx = entityIndexContent.indexOf(navMarker)
          if (idx !== -1) {
            const before = entityIndexContent.slice(0, idx).trimEnd()
            const after = entityIndexContent.slice(idx)
            const lastSep = before.lastIndexOf("\n---")
            if (lastSep !== -1) {
              entityIndexContent =
                before.slice(0, lastSep).trimEnd() + "\n" + bullet + "\n\n---\n\n" + after
              synced.entities.push(slug)
            }
          }
        }
      }
    }

    if (synced.entities.length > 0) {
      await writeFile(entityIndexFile, entityIndexContent, "utf-8")
    }
  } catch {
    // Ignore sync write errors
  }

  return synced
}

export async function checkWikiIntegrity(contentDirUrl) {
  const errors = []

  // 1. Check Concepts Registration
  try {
    const conceptsDir = new URL("concepts/", contentDirUrl)
    const conceptIndexFile = new URL("index.md", conceptsDir)
    const conceptIndexContent = await readFile(conceptIndexFile, "utf-8")
    const conceptEntries = await readdir(conceptsDir, { withFileTypes: true })

    for (const entry of conceptEntries) {
      if (entry.isFile() && entry.name.endsWith(".md") && entry.name !== "index.md") {
        const slug = entry.name.replace(/\.md$/, "")
        const expectedPattern = new RegExp(
          `\\[\\[(?:concepts\\/)?${slug}(?:\\\\?\\|[^\\]]+)?\\]\\]`,
          "i",
        )
        if (!expectedPattern.test(conceptIndexContent)) {
          errors.push(`Concept "${entry.name}" is not registered in content/concepts/index.md`)
        }
      }
    }
  } catch (err) {
    errors.push(`Error checking concepts directory: ${err.message}`)
  }

  // 2. Check Entities Registration
  try {
    const entitiesDir = new URL("entities/", contentDirUrl)
    const entityIndexFile = new URL("index.md", entitiesDir)
    const entityIndexContent = await readFile(entityIndexFile, "utf-8")
    const entityEntries = await readdir(entitiesDir, { withFileTypes: true })

    for (const entry of entityEntries) {
      if (entry.isFile() && entry.name.endsWith(".md") && entry.name !== "index.md") {
        const slug = entry.name.replace(/\.md$/, "")
        const expectedPattern = new RegExp(
          `\\[\\[(?:entities\\/)?${slug}(?:\\\\?\\|[^\\]]+)?\\]\\]`,
          "i",
        )
        if (!expectedPattern.test(entityIndexContent)) {
          errors.push(`Entity "${entry.name}" is not registered in content/entities/index.md`)
        }
      }
    }
  } catch (err) {
    errors.push(`Error checking entities directory: ${err.message}`)
  }

  // 3. Check Rabuan Registration
  try {
    const rabuanDir = new URL("rabuan/", contentDirUrl)
    const rabuanIndexFile = new URL("index.md", rabuanDir)
    const rabuanIndexContent = await readFile(rabuanIndexFile, "utf-8")
    const rabuanEntries = await readdir(rabuanDir, { withFileTypes: true })

    for (const entry of rabuanEntries) {
      if (entry.isFile() && entry.name.endsWith(".md") && entry.name !== "index.md") {
        const slug = entry.name.replace(/\.md$/, "")
        const expectedPattern = new RegExp(
          `\\[\\[(?:rabuan\\/)?${slug}(?:\\\\?\\|[^\\]]+)?\\]\\]`,
          "i",
        )
        if (!expectedPattern.test(rabuanIndexContent)) {
          errors.push(`Rabuan session "${entry.name}" is not registered in content/rabuan/index.md`)
        }
      }
    }
  } catch (err) {
    errors.push(`Error checking rabuan directory: ${err.message}`)
  }

  // 4. Check Course Satellites Linked in Weekly Lecture Hubs
  try {
    const coursesDir = new URL("courses/", contentDirUrl)
    const courseDirs = await readdir(coursesDir, { withFileTypes: true })

    for (const course of courseDirs) {
      if (!course.isDirectory()) continue
      const coursePath = new URL(`${course.name}/`, coursesDir)
      const weekEntries = await readdir(coursePath, { withFileTypes: true })

      for (const week of weekEntries) {
        if (!week.isDirectory() || !week.name.startsWith("week-")) continue
        const weekPath = new URL(`${week.name}/`, coursePath)
        const weekFiles = await readdir(weekPath, { withFileTypes: true })

        const indexFile = weekFiles.find((f) => f.name === "index.md")
        if (!indexFile) continue

        const weekIndexContent = await readFile(new URL("index.md", weekPath), "utf-8")

        for (const file of weekFiles) {
          if (
            file.isFile() &&
            file.name.endsWith(".md") &&
            file.name !== "index.md" &&
            (file.name.startsWith("reading-") ||
              file.name.startsWith("case-") ||
              file.name.startsWith("assignment-") ||
              file.name.startsWith("diagnostic-") ||
              file.name.startsWith("quiz-"))
          ) {
            const slug = file.name.replace(/\.md$/, "")
            const expectedLinkPattern = new RegExp(`${slug}`, "i")
            if (!expectedLinkPattern.test(weekIndexContent)) {
              errors.push(
                `Satellite "${file.name}" in ${course.name}/${week.name} is not linked in its week's index.md`,
              )
            }
          }
        }
      }
    }
  } catch (err) {
    errors.push(`Error checking course satellites: ${err.message}`)
  }

  return errors
}

// CLI runner
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const contentDir = new URL("../content/", import.meta.url)
  if (process.argv.includes("--sync") || process.argv.includes("--fix")) {
    const synced = await syncWikiHubs(contentDir)
    if (synced.concepts.length > 0 || synced.entities.length > 0) {
      console.log(
        `[WIKI SYNC] Auto-registered ${synced.concepts.length} concept(s) and ${synced.entities.length} entity(s).`,
      )
    }
  }
  const errors = await checkWikiIntegrity(contentDir)

  if (errors.length > 0) {
    console.error(
      `\x1b[31m[WIKI CHECK FAILED]\x1b[0m Found ${errors.length} wiki integrity issue(s):`,
    )
    for (const err of errors) {
      console.error(`  - ${err}`)
    }
    process.exit(1)
  } else {
    console.log(
      `\x1b[32m[WIKI CHECK PASSED]\x1b[0m All concepts, entities, rabuan sessions, and satellites are properly registered.`,
    )
    process.exit(0)
  }
}
