import test from "node:test"
import assert from "node:assert/strict"
import {
  normalizeWeekFolderName,
  extractTextFromOfficeXml,
  scanBufferForSafetyAnomalies,
  parseTargetSpec,
  organizeInbox,
  prepTargetModule,
  auditTargetContent,
} from "./prep-raw.mjs"
import { mkdtemp, rm, writeFile, readdir, mkdir } from "node:fs/promises"
import os from "node:os"
import path from "node:path"

test("normalizeWeekFolderName normalizes messy week folder names to week-XX", () => {
  assert.equal(normalizeWeekFolderName("Week 1"), "week-01")
  assert.equal(normalizeWeekFolderName("Week 02"), "week-02")
  assert.equal(normalizeWeekFolderName("week 6"), "week-06")
  assert.equal(normalizeWeekFolderName("W12"), "week-12")
  assert.equal(normalizeWeekFolderName("Minggu 3"), "week-03")
  assert.equal(normalizeWeekFolderName("week-01"), "week-01")
  assert.equal(normalizeWeekFolderName("random-folder"), null)
})

test("extractTextFromOfficeXml extracts readable text from Word XML", () => {
  const sampleXml =
    "<w:document><w:body><w:p><w:r><w:t>Hello</w:t></w:r><w:r><w:t> Cohort</w:t></w:r></w:p><w:p><w:r><w:t>Syndicate 9 &amp; Maintainer</w:t></w:r></w:p></w:body></w:document>"
  const extracted = extractTextFromOfficeXml(sampleXml, "docx")
  assert.equal(extracted, "Hello Cohort\n\nSyndicate 9 & Maintainer")
})

test("scanBufferForSafetyAnomalies detects clean and anomalous payloads", () => {
  const cleanBuf = Buffer.from("Normal assignment instruction text for MBA cohort.", "utf8")
  const cleanRes = scanBufferForSafetyAnomalies(cleanBuf, "task.txt")
  assert.equal(cleanRes.status, "CLEAN")
  assert.equal(cleanRes.findings.length, 0)

  const pdfWithJs = Buffer.from("%PDF-1.7\n1 0 obj << /OpenAction /JavaScript >>", "utf8")
  const pdfRes = scanBufferForSafetyAnomalies(pdfWithJs, "case.pdf")
  assert.equal(pdfRes.status, "REVIEW")
  assert.ok(pdfRes.findings.length >= 1)
})

test("parseTargetSpec parses multiple course and week formats", () => {
  assert.deepEqual(parseTargetSpec("mk3 week 1"), {
    course: "mk3",
    week: "week-01",
    isRabuan: false,
    isCourseRoot: false,
  })
  assert.deepEqual(parseTargetSpec("mk 4 w6"), {
    course: "mk4",
    week: "week-06",
    isRabuan: false,
    isCourseRoot: false,
  })
  assert.deepEqual(parseTargetSpec("mk1/week-02"), {
    course: "mk1",
    week: "week-02",
    isRabuan: false,
    isCourseRoot: false,
  })
  assert.deepEqual(parseTargetSpec("mk2"), {
    course: "mk2",
    week: null,
    isRabuan: false,
    isCourseRoot: true,
  })
  assert.deepEqual(parseTargetSpec("rabuan"), {
    course: null,
    week: null,
    isRabuan: true,
    isCourseRoot: false,
  })
  assert.equal(parseTargetSpec("invalid-spec"), null)
})

test("organizeInbox moves files from inbox/ to archive/courses/mkX/week-YY", async () => {
  const tmpRepo = await mkdtemp(path.join(os.tmpdir(), "repo-inbox-test-"))
  try {
    const inbox = path.join(tmpRepo, "inbox")
    await mkdir(inbox, { recursive: true })
    await writeFile(path.join(inbox, "sample-slides.pdf"), "test slide binary")

    const res = await organizeInbox(tmpRepo, "mk3 week 1")
    assert.equal(res.moved.length, 1)

    const targetFiles = await readdir(path.join(tmpRepo, "archive", "courses", "mk3", "week-01"))
    assert.ok(targetFiles.includes("sample-slides.pdf"))

    const inboxFiles = await readdir(inbox)
    assert.equal(inboxFiles.length, 0)
  } finally {
    await rm(tmpRepo, { recursive: true, force: true })
  }
})

