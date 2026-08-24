# WRITER-STUDIO-R2 — Phase 3A: Work Structure + Import Contract

> **Status**: Phase 3A of `WRITER-STUDIO-R2`, 2026-08-24. **Contract. No production
> implementation.** The W8 freeze is binding. PR #995 is not merged. `Worktable.tsx` is not
> extended. No migration is authorized by this document.
>
> **The governing principle, founder 2026-08-24:**
> *The manuscript is evidence. The machine offers an interpretation. The writer confers structure.*

---

## Part 0 — Rulings carried in

| # | Ruling |
|---|---|
| **R1** | **Writer's Studio is the canonical place.** "Author Studio" is legacy nomenclature — a role, a historical document term, or a provenance label; **not another Layer-1 house or product surface.** No repo-wide rename during 3A: record the equivalence, retire names deliberately later. |
| **R2** | **The Manuscript Room survives experientially, not architecturally.** It is the **immersive manuscript stance** of the Writer's Studio — a phenomenological room, never an independently authoritative container or a second authoring system. |
| **R3** | **`/book-studio/canvas` is a frozen legacy live surface pending capability harvest.** Neither the canonical Writer Canvas nor automatically the Press Editor. New development closed. No Phase 3A dependency. Harvest first, assign later. |

**The equivalence table** (recorded, not enacted):

```text
Writer's Studio   canonical place
Author Studio     legacy name / historical provenance
Press             downstream publication system
Book              a type of Work, not a separate authoring universe
Manuscript Room   an immersive stance within the Work
```

---

## Part 1 — The finding that sets 3A's first requirement

**There is no Source layer today. What the system calls "source" is already an interpretation.**

Evidence, all from canonical:

1. **The raw import is never persisted.** `app/api/sovereign/manuscripts/ingest/route.ts` extracts
   text from the upload and returns it to the client — *"Extraction only… Nothing is stored here."*
   The member reviews it, and the save path writes **only the segmented result**. The arriving
   document, as it arrived, is never written to the database.
2. **`manuscript_sections` fuses source and interpretation in one row.** Its columns are
   `(manuscript_id, position, heading, body)`. `heading` is regex output — machine interpretation.
   `body` is the text that happened to fall between two regex hits. They are stored as one fact.
3. **`base_source_hash` hashes the interpretation, not the arrival.** The working draft records
   which words it began from by hashing the *sections* — so it is bound to a particular cut, not to
   the document.
4. **The current import can silently lose text.** In `lib/manuscript/ingest/segment.ts` and again in
   the save route, a section whose body is empty is skipped:

   ```js
   if (body.trim().length === 0) continue;
   ```

   A heading line immediately followed by another heading line therefore **disappears entirely,
   heading and all**. On a print manuscript whose front matter is a stack of capitalised lines —
   exactly the founder's book — several arriving lines are dropped at import with no record.

**Consequence:** "Restore original import" cannot mean what R-3A needs it to mean until the arrival
is persisted. Today it could only restore *a cut*, and a lossy one.

> **3A requirement 1 — persist the arrival.** The extracted text of an imported document must be
> stored, immutable, before any interpretation runs. Everything else in this contract depends on it.

---

## Part 2 — The three layers

| Layer | Mutability | Authored by | Answers |
|---|---|---|---|
| **Source** | **Immutable.** Written once at import; never edited, never re-cut, never deleted while the Work lives. | The arriving document | *What actually arrived?* |
| **Interpretation** | **Regenerable.** May be discarded and recomputed at any time, by any improved method, without consequence. | The machine | *What does the machine think it sees?* |
| **Work Structure** | **Member-authored and reversible.** Changes only by a member act. | The writer | *What does the Work recognise as its shape?* |

Three rules bind them:

1. **Interpretation may never write Work Structure.** A candidate becomes structure only through a
   member act. This is the single law that `segment.ts` and PR #995 both break today.
2. **Work Structure may never write Source.** Suppressing `ELEMENTAL ALCHEMY` as running furniture
   excludes those occurrences from structural interpretation and rendering; it does not remove those
   characters from what arrived.
3. **Regenerating Interpretation may never destroy Work Structure.** Re-interpreting produces new
   candidates beside the structure the writer already conferred; it does not reset it.

### Where the working draft sits

The Working Draft is **the living text of the Work** and stays exactly what it is today: one
authoritative document, one autosave lane, one revision history. It is not a fourth layer. It is
initialised *from* Source, carries the writer's ongoing changes, and is what Work Structure anchors
into.

```text
SOURCE (immutable)                    what arrived
   │
   ├──► INTERPRETATION (regenerable)  candidates: furniture, boundaries, likely headings
   │         │
   │         │  proposals — never authority
   │         ▼
   │    MEMBER STRUCTURE ACTS         accept · reject · ignore · split · merge
   │         │                        promote · demote · rename · reorder · restore
   │         ▼
   └──► WORK STRUCTURE (member)       stable identities + anchors
              │
              ├── Navigator          ── one structure, four presentations
              ├── Collapsed rail
              ├── Structure workspace
              └── Manuscript stance
```

