import { normalizeRelativeURLs } from "../../util/path"
import { fetchCanonical } from "./util"
import {
  clampSplitRatio,
  determineLinkInterception,
  SplitHistoryManager,
} from "./splitview.helpers"

const historyManager = new SplitHistoryManager()
let priorSidebarState = "expanded"
let isSplitOpen = false
let parser: DOMParser | null = null

function getParser(): DOMParser {
  if (!parser) {
    parser = new DOMParser()
  }
  return parser
}

function setSidebarState(state: string) {
  document.documentElement.setAttribute("data-sidebar-state", state)
  const toggleBtns = document.querySelectorAll<HTMLButtonElement>(".sidebar-toggle-btn")
  const isCollapsed = state === "collapsed"
  toggleBtns.forEach((btn) => {
    btn.setAttribute("aria-expanded", isCollapsed ? "false" : "true")
    btn.setAttribute(
      "aria-label",
      isCollapsed ? "Expand sidebar (Ctrl+\\)" : "Collapse sidebar (Ctrl+\\)",
    )
    btn.setAttribute(
      "title",
      isCollapsed ? "Expand sidebar (Ctrl+\\)" : "Collapse sidebar (Ctrl+\\)",
    )
  })
  window.dispatchEvent(new Event("resize"))
  document.dispatchEvent(new CustomEvent("sidebartoggle", { detail: { state } }))
}

function dismissActivePopovers() {
  document.querySelectorAll(".popover").forEach((p) => {
    p.classList.remove("active-popover")
  })
}

function updateHistoryButtons() {
  const backBtn = document.getElementById("split-pane-back") as HTMLButtonElement | null
  const forwardBtn = document.getElementById("split-pane-forward") as HTMLButtonElement | null
  if (backBtn) {
    backBtn.disabled = !historyManager.canGoBack()
  }
  if (forwardBtn) {
    forwardBtn.disabled = !historyManager.canGoForward()
  }
}

function wireInteractiveElements(container: HTMLElement) {
  // 1. Mark all links inside split pane with data-no-popover to avoid hover popovers
  container.querySelectorAll("a").forEach((a) => {
    a.dataset.noPopover = "true"
  })

  // 2. Callout folding toggle inside the split pane
  container.querySelectorAll(".callout.is-collapsible").forEach((callout) => {
    const title = callout.querySelector(".callout-title")
    if (title && !(title as any)._hasSplitClick) {
      ;(title as any)._hasSplitClick = true
      title.addEventListener("click", () => {
        callout.classList.toggle("is-collapsed")
      })
    }
  })

  // 3. Code copy buttons
  const svgCopy =
    '<svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true"><path fill-rule="evenodd" d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z"></path><path fill-rule="evenodd" d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z"></path></svg>'
  const svgCheck =
    '<svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true"><path fill-rule="evenodd" fill="rgb(63, 185, 80)" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"></path></svg>'

  const preEls = container.querySelectorAll("pre")
  preEls.forEach((pre) => {
    if (pre.querySelector(".clipboard-button")) return
    const codeBlock = pre.querySelector("code")
    if (codeBlock) {
      const source = (
        codeBlock.dataset.clipboard ? JSON.parse(codeBlock.dataset.clipboard) : codeBlock.innerText
      ).replace(/\n\n/g, "\n")
      const button = document.createElement("button")
      button.className = "clipboard-button"
      button.type = "button"
      button.innerHTML = svgCopy
      button.setAttribute("aria-label", "Copy source")
      button.addEventListener("click", () => {
        navigator.clipboard.writeText(source).then(
          () => {
            button.blur()
            button.innerHTML = svgCheck
            setTimeout(() => {
              button.innerHTML = svgCopy
            }, 2000)
          },
          (err) => console.error("Clipboard copy error:", err),
        )
      })
      pre.appendChild(button)
    }
  })
}

