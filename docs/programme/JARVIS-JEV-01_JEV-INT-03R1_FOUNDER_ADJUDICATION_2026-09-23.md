# FOUNDER ADJUDICATION — JARVIS-JEV-01 / JEV-INT-03R1
## TypeSafe transport compatibility + provider constitution — REPAIRED DESIGN

**Date:** 2026-09-23
**Disposition:** RATIFIED AS DESIGN LAW · CURRENT TYPESAFE TRANSPORT REMAINS HELD
**Exact candidate adjudicated:** `ba9d5e1e2b3fbf1d7c3cdb354f6f305182da77f8`
**Exact canonical:** `bb1142863a3e9d5ba3848eeb6301c78d3cc5bde9`
**Exact repaired design blob:** `38fa030c385f6ffc8554a61555ab84fb6b42db54`

This record ratifies the repaired design object as a Founder disposition. It does not register
a provider, assign a capability, authorize transport, or alter J1. Canonical standing remains a
separate custody act: neither this ratification record nor the repaired design may govern a later
INT-04 act until the exact ratified objects are admitted to current canonical.

## 1 · Custody

Accepted exact standing:

```text
candidate             ba9d5e1e2b3fbf1d7c3cdb354f6f305182da77f8
canonical             bb1142863a3e9d5ba3848eeb6301c78d3cc5bde9
repaired design blob  38fa030c385f6ffc8554a61555ab84fb6b42db54
worktree              CLEAN
canonical advance     NONE
```

The adjudicated object is the exact repaired design blob above. Historical INT-03 and its
return record remain evidence of the repair lineage; they are not substituted for this object.
## 2 · Repair closure

The three-point INT-03 return is closed.

### R1 · Functional/data separation — PASS

The repaired design correctly separates:

```text
functional capability    benchmark
repository data class    repository_derived_metadata
```

Canonical development-provider law requires both axes independently. `benchmark` authorizes
no repository data. `repository_derived_metadata` authorizes no provider function, execution,
network, disclosure, spend, or other data class.

The design's future sequence is therefore accepted:

```text
future provider registration
lab.typesafe-jev.capabilities = [benchmark]
        ↓
separate prior-authorized repository assignment
repository_derived_metadata
        ↓
only after both separately lawful acts
[benchmark, repository_derived_metadata]
```

This is design law only. Neither later act is performed here.
### R2 · TypeSafe API fidelity — PASS

Live TypeSafe OpenAPI rechecked at adjudication still defines `SystemOneRequest` with required
top-level application members:

```text
state
model
questions
```

The same schema defines `NoulQuestion` with only `type` required; `instructions` and
`criteria` are optional.

The repaired design therefore states the compatibility finding at the correct load-bearing
level:

- the required wrapper/sibling application fields alone defeat J1 exact representation;
- prose is an additional forbidden disclosure surface when present;
- prose is not required to establish the incompatibility.

Accepted.

### R3 · Custody metadata — PASS

The repaired document distinguishes:

```text
construction base        2703cc3091d200c52b6d70f91f618077214e943a
reconciled canonical     bb1142863a3e9d5ba3848eeb6301c78d3cc5bde9
adjudicated predecessor  b240ce1e6efd9d7719862829189990526cec0496
```

Historical construction custody is preserved without being mislabeled current state.
## 3 · Ratified design findings

The following are now ratified as the JEV-INT-03 provider/transport design boundary.

### D1 · Current hosted TypeSafe endpoint is inadmissible under J1

Ratified J1 defines:

```text
OutboundRepresentation := JudgmentPacket
no envelope
no wrapper
no sibling field
no second object
```

The current TypeSafe hosted endpoint requires an application object containing
`state/model/questions`.

Therefore:

```text
current TypeSafe /v1/systemone   INADMISSIBLE UNDER J1
J1                               UNCHANGED
transport                        HELD
adapter                           NOT AUTHORIZED
external Jev execution            NOT READY
```

This is a compatibility finding about the currently observed hosted API. Any future claim that
TypeSafe has become compatible requires a fresh wire/schema witness.
### D2 · Provider identity

