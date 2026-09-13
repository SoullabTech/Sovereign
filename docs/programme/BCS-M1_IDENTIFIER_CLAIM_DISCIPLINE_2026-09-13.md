# BCS-M1 — Identifier Claim Discipline

**Date:** 2026-09-13 · **Branch:** `claude/bold-bohr-pmtynu` · **Base:** `e1c6f527`
**Kind:** ⭐ **Methodological binding. NOT new canon. No build authorization.**
**Recorded before:** D-J9 (which this makes safe to open)
**Records:** `JARVIS-BOUNDED-COGNITION-SUBSTRATE-CENSUS_2026-09-13.md` ·
`JARVIS-ORCHESTRATION-BOUNDARY-01_FOUNDER_RULINGS_2026-09-13.md`

> ## A name is a claim. Its semantic strength may not exceed what the evidence establishes.

---

## 1 · Bind, do not author — verified

BCS-M1 authors nothing. It is the **inward application** of two existing canon instruments to
architecture, code reading, census work and design. Both were read at `e1c6f527` rather than
cited by title — which is itself the discipline:

**`docs/canon/MARKETING_CLAIM_DISCIPLINE.md` already governs internal work**, line 14:

> *"That question is bigger than marketing. It governs every place MAIA is represented: website
> copy, case studies, podcasts, investor decks, roadmap discussions, demos, onboarding, and
> **internal planning**. This is representation discipline, not pitch polish."*

**`docs/canon/CLAIM_STATE_AUTHORITY.md` already states the general form**, line 48:

> *"A sentence asserting a state does not create it. Neither does a merged PR, an approved plan,
> or a well-written record."*

⭐ **BCS-M1 adds only the observation that an identifier is such a sentence.** FR-J3 is the
runtime form of the same rule: `retrieved` may not be promoted into `used`, `contributed` or
`effect`.

The governing question:

> **What must be true for this identifier, relationship, or capability name to remain honest?**

---

## 2 · The recurring failure — four corrections, one structure

```text
NAME / TERM                 WHAT WAS ACTUALLY ESTABLISHED
conversation_memory_uses    retrieved candidates, recorded before selection
"consumer"                  a file containing a function with the same method name
"resumability"              crash recovery OR partial-computation resume
"dependency"                execution dependency OR epistemic dependency
```

In each case the name asserted a relation **stronger, broader, or more specific** than the
observation established.

⭐⭐ **The error is not imprecise vocabulary. Once accepted, the stronger word becomes
architectural evidence:**

```text
name → assumed capability/relation → design premise → schema / API / implementation
```

> **A naming error can manufacture architecture.**

---

## 3 · Named failure — **semantic promotion by naming**

> A weaker observation may not acquire a stronger relation merely because an identifier,
> document heading, variable, table, or architectural noun says that it has.

---

## 4 · Review test

1. What exact **predicate** does this name assert?
2. What **observation** establishes that predicate?
3. Does the evidence establish only a **weaker** predicate?
4. Does the word **conceal more than one** independent responsibility?
5. Would **removing the name** and describing the behavior change our conclusion?

⭐ **If (5) is yes, the name has become evidence. Stop and inspect the behavior directly.**

---

## 5 · Decomposition rule

> Where one term covers independently falsifiable responsibilities, **split the responsibilities
> before reasoning from it.**

```text
"resumability" → crash recovery · partial-computation resume
"dependency"   → execution dependency · epistemic dependency
```

⭐ The narrower predicates may later be grouped **for explanation**. ⛔ They may not be grouped
**before their individual existence is established.**

---

## 6 · Relationship names require relationship evidence

Shared vocabulary, adjacency, common method names, grep-discovered imports, or conceptual
similarity establish nothing.

```text
same method name        ≠ consumer relationship
same table family       ≠ shared substrate
runs before another job ≠ epistemic dependency
material retrieved      ≠ material contributed
```

---

## 7 · Capability names require capability evidence

Possession of some necessary mechanisms does not establish the whole capability.

```text
attempt counter + lock timestamp  ≠ crash recovery
crash recovery                    ≠ partial resume
job completion                    ≠ epistemic result
model execution                   ≠ participation
participation                     ≠ authority
```

⭐ The last two are FR-J2 restated — which is why this is a binding rather than a new rule.

---

## 8 · Architectural nouns receive no presumption

> **A noun does not prove the object it names exists.**

Applies directly to **FR-J6**:

```text
"orchestration layer" ≠ orchestration object
"bounded cognition"   ≠ one bounded-cognition service
"job substrate"       ≠ one canonical jobs table
```

⭐ **Responsibilities are established first. Components follow only where those responsibilities
require them.**

---

## 9 · Falsifier

> A census, design or review **fails** this discipline when its conclusion would become weaker
> if the named thing were replaced by the exact behavior actually observed.

Worked example from this lane: replacing

```text
"consumer"  →  "file containing a function with the same method name"
```

changes the conclusion. ⭐ **Therefore the relationship was never established.**

---

## 10 · Methodological line

```text
Describe first. Name second. Generalize last.
```

And where a name already exists:

> **Treat the name as a hypothesis until the behavior proves the relation it asserts.**

---

## 11 · Preflight rule carried into D-J9

> ⭐ **Every proposed field, type, status, table or API verb must state the predicate its name
> claims before the design is accepted.**

Words already known to need this, from the repaired census:

```text
finding · checkpoint · result · stale · cancelled · depends_on · authorization_basis
```

⛔ Each would otherwise quietly become architecture.

---

## 12 · Standing

```text
KIND            methodological binding · NOT canon · authored nothing
ADDS            no architectural object, state, classifier or runtime rule
BINDS           MARKETING_CLAIM_DISCIPLINE (internal planning, line 14) +
                CLAIM_STATE_AUTHORITY (line 48) to programme investigation and design
RUNTIME FORM    FR-J3 (semantic promotion) · FR-J2 (execution ≠ participation ≠ authority)
D-J9            SAFE TO OPEN — not opened by this document
BUILD           NOT AUTHORIZED · no code · no schema · no lane
```

> **Semantic precision is not documentation quality here. It is part of the sovereignty
> boundary** — because the words a system uses about a person's material decide what the system
> is later entitled to claim about it.
