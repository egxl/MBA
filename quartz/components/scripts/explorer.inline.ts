import { FileTrieNode } from "../../util/fileTrie"
import { FullSlug, getFullSlug, resolveRelative, simplifySlug } from "../../util/path"
import { ContentDetails } from "../../plugins/emitters/contentIndex"

type MaybeHTMLElement = HTMLElement | undefined

interface ParsedOptions {
  folderClickBehavior: "collapse" | "link"
  folderDefaultState: "collapsed" | "open"
  useSavedState: boolean
  sortFn: (a: FileTrieNode, b: FileTrieNode) => number
  filterFn: (node: FileTrieNode) => boolean
  mapFn: (node: FileTrieNode) => void
  order: "sort" | "filter" | "map"[]
}

type FolderState = {
  path: string
  collapsed: boolean
}

let currentExplorerState: Array<FolderState>

function getScrollContainer(element: HTMLElement): HTMLElement | null {
  let parent = element.parentElement
  while (parent && parent !== document.body && parent !== document.documentElement) {
    const style = window.getComputedStyle(parent)
    const overflowY = style.overflowY
    if (
      (overflowY === "auto" || overflowY === "scroll") &&
      parent.scrollHeight > parent.clientHeight
    ) {
      return parent
    }
    parent = parent.parentElement
  }
  parent = element.parentElement
  while (parent && parent !== document.body && parent !== document.documentElement) {
    const style = window.getComputedStyle(parent)
    if (style.overflowY === "auto" || style.overflowY === "scroll") {
      return parent
    }
    parent = parent.parentElement
  }
  return null
}

function scrollActiveElementIntoView(activeElement: HTMLElement, smooth: boolean = false) {
  const container = getScrollContainer(activeElement)
  if (!container || container.scrollHeight <= container.clientHeight) return

  const containerRect = container.getBoundingClientRect()
  const elementRect = activeElement.getBoundingClientRect()

  // If already visible within container viewport with comfortable margin, do not move scroll
  if (
    elementRect.top >= containerRect.top + 16 &&
    elementRect.bottom <= containerRect.bottom - 16
  ) {
    return
  }

  activeElement.scrollIntoView({
    block: "nearest",
    behavior: smooth ? "smooth" : "instant",
  })
}

function cleanSlug(slug: string): string {
  let s = slug.trim()
  if (s.startsWith("/")) s = s.slice(1)
  if (s.endsWith("/")) s = s.slice(0, -1)
  if (s === "index") return ""
  if (s.endsWith("/index")) s = s.slice(0, -"/index".length)
  return s
}

function isFolderAncestor(folderSlug: string, targetSlug: string): boolean {
  const folder = cleanSlug(folderSlug)
  const target = cleanSlug(targetSlug)
  if (!folder || !target || folder === target) return false
  return target.startsWith(folder + "/")
}

function isSameFolder(folderSlug: string, targetSlug: string): boolean {
  const folder = cleanSlug(folderSlug)
  const target = cleanSlug(targetSlug)
  return folder === target
}

function closeMobileExplorer(explorer?: HTMLElement | null) {
  const targetExplorer =
    explorer ??
    (document.querySelector(".navbar .explorer, .mobile-only.explorer") as HTMLElement | null)
  if (!targetExplorer) return
  // Safety check: Never collapse desktop sidebar explorer
  if (targetExplorer.closest(".sidebar") || targetExplorer.classList.contains("desktop-only"))
    return

  targetExplorer.classList.add("collapsed")
  targetExplorer.setAttribute("aria-expanded", "false")
  const button = targetExplorer.querySelector(".mobile-explorer") as HTMLElement | null
  if (button) {
    button.setAttribute("aria-expanded", "false")
  }
  document.documentElement.classList.remove("menu-open", "mobile-no-scroll")
  document.body?.classList.remove("menu-open")
}

function openMobileExplorer(explorer: HTMLElement) {
  explorer.classList.remove("collapsed")
  explorer.setAttribute("aria-expanded", "true")
  const button = explorer.querySelector(".mobile-explorer") as HTMLElement | null
  if (button) {
    button.setAttribute("aria-expanded", "true")
  }
  document.documentElement.classList.add("menu-open", "mobile-no-scroll")
  document.body?.classList.add("menu-open")

  requestAnimationFrame(() => {
    const activeElement = explorer.querySelector<HTMLElement>(".active, [aria-current='page']")
    if (activeElement) {
      scrollActiveElementIntoView(activeElement, false)
    }
  })
}

