function setupNavDropdown() {
  const wrappers = document.querySelectorAll<HTMLElement>(".nav-dropdown-wrapper")

  wrappers.forEach((wrapper) => {
    const trigger = wrapper.querySelector<HTMLButtonElement>(".nav-dropdown-trigger")
    const popover = wrapper.querySelector<HTMLElement>(".nav-dropdown-popover")
    const triggerLabel = wrapper.querySelector<HTMLElement>(".nav-current-label")
    const links = wrapper.querySelectorAll<HTMLAnchorElement>(".nav-dropdown-link")
    if (!trigger || !popover || !triggerLabel) return

    let closeTimeout: ReturnType<typeof setTimeout> | null = null

    // Synchronize active label and link styling on route changes
    const updateActiveRoute = () => {
      const pathname = window.location.pathname
      let matchedLabel = "Explore"
      let isMatched = false

      links.forEach((link) => {
        const prefix = link.getAttribute("data-prefix")
        if (prefix && (pathname.includes(`/${prefix}`) || pathname.endsWith(`/${prefix}`))) {
          const textEl = link.querySelector<HTMLElement>(".nav-link-text")
          if (textEl?.textContent) {
            matchedLabel = textEl.textContent.trim()
          }
          link.classList.add("is-active")
          isMatched = true
        } else {
          link.classList.remove("is-active")
        }
      })

      triggerLabel.textContent = matchedLabel
      if (isMatched) {
        trigger.classList.add("is-active")
      } else {
        trigger.classList.remove("is-active")
      }
    }

    updateActiveRoute()

    const open = () => {
      if (closeTimeout) {
        clearTimeout(closeTimeout)
        closeTimeout = null
      }
      wrapper.classList.add("is-open")
      trigger.setAttribute("aria-expanded", "true")
      popover.setAttribute("aria-hidden", "false")
    }

    const close = () => {
      if (closeTimeout) {
        clearTimeout(closeTimeout)
        closeTimeout = null
      }
      wrapper.classList.remove("is-open")
      trigger.setAttribute("aria-expanded", "false")
      popover.setAttribute("aria-hidden", "true")
      if (wrapper.contains(document.activeElement)) {
        ;(document.activeElement as HTMLElement)?.blur()
      }
    }

    const scheduleClose = () => {
      if (closeTimeout) clearTimeout(closeTimeout)
      closeTimeout = setTimeout(() => {
        close()
      }, 220)
    }

    const toggle = (e: MouseEvent) => {
      e.stopPropagation()
      if (wrapper.classList.contains("is-open")) {
        close()
      } else {
        open()
      }
    }

    const onMouseEnter = () => {
      open()
    }

    const onMouseLeave = () => {
      scheduleClose()
    }

    const onFocusIn = () => {
      open()
    }

    const onFocusOut = (e: FocusEvent) => {
      if (!wrapper.contains(e.relatedTarget as Node)) {
        close()
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
        trigger.focus()
      }
    }

    const onLinkClick = () => {
      close()
    }

    const onScroll = () => {
      if (wrapper.classList.contains("is-open") || wrapper.contains(document.activeElement)) {
        close()
      }
    }

    trigger.addEventListener("click", toggle)
    wrapper.addEventListener("mouseenter", onMouseEnter)
    wrapper.addEventListener("mouseleave", onMouseLeave)
    wrapper.addEventListener("focusin", onFocusIn)
    wrapper.addEventListener("focusout", onFocusOut)
    document.addEventListener("click", onOutsideClick)
    document.addEventListener("keydown", onKeyDown)
    window.addEventListener("scroll", onScroll, { passive: true })
    links.forEach((link) => link.addEventListener("click", onLinkClick))

    window.addCleanup(() => {
      trigger.removeEventListener("click", toggle)
      wrapper.removeEventListener("mouseenter", onMouseEnter)
      wrapper.removeEventListener("mouseleave", onMouseLeave)
      wrapper.removeEventListener("focusin", onFocusIn)
      wrapper.removeEventListener("focusout", onFocusOut)
      document.removeEventListener("click", onOutsideClick)
      document.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("scroll", onScroll)
      links.forEach((link) => link.removeEventListener("click", onLinkClick))
      if (closeTimeout) clearTimeout(closeTimeout)
    })
  })
}

document.addEventListener("nav", setupNavDropdown)
