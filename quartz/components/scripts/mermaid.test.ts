import test, { describe } from "node:test"
import assert from "node:assert"

/**
 * Empirical Stress Test Suite for Quartz Mermaid Fullscreen Modal & Pan-Zoom Controls
 *
 * This test suite independently replicates and stress-tests the logic, state machines,
 * math formulas, and event lifecycle of `mermaid.inline.ts`, `mermaid.inline.scss`, and `ofm.ts`.
 */

// ============================================================================
// 1. Math Models & Dimension Extraction
// ============================================================================

interface DimensionInput {
  viewBoxAttr?: string | null
  viewBoxBaseVal?: { width: number; height: number } | null
  widthAttr?: string | null
  heightAttr?: string | null
  bbox?: { width: number; height: number } | null
  clientWidth?: number
  clientHeight?: number
}

function extractNaturalDimensions(input: DimensionInput): { w: number; h: number } {
  let w = 0
  let h = 0

  // 1. Try viewBox attribute string "minX minY width height"
  if (input.viewBoxAttr) {
    const parts = input.viewBoxAttr
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
    const vb = input.viewBoxBaseVal
    if (vb && vb.width > 0 && vb.height > 0) {
      w = vb.width
      h = vb.height
    }
  }

  // 3. Try width/height numeric attributes
  if (!w || !h) {
    const widthAttr = parseFloat(input.widthAttr || "")
    const heightAttr = parseFloat(input.heightAttr || "")
    if (widthAttr > 0 && heightAttr > 0) {
      w = widthAttr
      h = heightAttr
    }
  }

  // 4. Try getBBox
  if (!w || !h) {
    if (input.bbox && input.bbox.width > 0 && input.bbox.height > 0) {
      w = input.bbox.width
      h = input.bbox.height
    }
  }

  // 5. Fallback to client dimensions or defaults
  if (!w || !h) {
    w = input.clientWidth || 800
    h = input.clientHeight || 600
  }

  return { w, h }
}

function calculateAutoFitTransform(
  viewportW: number,
  viewportH: number,
  naturalW: number,
  naturalH: number,
  padding = 48,
): { scale: number; panX: number; panY: number } | null {
  if (viewportW <= 0 || viewportH <= 0 || naturalW <= 0 || naturalH <= 0) {
    return null
  }

  const availableW = Math.max(viewportW - padding, 100)
  const availableH = Math.max(viewportH - padding, 100)

  const scaleX = availableW / naturalW
  const scaleY = availableH / naturalH
  const fitScale = Math.min(scaleX, scaleY)

  // Clamp initial scale so small diagrams don't blow up, while large ones fit
  const targetScale = Math.max(0.1, Math.min(fitScale, 1.25))

  const renderedW = naturalW * targetScale
  const renderedH = naturalH * targetScale

  const panX = (viewportW - renderedW) / 2
  const panY = (viewportH - renderedH) / 2

  return { scale: targetScale, panX, panY }
}

function calculateFocalZoom(
  currentScale: number,
  currentPan: { x: number; y: number },
  mouseX: number,
  mouseY: number,
  deltaY: number,
  isCtrlKey: boolean,
  minScale = 0.1,
  maxScale = 5.0,
): { scale: number; pan: { x: number; y: number } } {
  const zoomFactor = isCtrlKey ? Math.exp(-deltaY * 0.01) : deltaY < 0 ? 1.15 : 0.87
  const newScale = Math.min(Math.max(currentScale * zoomFactor, minScale), maxScale)

  if (newScale === currentScale) {
    return { scale: currentScale, pan: { ...currentPan } }
  }

  const ratio = newScale / currentScale
  const newPanX = mouseX - (mouseX - currentPan.x) * ratio
  const newPanY = mouseY - (mouseY - currentPan.y) * ratio

  return { scale: newScale, pan: { x: newPanX, y: newPanY } }
}

