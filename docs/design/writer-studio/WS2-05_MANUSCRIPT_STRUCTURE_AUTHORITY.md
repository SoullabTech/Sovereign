# WS2-05 — Manuscript Structure Authority

**Status:** SETTLED. **WS2-05A (Authorial Structure) authorized** 2026-08-30.
WS2-05B (Proposed Structure) NOT authorized.
**Predecessor:** WS2-04B (section-aware WRITE path, PASS · founder-witnessed locally)
**DESKTOP_SEAM_CHANGED:** NO (proposed; this unit introduces a read surface the
Desktop does not consume today, and changes no existing seam field)

04B made the manuscript safely writable in parts. WS2-05 should make those
parts intelligible as a Work — without letting a persistence boundary author
the book.

---

## Rulings (Kelly, 2026-08-30) — settled

```text
STRUCTURE UNIT
belongs to:       MANUSCRIPT / WORK
authored by:      member | mechanically-proved import | proposal
contains text:    NO

MEMBERSHIP
points to:        current draft-section UUIDs
meaning:          direct leaf placement
replacement:      never silently remapped

WRITING SUBSTRATE
belongs to:       working draft
authority over:   characters and save boundaries
interprets book:  NEVER

SECTION URL
identity:         stable draft-section UUID
history:          replaceState

EXISTING BOOKS
proved hierarchy: NONE
choices:          organize myself | help find possible divisions

FUTURE IMPORTS
proved hierarchy: possible only after forward provenance-preservation cut
third choice:     use structure found in original
```

**1. Structure attaches to the manuscript.** Attaching it to
`manuscript_working_drafts` would make an authored statement — *this book has
three movements* — contingent on a particular technical representation of the
text. Wrong direction of authority.

```text
structure unit   = durable authorial meaning
membership       = where that meaning currently lands in this draft
draft section    = current persistence boundary
```

**Draft-replacement rule, stated now and left dormant.** A new working draft
may never silently inherit old structure membership. The unit tree survives,
because it belongs to the manuscript; its memberships must then be either
mechanically remapped *with proof*, or left visibly unresolved until the
member places them. No fuzzy matching, no title matching, no positional
guessing, no "probably the same chapter." There is currently one durable
working draft per manuscript, so **WS2-05A adds no machinery for draft
replacement** — the rule is recorded, not built. That preserves the ontology
without paying for a lifecycle that does not exist.

**2. `replaceState`.** A section click changes place within the Work, not
browser-level destination. Back should mean *leave this place*, not *retrace
the 37 sections I happened to inspect*. `pushState` would turn browsing a
manuscript into synthetic browser history — not useful history, interaction
residue.

```text
section navigation          replaceState
different manuscript/route  normal navigation history
```

**3. Two choices, not three — and stricter language.** The future third choice
is **not** "Use the structure already present." It is **"Use the structure
found in the original."** *Already present* is ambiguous: the database does
have headings and sections, and this spec establishes that those do not prove
hierarchy. The phrase must point back to provenance.

**4. Membership is direct leaf placement.** `manuscript_structure_members`
records direct membership in the **lowest authored structural unit** containing
that writing section. Ancestor membership is derived through `parent_id`; the
same draft section is never redundantly joined to both Chapter and Part. That
keeps `UNIQUE (draft_section_id)` valid and prevents two competing
representations of hierarchy.

**5. Two internal cuts.** Prove that a human can author structure safely before
giving the system the ability to propose it. 05A does not counterfeit the
second door before 05B exists.

| Cut | Contents | Status |
|---|---|---|
| **05A — Authorial Structure** | tables · zero-character invariant · create/name/group/nest/reorder/delete · unplaced sections · hierarchical outline · `?s=` place persistence | **AUTHORIZED** |
| **05B — Proposed Structure** | MAIA analyzes · proposals outside the canonical outline · per-unit adoption · `adopted_from_id` provenance | not authorized |

**Acceptance for 05A:** one real restructuring operation witnessed on the
174-section book, proving the defining property — *the book becomes more
intelligibly organized while the flattened manuscript remains byte-for-byte
unchanged.*

---

## 0. The governing distinction

