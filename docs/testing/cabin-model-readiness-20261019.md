# Cabin 0.5.2 model readiness

The launcher now qualifies only the fixed qwen2.5:7b model with completion capability. An unrelated conversational model no longer satisfies Cabin's model check. Missing, malformed or unavailable model inventory leaves model availability unverified while the local writing doorway remains accessible when its runtime is healthy.

The launcher explains the exact local dependency and distinguishes model installation from generating a successful response. No model generation, download, voice activation, provider change or private workspace read is part of this check.

Seven focused flow tests pass, including exact-model, malformed inventory and model-service failure cases. The packaged readiness test covers visible Checking feedback, completion time and restart after an isolated runtime stops. Existing conversation, Sanctuary and writing implementation is unchanged. Physical audio acceptance, full MAIA orchestration and unattended Jarvis execution remain open.
