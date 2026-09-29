# WRITERS-STUDIO-SMALL-BETA-01 / B4 — PILOT DEPLOYMENT READINESS

**Date:** 2026-09-29
**Status:** DEPLOYMENT AUTHORIZED BY FOUNDER · PRODUCTION UNTOUCHED · REVIEW-CUSTODY GATE STILL REQUIRED
**Exact deploy target:** supplied and frozen externally by the admitted Review-Custody record; no self-referential commit SHA is embedded in this document
**Current canonical incorporated through:** `2f5c130373b002de6d2d183dd29f6bcb4ac285db`
**Exact live/rollback reader witnessed:** `7a096281acc22bc91bfc66799ce9acb841921771`

## 1. Standing

P4R1 founder walk has passed experientially. The small-beta substrate B1–B3 is assembled:

- orientation recovery (`Where are we?`) prepares a member-controlled reorientation turn and never auto-sends;
- writer correction succeeds by append-only succession tied to an exact MAIA turn;
- future Work conversation receives the current writer correction while historical MAIA wording remains intact;
- beta notes are explicit, writer-authored evidence rather than passive telemetry;
- beta feedback now requires **both** `beta=1` presentation intent and server-proven pilot membership;
- pilot membership is an active, member-linked `ops_contacts.contact_type='beta_tester'` record; founder/CTO retain witness access.

No migration, image swap, traffic change, or production mutation occurred in B4 preparation.

## 2. Canonical reconciliation

The P4R1 candidate was reconciled onto current canonical in an isolated worktree. Canonical had advanced substantially from the candidate base; 15 overlapping Writer's Studio files required semantic resolution.

Canonical's newer laws were preserved where they superseded the candidate, including the rule that Themes belongs in Develop rather than Review and the newer theme-custody migration repairs. Candidate capabilities absent from canonical were retained, including Review continuation, developmental evidence enforcement, Ideas→Work bridge, P4R1 developmental flow, orientation recovery, correction succession, and beta evidence.

Reconciled Writer's Studio witness:

- P4R1 TypeScript: PASS
- Writer's Studio: **124 / 124 suites PASS**
- Writer's Studio: **1,332 / 1,332 tests PASS**
- exact target production build with target-owned Next 16.3.6 dependencies: **PASS, exit 0**
- production dependency audit (`npm audit --omit=dev --audit-level=moderate`): **PASS · 0 vulnerabilities**

## 3. Exact production-pending migration set

A read-only comparison of the immutable target migration tree against the live `schema_migrations` ledger, under one collation (`LC_ALL=C`), yields exactly these five pending paths in this order:

1. `database/migrations/20260929000001_writer_understanding.sql`
   SHA-256 `b7c345dde35636dbffd3755e1c2f5e5e93415c4faba7796245a84e923f28e016`
2. `database/migrations/20260929000002_writer_declared_manuscript_state.sql`
   SHA-256 `e672321b7884e44c68271687999ccc3e96742667113a8a910682f4b263055638`
3. `database/migrations/20260929000003_ask_threads_living_work_subject.sql`
   SHA-256 `8fd3dc1ff47e6b3d6f4265c19be86cd9ee56e9d3cd827771e05b51f190a4020c`
4. `database/migrations/20260929000004_writer_studio_corrections.sql`
   SHA-256 `85e50576175557635791436412b92ea596ef972077bb730e98b166eb8627ba76`
5. `database/migrations/20260929000005_writer_studio_beta_feedback.sql`
   SHA-256 `b9125667e8cdc64197610a776ddfe7e87c63bd0dd8e37a3aec4bdf4693cdf557`

Two January files initially appeared as false pending entries because two local sort operations used different collations. Direct production ledger inspection proved both were already applied on 2026-01-23 and their schema objects are present. Re-running set comparison under `LC_ALL=C` produces the exact five-file set above.

## 4. Live preconditions witnessed read-only

At B4 review time:

- `living_works`: 8 rows
- `ask_threads`: 10 rows
- `ask_turns`: 22 rows
- `member_manuscripts`: 17 rows
- `ask_threads` rows with NULL `manuscript_id`: **0**
- `living_work_writer_understanding`: absent
- `living_works.manuscript_state`: absent
- `ask_threads.living_work_id`: absent
- `writer_studio_corrections`: absent
- `writer_studio_beta_feedback`: absent

