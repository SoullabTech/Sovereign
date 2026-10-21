# SERVING-IDENTITY / F1R1 — FOUNDER CHARTER CONFORMANCE HARDENING

**Date:** 2026-09-21
**Opening canonical for this reconciliation:** `c346031f7241280982f56f0e4eb760728761c412`
**Predecessor:** canonical F1 evidence law admitted at `4c097b4c8`
**Status:** CONTRACT + FALSIFICATION ONLY · NO RUNTIME PRODUCER · NO D2 ADMISSION · NO D1 · NO DISCLOSURE · NO DEPLOYMENT

> **UNKNOWN → INSUFFICIENT_FACTS**

never:

> **UNKNOWN → TRUE**

and never:

> **UNKNOWN → FALSE**

## 1. Purpose

Canonical F1 already established the first evidence law for the four classified
booleans consumed by D2. F1R1 hardens that law to the Founder-authorized
contract boundary.

The governing question is:

> **For every input D2 depends on, what exactly is the fact, who may produce it,
> what provenance and standing make it admissible, how is it bound to the
> current serving act, what happens on conflict, and when is the fact bundle
> mechanically complete?**

F1R1 does not build runtime producers.

It defines and falsifies the law future producers must obey.

### Current-canonical reconciliation

The original F1 evidence law was admitted earlier at `4c097b4c8`. Current
canonical has since advanced to
`c346031f7241280982f56f0e4eb760728761c412`, including the separately governed
F2-IQ classifier contract.

This F1R1 act does not modify, invoke, admit, or widen F2-IQ. Its presence in
canonical is inherited substrate only. F1R1 changes remain limited to this
contract record, its deterministic charter-conformance matrix, and package
registration for that matrix.

The F1R1 self-scope and byte-identity guards are therefore bound to exact
opening canonical `c346031f7241280982f56f0e4eb760728761c412`.

## 2. Closed D2 input vocabulary

D2 consumes exactly five governed inputs.

### Inherited serving-truth input

1. `divergence`
   - value vocabulary: `none | capability | sovereignty`;
   - authoritative producer class: canonical R2 serving-truth substrate;
   - standing: **served observation derived from intended-vs-actual service**;
   - must be bound to the current serving act;
   - may not be inferred from routing policy alone.

### Independently classified boolean facts

2. `explicitIdentityInquiry`
3. `explicitIdentityMismatch`
4. `materialCapabilityEffect`
5. `capabilityContractSatisfied`

Each boolean is:

```ts
{ status: 'known'; value: true | false }
| { status: 'unknown' }
```

F1R1 additionally models **conflict** at the fact-production boundary. Conflict
is not a D2 value and must never cross into D2. It makes the bundle incomplete.

## 3. NOT_APPLICABLE ruling

`NOT_APPLICABLE` is **not admitted** for the current D2 packet.

Reason:

- D2's current interface requires all five inputs;
- none is optional under the present D1 decision law;
- where evidence cannot establish a required boolean, the state is
  `unknown`;
- where current serving truth cannot establish divergence, D2 may not be fed a
  fabricated substitute.

If a later D1/D2 law introduces a genuinely optional fact, `NOT_APPLICABLE`
requires its own separately governed contract change.

## 4. Producer authority registry

The fact names and authoritative producer classes are closed:

| Fact | Authoritative producer class | Required standing |
|---|---|---|
| `divergence` | `r2_serving_truth` | `served_observation` |
| `explicitIdentityInquiry` | `identity_inquiry_classifier` | `classified` |
| `explicitIdentityMismatch` | `identity_mismatch_evaluator` | `evaluated` |
| `materialCapabilityEffect` | `capability_impact_assessor` | `evaluated` |
| `capabilityContractSatisfied` | `capability_contract_evaluator` | `evaluated` |

No other producer may populate those fact slots.

A source that supplies evidence to an authoritative producer does not thereby
become an authoritative fact producer.

Examples:

- raw member text is evidence for a future identity-inquiry classifier, not the
  fact producer itself;
- a commitment registry is evidence for the identity-mismatch evaluator, not
  the final mismatch fact;
- a provider/model label is evidence about service, not capability materiality.

## 5. Provenance contract

Every produced fact must carry non-empty, machine-readable provenance
sufficient to establish:

- authoritative producer identity;
- fact name;
- current turn / serving-act identifier;
- producer or contract version;
- one or more governed source references;
- a bounded, non-reversible evidence fingerprint;
- the fact's standing.

A downstream parser may not reconstruct missing provenance from:

- logs;
- prose;
- member-facing text;
- response copy;
- provider names appearing in strings;
- routing configuration.

Missing provenance means the fact remains `unknown`.

## 6. Freshness and turn binding

Every fact must be bound to the current D2 candidate turn.

A prior-turn fact may not satisfy the current turn merely because:

- the same provider/model appears again;
- the same member is speaking;
- a previous inquiry looked similar;
- a prior commitment or capability contract once existed.

A separately governed still-active commitment may be used as **source evidence**
only when its own scope and activation rules say it remains current.

The produced fact itself must still be current-turn bound.

## 7. Serving-truth law

F1R1 preserves the R2P1 distinction:

> **intended service is not actual service.**

A serving observation used by F1 must preserve, when known:

- intended target;
- actual served target;
- service state;
- routing contract;
- fallback/divergence reason.

For a model-serving fallback, the actual provider/model comes only from the
actual served target.

The following are forbidden substitutions:

