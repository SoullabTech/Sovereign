# Workspace Provenance Discipline

**Date**: 2026-08-09 · **Status**: discipline record (Horizon I closure item 3).
**Elevation (founder, 2026-08-09)**: *this is not developer hygiene; it is part of JARVIS's
epistemology.*

---

## The rule

> **Before trusting any instrument reading, answer: what workspace, checkout, cache state,
> configuration, and deployed referent produced this reading?**

An instrument's output is a claim about a **referent**. An unstated referent makes the reading
uninterpretable — and, worse, *plausible*. A sophisticated agent reasoning from an epistemically
contaminated workspace produces sophisticated nonsense.

This is the operational form of the already-ratified
`feedback_instrument_referent_matching` and of the Witness Jurisdiction Corollary's
proximity clause: **a measurement is only evidence about the thing it actually measured.**

## The five provenance dimensions

| dimension | question | how it goes wrong here |
|---|---|---|
| **Workspace** | which of ~101 worktrees? | shared memory dir + one dev DB across all of them → `feedback_shared_dev_db_breaks_repeatable_evidence` |
| **Checkout** | which SHA; how far from trunk; dirty? | session-start `gitStatus` is **stale by standing rule** — `rev-parse` first. This session: 188 dirty paths, 10 behind trunk |
| **Cache** | build/type/test caches from a prior state? | `tsconfig.ship.tsbuildinfo` and similar can make a stale reading look current |
| **Configuration** | which config actually loaded? | `.githooks/pre-commit` vs the installed hook (Instrument Registry §3); `tsconfig` scope vs assumed scope (typecheck audit) |
| **Deployed referent** | does this measure the deployed system or my checkout? | *"`--verify` measures the observer's checkout, NOT the deployed referent"*; *"falsely reported unguarded TWICE from working tree"* |

## Standing consequences (already ruled, collected here)

- **`rev-parse` before any branch/lane claim.** The injected session-start git status is stale.
- **Verify canonical AND deployed SHA** for any claim about production behavior.
- **A commit is the only durable act** — uncommitted work is invisible to every git-based
  instrument, including PR-collision checks (a 592-line suite was lost to this).
- **Hermetic verification where caches can contaminate**: when a cache can carry state across the
  boundary being measured, the reading must either clear it or declare it.
- **Findings bind to a ref, not a moment.** `memory:audit` does this correctly —
  `index_sha256` + `corpus_manifest_sha256` in every findings file. **That is the model.**

## The provenance line

Any instrument-derived claim entering a durable record should carry enough to re-witness it:

```
instrument · when · workspace/checkout SHA · dirty? · deployed referent (if claimed) · corpus/config hash
```

Worked example from this investigation: *"`memory:audit`, 2026-08-09, `audit-20260809-193848`,
hash-bound to corpus manifest; measures the shared memory dir (not any single worktree); no
deployed referent claimed."* — that sentence is what makes the 102 figure re-checkable rather than
merely asserted.

## Two live provenance defects, recorded not fixed

1. **Shared memory corpus across ~101 worktrees, no lock.** Concurrent sessions write `MEMORY.md`;
   `modified-since-read` catches only the second writer. Between this session's two audit runs the
   topic-file count rose by more than this session authored — consistent with concurrent lanes.
   Any memory measurement is a reading of a **moving** corpus; the hash-binding is what makes it
   honest.
2. **Configuration divergence as a class** — the versioned-vs-installed hook case is one instance;
   the typecheck-scope case was another. Both had the same shape: *the artifact that looks
   authoritative is not the one that executes.*

## Relationship to the other Horizon-I items

Workspace provenance is what makes the Instrument Registry meaningful: **an instrument bound to an
invocation boundary but read without provenance still produces untrustworthy evidence.** Registry
answers *was it run?*; provenance answers *on what?*. Both are required before `/orient` can claim
to establish a trustworthy starting position — which is precisely Horizon I's exit condition.
