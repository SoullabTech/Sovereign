/**
 * Voice & Text Command Detector
 *
 * Detects sovereign commands in user speech or typed input.
 * Commands change state — they don't become therapeutic content.
 *
 * Three command types:
 *   1. Style   — conversation length/depth (classic, walking, adaptive)
 *   2. Mode    — MAIA voice mode (talk, care, scribe, sanctuary)
 *   3. Lens    — therapeutic framework (jungian, cbt, somatic, etc.)
 *
 * Commands are DIRECTIVE — they require an action verb prefix to avoid
 * triggering on casual mentions like "I have trauma" or "I feel somatic".
 * Exception: explicit "<framework> mode" phrases are always treated as commands.
 */

import type { TherapeuticFramework } from '@/lib/consciousness/therapeuticFrameworks';

// ============================================================================
// Types
// ============================================================================

/** Conversation style (response length) — legacy system */
export type ConversationMode = 'classic' | 'walking' | 'adaptive';

/** MAIA voice mode — maps to ListeningMode in OracleConversation */
export type MaiaMode = 'talk' | 'care' | 'scribe' | 'sanctuary';

/** Therapeutic lens — maps to TherapeuticFramework IDs */
export type MaiaLens = TherapeuticFramework;

export type MaiaCommand =
  | { type: 'style'; style: ConversationMode }
  | { type: 'mode'; mode: MaiaMode }
  | { type: 'lens'; lens: MaiaLens };

export type CommandDisposition = 'EXECUTE' | 'DO_NOT_EXECUTE' | 'CLARIFY';

export interface CommandSpan {
  start: number;
  end: number;
  text: string;
}

export interface CommandParseResult {
  /** Exact member-authored text supplied to the detector. Never rewritten. */
  authoredText: string;
  /** Whether this utterance should execute interface state, not merely mention it. */
  disposition: CommandDisposition;
  commands: MaiaCommand[];
  /** Provenance for command clauses derived from authoredText. */
  commandSpans: CommandSpan[];
  /** Derived non-command content. Never substitutes for authoredText in the transcript. */
  conversationalText: string;
  /**
   * Backward-compatible alias for conversationalText.
   * @deprecated Use conversationalText and preserve authoredText separately.
   */
  cleanedText: string;
  onlyCommands: boolean;
}

// ============================================================================
// Legacy style detection (preserved for backward compatibility)
// ============================================================================

export interface VoiceCommandResult {
  detected: boolean;
  mode?: ConversationMode;
  confidence: number;
  originalText: string;
  cleanedText: string;
}

const STYLE_PATTERNS: Record<ConversationMode, RegExp[]> = {
  classic: [
    /\b(switch to |go to |enter |activate )?deep mode\b/i,
    /\b(switch to |go to |enter |activate )?classic mode\b/i,
    /\b(switch to |go to |enter |activate )?conversation mode\b/i,
    /\blet's go deeper\b/i,
    /\bfull responses?\b/i,
  ],
  walking: [
    /\b(switch to |go to |enter |activate )?walking mode\b/i,
    /\b(switch to |go to |enter |activate )?walk mode\b/i,
    /\b(switch to |go to |enter |activate )?companion mode\b/i,
    /\bkeep it brief\b/i,
    /\bshort responses?\b/i,
    /\bjust listening\b/i,
  ],
  adaptive: [
    /\b(switch to |go to |enter |activate )?adaptive mode\b/i,
    /\b(switch to |go to |enter |activate )?auto mode\b/i,
    /\bmatch my style\b/i,
    /\bfollow my lead\b/i,
  ]
};

// ============================================================================
// Non-destructive command-intent grammar
// ============================================================================

type AnchoredCommandPattern = {
  pattern: RegExp;
  command: MaiaCommand;
};

const DIRECTIVE_PREFIX = String.raw`(?:maia\s*,?\s*)?(?:please\s+)?`;

