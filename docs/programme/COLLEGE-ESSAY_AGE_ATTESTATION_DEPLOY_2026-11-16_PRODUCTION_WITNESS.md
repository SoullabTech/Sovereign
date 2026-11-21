# College Essay age attestation deploy · Production witness (2026-11-16)

**Status:** DEPLOYED · PRODUCTION-WITNESSED (server side) · ⛔ no member or device walk yet
**Deployed:** `5f3733cb8065d82f74a4a65db181dc314ebcc233` (main after #2312), replacing `4134cf2b2`
**Founder authorization:** "Deploy 5f3733cb8" (Kelly, 2026-11-16, in session).
**Carries:** #2309 (College Essay age attestation + migration), #2311 (coverage line: "No saved reading of this draft yet."),
#2312 (the review plan). #2294 (MAIA's reading invitation) was already live in `4134cf2b2`.
**Does not carry:** #2310 (College Essay stages, second migration `20261116000002_…`), merged to main after the target was
bound. It needs its own bound review.

## 0. Why the target is `5f3733cb8`

`pre-deploy-gate.sh prepare-maia f1bc49300` refused (pending migration; quick path may not swap first).
`deploy-production.sh deploy 3c59f1bf7` built and refused at Review Custody (no bound review), before any mutation;
production was verified unchanged afterwards (running `4134cf2b2`, table absent, rollback tags intact). The gate reads the
plan from the deploy target, so the plan was merged as #2312 and its merge `5f3733cb8` was bound and deployed.
`git diff 3c59f1bf7 5f3733cb8` is that one Markdown file.

## 1. Review custody

- Plan: `docs/programme/COLLEGE-ESSAY_AGE_ATTESTATION_MIGRATION_REVIEW_PLAN_2026-11-16.md` @ sha256 `e5c948eb…4517`.
- Bundle `~/review-custody-5f3733c` (Mac Studio), `scripts/migration-compatibility-review-bundle.sh 4134cf2b2 5f3733cb8`.
  Old reader re-witnessed live (`printenv GIT_COMMIT` = `4134cf2b2`) before bundling.
- Bound at `5f3733cb8`, change manifest 0 paths.
- Independent reviewer: separate `claude -p` process, `--tools Read,Grep,Glob`, `--strict-mcp-config`, model
  `claude-fable-5-2`, session `484b84b7-def8-45a0-b3dd-92f0224ee925`, cwd the bundle root, stream captured as the trace.
  The CLI printed `unrecognized_model` for that id on stderr, but the trace's `system/init` records `claude-fable-5-2`.
- Verdict **APPROVED**; compatibility **COMPATIBLE**; prefixes **ALL_PREFIXES_COMPATIBLE** (one); findings high 0 ·
  medium 0 · low 8; 11 limitations. First review, no REVISE.
- Admitted 2026-11-16T15:45:20Z (`--repo-root` = bundle root): coverage witnessed, 17 attested files each carry a read
  event. Review sha256 `bf79e24a8c320f88…`. `check` applied; the migration gate was run locally against the exact target
  and applied before the deploy.
- Evidence: `docs/programme/evidence/COLLEGE-ESSAY-AGE-ATTESTATION-20261116/` (record, review, trace, prompt, schema,
  session id); minisforum `~/review-custody-5f3733c/` (same, plus the deploy log).

## 2. Deploy

On minisforum: `scripts/deploy-production.sh deploy 5f3733cb8065d82f…` with `REVIEW_CUSTODY_RECORD/REVIEW/TRACE` set;
log `~/review-custody-5f3733c/deploy-20261116T154811Z.log`, captured from its first line. Exit 0.

Witnessed in the log, in order: immutable snapshot of `5f3733cb8`; ancestry from running `4134cf2b2`; built-image
provenance `GIT_COMMIT=5f3733cb8`; "MIGRATION REVIEW + COMPATIBILITY + PREFIX GATE APPLIES"; old reader re-witnessed
immediately before migration; "Applied 1 new migrations"; "Migrations applied before candidate swap"; running provenance
verified three ways; smoke tests (health, version, ready, main page, build locks, constitutional verification) passed.

## 3. Production state after the deploy (read 2026-11-16 ~16:00Z)

- `maia-sovereign`: `GIT_COMMIT=5f3733cb8`, `DEPLOY_LANE=deploy-lane`, created 15:55:57Z, healthy.
- Rollback tags: `:current` = `5f3733cb8`, `:previous` = `4134cf2b2`.
- `member_age_attestations` exists with 0 rows; triggers `member_age_attestations_guard` and
  `member_age_attestations_no_truncate`; ledger records `20261116000001_member_age_attestations.sql` only.
- Co-Lab release gate in the container: 32 passed · 0 failed · 0 warned.
- `https://soullab.life/api/health` fetched from inside `maia-sovereign` through public DNS and Caddy: 200,
  `version 5f3733cb8`, uptime 225 s. The same URL from the Mac Studio was refused (LAN hairpin); no cellular check was made.

## 4. The review's low findings (open; none blocks this deploy)

F1 destructive `.rollback` leaves the ledger row (a later redeploy would not recreate the table) · F2 a single attestation
cannot be erased on request without erasing the account (founder R20 ruling) · F3 guard functions resolve `members`
through `search_path` · F4 `TRUNCATE members CASCADE` in test/reconstruction harnesses now fails · F5 the attestation POST
has no rate limit or pilot gate · F6 Works already declared `college-essay` and the Work conversation routes were not shown
to be gated · F7 delete-account's `removed` list omits attestations · F8 runner commits and records in separate steps.
Full text in `REVIEW.json`.

## 5. Not established

- No member or test-account walk of the age door, the reading invitation, or the coverage line on production.
- No external (off-LAN) reachability check.
- The Class A product decision (minors, supervision, self-attestation) is the founder's ruling and was not reviewed.
