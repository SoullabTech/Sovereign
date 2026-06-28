# ADR-007: Studio Session anchor — `studio_sessions` realizes ADR-005's Session tier

**Status:** Accepted (2026-06-27, Kelly) — resolves the **Session anchor** open decision named in ADR-005. Docs-only; authorizes **no** implementation.
**Authors:** Kelly Nezat (decision), Claude (drafting)
**Reviewers:** Kelly Nezat

> Resolves the second of ADR-005's two *Open implementation decisions*. With [ADR-006](006-studio-person-anchor.md) (Person anchor), both are now settled.

## Decision

**`studio_sessions` realizes ADR-005's Session tier: an orchestration anchor for a realized encounter — *not* a replacement for Meeting Instance, and *not* a super-table.**

- `sessions` remains the **Meeting Instance** tier.
- `studio_sessions` becomes the **Session** tier (the realized encounter).
- `studio_sessions` may **descend from a scheduled Instance** (booking / group) **or be parentless** for ad-hoc Studio rooms.
- `studio_sessions` **bridges the facets it references**: Instance (`sessions` / group), recording (`scribe_sessions`), modality / history (`practitioner_sessions`), and the meeting-provider record (`studio_meetings` / provider).
- **Facet tables remain facets**, not competing sources of truth.
- **Resources / notes / recordings attach directly to `studio_sessions` first.**
- A separate **`studio_session_resources` table is deferred** until attachment behavior earns the structure.

## Constraints (load-bearing)

- Do **not** refactor the existing `sessions` table; it stays the Meeting Instance tier.
- `studio_sessions` must **not become a super-table** that reabsorbs Meeting Instance or the facets.
- The Session tier sits **at** the encounter level — bridging, never absorbing.

## How this refines ADR-005 without contradicting it

ADR-005 already names a **Session** tier (the realized encounter, "may be parentless") and maps its *current realization* to the ad-hoc session-room / scribe path — not to a table. This ADR realizes that **same tier as a canonical table** (`studio_sessions`): an implementation choice **within** ADR-005's model, not a new tier. The Series → Instance → Session spine is unchanged; `sessions` keeps its D2 role as Meeting Instance.

## Why this reduces fragmentation rather than adding a concept

Today "the session" is scattered across `sessions` (booking), `scribe_sessions` (recording), `practitioner_sessions` (history), `studio_meetings` (provider), and the session-room runtime. `studio_sessions` adds **no new concept** — it gives ADR-005's existing Session tier **one canonical anchor** the facets reference, replacing the "which table is the session?" ambiguity with a single answer. One anchor that **subordinates** the facets is *less* fragmentation than several co-equal session-ish tables — satisfying ADR-005's *reduce, don't add*.

## What this ADR does NOT do

Docs-only. **No migration, API, or runtime work is authorized.** Implementation — creating `studio_sessions` at the Session tier, wiring bridges to the facets, attaching resources directly, and pointing participation at `encounter_participants` / `studio_people` (ADR-006) — is a **separate, later** authorization, including reconciling the parallel streams' colliding migration numbers.

## References

- [ADR-005](005-studio-orchestration-domain.md) — Studio as Orchestration Domain (parent; resolves its Session-anchor open decision; Series → Instance → Session).
- [ADR-006](006-studio-person-anchor.md) — Person anchor (participation attaches to the Session).
- Reference design: `studio_sessions` migration + API on branch `feat/relationship-roles-additive` (reference-only) — the implementation starting point, to be re-pointed at the ratified model.
