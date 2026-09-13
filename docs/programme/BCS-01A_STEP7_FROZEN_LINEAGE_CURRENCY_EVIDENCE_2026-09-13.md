# BCS-01A · Step 7 — Frozen Input Lineage + Currency · Evidence

**Date:** 2026-09-13 · **Branch:** `claude/bold-bohr-pmtynu` · **Base:** `dc46e41c`
**Obligations:** P8 · P9 · first real material crossing for **P3** · owed **Step-4 M5** half
**Preflight:** `BCS-01A_STEP7_PREDICATE_PREFLIGHT_2026-09-13.md`

> **Persist the frozen relation. Derive the current comparison.** ⛔ No recurrence discovery, no
> observation path, no coverage producer, no CMT material.

---

## 1 · Built

```text
database/migrations/20260913000004_recurrence_sweep_checkpoint_inputs.sql
lib/boundedCognition/frozenSectionProvider.ts        seam + integrity validation
lib/boundedCognition/recurrenceSweepStore.ts         runFrozenSweepPartition ·
                                                     recordCheckpointWithInputs ·
                                                     loadCheckpointLineage ·
                                                     measureCheckpointInputCurrency
lib/boundedCognition/__tests__/w-frozen-lineage-currency.pg.test.ts   21 assertions
```

**`checkpoint_inputs` columns, exactly:** `partition_id · range_start · range_end ·
frozen_digest · recorded_at`. ⛔ No `section_id`, `draft_id`, `revision_number`,
`revision_digest`, `member_id`, `manuscript_id` — all resolve through
`checkpoint → partition → execution → commission`. ⛔ No prose. ⛔ No `read_at`. ⛔ No currency.

## 2 · Order is the law in the material path

```text
1 verify the current claim incarnation   (Step-5 fencing reaches material custody)
2 resolve authority FROM THE COMMISSION  (there is no execution-side copy to read)
3 permitCrossing BEFORE acquisition      (a refusal means the provider is never called)
4 acquire · 5 validate · 6 process · 7 checkpoint + lineage in ONE transaction
```

⭐ A refusal at 1–3 asserts **provider call count 0** — *the material was never acquired*, not
acquired and discarded. That distinction is the whole point of putting permission first.

## 3 · Witness — 21 assertions, real PostgreSQL 16.13

| | Result |
|---|---|
| **A · exact frozen input** | the typed relation reconstructs exactly: `{kind:'section'}` ref · manuscript · draft · revision 7 · revision digest · code-point range · `sha256(text)`. ⭐ The fixture text contains a multi-byte glyph, so a UTF-16 length would fail this assertion — the range is genuinely code points |
| **B/C · integrity** | five refusals, each leaving **zero** checkpoints and **zero** lineage rows: `digest_mismatch · revision_number_mismatch · revision_digest_mismatch · section_mismatch · range_length_mismatch`. A throwing processor likewise writes neither |
| **D · P3 first real wiring** | external permitted → `s1` acquired; protection contracts to sovereign **while the same execution is alive** → next acquisition `refused_by_current_protection`, **provider calls still `['s1']`**, checkpoint count still 1 |
| **E · frozen ceiling** | sovereign commission + external request → `refused_by_frozen_ceiling`, **provider calls `[]`** |
| **G · ABA** | after recovery, same worker string at attempt 2: old attempt-1 call → `not_claim_owner` with **provider calls `[]`**; attempt-2 call proceeds |
| **H/I/J** | `unchanged` · `changed` · `unmeasured` (null reader **and** throwing reader) |
| **K · inertness** | three measurements including a `changed` one: execution status unchanged, lineage byte-identical, execution count 1, commission count 1 |
| **freeze integrity** | a **completed** execution legitimately reads `changed` after the live Work moves, and its lineage still names revision 7 — *the execution's subject is still the frozen revision it was commissioned for* |
| **structural** | no exported checkpoint-without-lineage path · no coverage or observation producer · no causal vocabulary · `measureCheckpointInputCurrency` contains no `INSERT/UPDATE/enqueue` · no `currency/stale/is_current/effect/read_at/body/prose/text` column anywhere in the lane |

