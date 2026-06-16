# Bexhearts — Agent Instructions (shared protocol)

This file is the shared instruction set for any AI agent working on Bexhearts — **Codex, Antigravity, Cursor, or any other LLM**. It mirrors `CLAUDE.md`; the two MUST be kept identical in substance. If you edit one, edit the other in the same pass.

**Before any work: read `docs/PROGRESS.md`.** It is the single source of truth for project state, the feature roadmap, decisions, and known bugs. Map every requested task to its phase there, respect dependencies between phases, and update statuses when you finish.

## Project docs — where things live (the index)
| File | Its one job | Read it when |
|---|---|---|
| **`docs/PROGRESS.md`** | **WHAT & WHY + status** — features, phases, positioning, decisions, known bugs. The source of truth. | Always, first |
| **`docs/STEPS.md`** | **HOW & in what ORDER** — the modular build playbook; every step has a test checkpoint | You're implementing/building |
| **`docs/MARKETING.md`** | **Go-to-market** — positioning, content playbook, reusable prompt templates, feature→content-angle map | You're creating marketing/content |
| **`README.md`** | Environment setup, commands, how to run & test the app | You're setting up or running the app |
| **`CLAUDE.md`** | The same rules as this file, for Claude Code. Keep in sync with this file. | (Claude reads that one) |

## Hard rules
- **Never run database migrations** against any environment (no `supabase db push`, no `db reset`, no executing SQL against a DB). Write new numbered files in `supabase/migrations/` only; the owner applies them manually via Supabase Studio.
- Schema changes are append-only: new migration file every time, never edit applied ones.
- All Supabase table access goes through hooks in `src/api/` — screens never call `supabase.from()` directly.
- Paid SDKs (RevenueCat, Superwall, PostHog) must keep degrading gracefully when env keys are placeholders.
- Priority is functionality over UI polish until Phases 3–5 in `docs/PROGRESS.md` are verified working.
- **Tests ship with the work, not after.** Every feature/bugfix includes unit tests in `__tests__/`; `npm run typecheck && npm run lint && npm test` must pass before a task is considered done.

## Cross-document update rule (keep the docs in sync)
These docs describe one project from different angles. When you change one, update the others **in the same pass**:
- Change a **feature, phase, or decision** in `docs/PROGRESS.md` → reflect it in `docs/STEPS.md` (build steps) and in the feature→angle map in `docs/MARKETING.md`.
- Add/reorder **build work** → update `docs/STEPS.md`, and flip the matching `docs/PROGRESS.md` statuses when done.
- Change **positioning/audience** → update `docs/MARKETING.md` and the positioning block in `docs/PROGRESS.md`.
- Mirror any change to THIS file into `CLAUDE.md` (and vice-versa) so all agents share one protocol.

Verify with: `npm run typecheck && npm run lint && npm test`
