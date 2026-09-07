# WRITER'S STUDIO — CAPABILITY COMPLETION · 01
## NOTES v1 — DECIDE (design of record)

**Opened by** founder act, 2026-09-07 — *Notes next, as a product sequence, not
a complexity sequence.*
**Bound by** FR-02 (three distinct objects) and the founder's Notes v1 block
**Status** DESIGN. **Not built.** Question A is RULED (FR-07 amendment);
**question B stands open** and blocks the migration.

> **Before Studio tells the writer more about the Work, give the writer
> somewhere to think with the Work.**

**The acceptance question, in the founder's words:**

> *Can I be writing a section, have a thought I do not want in the prose, put it
> somewhere immediately, and find it again naturally?*

---

## 1 · HARVEST — what the recovered record already settles

Notes is **not** unspecified territory. The v2 record places it twice:

| source | what it settles |
|---|---|
| `DECISIONS.md` **D-019** | Notes sits in the **WORK SPACE** band — `Home · Manuscript · Materials · Structure · Notes · Versions · Goals`. Read from `04-writing-field-wide.png`, normative chrome. |
| `FUNCTION-PLACEMENT.md` §2 (WS2-10) | *"Each surfaces **inside the mode where it is needed** — none becomes a sixth mode. … **Notes and Research in WRITE**."* |
| `CAPABILITY-MAP.md` | listed among known gaps — **unbuilt, never un-intended** |
| `CAPABILITY-COVENANT.md` 5 · 9 · 12 | provenance must distinguish what the writer **wrote** from what MAIA **proposed**; material may influence the Work without becoming it; authorship stays explicit |

**Consequence: Notes is an `in-room` panel in the WRITE room (the Canvas), not a
route.** That is the capability state D1 introduced this morning, and it fits
without inventing anything: the rail already carries `notes` in the work band.

**No second implementation is needed.** The panel pattern (`StudioPanel`), the
column model, the rail hosting contract and the `in-room` projection all exist.

## 2 · WHAT NOTES IS NOT — the three objects, kept apart (FR-02)

```text
KEEP             preserved state of the writing      manuscript_keeps, verbatim, immutable
NOTE             mutable thinking beside the Work    NEW
MATERIAL: note   source brought into the Work        living_work_materials, kind='note'
```

They overlap only because all three may contain text. Kept apart in substrate,
not merely in naming: a Keep is **verbatim and re-verified**, a Material carries
**arrival provenance**, a Note is the writer's own **mutable** sentence and
carries neither.

## 3 · BOUND, AS RULED

```text
PURPOSE      mutable thinking beside the WRITING          ← refined by FR-07
AUTHOR       member
SCOPE        SUPERSEDED: Work-level, optionally anchored to a section
             OPERATIVE (FR-07):
               primary anchor        manuscript
               optional context      Work, when exactly one is declared
               optional local anchor section
             A Note belongs BESIDE the manuscript, never INSIDE its content.
NOT PROSE    does not alter the manuscript
NOT A KEEP   does not represent a preserved manuscript state
NOT MATERIAL does not become source material merely by existing
MAIA         may not silently author, modify, interpret or promote a Note
MEMORY       no automatic memory standing
EXPORT       not included in manuscript export
DURABILITY   durable until the member edits or deletes it
```

**Deliberately absent from v1**, and each absence is a decision: folders · tags ·
backlinks · AI summaries · notebooks · colour systems · search ranking ·
sharing · a mini-Notion. *If Notes can answer the acceptance question
beautifully, it earns its room.*

**"Durable until the member edits or deletes it" settles one thing outright:** a
Note has **no version history**. It is mutable in place. Keeps are where
preserved states live, and giving Notes a second revision substrate would blur
exactly the boundary FR-02 drew.

## 4 · CANDIDATE SUBSTRATE

```sql
CREATE TABLE writer_notes (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id      uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  -- scope: see OPEN QUESTION A
  -- FR-07: the manuscript is the PRIMARY anchor and is required; the Work is
  -- optional context, recorded only when exactly one Work declares it.
  manuscript_id  uuid NOT NULL REFERENCES member_manuscripts(id) ON DELETE CASCADE,
  living_work_id uuid          REFERENCES living_works(id)       ON DELETE SET NULL,
  -- anchor: see OPEN QUESTION B
  section_id     uuid     REFERENCES manuscript_sections(id) ON DELETE SET NULL,
  anchor_heading text,     -- where it was anchored, as it read at the time
  body           text NOT NULL CHECK (length(trim(body)) > 0),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
```

Surface: `POST` / `PATCH` / `DELETE` / `GET` under the member-scoped sovereign
API, a `notes` column in the Canvas, `notes` moved to `in-room` in `STUDIO_MAP`,
and `'notes'` added to the Canvas's hosting list. Counts on the rail become real
(the map's reference `12` is stripped at the shell boundary today and stays
stripped until the shell counts actual notes).

## 5 · THE TWO OPEN QUESTIONS

### A · RULED by FR-07 — manuscript-scoped, Work-context when unambiguous

*Kept below as the reasoning that produced the amendment.*

Work-level scope collides with the Work context the Canvas actually has

`SCOPE: Work-level` is ratified. But the Canvas resolves Work context in three
states, and **two of them have no single Work**:

```text
none        no Work declares this manuscript        → no Work to scope a note to
work        exactly one                             → fine
ambiguous   declared in several (correct per D-018) → the Studio names no Work
```

A strictly Work-scoped Note is therefore **untakeable in two of three states** —
and that is the same lockout shape repaired this morning in D4, where a member
in the `ambiguous` state could not reach MAIA. It also fails the acceptance
question directly: *"put it somewhere immediately"* is false if the writer must
first resolve a declaration.

### B · What happens to a Note when what it is anchored to disappears

`manuscript_keeps` cascades on `section_id`: delete the section, lose the Keep.
Correct for a Keep — it is an excerpt **of that section**. A Note is not an
excerpt of anything; it is the writer's own thought, and a section can vanish
through an ordinary prose edit the writer makes for unrelated reasons.

**Recommendation on both** — stated so the founder rules on a concrete thing,
not an abstraction:

- **A** — scope a Note to the **manuscript on the table**, and record the Work
  when exactly one is declared. The Note is always takeable; it still belongs to
  the Work whenever the Work is known; and a Work-level view remains derivable.
  *Nothing is lost from the ratified intent — a Note beside the Work — except
  the requirement that the Work be unambiguous before the writer may think.*
- **B** — a deleted section **demotes** its Notes to manuscript-level and keeps
  `anchor_heading` as the record of where the thought was. *Destroying a
  member's thinking as a side effect of a prose edit is the kind of silent loss
  this project exists to refuse.*

## 6 · STANDING

```text
HARVEST      COMPLETE — placement and band are ratified, not invented
DESIGN       this document
QUESTION A   RULED — FR-07 amendment
QUESTION B   OPEN
BUILD        BLOCKED on B
DEPLOY       NOT AUTHORIZED
CEILING      untouched — Notes needs no expansion of MAIA perception
```