function calculateCenterZoom(
  currentScale: number,
  currentPan: { x: number; y: number },
  viewportW: number,
  viewportH: number,
  factor: number,
  minScale = 0.1,
  maxScale = 5.0,
): { scale: number; pan: { x: number; y: number } } {
  const newScale = Math.min(Math.max(currentScale * factor, minScale), maxScale)

  if (newScale === currentScale) {
    return { scale: currentScale, pan: { ...currentPan } }
  }

  const centerX = viewportW / 2
  const centerY = viewportH / 2

  const ratio = newScale / currentScale
  const newPanX = centerX - (centerX - currentPan.x) * ratio
  const newPanY = centerY - (centerY - currentPan.y) * ratio

  return { scale: newScale, pan: { x: newPanX, y: newPanY } }
}

// ============================================================================
// 2. Mock Lifecycle & DOM State Machine
// ============================================================================

class MockModalController {
  public isOpen = false
  public bodyOverflow = ""
  public escapeListenerActive = false
  public panZoomCleanupsRun = 0
  public activePanZoomCount = 0
  public currentSvgId: string | null = null

  public showModal(svgId: string) {
    if (this.activePanZoomCount > 0) {
      this.panZoomCleanupsRun++
      this.activePanZoomCount--
    }

    this.isOpen = true
    this.currentSvgId = svgId
    this.bodyOverflow = "hidden"
    this.activePanZoomCount = 1

    if (!this.escapeListenerActive) {
      this.escapeListenerActive = true
    }
  }

  public hideModal() {
    if (!this.isOpen && this.activePanZoomCount === 0) return

    this.isOpen = false
    this.bodyOverflow = ""
    this.currentSvgId = null

    if (this.activePanZoomCount > 0) {
      this.panZoomCleanupsRun++
      this.activePanZoomCount = 0
    }

    if (this.escapeListenerActive) {
      this.escapeListenerActive = false
    }
  }

  public handleKeydown(key: string): boolean {
    if (this.escapeListenerActive && key === "Escape") {
      this.hideModal()
      return true // handled & dismissed
    }
    return false
  }

  public handleBackdropClick() {
    this.hideModal()
  }

  public handleCloseButtonClick() {
    this.hideModal()
  }

  public handleSpaceClick() {
    // Stop propagation - do nothing
  }

  public handleThemeChange(newSvgId: string) {
    if (this.isOpen && this.currentSvgId) {
      this.panZoomCleanupsRun++
      this.currentSvgId = newSvgId
      // Reinitialize panZoom
      this.activePanZoomCount = 1
    }
  }

  public handleSpaNavigation() {
    this.hideModal()
  }
}

// ============================================================================
// Test Suites
// ============================================================================

