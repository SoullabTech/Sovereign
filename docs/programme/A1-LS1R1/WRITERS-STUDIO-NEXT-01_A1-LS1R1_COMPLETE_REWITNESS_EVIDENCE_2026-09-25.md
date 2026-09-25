# WRITERS-STUDIO-NEXT-01 / A1-LS1R1 — COMPLETE RE-WITNESS EVIDENCE

**Status:** complete re-witness returned for founder adjudication.
- Instrument repair only.
- Product candidate byte-frozen.
- No stop condition fired.
- No merge · no deploy · no production contact.

**Date:** 2026-09-25 · **Builder:** CC

| Identity | Value |
|---|---|
| Governing packet | `WRITERS-STUDIO-NEXT-01_A1-LS1R1_EXECUTION_PACKET_2026-09-25.md` · SHA-256 `38cf93d469e70952b0ac854686459debf70afde8696b0f8ee27992b08819e450` · 6,995 B · 114 lines (verified from upload; copy at `GOVERNING_PACKET_A1-LS1R1.md`) |
| Parent authority | A1-LS1 packet `290883cd…0334` + A1-LS1-R3 amendment `d722648e…5e29` |
| **Frozen product candidate** | **`c723dc8cc9599e68b61f95d6be012ed53988e571`** on `feature/ws-a1-ls1-authorship-safety-20260925` (parent `e8868884`) |
| Frozen LS0 instrument manifest | `c256514c0c149032104b351a11f139d9e74b962b41d45605a99408557d2ce026` — re-verified byte-for-byte before the run |
| **Frozen LS1R1 instrument manifest** | **SHA-256 `214d36a3ef466bdb3bfe046e78970494bb6e9b637a0d374f41794cf81b161fd5`** (frozen 2026-09-25T13:23:45Z; supersedes LS1 `86d57253…6c1`) |
| Extraction-audit instrument | `ls1r1-extraction-audit.sh` · SHA-256 `d2ed05faa02250d7a6791b8a7dc560f9a7056fbe3f892afa31f98fab33a19376` · 3,477 B, fixed 13:42:57Z before first use (separate from the acceptance set) |
| Authoritative run | 2026-09-25T13:24:07Z → 16:03:27Z · `ls0_matrix_exit=0` · `ls1_auth_exit=0` |
| Prior LS1 evidence | transport `ab0ca0b0`: historical, not overwritten, not merged |

---

## 1. Candidate immutability (packet §2)

**Before the run.**
- The remote branch head, the run checkout and the mutant checkout were all `c723dc8`.
- `dirty_paths=0` on each.
- Canonical `clean-main-no-secrets` was at `e8868884`, unmoved.

**During the run.** The frozen integrity instrument recorded `head=c723dc8…`, `dirty_paths=0` and `exercised_paths=30 mismatches=0`, for both checkouts, before and after (`evidence/ls1r1/*integrity*.txt`, `evidence/ls0-regression/integrity-*.txt`).

**After the run** (`evidence/closing-integrity.txt`, 16:06:08Z):
- The remote branch head is still `c723dc8`, and canonical is still `e8868884`.
- Both checkouts are at `c723dc8` (parent `e8868884`) with `dirty=0`.
- There are 0 product-path deltas since the candidate, and 0 schema/SQL paths between base and candidate.

**No product, test, schema or migration file was touched by LS1R1.**

## 2. What changed: the instrument layer only (packet §3)

Two files changed. The mutant runner and the 29-mutant set are byte-identical to LS1.

| File | LS1 → LS1R1 | Change |
|---|---|---|
| `ls1-e1-acceptance.mjs` | `f5cec3f9…` → `8312ccb2…` | **(a)** new A3 check `comparisonUnderLockRefusesChangedBody` (the controlled-lock witness) · **(b)** late-digest check: fixed 12 s hold → hold released by the witness |
| `ls1-e1-auth.sh` | `0d1fcef4…` → `7c958d4d…` | statement-log segment markers changed from `LS0_RUN_*` to `LS1R1_RUN_*` |
| `ls1-e1-mutants.mjs` | `965b15e2…` | identical |
| `ls1-mutants.json` | `75d66c8d…` | identical (29 mutants) |