function toggleExplorer(this: HTMLElement) {
  const nearestExplorer = this.closest(".explorer") as HTMLElement
  if (!nearestExplorer) return

  // Safety check: Desktop sidebar explorer cannot be collapsed
  if (nearestExplorer.closest(".sidebar") || nearestExplorer.classList.contains("desktop-only")) {
    return
  }

  const isMobile = this.classList.contains("mobile-explorer") || this.dataset.mobile === "true"
  if (isMobile) {
    const isCurrentlyCollapsed = nearestExplorer.classList.contains("collapsed")
    if (isCurrentlyCollapsed) {
      openMobileExplorer(nearestExplorer)
    } else {
      closeMobileExplorer(nearestExplorer)
    }
    return
  }
}

function toggleFolder(evt: MouseEvent) {
  evt.stopPropagation()
  const target = evt.target as MaybeHTMLElement
  if (!target) return

  // Check if target was svg icon or button
  const isSvg = target.nodeName === "svg"

  // corresponding <ul> element relative to clicked button/folder
  const folderContainer = (
    isSvg
      ? // svg -> div.folder-container
        target.parentElement
      : // button.folder-button -> div -> div.folder-container
        target.parentElement?.parentElement
  ) as MaybeHTMLElement
  if (!folderContainer) return
  const childFolderContainer = folderContainer.nextElementSibling as MaybeHTMLElement
  if (!childFolderContainer) return

  childFolderContainer.classList.toggle("open")

  // Collapse folder container
  const isCollapsed = !childFolderContainer.classList.contains("open")
  setFolderState(childFolderContainer, isCollapsed)

  const currentFolderState = currentExplorerState.find(
    (item) => item.path === folderContainer.dataset.folderpath,
  )
  if (currentFolderState) {
    currentFolderState.collapsed = isCollapsed
  } else {
    currentExplorerState.push({
      path: folderContainer.dataset.folderpath as FullSlug,
      collapsed: isCollapsed,
    })
  }

  const stringifiedFileTree = JSON.stringify(currentExplorerState)
  localStorage.setItem("fileTree_v2", stringifiedFileTree)
}

let cachedIndexData: ContentIndex | null = null

async function getContentIndexData(): Promise<ContentIndex | null> {
  if (cachedIndexData && Object.keys(cachedIndexData).length > 0) {
    return cachedIndexData
  }

  // 1. Try global fetchData promise
  try {
    if (typeof fetchData !== "undefined") {
      const data = await fetchData
      if (data && typeof data === "object" && Object.keys(data).length > 0) {
        cachedIndexData = data
        return data
      }
    }
  } catch (err) {
    console.warn("fetchData failed, attempting fallback paths", err)
  }

  // 2. Try window.fetchData
  try {
    if ((window as any).fetchData) {
      const data = await (window as any).fetchData
      if (data && typeof data === "object" && Object.keys(data).length > 0) {
        cachedIndexData = data
        return data
      }
    }
  } catch {
    // ignore
  }

  // 3. Try fetching from absolute root
  try {
    const res = await fetch("/static/contentIndex.json")
    if (res.ok) {
      const data = (await res.json()) as ContentIndex
      if (data && typeof data === "object" && Object.keys(data).length > 0) {
        cachedIndexData = data
        return data
      }
    }
  } catch {
    // ignore
  }

  // 4. Try fetching from relative path
  try {
    const res = await fetch("./static/contentIndex.json")
    if (res.ok) {
      const data = (await res.json()) as ContentIndex
      if (data && typeof data === "object" && Object.keys(data).length > 0) {
        cachedIndexData = data
        return data
      }
    }
  } catch {
    // ignore
  }

  return cachedIndexData
}

function safeAddCleanup(fn: () => void) {
  if (typeof window.addCleanup === "function") {
    window.addCleanup(fn)
  }
}

