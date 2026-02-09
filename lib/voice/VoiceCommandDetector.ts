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

export interface CommandParseResult {
  commands: MaiaCommand[];
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
// Mode patterns — require directive prefix to avoid false positives
// ============================================================================

const MODE_PATTERNS: Array<{ pattern: RegExp; mode: MaiaMode }> = [
  // Talk mode
  { pattern: /\b(switch to|go to|back to|enter)\s+talk\s*(mode)?\b/i, mode: 'talk' },
  { pattern: /\btalk mode\b/i, mode: 'talk' },

  // Care mode
  { pattern: /\b(switch to|go to|enter)\s+(care|counsel)\s*(mode)?\b/i, mode: 'care' },
  { pattern: /\bcare mode\b/i, mode: 'care' },

  // Scribe mode
  { pattern: /\b(switch to|go to|enter)\s+(scribe|note)\s*(mode)?\b/i, mode: 'scribe' },
  { pattern: /\bscribe mode\b/i, mode: 'scribe' },

  // Sanctuary — entering
  { pattern: /\b(enter|enable|turn on|activate|switch to|go to)\s+sanctuary\s*(mode)?\b/i, mode: 'sanctuary' },
  { pattern: /\bsanctuary mode\b/i, mode: 'sanctuary' },

  // Sanctuary — exiting (maps back to talk)
  { pattern: /\b(exit|disable|turn off|leave)\s+sanctuary\s*(mode)?\b/i, mode: 'talk' },
];

// ============================================================================
// Lens patterns — directive only, to avoid "I have trauma" triggering a switch
// ============================================================================

const LENS_PATTERNS: Array<{ pattern: RegExp; lens: MaiaLens }> = [
  // Jungian / depth psychology
  { pattern: /\b(use|go|switch to|try)\s+(jungian|depth psychology|analytical psychology)\b/i, lens: 'jungian' },
  { pattern: /\bjungian\s+(mode|lens)\b/i, lens: 'jungian' },
  { pattern: /\bdepth psychology\s+(mode|lens)\b/i, lens: 'jungian' },

  // CBT
  { pattern: /\b(use|go|switch to|try)\s+(cbt|cognitive behavioral|cognitive-behavioral)\b/i, lens: 'cbt' },
  { pattern: /\bcbt\s+(mode|lens)\b/i, lens: 'cbt' },

  // Somatic
  { pattern: /\b(use|go|switch to|try)\s+(somatic|body[- ]based|nervous system)\s*(mode|lens|approach)?\b/i, lens: 'somatic' },
  { pattern: /\bsomatic\s+(mode|lens)\b/i, lens: 'somatic' },

  // IFS / parts work
  { pattern: /\b(use|go|switch to|try)\s+(ifs|parts work|internal family systems?)\b/i, lens: 'ifs' },
  { pattern: /\bifs\s+(mode|lens)\b/i, lens: 'ifs' },

  // Relational
  { pattern: /\b(use|go|switch to|try)\s+(relational|attachment)\s*(mode|lens|approach)?\b/i, lens: 'relational' },
  { pattern: /\brelational\s+(mode|lens)\b/i, lens: 'relational' },

  // Humanistic
  { pattern: /\b(use|go|switch to|try)\s+(humanistic|person[- ]centered|rogerian)\b/i, lens: 'humanistic' },
  { pattern: /\bhumanistic\s+(mode|lens)\b/i, lens: 'humanistic' },

  // Existential
  { pattern: /\b(use|go|switch to|try)\s+(existential)\s*(mode|lens|approach)?\b/i, lens: 'existential' },
  { pattern: /\bexistential\s+(mode|lens)\b/i, lens: 'existential' },

  // Hemispheric / McGilchrist
  { pattern: /\b(use|go|switch to|try)\s+(hemispheric|mcgilchrist|divided brain)\b/i, lens: 'hemispheric' },
  { pattern: /\bhemispheric\s+(mode|lens)\b/i, lens: 'hemispheric' },

  // Alchemical
  { pattern: /\b(use|go|switch to|try)\s+(alchemical|alchemy)\s*(mode|lens)?\b/i, lens: 'alchemical' },
  { pattern: /\balchemical\s+(mode|lens)\b/i, lens: 'alchemical' },

  // Archetypal / astrology
  { pattern: /\b(use|go|switch to|try)\s+(archetypal|astrology|natal chart|transits)\s*(mode|lens)?\b/i, lens: 'archetypal' },
  { pattern: /\b(archetypal|astrology)\s+(mode|lens)\b/i, lens: 'archetypal' },

  // TCM
  { pattern: /\b(use|go|switch to|try)\s+(tcm|chinese medicine|five elements?)\s*(mode|lens)?\b/i, lens: 'tcm' },
  { pattern: /\btcm\s+(mode|lens)\b/i, lens: 'tcm' },

  // Reset to auto/default
  { pattern: /\b(use|go|switch to|back to)\s+(auto|default|maia|spiralogic)\s*(mode|lens)?\b/i, lens: 'auto' },
  { pattern: /\b(clear|reset|remove)\s+(lens|framework)\b/i, lens: 'auto' },
];

// ============================================================================
// Main detection function — handles all command types
// ============================================================================

/**
 * Parse all MAIA commands from user input (voice transcript or typed text).
 * Returns the cleaned text with command phrases removed.
 *
 * Usage:
 *   const result = detectMaiaCommands("MAIA switch to care mode and go Jungian. I feel stuck.");
 *   // result.commands = [{ type: 'mode', mode: 'care' }, { type: 'lens', lens: 'jungian' }]
 *   // result.cleanedText = "MAIA I feel stuck."
 *   // result.onlyCommands = false
 */
export function detectMaiaCommands(input: string): CommandParseResult {
  let text = input;
  const commands: MaiaCommand[] = [];

  // 1. Mode commands (check first — mode determines which lenses are valid)
  for (const { pattern, mode } of MODE_PATTERNS) {
    if (pattern.test(text)) {
      commands.push({ type: 'mode', mode });
      text = text.replace(pattern, ' ');
      break; // Only one mode command per message
    }
  }

  // 2. Lens commands
  for (const { pattern, lens } of LENS_PATTERNS) {
    if (pattern.test(text)) {
      commands.push({ type: 'lens', lens });
      text = text.replace(pattern, ' ');
      break; // Only one lens command per message
    }
  }

  // 3. Style commands (legacy — classic/walking/adaptive)
  for (const [style, patterns] of Object.entries(STYLE_PATTERNS)) {
    let found = false;
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        commands.push({ type: 'style', style: style as ConversationMode });
        text = text.replace(pattern, ' ');
        found = true;
        break;
      }
    }
    if (found) break;
  }

  // Clean up: collapse whitespace, trim, strip leading/trailing punctuation artifacts
  const cleanedText = text
    .replace(/\s+/g, ' ')
    .replace(/^\s*[.,;:!?&]\s*/, '')
    .trim();

  const onlyCommands = cleanedText.length === 0 && commands.length > 0;

  return { commands, cleanedText, onlyCommands };
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
