# SERVING-IDENTITY / F2-IM — EXPLICIT IDENTITY-MISMATCH FACT PRODUCER

**Status:** CONTRACT + PURE IMPLEMENTATION + EXECUTABLE FALSIFICATION · NO LIVE SOURCE WIRING · NO D2/D1 INVOCATION  
**Opening canonical:** `872ca7b4a726df5ef404747bddde94e40950809c`  
**Parent law:** `SERVING-IDENTITY / F1 — DISCLOSURE FACT-PRODUCTION CONTRACT`

## 1. Governing question

F2-IM answers one question only:

> **Given an already-governed cognition-identity commitment source and canonical actual serving truth, is there an explicit identity mismatch for the current turn?**

Its output is exactly the D2 fact shape:

```ts
type ClassifiedBoolean =
  | { status: 'known'; value: boolean }
  | { status: 'unknown' };
```

with:

```text
mismatch established
  -> known(true)

fulfilled commitment
  -> known(false)

closed-world current-turn registry + no active commitment
  -> known(false)

insufficient / non-authoritative / incomparable evidence
  -> unknown
```

F2-IM does not decide disclosure.

F2-IM does not create a commitment.

F2-IM does not decide whether a member utterance should become a commitment.

## 2. Two independent truths are required

The fact may become known only from both:

1. **an authoritative cognition-serving commitment source**, and
2. **actual serving identity sufficiently resolved for the same turn**.

Serving truth alone cannot establish this fact.

Commitment evidence alone cannot establish mismatch.

Preserve:

> **Routing intent is not automatically member-facing identity commitment.**

## 3. Commitment source authority

The only authoritative source class admitted by this contract is:

```text
governed_cognition_commitment_registry
```

That source must carry:

- a source/version identifier;
- completeness for the relevant scope;
- scope coverage for the current turn;
- active / none / unknown commitment status;
- a target when active.

The following source classes are explicitly non-authoritative for cognition identity:

```text
studio_video_provider
trust_drawer_telemetry
operator_routing
provider_name_in_prose
unstructured_member_preference
unknown_source
```

They produce `unknown`, not mismatch true/false.

## 4. Closed-world law

A source may establish:

```text
no active commitment -> known(false)
```

only when all three are true:

```text
source authority
  governed cognition commitment registry

completeness
  closed_world

scope
  covers_current_turn
```

If the source is partial, does not cover the turn, or has unknown scope:

```text
unknown
```

Preserve:

> **Absence is evidence only inside a source that is authoritative, complete, and scoped to the question being asked.**

## 5. Initial target vocabulary

F2-IM v1 compares only commitment targets already authorized by F1:

```text
provider
execution domain
```

### Provider target

Examples:

```text
provider = anthropic
provider = local_inference
provider = ollama
```

### Domain target

Examples:

```text
domain = local
domain = external
domain = mixed
```

`unknown` is not a valid committed domain target.

Model-specific commitments are not generalized into F2-IM v1.

A future model-level commitment requires a separately governed amendment.

## 6. Actual serving authority

The actual serving side comes only from canonical:

`LiveServingTruth.served`

F2-IM compares the commitment against **what actually served**, not:

- `routingContract`;
- `intended`;
- divergence;
- operator mode;
- configured preference.

A comparable serving target requires:

```text
serviceState = served_model
served.kind = model
```

For a domain comparison, `served.domain` must also be non-`unknown`.

## 7. Known results

### No active commitment

```text
governed source
+ closed_world
+ covers_current_turn
+ commitment = none
  -> known(false)
```

No actual serving comparison is needed because the fact asks whether an explicit commitment was mismatched and the authoritative closed-world source establishes that no such commitment exists.

### Active provider commitment fulfilled

```text
active provider commitment = anthropic
actual served provider = anthropic
  -> known(false)
```

### Active provider commitment violated

```text
active provider commitment = anthropic
actual served provider = local_inference
  -> known(true)
```

### Active domain commitment fulfilled

```text
active domain commitment = local
actual served domain = local
  -> known(false)
```

### Active domain commitment violated

```text
active domain commitment = local
actual served domain = external
  -> known(true)
```

## 8. Unknown results

Return `unknown` when any of the following holds:

