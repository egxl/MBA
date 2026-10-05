import assert from "node:assert/strict"
import { test } from "node:test"

import {
  renderReviewHtml,
  validateCompanionAssets,
  validateSvgSource,
} from "./companion-assets.mjs"

const approvedPalette = ["#172536", "#f5eddc", "#a9c9e8", "#e0a243", "#bd6847"]

const validSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150" fill="none">
  <g stroke="#172536" stroke-width="3"><path d="M1 1h10" fill="#f5eddc" /></g>
</svg>`

test("validateSvgSource accepts the approved production contract", () => {
  assert.deepEqual(validateSvgSource(validSvg, "valid.svg", approvedPalette), [])
})

test("validateSvgSource rejects unsafe and nonportable SVG features", () => {
  const unsafe = `<svg viewBox="0 0 200 150"><script>alert(1)</script><image href="https://example.com/a.png" /></svg>`
  const errors = validateSvgSource(unsafe, "unsafe.svg", approvedPalette)

  assert.ok(errors.some((error) => error.includes("xmlns")))
  assert.ok(errors.some((error) => error.includes("script")))
  assert.ok(errors.some((error) => error.includes("external")))
})

test("validateSvgSource rejects off-grammar colors and conflicting ids", () => {
  const offGrammar = validSvg.replace("#f5eddc", "#ffffff").replace("<path", '<path id="body"')
  const errors = validateSvgSource(offGrammar, "off-grammar.svg", approvedPalette)

  assert.ok(errors.some((error) => error.includes("#ffffff")))
  assert.ok(errors.some((error) => error.includes("id attributes")))
})

test("validateSvgSource rejects stroke weights outside the shared family grammar", () => {
  const heavyStroke = validSvg.replace('stroke-width="3"', 'stroke-width="8"')
  const errors = validateSvgSource(heavyStroke, "heavy.svg", approvedPalette)

  assert.ok(errors.some((error) => error.includes('stroke-width="8"')))
})

test("validateCompanionAssets verifies the checked-in family and homepage references", async () => {
  const report = await validateCompanionAssets(new URL("../", import.meta.url))

  assert.equal(report.assets.length, 8)
  assert.deepEqual(report.errors, [])
  assert.deepEqual(
    report.assets.map((asset) => asset.id),
    ["mk1", "mk2", "mk3", "mk4", "mk5", "mk6", "peoplemath", "alp"],
  )
})

test("renderReviewHtml builds a review board from manifest data rather than duplicated SVG paths", () => {
  const html = renderReviewHtml([
    {
      id: "mk1",
      title: "The People & Teams",
      code: "MK 001",
      companion: "The Convenors",
      action: "Coordination",
      meaning: "Stabilize together.",
      file: "people-teams-convenors.svg",
      background: "#3f73ba",
    },
  ])

  assert.match(html, /Fieldwork Companions — Generated Review/)
  assert.match(html, /assets\/characters\/people-teams-convenors\.svg/)
  assert.match(html, /class="preview mono"/)
  assert.doesNotMatch(html, /<path\b/)
})
