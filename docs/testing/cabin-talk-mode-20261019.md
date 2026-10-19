# Cabin 0.6.0 optional Talk mode

Founder direction: reduce the Record/Stop/Review/Send/Listen sequence and let ordinary conversation remain ordinary (2026-10-19 14:32 America/New_York).

An unchecked-by-default, window-local Talk with MAIA control explicitly authorizes sending after the member stops a recording and reading completed replies aloud. It is not stored as a durable preference. Recording still starts only through Record message. Cancel recording releases capture without transcription or sending. Turning Talk mode off during capture returns the resulting transcript to review. Automatic recording timeout does not authorize sending. The microphone never restarts automatically after a reply. Manual Send in Talk mode also reads the resulting reply.

The same session-bound transcription, canonical saved-or-Sanctuary chat path, request cancellation and authoritative speech route remain in use. Speech can be stopped during preparation and playback. Browser playback refusal retains the existing explicit Listen retry. No background executor or additional context source is connected.

The local conversation prompt now directs MAIA to receive everyday news without defaulting to grounding, breathing exercises or a self-improvement task. This is prompt guidance, not a guarantee about every model response.

Packaged tests use isolated fictional data, a synthetic speech stream, real offline Whisper/Qwen/Kokoro and muted playback, with an autoplay test flag. The Talk test verifies default-off, cancelled capture, mode withdrawal returning to review, automatic sending/reply playback and released microphone tracks. Review mode and writing regressions are separate. Normal physical automatic playback remains to be checked by the founder.

Founder acceptance of the prior installed 0.5.3: reported hearing MAIA, recorded speech transcribed into a reviewable draft, and sent it successfully; screenshot 2026-10-19 at 2.31.49 PM shows the resulting reply and Undo-restored writing at version 5. This is attended founder-reported physical voice evidence, distinct from the new synthetic Talk test. Full MAIA orchestration and unattended Jarvis execution remain unfinished.
