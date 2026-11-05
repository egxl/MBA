# Project: MK 1 Organizational Behaviour & Managing People Batch Ingestion

## Architecture

- **Curricular Layer (Static Site / Quartz 4)**:
  - Course Hub: `content/courses/mk1-organizational-behavior-managing-people/index.md` (MOC syllabus table)
  - Weekly Lecture Hubs: `content/courses/mk1-organizational-behavior-managing-people/week-01/` through `week-07/`
  - Reading Satellites: `reading-[slug].md` in each respective week folder
  - Standalone Case Dossiers: `case-[slug].md` (Week 03 _Rudi dan Kana_, Week 04 _Satya Nadella_, Week 06 _LCOP BUMN vs Private_)
  - Cohort Assignment Debriefs: `assignment-[slug].md` in Post-Class Debrief Mode (Mode B), attributed to `F9 (Class F / Syndicate 9)`
  - Selective Concept Layer: `content/concepts/growth-mindset.md` and `content/concepts/four-drive-model.md`
- **Archive Layer (Cold Storage)**:
  - Relocated from `inbox/MK 1 [PJ_Nisfit]-20261024T071545Z-1-001.zip` into `archive/courses/mk1/week-01/` through `archive/courses/mk1/week-07/`
  - Text extraction of all 15 `.docx` files into `.extracted/<file>.txt`
- **Validation & Verification Infrastructure**:
  - `scripts/check-wiki-integrity.mjs` (enforces all satellites are linked in `week-YY/index.md`, syncs concepts via `npm run wiki:sync`)
  - `npm run check` (TypeScript, Prettier, companion assets, titles, mermaid validation)
  - `npm test` (32 unit tests across scripts and quartz plugins)
  - `npx quartz build` (0 broken links build check)

## Feature Inventory

| #   | Feature                          | Description                                                                                                                          | Milestone | Source                   |
| --- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------- | ------------------------ |
| 1   | R1 Extraction & Staging          | Extract raw ZIP, relocate to `archive/courses/mk1/week-01..07`, parse 15 docx to `.extracted/`, clean `inbox/` to `README.md`        | M1        | ORIGINAL_REQUEST §R1     |
| 2   | R2 Week 01 Assignments           | Author `assignment-pre-strategizing-life.md` and `assignment-post-life-journey.md`, refactor `week-01/index.md` and link assignments | M2        | ORIGINAL_REQUEST §R2     |
| 3   | R3 W02-03 Lecture Hubs           | Author `week-02/index.md` and `week-03/index.md` matching `schema-templates.md` Template 1                                           | M2        | ORIGINAL_REQUEST §R3     |
| 4   | R4 Rudi dan Kana Case            | Synthesize standalone case dossier `case-rudi-dan-kana.md` in Week 03                                                                | M2        | ORIGINAL_REQUEST §R4     |
| 5   | R4/R5 W02-03 Readings & Debriefs | Author reading notes and F9 assignment debriefs for Weeks 02 & 03                                                                    | M2        | ORIGINAL_REQUEST §R4, R5 |
| 6   | R3 W04-05 Lecture Hubs           | Author `week-04/index.md` and `week-05/index.md` matching `schema-templates.md` Template 1                                           | M3        | ORIGINAL_REQUEST §R3     |
| 7   | R4 Satya Nadella Case            | Synthesize standalone case dossier `case-satya-nadella-microsoft.md` in Week 04                                                      | M3        | ORIGINAL_REQUEST §R4     |
| 8   | R4/R5 W04-05 Readings & Debriefs | Author reading notes and F9 assignment debriefs for Weeks 04 & 05                                                                    | M3        | ORIGINAL_REQUEST §R4, R5 |
| 9   | R3 W06-07 Lecture Hubs           | Author `week-06/index.md` and `week-07/index.md` matching `schema-templates.md` Template 1                                           | M4        | ORIGINAL_REQUEST §R3     |
| 10  | R4 LCOP BUMN vs Private Case     | Synthesize standalone case dossier `case-lcop-bumn-private.md` in Week 06                                                            | M4        | ORIGINAL_REQUEST §R4     |
| 11  | R4/R5 W06-07 Readings & Debriefs | Author reading notes and F9 assignment debriefs for Weeks 06 & 07                                                                    | M4        | ORIGINAL_REQUEST §R4, R5 |
| 12  | R6 Concept Extraction            | Author `content/concepts/growth-mindset.md` and `content/concepts/four-drive-model.md`, run `npm run wiki:sync`                      | M5        | ORIGINAL_REQUEST §R6     |
| 13  | R6 Syllabus MOC Sync             | Flip Weeks 01–07 to `**Ingested**` with active wikilinks in MK1 index; preserve Week 08–14 as `_Scheduled`                           | M5        | ORIGINAL_REQUEST §R6     |
| 14  | E2E Suite Verification           | Verify `npm run wiki:sync`, `npm run check`, `npm test`, `npx quartz build` with 0 broken links and clean inbox                      | M5        | Acceptance Criteria      |

