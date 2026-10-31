# HOUSE-PRO-STUDIO-01 — Production migration review plan (one migration)

**Status:** review plan only. This document authorizes nothing: no deploy, no schema change.
**Why it exists:** the deploy lane refuses a quick deploy when a migration is pending and requires a bound independent review (REVIEW-CUSTODY-01 Step 3 + DEPLOYMENT-SAFETY-03).

## Exact relation

- **Old reader (live production reader):** `a9a23e1347444f631111258e7d653674e6d21aa5` (short `a9a23e134`).
- **Target reader:** the commit whose tree contains this plan. Its full SHA is named in `MIGRATION_COMPATIBILITY_CONTEXT.json` and in your prompt; a plan cannot name its own commit.
- **Pending set (exactly one, production-pending):** `database/migrations/20261030000001_house_pro_studio_catalog.sql`.

## What the migration does

Inside one transaction with `SET LOCAL lock_timeout = '5s'`, on `house_member_preferences`: drops and re-adds the `center_ids` CHECK and the `shortcut_ids` cardinality and catalog CHECKs so the allowed place set grows from 18 to 19 places (adds `pro-studio`) and the shortcut cardinality bound grows from 18 to 19. It widens; it removes no place and tightens nothing.

## Production shape (founder-run, read-only, 2026-10-31)

`house_member_preferences`: 3 rows, 32 kB total relation size, 3 rows with `center_ids` set. Ledger column is `schema_migrations.filename`.

## Deployment ordering (to be verified from source, not assumed)

Full deploy: build and provenance verify, review gate, migrate, tag, swap, verify. A migration failure exits before the swap with the old reader still live.

## Independent review questions

1. Every row valid under the old CHECKs is valid under the new ones (the change only widens), so re-adding the constraints cannot fail on existing production data.
2. The old reader (read/write paths: preferences store, preferences parsing, the preferences API route, the House page) never writes `pro-studio` and is unaffected by the wider constraint while no row contains it.
3. ⚠️ **Reader rollback.** After the target reader is live, a member may save `pro-studio` into `center_ids` or `shortcut_ids`. If the reader is then rolled back to the old reader: what exactly does the old reader do when a stored row contains an id its catalog does not know? Read its parsing path and state precisely: does it throw, for whom, on which routes, and does the House page survive? Judge whether that is acceptable, a finding, or a blocker.
4. The documented rollback procedure below is sufficient, correct and safe (including its ordering around the reader swap, its pre-check of the rollback target, and its handling of emptied arrays), or you identify what is wrong with it.
5. The `DROP CONSTRAINT IF EXISTS` then `ADD CONSTRAINT` pattern is the same pattern the earlier House catalog migrations used, and re-running the file after commit is idempotent.
6. DDL lock and validation cost on this table, given the shape above and the 5 s lock_timeout, is acceptable or a finding.
7. The target reader's catalog, preferences parsing and entrance code is compatible with the final schema, and nothing in the target requires a schema other than this migration.
8. The deploy ordering in the scripts makes a failed migration abort before the swap.

A verdict of REVISE or BLOCKED is lawful and must never be converted into approval to deploy.

## Documented rollback procedure (judge it, do not trust it)

Revised twice after earlier independent reviews of this same migration returned REVISE on the rollback text only (the migration itself was judged compatible each time). Verify each step independently; do not assume it is correct.