const ANCHORED_COMMAND_PATTERNS: AnchoredCommandPattern[] = [
  // Exact bare commands preserve the old shorthand without allowing those same
  // words to become commands when embedded in a question or narrative sentence.
  { pattern: /^(?:maia\s*,?\s*)?talk\s+mode(?:[.!]\s*)?$/i, command: { type: 'mode', mode: 'talk' } },
  { pattern: /^(?:maia\s*,?\s*)?care\s+mode(?:[.!]\s*)?$/i, command: { type: 'mode', mode: 'care' } },
  { pattern: /^(?:maia\s*,?\s*)?scribe\s+mode(?:[.!]\s*)?$/i, command: { type: 'mode', mode: 'scribe' } },
  { pattern: /^(?:maia\s*,?\s*)?sanctuary\s+mode(?:[.!]\s*)?$/i, command: { type: 'mode', mode: 'sanctuary' } },

  { pattern: /^(?:maia\s*,?\s*)?(?:jungian|depth\s+psychology)\s+(?:mode|lens)(?:[.!]\s*)?$/i, command: { type: 'lens', lens: 'jungian' } },
  { pattern: /^(?:maia\s*,?\s*)?cbt\s+(?:mode|lens)(?:[.!]\s*)?$/i, command: { type: 'lens', lens: 'cbt' } },
  { pattern: /^(?:maia\s*,?\s*)?somatic\s+(?:mode|lens)(?:[.!]\s*)?$/i, command: { type: 'lens', lens: 'somatic' } },
  { pattern: /^(?:maia\s*,?\s*)?ifs\s+(?:mode|lens)(?:[.!]\s*)?$/i, command: { type: 'lens', lens: 'ifs' } },
  { pattern: /^(?:maia\s*,?\s*)?relational\s+(?:mode|lens)(?:[.!]\s*)?$/i, command: { type: 'lens', lens: 'relational' } },
  { pattern: /^(?:maia\s*,?\s*)?humanistic\s+(?:mode|lens)(?:[.!]\s*)?$/i, command: { type: 'lens', lens: 'humanistic' } },
  { pattern: /^(?:maia\s*,?\s*)?existential\s+(?:mode|lens)(?:[.!]\s*)?$/i, command: { type: 'lens', lens: 'existential' } },
  { pattern: /^(?:maia\s*,?\s*)?hemispheric\s+(?:mode|lens)(?:[.!]\s*)?$/i, command: { type: 'lens', lens: 'hemispheric' } },
  { pattern: /^(?:maia\s*,?\s*)?alchemical\s+(?:mode|lens)(?:[.!]\s*)?$/i, command: { type: 'lens', lens: 'alchemical' } },
  { pattern: /^(?:maia\s*,?\s*)?(?:archetypal|astrology)\s+(?:mode|lens)(?:[.!]\s*)?$/i, command: { type: 'lens', lens: 'archetypal' } },
  { pattern: /^(?:maia\s*,?\s*)?tcm\s+(?:mode|lens)(?:[.!]\s*)?$/i, command: { type: 'lens', lens: 'tcm' } },

  { pattern: /^(?:maia\s*,?\s*)?(?:deep|classic|conversation)\s+mode(?:[.!]\s*)?$/i, command: { type: 'style', style: 'classic' } },
  { pattern: /^(?:maia\s*,?\s*)?(?:walking|walk|companion)\s+mode(?:[.!]\s*)?$/i, command: { type: 'style', style: 'walking' } },
  { pattern: /^(?:maia\s*,?\s*)?(?:adaptive|auto)\s+mode(?:[.!]\s*)?$/i, command: { type: 'style', style: 'adaptive' } },

  // Sanctuary exit MUST precede entry so "leave sanctuary mode" can never be
  // swallowed by a generic sanctuary phrase.
  { pattern: new RegExp(`^${DIRECTIVE_PREFIX}(?:exit|disable|turn\\s+off|leave)\\s+sanctuary(?:\\s+mode)?\\b`, 'i'), command: { type: 'mode', mode: 'talk' } },
  { pattern: new RegExp(`^${DIRECTIVE_PREFIX}(?:enter|enable|turn\\s+on|activate|switch\\s+to|go\\s+to)\\s+sanctuary(?:\\s+mode)?\\b`, 'i'), command: { type: 'mode', mode: 'sanctuary' } },

  { pattern: new RegExp(`^${DIRECTIVE_PREFIX}(?:switch\\s+to|go\\s+to|back\\s+to|enter)\\s+talk(?:\\s+mode)?\\b`, 'i'), command: { type: 'mode', mode: 'talk' } },
  { pattern: new RegExp(`^${DIRECTIVE_PREFIX}(?:switch\\s+to|go\\s+to|enter)\\s+(?:care|counsel)(?:\\s+mode)?\\b`, 'i'), command: { type: 'mode', mode: 'care' } },
  { pattern: new RegExp(`^${DIRECTIVE_PREFIX}(?:switch\\s+to|go\\s+to|enter)\\s+(?:scribe|note)(?:\\s+mode)?\\b`, 'i'), command: { type: 'mode', mode: 'scribe' } },

  { pattern: new RegExp(`^${DIRECTIVE_PREFIX}(?:use|go|switch\\s+to|try)\\s+(?:the\\s+|a\\s+)?(?:jungian|depth\\s+psychology|analytical\\s+psychology)(?:\\s+(?:mode|lens|approach))?(?:\\s+for\\s+(?:this|that))?\\b`, 'i'), command: { type: 'lens', lens: 'jungian' } },
  { pattern: new RegExp(`^${DIRECTIVE_PREFIX}(?:use|go|switch\\s+to|try)\\s+(?:the\\s+|a\\s+)?(?:cbt|cognitive\\s+behavioral|cognitive-behavioral)(?:\\s+(?:mode|lens|approach))?(?:\\s+for\\s+(?:this|that))?\\b`, 'i'), command: { type: 'lens', lens: 'cbt' } },
  { pattern: new RegExp(`^${DIRECTIVE_PREFIX}(?:use|go|switch\\s+to|try)\\s+(?:the\\s+|a\\s+)?(?:somatic|body[- ]based|nervous\\s+system)(?:\\s+(?:mode|lens|approach))?(?:\\s+for\\s+(?:this|that))?\\b`, 'i'), command: { type: 'lens', lens: 'somatic' } },
  { pattern: new RegExp(`^${DIRECTIVE_PREFIX}(?:use|go|switch\\s+to|try)\\s+(?:the\\s+|a\\s+)?(?:ifs|parts\\s+work|internal\\s+family\\s+systems?)(?:\\s+(?:mode|lens|approach))?(?:\\s+for\\s+(?:this|that))?\\b`, 'i'), command: { type: 'lens', lens: 'ifs' } },
  { pattern: new RegExp(`^${DIRECTIVE_PREFIX}(?:use|go|switch\\s+to|try)\\s+(?:the\\s+|a\\s+)?(?:relational|attachment)(?:\\s+(?:mode|lens|approach))?(?:\\s+for\\s+(?:this|that))?\\b`, 'i'), command: { type: 'lens', lens: 'relational' } },
  { pattern: new RegExp(`^${DIRECTIVE_PREFIX}(?:use|go|switch\\s+to|try)\\s+(?:the\\s+|a\\s+)?(?:humanistic|person[- ]centered|rogerian)(?:\\s+(?:mode|lens|approach))?(?:\\s+for\\s+(?:this|that))?\\b`, 'i'), command: { type: 'lens', lens: 'humanistic' } },
  { pattern: new RegExp(`^${DIRECTIVE_PREFIX}(?:use|go|switch\\s+to|try)\\s+(?:the\\s+|a\\s+)?existential(?:\\s+(?:mode|lens|approach))?(?:\\s+for\\s+(?:this|that))?\\b`, 'i'), command: { type: 'lens', lens: 'existential' } },
  { pattern: new RegExp(`^${DIRECTIVE_PREFIX}(?:use|go|switch\\s+to|try)\\s+(?:the\\s+|a\\s+)?(?:hemispheric|mcgilchrist|divided\\s+brain)(?:\\s+(?:mode|lens|approach))?(?:\\s+for\\s+(?:this|that))?\\b`, 'i'), command: { type: 'lens', lens: 'hemispheric' } },
  { pattern: new RegExp(`^${DIRECTIVE_PREFIX}(?:use|go|switch\\s+to|try)\\s+(?:the\\s+|a\\s+)?(?:alchemical|alchemy)(?:\\s+(?:mode|lens|approach))?(?:\\s+for\\s+(?:this|that))?\\b`, 'i'), command: { type: 'lens', lens: 'alchemical' } },
  { pattern: new RegExp(`^${DIRECTIVE_PREFIX}(?:use|go|switch\\s+to|try)\\s+(?:the\\s+|a\\s+)?(?:archetypal|astrology|natal\\s+chart|transits)(?:\\s+(?:mode|lens|approach))?(?:\\s+for\\s+(?:this|that))?\\b`, 'i'), command: { type: 'lens', lens: 'archetypal' } },
  { pattern: new RegExp(`^${DIRECTIVE_PREFIX}(?:use|go|switch\\s+to|try)\\s+(?:the\\s+|a\\s+)?(?:tcm|chinese\\s+medicine|five\\s+elements?)(?:\\s+(?:mode|lens|approach))?(?:\\s+for\\s+(?:this|that))?\\b`, 'i'), command: { type: 'lens', lens: 'tcm' } },
  { pattern: new RegExp(`^${DIRECTIVE_PREFIX}(?:use|go|switch\\s+to|back\\s+to)\\s+(?:auto|default|maia|spiralogic)(?:\\s+(?:mode|lens))?\\b`, 'i'), command: { type: 'lens', lens: 'auto' } },
  { pattern: new RegExp(`^${DIRECTIVE_PREFIX}(?:clear|reset|remove)\\s+(?:the\\s+)?(?:lens|framework)\\b`, 'i'), command: { type: 'lens', lens: 'auto' } },

  { pattern: new RegExp(`^${DIRECTIVE_PREFIX}(?:switch\\s+to|go\\s+to|enter|activate)\\s+(?:deep|classic|conversation)\\s+mode\\b`, 'i'), command: { type: 'style', style: 'classic' } },
  { pattern: new RegExp(`^${DIRECTIVE_PREFIX}(?:let['’]s\\s+go\\s+deeper|full\\s+responses?)\\b`, 'i'), command: { type: 'style', style: 'classic' } },
  { pattern: new RegExp(`^${DIRECTIVE_PREFIX}(?:switch\\s+to|go\\s+to|enter|activate)\\s+(?:walking|walk|companion)\\s+mode\\b`, 'i'), command: { type: 'style', style: 'walking' } },
  { pattern: new RegExp(`^${DIRECTIVE_PREFIX}(?:keep\\s+it\\s+brief|short\\s+responses?|just\\s+listening)\\b`, 'i'), command: { type: 'style', style: 'walking' } },
  { pattern: new RegExp(`^${DIRECTIVE_PREFIX}(?:switch\\s+to|go\\s+to|enter|activate)\\s+(?:adaptive|auto)\\s+mode\\b`, 'i'), command: { type: 'style', style: 'adaptive' } },
  { pattern: new RegExp(`^${DIRECTIVE_PREFIX}(?:match\\s+my\\s+style|follow\\s+my\\s+lead)\\b`, 'i'), command: { type: 'style', style: 'adaptive' } },
];

