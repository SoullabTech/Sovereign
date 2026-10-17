# R66 — Real Press import → Writer’s Studio navigation, lost-response retry

**October 17, 2026 · Fictional localhost Next.js/WebKit + actual disposable PostgreSQL16 · Beta HOLD**

## Why this work exists

R65 accepted one-gesture/one-Work pasted manuscript persistence using actual Next.js route handlers and physical PostgreSQL, but its tests bypassed the rendered Press UI and browser navigation. The founder’s initial beta priority is an ordinary writer’s reliable import and editing experience using verified conventional security, while sovereign independent key custody remains a later upgrade.

This R66 candidate changes **no application behavior, runtime database migrations or feature flags**. It adds a truthful reproducible end-to-end test for the actual Press page, real Next.js POST/GET and canonical Writer route, instead of a recreated editor screen or mocked writing API.

## Precisely tested author journey

The new `scripts/ops/wsBetaR66ActualPressBrowser.cjs` runs headless WebKit against a real Next.js dev server on a random 127.0.0.1 port. It uses only two fabricated PostgreSQL auth_sessions and a disposable database. It proves:

1. An anonymous browser cannot enter the import form.
2. The real member’s Press screen can paste fictional authored text, set its title and choose **Import into Author Studio**. The preview makes a read-only POST and does **not** mint a manuscript before confirmation.
3. The member selects the actual **Save manuscript** button. Playwright lets the request reach the real Next handler and PostgreSQL transaction, verifies HTTP **201**, then simulates a lost HTTP response by delivering a synthetic 503 *after* commit.
4. The unchanged Press UI displays “Could not save. Please try again.” It retains the original confirmed preview and enables the existing Save button. The member retries, sending the **same UUID** and unchanged author payload to the **real handler**.
5. The second real POST returns HTTP **200** and the identical Work identity. The browser navigates to the genuine `/writers-studio?mode=write&m=...` destination and **remains there** after the navigation has committed.
6. The original member’s actual manuscript GET returns HTTP 200, all confirmed sections and `private, no-store`. A separate valid fictional member session sees **404**. The real mobile WebKit Press page fits the 390px viewport without horizontal scrolling.
7. PostgreSQL independently confirms exactly **one added manuscript, one original Source, one used confirmation and one active request payload**. Every off-host browser request is aborted and counted; every other HTTP mutation receives 423 and none is accepted. The server log is checked for fictional manuscript prose.
8. WebKit, real Next.js server and exclusive disposable PostgreSQL16 container all close; the fake vault and temporary files are removed.

Browser API content is **not mocked** for manuscript listing, Save, and single-manuscript reopening. Unrelated API GETs are deliberately returned fictional 404, and unrelated writes refuse 423. This does **not** qualify true MAIA Review/Apply/Undo, remote provider model calls, real member sessions, actual shipping image, clinical confidential content or live external storage encryption.

## Necessary genuine schema and developer-mode qualifications

The first held browser run uncovered a **missing real `manuscript_working_drafts` table**. The actual Press manuscript catalog requires the working-Draft and revision tables; existing R63 physical tests never called that richer GET. The harness was repaired by applying the **actual** `20260727000001_manuscript_working_drafts.sql` migration to the disposable PostgreSQL database. No synthetic GET payload or production migration was added.

The next held run persisted correctly (201 then 200, identical manuscript ID) but its browser navigation did not settle because the Next dev server compiled the previously unopened Writer route mid-transition and forced a client reload. Changing Playwright’s wait to `commit` did not mask this: the candidate **still held**. The final accepted harness precompiles the *actual* `/writers-studio?mode=write&m=fake` route with the same fake authenticated session **before** opening the real Press browser. It then enforces genuine destination navigation and checks the browser remains on Writer’s Studio after commit. No UI component, redirect behavior, application Source or author safeguards was changed.

All held evidence directories are retained separately from the passing run. The accepted browser reports explicit check labels and a sanitized pathname-only navigation trail, not manuscript text or member IDs.

## Release controls unchanged

This is a test-only source branch off exact R65 `df62b6f3a2b5af339c901d25eae7949cf1247d23`. The complete accepted R63/R65 fictional PostgreSQL suites still run first in the same isolated database and validate Source/sections atomicity, concurrent retries, changed-payload refusal, deleted-Work tombstones, active fingerprint deletion and fresh-process reopening. **No real writer/provider/cloud keys, actual member content, production database, mail, migration deployment or tester admission** are used.

**Still HOLD for beta:** independently verify conventional production database/file/NAS/offsite backup encryption and restore; safely qualify file-upload and older unkeyed import paths; prove the *real* authenticated browser’s Develop/Write/MAIA Review→Apply→separate Undo/export through adequate secured storage; fix the full unsuppressed shipping TypeScript build; test real Mac Safari and physical iPhone; approve truthful new member/provider notice and two individually authorized canary writers. The stronger sovereign key service remains a future opt-in upgrade, not a universal prerequisite for ordinary writer beta.

**Do not mistake real local WebKit (Playwright) for a member’s actual Safari session, or test-mode 404 mocks for a qualified editorial backend.**
