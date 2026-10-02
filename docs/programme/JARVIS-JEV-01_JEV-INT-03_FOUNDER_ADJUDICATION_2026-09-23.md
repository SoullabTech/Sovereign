# FOUNDER ADJUDICATION — JARVIS-JEV-01 / JEV-INT-03
## TypeSafe transport compatibility + provider constitution — DESIGN ONLY

**Date:** 2026-09-23
**Disposition:** SUBSTANTIVELY SOUND · RETURNED FOR NARROW DESIGN-FIDELITY REPAIR · NOT RATIFIED
**Exact candidate adjudicated:** `b240ce1e6efd9d7719862829189990526cec0496`
**Exact canonical:** `bb1142863a3e9d5ba3848eeb6301c78d3cc5bde9`
**Exact INT-03 design blob:** `b7e7dd06dae6df3d34c41142ad00475bf3f8eebf`

## 1 · Custody accepted

The exact candidate is clean and reconciled against current canonical.

```text
candidate first parent    020229a62917f783d4809ad8a7188fd2befa966e
candidate second parent   bb1142863a3e9d5ba3848eeb6301c78d3cc5bde9
delta vs canonical        one INT-03 design document only
design blob               b7e7dd06dae6df3d34c41142ad00475bf3f8eebf
```

The canonical advance reconciled before adjudication had zero INT-03/JEV/provider/routing
overlap and did not alter the design blob.
## 2 · Accepted substantive findings

The following INT-03 findings are ACCEPTED and are not reopened by the required repair.

### A · Current TypeSafe hosted request is not J1-direct compatible

J1 is ratified at exact authority blob
`98eb6cf16223b83b4768e46e1ae253e7881ae5f5`.

Its application representation law is exact:

```text
OutboundRepresentation := JudgmentPacket
no envelope
no wrapper
no sibling field
no second object
```

The current TypeSafe `POST /v1/systemone` schema requires an application JSON object with
top-level `state`, `model`, and `questions`.

Therefore, even if `state` contains the exact six-member JudgmentPacket, the object TypeSafe
receives is not the J1 outbound representation.

**Disposition:** current hosted endpoint remains **INADMISSIBLE under J1**.

### B · J1 is not weakened for vendor convenience

Accepted:

```text
current TypeSafe endpoint   HOLD
J1                           UNCHANGED
adapter                      NOT AUTHORIZED
external Jev execution       NOT READY
```

A proxy does not cure the boundary if TypeSafe ultimately receives the wider application payload.
### C · Narrow provider identity

Accepted proposed future provider identity:

```text
provider_id = typesafe-jev
tier        = lab
posture     = external hosted advisory
```

`typesafe-jev` is narrower than vendor-wide `typesafe` and more exact than evaluator-only
`jev`.

Naming creates no authority.

### D · Exact repository data-class assignment

Accepted data-class boundary:

```text
lab/typesafe-jev/repository_derived_metadata
```

The separately ratified future authorization record, if ever authorized, must match:

```json
{
  "instrument": "repository-provider-assignment/v1",
  "status": "ratified",
  "tier": "lab",
  "provider": "typesafe-jev",
  "capability": "repository_derived_metadata"
}
```

No other repository data class is admitted by this finding.
## 3 · Repair 1 — functional capability and data capability were collapsed

This is the material design defect.

Canonical development-provider law requires **both**:

1. standing for the required **functional capability**; and
2. explicit assignment of the exact **data class** disclosed.

INT-03 §5 instead says the future provider capability array must contain exactly:

```json
["repository_derived_metadata"]
```

and then expressly forbids adding `benchmark`.

That cannot describe an executable external evaluator under the current capability grammar:
`repository_derived_metadata` says what data TypeSafe-hosted Jev may receive; it does not say
what function it may perform.

### Required repair

Preserve the one-data-class limit while restoring the two-axis capability model.

The narrow existing functional capability is:

```text
benchmark
```

because canonical policy defines it as bounded evaluation / benchmark use.

