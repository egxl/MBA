import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

const explorerSortFn = (a: any, b: any) => {
  // Prioritize program/ and courses/ at the root level of the explorer tree
  const order = ["program", "courses"]
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
  return node.slugSegment !== "tags" && node.slugSegment !== "easter-egg"
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
        Component.HomeButton(),
        Component.Search(),
        Component.Darkmode(),
        Component.ReaderMode(),
      ],
    }),
  ],
  afterBody: [],
  footer: Component.Footer(),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs({ showCurrentPage: false }),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.DesktopOnly(
      Component.Explorer({
        sortFn: explorerSortFn,
        filterFn: explorerFilterFn,
      }),
    ),
  ],
  right: [
    Component.Graph(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs({ showCurrentPage: false }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
  ],
  left: [
    Component.DesktopOnly(
      Component.Explorer({
        sortFn: explorerSortFn,
        filterFn: explorerFilterFn,
      }),
    ),
  ],
  right: [
    Component.Graph(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}
