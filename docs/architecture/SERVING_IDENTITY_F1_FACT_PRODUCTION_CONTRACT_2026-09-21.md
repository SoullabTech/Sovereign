# SERVING-IDENTITY / F1 — DISCLOSURE FACT-PRODUCTION CONTRACT

**Status:** DESIGN + EXECUTABLE FALSIFICATION ONLY · NO RUNTIME PRODUCER · NO D1/D2 WIRING
**Source canonical:** `bcd4debfed1285d2ff14829db7f117ffaff05f11`
**Predecessor:** `SERVING-IDENTITY / R2P1` real-provider serving-truth witness

## 1. Question

D2 already answers:

> Do we possess sufficiently established facts to ask D1 for a disclosure decision?

F1 answers the earlier question:

> What evidence is sufficient to produce each D2 fact as `known(true)` or `known(false)`, and what evidence must remain `unknown`?

F1 does **not** produce any runtime fact.

It defines the evidence law future producers must satisfy.

## 2. Controlling distinction

> **Observation is not classification. Classification is not commitment. Commitment is not capability. Capability is not disclosure.**

R2/R2P1 now establish what routing intended and what actually served. They do not establish the four D2 facts:

- `explicitIdentityInquiry`
- `explicitIdentityMismatch`
- `materialCapabilityEffect`
- `capabilityContractSatisfied`

Those facts remain independent.

## 3. Source census

### 3.1 Current member utterance exists

The live MAIA route possesses the accepted current member message before generation. This is a possible source for a future **governed identity-inquiry classifier**.

Raw text itself is not a classified fact.

A future classifier must be allowed to abstain.

### 3.2 Serving truth exists

Canonical R2 exposes machine-readable `servingTruth` containing routing intent, service state, and actual served target.

Serving truth is admissible evidence for facts that need actual serving identity.

It is insufficient by itself to establish:

- member inquiry,
- member/provider commitment,
- material capability effect,
- capability-contract satisfaction.

### 3.3 No general cognition-provider selection surface was found

Repository census found no general member-facing MAIA cognition provider/model selector on the live conversation path.

`MAIA_INFERENCE_MODE`, `TEXT_MODEL_PROVIDER`, `forceSonnet`, `forceOpus`, `useKimi`, and `useMultiEngine` are operator/internal routing inputs. They are not member commitments merely because they affect routing.

### 3.4 Studio agreement provider is not cognition identity

`app/api/studio/sessions/[sessionId]/agreement/route.ts` freezes a practitioner/client **video provider** agreement.

Its `videoProvider` concerns session video transport.

It is not evidence that a member selected or was promised a MAIA cognition provider/model.

Using it to produce `explicitIdentityMismatch` would be a category error.

### 3.5 Trust Drawer is retrospective telemetry, not commitment

`components/trust/TrustDrawer.tsx` may display `providerUsed`.

That field reports what served.

It does not establish what the member selected or what MAIA promised before the turn.

Therefore Trust Drawer metadata cannot establish an identity commitment.

### 3.6 No general cognition capability-contract registry was found

No versioned, current-turn member-facing cognition capability contract was found on the live MAIA path that can presently answer whether required capabilities remained satisfied after provider substitution.

No governed provider-capability equivalence registry was found that can presently establish material capability impact from provider/model identity alone.

Therefore these facts must remain `unknown` unless future governed evidence exists.

## 4. General fact-production law

A future fact producer may return:

```ts
type ClassifiedBoolean =
  | { status: 'known'; value: boolean }
  | { status: 'unknown' };
```

A fact may be `known` only when evidence is:

1. **authoritative for that fact**;
2. **scoped to the relevant turn/session/commitment**;
3. **complete enough to support true or false**, not merely the observed presence or absence of one clue;
4. **versioned where semantics can change**;
5. **independent of the downstream disclosure decision**.

Absence of admissible evidence means:

```text
unknown
```

not a default false/true.

## 5. Fact contract — explicitIdentityInquiry

### Sufficient evidence

A future governed current-turn identity-inquiry classifier may establish:

```text
explicit inquiry
  -> known(true)

not an explicit inquiry
  -> known(false)

ambiguous / underspecified
  -> unknown
```

The classifier must be explicitly scoped to the accepted member utterance (or a separately governed still-open unresolved inquiry).

### Insufficient evidence

The following cannot establish this fact:

- serving divergence;
- served provider/model;
- provider fallback;
- absence of words such as "provider", "model", or "Claude";
- an inquiry from a prior turn without a governed unresolved-inquiry state;
- operator routing configuration.

Preserve:

> **Lexical absence is not semantic absence.**

## 6. Fact contract — explicitIdentityMismatch

This fact requires two independent truths:

1. an authoritative active identity commitment exists; and
2. actual serving identity is known sufficiently to compare against it.

### Admissible commitment sources

A future source may qualify only if it is explicitly governed as a cognition-serving commitment, for example:

- a structured member provider/domain selection;
- a structured system promise accepted into a commitment registry.

The commitment must have:

- target identity/domain;
- scope;
- activation status;
- version/source;
- closed-world completeness for the scope if absence is to mean no commitment.

### Known results

```text
closed-world registry + no active commitment
  -> known(false)

active commitment + resolved served target + mismatch
  -> known(true)

active commitment + resolved served target + fulfilled
  -> known(false)

active commitment + unresolved served target
  -> unknown

partial/non-authoritative commitment source
  -> unknown
```

