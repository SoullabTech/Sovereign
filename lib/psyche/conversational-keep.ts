/**
 * Conversational Keep discriminator:
 *
 *   MAIA recognizes what the member instructs her to do.
 *   MAIA does not infer where material belongs from what it might mean.
 *
 *   Member directs           → execute or confirm.
 *   Member expresses significance → offer doorway.
 *
 * This rule is load-bearing. Every contributor to this module needs to
 * see it first. The filing-instruction parser operates on WHAT THE MEMBER
 * SAID TO DO. The meaningful-utterance scorer operates on HOW THE MEMBER
 * SPOKE ABOUT THEIR EXPERIENCE. Those are different grammars, and they
 * must remain different parsers — never one parser with two modes — to
 * prevent emotional weight from leaking into the filing path.
 *
 * Phase 1.5A — Psyche Engagement Layer.
 *
 * Governed by:
 *   - docs/canon/THE_CLEARING.md
 *   - docs/canon/SPIRAL_CONTINUITY_ENGINE.md
 *   - docs/canon/RIGHT_TO_REMAIN_UNPOSSESSED.md
 * Spec:
 *   - docs/specs/PSYCHE_ENGAGEMENT_LAYER_SPEC.md
 *
 * Vocabulary boundary (Freemason discipline):
 *   The filing destination vocabulary is human-natural (keep, ideas,
 *   decisions, dreams, journal, reflections, protected). It is NEVER
 *   architectural canon vocabulary (threshold, archetypal, episodic,
 *   thematic, fire, water, etc.). Members may discover registers/lenses
 *   later through the portfolio surface — they are not trained to speak
 *   canon-language in chat.
 *
 * State management:
 *   The recognition/evaluation functions are PURE: input → result | null.
 *   The governor (Phase 1.5D, separate module) maintains state across
 *   sessions and feeds it into evaluateKeepOffer.
 */

import { applyAtomGesture, keepSource } from './portfolio';
import type {
  CrystallizedMemory,
  KeepGestureInput,
  MemoryAtomSourceType,
} from './types';

// ════════════════════════════════════════════════════════════════════════════
// Output shapes
// ════════════════════════════════════════════════════════════════════════════

/**
 * Destinations the MEMBER can name in conversational filing commands.
 * Human-natural vocabulary only. No register/lens names ever.
 */
export type FilingDestination =
  | 'keep'         // general → sourceType: 'spontaneous'
  | 'ideas'        // → sourceType: 'idea'
  | 'decisions'    // → sourceType: 'decision'
  | 'changes'      // → sourceType: 'change'
  | 'journal'      // → sourceType: 'journal'
  | 'dreams'       // → sourceType: 'dream'
  | 'reflections'  // → sourceType: 'reflection'
  | 'protected';   // keep + apply 'protect' gesture

export type AppliedGesture =
  | 'still_alive'
  | 'set_aside'
  | 'protect'
  | 'archive'
  | 'return_to_active';

export interface FilingInstruction {
  intent: 'file_member_material';
  destination: FilingDestination;
  memberDirected: true;
  confidence: 'high' | 'low';
  excerpt: string;
  matchedPhrase: string;
}

export interface GestureInstruction {
  intent: 'apply_gesture';
  gesture: AppliedGesture;
  target: 'this' | 'that_thread' | string;
  memberDirected: true;
  confidence: 'high' | 'low';
  matchedPhrase: string;
}

/**
 * Reasons a keep-offer was triggered. Diagnostic only — never displayed.
 * The offer text is uniform regardless of reason (preserves the doorway).
 */
export type KeepOfferReason =
  | 'explicit_remember'
  | 'explicit_matters'
  | 'decision_language'
  | 'threshold_language'
  | 'dream_language'
  | 'returning_pattern_language'
  | 'soft_gesture_invitation'; // member used gesture-language softly

export interface KeepOffer {
  type: 'keep_offer';
  excerpt: string;
  reason: KeepOfferReason;
  // When the salience signal indicates a specific gesture the member
  // might be invoking softly (e.g., "this still feels alive"), this
  // names it. The orchestration layer can then render a gesture-specific
  // doorway instead of the generic keep prompt.
  suggestedGesture?: AppliedGesture;
}