async function loadConcept(url: URL, pushHistory = true) {
  const titleEl = document.getElementById("split-pane-title")
  const badgeEl = document.getElementById("split-pane-badge")
  const bodyEl = document.getElementById("split-pane-body")
  if (!bodyEl) return

  const pathSegments = url.pathname.split("/").filter(Boolean)
  const isEntity = pathSegments.includes("entities")
  const typeLabel = isEntity ? "Entity" : "Concept"

  if (badgeEl) {
    badgeEl.textContent = typeLabel
  }

  // Preserve scroll of current entry before moving
  const current = historyManager.current()
  if (current) {
    historyManager.updateCurrentScroll(bodyEl.scrollTop)
  }

  // Show loading indicator
  if (titleEl) titleEl.textContent = `Loading ${typeLabel.toLowerCase()}...`
  bodyEl.innerHTML = `
    <div class="split-pane-loading">
      <div class="split-pane-spinner"></div>
      <span>Loading ${typeLabel.toLowerCase()}...</span>
    </div>
  `

  try {
    const res = await fetchCanonical(url)
    if (!res || !res.ok) {
      throw new Error(`Failed to load ${url.pathname}`)
    }
    const htmlText = await res.text()
    const doc = getParser().parseFromString(htmlText, "text/html")
    normalizeRelativeURLs(doc, url)

    // Extract title
    const articleTitle =
      doc.querySelector(".article-title")?.textContent?.trim() ||
      doc.querySelector("h1")?.textContent?.trim() ||
      doc
        .querySelector("title")
        ?.textContent?.replace(/ \| .*$/, "")
        .trim() ||
      typeLabel

    if (titleEl) {
      titleEl.textContent = articleTitle
      titleEl.setAttribute("title", articleTitle)
    }

    // Prefix IDs inside split pane to avoid collisions with main page
    doc.querySelectorAll("[id]").forEach((el) => {
      el.id = `split-${el.id}`
    })

    // Rewrite anchor fragment links
    doc.querySelectorAll("a[href^='#']").forEach((anchor) => {
      const hash = anchor.getAttribute("href")?.slice(1)
      if (hash) {
        anchor.setAttribute("href", `#split-${hash}`)
      }
    })

    // Extract article content and header
    const extractedNodes: Node[] = []
    const pageHeader = doc.querySelector(".page-header")
    if (pageHeader) {
      extractedNodes.push(pageHeader.cloneNode(true))
    } else {
      const popoverHint = doc.querySelector(".popover-hint")
      if (popoverHint) {
        extractedNodes.push(popoverHint.cloneNode(true))
      }
    }

    const article = doc.querySelector("article")
    if (article) {
      extractedNodes.push(article.cloneNode(true))
    }

    bodyEl.innerHTML = ""
    if (extractedNodes.length === 0) {
      const center = doc.querySelector(".center")
      if (center) {
        bodyEl.appendChild(center.cloneNode(true))
      } else {
        bodyEl.innerHTML = `<p>Content could not be displayed.</p>`
      }
    } else {
      extractedNodes.forEach((node) => bodyEl.appendChild(node))
    }

    wireInteractiveElements(bodyEl)

    if (pushHistory) {
      historyManager.push({
        url: url.toString(),
        title: articleTitle,
        scrollTop: 0,
      })
    }

    updateHistoryButtons()

    // Scroll to anchor or top
    if (url.hash) {
      const targetAnchor = `#split-${decodeURIComponent(url.hash.slice(1))}`
      const targetEl = bodyEl.querySelector(targetAnchor) as HTMLElement | null
      if (targetEl) {
        bodyEl.scroll({ top: targetEl.offsetTop - 16, behavior: "instant" })
      } else {
        bodyEl.scrollTop = 0
      }
    } else {
      bodyEl.scrollTop = 0
    }
  } catch (err) {
    console.error("Split view fetch error:", err)
    if (titleEl) titleEl.textContent = "Error"
    bodyEl.innerHTML = `
      <div style="padding: 2rem 1rem; color: var(--darkgray);">
        <p>Could not load article.</p>
        <p><a href="${url.toString()}" class="internal">Open page directly</a></p>
      </div>
    `
  }
}

