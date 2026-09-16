# TURN-02 — Raw PCM Seam Census

**Date:** 2026-09-16
**State:** trace complete · web transport utility implemented · native mutation CLOSED

## Web / desktop

`ContinuousConversation` already owns a live `MediaStream` on web/desktop and creates an `AudioContext` / `MediaStreamAudioSourceNode` for capture diagnostics. Existing repository code also demonstrates Float32 -> PCM16 conversion. Therefore a TURN-02 observer can lawfully share the already-open web microphone stream; it does not need to request a second microphone.

The new `StreamingPcm16Resampler` converts arbitrary mono WebAudio sample rates (including 48 kHz and 44.1 kHz) into continuous 16 kHz PCM16 frames while preserving chunk-boundary timing.

No predictor is wired to the live web stream in this act because no approved weight is installed yet.

## Native iOS — current member-facing path

`ContinuousConversation` currently uses `@capacitor-community/speech-recognition`. Its source explicitly skips `getUserMedia()` on native iOS because opening a parallel web microphone path conflicts with native recognition and has caused crashes. TURN-02 must not bypass that boundary.

## Native iOS — sovereign path

The repository already contains the correct future seam:

`AudioSessionManager.createRecognitionRequest()` owns one `AVAudioEngine.inputNode.installTap(...)` and appends each `AVAudioPCMBuffer` to the speech recognition request. `VoiceController` consumes that same manager.

When the sovereign VoiceController/KERNEL path becomes the canonical member-facing capture authority, TURN-02 should observe **that same input tap** (fan-out/observer), never install a second tap and never open a second microphone.

## Cross-lane law

TURN-02 does not modify `AudioSessionManager.swift` or `VoiceController.swift` while KERNEL-00 / BRIDGE voice authority is still being qualified on its own programme branch. The PCM observer hook is a downstream integration act after native capture authority is reconciled.

This preserves both programmes:
- TURN-01/TURN-02 can improve member turn-taking now.
- KERNEL-00 remains the physical source of truth for native listen/render/recovery.

## Next

1. Finish model-neutral sidecar protocol qualification.
2. Benchmark an exact commercially admissible predictor asset in shadow.
3. Web may receive a raw-PCM shadow adapter once an approved model exists.
4. Native raw-PCM predictor attachment waits for the sovereign capture authority seam; no parallel-mic workaround is permitted.
