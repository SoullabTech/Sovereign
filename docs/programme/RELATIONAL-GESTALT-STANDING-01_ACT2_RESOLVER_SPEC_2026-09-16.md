# RELATIONAL-GESTALT-STANDING-01 — ACT 2 DETERMINISTIC STANDING RESOLVER SPECIFICATION

**Status:** ACT 2 COMPLETE · specification only · no runtime/schema authority
**Programme:** `RELATIONAL-GESTALT-STANDING-01`
**Date:** 2026-09-16

## Governing purpose

The resolver does not decide truth. It computes how an assertion may participate in present cognition from immutable authorship, explicit relational acts, temporal/process scope, and member authority.

Standing is computed at assembly. It is never persisted as a truth verdict on the historical object.

## Conceptual inputs

```ts
EvidenceObject {
  id
  content_ref
  authored_by: member | maia | system | practitioner | house
  created_at
  process_scope?
  temporal_scope?
}

StandingRelation {
  id
  subject        // successor / new act
  predicate      // supports | contests | adopts | confirms | corrects | refines | supersedes | uncertain
  object         // earlier assertion / relation
  basis[]        // evidence ids
  actor
  created_at
  process_scope?
}
```

Authorship is immutable. Adoption is a relation; it never rewrites MAIA-authored language as member-authored language.

## Resolver output

```ts
ResolvedStanding {
  object_id
  origin
  use_as: established | adopted | provisional | unresolved | historical_only | question_only | inadmissible
  current_scope
  governing_relations[]
  counter_relations[]
  evidence_path[]
  explanation_code[]
}
```

`use_as` is a cognition-use class, not a truth class.

## Resolution order

1. Resolve exact object identity and immutable authorship.
2. Restrict candidate relations to the applicable process/temporal scope.
3. Collect successor-carried standing relations pointing to the object.
4. Apply member acts before MAIA/system interpretations when the subject is the member's own experience or meaning.
5. `CORRECTS` prevents the target from returning as accepted/current meaning.
6. `SUPERSEDES` makes the target historical-only in the superseded scope.
7. `REFINES` preserves the target only in the narrowed conditions carried by the successor.
8. `ADOPTS` / `CONFIRMS` may elevate an interpretation's present usability but never change its origin.
9. `CONTESTS` travels with the target; it does not silently erase it.
10. `UNCERTAIN` permits only question/provisional use.
11. If incompatible live member-origin evidence remains unresolved, return `unresolved`; do not synthesize a winner.
12. If a substantive object has no evidence path, return `inadmissible`.

## Pair-or-neither law

If a corrected or superseded object would otherwise enter cognition, the assembler must provide the object together with the governing correction/supersession relation, or omit both. It may never emit the obsolete object alone.

## Present-freedom law

For claims about the member's present inner state, a current explicit member self-report governs present self-report standing over historical pattern claims. Historical evidence remains historically valid; it does not acquire veto power over the present.

## Attention/authority separation

Similarity, recurrence, centrality, graph density, retrieval frequency, and model confidence may affect **attention**. None may change `use_as` or epistemic standing.

## Determinism requirement

Given the same evidence objects, standing relations, process scope, and as-of time, the resolver must return the same standing result without model inference.

## Non-goals

No database design, migration, relation extractor, Gestalt generator, prompt change, or model call is authorized by ACT 2.