const COMMAND_TARGET_WORDS = /\b(?:talk|care|counsel|scribe|note|sanctuary|jungian|depth psychology|analytical psychology|cbt|cognitive behavioral|cognitive-behavioral|somatic|body[- ]based|nervous system|ifs|parts work|internal family systems|relational|attachment|humanistic|person[- ]centered|rogerian|existential|hemispheric|mcgilchrist|divided brain|alchemical|alchemy|archetypal|astrology|natal chart|transits|tcm|chinese medicine|five elements|deep mode|classic mode|conversation mode|walking mode|walk mode|companion mode|adaptive mode|auto mode)\b/i;

function ambiguousCommandQuestion(text: string): boolean {
  if (!COMMAND_TARGET_WORDS.test(text)) return false;
  return /^(?:could|would|should|can)\s+(?:we|you)\b/i.test(text)
    || /^what\s+if\b/i.test(text);
}

function stripCommandSeparator(text: string): { consumed: number; remainder: string } {
  const separator = text.match(/^\s*(?:(?:[.;:!?—–-]+\s*)|(?:,?\s*(?:and|then)\s+))/i);
  if (!separator) return { consumed: 0, remainder: text };
  return { consumed: separator[0].length, remainder: text.slice(separator[0].length) };
}

// ============================================================================
// Main detection function — handles all command types
// ============================================================================

