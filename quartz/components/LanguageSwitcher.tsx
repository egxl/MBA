// @ts-ignore
import languageSwitcherScript from "./scripts/languageswitcher.inline"
import styles from "./styles/languageswitcher.scss"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { FullSlug } from "../util/path"
import { buildPairedLocaleHref, getLocaleCode } from "../util/locale"
import { portalI18n } from "../i18n/portal"

const LanguageSwitcher: QuartzComponent = ({
  displayClass,
  fileData,
  cfg,
}: QuartzComponentProps) => {
  const currentLang = getLocaleCode(cfg.locale)
  const targetLang = currentLang === "id" ? "en" : "id"
  const targetHref = buildPairedLocaleHref((fileData.slug ?? "index") as FullSlug, currentLang)
  const p = portalI18n(cfg.locale)

  return (
    <div class={classNames(displayClass, "language-switcher-wrapper")}>
      <a
        href={targetHref}
        class="language-switcher"
        data-router-ignore="true"
        data-current-lang={currentLang}
        data-target-lang={targetLang}
        aria-label={p.languageSwitcher.ariaLabel}
        title={p.languageSwitcher.tooltip}
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
        <span class="lang-active-code">{p.languageSwitcher.activeCode}</span>
      </a>
      <div class="lang-tooltip" role="tooltip" aria-hidden="true">
        <span class="lang-tooltip-code">{p.languageSwitcher.targetCode}</span>
        <span class="lang-tooltip-text">{p.languageSwitcher.tooltip}</span>
      </div>
    </div>
  )
}

LanguageSwitcher.beforeDOMLoaded = languageSwitcherScript
LanguageSwitcher.css = styles

export default (() => LanguageSwitcher) satisfies QuartzComponentConstructor
