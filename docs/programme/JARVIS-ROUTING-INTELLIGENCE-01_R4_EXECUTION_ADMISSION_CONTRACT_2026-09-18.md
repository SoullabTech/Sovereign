# JARVIS-ROUTING-INTELLIGENCE-01 / R4 — Governed Execution Admission

**Date:** 2026-09-18
**State:** CONTRACT + PURE FALSIFICATION CANDIDATE — EXECUTION STILL DISCONNECTED
**Canonical base:** 7937fc7cf1b0aede76b4e5302e36800c85f997da
**R3 canonical integration:** PR #1382

R4 defines the membrane between a persisted Routing Intelligence record and any future provider execution.

It does not connect that execution.

## 1. Governing distinction

route says Qwen / GPT-OSS
        !=
permission to execute

route proposes Inkling / Nemotron
        !=
network + disclosure + spend authority

A route is capability evidence. Admission is a separate authority decision.

A model result is evidence. It is never authority.

## 2. Pure R4 boundary

The R4 admission function may consume only already-materialized structured state:

- persisted route binding
- current Work Unit canonical SHA
- current Work Unit authorized / denied acts
- current evidence posture
- current external-disclosure posture
- prior attempt summaries needed only for stop-law enforcement

R4 may return only an inspectable admission decision.

R4 may not:

- call a provider
- inspect credentials or macOS Keychain
- read or write repository files
- access the network
- spend provider funds
- mutate a Work Unit
- widen authority
- execute Desktop actions
- merge
- deploy
- access production
- close a constitutional or Founder gate

The implementation uses deterministic hashing only (node:crypto) and no execution or I/O seam.

## 3. Admission dispositions

Each provider act proposed by the route receives exactly one disposition:

### ADMITTED

The provider act is structurally valid, its exact evidence membrane is available, and every required authority atom is already present and not explicitly denied.

ADMITTED means only that a future execution connector could accept this act. It does not execute anything.

### HELD_FOR_AUTHORITY

The provider act is structurally valid, but one or more required authority atoms are absent. No missing authority is inferred from the route.

### MANUAL_ONLY

The act is structurally valid but is constitutionally excluded from automated Work Unit execution. R4 V1 applies this to nemotron-zen.

### REFUSED

The route/binding is stale, tampered, unsupported, explicitly denied, evidence-invalid, pre-connected out of order, or stopped by prior attempt history.

## 4. Integrity binding law

A route is not admission-eligible merely because a JSON route record exists.

R4 requires all of:

1. source = R2-pure-router
2. route_version = R1.v1
3. execution_connected = false
4. bound_at_sha == current Work Unit canonical_sha
5. an immutable route_digest
6. route_digest == SHA-256(canonicalized route_record)
7. route_record.granted_authority == []
8. only R4-admitted provider identities / roles

Any failure is REFUSED.

Key typed integrity blockers include:

- ROUTE_DIGEST_REQUIRED
- ROUTE_DIGEST_MISMATCH
- ROUTE_SHA_STALE
- ROUTE_VERSION_MISMATCH
- ROUTE_SOURCE_MISMATCH
- ROUTE_AUTHORITY_TAMPER
- EXECUTION_PRECONNECTED

### Important consequence for current canonical R3

The canonical R3 packet persists:

- route_record
- execution_connected: false
- source: R2-pure-router
- bound_at_sha

It does not yet persist an immutable route_digest.

Therefore an unmodified R3 route-bound Work Unit is intentionally not R4-admissible.

R4 does not backfill or mutate that record.

A later, separately authorized binding gate must establish the immutable digest before execution can ever be connected.

## 5. Provider-specific execution authority

R4 introduces no authority by itself.

For automatic provider execution, authority must already include the exact provider-specific act:

- provider.execute:qwen-local
- provider.execute:gpt-oss-local
- provider.execute:inkling-tinker
- provider.execute:nemotron-tinker

Zen may carry provider.execute:nemotron-zen for a manual act, but R4 still returns MANUAL_ONLY.

The route may name a provider. It cannot manufacture that provider's execution grant.

### Local Qwen / GPT-OSS

Required authority:

- repo.read
- exact provider.execute:<provider-id>

Required evidence membrane:

- local_worktree_read_only
- isolated Work Unit worktree available

R4 V1 is review-only. If the current Work Unit already carries active repo.write:worktree authority, admission is REFUSED with READ_ONLY_EXECUTION_MEMBRANE_REQUIRED rather than allowing the provider act to inherit a broader membrane.

### Inkling via Tinker

Required authority:

- repo.read
- provider.execute:inkling-tinker
- network.external
- provider.spend
- explicit repository_read_only_external disclosure

Required evidence membrane:

- exact_external_bundle
- non-empty exact refs only

### Nemotron via Tinker

Required authority:

