let dismissTimeout: ReturnType<typeof setTimeout> | null = null

function setupLanguageSwitcher() {
  const wrappers = document.querySelectorAll<HTMLElement>(".language-switcher-wrapper")

  wrappers.forEach((wrapper) => {
    const button = wrapper.querySelector<HTMLButtonElement>(".language-switcher")
    const popover = wrapper.querySelector<HTMLElement>(".lang-popover")
    if (!button || !popover) return

    const open = () => {
      wrapper.classList.add("is-open")
      button.setAttribute("aria-expanded", "true")
      popover.setAttribute("aria-hidden", "false")
      wrapper.classList.add("pulse")
      setTimeout(() => wrapper.classList.remove("pulse"), 350)

      if (dismissTimeout) clearTimeout(dismissTimeout)
      dismissTimeout = setTimeout(() => {
        close()
      }, 3200)
    }

    const close = () => {
      wrapper.classList.remove("is-open")
      button.setAttribute("aria-expanded", "false")
      popover.setAttribute("aria-hidden", "true")
      if (dismissTimeout) {
        clearTimeout(dismissTimeout)
        dismissTimeout = null
      }
    }

    const toggle = (e: MouseEvent) => {
      e.stopPropagation()
      if (wrapper.classList.contains("is-open")) {
        close()
      } else {
        open()
      }
    }

    const onOutsideClick = (e: MouseEvent) => {
      if (!wrapper.contains(e.target as Node)) {
        close()
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && wrapper.classList.contains("is-open")) {
        close()
        button.focus()
      }
    }

    button.addEventListener("click", toggle)
    document.addEventListener("click", onOutsideClick)
    document.addEventListener("keydown", onKeyDown)

    window.addCleanup(() => {
      button.removeEventListener("click", toggle)
      document.removeEventListener("click", onOutsideClick)
      document.removeEventListener("keydown", onKeyDown)
      if (dismissTimeout) clearTimeout(dismissTimeout)
    })
  })
}

document.addEventListener("nav", setupLanguageSwitcher)
