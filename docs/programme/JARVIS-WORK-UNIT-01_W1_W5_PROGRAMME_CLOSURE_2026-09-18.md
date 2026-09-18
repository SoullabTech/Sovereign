# JARVIS-WORK-UNIT-01 — W1-W5 Programme Closure

**Date:** 2026-09-18
**Status:** CLOSED LOCALLY · PROVEN CANDIDATE ARCHITECTURE · NOT MERGED
**Final accepted candidate:** `6f754c78bb3023a09e5388f7f2681183916a6c7a`
**RGR-01:** CLOSED

## 1. Programme purpose

JARVIS-WORK-UNIT-01 establishes the governed object through which JARVIS may carry bounded work from human authorization to evidenced closure without granting ambient autonomy.

The proven synthetic lifecycle is:

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

The programme demonstrates this lifecycle while preserving:

- explicit human authority;
- deterministic routing;
- read-only routing authority;
- authorized-core immutability;
- append-only attempt/evidence history;
- retry ≠ independent review;
- builder ≠ verifier;
- deterministic provenance;
- no semantic-winner authority in evidence recording;
- fail-closed lifecycle law.

## 2. Accepted candidate lineage

### W1 — Pure Work Unit Schema

Accepted commit:

`add54c8e3f86656fdfc235adab39ae81e54cfed3`

Evidence:

```text
22 / 22 passing
```

Established:

- canonical Work Unit identity/context/scope/authority/routing/execution/evaluation/provenance/state domains;
- bounded repository scope;
- explicit authority fields;
- deterministic immutable DRAFT construction;
- fail-closed schema validation.

### W2 — Deterministic Lifecycle State Machine

Accepted commit:

`c8dbf997eb95da5da10f0c547cb2a464c09dc2c5`

Evidence:

```text
27 / 27 passing
```

Established:

- canonical lifecycle spine;
- terminal STOPPED / RETURNED / SUPERSEDED exits;
- no `EXECUTING → CLOSED` shortcut;
- authorization reference requirement;
- W2 authorized-core snapshot;
- authorized-core immutability after AUTHORIZED;
- W2 remains sole lifecycle-transition authority.

### W3 — Pure Routing Binding

Accepted commit:

`25f4bc1bceebcaebbbac7df4b31eb945f09fd120`

Evidence:

```text
28 / 28 passing
```

Ratified Routing Intelligence regression:

```text
20 / 20 passing
```

Ratified router SHA-256:

`2837520e2f4e27aed067a84a2f8148a8b1be2436f71a57aa21a4c06d72316b4f`

Established:

- canonical Work Unit → route projection;
- route binding only from AUTHORIZED;
- routing always narrows repository authority to read-only;
- `authority(route) ⊆ authority(work_unit)`;
- deterministic route replay;
- W3 binds routing but W2 performs `AUTHORIZED → ROUTED`.

### W4 — Append-Only Attempt + Evidence Ledger

Accepted commit:

`83019a4ab7d97115bc2d9fc53bf50ebee3ef0b1a`

Evidence:

```text
31 / 31 passing
```

Established:

- immutable model identity records;
- immutable attempt identity/provenance;
- retry ≠ independent review;
- builder ≠ verifier;
- append-only failed/refused/rejected/insufficient/escalated history;
- artifact/diff/test/verifier/resulting-commit evidence;
- duplicate/conflicting immutable record refusal;
- evidence cannot widen authority, mutate routing, or transition lifecycle;
- no semantic-winner field.

### W5 — Synthetic End-to-End Work Unit Witness

Accepted commit:

`6f754c78bb3023a09e5388f7f2681183916a6c7a`

Evidence:

```text
22 / 22 passing
8 / 8 Founder-required falsification cases passing
5 / 5 integrated mutation probes discriminating
deterministic replay PASS
```

Established one complete synthetic composition through:

```text
W1 DRAFT
→ W2 BOUNDED
→ W2 AUTHORIZED
→ W3 ROUTED
→ W4 model identity
→ W2 EXECUTING
→ W4 attempt/evidence/verifier provenance
→ W2 EVIDENCE_READY
→ W2 ADJUDICATED
→ W2 CLOSED
```