---

## Part 3 — Ontology

Defined so that two implementers would build the same thing. **Which layer each belongs to is part
of its definition.**

| Entity | Layer | Definition |
|---|---|---|
| **Work** | above all three | The enduring container. Nothing joins a Work except by member declaration (C1). |
| **Source Document** | Source | One arrival: extracted text, plus its provenance (filename, media type, page boundaries where the format had them). Immutable. A Work may have several over time. |
| **Furniture Observation** | Interpretation | A measured fact about the Source: *"this line repeats on 147 of 216 pages."* Evidence, carrying no judgement. |
| **Candidate** | Interpretation | A proposal: *"likely running head"*, *"possible chapter boundary at offset N."* Carries the method and confidence that produced it. Never rendered as structure. |
| **Structure Node** | Work Structure | A member-conferred part of the Work: a stable **identity**, a **name in the member's own words**, a **depth**, an ordered position among siblings, and an **anchor**. |
| **Unit-word** | Work Structure | The member's word for what their nodes *are* — chapter, movement, letter, session, argument, thread. **The schema has no `chapter` type.** Per `WORK_STRUCTURE_DESIGN`, the system never imposes "chapters" on a work that thinks in movements. |
| **Furniture Rule** | Work Structure | A member-accepted exclusion — *"ignore this running head"* — naming exactly what it excludes and from what (structural candidacy, rendering, or both). Reversible. |
| **Anchor** | Work Structure | Where a node currently sits in the living draft. See Part 4. |
| **Edition** | derived | A publication form, derived from a **declared revision**, carrying a snapshot of Work Structure as it stood at that revision. Later drafts are *offered*, never synced. |

**Depth is a number the member sets, not a type the system infers.** Promote and demote change
depth. Nothing else does.

---

## Part 4 — Anchoring and drift

The hard problem: a Structure Node must keep its identity while the writer rewrites the text
underneath it. Solve it wrongly and either structure detaches from the prose, or the system starts
re-deriving structure from prose — which is the prohibition this whole contract exists to enforce.

### The mechanism

**Primary — anchors move because the edit moved them.**
Every edit to the Working Draft passes through one client-side saver, and the shape of each edit is
known exactly: a replacement of range `[start, end)` with text of length *L*. An anchor at offset
*o* moves deterministically:

```text
o < start          →  unchanged
o >= end           →  o + (L - (end - start))
start <= o < end   →  the anchored text was edited; the node is TOUCHED
```

This is arithmetic, not inference. **No detection runs while the writer types.** The existing
`spliceFrame` / `frameAfterEdit` in `manuscriptMap.ts` already perform exactly this arithmetic for a
single frame and are tested; the mechanism generalises from one frame to *n* anchors unchanged.

**Fallback — content re-anchoring, only when the delta chain is broken.**
The chain breaks in known, bounded cases: a second device, a conflict resolution, a restore from a
kept revision, a client that reconnected. Then and only then, anchors are re-located by matching
their recorded text, forward, in declared order — `mapDraft`'s existing behaviour — and **anything
that cannot be located is reported as unresolved, never guessed at.** Yesterday's branch already
does the honest half of this: it names what it cannot find rather than dropping it.

**Deleted is deleted.** If a member deletes the text a node anchored to, the node has no anchor. It
is reported, and the member decides — re-anchor it, or let it go. The system never re-attaches a
node to text the member did not point it at.

> **3A requirement 2 — the location mechanism is delta arithmetic first, content re-anchoring only
> as a declared fallback, and unresolved anchors are always reported.** `manuscriptMap.ts` is the
> candidate implementation; `Worktable.tsx` is not preserved.

---

## Part 5 — The member acts

Every act below is a member gesture with a stated consequence and a way back. Nothing in this list
may happen automatically.

| Act | Layer changed | What it does | May never |
|---|---|---|---|
| **Accept candidate** | Work Structure | Turns one proposal into a Structure Node | Accept in bulk without the member seeing what is accepted |
| **Reject candidate** | Interpretation | Marks a proposal declined; it does not return on re-interpretation | Delete anything from Source |
| **Ignore furniture** | Work Structure | Creates a Furniture Rule excluding those occurrences from structural candidacy and (if chosen) rendering | Remove the characters from Source |
| **Split here** | Work Structure | Creates a new node beginning at the member's chosen point | Choose the point itself |
| **Merge** | Work Structure | Joins adjacent nodes; the absorbed node's name is offered for the merged node, never silently discarded | Merge non-adjacent nodes silently |
| **Promote / demote** | Work Structure | Changes a node's depth | Rename the node, or change the unit-word |
| **Rename** | Work Structure | Sets the node's name in the member's words | Propagate the name into the draft text without the member asking |
| **Reorder** | Work Structure | Moves a node among its siblings — **and moves its text with it**, as one splice through the ordinary save path | Reorder without moving text, leaving structure and prose disagreeing |
| **Restore structure** | Work Structure | Discards conferred structure and returns to a fresh Interpretation of the Source | Touch the Working Draft text |
| **Restore text** | Working Draft | Re-initialises the draft verbatim from Source | Happen without an explicit, separately-worded confirmation |
| **Re-interpret** | Interpretation | Recomputes candidates from Source, by an improved method | Alter existing Structure Nodes |

