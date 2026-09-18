# JARVIS-ROUTING-INTELLIGENCE-01 · J6-WORK-UNIT-INTEGRATION-04 / I3 Witness

**Date:** 2026-09-18
**Authorization:** I3 W5.v2 SYNTHETIC CANONICAL COMPOSITION ONLY
**Canonical base:** `8c8525eae316f21eeb844ba7af4af7ab1476f461`
**Proven I2 donor:** `fdcff64ec0252cb4ec6fdcff160f30607760d2eb`
**Status:** bounded candidate, not PR/merge/deploy authorized

## 1 · Scope

I3 was constructed from exact canonical `8c8525ea…`.

The exact I2 candidate was used only as governed donor material. Its branch was not merged, rebased, force-pushed, amended, or otherwise mutated.

I3 admits the exact proven I2 substrate and adds only:

- `scripts/builder/work-unit-e2e-v2.mjs`
- `scripts/builder/__tests__/work-unit-e2e-v2-proof.mjs`
- I3 documentary/evidence records.

Historical W0/W2/W3/W4/W5 v1 modules remain unchanged in semantics.

I3 does not implement:

- live provider execution;
- credential access;
- Desktop convergence;
- compatibility-adapter migration;
- schema/database changes;
- PR mutation;
- merge/deploy/production/member-facing MAIA changes.

## 2 · Canonical W5.v2 composition

The synthetic Work Unit proves the exact lifecycle:

```text
DRAFT
→ BOUNDED
→ AUTHORIZED
→ ROUTED
→ EXECUTING
→ EVIDENCE_READY
→ ADJUDICATED
→ CLOSED
```

Every lifecycle mutation occurs only through `transitionLifecycleV2()`.

W5.v2 never writes `lifecycle_state` directly.

## 3 · Authorized core

The synthetic W0.v2 Work Unit uses:

- task shape: `CODE_GROUNDED`;
- custody: `E1_REPOSITORY_LOCAL`;
- requested posture: `default`;
- review pressure: `ordinary`;
- deterministic capability: null;
- repository_read: true;
- all external/spend/deploy/production authority: false/none.

The W2.v2 authorized-core snapshot remains identical through CLOSED.

## 4 · Route / transport

W3.v2 binds the J5.v1 family-first route:

```text
primary:
  participant_id: primary
  model_family: QWEN
  role: code_primary

required independent review:
  participant_id: local-review-1
  model_family: GPT_OSS
  role: independent_local_challenger
```

R5A integrity remains present:

- route version;
- route source;
- route digest;
- exact bound SHA;
- `execution_connected:false`.

W3T.v1 binds:

- QWEN → qwen-local / qwen3-coder:30b / opencode;
- GPT_OSS → gpt-oss-local / gpt-oss:20b / opencode.

These are synthetic governed bindings only. No provider call occurs.

## 5 · Execution evidence

After W2.v2 admits EXECUTING, W4.v2 + DR1.v1 record:

### Primary

```text
attempt_id: primary-1
kind: primary
family: QWEN
status: failed
durable exit_code: 4
wrapper exit: 0
```

The durable failure outranks wrapper success.

### Retry

```text
attempt_id: retry-1
kind: retry
family: QWEN
parent: primary-1
status: completed
```

The retry preserves the exact governed QWEN identity chain.

### Independent review

```text
attempt_id: independent-review-1
kind: independent_model_review
family: GPT_OSS
participant: local-review-1
parent: retry-1
status: completed
```

### Verifier evidence

```text
target_attempt_id: retry-1
verifier_attempt_id: independent-review-1
disposition: supports
```

W4 append operations leave lifecycle state at EXECUTING.

## 6 · Evidence readiness

W5.v2 requires all of the following before requesting EVIDENCE_READY:

- failed primary exists and remains failed;
- successful retry exists and preserves primary model identity;
- independent GPT_OSS review exists on the challenger participant;
- verifier evidence references the retry and independent review.

Only then does W5.v2 ask W2.v2 for:

`EXECUTING → EVIDENCE_READY`

## 7 · Adjudication boundary

Evidence does not self-adjudicate.

W5.v2 creates a distinct synthetic adjudication record:

```text
actor_kind: human
actor_id: synthetic:governing-adjudicator
decision: accepted
model_authored: false
evidence_ref: adjudication:w5-v2-accepted
```

W5.v2 refuses:

- model-authored adjudication;
- model consensus as adjudication;
- verifier evidence alone as adjudication;
- missing adjudication evidence reference;
- unknown adjudication fields.

Only after that explicit record exists does W5.v2 ask W2.v2 for:

`EVIDENCE_READY → ADJUDICATED`

with `adjudication: accepted`.

## 8 · Closure boundary

Closure has a distinct synthetic record that explicitly cites the adjudication reference.

W5.v2 refuses closure unless lifecycle state is already ADJUDICATED.

Only then does it ask W2.v2 for:

`ADJUDICATED → CLOSED`

There is no EXECUTING → CLOSED shortcut.

## 9 · Failure/provenance retention

The CLOSED Work Unit still contains:

- failed `primary-1`;
- successful `retry-1`;
- independent `independent-review-1`;
- verifier result;
- both model identities;
- both transport bindings;
- immutable route record/digest;
- adjudication reference;
- closure reference.

