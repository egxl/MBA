# Current Task

Status: Complete.

## Active objective

Update the landing page course cards to display the original MK names with responsive typography and grid adaptations.

## Constraints and assumptions

- Keep unrelated working-tree changes intact.
- Record unresolved questions here before handing work to another agent.
- Keep exploration artifacts separate from `content/index.md` until a direction is approved.

## Progress log

| Date       | Agent       | Update                                                                                                                                                                                                      |
| ---------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-09-29 | Antigravity | Completed validation checks, formatting, initial commit and push                                                                                                                                            |
| 2026-09-29 | Antigravity | Updated README.md without emojis, verified formatting and checks                                                                                                                                            |
| 2026-09-29 | Antigravity | Beautified README.md with tables, badges, and zero emojis                                                                                                                                                   |
| 2026-09-29 | Hermes      | Polished the portal homepage and mobile navigation; verified build, tests, themes, and responsive layouts                                                                                                   |
| 2026-09-29 | Hermes      | Created a responsive People & Teams comparison sheet for three SVG directions; production art unchanged                                                                                                     |
| 2026-09-29 | Hermes      | User chose direction A; created People & Teams, Finance, and Operations family study; production unchanged                                                                                                  |
| 2026-09-29 | Hermes      | User approved direction A; completed all eight companions and responsive full-family review board                                                                                                           |
| 2026-09-29 | Hermes      | Integrated eight named SVG assets; verified checks, tests, build, desktop themes, and 390px mobile rendering                                                                                                |
| 2026-09-29 | Antigravity | Configured portal grid background to be static with `background-attachment: fixed`                                                                                                                          |
| 2026-09-29 | Antigravity | Integrated Anthropic brand type system (Anthropic Serif, Sans, Mono) with local variable WOFF2 fonts and CDN fallbacks                                                                                      |
| 2026-09-29 | Antigravity | Reversed typography roles to follow Anthropic's signature system: Anthropic Sans for headings, Anthropic Serif for body/reading                                                                             |
| 2026-09-29 | Antigravity | Applied portal grid background and warm paper styling everywhere across the site (both light & dark themes)                                                                                                 |
| 2026-09-29 | Antigravity | Rearranged landing page to start with core courses and hero "What do you want to learn today?", moved subnav to Program section                                                                             |
| 2026-09-29 | Antigravity | Refactored course cards to 2-column landscape layout (160px height) with generous edge margins and compact hero/header, ensuring all 6 core courses fit in one desktop viewport above the fold              |
| 2026-09-29 | Antigravity | Expanded card left padding to clamp(2.25rem, 3.2vw, 3rem) (~48px), widened desktop container to 1320px, and loosened section margins                                                                        |
| 2026-09-29 | Hermes      | Removed homepage sidebar tracks, protected course-card insets from Quartz `.internal` link styling, tightened the core grid to 152px cards, and verified the live 1366×768 desktop render                   |
| 2026-09-29 | Antigravity | Implemented floating top navbar enclosing all controls (toggle, logo, home, search, dark mode, reader mode); verified desktop, mobile (390px), light/dark themes, tests, and build                          |
| 2026-09-29 | Antigravity | Eliminated inherited h2 bottom border under P3MD navbar logo; added smooth enter/exit and chevron rotation animations for explorer circle pill button; verified tests, build, and screenshots               |
| 2026-10-06 | Antigravity | Aligned landing page layout with reader-mode 300px left and right empty spaces; configured responsive 2/3-column core course grid; verified tests, check, and build                                         |
| 2026-10-06 | Antigravity | Made Backlinks collapsible by default and docked at the bottom of the right sidebar with count badge and chevron; expanded TOC flex allocation with internal scroll; verified unit tests, checks, and build |
| 2026-10-06 | Antigravity | Updated landing page cards to original MK names, tuned card typography and grid-auto-rows to prevent clipping, synchronized companion manifest titles, and regenerated review board; verified tests, checks, and build |

## Remaining work

- None. Verified with `npm test`, `npm run companions:check`, `npm run check`, and `npx quartz build`.
