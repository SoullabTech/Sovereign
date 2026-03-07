/**
 * prosodyFromPFI — Per-Chunk Prosody Overlay
 *
 * Consumes a PFI VoicePlan and applies chunk-aware prosodic precision.
 * Called once per merged sentence chunk in the streaming loop.
 *
 * Why per-chunk matters:
 *   A single response may contain:
 *     "I hear you." (containment — short-clause, calm)
 *     "What happened after that?" (clarification — question, open)
 *     "There's something worth naming here." (challenge — declaration, directive)
 *   Each chunk has different prosodic requirements.
 *   A single per-turn instruction cannot capture this.
 *
 * Architecture:
 *   VoicePlan.ttsInstructions = base (full-turn context, element + stance + affect)
 *   deriveChunkProsody()       = overlay (chunk role + position precision)
 *   Result                     = complete self-contained instruction per chunk
 *
 * Both streaming and non-streaming paths must consume the same VoicePlan.
 * This is how PFI "owning" voice becomes audible — not advisory, authoritative.
 *
 * VOICE CONTRACT: PROSODY_TOKENS is the only valid interface between maiaPlanner.ts
 * and this file. inferProsodyModeFromInstructions() keys only off those tokens —
 * freeform phrase detection is disallowed. Any new relational mode requires a new
 * entry in PROSODY_TOKENS and a corresponding template update in maiaPlanner.ts.
 * See: docs/canon/MAIA_VOICE_DOCTRINE_v1.0.md
 *
 * Usage in streaming loop (OracleConversation.tsx):
 *   const voicePlan = plan.voicePlan; // from PFI / maiaPlanner
 *   for (let i = 0; i < completeSentences.length; i++) {
 *     const chunk = completeSentences[i];
 *     const instructions = deriveChunkProsody({
 *       voicePlan,
 *       chunkText: chunk,
 *       isFirstChunk: i === 0,
 *       isLastChunk: i === completeSentences.length - 1,
 *     });
 *     const audio = await generateAudioChunk(chunk, { instructions, ... });
 *   }
 */

import type { Element, VoicePlan, PFIIntention, AffectState, ProsodyMode } from '@/lib/consciousness/pfi';

// ── Chunk Type Classification ─────────────────────────────────────────────────
// Lightweight, no LLM. Determines prosodic role of each sentence.

export type ChunkType =
  | 'question'      // Ends with ? — genuine inquiry, open
  | 'exclamation'   // Ends with ! — energy, surprise, emphasis
  | 'short-clause'  // ≤ 5 words — presence signal, grounding marker
  | 'invitation'    // Contains open invitation phrasing
  | 'transition'    // Connective clause — lighter prosodic weight
  | 'list-item'     // Enumeration — even weight, no building
  | 'declaration';  // Standard declarative — element profile primary

const INVITATION_PATTERNS = /\b(if you want|when you're ready|whenever|as you|there's space|take your time|you might|no rush|feel free)\b/i;
const TRANSITION_PATTERNS = /^(and |but |so |because |then |though |yet |also )/i;
const LIST_PATTERNS = /^[\-\*•]|\d+\.\s/;

export function classifyChunk(text: string): ChunkType {
  const trimmed = text.trim();
  const wordCount = trimmed.split(/\s+/).length;

  if (trimmed.endsWith('?')) return 'question';
  if (trimmed.endsWith('!')) return 'exclamation';
  if (wordCount <= 5) return 'short-clause';
  if (INVITATION_PATTERNS.test(trimmed)) return 'invitation';
  if (TRANSITION_PATTERNS.test(trimmed)) return 'transition';
  if (LIST_PATTERNS.test(trimmed)) return 'list-item';
  return 'declaration';
}

// ── Prosody Mode → Chunk Behavior ─────────────────────────────────────────────
// ProsodyMode governs how chunk overlays are applied.

interface ModeChunkBehavior {
  questionClose: string;
  declarationWeight: string;
  shortClauseNote: string;
  exclamationLimit: string;
}

