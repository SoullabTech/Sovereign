/**
 * SOVEREIGNTY: OpenAI TTS wrapper — removed.
 *
 * Previously provided synthesizeSpeech() backed by OpenAI audio.speech.create().
 * All callers (stream-conversation, local-tts, preview routes) have been updated
 * to use lib/tts/ttsRouter.synthesize() directly (Kokoro-backed).
 *
 * This file is a tombstone. It exports nothing and imports nothing.
 * If you see a build error pointing here, find the caller and migrate it
 * to ttsRouter.synthesize() or lib/tts/providers/kokoro.ts.
 *
 * See lib/ai/openaiPolicy.ts for the zero-access doctrine.
 */

export {};
