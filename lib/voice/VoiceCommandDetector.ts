/**
 * 🎤 Voice Command Detector
 * Detects mode switching commands in user speech
 *
 * Usage:
 * const detected = detectVoiceCommand(transcript);
 * if (detected) {
 *   switchToMode(detected.mode);
 * }
 */

export type ConversationMode = 'classic' | 'walking' | 'adaptive';

export interface VoiceCommandResult {
  detected: boolean;
  mode?: ConversationMode;
  confidence: number;
  originalText: string;
  cleanedText: string; // Text with command stripped out
}

const COMMAND_PATTERNS: Record<ConversationMode, RegExp[]> = {
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

/**
 * Detect voice commands for mode switching
 * Returns command info and cleaned text (without the command)
 */
export function detectVoiceCommand(text: string): VoiceCommandResult {
  const trimmed = text.trim();

  // Check each mode's patterns
  for (const [mode, patterns] of Object.entries(COMMAND_PATTERNS)) {
    for (const pattern of patterns) {
      const match = pattern.exec(trimmed);
      if (match) {
        // Remove the command from the text
        const cleanedText = trimmed.replace(pattern, '').trim();

        return {
          detected: true,
          mode: mode as ConversationMode,
          confidence: 1.0,
          originalText: trimmed,
          cleanedText: cleanedText || '' // If command was the only content, return empty string
        };
      }
    }
  }

  // No command detected
  return {
    detected: false,
    confidence: 0,
    originalText: trimmed,
    cleanedText: trimmed
  };
}

/**
 * Check if text is ONLY a mode switch command (no other content)
 * Useful for deciding whether to process the text or just acknowledge the switch
 */
export function isOnlyModeSwitch(text: string): boolean {
  const result = detectVoiceCommand(text);
  return result.detected && result.cleanedText.length === 0;
}

/**
 * Get confirmation message for mode switch
 */
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

/**
 * Example usage in OracleConversation:
 *
 * // In voice transcript processing:
 * const command = detectVoiceCommand(transcript);
 *
 * if (command.detected) {
 *   // Save new mode
 *   localStorage.setItem('conversation_mode', command.mode!);
 *   window.dispatchEvent(new Event('conversationStyleChanged'));
 *
 *   // If command was standalone, just acknowledge
 *   if (isOnlyModeSwitch(transcript)) {
 *     const confirmation = getModeConfirmation(command.mode!);
 *     // Display/speak confirmation
 *     return;
 *   }
 *
 *   // If command was part of message, process the rest
 *   processMessage(command.cleanedText);
 * }
 */
