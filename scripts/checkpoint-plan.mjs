#!/usr/bin/env node

import { execFileSync } from "node:child_process"
import { pathToFileURL } from "node:url"

export const BUCKET_DEFINITIONS = [
  {
    id: "tooling-engine",
    title: "Tooling, Scripts & Build Engine",
    suggestedType: "feat(tooling)",
  },
  {
    id: "ui-components",
    title: "UI Components, Layout & Styles",
    suggestedType: "feat(ui)",
  },
  {
    id: "agent-protocols",
    title: "Agent Guidelines, Skills & Protocols",
    suggestedType: "docs(protocols)",
  },
  {
    id: "program-docs",
    title: "Program Docs & Portal Home",
    suggestedType: "feat(program)",
  },
  {
    id: "rabuan-sessions",
    title: "Kuliah Rabuan & Plenary Sessions",
    suggestedType: "feat(rabuan)",
  },
  {
    id: "concepts-entities",
    title: "Concepts & Entity Profiles",
    suggestedType: "feat(concepts)",
  },
  {
    id: "curriculum-updates",
    title: "Course MOC & Existing Curriculum Updates",
    suggestedType: "feat(curriculum)",
  },
  {
    id: "curriculum-new",
    title: "New Course Modules & Satellites",
    suggestedType: "feat(curriculum)",
  },
  {
    id: "other",
    title: "Other Changes",
    suggestedType: "chore",
  },
]

const BUCKET_MAP = new Map(BUCKET_DEFINITIONS.map((b) => [b.id, b]))

function normalizePath(filePath) {
  return filePath.replace(/\\/g, "/").replace(/^\.\//, "")
}

function unquoteGitPath(rawPath) {
  const trimmed = rawPath.trim()
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\")
  }
  return trimmed
}

/**
 * Parse one line of `git status --porcelain=v1 -uall`.
 */
export function parsePorcelainLine(line) {
  if (!line || line.length < 4) return null
  const status = line.slice(0, 2)
  const rawBody = line.slice(3)

  // Renames / copies appear as: `R  old/path -> new/path`
  const renameSep = " -> "
  if (status.includes("R") || status.includes("C")) {
    const idx = rawBody.indexOf(renameSep)
    if (idx !== -1) {
      const origPath = normalizePath(unquoteGitPath(rawBody.slice(0, idx)))
      const newPath = normalizePath(unquoteGitPath(rawBody.slice(idx + renameSep.length)))
      return { status: status.trim() || status, path: newPath, origPath }
    }
  }

  return {
    status: status.trim() || status,
    path: normalizePath(unquoteGitPath(rawBody)),
  }
}

export function parsePorcelainOutput(output) {
  return output
    .split(/\r?\n/)
    .map(parsePorcelainLine)
    .filter((entry) => entry !== null)
}

/**
 * Flag files that must never be committed by accident.
 */
export function classifySafetyRisk(filePath) {
  const p = normalizePath(filePath)
  const base = p.split("/").pop() ?? ""

  if (/^\.env($|\.)/i.test(base) && !/^\.env\.(example|sample|template)$/i.test(base)) {
    return { blocked: true, reason: "Environment/secret file (.env)" }
  }
  if (/\.(pem|key|p12|pfx)$/i.test(base) || /^(credentials|token)\.json$/i.test(base)) {
    return { blocked: true, reason: "Credential or private key artifact" }
  }
  if (p === "public" || p.startsWith("public/")) {
    return { blocked: true, reason: "Generated build output (public/)" }
  }
  if (p.startsWith("raw/") && p !== "raw/README.md") {
    return { blocked: true, reason: "Raw staging input (raw/)" }
  }
  if (p.startsWith("inbox/") && p !== "inbox/README.md") {
    return { blocked: true, reason: "Inbox staging input (inbox/)" }
  }
  if (p.startsWith("archive/") && p !== "archive/README.md") {
    return { blocked: true, reason: "Archive binary/source file (archive/)" }
  }
  if (p.startsWith("private/")) {
    return { blocked: true, reason: "Private directory content (private/)" }
  }
  if (p === ".github/hooks" || p.startsWith(".github/hooks/")) {
    return { blocked: true, reason: "Machine-local hook config (.github/hooks/)" }
  }
  return { blocked: false }
}

/**
 * Assign a safe repository path + git status into a logical incremental commit bucket.
 */
