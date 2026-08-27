# MAIA-D00 — Desktop Canonical Reconciliation

**Date:** 2026-08-25 · **Mode:** read-only census · **Mutations to Desktop code:** none (this file only)
**Canonical binding (re-resolved at execution time, not reused from the brief):**
`origin/clean-main-no-secrets` = **`0c4638a`** · working branch `claude/maia-desktop-companion-roadmap-c4i9v5` = **`0c4638a`** (0 ahead / 0 behind; trunk is an ancestor).

**Rule applied:** never act from a conversational pointer when repository custody can establish the
referent. Every line below is witnessed by a named command, or explicitly marked UNWITNESSED.

---

## 0 · Evidence classes obtainable in this session

| Class | Obtainable here | Why |
|---|---|---|
| SOURCE | ✅ | full tracked tree at `0c4638a` |
| TEST | ✅ | node v22.22.2 present; all Desktop suites executed |
| RUNTIME | ⚠️ partial | no Electron binary installed; no production SSH |
| DEVICE | ❌ | **this session is a remote Linux x86_64 container.** No macOS, no `/Applications`, no `~/Library/Application Support` |
| EXPERIENCE | ❌ | no founder, no device |

⛔ **Every packaging / installed / running / founder-witnessed claim in this record is therefore
UNWITNESSED here and inherited from prior records only.** No packaged observation is promoted.

---

## 1 · ⛔ PREMISE CORRECTION — the brief's unit names are not repository referents

The directive names the prior lineage as `JCP-000` and `JD-000 … JD-010`.

```
git log --all --oneline --grep="JD-0"        →  0 commits
grep -rIl "JD-00…JD-010|JCP-000" (tree+docs) →  1 incidental match (app/caseload/page.tsx)
```

**No `JD-###` or `JCP-###` unit record exists in this repository's custody.**

The lineage that *does* exist is the **JARVIS Operator Programme, JOP-00 … JOP-04b**:

| Unit | Custody |
|---|---|
| PHASE 0 reconciliation | `docs/ops/JARVIS_OPERATOR_PHASE0_RECONCILIATION_2026-08-16.md` |
| JOP-00 desktop canonicalization | `docs/ops/JOP-00_DESKTOP_CANONICALIZATION_2026-08-16.md` |
| JOP-01 closure ledger | `docs/ops/JOP-01_CLOSURE_LEDGER_2026-08-16.md` |
| JOP-02 installed acceptance @ `6d3c0cbc4` | `docs/ops/JOP-02_INSTALLED_ACCEPTANCE_6d3c0cbc4_2026-08-16.md` |
| JOP-03 packaging/distribution mandate | `docs/governance/JOP-03_PACKAGING_DISTRIBUTION_WITNESS_MANDATE.md` — **ISSUED, not executed** |
| JOP-04 / JOP-04b | commits `a4c9ab3`, `9290f3d`, `83d7e04`, `0d91185`, `1634f8c` — **no closure record authored** |

⭐ **Recommended binding:** the MAIA Desktop programme continues as **MAIA-D##**, and cites
**JOP-##** as its ancestry. The `JD-###` names should be retired rather than back-filled — inventing
records to match a conversational list would manufacture custody.

---

## 2 · ⛔ THREE desktop trees are on trunk, not one

| Tree | Files | LOC | `appId` | Governed? |
|---|---:|---:|---|---|
| `jarvis-desktop/` | 27 | 3,834 (src) | `life.soullab.jarvis` | ✅ JOP-00…04b, 8 test suites |
| `desktop-app/` | 8 | 2 src files | `com.soullab.maia` | ❌ no unit record, no tests |
| `electron/` | 2 | 362 | *(inherits root `package.json`)* | ❌ no unit record, no tests |
| `components/desktop/DesktopDeepDive.tsx` | 1 | — | n/a | unrelated (web component) |

All three are tracked on `origin/clean-main-no-secrets` (27 / 8 / 2 files respectively).

### 2.1 ⚠️ The root manifest points at the *wrong* shell

```json
// package.json:9
"main": "electron/main.js",
"desktop:package": "electron-builder"
```

`electron/main.js` opens a window on `/maia/labtools` titled **"MAIA LabTools + IPP"**. So
`npm run desktop:package` at repo root packages the **LabTools tool window** — not MAIA, not JARVIS.
This is a live foot-gun for MAIA-D18 and should be resolved before any packaging unit opens.

### 2.2 `desktop-app/` is the only tree that ever aimed at MAIA — and its architecture is wrong for this programme

