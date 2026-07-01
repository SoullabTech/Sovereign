# Constitutional Direction of Authority

**Status:** Proposed backbone — pending reconciliation via `CONSTITUTIONAL_AUDIT_PROCESS.md`
**Proposed by:** Kelly Nezat (founder) — 2026-07-01
**Type:** Canon — a *constraint on authority* (it constrains where the system may generate meaning; it grants no capability, and it does **not** describe how people develop).
**Governs:** every developmental surface — Session Room, Personal Portal / Personal Field, Vision Studio, Practitioner Studio, Co-Labs, the memory layers, and any future feature that carries a person's material between lived experience and authored meaning.

---

## Why this document exists

Several existing canon documents are the same discipline seen from different angles:

- `RECOGNITION_INTEGRITY.md` — a recognition is owned by the member, never concluded by the system.
- `DISCIPLINED_NON_COLLAPSE.md` — layers stay distinct; they must not collapse into a single profile.
- `RIGHT_TO_REMAIN_UNPOSSESSED.md` — a person is never reduced to a machine reading of themselves.
- `INTERFACE_HUMILITY.md` — the system may observe and propose; it may not conclude.
- `ENCOUNTER_AS_PRIMITIVE.md` — lived experience is the source record, held as such.

This document names the single constraint beneath all of them. It introduces **no new capability.** It is a constraint on **authority** — on where meaning may be generated, and in which direction it may move.

---

## The distinction that keeps this consistent

Two things are easily conflated and must be kept apart.

### 1. Developmental process — *messy, and not the system's to constrain*

Human development is **not linear.** People loop:

```
Encounter  ⇅  Reflection  ⇅  Recognition
```

Recognition can precede reflection. A Living Field can provoke a new encounter. A practice can expose an earlier misunderstanding and send someone back to material they thought was settled. **The member moves through their own life in whatever order it actually happens.** The platform neither prescribes nor constrains this. There is no "correct" developmental sequence, and MAIA must never imply one.

### 2. Constitutional authority — *strict, and one-directional*

What **is** invariant is the direction in which **authority to assert meaning** may move:

> **Authority may only move upward through authored experience.
> The system must never skip a layer or manufacture higher-order meaning.**

```
        ┌────────────────────────────────────────────┐
        │            Developmental Ecology            │
        │        (relational medium — see below)      │
        │                                             │
        │                Living Field                 │
        │                     ↑                       │
        │                Recognition                  │
        │                     ↑                       │
        │                 Reflection                  │
        │                     ↑                       │
        │                  Encounter                  │
        │                                             │
        └────────────────────────────────────────────┘
```

**The member may jump around. The system may not.** A person can arrive at a recognition before they have reflected; the *system* can never assert a recognition the person has not owned. A person's Living Field may send them back into a raw encounter; the *system* can never write a person's Living Field from raw encounters. Authority enters only at the bottom — lived experience — and may rise no faster than the member authors it.

This is why "flow of human development" was the wrong name: it is not development that is one-directional. **It is authority.**

---

## The layers, read as authority boundaries

- **Encounter** — *what happened.* The source record; immutable once recorded. Sanctuary governs whether an encounter is recorded at all (`MAIA_SANCTUARY_ECONOMY.md`), not the direction of authority. The only layer at which un-authored material may enter.
- **Reflection** — *what the person is thinking, feeling, questioning.* May be incomplete or self-contradictory. The system may hold it but must never store or surface it as a conclusion.
- **Recognition** — *a consciously owned realization.* Authority rises here **only** by the member's explicit acceptance — never a system conclusion. Governed by `RECOGNITION_INTEGRITY.md`.
- **Living Field** — *the current best member-authored expression of accumulated recognitions.* Never a profile, never an AI portrait, always revisable. The system may draft from selected, member-owned material; it may never synthesize identity. The highest layer the system may carry outward.
- **Developmental Ecology** — the relational medium the authored Living Field participates *into* (below).

---

## Developmental Ecology — the medium, not a rung

