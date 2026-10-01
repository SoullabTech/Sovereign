# MAIA-MEMORY-ATTRIBUTION-01 · R0/R1 — Canonical Reconciliation + Expected-Red Falsifier

**Date:** 2026-10-01
**Base:** `d8e0c6bcaeb40fb2708886dbb8ea5c29412de28f`
**Class:** local memory/CMT integration · falsifier only
**Standing:** R0 RECONCILED · R1 EXPECTED RED ESTABLISHED · NO BEHAVIOR CHANGE

## 1. Question

Can the live FAST `MemoryBundle` preserve truthful authorship / participation / authority
for member turns, developmental inference, and legacy computed breakthrough material
without opening CMT M3 or inventing a new standing vocabulary?

## 2. Reconciliation result

The answer is **yes in principle, using current canon**, but the live legacy seam does not
do so today.

Current canonical-turn already supplies the relevant axes:

- `AuthoredBy`;
- `ParticipationClass`;
- `Authority`.

The current canonical producer `inferred.memory_influence` is explicitly
`system · inferred · infer` and current `pp-1` admits it without elevating its authority.
Therefore the historical P3 exclusion-first policy is not revived.

Historical donor evidence was recovered from non-canonical side branches:

- `440403ca0` — P3 participation gate;
- `0e9cf3d89` — P3f breakthrough participation;
- `8154f0535` — P1c sovereign disposition;
- `09f934f96` — restored P6 return-authority boundary.

None is an ancestor of current canonical. The donor branch is 2,191 commits behind current
canonical and is not a merge candidate. The historical mechanisms are evidence, not authority.

P6's narrow invariant survives: a schema/default writer may not fabricate member return authority.
That is separate from this cut and is not implemented here.

## 3. Current wrong world

`MemoryBundleService.build()` merges:

- member-authored conversation turns;
- system-derived developmental signals;
- legacy computed breakthrough rows.

`MemoryBullet` retains only `source`, significance, time and facet. The FAST prompt formatter
then renders `[source] content` without the canonical participation axes. This permits mixed-origin
material to reach cognition with less standing than the repository already knows how to express.

## 4. Frozen falsifier

`tests/constitutional/refusal-registry/refusal-32-memory-bundle-standing-attribution.ts`

R32 requires three things before it can become GREEN:

1. `MemoryBullet` carries `authoredBy · participationClass · authority`;
2. `formatForPrompt()` renders those axes into model-readable context;
3. turn / developmental / breakthrough candidate construction assigns truthful origin standing.

The expected-red runner is:

`tests/constitutional/refusal-registry/maia-memory-attribution-gates.ts`

Witness command:

`node --experimental-strip-types tests/constitutional/refusal-registry/maia-memory-attribution-gates.ts`

Observed on the frozen base:

```text
R32  RED    expected RED before repair
0 passed · 3 failed · 0 warned
```

The runner exits 0 only because the prohibited current world was correctly detected.

## 5. Non-effect

This cut does **not** authorize or implement:

- CMT M3 authoritative cognition cutover;
- P6 return-authority restoration;
- exclusion of system-inferred memory;
- a universal standing envelope or registry;
- changes to Member Web partitioning;
- source-turn lineage schema changes;
- new memory selection/ranking policy;
- deployment or production mutation.

## 6. Next lawful unit

R2 may design the **smallest local repair** that turns R32 GREEN while:

- reusing the current canonical-turn vocabulary;
- preserving current MemoryBundle selection and ranking;
- preserving availability of inferred memory;
- making attribution legible to cognition;
- leaving M3 closed.

No implementation is admitted by this record beyond that bounded local repair candidate.
