# WS2 — ARCHITECTURE DEFINITION

**STATUS: ACCEPTED / FROZEN — founder, 2026-08-28.** A–D binding review: **PASS**.
The remaining hold is **substrate implementation, not conceptual uncertainty**.

The unit that lifted the WS2-02 architecture hold. Binds A–D in words and types.
**No implementation. No UI. No migration.**

```text
A  Work / Manuscript / Material              ACCEPTED
B  MAIA relationship                         ACCEPTED
C  provenance / adoption architecture        ACCEPTED
D  Mode ≠ Distance ≠ Functional Owner        ACCEPTED

SUBSTRATE IMPLEMENTATION                     NEXT · WS2-SUBSTRATE-01
```

Frozen: a session reads this and proceeds. It does not re-derive the bindings.
Changing an accepted binding is a new founder ruling recorded in `DECISIONS.md`,
never an edit here.

Founder rulings of 2026-08-28 (`WS2-02-03-AUTHORITY-AUDIT.md` A/B/C/D) are the
input. This file is the binding, plus a reconciliation against what the
repository actually contains — because Protocol §2 requires designing from the
real system, and three of the four bindings turn out to be partly built already.

> ### Writer's Studio Design Authority
>
> **DESIGN-CONTRACT.md** — form · **CAPABILITY-COVENANT.md** — required
> possibility · **DESIGN-DEVELOPMENT-PROTOCOL.md** — method.
> None may be satisfied by violating another.

---

## §0 — The grammar the pack already shows

**Read from the images on 2026-08-28, not from their filenames** (D-017; the
same standard that closed WS2-00). Recorded because it changes the character of
this unit: we are **naming a grammar the references already carry**, not
inventing an ontology and conforming the designs to it. Where the pack and the
written programme language disagree, the pack is generally the clearer of the
two.

### Verified in `04-writing-field-wide.png` (canonical, WS-WRITE)

```text
TOP        WRITE · DEVELOP · EXPLORE · REVIEW · PUBLISH     ← MODES
LEFT       three LABELLED BANDS, not one list:
             WORK SPACE  Home · Manuscript · Materials 24 · Structure ·
                         Notes 12 · Versions · Goals
             MAIA        Conversations · Discover · Insights · Suggestions
             TOOLS       Find/Replace · Statistics · Timeline · Word Web ·
                         Export
IDENTITY   "Elemental Alchemy / The Art of Living a Phenomenal Life"
           persistent in the chrome, with + New Work
```

**Top = how I am approaching the Work. Side = where kinds of state live.** The
distinction Binding D makes in words is already drawn.

⚠ **Refinement on the founder's reading, from the image.** The left rail is not
a single flat list of owners. **MAIA has its own band**, separate from WORK
SPACE and from TOOLS. So the pack does not treat MAIA as one owner among seven
in a list — it gives the relational dimension its own standing in the chrome.
That supports Binding B more strongly than a flat reading would.

WRITE privileges **Close** — chapter, prose, cursor, formatting, Focus Mode —
and monopolizes nothing: Materials (right rail, grouped MANUSCRIPTS /
TRANSCRIPTS / VOICE NOTES / DOCUMENTS / IMAGES), Structural (OUTLINE · THREADS ·
TIMELINE · WORD WEB with a movement map), Relational (MAIA), Work (persistent
identity) and Expressive (PUBLISH remains an aperture) are all present at once.
**This is Protocol §7 and statement 7, drawn.**

Objects stay visually distinct rather than fused: MANUSCRIPT · MAIA INSIGHT ·
MATERIAL · VERSION · GOAL each read as their own kind. MAIA's insights are
**typed and evidence-linked** — `THEME` / `STRUCTURE` / `CONTINUITY`, each with
"3 passages", "2 suggestions", "4 passages" — a count of evidence, never a
score. That is D-003 satisfied *in the reference*, not imposed on it.

⚠ One class of percentage in `04` is **legitimate and must not be refused by
reflex**: the GOALS band (82% · 60% · 75% · 30%) is progress against
**writer-declared** targets, which `FUNCTION-PLACEMENT.md` §4 explicitly permits.
The refused numbers are the MAIA-produced judgments wearing measurement costume
(cohesion %, movement health %, "Coherence: Strong"). Do not collapse the two.

