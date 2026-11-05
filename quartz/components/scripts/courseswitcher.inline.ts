function setupCourseSwitcher() {
  const switchers = document.querySelectorAll<HTMLElement>(".course-switcher")
  if (switchers.length === 0) return

  switchers.forEach((switcher) => {
    const dataScript = switcher.querySelector<HTMLScriptElement>("script.course-switcher-data")
    const mkSelect = switcher.querySelector<HTMLSelectElement>("select.mk-select")
    const weekSelect = switcher.querySelector<HTMLSelectElement>("select.week-select")

    if (!dataScript || !mkSelect || !weekSelect) return

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

    const navigateTo = (targetUrl: string) => {
      if (!targetUrl) return
      if (typeof (window as any).spaNavigate === "function") {
        ;(window as any).spaNavigate(new URL(targetUrl, window.location.toString()))
      } else {
        window.location.href = targetUrl
      }
    }

    const onMkChange = () => {
      const segment = mkSelect.value.toLowerCase()
      const course = curriculumData[segment]
      if (!course) return
      navigateTo(course.overviewHref)
    }

    const onWeekChange = () => {
      navigateTo(weekSelect.value)
    }

    mkSelect.addEventListener("change", onMkChange)
    weekSelect.addEventListener("change", onWeekChange)

    if (typeof window.addCleanup === "function") {
      window.addCleanup(() => {
        mkSelect.removeEventListener("change", onMkChange)
        weekSelect.removeEventListener("change", onWeekChange)
      })
    }
  })
}

document.addEventListener("nav", setupCourseSwitcher)
