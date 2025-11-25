// lib/voice/TTSPreprocessor.ts
// Preprocessor to fix OpenAI TTS issues (choppy audio, mid-sentence cuts)
"use strict";

export interface TTSProcessingOptions {
  provider: 'openai' | 'elevenlabs';
  maxSentenceLength?: number;
  insertNaturalPauses?: boolean;
  removeNewlines?: boolean;
  chunkForStreaming?: boolean;
}

export class TTSPreprocessor {
  // Maximum safe sentence length for OpenAI (words)
  private static readonly MAX_OPENAI_SENTENCE_WORDS = 25;

  // Maximum safe chunk length for streaming (characters)
  private static readonly MAX_CHUNK_CHARS = 200;

  /**
   * Main preprocessing pipeline for TTS
   */
  public static preprocessForTTS(
    text: string,
    options: TTSProcessingOptions = { provider: 'openai' }
  ): string | string[] {
    let processed = text;

    // Step 1: Critical - Remove problematic newlines that cause OpenAI to stop
    if (options.removeNewlines !== false) {
      processed = this.removeProblematicNewlines(processed);
    }

    // Step 2: Clean up formatting that causes issues
    processed = this.cleanFormatting(processed);

    // Step 3: Split long sentences that cause cutoffs
    if (options.provider === 'openai') {
      processed = this.splitLongSentences(processed, options.maxSentenceLength);
    }

    // Step 4: Add natural pause markers
    if (options.insertNaturalPauses) {
      processed = this.insertNaturalPauses(processed);
    }

    // Step 5: Chunk for streaming if requested
    if (options.chunkForStreaming) {
      return this.chunkForStreaming(processed);
    }

    return processed;
  }

  /**
   * Remove newlines that cause OpenAI TTS to stop
   */
  private static removeProblematicNewlines(text: string): string {
    // Replace multiple newlines with single space
    let cleaned = text.replace(/\n\s*\n/g, ' ');

    // Replace single newlines with space
    cleaned = cleaned.replace(/\n/g, ' ');

    // Clean up multiple spaces
    cleaned = cleaned.replace(/\s+/g, ' ');

    return cleaned.trim();
  }