There is therefore no conflicting pre-existing shape for the five additions.

## 5. Old-reader / migration compatibility

Exact compatibility bundle:

- old reader: `7a096281acc22bc91bfc66799ce9acb841921771`
- target: exact canonical SHA supplied by the Review-Custody harness and reproduced by the admitted review
- materialized review bundle: `/private/tmp/ws-b4-final-compat-bundle` during B4 witness

Old-reader evidence bound by exact bytes:

- `app/api/sovereign/living-works/route.ts` — `f54aafaa1c25e408cb13cb99799aeceb96be0c38da893a92d8838c64de547554`
- `lib/manuscript/ask/threadStore.ts` — `f372276ff5ec0164ff5d4b668e5ef65fa03da26b6a7bb99a875aebd6dc5b79d5`
- `lib/manuscript/editorialRuntime/thread.ts` — `1d39c09e192d4c1c1976790d7b8170e338e7bf9703f64dd22a9f2db053514352`

Compatibility finding:

- migration 1 creates an independent writer-understanding table; old reader does not read it;
- migration 2 adds a nullable `living_works.manuscript_state` and a NULL-permitting check; old reader names its existing columns explicitly and its `(member_id,title)` inserts remain valid;
- migration 3 widens `ask_threads` to permit exactly one of manuscript/Living-Work containers. Every live old row and every old-reader Ask/editorial insert supplies non-null `manuscript_id`, with `living_work_id` NULL. The old reader has no app/lib `UPDATE ask_threads` path;
- migration 4 creates an independent append-only writer-correction table; old reader does not read it;
- migration 5 creates an independent explicit beta-feedback table; old reader does not read it.

Strict relational evaluator result for the exact target:

- final schema: `APPLIES` — 5 pending migration files, 3 exact old-reader evidence files
- failure prefixes: `APPLIES` — all 5 committed prefixes explicitly compatible

Application rollback therefore returns the reader to `7a096281a…` **against the expanded schema**. No destructive DB down-migration is required or authorized.

Limitations preserved in the compatibility claim:

- compatibility does not prove zero DDL lock latency;
- `living_works` and `ask_threads` are currently small, but schema-lock behavior still belongs to the migration act;
- semantic compatibility does not replace the independent Review-Custody evidence triplet required by the production deploy script immediately before mutation.

## 6. Deployment-safety instrument standing

All current deployment-safety instruments passed on the reconciled tree:

- migration compatibility matrix: **10/10 defeat candidates killed; STRICT 10/10**
- migration prefix matrix: **5/5 defeat candidates killed; STRICT 5/5**
- migrate-before-swap ordering: PASS
- pre-swap relation witness: **10 passed · 0 failed**
- prepared-reader custody split selftest: **19 passed · 0 failed**
- immutable deploy provenance: **28 passed · 0 failed**

The quick `prepare-maia` / `cutover-maia` lane is deliberately **ineligible** because five migrations are pending. This release is a backward-compatible expansion and must use the full governed deploy lane.

## 7. Exact production custody at readiness

Read-only witness on minisforum:

- live reader `GIT_COMMIT`: `7a096281a`
- live image: `sha256:156b3bd14ca8ff791742e5031bc9851c05a0f3377503e9808a98d36f2b9d05a8`
- `maia-sovereign:current`: same image
- `maia-sovereign:prod`: same image
- `maia-sovereign:7a096281a`: same image
- `DEPLOY_LANE=deploy-lane`
- production root filesystem free space: **136 GB** (60 GB deploy floor)

Thus the exact known-good rollback image is currently physically restorable.

## 8. Frozen commands

### Local/reconciliation build witness

```bash
npm ci
npm run build
```

This build witness was executed successfully on the application-byte-equivalent B4 code tree with Next 16.3.6. The production target itself is frozen externally by Review-Custody.

### Production operator command — the only authorized migration-bearing deploy act

`EXACT_TARGET_SHA` must be set from the exact canonical target bound by the admitted Review-Custody record. The operator must not type or substitute a different SHA. The deploy script's custody gate must recompute and verify the same target before any migration or traffic mutation.

```bash
./scripts/deploy-production.sh deploy "$EXACT_TARGET_SHA"
```

