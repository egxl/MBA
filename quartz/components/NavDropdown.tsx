import { FullSlug, resolveRelative } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { portalI18n } from "../i18n/portal"
// @ts-ignore
import navDropdownScript from "./scripts/navdropdown.inline"
import styles from "./styles/navdropdown.scss"

interface NavItem {
  key: "courses" | "rabuan" | "concepts"
  slug: string
  prefix: string
}

const navItems: NavItem[] = [
  { key: "courses", slug: "courses/index", prefix: "courses" },
  { key: "rabuan", slug: "rabuan/index", prefix: "rabuan" },
  { key: "concepts", slug: "concepts/index", prefix: "concepts" },
]

const NavDropdown: QuartzComponent = ({ fileData, displayClass, cfg }: QuartzComponentProps) => {
  const p = portalI18n(cfg.locale)
  const currentSlug = fileData.slug ?? ""
  const activeItem = navItems.find((item) => currentSlug.startsWith(item.prefix))
  const currentLabel = activeItem ? p.nav[activeItem.key] : p.nav.explore
  const isSectionActive = Boolean(activeItem)

  return (
    <div
      class={classNames(displayClass, "nav-dropdown-wrapper")}
      data-default-label={p.nav.explore}
    >
      <button
        type="button"
        class={`nav-dropdown-trigger ${isSectionActive ? "is-active" : ""}`.trim()}
        aria-label={p.nav.navMenuAria}
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
        aria-label={p.nav.navDialogAria}
        aria-hidden="true"
      >
        <ul class="nav-dropdown-list">
          {navItems.map((item) => {
            const href = resolveRelative(fileData.slug!, item.slug as FullSlug)
            const isActive = currentSlug.startsWith(item.prefix)
            const label = p.nav[item.key]
            return (
              <li>
                <a
                  href={href}
                  class={`nav-dropdown-link ${isActive ? "is-active" : ""}`.trim()}
                  data-prefix={item.prefix}
                >
                  <span class="nav-link-text">{label}</span>
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