  /**
   * Clean formatting issues that cause TTS problems
   */
  private static cleanFormatting(text: string): string {
    let cleaned = text;

    // CRITICAL: Remove stage directions and internal notes
    cleaned = cleaned.replace(/\*[^*]+\*/g, ''); // Remove *actions*
    cleaned = cleaned.replace(/\([^)]+\)/g, ''); // Remove (thoughts)
    cleaned = cleaned.replace(/\[[^\]]+\]/g, ''); // Remove [notes]
    cleaned = cleaned.replace(/<[^>]+>/g, ''); // Remove <directions>
    cleaned = cleaned.replace(/\{[^}]+\}/g, ''); // Remove {internal}

    // Remove markdown formatting
    cleaned = cleaned.replace(/[*_~`#]/g, '');

    // Remove URLs (they sound terrible)
    cleaned = cleaned.replace(/https?:\/\/[^\s]+/g, 'link');

    // Remove email addresses
    cleaned = cleaned.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, 'email');

    // Fix contractions that might cause issues
    cleaned = cleaned.replace(/'/g, "'");
    cleaned = cleaned.replace(/"/g, '"');
    cleaned = cleaned.replace(/"/g, '"');

    // Remove zero-width characters and other invisible unicode
    cleaned = cleaned.replace(/[\u200B-\u200F\uFEFF]/g, '');

    return cleaned;
  }

  /**
   * Split long sentences to prevent cutoffs
   */
  private static splitLongSentences(
    text: string,
    maxWords: number = TTSPreprocessor.MAX_OPENAI_SENTENCE_WORDS
  ): string {
    const sentences = text.split(/(?<=[.!?])\s+/);
    const processedSentences: string[] = [];

    for (const sentence of sentences) {
      const words = sentence.split(/\s+/);

      if (words.length <= maxWords) {
        processedSentences.push(sentence);
      } else {
        // Split at natural boundaries (commas, semicolons, conjunctions)
        const chunks = this.splitAtNaturalBoundaries(sentence, maxWords);
        processedSentences.push(...chunks);
      }
    }

    return processedSentences.join(' ');
  }

  /**
   * Split text at natural boundaries
   */
  private static splitAtNaturalBoundaries(text: string, maxWords: number): string[] {
    const chunks: string[] = [];

    // Try to split at punctuation first
    const clauses = text.split(/(?<=[,;:])\s+/);

    let currentChunk = '';
    let currentWordCount = 0;

    for (const clause of clauses) {
      const clauseWords = clause.split(/\s+/).length;

      if (currentWordCount + clauseWords <= maxWords) {
        currentChunk += (currentChunk ? ' ' : '') + clause;
        currentWordCount += clauseWords;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }

        // If clause itself is too long, force split it
        if (clauseWords > maxWords) {
          chunks.push(...this.forceSplitText(clause, maxWords));
          currentChunk = '';
          currentWordCount = 0;
        } else {
          currentChunk = clause;
          currentWordCount = clauseWords;
        }
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks.map(chunk => {
      // Ensure each chunk ends with punctuation
      if (!chunk.match(/[.!?]$/)) {
        return chunk + '.';
      }
      return chunk;
    });
  }

  /**
   * Force split text that has no natural boundaries
   */
  private static forceSplitText(text: string, maxWords: number): string[] {
    const words = text.split(/\s+/);
    const chunks: string[] = [];

    for (let i = 0; i < words.length; i += maxWords) {
      const chunk = words.slice(i, i + maxWords).join(' ');
      chunks.push(chunk);
    }

    return chunks;
  }

  /**
   * Insert natural pause markers for better rhythm
   */
  private static insertNaturalPauses(text: string): string {
    // Add slight pauses after sentences
    let processed = text.replace(/([.!?])\s+/g, '$1 ... ');

    // Add micro pauses after commas
    processed = processed.replace(/,\s+/g, ', . ');

    // Clean up multiple periods
    processed = processed.replace(/\.{4,}/g, '...');

    return processed;
  }

  /**
   * Chunk text for streaming synthesis
   */
  private static chunkForStreaming(text: string): string[] {
    const chunks: string[] = [];
    const sentences = text.split(/(?<=[.!?])\s+/);

    let currentChunk = '';

    for (const sentence of sentences) {
      if ((currentChunk + ' ' + sentence).length <= this.MAX_CHUNK_CHARS) {
        currentChunk += (currentChunk ? ' ' : '') + sentence;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk);
        }
        currentChunk = sentence;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    return chunks;
  }

  /**
   * Validate that text is safe for TTS
   */
  public static validateForTTS(text: string): {
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Check for problematic newlines
    if (text.includes('\n\n')) {
      issues.push('Contains double newlines that may cause cutoffs');
      suggestions.push('Remove blank lines');
    }

    // Check for very long sentences
    const sentences = text.split(/[.!?]+/);
    const longSentences = sentences.filter(s => s.split(/\s+/).length > 30);
    if (longSentences.length > 0) {
      issues.push(`${longSentences.length} sentences over 30 words`);
      suggestions.push('Split long sentences at natural boundaries');
    }

    // Check for URLs
    if (/https?:\/\//.test(text)) {
      issues.push('Contains URLs that will sound unnatural');
      suggestions.push('Remove or replace URLs with descriptive text');
    }

    // Check for excessive punctuation
    if (/[.!?]{3,}/.test(text)) {
      issues.push('Excessive punctuation may cause odd pauses');
      suggestions.push('Normalize punctuation');
    }

    return {
      isValid: issues.length === 0,
      issues,
      suggestions
    };
  }

  /**
   * Estimate audio duration for completion detection
   */
  public static estimateAudioDuration(text: string, wordsPerMinute: number = 150): number {
    const words = text.split(/\s+/).filter(w => w.length > 0).length;
    const minutes = words / wordsPerMinute;
    return minutes * 60; // Return seconds
  }

  /**
   * Check if audio was likely truncated
   */
  public static isLikelyTruncated(
    text: string,
    actualDurationSeconds: number,
    wordsPerMinute: number = 150
  ): boolean {
    const expectedDuration = this.estimateAudioDuration(text, wordsPerMinute);
    const threshold = 0.7; // If actual is less than 70% of expected

    return actualDurationSeconds < (expectedDuration * threshold);
  }
}

// Export singleton for easy use
export const ttsPreprocessor = new TTSPreprocessor();