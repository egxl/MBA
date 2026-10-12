import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
// @ts-ignore
import gridToggleScript from "./scripts/gridtoggle.inline"
import styles from "./styles/gridtoggle.scss"

const GridToggle: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
  return (
    <button
      type="button"
      class={classNames(displayClass, "grid-toggle")}
      aria-label="Toggle background grid"
      title="Toggle background grid"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="gridOnIcon"
        aria-hidden="true"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M3 9h18" />
        <path d="M3 15h18" />
        <path d="M9 3v18" />
        <path d="M15 3v18" />
      </svg>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="gridOffIcon"
        aria-hidden="true"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" opacity="0.35" />
        <path d="M3 9h18" opacity="0.35" />
        <path d="M3 15h18" opacity="0.35" />
        <path d="M9 3v18" opacity="0.35" />
        <path d="M15 3v18" opacity="0.35" />
        <line x1="2" y1="2" x2="22" y2="22" stroke-width="2.2" />
      </svg>
    </button>
  )
}

GridToggle.beforeDOMLoaded = gridToggleScript
GridToggle.css = styles

export default (() => GridToggle) satisfies QuartzComponentConstructor
