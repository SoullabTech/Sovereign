# JARVIS-CANONICAL-PROVIDER-EXECUTION-01 / E1 Witness

**Date:** 2026-09-18
**Authorized base:** `9580ad382089e8ce2e454d28ff3d97c2aa8efe11`
**Lane:** E1 — W0.v2 One-Shot Execution Bridge
**Status:** local implementation/falsification candidate; no PR/merge/deploy/live-provider authority

## 1. Purpose

E1 closes the intentionally open canonical-v2 execution gap left by I4:

```text
W0.v2 canonical Work Unit
        ↓
W2.v2 lifecycle / authorized core
        ↓
W3.v2 / J5.v1 cognitive route
        ↓
W3T.v1 exact transport realization
        ↓
one-shot human E1 execution grant
        ↓
fresh R4 admission + R5A integrity
        ↓
credential presence
        ↓
registered provider adapter
        ↓
DR1.v1 durable standing
        ↓
W4.v2 execution / verifier evidence
```

E1 does not make routing executable. The persisted W3 route continues to carry
`execution_connected=false`. Execution is a separately governed human act.

## 2. I4 preservation

I4 remains canonical in meaning.

E1 does not replace W0.v2, W2.v2, W3.v2, W3T.v1, W4.v2, DR1.v1, R4, R5A,
or the I4 read/control model.

The local D1 W0.v1 candidate was used only as a semantic/falsification donor.
No D1 commit was merged or cherry-picked and no W0.v1 persistence model was restored.

The LEGACY / COMPATIBILITY lane remains separately governed by legacy R5B and
continues to refuse canonical W0.v2 execution verbs.

## 3. Exact one-shot grant

E1 introduces `E1-GRANT.v1`, bound to:

- exact Work Unit identity;
- W2.v2 authorized-core snapshot;
- exact canonical base SHA;
- W3 route version/source/digest;
- exact route participant id;
- model family;
- role and review dimension;
- required-for-completion standing;
- response-budget profile;
- exact active W3T transport-binding id;
- provider id;
- model id;
- adapter id;
- execution mode;
- evidence class;
- readiness status and readiness evidence;
- exact W4 execution/evidence population digest;
- attempt and verifier counts at issuance.

The grant is:

- human-authored;
- append-only;
- one-shot;
- non-transferable;
- exact-participant/exact-transport only.

It cannot alter the authorized core, route, model family, role, transport,
custody, response budget, provider, or evidence population.

## 4. W3T HOLD → READY

I4 transport bindings remain `HOLD` and non-executing.

E1 adds a separate bounded preparation gesture. It may supersede an exact HOLD
binding with `READY` only when the governed W3T mapping remains byte-for-byte
equivalent in its load-bearing identity:

- route participant;
- model family;
- role;
- provider;
- model;
- adapter;
- execution mode;
- response budget;
- evidence class.

No credential is read and no provider is contacted during this transition.

Every required route participant must have exactly one active automatic READY
binding before E1 may issue execution authorization.

## 5. R4 and R5A remain load-bearing

R4 is not rewritten.

E1 derives a single-act, ephemeral R4 admission projection from the exact W3
participant plus exact active W3T binding. It is never persisted as route truth.

Before human authorization, R4 must be held only for the exact:

`provider.execute:<provider-id>`

All repository/network/spend/disclosure authority must already exist in W0.v2.

On Confirm Execute, E1 independently rechecks the real W3.v2 route digest and
bound SHA under R5A.v1.

Thus:

```text
R4 admission != R5A route integrity
```

Both must pass.

## 6. Human separation

The visible constitutional distinction remains:

```text
Authorize Once != Confirm Execute
```

Preview and Authorize Once perform no credential lookup and no provider call.

Confirm Execute re-reads:

1. W2.v2 lifecycle eligibility;
2. W2 authorized-core snapshot;
3. W3 route version/digest/SHA;
4. exact route participant;
5. exact active W3T binding;
6. exact ACTIVE human grant;
7. fresh R4 admission;
8. fresh R5A integrity;
9. exact execution/evidence population.

Only after these checks pass may credential presence be queried.

## 7. Credential custody

The Desktop parent checks credential presence only after final admission.

For Tinker, credential value hydration remains in a short-lived child adapter.
The child may receive `TINKER_API_KEY` from its inherited approved environment
or read the existing `soullab.tinker.api` macOS Keychain item.

The value is never returned to the renderer and is never written to W0.v2,
W3/W3T, the E1 grant ledger, DR1, or W4.

The child invokes the existing `tinker-direct.mjs` registered adapter.

## 8. Evidence custody and provider execution

Canonical repository evidence is materialized from the exact W0.v2 base SHA and
the exact bounded `scope.allowed_paths` into a temporary read-only execution
sandbox.

The default local OpenCode path uses the existing `jarvis-readonly` agent.

External Tinker receives only the bounded materialized evidence supplied by E1.
No repository path outside the canonical scope is materialized.

No provider execution was performed during E1 implementation/falsification.
All execution-order tests use deterministic injected stubs.

## 9. One-shot consumption

The append-only E1 grant ledger uses:

```text
ISSUED → ACTIVE → CLAIMED → CONSUMED
```

or the terminal alternatives:

```text
ACTIVE → REVOKED
ACTIVE / CLAIMED → INVALIDATED
```

The grant is claimed before provider launch.

A failed provider act still consumes the grant.

A retry cannot inherit the prior grant. A later retry must pass current-state
admission and receive a distinct human grant.

The ledger uses an exclusive sidecar lock so overlapping issue/claim gestures
fail closed.

## 10. DR1 and W4 evidence

After the provider attempt, E1:

