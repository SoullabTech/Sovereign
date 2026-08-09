# Memory Resolution — Shared Boundary Design

**Date**: 2026-08-09 · **Status**: DESIGN ONLY, returned for founder review per
`docs/governance/MEMORY_RESOLUTION_CONTRACT_RULING_2026-08-09.md`. **⛔ Implementation not
authorized by this document.**

**Design problem (as ruled)**: the smallest coherent way for writers, operational readers, agents,
and diagnostic instruments to share ONE resolution contract — without duplicating the resolver
implementation across consumers.

---

## Design principle

The contract is **semantics, not code**. Three of the four consumers are LLM sessions
(writers, readers, agents) that follow stated rules; only one (the audit) executes code. Therefore
the shared boundary is **one canonical statement of the contract**, consumed three ways — not a
shared library.

## The boundary — one file, three bindings

### 1. Canonical contract statement (the single source)

`scripts/memory/RESOLUTION_CONTRACT.md` — the five ruled clauses, stated once, ~30 lines:
identity surfaces (filename stem + `name:`) · normalization · prefix expansion · exact-outranks-
normalized · ambiguity-fails-visibly. Plus the two writer obligations (below).

**Why the repo, not the memory dir**: the 2026-07-28 ruling places executable governance
infrastructure in `scripts/memory/`, not inside the corpus; the contract is the audit's spec, so it
lives beside the audit, git-versioned and reviewable. (Trade-off noted: the memory dir is shared
across all ~101 worktrees while repo files vary by checkout — mitigated by binding 3, since the
routing pointer travels with the corpus itself.)

### 2. Writer binding (prevents recurrence at the source)

Amend the memory-writing protocol (assistant system prompt / memory instructions) with two lines:

- **`name:` must normalized-equal the filename stem** (same characters up to hyphen/underscore
  case). This ends the two-namespace divergence for all future writes without touching the 760
  existing divergent files — the resolver makes those harmless.
- **Never truncate a slug** (closes the 5-occurrence truncation defect's producing mechanism —
  pending its writer being identified).

### 3. Reader binding (the routing-policy line)

One line in the `MEMORY.md` root header:

> *Links resolve under `RESOLUTION_CONTRACT.md` semantics: both `name:` and filename are valid
> identities; normalize hyphens/underscores; try the four prefixes; if more than one file matches,
> STOP and surface the ambiguity — never guess.*

This is a **routing-policy** change, which the root's growth invariant explicitly permits — but any
root edit is governed, so this line ships only with founder approval of this design. It is the only
part of the boundary that is *always loaded* by every reading session, which is what makes the
contract continuous rather than merely existing.

### 4. Instrument binding (already conformant)

`audit-memory.py` docstring gains one line declaring `RESOLUTION_CONTRACT.md` as the spec it
implements. **No code change** — Step 4 verified the implementation already conforms. The audit
remains the contract's only executable implementation and its enforcement instrument.

## What is deliberately NOT in this design

- ⛔ No second executable resolver (ruled).
- ⛔ No bulk rewrite of the 1,075 naive-broken links or the 760 divergent `name:` fields — the
  contract makes them resolvable as they are.
- ⛔ No renames of existing files (unversioned corpus; Time Machine-only backup).
- ⛔ No new tooling, hooks, or index generation — out of scope for this boundary.

## Verification (when implementation is authorized)

`npm run memory:audit` before/after: `unresolved_wikilinks` must not increase, `ambiguous_wikilinks`
must remain 0, and the report is hash-bound to the corpus state. The instrument that defines the
semantics is the instrument that proves the reconnection — closure, per the Dormant Instrument
ruling: this contract's own invocation binding (when does the audit run?) is deferred to the
instrument-registry work, and named here so it is not lost.

## Cost of the whole boundary

One new ~30-line file · two lines of protocol amendment · one routing line in the root header ·
one docstring line. Nothing else.
