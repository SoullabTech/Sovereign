# JARVIS-ORCHESTRATION-OPERATOR-01 / O5-R2 — Real-Home Recovery Census (admission instrument)

**Date:** 2026-09-30
**Base:** `6f8511b4` (O5-R2 seam) · frozen O5-R1 @ `af2f0203` — **FREEZE INTACT**
**Standing:** INSTRUMENT BUILT + WITNESSED ON A SYNTHETIC HOME · ⛔ **REAL-HOME CENSUS NOT YET RUN** · ⛔ NO REAL STATE TOUCHED · ⛔ NOT MERGED

## 1. Founder ruling (substance)

> First contact with historical real state is a separate witnessed act, because it can mutate W4 and
> settle grants. Run a **read-only census** (`recoverPathB(root, { write: false })`) first. **Do not run
> the startup writer against the real delegation home** until that census is reviewed. The census is
> the **admission witness** for touching real state.

Governing law, preserved verbatim:

> ***Recovery may complete the recording of an effect already witnessed; it may never manufacture
> evidence by repeating the effect.***

## 2. ⚠️ The census cannot be run from this session, and was not faked

The real delegation home (`~/.claude/ain-delegation`) exists only on the Mac Studio. This container
has no such directory, and `AIN_DELEGATION_HOME` is unset. **No real-home output exists yet.** What this
act delivers is the instrument, proven on a synthetic home that contains every historical shape it must name.

**Run it on the Mac Studio, with JARVIS Desktop closed**, from a checkout of this branch:

```bash
node scripts/builder/o5-recovery-census.mjs --out ~/o5-census-$(date +%Y%m%dT%H%M%S).json
```

⚠️ **Write the `--out` file OUTSIDE the delegation home.** The census never writes inside it, and
writing the evidence file there would change the very state it describes.

## 3. What changed before admission

### 3.1 Startup is now read-only (the ruling's direct consequence)

In `6f8511b4`, Desktop startup would have **written** to the real home on its first launch from this
branch. It now only classifies and logs (`recoverPathB(..., { write: false })` +
`reconcileOrphans(root, { dryRun: true })`). CENSUS-9 guards this structurally: the startup body may
not contain `write: true`, `dryRun: false` or `admittedWrite`.

### 3.2 F4-R: no magic number

The `≥ 63` floor is replaced by an explicit **decision record**
(`tests/constitutional/jarvis-o5-r2/failure-code-inventory.json`). F4-R now requires the live
inventory to **equal** it, in both directions:

- a live code absent from the record → FAIL: *a new code requires an explicit mapping decision*;
- a recorded code no longer live → FAIL: *retire it explicitly, or the extractor lost reach*.

New defeat candidate **DC-F4R-3** (a catch-all map that silently "classifies" a newly introduced
code) dies with the other two. The R2 matrix stays **LETHAL + DISCRIMINATING**.

### 3.3 Path A dry run

`reconcileOrphanedRuns(..., { dryRun: true })` reports would-reconcile and unproven runs and writes nothing.

## 4. The instrument — `scripts/builder/o5-recovery-census.mjs`

**Read-only by construction.** Classification uses `recoverPathB(root, { write: false })` itself.
Every fact is re-read and re-classified, and any disagreement is reported
`STATE_CHANGED_DURING_CENSUS` (UNCLASSIFIED) rather than trusted.

**Output, grouped by disposition** (counts + identifiers):
`NONE · CONVERGED · RECORD · BLOCKED_BY_EVIDENCE · NEEDS_OPERATOR_AUTHORITY · UNCLASSIFIED_OR_MALFORMED`.

**Every stop is sub-classified into the founder's categories** (`STOP_CATEGORY`, exhaustive over
the classifier's reasons, CENSUS-8):

| Category | Classifier reasons |
|---|---|
| `no_durable_result` | `DISPATCHED_WITHOUT_WITNESS_NO_PROBE` |
| `torn_or_unreadable_result` | `DURABLE_RESULT_UNREADABLE` · `DURABLE_RESULT_DIGEST_MISSING` |
| `wrong_work_unit_identity` | `DURABLE_RESULT_UNBOUND` · `W0_ENVELOPE_FOREIGN` · `GRANT_FOREIGN` |
| `authority_no_longer_sufficient` | `W2_NOT_EXECUTING` · `W2_AUTHORIZED_CORE_MUTATED` · `GRANT_REVOKED` · `GRANT_INVALIDATED` (gate `NEEDS_OPERATOR_AUTHORITY`, grouped separately) |
| `ambiguous_historical_state` | `W0_ENVELOPE_UNREADABLE` · `W0_ENVELOPE_INCOMPLETE` · `GRANT_LEDGER_UNREADABLE` · `GRANT_RECORD_MALFORMED` |

An unmapped reason is **UNCLASSIFIED**, which makes the census **inadmissible**.

**Every proposed RECORD answers the four questions from durable facts:**

1. **Which grant was claimed:** id, standing, participant, binding, canonical SHA, and the full
   event history (`ISSUED → CLAIMED …`, with times).
2. **Which durable result was found:** path, byte count, **digest of the bytes on disk**, and the
   unit and grant it names.
3. **Which W2 authority check permits ledgering:** lifecycle and guard state, digests of the
   authorized-core snapshot and of the core now, `core_unchanged`, `grant_not_withdrawn`.
4. **What exact W4 append would be made:** the call and its arguments, whether the grant is settled
   first, and a **rehearsal**. The *real* writer is run on a throwaway copy of that unit's files in a
   temp directory, and the W4 records and grant events it actually appended are reported. It is
   not a prediction by re-implementation.

