# WS2-08 · BUILD-08B — MEMBER-CONFIRMED CHAPTER HIERARCHY · opening + census

> **Opened by founder act, 2026-09-06, with clickable chapters as the ACCEPTANCE TARGET.**
> Reclassified in the same act: **08B is a PILOT BLOCKER.** A Work presented as a book cannot ship
> to testers as a flat list of 185 sections.

```text
UNIT          BUILD-08B  MEMBER-CONFIRMED IMPORTED HIERARCHY
STATE         OPEN · census complete · design not yet accepted · no implementation authorized
BLOCKS        Founder Pilot (upload → book-shaped Work)
PRECEDES      08C (split/merge/rename) · 08D (nested WRITE gestures) · 08E (revision-bound ledger)
```

## 1 · Acceptance target (founder wording)

> A Work presents a manuscript outline with chapters as clickable parent nodes, and each chapter
> reveals its contained sections.

```text
▸ CHAPTER ONE — THE BEGINNING
    Section 1
    Section 2
    Section 3

▾ CHAPTER TWO — …
    Section 4
    Section 5
```

```text
navigate to section              ALREADY LIVE
refer to a specific section      ALREADY LIVE
click / select an element        ALREADY LIVE
navigate by chapter hierarchy    08B
chapter → contained sections     08B
expand / collapse                08B
click a chapter                  08B
same hierarchy in WRITE + DEVELOP  08B — "Chapter 4" must mean one thing everywhere
```

## 2 · Census — MOST OF THIS IS ALREADY BUILT

The lane's own 07E lesson applies: read canonical before designing.

```text
BUILT AND CANONICAL
  manuscript_structure_units              20260830000002 — tree: parent_id (NULL = top level),
                                          contiguous sibling position, free-text kind, title,
                                          origin ('member' | 'imported' | 'proposed')
  manuscript_structure_unit_sections      MEMBERSHIP. UNIQUE(draft_section_id) is what makes
                                          "one authored placement per section" true by schema
  lib/manuscript/structure/*              15 modules — structureService · tree · review ·
                                          authorStructure · importedStructure (08A) ·
                                          proposalStore · structureDigest · canonicalFingerprint ·
                                          readScope · maiaReader · evidence
  routes                                  /structure · /structure/read · /structure/proposals ·
                                          /structure/proposals/[id]/adopt
  StructureReview.tsx                     1,479 lines of review surface
  deriveImportedStructure() (08A)         folds heading_depth into ReviewedUnit[]

NOT BUILT — THE ACTUAL GAP
  the outline never reads the hierarchy   grep for structure_units across app/writers-studio/
                                          and components/ → ZERO HITS
  chapter recognition for non-markdown    08A yields 0 units for an ALL-CAPS book (185 caps
                                          boundaries → 0 units, by ruling)
```

⛔ **The flat outline is a RULED CHOICE, not an oversight.** `ManuscriptOutline.tsx:8-14`:

> *part headings — NOT DRAWN. Nothing groups sections into parts. 04's 174 sections would be the
> system authoring their book.*

08B lifts that boundary **only through member confirmation**, never by inference. The reason the
sidebar is flat is the same reason ALL-CAPS is not a chapter.

## 3 · The constraint that does NOT move

⛔ **ALL-CAPS is still not a chapter.** The founder's own manuscript is the proof: 185
capitalization boundaries, and most are not chapters. Reversing that ruling to make tomorrow easier
would be the system authoring the member's book.

Deterministic recognition, in this order:

```text
1  explicit labels          CHAPTER · PART · BOOK · SECTION-as-division, etc.
2  structural heading depth  where the source actually carries it (08A heading_depth)
3  otherwise                 PRESENT likely boundaries FOR HUMAN CONFIRMATION —
                             never silently invent hierarchy
```

Once confirmed, the hierarchy becomes durable manuscript structure (`origin='member'` or a ratified
`'imported'`), and `origin='proposed'` continues to mean *not yet authored* and must not render as
the member's own structure.

## 4 · Bounded job

```text
source sections
→ determine chapter boundaries (§3 order)
→ persist chapter → section membership   (the table exists)
→ render chapters in the manuscript outline
→ expand / collapse
→ click a chapter
→ click a child section
→ the SAME hierarchy in WRITE and DEVELOP
```

## 5 · Not in this unit

```text
✗  08C split / merge / rename commands
✗  08D nested WRITE gestures
✗  08E revision-bound structure ledger
✗  ALL-CAPS promoted to chapter by default
✗  any inferred hierarchy that renders as the member's own
✗  chapter-scoped developmental reading — that is 07G's scope_target, already
   ratified as structure-unit-capable and awaiting its own founder act
```

## 6 · Note for 07G

07G's ratified `scope_target` is already `structure_unit | section_range | whole_work`. **08B is what
makes `structure_unit` selectable by a member.** The two units meet exactly there and nowhere else —
08B does not read, and 07G does not author structure.
