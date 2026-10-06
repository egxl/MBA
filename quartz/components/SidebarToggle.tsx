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
  max-width: 46px;
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
  overflow: hidden;
  opacity: 1;
  transform: scale(1) translateX(0);
  margin-right: 0;

  transition:
    width 0.28s cubic-bezier(0.16, 1, 0.3, 1),
    min-width 0.28s cubic-bezier(0.16, 1, 0.3, 1),
    max-width 0.28s cubic-bezier(0.16, 1, 0.3, 1),
    margin-right 0.28s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1),
    background-color 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease,
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
    transform: scale(1.06);
  }

  &:active {
    transform: scale(0.92);
  }

  &:focus-visible {
    outline: 2px solid var(--secondary);
    outline-offset: 2px;
  }

  .sidebar-toggle-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 20px;
    height: 20px;
    stroke: currentColor;
    transition:
      transform 0.24s cubic-bezier(0.16, 1, 0.3, 1),
      opacity 0.2s ease;
  }

  .icon-collapse {
    opacity: 1;
    transform: translate(-50%, -50%) rotate(0deg) scale(1);
    pointer-events: auto;
  }

  .icon-expand {
    opacity: 0;
    transform: translate(-50%, -50%) rotate(90deg) scale(0.5);
    pointer-events: none;
  }

  @media all and (max-width: 800px) {
    display: none !important;
  }
}

/* Landing page: smoothly closed / collapsed */
body[data-slug="index"] .sidebar-toggle-btn.circle-button {
  width: 0;
  min-width: 0;
  max-width: 0;
  padding: 0;
  border-width: 0;
  opacity: 0;
  transform: scale(0.4) translateX(-12px);
  pointer-events: none;
  margin-right: calc(-0.65rem);
  box-shadow: none;
  transition:
    width 0.22s cubic-bezier(0.4, 0, 0.2, 1),
    min-width 0.22s cubic-bezier(0.4, 0, 0.2, 1),
    max-width 0.22s cubic-bezier(0.4, 0, 0.2, 1),
    margin-right 0.22s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.16s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}

@media (prefers-reduced-motion: reduce) {
  .sidebar-toggle-btn.circle-button {
    transition: opacity 0.15s ease !important;
    transform: none !important;
  }
  .sidebar-toggle-btn.circle-button .sidebar-toggle-icon {
    transition: opacity 0.15s ease !important;
    transform: translate(-50%, -50%) !important;
  }
}
`

export default (() => SidebarToggle) satisfies QuartzComponentConstructor
