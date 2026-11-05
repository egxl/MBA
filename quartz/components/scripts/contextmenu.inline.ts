import { computePosition, flip, offset, shift } from "@floating-ui/dom"
import {
  formatAsWikilink,
  getSplitBadgeLabel,
  sanitizeInternalUrl,
  shouldShowContextMenu,
} from "./splitview.helpers"

let menuEl: HTMLElement | null = null
let activeLink: HTMLAnchorElement | null = null
let activeCleanUrl: URL | null = null
let activeTitle = ""
let copyTimeout: ReturnType<typeof setTimeout> | null = null

const SVG_COPY_URL =
  '<svg class="context-menu-icon" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>'
const SVG_COPY_WIKI =
  '<svg class="context-menu-icon" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>'
const SVG_CHECK =
  '<svg class="context-menu-icon" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="rgb(63, 185, 80)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'

function dismissActivePopovers() {
  document.querySelectorAll(".popover").forEach((p) => {
    p.classList.remove("active-popover")
  })
}

function closeMenu() {
  if (!menuEl) return
  menuEl.setAttribute("aria-hidden", "true")
  menuEl.classList.remove("active")
  activeLink = null
  activeCleanUrl = null
  activeTitle = ""
  if (copyTimeout) {
    clearTimeout(copyTimeout)
    copyTimeout = null
  }
}

function resetButtonStates(container: HTMLElement) {
  const copyUrlBtn = container.querySelector("#cm-action-copy-url") as HTMLButtonElement | null
  const copyWikiBtn = container.querySelector(
    "#cm-action-copy-wikilink",
  ) as HTMLButtonElement | null
  if (copyUrlBtn) {
    copyUrlBtn.innerHTML = `${SVG_COPY_URL}<span class="context-menu-label">Copy Link URL</span>`
  }
  if (copyWikiBtn) {
    copyWikiBtn.innerHTML = `${SVG_COPY_WIKI}<span class="context-menu-label">Copy Wikilink</span>`
  }
}

function handleCopyFeedback(button: HTMLButtonElement, successLabel: string) {
  button.innerHTML = `${SVG_CHECK}<span class="context-menu-label">${successLabel}</span>`
  if (copyTimeout) {
    clearTimeout(copyTimeout)
  }
  copyTimeout = setTimeout(() => {
    closeMenu()
  }, 750)
}

function wireMenuActions(container: HTMLElement) {
  const splitBtn = container.querySelector("#cm-action-split") as HTMLButtonElement | null
  const mainBtn = container.querySelector("#cm-action-main") as HTMLButtonElement | null
  const tabBtn = container.querySelector("#cm-action-tab") as HTMLButtonElement | null
  const copyUrlBtn = container.querySelector("#cm-action-copy-url") as HTMLButtonElement | null
  const copyWikiBtn = container.querySelector(
    "#cm-action-copy-wikilink",
  ) as HTMLButtonElement | null

  splitBtn?.addEventListener("click", () => {
    if (activeCleanUrl && typeof (window as any).openInSplitView === "function") {
      ;(window as any).openInSplitView(activeCleanUrl)
    } else if (activeCleanUrl) {
      window.location.assign(activeCleanUrl)
    }
    closeMenu()
  })

  mainBtn?.addEventListener("click", () => {
    if (activeCleanUrl) {
      if (typeof (window as any).spaNavigate === "function") {
        ;(window as any).spaNavigate(activeCleanUrl)
      } else {
        window.location.assign(activeCleanUrl)
      }
    }
    closeMenu()
  })

  tabBtn?.addEventListener("click", () => {
    if (activeCleanUrl) {
      window.open(activeCleanUrl.toString(), "_blank", "noopener,noreferrer")
    }
    closeMenu()
  })

  copyUrlBtn?.addEventListener("click", () => {
    if (activeCleanUrl) {
      navigator.clipboard.writeText(activeCleanUrl.toString()).then(
        () => handleCopyFeedback(copyUrlBtn, "URL Copied!"),
        (err) => console.error("Clipboard copy error:", err),
      )
    }
  })

  copyWikiBtn?.addEventListener("click", () => {
    if (activeCleanUrl) {
      const wikilink = formatAsWikilink(activeCleanUrl, activeTitle)
      navigator.clipboard.writeText(wikilink).then(
        () => handleCopyFeedback(copyWikiBtn, "Wikilink Copied!"),
        (err) => console.error("Clipboard copy error:", err),
      )
    }
  })
}

