import test from "node:test"
import assert from "node:assert/strict"
import {
  classifySubmission,
  extractMetadata,
  KELOMPOK_TO_BUMN,
} from "./aggregate-immersion-submissions.mjs"

test("KELOMPOK_TO_BUMN maps all 40 syndicates across 10 BUMN hosts", () => {
  for (let k = 1; k <= 40; k++) {
    assert.ok(KELOMPOK_TO_BUMN[k], `Kelompok ${k} must be mapped`)
    assert.ok(KELOMPOK_TO_BUMN[k].slug, `Kelompok ${k} must have slug`)
    assert.ok(KELOMPOK_TO_BUMN[k].name, `Kelompok ${k} must have name`)
  }

  const slugs = new Set(Object.values(KELOMPOK_TO_BUMN).map((x) => x.slug))
  assert.equal(slugs.size, 10, "Must cover exactly 10 distinct BUMN slugs")
})

test("classifySubmission classifies correctly by syndicate number", () => {
  const sampleText = "Business Immersion\nNama: Chairil Huda\nKelompok: 32\nPerusahaan: PTPN IV"
  const result = classifySubmission(sampleText, "sample.pdf")
  assert.equal(result.slug, "pupuk-indonesia")
  assert.equal(result.matchType, "kelompok")
  assert.equal(result.kelompok, 32)
})

test("classifySubmission classifies correctly by keyword fallback", () => {
  const sampleText =
    "Business Immersion di fasilitas Muara Karang dengan pembangkit gas dan turbin uap"
  const result = classifySubmission(sampleText, "sample.pdf")
  assert.equal(result.slug, "pln-nusantara-power")
  assert.equal(result.matchType, "keyword")
})

test("extractMetadata parses serdik, name, and instansi", () => {
  const sampleText =
    "Business Immersion\nNama: Budi Santoso\nNo. Serdik: 123\nInstansi: PT Bukit Asam\nKelompok: 5"
  const meta = extractMetadata(sampleText, "123_Budi_G1E1_ALP1.pdf")
  assert.equal(meta.serdik, "123")
  assert.equal(meta.name, "Budi Santoso")
  assert.equal(meta.instansi, "PT Bukit Asam")
})
