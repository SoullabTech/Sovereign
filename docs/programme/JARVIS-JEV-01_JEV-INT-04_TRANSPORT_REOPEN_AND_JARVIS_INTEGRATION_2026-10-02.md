# JARVIS-JEV-01 · JEV-INT-04
## Transport reopen evidence + JARVIS advisory integration

**Date:** 2026-10-02
**Canonical base examined:** `8707daacd33298ecb38763ee7c25d38a3e49aff0`
**Disposition:** JARVIS ADVISORY SEAM OPEN · HOSTED TYPESAFE TRANSPORT STILL HELD

## 1. Founder direction

The founder direction is to **integrate JEV into JARVIS**.

Placement is therefore explicit:

```text
JARVIS deterministic capability check
        ↓
J5 cognitive route
        ↓
JEV advisory consultation
        ↓
governing JARVIS execution / verification path
```

JEV is not a MAIA member-facing runtime capability and is not a route authority.
## 2. Current TypeSafe transport witness

TypeSafe's current public OpenAPI was rechecked on 2026-10-02.

Observed hosted endpoint:

```text
POST https://api.typesafe.ai/v1/systemone
```

The request body still requires all three top-level application fields:

```text
state
model
questions
```

The models endpoint documents `jev-latest` as an available Jev model name.

Sources:
- https://api.typesafe.ai/docs
- https://api.typesafe.ai/redoc

This preserves the INT-03R1 compatibility finding.
## 3. Transport finding

Ratified J1 requires the exact `JudgmentPacket` to be the sole provider-visible
application judgment representation:

```text
packet only
no envelope
no sibling application fields
no second question-prose object
```

The current hosted TypeSafe request contract still requires `state + model + questions`.

Therefore:

```text
TypeSafe hosted API       reachable/documented
JEV provider identity     typesafe-jev
JEV functional standing   benchmark
current wire compatibility REFUSED
real hosted transport     HELD
J1                        UNCHANGED
```
## 4. What INT-04 integrates now

This act introduces a JARVIS-side advisory seam:

- W3 binds the ordinary deterministic J5 route first.
- Deterministic capability selection suppresses JEV completely.
- A ROUTED, non-deterministic Work Unit may be presented to JEV through the existing J1 host membrane.
- The only outbound representation is the frozen exact `JudgmentPacket`.
- Transport is injected; no credential or network client is created by the seam.
- JEV judgments are admitted through the frozen J1 response contract.
- Advice is projected separately from Work Unit authority.
- The routed Work Unit is returned unchanged.
- JEV advisory evidence is stored in JARVIS Desktop sidecar metadata, not the authority-bearing W0/W3 envelope.

Removing the sidecar leaves the Work Unit and route unchanged.
## 5. JARVIS Desktop standing

For a ROUTED non-deterministic canonical Work Unit, JARVIS Desktop may expose:

```text
Consult JEV advisory
```

The visible order is:

```text
J5 cognitive route
JEV advisory
execution bridge
immutable provenance
verification evidence
human adjudication
```

This ordering is intentional. JEV counsel is visible before execution evidence but
outside route authority and outside human adjudication.

With no injected transport, the action records:

```text
consulted: false
reason: TRANSPORT_NOT_CONNECTED
```

Absence is not rounded into advice.
## 6. Proof obligations

The INT-04 integration proof must establish:

1. W3 routing occurs before JEV consultation.
2. A deterministic route causes zero JEV transport calls.
3. JEV may raise advisory depth/escalation/clarification without changing authority.
4. No transport means no advisory value.
5. Missing provider answers become admitted abstentions.
6. The provider sees only the exact frozen J1 packet.
7. The current real TypeSafe transport constructor refuses under the wire incompatibility.
8. No JEV/provider execution authority field is added to W0/W3.

Command:

```bash
npm run jarvis:jev:proof
```

## 7. Not authorized by this act

This act does not authorize:

- a TypeSafe API key lookup;
- external TypeSafe network execution;
- provider spend;
- `repository_derived_metadata` provider assignment;
- `provider.execute:typesafe-jev`;
- J1 amendment;
- routing authority changes;
- automatic JEV fast-path use;
- merge, deployment, or production mutation.

