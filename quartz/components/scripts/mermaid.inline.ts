import { removeAllChildren } from "./util"

interface Position {
  x: number
  y: number
}

interface PanZoomControls {
  zoomInBtn: HTMLButtonElement
  zoomOutBtn: HTMLButtonElement
  resetBtn: HTMLButtonElement
}

class DiagramPanZoom {
  private isDragging = false
  private startPan: Position = { x: 0, y: 0 }
  private currentPan: Position = { x: 0, y: 0 }
  private scale = 1
  private naturalW = 800
  private naturalH = 600
  private readonly MIN_SCALE = 0.1
  private readonly MAX_SCALE = 5.0
  private cleanups: (() => void)[] = []

  constructor(
    private viewport: HTMLElement,
    private content: HTMLElement,
    private svg: SVGSVGElement,
    private controls: PanZoomControls,
  ) {
    this.extractNaturalDimensions()
    this.setupEventListeners()
    this.resetTransform()
  }

  private extractNaturalDimensions() {
    let w = 0
    let h = 0

    // 1. Try viewBox attribute string "minX minY width height"
    const vbAttr = this.svg.getAttribute("viewBox")
    if (vbAttr) {
      const parts = vbAttr
        .trim()
        .split(/[\s,]+/)
        .map(Number)
      if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
        w = parts[2]
        h = parts[3]
      }
    }

    // 2. Try SVG viewBox.baseVal
    if (!w || !h) {
      const vb = this.svg.viewBox?.baseVal
      if (vb && vb.width > 0 && vb.height > 0) {
        w = vb.width
        h = vb.height
      }
    }

    // 3. Try width/height numeric attributes
    if (!w || !h) {
      const widthAttr = parseFloat(this.svg.getAttribute("width") || "")
      const heightAttr = parseFloat(this.svg.getAttribute("height") || "")
      if (widthAttr > 0 && heightAttr > 0) {
        w = widthAttr
        h = heightAttr
      }
    }

    // 4. Try getBBox
    if (!w || !h) {
      try {
        const bbox = this.svg.getBBox?.()
        if (bbox && bbox.width > 0 && bbox.height > 0) {
          w = bbox.width
          h = bbox.height
        }
      } catch {
        // getBBox may fail if SVG is detached
      }
    }

    // 5. Fallback to client dimensions or defaults
    if (!w || !h) {
      w = this.svg.clientWidth || 800
      h = this.svg.clientHeight || 600
    }

    this.naturalW = w
    this.naturalH = h