**Historical shapes the classifier does not model are named, not absorbed:**
`GRANT_LEDGER_LOCK_PRESENT` (an abandoned `O_EXCL` lock, the O5-R3 hazard) ·
`GRANT_LEDGER_WITHOUT_ENVELOPE` · `DURABLE_RESULT_WITHOUT_ENVELOPE` · `ORPHAN_DURABLE_RESULT` ·
`TEMP_FILE_RESIDUE` · `PRIOR_RECOVERY_DISPOSITIONS` · `MULTIPLE_UNRESOLVED_GRANTS` ·
`W4_ATTEMPT_WITHOUT_GRANT` · `EXECUTING_WITHOUT_GRANT`.

**Path A:** would-reconcile runs (owner proven gone) and unproven runs, each with the reason,
owner and timestamps. Unstamped historical runs stay **UNPROVEN**. ⛔ Death is never inferred
from age, pid absence alone, timestamps or apparent inactivity.

**`census_digest`** binds admission to exactly what was reviewed. It covers identities, actions,
reasons, witnessed digests, the rehearsed record ids, the Path A sets and the shapes, and excludes
rehearsal timestamps.

**The write pass is an explicit act bound to that digest:**

```bash
node scripts/builder/o5-recovery-census.mjs --write --admit <census_digest>
```

It recomputes the census and **refuses** unless the digest equals the admitted one (state
unchanged since review) and nothing is unclassified. It then runs exactly the reviewed pass.

## 5. Witness (synthetic home, `jarvis-desktop/test/o5-recovery-census.test.mjs`, 9/9)

The home is built by the **real** W v2 code, with executions hard-stopped mid-flight, and contains
one unit per disposition and category, the four unmodelled shapes, and two Path A runs.

| # | Proposition | Result |
|---|---|---|
| CENSUS-1 | the home is **byte-for-byte unchanged** (paths, bytes, modes) after a census that rehearses a RECORD, and the tree digest is proven to see a one-byte change | ✅ |
| CENSUS-2 | exact grouping; every category lands correctly; admissible | ✅ |
| CENSUS-3 | the four RECORD questions answered; the digest equals `sha256(bytes on disk)`; the rehearsal appends 1 attempt whose artifact digest equals the witness, plus 1 `CONSUMED` | ✅ |
| CENSUS-4 | lock, orphan result, ghost ledger and temp residue are named; Path A dead-owner run would reconcile, the unstamped one is unproven, and neither is mutated | ✅ |
| CENSUS-5 | the digest is deterministic, and changes when state changes | ✅ |
| CENSUS-6 | the write pass refuses when no digest, a wrong digest, or a stale one after a state change is given; the home stays unchanged | ✅ |
| CENSUS-7 | **fidelity:** the admitted write produces **exactly** the rehearsed attempt ids and artifact `(id, ref, digest)` tuples; stopped units get nothing ledgered, no grant reissued or settled, and a GATED disposition; the dead-owner Path A run becomes `FAILED/BLOCKED_BY_EVIDENCE`; the unstamped run stays `RUNNING` | ✅ |
| CENSUS-8 | every classifier stop reason has a category; with one removed, the census is inadmissible and the write pass refuses | ✅ |
| CENSUS-9 | Desktop startup is structurally read-only | ✅ |

CLI demonstration on a synthetic home: grouped summary, categories and digest printed, exit 0.
`--write --admit sha256:deadbeef` refused with `CENSUS_DIGEST_MISMATCH`.

**Regression:** the jarvis-desktop suite is 378 tests / the **same 13** pre-existing failures as baseline (diffed
by name; shallow-clone SHA), with all 9 + 8 + 5 O5 tests passing. Builder proofs: native-runtime 8/0 ·
alpha-floor 97/0 · grant-store 9/0 · ledger-v2 23/0. O5-R1 matrix LETHAL + DISCRIMINATING ·
FREEZE INTACT · O5-R2 matrix LETHAL + DISCRIMINATING · `check:no-supabase` clean.

## 6. Recorded for O5-R3 — Grant Settlement / Lock Integrity (⛔ not opened)

Founder-named scope, carried unchanged: consume failure before/after durable result · abandoned
grant locks · `CLAIMED` + W4 already present · atomicity and order between result persistence, grant
settlement and W4 append · a crash at every boundary. The normal execution ordering (W4 appended
without checking consume) is **not** changed here. The census surfaces the live instances instead
(`GRANT_LEDGER_LOCK_PRESENT`, `CONVERGED` with `settle_grant: true`).

## 7. Next act (founder)

1. On the Mac Studio, with Desktop closed, run the census (§2) and keep the JSON as evidence.
2. Review, especially every `RECORD` (the four questions and the rehearsal) and every shape observation.
3. **If the census is intelligible and every proposed mutation is justified from durable facts:**
   authorize the write pass with that exact `census_digest`.
   **If it shows unexpected historical shapes:** stop. Extend the classifier and falsifiers before any real mutation.

**Standing: CENSUS INSTRUMENT ✅ (9/9, synthetic) · STARTUP READ-ONLY ✅ · F4-R EXACT DECISION RECORD ✅
· ⛔ REAL-HOME CENSUS OWED (Mac Studio) · ⛔ NO WRITE PASS AUTHORIZED · ⛔ O5-R3 NOT OPENED ·
PRODUCTION UNTOUCHED.**