`lockedComparisonSingleWinner` (3 rounds × 8 concurrent saves) is **unchanged** and kept as a stress check.

### 2a. The controlled-lock check (packet §3 steps 1–8)

Per round, 3 rounds:

1. The instrument's own connection runs `BEGIN; SELECT … FROM manuscript_working_drafts … FOR UPDATE`.
2. It starts a stale-version save through the real `PUT /sections/:id` route, carrying the digest of the section's current body.
3. It polls `pg_stat_activity` for a backend with `wait_event_type='Lock'`. If none is seen within 15 s, the result is **`INSTRUMENT_FAILURE`**, never a pass or a fail.
4. Holding the lock, it applies the competing writer's change to the same section (section text + derived content + version).
5. It commits, which releases the lock.
6. It awaits the save.
7. It requires 409.
8. It requires the persisted section body's SHA-256 to equal the competing body's, and the save's mark to be absent.

Evidence records statuses, booleans and 16-hex digest prefixes only.

### 2b. Why the late-digest check was changed (practice finding, disclosed)

- **What happened.** In practice, `M-A3-unrelated-blocked` once came back INCONCLUSIVE: the late-digest check threw its own precondition guard, because the two saves were not acknowledged inside a fixed 12-second window.
- **Not reproducible.** Two repeats killed the mutant normally.
- **Cause.** A clock budget in the instrument: the same class of flaw LS1R1 exists to remove, and a latent source of false stops across 35 A3 runs.
- **Repair.** The startup digests are now held **until the witness releases them**. The witness:
  - first asserts they are observed held;
  - then requires both saves acknowledged with 0 released;
  - then releases them and waits for all to resolve.

  The ordering is established by construction, not by elapsed time. The law is unchanged.

### 2c. Why the markers were changed (practice finding, disclosed)

- **What happened.** The LS1 driver used the same marker names as the frozen LS0 matrix (`LS0_RUN_BEGIN_<config>`) against an accumulating PostgreSQL log.
- **Measured before E1 reset.** The prior LS1 C0 extracted log contained **2** `BEGIN_C0-all-off` segments (13,151 lines), against 1 in LS0's own C0 log (7,939 lines).

**Historical limitation of the prior LS1 evidence (founder wording, adopted):**

> **Prior LS1 C0 extraction included duplicate segment labels and mixed-run statements. Reported counts are not exclusive to LS1 C0. Any retained absence-of-dependency conclusion is limited to the verified capture and extraction semantics. LS1R1 supplies separately delimited replacement evidence; it does not retroactively make LS1's counts run-specific.**

LS1R1 uses its own markers, and the E1 PostgreSQL log was restarted empty before the run. The audit in §6 proves each extraction.

## 3. Practice (non-evidence; readiness only)

On unchanged `c723dc8` content:
- **A3:** GREEN, including 3/3 controlled-lock rounds (409, waited, competing body preserved).
- **A3 mutants:** 13/13 killed after the §2b repair. `M-A3-outside-lock-check` was killed on `comparisonUnderLockRefusesChangedBody` in two separate practice runs.
- **Full A1–A5:** GREEN, with no regression from the shared page hook.

Practice establishes readiness. It substitutes for nothing below.

---

## 4. Frozen LS0 regression, re-run unchanged on `c723dc8`

`evidence/ls0-regression/matrix.log`; identical in all six configurations; `governing=[]`, `obsVariance=[]` everywhere.

| Scenario | Result (×6) | Required standing | |
|---|---|---|---|
| S1 | `CANONICAL_PREVENTS_IT` | historical defect absent | ✅ |
| S2 | `RED_REPRODUCED` | RED, unchanged | ✅ |
| S3 | `RED_REPRODUCED` | RED, unchanged | ✅ |
| S4 | `INSTRUMENT_FAILURE` | accepted two-cause classification (§7) | ✅ |
| S5 | `INSTRUMENT_FAILURE` | R3 amendment §4 | ✅ |
| S6 | `CANONICAL_PREVENTS_IT` | historical defect absent | ✅ |
| S7 | `CANONICAL_PREVENTS_IT` | historical defect absent | ✅ |
| S8 | `RED_REPRODUCED` | RED, unchanged | ✅ |
| S9 | `GREEN_CONTROL_ESTABLISHED` | GREEN | ✅ |

