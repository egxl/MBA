import test, { describe } from "node:test"
import assert from "node:assert"
import {
  isConceptUrl,
  clampSplitRatio,
  SplitHistoryManager,
  determineLinkInterception,
  InterceptParams,
  getSplitBadgeLabel,
  sanitizeInternalUrl,
  formatAsWikilink,
  shouldShowContextMenu,
  ContextMenuGuardParams,
} from "./splitview.helpers"

describe("Split View Helpers", () => {
  describe("isSplitTargetUrl / isConceptUrl", () => {
    test("identifies concept URLs correctly and excludes concept navigation hub", () => {
      assert.strictEqual(isConceptUrl(new URL("https://example.com/concepts/talent-density")), true)
      assert.strictEqual(isConceptUrl(new URL("https://example.com/concepts/")), false)
      assert.strictEqual(isConceptUrl(new URL("https://example.com/concepts")), false)
      assert.strictEqual(isConceptUrl(new URL("https://example.com/concepts/index")), false)
      assert.strictEqual(isConceptUrl(new URL("https://example.com/concepts/index.html")), false)
      assert.strictEqual(
        isConceptUrl(new URL("https://example.com/sub/concepts/compa-ratio#anchor")),
        true,
      )
    })

    test("identifies entity URLs correctly", () => {
      assert.strictEqual(
        isConceptUrl(new URL("https://example.com/entities/agus-dwi-handaya")),
        true,
      )
      assert.strictEqual(isConceptUrl(new URL("https://example.com/entities/")), true)
      assert.strictEqual(isConceptUrl(new URL("https://example.com/entities")), true)
      assert.strictEqual(
        isConceptUrl(new URL("https://example.com/sub/entities/pt-kereta-api-indonesia#anchor")),
        true,
      )
    })

    test("rejects non-concept, non-entity URLs", () => {
      assert.strictEqual(
        isConceptUrl(new URL("https://example.com/rabuan/2026-09-02-adh-peoplemath")),
        false,
      )
      assert.strictEqual(
        isConceptUrl(
          new URL("https://example.com/courses/mk1-organizational-behavior-managing-people/"),
        ),
        false,
      )
      assert.strictEqual(isConceptUrl(new URL("https://example.com/")), false)
      assert.strictEqual(isConceptUrl(new URL("https://example.com/program/governance")), false)
    })
  })

  describe("clampSplitRatio", () => {
    test("clamps within default range [25, 75]", () => {
      assert.strictEqual(clampSplitRatio(50), 50)
      assert.strictEqual(clampSplitRatio(10), 25)
      assert.strictEqual(clampSplitRatio(90), 75)
      assert.strictEqual(clampSplitRatio(25), 25)
      assert.strictEqual(clampSplitRatio(75), 75)
      assert.strictEqual(clampSplitRatio(NaN), 50)
    })
  })

  describe("SplitHistoryManager", () => {
    test("tracks push, back, and forward navigation", () => {
      const history = new SplitHistoryManager()

      assert.strictEqual(history.canGoBack(), false)
      assert.strictEqual(history.canGoForward(), false)
      assert.strictEqual(history.current(), null)

      history.push({ url: "https://example.com/concepts/a", title: "Concept A", scrollTop: 0 })
      assert.strictEqual(history.length, 1)
      assert.strictEqual(history.index, 0)
      assert.strictEqual(history.canGoBack(), false)
      assert.strictEqual(history.canGoForward(), false)
      assert.strictEqual(history.current()?.title, "Concept A")

      history.push({ url: "https://example.com/concepts/b", title: "Concept B", scrollTop: 100 })
      assert.strictEqual(history.length, 2)
      assert.strictEqual(history.index, 1)
      assert.strictEqual(history.canGoBack(), true)
      assert.strictEqual(history.canGoForward(), false)

      // Go back
      const prev = history.back()
      assert.strictEqual(prev?.title, "Concept A")
      assert.strictEqual(history.index, 0)
      assert.strictEqual(history.canGoBack(), false)
      assert.strictEqual(history.canGoForward(), true)

      // Push new entry while in history branch: drops forward history
      history.push({ url: "https://example.com/concepts/c", title: "Concept C", scrollTop: 0 })
      assert.strictEqual(history.length, 2)
      assert.strictEqual(history.index, 1)
      assert.strictEqual(history.canGoBack(), true)
      assert.strictEqual(history.canGoForward(), false)
      assert.strictEqual(history.current()?.title, "Concept C")

      // Update scroll on current
      history.updateCurrentScroll(250)
      assert.strictEqual(history.current()?.scrollTop, 250)

      // Clear
      history.clear()
      assert.strictEqual(history.length, 0)
      assert.strictEqual(history.index, -1)
      assert.strictEqual(history.current(), null)
    })
  })

  describe("determineLinkInterception", () => {
    const baseParams: InterceptParams = {
      targetHref: "/concepts/talent-density",
      targetOrigin: "http://localhost",
      currentOrigin: "http://localhost",
      currentSlug: "rabuan/2026-09-02-adh-peoplemath",
      isModifierKey: false,
      isPrimaryButton: true,
      windowWidth: 1024,
      isInsideSplitPane: false,
    }

    test("intercepts concept click on lecture page on desktop", () => {
      assert.strictEqual(determineLinkInterception(baseParams), "split-open")
    })

    test("ignores modifier keys (Ctrl, Cmd, etc.) to allow new tab", () => {
      assert.strictEqual(
        determineLinkInterception({ ...baseParams, isModifierKey: true }),
        "ignore",
      )
    })

    test("ignores non-primary button (middle click, right click)", () => {
      assert.strictEqual(
        determineLinkInterception({ ...baseParams, isPrimaryButton: false }),
        "ignore",
      )
    })

    test("ignores on mobile screens (width <= 800px)", () => {
      assert.strictEqual(determineLinkInterception({ ...baseParams, windowWidth: 800 }), "ignore")
      assert.strictEqual(determineLinkInterception({ ...baseParams, windowWidth: 375 }), "ignore")
    })

    test("ignores clicks on external origin", () => {
      assert.strictEqual(
        determineLinkInterception({
          ...baseParams,
          targetHref: "https://external.com/concepts/foo",
          targetOrigin: "https://external.com",
        }),
        "ignore",
      )
    })

    test("intercepts entity click on lecture page on desktop", () => {
      assert.strictEqual(
        determineLinkInterception({
          ...baseParams,
          targetHref: "/entities/agus-dwi-handaya",
        }),
        "split-open",
      )
    })

    test("ignores concept clicks when already on a concept page", () => {
      assert.strictEqual(
        determineLinkInterception({
          ...baseParams,
          currentSlug: "concepts/littles-law",
        }),
        "ignore",
      )
    })

    test("ignores entity clicks when already on an entity page", () => {
      assert.strictEqual(
        determineLinkInterception({
          ...baseParams,
          targetHref: "/entities/ric-roi",
          currentSlug: "entities/agus-dwi-handaya",
        }),
        "ignore",
      )
    })

    test("replaces split pane content when clicking concept inside split pane", () => {
      assert.strictEqual(
        determineLinkInterception({
          ...baseParams,
          isInsideSplitPane: true,
        }),
        "split-replace",
      )
    })

    test("replaces split pane content when clicking entity inside split pane", () => {
      assert.strictEqual(
        determineLinkInterception({
          ...baseParams,
          targetHref: "/entities/agus-dwi-handaya",
          isInsideSplitPane: true,
        }),
        "split-replace",
      )
    })

    test("navigates main window when clicking non-concept/non-entity link inside split pane", () => {
      assert.strictEqual(
        determineLinkInterception({
          ...baseParams,
          targetHref: "/rabuan/2026-09-02-adh-peoplemath",
          isInsideSplitPane: true,
        }),
        "pane-navigate-main",
      )
    })

    test("allows normal main-pane navigation when clicking concept navigation hub from main page", () => {
      assert.strictEqual(
        determineLinkInterception({
          ...baseParams,
          targetHref: "/concepts/",
        }),
        "ignore",
      )
      assert.strictEqual(
        determineLinkInterception({
          ...baseParams,
          targetHref: "/concepts",
        }),
        "ignore",
      )
    })

    test("navigates main window when clicking concept navigation hub link inside split pane", () => {
      assert.strictEqual(
        determineLinkInterception({
          ...baseParams,
          targetHref: "/concepts/",
          isInsideSplitPane: true,
        }),
        "pane-navigate-main",
      )
    })

    test("opens split view when clicking individual concept from concept navigation page", () => {
      assert.strictEqual(
        determineLinkInterception({
          ...baseParams,
          currentSlug: "concepts/index",
          targetHref: "/concepts/ikigai",
        }),
        "split-open",
      )
      assert.strictEqual(
        determineLinkInterception({
          ...baseParams,
          currentSlug: "concepts",
          targetHref: "/concepts/littles-law",
        }),
        "split-open",
      )
    })
  })

  describe("getSplitBadgeLabel", () => {
    test("categorizes concepts and concept indexes", () => {
      assert.strictEqual(
        getSplitBadgeLabel(new URL("https://example.com/concepts/talent-density")),
        "Concept",
      )
      assert.strictEqual(getSplitBadgeLabel(new URL("https://example.com/concepts/")), "Index")
      assert.strictEqual(getSplitBadgeLabel(new URL("https://example.com/concepts")), "Index")
      assert.strictEqual(getSplitBadgeLabel(new URL("https://example.com/concepts/index")), "Index")
    })

    test("categorizes entities and entity indexes", () => {
      assert.strictEqual(
        getSplitBadgeLabel(new URL("https://example.com/entities/agus-dwi-handaya")),
        "Entity",
      )
      assert.strictEqual(getSplitBadgeLabel(new URL("https://example.com/entities/")), "Index")
    })

    test("categorizes courses, cases, and assignments", () => {
      assert.strictEqual(
        getSplitBadgeLabel(
          new URL("https://example.com/courses/mk3-marketing-management/week-01/case-unilever"),
        ),
        "Case",
      )
      assert.strictEqual(
        getSplitBadgeLabel(
          new URL(
            "https://example.com/courses/mk4-operations-supply-chain-management/week-06/assignment-brief",
          ),
        ),
        "Assignment",
      )
      assert.strictEqual(
        getSplitBadgeLabel(
          new URL("https://example.com/courses/mk1-organizational-behavior-managing-people/"),
        ),
        "Course",
      )
    })

    test("categorizes rabuan and program pages", () => {
      assert.strictEqual(
        getSplitBadgeLabel(new URL("https://example.com/rabuan/2026-09-02-adh-peoplemath")),
        "Rabuan",
      )
      assert.strictEqual(
        getSplitBadgeLabel(new URL("https://example.com/program/alp/overview")),
        "ALP",
      )
      assert.strictEqual(
        getSplitBadgeLabel(new URL("https://example.com/program/governance")),
        "Program",
      )
    })

    test("falls back to Note for root or unknown pages", () => {
      assert.strictEqual(getSplitBadgeLabel(new URL("https://example.com/")), "Note")
      assert.strictEqual(getSplitBadgeLabel(new URL("https://example.com/about")), "Note")
    })
  })

  describe("sanitizeInternalUrl", () => {
    test("strips #split- prefix from hash", () => {
      const sanitized = sanitizeInternalUrl(
        "https://example.com/concepts/littles-law#split-key-formula",
        "https://example.com",
      )
      assert.strictEqual(sanitized.hash, "#key-formula")
      assert.strictEqual(
        sanitized.toString(),
        "https://example.com/concepts/littles-law#key-formula",
      )
    })

    test("strips #popover-internal- prefix from hash", () => {
      const sanitized = sanitizeInternalUrl(
        "https://example.com/courses/mk1/index#popover-internal-overview",
        "https://example.com",
      )
      assert.strictEqual(sanitized.hash, "#overview")
    })

    test("leaves standard anchor hash unchanged", () => {
      const sanitized = sanitizeInternalUrl(
        "https://example.com/rabuan/note#takeaways",
        "https://example.com",
      )
      assert.strictEqual(sanitized.hash, "#takeaways")
    })

    test("leaves hashless URL unchanged", () => {
      const sanitized = sanitizeInternalUrl(
        "https://example.com/concepts/talent-density",
        "https://example.com",
      )
      assert.strictEqual(sanitized.hash, "")
    })
  })

  describe("formatAsWikilink", () => {
    test("formats standard path and title into wikilink", () => {
      const url = new URL("https://example.com/concepts/talent-density")
      assert.strictEqual(
        formatAsWikilink(url, "Talent Density"),
        "[[concepts/talent-density|Talent Density]]",
      )
    })

    test("formats URL with anchor hash into wikilink", () => {
      const url = new URL("https://example.com/concepts/littles-law#formula")
      assert.strictEqual(
        formatAsWikilink(url, "Little's Law Formula"),
        "[[concepts/littles-law#formula|Little's Law Formula]]",
      )
    })

    test("falls back to slug when title is empty", () => {
      const url = new URL("https://example.com/entities/unilever")
      assert.strictEqual(formatAsWikilink(url), "[[entities/unilever|unilever]]")
    })
  })

  describe("shouldShowContextMenu", () => {
    const baseGuard: ContextMenuGuardParams = {
      isShiftKey: false,
      windowWidth: 1024,
      isCoarsePointer: false,
      targetOrigin: "https://example.com",
      currentOrigin: "https://example.com",
      isAnchor: true,
      isRepeatOnSameAnchor: false,
    }

    test("allows context menu on standard desktop internal link right click", () => {
      assert.strictEqual(shouldShowContextMenu(baseGuard), true)
    })

    test("passes through to native menu when Shift key is pressed", () => {
      assert.strictEqual(shouldShowContextMenu({ ...baseGuard, isShiftKey: true }), false)
    })

    test("passes through on mobile width (<=800px)", () => {
      assert.strictEqual(shouldShowContextMenu({ ...baseGuard, windowWidth: 800 }), false)
      assert.strictEqual(shouldShowContextMenu({ ...baseGuard, windowWidth: 390 }), false)
    })

    test("passes through on touch device (coarse pointer)", () => {
      assert.strictEqual(shouldShowContextMenu({ ...baseGuard, isCoarsePointer: true }), false)
    })

    test("passes through if target is not an anchor", () => {
      assert.strictEqual(shouldShowContextMenu({ ...baseGuard, isAnchor: false }), false)
    })

    test("passes through on second right-click on active anchor", () => {
      assert.strictEqual(shouldShowContextMenu({ ...baseGuard, isRepeatOnSameAnchor: true }), false)
    })

    test("passes through on external links", () => {
      assert.strictEqual(
        shouldShowContextMenu({ ...baseGuard, targetOrigin: "https://google.com" }),
        false,
      )
    })
  })
})
