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
