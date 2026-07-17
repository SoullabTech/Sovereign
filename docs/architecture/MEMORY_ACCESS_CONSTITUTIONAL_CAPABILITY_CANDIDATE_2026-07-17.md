# Memory Access as a Constitutional Capability — CANDIDATE

**Status:** CANDIDATE (Kelly, 2026-07-17, from the "Security Before Continuity" directive) — standing direction, not yet formally placed in canon. Formal placement belongs at a sitting.

## The lesson

The scribe transcript vulnerability (PR #622) exposed more than one unauthenticated endpoint. It exposed that **memory access has been an incidental property of whichever API a component happens to call**, rather than a declared, enforceable capability. The specialized mentor surfaces turned out to be more memory-restrained than canonical MAIA — by accident of implementation, not by governed design.

Kelly's statement of the principle:

> Memory access must become a first-class constitutional capability, not an incidental property of whichever API a component calls.

Every MAIA posture and every room should eventually declare, **in enforceable terms**:

```text
What may be known?
What may be read?
What may be written?
Whose words are these?
Who may see them?
What crosses the boundary?
```

> That is the learning system's real nervous system. Without those distinctions, "one MAIA" could accidentally become one enormous memory pool. With them, MAIA can remain one relationship while honoring many different containers.

## Existing instances (this is generalization, not invention)

- **Sanctuary Mode** — the original proof: a structurally enforced no-write container, below the prompt layer.
- **The posture `memoryPolicy` contract** (ruled 2026-07-17, MENTOR_SURFACE_RECONCILIATION §prerequisite): `read`/`write` declared per posture, server-enforced.
- **The Now What? membrane** (ratified model): authorized read-only inflow, no automatic write-back, no practitioner visibility by default — a per-container answer to all six questions.
- **The place contract** (`lib/maia/presence/place.ts`): "what may be known" answered as facts-only, allowlist-validated server-side.
- **The scribe authorization patch** (PR #622): "whose words are these / who may see them" enforced at the route.

## What this candidate implies (held, not authorized)

A future unification where posture, room, and container declarations share one enforceable vocabulary (the six questions as a typed contract), enforced at the server seams that already exist: the memory loaders, the writeback service, the addenda channel, and route authorization. No implementation is authorized by this document; it names the direction so the next seams are built toward it rather than past it.

Related: `docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md` (Inv 16 — direction of authority), Sanctuary invariants (CLAUDE.md), MENTOR_SURFACE_RECONCILIATION_2026-07-17.md, NOW_WHAT_MAIA_RELATIONSHIP_QUESTION_2026-07-17.md.
