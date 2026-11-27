import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { buildDriveLookup, replaceLocalSourcePaths } from "./link-garden-sources.mjs"

describe("link-garden-sources", () => {
  const sampleCsv = [
    "course_name,course_id,course_section,topic,item_type,item_title,posted_timestamp,due_date,file_name,link_type,action_taken,url,scraped_at",
    "MK1,1,,Week 1,material,Slides,, ,Week 1 Strategizing Your Life.pdf PDF,drive_file,logged_only,https://drive.google.com/file/d/FILE1/view,2026-11-25",
    "MK3,3,,Week 7,material,Case,, ,L'Oréal in Indonesia Managing a Global Product Portfolio in a Local-Brand Market.pdf PDF,drive_file,logged_only,https://drive.google.com/file/d/FILE2/view,2026-11-25",
    "MK3,3,,Week 11,material,Slides,, ,[P3MD] Week 11-MK3-student.pdf PDF,drive_file,logged_only,https://drive.google.com/file/d/FILE3/view,2026-11-25",
  ].join("\n")

  it("replaces matched local paths with backtick-wrapped Drive links and preserves unmatched local paths", () => {
    const lookup = buildDriveLookup(sampleCsv)
    const input = [
      "| **Slides** | PDF | `raw/courses/mk1/week-01/Week 1 Strategizing Your Life.pdf` (Notes) |",
      "| **L'Oreal** | PDF | `archive/courses/mk3/week-07/L_Ore\u0301al in Indonesia Managing a Global Product Portfolio in a Local-Brand Market.pdf` |",
      "| **Bracket** | PDF | `archive/courses/mk3/week-11/[P3MD] Week 11-MK3-student.pdf` |",
      "| **Syndicate** | DOCX | `archive/courses/mk1/week-01/Group 9 - Post Assignment Week 1.docx` |",
      "| **Broken** | MD | [[concepts/growth-mindset\\|growth mindset]].pdf `raw/courses/mk1/x` |",
    ].join("\n")

    const { content, replacedCount } = replaceLocalSourcePaths(input, lookup)
    assert.equal(replacedCount, 3)
    assert.match(
      content,
      /\[`Week 1 Strategizing Your Life\.pdf`\]\(https:\/\/drive\.google\.com\/file\/d\/FILE1\/view\) \(Notes\)/,
    )
    assert.match(
      content,
      /\[`L_Ore\u0301al in Indonesia Managing a Global Product Portfolio in a Local-Brand Market\.pdf`\]\(https:\/\/drive\.google\.com\/file\/d\/FILE2\/view\)/,
    )
    assert.match(
      content,
      /\[`\[P3MD\] Week 11-MK3-student\.pdf`\]\(https:\/\/drive\.google\.com\/file\/d\/FILE3\/view\)/,
    )
    assert.match(
      content,
      /`archive\/courses\/mk1\/week-01\/Group 9 - Post Assignment Week 1\.docx`/,
    )
    assert.match(content, /\[\[concepts\/growth-mindset\\\|growth mindset\]\]\.pdf/)

    // Idempotent on second run
    const second = replaceLocalSourcePaths(content, lookup)
    assert.equal(second.replacedCount, 0)
    assert.equal(second.content, content)
  })
})
