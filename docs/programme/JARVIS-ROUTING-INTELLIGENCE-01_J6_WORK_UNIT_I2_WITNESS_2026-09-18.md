# JARVIS-ROUTING-INTELLIGENCE-01 · J6-WORK-UNIT-INTEGRATION-03 / I2 Witness

**Date:** 2026-09-18
**Authorization:** I2 W4.v2 PROVENANCE + DURABLE-RESULT MAPPING ONLY
**Canonical base:** `caddb904c7cfddcec0da0888a98bfb8795ae23d2`
**Proven I1 donor:** `e4cfc1cbcd88fe1d714f0d11a75528237110ef8e`
**Status:** bounded candidate, not PR/merge/deploy authorized

## 1 · Scope

I2 was constructed from current canonical `caddb904…`.

The exact I1 candidate was used only as governed donor material. Its branch was not merged or rebased.

I2 admits the exact proven I1 successor substrate:

- W0.v2
- W2.v2
- J5.v1 cognitive router
- W3.v2 route binding
- W3T.v1 transport binding

and adds only:

- `scripts/builder/work-unit-ledger-v2.mjs`
- `scripts/builder/durable-result-v1.mjs`

plus pure deterministic proof/evidence files.

Historical W0/W2/W3/W4/W5 v1 remain untouched in semantics.

I2 does not implement:

- W5.v2 composition;
- Desktop convergence;
- provider execution connection;
- compatibility-adapter migration;
- provider/model calls;
- production/deploy/schema/member-facing MAIA changes.

## 2 · W4.v2 provenance chain

A model execution attempt is now bound through the immutable chain:

```text
route_participant_id
        ↓
transport_binding_id
        ↓
model_identity_id
        ↓
attempt_id
```

A W4.v2 model identity records:

- route participant id;
- transport binding id;
- model family;
- provider id;
- model id;
- adapter id;
- role.

Admission proves:

1. route participant exists;
2. model family + role match the J5 route;
3. transport binding exists and is active;
4. binding belongs to that participant/family/role;
5. provider/model/adapter exactly match the binding;
6. binding readiness is READY or route-authorized MANUAL_ONLY.

Provider identity is therefore provenance after family-first routing, never a replacement for the cognitive route.

## 3 · Attempt kinds

W4.v2 explicitly distinguishes:

- `primary`
- `retry`
- `independent_model_review`
- `deterministic_verification`
- `human_verification`

Model attempts carry the full route/transport/model chain.

Deterministic/human verification attempts carry no model identity and instead record a non-model `actor_id`.

This lets verifier evidence point to an actual verification act rather than free-floating provider fields.

## 4 · Retry law

A retry must preserve the exact governed model identity chain of its parent:

- route participant;
- transport binding;
- model identity;
- model family;
- provider;
- model;
- adapter;
- role.

A retry cannot silently become another model or provider.

A retry remains attempt kind `retry`.

It is not independent review.

## 5 · Independent model review law

An independent model review must:

- have a parent attempt;
- use a challenger route participant;
- use a distinct governed model identity;
- use a different model family from the target attempt.

A different provider from the same model family is still the same cognitive family and does not count as independent review.

This is enforced even if malformed upstream provenance somehow presents such a route/binding combination.

## 6 · Builder ≠ verifier

Verifier results no longer carry arbitrary model provider fields.

They reference:

- `target_attempt_id`;
- `verifier_attempt_id`;
- evidence disposition;
- evidence refs.

The verifier attempt must already exist and must be one of:

- independent model review;
- deterministic verification;
- human verification.

It must directly reference the target attempt as its parent.

The target attempt cannot be its own verifier.

Independent model verifier attempts must already satisfy distinct-family + challenger-participant law.

## 7 · Append-only failure history

W4.v2 retains W4.v1 immutable append semantics.

A failed attempt remains in history after later success.

Example proven synthetic chain:

```text
a1  primary QWEN  failed
 ↓
a2  retry QWEN    completed
 ↓
review1 GPT_OSS independent review completed
 ↓
verifier_result supports a2
```

The first failure remains `failed`.

Reusing `a1` with different status/evidence is refused as a conflicting immutable record.

Duplicate immutable ids are refused even when bytes match.

## 8 · DR1.v1 durable-result mapping

The smallest pure deterministic result mapper is:

`scripts/builder/durable-result-v1.mjs`

It has:

- no imports;
- no filesystem/network/environment access;
- no authority mutation;
- no lifecycle mutation.

Deterministic precedence:

1. provider admission refusal → `refused`
2. durable nonzero numeric `exit_code` → `failed`
3. `recommended_next_action = reject` → `rejected`
4. `evidence_sufficient = false` → `insufficient`
5. `escalation_required = true` → `escalated`
6. structurally valid durable `exit_code = 0` → `completed`
7. otherwise → `insufficient`

Wrapper/process exit is observable but cannot override the durable result.

Unknown result fields are ignored for standing and authority.

