import test, { describe } from "node:test"
import assert from "node:assert"
import {
  applyLanguagePreference,
  buildTargetHrefWithHash,
  LANG_STORAGE_KEY,
  resolveRootRedirectTarget,
} from "./languageswitcher.helpers"

describe("language switcher helpers", () => {
  test("buildTargetHrefWithHash preserves URL hash without duplicating", () => {
    assert.strictEqual(buildTargetHrefWithHash("./id/", "#core-pillars"), "./id/#core-pillars")
    assert.strictEqual(buildTargetHrefWithHash("./id/", ""), "./id/")
    assert.strictEqual(
      buildTargetHrefWithHash("../../courses/#existing", "#new"),
      "../../courses/#existing",
    )
  })

  test("resolveRootRedirectTarget redirects only when meta content exists and savedLang is id", () => {
    assert.strictEqual(
      resolveRootRedirectTarget("./id/", "id", "?q=test", "#sec"),
      "./id/?q=test#sec",
    )
    assert.strictEqual(resolveRootRedirectTarget("./id/", "en", "", ""), null)
    assert.strictEqual(resolveRootRedirectTarget("./id/", null, "", ""), null)
    assert.strictEqual(resolveRootRedirectTarget(null, "id", "", "#sec"), null)
  })

  test("applyLanguagePreference stores valid target languages", () => {
    const store = new Map<string, string>()
    const mockStorage = {
      setItem: (k: string, v: string) => store.set(k, v),
    }

    applyLanguagePreference(mockStorage, "id")
    assert.strictEqual(store.get(LANG_STORAGE_KEY), "id")

    applyLanguagePreference(mockStorage, "en")
    assert.strictEqual(store.get(LANG_STORAGE_KEY), "en")

    applyLanguagePreference(mockStorage, "fr")
    assert.strictEqual(store.get(LANG_STORAGE_KEY), "en")
  })
})
