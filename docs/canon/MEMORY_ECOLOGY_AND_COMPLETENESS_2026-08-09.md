# Memory Ecology and Memory Completeness

**Founder ruling — Kelly Nezat, 2026-08-09**
**Status**: ratified · standing
**Scope**: governs how AIN's memory architecture is assessed, described, and recovered

---

## 0. Record correction (read first)

This ruling was originally issued as an amendment to a *"Lost Capability Recovery Audit."*

**No such audit exists.** A search of the working tree, all of `docs/`, and the full git history across every branch found no document by that name, no filename matching it, and no content matching *"lost capability"* or *"capability recovery."*

**Do not create one retroactively. Do not claim one existed. Do not date one earlier than it was written.** The ruling below is what was actually authored on 2026-08-09; the audit it scopes has not yet been performed.

This ruling **initiates and scopes** the future Lost Capability Recovery Audit. **It is not that audit**, and nothing in it may be cited as a finding about what AIN currently contains.

---

## 1. Continuity is plural

Memory is infrastructure, not a feature flag.

**Remembering is not one act.** Remembering what happened, what the member explicitly marked, what MAIA inferred, what was corrected, what changed developmentally, and what exists inside a relationship are **different kinds of remembering**. They have different sources, different authority, different retrieval behavior, and different failure modes.

**AIN loses intelligence when they are flattened together.** A single generic history stream can hold all of that text while holding none of the distinctions that make it usable — and the loss is invisible, because the stream still returns results.

The target is **not one memory system**. The target is a **coherent memory ecology in which distinct forms of memory remain distinct but interoperable**.

---

## 2. The completeness criterion

The standard is not *"restore useful lost capabilities."* It is:

> **Every memory layer required for continuity, relationship, development, and member authority must exist in the live architecture, with clear provenance and correct governance.**

**All necessary levels of AIN memory are foundational and non-optional.** A missing memory layer is an **architectural deficit**, not a deferred enhancement. It may be sequenced, staged, or scheduled — it may not be reclassified as optional for implementation convenience.

### 2.1 What counts as a deficit

An expected memory layer that is **absent, disconnected, unreachable, or behaviorally unused** constitutes a **memory-completeness deficit until investigated**.

The four conditions are deliberately distinct, and the last two are the ones that hide:

- **Absent** — no implementation exists.
- **Disconnected** — an implementation exists with no caller.
- **Unreachable** — a caller exists, but no runtime path reaches it.
- **Behaviorally unused** — a runtime path reaches it and it produces nothing that affects what MAIA does.

*"The code is there"* is not evidence against a deficit. Neither is *"the table has rows."*

### 2.2 The replacement test

**Do not classify a memory capability as obsolete merely because another generic memory mechanism exists.**

A replacement counts **only if it preserves all six**:

1. the same **epistemic role** — what kind of knowing it carries
2. the same **provenance** — who or what established it, traceably
3. the same **authority** — what the system may do with it
4. the same **retrieval behavior** — when and how it comes back
5. the same **relational function** — what it does inside a relationship
6. the same **developmental function** — what it does across time

Failing any one means the capability was **lost, not replaced**. Semantic search returning similar text is not a replacement for episodic memory. A transcript is not a replacement for a member-marked moment.

### 2.3 Layers that must not be collapsed

These are distinct memory forms and must be assessed separately, never as one history stream:

episodic · developmental · relational · explicit member-marked moments · interpretive · corrections and supersession · decisions · recognitions · encounters

This list is **not exhaustive**. Discovering a further distinct form is a finding, not a scope violation.

---

## 3. Corrigibility is part of the ecology

**A correction must be able to change the future authority of remembered interpretation without requiring historical erasure.**

The member must be able to say *"that reading was wrong"* and have it **stop carrying weight going forward**, without the record of what was thought being deleted. Correction that demands erasure forces a choice between accuracy and history; correction that changes nothing is theater.

Supersession is therefore a first-class memory operation, not a delete with extra steps.

---

## 4. Recovery discipline

**Do not restore historical implementations blindly.** Recover each required memory *function* into the **current architecture and current constitutional rules**.

A capability that existed under superseded governance does not return under that governance. What returns is the function, rebuilt to present canon — including consent gates, provenance requirements, and the constitutional direction of authority.

---

## 5. The Memory Completeness Map

The Map is the **instrument** for establishing what exists, where it lives, whether it is reachable and used, and what has actually been lost. It is not a status dashboard and not a roadmap.

### 5.1 States

Every required memory layer is marked exactly one of:

| State | Meaning |
|---|---|
| **LIVE** | reaching runtime and affecting behavior, with production evidence |
| **PRESENT BUT UNWIRED** | implementation exists, no caller |
| **PARTIALLY LIVE** | reaches runtime on some paths, named explicitly |
| **MISSING** | no implementation |
| **SUPERSEDED BY VERIFIED EQUIVALENT** | replaced, and the §2.2 six-part test is **demonstrated**, not asserted |

**No memory layer may be marked optional.** The vocabulary contains no such state, by design.

`SUPERSEDED BY VERIFIED EQUIVALENT` carries the burden of proof. Absent a demonstrated six-part equivalence, the correct mark is `MISSING` — not "probably fine."

### 5.2 Per-subsystem determinations

For every removed or currently orphaned memory subsystem, the audit determines:

1. **which level/kind of memory** it represents
2. **what unique function** that layer performs
3. **whether that function exists live today**
4. **whether its provenance and authority distinctions are preserved**
5. **whether it participates in current MAIA context/retrieval**
6. **whether member correction can alter its future authority** where appropriate
7. **whether it remains available across sessions** without being flattened into transcript history

Question 7 is the one most likely to be answered wrongly by inspection alone. Transcript availability is not memory availability.

---

## 6. What this ruling does and does not authorize

**Authorizes**: the scoping and eventual performance of a Lost Capability Recovery Audit under the criteria above.

**Does not authorize**: any implementation, restoration, migration, deletion, or wiring. This ruling establishes the standard by which such work would later be judged. It does not commission the work.

**Does not assert**: any claim about AIN's current memory state. Every state claim must come from the Map, produced by the audit, with evidence.

---

## 7. Relationship to existing canon

This ruling **generalizes** a discipline already present in the codebase rather than introducing a foreign one:

- `member_memory_atoms` already refuses to collapse forms — *"An atom is NOT placed in a single category"* — and already forbids system-assigned registers and lenses.
- `docs/canon/CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md` already governs which layer may carry which authority.
- `docs/canon/LONGITUDINAL_MEMORY_CATEGORY_GRADIENT.md` and `docs/canon/MAIA_MEMORY_CANON_v1.0.md` already distinguish memory categories.

What is new here is the **completeness obligation** — that these distinctions must be *inventoried and verified live*, not merely declared in schema and canon.

The standing failure mode this guards against is the one already named in the project anchor as **inverse drift**: *dormant scaffolds get narrative placement; live infrastructure stays invisible until explicitly measured.* Both directions are errors. The Map is the instrument that makes either one visible.
