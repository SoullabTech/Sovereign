/**
 * The constitutional floor — mandatory producers, composed by the constructor, appended
 * by the renderer, never adjudicated. Spec §5.4.
 *
 * Texts are the SAME constants the CORE / DEEP-repair channel already appends
 * (appendAllContextAddenda, lib/sovereign/maiaVoice.ts). Naming them here does not
 * change them; it makes floor invariance across tiers checkable (G1).
 */

import { MAIA_RUNTIME_PROMPT } from '../../consciousness/MAIA_RUNTIME_PROMPT';
import { PLATFORM_KNOWLEDGE_ADDENDUM } from '../../sovereign/platformKnowledge';
import {
  INTERFACE_HUMILITY_GUARDRAIL,
  MEMORY_SPEECH_ACT_BOUNDARY,
  PLATFORM_KNOWLEDGE_BOUNDARY,
} from '../../sovereign/maiaVoice';
import type { ConstitutionalFloor, FloorBlock } from './types';

/** Order is constitutional: runtime prompt FIRST; the three standing guardrails LAST, humility last of all. */
export function composeConstitutionalFloor(): ConstitutionalFloor {
  const blocks: FloorBlock[] = [
    { producerId: 'floor.runtime_prompt', position: 'first', text: MAIA_RUNTIME_PROMPT },
    { producerId: 'floor.speech_act_boundary', position: 'last', text: MEMORY_SPEECH_ACT_BOUNDARY },
    { producerId: 'house.platform_knowledge', position: 'last', text: PLATFORM_KNOWLEDGE_ADDENDUM },
    { producerId: 'floor.platform_boundary', position: 'last', text: PLATFORM_KNOWLEDGE_BOUNDARY },
    { producerId: 'floor.interface_humility', position: 'last', text: INTERFACE_HUMILITY_GUARDRAIL },
  ];
  for (const b of blocks) {
    if (!b.text || b.text.trim().length === 0) {
      // Impossible by construction (constants). If it ever happens the process must not serve.
      throw new Error(`floor_missing: ${b.producerId}`);
    }
  }
  return { blocks };
}
