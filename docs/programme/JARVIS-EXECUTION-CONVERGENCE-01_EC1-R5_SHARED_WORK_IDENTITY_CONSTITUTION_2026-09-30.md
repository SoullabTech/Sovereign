# JARVIS-EXECUTION-CONVERGENCE-01 / EC1-R5 — Shared Work Identity Constitution

**Date:** 2026-09-30  
**Parent:** EC1-R4 shadow projector `3e6724da185b`  
**Class:** pre-implementation identity constitution  
**Runtime wiring:** NONE

## Real-home census

Delegation home: `/Users/soullab/.claude/ain-delegation`.

- legacy packet Work Units: **88**;
- W0.v2 Work Units: **7**;
- exact ID overlap: **0**;
- exact objective matches between any v2 unit and legacy packet: **0**;
- exact objective + base SHA + path-scope matches: **0**.

Historical Path A ↔ W v2 pairing is therefore not provable from current durable state.

## Constructor finding

Legacy Desktop creation mints `desktop-<objective>-<time>`.

Canonical v2 creation independently mints `v2-<objective>-<time>`.

Even the same objective and timestamp therefore produce different identities. Current source contains no authoritative bridge between the two stores.

## Ruling

Future shadow convergence uses **identity unity at creation time**:

> One logical Work is assigned one Work ID once, above both representations. During a bounded shadow migration, both legacy packet and W0.v2 envelope may represent that same Work only when they carry that exact shared ID and their semantic core agrees.

Not admitted:

- heuristic historical matching;
- objective matching;
- base-SHA matching as identity;
- sidecar identity-crosswalk store;
- constructor-local reminting;
- same-ID execution when objective/base/path scope disagree.

## Frozen laws

- **I1** one logical Work has one ID across representations;
- **I2** constructors preserve a caller-supplied identity and do not remint;
- **I3** historical work is never paired heuristically;
- **I4** no second identity/crosswalk store;
- **I5** different IDs are different Works even if prose looks similar;
- **I6** same ID is insufficient when semantic core differs;
- **I7** execution/shadow projection is eligible only when shared identity and semantic core both agree.

## Matrix

Reference: **7/7 PASS**.  
Defeat candidates: **7/7 killed on named law**.  
All extra deaths classified.  
Every candidate changes exactly one decision.  
Matrix: **LETHAL + DISCRIMINATING**.  
Freeze: **INTACT**.

## Standing

```text
EC1-R4 shadow projector:       IMPLEMENTED / NOT WIRED
EC1-R5 real-home census:       COMPLETE
Historical pairing:           NOT PROVABLE
Shared-ID constitution:       FROZEN
Identity sidecar:              FORBIDDEN
Heuristic bridge:              FORBIDDEN
Constructor changes:           NONE
Runtime shadow wire:           STILL BLOCKED
Next act:                      shared-ID constructor seam
```

The next implementation act may only teach the two creation seams to accept one externally minted shared Work ID and prove semantic-core equality. It may not backfill or reinterpret the 95 existing durable records.