// ════════════════════════════════════════════════════════════════════════════
// Filing-instruction parser
// ════════════════════════════════════════════════════════════════════════════

interface FilingPattern {
  pattern: RegExp;
  destination: FilingDestination;
  confidence: 'high' | 'low';
}

const FILING_PATTERNS: FilingPattern[] = [
  // Keep (general) — high confidence
  { pattern: /^(please\s+)?keep\s+(this|that|it)(\s+for\s+me)?\s*\.?\s*$/i, destination: 'keep', confidence: 'high' },
  { pattern: /^(please\s+)?(put|add|save|store)\s+(this|that|it)\s+(in|to|into)\s+keep\b/i, destination: 'keep', confidence: 'high' },

  // Ideas — high confidence
  { pattern: /^(please\s+)?(file|put|add|save|store|keep)\s+(this|that|it)\s+(as\s+an?|in|to|into)\s+ideas?\b/i, destination: 'ideas', confidence: 'high' },
  { pattern: /^(please\s+)?save\s+(this|that|it)\s+as\s+an\s+idea\b/i, destination: 'ideas', confidence: 'high' },
  { pattern: /^(this|that|it)\s+is\s+an\s+idea\s*\.?\s*$/i, destination: 'ideas', confidence: 'high' },

  // Decisions
  { pattern: /^(please\s+)?(file|put|add|save|store|keep)\s+(this|that|it)\s+(as\s+a|in|to|into)\s+decisions?\b/i, destination: 'decisions', confidence: 'high' },

  // Changes
  { pattern: /^(please\s+)?(file|put|add|save|store|keep)\s+(this|that|it)\s+(as\s+a|in|to|into)\s+changes?\b/i, destination: 'changes', confidence: 'high' },

  // Journal
  { pattern: /^(please\s+)?journal\s+(this|that|it)\b/i, destination: 'journal', confidence: 'high' },
  { pattern: /^(please\s+)?(file|put|add|save|store|keep)\s+(this|that|it)\s+(in|to|into|as\s+a)\s+journal\b/i, destination: 'journal', confidence: 'high' },

  // Dreams
  { pattern: /^(please\s+)?(file|put|add|save|store|keep)\s+(this|that|it)\s+(as\s+a|in|to|into)\s+dreams?\b/i, destination: 'dreams', confidence: 'high' },

  // Reflections
  { pattern: /^(please\s+)?(file|put|add|save|store|keep)\s+(this|that|it)\s+(as\s+a|in|to|into)\s+reflections?\b/i, destination: 'reflections', confidence: 'high' },

  // Protected
  { pattern: /^(please\s+)?protect\s+(this|that|it)\s*\.?\s*$/i, destination: 'protected', confidence: 'high' },
  { pattern: /^(please\s+)?keep\s+(this|that|it)\s+protected\b/i, destination: 'protected', confidence: 'high' },

  // Low-confidence forms — member said something file-shaped but ambiguous
  { pattern: /^(maybe\s+)?(this|that|it)\s+belongs\s+(somewhere|in)\b/i, destination: 'keep', confidence: 'low' },
  { pattern: /^(i\s+(think\s+)?)?(maybe\s+)?save\s+(this|that|it)\b/i, destination: 'keep', confidence: 'low' },
];

/**
 * Parse a member-directed FILING instruction from an utterance.
 * Returns null when no filing-shaped pattern matches.
 *
 * High-confidence matches are safe to execute directly.
 * Low-confidence matches should be confirmed via buildFilingConfirmation.
 */
export function parseFilingInstruction(input: { utterance: string }): FilingInstruction | null {
  const utterance = input.utterance.trim();
  if (!utterance) return null;

  for (const { pattern, destination, confidence } of FILING_PATTERNS) {
    const match = utterance.match(pattern);
    if (match) {
      return {
        intent: 'file_member_material',
        destination,
        memberDirected: true,
        confidence,
        excerpt: utterance,
        matchedPhrase: match[0],
      };
    }
  }
  return null;
}

