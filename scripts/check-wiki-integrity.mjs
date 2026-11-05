#!/usr/bin/env node

import { readdir, readFile, writeFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import matter from "gray-matter"
import { analyzeMarkdownPedagogy } from "./audit-pedagogy.mjs"

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
          `(?:\\[\\[(?:rabuan\\/)?${slug}(?:\\\\?\\|[^\\]]+)?\\]\\]|href="[^"]*${slug}[^"]*")`,
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

  // 5. Check Dead Concept and Entity Wikilinks across all content markdown files
  try {
    const conceptsDir = new URL("concepts/", contentDirUrl)
    const entitiesDir = new URL("entities/", contentDirUrl)
    const conceptEntries = await readdir(conceptsDir, { withFileTypes: true })
    const entityEntries = await readdir(entitiesDir, { withFileTypes: true })

    const conceptSlugs = new Set(
      conceptEntries
        .filter((e) => e.isFile() && e.name.endsWith(".md"))
        .map((e) => e.name.replace(/\.md$/, "")),
    )
    const entitySlugs = new Set(
      entityEntries
        .filter((e) => e.isFile() && e.name.endsWith(".md"))
        .map((e) => e.name.replace(/\.md$/, "")),
    )

    async function scanDirForDeadLinks(dirUrl) {
      const entries = await readdir(dirUrl, { withFileTypes: true })
      for (const entry of entries) {
        const entryUrl = new URL(`${entry.name}${entry.isDirectory() ? "/" : ""}`, dirUrl)
        if (entry.isDirectory()) {
          await scanDirForDeadLinks(entryUrl)
        } else if (entry.isFile() && entry.name.endsWith(".md")) {
          const content = await readFile(entryUrl, "utf-8")
          // Check concept links
          const conceptMatches = content.matchAll(/\[\[(?:content\/)?concepts\/([^\]|#\\]+)/g)
          for (const match of conceptMatches) {
            const slug = match[1].trim()
            if (slug !== "index" && !conceptSlugs.has(slug)) {
              errors.push(
                `Dead concept link in ${entryUrl.pathname}: "[[concepts/${slug}]]" does not exist in content/concepts/`,
              )
            }
          }
          // Check entity links
          const entityMatches = content.matchAll(/\[\[(?:content\/)?entities\/([^\]|#\\]+)/g)
          for (const match of entityMatches) {
            const slug = match[1].trim()
            if (slug !== "index" && !entitySlugs.has(slug)) {
              errors.push(
                `Dead entity link in ${entryUrl.pathname}: "[[entities/${slug}]]" does not exist in content/entities/`,
              )
            }
          }
        }
      }
    }

    await scanDirForDeadLinks(contentDirUrl)
  } catch (err) {
    errors.push(`Error checking dead wikilinks: ${err.message}`)
  }

  // 6. Anti-Sprawl Quality Floor: Check Concept Depth & Section Count
  try {
    const conceptsDir = new URL("concepts/", contentDirUrl)
    const conceptEntries = await readdir(conceptsDir, { withFileTypes: true })

    for (const entry of conceptEntries) {
      if (entry.isFile() && entry.name.endsWith(".md") && entry.name !== "index.md") {
        const rawContent = await readFile(new URL(entry.name, conceptsDir), "utf-8")
        const lineCount = rawContent.split("\n").length
        const h2Sections = (rawContent.match(/^##\s+/gm) || []).length

        if (lineCount < 45) {
          errors.push(
            `Concept "${entry.name}" fails anti-sprawl depth floor: ${lineCount} lines (minimum 45 lines required to prevent shallow stubs).`,
          )
        }
        if (h2Sections < 3) {
          errors.push(
            `Concept "${entry.name}" fails structural rigor gate: ${h2Sections} H2 section(s) (minimum 3 H2 sections required: Overview, Analytical Architecture/Formulation, Multi-Course Cross-Curricular Synthesis).`,
          )
        }
      }
    }
  } catch (err) {
    errors.push(`Error checking concept depth floor: ${err.message}`)
  }

  // 7. Anti-Starvation Check: Ensure Ingested Weekly Hubs Maintain Inline Concept Links
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
        try {
          const indexContent = await readFile(new URL("index.md", weekPath), "utf-8")
          // Only enforce on substantive ingested lecture hubs (> 80 lines)
          const lineCount = indexContent.split("\n").length
          if (lineCount >= 80) {
            const conceptMatches = [
              ...indexContent.matchAll(/\[\[(?:content\/)?concepts\/([^\]|#\\]+)/g),
            ]
              .map((m) => m[1].trim())
              .filter((s) => s !== "index")

            if (conceptMatches.length === 0) {
              errors.push(
                `Lecture hub ${course.name}/${week.name}/index.md fails anti-starvation check: 0 concept links found. Must integrate relevant analytical frameworks.`,
              )
            } else {
              // Check for inline weaving before the bottom Curriculum Bridges section
              const bridgeIdx = indexContent.indexOf("## 🔗")
              const bodyContent = bridgeIdx !== -1 ? indexContent.slice(0, bridgeIdx) : indexContent
              const inlineMatches = [
                ...bodyContent.matchAll(/\[\[(?:content\/)?concepts\/([^\]|#\\]+)/g),
              ]
                .map((m) => m[1].trim())
                .filter((s) => s !== "index")

              if (inlineMatches.length === 0) {
                errors.push(
                  `Lecture hub ${course.name}/${week.name}/index.md fails inline weaving check: concepts are only listed in the bottom bridge section. At least 1 concept must be linked inline within narrative sections.`,
                )
              }
            }
          }
        } catch {
          // No index.md in week folder yet
        }
      }
    }
  } catch (err) {
    errors.push(`Error checking lecture hub concept link density: ${err.message}`)
  }

  // 8. Anti-Stub & Placeholder Check across Course Notes
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

        for (const file of weekFiles) {
          if (!file.isFile() || !file.name.endsWith(".md")) continue
          const filePath = new URL(file.name, weekPath)
          const content = await readFile(filePath, "utf-8")
          const lineCount = content.split("\n").length

          if (lineCount < 30) {
            errors.push(
              `Stub detected in ${course.name}/${week.name}/${file.name}: only ${lineCount} lines. Stubs violate the Anti-Stub Mandate.`,
            )
          }

          if (/\b(?:lorem\s+ipsum|\[TBD\]|\[TODO\]|placeholder\s+content)\b/i.test(content)) {
            errors.push(
              `Placeholder token detected in ${course.name}/${week.name}/${file.name}. Remove or replace placeholder markers.`,
            )
          }

          // Check for corrupted frontmatter titles resulting from stripped links
          const pedagogyIssues = analyzeMarkdownPedagogy(
            content,
            `${course.name}/${week.name}/${file.name}`,
          )
          for (const issue of pedagogyIssues) {
            if (issue.type === "CORRUPTED_TITLE") {
              errors.push(
                `Corrupted frontmatter title in ${course.name}/${week.name}/${file.name}: ${issue.message}`,
              )
            }
          }
        }
      }
    }
  } catch (err) {
    errors.push(`Error checking for course stubs and placeholders: ${err.message}`)
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
      `\x1b[32m[WIKI CHECK PASSED]\x1b[0m All concepts, entities, rabuan sessions, satellites, concept depth floors, and inline link density verified.`,
    )
    process.exit(0)
  }
}