The failed primary snapshot is byte-identical before and after closure.

Closure does not collapse history into the successful path.

## 10 · Structural law

Source-level proof establishes W5.v2:

- calls W2.v2 transition authority;
- calls W3.v2 route binding;
- calls W3T.v1 transport binding;
- calls W4.v2 ledger append;
- uses W4.v2 durable-attempt append, which uses DR1.v1;
- does not directly assign lifecycle state;
- does not import legacy `deriveLifecycle()`;
- has no filesystem, child-process, network, credential, provider-execution, deploy, or production capability.

## 11 · Required I3 falsifiers

All 24 pass:

1. DRAFT → AUTHORIZED shortcut refused;
2. AUTHORIZED → EXECUTING shortcut refused;
3. ROUTED → EXECUTING without required bindings refused;
4. failed primary removed before retry refused;
5. retry changing governed identity refused;
6. retry cannot serve as independent verifier;
7. same-family/different-provider review not independent;
8. independent review without challenger participant refused;
9. builder cannot verify itself;
10. verifier evidence alone cannot create ADJUDICATED;
11. model consensus cannot create ADJUDICATED;
12. model prose cannot change lifecycle;
13. EXECUTING → CLOSED shortcut refused;
14. EVIDENCE_READY without complete evidence refused;
15. ADJUDICATED without explicit adjudication reference refused;
16. CLOSED without prior ADJUDICATED refused;
17. failed primary cannot disappear after retry;
18. route digest mutation after ROUTED refused;
19. transport binding cannot be changed after execution evidence begins;
20. authorized-core mutation after AUTHORIZED refused;
21. W4 cannot transition lifecycle;
22. W5 cannot directly write lifecycle state;
23. legacy `deriveLifecycle()` cannot override W2.v2;
24. unknown evidence fields cannot widen authority/lifecycle.

Result:

**24 / 24 PASS**

## 12 · W5.v2 proof population

- composition/structural assertions: 12 / 12
- required I3 falsifiers: 24 / 24

New I3 assertions:

**36 / 36**

## 13 · I2 regression

- DR1.v1: 10 / 10
- W4.v2: 23 / 23
- I2 falsifiers: 20 / 20

## 14 · I1 regression

- W0.v2: 12 / 12
- W2.v2: 13 / 13
- J5.v1: 14 / 14
- W3.v2: 11 / 11
- W3T.v1: 11 / 11
- I1 falsifiers: 18 / 18

## 15 · Historical/current canonical regression

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

Full JARVIS:

**253 / 253**

## 16 · TypeScript evidence

Ship no-regression:

- program files: 4379
- diagnostics: 229
- baseline: 239
- regressions: 0

Scripts:

- exact I2 identities: 40
- I3 identities: 40
- identity diff: none
- diagnostics on W5.v2 path: 0

## 17 · Credential/provider precision

I3 runtime and proof code performs no credential lookup and no provider/model execution.

No paid/live provider or model call occurred.

The required broad pre-existing `npm run jarvis:proof` suite includes its already-governed synthetic Keychain-to-stub credential-isolation proof. That regression fixture is not I3 runtime behavior and does not make a live provider request.

## 18 · Remaining architectural gap before Desktop convergence

No canonical v2 Work Unit lifecycle/provenance composition gap remains in the synthetic core.

What remains before Desktop convergence is interface/integration work:

1. Desktop must create/persist W0.v2 rather than legacy packets as canonical truth.
2. preview must remain prospective; W3.v2 binding after AUTHORIZED becomes canonical.
3. W3T bindings need a read model/presentation without renderer-authored provider authority.
4. W4.v2 attempts/verifier history need a canonical read model.
5. human adjudication must become an explicit UI/governance gesture rather than synthetic fixture data.
6. real provider execution remains separately disconnected behind R4/R5A and requires its own later authorization.
7. legacy compatibility paths must remain subordinate until separately retired.

Thus Desktop convergence is now an interface over a proven architecture, not an architectural invention.

## 19 · Durable evidence

I3 evidence directory:

`docs/programme/evidence/JARVIS-ROUTING-INTELLIGENCE-01/J6_WORK_UNIT_I3/`

contains:

- W5.v2 composition/falsifier output;
- exact synthetic lifecycle/provenance artifact;
- proof summary;
- I2 donor-admission record;
- TypeScript evidence;
- scope record;
- SHA-256 manifest.

Raw broad Builder logs remain ephemeral because they may contain lease tokens.

## 20 · Non-events

I3 performed no:

- paid/live model call;
- provider execution;
- I3 credential access;
- network execution;
- provider spend;
- repository execution;
- Desktop convergence;
- compatibility-adapter migration;
- schema/database change;
- PR creation/update;
- merge;
- deployment;
- production access;
- member-facing MAIA change.

## 21 · Standing before commit

I3 implementation and proof population are complete on the working candidate.

Sovereignty/pre-commit gates and post-commit exact-head rerun remain owed.

Stop target:

`J6-WORK-UNIT-I3-EXACT-HEAD-EVIDENCE-01`

No PR/merge/deploy authority is implied.
