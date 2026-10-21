# MAIA-MEMORY-ATTRIBUTION-01 / R1 — FAST Memory Standing Shadow

**Date:** 2026-10-01
**Standing:** IMPLEMENTATION WITNESS · normative authority limited to the bounded R1 act
**Current canonical base:** `origin/clean-main-no-secrets @ a6464dcd1bc6c267c7550a2c2c3fb747dcff8e7b`
**Branch:** `fix/maia-memory-attribution-shadow-r1-20261001`
**R0 evidence:** `MAIA-MEMORY-ATTRIBUTION-01_R0_CANONICAL_RECONCILIATION_2026-10-01.md`

## 1. Authorized question

Make the live FAST `memoryContext` observable to standing analysis without changing what MAIA receives.

The act is shadow-only. It may:
- preserve authorship / participation / authority on structured memory data;
- reconstruct the live prompt bytes independently for comparison;
- emit content-free standing evidence.

It may not:
- add provenance labels to the live prompt;
- exclude inferred memory;
- open M3 or restore historical Path B/P6;
- change schema, persistence, ranking, retrieval, or source-turn ancestry.

## 2. R0 design falsified by current ct-1 mechanics

R0 proposed expressing `memoryContext` as a normal `DeclaredPartition`, following the atoms precedent.

That exact implementation is **not representable truthfully today**.

The live memory-bullet section is ranked across member turns, developmental inference, and computed breakthroughs. Those origins can interleave arbitrarily. Current ct-1 partition law:
- permits one candidate block per producer id;
- rejects repeated producer ids;
- requires registry-adjacent segments;
- rejects empty placeholder segments;
- requires byte-exact source ordering.

Weakening any of those rules merely to make MemoryBundle fit would damage an existing constitutional guard.

A second shortcut was also rejected during R1: registering the entire mixed `memoryContext` as one producer. `UNRESOLVED_MIXED` is currently documentary data only; it does not prevent MIPA from admitting the block with the registry's single authorship. That would make the shadow itself tell a false provenance story.

**Ruling within this implementation:** do not weaken ct-1 and do not masquerade a mixed block as single-author.

## 3. What R1 actually changes

### A. Standing survives inside MemoryBundle data

`MemoryBullet` now carries the already-canonical three axes:

| Source | authoredBy | participationClass | authority |
|---|---|---|---|
| member turn | member | retrieved | situate |
| developmental memory | system | inferred | infer |
| legacy breakthrough | system | computed | compute |

No new standing vocabulary is introduced.

The breakthrough classification follows the R0 evidence: the legacy bucket records system-computed significance and must not acquire member standing merely because it persists.

### B. A dedicated standing shadow observes the channel

New module:
`lib/maia/canonical-turn/memoryBundleShadow.ts`

It independently reconstructs the current `formatForPrompt()` bytes from the structured bundle and compares that reconstruction with the exact `memoryContext` handed to cognition.

It emits:
- live digest;
- rebuilt digest;
- byte-parity boolean;
- section character counts and digests;
- resolved standing where structurally knowable;
- item-level standing for ranked memory bullets;
- an explicit unresolved-mixed marker for recent continuity.

The shadow deliberately emits **no memory text**.

Current section treatment:
- relationship summary → system · computed · compute;
- recent continuity → UNRESOLVED_MIXED;
- memory bullets → itemized from structured source data;
- recent breakthrough summary → system · computed · compute.

The route invokes this witness only after the normal MemoryBundle has already been built and formatted. The observer has no return path into cognition.

Marker:
`[MAIA/shadow-memory]`

### C. Live prompt bytes remain frozen

`MemoryBundleService.formatForPrompt()` is unchanged from canonical.

In particular, the live model still receives the historical forms:
- `[turn]`
- `[developmental]`
- `[breakthrough]`

It does **not** receive:
- `member/retrieved/situate`;
- `system/inferred/infer`;
- `system/computed/compute`.

Prompt-label framing remains unauthorized.

## 4. Witness

Focused tests:

```text
bun test   lib/maia/canonical-turn/__tests__/canonicalTurn.test.ts   lib/maia/canonical-turn/__tests__/atomsPartition.test.ts   lib/maia/canonical-turn/__tests__/memoryBundleShadow.test.ts

48 pass
0 fail
```

The new witness specifically proves:
1. independent reconstruction equals the live prompt bytes;
2. a one-byte drift turns parity false;
3. member/developmental/breakthrough standing survives in structured data;
4. no standing axes are rendered into the live prompt.

TypeScript no-regression gate:

```text
program files : 4676
errors        : 222
baseline      : 239
No TypeScript regressions.
```

`git diff --check` is clean.

## 5. Non-admitted competing implementation

Branch `chore/maia-memory-attribution-falsifiers-20261001` contains:
- `ca1222728` — `fix(memory): preserve FAST memory attribution standing`

That commit modifies `formatForPrompt()` to render standing labels into cognition.

It exceeds this R1 authorization and is **NOT ADMITTED** by this witness.
It must not be merged as the implementation of MAIA-MEMORY-ATTRIBUTION-01 R1.

## 6. What remains open

Unchanged:
- exact developmental-memory source-turn ancestry — FOUND / NOT OPENED;
- `retrieved.member_web` mixed authorship — existing PARTITION-01 unresolved state;
- prompt framing of attribution — NOT OPENED;
- M3 cognition cutover — UNAUTHORIZED;
- historical P6/Path B restoration — NOT AUTHORIZED;
- fallback `formatRecallForPrompt(recall)` shadow visibility — FOUND, not repaired in this cut;
- programme status/custody index — NAMED / NOT OPENED.

A future structural partition of MemoryBundle requires a truthful representation for repeated/interleaved producer instances. R1 does not invent that mechanism.

## 7. Kelly's World propagation

This is a constitutional implementation-state change and should surface in Kelly's World when its field-index lane consumes canonical programme records:

- **System:** MAIA Memory Attribution — R1 shadow visibility;
- **Monitor:** prompt bytes unchanged; standing witness active; mixed continuity unresolved;
- **Work:** no follow-on implementation opened;
- **Graph:** relate AIN-STANDING-01 → MAIA-MEMORY-ATTRIBUTION-01 → CMT/PARTITION-01;
- **Today:** only if an unresolved founder/governance act becomes actionable.

No Kelly's World runtime/UI code is changed in this lane because its current canonical mount is separate from this repair.

## 8. R1 conclusion

```text
memoryContext standing visibility     ESTABLISHED via dedicated shadow witness
live prompt content                   UNCHANGED
new standing vocabulary               NONE
ct-1 partition law                    UNCHANGED
mixed block masquerade                REFUSED
prompt attribution framing            UNAUTHORIZED
M3                                     UNAUTHORIZED
schema/runtime/deployment              UNCHANGED
next implementation                    NONE automatically opened
```
