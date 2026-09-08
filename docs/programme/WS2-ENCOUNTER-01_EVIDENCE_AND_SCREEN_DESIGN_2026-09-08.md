# WS2-ENCOUNTER-01 — Evidence reference & authorship-aware screening · DESIGN

**Status: DESIGN ONLY. Nothing implemented. No coordinate repair performed.**
Date: 2026-09-08 · Branch: `claude/studio-bring-work-back-icvfaa`
Authorizing act: founder ruling 2026-09-08 (G8 FAIL) — two repairs opened for design.
Evidence: `WS2-ENCOUNTER-01_G8_FIRST_LIVE_WITNESS_2026-09-08.md`.

⛔ Still forbidden without a new evidence ruling: fuzzy search · nearest-span relocation ·
automatic quote lookup as a *repair* · quote-to-coordinate substitution · a second model
correcting the first · retry until coordinates happen to work.

---

# PART A — What Encounter may use as its evidence reference

## A1 · The principle the failure points at

G8 proved the current chain establishes **identity** and never **correspondence**. A design
that fixes this by having the server *find* what the model meant would be the forbidden
repair wearing a new name. The alternative principle:

> **Correspondence is proven by requiring two claims the server can check against each other,
> where disagreement REFUSES rather than reconciles.**

The server never interprets and never relocates. It compares, and a mismatch drops the
notice. That is the same discipline as S4's evidence binding — *the boundary holding the
evidence establishes the proof* — extended from "is this span real" to "is this span the one
the observation came from."

## A2 · What the model can and cannot do, from live evidence

| | |
|---|---|
| reproduce prose it has just read | ⭐ **reliably** — every quotation was real |
| count characters to locate that prose | ⛔ **unreliably** — drift of +422 / +499 / +1808, growing with distance |
| select from an enumerated list | untested here; generally reliable |

**The current contract asks it for the one thing it cannot do, and ignores the one thing it
can.** Any candidate representation should be judged against that asymmetry first.

## A3 · Candidate representations

**A3.1 — Coordinates alone (current).** Fabricated or drifted coordinates always bind,
because invented coordinates still *exist*. Fails, demonstrated.

**A3.2 — Verbatim quotation as the primitive.** The model proposes the text it noticed; the
server locates it by exact search within the visible window and computes the span itself.

- ⭐ **Fabrication becomes mechanically detectable** — a quote that is not in the Work matches
  nowhere and cannot bind. Coordinates could never do this. The evidence primitive determines
  which class of error is *catchable at all*.
- ⛔ **Repeated identical passages are the hard case**: two occurrences of the same sentence
  give no basis to choose, and choosing would be interpretation.
- ⚠ Brittle to normalization — a curly apostrophe rendered straight fails to match. Failure
  is safe (drops the notice) but frequent failure means Encounter falls silent for mechanical
  reasons, which is *not* lawful silence.

**⚠ A ruling is needed before this is even a candidate.** The founder forbade "automatic quote
lookup". This design reads that prohibition as barring quote lookup **as a repair to a
coordinate claim** — keeping coordinates as the asserted primitive while quietly correcting
them. Making quotation *the* primitive means no coordinate claim exists to repair. **Those may
be the same thing in the founder's intent, and this document does not assume otherwise.**

**A3.3 — Server-enumerated units.** The server segments the window into numbered units and
shows the model the numbering; the model cites unit ids; the server maps id → span from its
own table.

- Plays to selection rather than counting; repeated passages are unambiguous (distinct ids).
- ⛔ **Does not fix the failure.** A model that means unit 9 and writes unit 7 produces a
  faithful proof of the wrong unit — *the identical defect*, one granularity up.
- ⚠ Constitutional question: is numbering paragraphs *structure*? The transport-window
  argument suggests not — mechanical partitioning is not asserted hierarchy — but E2 §1
  deliberately refused to inherit section-addressability, and this must not become sections by
  another route.

**A3.4 — Redundant claim: unit id **and** verbatim excerpt, server verifies the excerpt occurs
within that unit.** Disagreement refuses.

- ⭐ Both failure classes become detectable: a wrong location disagrees with the quote; a
  fabricated quote occurs in no unit.
- ⭐ The server does an `indexOf` inside one unit — **not interpretation, and not a search for
  where the model *meant***.
- Repeated passages are handled by the unit id; misquotation is handled by the excerpt.
- Cost: the model must supply two things and be right about both. Some lawful notices will be
  dropped for clerical reasons. **Failing closed is correct here, but it is a real cost and
  should be measured, not assumed away.**

## A4 · The questions, answered as far as design can