- `productName: "MAIA - Sacred Mirror"`, `appId: com.soullab.maia`
- `mac.identity: null` → **explicitly unsigned**
- `extraResources` copies `../.next` and `../public` **into the bundle**

That last line is the decisive finding: it ships *a copy of the application* rather than connecting a
client to the same server-side MAIA continuity. It is the architecture the North Star forbids
(§VII). Reuse of `desktop-app/` would import that assumption.

---

## 3 · `jarvis-desktop/` is sound — and is explicitly *not* MAIA

Its own manifest states the boundary the directive asks us to preserve:

> "JARVIS operational console — **a separate surface from MAIA Desktop**. Presentation over canonical
> Builder OS / router state. No business logic duplicated here."

Security posture, witnessed in `src/main.js` / `src/preload.js`:

| Property | Witness |
|---|---|
| `contextIsolation: true`, `nodeIntegration: false` | `main.js:260-261`, `363-364` |
| No remote content | `loadFile()` only (`main.js:264`, `367`) — **no `loadURL`** |
| Narrow preload bridge | 10 invoke channels + 1 push channel, each commented with its restriction |
| No renderer-named paths | `chooseRepo` runs the **native** dialog in main; `revealWorkspace` takes no argument |
| Lane pinned in main | `runWorkUnit` carries a packet only; the renderer cannot name a lane |
| Persistent config | `~/Library/Application Support/JARVIS/` (`main.js:426`) |
| Single-instance lock keyed on userData | `main.js:25-39` — the fix for the 2026-08-11 "won't launch" symptom |

⛔ **Zero audio surface.** `grep -riE "microphone|getUserMedia|audio|speech" jarvis-desktop/src/` →
**no matches.** There is no native voice substrate to reuse. MAIA-D01 starts from absence — and that
absence is now witnessed, not assumed.

---

## 4 · Proof results — 10 suites run, 10 executed, none modified

### 4.1 Desktop suites — **all green**

```
test/c1-evidence-containment.test.mjs      pass  1 / fail 0
test/jop-00-negative-controls.test.mjs     pass 14 / fail 0
test/jop-01-legibility.test.mjs            pass 39 / fail 0
test/jop-02-spiral-projection.test.mjs     pass 39 / fail 0
test/jop-04-dev-resolution.test.mjs        pass  6 / fail 0
test/jop-04-status-vocabulary.test.mjs     pass  5 / fail 0
test/jop-04b-node-resolution.test.mjs      pass  7 / fail 0
test/wire-local-native.test.mjs            pass  6 / fail 0
```

### 4.2 Builder-side Desktop proofs — **4 standing failures, inherited**

```
scripts/builder/__tests__/desktop-c0-explorer-proof.mjs   51 passed, 1 failed
scripts/builder/__tests__/jarvis-alpha-floor-proof.mjs    87 passed, 3 failed
```

| Failing assertion | Reading |
|---|---|
| `preload exposes exactly the nine reviewed channels` (**both** suites) | Surface is now **TEN**: `capabilities · choose-repo · clear-repo · governance-action · mechanism-status · repo-config · **reveal-workspace** · run-work-unit · status · submit-task`. JOP-04 added `reveal-workspace` and did not re-review the guard. |
| `governance path runs GOV-composed argv, never a hand-built command` | uninvestigated — outside D00 scope |
| `every resolver return declares conflictingConfigRoot :: 6 resolver literal(s)` | uninvestigated — outside D00 scope |

⭐ **This is the *second generation* of the same finding.** JOP-00 §4.1 recorded the identical guard
failing at seven-vs-nine when Alpha Floor added `mechanism-status` and `run-work-unit`. The guard is
an intentionally **exact** list precisely so a widened IPC surface cannot pass silently — it is
working as designed, twice. But a guard that is red across two generations has stopped being a gate
and become wallpaper.

⛔ **Standing recommendation, not authorized here:** a bounded repair unit that re-reviews the tenth
channel and re-baselines the guard to ten. Leaving it red normalizes red.

---

## 5 · MAIA-side substrate the Desktop programme will consume

### 5.1 ✅ The identity invariant (§VI) is **already satisfied server-side**

`lib/auth/getMemberFromRequest.ts` resolves identity **only** from an `auth_sessions`-backed
credential, in this order:

```
1. maia_session cookie          (web)
2. x-session-token header       (Safari/iOS — cookies blocked by ITP)
```

`x-member-id` and `maia_member_id` are treated as **unverified claims**: honored only when they match
the session-resolved member, and a mismatch **returns null** as a possible impersonation attempt.

