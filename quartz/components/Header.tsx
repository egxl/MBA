import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const Header: QuartzComponent = ({ children }: QuartzComponentProps) => {
  return children.length > 0 ? <header class="site-header">{children}</header> : null
}

Header.css = `
header.site-header {
  display: flex;
  flex-direction: row;
  align-items: center;
}
`

export default (() => Header) satisfies QuartzComponentConstructor