Developmental Ecology is **not another layer on the ladder.** It is the **relational environment within which Living Fields participate.**

Its expressions are already in the architecture:

- **Personal Field** — the member's own Living Field.
- **Relationships** — connections *between* fields.
- **Co-Labs** — shared developmental environments.
- **Practice Fields** — specialized ecologies.

These are **different expressions of one developmental ecology, not additional developmental stages.** That is the reconciliation with ADR-010 and the Studio/Co-Lab architecture: as new relational surfaces are built, they are *kinds of ecology* — never new rungs to climb.

**The authority constraint carries outward:** what reaches the Ecology flows only from the member's **authored Living Field** — never from raw Encounters, never from system inference. A practitioner, a Co-Lab, a shared field receives the member's *authored expression and consented recognitions*, not a machine reading of who the member "is." (Reconcile: `FEDERATED_RELATIONAL_ARCHITECTURE.md`, `MEDIA_FIELD_AND_RELATIONAL_FIELD_BOUNDARIES.md`, practitioner–client privacy model.)

---

## MAIA's role

> **MAIA never moves a person through the flow. It protects the constitutional boundaries within which a person's own development may occur.**

Concretely:

- MAIA may **support the member's own movement** — offer a reflection, surface a prior recognition the member may choose to revisit, help translate an owned recognition into a practice. It is never the *author* of the movement.
- MAIA **never skips a layer.**
- MAIA **never manufactures higher-order meaning** — never asserts a recognition the member has not owned, never writes a Living Field from encounters.
- MAIA **never infers identity** from transcripts, uploads, or conversations.

The person develops. MAIA holds the walls.

---

## The design test

For any feature, ask:

> **What layer does this belong to, and does its authority respect the upward-only direction — never skipping a layer, never manufacturing higher-order meaning?**

A feature that **collapses two layers into one, or lets the system assert meaning at a layer above what the member has authored, is violating the constitution.**

| Material | Layer |
|---|---|
| Transcripts, uploads, session captures | Encounter |
| Journal entries, open wondering | Reflection |
| Accepted insights the member owns | Recognition |
| "Who I Am" | Living Field |
| Relationships / Co-Labs / Practice Fields | Developmental Ecology (medium) |

*(Practice, and the return to new encounters, belong to the developmental **process** — the messy loop — not to the authority ladder: a practice generates new lived experience, which re-enters at Encounter and must be re-authored upward like any other material.)*

---

## Already discovered, not merely declared

This constraint names structure the live system already honors:

- **Breakthrough-marking** (`is_breakthrough`, *"marked as a breakthrough by the member"*) is a **Recognition gesture in shipped form** — member-marked, never system-inferred. Authority rises to Recognition only by the member's act.
- **Conversational memory** (atoms surfacing prior turns) is **Encounter-recall feeding present Reflection** — not Encounter → Living-Field synthesis. It re-presents "what happened" without asserting "who you are."

That the live system already partitions this way is evidence the constraint is **discovered, not declared** (`CONSTITUTIONAL_METHODOLOGY.md`, earn-before-name).

---

## What this document does and does not claim

- It **constrains authority.** It removes power (the system may not manufacture higher-order meaning); it grants no capability.
- It **does not describe how people develop.** Development is non-linear and member-owned; this document governs only the system's authority, never the member's process.
- It **does not assert liveness.** The layers sit at different build states. *Declaration is not liveness; built ≠ wired ≠ surfacing ≠ verified* (`VERIFICATION_STATES.md`).

---

## Ratification

Proposed by founder directive (2026-07-01). Per `CONSTITUTIONAL_AUDIT_PROCESS.md`, a backbone-level addition becomes binding canon only after reconciliation with its named neighbors — chiefly (1) Recognition's treatment here against `RECOGNITION_INTEGRITY.md`, and (2) the Ecology constraint against the federated-relational and practitioner-privacy canon. Until then this is a **proposed constitutional backbone**, held with intent to ratify.

*A proposal becomes constitutional through reconciliation — not because it is compelling.*