**S4 basis, every configuration:** `precondition not established` · `footerLabelsSeen: []` (cause 1, the anchor) · `editRefusedStatus: 200` (cause 2, a version-only bump is not a conflict under R3).

**S5 basis, every configuration:** `conflict precondition not established` · `sessionAFirstRefusal: 200`.

Both are recorded as `INSTRUMENT_FAILURE` under their accepted interpretations, **not relabelled GREEN**. A2 and A3 are the oracles.

## 5. Additive A1–A5, frozen LS1R1 instruments, all six configurations

| Law | C0 | C1 | C2 | C3 | C4 | C5 | Checks |
|---|---|---|---|---|---|---|---|
| A1 Arrival | GREEN | GREEN | GREEN | GREEN | GREEN | GREEN | 10 |
| A2 Save truth | GREEN | GREEN | GREEN | GREEN | GREEN | GREEN | 7 |
| A3 Conflict | GREEN | GREEN | GREEN | GREEN | GREEN | GREEN | **13** (+ `comparisonUnderLockRefusesChangedBody`) |
| A4 Departure | GREEN | GREEN | GREEN | GREEN | GREEN | GREEN | 13 |
| A5 Full Canvas | GREEN | GREEN | GREEN | GREEN | GREEN | GREEN | 9 |

C0 all off · C1 editorial · C2 focus · C3 discuss · C4 standing · C5 all four on.

**Controlled-lock check, candidate, all six configurations:** every round returned 409, was observed waiting on the lock, and preserved the competing body; the save's mark was never persisted (3/3 rounds × 6). `lockedComparisonSingleWinner` gave `[1,1,1]` in every configuration. The late-digest ordering saves were `[200,200,200]` in every configuration.

## 6. Mutants: 29/29 KILLED, 0 survivors, 0 inconclusive (C0, frozen suite)

