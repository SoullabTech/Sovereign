# MAIA-MEMORY-ATTRIBUTION-01 · R3 — Implementation Witness

**Date:** 2026-10-01  
**Parent:** `e98ecaeec90b57709cd63c3639956f7fdb971462`  
**Scope:** legacy FAST `MemoryBundle` standing preservation only  
**Standing:** IMPLEMENTED LOCALLY · R32 GREEN · TYPEHEALTH NO-REGRESSION · NOT MERGED · NOT DEPLOYED

## 1. Change

Only `lib/memory/MemoryBundle.ts` changes runtime behavior.

The existing canonical participation identity now survives:

```text
candidate
→ ranking / dedupe / cutoff
→ MemoryBullet
→ FAST prompt
```

Mappings:

- prior member turn → `member · retrieved · situate`;
- developmental signal → `system · inferred · infer`;
- legacy insight → `system · inferred · infer` when instantiated;
- legacy breakthrough → `system · inferred · infer`.

## 2. Behavioral non-expansion

Unchanged:

- retrieval SQL;
- vector / non-vector ranking;
- significance / recency scoring;
- deduplication;
- max-bullet cutoff;
- `selectionTrace`;
- `conversation_memory_uses` audit writes;
- Sanctuary and memory-mode gates;
- provider/tier routing.

No source is suppressed and no source is newly admitted.

## 3. R32 witness

The original R32 detector is unchanged from the expected-red freeze commit.

After the repair:

```text
MemoryBullet carries canonical participation axes       PASS
formatForPrompt renders standing                       PASS
candidate constructors assign truthful origin          PASS

R32 GREEN
3 passed · 0 failed · 0 warned
```

The runner's expected state advances from RED to GREEN; the falsifier itself is not weakened.

## 4. Type-health witness

`npm run typecheck -- --pretty false`

```text
program files : 4663 (baseline 3965)
errors        : 222 (baseline 239)
17 errors fixed since baseline
705 new files entered the program
No TypeScript regressions
```

## 5. Non-effect

This implementation does not:

- open CMT M3;
- restore or alter P6 return authority;
- change Member Web partitioning;
- alter primary source-turn lineage;
- convert system inference into member testimony;
- change memory ranking or relevance;
- create a shared standing service;
- authorize merge, deploy, or production mutation.

## 6. Next gate

Merge/deploy remain separate acts. Before either, rebase/reconcile against the live canonical tip
and rerun R32, typehealth, sovereignty/provider/PHI/design gates.
