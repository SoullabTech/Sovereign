# REVISION-COLLABORATION-01 — Founder rulings

**Ruled 2026-09-10, on the lane record `REVISION-COLLABORATION-01_LANE_2026-09-10.md`.**

These rulings govern the novel part of the lane — what happens after MAIA proposes.
The proposal-authority and staleness halves are already ratified elsewhere (WS2-05A
structure proposals; BUILD-07A `locateCurrent`) and are not reopened here.

---

## RC-01 — `MODIFY` does not mutate MAIA's proposal

The original proposal is **immutable**. It preserves exactly what MAIA proposed.

```
MAIA proposal
    immutable
    preserves exactly what MAIA proposed
             |
    writer chooses MODIFY
             |
new revision candidate
    derived_from = MAIA proposal
    editable by writer
             |
    writer explicitly applies
             |
         Work changes
```

This is the law already established for structure proposals, carried to prose:
**the historical fact of what the system proposed can never be rewritten after the
fact.**

---

## RC-02 — Authorship and provenance are two different questions

The writer has authority over the resulting revision. That does not make every word
in it exclusively theirs.

⛔ **Both simplistic classifications are refused:**

```
modified proposal = MAIA-authored      NO
modified proposal = writer-authored    NOT NECESSARILY
```

⭐ **A modified proposal is a writer-controlled derivative of a MAIA proposal, and
its provenance must retain that relationship.**

```
proposal_id        P17
proposed_by        MAIA
proposal_text      immutable

candidate_id       C22
derived_from       P17
modified_by        member
candidate_text     mutable until applied

application_id     A31
authorized_by      member
applied_from       C22
```

### At the text level

Where practical, preserve the distinction more accurately still:

```
unchanged words from proposal     MAIA-origin  ·  member-adopted
words changed by writer           member-origin
whole resulting revision          member-authorized
```

That is the provenance truth. ⛔ **If span-level attribution is too much for the
first implementation, do not fake it.** Preserve at minimum:

```
final revision
  derived from MAIA proposal P17
  subsequently modified by member
  explicitly applied by member
```

Finer attribution can then be added later **without corrupting the historical
record** — which is the property that makes deferring it lawful.

---

## RC-03 — The three acts have genuinely different provenance

An exact acceptance must remain distinguishable from a rewrite. It is not recorded
as though the writer wrote the wording themselves.

```
ACCEPT     MAIA proposed these exact words
           member explicitly adopted them

REJECT     proposal preserved
           Work unchanged

MODIFY     proposal preserved
           new writer-controlled derivative created
           writer edits the derivative
           member applies the final result
```

---

## RC-04 — MAIA never edits the writer's candidate in place

MAIA may continue discussing the candidate and may offer another proposal. She may
not silently regain authorship over the object the writer is currently shaping.

> *"Make my version tighter."* → MAIA creates **another proposal, derived from the
> current candidate.** She does not edit the candidate.

The result is a clean alternating chain in which **every handoff remains visible**:

```
Work
 |
MAIA proposal P1
 |  writer modifies
member candidate C1
 |  asks MAIA again
MAIA proposal P2
 |  writer accepts / modifies
 ...
 |
explicit member application
Work
```

---

## The constitutional rule for the novel part

> ⭐ **Modification transfers control, not history. The writer owns what happens
> next; the record continues to remember where the candidate came from.**

---

## Classification — this is a JARVIS application, not a new JARVIS architecture

```
NEW JARVIS ARCHITECTURE     NO
JARVIS APPLICATION          YES
IMPLEMENTATION COMPLEXITY   relatively bounded
EXPERIENTIAL ADVANCE        potentially very large
```

What makes it Jarvis-like is **not** that MAIA is agentic. It is that the work has
continuity and custody:

```
Work
-> MAIA observes / writer asks
-> bounded evidence is retrieved lawfully
-> MAIA makes a proposal
-> proposal remains an inspectable historical object
-> writer accepts / rejects / modifies
-> provenance survives the decision
-> Work changes only under writer authority
-> conversation continues
-> later state can supersede earlier state without erasing history
```

Which maps onto the established division:

```
MAIA remembers the person.
JARVIS remembers the work.
AIN governs what may become context.
```

**Why this instance stays simple.** Full JARVIS coordinates work episodes, task
custody, multiple workers, delegation, evidence gathering, verification,
risk/authority, recovery, cross-session continuity, supersession and routing. This
loop has **one human, one Work, one MAIA, one governed revision chain**, so the
operational flow stays:

```
NOTICE -> DISCUSS -> PROPOSE -> ACCEPT / MODIFY / REJECT -> WORK
```

with Jarvis-grade custody underneath: who proposed what, what text it was based on,
whether it is still current, who changed it, who ultimately authorized it.

### ⭐ The design target

> **Jarvis underneath; almost invisible to the writer.**
>
> *If we make the user operate the provenance architecture, we have failed.* If the
> writer can sit with MAIA and revise Chapter 10 naturally while JARVIS quietly
> remembers the work, the source, the alternatives, the decisions and the lineage —
> that is the mature form of the architecture.

The `MODIFY -> ask MAIA again -> modify again` loop is where this becomes a
next-generation interaction: **neither party silently overwrites the other**, the
system remembers the lineage, and the experience is simply two people working on a
paragraph together.

---

## What this ruling corrects

⚠️ The lane record as first written contained:

> *"`WRITER CAN alter` settles the provenance of a modified proposal. The writer
> editing MAIA's words before adopting them is the writer's authorship."*

**That is superseded by RC-02.** `WRITER CAN alter` settles **authority**, not
**authorship**. The line collapsed two different questions into one and would have
licensed exactly the classification RC-02 refuses. It is marked superseded in place
in the lane record rather than deleted — a record of what was ruled, including what
was ruled wrong.

---

## Standing after this ruling

```
RC-01 .. RC-04              RATIFIED
constitutional rule         RATIFIED
DESIGN                      AUTHORIZED (by this record)
IMPLEMENTATION              NOT AUTHORIZED by this ruling
R1 build                    NOT AUTHORIZED
span-level attribution      OPTIONAL in first implementation,
                            NEVER faked if absent
MERGE                       NOT YET
PRODUCTION                  UNTOUCHED
```
