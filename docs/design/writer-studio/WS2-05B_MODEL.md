# WS2-05B — MODEL

**Stage:** MODEL. OBSERVE and GROUND are in the charter; BUILD is on HOLD
pending WS2-05A-R1's real-book witness.
**Answers:** the six questions Kelly set before BUILD, plus the negative
acceptance case.

---

## Q1 · What exactly is `StructureEvidence`?

A typed record of **observations**, each a fact with positions and counts.
Computed mechanically. It contains no divisions, no names, no boundaries and no
confidence.

```ts
interface StructureEvidence {
  manuscriptId: string;
  sectionCount: number;
  observations: Observation[];
}

type Observation =
  /* ≥3 adjacent sections whose headings are all structural labels. */
  | { id: string; kind: 'label-run'; from: number; to: number; labels: string[] }
  /* "CHAPTER 1 … CHAPTER 10" — including which numbers are missing. */
  | { id: string; kind: 'numbered-sequence'; word: string;
      at: { n: number; position: number }[]; missing: number[] }
  /* A word that clusters. Core, density, and every occurrence outside it. */
  | { id: string; kind: 'lexical-cluster'; token: string; positions: number[];
      core: { from: number; to: number }; density: number; outside: number[] }
  /* "THE DARK SIDE OF ___" recurring at intervals. */
  | { id: string; kind: 'repeated-title-form'; pattern: string; positions: number[] }
  /* Sections far shorter than their neighbours — often stubs or headings. */
  | { id: string; kind: 'length-outlier'; positions: number[]; medianChars: number }
  | { id: string; kind: 'heading-absent'; positions: number[] };
```

**The rule that keeps the tier honest:** an `Observation` may never contain a
proposed division. Seeing `CHAPTER 5` it records a numbered sequence; it does
not record "this is a chaptered book". Every observation carries an `id` so a
later proposal can cite it rather than restate it.

`86bab2094` is roughly the right *machinery* and the wrong *output type*: it
returned proposals. Its cluster arithmetic becomes `lexical-cluster`, its
structural-label runs become `label-run`, and its `reconcile()` is deleted —
reconciliation is interpretation and does not belong in this tier.

---

## Q2 · What may MAIA read?

Three tiers. **The member is told which one ran, before it runs.**

```text
A · headings + evidence          no body text leaves the database
B · A + boundary neighbourhoods  first/last ~600 chars of sections adjacent
                                 to candidate boundaries
C · the whole Work               NOT in v1
```

**Default B.** Tier A cannot succeed on this manuscript and we know it: Fire
opens at `THE SACRED FLAME`, a heading with no element word in it, and no
amount of heading arithmetic reaches 42. Shipping A as the default would be
choosing a defensible-sounding limit that produces a wrong answer.

Three constraints on the read, from the project's own vows:

- **Scoped to the act.** The member asked *"help me see the structure of this
  Work"*. The read serves that request and ends with it.
- **Not retained.** Body text read for a proposal is never persisted — not in
  the proposal record, not in `agent_runs`, not in logs. What persists is the
  *rationale*, which is MAIA's words about the Work, not the Work.
- **No member prose printed**, in any diagnostic this unit produces. The rule
  this lane has held since 04A.

Tier C is deferred not because it is unthinkable but because nobody has yet
shown it is needed, and "read the entire manuscript" is a materially different
consent question that deserves its own asking.

---

## Q3 · The typed output, for all six cases

**The output is not a tree. It is a reading that may or may not contain one.**

That distinction is the whole safety of this unit. A type whose happy path is
`divisions: Division[]` will quietly pressure the interpreter into filling it.

```ts
type ReadingForm =
  | 'hierarchy'    // nested levels: Part → Chapter
  | 'sequence'     // flat run of peers: Essay, Essay, Essay
  | 'mixed'        // different grammars in different stretches
  | 'partial'      // some of the Work reads clearly, some does not
  | 'contested'    // two defensible readings, neither dominant
  | 'none';        // no stable larger structure is evident yet

interface StructureReading {
  form: ReadingForm;
  /** Empty for 'none'. Never synthesised to fill the shape. */
  divisions: ProposedDivision[];
  /** For 'contested': the alternatives, each a complete reading. */
  alternatives?: { label: string; divisions: ProposedDivision[]; why: string }[];
  /** Stretches the reading does not claim. Shown in place, not exiled. */
  unresolved: { from: number; to: number; why: string }[];
  /** MAIA's account of the Work's grammar, in her words. Required. */
  account: string;
  readTier: 'A' | 'B' | 'C';
}
```

| Case | `form` | What it carries |
|---|---|---|
| Clear hierarchy | `hierarchy` | nested `divisions` |
| Flat sequence | `sequence` | peer `divisions`, no nesting |
| Mixed grammars | `mixed` | `divisions` with differing `kind` at the same level |
| Partial | `partial` | `divisions` for what reads; `unresolved` for what does not |
| Contradictory | `contested` | `alternatives`, and `divisions` EMPTY — the member picks |
| None | `none` | `divisions` empty, `account` says why |

