# MBA Project Agent Guide

This file is the first stop for any AI agent working in this repository. Read it before changing code or content.

## 60-second orientation

- **Product:** P3MD MBA cohort knowledge base and academic portal.
- **Runtime:** Quartz 4 static site generator, TypeScript/TSX, Markdown content, SCSS.
- **Content:** `content/` is the published knowledge base. `content/index.md` is the portal home.
- **Program model:** `content/program/` contains governance, calendar, faculty, learning journey, and ALP pages.
- **Courses:** `content/courses/` contains curriculum pages and course material.
- **Theme/UI:** `quartz.config.ts`, `quartz.layout.ts`, `quartz/components/`, `quartz/styles/`.
- **Generated output:** `public/` is ignored and must not be edited by hand.
- **Reference material:** `Mightbeuseful/` contains source LaTeX material; treat it as input unless the task says otherwise.

## Quick start

```bash
npm install
npm run agent:context
npm run check
npm test
npx quartz build
```

Use `npm run docs` only when you need the local documentation server. Node.js 20+ and npm 10+ are expected.

## Agent operating rules

1. Inspect the relevant files and current git diff before editing. This checkout may contain user work; do not reset, stash, or overwrite unrelated changes.
2. Keep content changes in `content/`, site configuration in the root config files, and reusable UI changes in `quartz/`.
3. Prefer small, reviewable changes. Preserve existing frontmatter, wikilinks, asset paths, and course naming conventions.
4. Do not edit `public/`; regenerate it with `npx quartz build` when verification requires it.
5. Do not invent academic facts, faculty details, dates, or citations. Mark unknowns for human review.
6. Do not commit secrets, private source material, credentials, or generated build output.
7. Run the narrowest relevant checks, then run `npm run check` for TypeScript, formatting, and repository-wide validation.
8. Report: files changed, checks run and results, unresolved assumptions, and the next useful action.

## Task protocol

### Before work

- Run `npm run agent:context`.
- Read the target page/component and its nearest related pages.
- Record any assumption in the handoff note or final report.

### During work

- Preserve unrelated modifications shown by git.
- For content, validate links and frontmatter shape.
- For UI, keep responsive behavior and light/dark themes intact.
- For generated assets, explain the source and regeneration command.

### Before handoff

- Run the relevant test/build command.
- Review `git diff --stat` and `git diff --check`.
- Update `.agents/current-task.md` if work is incomplete or another agent must continue.
- Leave a concise handoff using `.agents/handoff-template.md`.

## Repository map

| Area                 | Purpose                                                  |
| -------------------- | -------------------------------------------------------- |
| `content/`           | Published Markdown, assets, and course/program knowledge |
| `quartz.config.ts`   | Site identity, theme, plugins, URL, content rules        |
| `quartz.layout.ts`   | Page layout and component placement                      |
| `quartz/components/` | TSX components and browser scripts                       |
| `quartz/styles/`     | Global and custom SCSS                                   |
| `quartz/plugins/`    | Content transforms and emitters                          |
| `quartz/*.test.ts`   | Unit tests colocated with implementation                 |
| `.github/workflows/` | CI, previews, and deployment                             |
| `.agents/`           | Agent context, task state, decisions, and handoffs       |

## Definition of done

A task is done only when the requested artifact exists, the relevant check has run successfully, the diff contains no accidental files, and the handoff states what remains (or explicitly says nothing remains).
