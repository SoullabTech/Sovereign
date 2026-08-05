# Materials & Gathering — Design (Work Continuity Layer, Step 3)

> **Status**: Second design object of the Work Continuity Layer lane, after
> the accepted Work drawer design (`WORK_DRAWER_DESIGN_2026-08-05.md`).
> Design only — **authorizes no implementation, no schema.** The governing
> question, set by the founder on accepting the Work drawer:
>
> > **"What does a creator need to do for something to become part of a
> > Work?"**
>
> A repository answers *"what files exist?"* A creative environment answers
> *"what belongs here?"* This design answers the second question and refuses
> the first. Unifying test: **who makes the meaning?** — the creator.

---

## The core design decision: a material is a belonging, not a thing

The Materials layer stores **relationships, never copies**. A material is:

> *a thing the creator has declared feeds this Work, in their words, with
> the thing itself staying exactly where it lives.*

Three consequences, each load-bearing:

1. **The thing keeps its home.** A journal entry stays in the journal; a
   manuscript keeps its Source; a recording stays a recording. Declaring
   that something feeds a Work moves nothing, alters nothing, copies
   nothing. (The preservation vow, extended: renewal never overwrites, and
   belonging never relocates.)
2. **The relationship is the content.** What the drawer renders first is
   the creator's own sentence — *"the quote that shaped the argument"*,
   *"the 1991 workshop notes this grew from"* — and the thing's name
   second. The relationship line is optional free text in the creator's
   words. ⛔ The system never classifies, tags, or types a material's
   meaning; there is no taxonomy to pick from, only their sentence.
3. **Un-belonging removes the relationship, never the thing.** The creator
   can say "this no longer feeds this work" and nothing anywhere is
   deleted.

## The belonging gesture

One gesture, available wherever a creator meets their own things:

> **Bring this to [work].**

- From an import: *bring this manuscript to "The Returning Field."*
- From a journal entry, a note, a captured fragment, a conversation
  moment the member has kept: the same gesture.
- From inside the Canvas: the Materials drawer offers *bring something in*
  — which opens onto the member's own things, never a file dialog first.

**The crossing is the consent event.** Nothing becomes a material of a
Work except through this member gesture — not on upload, not on import,
not by MAIA, not by "smart" suggestion. This is the same law the platform
already ruled for Capture ⇄ Keep, appearing here because it is the same
moment: a thing crossing from *mine* into *part of this*.

### Origins are materials with an origin-shaped sentence

The Work drawer's Origins register and the Materials drawer draw from
**one grammar**: an origin is a material whose relationship the creator
phrased as beginning — *"this began as…"*, *"this continues…"*, *"renewed
from…"*. No second system, no separate origins table concept. The drawer
renders origin-shaped belongings in the Origins register; everything
belongs in Materials.

## Gathering: the elder's arrival, designed

Gathering is the belonging gesture **made cheap at volume**, for the
creator who arrives with decades of material and no formed work:

- Many things can be brought to a loosely named work in one sitting; each
  arrives as a belonging with no relationship sentence yet — **an unwritten
  sentence is a correct state**, not a gap. The creator writes sentences
  when meaning arrives, or never.
- Gathering does not ask the creator to organize. Arranging materials into
  threads on the development surface, and any structure they take, is the
  creator's later act (and partly Structure's territory — Step 4).
- Discovery help exists only through the Window, invited: *"what themes
  run through these?"* — and MAIA's answer may only quote and connect the
  member's own material, offering threads the member may adopt. The system
  never pre-organizes the archive. (Offer · preserve · adopt, again.)

## What the Materials drawer shows

- Belongings, newest last-touched first, each as: **the creator's
  sentence** (when written) · the thing's name · where it lives (its home,
  stated plainly: "from your journal", "an import", "brought in").
- **Bring to the table**: a material can be set beside the worktable while
  working — placed and dismissed by the creator, remembered per work.
- The honest empty state v0.1 already has. One amendment to v0.1 language:
  the manuscript's Source stops impersonating this layer — *Your Source*
  is provenance of the draft and remains visible, but the drawer's frame
  becomes "what feeds this work," with the Source as one true item in it
  rather than the whole answer.

## What Materials is NOT (refused now, so it need not be refused later)

- ⛔ A repository, file manager, or sync target.
- ⛔ Auto-ingestion of anything ("we noticed you wrote a journal entry —
  add it to your book?"). Ambient suggestion is the surveillance pattern
  with a helpful face.
- ⛔ AI organization, auto-tagging, similarity clustering, or "smart
  collections."
- ⛔ A copy machine. No duplication-then-divergence; the thing stays home.
- ⛔ A permissions surface. Whose things can feed a work is not designed
  here; materials are the creator's own things until the collaboration
  model exists.

## Consent seams (constitutional, inherited)

- Journal entries, kept moments, and conversation material cross into a
  Work **only by the member's own gesture**, one thing at a time or in a
  gathering they perform. Sanctuary content can never cross (nothing from
  Sanctuary exists to be brought).
- A belonging is member-scoped like everything else; no other member's
  things are reachable.
- MAIA may be *shown* materials (the Window, invited) but can never create,
  suggest into being, or annotate a belonging.

## Substrate implied (named for the future ruling — NOT authorized)

The design implies one new record: **a belonging** — work · a reference to
the thing (typed by where it lives) · the creator's relationship sentence ·
declared-by · declared-at. It is the sibling of `living_work_expressions`
(declared *forms*) — same declaration grammar, different relationship
(*feeds*, not *is a form of*). Whether these become one general declaration
substrate or two sibling tables is an implementation-slice question, ruled
then, not here.

## The walk this design must survive

Before any slice is ruled: walk the five personas through Materials on
paper — the scholar's sources, the elder's gathering, the novelist's
research notes, the blogger's screenshot folder, the collaborator excluded
(held) — asking at each step the governing question: *what did the creator
have to DO for this to belong?* If any answer is "nothing — the system did
it," the design has failed at that point.
