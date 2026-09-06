# WS2-DOCUMENT-TOPOLOGY-AND-INGEST-INTELLIGENCE-01

**STATUS: PARKED.** No implementation may branch from this document.

Opened 2026-09-06 to hold an architectural fact discovered during the DEVELOP
preparation repair, so it survives the handoff rather than being rediscovered.
The fact is three sentences:

> Document topology is already canonical. Ingest is losing it. Long-Work reading
> must be able to address structure units before ingest starts populating them.

A fourth was added the same day: the member should declare what kind of Work
they are bringing in, before Writer Studio interprets its structure (§1b).

Everything else in this lane can wait, and should.

---

## 5. Hard sequencing boundary

*(Stated first, so nobody opens the lane by reading downward.)*

```text
STATUS: PARKED

DO NOT IMPLEMENT UNTIL:

  PR #1228
  → merge
  → deploy
  → Keep a version (member act, book-print-kdp-final)
  → production --after witness
  → ceiling_exceeded isolated as the only remaining refusal
  → Long-Work Scoped Developmental Reading
  → Elemental Alchemy 185/185 whole-Work acceptance

EXCEPTION — one constraint crosses into the current long-work design:

  the scope planner must be UNIT-CAPABLE from its first design,
  so it does not acquire a flat-section architectural dependency.
  See §3. Nothing else from this lane may be built.
```

The exception exists because §3 is cheap now and expensive later. Every other
item here is additive and costs nothing by waiting.

---

## 1. Existing authority — do not redesign it

`manuscript_structure_units` (WS2-05A, ratified 2026-08-30, migration
`20260830000002_manuscript_structure.sql`) **is** the canonical topology
substrate. This lane extends what feeds it. It does not replace it, wrap it,
or add a parallel representation.

```text
parent_id        arbitrary hierarchy — Part → Chapter → Section → Subsection,
                 or 1 → 1.2 → 1.2.1, or Module → Lesson → Exercise
kind             the member's vocabulary; free text, never enum-constrained
origin           imported | member | proposed
adopted_from_id  proposal → member-adopted lineage
```

Its constitutional position, quoted from the migration because it governs
everything below:

> Structure is an authored layer over the draft, not a repartition of it.
> Nothing here holds a character of the member's text.

And on `kind`, which is why one substrate serves a novel, a dissertation, a
manual and a blog series without a per-genre schema:

> `kind` IS FREE TEXT, DELIBERATELY NOT AN ENUM. "Chapter", "Part",
> "Interlude", "Movement", "Station" — the vocabulary for how a Work divides
> belongs to the Work, not to this schema (Sovereignty Invariant 14). An enum
> here would be this project telling a writer what kinds of divisions a book
> is allowed to have.

### The trichotomy is already enforced at the column

`origin` satisfies, exactly, the distinction reached independently on
2026-09-06:

```text
imported   explicit structure carried from the source document
member     structure authored or confirmed by the member
proposed   MAIA/system proposal — non-authoritative until adopted
```

`adopted_from_id` records the lineage when a proposal becomes member-authored,
so an adoption never erases where the suggestion came from.

**Consequence for this lane:** an inference may never be written as `imported`.
"This looks like a dissertation", "these five headings appear to belong under
Chapter Four", "these 17 references look like a bibliography" are all
`proposed`. The column is the guarantee; no discipline is required to maintain
it.

### Already built, and not to be duplicated

- `lib/manuscript/structure/structureService.ts` — `loadStructure`,
  `createUnit`, `renameUnit`, `moveUnit`, `deleteUnit`, `placeSections`
- `lib/manuscript/structure/authorStructure.ts` — `planAuthoredStructure`,
  `authorStructureFromProposal` (the proposal → member adoption path)
- `app/api/sovereign/manuscripts/[id]/structure/{route,read,proposals}` — the
  authoring, reading and proposal-adoption boundaries

---

## 1b. Work identity, declared at arrival — foundational requirement

Ruled 2026-09-06, and placed **before** hierarchy review because it gives every
subsequent automatic function its context.

> At arrival, the member may identify the kind of Work being brought into
> Writer Studio. That declaration guides extraction review, structural
> affordances and integrity checks, but never authorizes the system to invent
> structure or content. Machine-suggested document identity remains `proposed`
> until the member adopts it.