function openConceptInSplitView(url: URL) {
  dismissActivePopovers()

  const pane = document.getElementById("split-pane")
  const divider = document.getElementById("split-pane-divider")
  if (!pane || !divider) return

  if (!isSplitOpen) {
    // Remember current sidebar state and collapse it
    priorSidebarState = document.documentElement.getAttribute("data-sidebar-state") ?? "expanded"
    setSidebarState("collapsed")

    // Sync scroll position from window to .center
    const currentScrollY = window.scrollY || document.documentElement.scrollTop || 0
    const center = document.querySelector(".center") as HTMLElement | null

    document.documentElement.setAttribute("data-split-view", "open")
    document.documentElement.setAttribute("data-split-side", "right")
    pane.setAttribute("aria-hidden", "false")
    divider.setAttribute("aria-hidden", "false")
    isSplitOpen = true

    if (center) {
      center.scrollTop = currentScrollY
    }

    window.dispatchEvent(new Event("resize"))
    document.dispatchEvent(new CustomEvent("splitviewopen", { detail: { url: url.toString() } }))
  }

  loadConcept(url, true)
}

function closeSplitView() {
  if (!isSplitOpen) return

  const pane = document.getElementById("split-pane")
  const divider = document.getElementById("split-pane-divider")
  const center = document.querySelector(".center") as HTMLElement | null
  const savedScroll = center ? center.scrollTop : 0

  document.documentElement.removeAttribute("data-split-view")
  document.documentElement.removeAttribute("data-split-side")
  if (pane) pane.setAttribute("aria-hidden", "true")
  if (divider) divider.setAttribute("aria-hidden", "true")
  isSplitOpen = false

  // Restore prior sidebar state
  setSidebarState(priorSidebarState)

  // Restore window scroll
  window.scrollTo({ top: savedScroll, behavior: "instant" })

  historyManager.clear()
  updateHistoryButtons()

  window.dispatchEvent(new Event("resize"))
  document.dispatchEvent(new CustomEvent("splitviewclose", { detail: {} }))
}

function swapSides() {
  if (!isSplitOpen) return
  const currentSide = document.documentElement.getAttribute("data-split-side") ?? "right"
  const nextSide = currentSide === "right" ? "left" : "right"
  document.documentElement.setAttribute("data-split-side", nextSide)
  window.dispatchEvent(new Event("resize"))
}

function openFullPage() {
  const current = historyManager.current()
  if (!current) return
  const targetUrl = new URL(current.url)
  closeSplitView()
  if (typeof (window as any).spaNavigate === "function") {
    ;(window as any).spaNavigate(targetUrl)
  } else {
    window.location.assign(targetUrl)
  }
}

function handleHistoryBack() {
  const prev = historyManager.back()
  if (!prev) return
  const bodyEl = document.getElementById("split-pane-body")
  loadConcept(new URL(prev.url), false).then(() => {
    if (bodyEl && prev.scrollTop) {
      bodyEl.scrollTop = prev.scrollTop
    }
  })
}

function handleHistoryForward() {
  const next = historyManager.forward()
  if (!next) return
  const bodyEl = document.getElementById("split-pane-body")
  loadConcept(new URL(next.url), false).then(() => {
    if (bodyEl && next.scrollTop) {
      bodyEl.scrollTop = next.scrollTop
    }
  })
}

// Resizer Divider Drag Setup
function setupDividerDragging() {
  const divider = document.getElementById("split-pane-divider")
  if (!divider || (divider as any)._hasDragSetup) return
  ;(divider as any)._hasDragSetup = true

  let isDragging = false

  divider.addEventListener("pointerdown", (e: PointerEvent) => {
    if (e.button !== 0) return
    isDragging = true
    divider.setPointerCapture(e.pointerId)
    document.body.classList.add("split-resizing")
    e.preventDefault()
  })

  divider.addEventListener("pointermove", (e: PointerEvent) => {
    if (!isDragging) return
    const body = document.getElementById("quartz-body")
    if (!body) return
    const rect = body.getBoundingClientRect()
    if (rect.width <= 0) return

    const side = document.documentElement.getAttribute("data-split-side") ?? "right"
    let ratio: number
    if (side === "left") {
      ratio = ((e.clientX - rect.left) / rect.width) * 100
    } else {
      ratio = ((e.clientX - rect.left) / rect.width) * 100
    }

    const clamped = clampSplitRatio(ratio)
    document.documentElement.style.setProperty("--split-ratio", `${clamped.toFixed(1)}%`)
  })

  const stopDrag = (e: PointerEvent) => {
    if (!isDragging) return
    isDragging = false
    try {
      divider.releasePointerCapture(e.pointerId)
    } catch {}
    document.body.classList.remove("split-resizing")
    window.dispatchEvent(new Event("resize"))
  }

  divider.addEventListener("pointerup", stopDrag)
  divider.addEventListener("pointercancel", stopDrag)

  divider.addEventListener("dblclick", () => {
    document.documentElement.style.setProperty("--split-ratio", "50%")
    window.dispatchEvent(new Event("resize"))
  })
}