function createFileNode(currentSlug: FullSlug, node: FileTrieNode): HTMLLIElement {
  let li: HTMLLIElement
  let a: HTMLAnchorElement
  const template = document.getElementById("template-file") as HTMLTemplateElement | null
  if (template?.content) {
    const clone = template.content.cloneNode(true) as DocumentFragment
    li = clone.querySelector("li") as HTMLLIElement
    a = li.querySelector("a") as HTMLAnchorElement
  } else {
    li = document.createElement("li")
    a = document.createElement("a")
    li.appendChild(a)
  }
  a.href = resolveRelative(currentSlug, node.slug)
  a.dataset.for = node.slug
  a.textContent = node.displayName

  const isCurrent =
    currentSlug === node.slug ||
    simplifySlug(currentSlug) === simplifySlug(node.slug) ||
    cleanSlug(currentSlug) === cleanSlug(node.slug)
  if (isCurrent) {
    a.classList.add("active")
    a.setAttribute("aria-current", "page")
  }

  return li
}

function createFolderNode(
  currentSlug: FullSlug,
  node: FileTrieNode,
  opts: ParsedOptions,
): HTMLLIElement {
  let li: HTMLLIElement
  let folderContainer: HTMLElement
  let titleContainer: HTMLElement
  let folderOuter: HTMLElement
  let ul: HTMLUListElement
  const template = document.getElementById("template-folder") as HTMLTemplateElement | null
  if (template?.content) {
    const clone = template.content.cloneNode(true) as DocumentFragment
    li = clone.querySelector("li") as HTMLLIElement
    folderContainer = li.querySelector(".folder-container") as HTMLElement
    titleContainer = folderContainer.querySelector("div") as HTMLElement
    folderOuter = li.querySelector(".folder-outer") as HTMLElement
    ul = folderOuter.querySelector("ul") as HTMLUListElement
  } else {
    li = document.createElement("li")
    folderContainer = document.createElement("div")
    folderContainer.className = "folder-container"
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    svg.setAttribute("class", "folder-icon")
    svg.setAttribute("viewBox", "5 8 14 8")
    const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline")
    polyline.setAttribute("points", "6 9 12 15 18 9")
    svg.appendChild(polyline)
    folderContainer.appendChild(svg)
    titleContainer = document.createElement("div")
    const btn = document.createElement("button")
    btn.className = "folder-button"
    const span = document.createElement("span")
    span.className = "folder-title"
    btn.appendChild(span)
    titleContainer.appendChild(btn)
    folderContainer.appendChild(titleContainer)
    li.appendChild(folderContainer)
    folderOuter = document.createElement("div")
    folderOuter.className = "folder-outer"
    ul = document.createElement("ul")
    ul.className = "content"
    folderOuter.appendChild(ul)
    li.appendChild(folderOuter)
  }

  const folderPath = node.slug
  folderContainer.dataset.folderpath = folderPath

  const isCurrentFolder = isSameFolder(folderPath, currentSlug)
  if (isCurrentFolder) {
    folderContainer.classList.add("active")
  }

  // Check if this folder is an ancestor of the current page
  const isAncestor = isFolderAncestor(folderPath, currentSlug)
  if (isAncestor) {
    folderContainer.classList.add("ancestor-active")
    folderOuter.classList.add("current-branch")
  }

  if (opts.folderClickBehavior === "link") {
    // Replace button with link for link behavior
    const button = titleContainer.querySelector(".folder-button") as HTMLElement | null
    const a = document.createElement("a")
    a.href = resolveRelative(currentSlug, folderPath)
    a.dataset.for = folderPath
    a.className = "folder-title"
    if (isCurrentFolder) {
      a.classList.add("active")
      a.setAttribute("aria-current", "page")
    }
    a.textContent = node.displayName
    if (button) {
      button.replaceWith(a)
    } else {
      titleContainer.appendChild(a)
    }
  } else {
    const span = titleContainer.querySelector(".folder-title") as HTMLElement | null
    if (span) {
      span.textContent = node.displayName
    }
  }

  // Set open/collapsed state based on currentExplorerState (with active branch guaranteed open)
  const state = currentExplorerState.find((s) => s.path === folderPath)
  const isCollapsed = state ? state.collapsed : opts.folderDefaultState === "collapsed"
  const shouldBeOpen = !isCollapsed || isAncestor || isCurrentFolder
  if (shouldBeOpen) {
    folderOuter.classList.add("open")
  }

  for (const child of node.children) {
    const hasSubContent = child.isFolder && child.children.length > 0
    const childNode = hasSubContent
      ? createFolderNode(currentSlug, child, opts)
      : createFileNode(currentSlug, child)
    ul.appendChild(childNode)
  }

  return li
}

