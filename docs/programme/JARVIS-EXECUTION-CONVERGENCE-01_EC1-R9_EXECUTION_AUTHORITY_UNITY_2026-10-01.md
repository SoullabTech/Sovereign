# JARVIS-EXECUTION-CONVERGENCE-01 / EC1-R9 — Execution Authority Unity

**Date:** 2026-10-01  
**Parent:** EC1-R8 MAIN dual-shadow mode `bb559dace5cf`  
**Class:** pre-implementation constitutional instrument  
**Runtime changes:** NONE

## Source finding

Current legacy Path A local-native coding authority requires:

- repository read;
- bounded worktree write;
- verification/check execution;
- JARVIS integration custody;
- no production, deploy, external network, disclosure or provider-spend authority.

Current canonical-v2 Desktop creation, by contrast, hardcodes:

- `repository_write: none`;
- `shell: none`.

Therefore the current canonical W0/W2 authority cannot truthfully authorize the Path A coding effect.

## Grant finding

Canonical provider execution grants have truthful temporal semantics:

- ACTIVE = authorized once, not dispatched;
- CLAIMED = execution has crossed the actual dispatch boundary;
- CONSUMED = the attempt has been settled/recorded.

`canonicalConfirmAuthorizedExecution()` claims the grant immediately before provider execution and then launches the governed provider. Retrospectively attaching ACTIVE or CLAIMED standing to a legacy Path A effect would therefore create false history.

## Ruling

> One externally meaningful local coding effect has one execution authority. Canonical standing may represent that effect only if the effect actually ran under the canonical authority that the grant records.

A legacy packet may become a projection/adapter of canonical authority, but may not remain an independent authority source for the same converged effect.

## Frozen laws

- **A1** canonical authority must actually contain the local candidate effect: repo read + worktree write + bounded shell/check execution;
- **A2** packet authority must be an exact projection of canonical authority, never an independent widening/narrowing;
- **A3** grant standing preserves temporal truth: ACTIVE before dispatch, CLAIMED at dispatch/effect-witnessed, CONSUMED after ledger settlement;
- **A4** grant claim occurs at the last lawful boundary immediately before legacy local-native dispatch;
- **A5** local-native dispatch requires CLAIMED grant + matching packet authority + current authority;
- **A6** once that grant licenses the local-native adapter, the canonical provider path must not also dispatch the same effect;
- **A7** local-native convergence preserves local/no-network/no-spend/no-merge/no-deploy boundaries;
- **A8** historical legacy effects are never retroactively assigned canonical authority.

## Matrix

Reference: **8/8 PASS**.  
Defeat candidates: **8/8 killed on named law**.  
Every defeat candidate changes exactly one decision.  
No collateral deaths remain after instrument correction.  
Matrix: **LETHAL + DISCRIMINATING**.  
Freeze: **INTACT**.

## Consequence

EC1-R4 runtime shadow projection remains blocked.

The next implementation cannot merely claim or borrow an existing canonical provider grant. It must first establish a canonical authority shape that truly authorizes the local-native candidate effect, then make Path A execution consume that authority at its actual dispatch boundary.

No second grant type or shadow authority store is admitted by this act.

## Standing

```text
EC1-R8 dual-shadow MAIN mode:     IMPLEMENTED / NON-EXECUTING
EC1-R9 authority census:          COMPLETE
Authority mismatch:               PROVEN
Retrospective grant labeling:     FORBIDDEN
Authority sidecar:                FORBIDDEN
Authority-unity matrix:           FROZEN / GREEN
Runtime projection wire:          BLOCKED
Next act:                         canonical local-candidate authority seam
```