`contested` deliberately leaves `divisions` empty. Silently choosing between two
defensible readings and presenting one is the same failure as inventing a tree,
performed with better manners.

---

## Q4 · Representing a proposal without a fake confidence score

A single number would average things that are different in kind. A division's
**start** may be stated by the heading while its **end** is inferred; its
**name** may be the member's own word while its **kind** is a guess.

So each is qualified separately, and each cites evidence:

```ts
interface ProposedDivision {
  /** The member's own words where possible; MAIA's only when there are none. */
  title: string;
  titleBasis: 'from-heading' | 'from-vocabulary' | 'maia-named';
  /** Free text, as in 05A. Never an enum. May be null — unnamed is honest. */
  kind: string | null;
  kindBasis: 'stated' | 'inferred' | 'none';

  fromPosition: number;
  fromBasis: 'stated' | 'inferred';
  toPosition: number;
  toBasis: 'stated' | 'inferred';

  children: ProposedDivision[];

  /** Observation ids from StructureEvidence. Checkable, not restated. */
  cites: string[];
  /** Why, in a few lines a writer can judge without redoing the analysis. */
  rationale: string[];
  /** What MAIA could not settle. Empty is a claim; make it deliberately. */
  openQuestions: string[];
}
```

Rendered, that is *"MAIA suggests Fire runs from 42 to 69"* with a stated/inferred
mark on each end and four lines of reasoning beneath — not `0.87`.

---

## Q5 · The review surface

**The proposal renders as the book**, using the same ordering primitive
`WS2-05A-R1` just built (`lib/writersStudio/outlineOrder.ts`). Proposed
divisions are anchored by their earliest section and interleave with everything
unaccounted, in manuscript order.

This is a real consequence of R1 rather than a coincidence: the member reads the
proposal **in the shape it would take if adopted**, so accepting it holds no
surprise about where things land.

- Unresolved stretches appear **in position**, marked, never moved to a footer.
  A region the reading cannot claim is part of the book, and hiding it at the
  bottom would understate how much of the Work is still open.
- Every division shows its stated/inferred marks and can be opened for its
  rationale and open questions.
- A `none` reading renders the flat book with MAIA's account above it, and no
  tree. **The surface must be able to render zero divisions as a complete,
  non-failed result.**
- The member may correct anything — boundary, name, kind, nesting — before
  accepting.

---

## Q6 · What "Use this structure" commits, and what provenance survives

One transaction. All of it or none.

```text
manuscript_structure_proposals
  id, manuscript_id, created_at
  read_tier          'A' | 'B' | 'C'
  evidence  jsonb    the StructureEvidence that was computed
  reading   jsonb    the StructureReading MAIA produced
  adopted_at         null until accepted
```

Units gain `proposed_from_id → manuscript_structure_proposals(id)`, nullable.
Adoption writes ordinary `origin='member'` units and memberships — the same rows
05A already governs, under the same contiguity trigger — each carrying
`proposed_from_id`.

**What that preserves.** The proposal record holds what MAIA proposed and on
what evidence. The units hold what the member accepted. **The difference between
them is the member's authorship, and it is durable** — six months on it is
answerable which divisions were the system's reading and which the writer
changed.

Three rules on the commit:

- **Adoption is validated, not trusted.** A reading whose divisions are not
  contiguous is refused before it is written; the 05A trigger would refuse it at
  COMMIT regardless, and the member should get a sentence rather than a
  constraint violation.
- **Adoption is refused on a manuscript that already has authored structure**,
  unless the member explicitly says to replace it. Silently merging a proposal
  into existing divisions is the one way this feature could destroy authored
  work.
- **`origin='proposed'` rows are never written.** The 05A column keeps the
  value for a future per-unit flow; this one has no use for it, because an
  unadopted proposal is not in the structure tables at all.

---

## The negative acceptance case — required before BUILD

```text
Input     a Work that genuinely has no larger stable structure
Correct   form: 'none' — "No stable larger structure is evident yet."
Forbidden a plausible-looking tree produced because the UI expects one
```

This is the acceptance case that matters most, and it is more important than
whether MAIA gets Fire 42–69 right. Getting Fire right is a good outcome;
inventing a structure for a book that has none is a harm, because the member
will believe it.

It must be enforceable in two places, not one:

1. **A test** — a fixture manuscript of undifferentiated sections, asserted to
   produce `form: 'none'` with `divisions.length === 0`.
2. **The surface** — a rendering test that `form: 'none'` produces a complete
   screen with no tree and no empty-state apology. If the surface cannot render
   the absence of structure as a real answer, the interpreter will eventually be
   asked to avoid producing it.

---

## Open, for the next MODEL pass

- **What "replace existing structure" looks like** when a member proposes onto a
  Work they have already organised. Named here as the sharpest danger; not
  designed.
- **Whether `adopted_from_id` (unit → unit) survives** now that provenance runs
  through the proposal record. Probably retire it, but not in this unit.
- **Re-proposal.** Whether a member may ask again after adopting, and what
  happens to the first proposal's record.
