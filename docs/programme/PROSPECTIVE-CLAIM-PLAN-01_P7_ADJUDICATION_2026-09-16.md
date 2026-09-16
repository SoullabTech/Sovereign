# PROSPECTIVE-CLAIM-PLAN-01 — P7 Adjudication

**Status:** COMPLETE · STOP AFTER THIS RECORD

## Question

Can a structured pre-render claim plan preserve claim identity, standing, and speech-act class through fluent rendering without merging, inventing, or silently changing epistemic status?

## Adjudication

**YES for deterministic prospective realization. NOT YET for model-produced claim planning or generative re-rendering.**

The accepted research architecture makes the claim plan the last semantic-authoring boundary. Each claim already contains its proposition, speech-act class, standing, evidence/relation lineage, and one atomic fluent surface sentence before rendering.

The renderer performs deterministic assembly only.

## What is proven

- claim identity exists before member-facing prose;
- surface rewording can preserve prospective claim identity when proposition/standing/evidence remain unchanged;
- changing proposition, standing, or evidence lineage changes claim identity;
- `GROUNDED`, `CANDIDATE`, and `QUESTION` remain distinct through rendering;
- candidates must be visibly provisional at the surface;
- grounded claims require lawful standing and evidence;
- confirmation/correction can target an exact planned claim;
- opaque reference still abstains without antecedent evidence;
- established meaning cannot be reopened by plan declaration;
- deterministic rendering is claim-for-claim and introduces no semantic text.
## P6 realization finding

The governing round trip was:

```text
structured claim plan
→ deterministic fluent render
→ retrospective claim parser
```

Acceptance required a one-to-one realization map, not equality between prospective and retrospective claim ids.

Observed:

```text
prospective claims       3
retrospective units      3
dropped claims           0
unplanned units          0
round trip               PASS
```

Both the grounded claim and the candidate parse retrospectively as ordinary assertions. Their different epistemic statuses therefore do not come from post-hoc prose classification; they survive because standing and speech-act class travel from the prospective claim object through the render span map.

Tamper cases adding unplanned prose or merging/dropping a realization were rejected.

The Silver Cedar Gestalt replay also preserved `GROUNDED/established → CANDIDATE/provisional → QUESTION/open`, while rejecting established-meaning reopen and candidate laundering.
## What is NOT proven

- that MAIA's current production model can reliably generate valid prospective claim plans;
- that a second generative renderer can paraphrase planned claims without semantic drift;
- that claim plans should enter live cognition or the serving path;
- that prospective claim objects should be persisted as member memory;
- that opaque antecedent resolution is solved merely because claims are addressable.

A local Ollama plan-proposal harness stalled without producing an admissible artifact. Those runs are **NO EVIDENCE** and do not contribute to this adjudication.

## Engineering gates

```text
prospective + claim-identity Jest  42 passed · 0 failed
repo type-health                   PASS · 229 errors vs baseline 239 · zero regressions
typecheck:scripts                  RED on existing repository debt
lane-source script errors          0
serving imports                    none
serving file diff                  none
raw production transcript content  absent from prospective telemetry
model-shadow evidence artifact     absent
```

`typecheck:scripts` is not claimed green. No diagnostics occur under `lib/maia/prospectiveClaimPlan/`, `lib/maia/claimIdentityShadow/`, or `scripts/research/prospective-claim-plan/`.
## Architectural finding

The safest proven shape is:

```text
RELATIONAL GESTALT
      ↓
FREE SYNTHESIS
      ↓
PROSPECTIVE CLAIM PLAN
  GROUNDED | CANDIDATE | QUESTION
  standing + evidence/relation refs
  stable claim identity
  atomic surface realization
      ↓
DETERMINISTIC RENDER
      ↓
MEMBER-FACING PROSE
```

The fluent response is therefore a realization of already-addressable epistemic objects rather than the place where epistemic structure must be reconstructed afterward.

## Candidate successor — NOT OPEN

`FREE-SYNTHESIS-CLAIM-PLAN-REPLAY-01`

Purpose: use an untrusted production-equivalent model offline to propose structured claim plans from frozen relational-Gestalt fixtures, with the deterministic compiler/renderer as the authority. Measure valid-plan yield, continuity, candidate discipline, evidence descent, and refusal/repair behavior before any cognition exposure.

## STOP

`PROSPECTIVE-CLAIM-PLAN-01` ends here. No serving-path integration, prompt change, cognition exposure, schema migration, memory write, or production response change follows automatically.

> **Free Synthesis may create new meaning. Rendering may not change what kind of meaning it is.**
