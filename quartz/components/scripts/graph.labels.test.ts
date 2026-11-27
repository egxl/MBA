import test, { describe } from "node:test"
import assert from "node:assert/strict"
import {
  cullOverlappingLabels,
  getLabelScale,
  truncateLabel,
  type LabelCandidate,
} from "./graph.labels"

describe("graph.labels", () => {
  describe("getLabelScale", () => {
    test("counter-scales monotonically as zoom increases", () => {
      const s1 = getLabelScale(0.9, 1)
      const s2 = getLabelScale(0.9, 2)
      const s4 = getLabelScale(0.9, 4)
      const s8 = getLabelScale(0.9, 8)

      assert.ok(s1 > s2 && s2 > s4 && s4 > s8)
      // Screen-space effective scale = zoomK * labelScale should grow much slower than zoomK
      assert.ok(4 * s4 < 2.2 * s1)
    })

    test("clamps non-positive zoom and baseScale safely", () => {
      assert.equal(getLabelScale(1, 0), getLabelScale(1, 0.2))
      assert.equal(getLabelScale(1, -2), getLabelScale(1, 0.2))
      assert.ok(Number.isFinite(getLabelScale(0, 2)))
    })
  })

  describe("truncateLabel", () => {
    test("preserves strings within maxLen", () => {
      assert.equal(
        truncateLabel("MK1: Organizational Behavior", 36),
        "MK1: Organizational Behavior",
      )
    })

    test("truncates long titles cleanly with ellipsis", () => {
      const long = "Week 08: People and Strategy — Human Capital as Competitive Advantage"
      const result = truncateLabel(long, 36)
      assert.ok(result.length <= 36)
      assert.ok(result.endsWith("…"))
      assert.ok(!result.endsWith(" …"))
    })
  })

  describe("cullOverlappingLabels", () => {
    const viewport = { width: 800, height: 600 }

    test("keeps higher-priority label when two labels collide", () => {
      const candidates: LabelCandidate[] = [
        { id: "low", x: 200, y: 200, width: 140, height: 18, priority: 10 },
        { id: "high", x: 220, y: 205, width: 140, height: 18, priority: 100 },
      ]

      const visible = cullOverlappingLabels(candidates, viewport)
      assert.deepEqual([...visible], ["high"])
    })

    test("keeps both labels once zoom separates them beyond padding", () => {
      const candidates: LabelCandidate[] = [
        { id: "a", x: 200, y: 200, width: 100, height: 18, priority: 100 },
        { id: "b", x: 320, y: 200, width: 100, height: 18, priority: 10 },
      ]

      const visible = cullOverlappingLabels(candidates, viewport)
      assert.equal(visible.has("a"), true)
      assert.equal(visible.has("b"), true)
    })

    test("drops out-of-viewport labels unless pinned", () => {
      const candidates: LabelCandidate[] = [
        { id: "offscreen", x: -200, y: 200, width: 100, height: 18, priority: 500 },
        { id: "pinned", x: -200, y: 200, width: 100, height: 18, priority: 1000, pinned: true },
        { id: "inside", x: 400, y: 300, width: 100, height: 18, priority: 50 },
      ]

      const visible = cullOverlappingLabels(candidates, viewport)
      assert.equal(visible.has("offscreen"), false)
      assert.equal(visible.has("pinned"), true)
      assert.equal(visible.has("inside"), true)
    })

    test("pinned label reserves space so lower-priority labels do not overlap it", () => {
      const candidates: LabelCandidate[] = [
        { id: "bg", x: 300, y: 300, width: 120, height: 18, priority: 200 },
        { id: "hovered", x: 310, y: 300, width: 120, height: 18, priority: 1000, pinned: true },
      ]

      const visible = cullOverlappingLabels(candidates, viewport)
      assert.deepEqual([...visible], ["hovered"])
    })
  })
})
