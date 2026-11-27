import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/footer.scss"
import { FullSlug, joinSegments, pathToRoot } from "../util/path"
import { portalI18n } from "../i18n/portal"

interface Options {
  links?: Record<string, string>
  title?: string
  author?: string
  disclaimer?: string
}

export default ((opts?: Options) => {
  const Footer: QuartzComponent = ({ fileData, displayClass, cfg }: QuartzComponentProps) => {
    const p = portalI18n(cfg.locale)
    const links = opts?.links ?? {}
    const entries = Object.entries(links)

    const baseDir = pathToRoot((fileData?.slug ?? "") as FullSlug)
    const easterEggHref = joinSegments(baseDir, "easter-egg")

    const creditTitle = opts?.title ?? p.footer.creditTitle
    const creditAuthor = opts?.author ?? "2026 student 322"
    const disclaimerText = opts?.disclaimer ?? p.footer.disclaimer

    return (
      <footer class={`site-footer ${displayClass ?? ""}`}>
        <div class="footer-inner">
          <div class="footer-credit">
            <div class="footer-credit-title">{creditTitle}</div>
            <div class="footer-credit-author">
              &copy;{" "}
              <a href={easterEggHref} class="footer-author-link" title={p.footer.authorTitle}>
                {creditAuthor}
              </a>
            </div>
          </div>
          <p class="footer-disclaimer">{disclaimerText}</p>
          {entries.length > 0 && (
            <ul class="footer-links">
              {entries.map(([text, link]) => (
                <li key={text}>
                  <a href={link}>{text}</a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </footer>
    )
  }

  Footer.css = style
  return Footer
}) satisfies QuartzComponentConstructor