```text
source is non-authoritative
source is partial
source does not cover current turn
source scope is unknown
commitment status is unknown
active commitment + serviceState = unresolved
active commitment + serviceState = degraded_non_model
active commitment + serviceState = served_non_model
active domain commitment + served domain = unknown
```

Intentional non-model service is not automatically an identity mismatch.

Degraded non-model service is not automatically an identity mismatch.

Those states may matter to other fact producers.

## 9. Explicitly forbidden shortcuts

F2-IM must never derive mismatch from:

```text
serving divergence
routing intent
MAIA_INFERENCE_MODE
provider fallback alone
provider/model difference alone without commitment
Trust Drawer providerUsed
Studio videoProvider
provider name in prose
member preference without admitted commitment standing
classifier output from F2-IQ
distress
Sanctuary
```

Preserve:

> **A difference can be real without being a broken promise.**

## 10. Independence from F2-IQ

F2-IQ determines whether the member explicitly asked about serving identity.

F2-IM determines whether an independently established serving-identity commitment was violated.

Therefore:

```text
explicitIdentityInquiry = known(true)
  does not imply
explicitIdentityMismatch = known(true)
```

and:

```text
explicitIdentityMismatch = known(true)
  does not imply
explicitIdentityInquiry = known(true)
```

No F2-IQ runtime output is an input to F2-IM.

## 11. Producer boundary

The pure producer may accept only:

```text
CognitionIdentityCommitmentEvidence
LiveServingTruth
```

and return:

```text
ClassifiedBoolean
```

It may not:

- read raw member text;
- read conversation history;
- read memory;
- discover commitments;
- inspect environment configuration;
- perform network/model calls;
- persist evidence;
- log raw content;
- invoke D2;
- invoke D1;
- produce member-facing copy.

## 12. Falsifier requirements

The executable matrix must kill at minimum:

1. serving divergence -> mismatch;
2. operator routing -> commitment;
3. Studio video provider -> cognition commitment;
4. Trust Drawer telemetry -> commitment;
5. provider name in prose -> commitment;
6. partial registry absence -> known(false);
7. non-authoritative active claim -> known(true/false);
8. out-of-scope registry -> known(false);
9. unknown-scope registry -> known(false);
10. closed-world no active commitment fails to produce known(false);
11. fulfilled provider commitment becomes mismatch;
12. violated provider commitment becomes no mismatch;
13. fulfilled domain commitment becomes mismatch;
14. violated domain commitment becomes no mismatch;
15. unresolved serving target becomes false/true;
16. served_non_model becomes mismatch;
17. degraded_non_model becomes mismatch;
18. unknown served domain is forced into a domain boolean;
19. routing intended provider is compared instead of actual served provider;
20. F2-IQ inquiry fact is used as mismatch evidence.

Every defeat candidate must die on its intended falsifier without undeclared collateral kills.

## 13. Positive guards

The matrix must prove:

- closed-world current-turn no commitment -> known(false);
- provider fulfilled -> known(false);
- provider mismatch -> known(true);
- domain fulfilled -> known(false);
- domain mismatch -> known(true);
- all insufficient/incomparable conditions -> unknown;
- F1, F2-IQ, D2, D1, and R2 laws remain unchanged;
- F2-IQ runtime classifier remains unchanged;
- no live route is wired to F2-IM;
- no D2/D1 call is introduced;
- diff remains contract + pure producer + matrix + package registration only.

## 14. No runtime source claim

Repository census at opening canonical found no general member-facing cognition-provider commitment registry on the live MAIA path.

Therefore F2-IM v1 creates **no runtime fact flow**.

The producer exists and is executable, but without a separately governed commitment source, live `explicitIdentityMismatch` remains unproduced.

## 15. Still not authorized

F2-IM does not authorize:

- commitment registry implementation;
- provider/model selection UI;
- conversion of member preference into commitment;
- system-promise persistence;
- route wiring;
- D2 invocation;
- D1 invocation;
- member disclosure;
- disclosure UI/voice;
- routing changes;
- production deployment.

## Controlling law

> **A serving difference becomes an identity mismatch only when an authoritative, in-scope commitment exists and actual service can be compared against it.**
