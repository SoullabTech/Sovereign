# SOUL-SERVICE-03B — Reality-Veto Runtime Witness

**Date:** 29 September 2026
**Status:** LOCAL RUNTIME WITNESS
**Base:** `c8d22c04ea4306f6bdf7f1858ea421fb588953e6`
**Production:** closed
**Persistence:** none
**Memory:** none
**Observed provider:** Ollama
**Observed model:** llama3.1:8b

---

## Runtime question

Real local MAIA receives only:

- historical expectation;
- returned member-reported consequence.

It may output only one enum:

- supports;
- complicates;
- contradicts;
- insufficient.

The model does not author member-facing prose.

The server owns the evidence-comparison grammar.

The member owns revision.

---

## Stress witness

Four live cases were executed through:

`/api/maia/soul-service/reality-veto-pilot`

### Contradiction

Expected:

> contradicts

Observed:

> **contradicts**

Expectation:

> “I expect both readers to say the core argument is hard to follow.”

Consequence:

> “Both readers said the core idea was clear. One lost the thread at the chapter transition; the other found the ending abrupt.”

### Complication

Expected:

> complicates

Observed:

> **complicates**

### Support

Expected:

> supports

Observed:

> **supports**

### Insufficient evidence

Expected:

> insufficient

Observed:

> **insufficient**

> **REALITY_VETO_STRESS = PASS**

---

## Important remediation

The first live stress pass classified the contradiction case as:

> **complicates**

The model was treating unrelated local friction as partial support for the broader expected proposition.

The runtime constitution was tightened:

> **Compare the exact central proposition. A different local problem is not partial support for a different proposition.**

After that change:

> contradiction → **contradicts**

without expanding model authority.

This is a substantive epistemic repair, not prompt cosmetics.

---

## UI witness

Desktop and mobile runtime surfaces were exercised with the contradiction case.

Observed:

- live relation: **contradicts**
- member-facing label: **Contradicts as stated**
- server-governed statement:
  > “The returned report does not support the earlier expectation as stated.”
- member revision authority preserved: **yes**
- member-selected revision: **Narrow it**
- runtime provider: **Ollama**
- model output authority: **enum only**
- persistence: **none**
- page errors: **none**

> **SOUL_SERVICE_03B_REALITY_VETO_UI_WITNESS = PASS**

---

## Authority split

### MAIA may

Choose one governed evidence relationship.

### MAIA may not

- explain why the outcome happened;
- infer motive or personality;
- score success / failure;
- infer growth / regression;
- rescue contradiction as deeper confirmation;
- decide what the member should now believe.

### Member retains

Authority over:

- revision;
- meaning;
- next movement.

---

## Non-self-sealing result

The local model demonstrated the ability to return:

> **contradicts**

for evidence that materially negated the central proposition of the historical expectation.

The server then rendered that contradiction directly.

No model-generated explanation was allowed to soften or reinterpret the result.

---

## Contract tests

Inherited 03A + new 03B focused tests:

> **17 / 17 PASS**

Dedicated 03B core tests:

> **9 / 9 PASS**

---

## Governing result

> **MAIA can be structurally required to admit contradiction without being given rhetorical room to explain the contradiction away.**

And:

> **Reality can change the evidentiary standing of a prior frame while the member remains the author of what that change means.**

---

## Exact stop

03B may be locally founder-witnessed and committed to its feature branch.

It may not be merged, deployed, persisted, connected to member memory, used to score real-world outcomes, or automatically rewrite autobiographical meaning.

**STOP before merge or production.**
