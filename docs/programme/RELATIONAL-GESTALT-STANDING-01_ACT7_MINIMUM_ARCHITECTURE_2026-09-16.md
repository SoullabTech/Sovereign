# RELATIONAL-GESTALT-STANDING-01 — ACT 7 MINIMUM IMPLEMENTATION ARCHITECTURE

**Status:** ACT 7 COMPLETE · DESIGN ONLY · IMPLEMENTATION CLOSED
**Programme boundary:** after this record, STOP.

## Architectural finding

The minimum viable architecture is not `Gestalt → model`. It is a two-boundary system:

```text
APPEND-ONLY PRIMARY EVIDENCE
        ↓
TYPED RELATION CANDIDATES
        ↓
DETERMINISTIC STANDING RESOLVER
        ↓
STANDING-RESOLVED RELATIONAL FIELD
        ↓
TURN-SPECIFIC GESTALT PROJECTOR
        ↓
FREE SYNTHESIS
        ↓
INFERENCE ADMISSION BOUNDARY
        ↓
RELATIONAL RESPONSE
        ↓
MEMBER RESPONSE / NEW EVIDENCE
        ↺
```

## 1. Evidence adapter

Reads authoritative transcript/member acts and other already-governed carriers. It does not summarize or reinterpret them. Every object has immutable source/authorship identity and scope.

## 2. Relation layer

Carries typed relations such as `REFERS_TO`, `ADOPTS`, `CORRECTS`, `REFINES`, `SUPERSEDES`, `RETURNS_TO`, and `BELONGS_TO`.

Some relations may be deterministic/member-act derived. Model-proposed relations must enter as candidate relations with MAIA authorship; model confidence/centrality cannot grant standing.

## 3. StandingResolver — pure/deterministic

Implements ACT 2. Same input graph + scope + as-of time → same standing result. No LLM call. No stored truth verdict. Corrected/superseded objects are pair-or-neither.

## 4. RelationalField assembler

Produces the epistemically typed field available for this turn:

```text
ESTABLISHED_MEMBER
ADOPTED_MEANING      // origin preserved
PROVISIONAL_MAIA
CONTESTED
UNRESOLVED
HISTORICAL_ONLY
OPEN
```

Attention geometry may choose what is relevant. It may not alter these standing classes.

## 5. GestaltProjector

Creates a small disposable view of the resolved field: active process, established relations, movement/trajectory, unresolved tensions, open loops, and minimal evidence pointers.

The projection is never written back as evidence. It is recomputed when evidence/standing changes.

## 6. FreeSynthesizer

Receives the compact Gestalt + selected evidence + minimum constitutional floor. It is intentionally permitted to make new connections. Creativity is not suppressed at this stage.

## 7. Inference Admission Boundary — new load-bearing seam

The response plan must distinguish:

```text
GROUNDED       claim has licensed evidence/relation refs
CANDIDATE      new MAIA-origin interpretation, explicitly provisional
QUESTION       genuinely open inquiry
```

A member-facing **assertion about the member/process** may leave as `GROUNDED` only when its references resolve to admissible standing.

A novel synthesis may leave as `CANDIDATE`, but its MAIA origin must remain explicit in the speech act (e.g. possibility/wondering), and it gains no durable authority from being spoken.

A candidate must never be copied into member-authored memory. Later member adoption is represented by a new member act/relation.

### Enforcement shape

Do not rely solely on another standing paragraph in the prompt; ACT 5 falsified that as sufficient.

The implementation successor must test a structured response contract in which synthesis returns member-facing language plus claim objects/spans with relation/evidence references and speech-act class. A deterministic gate validates reference existence and standing before emission. Any ungrounded assertion must be repaired, downgraded to explicit candidate/question, or omitted.

A model-assisted semantic verifier may be investigated only as a detector; it must not itself grant standing. Deterministic standing remains the authority.

## 8. Descent index

Every grounded Gestalt/response claim must support:

`member-facing claim → admitted claim object → relation/configuration → primary evidence`.

A candidate claim descends instead to its MAIA-origin synthesis act plus whatever evidence motivated it; it must never masquerade as direct evidence.

## 9. Shadow-first implementation sequence for a future lane

If separately authorized:

1. pure types + StandingResolver + F1–F10 unit suite;
2. offline field assembler over frozen transcripts;
3. shadow Gestalt computation on live conversations — MAIA/member do not see it;
4. compare shadow field against subsequent member corrections/adoptions;
5. shadow inference-admission classifier on existing responses;
6. only after evidence, run replay with structured synthesis contract;
7. only after that may a later act request cognition injection.

No first implementation should write member memory or change what MAIA says.

## 10. Minimum falsifiers before cognition exposure

- F1–F10 from ACT 3 all pass deterministically.
- Repeating a MAIA candidate never increases its standing.
- Member adoption changes usability without rewriting origin.
- Member correction immediately removes current governing use while preserving history.
- Current self-report can reorganize historical pattern geometry.
- Every grounded emitted claim has descent.
- Unsupported novel synthesis can survive only as explicit candidate/question.
- Shadow Gestalt never becomes its own evidence source.

## 11. Candidate successor — NOT OPEN

`GESTALT-STANDING-SHADOW-01`

Purpose: implement only the pure resolver, falsifier suite, and shadow-only assembler/inference-admission instrumentation described above.

It would authorize **no member-facing behavior and no prompt injection** unless separately expanded after evidence.

## STOP

`RELATIONAL-GESTALT-STANDING-01` ends here. ACT 7 designs the minimum implementation architecture and authorizes none of it.

The lane's final finding is:

> **MAIA may imagine freely. What she imagines becomes knowledge only through evidence, standing, and member relationship to the proposal—not through fluency, repetition, centrality, or persistence.**
