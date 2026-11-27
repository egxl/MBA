import {
  applyLanguagePreference,
  buildTargetHrefWithHash,
  LANG_STORAGE_KEY,
  resolveRootRedirectTarget,
} from "./languageswitcher.helpers"

// Run root-only saved preference redirect before first paint
try {
  const idRedirectMeta = document.querySelector<HTMLMetaElement>('meta[name="p3md-id-redirect"]')
  const savedLang =
    typeof localStorage !== "undefined" ? localStorage.getItem(LANG_STORAGE_KEY) : null
  const redirectTarget = resolveRootRedirectTarget(
    idRedirectMeta?.getAttribute("content") ?? null,
    savedLang,
    window.location.search,
    window.location.hash,
  )
  if (redirectTarget) {
    window.location.replace(redirectTarget)
  }
} catch {
  // Ignore redirect/storage errors in restricted contexts
}

function setupLanguageSwitcher() {
  const switchLinks = document.querySelectorAll<HTMLAnchorElement>(
    ".language-switcher, .translation-notice-switch",
  )

  switchLinks.forEach((link) => {
    const onSwitchClick = (e: MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
        return
      }
      const targetLang = link.dataset.targetLang
      applyLanguagePreference(typeof localStorage !== "undefined" ? localStorage : null, targetLang)

      const rawHref = link.getAttribute("href")
      if (!rawHref) return
      const nextUrl = buildTargetHrefWithHash(rawHref, window.location.hash)
      if (nextUrl !== rawHref) {
        e.preventDefault()
        window.location.assign(nextUrl)
      }
    }

    link.addEventListener("click", onSwitchClick)
    if (typeof window.addCleanup === "function") {
      window.addCleanup(() => {
        link.removeEventListener("click", onSwitchClick)
      })
    }
  })
}

document.addEventListener("nav", setupLanguageSwitcher)