const MODE_BEHAVIOR: Record<ProsodyMode, ModeChunkBehavior> = {
  calm: {
    questionClose:    'Soft rise — genuine, not searching',
    declarationWeight: 'Gentle landing — no pressure',
    shortClauseNote:  'Let it rest — presence signal',
    exclamationLimit: 'Warmth, not urgency',
  },
  directive: {
    questionClose:    'Clear rise — direct inquiry',
    declarationWeight: 'Weight each word — grounded',
    shortClauseNote:  'Land it cleanly — precision',
    exclamationLimit: 'Energy, purposeful',
  },
  ceremonial: {
    questionClose:    'Open — spacious, do not close',
    declarationWeight: 'Resonant — let it breathe',
    shortClauseNote:  'Sacred weight — unhurried',
    exclamationLimit: 'Contained wonder — not theatrical',
  },
  intimate: {
    questionClose:    'Tender rise — close and genuine',
    declarationWeight: 'Warm, present',
    shortClauseNote:  'Close — almost a whisper',
    exclamationLimit: 'Bright, warm — not loud',
  },
};

// ── Per-Element Chunk Profile ─────────────────────────────────────────────────
// Direct Spiralogic → voice mapping for declaration chunks.

const ELEMENT_CHUNK_PROFILE: Record<Element, { pace: string; texture: string }> = {
  fire:   { pace: 'forward momentum, energized',   texture: 'alive, decisive' },
  water:  { pace: 'slow, flowing',                 texture: 'emotionally attuned, tender' },
  earth:  { pace: 'grounded, steady',              texture: 'embodied, solid' },
  air:    { pace: 'light, clear',                  texture: 'spacious, transparent' },
  aether: { pace: 'spacious, suspended',            texture: 'resonant, witnessing' },
};

// ── Main Export ────────────────────────────────────────────────────────────────

export interface ChunkProsodyInput {
  /** From PFI synthesis — authoritative source */
  voicePlan: VoicePlan;
  /** The specific chunk text */
  chunkText: string;
  /** Index context for positional overlays */
  isFirstChunk?: boolean;
  isLastChunk?: boolean;
  /** Element (if voicePlan doesn't carry it separately) */
  element?: Element;
}

export interface ChunkProsodyResult {
  /** Complete instructions for gpt-4o-mini-tts for this chunk */
  ttsInstructions: string;
  /** Chunk classification — for logging */
  chunkType: ChunkType;
}

/**
 * Derive per-chunk TTS instructions from a PFI VoicePlan.
 *
 * CONTRACT:
 *   - Input is VoicePlan from PFI — not ad-hoc tone logic
 *   - Output is self-contained instructions per chunk
 *   - Base instructions always come first (full-turn context)
 *   - Chunk overlay is appended (sentence-role precision)
 */
export function deriveChunkProsody(input: ChunkProsodyInput): ChunkProsodyResult {
  const { voicePlan, chunkText, isFirstChunk = false, isLastChunk = false } = input;
  const { ttsInstructions: base, prosodyMode } = voicePlan;

  const chunkType = classifyChunk(chunkText);
  const behavior = MODE_BEHAVIOR[prosodyMode];

  const overlayParts: string[] = [];

  // Chunk-type specific overlay
  switch (chunkType) {
    case 'question':
      overlayParts.push(`Question delivery: ${behavior.questionClose}.`);
      overlayParts.push('Brief pause before and after.');
      break;

    case 'exclamation':
      overlayParts.push(`Energy: ${behavior.exclamationLimit}.`);
      break;

    case 'short-clause':
      overlayParts.push(`Presence: ${behavior.shortClauseNote}.`);
      overlayParts.push('Meaningful pause after.');
      break;

    case 'invitation':
      overlayParts.push('Open, spacious — do not close the phrase.');
      overlayParts.push('Leave air. Do not rush to fill silence.');
      break;

    case 'transition':
      overlayParts.push('Lighter weight — connective, carry forward.');
      break;

    case 'list-item':
      overlayParts.push('Even pacing — consistent across items, no building emphasis.');
      break;

    case 'declaration':
    default:
      // Element profile primary for declarations
      if (input.element) {
        const ep = ELEMENT_CHUNK_PROFILE[input.element];
        overlayParts.push(`${ep.pace}.`);
        overlayParts.push(`${ep.texture}.`);
      }
      overlayParts.push(`Declaration: ${behavior.declarationWeight}.`);
      break;
  }

  // Position overlays
  if (isFirstChunk) {
    const openNote =
      prosodyMode === 'ceremonial' ? 'Take root. Begin from stillness.' :
      prosodyMode === 'intimate'   ? 'Enter gently — close and present.' :
      prosodyMode === 'directive'  ? 'Clear entry. Ground before speaking.' :
      'Settle before speaking.';
    overlayParts.push(`Opening: ${openNote}`);
  }

  if (isLastChunk) {
    const closeNote =
      prosodyMode === 'ceremonial' ? 'Dissolve into silence.' :
      prosodyMode === 'intimate'   ? 'Settle warmly. Leave space.' :
      prosodyMode === 'directive'  ? 'Land cleanly. Let it rest.' :
      'Settle. Leave space.';
    overlayParts.push(`Close: ${closeNote}`);
  }

  // Compose: base context first, chunk precision appended
  const ttsInstructions = overlayParts.length > 0
    ? `${base.trim()} [This sentence: ${overlayParts.join(' ')}]`
    : base.trim();

  return { ttsInstructions, chunkType };
}

