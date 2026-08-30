# WS2-05B — MODEL

**Stage:** MODEL, second pass. BUILD on HOLD.
**Gate:** WS2-05A-R1 source/tests PASS; browser witness pending.

> The architectural risk this pass exists to remove: **one convenient object
> called `Proposal` that mixes what mechanics observed, what MAIA inferred, and
> what the member authorized.** Three different kinds of claim with three
> different authorities. The type boundaries are therefore hard.

---

## The chain, and where the sovereignty boundary sits

```text
StructureEvidence          mechanical · observations only
        ↓
StructureInterpretation    MAIA · a reading, possibly of nothing
        ↓
StructureProposal          reviewable · what the member is shown
        ↓  member edits, then one explicit act
AuthorStructureCommand     ← THE SOVEREIGNTY BOUNDARY
        ↓
05A structure service      ordinary units + memberships
```

**This must be impossible:**

```text
MAIA result → INSERT manuscript_structure_units
```

Type separation alone is a convention, so it is made checkable: the 05A service
accepts **only** `AuthorStructureCommand`, there is no constructor from
`StructureInterpretation` to one, and an **import-graph test** asserts that
`lib/manuscript/structure/structureService.ts` has no path to the interpreter
module. A convention a future edit can quietly break is not a boundary.

---

## Q1 · `StructureEvidence` — observations, not structure

```ts
type StructureEvidence = {
  manuscriptId: string;
  /** The draft state these observations describe. See "staleness" below. */
  draftVersion: number;
  observations: EvidenceObservation[];
  coverage: EvidenceCoverage;
};

type EvidenceObservation =
  | StructuralLabelObservation
  | NumberingPatternObservation
  | LexicalDensityObservation
  | RepeatedFormObservation
  | SuspectedScaffoldObservation
  | TransitionObservation;
```

Every observation carries four things:

```text
what was observed
where            stable section ids AND positions
how established  the rule that produced it
does_not_establish
```

That fourth field is the one that keeps the tier honest:

```text
observation
  FIRE-bearing headings are dense around 57–68

does_not_establish
  that Fire begins at 57
  that the Work uses chapters
  that FIRE is structural rather than thematic
```

Without it, evidence gets upgraded into ontology by a later reader who only
sees the first three lines. It is written by the detector that made the claim,
because that detector is the only thing that knows its own limits.

**`86bab2094` is the right machinery and the wrong output type.** Its cluster
arithmetic becomes `LexicalDensityObservation`; its structural-label runs become
`SuspectedScaffoldObservation`; **its `reconcile()` is deleted** — reconciliation
is interpretation and does not belong in this tier.

---

## Q2 · What MAIA reads — progressive, and recorded

Not constrained to headings: Fire opens at `THE SACRED FLAME` and headings alone
cannot reach 42. Also not one undifferentiated call over 380,343 characters.

```text
PASS 1  whole-work map        headings + positions + mechanical evidence
PASS 2  candidate regions     boundary-neighbour sections and relevant bodies
PASS 3  broader / full        when the grammar cannot responsibly be inferred
                              from less
```

**MAIA may read as much of the Work as interpretation requires, and the proposal
records what she actually read.**

```ts
type EvidenceCoverage = {
  headings: 'all';
  bodies: { mode: 'none' | 'selected' | 'all'; sectionIds: string[] };
  passes: 1 | 2 | 3;
};
```

**A proposal derived from six excerpts must never visually impersonate one
derived from a full reading.** Coverage is shown in the review surface, not
buried in a record.

Constraints from the project's vows: the read is scoped to the act the member
asked for; body text read for a proposal is **never persisted** — not in the
proposal record, not in `agent_runs`, not in logs; and no member prose appears in
any diagnostic this unit produces.

---

## Q3 · The interpreter result is a discriminated union

Not an empty tree plus flags.

```ts
type StructureInterpretation =
  | StableStructure          // a coherent larger organizing grammar is evident
  | PartialStructure         // some regions organize clearly, others do not
  | FlatStructure            // meaningfully sequential; no larger hierarchy
  | MixedGrammar             // different regions legitimately organize differently
  | AmbiguousStructure       // several incompatible readings remain plausible
  | NoStableLargerStructure; // no larger organization is presently evident
```

`NoStableLargerStructure` **contains no synthetic root node and no best-effort
divisions.** `AmbiguousStructure` carries the competing readings and does not
choose between them — silently picking one is inventing a tree with better
manners.

Every variant carries:

```ts
{
  account: string;                  // MAIA's words about this Work's grammar
  coverage: EvidenceCoverage;
  unaccountedSectionIds: string[];
  uncertainRegions: UncertainRegion[];
}
```

**Unaccounted material is part of the result, not a leftover.** Not because
everything must eventually be placed, but because the surface must never hide
what the proposal failed to explain. For this manuscript that is precisely
161–173.

---

## Q4 · A proposed unit

