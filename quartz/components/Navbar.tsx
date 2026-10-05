import { concatenateResources } from "../util/resources"
import { classNames } from "../util/lang"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
// @ts-ignore
import style from "./styles/navbar.scss"

interface NavbarConfig {
  start?: QuartzComponent[]
  end?: QuartzComponent[]
}

export default ((config?: NavbarConfig) => {
  const startComponents = config?.start ?? []
  const endComponents = config?.end ?? []
  const allComponents = [...startComponents, ...endComponents]

  const Navbar: QuartzComponent = (props: QuartzComponentProps) => {
    return (
      <nav class={classNames(props.displayClass, "navbar")} aria-label="Main Navigation">
        <div class="navbar-start">
          {startComponents.map((Component) => (
            <Component {...props} />
          ))}
        </div>
        {startComponents.length > 0 && endComponents.length > 0 && (
          <div class="navbar-divider" aria-hidden="true" />
        )}
        <div class="navbar-end">
          {endComponents.map((Component) => (
            <Component {...props} />
          ))}
        </div>
      </nav>
    )
  }

  Navbar.afterDOMLoaded = concatenateResources(...allComponents.map((c) => c.afterDOMLoaded))
  Navbar.beforeDOMLoaded = concatenateResources(...allComponents.map((c) => c.beforeDOMLoaded))
  Navbar.css = concatenateResources(style, ...allComponents.map((c) => c.css))

  return Navbar
}) satisfies QuartzComponentConstructor<NavbarConfig>