The positive witness deliberately contains:

- one failed initial attempt;
- one successful retry;
- preserved failure history;
- synthetic artifact;
- synthetic diff;
- synthetic test result;
- synthetic resulting commit;
- distinct challenger verifier evidence.

## 3. Aggregate evidence

Accepted proof counts:

```text
W1 schema                 22 / 22
W2 lifecycle              27 / 27
Routing Intelligence R2   20 / 20
W3 routing binding        28 / 28
W4 evidence ledger        31 / 31
W5 end-to-end witness     22 / 22
                         --------
TOTAL                    150 / 150
```

## 4. Falsification lineage

### W2

Deliberate mutations proved:

- `EXECUTING → CLOSED` cannot be admitted;
- authorized-core mutation guard is load-bearing.

### W3

Deliberate mutations proved:

- route cannot inherit Work Unit write authority;
- authority-subset proof is load-bearing;
- W3 cannot bypass W2 lifecycle authority.

### W4

Deliberate mutations proved:

- destructive replacement of ledger history is detected;
- same-role retry cannot masquerade as independent review;
- builder self-verification is detected;
- evidence cannot mutate deploy authority.

### W5

Integrated composition mutations proved:

- shortcut closure is detected;
- verifier prerequisite is load-bearing;
- retrospective ledger rewrite is detected;
- evidence-field authority smuggling is detected;
- read-only routing narrowing is load-bearing end-to-end.

## 5. Determinism

W5 executes the complete synthetic sequence twice from identical structured input.

Required result:

```text
byte-equivalent semantic witness output
```

Observed result:

```text
PASS
```

The deterministic witness includes:

- final CLOSED lifecycle envelope;
- exact authorized-core snapshot;
- exact bound route;
- complete evidence ledgers;
- preserved failed-attempt history;
- verifier provenance;
- all lifecycle transition evidence;
- W5 invariant snapshots.

## 6. Data and execution boundary

W5 uses only synthetic non-confidential payloads.

It uses:

```text
repository = synthetic/JARVIS-W5-WITNESS
base SHA   = 5555555555555555555555555555555555555555
result SHA = 6666666666666666666666666666666666666666
```

It does not use:

- member data;
- client data;
- PHI;
- production data;
- real repository evidence as payload;
- provider/model inference;
- credentials;
- Keychain;
- external network execution;
- OpenCode/Tinker execution;
- JARVIS repository execution;
- merge;
- push;
- deployment;
- production access.

## 7. Canonical-routing freshness evidence

At W5 closure, locally tracked canonical Routing Intelligence was verified byte-identical to the router used by W3/W5.

SHA-256:

`2837520e2f4e27aed067a84a2f8148a8b1be2436f71a57aa21a4c06d72316b4f`

Canonical Routing Intelligence proof remained:

```text
20 / 20 passing
```

## 8. Constitutional result

The proven candidate architecture now supports this law:

```text
Human authorization
        ↓
bounded Work Unit
        ↓
immutable authorized core
        ↓
deterministic read-only routing
        ↓
governed execution evidence
        ↓
independent verification
        ↓
append-only provenance
        ↓
explicit adjudication
        ↓
evidenced closure
```

No stage may silently create authority belonging to a later stage.

No successful later result may rewrite failed earlier evidence.

No builder may become its own verifier where independent verification is required.

No evidence record may decide a semantic winner.

## 9. Closure standing

Founder adjudication on 2026-09-18 records:

```text
W1 CLOSED
W2 CLOSED
W3 CLOSED
W4 CLOSED
W5 CLOSED

JARVIS-WORK-UNIT-01 W1-W5:
PROVEN LOCAL CANDIDATE ARCHITECTURE

MERGE:       NOT AUTHORIZED
PUSH:        NOT AUTHORIZED
DEPLOY:      NOT AUTHORIZED
PRODUCTION:  NOT AUTHORIZED
RGR-01:      CLOSED
```

The programme is stopped at this boundary pending a separate future founder act.