| Mutant | Law | Verdict | Failed checks |
|---|---|---|---|
| `M-A1-stale-address-retained` | A1 | KILLED | absent/stale/invalidAddressRepairedToResolved |
| `M-A1-chapter10-restored` | A1 | KILLED | …ResolvesToFirstSection ×3, …AddressRepaired… ×3, noChapter10Heuristic |
| `M-A1-repair-coupled-to-scroll` | A1 | KILLED | zeroArrivalScroll, zeroArrivalScrollCalls |
| `M-A2-chapter-scoped-status` | A2 | KILLED | offChapterErrorVisible, offChapterConflictVisible |
| `M-A2-saved-never-shown` | A2 | KILLED | savedAfterInitialLoad, savedAfterAcknowledgement |
| `M-A2-false-saved-despite-failure` | A2 | KILLED | offChapterErrorVisible, offChapterConflictVisible |
| `M-A2-draft-counter-restored` | A2 | KILLED | draftCounterAbsent |
| `M-A4-silent-leave` | A4 | KILLED | dirtyDepartureGuarded, textSurvivesRefusedDeparture, eligibleDeparturePersistsAfterLeave, unconfirmed…Guarded ×2 |
| `M-A4-saved-on-keepalive-attempt` | A4 | KILLED | unconfirmedEligibleNeverClaimsSaved, unconfirmedEligibleDepartureGuarded |
| `M-A4-local-prose-backup` | A4 | KILLED | noLocalStorageProse |
| `M-A4-keepalive-dropped` | A4 | KILLED | eligibleDepartureUsesKeepalive, eligibleDeparturePersistsAfterLeave, unconfirmedEligibleNeverClaimsSaved |
| `M-A5-entry-loses-focus` | A5 | KILLED | pointerPathSameEditorNode |
| `M-A5-return-loses-focus` | A5 | KILLED | pointerPathSameEditorNode |
| `M-A5-escape-broken` | A5 | KILLED | escapeReturnsFromFullCanvas, escapeReturnPreservesTuple |
| `M-A5-editor-remounted` | A5 | KILLED | pointerEntry/ReturnPreservesTuple, pointerPathSameEditorNode, sectionNeverRemounted |
| `M-A5-keyboard-restore-dropped` | A5 | KILLED | keyboardEnter/SpaceEntryRestoresTuple, escapeReturnPreservesTuple |
| `M-A3-draft-wide-only` | A3 | KILLED | differentSectionSaves (+4) |
| `M-A3-same-section-overwrite` | A3 | KILLED | sameSectionConflicts (+6, incl. comparisonUnderLockRefusesChangedBody) |
| **`M-A3-outside-lock-check`** | **A3** | **KILLED** | **`comparisonUnderLockRefusesChangedBody`** (+ lockedComparisonSingleWinner, corroborating) |
| `M-A3-missing-digest-bypass` | A3 | KILLED | missing/invalidDigestFallsBackToVersionRule |
| `M-A3-conflict-disappears` | A3 | KILLED | conflictPersistsAfterUnrelatedSave |
| `M-A3-unrelated-blocked` | A3 | KILLED | unrelatedSavesWhileConflicted |
| `M-A3-rail-marker-hidden` | A3 | KILLED | conflictMarkedAtSection, conflictPersistsAfterUnrelatedSave |
| `M-A3-section-marker-hidden` | A3 | KILLED | conflictMarkedAtSection, conflictPersistsAfterUnrelatedSave |
| `M-A3-resolution-control` | A3 | KILLED | noResolutionUi |
| `M-A3-late-digest-overwrite` | A3 | KILLED | latestAcknowledgedDigestWins |
| `M-A3-version-adopted-after-digest-acceptance` | A3 | KILLED | sameSectionConflicts (+3) |
| `M-A3-accepted-by-misreported` | A3 | KILLED | sameSectionConflicts (+3) |
| `M-A3-digest-normalized` | A3 | KILLED | digestOverExactDeliveredBytes (+4) |

Every mutant failed its **intended** positive law. There were no instrument failures, no inconclusive results and no match failures.

### 6a. The discrimination packet §4 requires

For `M-A3-outside-lock-check`, the controlled-lock rounds were **3/3: 200, observed waiting on the lock, competing body NOT preserved, save mark persisted**. The mutant compared a body it read before waiting, and overwrote the competing writer after release. The candidate did the opposite in 18/18 rounds (§5).

- **Authoritative discrimination proof:** the controlled-lock check.
- **Corroboration only:** `lockedComparisonSingleWinner` also failed on the mutant in this run (`[1,6,1]`). This is scheduling-dependent, and it is recorded as corroborating evidence.

## 7. S4 classification carried forward (packet §7)

Frozen S4's `INSTRUMENT_FAILURE` has two accepted historical causes:
1. the founder-authorized removal of its `Draft vN` anchor;
2. its version-only bump no longer being a conflict under the R3 section-local law.

This is the same succession as S5. R2 and R3 are not reopened. A2 remains the save-truth oracle. Frozen LS0 evidence and instruments are not rewritten.

## 8. Migration sufficiency, with attribution proven

- **Schema manifest.** In all 12 configurations (6 LS0 + 6 LS1R1), against the same law as LS0 and LS1:
  - migrations: 498 total, 455 applied, 43 refused (no pgvector);
  - `runtimeDependent=0` · verdict **INDEPENDENT** · `pgErrors=0`;
  - the only touched object not created by an applied migration is `schema_migrations`, the migration instrument's own ledger.
- **Extraction-attribution audit** (`audit/EXTRACTION_ATTRIBUTION_AUDIT.txt`, instrument `d2ed05fa…9376`, run 16:03:55Z, before teardown): **12/12 PASS · 0 failed.**
  - Raw PostgreSQL log (custody identity, not preserved content): SHA-256 `c97d851977a93aec288441af9b432a3c39a98d8260c9c300dbfbb0778171ff5d` · 4,416,626 B · 85,617 lines. The log was restarted empty before the run and deleted at teardown by design.
  - Each begin and end marker occurs exactly once, begin precedes end, and no other run marker falls inside a slice.
  - The canonical `sed` slice `[begin_line … end_line]` has SHA-256 **equal** to the driver-extracted log.
  - Line counts equal `end_line − begin_line + 1`.

