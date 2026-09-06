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

---

## 7 · Bounded design — founder-stated 2026-09-06 · ACCEPTANCE NOT YET SUPPLIED

### 7.1 Recognition, narrowed by the census

The 185-section census gives a cleaner target than "infer likely ALL-CAPS boundaries." The Work
contains a coherent authored run of explicit numbered chapter labels:

```text
Chapter 1  pos 8     Chapter 6   pos 75
Chapter 2  pos 12    Chapter 7   pos 89
Chapter 3  pos 25    Chapter 8   pos 104
Chapter 4  pos 38    Chapter 9   pos 118
Chapter 5  pos 46    Chapter 10  pos 132
```

Duplicate / reset chapter headings also exist elsewhere in the source — **which is exactly why
confirmation remains necessary.** 08B needs no general-purpose semantic chapter inference.

```text
explicit numbered chapter labels
→ detect coherent ordered runs
→ if more than one plausible run, or duplicate labels, exist
→ present candidate hierarchy
→ MEMBER CONFIRMS
→ only then persist / render as authored structure
```

⛔ ALL-CAPS remains irrelevant as authority.

### 7.2 The load-bearing separation

> **The outline reads persisted structure. It never runs chapter recognition itself.**

```text
recognition    PROPOSES
member         AUTHORS (confirmation)
persistence    RECORDS
WRITE + DEVELOP  RENDER
```

This keeps the sovereignty boundary clean and stops two UI surfaces from independently deciding what
the book is.

### 7.3 Scope

```text
IN
  explicit numbered chapter-run recognition
  existing proposal / confirmation path
  existing structure persistence
  outline reads the persisted authored tree
  chapter parent rows
  expand / collapse
  chapter click → first contained section
  section click → existing navigation
  ungrouped sections remain visible
  the SAME persisted hierarchy in WRITE + DEVELOP

OUT
  fuzzy semantic chapter inference
  ALL-CAPS-as-chapter
  schema changes
  08C / 08D / 08E
  07G reading implementation
  any manuscript text change
```

### 7.4 Acceptance target — Elemental Alchemy

```text
proposal              Chapter 1 → Chapter 10 candidate shown
before confirmation   NOT represented as the member's authored hierarchy
after confirmation    10 clickable chapter parents
                      chapter expands to contained sections
                      chapter collapses
                      chapter click opens the first section
                      child click opens that section
                      front / back / unassigned material remains visible
                      reload preserves the hierarchy
                      WRITE and DEVELOP agree
                      every section accounted for EXACTLY ONCE
                      manuscript characters unchanged
```

## 8 · Census packet — to be established BEFORE implementation

Six questions, so implementation receives a packet rather than an investigation:

```text
1  every ManuscriptOutline caller
2  the exact GET /structure response shape
3  how draft-section ids map to existing outline rows
4  where DEVELOP gets its navigation
5  the existing proposal / adopt invocation path
6  the minimum test files to extend
```

## 8b · Design sharpened — founder, 2026-09-06

### 8b.1 Recognition surfaces EVERY coherent run — it never chooses

```text
· detect ALL coherent explicit numbered chapter runs
· two coherent runs → surface BOTH
· do NOT rank by position
· do NOT silently choose the "best"
· do NOT merge runs
· ALL-CAPS alone remains non-authoritative
```

Choosing between plausible runs is authoring. It belongs to the member.

### 8b.2 Confirmation shows CONSEQUENCE, not just candidates

```text
candidate A     chapters 1–10
                sections that WOULD become grouped
                sections that WOULD remain ungrouped

candidate B     chapters 1–10
                the same consequence disclosure

member chooses one → only then author / persist
```

⛔ *"~50 chapter-labelled sections will remain Ungrouped"* must be visible **before** the act. Shown
afterwards it reads as lost structure; shown before, it is an informed choice.

### 8b.3 Rendering authority — the component never reinterprets origin

```text
structure query boundary
  INCLUDE   origin = 'member'
  INCLUDE   accepted / authoritative imported structure
  EXCLUDE   origin = 'proposed'

component
  receives ONLY renderable authored structure
  does NOT reinterpret origin
```

The filter lives in the query. A component that can see `proposed` rows is a component that can be
made to render them.

### 8b.4 No dead clickable rows

```text
unit with ≥ 1 contained section
  expandable
  title click → first contained section

unit with 0 contained sections
  still rendered as authored structure
  NOT a navigation target
  NO click affordance
  may expand only if it has child units
```

### 8b.5 Acceptance, stated exactly

> **Every draft section appears exactly once — beneath an authored structure unit, or visibly
> Ungrouped.**

⛔ NOT *"everything must belong to a chapter."* A book has front matter, back matter and material
its author never chaptered; the outline must show that honestly rather than force it into a
hierarchy.

WRITE and DEVELOP consume the SAME persisted authority. Neither independently recognizes anything.

## 9 · Authority state

```text
08B opening                   RECORDED
08B census                    COMPLETE (§2)
08B design                    SHARPENED (§7 + §8b) — READY FOR FOUNDER ACT
implementation authority      NOT SUPPLIED
```

**Sequencing (founder, 2026-09-06 — CORRECTED).** An earlier draft of this line said "the two open
branches" on a mistaken assumption about which PRs were open. The real pre-cohort stack is THREE
executable changes, ordered by the LITERAL TESTER ROUTE rather than by PR number:

```text
1  #1244      chore/writers-studio-beta-readiness — containment + gate corrections
2  198bbf44   passkey admission + /api/invites authorization (branch, NO PR)
              → ahead of #1245 because /begin → /test-elemental IS the first leg:
                it governs WHO CAN BECOME A MEMBER
3  #1245      chore/colab-beta-01-team-bound-invites — Co-Lab destination binding,
              which applies only AFTER membership exists
4  08B        this unit — design custody only, stood down
```

⚠️ **Operational prerequisite for (2).** The admission repair makes registration require a real
pending invite, and production holds ZERO invite rows. Real invites must be issued before or
immediately after that deploy, or no tester can register at all.

*A witnessed cohort surface is worth more tomorrow than a fourth branch containing unwitnessed
chapter UI.*

**Note on surface.** #1244 places DEVELOP outside the beta tester surface (WRITE + canvas +
Keep-a-version + Co-Lab). The chapter outline is WRITE — so 08B is INSIDE the tester surface, not
deferred scenery.

The founder act that would move this is one sentence: *I accept the bounded 08B design as stated and
authorize implementation.* Until then §7 is a proposal, not a contract.
