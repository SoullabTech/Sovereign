/**
 * Correction repair — Layer A of corrigibility restoration (in-turn).
 *
 * ⭐ FOUNDER AUTHORIZATION 2026-08-09. Restores in-turn correction and repair:
 *    when a member says "that's not what I meant" / "you misunderstood" /
 *    "I just told you", MAIA recognises it **within the turn** and repairs its
 *    stance instead of restating the interpretation the member just rejected.
 *
 * PROVENANCE: this capability was live from 2026-03-12 (`4f73d66b0`) until
 * 2026-03-19, when `d7cea280d` removed it from the conversational route as
 * undisclosed collateral in a Spiralogic report commit. The detector
 * (`lib/consciousness/correctionDetection.ts`) survived untouched with zero
 * importers. See docs/architecture/audits/CORRIGIBILITY_ACTIVATION_TRACE_2026-08-09.md.
 *
 * ⭐ LAYER BOUNDARY — this module remains in-turn only: it changes one prompt
 *    for one turn and writes nothing. Durable corrigibility (the correction
 *    surviving the turn) is Gate 1 Layer B, authorized by the founder ruling
 *    docs/governance/FOUNDER_RULING_PERSISTENT_CORRIGIBILITY_GATE1_2026-08-09.md
 *    and implemented separately in lib/maia/correctionPersistence.ts under the
 *    authored-authority rule: the member authors the correction; the system
 *    registers its consequence. The old COGOS recurrence→authority promotion
 *    path remains constitutionally rejected (F4 — DO NOT RESURRECT).
 *
 * ⭐ PROPORTIONALITY — the block never asserts that MAIA was wrong. The detector
 *    matches literal phrases, so it can fire on ordinary narration ("I just said
 *    goodbye to my dad"). The block is therefore written as *a possible signal to
 *    check*, not a finding to act on. A false positive costs one clarifying
 *    question; durable consequences are governed separately by the persistence
 *    layer's stricter threshold and are member-reversible (F6).
 */

import { detectCorrectionSignal, type CorrectionType } from '@/lib/consciousness/correctionDetection';

export type CorrectionRepairBlock = {
  /** Prompt text, or undefined when there is no signal. */
  block?: string;
  detected: boolean;
  correctionType: CorrectionType | null;
  matchedPhrase?: string;
  confidence: number;
};

/** What the member may be pointing at, per signal type. Guidance, never a verdict. */
const GUIDANCE: Record<CorrectionType, string> = {
  repeat:
    'They may be telling you that you have already asked this, or that they have already answered it. ' +
    'Do not ask it again. Work with what they have already given you.',
  misread:
    'They may be telling you that you misread what they said. ' +
    'Return to their actual words rather than to your reading of them.',
  thread_loss:
    'They may be telling you that you have lost the thread of the conversation. ' +
    'Re-anchor on what they were actually working on before you respond.',
  general:
    'They may be correcting something you said. ' +
    'Find what you got wrong before continuing.',
};

/**
 * Build the in-turn repair block for a member message.
 *
 * @param userText the member's current message
 * @param opts.enabled kill-switch; when false, returns no block (default true)
 */
export function buildCorrectionRepairBlock(
  userText: string,
  opts: { enabled?: boolean } = {},
): CorrectionRepairBlock {
  const enabled = opts.enabled !== false;
  const signal = detectCorrectionSignal(userText ?? '');

  if (!enabled || !signal.hasCorrectionSignal || !signal.correctionType) {
    return {
      detected: false,
      correctionType: null,
      confidence: 0,
    };
  }

  const block = [
    '## Possible correction — this turn only',
    '',
    `The member's message contains "${signal.matchedPhrase}". ${GUIDANCE[signal.correctionType]}`,
    '',
    'This is a **possible signal, not a finding.** The phrase may also be ordinary speech.',
    'So:',
    '- Re-read what the member actually said, and respond to that.',
    '- Do not restate your previous interpretation as though it still stands.',
    '- If you cannot tell what you got wrong, ask them plainly, in one short question.',
    '- Do not apologise reflexively or at length. Being corrected is the conversation working, not failing.',
    '- If they were not correcting you, let it pass without comment. Do not tell them you thought they were.',
    '',
    'This block governs the present turn and forms no lasting interpretation of ' +
      'the member. What is remembered is governed separately: the member\'s own ' +
      'corrective words may persist as a member-authored act.',
  ].join('\n');

  return {
    block,
    detected: true,
    correctionType: signal.correctionType,
    matchedPhrase: signal.matchedPhrase,
    confidence: signal.confidence,
  };
}

/** Ops log shape — mirrors summarizePriorExchangesForLog / summarizeMarkedEpisodesForLog. */
export function summarizeCorrectionForLog(result: CorrectionRepairBlock) {
  return {
    detected: result.detected,
    correctionType: result.correctionType,
    confidence: result.confidence,
    blockChars: result.block?.length ?? 0,
  };
}
