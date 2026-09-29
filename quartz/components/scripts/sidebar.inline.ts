// Pre-hydrate sidebar state before DOM paint to prevent flash of unstyled content
const savedState = localStorage.getItem("sidebar-left-state") ?? "expanded"
document.documentElement.setAttribute("data-sidebar-state", savedState)

function updateToggleButtons(state: string) {
  const isCollapsed = state === "collapsed"
  const toggleBtns = document.querySelectorAll<HTMLButtonElement>(".sidebar-toggle-btn")
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
}

function toggleSidebar() {
  const currentState = document.documentElement.getAttribute("data-sidebar-state") ?? "expanded"
  const newState = currentState === "collapsed" ? "expanded" : "collapsed"
  document.documentElement.setAttribute("data-sidebar-state", newState)
  try {
    localStorage.setItem("sidebar-left-state", newState)
  } catch {
    // ignore storage quota / disabled errors
  }
  updateToggleButtons(newState)

  // Dispatch events for components (such as D3 Graph canvas) to resize
  window.dispatchEvent(new Event("resize"))
  document.dispatchEvent(new CustomEvent("sidebartoggle", { detail: { state: newState } }))

  // Dispatch again after transition completes (250ms) to ensure final width calculation
  setTimeout(() => {
    window.dispatchEvent(new Event("resize"))
    document.dispatchEvent(new CustomEvent("sidebartoggle", { detail: { state: newState } }))
  }, 260)
}

function handleKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && (e.key === "\\" || e.code === "Backslash")) {
    e.preventDefault()
    toggleSidebar()
  }
}

// Global delegated click listener so it always works regardless of SPA page transitions
document.addEventListener("click", (e) => {
  const target = e.target as HTMLElement | null
  const btn = target?.closest<HTMLButtonElement>(".sidebar-toggle-btn")
  if (btn) {
    e.preventDefault()
    toggleSidebar()
  }
})

// Global keyboard shortcut
document.addEventListener("keydown", handleKeydown)

// Update button aria/title on SPA navigation
document.addEventListener("nav", () => {
  const currentState = document.documentElement.getAttribute("data-sidebar-state") ?? "expanded"
  updateToggleButtons(currentState)
})