// Delegated click handler on document
function handleGlobalClick(e: MouseEvent) {
  if (e.defaultPrevented) return

  const target = e.target as HTMLElement | null
  const link = target?.closest("a")
  if (!link || !link.href) return

  const splitPane = document.getElementById("split-pane")
  const isInsideSplit = Boolean(splitPane && splitPane.contains(link))

  const decision = determineLinkInterception({
    targetHref: link.href,
    targetOrigin: new URL(link.href, window.location.toString()).origin,
    currentOrigin: window.location.origin,
    currentSlug: document.body.dataset.slug ?? "",
    isModifierKey: e.ctrlKey || e.metaKey || e.shiftKey || e.altKey,
    isPrimaryButton: e.button === 0,
    windowWidth: window.innerWidth,
    isInsideSplitPane: isInsideSplit,
  })

  if (decision === "ignore") {
    return
  }

  e.preventDefault()
  e.stopPropagation()
  e.stopImmediatePropagation()

  const targetUrl = new URL(link.href, window.location.toString())

  if (decision === "split-open") {
    openConceptInSplitView(targetUrl)
  } else if (decision === "split-replace") {
    loadConcept(targetUrl, true)
  } else if (decision === "pane-navigate-main") {
    closeSplitView()
    if (typeof (window as any).spaNavigate === "function") {
      ;(window as any).spaNavigate(targetUrl)
    } else {
      window.location.assign(targetUrl)
    }
  }
}

// Setup split pane header buttons
function setupHeaderButtons() {
  const backBtn = document.getElementById("split-pane-back")
  const forwardBtn = document.getElementById("split-pane-forward")
  const swapBtn = document.getElementById("split-pane-swap")
  const openFullBtn = document.getElementById("split-pane-open-full")
  const closeBtn = document.getElementById("split-pane-close")

  if (backBtn && !(backBtn as any)._hasBound) {
    ;(backBtn as any)._hasBound = true
    backBtn.addEventListener("click", handleHistoryBack)
  }
  if (forwardBtn && !(forwardBtn as any)._hasBound) {
    ;(forwardBtn as any)._hasBound = true
    forwardBtn.addEventListener("click", handleHistoryForward)
  }
  if (swapBtn && !(swapBtn as any)._hasBound) {
    ;(swapBtn as any)._hasBound = true
    swapBtn.addEventListener("click", swapSides)
  }
  if (openFullBtn && !(openFullBtn as any)._hasBound) {
    ;(openFullBtn as any)._hasBound = true
    openFullBtn.addEventListener("click", openFullPage)
  }
  if (closeBtn && !(closeBtn as any)._hasBound) {
    ;(closeBtn as any)._hasBound = true
    closeBtn.addEventListener("click", closeSplitView)
  }
}

// Global initialization
function initSplitView() {
  setupHeaderButtons()
  setupDividerDragging()
}

// Capture-phase link click interception
document.addEventListener("click", handleGlobalClick, true)

// Escape key closes split view
document.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.key === "Escape" && isSplitOpen) {
    e.preventDefault()
    closeSplitView()
  }
})

// Navigation & window resize listeners
document.addEventListener("nav", () => {
  if (isSplitOpen) {
    closeSplitView()
  }
  initSplitView()
})

document.addEventListener("prenav", () => {
  if (isSplitOpen) {
    closeSplitView()
  }
})

window.addEventListener("resize", () => {
  if (window.innerWidth <= 800 && isSplitOpen) {
    closeSplitView()
  }
})

// Initialize on initial script load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSplitView)
} else {
  initSplitView()
}