⭐ **§13 enforced structurally:** the bare checkpoint insert is **not exported**. `recordCheckpoint`
no longer exists on the module surface; the only insert path writes both tables in one
transaction, asserted by reading that function's body.

## 4 · Mutation evidence — ten bad implementations

```text
M1  lineage fabricated from plan metadata          → 2 failed, 17 passed
M2  caller-supplied frozen digest parameter        → 10 failed, 11 passed
M3  permission checked AFTER acquisition           → 2 failed, 17 passed
M4  authority read from execution-side copy        → 2 failed, 19 passed   ⭐ owed Step-4 M5 half
M5  checkpoint persists without lineage            → 5 failed, 14 passed
M6  lineage promoted into coverage                 → 1 failed, 18 passed
M7  bare `currency` column added                   → 2 failed, 17 passed
M8  unavailable current digest reads as unchanged  → 3 failed, 101 passed
M9  changed currency enqueues a recomputation      → 2 failed, 17 passed
M10 integrity validation skipped                   → 5 failed, 14 passed

RESTORED   9 suites · 106 tests · 106 passed
```

⭐⭐ **M4 closes both halves of the Step-4 M5 obligation.** Step 4 proved the *schema* prohibition
(a duplicate `max_jurisdiction` column REDs the witness). Step 7 adds the *read path*: an
instrument asserts the runner's body matches `m.max_jurisdiction` and never `e.max_jurisdiction`,
and the mutation that adds the column **and reads it** goes RED. **Both halves now witnessed.**

### ⚠️ R2 applied — two mutants were rejected as invalid before being counted

**M1, first attempt, produced `Tests: 0 total`** — the mutation broke compilation, so no witness
ran. ⛔ A mutant that cannot execute is not evidence of instrument strength; it was rebuilt to
fabricate lineage from plan metadata *while compiling*, and only then counted.

**M2, first attempt, was noisy** (15 failures including collateral from the harness edit) and its
RED did not isolate the prohibited relation. ⭐ The repair was to add the **missing instrument**
rather than a cleaner mutation: an API-surface assertion that `runFrozenSweepPartition`'s signature
contains no `digest|range|revision|frozenState` parameter. The rebuilt M2 then REDs on that
instrument directly.

⭐ **Both are the R1/R2 rules paying for themselves inside one step:** a prohibition needs an
instrument at the surface where it could appear, and a known-bad must be shown genuinely bad
before its RED counts.

## 5 · Exit gate

```text
typed frozen input lineage · no opaque string ref           GREEN
provider-derived, not caller-authored frozen state          GREEN
revision / range / digest integrity                         GREEN
permission before Work acquisition                          GREEN
current-protection contraction on the real read path        GREEN
Step-4 M5 divergent-read mutation                           RED (both halves closed)
ABA old claim cannot acquire Work                           GREEN
checkpoint + lineage atomic                                 GREEN
no checkpoint-without-lineage export                        GREEN
UNCHANGED · CHANGED · UNMEASURED                            GREEN
currency/status orthogonality · currency creates nothing    GREEN
no coverage derivation · no observation · no producer       GREEN
real PostgreSQL witness                                     GREEN
M1–M10                                                      RED
```

⭐ **Step 7 closes.**

## 6 · Owed / not established

```text
⛔ project gates      npm run typecheck · npm run test still not run (no node_modules here)
⛔ no recurrence discovery · no occurrence detection · no claim-specific coverage
⛔ no causal effect   lineage is CONTRIBUTED; EFFECT ESTABLISHED remains unavailable by design
⛔ no producer class · no CMT participation · no worker-loop autonomy · no production readiness
⛔ provider is a fixture seam — no integration with production Work tables
⚠️ prior witnesses restated again: the bare checkpoint export was withdrawn, so the Step-4/5/6
   suites drive the lineage-bearing path, and their table lists admit checkpoint_inputs.
   Recorded because an assertion that changes is a claim that changed
```
