# AIN-CABIN-MEMORY-SOURCE-01 — Local Memory Source Seam

**Status:** implementation complete; cognition remains closed
**Base:** 76cfd65f3

## Governing sentence

> The Cabin may only claim memory layers that it can actually retrieve locally; localized substrate must be represented in the existing MAIA loader shapes without pretending the remaining layers exist.

## What this cut does

`lib/cabin/memorySource.ts` adapts the local Cabin substrate into the existing MAIA memory-source vocabulary:

- recent turns;
- prior cross-session exchanges;
- developmental memory snapshots.

It returns per-layer health for those three layers only.

The adapter does not modify `memoryOrchestrator.ts`, prompt assembly, or cognition.

## What it refuses to claim

It does not emit health for:
- episodic memory;
- semantic memory;
- relational memory;
- pattern memory;
- somatic memory;
- breakthrough memory;
- field memory;
- meta-memory.

Those layers remain outside the Cabin-localized source contract.

## Falsifiers

1. **Shape fidelity:** local source objects match the existing `PriorExchangeSnapshot` and `DevelopmentalMemorySnapshot` shapes.
2. **Session fidelity:** current-session turns are excluded from cross-session retrieval.
3. **Health honesty:** empty local layers report `empty`, not `ok`.
4. **Boundary honesty:** unlocalized layers are absent rather than represented as falsely healthy.
5. **No cognition activation:** the existing Cabin cognition routes remain `503 CABIN_COGNITION_NOT_LOCAL`.

## Witness

Focused source suite: **2/2 pass**.

This is the seam immediately before cognition. The next cut should construct the complete Cabin memory-health envelope and prove prompt conditioning before a local model is allowed to speak from the Cabin memory field.