**Operator-visible consequence, stated up front:** from the moment the reader is swapped back until step 4 commits, any member whose saved preferences contain \`pro-studio\` will see \`/house\` and \`/home\` fail on the server and \`GET /api/house/preferences\` return 400. Other members are unaffected. Steps 3 to 5 therefore run immediately after the swap, in the same operator session.

1. **Pre-check the rollback target** (informational; \`rollback\` takes the deploy lock itself and the post-swap identity check in step 3 is the authoritative one):
   \`docker image inspect maia-sovereign:previous --format '{{range .Config.Env}}{{println .}}{{end}}' | sed -n 's/^GIT_COMMIT=//p'\` must print \`a9a23e1347444f631111258e7d653674e6d21aa5\`. If it prints anything else, stop and get a new review. Record the image Id (\`docker image inspect maia-sovereign:previous --format '{{.Id}}'\`).
2. Run \`scripts/deploy-production.sh rollback\` (image swap only).
3. **Whatever the exit status of step 2**, run \`docker exec maia-sovereign printenv GIT_COMMIT\`. \`rollback\` retags and recreates the reader before it verifies, so a non-zero exit can still leave the old reader live. If it prints \`a9a23e1347444f631111258e7d653674e6d21aa5\`, continue to step 4 even if step 2 exited non-zero. If it prints anything else, stop: cleanup is not safe to run and the situation needs a human decision.
4. **Snapshot, then clean up.** First save the affected rows so the members' placement can be restored on a later roll-forward: \`SELECT member_id, center_ids, shortcut_ids, revision FROM house_member_preferences WHERE 'pro-studio' = ANY(shortcut_ids) OR 'pro-studio' = ANY(center_ids);\` written to a file. Then run:
   \`UPDATE house_member_preferences SET center_ids = NULLIF(array_remove(center_ids,'pro-studio'), '{}'::text[]), shortcut_ids = array_remove(shortcut_ids,'pro-studio'), revision = revision + 1, updated_at = NOW() WHERE 'pro-studio' = ANY(shortcut_ids) OR 'pro-studio' = ANY(center_ids);\`
   An emptied Center becomes NULL, which the old reader reads as "use the current House default". The old reader cannot write \`pro-studio\`, so this closes the window for good. The loss of those members' Pro Studio placement is accepted; the snapshot allows restoring it.
5. **Verify zero rows remain:** \`SELECT count(*) FROM house_member_preferences WHERE 'pro-studio' = ANY(shortcut_ids) OR 'pro-studio' = ANY(center_ids);\` must return 0.
6. The widened constraints stay in place: the old reader works against them unchanged. **There is no re-tightening step.** Narrowing them again would need its own reviewed migration and ledger handling and is out of scope.

## Minimum physical Reads

- this plan; `MIGRATION_COMPATIBILITY_CONTEXT.json`;
- the pending migration file;
- `database/migrations/20260925000001_house_member_preferences.sql`, `20260925000002_house_center_preferences.sql`, `20260925000003_house_shortcut_catalog.sql`, `20260927000001_house_dream_catalog.sql`;
- `scripts/deploy-production.sh`; `scripts/run-sql-migrations.sh`;
- target `lib/house/catalog.ts`, `lib/house/preferences.ts`, `lib/house/preferencesStore.ts`, `app/api/house/preferences/route.ts`, `app/house/page.tsx`, `lib/house/entrance.ts`;
- exact old-reader (under `old-reader/a9a23e1347444f631111258e7d653674e6d21aa5/`): `lib/house/catalog.ts`, `lib/house/preferences.ts`, `lib/house/preferencesStore.ts`, `app/api/house/preferences/route.ts`, `app/house/page.tsx`.

Search may scope discovery but does not witness coverage.

## Required review JSON

The ordinary Review-Custody fields (verdict, exact plan_sha256, trace_id equal to the session id, reviewer, summary, findings, coverage.files, explicit limitations) plus `migration_compatibility` (instrument `migration-compatibility/v1`, verdict COMPATIBLE or INCOMPATIBLE, exact old and target commits, the ordered pending path and its SHA-256, witnessed old-reader evidence with repo_path, sha256 and exact trace_path, rationale, limitations) and `failure_prefix_compatibility` (instrument `migration-prefix-compatibility/v1`, exactly one prefix entry for the one migration). The production gate recomputes hashes from git; self-reported hashes establish nothing.

## Closing condition

This plan authorizes nothing by itself.
