# The Context Governor — why these hooks exist

Source of every number here: `docs/architecture/audits/JARVIS_CONTEXT_ARCHITECTURE_AUDIT_2026-08-16.md`
(read-only measurement, 39–40 session transcript corpus). That audit is `DISCOVERED`/`PROPOSED`
and authorizes nothing on its own; this plugin implements its ranked move #1 and part of #2.

## The measured problem

| | Measured |
|---|---:|
| Startup floor (median first request) | **81,213 tok** |
| Per-session tool-result inflow (avg) | **173,381 tok** |
| Share of that inflow that is image-producing verification | **~70% (~121,000 tok)** |
| One iOS simulator call | **30,374 tok** avg |
| One computer-use screenshot | **77,047 tok** avg |
| All 2,054 Bash calls in the corpus | 428,346 tok (**208/call**) |

**The governing rules were aimed at the wrong bucket.** Bash is the cheapest thing in the
table and carries the most prose restriction. Images are the flood and the rule that
addresses them — "verification that produces images → subagent-first" — was written and
never enforced. That is an *enforcement* gap, not a policy gap. Do not author a new rule
for it; give the existing one a seam.

## Four tiers

```
T0  CONSTITUTION   always resident · HARD CEILING ~6,000 tok
    (identity)     vows · authority boundary · stop conditions · routing table
                   WHERE things are, never WHAT HAPPENED. All state leaves.

T1  ADMITTED       0 tok until triggered · lane rules, traps, gates
    (conditional)  trigger: path glob · lane · the tool about to run

T2  RETRIEVED      pulled on demand · symbols before files
    (addressable)  symbol index -> named slice -> whole file (last resort)

T3  ISOLATED       NEVER enters the main loop · images, bulk output
    (quarantined)  a subagent looks; the parent receives <=500 tok
```

**Governor invariant:** a tier may be crossed downward freely and upward **only by declared
trigger**. Nothing in T1–T3 promotes itself into T0 by being important.

## What this plugin implements

| Audit move | Recovers | Here |
|---|---:|---|
| **#1** `PreToolUse`: image tools → subagent-only (T3) | ~121,000 tok/session | `hooks/pretooluse-guard.py` + `hooks/image-tools.txt` |
| **#2** rules split T0/T1 | ~11,700 tok/session | partial — the four skills are T1 rule bodies, loaded on trigger |

**Not implemented here, deliberately:**
- Move #3 (retire `## Current priority thread` from `CLAUDE.md`) — that is a T0 edit to the
  project anchor and is governed elsewhere. This plugin does not touch `CLAUDE.md`.
- Move #5 (symbol index over the 97 files >40 KB, keyed on **worktree root + path + blob SHA**)
  — real infrastructure: parser, index, invalidation, referent binding. The audit names it
  the one bucket where buying may beat building.
- **M1** (measure the ~55,000-tok startup residual by differential) and **M2** (instrument
  memory-recall inflow). ⛔ 68% of the startup floor has **no findings**, only a subtraction.
  Propose nothing against it until M1 runs.

## Honest limits of the enforcement

- Subagent detection is a **heuristic** — the guard tails the transcript for the most recent
  `isSidechain` record. If it cannot tell, it allows. This changes the default path in the
  main loop; it is not tamper-proof, and is not meant to be.
- `hooks/image-tools.txt` is **explicit enumeration**. A new image emitter is invisible to
  the guard until it is added. Re-run the transcript census before assuming coverage.
- No before/after differential has been run. The token figures above are **measured inputs
  and projections**, not results. They become claims only after a real-session differential.
