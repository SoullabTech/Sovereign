# JARVIS-JEV-01 / JEV-INT-05 — J1R5-WIRE Repair Return (R2)

**Date:** 2026-10-07 · **Status:** ⭐ REPAIRED, LOCALLY TESTED CANDIDATE · ⛔ **OFF · NOT RATIFIED · AUTHORIZES NOTHING**
Repairs `12890c6fb` after an independent Mac review (clean detached checkout; its baseline: wire proof
26/26, wire matrix 26/26, J1 host 26/26, frozen J1 TS matrix 63/63 zero survivors, freeze intact, strict
typecheck exit 0; all eight targeted reproductions used fake transports, paid calls 0, credentials not
accessed, committed source unchanged and still refusing sends).
**No credential · no provider registration or assignment · no spend · no inference call · no label · PILOT-01 untouched · frozen J1 untouched.**

## 1 · Findings → repair → committed regression

| Review finding | Repair | Regression check · defeat candidates |
|---|---|---|
| **S1** response uses `answers`, not `questions` | Descriptor corrected: `answers`, `usage.input_tokens` + `usage.output_tokens` required; schema SHA-256 `a191f8a7…60d5` recorded; table version bumped to `jev-wire-q2` | W27, W34 · `DC-OLD-RESPONSE-ENVELOPE` |
| **S2** parser accepts extra root, extra answer, unapproved confidence | Parser enforces the experiment's exact shape at root, `usage`, `answers`, and the answer object; J1 validator untouched | W27 · `DC-EXTRA-ROOT/USAGE/ANSWER-ACCEPTED`, `DC-CONFIDENCE-FIELD-ACCEPTED` |
| **D1** observation returned but never saved | `observed` event (probability, both token counts, requested/returned model, latency, wire hash, canonical raw response + SHA-256) is fsynced **before** `ok` is returned; failure to save → `observation_not_persisted`, halt, never `ok` | W28 · `DC-OBSERVATION-NOT-PERSISTED`, `DC-OK-ON-PERSIST-FAILURE` |
| **T1** never-settling transport hangs the runner | Owned deadline (`timeout_ms`, default 30 s) with abort signal; expiry → `crossing_unknown`, reservation retained, halt; a late answer is ignored | W29 · `DC-NO-DEADLINE`, `DC-AUTO-RETRY` |
| **D2** restart after ambiguous crash sends again | A reservation with no settlement is **unresolved**; any unresolved attempt blocks all sends (`UNRESOLVED_ATTEMPT`). Demonstrated with a real child process exiting after reservation | W30 · `DC-UNRESOLVED-ATTEMPT-IGNORED` |
| **D3** unknown event ignored | Closed event set (`init reserved observed settled halted`), per-event field validation, legal transitions, per-record sequence/prev/hash chain; illegal records never reach disk; any invalid ledger refuses sends | W31 · `DC-UNKNOWN-EVENT-IGNORED`, `DC-TRANSITIONS-UNCHECKED`, `DC-CHAIN-UNCHECKED` |
| **D4** missing ledger = fresh start | Ledger must be explicitly `initialize()`d once and is bound to experiment id + table hash + fixture-list hash + schema hash; a missing file is `LEDGER_NOT_INITIALIZED`; mismatched binding refused | W32 · `DC-MISSING-LEDGER-AUTO-INITIALIZED`, `DC-BINDING-UNCHECKED` |
| **D5** two processes both send | Gate and reservation write share one exclusive lock (`wx`); a second process gets `LOCK_HELD`/`ATTEMPT_ALREADY_USED`/`UNRESOLVED_ATTEMPT`. Test widens the read→write window in each child so an unlocked ledger races deterministically | W33 · `DC-NO-CROSS-PROCESS-LOCK` |

New rule from D2/D5: **at most one attempt in flight.**

## 2 · Results (this container; fake transports only)

```text
proof:   34 / 34 PASS  (3 consecutive runs, incl. real child-process cases)
matrix:  reference clean · 41 / 41 candidates killed on their named check · 0 survived · 0 wrong-death
frozen J1 freeze verifier: 0 violations (FREEZE INTACT) · J1 host proof PASS
```

Not rerun here: the frozen J1 TypeScript matrix (63/63) and strict typecheck (no `tsx` in this container).
Neither is touched by this change; the Mac review already recorded both green at `12890c6fb`.

Suite weaknesses found while repairing (fixed in the suite): the first `DC-NO-DEADLINE` died by an
unhandled-rejection crash rather than on `W29` (the candidate now also removes the timer); a
cross-process test without a widened window would not have reproduced the race deterministically.

## 3 · Still gated (unchanged)

| Item | State |
|---|---|
| `RESPONSE_SHAPE.witnessed` | **false** in the committed module; W20 proves every send is refused. Opening it is a founder act. |
| **Model-identity field path** | The review message did not state it. `model_key: 'model'` is **unconfirmed**; a wrong path fails closed (response refused, halt). Confirm against the saved schema (sha256 above) before opening the flag. I could not open the review packet itself in this container. |
| Any extra top-level members the schema lists | Add to `top_level` at witness time; unlisted members are refused. |
| Residual ledger risk | Truncation to a valid prefix, or deleting the file **and** re-initializing, needs an external anchor. `ledger_head` is returned after each success so an operator can record it. A stale `.lock` after a crash inside the lock fails closed (`LOCK_HELD`) and needs manual inspection. |
| J1R5-WIRE ratification · Route A chain · execution/spend grant · DPA review · credential · ledger location | Open, as in the candidate return. |
