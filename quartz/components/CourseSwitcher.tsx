import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import {
  isCoursePage,
  extractCourseSegment,
  extractWeekNum,
  getCourseOptions,
  getWeekOptions,
  getCurriculumMap,
  CourseOption,
  WeekOption,
  CurriculumMap,
  ClientCourseItem,
  ClientWeekItem,
} from "./courseswitcher.helpers"
// @ts-ignore
import courseSwitcherScript from "./scripts/courseswitcher.inline"
import styles from "./styles/courseswitcher.scss"

export {
  isCoursePage,
  extractCourseSegment,
  extractWeekNum,
  getCourseOptions,
  getWeekOptions,
  getCurriculumMap,
  type CourseOption,
  type WeekOption,
  type CurriculumMap,
  type ClientCourseItem,
  type ClientWeekItem,
}

export default (() => {
  const CourseSwitcher: QuartzComponent = ({
    fileData,
    allFiles,
    displayClass,
  }: QuartzComponentProps) => {
    const currentSlug = fileData.slug ?? ""
    if (!isCoursePage(currentSlug)) {
      return null
    }

    const currentCourseSegment = extractCourseSegment(currentSlug)
    if (!currentCourseSegment) {
      return null
    }

    const currentWeekNum = extractWeekNum(currentSlug)
    const courseOptions = getCourseOptions(allFiles)
    const curriculumMap = getCurriculumMap(allFiles, fileData.slug!)
    const activeCourse = curriculumMap[currentCourseSegment.toLowerCase()]
    const activeWeeks = activeCourse?.weeks ?? []
    const hasWeeks = activeWeeks.length > 0

    return (
      <nav
        class={classNames(displayClass, "course-switcher")}
        aria-label="Course and week navigator"
      >
        <div class="course-switcher-item">
          <label for="course-switcher-mk" class="course-switcher-label">
            Course
          </label>
          <div class="course-switcher-select-wrap">
            <select
              id="course-switcher-mk"
              class="course-switcher-select mk-select"
              aria-label="Select course"
            >
              {courseOptions.map((course) => {
                const isSelected =
                  course.segment.toLowerCase() === currentCourseSegment.toLowerCase()
                return (
                  <option value={course.segment} selected={isSelected}>
                    {course.code}: {course.title}
                  </option>
                )
              })}
            </select>
            <svg class="course-switcher-arrow" viewBox="0 0 24 24" aria-hidden="true">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

        <div class="course-switcher-divider" aria-hidden="true">
          /
        </div>

        <div class="course-switcher-item">
          <label for="course-switcher-week" class="course-switcher-label">
            Week
          </label>
          <div class="course-switcher-select-wrap">
            <select
              id="course-switcher-week"
              class="course-switcher-select week-select"
              aria-label="Select week"
            >
              <option value={activeCourse?.overviewHref ?? ""} selected={currentWeekNum === null}>
                {hasWeeks ? "Course Overview" : "Course Overview (No weeks yet)"}
              </option>
              {activeWeeks.map((week) => {
                const isSelected = currentWeekNum === week.weekNum
                return (
                  <option value={week.href} selected={isSelected}>
                    {week.label}
                  </option>
                )
              })}
            </select>
            <svg class="course-switcher-arrow" viewBox="0 0 24 24" aria-hidden="true">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

        <button
          type="button"
          class="course-switcher-go"
          aria-label="Navigate to selected course or week"
        >
          <span>Go</span>
          <svg class="go-arrow" viewBox="0 0 24 24" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        <script
          type="application/json"
          class="course-switcher-data"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(curriculumMap) }}
        />
      </nav>
    )
  }

  CourseSwitcher.afterDOMLoaded = courseSwitcherScript
  CourseSwitcher.css = styles

  return CourseSwitcher
}) satisfies QuartzComponentConstructor
