// lib/dialogue/ConciseDialogueSystem.ts
// Ensures Oracle communication is concise, meaningful, and free of stage directions
"use strict";

export interface DialogueRules {
  maxWordsDefault: number;
  maxWordsExpanded: number;
  preferredSentenceLength: number;
  removeStageDirections: boolean;
  removeSubtext: boolean;
}

export class ConciseDialogueSystem {
  private static rules: DialogueRules = {
    maxWordsDefault: 40,      // Most responses under 40 words
    maxWordsExpanded: 120,     // Extended responses when needed
    preferredSentenceLength: 12, // Average words per sentence
    removeStageDirections: true,
    removeSubtext: true
  };

  /**
   * Core principle: Less words, more meaning
   */
  private static concisePrinciples = {
    // Replace verbose patterns with concise ones
    replacements: new Map([
      // Wordy -> Concise
      ["I am sensing that you", "You"],
      ["What I'm hearing is", ""],
      ["It seems to me that", ""],
      ["I want to acknowledge", ""],
      ["Let me reflect back", ""],
      ["What I notice is", ""],
      ["I'm curious about", "Tell me about"],
      ["I wonder if perhaps", "Perhaps"],
      ["It sounds like you're saying", ""],
      ["What I'm understanding is", ""],
      ["Allow me to", "I'll"],
      ["I would like to", "I'll"],
      ["In order to", "To"],
      ["Due to the fact that", "Because"],
      ["At this point in time", "Now"],
      ["In the event that", "If"],
      ["Has the ability to", "Can"],
      ["Is able to", "Can"],
      ["Make an attempt", "Try"],
      ["Take into consideration", "Consider"],
    ]),

    // Remove filler phrases entirely
    fillers: [
      "you know",
      "I mean",
      "sort of",
      "kind of",
      "basically",
      "actually",
      "literally",
      "honestly",
      "to be honest",
      "if that makes sense",
      "does that make sense",
      "you see",
      "so to speak",
      "as it were",
      "in a sense",
      "in a way"
    ]
  };

  /**
   * Process text for concise, meaningful delivery
   */
  public static processConcise(text: string, context?: { needsExpansion?: boolean }): string {
    let processed = text;

    // Step 1: Remove all stage directions and subtext
    if (this.rules.removeStageDirections) {
      processed = this.removeAllStageDirections(processed);
    }

    // Step 2: Apply concise replacements
    this.concisePrinciples.replacements.forEach((concise, wordy) => {
      const pattern = new RegExp(wordy, 'gi');
      processed = processed.replace(pattern, concise);
    });

    // Step 3: Remove filler phrases
    this.concisePrinciples.fillers.forEach(filler => {
      const pattern = new RegExp(`\\b${filler}\\b[,]?`, 'gi');
      processed = processed.replace(pattern, '');
    });

    // Step 4: Clean up redundant punctuation and spacing
    processed = this.cleanPunctuation(processed);

    // Step 5: Check word count and trim if needed
    const wordCount = processed.split(/\s+/).length;
    const maxWords = context?.needsExpansion ?
      this.rules.maxWordsExpanded :
      this.rules.maxWordsDefault;

    if (wordCount > maxWords) {
      processed = this.trimToEssence(processed, maxWords);
    }

    return processed.trim();
  }

  /**
   * Remove ALL stage directions, actions, and narrative text
   */
  private static removeAllStageDirections(text: string): string {
    let cleaned = text;

    // Remove anything between asterisks
    cleaned = cleaned.replace(/\*[^*]*\*/g, '');

    // Remove anything between parentheses
    cleaned = cleaned.replace(/\([^)]*\)/g, '');

