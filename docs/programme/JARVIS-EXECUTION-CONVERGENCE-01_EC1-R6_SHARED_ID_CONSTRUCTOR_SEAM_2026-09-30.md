# JARVIS-EXECUTION-CONVERGENCE-01 / EC1-R6 — Shared-ID Constructor Seam

**Date:** 2026-09-30  
**Parent:** EC1-R5 identity constitution `3fe39d443be6`  
**Class:** bounded implementation  
**Runtime shadow wire:** NONE

## Change

Three narrowly scoped changes:

1. `jarvis-desktop/src/shared-work-identity.js` adds a pure representation-neutral Work-ID minter (`work-…`) and validator.
2. `operator-work-unit.buildPacket()` accepts optional `workUnitId`; when present and safe, it is preserved exactly. When omitted, legacy `desktop-…` minting is unchanged.
3. `canonical-work-unit-v2.createCanonicalV2()` accepts optional `opts.workUnitId`; when present and safe, W0.v2 preserves it exactly. When omitted, canonical `v2-…` minting is unchanged.

No existing constructor is made to discover or match the other store.

## Proof

`shared-work-identity-seam-proof.mjs`: **8/8 PASS**.

Proves:

- shared ID is safe and representation-neutral;
- legacy constructor preserves caller-supplied ID;
- W0.v2 constructor preserves the same caller-supplied ID;
- objective, exact base SHA and bounded path scope agree across representations;
- invalid supplied IDs fail closed on both constructors;
- omission preserves historical `desktop-…` and `v2-…` defaults;
- no historical matcher or identity sidecar is introduced.

Regression evidence:

- legacy operator Work Unit tests: **9/9 PASS**;
- canonical-v2 Desktop proof: **30/30 PASS**;
- EC1-R5 matrix: **LETHAL + DISCRIMINATING**;
- EC1-R5 freeze: **INTACT**;
- EC1-R4 projector proof: **7/7 PASS**.

## Boundary

This act does not change `main.js` and does not mint a shared ID in production. It only makes both constructors capable of preserving one when a future governed caller supplies it.

It does not:

- backfill 88 legacy packets;
- reinterpret 7 existing W0.v2 units;
- create a crosswalk;
- dual-write Work at runtime;
- execute local-native through W v2;
- wire EC1-R4 projection into Path A;
- alter O5 recovery.

## Standing

```text
EC1-R5 identity law:          FROZEN / INTACT
EC1-R6 shared-ID minter:      IMPLEMENTED
Legacy optional ID seam:      IMPLEMENTED
W0.v2 optional ID seam:       IMPLEMENTED
Default IDs:                  UNCHANGED
Historical pairing:           NONE
MAIN runtime use:              NONE
Dual representation create:   NOT OPENED
Runtime shadow projection:    BLOCKED until dual-create is governed
```

The next act may only create both representations from one MAIN-minted shared ID and must prove semantic-core equality before either representation becomes execution-eligible.