    // Normalize SVG styling so CSS container layout does not squeeze it
    this.svg.style.width = `${w}px`
    this.svg.style.height = `${h}px`
    this.svg.style.maxWidth = "none"
    this.svg.style.maxHeight = "none"
    this.svg.style.display = "block"
  }

  private setupEventListeners() {
    const onPointerDown = this.onPointerDown.bind(this)
    const onPointerMove = this.onPointerMove.bind(this)
    const onPointerUp = this.onPointerUp.bind(this)
    const onWheel = this.onWheel.bind(this)
    const onResize = this.resetTransform.bind(this)

    this.viewport.addEventListener("pointerdown", onPointerDown)
    this.viewport.addEventListener("pointermove", onPointerMove)
    this.viewport.addEventListener("pointerup", onPointerUp)
    this.viewport.addEventListener("pointercancel", onPointerUp)
    this.viewport.addEventListener("wheel", onWheel, { passive: false })
    window.addEventListener("resize", onResize)

    const onZoomIn = () => this.zoomRelative(1.2)
    const onZoomOut = () => this.zoomRelative(0.8)
    const onReset = () => this.resetTransform()

    this.controls.zoomInBtn.addEventListener("click", onZoomIn)
    this.controls.zoomOutBtn.addEventListener("click", onZoomOut)
    this.controls.resetBtn.addEventListener("click", onReset)

    this.cleanups.push(() => {
      this.viewport.removeEventListener("pointerdown", onPointerDown)
      this.viewport.removeEventListener("pointermove", onPointerMove)
      this.viewport.removeEventListener("pointerup", onPointerUp)
      this.viewport.removeEventListener("pointercancel", onPointerUp)
      this.viewport.removeEventListener("wheel", onWheel)
      window.removeEventListener("resize", onResize)

      this.controls.zoomInBtn.removeEventListener("click", onZoomIn)
      this.controls.zoomOutBtn.removeEventListener("click", onZoomOut)
      this.controls.resetBtn.removeEventListener("click", onReset)
    })
  }

  private onPointerDown(e: PointerEvent) {
    if (e.button !== 0) return // Left click / primary pointer only
    if ((e.target as HTMLElement).closest(".mermaid-controls, .mermaid-modal-close")) return

    this.isDragging = true
    this.startPan = {
      x: e.clientX - this.currentPan.x,
      y: e.clientY - this.currentPan.y,
    }
    this.viewport.setPointerCapture(e.pointerId)
    this.viewport.classList.add("grabbing")
    this.viewport.style.cursor = "grabbing"
  }

  private onPointerMove(e: PointerEvent) {
    if (!this.isDragging) return
    e.preventDefault()

    this.currentPan = {
      x: e.clientX - this.startPan.x,
      y: e.clientY - this.startPan.y,
    }
    this.updateTransform()
  }

  private onPointerUp(e: PointerEvent) {
    if (!this.isDragging) return
    this.isDragging = false
    this.viewport.classList.remove("grabbing")
    this.viewport.style.cursor = "grab"
    try {
      this.viewport.releasePointerCapture(e.pointerId)
    } catch {}
  }

  private onWheel(e: WheelEvent) {
    e.preventDefault()
    e.stopPropagation()

    // Handle trackpad pinch (ctrlKey) and mouse wheel
    const zoomFactor = e.ctrlKey ? Math.exp(-e.deltaY * 0.01) : e.deltaY < 0 ? 1.15 : 0.87

    const newScale = Math.min(Math.max(this.scale * zoomFactor, this.MIN_SCALE), this.MAX_SCALE)
    if (newScale === this.scale) return

    // Cursor-centered focal point zoom
    const rect = this.viewport.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const ratio = newScale / this.scale
    this.currentPan.x = mouseX - (mouseX - this.currentPan.x) * ratio
    this.currentPan.y = mouseY - (mouseY - this.currentPan.y) * ratio
    this.scale = newScale

    this.updateTransform()
  }

  private zoomRelative(factor: number) {
    const newScale = Math.min(Math.max(this.scale * factor, this.MIN_SCALE), this.MAX_SCALE)
    if (newScale === this.scale) return

    // Zoom around viewport center
    const centerX = this.viewport.clientWidth / 2
    const centerY = this.viewport.clientHeight / 2

    const ratio = newScale / this.scale
    this.currentPan.x = centerX - (centerX - this.currentPan.x) * ratio
    this.currentPan.y = centerY - (centerY - this.currentPan.y) * ratio
    this.scale = newScale

    this.updateTransform()
  }

  public resetTransform() {
    const viewportW = this.viewport.clientWidth
    const viewportH = this.viewport.clientHeight
    if (viewportW <= 0 || viewportH <= 0) return

    const padding = 48
    const availableW = Math.max(viewportW - padding, 100)
    const availableH = Math.max(viewportH - padding, 100)

    const scaleX = availableW / this.naturalW
    const scaleY = availableH / this.naturalH
    const fitScale = Math.min(scaleX, scaleY)

    // Clamp initial scale so small diagrams don't blow up, while large ones fit
    const targetScale = Math.max(0.1, Math.min(fitScale, 1.25))

    const renderedW = this.naturalW * targetScale
    const renderedH = this.naturalH * targetScale

    const panX = (viewportW - renderedW) / 2
    const panY = (viewportH - renderedH) / 2

    this.scale = targetScale
    this.currentPan = { x: panX, y: panY }
    this.updateTransform()
  }

  private updateTransform() {
    this.content.style.transform = `translate(${this.currentPan.x}px, ${this.currentPan.y}px) scale(${this.scale})`
  }

  public cleanup() {
    for (const cleanup of this.cleanups) {
      cleanup()
    }
    this.cleanups = []
    this.isDragging = false
    this.viewport.classList.remove("grabbing")
    this.viewport.style.cursor = "grab"
  }
}