| Segment | begin_line | end_line | lines (expected = reference = extracted) | verdict |
|---|---|---|---|---|
| `LS0_RUN_*_C0-all-off` | 442 | 8362 | 7921 | PASS |
| `LS0_RUN_*_C1-editorial-on` | 8818 | 16756 | 7939 | PASS |
| `LS0_RUN_*_C2-focus-on` | 17214 | 25188 | 7975 | PASS |
| `LS0_RUN_*_C3-discuss-on` | 25644 | 33600 | 7957 | PASS |
| `LS0_RUN_*_C4-standing-on` | 34056 | 42014 | 7959 | PASS |
| `LS0_RUN_*_C5-all-on` | 42469 | 50407 | 7939 | PASS |
| `LS1R1_RUN_*_C0-all-off` | 50855 | 56272 | 5418 | PASS |
| `LS1R1_RUN_*_C1-editorial-on` | 56747 | 62130 | 5384 | PASS |
| `LS1R1_RUN_*_C2-focus-on` | 62578 | 68004 | 5427 | PASS |
| `LS1R1_RUN_*_C3-discuss-on` | 68452 | 73884 | 5433 | PASS |
| `LS1R1_RUN_*_C4-standing-on` | 74332 | 79749 | 5418 | PASS |
| `LS1R1_RUN_*_C5-all-on` | 80197 | 85606 | 5410 | PASS |

The audit file also records the exact marker strings, byte counts and both full digests per segment. Attribution is therefore proven for every configuration's migration-sufficiency evidence.

## 9. Tests and gates, on `c723dc8`

| Gate | Result | Source |
|---|---|---|
| `npm run typecheck` (no-regression, `tsconfig.ship.json`) | No regressions · exit 0 | `evidence/gates/typecheck.txt` |
| Jest `(writers\|Writers\|manuscript\|workbench\|rebuild)` | base 2,900 / 2,876 passed / 24 failed (11 suites) = candidate, identical · **0 new failures · 0 fixed** · no test edited | `evidence/gates/jest-comparison.json` (base and candidate both re-run fresh) |
| `check:no-supabase` | exit 0 | `evidence/gates/no-supabase.txt` |
| `check:design-canon` over the candidate delta | 3 member-facing surfaces, covered by 2 Experience Contracts · exit 0 | `evidence/gates/design-canon.txt` |
| `check:no-openai` · `check:no-direct-anthropic` | exit 0 · exit 0 | `evidence/gates/provider-gates.txt` |

Test succession: none required.

## 10. Preserved limitations (unchanged from LS1)

- **This repair removes the hard-coded Chapter-10 fiction. It does not establish durable member place and does not repair Home's last-saved-as-place semantics.** S2 and S3 remain RED, pending `OBSERVATION-ADDRESS-01`.
- S8 remains RED: no revision on autosave or reading start, and no Keep-a-version. S9 proves only the checkpoint substrate.
- A held conflict has no resolution path in LS1, by design.
- Keepalive is best-effort. Above 48 KiB a departure save is sent without keepalive, is never claimed Saved, and the guard stays armed.
- Production flag and migration state remain **UNKNOWN**. Everything here is E1: disposable, synthetic, loopback-stubbed.

## 11. Custody and teardown

- `EVIDENCE_MANIFEST.tsv` hashes every file in this package except itself and `TEARDOWN_RECORD.md`. Teardown runs after the manifest is hashed, so its record is written afterwards.
- Transport is **evidence/custody only**, on a fresh `chore/` branch from `e8868884`, and must not be merged as product implementation.

---

**FOUNDER ADJUDICATION — WRITERS-STUDIO-NEXT-01 / A1-LS1R1 COMPLETE RE-WITNESS**
