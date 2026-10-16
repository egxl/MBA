# Course Ingestion Protocol (`course-ingestion-protocol.md`)

This protocol outlines the 8-phase workflow for ingesting raw course materials into the **P3MD MBA Knowledge Base** while maintaining complete depth and academic rigor.

---

## 8-Phase Execution Workflow

### Phase 1: Intake & Triage (Hybrid Expansion Flow)

1. Inspect `raw/courses/mkX/week-YY/`.
2. Check for pre-expanded lecture drafts:
   - If `handbook-draft.md`, `handbook-draft.tex`, or `handbook-draft.txt` is present $\rightarrow$ use directly as the expanded, grounded lecture baseline (see [Hybrid Expansion Protocol](./hybrid-expansion-protocol.md)).
   - If only raw slides (`.pdf`, `.pptx`) exist $\rightarrow$ prompt the user to run the Unified Slide-to-Handbook Master Prompt in Gemini Advanced Web or ChatGPT Prism to avoid local token exhaustion and loss of depth.
3. Inventory supplemental course materials:
   - Harvard Business Review / journal readings (`.pdf`) $\rightarrow$ Flag for dedicated `reading-*.md` satellites.
   - Pre-assignments and enterprise case studies (`.pdf`) $\rightarrow$ Flag for dedicated `case-*.md` satellites.
   - Explainer or lecture video recordings (`.mp4`) and transcripts (`.txt`).
   - Official cloud repository links (`drive_links_to_be_inserted.txt`).

### Phase 2: Author Dedicated Satellites First (Bottom-Up Rigor)

To prevent summarizing away crucial details, author the deep-dive satellites **before** drafting the master lecture hub:

- For each academic reading, author `content/courses/mkX/week-YY/reading-[slug].md` following the [Depth & Academic Rigor Standard](./depth-and-rigor-standard.md):
  - Extract all named corporate crucibles (CEOs, companies).
  - Reconstruct all diagnostic exercises with full instructions and scoring rubrics.
  - Reconstruct comparative tables and exhibits.
  - Formulate classroom cold-call answers for pre-assignment discussion questions.
- For business cases, author `case-[slug].md` with financial exhibits and strategic option tradeoffs.

### Phase 3: Author the Master Lecture Hub (`index.md`)

Create `content/courses/mkX/week-YY/index.md` synthesizing the entire week:

- **Act 1 (Dilemma)**: Boardroom stakes, systemic failure points, planning paradox.
- **Act 2 (Mechanism)**: In-class presentation models, $\LaTeX$ formulations, Mermaid process diagrams.
- **Act 3 (Crucible)**: Indonesian enterprise realities, BUMN dynamics, high power-distance challenges, AKHLAK values.
- **Act 4 (Debrief)**: Cross-reading synthesis and leadership provocation.
- **📚 Required Readings & Satellites Table**: Comprehensive overview table linking to every satellite authored in Phase 2.
- **📂 Primary Source Media**: Complete table linking to official Google Drive video streams, slide downloads, and raw repo files.
- **🔗 Knowledge Graph & Curriculum Bridges**: Wikilinks to concepts, entities, next module, and course overview.

### Phase 4: Concept Extraction & Qualification Gate

Evaluate every framework or business metric against the 3 Qualification Gates:

1. Is it a recognized academic framework?
2. Is it a measurable business formula or metric?
3. Is it a core strategic mechanism spanning multiple business functions?

If qualified:

- If `content/concepts/[slug].md` exists, append the new course perspective: `### Perspective: MK X ([Course Name])`.
- If it does not exist, author `content/concepts/[slug].md` with universal definition, multi-disciplinary lenses, and ALP application callout.

### Phase 5: Living Entity Profiling

Extract key theorists, academic authors, and enterprise leaders:

- Author or update `content/entities/[slug].md` with executive background, core philosophy, and course contributions.

### Phase 6: Hub Directory Synchronization (Zero Orphan Pages)

Update the master index hubs:

1. Open `content/concepts/index.md` and add the new concept(s) to the appropriate pillar under `## 🏛️ Six Core Business Pillars`.
2. Open `content/entities/index.md` and add the new entity to the appropriate category under `## 👥 Principal Taxonomy`.

### Phase 7: Course MOC Status Flip (The Strict Anti-Stub Rule)

Open the course overview page `content/courses/mkX-[course-name]/index.md`:

- Locate the 14-week curriculum table.
- Flip the current week's row from:
  - `| **Week YY** | Plain Text Title | Module Name | _Scheduled (Pending Ingestion)_ |`
    to:
  - `| **Week YY** | [[courses/mkX-slug/week-YY/index\|Week YY: Active Link Title]] | Module Name | **Ingested** |`
- Ensure all other un-ingested weeks remain plain text without broken links.

### Phase 8: Verification & Integrity Build

Execute the complete repository validation suite:

```powershell
npm run check
npm test
npx quartz build
```

Ensure:

- 0 duplicate body `<h1>` tags.
- 0 broken Quartz wikilinks.
- Static HTML build emits successfully.