The live MAIA route enforces the same (`app/api/sovereign/app/maia/list/route.ts:304-319`) — a body
`userId` is never trusted, only recorded as `matches-session` / `ignored`.

⭐ **Consequence for MAIA-D03:** the native credential contract the brief asks for **already exists**.
`POST /api/members/signin` returns `{ token: session.sessionToken }` explicitly for header auth
(`route.ts:166-168`). Desktop should carry that token as `x-session-token`. **No new auth transport
needs to be designed** — D03 is a wiring-and-proof unit, not an architecture unit.

### 5.2 ⚠️ `/api/between/chat` — the escape hatch is closed, the fallback is not a refusal

`MAIA_TRUST_BODY_ID_IN_PROD` was removed; body-ID trust now requires
`MAIA_DEV_TRUST_BODY_ID === '1' && !IS_PROD` (`route.ts:905-906`). Production cannot be spoofed.

But an unauthenticated production request does not fail — it degrades to `anon:${safeSessionId}`
(`route.ts:943-945`). That is safe for identity and **wrong for Desktop**: a Desktop client whose
token silently expired would keep conversing as a fresh anonymous stranger rather than surfacing the
loss. **MAIA-D03/D04 must define whether Desktop accepts anonymous degradation or refuses.** Named
here; not decided here.

### 5.3 Voice — 29 files carry a Web Speech dependency

```
grep -rIl "webkitSpeechRecognition|SpeechRecognition" (ts/tsx/js)  →  29 files
```
including `lib/hooks/useVoiceInput.ts`, `lib/voice/webSpeechLifecycle.ts`,
`lib/voice/OptimizedVoiceRecognition.ts`, `components/voice/ContinuousConversation.tsx`.

⭐ **An active voice programme is running right now and is direct D01/D02 ancestry** — the last four
merges on trunk are exactly this work:

```
0c4638a  Merge #1100  voice/unit2-utterance-tail-witness
c322038  V5 witness on the continuous path — same vocabulary, no repair
1c55b2d  Merge #1098  voice/unit1-fallback-and-playback-witness
5d43fdb  V5 utterance-tail witness — instrumentation only, no repair
c2c03a9  playback witness — telemetry only, no behavior change
76e311b  eliminate silent capture death and stop losing spoken turns
```