The design must distinguish two later acts:

```text
future provider registration
lab.typesafe-jev capabilities = [benchmark]
        ↓
NO repository data yet

separate prior-authorized repository assignment
repository_derived_metadata
        ↓
later provider policy capabilities =
[benchmark, repository_derived_metadata]
```

The repository assignment authorization remains exactly one data-class grant.
It does not grant `repository_source`, `constitutional_canon`, member data, network,
disclosure, spend, or provider execution.
The repair must not imply that `benchmark` itself authorizes repository disclosure. Canonical
law explicitly separates functional capability from data capability.

## 4 · Repair 2 — TypeSafe question-prose claim is too broad

The live TypeSafe OpenAPI independently checked on 2026-09-23 still requires:

```text
SystemOneRequest
  state
  model
  questions
```

That is sufficient to establish the J1 incompatibility.

However, the live schema does **not** establish that fixed instruction prose must always travel
for every lawful question shape. In particular, `NoulQuestion.instructions` is optional.

Therefore INT-03 must remove or narrow claims that:

```text
questions necessarily carries fixed instruction prose
fixed_adapter_prose_transmitted is required to prove current incompatibility
```

The repaired argument should say:

- the top-level `model` and `questions` siblings already defeat exact J1 identity;
- question instructions/criteria are an additional possible disclosure surface when used;
- the no-wrapper finding does not depend on prose being mandatory.

This correction does not reopen the transport verdict.
## 5 · Repair 3 — reconciled-base documentary fidelity

The design file still labels:

```text
Exact canonical base: 2703cc3091d200c52b6d70f91f618077214e943a
```

That was its construction base, not the canonical base at Founder adjudication.

The repaired document must preserve provenance without presenting historical construction state
as current state. Replace the header meaning with an exact distinction such as:

```text
Construction base:      2703cc3091d200c52b6d70f91f618077214e943a
Reconciled canonical:   bb1142863a3e9d5ba3848eeb6301c78d3cc5bde9
Reconciled candidate:   b240ce1e6efd9d7719862829189990526cec0496
```

The repair must not rewrite the historical custody chain.

## 6 · Evidence standing

Accepted pre-adjudication witness:

```text
J1 freeze                 0 violations
JEV host membrane         26 / 26 PASS
frozen J1 matrix          63 / 63 · 0 survivors
provider governance       PASS
candidate worktree        CLEAN
production                UNTOUCHED
```

The live TypeSafe API check confirms that `SystemOneRequest` still requires `state`,
`model`, and `questions`; it also establishes the precision correction above regarding
optional `noul.instructions`.
## 7 · Explicit non-authorizations

This adjudication does not authorize:

- provider registration;
- a provider-assignment authorization record;
- `repository_derived_metadata` assignment;
- adapter construction;
- TypeSafe credential lookup;
- TypeSafe inference;
- network/disclosure/spend authority;
- `provider.execute:typesafe-jev`;
- R5B execution;
- Work Unit composition;
- routing change;
- merge to canonical;
- deployment;
- production mutation.

The current TypeSafe endpoint remains held.

## 8 · Exact next boundary

> **JARVIS-JEV-01 / JEV-INT-03R1 — THREE-POINT DESIGN-FIDELITY REPAIR ONLY**

Against exact adjudicated candidate:

`b240ce1e6efd9d7719862829189990526cec0496`

and exact canonical:

`bb1142863a3e9d5ba3848eeb6301c78d3cc5bde9`

Authorized repair scope only:

1. restore functional/data capability separation using `benchmark` + the one exact
   `repository_derived_metadata` data assignment;
2. make TypeSafe question-prose language accurate without weakening the no-wrapper finding;
3. distinguish construction base from reconciled current-canonical custody.

Then rerun the J1 freeze, 26/26 host proof, frozen 63/63 matrix, provider-governance gate, and
diff/scope checks, and stop for Founder adjudication of the repaired design.

No other JEV surface is opened.
