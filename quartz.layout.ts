import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

const explorerSortFn = (a: any, b: any) => {
  // Prioritize program/, courses/, and rabuan/ at the root level of the explorer tree
  const order = ["program", "courses", "rabuan"]
  const aIdx = order.indexOf(a.slugSegment)
  const bIdx = order.indexOf(b.slugSegment)
  if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx
  if (aIdx !== -1) return -1
  if (bIdx !== -1) return 1

  // Sort order: folders first, then files with natural alphanumeric sorting
  if ((!a.isFolder && !b.isFolder) || (a.isFolder && b.isFolder)) {
    const cmp = a.displayName.localeCompare(b.displayName, undefined, {
      numeric: true,
      sensitivity: "base",
    })
    if (cmp !== 0) return cmp
    return a.slugSegment.localeCompare(b.slugSegment, undefined, {
      numeric: true,
      sensitivity: "base",
    })
  }

  return !a.isFolder && b.isFolder ? 1 : -1
}

const explorerFilterFn = (node: any) => {
  const hiddenSegments = ["tags", "easter-egg", "concepts", "entities", "syntheses"]
  return !hiddenSegments.includes(node.slugSegment)
}

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [
    Component.DesktopOnly(Component.SidebarToggle()),
    Component.Navbar({
      start: [
        Component.MobileOnly(
          Component.Explorer({
            sortFn: explorerSortFn,
            filterFn: explorerFilterFn,
          }),
        ),
        Component.PageTitle(),
      ],
      end: [
        Component.DesktopOnly(Component.NavDropdown()),
        Component.HomeButton(),
        Component.Search(),
        Component.LanguageSwitcher(),
        Component.Darkmode(),
        Component.GridToggle(),
        Component.DesktopOnly(Component.ReaderMode()),
        Component.TTSPlayer(),
      ],
    }),
  ],
  afterBody: [],
  footer: Component.Footer(),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.CourseSwitcher(),
    Component.ConditionalRender({
      component: Component.Breadcrumbs({ showCurrentPage: false }),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TTSListenPill(),
    Component.TagList(),
  ],
  left: [
    Component.DesktopOnly(
      Component.Explorer({
        folderDefaultState: "collapsed",
        sortFn: explorerSortFn,
        filterFn: explorerFilterFn,
      }),
    ),
  ],
  right: [
    Component.DesktopOnly(Component.Graph()),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [
    Component.CourseSwitcher(),
    Component.Breadcrumbs({ showCurrentPage: false }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
  ],
  left: [
    Component.DesktopOnly(
      Component.Explorer({
        folderDefaultState: "collapsed",
        sortFn: explorerSortFn,
        filterFn: explorerFilterFn,
      }),
    ),
  ],
  right: [
    Component.DesktopOnly(Component.Graph()),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}
