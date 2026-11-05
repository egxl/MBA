export interface SplitHistoryEntry {
  url: string
  title: string
  scrollTop: number
  htmlContent?: string
}

export class SplitHistoryManager {
  private entries: SplitHistoryEntry[] = []
  private currentIndex = -1

  get length(): number {
    return this.entries.length
  }

  get index(): number {
    return this.currentIndex
  }

  canGoBack(): boolean {
    return this.currentIndex > 0
  }

  canGoForward(): boolean {
    return this.currentIndex >= 0 && this.currentIndex < this.entries.length - 1
  }

  current(): SplitHistoryEntry | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.entries.length) {
      return this.entries[this.currentIndex]
    }
    return null
  }

  updateCurrentScroll(scrollTop: number) {
    if (this.currentIndex >= 0 && this.currentIndex < this.entries.length) {
      this.entries[this.currentIndex].scrollTop = scrollTop
    }
  }

  push(entry: SplitHistoryEntry) {
    // If we navigated back and then load a new page, drop forward history
    if (this.currentIndex >= 0 && this.currentIndex < this.entries.length - 1) {
      this.entries = this.entries.slice(0, this.currentIndex + 1)
    }
    this.entries.push(entry)
    this.currentIndex = this.entries.length - 1
  }

  back(): SplitHistoryEntry | null {
    if (this.canGoBack()) {
      this.currentIndex--
      return this.entries[this.currentIndex]
    }
    return null
  }

  forward(): SplitHistoryEntry | null {
    if (this.canGoForward()) {
      this.currentIndex++
      return this.entries[this.currentIndex]
    }
    return null
  }

  clear() {
    this.entries = []
    this.currentIndex = -1
  }
}

/**
 * Checks if a target URL points to the concept navigation hub page (/concepts, /concepts/, /concepts/index).
 */
export function isConceptNavigationUrl(url: URL): boolean {
  const segments = url.pathname.split("/").filter(Boolean)
  if (segments.length === 0) return false
  const last = segments[segments.length - 1]
  const secondLast = segments[segments.length - 2]
  if (last === "concepts") return true
  if (secondLast === "concepts" && (last === "index" || last === "index.html")) return true
  return false
}

/**
 * Checks if a target URL points to a concept or entity note or directory.
 * The concept navigation hub page is treated as a non-concept page and opens in the main pane.
 */
export function isSplitTargetUrl(url: URL): boolean {
  if (isConceptNavigationUrl(url)) {
    return false
  }
  const segments = url.pathname.split("/").filter(Boolean)
  return segments.includes("concepts") || segments.includes("entities")
}

export function isConceptUrl(url: URL): boolean {
  return isSplitTargetUrl(url)
}

export interface InterceptParams {
  targetHref: string
  targetOrigin: string
  currentOrigin: string
  currentSlug: string
  isModifierKey: boolean
  isPrimaryButton: boolean
  windowWidth: number
  isInsideSplitPane: boolean
}

export type InterceptResult = "split-open" | "split-replace" | "pane-navigate-main" | "ignore"

/**
 * Determines whether and how a clicked link should be intercepted by the split view.
 */
export function determineLinkInterception(params: InterceptParams): InterceptResult {
  if (!params.isPrimaryButton) return "ignore"
  if (params.isModifierKey) return "ignore"
  if (params.windowWidth <= 800) return "ignore"
  if (params.targetOrigin !== params.currentOrigin) return "ignore"

  let targetUrl: URL
  try {
    targetUrl = new URL(params.targetHref, params.currentOrigin)
  } catch {
    return "ignore"
  }

  const isTarget = isSplitTargetUrl(targetUrl)

  // Clicking inside the active split pane
  if (params.isInsideSplitPane) {
    if (isTarget) {
      return "split-replace"
    } else {
      return "pane-navigate-main"
    }
  }

  // Clicking on the main page:
  // If current page is already an individual concept or entity note, do not split — allow normal page navigation.
  // The concept navigation hub (concepts or concepts/index) is treated as a non-concept page (open in the main pane),
  // so clicking concept links from it will open in the split view.
  const isConceptNav =
    params.currentSlug === "concepts" ||
    params.currentSlug === "concepts/index" ||
    params.currentSlug === "concepts/"
  const isCurrentPageSplitTarget =
    !isConceptNav &&
    ((params.currentSlug.startsWith("concepts/") && params.currentSlug !== "concepts/index") ||
      params.currentSlug === "entities" ||
      params.currentSlug.startsWith("entities/"))
  if (isCurrentPageSplitTarget) {
    return "ignore"
  }

  // Non-concept/non-entity page clicking a concept or entity link -> open split view
  if (isTarget) {
    return "split-open"
  }

  return "ignore"
}

