import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

const SidebarToggle: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
  return (
    <button
      type="button"
      id="sidebar-left-toggle"
      class={classNames(displayClass, "sidebar-toggle-btn", "circle-button")}
      aria-label="Collapse sidebar (Ctrl+\)"
      aria-expanded="true"
      title="Collapse sidebar (Ctrl+\)"
    >
      <svg
        class="sidebar-toggle-icon icon-collapse"
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="11 17 6 12 11 7" />
        <polyline points="18 17 13 12 18 7" />
      </svg>
      <svg
        class="sidebar-toggle-icon icon-expand"
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="13 17 18 12 13 7" />
        <polyline points="6 17 11 12 6 7" />
      </svg>
    </button>
  )
}

SidebarToggle.css = `
.sidebar-toggle-btn.circle-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  min-width: 46px;
  border-radius: 50%;
  position: relative;
  isolation: isolate;
  pointer-events: auto;
  background-color: color-mix(in srgb, var(--light) 85%, transparent);
  backdrop-filter: blur(14px) saturate(1.4);
  -webkit-backdrop-filter: blur(14px) saturate(1.4);
  border: 1px solid var(--lightgray);
  color: var(--darkgray);
  cursor: pointer;
  padding: 0;
  box-shadow:
    0 8px 30px -4px rgba(0, 0, 0, 0.08),
    0 2px 6px -1px rgba(0, 0, 0, 0.04);
  flex-shrink: 0;
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease,
    transform 0.15s ease,
    box-shadow 0.15s ease;

  :root[saved-theme="dark"] & {
    box-shadow:
      0 8px 30px -4px rgba(0, 0, 0, 0.45),
      0 2px 6px -1px rgba(0, 0, 0, 0.25);
  }

  &:hover {
    background-color: var(--lightgray);
    color: var(--secondary);
    border-color: var(--gray);
    transform: scale(1.05);
  }

  &:focus-visible {
    outline: 2px solid var(--secondary);
    outline-offset: 2px;
  }

  .sidebar-toggle-icon {
    width: 20px;
    height: 20px;
    stroke: currentColor;
    transition: transform 0.2s ease;
  }

  @media all and (max-width: 800px) {
    display: none !important;
  }
}

body[data-slug="index"] .sidebar-toggle-btn.circle-button {
  display: none !important;
}
`

export default (() => SidebarToggle) satisfies QuartzComponentConstructor
