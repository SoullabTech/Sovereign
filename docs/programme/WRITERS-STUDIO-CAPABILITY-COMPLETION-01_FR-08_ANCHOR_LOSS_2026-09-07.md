# WRITER'S STUDIO — CAPABILITY COMPLETION · 01
## FR-08 · SECTION-ANCHOR LOSS — **DEMOTE AND KEEP**

**Founder act** 2026-09-07 **Standing** OPERATIVE
**Answers** `…_NOTES_DECIDE_2026-09-07.md` §5 question B

> **A Note is the writer's thinking beside the writing. Deleting a section must
> not delete the thought merely because the place it was attached to
> disappeared.**

---

## THE RULING

When an anchored section is deleted, the Note **survives and demotes to
manuscript scope.** Its former location remains visible as context, but it is
**not silently reassigned.**

```text
SECTION EXISTS
Note
→ manuscript-owned
→ optionally anchored to section

SECTION DELETED
Note survives
→ section_id becomes NULL
→ remains attached to manuscript
→ retains last-known section heading as historical context
→ no automatic reattachment
```

```sql
section_id uuid REFERENCES manuscript_sections(id) ON DELETE SET NULL
```

**Not `CASCADE`.**

## `anchor_heading`, sharpened

> **It is not a substitute foreign key. It is the last-known human-readable
> context of an anchor.**

While the section exists, the surface **prefers the live section identity**.
After deletion it says something like:

```text
Previously attached to "The Nature of Change"
```

— rather than rendering that heading as though it were a still-live anchor.

## PROHIBITIONS

```text
DO NOT
- delete the Note with the section
- move it automatically to a neighboring section
- infer which new section "probably" replaced the deleted one
- silently reattach it if another section later has the same heading
```

**The writer may explicitly re-anchor it later.** Every prohibition above is a
form of the system deciding, on the writer's behalf, what their thought was
about.

## WHY THIS SEPARATES NOTES FROM KEEPS

```text
KEEP   is OF the writing
       → deleting its source may legitimately destroy or invalidate it
         under its own law

NOTE   is the writer's thought ABOUT or BESIDE the writing
       → loss of location does not erase the thought
```

`manuscript_keeps.section_id` cascades, and that is correct **for a Keep** — a
Keep is an excerpt of that section, and an excerpt of a deleted section is not a
thing. A Note is an excerpt of nothing.

## THE BOUNDARY, WHOLE

```text
manuscript deleted   → Note cascades with the manuscript
section deleted      → Note survives at manuscript level
Work deleted         → living_work_id SET NULL
```

## STANDING

```text
FR-07  scope           RULED
FR-08  anchor loss     RULED
NOTES v1               ENOUGH PRODUCT SEMANTICS TO BUILD
```
