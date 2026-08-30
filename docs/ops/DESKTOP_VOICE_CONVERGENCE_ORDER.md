# Desktop / voice convergence order

**Date:** 2026-08-30 · **Status:** operational rule, in force until the STT lineage lands
**Authoritative STT content:** `1c2c59af9` · **FROZEN pending DEVICE**

---

## AUTHORITATIVE STT CONTENT — `1c2c59af9`

Contains, through the STT lane head (`419ef230b`):

```text
Desktop classification              isDesktopShell · maia-desktop UA marker
sovereign-whisper routing           selectVoiceTransport, Desktop never web-speech
response-shape correction           reads `transcription`, not `text`
sovereign capture lifecycle         generation-token revocation
provisional hearing                 "hearing · not sent yet", display-only
Desktop turns end on SILENCE        DESKTOP_MAX_UTTERANCE_MS, not Android's 8 s
```

## THE RULE

Any branch touching:

```text
components/voice/ContinuousConversation.tsx
components/voice/VoiceInteractionBar.tsx
lib/voice/androidVoiceFallback.ts
lib/voice/rollingPartialTranscription.ts
lib/voice/desktopUtteranceLimits.ts
lib/voice/transcribeResponse.ts
lib/voice/voiceDiagnostics.ts
lib/utils/platformDetection.ts
```

**MUST converge FROM `1c2c59af9` or a descendant**, and **must not resolve conflicts by
wholesale choosing the older branch copy.**

⚠️ **Expect conflicts that are not disagreements.** `1c2c59af9` carried these files by CONTENT,
not by cherry-picking commits, so git sees the same change as two unrelated histories. A merge with
any STT-lane branch will conflict on all eight files even where the content is byte-identical. The
temptation will be to take one side wholesale. That is precisely how a witnessed fix gets silently
reverted.

## MERGE ORDER

```text
1. STT lineage first.
2. Consent/TTS lanes rebase or reconcile ONTO the STT lineage.
3. Preserve their consent/TTS deltas only.
4. Re-run the STT proofs after reconciliation.
```

## THE MECHANICAL GATE

Prose is not a gate. Run this on any convergence result **before committing it**:

```bash
scripts/voice-lineage-guard.sh
```

It fails if the convergence deleted `rollingPartialTranscription.ts` or
`desktopUtteranceLimits.ts`, removed the Desktop branch from `selectVoiceTransport`, restored the
`text ?? transcript` response reader, or gave the platform surface a preload. **Those are not
ordinary conflicts. They are evidence that an older voice lineage is overwriting the witnessed one.**

## DO NOT MERGE — `companion/01a-voice-wall`

```text
STATUS        SUPERSEDED — DO NOT MERGE
main.js       DISCARD
surfaces.js   HISTORICAL DESIGN EVIDENCE ONLY
preload       DISCARD
probe         not needed for the present topology
```

**Verified against `1c2c59af9`:** 2 commits ahead, **29 behind**. Its unique files are
`main.js`, `surfaces.js`, `preload-platform.js`, `platform-probe.{html,js}`.

Its `main.js` is pre-DSC and still owns every responsibility the DSC sequence extracted and proved
elsewhere — `turnBusy`, `captureWatchdog`, `startCaptureWatchdog`, `threadWatch`, `runTurn`, and the
salvage disposition inline in the composition root (`onSalvage: (text) => { draft.push(text); return
true; }`, the exact line DSC-FINAL moved to `voice/member-draft.js`).

⛔ **Its platform model is the inverse of the one we witnessed.** `surfaces.js:61-62` gives the
platform surface `preload: 'preload-platform.js'` and `capabilities: []` — no microphone, and a
bridge on remote content. Current Desktop deliberately runs canonical `/maia` inside the contained
view with a narrow audio-only gate on that exact surface, and its containment rests on remote
content having **no preload**. That branch predates the unification that made the full canonical
MAIA the one visible MAIA.

**The one idea worth keeping** — *capability belongs to a surface, not globally to Electron* — is
already implemented, better: `shell-policy.js` + the isolated `maia-platform` partition + a
`platformPermission` gate that grants audio only, main-frame only, origin-equal, and only while main
itself observes MAIA visible at `/maia`.

## Writer's Studio

No commits ahead of the STT lineage on any voice file. **No action.**

## Standing state

```text
STT                   1c2c59af9 · FROZEN · DEVICE pending
Consent/TTS           HOLD · must converge onto STT later
Companion voice wall  SUPERSEDED · DO NOT MERGE
Writer's Studio       no active collision
```

⛔ Convergence work does not start while `1c2c59af9` is frozen.
