/**
 * MANIFESTATION CORPUS — observational capture for substrate-sovereignty work.
 *
 * INVARIANTS (do not relax):
 *
 *   1. THIS MODULE WRITES OBSERVATION, NOT JUDGMENT.
 *      It captures the turn (input + response) and the structural signals
 *      available at the moment of generation. It does NOT classify the turn.
 *
 *   2. NO AUTOMATED CLASSIFICATION. EVER.
 *      manifestation_class, felt_quality, and domain are filled by a human
 *      reviewer reading the turn. Do not add a "helper" that auto-tags via
 *      heuristic, regex, embedding, LLM, or any other automated path. The
 *      whole point of the corpus is that the classification itself is the
 *      epistemic source — automating it collapses what we are trying to
 *      learn from. If you find yourself writing such a helper, stop and
 *      re-read docs/canon and the parent thread.
 *
 *   3. NO SCORING, NO EMBEDDINGS, NO EXTRACTION HERE.
 *      Pattern extraction, fine-tuning corpus prep, and any downstream
 *      analysis live in separate later cuts. This module is only the
 *      capture layer.
 *
 *   4. FIRE-AND-FORGET.
 *      Capture must never block the oracle response. On any error, log and
 *      drop. The conversation matters more than the observation of it.
 *
 *   5. FALSIFIABILITY GATE.
 *      If after ~1000 turns reviewers cannot reliably distinguish
 *      maia_shape from substrate_default_shape, the apprenticeship model
 *      itself needs revision — not more capture infrastructure built on top.
 *
 * This module rides on whatever route-level persistence gate governs the
 * sibling observers (observeRelationalContent, storeTrustObservation,
 * upsertSpiralState). If sanctuary becomes route-level, this module is
 * included in that gate automatically — do not add a special-case bypass.
 */

import { query } from '@/lib/db/postgres';

export interface ManifestationCaptureInput {
  memberId: string;
  sessionId: string;
  userInput: string;
  maiaResponse: string;
  voiceMode?: string | null;
  realtimeMode?: string | null;
  element?: string | null;
  phase?: number | null;
  conversationDepth?: number | null;
}

/**
 * Fire-and-forget capture. Returns void synchronously; the write happens
 * in the background and any error is logged without propagating.
 *
 * Call site pattern (matches sibling observers in oracle/conversation/route):
 *
 *   captureManifestation({
 *     memberId: userId,
 *     sessionId,
 *     userInput: message,
 *     maiaResponse: maiaResponse.coreMessage,
 *     voiceMode: realtimeMode,
 *     element: voiceHint.element,
 *     phase: voiceHint.phase,
 *     conversationDepth,
 *   });
 */
export function captureManifestation(input: ManifestationCaptureInput): void {
  writeManifestation(input).catch((err) => {
    console.warn('[manifestationCorpus] capture failed (non-fatal):', err?.message || err);
  });
}

async function writeManifestation(input: ManifestationCaptureInput): Promise<void> {
  if (!input.memberId || !input.sessionId) return;
  if (!input.userInput || !input.maiaResponse) return;

  const sql = `
    INSERT INTO manifestation_corpus (
      member_id, session_id,
      user_input, maia_response,
      voice_mode, realtime_mode, element, phase,
      conversation_depth, response_char_length
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  `;

  const params = [
    input.memberId,
    input.sessionId,
    input.userInput,
    input.maiaResponse,
    input.voiceMode ?? null,
    input.realtimeMode ?? null,
    input.element ?? null,
    input.phase ?? null,
    input.conversationDepth ?? null,
    input.maiaResponse.length,
  ];

  await query(sql, params);
}