interface ModalElements {
  modal: HTMLElement
  backdrop: HTMLElement
  space: HTMLElement
  viewport: HTMLElement
  content: HTMLElement
  closeBtn: HTMLButtonElement
  zoomInBtn: HTMLButtonElement
  zoomOutBtn: HTMLButtonElement
  resetBtn: HTMLButtonElement
}

let modalElements: ModalElements | null = null
let activePanZoom: DiagramPanZoom | null = null
let activeEscapeHandler: ((e: KeyboardEvent) => void) | null = null
let currentOpenCodeBlock: HTMLElement | null = null

function getOrCreateModal(): ModalElements {
  let modal = document.getElementById("mermaid-modal")
  if (!modal) {
    modal = document.createElement("div")
    modal.id = "mermaid-modal"
    modal.className = "mermaid-modal"
    modal.setAttribute("role", "dialog")
    modal.setAttribute("aria-modal", "true")
    modal.setAttribute("aria-label", "Diagram Fullscreen View")
    modal.style.display = "none"

    const backdrop = document.createElement("div")
    backdrop.className = "mermaid-modal-backdrop"

    const space = document.createElement("div")
    space.id = "mermaid-space"
    space.className = "mermaid-modal-space"

    const closeBtn = document.createElement("button")
    closeBtn.className = "mermaid-modal-close"
    closeBtn.setAttribute("aria-label", "Close fullscreen view")
    closeBtn.title = "Close (Esc)"
    closeBtn.textContent = "×"

    const viewport = document.createElement("div")
    viewport.className = "mermaid-modal-viewport"

    const content = document.createElement("div")
    content.className = "mermaid-content"

    viewport.appendChild(content)

    const controls = document.createElement("div")
    controls.className = "mermaid-controls"
    controls.setAttribute("role", "toolbar")
    controls.setAttribute("aria-label", "Diagram zoom controls")

    const zoomOutBtn = document.createElement("button")
    zoomOutBtn.className = "mermaid-control-button"
    zoomOutBtn.dataset.action = "zoom-out"
    zoomOutBtn.setAttribute("aria-label", "Zoom out")
    zoomOutBtn.title = "Zoom out (−)"
    zoomOutBtn.textContent = "−"

    const resetBtn = document.createElement("button")
    resetBtn.className = "mermaid-control-button reset-btn"
    resetBtn.dataset.action = "reset"
    resetBtn.setAttribute("aria-label", "Fit to screen")
    resetBtn.title = "Fit to screen"
    resetBtn.textContent = "Fit"

    const zoomInBtn = document.createElement("button")
    zoomInBtn.className = "mermaid-control-button"
    zoomInBtn.dataset.action = "zoom-in"
    zoomInBtn.setAttribute("aria-label", "Zoom in")
    zoomInBtn.title = "Zoom in (+)"
    zoomInBtn.textContent = "+"

    controls.appendChild(zoomOutBtn)
    controls.appendChild(resetBtn)
    controls.appendChild(zoomInBtn)

    space.appendChild(closeBtn)
    space.appendChild(viewport)
    space.appendChild(controls)

    modal.appendChild(backdrop)
    modal.appendChild(space)

    // Dismissal handlers
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      hideModal()
    })

    backdrop.addEventListener("click", () => {
      hideModal()
    })

    modal.addEventListener("click", (e) => {
      if (e.target === modal || e.target === backdrop) {
        hideModal()
      }
    })

    space.addEventListener("click", (e) => {
      e.stopPropagation()
    })

    document.body.appendChild(modal)
  }

  const backdrop = modal.querySelector(".mermaid-modal-backdrop") as HTMLElement
  const space = modal.querySelector("#mermaid-space") as HTMLElement
  const closeBtn = modal.querySelector(".mermaid-modal-close") as HTMLButtonElement
  const viewport = modal.querySelector(".mermaid-modal-viewport") as HTMLElement
  const content = modal.querySelector(".mermaid-content") as HTMLElement
  const zoomInBtn = modal.querySelector('[data-action="zoom-in"]') as HTMLButtonElement
  const zoomOutBtn = modal.querySelector('[data-action="zoom-out"]') as HTMLButtonElement
  const resetBtn = modal.querySelector('[data-action="reset"]') as HTMLButtonElement

  modalElements = {
    modal,
    backdrop,
    space,
    viewport,
    content,
    closeBtn,
    zoomInBtn,
    zoomOutBtn,
    resetBtn,
  }

  return modalElements
}