### Verified in `05-materials-studio.png`

The bottom band is a literal domain statement, verbatim from the image:

```text
SOURCE                  →   MATERIAL                →   WORK
Where it came from          What you've gathered        What you're creating
Raw, original,              Organized, useful,          Your manuscript,
authoritative.              interpreted.                your voice.
                                        Learn more about Sources, Materials & Work
```

**RELATIONSHIP TO WORK**, a control on the material, with six values:

```text
Core Material · Supporting · Background · Reference · Peripheral · Exclude
```

A Material has a relationship to a Work **without becoming the Work**. Binding
A's load-bearing rule is already a control in the pack.

Two further things the pack draws that this unit's findings depend on:

- **A `Provenance` tab** sits beside Preview · Details · Connections (8). Below
  it, FILE INFORMATION renders arrival provenance in full: Source · Captured ·
  Location · Format · Duration · Imported · **Imported from: Zoom Recording** ·
  File Path. **Provenance is not merely implied by the pack — it is drawn.**
- **"SHOULD THIS BELONG TO AIR?"** with **`Belongs to Air · Maybe · Not now`**,
  under "Why Maia thinks this belongs" and its reasons. This is the adoption
  boundary, drawn: **MAIA proposes with its reasons; the writer authorizes.**
  Protocol §8's grammar, as a control.

MAIA's posture is situated, not duplicated — "MAIA GATHER · I'm here to help you
gather with clarity" here, "What would you like to explore in your writing
today?" in `04`. **One relationship, situated by Work + mode + object +
distance** — not four MAIAs, and not "right sidebar = MAIA".

### What this means for the hold

The hold is **not** "we do not know the architecture." We largely do; the pack
carries it. The hold is:

> **Before implementing WS2-02, write down the architecture the reference pack
> already implies, so implementation cannot accidentally simplify it.**

That is a much smaller task than domain modelling from scratch. What remains
genuinely unbuilt is not the design intent — it is the **substrate underneath
it** (§1–§3 below), which is thinner than the pack assumes.

---

## The architectural covenant

**Founder, 2026-08-28.** The compact form. Everything below is elaboration.

```text
WORK is the persistent creative center.
MANUSCRIPT is authored expression belonging to a Work.
MATERIAL is source/input related to a Work but not authored Work.
MAIA EXCHANGE is relational activity belonging to a Work and may reference
Manuscript, Material, Structure or findings without becoming manuscript.

MODE describes how the writer enters the Studio.
CREATIVE DISTANCE describes how the writer is currently relating to the Work.
FUNCTIONAL OWNER describes where state and behavior are authoritative.

These are independent dimensions.
A mode may privilege several creative distances.
A functional owner may appear within several modes.

No visual proximity converts one domain object into another.
No MAIA suggestion becomes writer meaning or manuscript without a writer act.
Provenance and authority must survive all crossings.
```

### What is being protected is not the aesthetic

> **The writer remains surrounded by the Work instead of being bounced between
> tools.**

When writing, Materials are nearby. When looking at Structure, Versions are
nearby. When reviewing, the actual passage is nearby. MAIA is nearby everywhere
but does not displace the Work. The Work's identity persists through all of it.

That is the distinctive idea, and it is what a "simplifying" implementation
would cost first.

---

## The ten binding statements

```text
 1  Work, Manuscript, Material and MaiaExchange are distinct domain concepts.
 2  Material never becomes Manuscript without an explicit writer act.
 3  MaiaExchange belongs relationally to a Work and may reference
    Manuscript/Material, but is not authored manuscript.
 4  The model must support provenance of origin, source, posture, and writer
    adoption/rejection from this point forward.
 5  Provenance presentation may remain scheduled for WS2-06;
    provenance architecture may not.
 6  Mode, Creative Distance and Functional Owner are separate dimensions.
 7  Modes may privilege creative distances but may not monopolize them.
 8  Functional ownership determines source-of-truth custody, not navigation.
 9  Do not create a sixth application merely because Materials, Structure or
    MAIA has its own owner.
10  Return the minimum type/domain contracts and the exact implications for
    WS2-02/03. No implementation until reviewed.
```

---

## §1 — Binding A · Work / Manuscript / Material

