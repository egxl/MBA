---
name: checkpoint
description: >-
  Run repo checks, group dirty files into logical dependency-ordered incremental
  commits, and push to the remote branch. Use for /checkpoint, "commit and push
  incrementally", "create savepoints", or "incremental commit".
---

# Incremental Checkpoint & Push (`checkpoint`)

Turn a dirty working tree into clean, reversible Conventional Commit checkpoints, verified against repository checks before pushing.

## Execution Steps

### 1. Inventory & Safety Guard

Run `npm run checkpoint:plan`.

- If **clean**, check `git status` for ahead commits: push if ahead, otherwise report clean state and stop.
- If **blocked files** are flagged (`.env*`, credentials, `public/`, `raw/`, `inbox/`, `archive/`, `private/`, `.github/hooks/`):
  - **Never stage them.** Either add machine-local/generated paths to `.gitignore` if appropriate or stop and ask the user.

### 2. Pre-Commit Validation Gate

Run full verification before committing:

```bash
npm test
npm run check
```

- If `prettier` reports formatting issues only on changed files, run `npx prettier --write <changed-files>` and re-run `npm run check`.
- Do not commit if TypeScript, unit tests, companion assets, titles, wiki integrity, Mermaid, or markdown table checks fail.

### 3. Stage & Commit Incrementally (Dependency Order)

Process non-empty buckets from `npm run checkpoint:plan` in dependency order:

1. `tooling-engine`: `package.json`, `.gitignore`, `scripts/`, `quartz/build.ts`, `quartz/plugins/`, `.github/workflows/`
2. `ui-components`: `quartz/components/`, `quartz/styles/`, `quartz.config.ts`, `quartz.layout.ts`, `content/assets/`
3. `agent-protocols`: `AGENTS.md`, `.agents/`
4. `program-docs`: `content/program/`, `content/index.md`
5. `rabuan-sessions` + `concepts-entities`:
   - If multiple dated Rabuan sessions changed, split **one commit per session**, pairing each `content/rabuan/<date>-<slug>.md` with its newly added/linked `content/entities/`, `content/concepts/`, and directory index updates (stage specific index files with the final session or dedicated index commit if shared).
   - If standalone concepts/entities changed without a Rabuan session, commit them together as `feat(concepts): ...`.
6. `curriculum-updates`: Modified existing `content/courses/` MOCs and weekly pages.
7. `curriculum-new`: New untracked weekly modules (e.g., `week-10/`, `week-11/`).
8. `other`: Any remaining safe changes grouped by scope.

**Rules per commit:**
- Inspect `git diff -- <paths>` or status summary so the commit message reflects real intent.
- Stage explicit paths (`git add <paths>`) — never blind `git add -A`.
- Use Conventional Commits (`feat(scope): ...`, `fix(scope): ...`, `docs(scope): ...`, `refactor(scope): ...`, `chore(scope): ...`), imperative mood, concise subject.
- Never split tightly coupled dependent files across broken commits; if all changes belong to one cohesive theme, make one clean commit.

### 4. Push & Verify

```bash
git status
git push origin <current-branch>
git log -n <N+1> --oneline
```

Report:
- Ordered list of commit hashes, messages, and file counts.
- Exact checks run and pass counts.
- Push target and clean working-tree confirmation.
