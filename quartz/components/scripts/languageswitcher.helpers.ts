export const LANG_STORAGE_KEY = "p3md-lang"

export interface StorageWriter {
  setItem(key: string, value: string): void
}

/**
 * Preserves the current page's hash anchor when switching locales, unless the
 * target href already contains an explicit fragment.
 */
export function buildTargetHrefWithHash(targetHref: string, currentHash: string): string {
  if (!currentHash || targetHref.includes("#")) {
    return targetHref
  }
  return `${targetHref}${currentHash}`
}

/**
 * Returns the /id/ redirect destination only on the EN root landing page
 * when the user explicitly saved "id" in localStorage.
 */
export function resolveRootRedirectTarget(
  metaRedirectHref: string | null,
  savedLang: string | null,
  search: string,
  hash: string,
): string | null {
  if (!metaRedirectHref || savedLang !== "id") {
    return null
  }
  return `${metaRedirectHref}${search}${hash}`
}

/**
 * Persists an explicit user language choice ("en" | "id") to storage.
 */
export function applyLanguagePreference(
  storage: StorageWriter | null | undefined,
  targetLang: string | undefined,
): void {
  if (!storage || (targetLang !== "en" && targetLang !== "id")) {
    return
  }
  try {
    storage.setItem(LANG_STORAGE_KEY, targetLang)
  } catch {
    // Ignore storage access errors in private/restricted browser contexts
  }
}