function showModalForCodeBlock(codeBlock: HTMLElement) {
  const modalEl = getOrCreateModal()
  const svg = codeBlock.querySelector("svg")
  if (!svg) return

  currentOpenCodeBlock = codeBlock

  // Clean up any existing panZoom
  activePanZoom?.cleanup()
  activePanZoom = null

  // Clone SVG
  removeAllChildren(modalEl.content)
  const clonedSvg = svg.cloneNode(true) as SVGSVGElement
  modalEl.content.appendChild(clonedSvg)

  // Show modal
  modalEl.modal.style.display = "flex"
  modalEl.modal.classList.add("active")
  modalEl.viewport.style.cursor = "grab"

  // Lock body scroll
  document.body.style.overflow = "hidden"

  // Initialize PanZoom
  activePanZoom = new DiagramPanZoom(modalEl.viewport, modalEl.content, clonedSvg, {
    zoomInBtn: modalEl.zoomInBtn,
    zoomOutBtn: modalEl.zoomOutBtn,
    resetBtn: modalEl.resetBtn,
  })

  // Escape key dismiss
  if (!activeEscapeHandler) {
    activeEscapeHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        hideModal()
      }
    }
    document.addEventListener("keydown", activeEscapeHandler)
  }
}

function hideModal() {
  if (!modalElements) return
  const { modal, content } = modalElements

  modal.style.display = "none"
  modal.classList.remove("active")

  // Unlock body scroll
  document.body.style.overflow = ""

  // Cleanup panZoom
  activePanZoom?.cleanup()
  activePanZoom = null
  currentOpenCodeBlock = null

  // Remove Escape key listener
  if (activeEscapeHandler) {
    document.removeEventListener("keydown", activeEscapeHandler)
    activeEscapeHandler = null
  }

  removeAllChildren(content)
}

const SYSTEM_FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif'

let mermaidImport: any = undefined
const textMapping: WeakMap<HTMLElement, string> = new WeakMap()

async function getMermaidInstance() {
  mermaidImport ||= await import(
    // @ts-ignore
    "https://cdnjs.cloudflare.com/ajax/libs/mermaid/12.3.0/mermaid.esm.min.mjs"
  )
  return mermaidImport.default
}

function normalizeRenderedSvg(svg: SVGSVGElement) {
  // 1. Prevent foreignObject bounding boxes from clipping descenders or subpixel glyph overflow
  const foreignObjects = svg.querySelectorAll<SVGForeignObjectElement>("foreignObject")
  for (const fo of Array.from(foreignObjects)) {
    fo.style.overflow = "visible"
  }

  // 2. Expand SVG viewBox if any rendered element (pie legend, axis label, outer stroke) extends outside it
  try {
    const bbox = svg.getBBox()
    if (bbox && bbox.width > 0 && bbox.height > 0) {
      const pad = 12
      const vbAttr = svg.getAttribute("viewBox")
      if (vbAttr) {
        const parts = vbAttr
          .trim()
          .split(/[\s,]+/)
          .map(Number)
        if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
          const [vbX, vbY, vbW, vbH] = parts
          const minX = Math.min(vbX, bbox.x - pad)
          const minY = Math.min(vbY, bbox.y - pad)
          const maxX = Math.max(vbX + vbW, bbox.x + bbox.width + pad)
          const maxY = Math.max(vbY + vbH, bbox.y + bbox.height + pad)
          const newW = maxX - minX
          const newH = maxY - minY
          svg.setAttribute("viewBox", `${minX} ${minY} ${newW} ${newH}`)
          if (svg.style.maxWidth) {
            svg.style.maxWidth = `${newW}px`
          }
        }
      }
    }
  } catch {
    // getBBox can throw if SVG is hidden or detached
  }
}