These units **instrument the browser path** for exactly the defect class §XII names ("no epoch may end
with uncommitted human speech"). They are witness, not repair, and they are not native.

⛔ **D01 must not invent a parallel vocabulary.** The V5 tail-witness vocabulary and the
`VoiceDiagEvent` union already exist on trunk; the native path should emit into the *same* vocabulary
so browser and native results are comparable. Otherwise the programme produces two incomparable
truths about the same failure.

### 5.4 Transcription / playback substrate that already exists

| Need | Existing | Note |
|---|---|---|
| Transcription | `maia-whisper` container; `WHISPER_LOCAL_URL=http://whisper:8000`; `app/api/voice/transcribe`, `/transcribe-simple` | server-side, already self-hosted |
| Chunked live upload | `docker-compose.production.yml:142` — *"Session Room: enable chunked audio upload for live transcription"* | D10 has a substrate |
| TTS | `app/api/voice/local-tts`, `app/api/voice/openai-tts` | ⚠️ `openai-tts` conflicts with the sovereignty rule "never use OpenAI"; disposition unresolved, flagged not decided |
| Session Room | `app/api/v1/capture/session/{start,stop}`, `app/api/studio/with-me/sessions/[sessionId]/{events,synthesize}` | D10–D12 has a substrate |
| Voice containment canon | `docs/design/contracts/conversation-room-voice-capture.md` | transcript must not reach log sinks — binds D01 telemetry (§XIV) |

---

## 6 · Capability matrix

Legend — SOURCE: code on trunk · PACKAGED: in a built artifact · LIVE: reachable at runtime ·
PROVEN: witnessed on the rung the claim requires.
`n/a` = not applicable to any current tree. `?` = UNWITNESSED in this session (see §0).

| Capability | SOURCE | PACKAGED | LIVE | PROVEN |
|---|---|---|---|---|
| Electron shell (JARVIS) | ✅ `jarvis-desktop/` | ? (JOP-02: `6d3c0cbc4`) | ? | ? JOP-02 installed walk |
| Electron shell (MAIA) | ⚠️ `desktop-app/` skeleton only | ❌ | ❌ | ❌ |
| Secure IPC / context isolation | ✅ | ? | ? | ⚠️ guard **RED** — 10 channels vs 9 |
| Runtime discovery (repo/node) | ✅ JOP-04/04b | ? | ? | ✅ TEST 18/18 |
| Persistent configuration | ✅ `Application Support/JARVIS/` | ? | ? | ? |
| Conversation renderer | ❌ none in any desktop tree | ❌ | ❌ | ❌ |
| MAIA route access from Desktop | ❌ no HTTP client, no `loadURL` | ❌ | ❌ | ❌ |
| Authentication (member) | ✅ server-side complete (§5.1) | n/a | ✅ web/iOS | ✅ web/iOS · ❌ Desktop |
| Native mic capture | ❌ **zero audio code** | ❌ | ❌ | ❌ |
| Native audio playback | ❌ | ❌ | ❌ | ❌ |
| Transcription | ✅ server (whisper) | n/a | ✅ | ✅ web |
| TTS playback | ✅ server routes | n/a | ✅ | ✅ web |
| Realm access | ❌ from Desktop | ❌ | ✅ web | ❌ Desktop |
| Conversation resume (cross-surface) | ❌ unbuilt anywhere | ❌ | ❌ | ❌ |
| Signing / notarization | ⚠️ JARVIS: Apple Development identity pinned · MAIA: `identity: null` | ? | ? | ❌ JOP-03 **owed** |
| Updates | ❌ no updater in any tree | ❌ | ❌ | ❌ |
| Crash recovery | ❌ | ❌ | ❌ | ❌ |

---

## 7 · Ruling on §IX's conditional — *"if D00 proves the current Desktop substrate reusable"*

**Split verdict. Reuse the shell; do not reuse the app.**

1. ✅ **`jarvis-desktop/` is reusable as a security and governance *pattern*** — narrow preload, no
   remote content, main-owned validation, native-dialog-only path entry, provenance stamping,
   Application Support persistence. MAIA Desktop should inherit this posture verbatim.
2. ⛔ **`jarvis-desktop/` must NOT become MAIA Desktop.** Its own manifest declares the separation,
   and §II / §XVIII forbid merging the personas. MAIA Desktop is a **sibling** surface.
3. ⛔ **`desktop-app/` is not a reusable base.** Bundling `../.next` builds the wrong architecture
   (§2.2). Two files, unsigned, untested, no unit record.
4. ⛔ **`electron/` is a LabTools tool window**, wrongly occupying the root `package.json` `main`.
5. ⭐ **Therefore MAIA-D01 does not begin on any existing tree.** It begins by deciding where the
   MAIA Desktop tree lives — and that is a founder ruling, not a Claude inference (§8).

This is not "restart greenfield" (§XVIII). The reusable substrate is the *governed shell pattern* plus
the *entire server-side MAIA/AIN stack*, which is exactly what §XVIII protects. What does not exist —
and is now witnessed as not existing rather than assumed — is any native audio lifecycle.

---

## 8 · Decisions owed before MAIA-D01 opens

| # | Decision | Why Claude may not make it |
|---|---|---|
| 1 | Where MAIA Desktop lives — new `maia-desktop/`, or promote `desktop-app/` by gutting it | creates the programme's root referent |
| 2 | Disposition of `desktop-app/` and `electron/` — retire, or keep | deleting tracked trunk trees is destructive |
| 3 | Whether root `package.json` `main` / `desktop:*` scripts are repointed or removed (§2.1) | changes what `electron-builder` packages at root |
| 4 | Whether the preload-guard repair unit (§4.2) opens before or after D01 | red-guard tolerance is a governance call |
| 5 | Desktop's behavior on expired token — refuse, or degrade to anonymous (§5.2) | a sovereignty question, not a technical one |
| 6 | `openai-tts` disposition under the "never use OpenAI" rule (§5.4) | canon conflict, founder's to resolve |

---

## 9 · Known limitations of this record

- **No DEVICE evidence.** Everything about `/Applications/JARVIS.app`, packaging, notarization and
  installed behavior is inherited from JOP-01/02/03 and marked `?`. This container cannot witness it.
- **No production runtime evidence.** No SSH to minisforum; no live log or DB observation.
- **Two `jarvis-alpha-floor-proof` failures were not investigated** (governance argv, resolver
  `conflictingConfigRoot`) — outside D00's bound. Named, not diagnosed.
- **The 29-file Web Speech census is lexical.** It counts files naming the API; it does not establish
  which are live paths. Per JARVIS Core §B, that is evidence about the search.
- `c1-evidence-containment.test.mjs` reports `pass 1` under `node --test` where JOP-00 recorded 17;
  this is a top-level-test counting difference, not a regression. **0 failures either way.**
