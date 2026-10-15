# Cabin 0.5.1 response controls

Stop response cancels only the active inference matching the authenticated current session and random request ID. The runtime aborts its Ollama HTTP request, checks cancellation before committing content, and releases the busy state in finally. No partial exchange is saved or added to temporary Sanctuary history. This establishes cancellation of the Cabin request, not a hard real-time guarantee about engine scheduling.

The browser waits for the runtime outcome rather than merely dropping its response connection. Stopping preserves the current draft; successful completion clears the sent text only if it has not been replaced with a new draft. An already completed exchange remains complete if Stop arrives afterward.

The packaged fictional-data test passed with real local inference: cancellation in ordinary and Sanctuary modes, no partial turns or saved session inventory, unrelated request refusal, draft preservation, and a subsequent successful reply. Physical microphone/speaker acceptance, normal autoplay, full MAIA orchestration and unattended JARVIS execution remain open.
