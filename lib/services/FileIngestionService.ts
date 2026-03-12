/**
 * SOVEREIGNTY: Non-sovereign prototype — OpenAI dependency removed.
 *
 * Previously used OpenAI for file ingestion processing. No live callers.
 *
 * This file has no live callers in the current serving path.
 * It is a tombstone: imports nothing, exports nothing, does nothing.
 *
 * If this feature is needed, reimplement using:
 *   - Claude (Anthropic) for language/reasoning
 *   - Kokoro for voice synthesis
 *   - Local Ollama for embeddings
 *   - PostgreSQL (lib/db/postgres.ts) for storage
 *
 * See lib/ai/openaiPolicy.ts for the zero-access doctrine.
 */

export {};
