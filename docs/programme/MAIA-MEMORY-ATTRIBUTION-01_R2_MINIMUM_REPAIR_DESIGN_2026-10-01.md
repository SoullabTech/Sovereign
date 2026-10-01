# MAIA-MEMORY-ATTRIBUTION-01 · R2 — Minimum Repair Design

**Date:** 2026-10-01
**Parent:** `d9e954b36`
**Class:** local design only
**Standing:** DESIGN COMPLETE · IMPLEMENTATION NOT YET TAKEN

## 1. Missing function

Preserve the repository's existing canonical participation identity across the legacy FAST
`MemoryBundle` chain:

```text
candidate → ranked candidate → compressed MemoryBullet → FAST prompt
```

The repair does not decide whether a memory participates. Existing retrieval, ranking, cutoff,
deduplication, memory mode, Sanctuary gates and current availability remain unchanged.

## 2. Reused vocabulary

Import the existing `ParticipationIdentity` contract from
`lib/maia/canonical-turn/participationDisposition.ts`.

No new standing enum, provenance vocabulary, registry or service is introduced.

## 3. Exact source mapping

```text
turn           member · retrieved · situate
developmental  system · inferred  · infer
insight        system · inferred  · infer
breakthrough   system · inferred  · infer
```

Rationale:

- `turnsToCandidate()` already selects only `role === 'user'`, so the turn candidate is
  member-authored material retrieved from prior conversation.
- Developmental memory is a system-distilled trajectory signal.
- Insight is system-derived material.
- Legacy `breakthrough_moments` is machine-detected / machine-extracted significance;
  it is not member-marked significance and therefore remains system inference.

## 4. Minimum code surface

Only `lib/memory/MemoryBundle.ts` needs behavioral change for R32:

1. `MemoryCandidate` extends/carries `ParticipationIdentity`.
2. `MemoryBullet` extends/carries the same identity.
3. Each candidate constructor assigns the mapping above.
4. `compress()` copies the axes unchanged.
5. `formatForPrompt()` renders the axes with each bullet so cognition can distinguish
   member testimony from system inference.

## 5. Required invariants

The repair must leave all of these behaviorally identical:

- candidate retrieval;
- composite scoring;
- deduplication;
- top-N cutoff;
- `conversation_memory_uses` audit writes;
- `selectionTrace`;
- Sanctuary / memory-mode gating;
- current FAST/CORE/DEEP routing.

Standing is descriptive context here, not a new selector.

## 6. Acceptance

R32 must move from expected RED to GREEN for exactly these reasons:

1. `MemoryBullet` carries `authoredBy · participationClass · authority`;
2. prompt compilation renders those axes;
3. all four source classes have explicit truthful identity.

A repair that turns R32 green by suppressing developmental or breakthrough memory fails this design.
A repair that turns R32 green by opening M3 also fails this design.

## 7. Non-effect

No CMT M3. No P6 change. No Member Web partition change. No source-turn schema change.
No new authority. No new standing vocabulary. No deployment. No production mutation.
