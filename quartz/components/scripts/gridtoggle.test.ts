import test, { describe } from "node:test"
import assert from "node:assert"

function toggleGridState(
  currentState: "on" | "off",
  storage: Map<string, string>,
): { nextState: "on" | "off"; attribute: string } {
  const nextState = currentState === "off" ? "on" : "off"
  storage.set("grid", nextState)
  return { nextState, attribute: nextState }
}

function updateMockGridButtons(
  grid: "on" | "off",
  buttons: Array<{ attributes: Map<string, string> }>,
) {
  const isOff = grid === "off"
  for (const btn of buttons) {
    btn.attributes.set("aria-pressed", isOff ? "false" : "true")
    btn.attributes.set("aria-label", isOff ? "Enable background grid" : "Disable background grid")
    btn.attributes.set("title", isOff ? "Enable background grid" : "Disable background grid")
  }
}

describe("grid toggle state logic", () => {
  test("toggles state between on and off and persists to storage", () => {
    const storage = new Map<string, string>()
    storage.set("grid", "on")

    // Default state: on
    assert.strictEqual(storage.get("grid"), "on")

    // Toggle once: off
    const step1 = toggleGridState(storage.get("grid") as "on" | "off", storage)
    assert.strictEqual(step1.nextState, "off")
    assert.strictEqual(storage.get("grid"), "off")

    // Toggle twice: on
    const step2 = toggleGridState(storage.get("grid") as "on" | "off", storage)
    assert.strictEqual(step2.nextState, "on")
    assert.strictEqual(storage.get("grid"), "on")
  })

  test("correctly sets button accessibility attributes and titles", () => {
    const mockBtn = { attributes: new Map<string, string>() }
    const buttons = [mockBtn]

    // Set to on
    updateMockGridButtons("on", buttons)
    assert.strictEqual(mockBtn.attributes.get("aria-pressed"), "true")
    assert.strictEqual(mockBtn.attributes.get("aria-label"), "Disable background grid")
    assert.strictEqual(mockBtn.attributes.get("title"), "Disable background grid")

    // Set to off
    updateMockGridButtons("off", buttons)
    assert.strictEqual(mockBtn.attributes.get("aria-pressed"), "false")
    assert.strictEqual(mockBtn.attributes.get("aria-label"), "Enable background grid")
    assert.strictEqual(mockBtn.attributes.get("title"), "Enable background grid")
  })
})