```text
SOURCE STRUCTURE      what came in
WRITING UNITS         the draft sections that make safe independent saving possible
AUTHORIAL STRUCTURE   how the writer says this Work is actually divided
```

These are three ontologies that the current UI collapses into one list. A
draft section is a **persistence boundary**. It must not become a "chapter"
because the outline needed something nicer to render. That would let a
database implementation detail author the book.

**The ruling this spec implements:** structure is an *authored layer over* the
section-addressable draft, never a destructive repartition of it.

---

## 1. A finding that changes the shape of the first product question

Kelly's proposed opening offers three choices, the first being *"Use the
structure already present — only when the system can prove one."*

**For every manuscript in the system today, that option is not offerable.**
Not because the proof is hard, but because the structure was never recorded.

- `manuscript_sections` (`20260721000003_press_manuscript_room.sql:37`) is
  flat: `position`, `heading text`, `body`. There is no level, depth, kind, or
  parent column, and no later migration adds one.
- The ingest segmenter (`lib/manuscript/ingest/segment.ts:40-47`) matches
  three different heading classes with one regex —

  ```ts
  /^(#{1,3}\s+.+|[Cc]hapter\s+\w+.*|[A-Z][A-Z0-9 ,'&\-—:]{3,80})$/
  ```

  — and then writes `raw.replace(/^#{1,3}\s+/, '')`. Markdown depth **existed
  at ingest and was discarded.** `#`, `##`, `###`, a `Chapter Four` line, and
  an ALL-CAPS line all arrive in the database as the same undifferentiated
  `heading` string.

So the honest position for v1:

> There is no mechanically proved import structure for any existing
> manuscript. The "adopt what's already there" path has nothing to adopt.
> Offering it anyway would be manufacturing the very thing this unit exists
> to prevent.

Two consequences:

1. **v1 ships two choices, not three** — *I'll organize it myself*, and
   *Help me find possible divisions* (suggestions, never mutations). The third
   appears only for manuscripts whose import actually recorded hierarchy, and
   it is worded **"Use the structure found in the original"** — pointing at
   provenance, not at what the database happens to hold (ruling 3).
2. **A separate, small, forward-only cut** should make the segmenter record
   what it already knows — heading class and markdown depth — so that
   *future* imports have a provable structure to adopt. That is not WS2-05.
   It is named here so the gap is on the record and does not get discovered
   again in six months. It changes no existing row.

**And a trap to name explicitly:** the segmenter *already* uses
`[Cc]hapter\s+\w+` — but that match proves only that a line *started a
section*. It does not prove the line names a chapter in a hierarchy, and it
says nothing about whether the ALL-CAPS lines beside it are chapters too. A
heading containing "Chapter" is not provenance. It is a string.

---

## 2. The authority ladder

```text
mechanically proved import structure
        → may be adopted without invention
        → currently EMPTY for all manuscripts (see §1)

member-declared structure
        → authoritative

system/MAIA proposed structure
        → suggestion only
        → becomes authoritative only through a member act
```

This is a property of every structural unit, not a mode of the room. Proposed
units and authored units coexist in the same store and are distinguished by
their origin, because a suggestion that has been *rendered as if it were
structure* has already become authorship whether or not anyone clicked.

---

## The five questions

### Q1 — What is a structural unit?

A named grouping of a contiguous run of whole draft sections, optionally
nested inside another unit.

The model must be generic enough for `Part → Chapter → Section` without
assuming any book uses all three, or those words at all.

**Proposal:** self-referencing tree, arbitrary depth, with the *kind* as
member-supplied free text rather than an enum.

```text
manuscript_structure_units
  id                  uuid pk
  manuscript_id       uuid not null            -- the Work, not the draft
  parent_id           uuid null self-ref       -- null = top level
  position            int  not null            -- order among siblings
  kind                text null                -- "Chapter", "Part", "Interlude",
                                               --   the Work's own vocabulary.
                                               --   NOT an enum: the vocabulary
                                               --   belongs to the writer.
  title               text null                -- what the member calls it
  origin              text not null            -- 'member' | 'imported' | 'proposed'
  adopted_from_id     uuid null self-ref       -- set when a proposal was accepted
  created_at, updated_at
  UNIQUE (parent_id, position)
```