### Explicitly insufficient

- serving divergence alone;
- `MAIA_INFERENCE_MODE`;
- internal model flags;
- Trust Drawer `providerUsed`;
- Studio `videoProvider` agreements;
- operator/deployment intent;
- a provider name appearing in prose without governed commitment standing.

Preserve:

> **Routing intent is not automatically member-facing identity commitment.**

## 7. Fact contract — materialCapabilityEffect

Provider/model identity is not capability materiality.

A future producer may establish materiality only from a **governed current-turn capability-impact assessment** that relates:

1. what capabilities the turn/member is entitled or reasonably relying on;
2. what capabilities the actual serving path supplied;
3. whether the difference is material under an explicit versioned rule.

### Known results

```text
complete governed assessment + material
  -> known(true)

complete governed assessment + not material
  -> known(false)

indeterminate assessment
  -> unknown

partial capability manifest
  -> unknown
```

### Explicitly insufficient

- provider change;
- model-name change;
- serving divergence;
- latency difference alone;
- successful provider response;
- `served_model` alone;
- `degraded_non_model` alone without a governed relied-upon capability requirement;
- operator opinion.

Preserve:

> **A substitution can be real without its capability effect already being known.**

## 8. Fact contract — capabilityContractSatisfied

This fact requires an actual member-facing capability contract.

A future producer may classify it only from a **versioned active contract evaluation** with complete evaluation of required clauses for the relevant turn/scope.

### Known results

```text
active contract + complete evaluation + all required clauses satisfied
  -> known(true)

active contract + complete evaluation + required clause violated
  -> known(false)

no active contract
  -> unknown

stale contract
  -> unknown

partial evaluation
  -> unknown

indeterminate clause
  -> unknown
```

### Explicitly insufficient

- provider success;
- provider failure;
- serving divergence;
- provider/model match;
- Trust Drawer telemetry;
- the pre-existing degraded-response copy;
- internal routing policy.

The degraded-response copy may describe a limitation. It may not retroactively author the upstream capability contract whose satisfaction F1 is trying to determine.

Preserve:

> **A response cannot bootstrap the contract used to judge whether that response satisfied the contract.**

## 9. Independence law

The four facts are not aliases.

Do not derive:

```text
explicitIdentityInquiry
  from explicitIdentityMismatch

explicitIdentityMismatch
  from serving divergence

materialCapabilityEffect
  from explicitIdentityMismatch

capabilityContractSatisfied
  from provider success

materialCapabilityEffect
  from capabilityContractSatisfied alone
```

One fact may be known while another remains unknown.

## 10. Evidence hygiene

Future fact production may inspect raw current-turn content where necessary, but raw content must not be smuggled into D2.

A bounded proof record may contain:

- fact name;
- classified value/status;
- evidence kind;
- scope identifier;
- classifier/contract/manifest version;
- non-reversible evidence fingerprint;
- bounded reason code.

It must not contain:

- raw member text;
- prompts;
- response text;
- credentials;
- provider payloads;
- disclosure wording.

No persistence is authorized by F1.

## 11. Distress and Sanctuary

Distress may affect how a later disclosure is expressed. It does not change whether evidence is true.

Sanctuary Mode governs memory consent/retention/pattern formation. It does not change serving identity or fact truth.

F1 creates no persistence and no Sanctuary behavior.

## 12. F1 falsifier requirements

The executable matrix must kill at minimum:

1. serving divergence -> identity inquiry;
2. lexical absence -> inquiry false;
3. ambiguous inquiry -> false;
4. serving divergence -> identity mismatch;
5. Studio video provider -> cognition identity commitment;
6. Trust Drawer served provider -> identity commitment;
7. partial commitment registry -> no-mismatch false;
8. provider/model change -> material effect;
9. degraded service state alone -> material effect;
10. provider success -> capability contract satisfied;
11. absent/stale/partial contract -> satisfied;
12. coupling one D2 fact into another.

The matrix must also prove positive admissibility:

- governed current-turn inquiry classification can establish true/false;
- closed-world commitment registry + resolved serving truth can establish mismatch true/false;
- complete governed capability-impact assessment can establish material true/false;
- active complete capability-contract evaluation can establish satisfied true/false.

## 13. Still not authorized

F1 does not authorize:

- a runtime identity-inquiry classifier;
- a commitment registry;
- provider-selection UI;
- capability manifests;
- materiality evaluator;
- capability-contract registry;
- D2 invocation;
- D1 invocation;
- member-facing disclosure;
- copy/UI/voice changes;
- routing changes;
- deployment.

## 14. Standing after F1 design

```text
Serving Identity
  CANONICAL
  REAL-PROVIDER WITNESSED

D1
  CANONICAL PURE LAW
  RUNTIME CLOSED

D2
  CANONICAL PURE LAW
  RUNTIME CLOSED

F1 fact-production contract
  DESIGNED
  EXECUTABLE FALSIFICATION REQUIRED

runtime fact producers
  NOT BUILT

member-facing disclosure
  CLOSED
```

## Controlling law

> **A fact becomes known because evidence sufficient for that fact establishes it—not because another nearby truth makes the answer feel obvious.**