A real hosted call requires a later compatible wire witness or a separate founder amendment of J1.

## 8. R1 review hardening — 2026-10-02

Founder review of the first INT-04 candidate identified five integration risks. This revision repairs the seam before any real provider call.

### R1.1 · Projection equivalence pinned to the LABEL-01 pilot

The JARVIS advisory seam now uses `jev-packet-projection-v1.mjs`. It is not yet imported by the separate LABEL-01 pilot branch, so this record does not call the code shared. Instead, equivalence is pinned to pilot source blob `d3d5a533703903f6cd25e34a1cb9f7510fec5c6d` and a fixture-set proof requires identical projection output:

- `task_shape` — `IDENTITY`
- `contains_sensitive` — `AUTHORITY_PROXY`
- `requires_external_info` — `AUTHORITY_PROXY` from external-network/disclosure authority
- `file_count` — `DECLARED_SCOPE_PROXY`
- `migration`, `auth` — `PATH_PATTERN`
- `production` — `AUTHORITY_PROXY`

The advisory record carries the projection version and derivation map. The pilot remains the authority on whether these proxies are adequate; this integration does not canonize their semantic sufficiency.

### R1.2 · Transport failure is admitted, bounded absence

Transport invocation is bounded. A thrown transport or elapsed timeout is converted to the J1 host-failure path and admitted as `TIMEOUT`; the local failure reason is retained separately as transport provenance.

A hung or failed provider call therefore cannot wedge JARVIS and cannot become a positive/negative judgment.

### R1.3 · Whole-Work-Unit invariant

The integration records a stable snapshot of the entire routed Work Unit before and after consultation. Success requires byte-equivalent structured state, intact route digest, unchanged authority object, unchanged `ROUTED` lifecycle standing, and `execution_authorized: false`.

Desktop proof additionally asserts the persisted canonical Work Unit file is byte-identical across a consultation; only sidecar metadata may change.

### R1.4 · Raise-only human delivery

Until LABEL-01 freezes under-deliberation bounds, human delivery is asymmetric:

- `escalate: true` may be shown;
- `clarify: true` may be shown;
- raw depth scores are withheld;
- `modelNeeded: false` is withheld;
- no "safe", "sufficient", or "skip model" conclusion is rendered.

Lowering advice remains in sidecar evidence for measurement only.

### R1.5 · Integration lethality

The integration now carries six named defeat candidates:

- route mutation;
- authority mutation;
- lifecycle mutation;
- absence rounded into advice;
- transport error escaping the abstention path;
- lowering advice delivered to the human.

All six are killed by their named falsifiers.

Current witness:

```text
JARVIS/JEV integration proof    11 / 11 PASS
INT-04 reference runs             6 / 6 PASS
INT-04 real decision candidates   6 / 6 killed · 0 matrix errors
projection equivalence           PASS · 4 fixtures · pilot blob d3d5a533703903f6cd25e34a1cb9f7510fec5c6d
JARVIS Desktop canonical proof  35 / 35 PASS
JEV host membrane               26 / 26 PASS
frozen J1 matrix                63 / 63 · 0 survivors
```

No live TypeSafe call was made.

## 9. Preconditions for any later live-call act

A later live-call act must separately settle:

1. the J1 wire-envelope amendment, including versioned/hashed question wording;
2. one-question-per-call versus batching as an instrument property;
3. exact wire-body hashing before send and in every advisory record; a timeout is `attempted / crossing unknown`, never evidence that nothing was sent;
4. native TypeSafe inbound answer/confidence semantics;
5. LABEL-01 instrument freeze before real-unit shadow evaluation;
6. provider assignment / disclosure / network / spend / execution authority;
7. TypeSafe retention, telemetry, DPA and customer-agreement review.

The public TypeSafe privacy policy states that Input is not used to train or fine-tune models, but its customer agreement permits processing/storage for service delivery and specified telemetry/fraud/legal purposes. This is not a zero-retention guarantee and therefore does not discharge the governance gate by itself.