    // Remove anything between square brackets
    cleaned = cleaned.replace(/\[[^\]]*\]/g, '');

    // Remove angle bracket directions
    cleaned = cleaned.replace(/<[^>]*>/g, '');

    // Remove lines that start with stage direction indicators
    const lines = cleaned.split('\n');
    const spokenLines = lines.filter(line => {
      const trimmed = line.trim();
      // Skip lines that look like stage directions
      if (trimmed.startsWith('Stage:') ||
          trimmed.startsWith('Action:') ||
          trimmed.startsWith('Note:') ||
          trimmed.startsWith('(') ||
          trimmed.startsWith('[') ||
          trimmed.startsWith('*')) {
        return false;
      }
      return trimmed.length > 0;
    });

    return spokenLines.join(' ');
  }

  /**
   * Clean up punctuation after processing
   */
  private static cleanPunctuation(text: string): string {
    let cleaned = text;

    // Fix multiple spaces
    cleaned = cleaned.replace(/\s+/g, ' ');

    // Fix space before punctuation
    cleaned = cleaned.replace(/\s+([.,!?;:])/g, '$1');

    // Fix multiple punctuation
    cleaned = cleaned.replace(/([.,!?;:])+/g, '$1');

    // Fix empty parentheses or brackets left behind
    cleaned = cleaned.replace(/\(\s*\)/g, '');
    cleaned = cleaned.replace(/\[\s*\]/g, '');

    // Ensure space after punctuation
    cleaned = cleaned.replace(/([.,!?;:])([A-Z])/g, '$1 $2');

    return cleaned;
  }

  /**
   * Trim text to essential meaning
   */
  private static trimToEssence(text: string, maxWords: number): string {
    const sentences = text.split(/[.!?]+/);
    const essential: string[] = [];
    let wordCount = 0;

    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (!trimmed) continue;

      const words = trimmed.split(/\s+/);

      // Stop if adding this sentence would exceed limit
      if (wordCount + words.length > maxWords && essential.length > 0) {
        break;
      }

      essential.push(trimmed);
      wordCount += words.length;
    }

    // Join with periods and ensure proper ending
    let result = essential.join('. ');
    if (!result.match(/[.!?]$/)) {
      result += '.';
    }

    return result;
  }

  /**
   * Transform verbose response to concise wisdom
   */
  public static distillToEssence(text: string): string {
    // First, process for conciseness
    let distilled = this.processConcise(text);

    // Apply essence patterns for oracle-like wisdom
    const essencePatterns = [
      // Questions that invite depth
      { pattern: /^(?:So |And |But )?[Ww]hat /, replacement: "What " },
      { pattern: /^(?:So |And |But )?[Hh]ow /, replacement: "How " },
      { pattern: /^(?:So |And |But )?[Ww]here /, replacement: "Where " },
      { pattern: /^(?:So |And |But )?[Ww]hen /, replacement: "When " },
      { pattern: /^(?:So |And |But )?[Ww]hy /, replacement: "Why " },

      // Direct statements
      { pattern: /^I think that /i, replacement: "" },
      { pattern: /^I believe that /i, replacement: "" },
      { pattern: /^I feel that /i, replacement: "" },
      { pattern: /^It appears that /i, replacement: "" },
      { pattern: /^It seems that /i, replacement: "" },
    ];

    essencePatterns.forEach(({ pattern, replacement }) => {
      distilled = distilled.replace(pattern, replacement);
    });

    return distilled;
  }

  /**
   * Ensure response is appropriate length for context
   */
  public static calibrateLength(text: string, context: {
    isQuestion?: boolean;
    isReflection?: boolean;
    needsElaboration?: boolean;
  }): string {
    let processed = text;

    // Questions should be shortest
    if (context.isQuestion) {
      processed = this.processConcise(text, { needsExpansion: false });
      // Ensure it ends with a question mark
      if (!processed.endsWith('?')) {
        processed = processed.replace(/[.]$/, '?');
      }
    }
    // Reflections can be slightly longer
    else if (context.isReflection) {
      processed = this.processConcise(text, { needsExpansion: false });
    }
    // Elaborations when specifically needed
    else if (context.needsElaboration) {
      processed = this.processConcise(text, { needsExpansion: true });
    }
    // Default: concise
    else {
      processed = this.processConcise(text, { needsExpansion: false });
    }

    return processed;
  }
}

// Export singleton for easy use
export const conciseDialogue = new ConciseDialogueSystem();