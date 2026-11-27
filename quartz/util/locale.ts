import { FullSlug, joinSegments, pathToRoot, simplifySlug } from "./path"

export type LocaleCode = "en" | "id"
export type TranslationStatus = "source" | "translated" | "fallback"

/**
 * Normalizes a Quartz BCP-47 locale string (e.g. "en-US", "id-ID") to "en" | "id".
 */
export function getLocaleCode(locale?: string): LocaleCode {
  if (!locale) return "en"
  return locale.toLowerCase().startsWith("id") ? "id" : "en"
}

/**
 * Computes the relative href from the current page to its paired counterpart
 * in the opposite locale ("en" at / vs "id" at /id/).
 */
export function buildPairedLocaleHref(slug: FullSlug, currentLocale: LocaleCode): string {
  const safeSlug = (slug === "404" ? "index" : slug) as FullSlug
  const baseDir = pathToRoot(safeSlug)
  const simplified = simplifySlug(safeSlug)
  const relPath = simplified === "/" ? "" : simplified

  if (currentLocale === "en") {
    return relPath ? joinSegments(baseDir, "id", relPath) : `${baseDir}/id/`
  }

  const upPrefix = baseDir === "." ? ".." : `${baseDir}/..`
  return relPath ? joinSegments(upPrefix, relPath) : `${upPrefix}/`
}

/**
 * Normalizes a paired relative href for browser root-level paths cleanly (handles "." prefix).
 */
export function normalizePairedHrefForBrowser(href: string): string {
  if (href.startsWith("./") || href.startsWith("../")) {
    return href
  }
  return `./${href}`
}

/**
 * Constructs an absolute URL for `<link rel="alternate" hrefLang="...">`.
 */
export function buildAlternateAbsoluteUrl(
  baseUrl: string | undefined,
  slug: FullSlug,
  targetLocale: LocaleCode,
): string | null {
  if (!baseUrl) return null
  const cleanHost = baseUrl.replace(/^https?:\/\//i, "").replace(/\/+$/, "")
  const safeSlug = (slug === "404" ? "index" : slug) as FullSlug
  const simplified = simplifySlug(safeSlug)
  const relPath = simplified === "/" ? "" : simplified.replace(/^\/+/, "")

  if (targetLocale === "id") {
    return relPath ? `https://${cleanHost}/id/${relPath}` : `https://${cleanHost}/id/`
  }

  return relPath ? `https://${cleanHost}/${relPath}` : `https://${cleanHost}/`
}

/**
 * Redirects to /id/ only when landing on the English root page and the user previously
 * selected Indonesian ("id") explicitly. Shared deep links always honor their URL.
 */
export function shouldRedirectRootToId(
  slug: string | undefined,
  currentLocale: LocaleCode,
  savedLang: string | null,
): boolean {
  return slug === "index" && currentLocale === "en" && savedLang === "id"
}
