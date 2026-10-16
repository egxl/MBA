import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
// @ts-ignore
import splitViewScript from "./scripts/splitview.inline"
import splitViewStyle from "./styles/splitview.scss"

const SplitView: QuartzComponent = (_props: QuartzComponentProps) => {
  return (
    <>
      <div
        id="split-pane-divider"
        class="split-pane-divider"
        aria-hidden="true"
        title="Drag to resize, double-click to reset (50%)"
      >
        <div class="split-pane-divider-handle" />
      </div>
      <aside id="split-pane" class="split-pane" aria-label="Detail view" aria-hidden="true">
        <div class="split-pane-header">
          <div class="split-pane-header-left">
            <span class="split-pane-badge" id="split-pane-badge">
              Concept
            </span>
            <span class="split-pane-title" id="split-pane-title"></span>
          </div>
          <div class="split-pane-actions">
            <button
              type="button"
              class="split-pane-btn"
              id="split-pane-back"
              title="Previous in history"
              aria-label="Previous in history"
              disabled
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              class="split-pane-btn"
              id="split-pane-forward"
              title="Next in history"
              aria-label="Next in history"
              disabled
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
            <button
              type="button"
              class="split-pane-btn"
              id="split-pane-swap"
              title="Swap sides"
              aria-label="Swap sides"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="16 3 21 3 21 8" />
                <line x1="4" y1="20" x2="21" y2="3" />
                <polyline points="21 16 21 21 16 21" />
                <line x1="15" y1="15" x2="21" y2="21" />
                <line x1="4" y1="4" x2="9" y2="9" />
              </svg>
            </button>
            <button
              type="button"
              class="split-pane-btn"
              id="split-pane-open-full"
              title="Open full page"
              aria-label="Open full page"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 8" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </button>
            <button
              type="button"
              class="split-pane-btn split-pane-close"
              id="split-pane-close"
              title="Close split view (Esc)"
              aria-label="Close split view (Esc)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
        <div class="split-pane-body" id="split-pane-body"></div>
      </aside>
    </>
  )
}

SplitView.afterDOMLoaded = splitViewScript
SplitView.css = splitViewStyle

export default (() => SplitView) satisfies QuartzComponentConstructor