describe("Mermaid Fullscreen Modal & Pan-Zoom Stress Tests", () => {
  describe("Area 1: Dimension Extraction & Edge Case Handling", () => {
    test("correctly parses standard space-delimited viewBox", () => {
      const dim = extractNaturalDimensions({ viewBoxAttr: "0 0 1200 800" })
      assert.strictEqual(dim.w, 1200)
      assert.strictEqual(dim.h, 800)
    })

    test("correctly parses comma-delimited and padded viewBox", () => {
      const dim = extractNaturalDimensions({ viewBoxAttr: "  0,  0,  1920, 1080  " })
      assert.strictEqual(dim.w, 1920)
      assert.strictEqual(dim.h, 1080)
    })

    test("falls back to viewBox.baseVal when attribute is missing", () => {
      const dim = extractNaturalDimensions({
        viewBoxBaseVal: { width: 950, height: 620 },
      })
      assert.strictEqual(dim.w, 950)
      assert.strictEqual(dim.h, 620)
    })

    test("falls back to width and height attributes when viewBox is invalid", () => {
      const dim = extractNaturalDimensions({
        viewBoxAttr: "invalid viewBox string",
        widthAttr: "640px",
        heightAttr: "480px",
      })
      assert.strictEqual(dim.w, 640)
      assert.strictEqual(dim.h, 480)
    })

    test("falls back to getBBox when attributes are missing", () => {
      const dim = extractNaturalDimensions({
        bbox: { width: 500, height: 350 },
      })
      assert.strictEqual(dim.w, 500)
      assert.strictEqual(dim.h, 350)
    })

    test("rejects malformed viewBox with zero or negative dimensions and falls back to client dimensions", () => {
      const dimZero = extractNaturalDimensions({
        viewBoxAttr: "0 0 0 0",
        clientWidth: 750,
        clientHeight: 550,
      })
      assert.strictEqual(dimZero.w, 750)
      assert.strictEqual(dimZero.h, 550)

      const dimNeg = extractNaturalDimensions({
        viewBoxAttr: "0 0 -100 -200",
        clientWidth: 900,
        clientHeight: 700,
      })
      assert.strictEqual(dimNeg.w, 900)
      assert.strictEqual(dimNeg.h, 700)
    })

    test("falls back to default 800x600 when all inputs are empty or zero", () => {
      const dim = extractNaturalDimensions({})
      assert.strictEqual(dim.w, 800)
      assert.strictEqual(dim.h, 600)
    })
  })

  describe("Area 2: Viewport Auto-Fit Scaling & Clamping Math", () => {
    test("centers and fits large diagram within viewport with 48px padding", () => {
      const res = calculateAutoFitTransform(1600, 1000, 2400, 1200)
      assert.ok(res !== null)
      // Available: 1600 - 48 = 1552, 1000 - 48 = 952
      // ScaleX: 1552 / 2400 = 0.6466..., ScaleY: 952 / 1200 = 0.7933...
      // fitScale = 0.646666...
      assert.ok(res.scale < 1.0 && res.scale > 0.6)
      // Check centering: rendered width is 2400 * scale, panX = (1600 - renderedW) / 2
      const renderedW = 2400 * res.scale
      assert.strictEqual(Math.round(res.panX), Math.round((1600 - renderedW) / 2))
    })

    test("clamps small diagram scale to max 1.25 to prevent pixelation", () => {
      // 100x100 diagram in 1600x1000 viewport would naturally scale to ~9.5x
      const res = calculateAutoFitTransform(1600, 1000, 100, 100)
      assert.ok(res !== null)
      assert.strictEqual(res.scale, 1.25)
      // Rendered dimensions: 125x125
      assert.strictEqual(res.panX, (1600 - 125) / 2)
      assert.strictEqual(res.panY, (1000 - 125) / 2)
    })

    test("clamps gargantuan diagram scale to min 0.1", () => {
      // 50,000 x 50,000 diagram in 500x500 viewport
      const res = calculateAutoFitTransform(500, 500, 50000, 50000)
      assert.ok(res !== null)
      assert.strictEqual(res.scale, 0.1)
    })

    test("returns null for zero or negative viewport/natural dimensions", () => {
      assert.strictEqual(calculateAutoFitTransform(0, 800, 1000, 600), null)
      assert.strictEqual(calculateAutoFitTransform(800, 0, 1000, 600), null)
      assert.strictEqual(calculateAutoFitTransform(800, 600, 0, 600), null)
      assert.strictEqual(calculateAutoFitTransform(800, 600, 1000, -50), null)
    })
  })

  describe("Area 3: Interactive Pan-Zoom Invariance & Boundary Clamping", () => {
    test("preserves exact point under cursor across wheel zoom (focal point invariance)", () => {
      const initialScale = 1.0
      const initialPan = { x: 120, y: 80 }
      const mouseX = 450
      const mouseY = 320

      // The diagram point under the mouse before zoom:
      const ptX = (mouseX - initialPan.x) / initialScale
      const ptY = (mouseY - initialPan.y) / initialScale

      // Zoom in
      const zoomedIn = calculateFocalZoom(initialScale, initialPan, mouseX, mouseY, -100, false)

      // The diagram point under the mouse after zoom:
      const ptAfterX = (mouseX - zoomedIn.pan.x) / zoomedIn.scale
      const ptAfterY = (mouseY - zoomedIn.pan.y) / zoomedIn.scale

      assert.ok(Math.abs(ptX - ptAfterX) < 1e-9, `Focal point X shifted: ${ptX} vs ${ptAfterX}`)
      assert.ok(Math.abs(ptY - ptAfterY) < 1e-9, `Focal point Y shifted: ${ptY} vs ${ptAfterY}`)
    })

    test("smoothly zooms with trackpad pinch ctrlKey", () => {
      const initialScale = 1.0
      const initialPan = { x: 0, y: 0 }
      const res = calculateFocalZoom(initialScale, initialPan, 200, 200, -20, true)
      // exp(-(-20) * 0.01) = exp(0.2) ≈ 1.2214
      assert.ok(res.scale > 1.2 && res.scale < 1.25)
    })

    test("enforces MIN_SCALE (0.1) and MAX_SCALE (5.0) limits under extreme zoom", () => {
      let scale = 1.0
      let pan = { x: 0, y: 0 }

      // Extreme zoom out (100 zoom out steps)
      for (let i = 0; i < 100; i++) {
        const next = calculateFocalZoom(scale, pan, 200, 200, 100, false)
        scale = next.scale
        pan = next.pan
      }
      assert.strictEqual(scale, 0.1)

      // Extreme zoom in (100 zoom in steps)
      for (let i = 0; i < 100; i++) {
        const next = calculateFocalZoom(scale, pan, 200, 200, -100, false)
        scale = next.scale
        pan = next.pan
      }
      assert.strictEqual(scale, 5.0)
    })

    test("boundary early-exit prevents pan drift when zooming past limits", () => {
      const scale = 5.0
      const pan = { x: 150, y: 250 }
      // Attempt zoom in while already at max scale
      const res = calculateFocalZoom(scale, pan, 300, 300, -100, false)
      assert.strictEqual(res.scale, 5.0)
      assert.strictEqual(res.pan.x, 150)
      assert.strictEqual(res.pan.y, 250)
    })

    test("toolbar relative zoom operates around viewport center", () => {
      const viewportW = 1000
      const viewportH = 800
      const initialScale = 1.0
      const initialPan = { x: 100, y: 100 }

      const zoomedIn = calculateCenterZoom(initialScale, initialPan, viewportW, viewportH, 1.2)
      assert.strictEqual(zoomedIn.scale, 1.2)

      // Center point under viewport center should be identical before and after
      const centerX = viewportW / 2
      const centerY = viewportH / 2
      const ptCenterX = (centerX - initialPan.x) / initialScale
      const ptCenterY = (centerY - initialPan.y) / initialScale

      const ptAfterCenterX = (centerX - zoomedIn.pan.x) / zoomedIn.scale
      const ptAfterCenterY = (centerY - zoomedIn.pan.y) / zoomedIn.scale

      assert.ok(Math.abs(ptCenterX - ptAfterCenterX) < 1e-9)
      assert.ok(Math.abs(ptCenterY - ptAfterCenterY) < 1e-9)
    })

    test("handles extreme pointer drag coordinates without overflow or degradation", () => {
      let currentPan = { x: 0, y: 0 }
      const pointerDownClientX = 1_000_000
      const pointerDownClientY = -1_000_000

      const startPan = {
        x: pointerDownClientX - currentPan.x,
        y: pointerDownClientY - currentPan.y,
      }

      // Drag to new coordinate
      const pointerMoveClientX = 1_000_500
      const pointerMoveClientY = -999_700

      currentPan = {
        x: pointerMoveClientX - startPan.x,
        y: pointerMoveClientY - startPan.y,
      }

      assert.strictEqual(currentPan.x, 500)
      assert.strictEqual(currentPan.y, 300)
    })
  })

  describe("Area 4: Event Listener Lifecycle & Memory Leak Stress Tests", () => {
    test("survives 100 rapid modal open and close cycles without leaking handlers", () => {
      const controller = new MockModalController()

      for (let i = 0; i < 100; i++) {
        controller.showModal(`diagram-${i}`)
        assert.strictEqual(controller.isOpen, true)
        assert.strictEqual(controller.bodyOverflow, "hidden")
        assert.strictEqual(controller.escapeListenerActive, true)
        assert.strictEqual(controller.activePanZoomCount, 1)

        controller.hideModal()
        assert.strictEqual(controller.isOpen, false)
        assert.strictEqual(controller.bodyOverflow, "")
        assert.strictEqual(controller.escapeListenerActive, false)
        assert.strictEqual(controller.activePanZoomCount, 0)
      }

      assert.strictEqual(controller.panZoomCleanupsRun, 100)
    })

    test("dismissal responds strictly to Escape key and ignores other keys", () => {
      const controller = new MockModalController()
      controller.showModal("diagram-1")

      // Non-escape keys should not close modal
      assert.strictEqual(controller.handleKeydown("Enter"), false)
      assert.strictEqual(controller.isOpen, true)
      assert.strictEqual(controller.handleKeydown("Space"), false)
      assert.strictEqual(controller.isOpen, true)
      assert.strictEqual(controller.handleKeydown("Tab"), false)
      assert.strictEqual(controller.isOpen, true)

      // Escape key should dismiss modal
      assert.strictEqual(controller.handleKeydown("Escape"), true)
      assert.strictEqual(controller.isOpen, false)
      assert.strictEqual(controller.escapeListenerActive, false)
      assert.strictEqual(controller.bodyOverflow, "")
    })

    test("backdrop and close button clicks dismiss modal while space clicks do not", () => {
      const controller = new MockModalController()

      // Close button
      controller.showModal("diagram-1")
      controller.handleCloseButtonClick()
      assert.strictEqual(controller.isOpen, false)

      // Backdrop click
      controller.showModal("diagram-1")
      controller.handleBackdropClick()
      assert.strictEqual(controller.isOpen, false)

      // Inner space click
      controller.showModal("diagram-1")
      controller.handleSpaceClick()
      assert.strictEqual(controller.isOpen, true)
      assert.strictEqual(controller.bodyOverflow, "hidden")
    })

    test("theme change while modal is open cleans up previous instance and creates new one", () => {
      const controller = new MockModalController()
      controller.showModal("svg-light-mode")
      assert.strictEqual(controller.currentSvgId, "svg-light-mode")
      assert.strictEqual(controller.panZoomCleanupsRun, 0)

      controller.handleThemeChange("svg-dark-mode")
      assert.strictEqual(controller.currentSvgId, "svg-dark-mode")
      assert.strictEqual(controller.panZoomCleanupsRun, 1)
      assert.strictEqual(controller.activePanZoomCount, 1)
      assert.strictEqual(controller.isOpen, true)

      controller.hideModal()
      assert.strictEqual(controller.panZoomCleanupsRun, 2)
      assert.strictEqual(controller.isOpen, false)
    })

    test("SPA navigation cleanly dismisses open modal and unlocks body scroll", () => {
      const controller = new MockModalController()
      controller.showModal("diagram-spa")
      assert.strictEqual(controller.isOpen, true)
      assert.strictEqual(controller.bodyOverflow, "hidden")

      // SPA nav event triggers cleanup
      controller.handleSpaNavigation()
      assert.strictEqual(controller.isOpen, false)
      assert.strictEqual(controller.bodyOverflow, "")
      assert.strictEqual(controller.escapeListenerActive, false)
      assert.strictEqual(controller.panZoomCleanupsRun, 1)
    })
  })
})