### Two restores, deliberately distinguished

**Restore structure** and **restore text** are different acts with different blast radii, and
conflating them under one "restore original import" button is how a writer loses a month of work.

- *Restore structure* is cheap and reversible in feel: the prose is untouched.
- *Restore text* discards the writer's changes since import. It must name what will be lost, and
  the kept-revision history must be reachable from the same moment.

> **3A requirement 3 — never offer a single "restore original import" control.** Two acts, two
> names, two consequences stated.

---

## Part 6 — Re-interpretation semantics

When Interpretation is regenerated — a better furniture detector, a new file format, a member
asking to *detect chapters again*:

| | Behaviour |
|---|---|
| **Structure Nodes** | Survive untouched. Their anchors are re-resolved; unresolved ones are reported. |
| **Furniture Rules** | Survive. A member's *"ignore this running head"* is not a candidate. |
| **Rejected candidates** | Stay rejected. Re-interpretation does not resurrect a declined proposal. |
| **Accepted candidates** | Are already Structure Nodes; they are not candidates any more. |
| **Everything else in Interpretation** | Replaced wholesale. |

The member-facing consequence must be stated before it runs: *"This will look at your manuscript
again and offer new suggestions. The structure you have already accepted, and the furniture you have
already told me to ignore, stay as they are."*

---

## Part 7 — Reconciling PR #995

#995 supplies the room and must keep it. Its structural authority is what changes.

**Removed:** the live regex derivation in `WritingSurface.tsx` —

```js
const marked  = /^(#{1,3})\s+(.+)$/;
const chapter = /^[Cc]hapter\s+\w+.*$/;
const caps    = /^[A-Z][A-Z0-9 ,'&\-—:]{3,80}$/;
```

— together with the `Heading` shape it emits and the `onHeadings` channel that carries it to the
page. Detection over the draft is what `WORK_STRUCTURE_DESIGN` § *Refused now* forbids, and the
third pattern is the same one that produced the founder's 216 false sections. **This is not a bug
fix; it is the removal of an authority the component should never have held.**

**Retained, unchanged:** the `CanvasShell` grammar (toolbar · navigator · easel · context, the easel
as the one scroll region), the weighted sheet, the four papers, per-deployment theming, the
remembered navigator width, batched autosize, and the save behaviour — which is already
byte-equivalent to the deployed slice.

**Replaced:** the navigator consumes **canonical Work Structure**. Its three visual weights, which
today come from three detected *kinds*, come instead from the member's own **depth**. The navigator
stops being a reading of the prose and becomes a view of the Work.

> **3A requirement 4 — #995 comes through the gate with its navigator reading declared structure.
> The shell, the easel, the papers and the save path are not re-litigated.**

---

## Part 8 — One structure, four presentations

C5, made concrete. All four read the same Work Structure; none of them may compute their own.

| Surface | Shows | Member acts available |
|---|---|---|
| **Navigator** | Nodes in order, weighted by depth; current position | Go to node |
| **Collapsed rail** | Position only | Expand |
| **Structure workspace** | The whole shape at once | Every act in Part 5 |
| **Manuscript stance** | One continuous measure | Go to node; nothing structural |

**The workspace is where structural acts live.** Navigator and rail navigate; they do not restructure.
That is what keeps "rail vs navigator vs destination" a disclosure question rather than three designs.

---

## Part 9 — What 3A deliberately does not settle

- **The arranging surface** (`WORK_STRUCTURE_DESIGN`'s third way shape arrives — *emergent from
  arranging*) still has no design. This contract gives it a substrate to stand on; it does not
  design it.
- **Which detection methods** Interpretation should use. The contract constrains detection's
  *authority*, not its technique. A better detector changes nothing above.
- **Whether the Working Draft's storage shape changes.** The contract needs anchors to be persisted;
  where they live is an implementation question for the build lane.
- **The Structure workspace's interaction design.** Named as unbuilt in Phase 3; still unbuilt.
- **Migration order, table names, or column shapes.** No migration is authorized here.

## What this document does not do

It does not authorize a build lane, lift the W8 freeze, merge #995, extend `Worktable.tsx`, rename
anything in the repository, or touch `/book-studio/canvas`. It defines the contract that the build
lane must satisfy when the freeze is lifted.
