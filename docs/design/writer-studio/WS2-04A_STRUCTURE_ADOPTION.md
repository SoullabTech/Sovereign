# WS2-04A — Structure Adoption

**Status:** design return. No schema, no writes, no implementation.
**Grounded on:** census `ef411a38`, boundary analysis `ca7b7063`.

The census settled it: **Elemental Alchemy (KDP print) is `EDITED`** — 174
sections, draft 380,675 chars against a 380,329-char Source composition, first
divergence at char 2,452. The flagship book cannot be migrated automatically,
and four of eight drafts are in the same position or have no Source at all.

So the substrate is not the hard part. This is:

> How does a writer make a draft they have already written in navigable,
> without the system deciding which of their words belong to which chapter?

---

## 1 · The reconciliation algorithm

**Anchoring, not similarity.**

Composition is deterministic, so every Source section has an exact offset in
the text the draft *started* as. The longest common prefix and longest common
suffix between the recomposed Source and the current draft are byte-identical
**by definition**. A boundary lying outside the changed span is therefore
located *exactly, by identity* — not by resemblance.

No heading text is matched. No fuzzy score. No confidence threshold anyone has
to trust. The instrument proposes; **identity** decides.

### Sound, not complete

Prefix/suffix anchoring collapses scattered edits into one span: two small
changes at opposite ends of a book make everything between them read as
uncertain, though most of it is untouched.

The error therefore runs **one way only — toward asking the writer.** Everything
called `MATCHED` is provably matched. A finer alignment (Myers) can later move
boundaries *into* resolved; nothing can move one out. Refinement is an
optimisation of how much review is asked for, never of what is asserted true.

---

## 2 · Boundary states

| state | meaning | mechanically decided? |
|---|---|---|
| `MATCHED` | boundary outside the changed span; body untouched | yes |
| `CHANGED` | boundary outside it; body edited — correspondence still unique | yes |
| `AMBIGUOUS` | boundary falls inside the changed span | yes, as *uncertainty* |
| `UNRESOLVED` | this section no longer exists | **no — writer only** |

`UNRESOLVED` is deliberately not derivable. Nothing mechanical may conclude
that a writer deleted a chapter; only the writer may say so.

---

## 3 · The member-facing act

**Adoption is a partition, never a transformation.** No character of the
draft changes. Boundaries are introduced into text that stays byte-identical.

```
Make this draft navigable

Your manuscript came in with 174 sections. This draft has changed since then.
We can show you where those sections appear to fall now — you decide.

                                                    [ Review structure ]
```

The review surface then:

- **summarises** everything mechanically resolved — *"168 sections located
  exactly"* — collapsed, not enumerated. No ceremonial confirmations.
- **lists individually** every `AMBIGUOUS` boundary, with the surrounding text
  and one question: where does this section begin?
- lets the writer mark a section `UNRESOLVED` — gone.
- enables **`Use this structure`** only when nothing uncertain remains.
- **Cancel changes nothing.** The continuous draft stays authoritative.

*The shape of this screen is contingent on the boundary analysis. If most of
the 174 resolve, it is one screen and a handful of questions. If most do not,
prefix/suffix anchoring is too blunt for this book and the finer alignment has
to come first — that is a real result, not a failure.*

### NO-SOURCE drafts

A draft never composed from a Source has nothing to reconcile against. The
writer creates boundaries themselves. Nothing is proposed, because there is
nothing to propose from — and manufacturing chapter breaks for a blank page
would be the guess this whole design exists to refuse.

---

## 4 · Conversion and rollback

One transaction:

```
1  INSERT the current continuous content verbatim as a revision
      note: "Before structure adoption"  →  an immutable rollback point
2  INSERT ordered draft sections (stable id, source_section_id as
      provenance only, position, heading, content)
3  ASSERT  concat(sections) === original content     ← the safety property
4  mark the draft structured; content becomes DERIVED
COMMIT
```

**Step 3 is the guarantee.** Because adoption is a partition, concatenating the
new sections must reproduce the draft byte-for-byte. If it does not, something
was lost or altered — abort. Adoption cannot silently change a writer's prose,
because a transaction that would have is refused.

Failure at any step aborts; the continuous draft remains authoritative and
untouched. There is no partial state: a draft is continuous or structured,
never mid-conversion.

The rollback point uses the **existing** revision mechanism, so it is
restorable by code that already exists rather than a bespoke undo.

---

## 5 · How existing revisions survive

Revisions become bimodal, and the seam is explicit rather than smoothed over:

- **Pre-structure revisions** (every current one) are continuous text with no
  section identity. They cannot be retro-fitted — for exactly the reason the
  draft could not be.
- **Post-adoption revisions** preserve the ordered section set atomically, with
  whole-manuscript text retained as a derived representation for export.

Restoring a pre-structure revision **returns the draft to continuous mode**,
explicitly, and offers adoption again. It does not attempt to re-apply the
current section map to older text — the boundaries were established against
different prose, and reusing them would be the same guess in a new place.

That is the honest cost of structure adoption, and it is worth stating to the
member at the moment they restore rather than discovering later.

---

## What is NOT proposed here

Chapter-click navigation, section reordering, Structure mode, AI restructuring,
any change to MAIA, and any mutation of `manuscript_sections` — which stays
immutable Source throughout. Once a draft is section-addressable, clicking
Chapter 13 becomes an id lookup and a `scrollIntoView`, with no text matching
anywhere. That is WS2-04B, and it is small once this exists.
