function setupCourseSwitcher() {
  const switchers = document.querySelectorAll<HTMLElement>(".course-switcher")
  if (switchers.length === 0) return

  switchers.forEach((switcher) => {
    const dataScript = switcher.querySelector<HTMLScriptElement>("script.course-switcher-data")
    const mkSelect = switcher.querySelector<HTMLSelectElement>("select.mk-select")
    const weekSelect = switcher.querySelector<HTMLSelectElement>("select.week-select")
    const goBtn = switcher.querySelector<HTMLButtonElement>("button.course-switcher-go")

    if (!dataScript || !mkSelect || !weekSelect || !goBtn) return

    let curriculumData: Record<
      string,
      {
        overviewHref: string
        weeks: Array<{ weekNum: number; label: string; href: string }>
      }
    > = {}

    try {
      curriculumData = JSON.parse(dataScript.textContent || "{}")
    } catch (e) {
      console.error("Failed to parse course switcher data", e)
      return
    }

    const onMkChange = () => {
      const segment = mkSelect.value.toLowerCase()
      const course = curriculumData[segment]
      if (!course) return

      weekSelect.innerHTML = ""
      const hasWeeks = Array.isArray(course.weeks) && course.weeks.length > 0

      const overviewOpt = document.createElement("option")
      overviewOpt.value = course.overviewHref
      overviewOpt.textContent = hasWeeks ? "Course Overview" : "Course Overview (No weeks yet)"
      overviewOpt.selected = true
      weekSelect.appendChild(overviewOpt)

      if (hasWeeks) {
        course.weeks.forEach((week) => {
          const opt = document.createElement("option")
          opt.value = week.href
          opt.textContent = week.label
          weekSelect.appendChild(opt)
        })
      }
    }

    const navigateToSelected = () => {
      const targetUrl = weekSelect.value
      if (!targetUrl) return

      if (typeof (window as any).spaNavigate === "function") {
        ;(window as any).spaNavigate(new URL(targetUrl, window.location.toString()))
      } else {
        window.location.href = targetUrl
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault()
        navigateToSelected()
      }
    }

    mkSelect.addEventListener("change", onMkChange)
    goBtn.addEventListener("click", navigateToSelected)
    mkSelect.addEventListener("keydown", onKeyDown)
    weekSelect.addEventListener("keydown", onKeyDown)

    window.addCleanup(() => {
      mkSelect.removeEventListener("change", onMkChange)
      goBtn.removeEventListener("click", navigateToSelected)
      mkSelect.removeEventListener("keydown", onKeyDown)
      weekSelect.removeEventListener("keydown", onKeyDown)
    })
  })
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupCourseSwitcher)
} else {
  setupCourseSwitcher()
}
document.addEventListener("nav", setupCourseSwitcher)
