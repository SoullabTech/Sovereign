# JARVIS-ROUTING-INTELLIGENCE-01 / R5A — Immutable Route Binding

**Date:** 2026-09-18
**State:** IMPLEMENTATION + FALSIFICATION CANDIDATE — EXECUTION STILL DISCONNECTED
**R4 accepted candidate:** 6a2d0acd0f5ba935a8c1ab1b83ff82e11da90752
**R4 Founder adjudication record:** 41efd2dcd4694ba280790c63f590795d079376d5
**Current canonical incorporated:** fab09573bea7a45e77df89d0975afb3312769f99

R5A establishes the first prerequisite required by R4: an immutable, independently verifiable binding between a persisted route record and the Work Unit that owns it.

R5A does not authorize or connect provider execution.

## 1. Canonical binding shape

After canonical integration of JARVIS-WORK-UNIT-01 / W1-W5, W3 is the authoritative Work Unit route-binding seam.

R5A extends the canonical W3 routing domain so a ROUTED Work Unit persists:

- router_version
- route_version
- route_record
- route_digest
- route_source
- bound_at_sha
- execution_connected = false
- primary
- challengers

W3 computes the digest at the exact AUTHORIZED -> ROUTED binding act.

The canonical route_source is:

R2-pure-router

The canonical bound_at_sha is the exact Work Unit scope.base_ref.

Desktop MAIN remains a compatibility authoring path. It persists the same integrity facts in routing_intelligence:

- route_record
- route_digest
- route_version
- source
- bound_at_sha
- execution_connected = false

## 2. One shared route-integrity law

R5A introduces one pure module:

scripts/builder/routing-route-integrity.mjs

It owns deterministic canonicalization and SHA-256 only.

The same routeDigest() law is consumed by:

- canonical W3 route binding;
- R4 execution admission;
- Desktop MAIN compatibility authoring.

This avoids independent digest implementations.

The renderer may submit structured routing intent only. It may not submit:

- route_record
- route_digest
- route_version
- canonical SHA
- route source
- authority envelope

Desktop MAIN recomputes the route and digest itself before packet creation.

## 3. Immutability after binding / creation

Canonical W3 binds only an empty AUTHORIZED routing domain.

Any pre-existing route record, digest, version, source, SHA binding, primary, or challenger material causes:

ROUTING_DOMAIN_NOT_EMPTY

Any attempt to arrive at W3 with execution_connected != false causes:

ROUTING_EXECUTION_CONNECTION_INVALID

Once W3 binds the route, W4/W5 continue to prove the routing domain remains byte-identical through evidence append and governed closure.

The Desktop compatibility packet also preserves its existing create-once seam:

- existing Work Unit IDs are not overwritten;
- a second create attempt with the same Work Unit ID is refused as WORK_UNIT_ID_IN_USE;
- original packet bytes remain unchanged after refused rebinding.

R5A introduces no update-in-place or rebinding operation.
## 4. Integrity law

R4 admission now validates both the route record and the persisted binding metadata.

The binding fails closed when any of these occur:

- route_digest missing;
- route_digest does not match route_record;
- route_version sibling does not match route_record.route_version;
- route_record version is not the ratified version;
- source is not R2-pure-router;
- bound_at_sha differs from the current Work Unit canonical SHA;
- route carries granted authority;
- execution is already connected out of order.

The new typed metadata blocker is:

ROUTE_BINDING_VERSION_MISMATCH

Existing R4 blockers remain authoritative, including:

- ROUTE_DIGEST_REQUIRED
- ROUTE_DIGEST_MISMATCH
- ROUTE_SHA_STALE
- ROUTE_VERSION_MISMATCH
- ROUTE_SOURCE_MISMATCH
- ROUTE_AUTHORITY_TAMPER
- EXECUTION_PRECONNECTED

## 5. No authority creation

A valid immutable binding establishes integrity only.

It adds no:

- provider.execute:* authority;
- network.external authority;
- provider.spend authority;
- repository disclosure;
- repository write authority;
- merge authority;
- deploy authority;
- production authority;
- constitutional authority;
- Founder authority.
Canonical W3 does not mutate the Work Unit authorized core while binding integrity metadata.

The Desktop compatibility packet still carries only:

authorized_acts = [repo.read]

provider_strategy = []
execution_connected = false

A canonical W3 binding can clear R4 integrity checks while still returning:

HELD_FOR_AUTHORITY

because no provider.execute:<provider-id> authority is created by R5A.

## 6. No migration or backfill

R5A applies prospectively to route binding after R5A integration.

It does not rewrite existing route-bound records or historical Desktop packets.

Historical R3 packets that lack route_digest remain truthful historical artifacts and continue to fail R4 admission with ROUTE_DIGEST_REQUIRED.

No migration or backfill is authorized by R5A.

## 7. Falsification matrix

R5A must prove:

- R5A-1 routed packet persists exact R4-compatible digest;
- R5A-2 digest is deterministic over the exact route record;
- R5A-3 binding creates no execution or external authority;
- R5A-4 canonical creation persists exactly once;
- R5A-5 binding survives persistence round trip;
- R5A-6 attempted rebinding is refused;
- R5A-7 refused rebinding leaves original bytes unchanged;
- R5A-8 valid binding clears integrity but remains held for provider authority;
- R5A-9 route mutation without digest update is refused;
- R5A-10 stale canonical SHA is refused;
- R5A-11 source mismatch is refused;
- R5A-12 sibling binding-version mismatch is refused;
- R5A-13 route-record version mutation is refused even with recomputed digest;
- R5A-14 packet creation without MAIN-computed digest is refused;
- R5A-15 immutable binding still cannot become an execution connector;
- R5A-16 canonical W3 persists exact digest/version/source/SHA binding;
- R5A-17 canonical W3 refuses pre-bound integrity material;
- R5A-18 canonical W3 refuses an execution-connected route before binding;
- R5A-19 Desktop compatibility and canonical W3 use the same digest law;
- R5A-20 canonical W3 binding clears R4 integrity but remains held for provider authority.

## 8. Execution boundary

R5A does not modify the route-bound run-provider guard.

A route-bound Work Unit remains non-executable through the existing Desktop provider path.

R5A does not:

- call Qwen;
- call GPT-OSS;
- call Inkling;
- call Nemotron;
- inspect credentials or Keychain;
- access the network;
- spend provider funds;
- grant provider execution authority;
- connect R4 admission to run-provider;
- deploy;
- mutate production.

## 9. Next boundary

After Founder adjudication and canonical integration of R5A, the remaining prerequisite is R5B:

Human Provider Execution Authorization.

R5B must create a separate, explicit, append-only human authorization record bound to:

- work_unit_id;
- route_digest;
- canonical_sha;
- provider_id;
- exact provider.execute:<provider-id> act;
- human actor;
- timestamp;
- scope.

For external providers it must additionally preserve separate network, spend, disclosure, and exact evidence-bundle authority.

Even after R5B:

ADMITTED != EXECUTED

Connecting admission to provider execution remains a later gate.


## 10. Mechanical witness

Automated evidence before seal:

- W1 canonical Work Unit schema: 22 / 22 PASS
- W2 lifecycle: 27 / 27 PASS
- W3 canonical routing binding: 28 / 28 PASS
- W4 append-only ledger: 31 / 31 PASS
- W5 synthetic end-to-end witness: 22 / 22 PASS
- R2 routing law: 20 / 20 PASS
- R3 persistence/binding law: 8 / 8 PASS
- R4 execution-admission law: 24 / 24 PASS
- R5A immutable-binding law: 20 / 20 PASS
- Desktop regression suite: 159 PASS / 0 FAIL / 9 intentional SKIP
- git diff --check: PASS

Disposable live Desktop witness:

- route preview selected Qwen for an ordinary mechanical task;
- MAIN-created Work Unit persisted a SHA-256 route digest;
- persisted route_version = R1.v1;
- persisted source = R2-pure-router;
- persisted bound_at_sha matched the Work Unit canonical SHA;
- provider_strategy remained empty;
- authorized_acts remained [repo.read];
- execution_connected remained false;
- direct run-provider challenge returned ROUTING_EXECUTION_DISCONNECTED;
- disposable AIN home contained 1 packet, 0 results, 0 locks, and 0 sessions.

No provider call, credential lookup, network access, provider spend, repository write, merge, deploy, or production mutation occurred.


## 11. Founder adjudication

**Issued:** 2026-09-18

**Accepted exact R5A implementation candidate:**

d8b31c77f84d426351a6bec31b36e15d9ffc9a8d

The Founder accepts:

- W3 as the authoritative canonical Work Unit route-binding seam;
- one shared deterministic SHA-256 route-integrity law across canonical W3, R4 execution admission, and Desktop MAIN compatibility authoring;
- W1 22 / 22 PASS;
- W2 27 / 27 PASS;
- W3 28 / 28 PASS;
- W4 31 / 31 PASS;
- W5 22 / 22 PASS;
- R2 20 / 20 PASS;
- R3 8 / 8 PASS;
- R4 24 / 24 PASS;
- R5A 20 / 20 PASS;
- the exact-head synthetic witness proving digest equality, exact SHA binding, no execution authority, and no provider execution.

Immutable route binding establishes integrity only.

It creates no:

- provider execution authority;
- network authority;
- repository disclosure;
- provider spend authority;
- repository-write authority;
- merge authority;
- deploy authority;
- production authority;
- constitutional authority;
- Founder authority.

Historical route records are not migrated or backfilled.

Provider execution remains disconnected.

This adjudication authorizes no execution connection, merge, deploy, or production action.

The next integration act is canonical integration of the already-adjudicated R4 and R5A lineage before R5B may open.