Deliberately absent: no `level int` (depth is the tree, and a fixed depth
vocabulary would impose Part/Chapter/Section on books that have neither), no
summary, no topic, no word count target, no interpretive field of any kind.
The 04A constitution — *"No interpretive columns. No title, summary, topic,
or ordering hint the member did not write"* — governs here too. `title` and
`kind` are in the model precisely because the member writes them.

**RULED: manuscript.** `manuscript_id`, not `draft_id`. An authored
statement about how the Work divides must not be contingent on a
particular technical representation of the text. Membership is scoped to
the current section-addressable draft; if a draft is ever replaced,
memberships are remapped only with proof or left visibly unplaced — never
silently inherited. 05A builds no draft-replacement machinery; the rule is
recorded and dormant (ruling 1).

### Q2 — Who may create structure?

| Actor | May create | Rendered as the Work's structure | Becomes authoritative by |
|---|---|---|---|
| Import, mechanically proved | `origin='imported'` | yes | proof at import time |
| Member | `origin='member'` | yes | the act of creating it |
| MAIA / system | `origin='proposed'` | **no** | an explicit member act, which writes a new `member` unit carrying `adopted_from_id` |

Three rules that make the table real rather than decorative:

- **Proposals live in a proposal surface, not in the outline.** A `proposed`
  unit must never render where an authored unit renders. If a member has to
  read the origin badge to know whether the book is organized, the ladder has
  already collapsed.
- **Adoption is per unit, not per batch.** "Accept all" is a single gesture
  that authors an entire structure without the member having seen any of it.
- **Adoption is recorded, not erased.** `adopted_from_id` keeps the fact that
  MAIA proposed it and the member accepted. Provenance survives the act.

MAIA may eventually perceive and propose organization. She does not rearrange
a member's book because her interpretation seems elegant.

### Q3 — What does structure point to?

**Membership of stable `manuscript_draft_sections.id` values. Never copied
text.** Copied text would create a second writable truth, which is exactly
what 04A exists to eliminate.

```text
manuscript_structure_members
  unit_id            uuid not null -> manuscript_structure_units
  draft_section_id   uuid not null -> manuscript_draft_sections
  PRIMARY KEY (unit_id, draft_section_id)
  UNIQUE (draft_section_id)        -- direct leaf placement: a section joins the
                                   -- LOWEST authored unit containing it, and no
                                   -- other. Part membership is derived through
                                   -- parent_id, never joined a second time.
```

**Why a join table rather than a `structure_unit_id` column on
`manuscript_draft_sections`:** the 04A migration forbids interpretive columns
on the substrate table by constitution. Structure is an interpretation. It
lives beside the substrate, not inside it.

**Why explicit membership rather than a `(start_id, end_id)` range:**
contiguity then becomes a property that can be *checked* rather than one
assumed by whatever ordering happens to hold at read time.

**The WS2-05 invariant, and it is the whole safety argument:**

> Creating, renaming, reordering, nesting, or deleting a structural unit
> changes **zero characters** of the draft. The flattening of
> `manuscript_draft_sections` in position order is byte-identical before and
> after any structure operation.

That is 04A's round-trip applied to this layer, and it is testable directly:
snapshot the flattening, perform every structure operation the API exposes,
compare bytes. Deleting a unit deletes a grouping and never a word. Whether
this is enforced by trigger the way 04A's was, or by test plus API shape, is
a decision for the implementation cut — but the property is not optional.

### Q4 — What happens when structure and writing boundaries differ?

**v1 refuses to fake the match.**

A unit's membership must be a contiguous run of *whole* draft sections. If a
member wants a boundary in the middle of a section, the Studio says so plainly
— that division needs the section split first, and split is not in this cut.

Split/merge changes writing boundaries, and every write invariant proven in
04A applies to it: a split must preserve the flattening byte for byte, must
not orphan the source provenance, must not lose a conflicted body, and must be
transactional against the deferred triggers. That deserves its own unit with
its own witness, not a corner of a structure feature.

Refusing here is not a limitation to apologize for. It is the reason the
member can trust that organizing a book cannot damage it.

### Q5 — What does the outline become?

