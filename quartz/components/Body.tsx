// @ts-ignore
import clipboardScript from "./scripts/clipboard.inline"
import clipboardStyle from "./styles/clipboard.scss"
// @ts-ignore
import sidebarScript from "./scripts/sidebar.inline"
// @ts-ignore
import splitViewScript from "./scripts/splitview.inline"
import splitViewStyle from "./styles/splitview.scss"
import { concatenateResources } from "../util/resources"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const Body: QuartzComponent = ({ children }: QuartzComponentProps) => {
  return <div id="quartz-body">{children}</div>
}

Body.beforeDOMLoaded = sidebarScript
Body.afterDOMLoaded = concatenateResources(clipboardScript, splitViewScript)
Body.css = concatenateResources(clipboardStyle, splitViewStyle)

export default (() => Body) satisfies QuartzComponentConstructor
