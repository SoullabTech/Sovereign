# SOULLAB-DESKTOP-UNIFICATION-01 — Census · 2026-09-30

```text
Class: B — desktop packaging / host composition / privileged-boundary work
Canonical base: 04005ca7c65c8cdc1420d482710a50ea0c3b8f68
Branch: feature/soullab-desktop-unification-01-20260930
Current gate: CENSUS → FALSIFIER
Stop: no installed-app replacement, privilege widening, state migration, merge, or deploy
```

## Governing architecture

The product becomes **one installed Soullab Desktop** while MAIA and JARVIS remain
**different authority realms inside that product**. One applies to product identity,
continuity, local runtime, update path, and installation. It does not mean that
member-facing MAIA inherits JARVIS repository/shell authority.

> One Soullab Desktop. MAIA is the relational/member realm. JARVIS is the
> governed operator/work realm. They share a body without sharing authority.

This supersedes two separately installed products while preserving the earlier
safety ruling that MAIA Desktop and JARVIS are separate surfaces.

## Canonical substrate

- `maia-desktop/` is the canonical member-facing native host: Electron lifecycle,
  native voice, member session, conversation continuity, and contained Soullab view.
- `maia-desktop/src/shell.js` already holds privileged local and remote platform
  webContents structurally apart; the remote view has no preload.

- `shell-policy.js` already accepts either `https://soullab.life` or explicit
  loopback HTTP and hard-fails invalid explicit origins instead of falling to production.
- `jarvis-desktop/` is the governed founder/operator console over Builder, router,
  local continuity, providers, and Work Units; MAIN owns execution authority.
- `desktop-app/` is explicitly legacy/non-canonical and frozen.
- `electron/` is explicitly the LabTools utility window only.

## Installed Mac state

Observed 2026-09-30:
- `/Applications/JARVIS.app` — `life.soullab.jarvis`, 0.1.0-alpha.
- `/Applications/MAIA - Sacred Mirror.app` — `com.soullab.maia`, 1.0.0;
  the frozen legacy prototype, not canonical `maia-desktop/`.
- `/Applications/Soullab.app` — an iPhoneOS Capacitor bundle
  (`life.soullab.maia`, build 2515), not the canonical macOS Desktop host.
- No installed bundle with canonical id `life.soullab.maia.desktop` was found.

The task is therefore convergence and packaging, not invention of another app.

## Offline standing

Full offline Soullab is **not closed today**. JARVIS already has local continuity
and local-model/provider seams. MAIA Desktop's contained platform view needs
production Soullab or a loopback Soullab runtime.

```text
Soullab Desktop
  ├─ MAIA native host / voice / device capabilities
  ├─ MAIA realm
  ├─ JARVIS governed operator realm
  └─ canonical Soullab platform view
       ├─ connected: https://soullab.life
       └─ sovereign: explicit loopback Soullab runtime
```

The same House, Writer's Studio, Living Field, relationships, and admitted rooms
must render through either transport. Offline mode must never quietly use
production when the local runtime is absent or misconfigured.

## Baseline

Canonical MAIA Desktop's native voice, session, containment, arrival, continuity,
and thread-watch suite passes. JARVIS Desktop has 356 tests; current canonical
contains two stale assertions in `jop-00-negative-controls.test.mjs`: the runtime
now reports `LOCAL_WORKER_WRITE_AUTHORITY_REFUSED` where the test expects the
older name, and a formerly minimal `local-native` packet no longer satisfies the
evolved authority contract. These failures predate this lane.

## First implementation boundary

Do **not** rename the package or bundle id first. Electron product identity affects
`userData`; a cosmetic rename that forks session/continuity state would violate
the unification this programme is for.

First build the composition-law falsifier suite. It must kill candidates that:

1. put remote Soullab content in webContents carrying MAIA or JARVIS preload;
2. expose JARVIS privileged verbs to the member-facing/remote realm;
3. let absent/invalid local runtime silently fall through to production;
4. create a second member/conversation/memory truth because Desktop is local;
5. revive `desktop-app/` or LabTools `electron/` as product authority;
6. rename or move Desktop state without an explicit continuity migration.

Only after those falsifiers bite should the unified product shell be implemented.

## Falsifier result

`maia-desktop/test/soullab-desktop-unification-falsifier.test.mjs` establishes
SDU-F1…F7. The dedicated suite passes 7/7. The full canonical MAIA Desktop suite,
including the new law and the Sovereign Portability guard, passes **365/365**.

The law module is explicitly admitted as portable domain logic: it imports no
Electron surface and can survive a later native host.

**Next boundary:** compose a JARVIS realm behind this law without adding JARVIS
verbs to the MAIA or remote platform preloads. Product rename, bundle-id change,
userData migration, installed-app replacement, and offline runtime packaging
remain later acts.

## Composition seam — SDU-F8/F9

JARVIS main.js now distinguishes standalone ownership from embedded composition
with STANDALONE = require.main === module. Embedded use registers the existing
jarvis:* IPC authority surface but does not change Desktop userData, claim the
single-instance lock, replace the app menu, or install JARVIS app lifecycle hooks.
The existing JARVIS window constructor is exported for a later Soullab-host doorway.

JARVIS durable state remains where it already lives:
~/Library/Application Support/JARVIS/ for repository binding and
~/.jarvis/continuity/ for the local continuity index.

Verification after the seam:
- unification falsifiers: **9/9 PASS**;
- full MAIA Desktop suite: **367/367 PASS**;
- full JARVIS suite: no new failures; the same two pre-existing JOP-00 stale
  negative-control assertions remain.

No shared-host doorway is wired yet. This commit makes composition possible;
it does not expose JARVIS to a member-facing renderer.