async function setupExplorer(currentSlug: FullSlug) {
  const allExplorers = document.querySelectorAll("div.explorer") as NodeListOf<HTMLElement>
  if (allExplorers.length === 0) return

  const data = await getContentIndexData()
  if (!data || Object.keys(data).length === 0) {
    console.warn("setupExplorer: No contentIndex data available")
    return
  }

  for (const explorer of allExplorers) {
    try {
      const isDesktopSidebar =
        explorer.closest(".sidebar") !== null || explorer.classList.contains("desktop-only")
      if (isDesktopSidebar) {
        explorer.classList.remove("collapsed")
        explorer.setAttribute("aria-expanded", "true")
      }

      const hasItems = explorer.querySelector(".explorer-ul li") !== null
      if (hasItems && explorer.dataset.renderedSlug === currentSlug) {
        continue
      }

      const dataFns = JSON.parse(explorer.dataset.dataFns || "{}")
      const opts: ParsedOptions = {
        folderClickBehavior: (explorer.dataset.behavior || "collapse") as "collapse" | "link",
        folderDefaultState: (explorer.dataset.collapsed || "collapsed") as "collapsed" | "open",
        useSavedState: explorer.dataset.savestate === "true",
        order: dataFns.order || ["filter", "map", "sort"],
        sortFn: new Function("return " + (dataFns.sortFn || "undefined"))(),
        filterFn: new Function("return " + (dataFns.filterFn || "undefined"))(),
        mapFn: new Function("return " + (dataFns.mapFn || "undefined"))(),
      }

      const entries = [...Object.entries(data)] as [FullSlug, ContentDetails][]
      const trie = FileTrieNode.fromEntries(entries)

      // Apply functions in order
      for (const fn of opts.order) {
        switch (fn) {
          case "filter":
            if (opts.filterFn) trie.filter(opts.filterFn)
            break
          case "map":
            if (opts.mapFn) trie.map(opts.mapFn)
            break
          case "sort":
            if (opts.sortFn) trie.sort(opts.sortFn)
            break
        }
      }

      // Get folder paths for state management
      const folderPaths = trie.getFolderPaths()

      let savedExplorerState: FolderState[] | null = null
      if (opts.useSavedState) {
        const saved = localStorage.getItem("fileTree_v2")
        if (saved) {
          try {
            savedExplorerState = JSON.parse(saved)
          } catch {
            savedExplorerState = null
          }
        }
      }

      currentExplorerState = folderPaths.map((path) => {
        const isCurrentFolder = isSameFolder(path, currentSlug)
        const isAncestor = isFolderAncestor(path, currentSlug)

        let collapsed: boolean
        if (isAncestor || isCurrentFolder) {
          // Active branch is always expanded
          collapsed = false
        } else if (savedExplorerState) {
          const savedEntry = savedExplorerState.find((s) => s.path === path)
          collapsed = savedEntry ? savedEntry.collapsed : opts.folderDefaultState === "collapsed"
        } else {
          collapsed = opts.folderDefaultState === "collapsed"
        }

        return {
          path,
          collapsed,
        }
      })

      if (opts.useSavedState) {
        const stringifiedFileTree = JSON.stringify(currentExplorerState)
        localStorage.setItem("fileTree_v2", stringifiedFileTree)
      }

      const explorerUl = explorer.querySelector(".explorer-ul")
      if (!explorerUl) continue

      // Create new content FIRST before wiping previous elements
      const fragment = document.createDocumentFragment()
      for (const child of trie.children) {
        const hasSubContent = child.isFolder && child.children.length > 0
        const node = hasSubContent
          ? createFolderNode(currentSlug, child, opts)
          : createFileNode(currentSlug, child)

        fragment.appendChild(node)
      }

      // Only swap if we actually created nodes
      if (fragment.childNodes.length > 0) {
        const overflowEnd = explorerUl.querySelector(".overflow-end")
        Array.from(explorerUl.children).forEach((child) => {
          if (!child.classList.contains("overflow-end")) {
            child.remove()
          }
        })

        if (overflowEnd) {
          explorerUl.insertBefore(fragment, overflowEnd)
        } else {
          explorerUl.appendChild(fragment)
        }
        explorer.dataset.renderedSlug = currentSlug
      }

      // Restore user scroll position if it exists, otherwise bring active element into view if not visible
      requestAnimationFrame(() => {
        const activeElement = explorer.querySelector<HTMLElement>(".active, [aria-current='page']")
        const container = activeElement
          ? getScrollContainer(activeElement)
          : (document.querySelector(".sidebar.left .sidebar-content") as HTMLElement | null)
        const savedScroll = sessionStorage.getItem("explorerScrollTop")

        if (container && savedScroll !== null) {
          container.scrollTop = parseInt(savedScroll, 10)
          sessionStorage.removeItem("explorerScrollTop")
        } else if (activeElement) {
          scrollActiveElementIntoView(activeElement, false)
        }
      })

      // Set up event handlers
      const explorerButtons = explorer.getElementsByClassName(
        "explorer-toggle",
      ) as HTMLCollectionOf<HTMLElement>
      for (const button of explorerButtons) {
        button.addEventListener("click", toggleExplorer)
        safeAddCleanup(() => button.removeEventListener("click", toggleExplorer))
      }

      // Set up folder click handlers
      if (opts.folderClickBehavior === "collapse") {
        const folderButtons = explorer.getElementsByClassName(
          "folder-button",
        ) as HTMLCollectionOf<HTMLElement>
        for (const button of folderButtons) {
          button.addEventListener("click", toggleFolder)
          safeAddCleanup(() => button.removeEventListener("click", toggleFolder))
        }
      }

      const folderIcons = explorer.getElementsByClassName(
        "folder-icon",
      ) as HTMLCollectionOf<HTMLElement>
      for (const icon of folderIcons) {
        icon.addEventListener("click", toggleFolder)
        safeAddCleanup(() => icon.removeEventListener("click", toggleFolder))
      }

      // Close mobile explorer when tapping any navigation link inside
      const explorerContent = explorer.querySelector(".explorer-content")
      if (explorerContent) {
        const handleLinkClick = (e: Event) => {
          const target = e.target as HTMLElement | null
          if (target?.closest("a")) {
            closeMobileExplorer(explorer)
          }
        }
        explorerContent.addEventListener("click", handleLinkClick)
        safeAddCleanup(() => explorerContent.removeEventListener("click", handleLinkClick))
      }
    } catch (err) {
      console.error("setupExplorer error for element:", err)
    }
  }
}

