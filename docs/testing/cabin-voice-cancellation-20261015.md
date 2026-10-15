# Cabin 0.4.1 voice cancellation

Stop listening is available while local speech prepares. It aborts the browser request and prevents a late response from starting playback; this does not promise immediate cancellation of computation inside the local speech engine. Existing playback can still be stopped.

The packaged candidate passed scripts/cabin-voice-window-test.mjs with isolated fictional data: pending transport cancellation, real offline Whisper transcription, explicit review/send, local MAIA reply, real Kokoro playback, Stop, old-session rejection and unauthenticated rejection. Audio output was muted; microphone input was synthetic and autoplay permission was supplied for the test. Physical audio and normal autoplay acceptance remain open.

The runtime and persistent workspace storage are unchanged. Full MAIA orchestration, Sanctuary and autonomous background JARVIS execution remain unfinished.
