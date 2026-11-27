import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { FullSlug } from "../util/path"
import { buildPairedLocaleHref } from "../util/locale"
import { portalI18n } from "../i18n/portal"
import styles from "./styles/translationnotice.scss"

const TranslationNotice: QuartzComponent = ({
  fileData,
  displayClass,
  cfg,
}: QuartzComponentProps) => {
  if (fileData.translationStatus !== "fallback") {
    return null
  }

  const p = portalI18n(cfg.locale)
  const englishHref = buildPairedLocaleHref((fileData.slug ?? "index") as FullSlug, "id")

  return (
    <aside class={classNames(displayClass, "translation-notice")} role="note">
      <div class="translation-notice-content">
        <span class="translation-notice-badge">{p.translationNotice.badge}</span>
        <span class="translation-notice-text">{p.translationNotice.message}</span>
      </div>
      <a
        href={englishHref}
        class="translation-notice-switch"
        data-router-ignore="true"
        data-target-lang="en"
      >
        {p.translationNotice.switchCta}
      </a>
    </aside>
  )
}

TranslationNotice.css = styles

export default (() => TranslationNotice) satisfies QuartzComponentConstructor
