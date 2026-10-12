import { FileTrieNode } from "../../util/fileTrie"
import { FullSlug, resolveRelative, simplifySlug } from "../../util/path"
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

function createFileNode(currentSlug: FullSlug, node: FileTrieNode): HTMLLIElement {
  const template = document.getElementById("template-file") as HTMLTemplateElement
  const clone = template.content.cloneNode(true) as DocumentFragment
  const li = clone.querySelector("li") as HTMLLIElement
  const a = li.querySelector("a") as HTMLAnchorElement
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
  const template = document.getElementById("template-folder") as HTMLTemplateElement
  const clone = template.content.cloneNode(true) as DocumentFragment
  const li = clone.querySelector("li") as HTMLLIElement
  const folderContainer = li.querySelector(".folder-container") as HTMLElement
  const titleContainer = folderContainer.querySelector("div") as HTMLElement
  const folderOuter = li.querySelector(".folder-outer") as HTMLElement
  const ul = folderOuter.querySelector("ul") as HTMLUListElement

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
    const button = titleContainer.querySelector(".folder-button") as HTMLElement
    const a = document.createElement("a")
    a.href = resolveRelative(currentSlug, folderPath)
    a.dataset.for = folderPath
    a.className = "folder-title"
    if (isCurrentFolder) {
      a.classList.add("active")
      a.setAttribute("aria-current", "page")
    }
    a.textContent = node.displayName
    button.replaceWith(a)
  } else {
    const span = titleContainer.querySelector(".folder-title") as HTMLElement
    span.textContent = node.displayName
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

  for (const explorer of allExplorers) {
    const isDesktopSidebar =
      explorer.closest(".sidebar") !== null || explorer.classList.contains("desktop-only")
    if (isDesktopSidebar) {
      explorer.classList.remove("collapsed")
      explorer.setAttribute("aria-expanded", "true")
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

    const data = await fetchData
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

    // Remove previous dynamic items (keep overflow-end if present)
    const overflowEnd = explorerUl.querySelector(".overflow-end")
    Array.from(explorerUl.children).forEach((child) => {
      if (!child.classList.contains("overflow-end")) {
        child.remove()
      }
    })

    // Create and insert new content
    const fragment = document.createDocumentFragment()
    for (const child of trie.children) {
      const hasSubContent = child.isFolder && child.children.length > 0
      const node = hasSubContent
        ? createFolderNode(currentSlug, child, opts)
        : createFileNode(currentSlug, child)

      fragment.appendChild(node)
    }

    if (overflowEnd) {
      explorerUl.insertBefore(fragment, overflowEnd)
    } else {
      explorerUl.appendChild(fragment)
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
      window.addCleanup(() => button.removeEventListener("click", toggleExplorer))
    }

    // Set up folder click handlers
    if (opts.folderClickBehavior === "collapse") {
      const folderButtons = explorer.getElementsByClassName(
        "folder-button",
      ) as HTMLCollectionOf<HTMLElement>
      for (const button of folderButtons) {
        button.addEventListener("click", toggleFolder)
        window.addCleanup(() => button.removeEventListener("click", toggleFolder))
      }
    }

    const folderIcons = explorer.getElementsByClassName(
      "folder-icon",
    ) as HTMLCollectionOf<HTMLElement>
    for (const icon of folderIcons) {
      icon.addEventListener("click", toggleFolder)
      window.addCleanup(() => icon.removeEventListener("click", toggleFolder))
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
      window.addCleanup(() => explorerContent.removeEventListener("click", handleLinkClick))
    }
  }
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
