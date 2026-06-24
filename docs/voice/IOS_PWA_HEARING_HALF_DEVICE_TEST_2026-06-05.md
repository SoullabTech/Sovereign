# iOS Safari PWA — "hearing half" device test (two-axis)

**Status of the fix being tested:** *deployed runtime candidate with regression guard, not yet behavior-verified.*
The pure-helper regression test (`lib/voice/__tests__/transcriptAccumulator.test.ts`) proves the **logic
contract only** — that a continuation restart preserves the accumulated transcript across `onend → onstart`.
It does **not** prove Safari's real event timing, audio lifecycle, or PWA behavior. This device test is the
receipt that flips the label. Until it passes on a real iPhone, the fix stays a candidate.

Bug + fix detail: memory `project_ios_safari_onstart_wipes_transcript`. Output coupling:
`project_voice_turn_completion_ownership`.

---

## Test the right artifact (skip a row → false signal)

The classic compound false negative is **stale service worker + no overlay + tester uncertainty →
"fix failed" when the wrong build was tested.** Confirm all of these *before* scoring anything:

- ✅ **iOS Safari PWA** (added-to-home-screen). The only platform that carries this bug.
- ❌ **Not the native / TestFlight app.** The native build runs the Capacitor SpeechRecognition path, which
  this fix does **not** touch — testing it exercises unrelated code. This is the *worst* wrong-artifact: it
  can neither reproduce the bug nor validate the fix.
- ❌ **Not desktop Safari/Chrome.** They honor `recognition.continuous`, never fire `onend` mid-utterance,
  so the bug can't reproduce — a "pass" there proves nothing.
- ♻️ **Confirm the app is freshly updated.** A stale service worker runs the old bundle → false failure.
  Close the PWA; if unsure, remove and re-add to home screen so the new bundle loads.

---

## Score two separate axes — do not collapse them

A mixed result (one axis passes, one fails) is **two findings, not one verdict.** Record each axis on its own
line so a capture failure never gets charged to the output path, or vice-versa.

| Axis | Passing receipt | Primary observable (on-screen, no tooling) | Failure points to |
|------|-----------------|--------------------------------------------|-------------------|
| **Input capture** | Transcript contains the **whole** multi-clause thought | The user's message bubble (and the live interim text while speaking) shows every clause — not just the clause after the last pause | `components/voice/ContinuousConversation.tsx` / Safari SpeechRecognition lifecycle |
| **Output completion** | MAIA responds **exactly once**, fully, no stall or double-send | One MAIA bubble, audio plays to the end, no "stuck thinking", no duplicate/echo turn | `lib/voice/StreamingAudioQueue.ts` / turn-completion ownership |

---

## Procedure

1. **Deploy must have landed** on minisforum (this fix is on branch `chore/marketing-claim-architecture`
   / wherever it merges; verify the container is fresh — see CLAUDE.md "Verify after deploy").
2. On the **iPhone, in the Safari PWA** (added-to-home-screen, not a desktop browser): **hard refresh /
   force the service worker to update** — close the PWA, and if needed remove & re-add to home screen so the
   new bundle loads. (A stale service worker will run the old code and produce a false failure.)
3. Tap the mic. Speak **one multi-clause thought in a single breath-run with a deliberate mid-sentence pause
   of ~1–2s**, e.g. *"I've been feeling anxious about my job… ⟨1–2s pause⟩ …and also about my relationship."*
   The pause is the whole point: it makes iOS Safari fire `onend` mid-utterance, exercising the
   continuation-restart path (iOS fires `onend` at sub-second phrase boundaries — you do not need a long gap).
   **Keep the pause short — ≤ ~3.5s.** The app only auto-submits after a *longer* silence
   (`adaptiveSilenceThreshold` 5s, VAD loop `ContinuousConversation.tsx:287`; `silenceThreshold` default 12s,
   line 170), so ~1–2s sits well under the submit floor while still tripping iOS's per-phrase `onend`. A pause
   > ~5s risks the app submitting the **first half alone** — that's a **mis-run, not a fix failure**; re-run it.
4. **Score Axis 1 (input):** does the captured transcript contain the entire thought, both halves?
5. **Score Axis 2 (output):** does MAIA give exactly one complete response to the full turn?

---

## Where to look (observability is asymmetric on PWA)

⚠️ **The in-app `VoiceDebugOverlay` does NOT render on the PWA.** It is gated `if (!isCapacitorNative()) return`
(`components/voice/VoiceDebugOverlay.tsx:48`) — it only appears in the native Capacitor build. On the Safari
PWA there is **no on-screen instrument panel**. Score both axes by visible behavior (table above).

**Confirmatory markers (optional, requires tethered Safari Web Inspector: iPhone → Mac via cable → Safari ▸
Develop ▸ [device] ▸ console).** These explain *why* an axis failed; they are `console.log` only on PWA:

- **Input axis:**
  - `🔗 [onstart] Continuation restart — preserving accumulated transcript: <text>` — the buffer being
    carried across a restart. Seeing this with the first half in `<text>` is the mechanism firing correctly.
  - `✅ [onend] Recognition restarted (continuation — transcript preserved)`
  - If instead you see the transcript reset to empty at each phrase, the continuation flag isn't engaging.
- **Output axis:** watchdog / finalize-stall traces from `StreamingAudioQueue` (see
  `project_voice_turn_completion_ownership`). A `⚠️ finalize stall` near the end of a turn implicates the
  output path even if Axis 1 captured cleanly.

---

## Scoring (observed outcome → verdict)

Score by what you observe, then route it. Only the first row earns the label; the last row earns nothing
(re-run it).

| Observed outcome | Verdict | Routes to |
|------------------|---------|-----------|
| Both halves captured **+** exactly one complete reply | ✅ **behavior-verified on iOS PWA** | label flips; Action 2 may ship with the bundle |
| Only the **second half** captured | ❌ input fix failed (if bundle confirmed fresh) **or** stale bundle | `ContinuousConversation` / Safari SR — first re-confirm freshness |
| Both halves captured **but** doubled / stalled reply | ❌ output path | `StreamingAudioQueue` / turn-completion (`project_voice_turn_completion_ownership`) |
| **First half submits as its own turn** | ⚠️ **invalid run** — pause too long | not a fix failure; re-run with a ~1–2s pause |

---

## Result (fill in)

```
Date / device / iOS version:
Build / commit verified live:
Service worker confirmed updated (hard refresh done): yes / no

Axis 1 — Input capture:    PASS / FAIL
  Spoken:
  Captured transcript:

Axis 2 — Output completion: PASS / FAIL
  Response count / behavior:

Web Inspector markers seen (if tethered):

Verdict (per axis — do not merge):
```

Both axes PASS on a real iPhone PWA with a confirmed-fresh service worker → the fix graduates from
*deployed runtime candidate* to *behavior-verified*. Anything less stays a candidate, and a per-axis failure
routes to the file named in the table — not to "voice is broken."
