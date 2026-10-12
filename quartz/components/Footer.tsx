import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/footer.scss"
import { FullSlug, joinSegments, pathToRoot } from "../util/path"

interface Options {
  links?: Record<string, string>
  title?: string
  author?: string
  disclaimer?: string
}

export default ((opts?: Options) => {
  const Footer: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
    const links = opts?.links ?? {}
    const entries = Object.entries(links)

    const baseDir = pathToRoot((fileData?.slug ?? "") as FullSlug)
    const easterEggHref = joinSegments(baseDir, "easter-egg")

    const creditTitle = opts?.title ?? "Made with love & caffeine."
    const creditAuthor = opts?.author ?? "2026 student 322"
    const disclaimerText =
      opts?.disclaimer ??
      "Independent cohort knowledge base. Official course slides and faculty materials are the proprietary intellectual property of SBM ITB and are intentionally not hosted on this platform; content consists of student frameworks and synthesized notes."

    return (
      <footer class={`site-footer ${displayClass ?? ""}`}>
        <div class="footer-inner">
          <div class="footer-credit">
            <div class="footer-credit-title">{creditTitle}</div>
            <div class="footer-credit-author">
              &copy;{" "}
              <a
                href={easterEggHref}
                class="footer-author-link"
                title="The P3MD Insignia: Design Story & Symbolism"
              >
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