### Identity is not structure

The two must never be conflated, and the distinction has a data-model
consequence recorded below.

```text
WORK TYPE                              STRUCTURE
"This is a dissertation."              "This heading is Chapter 3."
                                       "This section belongs beneath 3.2."
        ↓                                        ↓
a member declaration ABOUT the Work    imported / member-authored topology
```

A dissertation may have an unconventional structure. A book may have Movements
rather than Chapters. A manual may contain essays. Type says what kind of object
Writer Studio is serving; topology remains the author's actual structure.

### Authority

```text
member selects "Dissertation"          →  document identity = member
extraction sees an Abstract, numbered
  chapters, references, appendices     →  document identity = proposed
```

An unclassified upload may ask — *"This looks like a dissertation. Use that
structure for the import?"* with `Yes, it is a dissertation` · `Choose something
else` — and may not decide. The same rule as every other inference in this lane.

### A lens, never a template

⛔ **The load-bearing prohibition.** Choosing "Dissertation" tells Writer Studio
what to *look for*. It must never cause an Abstract to be manufactured because
one is absent.

```text
Member says: Dissertation
  look for   Abstract · numbered heading hierarchy · citations · references ·
             figures / tables · appendices
Member says: Manual
  look for   procedures · steps · warnings · prerequisites · tables ·
             cross-references
Member says: Novel
  look for   Parts · Chapters · scene and section breaks · front and back matter

IN EVERY CASE
  record only what actually exists in the source, or what the member confirms.
