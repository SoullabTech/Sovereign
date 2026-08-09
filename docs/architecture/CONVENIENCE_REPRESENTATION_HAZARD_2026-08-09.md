# The Convenience-Representation Hazard

**Date**: 2026-08-09
**Class**: architectural finding
**Discovered during**: APER v1 Keeps projection (Step 2), `docs/specs/APER_KEEPS_PROJECTION_LOSS_SURFACE_2026-08-09.md` §4
**Status**: finding recorded · **no remediation authorized**

---

## 1. The concrete instance

`MemoryAtomSnapshot` (`lib/maia/memoryAtomsLoader.ts:126-151`) is the prompt-shaped view of a `member_memory_atoms` row. It is correct and well-documented **for its purpose**.

It drops three columns that the canonical row carries:

| Dropped | What it carries |
|---|---|
| `memory_scope` | **the consent/relational boundary** — `personal` \| `colab` \| `client` \| `encounter` |
| `source_id` | the source-bridge target — which record this Keep points at |
| `updated_at` | canonical mutation time — the only basis for staleness detection |

For prompt assembly, dropping all three is right. The loader enforces scope **structurally in SQL** before the snapshot is built, so by the time a snapshot exists the boundary has already been honored. Carrying `memory_scope` into the prompt would be redundant.

**The hazard is what happens when that snapshot is used as an input somewhere else.**

APER's `projectKeep` was on track to take `MemoryAtomSnapshot` as its input. It is the obvious type: it is exported, it is prompt-proven, it has the fields a projection appears to need. Had it been used, projection would have had **no access to `memory_scope`** — and therefore no way to distinguish a private personal Keep from a client-scope Keep belonging to a practitioner–client container.

The projection would have succeeded. Every field it read would have been correct. Tests over those fields would have passed. And a relationship-scoped memory would have been exported into an individual's sovereign environment with `visibility: private`, which is not merely incomplete but **affirmatively wrong**.

---

## 2. Why this class of defect hides

**Nothing breaks.** That is the whole hazard.

A convenience representation that drops operational detail — pagination cursors, internal ids, cache keys — degrades loudly when misused: something is undefined, a lookup fails, a type complains. A convenience representation that drops a **governance-bearing** field degrades *silently*. The object remains complete-looking, fully usable, and correct on every axis the new consumer inspects. The missing distinction does not announce itself, because the consumer never knew to ask.

The failure signature:

1. A representation is built for purpose A, where the omission is safe **because purpose A's context already enforced it**.
2. The representation becomes the ergonomic type — exported, documented, proven.
3. A new consumer for purpose B adopts it, reasonably.
4. Purpose B's context does **not** enforce what purpose A's did.
5. The enforcement is gone, and nothing indicates its absence.

Step 1 is where the safety lives, and step 1 is exactly the context that does not travel with the type.

---

## 3. The rule

> **Convenience representations may omit operational detail. They may not silently become authoritative inputs where the omitted fields carry consent, provenance, epistemic, sovereignty, or relational meaning.**

Five categories, and the test is the field's *meaning*, not its usage:

- **consent** — governs whether material may be seen, surfaced, or circulated
- **provenance** — establishes who or what produced it
- **epistemic** — establishes what kind of knowing it is
- **sovereignty** — governs member authority, deletion, or possession
- **relational** — establishes which container or relationship it belongs to

A field in any of these categories is **governance-bearing**. Its absence from a representation is not a size optimization; it is a removed guard.

### 3.1 Corollaries

- **The omission must be visible at the type**, not only in the module that built it. A consumer reading the type definition must be able to see that governance-bearing fields were dropped.
- **A new consumer of an existing representation must check what the original context enforced upstream.** Reuse inherits the fields; it does not inherit the enforcement.
- **When in doubt, project from canonical columns.** A slightly more verbose input type is cheap. A silently unguarded one is not.

### 3.2 What APER did instead

`projectKeep` takes a structural `KeepRow` over the canonical `member_memory_atoms` columns rather than `MemoryAtomSnapshot`, with the reason stated at the type:

> *"Deliberately a structural type over member_memory_atoms columns rather than a reuse of MemoryAtomSnapshot: the loader's snapshot is PROMPT-SHAPED (it drops memory_scope, source_id, and updated_at, all of which projection requires). Reusing it would have silently lost the consent axis."*

Scope is then a **refusal**, not a default: any Keep whose `memory_scope` is not `personal` is refused with code `scope_not_personal`. The projection declines to decide a boundary it is not authorized to decide.

---

## 4. Scope of this finding

**This finding is about the hazard class, not about `MemoryAtomSnapshot` being wrong.** It is not wrong. It is correct for prompt assembly, which is what it was built for and currently the only thing it is used for.

**No remediation is authorized**, and none is proposed here. Specifically not authorized: changing `MemoryAtomSnapshot`, adding fields to it, annotating it, auditing its other consumers, or sweeping the codebase for similar representations.

What is recorded is: the rule (§3), the instance that produced it (§1), and the reason the class is dangerous (§2).

---

## 5. Relationship to adjacent work

This is **adjacent to, and deliberately not merged with**, the silent-degradation investigation emerging elsewhere. That lane concerns systems that continue operating after a component fails. This finding concerns representations that are **fully healthy** while missing a distinction — no failure occurs at any point.

Founder direction, 2026-08-09: **do not collapse the two investigations.** They share a symptom — nothing breaks — and have different causes, different detection methods, and different remedies. Merging them would produce a category that is easy to name and useless to act on.

---

## 6. Candidate next step — not authorized

If this is later taken up: the natural instrument is a **governance-bearing field inventory** — for each memory-adjacent table, which columns fall into the five categories of §3, and which exported representations drop them.

That inventory would compose directly with the Memory Completeness Map (`docs/canon/MEMORY_ECOLOGY_AND_COMPLETENESS_2026-08-09.md` §5), since a layer whose governance-bearing fields are stripped before reaching runtime is a candidate for **behaviorally unused** under that ruling's §2.1 — reachable, executing, and no longer carrying the distinction it exists to carry.

**Recorded as a possibility. Not proposed, not scheduled, not begun.**
