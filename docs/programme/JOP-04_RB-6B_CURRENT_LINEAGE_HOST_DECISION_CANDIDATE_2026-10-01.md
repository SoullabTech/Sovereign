# JOP-04 / RB-6B — Current-Lineage Host Execution Decision Candidate

**Date:** 2026-10-01  
**Parent:** RB-6A current-lineage restoration `2d5e3225fc24`  
**Class:** candidate implementation · host witness still owed  
**Effect-bearing capability added:** NONE

## Purpose

Break the remaining accidental equivalence:

`valid C0 route = executable`

without introducing effect classification, write capability, generic execution permits, or caller-carried authority.

The candidate keeps the existing registry read-only and keeps `check.run` outside RB-6B authority.

## Flow

### Act 1 — routing

`jarvis:submit-task` may establish a legitimate C0 route, but no longer calls `runCapability()`.

For a supported read capability it:

- obtains the accepted `describeInvocation()` semantic observation;
- binds exact invocation + resolved repository root + C0 route projection;
- host-mints a random occurrence id;
- returns `ROUTED_AWAITING_EXECUTION_DECISION`.

`check.run` returns `CHECK_RUN_EXECUTION_PLAN_IDENTITY_UNRESOLVED` because its act semantics remain repository-defined and outside the accepted canonical-invocation substrate.

### Act 2 — host execution decision

A separate `jarvis:execute-routed-task` channel accepts only one host-minted `occurrence_id`.

MAIN then:

1. reloads the host-held occurrence;
2. re-derives invocation and C0 route against the currently bound root;
3. opens a native Electron confirmation dialog, defaulting to **Cancel**;
4. on Cancel, returns `EXECUTION_DECISION_WITHHELD` and executes nothing;
5. on Execute, re-establishes root + invocation + route after the gesture;
6. constitutes one host-side one-shot execution decision for that exact occurrence;
7. only then invokes `runCapability()`.

## Authority boundary

The renderer cannot send:

- task contents through the execute channel;
- repository path;
- shell command;
- permission envelope;
- permit;
- execution-decision object.

It may only request native review of an occurrence id already minted and held by MAIN.

The decisive fact is the native dialog result, which the submitted route cannot produce and the renderer cannot encode inside the occurrence request.

The same valid route is reachable with the host decision withheld, satisfying the route-independent / withholdable requirement structurally.

## Additional hygiene

Removed hard-coded capability-name examples from the renderer/form surface so the registry remains the only executable catalog.

The central preload allowlist now contains **14** reviewed invoke channels; actual preload extraction matches it exactly.

## Witnesses green

- deterministic registry proof: **11/11**;
- router Alpha + live local C1 probe: **16/16**;
- RB-6A current-lineage proof: **8/8**;
- RB-6B decision custody proof: **9/9**;
- RB-6B host-composition proof: **8/8**;
- Desktop C0 explorer: **54/54**;
- JARVIS Alpha floor: **97/97**;
- canonical-v2 Desktop: **30/30**;
- sealed JOP-04 R1 semantic acceptance: **18/18 GREEN, 0 mismatch**;
- preload allowlist: **14 actual = 14 ratified**, occurrence-only execution request.

Total listed executable/static assertions above: **251 green**, plus the exact preload equality check.

## Real-host witness

A new post-repair witness exists at:

`scripts/jop04/rb6b-current-lineage-post-witness.js`

It does not modify the frozen pre-repair witness. It exercises:

- registration without routing → refused;
- valid route without execution decision → staged, not executed;
- forged occurrence → refused;
- valid route + native **Execute** → executes with host decision artifact;
- valid route + native **Cancel** → decision withheld, no execution.

This witness has **not yet been run through the real Electron IPC/native-dialog boundary** on this branch because the connected host has only the installed packaged Electron binary, not a dev Electron binary for this worktree. No substitute witness is claimed.

## Standing

```text
RB-6A current-lineage restoration:  GREEN
RB-6B implementation candidate:     BUILT
route alone executes C0:             NO
host decision separate:              YES
caller decision forgery:             REFUSED by occurrence custody
host decision withholdable:          YES
check.run canonical authority:        HELD / UNRESOLVED
RB-F4 effect classification:          UNCHANGED / STILL OUT OF SCOPE
effect-bearing capability:            NONE
static + hermetic witness wall:        GREEN
real IPC/native-dialog witness:        OWED
RB-6B status:                          NOT CLOSED
RB-6 effect embargo:                   STILL ACTIVE pending host witness and later effect law
EC1 runtime mutation convergence:      BLOCKED
```

No effect-bearing capability may be added on the strength of this candidate alone.
