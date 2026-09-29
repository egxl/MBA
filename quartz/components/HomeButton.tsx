import { pathToRoot } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

const HomeButton: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
  const baseDir = pathToRoot(fileData.slug!)
  const isHome = fileData.slug === "index"
  return (
    <a
      href={baseDir}
      class={classNames(displayClass, "home-button", isHome ? "is-active" : "")}
      aria-label="Academic Portal Home"
      title="Academic Portal Home"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="home-icon"
      >
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    </a>
  )
}

HomeButton.css = `
.home-button {
  cursor: pointer;
  padding: 0;
  position: relative;
  background: none;
  border: none;
  width: 20px;
  height: 32px;
  margin: 0;
  text-align: inherit;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--darkgray);
  transition: color 0.15s ease, opacity 0.15s ease, transform 0.15s ease;
  text-decoration: none;

  &:hover {
    color: var(--secondary);
    transform: scale(1.1);
  }

  &.is-active {
    color: var(--secondary);
    opacity: 0.5;
  }

  & svg {
    width: 20px;
    height: 20px;
    stroke: currentColor;
  }
}
`

export default (() => HomeButton) satisfies QuartzComponentConstructor
