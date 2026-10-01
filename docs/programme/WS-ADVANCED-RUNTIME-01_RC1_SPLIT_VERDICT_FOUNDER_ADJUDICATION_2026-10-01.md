# WS-ADVANCED-RUNTIME-01 / RC1 — Split-Verdict Founder Adjudication

**Date:** 2026-10-01
**Status:** RECORDED ON FOUNDER INSTRUCTION · ⚠️ **RETROSPECTIVE** · per-finding dispositions F2–F5 drafted from the record, **⛔ owed founder ratification**

**Relation:** old reader `975a208b8c39f99e9b47208ce5139bbec94bd8ac` → target `03f0fd3abce16fcc1132481836b2e6ff8d364cd7`
**Pending migrations:** `…000005` (`39c5c91d…`) · `…000006` (`a514c255…`) · `…000004` (`be3d512e…`)
**Plan bound by both reviews:** `WS-ADVANCED-RUNTIME-01_P2_…` sha256 `62b0de90…8a11`

## What happened

Two independent reviews of the **same relation under the same plan** reached different verdicts:

| | REVISE (this lane, P3) | APPROVED (admitted at deploy) |
|---|---|---|
| Session branch | `claude/affectionate-carson-i6nqfu` | `claude/wonderful-newton-ddw3gx` |
| Bound | 14:14:45Z | 14:18:11Z |
| Admitted | **14:18:48Z** (pushed 14:19:24Z) | 14:22:18Z (pushed 14:23:13Z) |
| Review SHA-256 | `da78e3f8…` | `6d1331f5…` |
| Trace | `402fe5ae-…` | `fecc0b9f-…` |
| Findings | medium F1, F2 · low F3, F4, F5 | low F1, F2, F3 |

The APPROVED review was bound **before** the REVISE was admitted, so the two ran concurrently. Nothing here records a deliberate search for an approval.

At the 14:35Z deploy, however, the REVISE had been on record for about 16 minutes. The composed gate admitted the APPROVED record without seeing it, because the gate evaluates only the record it is handed.

⚠️ The decision to deploy was **not** preceded by a recorded adjudication of the REVISE. This record is written afterwards. It does **not** backdate the decision, and it does not claim the REVISE was weighed before the deploy. It records how the founder now disposes of it.

## Adjudication

**Ruling (founder, 2026-10-01):** RC1 stands. The REVISE existed, and its findings are judged **resolved or non-blocking for this relation**, on the grounds below.

| P3 finding | Disposition | Grounds |
|---|---|---|
| **F1** (medium): Q10 lock risk unestablished, no production sizes | **RESOLVED** | Founder-run read-only query: `member_manuscripts` 21 rows / 48 kB · `living_works` 8 / 48 kB · `proposal_chains` 9 / 96 kB. At this scale the time each lock is held is negligible (founder). |
| **F2** (medium): no `lock_timeout`, so lock *acquisition* was unbounded | **NON-BLOCKING FOR RC1** · ⛔ ratification owed | The risk was real: acquisition, not duration (founder). It did not materialize, because all three migrations applied cleanly before the swap. Going forward it is addressed structurally by the migration lock-timeout lint (`npm run check:migration-lock-timeout`), not by retrofitting applied files. |
| **F3** (low): migration 2 cannot be re-run after commit | **MOOT** · ⛔ ratification owed | It was applied exactly once, successfully. A failed retry would have stopped before the swap with the old reader intact. |
| **F4** (low): the target hard-requires migration 2 | **SATISFIED IN FACT** · ⛔ ratification owed | The deploy used the full `deploy-production.sh deploy` path (migrations before swap), not `deploy-maia`. |
| **F5** (low): cascade FK columns on the return tables have no index | **DEFERRED** · ⛔ ratification owed | Negligible at current size. To be a separate additive, reviewed migration. |

## What this does not do

- It does not convert the REVISE into an approval. Both review records stay as they are.
- It does not establish that RC1's migrations are correct. Review custody never does.
- It does not close the structural gap. That is the candidate Verdict Plurality law: `docs/programme/REVIEW-CUSTODY_VERDICT_PLURALITY_CANDIDATE_LAW_2026-10-01.md`.