The exact future provider identity is:

```text
provider_id = typesafe-jev
tier        = lab
posture     = external hosted advisory
```

The identity is deliberately service-specific rather than vendor-wide.

If provider execution is ever separately opened, its exact execution act is:

```text
provider.execute:typesafe-jev
```

This record does not grant that act.

### D3 · Functional standing

The narrow functional capability for the present design is:

```text
benchmark
```

No `chat` standing is conferred by this design.

### D4 · Repository data boundary

The only repository data class this design admits for a future separately authorized assignment
is:

```text
repository_derived_metadata
```

The exact future assignment tuple remains:

```text
tier        lab
provider    typesafe-jev
capability  repository_derived_metadata
```

`repository_source` and `constitutional_canon` remain outside the design boundary.
## 4 · Witness admitted with adjudication

Observed on exact repaired candidate:

```text
J1 freeze                         0 violations
JEV host membrane                26 / 26 PASS
frozen J1 matrix                 63 / 63 · 0 survivors
provider governance              PASS
development-provider governance  15 / 15 PASS
diff check                        PASS
worktree                          CLEAN
```

The frozen J1 suite remains lethal against wrapper/envelope and question/prose widening.

## 5 · What ratification does NOT authorize

Ratification of this design does not authorize or perform:

- TypeSafe provider registration;
- creation of a repository-provider-assignment authorization record;
- `repository_derived_metadata` assignment;
- model identity selection;
- adapter identity selection;
- adapter construction;
- credential lookup;
- external network use;
- repository disclosure;
- provider spend;
- provider execution;
- R5B grant issuance;
- Work Unit composition;
- routing mutation;
- push or merge to canonical;
- deployment;
- production mutation.

The current TypeSafe endpoint remains held.

## 6 · Consequence for future sequencing

Because the currently observed hosted endpoint is incompatible with J1, ratifying the provider
constitution does **not** make provider registration or assignment the next executable act.

There is also a prior custody requirement: this ratification occurs on the INT-03 branch, not in
canonical. A later act may not treat branch-local ratification as canonical design law.

Required sequence:

```text
INT-03R1 Founder ratification       ← THIS ACT
        ↓
current-canonical reconciliation
        ↓
canonical admission of:
  exact repaired design blob
  exact INT-03 return record
  exact INT-03R1 ratification record
        ↓
only then transport-reopen evidence may be opened
```

After canonical admission, the lane remains condition-gated.

### Hosted reopen condition

A future TypeSafe hosted interface must be independently witnessed such that the exact J1
`JudgmentPacket` is the sole provider-visible application judgment representation, with no
wrapper/sibling application fields and no additional question prose/criteria payload.

### Constitutional reopen condition

Alternatively, J1 itself may be reopened by a separate Founder constitutional act. This
ratification does not request or imply such an amendment.

Until canonical admission and then one of those two transport conditions is satisfied:

```text
provider registration          CLOSED
repository assignment          CLOSED
adapter                         CLOSED
external execution              CLOSED
production                      UNTOUCHED
```

## 7 · Exact next boundary

> **JARVIS-JEV-01 / JEV-INT-03R1R1 — RATIFIED DESIGN CURRENT-CANONICAL ADMISSION ONLY**

That act may only:

- refresh exact remote canonical;
- inspect any advance for overlap with the three INT-03 documentary objects;
- reconcile the exact ratified lineage without semantic change;
- verify the repaired design blob and adjudication blobs are unchanged;
- rerun J1 freeze, host 26/26, frozen 63/63, provider governance, development-provider
  governance, and scope checks;
- prepare the exact ratified documentary lineage for canonical admission.

It may not:

- alter the repaired design;
- register `typesafe-jev`;
- assign `benchmark` or `repository_derived_metadata`;
- create a provider-assignment authorization record;
- build an adapter;
- call hosted Jev;
- issue an R5B execution grant;
- mutate a Work Unit;
- deploy or touch production.

Only after exact canonical admission may **JEV-INT-04 — TRANSPORT REOPEN EVIDENCE ONLY** be
considered.
