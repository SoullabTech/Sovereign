# Memory Reference Resolution — Founder Ruling

**Date**: 2026-08-09 · **Status**: RULED (founder). Design authorized; **implementation NOT yet
authorized** — the shared-boundary design must return for review first.
**Evidence base**: `docs/architecture/audits/BUILDER_OS_INSTRUMENT_RECONCILIATION_2026-08-09.md`
(instrument run `audit-20260809-184526`, hash-bound).

---

## Ruling 1 — the resolution contract

The existing `memory:audit` resolution semantics are **accepted as the candidate canonical
contract** for memory references:

1. **Filename stem and frontmatter `name:` are both valid identity surfaces.**
2. **Hyphen/underscore normalization is permitted.**
3. **Established prefix expansion is permitted** (`project_` / `feedback_` / `reference_` / `user_`).
4. **Exact identity outranks normalized resolution.**
5. **Ambiguity must fail visibly and must never be guessed.**

**⛔ Do not build another resolver.** The implementation problem is to determine the smallest
coherent way for **writers, operational readers, agents, and diagnostic instruments to share one
resolution contract** — a **RECONNECT, not a BUILD**. ⛔ The resolver implementation must not be
duplicated across consumers. Design the shared boundary and return before implementation
(→ `docs/architecture/MEMORY_RESOLUTION_SHARED_BOUNDARY_DESIGN_2026-08-09.md`).

Grounding: under contract semantics the corpus measures **98.1% referentially intact** (5,202/5,369
resolve · 0 ambiguous · 0 duplicate identities); under naive filesystem-exact reading it *appears*
80% intact. The defect is fragmented resolution semantics, not corpus corruption.

## Ruling 2 — the residual 102 references

**⛔ Do not mass-edit the residual 102.** They are three populations with three producing
mechanisms, each addressed at its mechanism:

| class | size | disposition |
|---|---|---|
| meta-vocabulary (quoted examples: `[[wikilinks]]`, `[[refs]]`…) | ~20 occ | **instrument exclusion/escaping semantics** — audit classification issue, not corpus damage |
| truncated slugs (`[[project_six_category_artifact_typolo]]`) | 5 occ | **identify and repair the writer** — a write-path defect |
| never-written targets (`project_constitutional_methodology` ×13 …) | ~77 occ / ~50 targets | **determine per target**: abandoned intent · failed persistence · expected-but-never-established capability |

**⛔⛔ No synthetic placeholder memories may be created merely to make the audit green.** The
metric must never drive fabrication of memories that were never authored.

## Ruling 3 — Dormant Instrument Failure (canonical failure mode, recorded)

> A system capability for detecting degradation exists but is not bound to a lifecycle event, CI
> gate, scheduled audit, or operator workflow capable of invoking it. The presence of the
> diagnostic creates an illusion of protection without actual protection.

Confirmed instances: (1) `memory:audit` — existed, named the dominant defect in its own taxonomy,
never ran; (2) the resolution semantics — encoded once, in the never-run instrument, unavailable to
every operational consumer. Same closure-failure class as the auth-boundary case.
**⛔ The Capability Continuity Guard is NOT yet authorized for design** — this ruling records the
failure mode only.

## The continuity principle this establishes (recorded for the Guard's eventual charter)

> **A capability is not continuous merely because its implementation exists somewhere. Its
> governing semantics must remain available everywhere that capability is exercised.**
>
> The eventual standard: *a high-level capability exists when its required semantics remain intact
> across the complete path by which that capability reaches the member.* The Guard's purpose is to
> **protect sophisticated capabilities through composition** — not to normalize the system toward
> the lowest common denominator.