- repo.read
- provider.execute:nemotron-tinker
- network.external
- provider.spend
- explicit repository_read_only_external disclosure

Required evidence membrane:

- exact_external_bundle
- non-empty exact refs only

### Nemotron Zen

R4 V1 status:

- always MANUAL_ONLY when structurally valid
- never automatically admitted

Required manual posture:

- task text only
- network.external
- provider-specific manual execution authority

## 6. Authority absence vs explicit denial

R4 distinguishes:

Absent authority
→ HELD_FOR_AUTHORITY

Explicitly denied authority
→ REFUSED

This prevents a negative Founder / Work Unit boundary from being treated as a merely incomplete checklist.

## 7. Evidence non-widening law

Admission derives its execution membrane independently from provider identity and the current Work Unit evidence posture.

It never trusts a provider suggestion to widen evidence.

Local providers receive:

local_worktree_read_only
scope = isolated_worktree

Tinker providers receive:

exact_external_bundle
scope = exact_refs_only

Zen receives:

task_text_only

An empty external bundle is REFUSED, not upgraded to repository access.

Even a route record whose digest has been freshly recomputed is refused if it claims an incompatible evidence kind such as whole_repository.

## 8. Prior-attempt stop law

A prior attempt with any of these states stops successor admission:

- technical failure
- provider refusal
- recommendation to reject
- evidence insufficiency
- escalation required

The next provider is not admitted merely because it exists in the route.

Provider failure cannot manufacture successor authority.

A retry or successor route requires a new governed act outside R4.

## 9. Model evidence never becomes higher authority

R4 ignores model claims of authority.

A result may recommend:

- merge
- deploy
- production access
- constitutional closure
- Founder adjudication

None of those recommendations create authority.

Every R4 result carries:

granted_authority = []
authority_created = false
forbidden_authority_created = []

No admission result can itself create:

- repository write authority
- network authority
- spend authority
- production read/write
- deploy
- merge
- authority change
- constitutional closure
- Founder adjudication

## 10. Falsification matrix

The pure R4 witness must prove:

- F-A1 current R3 binding without immutable digest fails closed
- F-A2 tampered route record fails digest verification
- F-A3 stale SHA binding fails closed
- F-A4 wrong route version fails closed
- F-A5 pre-connected execution fails ordering
- F-A6 route-carried granted authority is refused
- F-A7 Qwen route selection alone does not authorize Qwen
- F-A8 Qwen requires exact provider execution authority
- F-A9 independent local pair is admitted per-provider, never by inheritance
- F-A10 explicit authority denial is refused
- F-A11 local worktree evidence is mandatory
- F-A12 Inkling route does not authorize network/disclosure/spend/execution
- F-A13 authorized Inkling remains exact-bundle-only
- F-A14 empty external bundle is refused
- F-A15 Tinker Nemotron obeys the same bundle/authority membrane
- F-A16 Zen remains manual-only
- F-A17 unsupported provider identity is refused
- F-A18 prior provider failure stops successor admission
- F-A19 model recommendations cannot create higher authority
- F-A20 admission is immutable and deterministic
- F-A21 route source mismatch fails closed
- F-A22 route evidence cannot widen even with a fresh digest
- F-A23 active worktree-write authority is refused by the R4 V1 read-only membrane

Additionally, structural purity must prove that the R4 module imports only deterministic hashing and no execution/I/O capability.

## 11. Current standing

R4 is not an execution connector.

The present canonical stack is:

R1 routing law
   ↓
R2 pure router
   ↓
R3 persisted route + Desktop preview
   ↓
R4 pure execution-admission decision
   ↓
[NO EXECUTION CONNECTION]

The current R3 packet is expected to fail R4 admission because:

1. no immutable route digest is persisted
2. no provider.execute:<provider-id> authority is present

That is a successful fail-closed result, not an implementation defect.

## 12. Founder adjudication boundary

R4 implementation may be accepted only as pure decision law.

Acceptance of R4 does not authorize:

- adding route digests to existing Work Units
- granting provider execution authority
- connecting R4 to run-provider
- changing Desktop execution controls
- running any model
- external calls or spend
- merge or deploy

A successor gate must separately define how immutable route binding and provider-specific execution authority are created before any route can cross into execution.

## 13. Mechanical witness

Exact candidate construction base:

7937fc7cf1b0aede76b4e5302e36800c85f997da

Evidence:

- R2 routing law: 20 / 20 PASS
- R3 binding/persistence law: 8 / 8 PASS
- R4 admission law: 24 / 24 PASS
- Desktop regression suite: 157 PASS / 0 FAIL / 9 intentional SKIP
- git diff --check: PASS
- R4 scope: exactly three new files
- canonical freshness at seal time: exact current base

No model call, provider call, Keychain lookup, network access, Work Unit mutation, provider spend, production access, merge, or deployment occurred in the R4 witness.
