# Google Classroom Metadata, Tasks, Schedules & Drive Links Scraper (`gclass_scraping`)

Dual-engine institutional Google Classroom metadata, assignment schedules, and attachment link scraper powered by [Google Classroom REST API](https://developers.google.com/classroom) and [Scrapling](https://scrapling.readthedocs.io/).

## Core Policies

1. **Zero Binary Downloads**: Files (PDFs, PPTXs, docs) are **never downloaded**. The tool only extracts the file name, URL, schedule timestamps, and metadata.
2. **Drive Folders Never Opened**: Links matching `drive.google.com/drive/folders/...` are tagged as `drive_folder` and `saved_without_opening`. The scraper does not traverse into Drive folders.
3. **Artifact Isolation**: All output catalogs, spreadsheets, and schemas are strictly exported to `gclass_scraping/output/`.

---

## Quickstart (Recommended: Browser Console Token Export)

### Step 1: Export Tokens from Your Browser

1. In your regular browser (where you are signed in to Google Classroom), open [classroom.google.com](https://classroom.google.com).
2. Press **F12** (or right-click -> **Inspect**) and click the **Console** tab.
3. Copy and paste the entire script from [`export_tokens.js`](export_tokens.js) into the console and press **ENTER**.
4. The file `gclass_tokens.json` will automatically download to your computer.
5. Move `gclass_tokens.json` into the `gclass_scraping/` folder in this repository.

### Step 2: List Discovered Courses

```bash
# Automatically detects gclass_tokens.json
py src/scrape.py courses
```

### Step 3: Run the Scraper

```bash
# Scrape all courses, tasks, deadlines, materials, and Drive links
py src/scrape.py run

# Or filter by specific course name (e.g. MK3)
py src/scrape.py run --course "MK3"

# Direct Bearer token execution (if using OAuth2 token directly)
py src/scrape.py run --token "ya29.a0..."
```

---

## Fallback: Interactive Browser Login

If you do not use `export_tokens.js`, you can run an interactive login via Scrapling/Playwright:

```bash
# 1. Interactive login (opens visible browser)
py src/scrape.py login

# 2. Run scraper with saved session
py src/scrape.py run
```

---

## Output Files

All logs and catalogs are exported to `gclass_scraping/output/`:

| Output File                         | Format   | Description                                                                                           |
| :---------------------------------- | :------- | :---------------------------------------------------------------------------------------------------- |
| `classroom_materials.json`          | JSON     | Complete hierarchical tree of courses, topics, coursework items, announcements, and Drive attachments |
| `classroom_schedules_and_tasks.csv` | CSV      | Dedicated deadline spreadsheet: Course, Topic, Task Title, Due Date, Max Points, and Post URL         |
| `classroom_links.csv`               | CSV      | Flat spreadsheet containing Course, Topic, Item Title, File Name, Link Type, and Drive URL            |
| `classroom_catalog.md`              | Markdown | Formatted catalog grouped by Deadlines Summary, Course, and Topic with clean Markdown tables          |

---

## Running Tests

Run the unit test suite:

```bash
py -m unittest discover -s tests
```
