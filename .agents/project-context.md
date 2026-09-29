# Project Context

## Identity

- Name: P3MD MBA Knowledge Base
- Site engine: Quartz 4.5.2
- Primary content language: English with Indonesian institutional/course terminology
- Audience: P3MD MBA cohort, faculty, assistants, and project stakeholders

## Architecture

1. Markdown in `content/` is transformed by Quartz plugins.
2. `quartz.config.ts` controls frontmatter, wikilinks, LaTeX, tags, dates, assets, RSS, and OG images.
3. `quartz.layout.ts` and `quartz/components/` control the rendered experience.
4. Build output is emitted to ignored `public/`.

## Current information architecture

- `/` — cohort portal and curriculum roadmap
- `/program/` — program architecture, learning journey, ALP, calendar, faculty directory
- `/courses/` — course index and course content
- `/tags/` — generated taxonomy pages

## Change boundaries

- Add or revise knowledge: `content/`
- Change site behavior: `quartz/` or root config
- Change agent coordination: `.agents/` and `AGENTS.md`
- Never hand-edit `public/`

## Validation commands

- `npm run check` — TypeScript and Prettier check
- `npm test` — test suite
- `npx quartz build` — production build
- `git diff --check` — whitespace/error scan

## Known assumptions to verify

- `quartz.config.ts` currently uses `quartz.jzhao.xyz` as `baseUrl`; confirm before changing deployment settings.
- Existing working-tree modifications predate the agent task unless explicitly attributed otherwise.
- Academic claims should be sourced from project material or provided by the user.
