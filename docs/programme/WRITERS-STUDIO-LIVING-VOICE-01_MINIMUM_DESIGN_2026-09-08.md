# WRITER'S STUDIO — LIVING VOICE · 01
## MINIMUM INTERACTION — DESIGN

**Authority** Founder Rulings LV-0 · LV-A · LV-B · LV-C · LV-E · LV-F · LV-G
**Status** DESIGN. ⛔ **Not built.** One question needs a ruling first (§5).

> Living Voice helps the writer encounter more possibilities in their own
> writing. It does not determine what the writing should become.

---

## 1 · THE THREE TERMS, AS STATE

LV-B needs three separations where FR-14 needed two. Each is a different kind
of thing and none may stand in for another:

```text
GRANT     "I am open to this attention while I am here."
          Entering Living Voice.  ⛔ NOT stored.

SUBJECT   "This passage."
          A selection. Establishes what. Invites nothing.

OCCASION  "Explore this."
          An explicit gesture. The only thing that reaches a model.
```

**The grant is deliberately NOT persisted in v1.** A stored "Kelly writes in
Living Voice" is one refactor from a preference, and a preference about how a
person writes is the first millimetre of a voice profile (LV-C). The writer
enters the practice; when they leave, they have left. Re-entering is one click,
and costs nothing but a click.

## 2 · WHERE IT LIVES

**Not a rail destination.** Living Voice is a *stance*, not a room — the rail
answers "where can I go", and this is not a place. It is a mode the WRITE room
can be in.

**Not an appearance value (LV-0).** It may use `atmosphere/` primitives for
visual coherence, and choosing charcoal must never change what MAIA does. The
cleanest expression of that: **Living Voice reads no appearance state, and
appearance reads no Living Voice state.** Two modules that never import each
other are two things that cannot silently couple.

## 3 · THE INTERACTION

```text
1  writer enters Living Voice                            grant
2  writer selects a passage of their own                 subject
3  "Explore this passage" appears                        offered, not fired
4  writer clicks it                                      OCCASION
5  MAIA offers 1–3 lenses, or the writer names one
6  MAIA notices · asks · points — NEVER rewrites
7  the writer writes
```

Step 3 is the whole of LV-A. The control **appears** on selection; it does not
**act** on selection. Nothing is sent until step 4.

## 4 · THE LENSES (LV-F)

```text
SEE IT       give the reader something they can picture
FEEL IT      let the feeling live in something concrete
HEAR IT      listen to the rhythm of the sentence
GO CLOSER    is there something you're circling that you want to
             approach more directly?
CLARIFY IT   does the writing know what it is doing?
```

⛔ `SIMPLIFY` does not exist. ⛔ `RISK IT` does not exist. ⛔ No sixth lens is
added to make the set feel complete.

**Nothing about a lens is persisted.** A lens is a way of looking that a writer
picked once, not a fact about them (LV-C, flow §4).

## 5 · ⚠️ THE QUESTION THAT NEEDS A RULING — a new perception path

**Every existing MAIA path in the Studio refuses to send manuscript prose.**
`askClient.ts` says so in terms:

> *ONLY IDENTITY AND WORDS GO UP THE WIRE… no manuscript prose is ever sent, so
> the server cannot be TOLD what the reading says — only asked about the one it
> already holds.*

The developmental reader is the sole prose path, and it is bounded, digest-
verified, frozen and coverage-declared.

**Living Voice needs the passage itself.** *"Can the reader picture this?"* is
unanswerable without the sentence. So this would be **the first path where
manuscript prose travels because the writer pointed at it.**

That is a genuinely different act from *reading the Work* — the writer selected
it, this turn, deliberately. But it is still prose leaving the room, and this
lane may not open a perception path on its own.

```text
LV-H   May a writer-selected passage be sent to MAIA as the subject of an
       explicit Living Voice occasion?

       If yes:  bounded by what?  a character ceiling?  one selection?
                may it be stored, or must it be turn-local like the occasion?
       If no:   Living Voice cannot work on the writing itself, and the
                lenses become questions about writing in general — which
                is a different and much weaker product.
```

**Recommended: yes, bounded and turn-local** — a single member-selected
passage, capped, never stored, never accumulated across turns, and structurally
separate from the developmental reader's coverage machinery so it can never be
mistaken for a reading. But this is a perception ruling and it is the founder's.

## 6 · WHAT THE RESPONSE MAY BE

Reuses the shape that already exists rather than inventing one:

```text
STRUCTURALLY INCAPABLE OF A WRITE     as askClient is
NO SCORE                              assertNoMemberFacingScore already refuses
NOTHING ENTERS THE MANUSCRIPT         adoptionRequiresGesture is already law
SILENCE IS LAWFUL                     FR-16, unchanged
```

**A checker like Phase 1's is the right instrument**, and its prohibitions are
already named by the flow and LV-E: no *strong · weak · better · improve ·
needs · should*, no comparison to writing in general, no rewrite of the
writer's sentence offered as the answer, no claim the passage lacks anything.

> Where MAIA offers example language it must be **clearly optional and separate
> from the manuscript until the writer explicitly adopts it** (flow §9).

## 7 · WHAT IS NOT IN THIS DESIGN

```text
elemental lenses                    LV-G — deferred
voice anchors                       LV-C — lawful shape, not v1
persisted grants or lens history
automatic rewriting
any youth-specific behaviour        flow §14 — separate gate
a second theme engine               LV-0
```

## 8 · HOW IT WOULD BE TESTED

Three Works, **not three writer types** (LV-authorization):

```text
lyrical / poetic prose
memoir / personal writing
teaching / practitioner prose
```

> **Did this help me hear more possibilities in my own writing without making
> me feel corrected, graded, or rewritten?**

## STANDING

```text
RULINGS         CONSTITUTED
DESIGN          this document
OPEN            LV-H — the perception question at §5
BUILD           NOT AUTHORIZED
PRODUCTION      untouched
```
