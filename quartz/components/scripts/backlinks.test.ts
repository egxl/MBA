import test, { describe } from "node:test"
import assert from "node:assert"

function toggleBacklinks(button: {
  classList: { toggle: (cls: string) => void; contains: (cls: string) => boolean }
  getAttribute: (attr: string) => string | null
  setAttribute: (attr: string, val: string) => void
  nextElementSibling?: {
    classList: { toggle: (cls: string) => void; contains: (cls: string) => boolean }
  }
}) {
  button.classList.toggle("collapsed")
  button.setAttribute(
    "aria-expanded",
    button.getAttribute("aria-expanded") === "true" ? "false" : "true",
  )
  const content = button.nextElementSibling
  if (!content) return
  content.classList.toggle("collapsed")
}

describe("backlinks inline toggle logic", () => {
  test("toggles collapsed class and aria-expanded from collapsed to expanded and back", () => {
    const buttonClasses = new Set<string>(["collapsed", "backlinks-header"])
    const contentClasses = new Set<string>(["collapsed", "backlinks-content"])
    let ariaExpanded = "false"

    const mockButton = {
      classList: {
        toggle: (cls: string) => {
          if (buttonClasses.has(cls)) buttonClasses.delete(cls)
          else buttonClasses.add(cls)
        },
        contains: (cls: string) => buttonClasses.has(cls),
      },
      getAttribute: (attr: string) => (attr === "aria-expanded" ? ariaExpanded : null),
      setAttribute: (attr: string, val: string) => {
        if (attr === "aria-expanded") ariaExpanded = val
      },
      nextElementSibling: {
        classList: {
          toggle: (cls: string) => {
            if (contentClasses.has(cls)) contentClasses.delete(cls)
            else contentClasses.add(cls)
          },
          contains: (cls: string) => contentClasses.has(cls),
        },
      },
    }

    // Initial state: collapsed
    assert.strictEqual(mockButton.classList.contains("collapsed"), true)
    assert.strictEqual(mockButton.nextElementSibling.classList.contains("collapsed"), true)
    assert.strictEqual(ariaExpanded, "false")

    // First click: expand
    toggleBacklinks(mockButton)
    assert.strictEqual(mockButton.classList.contains("collapsed"), false)
    assert.strictEqual(mockButton.nextElementSibling.classList.contains("collapsed"), false)
    assert.strictEqual(ariaExpanded, "true")

    // Second click: collapse again
    toggleBacklinks(mockButton)
    assert.strictEqual(mockButton.classList.contains("collapsed"), true)
    assert.strictEqual(mockButton.nextElementSibling.classList.contains("collapsed"), true)
    assert.strictEqual(ariaExpanded, "false")
  })
})