| Object | Meaning | Authority |
|---|---|---|
| **Work** | The whole creative undertaking: book, essay, course, lecture, research project | The writer owns its identity, purpose, meaning, completion |
| **Manuscript** | Authored textual expression belonging to a Work | Writer-authored; may have versions, sections, revisions |
| **Material** | Something that may inform the Work: transcript, note, source document, quotation, recording, research, prior writing | Remains source/material until deliberately incorporated |

> **A Work can contain or relate to many Manuscripts and Materials. A
> Manuscript is not the Work. Material is not Manuscript merely because it was
> imported, retrieved, summarized, displayed, or discussed.**

### Substrate reconciliation — A

```text
living_works                Work            EXISTS  member's own words,
                                                    never generated
member_manuscripts          Manuscript      EXISTS  but see the gap below
studio_materials            Material        EXISTS  real entity + arrival
                                                    provenance
living_work_materials       Work↔Material   EXISTS  a DECLARED relation:
                                                    relationship_sentence,
                                                    declared_by, declared_at
```

✅ **CORRECTED 2026-08-28 by census (D-022). The earlier text here was wrong.**

It read: *"the Work↔Manuscript edge DOES NOT EXIST."* That conclusion came from
testing for a `work_id` column on `member_manuscripts`, finding none, and
inferring absence. **Absence of the expected shape is not absence of the thing.**

```text
living_work_expressions            Work ↔ Manuscript      EXISTS
  living_work_id    FK → living_works, ON DELETE CASCADE
  expression_type   TEXT   (the route accepts only 'manuscript')
  expression_id     UUID
  declared_by       FK → members, NOT NULL
  declared_at       TIMESTAMPTZ NOT NULL
  UNIQUE (living_work_id, expression_type, expression_id)
```

Both edges exist, and **both are member declarations of the same grammar**:

```text
Work ↔ Material      living_work_materials     declared_by · declared_at
Work ↔ Manuscript    living_work_expressions   declared_by · declared_at
```

It has a writer — `POST /api/sovereign/living-works/[id]/expressions`, *"a
member act, never a side effect"*, refusing system placement, "seems related",
bulk adopt, and foreign ids on either end — and a consumer: the Canvas **unite
rule** (ruled 2026-08-05) unites Work and manuscript **only when exactly one
Work declares that manuscript**, because *"expressions may belong to several
works by design, and the room does not guess between them."*

**Cardinality is already ruled**, in the schema's own comment: not unique on
`(expression_type, expression_id)` alone, because *"an expression MAY belong to
more than one Living Work… preservation of optionality, not an omission. A
relational constraint here would decide a constitutional question by accident."*

**This is stronger than the column would have been.** A `work_id` column makes
belonging a *property of the manuscript*, and a property can be backfilled by
inference. A declaration row **structurally cannot be written without an actor
and a date**. The system does not discover that an expression belongs somewhere;
a person declares a relationship, and the architecture remembers who and when.
That is D-018 and D-019 already expressed in the substrate.

⚠ Secondary: `living_work_materials.material_type/material_id` is a polymorphic
`TEXT` pair, not a foreign key to `studio_materials`. The edge exists but is not
referentially enforced.

## §2 — Binding B · What a MAIA exchange belongs to

MaiaExchange is a **fourth domain relationship**, not manuscript content.

```text
WORK
 ├── MANUSCRIPT
 ├── MATERIAL
 └── MAIA EXCHANGE
```

A MaiaExchange may reference a Work · a Manuscript section · a Material · a
structural finding · a version · a question · a writer-recognized decision.

> **Conversation with MAIA does not become authored manuscript merely because
> it concerns the manuscript.**

An explicit writer adoption act is required before MAIA-originated language
crosses that line. The architecture must make these distinctions *possible*;
WS2-02 need not expose them as controls:

```text
Keep as material · Recognize · Adopt as decision · Insert into manuscript ·
Use as structural note · Dismiss
```

### Substrate reconciliation — B

✅ **Better than the audit assumed.** `studio_companion_turns` already exists
and already carries the relationship:

