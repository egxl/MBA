import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

const SidebarToggle: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
  return (
    <button
      type="button"
      id="sidebar-left-toggle"
      class={classNames(displayClass, "sidebar-toggle-btn")}
      aria-label="Collapse sidebar (Ctrl+\)"
      aria-expanded="true"
      title="Collapse sidebar (Ctrl+\)"
    >
      <svg
        class="sidebar-toggle-icon icon-collapse"
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
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
        width="18"
        height="18"
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
.sidebar-toggle-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--lightgray);
  border: 1px solid var(--lightgray);
  color: var(--dark);
  cursor: pointer;
  padding: 0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease,
    transform 0.15s ease;

  &:hover {
    background-color: var(--secondary);
    color: var(--light);
    border-color: var(--secondary);
    transform: scale(1.05);
  }

  &:focus-visible {
    outline: 2px solid var(--secondary);
    outline-offset: 2px;
  }

  .sidebar-toggle-icon {
    width: 18px;
    height: 18px;
    stroke: currentColor;
  }

  @media all and (max-width: 800px) {
    display: none !important;
  }
}

body[data-slug="index"] .sidebar-toggle-btn {
  display: none !important;
}
`

export default (() => SidebarToggle) satisfies QuartzComponentConstructor