export function classifyBucket(filePath, status = "M") {
  const p = normalizePath(filePath)

  if (
    p === "package.json" ||
    p === "package-lock.json" ||
    p === ".gitignore" ||
    p === "tsconfig.json" ||
    p.startsWith(".prettier") ||
    p.startsWith(".github/workflows/") ||
    p.startsWith("scripts/") ||
    p === "quartz/build.ts" ||
    p.startsWith("quartz/plugins/") ||
    p.startsWith("quartz/util/") ||
    p.startsWith("quartz/processors/") ||
    p.startsWith("quartz/bootstrap")
  ) {
    return "tooling-engine"
  }

  if (
    p === "quartz.config.ts" ||
    p === "quartz.layout.ts" ||
    p.startsWith("quartz/components/") ||
    p.startsWith("quartz/styles/") ||
    p.startsWith("quartz/static/") ||
    p.startsWith("content/assets/")
  ) {
    return "ui-components"
  }

  if (p === "AGENTS.md" || p === "GEMINI.md" || p.startsWith(".agents/")) {
    return "agent-protocols"
  }

  if (
    p.startsWith("content/program/") ||
    p === "content/index.md" ||
    p === "content/easter-egg.md"
  ) {
    return "program-docs"
  }

  if (p.startsWith("content/rabuan/")) {
    return "rabuan-sessions"
  }

  if (p.startsWith("content/concepts/") || p.startsWith("content/entities/")) {
    return "concepts-entities"
  }

  if (p.startsWith("content/courses/")) {
    const isNew = status === "??" || status === "A"
    return isNew ? "curriculum-new" : "curriculum-updates"
  }

  return "other"
}

export function buildCheckpointPlan(entries) {
  const blocked = []
  const grouped = new Map(BUCKET_DEFINITIONS.map((b) => [b.id, []]))
  const rabuanDatedSessions = new Set()

  for (const entry of entries) {
    const risk = classifySafetyRisk(entry.path)
    if (risk.blocked) {
      blocked.push({ ...entry, reason: risk.reason })
      continue
    }

    const bucketId = classifyBucket(entry.path, entry.status)
    grouped.get(bucketId).push(entry)

    if (bucketId === "rabuan-sessions") {
      const match = entry.path.match(/^content\/rabuan\/(\d{4}-\d{2}-\d{2}-[^/]+)\.md$/)
      if (match) rabuanDatedSessions.add(match[1])
    }
  }

  const buckets = []
  for (const def of BUCKET_DEFINITIONS) {
    const files = grouped.get(def.id)
    if (files.length > 0) {
      buckets.push({
        id: def.id,
        title: def.title,
        suggestedType: def.suggestedType,
        files,
      })
    }
  }

  return {
    clean: entries.length === 0,
    totalFiles: entries.length,
    blocked,
    buckets,
    rabuanDatedSessions: [...rabuanDatedSessions].sort(),
  }
}

export function formatPlanText(plan, branch = "HEAD") {
  const lines = []
  lines.push(`# Checkpoint Plan (branch: ${branch})`)

  if (plan.clean) {
    lines.push("Working tree is clean — nothing to commit.")
    return lines.join("\n")
  }

  lines.push(`Total changed/untracked files: ${plan.totalFiles}`)

  if (plan.blocked.length > 0) {
    lines.push("")
    lines.push("## BLOCKED FILES (must resolve or ignore before staging)")
    for (const item of plan.blocked) {
      lines.push(`- [${item.status}] ${item.path} -> ${item.reason}`)
    }
  }

  if (plan.buckets.length > 0) {
    lines.push("")
    lines.push(`## Ordered Incremental Buckets (${plan.buckets.length})`)
    plan.buckets.forEach((bucket, idx) => {
      lines.push(
        `\n### ${idx + 1}. ${bucket.title} (\`${bucket.id}\`, ${bucket.files.length} file(s))`,
      )
      lines.push(`Suggested prefix: \`${bucket.suggestedType}: ...\``)
      for (const f of bucket.files) {
        const renameNote = f.origPath ? ` (from ${f.origPath})` : ""
        lines.push(`- [${f.status}] ${f.path}${renameNote}`)
      }
    })
  }

  if (plan.rabuanDatedSessions.length > 1) {
    lines.push("")
    lines.push(
      `Note: ${plan.rabuanDatedSessions.length} distinct Rabuan sessions detected (${plan.rabuanDatedSessions.join(", ")}). Split per session paired with its linked concepts/entities.`,
    )
  }

  return lines.join("\n")
}

function main() {
  const args = new Set(process.argv.slice(2))
  const cwd = process.cwd()
  const branch =
    execFileSync("git", ["branch", "--show-current"], { cwd, encoding: "utf8" }).trim() || "HEAD"
  const rawStatus = execFileSync("git", ["status", "--porcelain=v1", "-uall"], {
    cwd,
    encoding: "utf8",
  })

  const entries = parsePorcelainOutput(rawStatus)
  const plan = buildCheckpointPlan(entries)

  if (args.has("--json")) {
    console.log(JSON.stringify({ branch, ...plan }, null, 2))
  } else {
    console.log(formatPlanText(plan, branch))
  }

  if (plan.blocked.length > 0) {
    process.exitCode = 2
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