```text
living_work_id  UUID REFERENCES living_works(id)
manuscript_id   UUID
CHECK (living_work_id IS NOT NULL OR manuscript_id IS NOT NULL)
                → "a turn belonging to neither has no room to be read back into"
role            CHECK (role IN ('writer','maia'))
room_state      "a fact about the room, never a judgement about the writer"
```

MAIA exchange **already belongs relationally to a Work and/or a Manuscript**,
and the constraint already refuses a homeless turn. Binding B is substantially
built. Two gaps remain:

🔴 **No adoption state.** `role` distinguishes who spoke. Nothing expresses
whether a turn was kept, recognized, adopted, inserted or dismissed. The
*belonging* exists; the **adoption boundary does not**. Statement 2's "explicit
writer act" has nowhere to be recorded — while `05` already draws that act as
`Belongs to Air · Maybe · Not now`, and `08` carries `Discuss / Keep /
Unresolved / Dismiss` inline in MAIA (DESIGN-CONTRACT §0.1). **The control is
designed; the column is not.**

⚠ `manuscript_id` is a bare `UUID` with **no foreign key**, while
`living_work_id` has one. An exchange can name a manuscript that does not exist
— the same identity-custody class D-010 governs.

⚠ No reference to a Material, section, finding or version — only Work and
Manuscript.

## §3 — Binding C · Provenance now, presentation later

> **WS2-06 may introduce the visible provenance experience. It may not
> introduce provenance itself.**

From WS2-02 onward, relevant objects answer:

| Question | Values |
|---|---|
| **Who originated this?** | writer · MAIA · imported source |
| **What kind of thing is it?** | manuscript text · material · observation · proposal · decision |
| **Where did it come from?** | transcript X · chapter Y · MAIA exchange Z |
| **What authority does it have?** | unreviewed · recognized · adopted · rejected |
| **How did it enter the Work?** | authored · imported · suggested · deliberately incorporated |

> **Provenance persists. Current relevance does not.** Something MAIA suggested
> six months ago retains its origin and adoption state without remaining
> perpetually "important." (Protocol §9.)

### Substrate reconciliation — C

```text
member_manuscripts.provenance
  TEXT NOT NULL DEFAULT 'member_uploaded'
  CHECK (provenance = 'member_uploaded')
```

```sql
-- widened 2026-08-02, migration 20260802000001
CHECK (provenance IN ('member_uploaded', 'member_written'))
```

⚠ **CORRECTED 2026-08-28.** The earlier text called this "a constant, not a
model" and said exactly one value was permitted. **Two are** — the constraint was
widened on 2026-08-02, with a stated reason: *"a blank page was not uploaded."*

The accurate finding is narrower and more useful: the column **truthfully records
entry method** — how the manuscript entered the Studio — and does so well. Its
own comment: *"Never inferred; set once at creation by the gesture the member
actually performed."*

What it does not carry is the rest of the model. Entry method is **one of five
axes**. Originator, kind, source reference and authority/adoption have nowhere to
live. **The repair is not to replace this field** — it is to stop it being
overloaded, and to add the missing dimensions beside it.

```text
studio_materials     artifact_hash · original_filename · source_url ·
                     extraction_method · extracted_chars
                       → real ARRIVAL provenance. Where it came from: yes.
                         What authority it has: absent.

living_work_materials  declared_by · declared_at · relationship_sentence
                       → the closest thing to an adoption record in the
                         repository, and it covers only Work↔Material.
```

**Summary: source provenance partially exists; authority/adoption provenance
exists nowhere.** Questions 1–3 are answerable for Materials and unanswerable
for Manuscripts. Questions 4–5 are answerable for nothing.

This is why C is a sequencing ruling and not a preference. Protocol §5's remedy
— preserve the capability and postpone the presentation — **cannot apply to a
distinction that was never modelled.**

⚠ **And the gap is wider than "not yet scheduled".** `05` already draws a
**Provenance tab** and an "Imported from: Zoom Recording" record (§0). The
reference pack promises provenance as a visible surface. Behind it,
`member_manuscripts.provenance` permits exactly one value and no authority state
exists anywhere. **The design is ahead of the substrate here, not behind it** —
which is the precise condition under which a beautiful implementation quietly
ships a poorer product.

## §4 — Binding D · Mode ≠ Creative Distance ≠ Functional Owner

