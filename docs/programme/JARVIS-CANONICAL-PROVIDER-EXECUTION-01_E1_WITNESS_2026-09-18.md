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

Authorized E1 implementation base:

`9580ad382089e8ce2e454d28ff3d97c2aa8efe11`

Initial canonical freshness advanced through RGR-03 to:

`b040d3bcaafe30df83e35a2fe534f5d0ea85e118`

Those intervening RGR-03 changes were limited to:

- `docs/programme/RGR-03_FALSIFICATION_CONTRACT_2026-09-18.md`
- `docs/programme/RGR-03_MINIMAL_RELATIONAL_TRANSFER_HYPOTHESIS_2026-09-18.md`
- `docs/programme/RGR-03_WORK_UNIT_2026-09-18.json`

Founder freshness reconciliation then verified authoritative remote canonical:

`78ba888aa074b9685ce810ace13d9228bdce469f`

The additional `b040d3bc… → 78ba888a…` interval is MAIA Teaching
Intelligence T4 only, limited to:

- `docs/programme/MAIA-TEACHING-INTELLIGENCE-01_T4_KNOWLEDGE_RETRIEVAL_ORCHESTRATION_CONTRACT_2026-09-18.md`
- `lib/maia/teaching/KnowledgeRetrievalOrchestrationContract.ts`
- `lib/maia/teaching/__tests__/KnowledgeRetrievalOrchestrationContract.test.ts`

No E1 implementation, Desktop, W0/W2/W3/W3T/W4/DR1, R4, R5A, R5B,
credential-custody, response-budget, provider-governance, or preload path
changed in either freshness interval.

The exact E1 candidate patch replayed onto `78ba888a…` with zero conflicts and
the same 13 E1 paths.

A second PR-level freshness check before the authorized merge found that canonical
had advanced again to:

`6ef0cbd0ee9be2601523a3d8de69dcbdfc5a8566`

