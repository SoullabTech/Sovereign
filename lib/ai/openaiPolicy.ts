/**
 * MAIA OpenAI Policy — Zero Access Doctrine
 *
 * OpenAI has NO runtime access to this platform.
 * No TTS, no STT, no embeddings, no chat, no completions, no moderation.
 *
 * This is not a technical limitation — it is a sovereignty choice.
 * Every outbound call to OpenAI infrastructure transmits platform data.
 * Under this doctrine, no such transmission is acceptable.
 *
 * Approved providers:
 *   Language:   Claude (Anthropic) via ANTHROPIC_API_KEY
 *   Voice TTS:  Kokoro (local), Sesame (when integrated), PersonaPlex (future)
 *   Voice STT:  Browser Web Speech API (local), local Whisper (future)
 *   Embeddings: Ollama nomic-embed-text (local)  →  lib/memory/embeddings.ts
 *
 * Four-bucket classification (for migration tracking):
 *
 *   REMOVE NOW (live violations):
 *     lib/memory/compression/MemoryCompressor.ts   → SimpleCompressor
 *     lib/memory/embeddings/OpenAIEmbedder.ts      → local Ollama
 *     lib/consciousness/CollectiveWisdomField.ts   → sovereignty-blocked
 *     lib/memory/integration/MemoryIntegration.ts  → uses above, now clean
 *
 *   REPLACE NEXT (voice layer):
 *     app/api/voice/openai-tts/route.ts            → Kokoro only, route kept
 *     lib/tts/ttsRouter.ts                         → remove OpenAI paths
 *
 *   QUARANTINE (dead code, mark for deletion):
 *     app/api/_backend/                            → legacy archive
 *     lib/integrated-oracle-system.ts              → prototype, no live callers
 *
 *   BLOCK AT INFRA (ops, outside this file):
 *     - Remove OPENAI_API_KEY from all deployed envs
 *     - Add network egress rules: deny outbound to api.openai.com
 *     - Verify via log scan after deploy
 *
 * This file is the source of truth. All OpenAI wrappers must fail through here.
 */

/**
 * Zero allowed capabilities. This array is empty by design.
 * If you think you need OpenAI, read the approved providers above first.
 */
export const OPENAI_ALLOWED_CAPABILITIES = [] as const;
export type OpenAIAllowedCapability = (typeof OPENAI_ALLOWED_CAPABILITIES)[number];

/**
 * Throw a sovereignty violation for any attempted OpenAI operation.
 * This is the single enforcement point — all wrappers delegate here.
 */
export function assertOpenAIBlocked(operation: string): never {
  throw new Error(
    `SOVEREIGNTY VIOLATION: OpenAI ${operation} is blocked. ` +
      `MAIA operates under a zero OpenAI runtime access doctrine. ` +
      `See lib/ai/openaiPolicy.ts for approved alternatives.`
  );
}

/**
 * A no-op mock that satisfies import shapes but throws on any real use.
 * Use this when you need to replace `new OpenAI(...)` without reworking call sites
 * that should also be removed — the throw surfaces them immediately at runtime.
 */
export const OPENAI_BLOCKED_STUB = new Proxy(
  {},
  {
    get(_target, prop: string) {
      return new Proxy(
        {},
        {
          get(_t, innerProp: string) {
            // Allow `.create` to be accessed as a function — it throws on call
            if (innerProp === 'create') {
              return () => assertOpenAIBlocked(`${prop}.create()`);
            }
            return new Proxy(
              {},
              {
                get(_t2, deepProp: string) {
                  if (deepProp === 'create') {
                    return () => assertOpenAIBlocked(`${prop}.${innerProp}.create()`);
                  }
                  return () => assertOpenAIBlocked(`${prop}.${innerProp}.${deepProp}()`);
                },
                apply() {
                  return assertOpenAIBlocked(`${prop}.${innerProp}()`);
                },
              }
            );
          },
          apply() {
            return assertOpenAIBlocked(`${prop}()`);
          },
        }
      );
    },
  }
);