// ════════════════════════════════════════════════════════════════════════════
// Gesture-instruction parser
// ════════════════════════════════════════════════════════════════════════════

interface GesturePattern {
  pattern: RegExp;
  gesture: AppliedGesture;
  target: 'this' | 'that_thread';
  confidence: 'high' | 'low';
}

const GESTURE_PATTERNS: GesturePattern[] = [
  // Still alive — explicit
  { pattern: /^(please\s+)?mark\s+(this|that|it)\s+(as\s+)?still\s+alive\b/i, gesture: 'still_alive', target: 'this', confidence: 'high' },
  { pattern: /^(this|that|it)\s+is\s+still\s+alive\s*\.?\s*$/i, gesture: 'still_alive', target: 'this', confidence: 'high' },

  // Set aside — explicit
  { pattern: /^(please\s+)?set\s+(this|that|it)\s+aside\s*\.?\s*$/i, gesture: 'set_aside', target: 'this', confidence: 'high' },

  // Protect — explicit (separate from filing 'protected'; this applies to existing atom)
  { pattern: /^(please\s+)?protect\s+that\s+thread\s*\.?\s*$/i, gesture: 'protect', target: 'that_thread', confidence: 'high' },

  // Archive — explicit
  { pattern: /^(please\s+)?archive\s+(this|that|it)\s*\.?\s*$/i, gesture: 'archive', target: 'this', confidence: 'high' },
  { pattern: /^(please\s+)?archive\s+that\s+thread\b/i, gesture: 'archive', target: 'that_thread', confidence: 'high' },

  // Return
  { pattern: /^(please\s+)?return\s+to\s+(this|that|it)\b/i, gesture: 'return_to_active', target: 'this', confidence: 'high' },
];

/**
 * Parse a member-directed GESTURE instruction from an utterance.
 * Returns null when no gesture-shaped pattern matches.
 *
 * Note: soft gesture-language like "this still feels alive" is NOT
 * a gesture instruction — it's a meaningful expression. It is handled
 * by evaluateKeepOffer, which produces an offer with suggestedGesture.
 */
export function parseGestureInstruction(input: { utterance: string }): GestureInstruction | null {
  const utterance = input.utterance.trim();
  if (!utterance) return null;

  for (const { pattern, gesture, target, confidence } of GESTURE_PATTERNS) {
    const match = utterance.match(pattern);
    if (match) {
      return {
        intent: 'apply_gesture',
        gesture,
        target,
        memberDirected: true,
        confidence,
        matchedPhrase: match[0],
      };
    }
  }
  return null;
}

// ════════════════════════════════════════════════════════════════════════════
// Meaningful-utterance scorer (keep-offer evaluation)
// ════════════════════════════════════════════════════════════════════════════

interface SalienceSignal {
  pattern: RegExp;
  reason: KeepOfferReason;
  suggestedGesture?: AppliedGesture;
}

/**
 * Salience signals — explicit MEMBER-AUTHORED language indicating weight.
 * Matches the MEMBER'S WORDS, never interpretations of state.
 * No sentiment analysis.
 */
