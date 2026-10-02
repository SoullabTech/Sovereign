# SOULLAB-DESKTOP-UNIFICATION-01 — Current Canonical Port

**Date:** 2026-10-01  
**Class:** B — desktop host composition / packaging / authority boundary  
**Canonical base:** `ac7bfd353128210c5f1e7012e0b71a9256035834`  
**Recovery source lineage:** `f09efdb36` → `06245252ce` → `b975472baa`  
**Branch:** `fix/soullab-desktop-unification-current-20261001`  
**Standing:** CURRENT-CANONICAL PORT CANDIDATE · no merge/deploy/release authority

## 1. Purpose

Port the complete Soullab Desktop unification law onto the post-#1682 canonical tree.

The product shape remains:

> One Soullab Desktop. MAIA is the relational/member realm. JARVIS is the governed operator/work realm. They share a body without sharing authority.

This act follows the admission of Kelly's World / Founder Workspace and does not replace it.
## 2. Complete lawful sequence

The preserved lineage contains three cumulative acts:

1. `f09efdb36` — establish the product / realm / transport boundary and falsifiers F1–F7.
2. `06245252ce` — make the JARVIS realm embeddable without taking over app lifecycle (F8–F9).
3. `b975472baa` — add the server-authorized JARVIS doorway, sign-out revocation, and packaged realm source (F10–F12).

None of these commits was previously canonical. This port carries the complete sequence rather than cherry-picking only F10–F12.
## 3. Current-canonical reconciliation

The preserved lineage conflicted with current canonical in four files:

- `jarvis-desktop/src/main.js`
- `maia-desktop/package.json`
- `maia-desktop/scripts/build.mjs`
- `maia-desktop/test/portability-01-host-boundary.test.mjs`

The conflicts were resolved by taking current canonical first, then adding the unification seam.

### JARVIS lifecycle

Standalone JARVIS retains:
- its own userData identity;
- single-instance lock;
- menu;
- startup recovery;
- O5-R3 lease cleanup;
- activate/window lifecycle.

Embedded JARVIS registers its existing governed IPC/window surface but does not install those app-lifecycle hooks.

The current Kelly's World default remains the JARVIS window surface.
### Packaging

Current Cabin packaging remains authoritative.

The Desktop package now carries both:

```text
Contents/Resources/
├─ cabin-runtime/
└─ jarvis-desktop/src/
```

The build script continues its current Cabin staging, portability and node_modules custody, then adds a packaging-only copy of canonical `jarvis-desktop/src`.

The JARVIS copy is not a second implementation. Source authority remains the canonical JARVIS tree.

### MAIA authority doorway

MAIN, not the renderer, determines operator access using the authenticated server admin boundary.

Only admitted owner roles may open JARVIS. Sign-out revokes the JARVIS realm and closes an open JARVIS window.
## 4. Witness repair

The existing Cabin startup test searched the entire MAIA main file for the first literal `createWindow();`.

After the JARVIS doorway was added, `jarvisHost.createWindow();` appeared earlier in the source and falsely looked like the MAIA startup window.

The test was narrowed to the actual `app.whenReady` startup block and now proves the intended law directly:

> Cabin startup completes successfully before the MAIA window is created.

No product startup order changed.

## 5. Verification

### Constitutional / boundary

- Soullab Desktop unification + portability: **18/18 PASS**
- Unification + Cabin runtime ordering combined: **24/24 PASS**
- `node --check` on JARVIS main: PASS
- `node --check` on MAIA main: PASS
### JARVIS Desktop population

```text
tests   390
pass    379
fail    2
skip    9
```

The two failures are the same known stale JOP-00 baseline failures present before this port. No new JARVIS failure was introduced.

### MAIA Desktop population

```text
tests   410
pass    407
fail    3
skip    0
```

All three failures are the existing direct-Node ESM module-resolution failures in:

- `cabin-local-store.test.mjs`
- `cabin-memory-source.test.mjs`
- `cabin-work-projection.test.mjs`

The exact same three failures were reproduced on untouched canonical `ac7bfd353128210c5f1e7012e0b71a9256035834`.

Therefore this port adds **zero new MAIA Desktop test failures**.
## 6. Explicit exclusions

This act does not:

- merge itself to canonical;
- install or replace an application bundle;
- notarize or staple an artifact;
- declare external-beta release readiness;
- widen MAIA renderer authority;
- expose JARVIS privileged verbs to member-facing or remote content;
- grant JARVIS authority merely because a member is signed in;
- merge the separate nested-native notarization repair lane.

The Desktop release/notarization programme remains a separate convergence act after this host-composition candidate is admitted.

## 7. Next boundary

After canonical admission, reconcile the active Desktop notarization / nested-native signing lane onto the unified-host canonical tree.

That later act must prove the final packaged artifact contains:

- the current Cabin runtime;
- the current JARVIS realm source;
- Developer-ID trust for every packaged Mach-O;
- secure timestamp and hardened runtime;
- the exact canonical release SHA.

No release claim is licensed by this port alone.

## 8. Reconciliation to safety-delivery canonical

Canonical advanced to `edf656496450795fa5c8089b4eb6e314ccc7bfd8` via #1663 (SAFETY-DELIVERY-01 S1 reachability).

The unification branch merged that boundary with zero conflicts. The only incoming changes were the safety-delivery record and its non-delivery register update.

Post-merge verification:

- `git diff --check`: PASS
- JARVIS main syntax: PASS
- MAIA main syntax: PASS
- Cabin startup + portability + Soullab Desktop F1–F12: **24/24 PASS**
- provider governance: PASS; no new OpenAI surface

PR #1695 is classified **Class B** with **revert commit sufficient** as its rollback discipline. This classification is a constitutional gate declaration, not merge authority.
