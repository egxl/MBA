import test, { describe } from "node:test"
import assert from "node:assert"
import { FullSlug } from "./path"
import {
  buildAlternateAbsoluteUrl,
  buildPairedLocaleHref,
  getLocaleCode,
  shouldRedirectRootToId,
} from "./locale"

describe("locale utilities", () => {
  test("getLocaleCode normalizes Quartz locale strings", () => {
    assert.strictEqual(getLocaleCode("en-US"), "en")
    assert.strictEqual(getLocaleCode("en-GB"), "en")
    assert.strictEqual(getLocaleCode("id-ID"), "id")
    assert.strictEqual(getLocaleCode("id"), "id")
    assert.strictEqual(getLocaleCode(undefined), "en")
  })

  test("buildPairedLocaleHref builds relative EN -> ID URLs", () => {
    assert.strictEqual(buildPairedLocaleHref("index" as FullSlug, "en"), "./id/")
    assert.strictEqual(buildPairedLocaleHref("easter-egg" as FullSlug, "en"), "./id/easter-egg")
    assert.strictEqual(buildPairedLocaleHref("courses/index" as FullSlug, "en"), "../id/courses/")
    assert.strictEqual(
      buildPairedLocaleHref("courses/mk1/week-01/index" as FullSlug, "en"),
      "../../../id/courses/mk1/week-01/",
    )
    assert.strictEqual(
      buildPairedLocaleHref("courses/mk1/week-01/case-a" as FullSlug, "en"),
      "../../../id/courses/mk1/week-01/case-a",
    )
    assert.strictEqual(buildPairedLocaleHref("404" as FullSlug, "en"), "./id/")
  })

  test("buildPairedLocaleHref builds relative ID -> EN URLs", () => {
    assert.strictEqual(buildPairedLocaleHref("index" as FullSlug, "id"), "../")
    assert.strictEqual(buildPairedLocaleHref("easter-egg" as FullSlug, "id"), "../easter-egg")
    assert.strictEqual(buildPairedLocaleHref("courses/index" as FullSlug, "id"), "../../courses/")
    assert.strictEqual(
      buildPairedLocaleHref("courses/mk1/week-01/index" as FullSlug, "id"),
      "../../../../courses/mk1/week-01/",
    )
    assert.strictEqual(
      buildPairedLocaleHref("courses/mk1/week-01/case-a" as FullSlug, "id"),
      "../../../../courses/mk1/week-01/case-a",
    )
    assert.strictEqual(buildPairedLocaleHref("404" as FullSlug, "id"), "../")
  })

  test("buildAlternateAbsoluteUrl constructs hreflang URLs", () => {
    assert.strictEqual(
      buildAlternateAbsoluteUrl("portal.example.com", "index" as FullSlug, "en"),
      "https://portal.example.com/",
    )
    assert.strictEqual(
      buildAlternateAbsoluteUrl("portal.example.com", "index" as FullSlug, "id"),
      "https://portal.example.com/id/",
    )
    assert.strictEqual(
      buildAlternateAbsoluteUrl("portal.example.com", "courses/mk1/index" as FullSlug, "id"),
      "https://portal.example.com/id/courses/mk1/",
    )
    assert.strictEqual(
      buildAlternateAbsoluteUrl("portal.example.com", "courses/mk1/case-a" as FullSlug, "en"),
      "https://portal.example.com/courses/mk1/case-a",
    )
    assert.strictEqual(buildAlternateAbsoluteUrl(undefined, "index" as FullSlug, "en"), null)
  })

  test("shouldRedirectRootToId only redirects EN root when id is saved", () => {
    assert.strictEqual(shouldRedirectRootToId("index", "en", "id"), true)
    assert.strictEqual(shouldRedirectRootToId("index", "en", "en"), false)
    assert.strictEqual(shouldRedirectRootToId("index", "en", null), false)
    assert.strictEqual(shouldRedirectRootToId("index", "id", "id"), false)
    assert.strictEqual(shouldRedirectRootToId("courses/index", "en", "id"), false)
    assert.strictEqual(shouldRedirectRootToId("404", "en", "id"), false)
  })
})
