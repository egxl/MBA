/**
 * Google Classroom Instant Extractor (Paste into Chrome Console)
 *
 * HOW TO USE:
 * 1. Open Google Classroom in your normal Chrome browser.
 * 2. Navigate to your course's "Classwork" (Tugas Kelas) tab, e.g.:
 *    - MK 6: https://classroom.google.com/u/0/w/ODc3MjY4NTkxMDYz/t/all
 *    - MK 5: https://classroom.google.com/u/0/w/ODc3MjY4MDk5OTQ1/t/all
 *    - MK 4: https://classroom.google.com/u/0/w/ODc3MjY3NTQzODgz/t/all
 *    - MK 3: https://classroom.google.com/u/0/w/ODc3MjY3MDc4NzQ1/t/all
 *    - MK 1: https://classroom.google.com/u/0/w/ODc3MjYzOTQ4OTQ1/t/all
 *    - MK 2: https://classroom.google.com/u/0/w/ODc3MjM3ODY3MjIw/t/all
 * 3. Press F12 -> "Console" tab.
 * 4. Paste this ENTIRE code and press ENTER.
 * 5. It automatically merges courses into a master catalog and downloads 'classroom_materials.json'!
 */
;(async function extractGoogleClassroom() {
  console.log(
    "%c[GClass Extractor] Starting extraction...",
    "color: #1a73e8; font-weight: bold; font-size: 14px;",
  )

  // Step 1: Scroll to trigger lazy loading and expand collapsed items
  for (let s = 0; s < 4; s++) {
    window.scrollBy(0, 1000)
    await new Promise((r) => setTimeout(r, 250))
  }
  window.scrollTo(0, 0)

  const expandButtons = document.querySelectorAll('[aria-expanded="false"]')
  console.log(`[GClass Extractor] Expanding ${expandButtons.length} collapsed items...`)
  expandButtons.forEach((btn) => {
    try {
      btn.click()
    } catch (e) {}
  })

  // Short pause for DOM expansion
  await new Promise((r) => setTimeout(r, 1500))

  // Step 2: Course ID & Title resolution
  const urlMatch = window.location.href.match(/\/(?:c|w)\/([a-zA-Z0-9_\-]+)/)
  const courseId = urlMatch ? urlMatch[1] : ""

  const courseTitle = (
    document.querySelector("nav h1")?.innerText ||
    document.querySelector("h1")?.innerText ||
    document.querySelector("[data-course-id] h2")?.innerText ||
    document.title.replace("- Google Classroom", "").trim()
  ).trim()

  function classifyUrl(href) {
    if (!href) return ["unknown", "logged_only"]
    const u = href.trim()
    if (
      /(?:drive\.google\.com\/(?:drive\/|drive\/u\/\d+\/)?folders\/|drive\.google\.com\/folderview\?id=)/i.test(
        u,
      )
    ) {
      return ["drive_folder", "saved_without_opening"]
    }
    if (/drive\.google\.com\/(?:file\/d\/|open\?id=)/i.test(u)) return ["drive_file", "logged_only"]
    if (/docs\.google\.com\/document\/d\//i.test(u)) return ["google_doc", "logged_only"]
    if (/docs\.google\.com\/presentation\/d\//i.test(u)) return ["google_slides", "logged_only"]
    if (/docs\.google\.com\/spreadsheets\/d\//i.test(u)) return ["google_sheets", "logged_only"]
    if (/docs\.google\.com\/forms\/d\//i.test(u)) return ["google_form", "logged_only"]
    if (/(?:youtube\.com\/watch\?v=|youtu\.be\/)/i.test(u)) return ["youtube_video", "logged_only"]
    return ["external_link", "logged_only"]
  }

  function extractTimestamps(text) {
    const res = { posted_timestamp: null, edited_timestamp: null, due_date: null }
    if (!text) return res
    for (const line of text.split("\n")) {
      const trimmed = line.trim()
      const mPosted = trimmed.match(/(?:Posted|Diposting)[\s:]+(.+?)(?:\s*\(|$)/i)
      if (mPosted && !res.posted_timestamp) res.posted_timestamp = mPosted[1].trim()

      const mEdited = trimmed.match(/(?:Edited|Diedit)[\s:]+(.+?)(?:\s*\(|$)/i)
      if (mEdited && !res.edited_timestamp) res.edited_timestamp = mEdited[1].trim()

      const mDue = trimmed.match(/(?:Due|Tenggat)[\s:]+(.+?)(?:\s*\(|$)/i)
      if (mDue && !res.due_date) res.due_date = mDue[1].trim()
    }
    return res
  }

  const items = []
  const itemAnchors = document.querySelectorAll(
    'a[href*="/m/"], a[href*="/a/"], div[role="listitem"], div[role="article"]',
  )

  const seenUrls = new Set()

  itemAnchors.forEach((el) => {
    let anchor = el.tagName === "A" ? el : el.querySelector('a[href*="/m/"], a[href*="/a/"]')
    const href = anchor ? anchor.href : ""
    if (href && seenUrls.has(href)) return
    if (href) seenUrls.add(href)

    let parent = el
    for (let i = 0; i < 5; i++) {
      if (parent.parentElement && parent.parentElement.tagName !== "BODY") {
        parent = parent.parentElement
        if (
          parent.getAttribute("role") === "article" ||
          parent.getAttribute("role") === "listitem"
        ) {
          break
        }
      }
    }

    const fullText = parent.innerText || ""
    const timestamps = extractTimestamps(fullText)
    const itemTitle = (
      (anchor && (anchor.getAttribute("aria-label") || anchor.innerText)) ||
      parent.querySelector("h2, h3, div[role='heading']")?.innerText ||
      ""
    ).trim()

    if (!itemTitle && !href) return

    const itemType = href.includes("/m/") ? "material" : "assignment"

    // Topic detection
    let topic = "General"
    let section = parent
    while (section && section.parentElement) {
      section = section.parentElement
      const heading = section.querySelector("h2, h1")
      if (heading && heading.innerText.trim() !== itemTitle) {
        topic = heading.innerText.trim()
        break
      }
    }

    // Attachments
    const attachments = []
    const seenLinks = new Set()
    const links = parent.querySelectorAll("a[href]")

    links.forEach((a) => {
      const linkHref = a.href
      if (
        !linkHref ||
        linkHref.includes("/m/") ||
        linkHref.includes("/a/") ||
        /(?:classroom\.google\.com|^)\/(?:u\/\d+\/)?(?:h|w|c)\/?$/i.test(linkHref)
      ) {
        return
      }
      if (seenLinks.has(linkHref)) return
      seenLinks.add(linkHref)

      const [linkType, actionTaken] = classifyUrl(linkHref)
      let fileName = (
        a.getAttribute("aria-label") ||
        a.getAttribute("title") ||
        a.innerText ||
        ""
      ).trim()
      if (fileName.includes("\n")) {
        fileName = fileName
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean)
          .join(" - ")
      }
      if (!fileName) {
        fileName = linkHref.split("/").pop().split("?")[0] || "Attachment"
      }

      attachments.push({
        file_name: fileName,
        url: linkHref,
        link_type: linkType,
        action_taken: actionTaken,
      })
    })

    items.push({
      scraped_at: new Date().toISOString(),
      course_id: courseId,
      course_name: courseTitle,
      topic: topic,
      item_type: itemType,
      item_title: itemTitle || `Untitled ${itemType}`,
      item_url: href || window.location.href,
      posted_timestamp: timestamps.posted_timestamp,
      edited_timestamp: timestamps.edited_timestamp,
      due_date: timestamps.due_date,
      attachments: attachments,
    })
  })

  // Multi-course accumulator in localStorage
  let accumulated = []
  try {
    const raw = localStorage.getItem("gclass_accumulated_items")
    if (raw) accumulated = JSON.parse(raw)
  } catch (e) {}

  // Deduplicate and merge
  const existingMap = new Map()
  accumulated.forEach((it) => existingMap.set(it.course_name + "::" + it.item_title, it))
  items.forEach((it) => existingMap.set(it.course_name + "::" + it.item_title, it))
  const mergedItems = Array.from(existingMap.values())

  try {
    localStorage.setItem("gclass_accumulated_items", JSON.stringify(mergedItems))
  } catch (e) {}

  console.log(
    `%c[GClass Extractor] Success for ${courseTitle}! Extracted ${items.length} items (${mergedItems.length} total across all visited courses).`,
    "color: #0f9d58; font-weight: bold; font-size: 14px;",
  )

  // Trigger download of merged JSON
  const blob = new Blob([JSON.stringify(mergedItems, null, 2)], { type: "application/json" })
  const a = document.createElement("a")
  a.href = URL.createObjectURL(blob)
  a.download = "classroom_materials.json"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)

  console.log(
    "%c[GClass Extractor] Master 'classroom_materials.json' downloaded! Move it into 'gclass_scraping/output/'.",
    "color: #1a73e8; font-weight: bold;",
  )
  return mergedItems
})()
