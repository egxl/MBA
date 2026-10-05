import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "P3MD MBA",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "plausible",
    },
    locale: "en-US",
    baseUrl: "quartz.jzhao.xyz",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "local",
      cdnCaching: true,
      typography: {
        header: "Anthropic Sans",
        body: "Anthropic Serif",
        code: "Anthropic Mono",
      },
      colors: {
        lightMode: {
          light: "#FAF8F5",
          lightgray: "#E5DFD5",
          gray: "#A8A095",
          darkgray: "#2D2B28",
          dark: "#1F1E1C",
          secondary: "#3A5F43",
          tertiary: "#52795B",
          highlight: "rgba(58, 95, 67, 0.10)",
          textHighlight: "#F3E7C488",
        },
        darkMode: {
          light: "#1C211E",
          lightgray: "#2D3530",
          gray: "#7D877F",
          darkgray: "#E2DFD7",
          dark: "#F4F1EA",
          secondary: "#7EA885",
          tertiary: "#A3C9A8",
          highlight: "rgba(126, 168, 133, 0.15)",
          textHighlight: "#4A584088",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      // Comment out CustomOgImages to speed up build time
      Plugin.CustomOgImages(),
    ],
  },
}

export default config