function getContextMenu(): HTMLElement {
  if (menuEl) return menuEl
  menuEl = document.createElement("div")
  menuEl.id = "link-context-menu"
  menuEl.className = "link-context-menu"
  menuEl.setAttribute("role", "menu")
  menuEl.setAttribute("aria-hidden", "true")
  menuEl.setAttribute("tabindex", "-1")

  menuEl.innerHTML = `
    <div class="context-menu-header">
      <span class="context-menu-badge" id="cm-badge"></span>
      <span class="context-menu-title" id="cm-title"></span>
    </div>
    <div class="context-menu-group" role="group">
      <button type="button" class="context-menu-item" id="cm-action-split" role="menuitem">
        <svg class="context-menu-icon" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"></rect>
          <line x1="12" y1="3" x2="12" y2="21"></line>
        </svg>
        <span class="context-menu-label">Open in Split View</span>
        <span class="context-menu-shortcut">Alt+Click</span>
      </button>
      <button type="button" class="context-menu-item" id="cm-action-main" role="menuitem">
        <svg class="context-menu-icon" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 3 21 3 21 9"></polyline>
          <polyline points="9 21 3 21 3 15"></polyline>
          <line x1="21" y1="3" x2="14" y2="10"></line>
          <line x1="3" y1="21" x2="10" y2="14"></line>
        </svg>
        <span class="context-menu-label">Open in Main View</span>
      </button>
      <button type="button" class="context-menu-item" id="cm-action-tab" role="menuitem">
        <svg class="context-menu-icon" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
          <polyline points="15 3 21 3 21 9"></polyline>
          <line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>
        <span class="context-menu-label">Open in New Tab</span>
        <span class="context-menu-shortcut">Ctrl+Click</span>
      </button>
    </div>
    <div class="context-menu-divider" role="separator"></div>
    <div class="context-menu-group" role="group">
      <button type="button" class="context-menu-item" id="cm-action-copy-url" role="menuitem">
        ${SVG_COPY_URL}
        <span class="context-menu-label">Copy Link URL</span>
      </button>
      <button type="button" class="context-menu-item" id="cm-action-copy-wikilink" role="menuitem">
        ${SVG_COPY_WIKI}
        <span class="context-menu-label">Copy Wikilink</span>
      </button>
    </div>
  `

  document.body.appendChild(menuEl)
  wireMenuActions(menuEl)
  return menuEl
}

async function handleContextMenu(e: MouseEvent) {
  const target = e.target as HTMLElement | null
  const link = target?.closest("a") as HTMLAnchorElement | null

  const isSameAnchor = Boolean(
    menuEl &&
    menuEl.getAttribute("aria-hidden") === "false" &&
    activeLink &&
    link &&
    activeLink === link,
  )

  const shouldShow = shouldShowContextMenu({
    isShiftKey: e.shiftKey,
    windowWidth: window.innerWidth,
    isCoarsePointer: window.matchMedia("(pointer: coarse)").matches,
    targetOrigin: link?.href ? new URL(link.href, window.location.origin).origin : "",
    currentOrigin: window.location.origin,
    isAnchor: Boolean(link && link.href),
    isRepeatOnSameAnchor: isSameAnchor,
  })

  if (!shouldShow || !link) {
    if (menuEl && menuEl.getAttribute("aria-hidden") === "false") {
      closeMenu()
    }
    return
  }

  e.preventDefault()
  dismissActivePopovers()

  activeLink = link
  activeCleanUrl = sanitizeInternalUrl(link.href, window.location.origin)
  const badgeLabel = getSplitBadgeLabel(activeCleanUrl)
  activeTitle =
    link.dataset.title ||
    link.title ||
    link.textContent?.trim() ||
    activeCleanUrl.pathname.split("/").pop() ||
    "Page"

  const menu = getContextMenu()
  const badgeEl = menu.querySelector("#cm-badge")
  const titleEl = menu.querySelector("#cm-title")
  if (badgeEl) badgeEl.textContent = badgeLabel
  if (titleEl) {
    titleEl.textContent = activeTitle
    titleEl.setAttribute("title", activeTitle)
  }

  resetButtonStates(menu)

  menu.setAttribute("aria-hidden", "false")
  menu.classList.add("active")

  const virtualEl = {
    getBoundingClientRect() {
      return {
        width: 0,
        height: 0,
        x: e.clientX,
        y: e.clientY,
        top: e.clientY,
        left: e.clientX,
        right: e.clientX,
        bottom: e.clientY,
      }
    },
  }

  const { x, y } = await computePosition(virtualEl, menu, {
    strategy: "fixed",
    middleware: [offset(4), flip({ padding: 8 }), shift({ padding: 8 })],
  })

  menu.style.left = `${Math.round(x)}px`
  menu.style.top = `${Math.round(y)}px`
}

function handleGlobalKeydown(e: KeyboardEvent) {
  if (!menuEl || menuEl.getAttribute("aria-hidden") === "true") return

  if (e.key === "Escape") {
    e.preventDefault()
    const returnTarget = activeLink
    closeMenu()
    returnTarget?.focus()
    return
  }

  const items = Array.from(
    menuEl.querySelectorAll<HTMLButtonElement>(".context-menu-item:not(:disabled)"),
  )
  if (items.length === 0) return

  const focusedIndex = items.indexOf(document.activeElement as HTMLButtonElement)

  if (e.key === "ArrowDown") {
    e.preventDefault()
    const nextIndex = focusedIndex < items.length - 1 ? focusedIndex + 1 : 0
    items[nextIndex]?.focus()
  } else if (e.key === "ArrowUp") {
    e.preventDefault()
    const prevIndex = focusedIndex > 0 ? focusedIndex - 1 : items.length - 1
    items[prevIndex]?.focus()
  } else if (e.key === "Home") {
    e.preventDefault()
    items[0]?.focus()
  } else if (e.key === "End") {
    e.preventDefault()
    items[items.length - 1]?.focus()
  }
}

// Global listeners
document.addEventListener("contextmenu", handleContextMenu)

document.addEventListener("pointerdown", (e: PointerEvent) => {
  if (!menuEl || menuEl.getAttribute("aria-hidden") === "true") return
  if (!menuEl.contains(e.target as Node)) {
    closeMenu()
  }
})

// Dismiss when scrolling (capture: true ensures nested container scrolls also dismiss)
window.addEventListener("scroll", closeMenu, true)
window.addEventListener("resize", closeMenu)
document.addEventListener("keydown", handleGlobalKeydown)
document.addEventListener("prenav", closeMenu)
document.addEventListener("nav", closeMenu)
