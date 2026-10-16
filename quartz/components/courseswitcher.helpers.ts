import { FullSlug, resolveRelative } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"

export interface CourseOption {
  code: string
  number: number
  title: string
  slug: FullSlug
  segment: string
}

export interface WeekOption {
  weekNum: number
  label: string
  slug: FullSlug
}

export interface ClientWeekItem {
  weekNum: number
  label: string
  href: string
}

export interface ClientCourseItem {
  code: string
  number: number
  title: string
  segment: string
  overviewHref: string
  weeks: ClientWeekItem[]
}

export type CurriculumMap = Record<string, ClientCourseItem>

export function isCoursePage(slug: string | undefined): boolean {
  if (!slug) return false
  return /^courses\/mk\d+-/i.test(slug)
}

export function extractCourseSegment(slug: string): string | null {
  const match = slug.match(/^courses\/(mk\d+-[^\/]+)/i)
  return match ? match[1] : null
}

export function extractWeekNum(slug: string): number | null {
  const match = slug.match(/\/week-(\d+)/i)
  return match ? parseInt(match[1], 10) : null
}

export function getCourseOptions(allFiles: QuartzPluginData[]): CourseOption[] {
  const map = new Map<string, CourseOption>()

  for (const file of allFiles) {
    const slug = file.slug ?? ""
    const match = slug.match(/^courses\/(mk(\d+)-[^\/]+)(?:\/index)?$/i)
    if (!match) continue

    const segment = match[1]
    const mkNum = parseInt(match[2], 10)
    const code = (file.frontmatter?.course_code as string) || `MK${mkNum}`
    const rawCourse =
      (file.frontmatter?.course as string) || (file.frontmatter?.title as string) || segment
    const cleanTitle = rawCourse.replace(/^MK\s*\d+\s*[:–-]\s*/i, "").trim()

    map.set(segment.toLowerCase(), {
      code,
      number: mkNum,
      title: cleanTitle,
      slug: (slug.endsWith("/index") ? slug : `${slug}/index`) as FullSlug,
      segment,
    })
  }

  return Array.from(map.values()).sort((a, b) => a.number - b.number)
}

export function getWeekOptions(allFiles: QuartzPluginData[], courseSegment: string): WeekOption[] {
  const map = new Map<number, WeekOption>()
  const escapedSegment = courseSegment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const regex = new RegExp(`^courses\\/${escapedSegment}\\/week-(\\d+)(?:\\/index)?$`, "i")

  for (const file of allFiles) {
    const slug = file.slug ?? ""
    const match = slug.match(regex)
    if (!match) continue

    const parsedNum = parseInt(match[1], 10)
    const weekNum = typeof file.frontmatter?.week === "number" ? file.frontmatter.week : parsedNum
    const pad = String(weekNum).padStart(2, "0")

    let label = `Week ${pad}`
    const rawTitle = file.frontmatter?.title as string | undefined
    if (rawTitle) {
      const cleaned = rawTitle.replace(/^Week\s*\d+\s*[:–-]\s*/i, "").trim()
      if (cleaned.length > 0) {
        label = `Week ${pad}: ${cleaned}`
      }
    }

    map.set(weekNum, {
      weekNum,
      label,
      slug: file.slug as FullSlug,
    })
  }

  return Array.from(map.values()).sort((a, b) => a.weekNum - b.weekNum)
}

export function getCurriculumMap(
  allFiles: QuartzPluginData[],
  currentSlug: FullSlug,
): CurriculumMap {
  const courses = getCourseOptions(allFiles)
  const map: CurriculumMap = {}

  for (const course of courses) {
    const weeks = getWeekOptions(allFiles, course.segment)
    map[course.segment.toLowerCase()] = {
      code: course.code,
      number: course.number,
      title: course.title,
      segment: course.segment,
      overviewHref: resolveRelative(currentSlug, course.slug),
      weeks: weeks.map((w) => ({
        weekNum: w.weekNum,
        label: w.label,
        href: resolveRelative(currentSlug, w.slug),
      })),
    }
  }

  return map
}