// ── Migration Bridge ───────────────────────────────────────────────────────────
// For call sites that have ttsInstructions + element but not yet a full VoicePlan.
// Lets streaming callers upgrade incrementally — remove when PFI is fully wired.

/**
 * Controlled vocabulary — canonical relational cues embedded in maiaPlanner.ts templates.
 *
 * These tokens are the ONLY coupling between the planner and the prosody inference layer.
 * Do not key inference off freeform wording. If you change a token here, update
 * buildTTSInstructions() in maiaPlanner.ts in the same commit (and vice versa).
 *
 * Mapping:
 *   WITNESS      → ceremonial  (attentive presence, open, spacious)
 *   MIRROR       → intimate    (clear reflection, close, following)
 *   GUIDE        → calm        (steady companion — default/fall-through)
 *   CHALLENGE    → directive   (calm conviction, deliberate weight)
 *   HOLD_SILENCE → ceremonial  (breath and stillness, barely spoken)
 */
export const PROSODY_TOKENS = {
  WITNESS:      'attentive presence',
  MIRROR:       'clear reflection',
  GUIDE:        'steady companion',
  CHALLENGE:    'calm conviction',
  HOLD_SILENCE: 'breath and stillness',
} as const;

/**
 * Infer a prosody mode from the base TTS instructions string.
 * Keys only off PROSODY_TOKENS — never off freeform wording.
 *
 * @internal — exported for contract tests only, not part of public API
 */
export function inferProsodyModeFromInstructions(instructions: string): ProsodyMode {
  const t = instructions.toLowerCase();
  if (t.includes(PROSODY_TOKENS.CHALLENGE))    return 'directive';
  if (t.includes(PROSODY_TOKENS.WITNESS) ||
      t.includes(PROSODY_TOKENS.HOLD_SILENCE)) return 'ceremonial';
  if (t.includes(PROSODY_TOKENS.MIRROR))       return 'intimate';
  return 'calm'; // GUIDE + default
}

export function deriveChunkProsodyLegacy(opts: {
  chunkText: string;
  baseTTSInstructions: string;
  element: Element;
  isFirstChunk?: boolean;
  isLastChunk?: boolean;
}): string {
  // Build a minimal VoicePlan from available signals.
  // Infer prosody mode from stance keywords embedded in base instructions
  // so chunk overlays match the relational context (not always 'calm').
  const voicePlan: VoicePlan = {
    provider: 'openai',
    ttsInstructions: opts.baseTTSInstructions,
    prosodyMode: inferProsodyModeFromInstructions(opts.baseTTSInstructions),
    pacing: { mergeBelowChars: 160, fadeInMs: 40 },
  };

  return deriveChunkProsody({
    voicePlan,
    chunkText: opts.chunkText,
    element: opts.element,
    isFirstChunk: opts.isFirstChunk,
    isLastChunk: opts.isLastChunk,
  }).ttsInstructions;
}
