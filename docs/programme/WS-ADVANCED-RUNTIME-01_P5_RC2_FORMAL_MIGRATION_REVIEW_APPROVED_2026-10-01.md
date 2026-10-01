# WS-ADVANCED-RUNTIME-01 / P5 — RC2 Formal Migration Review: APPROVED · ⛔ SUPERSEDED

> ⛔ **SUPERSEDED BEFORE USE — DO NOT DEPLOY `b74751d7`.** On 2026-10-01 at ~14:35Z the founder deployed **RC1 `03f0fd3ab`** through `deploy-production.sh deploy`, admitted by a separate APPROVED review (session branch `claude/wonderful-newton-ddw3gx`, review sha `6d1331f5…`, trace `fecc0b9f…`). The gate printed `MIGRATION REVIEW + COMPATIBILITY + PREFIX GATE APPLIES`, the three migrations ran before the swap (**RC1 bytes**), running provenance was `03f0fd3ab` three ways, and the smoke tests and constitutional verification passed.
>
> Production's ledger now records those three filenames with the **RC1** blobs (`39c5c91d…` · `a514c255…` · `be3d512e…`). The runner keys on filename, so the RC2 blobs below would never execute; committing them would only make the repository disagree with applied history. The RC2 migration edits are therefore **reverted** on this branch, and the runbook below is withdrawn.
>
> What survives as a carried finding is a new, separately reviewed **additive** migration for the F5 cascade-FK indexes. F2 (lock timeout) and F3 (migration 2 re-runnability) are moot for already-applied files. They remain a convention worth adopting for future migrations. This review record is kept as evidence; it authorizes nothing.
>
> ⚠️ Two reviews of the same RC1 relation disagreed: P3 (this lane, REVISE) and the admitted one (APPROVED). Both are lawful outcomes. The deploy used the admitted record by founder act. The disagreement is recorded, not resolved here.


**Date:** 2026-10-01
**Status:** ⭐ REVIEW ADMITTED **APPROVED** · `check` APPLIES · drift witness PASS · composed gate (simulated) APPLIES
⛔ **Not deployed · no migration applied · production untouched.** Applying the schema is a founder act.

**Target (immutable):** `b74751d7b834ae0733d952d7b4b341d4ab8ac046` on `claude/affectionate-carson-i6nqfu`
(lineage: RC1 `03f0fd3ab` + canonical `d8e0c6bc` + RC2 remediation). Deploy must name this SHA, **not** the branch tip; later evidence commits do not change it.
**Old reader:** `975a208b8c39f99e9b47208ce5139bbec94bd8ac`
**Plan:** `docs/programme/WS-ADVANCED-RUNTIME-01_P4_RC2_EXACT_THREE_MIGRATION_REVIEW_PLAN_2026-10-01.md` (sha256 `b2c455ff…ec50`)
**Evidence:** `docs/programme/evidence/WS-ADVANCED-RUNTIME-01-P5/`

| File | SHA-256 |
|---|---|
| review.json | `ee29705d0c454e282343e8d9837de8fb1828c0a29367edba28a8c938996b974e` |
| trace.ndjson | `f14ee330351c6203dd64813f574dd9516cdd146e33e897c075fefbdf5360e520` |
| record.json (admitted) | `921ab7ce0f4494d6cddebfff9722217621feb000d778132507ce5e357ccc476d` |

## What changed from RC1 (P3 REVISE → RC2)

| Migration | RC2 change | New blob SHA-256 |
|---|---|---|
| 1 `20260925000005_writer_editorial_relationship_custody.sql` | `SET LOCAL lock_timeout = '5s'` | `e77e45d1…0c47` |
| 2 `20260925000006_writer_editorial_scope_identity_successor.sql` | same timeout; the succession becomes one `DO` block that is a no-op once applied and otherwise keeps the pre-successor refusal | `c10bea44…6607` |
| 3 `20260926000004_writer_studio_return_state.sql` | same timeout; adds indexes on the two cascade FK columns | `a3ea657a…b6df` |

**Production shape evidence** (founder-run read-only query): `member_manuscripts` 21 rows / 48 kB · `living_works` 8 / 48 kB · `proposal_chains` 9 / 96 kB.

**Disposable PG16 witness of the RC2 bytes:**
- fresh apply 1→2→3: PASS
- re-run of each file after commit: PASS
- refusal with a pre-successor episode: the whole file rolls back to prefix 1
- migration 1 behind a held reader transaction: aborts at 5 s, nothing changed

## Proof at the target

- `npm run typecheck` on the merged lineage: **222 errors vs baseline 239 · no regressions**. A first run reported 46 `@prisma/client` diagnostics; they came from installing with `--ignore-scripts`, and `prisma generate` cleared them, so they were not code.
- `check:no-supabase`: clean.
- Not re-run here on the merged lineage: the focused Studio test suite and the production `next build`. RC1 proved both; the canonical merge brought no conflicts and no migration. The deploy itself builds the image and refuses before the swap if the build fails.

## Custody chain

```text
reviewer  separate `claude -p` · session 26 Read-witnessed tools only (Glob·Grep·Read·StructuredOutput) · no MCP · cwd = bundle
witness   COVERAGE WITNESSED — 35 attested files carry a Read event
admit     ADMITTED — APPROVED · high 0 · medium 0 · low 3 · review sha ee29705d…
check     clean → APPLIES · one-byte drift in migration 3 → REFUSED (TREE MOVED) · restored → APPLIES
gate      review-custody-migration-gate.ts (simulated, expected pending set, this container):
          APPLIES · 3/3 pending witnessed · 3/3 prefixes attested compatible
```

The real gate re-runs on minisforum against the **live** reader stamp and the **live** ledger. The simulation does not substitute for that run.

**Low findings, carried and not blocking:**
- **L1:** the target hard-requires migration 2. Use the full deploy path only (runbook rule below).
- **L2:** `manuscript_draft_sections` was not in the size evidence. Optionally record its count during the deploy.
- **L3:** old-reader erasure cascades into A2 and return rows. This is by design.

## Deployment runbook

⛔ Withdrawn (see the supersession note at the top).
