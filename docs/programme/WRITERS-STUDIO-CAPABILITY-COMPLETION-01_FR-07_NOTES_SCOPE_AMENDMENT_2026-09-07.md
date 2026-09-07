# WRITER'S STUDIO — CAPABILITY COMPLETION · 01
## FR-07 · AMENDMENT TO THE NOTES SCOPE RULING

**Founder act** 2026-09-07 **Standing** OPERATIVE
**Amends** the Notes v1 block (FR-02 line `SCOPE: Work-level`) and the
`FIELD-MAP`-adjacent framing of Notes as *"thinking beside the Work"*
**Occasioned by** `…_NOTES_DECIDE_2026-09-07.md` §5 question A

> **Recorded as an AMENDMENT, deliberately.** The design document marked one
> option "Recommended"; a recommendation must not be allowed to quietly
> overwrite a prior ruling. The earlier formulation was not wrong to have made —
> implementation reality exposed a contradiction inside it, and the founder is
> resolving that contradiction rather than letting the code choose.
>
> **The R&D did its job here.**

---

## 1 · WHAT IS AMENDED

```text
SUPERSEDED   SCOPE  Work-level, optionally anchored to a section

OPERATIVE    PRIMARY ANCHOR        manuscript
             OPTIONAL CONTEXT      Work, when exactly one Work is declared
             OPTIONAL LOCAL ANCHOR section
```

**Manuscript-scoped; Work-context recorded when unambiguous.**

The wording refinement is load-bearing and is not cosmetic — it exists so that
manuscript-scoping cannot be misread as making a Note part of the manuscript:

```text
NOTE
belongs BESIDE the manuscript
≠ belongs INSIDE manuscript content
```

## 2 · THE CONCEPTUAL CORRECTION

The earlier phrase — *"mutable thinking beside the **Work**"* — was
directionally right and too narrow. Refined:

> ### A Note is the writer's mutable thinking beside the **writing**.

When a Work relationship is clear, preserve it. **But the writer does not need
to have solved the Work relationship before being allowed to think.**

The three objects stay clean, and now on one axis:

```text
KEEP             preserved state of writing
NOTE             mutable thinking beside writing
MATERIAL: note   something brought into the writing as source/reference
```

## 3 · WHY

**"Put it somewhere immediately" is more fundamental than Work membership.**
A writer must be able to catch a thought in all three Canvas states:

```text
no Work declared    → Note still works
exactly one Work    → Note works, and records that Work context
ambiguous Works     → Note still works, without forcing resolution
```

The rejected options made **thinking contingent on product administration** —
recreating the exact shape D4 repaired this morning: the writer has something to
do, and the software demands they resolve its ontology first.

> **A Note should be more primitive than that.**

## 4 · WHAT IS UNCHANGED

Everything else in the Notes v1 block stands: member-authored · not manuscript
content · not a Keep · not Material · MAIA may not silently author, modify,
interpret or promote a Note · no automatic memory standing · excluded from
manuscript export · durable until the member edits or deletes it (therefore **no
version history** — mutable in place).

## 5 · STANDING

```text
QUESTION A (scope)        RULED — this amendment
QUESTION B (anchor loss)  STILL OPEN — what becomes of a Note when the section
                          it is anchored to is deleted
BUILD                     BLOCKED on B: the ruling is the FK clause on
                          writer_notes.section_id, and picking it in code would
                          be the implementation choosing a product semantic
```