| Question | Answer |
|---|---|
| What may the model propose? | Its own words, plus *some claim about where it looked* — the open question is which claim it can make honestly |
| What does the server independently establish? | The span, its digest, and **whether the model's two claims agree** — never which claim was "meant" |
| Model recognized the right prose, supplied the wrong location? | Under A3.1 and A3.3 it is **undetectable**. Under A3.2 and A3.4 it **refuses**. This is the discriminating question |
| Repeated identical passages? | A3.2 cannot resolve them without interpreting; A3.3/A3.4 resolve them by construction |
| Correspondence without a semantic interpreter? | Yes — `indexOf` and table lookup are identity operations. **What cannot be mechanized is whether the passage *justifies* the noticing**; that stays with the ear |

⛔ **This design does not select an option.** A3.4 is the only candidate that catches both
failure classes, and it is also the most demanding of the model — that trade is a founder
question, and A3.2's admissibility is a prior founder question.

---

# PART B — Authorship-aware structural screening

## B1 · The defect is two defects

G8 rejected three lawful notices. Re-reading the notice text shows **only one** was the Work's
words mistaken for MAIA's:

```text
"trying to coax me away"        the WORK's words, inside a quotation   → boundary fixes it
"has no main verb"              MAIA's OWN assertion                   → boundary does NOT
"the problem is not named"      MAIA's OWN assertion                   → boundary does NOT
```

**Defect B1 · no authorship boundary.** The screen reads assertion and quoted evidence as one
utterance. *A Work may contain language MAIA is forbidden to assert; quoting it does not make
MAIA its author.*

**Defect B2 · lexicon over-breadth inside MAIA's own words.** `has no` fired on a grammatical
description; `problem` fired on an object in the narrative. The constitutional question is
about a **move**, and the instrument matches **tokens**.

## B2 · A structural boundary, not punctuation

Quotation marks are presentation syntax and are not trustworthy provenance, so the boundary
must live in the proposal's shape:

```text
notice {
  assertion   MAIA's own words          → SCREENED
  evidence    verbatim Work material    → NOT screened as MAIA's vocabulary
}
```

⭐ **The two parts of this document interlock.** An authorship boundary is only trustworthy if
`evidence` is *verifiably* the Work's own words — which is exactly what Part A must establish.
Without Part A, `evidence` is an unscreened channel a generator could smuggle a diagnosis
through by labelling it a quotation. **Part B should not ship before Part A.**

Two further guards the shape needs:

- **The assertion may not be evacuated.** A notice whose assertion is empty or vacuous while
  the evidence carries the noticing has moved MAIA's claim into the unscreened half.
- **Evidence is not a place to say things.** Only material that binds under Part A counts as
  evidence; anything else is assertion, and is screened.

## B3 · B2's residue cannot be regexed away

`has no` and `problem` are not fixable by a better word list — narrowing them would blind the
screen to real deficit claims, and widening it produces exactly these false rejections. The
distinction between *"the paragraph has no main verb"* (a description of the text) and *"the
chapter has no clear theme"* (a verdict about the Work) is **the move, not the vocabulary**.

> The mechanical screen can be made more accurate. It cannot be made sufficient.

That is the ruled two-evidence-class architecture, and G8 has now supplied live evidence for
why it was ruled that way. Any narrowing of the lexicon should be paired with a corresponding
addition to the semantic-ear corpus, so accuracy gained mechanically is not accuracy *claimed*
mechanically.

---

## Standing

⛔ Nothing implemented. No lexicon changed, no screen re-scoped, no evidence primitive
altered, no coordinate repaired, no witness re-run.

> ⭐ **SUPERSEDED IN PART, 2026-09-08 (same day), by founder ruling and the repair it
> authorized.** Kept verbatim because it was true when written. What changed: A3.2
> quotation-as-primitive was ruled **lawful and selected** (exact / unique / else no bind);
> server-enumerated units were **NOT** selected; Part A landed and Part B landed only as the
> structural boundary Part A makes possible — **the lexicon is still unchanged and the screen
> is still not re-scoped**. Record: `WS2-ENCOUNTER-01_EXACT_EXCERPT_REPAIR_2026-09-08.md`.
> ⛔ **"No witness re-run" remains TRUE and is the open obligation.**

Owed to the founder: **(a)** whether A3.2's quotation-as-primitive is barred by the
"automatic quote lookup" prohibition or is a different act; **(b)** which representation Part A
should pursue, given that only A3.4 catches both failure classes and it is the most demanding
of the model; **(c)** whether server-enumerated units are admissible at all, or are
section-addressability returning by another route; **(d)** confirmation that Part B does not
ship before Part A.

> The server proved what it was asked to prove. The next design must decide what it should
> have been asked.
