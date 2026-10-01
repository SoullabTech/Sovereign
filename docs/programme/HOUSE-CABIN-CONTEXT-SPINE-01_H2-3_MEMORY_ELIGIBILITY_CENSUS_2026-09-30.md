# HOUSE-CABIN-CONTEXT-SPINE-01 · H2.3 — Memory Eligibility Projection Census

## Gate question

Can member-owned memory cross into a local Cabin package without confusing
**being stored** with **being eligible for recall**?

## Existing authority

The canonical `member_memory_atoms` substrate already distinguishes:

- member-kept material;
- source provenance;
- member-assigned registers and lenses;
- status;
- return preference;
- member response to practitioner observations;
- sacred-protected material;
- crossing permission.

The production MAIA loader then applies a stricter **recall** gate:

- personal scope;
- active/still_alive;
- consented return preference;
- no sacred-protected register;
- practitioner attribution;
- no member rejection.

The Cabin must not collapse these two questions.

## H2.3 ruling

### Package eligibility

A memory may be carried into the member's sovereign Cabin package when:

1. it is in **personal** scope;
2. it belongs to the member scope;
3. it is a member-placed atom, or a practitioner observation explicitly
   confirmed/modified by the member;
4. it has not been explicitly rejected;
5. the atom's crossing guard remains `false`.

Package inclusion is a **storage/continuity** decision.

### Recall eligibility

Recall standing is carried separately:

- `member_pulled` → member-pulled only;
- `contextual_doorway` → contextual recall may be considered;
- `ritual_review_opt_in` → review surfaces only;
- `set_aside`, `protected`, or `archived` → no ambient recall;
- sacred-protected material → no ambient recall;
- rejected observation → not package-eligible.

This preserves the canon:

> Storing something, keeping something, and allowing it to return are
> distinct acts.

## What crosses

The portable memory reference contains:

- atom id;
- source type + source id;
- member-given title;
- spontaneous member-authored body when the canonical atom carries one;
- member-assigned registers;
- member-selected elemental lenses;
- status;
- return preference;
- kept-at provenance;
- package provenance;
- permission basis;
- recall standing.

It does not contain:

- member id;
- session/browser identity;
- practitioner identity;
- unrelated relationship data;
- MAIA interpretation;
- generated relevance score;
- generated significance;
- cross-atom synthesis.

## Falsifiers

### F1 — scope leakage

**Defeat candidate:** accept a colab/client/encounter atom into the member Cabin.

**Death:** projection returns a reference for non-personal scope.

### F2 — rejected observation leakage

**Defeat candidate:** carry a practitioner observation with
`memberResponseStatus = rejected`.

**Death:** projection returns a reference.

### F3 — third-party claim leakage

**Defeat candidate:** carry an unconfirmed practitioner observation.

**Death:** projection returns a reference.

### F4 — consent collapse

**Defeat candidate:** turn `member_pulled` into ambient recall eligibility.

**Death:** output claims ambient recall.

### F5 — protected-memory leakage

**Defeat candidate:** let protected/sacred-protected material become ambiently
recallable.

**Death:** output claims recall permission.

### F6 — identity leakage

**Defeat candidate:** include member id, session id, browser state, or
practitioner id.

**Death:** portable JSON contains them.

### F7 — manufactured relevance

**Defeat candidate:** add a relevance score, ranking, inferred meaning, or
cross-atom synthesis.

**Death:** output contains a generated evaluative field.

### F8 — source/provenance collapse

**Defeat candidate:** emit only content/title without source identity and
permission basis.

**Death:** the Cabin cannot answer where the memory came from or why it is
eligible.

### F9 — source mutation

**Defeat candidate:** normalize or rewrite the source memory during projection.

**Death:** input object changes.

### F10 — nondeterminism

**Defeat candidate:** generated timestamps, random ids, or unstable ordering.

**Death:** identical source input produces different output.

## Acceptance

H2.3 passes only when all ten falsifiers are defeated and the projection
round-trips through ordinary JSON.

## Implementation witness

Implemented as:

- `lib/cabin/memoryProjection.ts`
- `lib/cabin/__tests__/memoryProjection.test.ts`
- `docs/design/contracts/cabin-memory-projection.md`

Focused H2.3 suite: **14/14 PASS**.

The projection was then tested against the existing local Cabin authority as
part of the Desktop witness population:

- Work projection witness: **1/1 PASS**
- Cabin Desktop suite: **38/38 PASS**
- H2.1/H2.2/H2.3 focused suites: **32/32 PASS**

The important behavioral distinction is preserved:

- a member-pulled memory may remain in the member-owned Cabin record without
  becoming ambient recall;
- protected, archived, and set-aside memory remains record-continuous but is
  recall-blocked;
- sacred-protected material cannot become ambient recall;
- practitioner observations do not cross merely because they exist. They require
  an explicit member confirmation/modification before this projection will carry
  them.

Project typehealth remains at **223 errors against a 239-error baseline** with
the same unrelated Stripe diagnostic at `lib/stripe/config.ts:23`. No H2.3
diagnostic is reported.

**H2.3 IMPLEMENTATION COMPLETE · EVIDENCE COMPLETE.**

**Boundary:** no memory migration, no local memory write path, no MAIA
cognition, no prompt change, no UI, no Grokker ingestion.