## Milestones

| #   | Name                                            | Scope                                                                                                                              | Dependencies | Status |
| --- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------ |
| M1  | Archive Extraction & Ingestion Staging          | Unzip archive, catalog & relocate files to `archive/courses/mk1/week-01..07`, run `.docx` parsing to `.extracted/`, clean `inbox/` | none         | DONE   |
| M2  | Week 01 Enrichment & Weeks 02–03 Ingestion      | W01 assignments + index refactor, W02-W03 lecture hubs, `case-rudi-dan-kana.md`, readings, F9 debriefs                             | M1           | DONE   |
| M3  | Weeks 04–05 Ingestion & Satya Nadella Case      | W04-W05 lecture hubs, `case-satya-nadella-microsoft.md`, readings, F9 debriefs                                                     | M1           | DONE   |
| M4  | Weeks 06–07 Ingestion & LCOP BUMN Case          | W06-W07 lecture hubs, `case-lcop-bumn-private.md`, readings, F9 debriefs                                                           | M1           | DONE   |
| M5  | Concept Gate, Syllabus MOC & Final Verification | Author concepts, sync via `wiki:sync`, update course MOC, run `npm run check`, `npm test`, `npx quartz build`                      | M2, M3, M4   | DONE   |

## Interface Contracts

### Raw Archive ↔ Content Week Hubs

- Binaries located at `archive/courses/mk1/week-YY/<filename>`
- Parsed docx text located at `archive/courses/mk1/week-YY/.extracted/<filename>.txt`
- Video files kept in `archive/` without duplicating to `content/`
- All relative cross-references from week hubs use Quartz wikilinks: `[[courses/mk1-organizational-behavior-managing-people/week-YY/reading-slug|Reading Title]]`
- Every satellite file (`reading-*`, `case-*`, `assignment-*`) MUST be referenced in `content/courses/mk1-organizational-behavior-managing-people/week-YY/index.md` to satisfy `scripts/check-wiki-integrity.mjs`.

### Concepts Layer ↔ Course Hubs

- `content/concepts/growth-mindset.md`:
  - Aliases: `Pola Pikir Berkembang`, `Growth Mindset Framework`
  - Referenced from Week 04 (`[[concepts/growth-mindset|Growth Mindset]]`) and Rabuan 02
- `content/concepts/four-drive-model.md`:
  - Aliases: `Model Empat Dorongan`, `Four-Drive Theory of Employee Motivation`
  - Referenced from Week 03 (`[[concepts/four-drive-model|Four-Drive Model]]`)
- Auto-registered into `content/concepts/index.md` via `node ./scripts/check-wiki-integrity.mjs --sync`

### Course MOC ↔ Weekly Index Pages

- In `content/courses/mk1-organizational-behavior-managing-people/index.md`:
  - Weeks 01–07: `Topic & Core Focus` has active wikilink `[[courses/mk1-organizational-behavior-managing-people/week-YY/index|Topic Title]]` and `Note Hub` has `**Ingested**`
  - Weeks 08–14: Topic title plain text, Note Hub has `_Scheduled (Pending Ingestion)_`

## Code Layout

- `content/courses/mk1-organizational-behavior-managing-people/`
  - `index.md` (Course Syllabus MOC)
  - `week-01/` (`index.md`, readings, `assignment-pre-strategizing-life.md`, `assignment-post-life-journey.md`)
  - `week-02/` (`index.md`, readings, `assignment-pre-*.md`, `assignment-post-*.md`)
  - `week-03/` (`index.md`, `case-rudi-dan-kana.md`, readings, assignments)
  - `week-04/` (`index.md`, `case-satya-nadella-microsoft.md`, readings, assignments)
  - `week-05/` (`index.md`, readings, assignments)
  - `week-06/` (`index.md`, `case-lcop-bumn-private.md`, readings, assignments)
  - `week-07/` (`index.md`, readings, assignments)
- `content/concepts/`
  - `growth-mindset.md`
  - `four-drive-model.md`
- `archive/courses/mk1/`
  - `week-01/` to `week-07/` with `.extracted/` folders
- `inbox/`
  - `README.md` ONLY
