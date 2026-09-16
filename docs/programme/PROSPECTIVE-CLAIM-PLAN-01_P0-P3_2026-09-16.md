# PROSPECTIVE-CLAIM-PLAN-01 — P0–P3

**Status:** P0–P3 COMPLETE · research/shadow only
**Canonical base:** `a0e3aa45e5bbeaabbbf49996dd4b93edb865dec2`
**Inherited claim-identity substrate:** `ac25bc345` transplanted as `c1ff58ee7`

## P0 · Boundary

No serving-path integration, prompt change, cognition exposure, member-facing behavior, schema migration, memory write, or production response change is authorized.

## P1 · Prospective claim contract

The semantic authoring unit is a planned claim, not a rendered sentence discovered after the fact.

Each planned claim carries:

```text
claim_id
proposition
surface_text
speech_act = GROUNDED | CANDIDATE | QUESTION
standing
 evidence_refs[]
relation_refs[]
question_intent?
target_claim_ids[]
```

**Free Synthesis may create new meaning. Rendering may not.**
## P2 · Identity law

Prospective identity is semantic/epistemic and exists before rendering. It is derived from plan id + ordinal + proposition + speech act + standing + evidence/relation lineage + question intent. Surface wording is intentionally excluded.

Therefore:

- rewording a surface sentence may preserve the same prospective claim id;
- changing proposition, standing, evidence lineage, or speech act changes claim identity;
- prospective claim id is not the same namespace as retrospective source-span claim id;
- identity does not imply truth.

## P3 · Frozen falsifiers

18/18 passed before P4–P6 evidence was adjudicated.

The suite proves stable pre-render identity, evidence requirements for grounded claims, explicit provisional language for candidates, exact confirmation/correction targeting, opaque-reference abstention, multi-claim ambiguity, question-only restart binding, established-meaning non-reopen, deterministic rendering, and one-to-one retrospective parsing.

Serving isolation also remains a hard gate: no app/lib serving surface may import `prospectiveClaimPlan`.
