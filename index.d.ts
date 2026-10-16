declare module "*.scss" {
  const content: string
  export = content
}

// dom custom event
interface CustomEventMap {
  prenav: CustomEvent<{}>
  nav: CustomEvent<{ url: FullSlug }>
  themechange: CustomEvent<{ theme: "light" | "dark" }>
  readermodechange: CustomEvent<{ mode: "on" | "off" }>
  gridchange: CustomEvent<{ grid: "on" | "off" }>
  splitviewopen: CustomEvent<{ url: string }>
  splitviewclose: CustomEvent<{}>
  sidebartoggle: CustomEvent<{ state: string }>
}

type ContentIndex = Record<FullSlug, ContentDetails>
declare const fetchData: Promise<ContentIndex>