/**
 * Clamps ratio between min (default 25%) and max (default 75%).
 */
export function clampSplitRatio(ratio: number, min = 25, max = 75): number {
  if (Number.isNaN(ratio)) return 50
  return Math.max(min, Math.min(max, ratio))
}

/**
 * Returns a human-friendly category badge for a target split or link URL.
 */
export function getSplitBadgeLabel(url: URL): string {
  const segments = url.pathname.split("/").filter(Boolean)
  if (segments.length === 0) return "Note"

  if (segments.includes("concepts")) {
    const last = segments[segments.length - 1]
    if (last === "concepts" || last === "index" || last === "index.html") {
      return "Index"
    }
    return "Concept"
  }

  if (segments.includes("entities")) {
    const last = segments[segments.length - 1]
    if (last === "entities" || last === "index" || last === "index.html") {
      return "Index"
    }
    return "Entity"
  }

  if (segments.includes("courses")) {
    const last = segments[segments.length - 1] || ""
    if (last.startsWith("case-") || segments.some((s) => s.startsWith("case-"))) {
      return "Case"
    }
    if (last.startsWith("assignment-") || segments.some((s) => s.startsWith("assignment-"))) {
      return "Assignment"
    }
    return "Course"
  }

  if (segments.includes("rabuan")) {
    return "Rabuan"
  }

  if (segments.includes("program")) {
    if (segments.includes("alp")) {
      return "ALP"
    }
    return "Program"
  }

  return "Note"
}

/**
 * Strips internal hash prefixes like #split- and #popover-internal-
 * to ensure copied or navigated links always point to canonical anchors.
 */
export function sanitizeInternalUrl(rawHref: string, baseOrigin: string): URL {
  const url = new URL(rawHref, baseOrigin)
  if (url.hash) {
    let cleanHash = url.hash.slice(1)
    if (cleanHash.startsWith("split-")) {
      cleanHash = cleanHash.slice("split-".length)
    } else if (cleanHash.startsWith("popover-internal-")) {
      cleanHash = cleanHash.slice("popover-internal-".length)
    }
    url.hash = cleanHash ? `#${cleanHash}` : ""
  }
  return url
}

/**
 * Formats a clean internal URL and page title into an Obsidian/Quartz wikilink.
 */
export function formatAsWikilink(url: URL, title?: string): string {
  const slug = url.pathname.replace(/^\/+|\/+$/g, "")
  const cleanTitle = (title || "").trim() || slug.split("/").pop() || "Link"

  if (url.hash) {
    const hash = url.hash.slice(1)
    return `[[${slug}#${hash}|${cleanTitle}]]`
  }
  return `[[${slug}|${cleanTitle}]]`
}

export interface ContextMenuGuardParams {
  isShiftKey: boolean
  windowWidth: number
  isCoarsePointer: boolean
  targetOrigin: string
  currentOrigin: string
  isAnchor: boolean
  isRepeatOnSameAnchor: boolean
}

/**
 * Validates whether the custom hyperlink context menu should open or allow native browser menu.
 */
export function shouldShowContextMenu(params: ContextMenuGuardParams): boolean {
  if (params.isShiftKey) return false
  if (params.windowWidth <= 800) return false
  if (params.isCoarsePointer) return false
  if (!params.isAnchor) return false
  if (params.isRepeatOnSameAnchor) return false
  if (params.targetOrigin !== params.currentOrigin) return false
  return true
}
