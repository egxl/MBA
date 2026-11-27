const currentGrid = localStorage.getItem("grid") ?? "on"
document.documentElement.setAttribute("saved-grid", currentGrid)

const emitGridChangeEvent = (grid: "on" | "off") => {
  const event: CustomEventMap["gridchange"] = new CustomEvent("gridchange", {
    detail: { grid },
  })
  document.dispatchEvent(event)
}

function updateGridButtons(grid: "on" | "off") {
  const isOff = grid === "off"
  const buttons = document.querySelectorAll<HTMLButtonElement>(".grid-toggle")
  buttons.forEach((btn) => {
    const label = isOff
      ? btn.dataset.enableLabel || "Enable background grid"
      : btn.dataset.disableLabel || "Disable background grid"
    btn.setAttribute("aria-pressed", isOff ? "false" : "true")
    btn.setAttribute("aria-label", label)
    btn.setAttribute("title", label)
  })
}

document.addEventListener("nav", () => {
  const switchGrid = () => {
    const isCurrentlyOff = document.documentElement.getAttribute("saved-grid") === "off"
    const newGrid = isCurrentlyOff ? "on" : "off"
    document.documentElement.setAttribute("saved-grid", newGrid)
    localStorage.setItem("grid", newGrid)
    updateGridButtons(newGrid)
    emitGridChangeEvent(newGrid)
  }

  for (const gridButton of document.getElementsByClassName("grid-toggle")) {
    gridButton.addEventListener("click", switchGrid)
    window.addCleanup(() => gridButton.removeEventListener("click", switchGrid))
  }

  const current = document.documentElement.getAttribute("saved-grid") === "off" ? "off" : "on"
  updateGridButtons(current)
})