```text
intendedProvider -> actualProvider
intendedModel    -> actualModel
routingPolicy    -> actualProvider
preferredModel   -> actualModel
```

If actual service is unresolved, actual provider/model remains unresolved.

A fallback record that loses either side of the intended/actual relation is
insufficient for a fact that depends on that relation.

## 8. Conflict law

Multiple authoritative observations for the same fact and current turn must
agree.

If two otherwise-admissible authoritative fact records conflict:

```text
known(true) + known(false) -> CONFLICT
```

or:

```text
divergence(capability) + divergence(none) -> CONFLICT
```

Conflict is fail-closed.

It must not be:

- last-write-wins;
- majority vote;
- silently selected by timestamp;
- collapsed to `unknown` without retaining the conflict reason;
- admitted to D2.

## 9. Completeness law

A D2-candidate fact bundle is complete only when all five governed inputs are
present as non-conflicting, current-turn, provenance-complete, correctly
produced known facts.

For the four classified booleans, `unknown` makes the bundle incomplete.

For inherited `divergence`, unresolved or conflicting current-turn serving
truth makes the bundle incomplete.

Mechanical result:

```text
all five admissible + current + non-conflicting
  -> COMPLETE

anything else
  -> INCOMPLETE
```

An incomplete bundle may be inspected by F1 tooling.

It may not be represented as D2-admissible.

## 10. Fact-specific producer law

### 10.1 explicitIdentityInquiry

Authoritative producer:

`identity_inquiry_classifier`

Required source evidence:

- accepted current member utterance, or
- separately governed still-open inquiry state.

Allowed results:

- explicit -> `known(true)`;
- explicitly not an identity inquiry -> `known(false)`;
- ambiguous -> `unknown`.

Raw lexical absence is insufficient.

Member-facing response text is not source authority.

### 10.2 explicitIdentityMismatch

Authoritative producer:

`identity_mismatch_evaluator`

Required source evidence:

- governed active cognition identity commitment, and
- resolved current-turn actual serving identity from R2,

or a closed-world commitment registry proving there is no active commitment for
the scope.

Routing intent is not member commitment.

Actual serving identity must not be reconstructed from intent.

### 10.3 materialCapabilityEffect

Authoritative producer:

`capability_impact_assessor`

Required source evidence:

- governed relied-upon capability requirements;
- actual capabilities supplied by the current serving path;
- versioned materiality rule;
- complete assessment.

Provider/model substitution alone is insufficient.

### 10.4 capabilityContractSatisfied

Authoritative producer:

`capability_contract_evaluator`

Required source evidence:

- active member-facing capability contract;
- current applicable contract version;
- complete clause evaluation for the relevant turn/scope.

Provider success, failure, or response copy cannot bootstrap the contract.

## 11. Evidence bundle shape

F1R1's deterministic matrix models each fact record with:

- fact name;
- value/status;
- authoritative producer;
- standing;
- current-turn binding;
- producer/contract version;
- governed source references;
- evidence fingerprint.

The model is a **test-only constitutional instrument**.

It is not a runtime schema and creates no persistence.

## 12. Required falsifiers

F1R1 must fail if any of the following can occur:

1. intended provider is emitted as actual provider;
2. a missing fact defaults to true;
3. a missing fact defaults to false;
4. stale prior-turn serving truth satisfies a current-turn fact;
5. contradictory authoritative producers are silently collapsed;
6. provenance is absent or reconstructed downstream;
7. an ungoverned producer can populate a D2-required fact;
8. member-facing text is parsed to manufacture a fact;
9. provider/model identity is inferred from routing policy rather than actual serving truth;
10. fallback is represented without preserving intended/actual distinction;
11. an incomplete fact bundle can be represented as complete;
12. F1 directly invokes D1;
13. F1 performs D2 admission;
14. F1 alters provider/model/routing behavior;
15. F1 creates disclosure wording or presentation authority.

## 13. D2 / D1 boundary

Architecture remains:

```text
Serving / governed source evidence
  -> F1 fact production
  -> later F2 / D2 fact admission
  -> only if admitted: D1 disclosure decision
```

Forbidden:

```text
Serving facts -> D1
F1 -> D1
F1 -> D2 admission
F1 -> member disclosure
```

F1R1 may model whether a bundle is complete.

It may not call `admitDisclosureFacts`.

It may not call `decideMemberDisclosure`.

## 14. Scope and non-authority

Authorized F1R1 changes are limited to:

- this contract record;
- deterministic constitutional tests;
- package registration for the test.

F1R1 adds no:

- runtime fact producer;
- API route;
- provider adapter;
- model selector;
- routing policy;
- commitment registry;
- classifier service;
- persistence table;
- disclosure copy;
- UI;
- D2 wiring;
- D1 invocation;
- deployment behavior.

## 15. Completion condition

F1 may close only when the executable charter matrix demonstrates that:

- the five D2 inputs form a closed vocabulary;
- each has exactly governed producer authority;
- provenance, standing, and turn freshness are mandatory;
- conflicts fail closed;
- missing facts remain unknown;
- incomplete bundles cannot become complete;
- intended service cannot impersonate actual service;
- F1 cannot reach D2 admission or D1;
- no runtime, routing, provider, model, copy, UI, or deployment authority was added.

Only then may a separate Founder act consider:

> **SERVING-IDENTITY / F2 — D2 FACT ADMISSION**

D1 remains closed throughout F1.
