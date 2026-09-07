# WRITERS-STUDIO-WRITE-SELECTION-MAIA-01 · Step 2 · RECONCILE

**Read-only.** No code, no schema, no new MAIA path. Evidence class `L` — source read on `50f5531c9`.

---

## 0 · A correction to DISCOVER, first

DISCOVER reported the anchor union as `work | proposal | division`. **It has eight members**, and
two of them matter here: `{ on: 'section'; sectionId }` and `{ on: 'concern'; sectionIds[]; unitId? }`.
The first grep returned three lines and was written up as the whole union.

The conclusion survives — there is still no **passage** kind — but the substrate is closer than the
census claimed, and one of the two seams below turns on a member the census did not report.

## 1 · PASSAGE ANCHOR — fits the union, breaks the reader

**Where it belongs:** as a ninth member, beside `section`. The union's own doctrine settles the
shape — *"a discriminated union with no shared optional fields… a shape that cannot hold a proposal
cannot be filled with one by a surface that forgot to check."* So the ruled evidence is carried as
required fields, not optionals:

```ts
| { on: 'passage'; sectionId: string; start: number; end: number; text: string; digest: string }
```

**`checkAnchor` needs one arm and no new rule.** Its invariant is *proposal-dependent anchors
require a frozen reading; `work | section | concern` may have `reading === null`.* A passage is
reading-independent for the same reason a section is — the writer pointed at it, no reading
mediates — so `case 'passage': return { ok: true, anchor }` sits beside `case 'section'`. **This is
what makes falsifier 4 structural rather than a policy:** a passage anchor cannot require Work
resolution, because nothing in the coherence rule can ask it to.

**Staleness extends without a new dimension.** `StalenessState` already carries `inputMoved` as a
genuine three-state — and its `unmeasured` copy is already written: *"You cannot verify whether the
prose has changed since you read it… Do not assert what the text currently says."* A passage anchor
turns that dimension from `unmeasured` to measurable for the first time, because the anchor carries
the digest the comparison needs. **Nothing new is designed; a dimension that exists stops being
blind.**

## 2 · ⛔ THE GENUINE INCOMPATIBILITY — the Ask reader carries no prose

This is the finding to rule before BUILD.

```
askReader.ts:112   case 'section':
                     return `The author is asking about section ${a.sectionId}.`
```

**MAIA receives the id, never the text.** And it is deliberate, stated in the module:

> `inputMoved` is unmeasured in this slice **by construction** — measuring it needs the bodies, and
> **this slice reads none** — so MAIA is told she cannot verify the prose is unchanged.

So the Ask path is architecturally prose-free, and this lane's north star requires prose: *when the
writer points to their own words, MAIA may attend to exactly what they pointed to.*

⛔ **This cannot be resolved by implementation choice.** It is a change in what the Ask boundary
carries, and it needs a founder ruling. Two shapes, and they are not equivalent:

| | what changes | what it costs |
|---|---|---|
| **A · anchor-carried** | the passage anchor already carries `text`; the reader renders it | the boundary stays prose-free *as a rule about lookups* — nothing reads bodies, the client supplies what the writer selected, the server re-verifies it verbatim |
| **B · reader-resolved** | the reader loads the passage from the draft | the reader begins reading bodies; `inputMoved`'s "this slice reads none" ceases to be true for every anchor kind, not just this one |

**A is the smaller change and the one the ruled evidence already implies** — the anchor was ruled to
carry a server-verified text snapshot, which only makes sense if the snapshot is what travels. It
also keeps the existing precedent intact: `POST /keeps` already takes `{ sectionId, text }` and
**re-verifies the text exists verbatim in that member's own section before writing**. *Keeps cannot
originate text.* A passage anchor verified the same way cannot either.

## 3 · ADOPTION — no new mutation seam exists or is needed

**The smallest safe seam is `putDraftSections`**, already used by both live surfaces. Replace and
Insert below are both *"read the section, splice, write the whole section back"*:

```
Replace selection  → section.text[0..start] + revision + section.text[end..]
Insert below       → section.text[0..end]   + "\n\n" + revision + section.text[end..]
```

It already carries `baseRevisionId` + `idempotencyKey`, so adoption inherits the draft's existing
optimistic concurrency and idempotency rather than inventing either. **No new command, no new
store, no new provenance object.** A proposal stays an Ask-thread turn until this call is made,
which satisfies falsifier 6 by construction.

**Re-verification before mutation is a repeat of a ruling already made.** The Circles FR-18 pattern
applies exactly: *the authority is the mutation, not a precheck.* A read-then-splice that verifies
the digest before writing is precisely the shape founder review rejected in `093379e8d` — the
window between reading and writing is where the writer's own keystroke lands. **The digest must be
checked against the section state the write itself is based on** (`baseRevisionId`), not against a
separately-read copy. Falsifier 8 is otherwise a race, not a guard.

## 4 · The two surfaces — ONE contract, and a third state that is neither

**Answer: one contract, no adapters — but it serves only a section-addressable draft.**

| surface | representation | passage anchor |
|---|---|---|
| `SectionWritingSurface` | draft sections | ✅ ids exist |
| `Worktable`, addressable | draft sections (`putDraftSections`) | ✅ same ids, same seam |
| `Worktable`, continuous | `{ mode: 'continuous'; content: string }` | ⛔ **no draft-section ids exist** |

Worktable is not a second representation — it *branches* on `current.addressable` and uses the same
section path when it can. So both live surfaces share one contract wherever the draft is
section-addressable.

⛔ **The continuous path cannot carry a passage anchor at all.** There are no draft-section ids to
anchor to: `write-state` returns `content: string` and nothing else. That is not an adapter problem
— an adapter would have to *invent* an identity the substrate does not have, which is the trap that
would have made the DEVELOP scope door silently refuse everything.

**Recommended posture, for ruling:** the gesture does not appear on a continuous draft, rather than
appearing and refusing. `continuous` and `continuous_unprovable` both already carry a `notice` the
room shows; a selection gesture that cannot work is not an offer.

## 5 · Verdict

The substrate fits cleanly at two of three seams and **does not fit at one**:

```text
PASSAGE ANCHOR   ✅ one union member · one checkAnchor arm · staleness gains sight
ADOPTION         ✅ putDraftSections, unchanged · concurrency inherited · no new store
ASK CONTEXT      ⛔ the reader carries no prose, by construction — RULING REQUIRED
TWO SURFACES     ✅ one contract; ⛔ continuous drafts are out of scope by substrate
```

## 6 · Owed before BUILD

1. **Rule §2** — anchor-carried (A) or reader-resolved (B). A is recommended and is what the ruled
   evidence implies.
2. **Rule §4** — gesture absent on continuous drafts, or present and refusing.
3. Falsifiers 1–10 pinned as tests.
4. The five-point Writer's Studio witness, which still holds BUILD independently.

⛔ Nothing built. No branch beyond this lane's docs. No UI.
