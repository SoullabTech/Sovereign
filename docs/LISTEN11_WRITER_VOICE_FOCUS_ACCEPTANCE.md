# LISTEN-11 — Writer speech / music-focus compatibility (source-owner proposal only)

**Date:** October 24, 2026  
**Disposition:** **DISPOSABLE WRITER COMPONENT ACCEPTANCE PASS / PROTECTED WRITER SOURCE AND PRODUCTION HOLD**

## Problem found in actual Writer source

The canonical Writer `MaiaListen.tsx` (`app/writers-studio/insight/MaiaListen.tsx`, blob SHA `aa019eeb1104573715d30450f8a19fe0a08fada7`, **SHA256 `0c0e69c6932c8b089a57f3fbb68b499b39fe2b3ae8051842cb2f8ba7a41b2b88`**) already uses `ws-stop-maia-reading` to interrupt other speech when starting Writer TTS.

However, `app/writers-studio/rebuild/RebuildStudioClient.tsx` ALSO sends that **same event** when the editorial focus/section changes or the workspace closes. Consequently, **a generic listener that pauses music on every `ws-stop-maia-reading` would be incorrect**: simple editing could interrupt the member's soundtrack.

The original Writer speech component does **not** dispatch the new `soullab:audio-focus-request` event yet, and the LISTEN-10 player listens only to that explicit request. This creates an observable audio-overlap gap when the real Writer speech button is clicked.

## Source-pinned, two-line-minimal owner proposal

Do **not** modify existing `ws-stop-maia-reading` meaning, remove Writer stop/cancel, patch protected Writer directly, or duplicate Writer speech playback.

The narrow option for the **existing Writer source owner**, only after source custody and integration approval:

```diff
 'use client';
 import { useCallback, useEffect, useRef, useState } from 'react';
 import { apiFetch } from '@/lib/http/apiBase';
+import { requestAudioFocus } from '@/lib/listening/audioFocus';

 // inside MaiaListen.listen(), after the active/nonempty guard:
   if (!active || !text.trim()) return;
+  requestAudioFocus('writers-listen');
   window.dispatchEvent(new Event(STOP_EVENT));
```

The review-only [exact unified diff](review/LISTEN11_WRITER_AUDIO_FOCUS_SOURCE_OWNER.patch) is offered for reconciliation; the protected source was **not** changed. The helper is present only in the Listening Room review branch, not independently admitted into production.

The expected interaction is **directional**:

1. Member starts Writer narration → Writer sends *explicit* `writers-listen` focus event, which asks the persistent music player to pause and suspend the sound context. Existing STOP_EVENT continues preventing duplicate Writer TTS.
2. Member explicitly resumes music → persistent player sends `listening-room` focus event and the **existing** Writer STOP_EVENT, stopping real Writer speech. No automatic resumption after voice cancellation.
3. Ordinary Writer section changes / panel close still dispatch STOP_EVENT, but do **not** pause the music transport. Do not listen to generic STOP_EVENT inside the player.
4. These events are **not** security, authentication, voice-consent or copyright authorization.

## Physical acceptance with the original Writer component

Environment: isolated `LISTEN10-PERSISTENT-PLAYER-REVIEW-20261024` Next.js **16.3.8**, fake House and Writer pages; actual canonical `MaiaListen.tsx` from protected `clean-main-no-secrets`, with test-only `apiFetch` responding ONLY to the existing TTS path with a **locally synthesized, low-volume 9-second WAV**. No real OpenAI API calls, provider streaming, copyrighted recordings, member accounts or private manuscripts. The strict proxy and auth session shape were the previously tested **fictional, non-merged** corrections.

**Baseline (actual unmodified Writer TTS): 14/14 observation checks PASS** (7 each in Chrome and WebKit). The test **confirmed an undesirable overlap**: the actual Writer TTS WAV played while persistent synthesized music was still playing. A passing baseline witness here **means the defect was reproduced**; it is not a good product result.

**Candidate (original Writer source + only the import and call above, in a disposable copy): 20/20 PASS** (10 each in Chrome and WebKit). Checks include:
- The actual Writer Listen button enters narration and an in-browser fake TTS file plays.
- The music transport pauses on Writer's explicit focus request.
- Explicit member Resume starts music again and the actual Writer audio source stops (the existing speech cancellation still works).
- A subsequent **plain** `ws-stop-maia-reading` event, simulating an editorial change/close, **does not pause music**.
- Zero remote/nonlocal requests, zero unhandled JavaScript errors in the inspected test context.

Candidate-only Writer file SHA256 **`32bccac4d8ae14936f282151cd0273b92d1a5c9aba7e6e960a3a2c28f0269757`**. The canonical protected file SHA256 remained **`0c0e69c6932c8b089a57f3fbb68b499b39fe2b3ae8051842cb2f8ba7a41b2b88`**.

**Regression on the combined disposable shell:** original cross-room Chrome and WebKit **22/22 + 22/22 PASS**, rights/playlist/backup **35/35 PASS**, isolated auth page **4/4 PASS**, source integrity **25/25 PASS**, full isolated `tsc --noEmit` **0 errors**.

The [review branch test script](../tests/listening/listen11_writer_voice_focus_browser_witness.cjs) is reproducible with `LISTEN11_MODE=baseline` or `candidate`, supplied only in a fictional local Next/PG environment with a test-only TTS stub. Both modes must be compared: the baseline is a **negative** UX witness, not release acceptance.

## Specific next owner acceptance gates

- **Writer source owner** compares this proposal against the exact current **Writer-controlled source**, which may be ahead of the protected base snapshot; do not assume this one component path or old SHA is the approved Writer beta build. Reconcile differences, retain STOP_EVENT cancellation and speech chunking, and independently check Writer Read/Review/development workflows. No parallel Writer implementation.
- **Global shell owner** approves where one `PersistentListeningProvider` may mount under a genuinely authenticated member scope and how real session/member changes revoke it. The current `reviewMemberKey` is test-only and **cannot** authorize a member.
- **MAIA voice / Sound Sanctuary** require their own explicit focus adapters; do not install a global, generic STOP_EVENT music listener as a shortcut.
- **Audio service** must support real member expectations (background mobile, lockscreen, verified FLAC and source quality, licensed long-form masters). The synthetic test file is not a release recording.
- **Independent Class A shared authentication, exact route, private member persistence/recovery and recording-rights custody** remain separate release holds, including the source owner record [#1877](https://github.com/SoullabTech/Sovereign/issues/1877).

**Disposition:** real Writer component focus compatibility is proven in a disposable test with one tiny typed-call proposal. **No protected Writer source, actual app layout, member data or production release was changed.** See [LISTEN-01](https://github.com/SoullabTech/Sovereign/issues/1979) and [Writer release ledger #1938](https://github.com/SoullabTech/Sovereign/issues/1938).