/**
 * Parse explicit MAIA interface commands from user input without rewriting the
 * member-authored utterance.
 *
 * authoredText is immutable evidence. conversationalText is a derived view of
 * any content following an explicit leading command clause.
 *
 * Usage:
 *   const result = detectMaiaCommands("MAIA switch to care mode and use the Jungian lens. I feel stuck.");
 *   // result.authoredText = original input, unchanged
 *   // result.commands = [{ type: 'mode', mode: 'care' }, { type: 'lens', lens: 'jungian' }]
 *   // result.conversationalText = "I feel stuck."
 *   // result.onlyCommands = false
 */
export function detectMaiaCommands(input: string): CommandParseResult {
  const authoredText = input;
  const leadingWhitespace = authoredText.match(/^\s*/)?.[0].length ?? 0;
  const trimmed = authoredText.slice(leadingWhitespace);

  if (!trimmed) {
    return {
      authoredText,
      disposition: 'DO_NOT_EXECUTE',
      commands: [],
      commandSpans: [],
      conversationalText: authoredText,
      cleanedText: authoredText,
      onlyCommands: false,
    };
  }

  // Questions, hypotheticals, quotations, and autobiographical mentions are not
  // interface authority merely because they contain command-shaped words.
  if (ambiguousCommandQuestion(trimmed)) {
    return {
      authoredText,
      disposition: 'CLARIFY',
      commands: [],
      commandSpans: [],
      conversationalText: authoredText,
      cleanedText: authoredText,
      onlyCommands: false,
    };
  }

  if (/^(?:can|could|would|should|do|does|did|is|are|was|were|what|why|how|when|where|who|may|might)\b/i.test(trimmed)) {
    return {
      authoredText,
      disposition: 'DO_NOT_EXECUTE',
      commands: [],
      commandSpans: [],
      conversationalText: authoredText,
      cleanedText: authoredText,
      onlyCommands: false,
    };
  }

  const commands: MaiaCommand[] = [];
  const commandSpans: CommandSpan[] = [];
  let cursor = leadingWhitespace;
  let remaining = authoredText.slice(cursor);

  // Parse only an explicit leading command clause (or a chain joined by
  // "and"/"then"). Command-like substrings later in a sentence are mentions.
  for (let guard = 0; guard < 4; guard += 1) {
    let matched: { text: string; command: MaiaCommand } | null = null;

    for (const candidate of ANCHORED_COMMAND_PATTERNS) {
      const match = remaining.match(candidate.pattern);
      if (match?.[0]) {
        matched = { text: match[0], command: candidate.command };
        break;
      }
    }

    if (!matched) break;

    commands.push(matched.command);
    commandSpans.push({
      start: cursor,
      end: cursor + matched.text.length,
      text: authoredText.slice(cursor, cursor + matched.text.length),
    });

    cursor += matched.text.length;
    remaining = authoredText.slice(cursor);

    const separator = stripCommandSeparator(remaining);
    if (separator.consumed === 0) break;

    cursor += separator.consumed;
    remaining = separator.remainder;
  }

  if (commands.length === 0) {
    return {
      authoredText,
      disposition: 'DO_NOT_EXECUTE',
      commands: [],
      commandSpans: [],
      conversationalText: authoredText,
      cleanedText: authoredText,
      onlyCommands: false,
    };
  }

  const conversationalText = remaining
    .replace(/^\s*[.,;:!?&—–-]+\s*/, '')
    .trim();
  const onlyCommands = conversationalText.length === 0;

  return {
    authoredText,
    disposition: 'EXECUTE',
    commands,
    commandSpans,
    conversationalText,
    cleanedText: conversationalText,
    onlyCommands,
  };
}

