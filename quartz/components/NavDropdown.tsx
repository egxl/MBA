import { FullSlug, resolveRelative } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
// @ts-ignore
import navDropdownScript from "./scripts/navdropdown.inline"
import styles from "./styles/navdropdown.scss"

interface NavItem {
  label: string
  slug: string
  prefix: string
}

const navItems: NavItem[] = [
  { label: "Courses", slug: "courses/index", prefix: "courses" },
  { label: "Rabuan", slug: "rabuan/index", prefix: "rabuan" },
  { label: "Concepts", slug: "concepts/index", prefix: "concepts" },
]

const NavDropdown: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
  const currentSlug = fileData.slug ?? ""
  const activeItem = navItems.find((item) => currentSlug.startsWith(item.prefix))
  const currentLabel = activeItem ? activeItem.label : "Explore"
  const isSectionActive = Boolean(activeItem)

  return (
    <div class={classNames(displayClass, "nav-dropdown-wrapper")}>
      <button
        type="button"
        class={`nav-dropdown-trigger ${isSectionActive ? "is-active" : ""}`.trim()}
        aria-label="Navigation sections menu"
        aria-haspopup="true"
        aria-expanded="false"
      >
        <span class="nav-current-label">{currentLabel}</span>
        <svg class="dropdown-chevron" viewBox="0 0 24 24" aria-hidden="true">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <div
        class="nav-dropdown-popover"
        role="dialog"
        aria-label="Navigation menu"
        aria-hidden="true"
      >
        <ul class="nav-dropdown-list">
          {navItems.map((item) => {
            const href = resolveRelative(fileData.slug!, item.slug as FullSlug)
            const isActive = currentSlug.startsWith(item.prefix)
            return (
              <li>
                <a
                  href={href}
                  class={`nav-dropdown-link ${isActive ? "is-active" : ""}`.trim()}
                  data-prefix={item.prefix}
                >
                  <span class="nav-link-text">{item.label}</span>
                  {isActive && <span class="nav-active-dot" aria-hidden="true" />}
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

NavDropdown.beforeDOMLoaded = navDropdownScript
NavDropdown.css = styles

export default (() => NavDropdown) satisfies QuartzComponentConstructor
