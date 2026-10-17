# Writer's Studio R62 — Genuine SQL-backed held author POST qualification

**17 October 2026 | Mac Studio | Separate fictional-only PostgreSQL16 acceptance | Real members, five-person beta and production HOLD**

## Source, scope and dependency

- Clean R61 starting commit: `7ea59d8c4d07f83a6e52ee586b42e74c386c9368`.
- Isolated worktree: `/Volumes/T7 Shield/ws-beta-r62-held-pg16-convergence-20261017`.
- Branch: `fix/ws-beta-r62-held-pg16-convergence-20261017`.
- Existing R61 server-only `lib/writersStudio/recovery/heldNextAuthorAdmissionR61.ts` remains unchanged and **unmounted**.
- Existing R56 production guard and optional R57 private-review branch remain unchanged.
- Only accepted R56 physical fixture driver gains an additional **explicitly opt-in** R62 test branch. New `scripts/ops/wsBetaR62HeldAuthorPG16.ts` refuses execution without all three exact fictional flags and `NODE_ENV=test`. A separate strict config and three source-law tests cover this integration.

## Purpose

R61's initial nine Jest cases replaced the R56 verifier with a mock. R62 proves the same R61 NextRequest-shaped, body-stream-limited POST behavior using **actual R56 session, tester status, consent, Source, protected Draft head, and specific declared Living Work SQL**, in the same disposable PostgreSQL16 instance. This is the first physically joined POST-shaped admission test; it is **not** a mounted Next.js network POST, signed author Apply or production key issuer.

## Explicit physical fixture contract

A disposable Docker `postgres:16.13` instance uses an anonymous tmpfs data volume, localhost-published database port, no host binds, fake sessions, fake consent/Works, R32 Source and R35 Draft metadata. The test never loads member data from production, operational KMS, model, provider, or cloud database. Its receipt is appended under `/Volumes/T7 Shield/ws-beta-r62-held-author-pg16-evidence-20261017` (0600 file permissions). The accepted R56 default receipt root is preserved.

Under explicit R62 opt-in the test:
1. Uses the actual `auth_sessions` resolver and immutable latest beta-consent events, not Jest mocks.
2. Checks the exact selected manuscript plus each explicitly declared Living Work without guessing.
3. Rejects foreign/undeclared Works; absent R32 Source; absent R35 Draft; expired/revoked sessions; Apply/Undo requests; browser-supplied replacement prose; forged identity; bad origin and URL query token.
4. Confirms a consent withdrawal blocks the previously valid author POST; a new acceptance permits only a fresh review.
5. Confirms a revoked session and a physically deleted protected Source table fail closed without plaintext fallback.
6. For every success/denial, requires HTTP 423/no-store with no account/member/Work IDs, token, notice or writing content in the response, plus `canSave=false`, `canApply=false`, `canUndo=false`, `writerAuthorized=false`, `releaseApproved=false`.
7. Verifies encrypted Draft version count remains zero, then closes both PostgreSQL connection pools and removes only its disposable container and ephemeral vault.

## Observed qualification on precommit source

- R62 opt-in PostgreSQL16: **63/63 checks PASS**, fixture and owned Docker/vault cleaned, 0 real-member reads and 0 external provider calls. The intentional missing-SQL-schema refusal is logged by the existing readiness verifier. The receipt reports source HEAD at the **R61 parent** because these checks ran before the R62 test additions were committed. It is NOT exact final-source acceptance.
- Original R56 driver without R62 opt-in: **32/32 checks PASS**, original status/receipt path and cleanup preserved.
- Strict scoped R62 TypeScript: PASS.
- R56/R61/R62 source tests: **28/28** PASS.
- Selected combined Writer's Studio regression: **98/98 suites, 1037/1037 tests PASS**.
- Whole-app shipping TypeScript and exact final-commit acceptance must be checked separately.

## Non-negotiable release stop and next distinction

R62 still does NOT mount R61 under `app/api`, return private proposal wording to a real browser, sign an independent Work lease, call R46/R39 Apply or authorize R47 Undo. The physical fixture establishes **SQL-backed, held-only admission**, not browser-to-encrypted-write qualification. Real R56/R57/PC3 authority boundaries remain compiled OFF.

An R63 can join this server admission with the already accepted R57 **encrypted private proposal read** inside one disposable SQL/vault and then require fresh consent and Work checks, but must not turn a read-only witness into an Apply grant. A later operational independent Work-key issuer, complete author-action commit fence, safe legacy migration, full clean ship build, offsite restore, genuine Mac/physical iPhone Safari, separate security review, founder exact-image GO and initial two-writer canary remain mandatory before five-tester beta.

**Disposition: R62 local fictional acceptance candidate, five-member beta HOLD. No GitHub push, PR, merge, production change or activation.**
