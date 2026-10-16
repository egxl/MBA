import test, { describe } from "node:test"
import assert from "node:assert/strict"
import {
  isCoursePage,
  extractCourseSegment,
  extractWeekNum,
  getCourseOptions,
  getWeekOptions,
  getCurriculumMap,
} from "./courseswitcher.helpers"
import { QuartzPluginData } from "../plugins/vfile"
import { FullSlug } from "../util/path"

describe("CourseSwitcher helpers", () => {
  describe("isCoursePage", () => {
    test("detects course root, week pages, and reading/case subpages", () => {
      assert.equal(isCoursePage("courses/mk1-organizational-behavior-managing-people/index"), true)
      assert.equal(
        isCoursePage("courses/mk4-operations-supply-chain-management/week-06/index"),
        true,
      )
      assert.equal(
        isCoursePage("courses/mk4-operations-supply-chain-management/week-06/case-kai-gambir-gate"),
        true,
      )
    })

    test("rejects non-course pages", () => {
      assert.equal(isCoursePage("courses/index"), false)
      assert.equal(isCoursePage("index"), false)
      assert.equal(isCoursePage("program/index"), false)
      assert.equal(isCoursePage("concepts/littles-law"), false)
      assert.equal(isCoursePage(undefined), false)
      assert.equal(isCoursePage(""), false)
    })
  })

  describe("extractCourseSegment", () => {
    test("extracts segment from course pages", () => {
      assert.equal(
        extractCourseSegment("courses/mk1-organizational-behavior-managing-people/index"),
        "mk1-organizational-behavior-managing-people",
      )
      assert.equal(
        extractCourseSegment("courses/mk4-operations-supply-chain-management/week-06/index"),
        "mk4-operations-supply-chain-management",
      )
    })

    test("returns null for non-course pages", () => {
      assert.equal(extractCourseSegment("courses/index"), null)
      assert.equal(extractCourseSegment("program/index"), null)
    })
  })

  describe("extractWeekNum", () => {
    test("extracts week number from week paths", () => {
      assert.equal(
        extractWeekNum("courses/mk1-organizational-behavior-managing-people/week-01/index"),
        1,
      )
      assert.equal(
        extractWeekNum(
          "courses/mk4-operations-supply-chain-management/week-06/case-kai-gambir-gate",
        ),
        6,
      )
    })

    test("returns null when no week segment is present", () => {
      assert.equal(
        extractWeekNum("courses/mk1-organizational-behavior-managing-people/index"),
        null,
      )
      assert.equal(extractWeekNum("courses/index"), null)
    })
  })

  describe("getCourseOptions", () => {
    test("discovers courses, extracts codes and titles, and sorts by MK number", () => {
      const mockFiles: QuartzPluginData[] = [
        {
          slug: "courses/mk2-financial-management-strategy/index" as FullSlug,
          frontmatter: {
            course: "Financial Management and Strategy",
            course_code: "MK2",
            title: "MK 2: Financial Management and Strategy",
          },
        },
        {
          slug: "courses/mk1-organizational-behavior-managing-people/index" as FullSlug,
          frontmatter: {
            course: "Organizational Behaviour & Managing People",
            course_code: "MK1",
            title: "MK 1: Organizational Behaviour & Managing People",
          },
        },
        {
          slug: "courses/index" as FullSlug,
          frontmatter: { title: "Courses Overview" },
        },
        {
          slug: "program/index" as FullSlug,
          frontmatter: { title: "Program Overview" },
        },
      ]

      const courses = getCourseOptions(mockFiles)
      assert.equal(courses.length, 2)
      assert.equal(courses[0].code, "MK1")
      assert.equal(courses[0].number, 1)
      assert.equal(courses[0].title, "Organizational Behaviour & Managing People")
      assert.equal(courses[1].code, "MK2")
      assert.equal(courses[1].number, 2)
    })
  })

  describe("getWeekOptions", () => {
    test("discovers weeks for the specified course and sorts by week number", () => {
      const mockFiles: QuartzPluginData[] = [
        {
          slug: "courses/mk4-operations-supply-chain-management/week-06/index" as FullSlug,
          frontmatter: {
            title: "Week 06: Process Design, Analysis & Little's Law",
            week: 6,
          },
        },
        {
          slug: "courses/mk4-operations-supply-chain-management/week-02/index" as FullSlug,
          frontmatter: {
            title: "Week 02: Capacity Management",
            week: 2,
          },
        },
        {
          slug: "courses/mk4-operations-supply-chain-management/week-06/case-kai-gambir-gate" as FullSlug,
          frontmatter: { title: "Case: KAI Gambir Gate" },
        },
        {
          slug: "courses/mk1-organizational-behavior-managing-people/week-01/index" as FullSlug,
          frontmatter: { title: "Week 01: Self Awareness", week: 1 },
        },
      ]

      const weeks = getWeekOptions(mockFiles, "mk4-operations-supply-chain-management")
      assert.equal(weeks.length, 2)
      assert.equal(weeks[0].weekNum, 2)
      assert.equal(weeks[0].label, "Week 02: Capacity Management")
      assert.equal(weeks[1].weekNum, 6)
      assert.equal(weeks[1].label, "Week 06: Process Design, Analysis & Little's Law")
    })

    test("returns empty array when course has no weeks", () => {
      const mockFiles: QuartzPluginData[] = [
        {
          slug: "courses/mk2-financial-management-strategy/index" as FullSlug,
          frontmatter: { title: "MK 2" },
        },
      ]

      const weeks = getWeekOptions(mockFiles, "mk2-financial-management-strategy")
      assert.deepEqual(weeks, [])
    })
  })

  describe("getCurriculumMap", () => {
    test("builds complete client-side map with relative hrefs and week lists", () => {
      const mockFiles: QuartzPluginData[] = [
        {
          slug: "courses/mk1-organizational-behavior-managing-people/index" as FullSlug,
          frontmatter: {
            title: "MK 1: Organizational Behaviour",
            course: "Organizational Behaviour",
            course_code: "MK1",
          },
        },
        {
          slug: "courses/mk1-organizational-behavior-managing-people/week-01/index" as FullSlug,
          frontmatter: { title: "Week 01: Purpose", week: 1 },
        },
        {
          slug: "courses/mk2-financial-management-strategy/index" as FullSlug,
          frontmatter: {
            title: "MK 2: Finance",
            course: "Finance",
            course_code: "MK2",
          },
        },
      ]

      const currentSlug =
        "courses/mk1-organizational-behavior-managing-people/week-01/index" as FullSlug
      const map = getCurriculumMap(mockFiles, currentSlug)

      assert.ok(map["mk1-organizational-behavior-managing-people"])
      assert.ok(map["mk2-financial-management-strategy"])

      const mk1 = map["mk1-organizational-behavior-managing-people"]
      assert.equal(mk1.code, "MK1")
      assert.equal(mk1.weeks.length, 1)
      assert.equal(mk1.weeks[0].weekNum, 1)
      assert.ok(mk1.overviewHref)
      assert.ok(mk1.weeks[0].href)

      const mk2 = map["mk2-financial-management-strategy"]
      assert.equal(mk2.code, "MK2")
      assert.equal(mk2.weeks.length, 0)
    })
  })
})
