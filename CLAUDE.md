# Bexhearts — Agent Instructions

**Before any work: read `docs/PROGRESS.md`.** It is the single source of truth for project state, the feature roadmap, decisions, and known bugs. Map every requested task to its phase there, respect dependencies between phases, and update statuses when you finish.

## Project docs — where things live (the index)
| File | Its one job | Read it when |
|---|---|---|
| **`docs/PROGRESS.md`** | **WHAT & WHY + status** — features, phases, positioning, decisions, known bugs. The source of truth. | Always, first |
| **`docs/STEPS.md`** | **HOW & in what ORDER** — the modular build playbook; every step has a test checkpoint | You're implementing/building |
| **`docs/MARKETING.md`** | **Go-to-market** — positioning, content playbook, reusable prompt templates, feature→content-angle map | You're creating marketing/content |
| **`docs/HANDOFF.md`** | **Resume brief** — paste-to-bootstrap a fresh session; running notes + current position + env gotchas. Keep updated as work progresses. | Starting a new chat / context full |
| **`docs/PRIVACY_POLICY.md`** | **Data-handling draft** (attorney review pending) — what we collect/process/share/retain | Your change touches data collection, processing, sharing, or retention |
| **`docs/TERMS_OF_SERVICE.md`** | **User-rights draft** (attorney review pending) — subscriptions, points, bans, deletion | Your change touches user rights, monetization, rewards, or enforcement |
| **`README.md`** | Environment setup, commands, how to run & test the app | You're setting up or running the app |
| **`AGENTS.md`** | Same rules as this file, for non-Claude agents (Codex, Antigravity, any LLM). Keep in sync with this file. | (other agents read this) |

## Hard rules
- **Never run database migrations** against any environment (no `supabase db push`, no `db reset`, no executing SQL against a DB). Write new numbered files in `supabase/migrations/` only; the owner applies them manually via Supabase Studio.
- Schema changes are append-only: new migration file every time, never edit applied ones.
- All Supabase table access goes through hooks in `src/api/` — screens never call `supabase.from()` directly.
- Paid SDKs (RevenueCat, Superwall, PostHog) must keep degrading gracefully when env keys are placeholders.
- Priority is functionality over UI polish until Phases 3–5 in `docs/PROGRESS.md` are verified working.
- **Tests ship with the work, not after.** Every feature/bugfix includes unit tests in `__tests__/`; `npm run typecheck && npm run lint && npm test` must pass before a task is considered done.
- **Render-verify UI work yourself before handing off (owner rule, 2026-07-04).** With the iOS sims running, drive the app: deep-link the screen (`xcrun simctl openurl <udid> "exp://127.0.0.1:8081/--/<route>"`), screenshot it (`xcrun simctl io <udid> screenshot out.png`), READ the screenshot, and scan device logs for JS errors (`xcrun simctl spawn <udid> log show --last 5m --predicate 'processImagePath CONTAINS "Expo"'`). Find and fix failures yourself first; only then ask the owner to test. List booted sims with `xcrun simctl list devices booted`.

## Cross-document update rule (keep the docs in sync)
These docs describe one project from different angles. When you change one, update the others **in the same pass**:
- Change a **feature, phase, or decision** in `docs/PROGRESS.md` → reflect it in `docs/STEPS.md` (build steps) and in the feature→angle map in `docs/MARKETING.md`.
- Add/reorder **build work** → update `docs/STEPS.md`, and flip the matching `docs/PROGRESS.md` statuses when done.
- Change **positioning/audience** → update `docs/MARKETING.md` and the positioning block in `docs/PROGRESS.md`.
- **Legal docs are living documents:** any change that affects data collection, processing, sharing, or retention → update `docs/PRIVACY_POLICY.md`; any change affecting user rights, obligations, monetization, points/rewards, bans, or deletion → update `docs/TERMS_OF_SERVICE.md`. Classify the change, fit it into the right section, and append the internal change log — in the same pass as the feature work. Both are DRAFTS pending attorney review; never present them as final legal advice.
- Mirror any change to THIS file into `AGENTS.md` (and vice-versa) so all agents share one protocol.

Verify with: `npm run typecheck && npm run lint && npm test`