- persists a bounded durable result sidecar;
- registers exact model identity in W4.v2;
- maps provider/wrapper standing through DR1.v1;
- appends the durable W4 attempt;
- appends a provider-result artifact reference/digest;
- appends test standing where available.

An independent review is a distinct W4 `independent_model_review` attempt.
It cannot be rewritten as a retry.

Verifier evidence is appended separately and does not adjudicate.

## 11. EVIDENCE_READY remains explicit

E1 does not automatically transition to EVIDENCE_READY.

A separate human-visible gesture is admitted only when:

- every required route participant has a completed durable attempt; and
- explicit W4 verifier evidence exists.

Only then does W2.v2 perform `EXECUTING → EVIDENCE_READY`.

I4's separate explicit human adjudication and separate closure gestures remain
unchanged.

## 12. Desktop / IPC boundary

No new privileged preload channel was added.

E1 extends the existing:

`jarvis:work-unit-action`

with bounded canonical actions:

- `canonical-prepare-execution-transport`
- `canonical-execution-auth-preview`
- `canonical-authorize-execution-once`
- `canonical-confirm-execute`
- `canonical-revoke-execution-grant`
- `canonical-record-verifier`
- `canonical-evidence-ready`

For Confirm Execute the renderer supplies only:

- Work Unit id;
- E1 grant id.

It cannot supply provider/model/adapter identity, raw authority, route digest,
canonical SHA, credential, or grant contents.

## 13. E1 falsification evidence

Pure E1 execution law:

**15 / 15 PASS**

Append-only grant-store proof:

**9 / 9 PASS**

Child credential-custody proof:

**4 / 4 PASS**

Desktop E1 integration / ordering:

**6 / 6 PASS**

The evidence proves at minimum:

- route recommendation cannot execute;
- W3T HOLD cannot execute;
- human grant alone cannot execute;
- Confirm Execute reruns R4 and R5A;
- provider availability cannot substitute model family;
- superseded binding invalidates authorization;
- canonical SHA drift invalidates authorization;
- route digest drift invalidates authorization;
- authorized-core mutation invalidates authorization;
- W4 population drift invalidates authorization;
- retries do not inherit grants;
- credentials are untouched before final admission;
- provider failure consumes the grant;
- durable/W4 evidence does not mutate authority or route truth;
- verifier evidence does not adjudicate;
- legacy execution cannot impersonate canonical E1.

## 14. Canonical regression population

Reproduced locally on the E1 worktree:

- W0.v2: **12 / 12**
- W2.v2: **13 / 13**
- J5.v1: **14 / 14**
- W3.v2: **11 / 11**
- W3T.v1: **11 / 11**
- DR1.v1: **10 / 10**
- W4.v2: **23 / 23**
- W5.v2: **12 / 12 composition + 24 / 24 required falsifiers**
- I1 falsifiers: **18 / 18**
- I2 falsifiers: **20 / 20**
- I4 canonical Desktop falsifiers: **30 / 30**
- R4: **24 / 24**
- R5A: **20 / 20**
- legacy R5B: **15 / 15**
- legacy R5B store: **8 / 8**
- E1 pure law: **15 / 15**
- E1 grant store: **9 / 9**
- E1 child credential custody: **4 / 4**
- E1 Desktop integration: **6 / 6**
- provider governance proof: **44 / 44**
- Alpha/preload floor: **97 / 97**
- Desktop: **179 pass / 0 fail / 9 intentional skip**
- provider-governance guard: **PASS — no new OpenAI surface**
- TypeScript no-regression: **229 diagnostics vs 239 baseline; 0 regressions**
- scripts diagnostics: **40**, matching the I4 baseline; no E1-path diagnostic observed
- full production build: **PASS**
- full `npm run jarvis:proof`: **PASS**
- diagrams: **PASS**
- `git diff --check`: **PASS**

Repository-wide sovereignty is not claimed green. The current audit reports
**50 critical + 1 medium** pre-existing findings in unrelated legacy/cloud
surfaces. The audit reports **0 violations on the 13 E1 changed/untracked
candidate files**, so E1's sovereignty standing is **no regression**, not
whole-repository closure. The older `check:sovereignty` npm alias is also
stale at this base because it points to a missing
`scripts/check-maia-sovereignty.ts`; the available
`audit:sovereignty` command was used instead.

## 15. Freshness

Authorized base:

`9580ad382089e8ce2e454d28ff3d97c2aa8efe11`

Canonical advanced during the local build to:

`b040d3bcaafe30df83e35a2fe534f5d0ea85e118`

The intervening changes are the RGR-03 hypothesis/integration package only.

Changed canonical paths are limited to:

- `docs/programme/RGR-03_FALSIFICATION_CONTRACT_2026-09-18.md`
- `docs/programme/RGR-03_MINIMAL_RELATIONAL_TRANSFER_HYPOTHESIS_2026-09-18.md`
- `docs/programme/RGR-03_WORK_UNIT_2026-09-18.json`

Overlap with E1 implementation paths:

**none**

Freshness standing: **PASS — non-overlapping canonical drift.**

## 16. Non-events

E1 implementation/falsification performed no:

- live provider/model request;
- external network provider execution;
- provider spend;
- repository disclosure to an external provider;
- automatic retry;
- model-family substitution;
- provider fallback;
- automatic verifier verdict;
- automatic EVIDENCE_READY;
- automatic adjudication;
- legacy retirement;
- merge;
- deployment;
- production mutation;
- PR creation or update.

## 17. Standing

E1 is a local implementation/falsification candidate only.

The exact candidate SHA is established by the containing commit after the
E1-scoped sovereignty/no-regression checks and exact-head reruns complete.
Repository-wide legacy sovereignty debt remains separately visible and is not
reclassified by E1.

No merge, deployment, production mutation, or live provider execution is
authorized by this witness.
