import test from "node:test"
import assert from "node:assert/strict"
import {
  normalizeWeekFolderName,
  extractTextFromOfficeXml,
  scanBufferForSafetyAnomalies,
} from "./prep-raw.mjs"

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
