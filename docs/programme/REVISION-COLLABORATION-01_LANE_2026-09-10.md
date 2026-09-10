# REVISION-COLLABORATION-01 — MAIA's safe hands

**Opened by founder act, 2026-09-10.**

## The finding

MAIA already has the intelligence to work through edits. She reads authorized
prose, notices developmental issues, discusses them, and can generate specific
revision language — the real-model developmental conversation was witnessed
end-to-end today at Step 7. `ObservationDialogue` handles the conversation, body
authorization and same-thread continuation.

**What is missing is not a smarter model. It is the mechanism that gives her
hands.**

```
IMPLEMENTED                       ABSENT
read authorized prose             propose a concrete revision
understand it                     show it against the manuscript
talk with you about it            work sentence by sentence
suggest what might change         apply an accepted edit
```

## The authority model (founder-ruled)

```
MAIA CAN          suggest · rewrite · compare · explain
                  offer alternatives · prepare a concrete revision

WRITER CAN        accept · reject · alter · combine · apply

MAIA CANNOT       silently alter the manuscript
```

⭐ **Proposal authority, not write authority.** A generic "edit the document" tool
is refused: it would let conversation become writing authority.

⭐ **`WRITER CAN alter` settles the provenance of a modified proposal.** The writer
editing MAIA's words before adopting them is the writer's authorship. Provenance
records that she proposed and he altered; nothing blurs.

## The path

```
you: "let's edit this"
      ↓  MAIA proposes an actual change
      ↓  Studio shows it against your manuscript
      ↓  you revise / accept / reject
      ↓  accepted change enters the Work
      ↓  provenance records what happened
```

## ⭐ Two of the hardest parts already exist and are accepted

**Proposal authority — `manuscript_structure_proposals` (WS2-05A).** Exactly this
pattern, already ratified for structure:

> *"Until adoption, a manuscript with a proposal has exactly the same [structure]
> … a record of what the system proposed."*

Immutable after the fact (*"what the system proposed cannot be revised"*), adoption
stamped once with its review revision, one adopted proposal at a time, and **a
proposal whose original has moved is refused adoption rather than relocated**.

**Staleness — `locateCurrent` (BUILD-07A, accepted 2026-09-03).** The founder's
requirement — *"if the manuscript has changed underneath it, the proposal becomes
stale and must not silently relocate"* — is already built:

> *"three-state, never two … a surface that silently fuzzy-matches a moved passage
> is `unmeasured`, never `current`."*

`current` · `superseded` (naming what moved) · unmeasured. Digest-verified, scoped
per ref, **never fuzzy**.

## So the new surface is smaller than it looks

```
EXISTS                              NEW
proposal-authority pattern          prose revision proposal store
bounded target + provenance         MAIA producing a typed proposal
staleness, never relocated          diff / preview against the Work
lawful prose reading (S3)           accept · reject · alter
one-use authorization               application to the working draft
same-thread conversation            DEVELOP ↔ WRITE continuity (the bridge)
section-addressable manuscript
writer-controlled Focus
provenance infrastructure
```

Five new things over proven foundations — and the two carrying the sovereignty risk
are the two that already exist.

## What a proposal must carry

```
manuscript · section
the revision it was based on
the bounded original (EvidenceRef + readState digest)
the proposed replacement
the reason
provenance — who proposed, under what authority, from which reading
```

⛔ A proposal is **not manuscript text**. Until the writer accepts, the Work is
byte-identical. This is the structure-proposal rule, carried to prose.

## First increment — R1 · PROPOSE AND SEE, NOTHING APPLIES

```
IN                                  OUT OF SCOPE FOR R1
MAIA produces a typed revision      applying to the working draft
  proposal from the conversation    accept / reject / alter
it is stored as a proposal          DEVELOP ↔ WRITE continuity
the writer sees it against their
  own text, in the conversation
staleness is shown, never repaired
```

**Rationale:** it is visible — a real proposal against the writer's real
paragraph — and it **cannot damage the Work**, because no application path exists
yet. It proves the intelligence produces usable revision language and that the
diff reads truthfully. Application, with its provenance and staleness guards,
follows as R2.

This mirrors the structure-proposal precedent exactly: *a proposal changes nothing
until adoption.*

## Standing

```
D9 Canvas architecture      KEEP
S3 authority architecture   KEEP
STEP 7 / S3 disclosure      CLOSED

MAIA as working editor      NOT BUILT — this lane
REVISION-COLLABORATION-01   OPEN
first increment             R1 · propose and see
MERGE                       NOT YET
PRODUCTION                  UNTOUCHED
```