```

A type whose expected elements are absent produces an *observation about the
import*, at most — never a placeholder, never a heading, never a section.

### The starting list is convenience, not ontology

Book / manuscript · Dissertation / thesis · Academic paper · Manual / technical
document · Article / essay · Blog post or series · Workbook / course material ·
Script / screenplay · Report · Notes / research material · **Other → name it
yourself**.

The free-text escape is required, not a nicety: Field Guide, Ceremony Manual,
Collected Letters, Training Curriculum. This is the same reasoning that made
`manuscript_structure_units.kind` free text rather than an enum — a fixed list
would be this project telling a writer what kinds of Work exist (Sovereignty
Invariant 14).

### Changeable, and not a permanent mistake

Type is editable after import. Changing it changes Studio affordances and
integrity checks; it never rewrites prose and never silently restructures the
Work.

### Where it lives — an open question, recorded not decided

Type is a property of the **Work**, not a node in its topology, so it does not
belong in `manuscript_structure_units`. `member_manuscripts` currently holds
`id · member_id · title · provenance · created_at`
(`20260721000003_press_manuscript_room.sql:25`) and has no type column. Whether
it gains one, whether a machine proposal is stored alongside a member
declaration or held only until the member answers, and whether `provenance`
(today `CHECK (provenance = 'member_uploaded')`) is the right neighbour, are all
undecided here.

---

## 2. The first defect to repair

Word heading styles reach us intact and are discarded one function later.

```text
DOCX Heading 1 / 2 / 3
  → mammoth.convertToMarkdown maps them to # / ## / ###
     (lib/manuscript/ingest/parseUpload.ts:78-80 — deliberate, documented)
  → segment() DETECTS the levels
     (lib/manuscript/ingest/segment.ts:39, /^(#{1,3}\s+.+|...)$/)
  → and then STRIPS them:
     heading: raw.replace(/^#{1,3}\s+/, '')     ← the depth is dropped here
  → SectionInput carries { position, heading, body } — no level
  → manuscript_sections are FLAT
  → no imported structure_units are written at all
```

The hierarchy arrives at the door, is recognised, and is thrown away. Nothing
downstream can recover it, because the `#` count is gone from the stored text.

### The first future unit, and its whole scope

> Preserve source-authored heading hierarchy through ingest into
> `manuscript_structure_units` with `origin='imported'`, and let Import Review
> be the member's ratification surface.

(Sequenced after §1b: the member's declared type is what tells this unit which
elements to look for.)

Explicitly **not** in that first unit: document-type classification, citation
mapping, figure or table intelligence, cross-reference integrity, extraction
hazard panels, format-specific extraction. Each is a later unit (§4) and each
is additive once the spine exists.

Open questions for that unit, recorded rather than answered:

- Whether depth is carried as an explicit `level` on the preview's sections or
  reconstructed from the retained `#` prefix at save. The former adds a field;
  the latter keeps `SectionInput` unchanged. Neither is decided here.
- What Import Review does with a Work whose detected depth is inconsistent
  (an `H2 → H4` jump). Report, do not repair — but the surface is unspecified.
- Whether a member may reject imported structure wholesale and keep a flat
  Work. Presumed yes; not ruled.

---

## 3. The long-work constraint that applies NOW

**This is the only part of this lane that may influence work in flight.**

A developmental scope must not be defined only as a section index range. Scope
identity must support a structure unit as a first-class target:

```text
scope_target =
  | { kind: 'structure_unit', unitId }
  | { kind: 'section_range', sectionIds[] }
  | { kind: 'whole_work' }
```

A `structure_unit` resolves to its **leaf draft sections** against the pinned
revision and topology — direct leaf placement, with ancestor membership derived
by walking `parent_id`, per WS2-05A. It is never resolved by title, position or
similarity.

```text
hierarchical Work
  Chapter 4 → structure_unit → leaf sections → bounded ≤60k read scopes

flat Work
  whole_work → ordered leaf sections → bounded ≤60k read scopes
```

One planner, both cases. A flat Work is not a special case; it is a Work whose
unit tree is empty, and `whole_work` covers it.

**Why now.** If the planner is built against `[start_index, end_index]` because
that is all today's data offers, then *Develop this chapter* requires replacing
the planner rather than populating a table. The cost of unit-capability today
is a discriminated union; the cost of retrofitting it is the planner, its
provenance records, and every stored scope that used the old shape.

Nothing else from this lane crosses. Ingest may keep discarding hierarchy while
the long-work unit is built; the planner simply finds no units and takes the
`whole_work` path, which is the correct behaviour for a flat Work in any case.

---

## 4. Future programme — explicitly non-critical-path

Parked as separate units, roughly in dependency order. None is authorized.

```text
A  member-declared Work type at arrival                  (§1b — foundational,
                                                          precedes hierarchy)
B  preserve imported hierarchy through ingest            (§2)
C  Import Review / member ratification surface
D  nested WRITE outline + promote / demote / split / merge
E  topology-bound revision and freeze semantics
F  visible extraction-integrity / Source Check
G  notes / citations / bibliography relationships
H  figures / tables / captions
I  cross-reference integrity
J  machine-PROPOSED document identity                    (never `imported`)
K  document-specific integrity checks
L  richer format-specific extraction
M  DEVELOP / REVIEW / PUBLISH topology-aware affordances
```

A precedes B deliberately: the declaration tells every later unit what to look
for. J is separate from A because a member declaring the type and a machine
guessing it are different acts with different authority, and only the first is
foundational — an import with no declared type must still work.

### The epistemic separation this lane exists to protect

```text
source structure      →  imported
member decision       →  member
machine inference     →  proposed

extraction warning    →  evidence ABOUT THE EXTRACTION
                         ≠ structure
                         ≠ authorship
```

The last line is the one most easily lost. "PDF pages 117–119 contained
unusually little text" is a fact about what the parser could read. It is not a
structural claim about the Work and it is not something the member authored. It
belongs beside the import, never inside the topology.

Two instruments already hold that discipline and should be the model for
everything in E:

- `detectOmission` compares what arrived against what the cuts account for, logs
  `[MAIA/press] SEGMENTATION LOSS` and returns `lossless: false` — *reports*
  rather than repairs, and never surfaces as a member-facing error, because the
  member's own path must not become where a machine defect appears.
- `parseUpload` distinguishes a text PDF from a likely-scanned one and says so,
  rather than fabricating OCR.

### Report, never silently repair

Every integrity check in J is a report. A citation with no bibliography entry, a
`Step 4` followed by `Step 6`, a TOC title differing from its chapter title, an
`H2 → H4` jump — each is shown, none is corrected. Correction is authorship, and
authorship is the member's.

---

## Provenance of this document

Written 2026-09-06 during the DEVELOP preparation lane, after
`manuscript_structure_units` was found to already encode the
imported/member/proposed distinction the lane had just derived independently.
Claims about existing code were verified against the tree at that date and cite
file and line. Nothing here is authorized; §3 is the single constraint that
crosses into work in flight.
