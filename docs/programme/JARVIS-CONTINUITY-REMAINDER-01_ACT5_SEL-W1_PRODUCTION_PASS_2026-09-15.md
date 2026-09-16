# JARVIS-CONTINUITY-REMAINDER-01 · ACT 5 · SEL-W1 production PASS

**Date:** 2026-09-15
**Runtime:** `762c3c4ed`
**Witness session:** `sel-w1-8e7c78c3-02c9-4396-aaf7-7b3cb49c579b`
**Disposition:** ✅ PASS · first valid serve · no retry · no tuning

## Custody

Production provenance was verified by build stamp, `Config.Env`, and `printenv` before the witness. The known-safe prior image was pinned independently as `maia-sovereign:safe-e57ca1baa` before any live act.

Two earlier instrument attempts are NOT witness results: the HTTP guest attempt was refused `401` before persistence; the anonymous direct-service harness produced `depth: 0` throughout and was void because it never populated `conversation_turns`. Both construction errors were recorded before the valid serve.

## Armed state

The corrected harness supplied a fresh synthetic witness UUID and checked `getSessionContinuityWindow` after every setup response. Durable completed-exchange depth closed exactly:

```text
1 → 2 → 3 → 4 → 5 → 6
```

`SEL_W1_ARMED_DEPTH=6` was observed before the final probe.
## Witness

Exact probe:

> What was that phrase I mentioned earlier?

Observed:

```text
🚦 Processing Profile: CORE | Turn 7 | Length: 41
🌉 [L1/bridge] recovered { count: 1, indices: [ 0 ], via: [ 5 ] }
🧵 [L1/CORE] recovered displaced exchanges { count: 1, indices: [ 0 ] }
🧭 [A6/CORE] session continuity { depth: 6, represented: 5, absent: 1,
                                  unit: 'completed exchanges' }
```

MAIA answered: `You mentioned "silver cedar" — right at the start of our conversation.`

The selected target is the member-authored plant at index `0`; the bridge source is the nearest grounded member ask at index `5`. The previously witnessed assistant-carried echo path is not selected.

## Verdict

All precommitted PASS conditions are satisfied:

```text
FAST or CORE                  ✅ CORE
bridge indices contains 0     ✅
via contains 5                ✅
response identifies marker    ✅ silver cedar
assistant-only target route   ✅ not selected
```

This establishes the repaired selection law in production for linked/repeated opaque retrieval. It does **not** establish first-ask opaque memory.
## Incidental observations · not adjudicated here

The direct-service harness surfaced pre-existing non-blocking diagnostics (`lattice_nodes` absent in one optional memory path, and a tsx/CJS shadow-import warning). Neither altered A6 depth, bridge selection, model response, or witness completion. No repair lane is opened by this record.

## Standing

```text
SEL-W1 selection-law witness   ✅ PASS
production                     ✅ 762c3c4ed remains deployed
SEL-W2 terminal abstention     ⛔ unspent
SEL-W3 grounded one-hop        ⛔ unspent
S first-ask semantic probe     ⛔ unspent
first-ask opaque memory        ⛔ unsolved · separate lane
rollback primitive repair      ⛔ separate · unopened
```
