# Integration with canonical — qualification of the merged revision (2026-11-09)

Lane: Writer's Studio (#1800). Merge commit **`13bd1263a`** = this branch + canonical `clean-main-no-secrets` @ `84e12cf00` (0 behind canonical after the merge).
Evidence class: local, disposable PostgreSQL 16, fictional data. ⛔ Not production, not real MAIA, not Class A acceptance. No merge to canonical, migration on a real database, or deploy is authorized.

## Merge
No textual conflicts. Four files changed on both sides (Work-removal copy, its word-for-word test, the drift guard, the mutation runner); canonical's new sentence and this lane's "its plans" combine; 43/43.

## TypeScript gate (`npm run typecheck`, the enforced no-regression gate)
- With the main checkout's **borrowed `node_modules`**: FAIL on 3 files (`lib/stripe/config.ts`, `lib/theme/practitionerTheme.ts`, `lib/manuscript/source/sourceKeyAuthority.ts`). **Canonical fails identically** with the same packages. Cause: those packages are stale vs `package-lock.json` (zod 3.25.76 installed vs 4.6.7 locked; stripe 20.2.0 vs 20.4.1; `@aws-sdk/client-kms` missing). Environment, not code.
- With a clean **`npm ci` from the lockfile** in this worktree: **✅ No TypeScript regressions** at `13bd1263a`.
- Note for reviewers: a full `tsc` inventory (~220–240 errors) is pre-existing debt recorded in `typecheck-baseline.json`; it is not the gate.

## Migrations at the merged revision
Fresh database → `scripts/bootstrap-database.sh` (production-derived baseline, 504 ledger rows) → production runner `scripts/run-sql-migrations.sh` (path-only local copy): **90 applied, 0 errors**; second run no-op; the four candidates in the ledger. Canonical added no migrations since the branch base.

## Tests at the merged revision
- This lane's database tests on that fresh database: plan 13/13 · plan-links 4/4 · plan-coverage 1/1 · kind/offer 4/4 · reading-carry 10/10 · route-walk 9/9 · scope 8/8.
- Wider regression (`app/writers-studio`, `lib/writersStudio`, all of `lib/manuscript`, `lib/disclosure`, the WS constitutional suites incl. delete): 357 suites pass; **15 fail, all inherited**:
  - 7 Vitest suites collected by Jest (pass under Vitest: 7 files, 31 tests);
  - `askSourceCloseout`, `manuscriptImportWork` (see the failures disposition);
  - 6 more now in scope — `developmentalSemanticContract` (4), `providerSeamMigration` (1), `evidenceCannotAct` (1), `reader05` (3), `readerCannotBypass` (1), `workingDraftBody` (does not run): **identical failure counts on pure canonical `84e12cf00`** with the same clean packages; this branch changes nothing in those directories. Owned by the developmental-reader / render lanes.
- Freeze guard intact; `check:no-supabase` clean.

## What this does and does not establish
Establishes: the merged revision type-checks without regression, migrates cleanly from the production-derived baseline, and passes this lane's tests; every remaining failure is inherited from canonical with identical counts.
Does not establish: production schema (current) · real-MAIA behaviour · sensitive-case handling · Class A/R20 acceptance · the founder walk.
