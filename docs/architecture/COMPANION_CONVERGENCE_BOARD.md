# MAIA-DESKTOP-COMPANION-CONVERGENCE-01 — board

**Date:** 2026-08-30 · rulings closed, steps 5–7 complete

```
MAIA-CONVERSATION-HARVEST-01
  census                              COMPLETE   docs/architecture/MAIA_CONVERSATION_HARVEST_01.md
  implementation                      NONE

CONVERGENCE RULINGS
  partition/surfaces authority        WITHDRAWN
  fail-closed defaultSession          CARRY      atomic repair, shipped
  mini harness ambient audio          FORBIDDEN
  mini harness explicit witness audio ALLOWED    dev/witness only, MAIA_WITNESS_MODE=1 + unpackaged
  entitlements token repair           CARRY      72fac4956
  shared conversation-core extraction DEFER      → MAIA-CONVERSATION-CORE-01

STEPS
  5 · negative permission proof       DONE       retargeted at platformPermission()
  6 · house allow-list regeneration   DONE       byte-identical, no drift
  7 · Writer's Studio continuity      DONE       seven-seam contract, executable
```

## Companion Step 1 disposition

```
surfaces.js / partition authority     WITHDRAW
platform mic blanket denial           WITHDRAW
second privileged MAIA topology       WITHDRAW
defaultSession fail-closed            CARRY · atomic repair
negative permission proof idea        CARRY · retargeted to surface policy
```

`20a8abcbf` is **not** preserved as product architecture.

## What changed in code

| Change | Where |
|---|---|
| Default session fail-closed; witness mode is an explicit declaration | `maia-desktop/src/shell-policy.js` (`defaultSessionPermission`, `witnessModeDeclared`), wired in `main.js` |
| Negative permission proof retargeted at the ratified deny list, by route | `test/dv01-voice-capability.test.mjs` |
| Coverage proof: only `/maia` among navigable House roots holds a microphone | `test/dv01-voice-capability.test.mjs` |
| Writer's Studio seven-seam contract | `test/dws01-writers-studio-seam.test.mjs` |

### Two guards inverted by ruling

`d01-boundary` *"media permission is granted for audio only"* and `ds01` **F4** both
asserted that the default session grants audio unconditionally. **They were not wrong.**
When they were written, the default session *was* the MAIA side — the whole voice path
ran in the local renderer. Convergence moved the conversation to canonical `/maia` under
`platformPermission()`, and the ruling made what is left behind a harness. A harness does
not earn ambient capability by being useful.

Both were inverted, not relaxed: what they protect now is stronger. The half of F4 that
forbids conflating the partition with the default session is unchanged, and was always
the half doing the structural work.

## Not claimed

Everything here is **SOURCE/TEST** evidence: 265/265 in `maia-desktop/test`. That a Mac
microphone opens on canonical `/maia`, that House → Studio → MAIA → back walks on a
device, and that a spoken turn becomes canonical are **DEVICE legs** and are unclaimed.

## Next

`MAIA-CONVERSATION-CORE-01` — boundary and migration plan for a shared conversation core.
Candidate substrate: `capture-liveness` · `vad` · `utterance` · `epoch`. The governing
test is not *"can these files be moved?"* but:

> Can `/maia` retain its richer capture routing, messages, cross-surface adoption, Work
> context and UI while becoming **unable to disagree with Desktop** about LISTENING, turn
> completion, interruption and tail disposition?

```
CURRENT /maia                    TARGET SHARED SEMANTIC
  onstart → says LISTENING         capture starts → STARTING
       ↓                           frame observed → LISTENING
  micLiveness may later retract    no surface can claim LISTENING early
```

That is a **semantic authority change**, not a refactor. Its own lane, its own evidence.