A legible hierarchical map of the Work — not a flat database row viewer.

- Units render as the tree the member authored, with their own vocabulary.
- Leaf sections render inside their unit.
- **Sections not yet in any unit are shown, not hidden**, under something like
  *not yet placed*. Hiding them would make a Work look organized when it is
  not, which is the same failure as inventing structure, arrived at by
  omission instead of invention.
- A flat, unorganized manuscript still shows all its sections. The outline
  degrades to exactly today's behavior when no structure exists.
- The write path is untouched: clicking a leaf opens that section, saves go
  through the same versioned queue, and the conflict latch behaves identically.

---

## Folded in: place within the Work persists

Work identity persists; place within the Work persists. Once the member is
navigating an authored structure, returning them to the top after reload is
especially incoherent.

```text
?m=<manuscript-id>&s=<draft-section-id>
```

The draft-section id is already the navigation authority, so no new database
state is required.

On load:

- `s` present and belongs to this section-addressable draft → open it.
- `s` absent → existing initial-section behavior.
- `s` stale, malformed, or belonging to another draft → **do not manufacture a
  relation.** Fall back to the initial-section behavior and rewrite the
  location so the URL stops asserting something untrue.

No positional indexing as identity — never `s=22`. Position is a rendering
fact and changes; the id is the thing.

**RULED: `history.replaceState`** (ruling 2). Section navigation replaces;
moving to a different manuscript or route uses normal navigation history.

---

## Explicitly out of scope

| Excluded | Why |
|---|---|
| Split / merge of draft sections | Changes writing boundaries; needs its own write-invariant work and its own witness |
| MAIA autonomous restructuring | She may propose. She does not rearrange a member's book. |
| `SECTION-AWARE-CHECKPOINT` | Its own bounded unit |
| Production conversion | A deployment/governance gate, not a Structure feature |
| Witnessing 04B-0 | Its state is now accurate in the 04B record; WS2-05 does not inherit responsibility for normalizing production manuscripts |
| Recording heading depth at ingest | Named in §1 as a separate forward-only cut, so the gap is on the record |

---

## Sovereignty check (CLAUDE.md §6)

- **Increases agency?** Yes — it moves the division of the Work from a
  segmentation regex to the writer's own declaration and vocabulary.
- **Pushes life outward?** Yes — structure is what makes a manuscript
  publishable, readable by others, and finishable.
- **Reduces psychological centrality?** Yes, on the condition that the
  proposal ladder is honored. A system that arranges your book is more
  central. One that holds the boundaries while you arrange it is less.
- **Cultural sovereignty / Invariant 14:** `kind` is free text and never an
  enum, precisely because "chapter", "part", and "section" are one tradition's
  vocabulary for how a work divides. Nothing in the model requires those
  words, that depth, or that a Work divide at all.

**Growth-obligation check** (capability increase: the system gains a model of
how a Work is organized):

- *What uncertainty does this introduce, and how is it preserved?* Whether a
  proposed division is right. Preserved by `origin='proposed'` being
  structurally unable to render as the Work's structure, and by adoption being
  per-unit and recorded via `adopted_from_id`.
- *What provenance and ownership boundaries does it require?* Every unit
  carries who authored it. An adopted proposal keeps the trace of both the
  proposal and the member's act. Structure never holds text, so ownership of
  the words stays exactly where 04A put it.
- *What new responsibility does it create?* That a member can reorganize a
  book without risk. Discharged by the §Q3 invariant: structure operations
  change zero characters, and that is provable by byte comparison rather than
  by assurance.

---

## What a WS2-05 implementation cut would need, in order

1. ~~Kelly's decisions on the two open questions~~ — ruled above.
2. Migration: two additive tables. No column on `manuscript_draft_sections`.
3. The zero-character invariant as an executable test before any UI.
4. Read surface: outline renders the tree, unplaced sections visible.
5. Authoring gestures: create unit, name it, set membership, nest, reorder,
   delete. Each one a member act.
6. Place persistence.
7. Proposals — and only if the ladder is already enforced by the shape of the
   code, not by discipline at the call site.

Items 1-6 are **WS2-05A and are authorized.** Item 7 (proposals) is 05B and
is **not.**
