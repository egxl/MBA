import test, { describe } from "node:test"
import assert from "node:assert"

interface MockWrapper {
  classList: Set<string>
  button: {
    attributes: Map<string, string>
  }
  popover: {
    attributes: Map<string, string>
  }
}

function createMockWrapper(): MockWrapper {
  const buttonAttrs = new Map<string, string>()
  buttonAttrs.set("aria-expanded", "false")
  buttonAttrs.set("aria-haspopup", "true")
  buttonAttrs.set("aria-label", "Language Switcher (EN / ID) — Work in Progress")
  buttonAttrs.set("title", "Language Switcher (EN / ID) — WIP")

  const popoverAttrs = new Map<string, string>()
  popoverAttrs.set("aria-hidden", "true")
  popoverAttrs.set("role", "tooltip")

  return {
    classList: new Set<string>(),
    button: { attributes: buttonAttrs },
    popover: { attributes: popoverAttrs },
  }
}

function openLanguageSwitcher(wrapper: MockWrapper) {
  wrapper.classList.add("is-open")
  wrapper.button.attributes.set("aria-expanded", "true")
  wrapper.popover.attributes.set("aria-hidden", "false")
}

function closeLanguageSwitcher(wrapper: MockWrapper) {
  wrapper.classList.delete("is-open")
  wrapper.button.attributes.set("aria-expanded", "false")
  wrapper.popover.attributes.set("aria-hidden", "true")
}

describe("language switcher state logic", () => {
  test("initializes with collapsed popover and correct accessibility attributes", () => {
    const mock = createMockWrapper()
    assert.strictEqual(mock.classList.has("is-open"), false)
    assert.strictEqual(mock.button.attributes.get("aria-expanded"), "false")
    assert.strictEqual(mock.popover.attributes.get("aria-hidden"), "true")
    assert.strictEqual(mock.button.attributes.get("aria-haspopup"), "true")
  })

  test("toggles open state and updates ARIA attributes", () => {
    const mock = createMockWrapper()

    openLanguageSwitcher(mock)
    assert.strictEqual(mock.classList.has("is-open"), true)
    assert.strictEqual(mock.button.attributes.get("aria-expanded"), "true")
    assert.strictEqual(mock.popover.attributes.get("aria-hidden"), "false")

    closeLanguageSwitcher(mock)
    assert.strictEqual(mock.classList.has("is-open"), false)
    assert.strictEqual(mock.button.attributes.get("aria-expanded"), "false")
    assert.strictEqual(mock.popover.attributes.get("aria-hidden"), "true")
  })
})