```text
MODE               a member-facing aperture/composition
                   "how am I entering the Studio right now?"
CREATIVE DISTANCE  a relationship to the Work
                   "from what distance am I encountering the Work?"
FUNCTIONAL OWNER   architectural custody of logic/state
                   "where does this capability's source of truth live?"
```

| Mode | Primary | Available |
|---|---|---|
| **EXPLORE** | Work | Material · Structural · Relational |
| **WRITE** | Close | Material · Structural · Relational |
| **DEVELOP** | Structural + Relational | Work · Material |
| **REVIEW** | Relational + Structural | Close · Work |
| **PUBLISH** | Expressive | Work · Close · Structural |

Functional owners — `Manuscript · Materials · Structure · Versions · Review ·
MAIA · Publishing` — determine source-of-truth custody and **do not dictate
top-level navigation**. Materials can be owned by a Materials domain while
appearing naturally inside WRITE and EXPLORE. Structure can own structural
state without a separate "Structure app." MAIA can own relational conversation
while present across every mode.

**Substrate reconciliation — D:** none required. D constrains how WS2-02
composes navigation; it implies no table. Its one architectural consequence is
negative and binding: **an owner may not be given a route merely for being an
owner** (statement 9).

---

## §5 — Minimum domain contracts

Declarative. These are the shapes the architecture must be able to express —
**not files to create.** Persistence mapping is deliberately not settled here.

```ts
type WorkId       = string & { readonly __brand: 'WorkId' };
type ManuscriptId = string & { readonly __brand: 'ManuscriptId' };
type MaterialId   = string & { readonly __brand: 'MaterialId' };
type ExchangeId   = string & { readonly __brand: 'ExchangeId' };

/** Statement 1: four distinct concepts. Branded so one cannot pass as another. */

interface Work {
  id: WorkId;
  title: string;          // the writer's words. Never generated, never inferred.
  purpose?: string;
}

interface Manuscript {
  id: ManuscriptId;
  workId: WorkId;         // ← THE MISSING EDGE. A manuscript belongs to a Work.
  title: string;
  origin: Origin;         // statement 4
}

interface Material {
  id: MaterialId;
  workId: WorkId | null;  // a material may exist before it relates to a Work
  kind: 'document' | 'note' | 'transcript' | 'audio' | 'image' | 'link';
  title: string;
  origin: Origin;
  /** Statement 2. Incorporation is an ACT, recorded — never a side effect of
   *  import, retrieval, summary, display or discussion. */
  incorporation: Incorporation | null;
}

interface MaiaExchange {
  id: ExchangeId;
  workId: WorkId;                    // statement 3: belongs to a Work
  references: ExchangeReference[];   // may point at manuscript/material/finding
  role: 'writer' | 'maia';
  content: string;
  /** Statement 3. Absent = MAIA said it and it is not manuscript.
   *  Present = the writer acted. There is no third state, and no passage of
   *  time or repetition of the suggestion creates one. */
  adoption: Adoption | null;
}

type ExchangeReference =
  | { kind: 'manuscript'; id: ManuscriptId; section?: string }
  | { kind: 'material';   id: MaterialId }
  | { kind: 'finding';    id: string }
  | { kind: 'version';    id: string };

/** Statement 4 — the five provenance questions, as types. */

interface Origin {
  originator: 'writer' | 'maia' | 'imported';
  sort: 'manuscript_text' | 'material' | 'observation' | 'proposal' | 'decision';
  from?: ExchangeReference | { kind: 'upload'; filename?: string; hash?: string }
       | { kind: 'link'; url: string };
  entered: 'authored' | 'imported' | 'suggested' | 'incorporated';
}

/** Authority is a separate axis from origin: who made it, and what standing it
 *  has, are different questions. */
type Authority = 'unreviewed' | 'recognized' | 'adopted' | 'rejected';

interface Adoption {
  authority: Authority;
  by: 'writer';          // only the writer. There is no MAIA self-adoption.
  at: string;
}

interface Incorporation {
  at: string;
  by: 'writer';
  intoManuscript: ManuscriptId;
}

/** Protocol §9. Salience is COMPUTED, never stored — so that yesterday's
 *  importance cannot become today's by persistence alone. */
// interface Salience — deliberately absent. Recompute; do not store.

/** Statement 6–8. Three dimensions, never one taxonomy. */
type Mode      = 'EXPLORE' | 'WRITE' | 'DEVELOP' | 'REVIEW' | 'PUBLISH';
type Distance  = 'Work' | 'Close' | 'Material' | 'Structural' | 'Relational'
               | 'Expressive';
type Owner     = 'Manuscript' | 'Materials' | 'Structure' | 'Versions'
               | 'Review' | 'MAIA' | 'Publishing';

/** Statement 7: primary is what a mode privileges; available is what it may
 *  not sever. A mode with an empty `available` has monopolized its distance. */
interface ModeContract { primary: Distance[]; available: Distance[] }

/** Statement 8/9: an owner surfaces THROUGH modes. It is not given a route for
 *  being an owner. There is no `route` field here, deliberately. */
interface OwnerContract { surfacesThrough: Mode[] }
```