```ts
type ProposedUnit = {
  proposalId: string;
  kind: string | null;
  title: string | null;
  /** STABLE SECTION IDS, never positions. Positions move; ids do not. */
  fromSectionId: string;
  toSectionId: string;
  children: ProposedUnit[];
  rationale: string;
  evidenceRefs: string[];
  uncertainty: ProposedUncertainty[];
};

type ProposedUncertainty =
  | 'start-boundary'
  | 'end-boundary'
  | 'kind'
  | 'hierarchy'
  | 'possible-scaffold-contamination'
  | 'competing-interpretation';
```

**Correction to the previous pass:** I had boundaries as positions. They are
section ids, for the same reason `?s=` is a uuid — an ordinal silently means a
different piece of the book the moment anything shifts.

**No `confidence: 0.87`.** It would collapse incomparable things — a literal
label, a semantic transition, dense vocabulary, an interpretive reading — into
fake precision. Uncertainty is **named** instead, and the named kinds are
closed, so a surface can render each one properly rather than printing prose it
cannot reason about.

**No outcome requires inventing a structural vocabulary.** If the Work says
*Movement*, preserve Movement. If MAIA perceives a division and cannot
responsibly name its kind, **`kind: null` is preferable to manufacturing
"Chapter"** — and the outline already renders an unnamed division honestly,
because 05A made `kind` free text and nullable.

---

## Q5 · The review surface inherits book order as an invariant

Not only the canonical outline after adoption — **the proposal surface itself.**
If Fire 42–69 is proposed while 0–41 is unresolved, review renders:

```text
0–41            unresolved
Fire
  42–69
70–…
```

not *all proposals first, uncertainties afterward*. Otherwise 05B recreates the
exact 05A defect in a new surface. It uses the same primitive R1 built,
`lib/writersStudio/outlineOrder.ts`, so the member reads the proposal **in the
shape it would take if adopted**.

Also on the surface: the coverage that produced it; each division's
stated/inferred marks, rationale and named uncertainties; and unresolved
stretches **in position**, never exiled to a footer.

A `NoStableLargerStructure` reading renders the flat book with MAIA's account
above it and no tree — **a complete result, not an empty state.**

---

## Q6 · Adoption, provenance, and staleness

```text
manuscript_structure_proposals
  id, manuscript_id, created_at
  evidence         jsonb    what mechanics observed
  interpretation   jsonb    what MAIA read
  coverage         jsonb    what she actually read
  section_set_hash text     see staleness
  adopted_at       timestamptz null
```

Units gain `proposed_from_id → manuscript_structure_proposals(id)`, nullable.
Adoption writes ordinary `origin='member'` units under 05A's existing contiguity
trigger. **The difference between what was proposed and what was accepted is the
member's authorship, and it stays answerable.**

**Staleness is about the section set, not the text.** A proposal is invalidated
when sections are added, removed or repositioned — not when the member edits
prose. Tying it to `draftVersion` would invalidate a proposal every 1.2 seconds
while the member wrote, which would make review impossible in the one situation
where it matters most: reading the Work while deciding about it. Hence
`section_set_hash`.

Three rules on the commit:

- **Validated, not trusted.** Non-contiguous divisions are refused before the
  write; the 05A trigger would refuse them at COMMIT anyway, and the member
  deserves a sentence rather than a constraint violation.
- **Refused on a Work that already has authored structure**, unless the member
  explicitly says to replace it. Silently merging is the one way this feature
  could destroy authored work.
- **`origin='proposed'` rows are never written.** An unadopted proposal is not
  in the structure tables at all.

---

## The MODEL acceptance matrix

The interpreter contract must prove it can represent all six **without
cheating** — before BUILD:

```text
clear hierarchy                        → StableStructure
flat essay / poem / entry collection   → FlatStructure
different grammars in different regions→ MixedGrammar
some clear, some unresolved            → PartialStructure
two plausible competing readings       → AmbiguousStructure
nothing stable yet                     → NoStableLargerStructure
```

Plus the invariant: **no outcome requires inventing a structural vocabulary.**

### The negative case, enforced twice

```text
Input     a Work that genuinely has no larger stable structure
Correct   NoStableLargerStructure
Forbidden a plausible-looking tree produced because the UI expects one
```

1. **A test** — a fixture of undifferentiated sections yielding
   `NoStableLargerStructure` with no divisions and no synthetic root.
2. **A rendering test** — that variant produces a complete screen with no tree
   and no empty-state apology. If the surface cannot render the absence of
   structure as a real answer, the interpreter will eventually be asked not to
   produce it.

This matters more than whether MAIA gets Fire 42–69 right. Getting Fire right is
a good outcome; inventing a structure for a book that has none is a harm,
because the member will believe it.

---

## Open, for the next pass

- **Replacing existing structure.** Named as the sharpest danger; not designed.
- **Whether `adopted_from_id` (unit → unit) survives** now that provenance runs
  through the proposal record. Probably retire it; not in this unit.
- **Re-proposal** after adoption, and what becomes of the first record.
- **Who writes `does_not_establish`** for an observation type added later — the
  answer must be "the detector, at the point of claim", and there is currently
  no mechanism that forces it.