test("organizeInbox organizes course container folder with multiple weeks", async () => {
  const tmpRepo = await mkdtemp(path.join(os.tmpdir(), "repo-course-inbox-test-"))
  try {
    const inbox = path.join(tmpRepo, "inbox")
    const courseFolder = path.join(inbox, "MK 2 [PJ_Mey]")
    const w1 = path.join(courseFolder, "Week 1")
    const mid = path.join(courseFolder, "Mid")
    await mkdir(w1, { recursive: true })
    await mkdir(mid, { recursive: true })
    await writeFile(path.join(w1, "lecture.pdf"), "week 1 content")
    await writeFile(path.join(mid, "exam.pdf"), "mid exam content")

    const res = await organizeInbox(tmpRepo, "mk2")
    assert.equal(res.moved.length, 2)
    assert.equal(res.modules.length, 2)

    const w1Files = await readdir(path.join(tmpRepo, "archive", "courses", "mk2", "week-01"))
    assert.ok(w1Files.includes("lecture.pdf"))

    const midFiles = await readdir(path.join(tmpRepo, "archive", "courses", "mk2", "mid"))
    assert.ok(midFiles.includes("exam.pdf"))

    const inboxFiles = await readdir(inbox)
    assert.equal(inboxFiles.length, 0)
  } finally {
    await rm(tmpRepo, { recursive: true, force: true })
  }
})

test("prepTargetModule only inspects the targeted directory", async () => {
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), "target-module-test-"))
  try {
    const targetMod = path.join(tmpDir, "mk3-week-01")
    const unrelatedMod = path.join(tmpDir, "mk1-week-01")
    await mkdir(targetMod, { recursive: true })
    await mkdir(unrelatedMod, { recursive: true })

    await writeFile(path.join(targetMod, "lecture.txt"), "Sample lecture notes")
    await writeFile(path.join(unrelatedMod, "ignored.txt"), "Should never be touched")

    const result = await prepTargetModule(targetMod, "mk3/week-01")
    assert.equal(result.module, "mk3/week-01")
    assert.equal(result.safetyReports.length, 1)

    // Verify unrelated directory was not modified with .extracted/
    const unrelatedFiles = await readdir(unrelatedMod)
    assert.ok(!unrelatedFiles.includes(".extracted"))
  } finally {
    await rm(tmpDir, { recursive: true, force: true })
  }
})

test("auditTargetContent identifies existing notes and MOC status", async () => {
  const tmpRepo = await mkdtemp(path.join(os.tmpdir(), "target-audit-test-"))
  try {
    const courseDir = path.join(tmpRepo, "content", "courses", "mk3-marketing-management")
    const weekDir = path.join(courseDir, "week-01")
    await mkdir(weekDir, { recursive: true })

    const sampleMoc = `
## 🗺️ 14-Week Map of Content (MOC)

| Week | Module / Thematic Pillar | Topic & Core Focus | Note Hub |
| :---: | :--- | :--- | :--- |
| **Week 01** | Foundations | **Introduction to Marketing Strategy** | **Ingested** |
| **Week 02** | Foundations | **Analyzing the Marketing Environment** | _Scheduled (Pending Ingestion)_ |
`
    await writeFile(path.join(courseDir, "index.md"), sampleMoc)
    await writeFile(path.join(weekDir, "index.md"), "# Week 1 Notes")
    await writeFile(path.join(weekDir, "case-sample.md"), "# Case Sample")

    const audit = await auditTargetContent(tmpRepo, { course: "mk3", week: "week-01" })
    assert.ok(audit)
    assert.equal(audit.courseDir, "mk3-marketing-management")
    assert.equal(audit.dirExists, true)
    assert.equal(audit.hasIndex, true)
    assert.equal(audit.satellites.length, 1)
    assert.ok(audit.satellites.includes("case-sample.md"))
    assert.equal(audit.mocInfo.status, "Ingested")
    assert.equal(audit.mocInfo.topic, "Introduction to Marketing Strategy")

    const auditClean = await auditTargetContent(tmpRepo, { course: "mk3", week: "week-02" })
    assert.ok(auditClean)
    assert.equal(auditClean.dirExists, false)
    assert.equal(auditClean.mocInfo.status, "Scheduled (Pending Ingestion)")
  } finally {
    await rm(tmpRepo, { recursive: true, force: true })
  }
})