function initExplorer() {
  const currentSlug = (document.body?.dataset?.slug as FullSlug) || getFullSlug(window)
  setupExplorer(currentSlug)
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initExplorer)
} else {
  initExplorer()
}

document.addEventListener("prenav", () => {
  const container = document.querySelector<HTMLElement>(
    ".sidebar.left .sidebar-content, .navbar .explorer-content",
  )
  if (container) {
    sessionStorage.setItem("explorerScrollTop", container.scrollTop.toString())
  }
})

document.addEventListener("nav", async (e: CustomEventMap["nav"]) => {
  const currentSlug = e.detail.url
  await setupExplorer(currentSlug)

  // Only collapse mobile hamburger explorer on navigation
  const mobileNavExplorers = document.querySelectorAll<HTMLElement>(
    ".navbar .explorer, .mobile-only.explorer",
  )
  for (const explorer of mobileNavExplorers) {
    closeMobileExplorer(explorer)
    const mobileExplorer = explorer.querySelector(".mobile-explorer")
    if (mobileExplorer) {
      mobileExplorer.classList.remove("hide-until-loaded")
    }
  }
})

if (!(window as any).__mobileExplorerGlobalListeners) {
  ;(window as any).__mobileExplorerGlobalListeners = true

  document.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "Escape" && document.documentElement.classList.contains("menu-open")) {
      closeMobileExplorer()
    }
  })

  window.addEventListener("resize", function () {
    if (window.innerWidth > 800 && document.documentElement.classList.contains("menu-open")) {
      closeMobileExplorer()
    }
  })
}

function setFolderState(folderElement: HTMLElement, collapsed: boolean) {
  return collapsed ? folderElement.classList.remove("open") : folderElement.classList.add("open")
}