// ============================================================================
// Confirmation messages
// ============================================================================

const MODE_CONFIRMATIONS: Record<MaiaMode, string[]> = {
  talk: [
    "Back to Talk mode.",
    "Talk mode.",
  ],
  care: [
    "Switching to Care mode. I'm here.",
    "Care mode. What needs attention?",
  ],
  scribe: [
    "Scribe mode. I'm witnessing.",
    "Note mode. I'm here to observe.",
  ],
  sanctuary: [
    "Sanctuary mode. This won't be remembered.",
    "Entering sanctuary. Speak freely.",
  ],
};

export function getMaiaCommandConfirmation(commands: MaiaCommand[]): string | null {
  const parts: string[] = [];

  for (const cmd of commands) {
    if (cmd.type === 'mode') {
      const options = MODE_CONFIRMATIONS[cmd.mode];
      parts.push(options[Math.floor(Math.random() * options.length)]);
    }
    if (cmd.type === 'lens' && cmd.lens !== 'auto') {
      parts.push(`${cmd.lens.charAt(0).toUpperCase() + cmd.lens.slice(1)} lens active.`);
    }
    if (cmd.type === 'lens' && cmd.lens === 'auto') {
      parts.push('Lens cleared.');
    }
  }

  return parts.length > 0 ? parts.join(' ') : null;
}

