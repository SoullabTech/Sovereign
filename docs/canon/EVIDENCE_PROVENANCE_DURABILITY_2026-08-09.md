# Evidence Provenance Durability

**Status: RATIFIED (founder, 2026-08-09)** — general invariant, complementing
`docs/canon/WITNESS_JURISDICTION_COROLLARY_2026-08-09.md`.
**Evidence**: `docs/architecture/audits/DORMANT_PROOF_INSTRUMENT_REVIEW_2026-08-09.md`

---

## The invariant

> **Evidence provenance must name a durable referent that contains — or otherwise reproducibly
> identifies — the artifact being certified. A transient working-tree state may be operationally
> observed, but cannot constitute durable provenance.**

## The maturity ladder it extends

The Instrument Registry established the control ladder
**existence → reachability → efficacy → binding**. This invariant adds the prior rung:

> **durability → existence → reachability → efficacy → binding**

A system cannot accidentally certify an artifact that disappears with the session that created it.

## The four states

| state | meaning |
|---|---|
| **tracked + dormant** | durable, independently inspectable instrument that is not presently invoked |
| **untracked + proven** | evidence exists *now* but cannot be reconstructed from the claimed ref |
| **tracked + reachable + proven** | operationally reproducible |
| **tracked + reachable + bound + proven** | a governance control |

**Tracked-and-dormant outranks untracked-and-proven.** Dormancy costs maintenance across change;
non-durability costs the evidence itself.

## The failure this names

Provenance that is **syntactically present and materially non-reconstructible**. The originating
case: a continuation packet's `VERIFIED` lines carried `provenance: 851c2e73a`, and that ref
contained **none** of the artifacts being certified — they were untracked in a single working tree
among ~101. The provenance was not false; `851c2e73a` *was* HEAD. It was empty: no second party
could re-derive the claim.

This is `feedback_instrument_referent_matching` applied to an instrument's own artifacts, and the
standing rule ***a commit is the only durable act*** applied to itself.

## Companion finding — why dormancy is not the same defect

A proof instrument may be dormant without being worthless, **provided its expected values are
derived from a witness independent of the thing under test**. The regress terminates at that
external witness. A proof that shares its subject's logic establishes only self-consistency, and
dormancy then does void it.

## How to apply

1. Before citing evidence, ask: **does the named referent contain the artifact, or reproducibly
   identify it?** A hash-bound corpus manifest qualifies; a HEAD SHA that lacks the file does not.
2. Prefer **durability before binding**. Binding an artifact that exists in one uncommitted working
   tree binds nothing — the more sophisticated mistake.
3. A working-tree observation is a legitimate *measurement*; it is simply not *provenance*. Record
   it as observed, and make it durable before it is cited as proof.

## Self-application

This document and its governing records were committed in the same act that ratified the
invariant. A canon record asserting that untracked evidence cannot constitute provenance would
otherwise have been untracked evidence.
