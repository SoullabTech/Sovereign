# `claude/desktop-full-platform-01` — candidate-product census

**Date:** 2026-08-29 · **Evidence class:** SOURCE · **READ-ONLY.** Nothing moved, cherry-picked,
rewritten or reconciled.
**Canonical substrate:** `d40eed91e` (DSC-FINAL). **Candidate evidence:** `11bd40e3f6` (branch tip).

```text
              d332935ae   shared ancestor · maia-desktop/src/main.js = 514
                /                                        \
  desktop-full-platform-01                    maia-desktop-architecture (DSC)
  15 commits · +3,671 lines                   8 commits · main.js 514 → 350
  main.js 514 → 872                           continuity · turn · capture-watch ·
  shell · shell-policy · House                voice-lifecycle · member-draft
  ~2,100 lines of tests                       74 new tests
```

Neither lane contains one module of the other's. This is a hard divergence on the same file.

---

## 0 · Headline

**Keep the House. Keep the shell — it already conforms. Discard the superseded substrate. Adjudicate
four items. And five of the fifteen commits are not Desktop work at all.**

⭐ **The single most useful finding:** `shell.js` and `shell-policy.js` were written to the same
discipline the DSC sequence arrived at independently — pure policy separated from host adapter, with
injected dependencies *because Electron cannot run in CI*. Its own header says so. The shell does
not need reconciling to the invariant; it already satisfies it.

---

## 1 · PRODUCT — carry forward

| artifact | lines | note |
|---|---|---|
| `app/house/page.tsx` | 55 | renders canonical `MaiaHouseSheet` from `HOUSE_DESTINATIONS`. **No Desktop taxonomy**, no second MAIA on the page, and closing routes to `/maia` which `navigationDecision` reads as `return-to-maia` — one gesture, honest on web and Desktop, no Desktop-only branch. |
| `scripts/generate-desktop-house-allowlist.ts` | 90 | Desktop's path allow-list is **generated** from the same registry the House renders from |
| `maia-desktop/src/house-allowlist.json` | 124 | the generated artifact |
| `desktopHouseAllowlistDrift.test.ts` | 79 | proves House and Desktop permissions cannot drift apart |
| `DESTINATIONS` · `buildMenu` · `goTo` · `showPlace` (main.js) | ~120 | navigation and application menu |
| `dh01-house-threshold.test.mjs` | 342 | threshold behaviour |

The generated-allowlist idea is the strongest thing on the branch. It makes "what the House shows"
and "what Desktop permits" the same fact rather than two facts kept in sync by attention.

## 2 · HOST-SPECIFIC BUT STILL VALID — carry forward

```text
shell-policy.js   385   PURE POLICY — resolvePlatformOrigin · navigationDecision ·
                        isHousePath · platformPermission · isMaiaSurface.
                        Decision functions over inputs. Zero Electron.
                        This is capture-liveness.js's shape, independently arrived at.

shell.js          355   HOST ADAPTER — the two-authority-domain window. Every Electron
                        surface arrives as a parameter.

ds01-shell-containment   723   falsification suite driving the real logic with fakes
ds02-ua-marker            62
preload.js +7 · renderer.js +30 · index.html +17
```