through Writer's Studio Author Agency / passage-conversation integration
(PR #1402). The `78ba888a… → 6ef0cbd0…` interval changes only Writer's Studio,
editorial-runtime, structured-inference, migration, programme, and witness paths.
Its changed-path population has **zero intersection with the 13 E1 candidate
paths**.

PR #1404 was therefore not merged under the stale exact-canonical authorization.
Instead, the accepted E1 head `8a9b7e26f69526b5eca2365f45157419a78f1b23`
was merge-forward reconciled with exact canonical
`6ef0cbd0ee9be2601523a3d8de69dcbdfc5a8566` with zero conflicts. The 12 E1
implementation/test paths remain byte-identical to the accepted PR head; only
this witness records the additional freshness reconciliation.

A third PR-level freshness check after the second exact-head CI found that
canonical had advanced again to:

`83214ed576fad7b4b15430d3b4e46ac613ad5528`

through JARVIS-KP-01 ACT 9 / ACT 10 documentary/evidence integration (PR #1400).
The `6ef0cbd0… → 83214ed5…` interval is limited to the ratified ACT 9 / ACT 10
programme and evidence population. Its changed-path population has **zero
intersection with the 13 E1 candidate paths**.

PR #1404 was therefore not merged under the stale exact-canonical authorization.
Instead, the prior E1 PR head
`861fc24a3cd9e831ff3cb7d174ad75661b8c2921` was merge-forward reconciled
with exact canonical
`83214ed576fad7b4b15430d3b4e46ac613ad5528` with zero conflicts. The 12 E1
implementation/test paths remain byte-identical to the prior PR head, while the
ACT 9 / ACT 10 documentary/evidence population is preserved byte-identically
from canonical. Only this witness records the additional freshness
reconciliation.

A fourth PR-level freshness check found that R3 reconciliation was not begun
because canonical had already advanced again to:

`fb9f79b10090c2e668b9e8a989de2af4ba26f69a`

through MAIA Teaching Intelligence T5 Research Citation Provenance (PR #1405).
The `567e062b… → fb9f79b…` interval is limited to the T5 research citation
provenance contract, implementation, and test, and has **zero intersection with
the 13 E1 candidate paths**.

R4 therefore merge-forward reconciles prior E1 head
`bc751084e3a46a6eb23b35500b8851e24f900b85` onto exact canonical
`fb9f79b10090c2e668b9e8a989de2af4ba26f69a`. This necessarily carries forward
the already-canonical RGR-04 package from `567e062b…` plus the three T5 files.
All E1 implementation/test paths remain byte-identical to `bc751084e…`; the
RGR-04 and T5 populations are preserved byte-identically from canonical. Only
this witness records the R4 freshness reconciliation.

A fifth PR-level freshness check found that the proven local R4 head could not
be published because canonical advanced again to:

`bb578146086e7b24f2ccb5215a1ecbe2d807c569`

through Writer's Studio manuscript-centered editorial workspace changes
(PR #1406). The `fb9f79b… → bb578146…` interval is limited to Writer's Studio
UI, editorial-workspace tests, and preview-support files and has **zero
intersection with the 13 E1 candidate paths**.

R5 therefore merge-forward reconciles local R4 head
`d2c90648bce7fad8d4b1b44b48615d7806f8db67` onto exact canonical
`bb578146086e7b24f2ccb5215a1ecbe2d807c569` with zero conflicts. All E1
implementation/test paths remain byte-identical to `d2c90648b…`; the existing
RGR-04 and T5 populations remain byte-identical to canonical, and the entire
Writer's Studio interval is carried forward byte-identically from
`bb578146…`. Only this witness records the R5 freshness reconciliation.

A sixth PR-level freshness check found that the CI-green R5 head could not be
merged because canonical advanced again to:

`f0a16d9c2fc5f5588de40726021c7b19e76e1a2e`

through Writer's Studio manuscript hierarchy correction (PR #1409). The
`bb578146… → f0a16d9c…` interval is limited to four Writer's Studio
manuscript-hierarchy files and has **zero intersection with the 13 E1 candidate
paths**.

R6 therefore merge-forward reconciles exact R5 head
`bf42441e22baae2176691430bae4400350ec2d36` onto exact canonical
`f0a16d9c2fc5f5588de40726021c7b19e76e1a2e` with zero conflicts. All E1
implementation/test paths remain byte-identical to `bf42441e…`; the existing
RGR-04 and T5 populations remain byte-identical to canonical, and the Writer's
Studio canonical state is carried forward byte-identically from
`f0a16d9c…`. Only this witness records the R6 freshness reconciliation.

A seventh PR-level freshness check found that the CI-green R6 head could not be
merged because canonical advanced again to:

`b0b07871b200a074874c68edc4084cbd3b8174bc`

through JARVIS-KP-01 ACT 11 Epistemic Join Enforcement Contract (PR #1407).
The `f0a16d9c… → b0b07871…` interval adds only the ACT 11 enforcement contract,
Work Unit, static falsification witness, and synthetic falsification corpus and
has **zero intersection with the 13 E1 candidate paths**.

R7 therefore merge-forward reconciles exact R6 head
`b9ea06ed5546cb00c50b91a965b7e695e3cf03af` onto exact canonical
`b0b07871b200a074874c68edc4084cbd3b8174bc` with zero conflicts. All E1
implementation/test paths remain byte-identical to `b9ea06ed…`; prior
RGR-04, T5, and Writer's Studio canonical populations remain byte-identical to
canonical, and the ACT 11 population is carried forward byte-identically from
`b0b07871…`. Only this witness records the R7 freshness reconciliation.

An eighth authorized freshness act (R8) was not begun because canonical had
already advanced beyond its exact target. R9 therefore begins from the proven
R7 head and reconciles both subsequent canonical intervals.

Canonical first advanced to:

`1ec63baeed4447626554e417d3ac1f2c498bf829`

through JARVIS-KP-01 ACT 12 Adversarial Epistemic Join Falsification (PR #1411),
adding only the ACT 12 method, Work Unit, adversarial corpus, and falsification
results.

Before R8 could begin, canonical advanced again to:

`65c45f360f6d6c92dd361980999ffbabad3d725e`

through Writer's Studio page-conversation integration (PR #1410), changing only
five Writer's Studio page-conversation files. Both intervals have **zero
intersection with the 13 E1 candidate paths**.

R9 therefore merge-forward reconciles exact proven R7 head
`5e4db70b9afa0c7ec6cc661889a6969d52d9b862` onto exact canonical
`65c45f360f6d6c92dd361980999ffbabad3d725e` with zero conflicts. All E1
implementation/test paths remain byte-identical to `5e4db70b…`; RGR-04, T5,
ACT 11, ACT 12, and all Writer's Studio canonical populations are preserved
byte-identically from canonical. Only this witness records the R9 freshness
reconciliation.

A tenth authorized freshness act (R10) found canonical still exactly at the
Founder-authorized target:

`5759ad39b04076ff0973ed8c27f62048b6961fa9`

through MAIA Teaching Intelligence T6 Learner Dialogue Adaptation (PR #1412).
The `65c45f36… → 5759ad39…` interval adds only the T6 learner dialogue
adaptation contract, implementation, and test and has **zero intersection with
the 13 E1 candidate paths**.

R10 therefore merge-forward reconciles exact proven R9 head
`078dd8d28f5d1e7f53bcdde4b8c7055ced428046` onto exact canonical
`5759ad39b04076ff0973ed8c27f62048b6961fa9` with zero conflicts. All E1
implementation/test paths remain byte-identical to `078dd8d2…`; RGR-04, T5,
ACT 11, ACT 12, all Writer's Studio canonical populations, and the T6
population are preserved byte-identically from canonical. Only this witness
records the R10 freshness reconciliation.

Freshness standing: **PASS — tenth authorized freshness lane, ninth completed non-overlapping reconciliation.**

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
