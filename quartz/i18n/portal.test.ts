import test, { describe } from "node:test"
import assert from "node:assert/strict"
import { portalI18n } from "./portal"

describe("portalI18n", () => {
  test("returns English portal strings for en-US", () => {
    const en = portalI18n("en-US")
    assert.equal(en.nav.explore, "Explore")
    assert.equal(en.nav.courses, "Courses")
    assert.equal(en.courseSwitcher.weekPrefix, "Week")
    assert.equal(en.languageSwitcher.activeCode, "EN")
    assert.equal(en.tts.minAudio(4), "4 min audio")
  })

  test("returns Indonesian portal strings for id-ID", () => {
    const id = portalI18n("id-ID")
    assert.equal(id.nav.explore, "Jelajahi")
    assert.equal(id.nav.courses, "Mata Kuliah")
    assert.equal(id.courseSwitcher.weekPrefix, "Minggu")
    assert.equal(id.languageSwitcher.activeCode, "ID")
    assert.equal(id.tts.minAudio(4), "audio 4 mnt")
    assert.ok(id.translationNotice.message.includes("bahasa Inggris"))
  })

  test("falls back to English for other locales", () => {
    const fallback = portalI18n("fr-FR")
    assert.equal(fallback.nav.explore, "Explore")
  })
})