// ============================================================================
// Legacy API (backward compatible)
// ============================================================================

/**
 * @deprecated Use detectMaiaCommands() instead. Kept for backward compatibility.
 */
export function detectVoiceCommand(text: string): VoiceCommandResult {
  const trimmed = text.trim();

  for (const [mode, patterns] of Object.entries(STYLE_PATTERNS)) {
    for (const pattern of patterns) {
      const match = pattern.exec(trimmed);
      if (match) {
        const cleanedText = trimmed.replace(pattern, '').trim();
        return {
          detected: true,
          mode: mode as ConversationMode,
          confidence: 1.0,
          originalText: trimmed,
          cleanedText: cleanedText || ''
        };
      }
    }
  }

  return {
    detected: false,
    confidence: 0,
    originalText: trimmed,
    cleanedText: trimmed
  };
}

export function isOnlyModeSwitch(text: string): boolean {
  const result = detectVoiceCommand(text);
  return result.detected && result.cleanedText.length === 0;
}

export function getModeConfirmation(mode: ConversationMode): string {
  const confirmations: Record<ConversationMode, string[]> = {
    classic: [
      "Switching to deep conversation mode.",
      "Going deeper with you.",
      "Full presence mode.",
    ],
    walking: [
      "Walking with you.",
      "Brief mode.",
      "Here, quietly.",
    ],
    adaptive: [
      "Matching your style.",
      "Following your lead.",
      "Adapting to you.",
    ]
  };

  const options = confirmations[mode];
  return options[Math.floor(Math.random() * options.length)];
}
