import { pathToRoot, joinSegments } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { i18n } from "../i18n"

const PageTitle: QuartzComponent = ({ fileData, cfg, displayClass }: QuartzComponentProps) => {
  const title = cfg?.pageTitle ?? i18n(cfg.locale).propertyDefaults.title
  const baseDir = pathToRoot(fileData.slug!)
  const logoPath = joinSegments(baseDir, "static/logo.png")
  const isEasterEgg = fileData.slug === "easter-egg"
  const easterEggHref = isEasterEgg ? baseDir : joinSegments(baseDir, "easter-egg")

  return (
    <h2 class={classNames(displayClass, "page-title")}>
      <a
        href={easterEggHref}
        aria-label={
          isEasterEgg
            ? "Return to Academic Portal Home"
            : "P3MD Official Insignia (Classified Memo)"
        }
        title={isEasterEgg ? "Return to Home" : "Classified Cohort Memo"}
        class="site-logo-link"
      >
        <img class="site-logo" src={logoPath} alt={title} width="1024" height="240" />
      </a>
    </h2>
  )
}

PageTitle.css = `
.page-title {
  font-size: 1.75rem;
  margin: 0;
  font-family: var(--titleFont);
}

.page-title a.site-logo-link {
  display: block;
  text-decoration: none;
  line-height: 0;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease;
}

.page-title a.site-logo-link:hover {
  transform: scale(1.02);
  opacity: 0.9;
}

.page-title a.site-logo-link:active {
  transform: scale(0.98);
}

.page-title .site-logo {
  display: block;
  max-width: 100%;
  height: auto;
  max-height: 52px;
  object-fit: contain;
  transition: opacity 0.2s ease, filter 0.2s ease;
}

:root[saved-theme="dark"] .page-title .site-logo {
  filter: brightness(0) invert(1);
}

@media (prefers-color-scheme: dark) {
  :root:not([saved-theme="light"]) .page-title .site-logo {
    filter: brightness(0) invert(1);
  }
}

@media all and (max-width: 799px) {
  .page-title .site-logo {
    max-height: 38px;
    max-width: 145px;
  }
}
`

export default (() => PageTitle) satisfies QuartzComponentConstructor