---

## §6 — Exact implications for WS2-02 and WS2-03

### WS2-02 — design system

| Planned scope | Implication |
|---|---|
| typography · spacing · surfaces · gold | **None.** Unblocked by A–D; pure Design Contract territory. |
| **navigation** | Bound by D. Navigation expresses **Modes**, five of them. It may not gain a destination per owner (statement 9) and may not sever a mode's `available` distances (statement 7). MATERIALS, STRUCTURE and MAIA get no top-level route for being owners. |
| **panels** | A panel is how a *secondary distance* stays available inside a mode. "One panel per distance" reproduces the pipeline §7 forbids. Panel grammar is where `available` is honoured or lost. |
| states · responsive rules | Compact (`08`) must keep secondary distances reachable, not drop them. §14 Q6 remains the gate. |

### WS2-03 — Studio shell

| Planned scope | Implication |
|---|---|
| **persistent work context** | Persists a **`WorkId`**, not a document id, not a route parameter, not an opaque blob. Requires the Work↔Manuscript edge that does not exist (§1). |
| **MAIA region** | Retired as an architectural definition. The shell positions a *presentation* of a relationship the model owns — `MaiaExchange.workId` — and the relationship is decided first. |
| navigation | As WS2-02. The shell is where a mode could monopolize a distance most cheaply and most permanently. |
| new application shell | Protocol §4: decompose `Worktable.tsx`, do not replace it. Burden of proof on removal. |

### The three substrate facts WS2-02/03 must be planned around

```text
1  member_manuscripts has no work_id.
   Persistent work context cannot be built correctly without this edge.

2  member_manuscripts.provenance is CHECK-constrained to one value.
   It is a constant. Origin is not expressible for manuscripts today.

3  studio_companion_turns already carries living_work_id + manuscript_id,
   with a CHECK refusing a homeless turn — but no adoption state, and
   manuscript_id has no foreign key.
```

**Ruled — D-021, founder 2026-08-28.** These are repaired in a **preceding
unit**, not inside WS2-02/03: **`WS2-SUBSTRATE-01`**.

The reason is not sequencing taste. WS2-02/03 must implement against a substrate
that already tells the truth; if presentation work and object-model repair share
a unit, *"the UI chose this"* and *"the data model forced this"* stop being
distinguishable afterwards. The shell may then only present relationships the
domain can actually represent — and may not invent route-, recency-, browser- or
UI-derived substitutes for a missing domain relationship.

What this file settles stands: these are *architecture*, not presentation, and
therefore fall under statement 5 — their presentation may wait for WS2-06; their
existence may not.

---

## §7 — What this file does not decide

- Persistence mapping. The contracts above are shapes, not tables. Whether
  `Manuscript.workId` arrives as a column on `member_manuscripts` or a join
  table is a migration decision, and no migration is authorized here.
- Any composition, hierarchy, density or typography — the frozen pack governs.
- Which controls expose adoption. Statement 3 requires the distinction be
  *possible*, not that WS2-02 render six buttons.
- WS2-01 acceptance, which is outstanding on runtime and founder evidence and
  is untouched by this file.

**No code was changed. No migration was written.**

The binding is reviewed and ACCEPTED. WS2-02/WS2-03 are **conceptually
unblocked**; their **execution is held behind `WS2-SUBSTRATE-01`** (D-021).

---

LAST UPDATED 2026-08-28