function wireExpandButtons(nodes: HTMLElement[]) {
  for (let i = 0; i < nodes.length; i++) {
    const codeBlock = nodes[i] as HTMLElement
    const pre = codeBlock.parentElement as HTMLPreElement | null
    if (!pre) continue

    const clipboardBtn = pre.querySelector(".clipboard-button") as HTMLButtonElement | null
    const expandBtn = pre.querySelector(".expand-button") as HTMLButtonElement | null
    if (!expandBtn) continue

    if (clipboardBtn) {
      const clipboardStyle = window.getComputedStyle(clipboardBtn)
      const clipboardWidth =
        clipboardBtn.offsetWidth +
        parseFloat(clipboardStyle.marginLeft || "0") +
        parseFloat(clipboardStyle.marginRight || "0")
      expandBtn.style.right = `calc(${clipboardWidth}px + 0.3rem)`
    } else {
      expandBtn.style.right = "0.3rem"
    }
    pre.prepend(expandBtn)

    if (!(expandBtn as any)._hasExpandClick) {
      ;(expandBtn as any)._hasExpandClick = true
      expandBtn.addEventListener("click", () => showModalForCodeBlock(codeBlock))
    }
  }
}

let isRenderingMermaid = false
let hasPendingMermaidRender = false

async function renderAllMermaid() {
  const nodes = Array.from(
    document.querySelectorAll<HTMLElement>(".center code.mermaid, #split-pane-body code.mermaid"),
  )
  if (nodes.length === 0) return

  if (isRenderingMermaid) {
    hasPendingMermaidRender = true
    return
  }

  isRenderingMermaid = true
  try {
    const mermaid = await getMermaidInstance()
    await document.fonts?.ready

    for (const node of nodes) {
      if (!textMapping.has(node)) {
        let rawText = ""
        if (node.dataset.clipboard) {
          try {
            rawText = JSON.parse(node.dataset.clipboard)
          } catch {
            rawText = node.textContent || node.innerText
          }
        } else {
          rawText = node.textContent || node.innerText
        }
        textMapping.set(node, rawText)
      }
    }

    // De-init any previously processed diagrams
    for (const node of nodes) {
      node.removeAttribute("data-processed")
      const oldText = textMapping.get(node)
      if (oldText) {
        node.textContent = oldText
      }
    }

    const darkMode = document.documentElement.getAttribute("saved-theme") === "dark"
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "loose",
      look: "classic",
      theme: darkMode ? "dark" : "neutral",
      fontFamily: SYSTEM_FONT,
      themeVariables: {
        fontFamily: SYSTEM_FONT,
        fontSize: "14px",
      },
      flowchart: {
        htmlLabels: true,
        curve: "basis",
        padding: 15,
        wrappingWidth: 220,
        subGraphTitleMargin: {
          top: 10,
          bottom: 18,
        },
      },
      quadrantChart: {
        chartWidth: 640,
        chartHeight: 520,
        titleFontSize: 18,
        quadrantLabelFontSize: 14,
        xAxisLabelFontSize: 13,
        yAxisLabelFontSize: 13,
        pointLabelFontSize: 12,
        quadrantTextTopPadding: 10,
      },
    })

    await mermaid.run({ nodes })

    for (const node of nodes) {
      const svg = node.querySelector<SVGSVGElement>("svg")
      if (svg) {
        normalizeRenderedSvg(svg)
      }
    }

    // If modal is open during theme change, refresh the cloned SVG
    if (modalElements?.modal.classList.contains("active") && currentOpenCodeBlock) {
      const newSvg = currentOpenCodeBlock.querySelector("svg")
      if (newSvg) {
        removeAllChildren(modalElements.content)
        const clonedSvg = newSvg.cloneNode(true) as SVGSVGElement
        modalElements.content.appendChild(clonedSvg)
        activePanZoom?.cleanup()
        activePanZoom = new DiagramPanZoom(
          modalElements.viewport,
          modalElements.content,
          clonedSvg,
          {
            zoomInBtn: modalElements.zoomInBtn,
            zoomOutBtn: modalElements.zoomOutBtn,
            resetBtn: modalElements.resetBtn,
          },
        )
      }
    }

    wireExpandButtons(nodes)
  } finally {
    isRenderingMermaid = false
    if (hasPendingMermaidRender) {
      hasPendingMermaidRender = false
      await renderAllMermaid()
    }
  }
}

document.addEventListener("nav", async () => {
  hideModal()
  await renderAllMermaid()
})

document.addEventListener("splitviewloaded", async () => {
  await renderAllMermaid()
})

document.addEventListener("themechange", async () => {
  await renderAllMermaid()
})

if (document.readyState !== "loading") {
  renderAllMermaid()
}
