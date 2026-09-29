# P3MD SVG Character Rebuild — Session Handoff

## User request and status

The user wants a PLAN to remake the SVG characters because the current set recreates Socratica's toolkit illustrations. Goal: an original, course-relevant P3MD family. The user then requested moving this discussion to a fresh session.

This is still planning. No character direction has been approved and no replacement SVG artwork has been implemented. Do not interpret the assistant's recommendation as user approval. Keep this task separate from a broader homepage redesign.

## Repository and prerequisites

- Repository: C:\GitHub\MBA
- Product: P3MD MBA cohort academic portal / knowledge base.
- Stack: Quartz 4, Markdown with inline HTML/SVG, TypeScript/TSX, SCSS.
- Read AGENTS.md and run npm run agent:context before work; inspect git status/diff and preserve existing modifications.
- Load claude-design for design process.
- Current eight SVG illustrations live inline in content/index.md. Related card styling is in quartz/styles/custom.scss.
- Existing viewBox: 0 0 200 150. Check current desktop/mobile rendering constraints before drawing.
- Never hand-edit generated public/.

## Existing work to preserve

The preceding session modified homepage hierarchy, program links, core/additional grouping, card styles, and mobile header/search layout. It did NOT replace the character artwork. Changes were left uncommitted; inspect the current checkout rather than assuming it is still unchanged.

Prior validation ran TypeScript/Prettier, 70 unit tests, and Quartz build successfully. Screenshot review was limited to homepage desktop/mobile views, not a comprehensive accessibility or interaction audit. Re-run relevant checks for new edits.

## Proposed design directions (not approved)

A. Fieldwork companions — RECOMMENDED: invented characters whose construction and action relate to the course, in a restrained illustrated-manual aesthetic. Not stock business icons with eyes or geometric blobs with accessories.
B. Cohort crew: stylized humans collaborating, negotiating, analyzing, and building. More human, but harder to read at small sizes.
C. Living systems: expressive assemblies of parts, flows, and mechanisms. More conceptual and potentially less immediately legible.

The homepage is an Explore surface: illustrations should aid course recognition without competing with titles.

## Proposed character concepts (validate against course content)

| Destination             | Working concept                                                              | Meaning                                                                |
| ----------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| People & Teams          | The Convenor: small ensemble assembling a shared structure                   | Coordination and interdependence, not a lone hero                      |
| Financial Strategy      | The Allocator: counterweight-bodied character distributing finite tokens     | Resource allocation and trade-offs, not simply growth                  |
| Marketing & Value       | The Listener: asymmetric receiver-and-message character                      | Listening and matching an offering to a need                           |
| Operations & SCM        | The Relay: modular carrier passing a parcel along a route                    | Flow and handoffs                                                      |
| Decisions & Negotiation | The Mediator: two articulated halves aligning a shared central piece         | Different positions reaching agreement                                 |
| Business Analytics      | The Investigator: lens-bodied character tracing a pattern among observations | Evidence and interpretation                                            |
| PeopleMath              | The Modeler: bead-frame character arranging people-shaped counters           | Provisional metaphor; check actual course objectives before committing |
| Action Learning Project | The Builder: fieldwork character joining a plan to a constructed piece       | Moving from understanding to practical implementation                  |

## Shared illustration grammar

- Distinct silhouettes, legible in monochrome.
- Purposeful asymmetry, articulated parts, and recognizable actions.
- Expressions conveyed through posture/construction, not the same dot eyes and smile everywhere.
- Consistent outline treatment and optical weight at mobile size.
- Shared neutral ink and warm highlight; limited course accents.
- One dominant idea, at most one supporting prop per character.
- Consistent optical size and safe margins.
- Do not trace or adapt existing characters. Do not use official insignia or cultural ornament merely to imply originality.

## Proposed staged workflow

1. Read actual course introductions/learning objectives and inspect current artwork in context.
2. Create a comparison sheet showing People & Teams in all three directions. Do not replace production art yet.
3. Ask the user to choose the visual language.
4. Develop Financial Strategy and Operations & SCM in the chosen direction; verify the trio are distinct but coherent.
5. Complete remaining five after approval.
6. Show artwork on actual card backgrounds, at desktop/mobile sizes, in both page themes, and as monochrome silhouettes.
7. Integrate individual named SVG assets rather than large inline blocks, subject to Quartz's actual asset conventions.
8. Preserve titles, links, and homepage layout. Keep decorative images out of the accessibility tree.
9. Static artwork first; any later animation should express course action and respect reduced motion.
10. Optionally rename touched socratica-_ classes to portal-_ consistently. Class renaming is housekeeping, not evidence of originality.

## Acceptance criteria

- Eight original, distinct silhouettes/poses/course actions; no dependence on previous character geometry.
- Cohesive family without eight variants of the same body.
- Details survive at existing mobile sizes and contrast against card backgrounds.
- SVGs have no clipping, external dependencies, or conflicting IDs.
- Validate rendered homepage in both themes and run npm run check, npm test, npx quartz build, and git diff --check.

## Suggested next-session prompt

Continue planning the original SVG character rebuild in C:\GitHub\MBA. Read AGENTS.md and .agents/svg-rebuild-brief.md, then inspect the existing illustrations and course context. We have not approved a direction yet. Keep scope on the characters, not another homepage redesign. Help me choose among the proposed directions before replacing any production SVGs.
