/**
 * Google Classroom Token & Session Exporter
 *
 * HOW TO USE:
 * 1. Open Google Classroom in your browser (https://classroom.google.com).
 * 2. Press F12 (or right-click anywhere -> Inspect) and switch to the "Console" tab.
 * 3. Paste this ENTIRE code block and press ENTER.
 * 4. A file named 'gclass_tokens.json' will automatically download to your computer.
 * 5. Move 'gclass_tokens.json' into the 'gclass_scraping/' folder in this repo.
 */
;(async function exportGClassTokens() {
  console.log(
    "%c[GClass Exporter] Scanning active session & credentials...",
    "color: #1a73e8; font-weight: bold; font-size: 14px;",
  )

  const results = {
    extracted_at: new Date().toISOString(),
    source_url: window.location.href,
    user_agent: navigator.userAgent,
    oauth_bearer_token: null,
    wiz_global_data: {},
    cookies: document.cookie || "",
    cookie_items: [],
    storage_tokens: [],
    active_courses_on_page: [],
  }

  // 1. Scan window.WIZ_global_data (Google Web Session Keys & XSRF)
  try {
    if (window.WIZ_global_data && typeof window.WIZ_global_data === "object") {
      const wiz = window.WIZ_global_data
      results.wiz_global_data = {
        snlm0e: wiz.SNlM0e || wiz.at || null,
        f_sid: wiz["f.sid"] || null,
        authuser: wiz.o6ZaF !== undefined ? String(wiz.o6ZaF) : "0",
        gaia_id: wiz.S06ba || null,
        build_label: wiz.bl || null,
        cfb2h: wiz.cfb2h || null,
      }
      console.log(
        "%c[GClass Exporter] Found WIZ session tokens (SNlM0e / f.sid).",
        "color: #0f9d58;",
      )
    }
  } catch (e) {
    console.warn("[GClass Exporter] WIZ scan warning:", e)
  }

  // 2. Scan window.gapi for OAuth access token
  try {
    const gapiToken =
      window.gapi?.auth?.getToken?.()?.access_token ||
      window.gapi?.client?.getToken?.()?.access_token ||
      window.google?.accounts?.oauth2?.getToken?.()?.access_token
    if (gapiToken) {
      results.oauth_bearer_token = gapiToken
      console.log(
        "%c[GClass Exporter] Found active OAuth2 Bearer token (gapi)!",
        "color: #0f9d58; font-weight: bold;",
      )
    }
  } catch (e) {
    // ignore
  }

  // 3. Scan localStorage & sessionStorage for OAuth tokens matching ya29 pattern
  const tokenRegex = /ya29\.[a-zA-Z0-9_\-]+/g
  function scanStorage(storage, name) {
    if (!storage) return
    try {
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i)
        const val = storage.getItem(key)
        if (!val) continue
        const matches = val.match(tokenRegex)
        if (matches) {
          matches.forEach((t) => {
            if (!results.storage_tokens.includes(t)) {
              results.storage_tokens.push(t)
              if (!results.oauth_bearer_token) {
                results.oauth_bearer_token = t
              }
            }
          })
          console.log(`%c[GClass Exporter] Found OAuth token in ${name}: ${key}`, "color: #0f9d58;")
        }
      }
    } catch (e) {
      // storage access might be restricted
    }
  }
  scanStorage(window.sessionStorage, "sessionStorage")
  scanStorage(window.localStorage, "localStorage")

  // Also check document.cookie for ya29 tokens
  if (document.cookie) {
    const cookieMatches = document.cookie.match(tokenRegex)
    if (cookieMatches) {
      cookieMatches.forEach((t) => {
        if (!results.storage_tokens.includes(t)) {
          results.storage_tokens.push(t)
          if (!results.oauth_bearer_token) results.oauth_bearer_token = t
        }
      })
    }
  }

  // 4. Query cookieStore if supported
  try {
    if (window.cookieStore && typeof window.cookieStore.getAll === "function") {
      const items = await window.cookieStore.getAll()
      results.cookie_items = items.map((c) => ({
        name: c.name,
        value: c.value,
        domain: c.domain,
        path: c.path,
        secure: c.secure,
        sameSite: c.sameSite,
      }))
    }
  } catch (e) {
    // cookieStore not available or blocked
  }

  // 5. Gather any visible course links from current DOM
  try {
    const courseAnchors = document.querySelectorAll('a[href*="/c/"]')
    const seen = new Set()
    courseAnchors.forEach((a) => {
      const href = a.href
      const m = href.match(/\/c\/([a-zA-Z0-9_\-]+)/)
      if (m && !seen.has(m[1])) {
        seen.add(m[1])
        const title = (a.innerText || a.getAttribute("aria-label") || "").trim()
        results.active_courses_on_page.push({
          course_id: m[1],
          course_title: title.split("\n")[0] || `Course ${m[1]}`,
          url: href,
        })
      }
    })
  } catch (e) {
    // ignore
  }

  console.log("%c[GClass Exporter] Token summary:", "color: #1a73e8; font-weight: bold;")
  console.log(
    "  • OAuth Bearer Token :",
    results.oauth_bearer_token ? "PRESENT (ya29...)" : "NOT FOUND (will use session cookies)",
  )
  console.log("  • WIZ XSRF Token     :", results.wiz_global_data?.snlm0e ? "PRESENT" : "ABSENT")
  console.log("  • Cookie Length      :", results.cookies.length, "chars")
  console.log("  • Courses Detected   :", results.active_courses_on_page.length)

  // 6. Trigger automatic download of gclass_tokens.json
  const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" })
  const downloadLink = document.createElement("a")
  downloadLink.href = URL.createObjectURL(blob)
  downloadLink.download = "gclass_tokens.json"
  document.body.appendChild(downloadLink)
  downloadLink.click()
  document.body.removeChild(downloadLink)

  console.log("%c============================================================", "color: #0f9d58;")
  console.log(
    "%c SUCCESS: 'gclass_tokens.json' DOWNLOADED! ",
    "background: #0f9d58; color: #fff; font-weight: bold; font-size: 14px; padding: 4px;",
  )
  console.log(
    "%c Next Step: Move 'gclass_tokens.json' into your 'gclass_scraping/' folder.",
    "color: #0f9d58; font-weight: bold;",
  )
  console.log(
    "%c Then run: py src/scrape.py run --token-file gclass_tokens.json",
    "color: #1a73e8; font-weight: bold;",
  )
  console.log("%c============================================================", "color: #0f9d58;")

  return results
})()