const SALIENCE_SIGNALS: SalienceSignal[] = [
  { pattern: /\b(remember\s+this|don'?t\s+(let\s+me\s+)?forget|hold\s+(onto|on\s+to)\s+this|i\s+want\s+to\s+remember)\b/i, reason: 'explicit_remember' },
  { pattern: /\b(this\s+matters|this\s+(is|feels)\s+(really\s+)?(important|significant|big|huge))\b/i, reason: 'explicit_matters' },
  { pattern: /\b(i'?ve\s+decided|i\s+decided\s+to|i'?m\s+going\s+to|i\s+won'?t|i\s+will\s+not|i'?m\s+(not\s+)?gonna)\b/i, reason: 'decision_language' },
  { pattern: /\b(everything\s+changed|i\s+realized|i\s+see\s+now|turning\s+point|i\s+can'?t\s+go\s+back|something\s+shifted|crossed\s+a\s+line)\b/i, reason: 'threshold_language' },
  { pattern: /\b(i\s+had\s+a\s+dream|in\s+my\s+dream|i\s+dreamed|dreamt\b|i\s+dreamt)\b/i, reason: 'dream_language' },
  { pattern: /\b(this\s+keeps\s+coming\s+back|i\s+keep\s+thinking\s+about|i'?m\s+back\s+(in|here)|same\s+(thing|place)\s+again|here\s+again)\b/i, reason: 'returning_pattern_language' },

  // Soft-gesture invitations: member uses gesture-vocabulary in expressive form.
  // "This still feels alive" → ask if member wants to mark it still alive.
  // (Note: "This is still alive" matches the strict gesture parser; this
  // pattern is the softer/expressive form.)
  { pattern: /\b(this|that|it)\s+still\s+feels\s+alive\b/i, reason: 'soft_gesture_invitation', suggestedGesture: 'still_alive' },
  { pattern: /\b(this|that|it)\s+feels\s+done\b|\bi'?m\s+done\s+with\s+(this|that|it)\b/i, reason: 'soft_gesture_invitation', suggestedGesture: 'archive' },
];

/**
 * Ambiguity markers that suppress the offer even if a salience pattern matched.
 * Member language like "I don't know, maybe this matters" is too tentative
 * to ask — the asking would force a premature decision on something the
 * member is still working out.
 */
const AMBIGUITY_MARKERS: RegExp[] = [
  /\bi\s+don'?t\s+know\b/i,
  /\bmaybe\b/i,
  /\bperhaps\b/i,
  /\bi\s+guess\b/i,
  /\bkind\s+of\b/i,
  /\bsort\s+of\b/i,
  /\bnot\s+sure\b/i,
];

function isAmbiguous(utterance: string): boolean {
  return AMBIGUITY_MARKERS.some((p) => p.test(utterance));
}

export interface KeepWorthinessInput {
  utterance: string;
  conversationTurn: number;
  recentOfferCount: number;
  recentDeclineCount: number;
  lastOfferTurn?: number;
  offersPaused: boolean;
}

export const KEEP_OFFER_POLICY = {
  maxOffersPerConversation: 3,
  minTurnsBeforeOffer: 3,
  cooldownAfterOfferTurns: 6,
  declineThresholdRise: 3,
} as const;

/**
 * Evaluate whether a keep-offer should surface for this utterance.
 *
 * Returns null when ANY of:
 *   - Offers are paused (member said "stop offering")
 *   - Max offers per conversation reached
 *   - Too early in the conversation (need context first)
 *   - Within cooldown of the previous offer
 *   - Utterance is ambiguous (member is still working it out)
 *   - No salience signal detected
 *   - Threshold raised by repeated declines and this signal doesn't clear it
 */
export function evaluateKeepOffer(input: KeepWorthinessInput): KeepOffer | null {
  if (input.offersPaused) return null;
  if (input.recentOfferCount >= KEEP_OFFER_POLICY.maxOffersPerConversation) return null;
  if (input.conversationTurn < KEEP_OFFER_POLICY.minTurnsBeforeOffer) return null;
  if (
    input.lastOfferTurn !== undefined &&
    input.conversationTurn - input.lastOfferTurn < KEEP_OFFER_POLICY.cooldownAfterOfferTurns
  ) {
    return null;
  }

  const utterance = input.utterance.trim();
  if (!utterance) return null;

  // Ambiguity suppression — confidence floor.
  // Member-tentative language doesn't trigger the offer; it raises internal
  // weight toward a future offer if the member becomes more direct.
  if (isAmbiguous(utterance)) return null;

  for (const { pattern, reason, suggestedGesture } of SALIENCE_SIGNALS) {
    if (pattern.test(utterance)) {
      // Threshold rise: after repeated declines, only the strongest signals
      // pass. (explicit_remember + explicit_matters)
      if (input.recentDeclineCount >= KEEP_OFFER_POLICY.declineThresholdRise) {
        if (reason !== 'explicit_remember' && reason !== 'explicit_matters') {
          return null;
        }
      }

      return {
        type: 'keep_offer',
        excerpt: utterance,
        reason,
        suggestedGesture,
      };
    }
  }

  return null;
}

// ════════════════════════════════════════════════════════════════════════════
// Offer rendering — doorway grammar only
// ════════════════════════════════════════════════════════════════════════════

/**
 * Build the textual offer MAIA presents.
 *
 * For generic keep-offers the surface text is uniform — the *reason* never
 * leaks into the offer language. For soft-gesture invitations (e.g., member
 * said "this still feels alive"), the offer names the gesture so the member
 * can accept the specific action they implied.
 *
 *   NOT: "I'll keep this — it's important."
 *   YES: "Would you like me to keep this?"
 *   YES: "Would you like me to mark it still alive?"  (for soft_gesture_invitation)
 */
export function buildKeepOfferText(offer: KeepOffer): string {
  if (offer.suggestedGesture) {
    switch (offer.suggestedGesture) {
      case 'still_alive':      return 'Would you like me to mark it still alive?';
      case 'set_aside':        return 'Would you like me to set it aside?';
      case 'protect':          return 'Would you like me to protect it?';
      case 'archive':          return 'Would you like me to archive it?';
      case 'return_to_active': return 'Would you like me to return to it?';
    }
  }
  return 'Would you like me to keep this?';
}

/**
 * Confirmation prompt for a (low-confidence) filing instruction.
 */
export function buildFilingConfirmation(instruction: FilingInstruction): string {
  switch (instruction.destination) {
    case 'keep':        return 'Keep this for you?';
    case 'ideas':       return 'File this as an idea?';
    case 'decisions':   return 'Save this as a decision?';
    case 'changes':     return 'Save this as a change?';
    case 'journal':     return 'Save this to your journal?';
    case 'dreams':      return 'Save this as a dream?';
    case 'reflections': return 'Save this as a reflection?';
    case 'protected':   return 'Keep this and protect it?';
  }
}

/**
 * Confirmation prompt for a (low-confidence) gesture instruction.
 */
export function buildGestureConfirmation(instruction: GestureInstruction): string {
  switch (instruction.gesture) {
    case 'still_alive':      return 'Mark it still alive?';
    case 'set_aside':        return 'Set it aside?';
    case 'protect':          return 'Protect it?';
    case 'archive':          return 'Archive it?';
    case 'return_to_active': return 'Return to it?';
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Pause/unpause detection
// ════════════════════════════════════════════════════════════════════════════

const PAUSE_PATTERNS: RegExp[] = [
  /\bstop\s+(asking|offering|prompting|interrupting)\b/i,
  /\bstop\s+offering\s+to\s+keep\b/i,
  /\bdon'?t\s+(keep\s+)?asking\b/i,
  /\bplease\s+stop\b/i,
  /\bno\s+more\s+(prompts|offers|questions)\b/i,
];

const UNPAUSE_PATTERNS: RegExp[] = [
  /\byou\s+can\s+ask\s+again\b/i,
  /\bstart\s+(asking|offering)\s+again\b/i,
  /\bgo\s+ahead\s+(and\s+)?(ask|offer)\b/i,
];

export function detectPauseRequest(utterance: string): 'pause' | 'unpause' | null {
  const u = utterance.trim();
  if (!u) return null;
  for (const p of PAUSE_PATTERNS) {
    if (p.test(u)) return 'pause';
  }
  for (const p of UNPAUSE_PATTERNS) {
    if (p.test(u)) return 'unpause';
  }
  return null;
}

// ════════════════════════════════════════════════════════════════════════════
// applyConversationalKeepResult — bridge to the portfolio service
// ════════════════════════════════════════════════════════════════════════════

/**
 * Map a member-natural filing destination to the storage sourceType +
 * any follow-up gesture (e.g., 'protected' = keep + protect).
 */
function destinationToSource(destination: FilingDestination): {
  sourceType: MemoryAtomSourceType;
  followUpGesture?: AppliedGesture;
} {
  switch (destination) {
    case 'keep':        return { sourceType: 'spontaneous' };
    case 'ideas':       return { sourceType: 'idea' };
    case 'decisions':   return { sourceType: 'decision' };
    case 'changes':     return { sourceType: 'change' };
    case 'journal':     return { sourceType: 'journal' };
    case 'dreams':      return { sourceType: 'dream' };
    case 'reflections': return { sourceType: 'reflection' };
    case 'protected':   return { sourceType: 'spontaneous', followUpGesture: 'protect' };
  }
}

export interface ConversationalContext {
  sessionId?: string;        // the conversation session id
  turnIndex?: number;        // the turn this utterance belongs to
  // For gesture instructions, the orchestration layer resolves which atom
  // 'this'/'that_thread' refers to, then passes its id here.
  targetAtomId?: string;
}

export type ConversationalKeepResult =
  | { kind: 'filing'; instruction: FilingInstruction; context: ConversationalContext }
  | { kind: 'gesture'; instruction: GestureInstruction; context: ConversationalContext }
  | { kind: 'offer_accepted'; offer: KeepOffer; context: ConversationalContext };

/**
 * Apply a recognized conversational result to the portfolio service.
 *
 * This is the bridge between recognition (above) and persistence (portfolio.ts).
 * The conversational layer recognizes; this function routes to the appropriate
 * gesture-shaped service call.
 *
 * Returns the resulting CrystallizedMemory (for filing / offer-accepted) or
 * the updated atom (for gesture). Throws if the orchestration context is
 * insufficient (e.g., gesture without targetAtomId).
 */
export async function applyConversationalKeepResult(
  memberId: string,
  result: ConversationalKeepResult,
): Promise<CrystallizedMemory> {
  switch (result.kind) {
    case 'filing': {
      const { sourceType, followUpGesture } = destinationToSource(result.instruction.destination);

      const input: KeepGestureInput = {
        memberId,
        sourceType,
        sourceId: null,
        title: result.instruction.excerpt,
        body: sourceType === 'spontaneous' ? result.instruction.excerpt : null,
      };

      const atom = await keepSource(memberId, input);

      if (followUpGesture) {
        return await applyAtomGesture(memberId, atom.id, { kind: followUpGesture as 'protect' });
      }
      return atom;
    }

    case 'gesture': {
      if (!result.context.targetAtomId) {
        throw new Error('applyConversationalKeepResult: gesture requires context.targetAtomId');
      }
      const gestureKind = result.instruction.gesture;
      // Map AppliedGesture → AtomGesture (they share names but have different unions)
      switch (gestureKind) {
        case 'still_alive':
          return await applyAtomGesture(memberId, result.context.targetAtomId, { kind: 'mark_still_alive' });
        case 'set_aside':
        case 'protect':
        case 'archive':
        case 'return_to_active':
          return await applyAtomGesture(memberId, result.context.targetAtomId, { kind: gestureKind });
      }
    }

    case 'offer_accepted': {
      const input: KeepGestureInput = {
        memberId,
        sourceType: 'session_excerpt',
        sourceId: result.context.sessionId ?? null,
        title: result.offer.excerpt,
        body: null,
      };
      // session_excerpt requires source_id (the session); if missing, fall back to spontaneous
      if (!input.sourceId) {
        input.sourceType = 'spontaneous';
        input.body = result.offer.excerpt;
      }

      const atom = await keepSource(memberId, input);

      // If the offer carried a suggested gesture (e.g., still_alive), apply it.
      if (result.offer.suggestedGesture) {
        const g = result.offer.suggestedGesture;
        switch (g) {
          case 'still_alive':
            return await applyAtomGesture(memberId, atom.id, { kind: 'mark_still_alive' });
          case 'set_aside':
          case 'protect':
          case 'archive':
          case 'return_to_active':
            return await applyAtomGesture(memberId, atom.id, { kind: g });
        }
      }
      return atom;
    }
  }
}