**BrowserView adjudication (the founder's open question): KEEP.** Tested against the portability
invariant rather than kept by default. It holds structurally:

```text
BrowserWindow
├── webContents      file://index.html · preload.js · window.maia · mic granted
└── platform view    https://soullab.life · NO preload key · partition 'maia-platform'
                     sandboxed · every permission refused
```

The MAIA renderer never navigates away from `file://`; the platform view is built from a frozen
`webPreferences` with no `preload`. There is no code path that puts remote content in front of the
bridge. And navigation is driven from the application menu in main — deliberately **no new preload
channel**, because a `showPlatform()` verb would let a compromised renderer summon remote content
into its own window. That reasoning is the preload doctrine, applied correctly.

## 3 · OLD SUBSTRATE — superseded, do NOT port

```text
stopCaptureByMemberGesture()   byte-for-byte the pre-DSC voice-stop body.
                               Now voice-lifecycle.end(). Discard.
runTurn · joinMemberThread · pollCanonicalThread · startCaptureWatchdog · threadWatch
                               all now owned by turn.js / continuity.js / capture-watch.js
```

Porting any of these would reintroduce MAIA semantics into Electron — the exact thing DSC closed.

## 4 · COLLIDES — adjudicate, do not port

**4.1 `releaseCapture(cause)` — genuinely new, implementation obsolete.** DSC has **no**
auth-teardown capture release path: capture surviving its member is a real defect this branch fixed
and the DSC substrate does not cover. Its *reasoning* survives DSC intact — null the session first
so the turn guard refuses, deliberately do **not** clear the in-flight flag because the turn's
`finally` owns it, emit `voice_capture_lost` with `source:'auth_teardown'`. Its *implementation* is
pre-DSC throughout (`stopCaptureWatchdog`, direct `voice = null`, `voice.liveness`).
→ Belongs as a **new verb in `voice-lifecycle.js`** using `watch.stop()` and `revokeSession()`.
Carry the reasoning and the tests (`dr01-capture-release`, 271 lines); rewrite the body.

**4.2 `deliverToMaia(said, stillValid)` — a real semantic conflict, not a merge.** It duplicates
turn.js's `heard → thinking → ask → answered → audio/no-voice` sequence for a typed turn, and
carries one rule turn.js does not: a `stillValid()` guard that returns **silently** when the member
signs out mid-answer. turn.js re-resolves `conversation()` after the await, throws, and **surfaces
an error**. Two different answers to the same question.
→ A ruling is required before either is ported. Note the branch's own principle is worth keeping:
*"a typed turn still gets her voice — the modality is how the member spoke, not how MAIA answers."*
Tests: `dt01-text-modality` (233).

**4.3 `teardownMemberState(reason)` — split it.** The cause-reporting (DESKTOP-AUTH-CAUSE-01) is new
product value and should survive: a member watching MAIA vanish had nothing to read, and the 401
door is not only startup — every continuity poll is an `authedFetch`, so a rejected credential can
take the surface down minutes into a walk. The orchestration around it is now `continuity.stop()`
plus 4.1's verb.

**4.4 `session.js` +218 — needs an ownership ruling.** New: `mintWebSession`, `normalizeMember`,
`projection`, `memberRecord`, `safeRoles`, `safeTier`. Identity carry into the platform view is host
work; **role and tier normalisation may be MAIA semantics** and must not silently become Electron's.
Tests: `di01-identity-carry` (258). Unruled — this is the one place the census cannot decide from
the diff alone.

## 5 · NOT DESKTOP AT ALL — decouple entirely

Five of the fifteen commits touch **no Desktop substrate**:

```text
6c1adf65f  DESKTOP-SOVEREIGN-STT-01          lib/utils/platformDetection.ts (+ one desktop test)
40d638aeb  VOICE-TRANSCRIBE-RESPONSE-SHAPE   lib/voice/transcribeResponse.ts
92ae07e5d  VOICE-STREAM-PROVIDER-CONVERGENCE lib/ai/oracleStreaming.ts · app/api/voice/…
79cee2766  VOICE-STREAM-PROVIDER-PROVENANCE  lib/ai/oracleStreaming.ts · ClaudeService.ts
11bd40e3f  DESKTOP-SOVEREIGN-STT-LIFECYCLE   lib/voice/androidVoiceFallback.ts
```

These are web-platform voice/provider commits with ~380 lines of their own tests. **Zero collision
with DSC.** They can be carried on their own lane, cheaply, independent of any House decision.

---

## 6 · What "reconcile" actually means

```text
CARRY AS-IS      House route · allowlist generator + drift proof · navigation/menu ·
                 shell.js · shell-policy.js · ds01/ds02/dh01 · preload/renderer/index deltas
DISCARD          stopCaptureByMemberGesture and the pre-DSC main.js orchestration
REWRITE ONTO DSC releaseCapture → a voice-lifecycle verb (keep dr01's reasoning + tests)
                 teardownMemberState → continuity.stop() + that verb + keep the cause reporting
RULE FIRST       deliverToMaia's silent-vs-surfaced disposition (dt01)
                 session.js role/tier normalisation ownership (di01)
DECOUPLE         the five web-platform voice/provider commits — separate lane
```

Two items need a founder ruling before implementation; everything else is classified. No commit
should be replayed wholesale — the 15 are not equally authoritative, which is precisely what
choosing the census over "reconcile onto DSC" was for.
