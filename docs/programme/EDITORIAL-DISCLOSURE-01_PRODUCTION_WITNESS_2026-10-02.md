# EDITORIAL-DISCLOSURE-01 — Production Witness and Migration Closure

**Date:** 2026-10-02
**Status:** PRODUCTION LIVE · REVIEWED MIGRATION APPLIED · STRUCTURAL WITNESS PASS
**Deployed target:** `c9e4f7f7eccb4049bf036d189cac7feb007ef3cc`
**Pre-cutover old reader:** `d4655e6477fa40b8f94c5f8f91be47198288d2af`
**Canonical record base:** `0584370130a633424af7da0fc4a52b055ab0fc63`

## Scope of this witness

This record closes the bounded production migration/deployment act for the editorial
disclosure boundary added by #1732 and repaired after independent review by #1751.

It establishes the exact migration, review-custody, deployment ordering, running
provenance, schema after-state, receipt preservation, health and structural production
observation recorded below. It does **not** claim editorial quality, manuscript quality,
or that a real member Work was opened merely to manufacture a deployment witness.

## Exact production migration

`database/migrations/20261002000001_disclosure_boundary_editorial_turn.sql`

SHA-256:
`08fc3447249e07249d48731bb2a2a8b8612965af82f58e3580fb52625767c0a9`

The migration expands `context_disclosure_receipts_boundary_check` from the prior
three constituted boundary values to those same three plus:

`writers_studio.editorial_turn->maia_cognition`

It performs no row rewrite, backfill or deletion.

## Fresh independent review after #1751

The first independent migration review returned **REVISE** with two material findings:
EDM-01 (last-moment deployment relation re-witness) and EDM-02 (discardable editorial
crossing-confirmation result). PR #1751 repaired both and merged as
`c9e4f7f7eccb4049bf036d189cac7feb007ef3cc`.

Because target movement invalidated the prior review, a fresh restricted separate-process
review was run against exactly that target and old reader `d4655e647…`.

- Plan SHA-256: `0b45f8945a2e350a98b1867be3336c097d786d3d818d2a695e370c9b2e10487b`
- Custody-record SHA-256: `380af5908dc5ca4e46ca8675ffc89541f08fcdf894b2a15edb403cb2926599d1`
- Review SHA-256: `014ef0a673591716824cec0f439ce9390448bbd473bd17a20e2a4f01fbc70972`
- Reviewer-trace SHA-256: `ed3c587a28a9a40decfa3585a67b0ef0921cf33b538aeea4e0e75f52d965a4c6`
- Trace/session: `5d9ff66f-c892-40a3-adf7-0600b18adf5d`
- Coverage: 16 physically witnessed Read paths
- Findings: high 0 · medium 0 · low 1
- Verdict: **APPROVED**

The low finding, EDM-OBS-01, notes that `disclosure_unavailable` lacks a distinct
content-free server-side observation signal. The reviewer explicitly judged this
non-blocking for migration correctness because migrate-before-swap prevents the target
route from running against the old three-value CHECK. It remains an observability follow-up.

Mechanical custody admission then reported:

`APPROVAL APPLIES`

The composed deployment gate reported:

`MIGRATION REVIEW + COMPATIBILITY + PREFIX GATE APPLIES`

for the exact target, exact old reader, exact one pending migration, admitted review bytes
and one compatible committed prefix.

## Governed deployment sequence

The successful production act used:

`scripts/deploy-production.sh deploy c9e4f7f7eccb4049bf036d189cac7feb007ef3cc`

with the exact admitted custody record, review and reviewer trace supplied to the deploy lane.

The script witnessed, in order:

1. immutable target materialization at `c9e4f7f7e`;
2. target ancestry from live reader `d4655e647`;
3. production dependency audit: **0 vulnerabilities**;
4. disk preflight: **274 GB free**;
5. image build from the immutable target snapshot;

6. built-image provenance: `GIT_COMMIT=c9e4f7f7e` equals asserted target;
7. review-custody + migration compatibility + prefix gate: **APPLIES**;
8. old reader re-witnessed immediately before mutation as `d4655e647…`;
9. exactly one production-pending migration rederived;
10. editorial disclosure migration applied **before candidate swap**;
11. rollback roles advanced only after migration success;
12. candidate containers recreated;
13. running provenance verified: printenv == Config.Env == asserted `c9e4f7f7e`.

The deployment process exited **0**.

## Migration execution observation

The runner emitted PostgreSQL warnings that the file's own `BEGIN/COMMIT` nested inside
the runner transaction ("already a transaction in progress" / "no transaction in progress").
The migration nevertheless completed, the ledger row was inserted, and deployment
continued only after the migration runner reported success.

This is an execution-shape observation, not a hidden claim that nested transaction warnings
are desirable. No repair is made in this custody record.

## Structural production after-state

Independent read-only witness after deployment established:

- live `maia-sovereign` commit: `c9e4f7f7e`;
- container state: **running · healthy**;
- `/api/version`: version 1.2.0, commit `c9e4f7f7`;
- `/api/health`: health `ok`, database `ok`, `safeMode=false`;

- production ledger contains
  `20261002000001_disclosure_boundary_editorial_turn.sql`;
- production CHECK contains exactly the prior three constituted values plus
  `writers_studio.editorial_turn->maia_cognition`;
- deploy kernel lock is free after completion.

### Receipt preservation

The review plan froze the pre-deploy relation at:

- **3 rows**
- **80 kB**
- **3/3** rows = `writers_studio.developmental_ask->maia_cognition`

The post-deploy witness found exactly the same:

- **3 rows**
- **80 kB**
- **3/3** rows remain `writers_studio.developmental_ask->maia_cognition`

Therefore this bounded migration produced the intended vocabulary expansion with no
observed receipt rewrite, backfill or deletion.

## Post-deploy smoke

The deploy script reported:

- PASS `/api/health`
- PASS `/api/version`
- PASS `/api/ready`
- PASS main page
- PASS `/api/build/status` closed at 503
- PASS constitutional verification

One operational warning remains:

- `/api/build/alert` returns closed 503 because the deploy host has no
  `INTERNAL_ALERT_TOKEN`; deploy alerts are therefore currently undeliverable.

This warning was non-critical to the deploy script and did not alter the production act.
It should remain visible rather than being collapsed into "all green."

## What is established

**Established:**

- exact migration review and custody;
- old-reader compatibility and one-prefix compatibility;
- migrate-before-swap ordering;
- exact migration success;
- exact running target provenance;
- receipt preservation;
- four-value disclosure CHECK;
- production health and constitutional smoke.

**Not established by this record:**

- quality of any model-generated editorial response;
- quality of any edited manuscript;
- a real member's consent gesture or authored passage crossing in production;
- completeness of the independent reviewer;
- availability of deploy-alert delivery.

No member Work or manuscript prose was read or transmitted solely for this witness.

## Standing

**EDITORIAL-DISCLOSURE-01 production migration/deployment act: CLOSED for the bounded structural scope above.**

EDM-OBS-01 and deploy-alert delivery remain separate follow-up observations; neither is
silently repaired or declared resolved here.