Do **not** substitute raw `docker compose`, `prepare-maia`, `cutover-maia`, or an independent migration-only run for this release.

Inside the governed deploy process, and only after its exact custody gate applies, the frozen phases are:

**Build**

```bash
deploy_ctx_compose build \
  --build-arg GIT_COMMIT="$GIT_COMMIT" \
  --build-arg APP_VERSION="$APP_VERSION" \
  --build-arg BUILD_DATE="$BUILD_DATE"
```

**Migration — after exact pending/old-reader re-witness, before traffic swap**

```bash
deploy_ctx_compose --profile migrate run --rm migrate
```

**Traffic swap — only after all five migrations succeed**

```bash
deploy_ctx_compose up -d
```

These internal commands are documented for custody, **not** authorized as standalone operator shortcuts. The operator uses the single full deploy command above.

### Reader rollback

```bash
./scripts/deploy-production.sh rollback
```

Rollback swaps `:previous` onto both `:current` and `:prod` and recreates only the MAIA reader with `--force-recreate --no-deps`. The database remains on the backward-compatible expanded schema.

## 9. Pilot cohort boundary

The beta feedback membrane requires server-side membership in the active pilot. Eligibility is:

- an `ops_contacts` row with `contact_type='beta_tester'`;
- `pipeline_stage='active'`;
- a non-null `member_id` matching the authenticated member;
- or founder/CTO witness authority.

A URL query flag cannot grant eligibility.

Current founder-ops census shows a substantial active linked pool. **Andrea Fagan is active + linked and is immediately eligible for nomination. Jondi is active but presently unlinked and must be linked to her platform member record before activation.**

The first cohort is deliberately limited to **5–10 people**. Final names are a founder activation decision, not inferred by software. Each activated person must affirm that they are bringing a real Work and consent to the explicit beta-note membrane. The cohort should include, where naturally available, writers at different Work maturities (existing manuscript, partial manuscript, pre-manuscript) without collecting unnecessary demographic or psychological profile data.

## 10. Evidence review cadence

For the first pilot week:

- a hard-gate signal (authorship, orientation collapse, correction failure, provenance, continuity, consent) is reviewed as soon as it is received and blocks cohort expansion until adjudicated;
- explicit beta notes and correction events are triaged daily while the cohort is ≤10;
- a twice-weekly synthesis clusters findings as isolated preference, recurring friction, developmental obstruction, or constitutional violation;
- no product change is authorized solely by an isolated preference;
- first formal pilot synthesis occurs at the earlier of **10 substantive writer sessions or 14 calendar days**.

No engagement, dwell-time, inferred emotion, clickstream, suggestion-acceptance rate, or manuscript-body analytics are introduced for this cadence.

## 11. Rapid support path

In-product recovery remains available through:

- `Where are we?` for orientation recovery;
- `Correct MAIA` for relational/interpretive correction;
- the explicit Beta note membrane for experiential evidence.

Before a tester is activated, their founder-ops contact record must also contain a verified direct reply channel supplied by that tester. The invitation should tell them to use that channel if they cannot sign in, the Studio will not open, or they cannot reach the in-product feedback surface. During the ≤10-person pilot, support triage is same-day; any hard-gate report pauses expansion rather than asking the writer to work around it.

This requirement defines the support contract; it does not invent or expose a new communication channel.

## 12. Remaining production authorization boundary

B4 does **not** authorize migration or deployment.

Immediately before any production schema mutation, the full deploy script still requires the independently admitted Review-Custody evidence triplet:

- `REVIEW_CUSTODY_RECORD`
- `REVIEW_CUSTODY_REVIEW`
- `REVIEW_CUSTODY_TRACE`

That independent admission must bind the exact old reader, exact target, exact five ordered migration bytes, old-reader evidence, final compatibility and every failure prefix. B4's semantic review and test evidence prepare that act; they do not impersonate an independent reviewer.

The next human boundary remains:

> **FOUNDER AUTHORIZATION — WRITER'S STUDIO SMALL BETA DEPLOYMENT**

At that authorization, founder also names the final 5–10-person activation roster. Until then: **NO MIGRATION · NO PRODUCTION SWAP · NO PILOT ACTIVATION.**
