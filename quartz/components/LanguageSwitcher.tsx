// @ts-ignore
import languageSwitcherScript from "./scripts/languageswitcher.inline"
import styles from "./styles/languageswitcher.scss"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

const LanguageSwitcher: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
  return (
    <div class={classNames(displayClass, "language-switcher-wrapper")}>
      <button
        type="button"
        class="language-switcher"
        aria-label="Language Switcher (EN / ID) — Work in Progress"
        title="Language Switcher (EN / ID) — WIP"
        aria-haspopup="true"
        aria-expanded="false"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lang-icon"
          aria-hidden="true"
        >
          <path d="m5 8 6 6" />
          <path d="m4 14 6-6 2-3" />
          <path d="M2 5h12" />
          <path d="M7 2h1" />
          <path d="m22 22-5-10-5 10" />
          <path d="M14 18h6" />
        </svg>
      </button>
      <div class="lang-popover" role="tooltip" aria-hidden="true">
        <div class="lang-popover-header">
          <span class="lang-code">ID</span>
          <span class="lang-name">Bahasa Indonesia</span>
          <span class="lang-wip-pill">WIP</span>
        </div>
        <p class="lang-popover-text">
          Translation is currently in progress. The site is in English (EN).
        </p>
      </div>
    </div>
  )
}

LanguageSwitcher.beforeDOMLoaded = languageSwitcherScript
LanguageSwitcher.css = styles

export default (() => LanguageSwitcher) satisfies QuartzComponentConstructor