The mapper output explicitly carries:

- `authority_effect: none`
- `lifecycle_effect: none`

## 9 · W4.v2 durable-attempt append

`appendDurableAttemptV2()` refuses caller-supplied status.

It runs DR1.v1, derives the canonical attempt status, then appends the attempt through normal W4.v2 provenance validation.

Therefore:

- caller cannot lie about completed status;
- wrapper success cannot mask durable failure;
- mapping and provenance admission are one deterministic evidence act;
- lifecycle remains untouched.

## 10 · W2 remains lifecycle authority

W4.v2 imports only the W2.v2 authorized-core snapshot helper.

It does not import or call `transitionLifecycleV2()`.

W4 append operations preserve byte-equivalent:

- routing;
- authority;
- Work Unit lifecycle state;
- lifecycle disposition;
- lifecycle guard.

The synthetic I2 fixture remains in:

`EXECUTING`

after all attempt/verifier appends.

A later stage must explicitly ask W2.v2 for any lifecycle transition.

## 11 · Required 20 falsifiers

All pass:

1. model identity without valid route participant refused;
2. model identity without valid transport binding refused;
3. family mismatch refused;
4. provider/model mismatch with binding refused;
5. retry changing governed identity refused;
6. retry cannot be used as independent verifier;
7. same-family different-provider review not independent;
8. independent review on primary participant refused;
9. same-family independent review refused;
10. builder cannot verify itself;
11. failed attempt cannot be overwritten by later success;
12. append cannot mutate earlier immutable record;
13. wrapper exit 0 cannot override durable nonzero exit;
14. durable reject cannot map completed;
15. insufficient evidence cannot map completed;
16. escalation cannot map completed;
17. MERGED/DEPLOYED/CLOSED prose cannot change state;
18. W4 has no W2 lifecycle authority;
19. attempt identity must match exact transport/model provenance;
20. unknown attempt/result fields cannot widen standing or authority.

Result:

**20 / 20 PASS**

## 12 · I2 proof population

New I2:

- DR1.v1 durable result mapper: 10 / 10
- W4.v2 provenance ledger: 23 / 23
- I2 required falsifier matrix: 20 / 20

Total new I2 assertions:

**53 / 53**

## 13 · I1 regression

The exact I1 donor proof population remains green on the I2 candidate:

- W0.v2: 12 / 12
- W2.v2: 13 / 13
- J5.v1: 14 / 14
- W3.v2: 11 / 11
- W3T.v1: 11 / 11
- I1 falsifiers: 18 / 18

## 14 · Historical/current canonical regression

Historical v1:

- W1/W0.v1: 22 / 22
- W2.v1: 27 / 27
- W3.v1: 28 / 28
- W4.v1: 31 / 31
- W5.v1: 22 / 22

Current routing/admission/integrity:

- R1: 20 / 20
- R4: 24 / 24
- R5A: 20 / 20

Full canonical JARVIS:

**253 / 253**

## 15 · TypeScript evidence

Ship no-regression:

- program files: 4379
- diagnostics: 229
- baseline: 239
- regressions: 0

Scripts suite:

- exact I1 diagnostic identities: 40
- I2 diagnostic identities: 40
- identity diff: none
- diagnostics on I2 paths: 0

## 16 · Credential / provider-test precision

I2 runtime modules implement no credential access and perform no provider/model call.

No paid/live provider or model call occurred.

The required broad pre-existing `npm run jarvis:proof` regression suite does include its synthetic provider-governance fixture. That fixture exercises the repository's existing bounded Keychain-to-stub credential-isolation test.

Therefore the precise claim is:

> I2 introduces and invokes no credential access or provider execution. The existing full JARVIS regression population includes its already-governed synthetic credential-isolation test against a stub worker, with no live provider request.

## 17 · Durable evidence

Directory:

`docs/programme/evidence/JARVIS-ROUTING-INTELLIGENCE-01/J6_WORK_UNIT_I2/`

contains:

- durable-result proof;
- W4.v2 proof;
- 20-mutant falsification output;
- synthetic provenance fixture;
- I1 donor-admission record;
- proof summary;
- TypeScript evidence;
- SHA-256 manifest.

Raw broad Builder logs remain ephemeral because they may contain lease tokens.

## 18 · Non-events

I2 performed no:

- paid/live model call;
- provider execution connector;
- Desktop convergence;
- W5.v2 implementation;
- compatibility-adapter migration;
- external network execution;
- provider spend;
- repository execution;
- PR creation/update;
- merge;
- deployment;
- production access;
- schema/database migration;
- member-facing MAIA change.

## 19 · Standing before commit

I2 implementation and proof population are complete on the working candidate.

Sovereignty/pre-commit gates and post-commit exact-head rerun remain owed.

Stop target:

`J6-WORK-UNIT-I2-EXACT-HEAD-EVIDENCE-01`

No PR/merge/deploy authority is implied.
