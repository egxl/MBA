import assert from "node:assert/strict"
import { test } from "node:test"

import {
  buildCheckpointPlan,
  classifyBucket,
  classifySafetyRisk,
  formatPlanText,
  parsePorcelainLine,
  parsePorcelainOutput,
} from "./checkpoint-plan.mjs"

test("parsePorcelainLine parses modified, untracked, renamed, and quoted paths", () => {
  assert.deepEqual(parsePorcelainLine(" M content/index.md"), {
    status: "M",
    path: "content/index.md",
  })
  assert.deepEqual(parsePorcelainLine("?? content/rabuan/new-session.md"), {
    status: "??",
    path: "content/rabuan/new-session.md",
  })
  assert.deepEqual(parsePorcelainLine("R  old/name.md -> new/name.md"), {
    status: "R",
    path: "new/name.md",
    origPath: "old/name.md",
  })
  assert.deepEqual(parsePorcelainLine('?? "content/with spaces/file name.md"'), {
    status: "??",
    path: "content/with spaces/file name.md",
  })
})

test("classifySafetyRisk flags secrets, generated public output, staging dirs, and local hooks", () => {
  assert.equal(classifySafetyRisk(".env").blocked, true)
  assert.equal(classifySafetyRisk(".env.local").blocked, true)
  assert.equal(classifySafetyRisk(".env.example").blocked, false)
  assert.equal(classifySafetyRisk("public/index.html").blocked, true)
  assert.equal(classifySafetyRisk("raw/courses/deck.pdf").blocked, true)
  assert.equal(classifySafetyRisk("raw/README.md").blocked, false)
  assert.equal(classifySafetyRisk("inbox/notes.docx").blocked, true)
  assert.equal(classifySafetyRisk(".github/hooks/impeccable.json").blocked, true)
  assert.equal(classifySafetyRisk("content/rabuan/2026-07-03-session.md").blocked, false)
})

test("classifyBucket maps repository paths to expected logical buckets", () => {
  assert.equal(classifyBucket("package.json", "M"), "tooling-engine")
  assert.equal(classifyBucket("scripts/validate-mermaid.mjs", "M"), "tooling-engine")
  assert.equal(classifyBucket("quartz/plugins/transformers/ofm.ts", "M"), "tooling-engine")
  assert.equal(classifyBucket("quartz/components/styles/popover.scss", "M"), "ui-components")
  assert.equal(classifyBucket("quartz/styles/custom.scss", "M"), "ui-components")
  assert.equal(classifyBucket("AGENTS.md", "M"), "agent-protocols")
  assert.equal(classifyBucket(".agents/skills/checkpoint/SKILL.md", "??"), "agent-protocols")
  assert.equal(classifyBucket("content/program/resource-inventory.md", "??"), "program-docs")
  assert.equal(classifyBucket("content/rabuan/2026-06-22-kusworo.md", "??"), "rabuan-sessions")
  assert.equal(classifyBucket("content/concepts/crisis-leadership.md", "??"), "concepts-entities")
  assert.equal(classifyBucket("content/entities/kusworo.md", "??"), "concepts-entities")
  assert.equal(classifyBucket("content/courses/mk1/index.md", "M"), "curriculum-updates")
  assert.equal(classifyBucket("content/courses/mk1/week-10/index.md", "??"), "curriculum-new")
})

test("buildCheckpointPlan separates blocked entries and orders non-empty buckets", () => {
  const sampleStatus = [
    "?? content/courses/mk1/week-10/index.md",
    " M content/courses/mk1/index.md",
    "?? content/rabuan/2026-06-22-kusworo.md",
    "?? content/rabuan/2026-07-03-budhi.md",
    " M quartz/styles/custom.scss",
    " M package.json",
    "?? .env.production",
    "?? public/index.html",
  ].join("\n")

  const entries = parsePorcelainOutput(sampleStatus)
  const plan = buildCheckpointPlan(entries)

  assert.equal(plan.clean, false)
  assert.equal(plan.blocked.length, 2)
  assert.deepEqual(
    plan.buckets.map((b) => b.id),
    ["tooling-engine", "ui-components", "rabuan-sessions", "curriculum-updates", "curriculum-new"],
  )
  assert.deepEqual(plan.rabuanDatedSessions, ["2026-06-22-kusworo", "2026-07-03-budhi"])

  const text = formatPlanText(plan, "main")
  assert.match(text, /BLOCKED FILES/)
  assert.match(text, /Ordered Incremental Buckets \(5\)/)
  assert.match(text, /2 distinct Rabuan sessions detected/)
})

test("buildCheckpointPlan handles clean working tree", () => {
  const plan = buildCheckpointPlan([])
  assert.equal(plan.clean, true)
  assert.equal(plan.blocked.length, 0)
  assert.equal(plan.buckets.length, 0)
  assert.match(formatPlanText(plan, "main"), /clean — nothing to commit/)
})
