/**
 * SOVEREIGNTY: UnifiedVoiceRouter tombstoned.
 *
 * Previously routed TTS through OpenAI (tts-1) primary + ElevenLabs fallback.
 * MAIA operates under a zero OpenAI runtime access doctrine.
 * ElevenLabs is also a cloud provider — neither is acceptable.
 *
 * There are no live callers. This file is a dead prototype.
 * Retained as tombstone to preserve git history.
 *
 * Sovereign TTS: ttsRouter.synthesize() → Kokoro (local).
 * See lib/ai/openaiPolicy.ts and lib/tts/ttsRouter.ts.
 */

export {};
