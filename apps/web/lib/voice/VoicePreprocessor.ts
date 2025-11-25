// lib/voice/VoicePreprocessor.ts
// Converts stage directions to proper voice synthesis markup

"use strict";

/**
 * Voice Preprocessor
 * Converts narrative stage directions into SSML markup or removes them entirely
 */
export class VoicePreprocessor {

  /**
   * Process text for voice synthesis by converting stage directions
   */
  public static processForVoice(text: string, voiceMode: 'natural' | 'ssml' = 'natural'): string {
    let processed = text;

    // Remove or convert common stage directions
    processed = this.handlePauses(processed, voiceMode);
    processed = this.handleBreathing(processed, voiceMode);
    processed = this.handleEmotionalDirections(processed, voiceMode);
    processed = this.handlePhysicalActions(processed, voiceMode);
    processed = this.handleNarrativeText(processed, voiceMode);
    processed = this.handleAsterisks(processed, voiceMode);

    // Clean up any remaining artifacts
    processed = this.cleanupText(processed);

    return processed.trim();
  }

  /**
   * Handle pause directions
   */
  private static handlePauses(text: string, voiceMode: string): string {
    const pausePatterns = [
      /\*pauses?\*?/gi,
      /\*pauses? (?:for )?(?:a )?(?:moment|briefly|thoughtfully)\*?/gi,
      /\*(?:takes? )?(?:a )?(?:long |short |brief )?pause\*?/gi,
      /\*waits?\*?/gi,
      /\*silence\*?/gi,
      /\bpauses? (?:and )?(?:takes? (?:a )?(?:deep )?breath|thoughtfully|for a moment)/gi,
      /takes? (?:a )?(?:long |short )?pause/gi
    ];

    let processed = text;

    pausePatterns.forEach(pattern => {
      if (voiceMode === 'ssml') {
        // Convert to SSML pause
        processed = processed.replace(pattern, '<break time="1s"/>');
      } else {
        // Remove entirely for natural speech
        processed = processed.replace(pattern, '');
      }
    });

    return processed;
  }

  /**
   * Handle breathing directions
   */
  private static handleBreathing(text: string, voiceMode: string): string {
    const breathingPatterns = [
      /\*(?:takes? )?(?:a )?(?:deep |slow |calming )?breath(?:s)?\*?/gi,
      /\*(?:breathes? )?(?:in |out )?(?:deeply|slowly|calmly)\*?/gi,
      /\*(?:inhales?|exhales?)\*?/gi,
      /(?:takes? (?:a )?(?:deep |slow )?breath|breathes? (?:deeply|slowly))/gi
    ];

    let processed = text;

    breathingPatterns.forEach(pattern => {
      if (voiceMode === 'ssml') {
        // Convert to SSML pause with breathing sound if supported
        processed = processed.replace(pattern, '<break time="2s"/>');
      } else {
        // Remove entirely for natural speech
        processed = processed.replace(pattern, '');
      }
    });

    return processed;
  }

  /**
   * Handle emotional stage directions
   */
  private static handleEmotionalDirections(text: string, voiceMode: string): string {
    const emotionalPatterns = [
      /\*(?:sensing|feeling|with) (?:the )?(?:weight|intensity|gravity|depth|heaviness)/gi,
      /\*(?:with )?(?:compassion|empathy|understanding|gentleness|warmth)\*?/gi,
      /\*(?:softly|gently|warmly|tenderly|carefully)\*?/gi,
      /\*(?:voice|tone) (?:softens?|gentles?|warms?)\*?/gi,
      /\*(?:speaks?|says?) (?:softly|gently|warmly|quietly)\*?/gi,
    ];

    let processed = text;

    emotionalPatterns.forEach(pattern => {
      if (voiceMode === 'ssml') {
        // Convert to SSML prosody changes
        processed = processed.replace(pattern, '<prosody rate="slow" volume="soft">');
      } else {
        // Remove entirely for natural speech
        processed = processed.replace(pattern, '');
      }
    });

    return processed;
  }

  /**
   * Handle physical action directions
   */
  private static handlePhysicalActions(text: string, voiceMode: string): string {
    const actionPatterns = [
      /\*(?:leans? (?:forward|back|in|closer))\*?/gi,
      /\*(?:sits? (?:back|forward|quietly|still))\*?/gi,
      /\*(?:settles? (?:in|into|back))\*?/gi,
      /\*(?:adjusts? (?:position|posture))\*?/gi,
      /\*(?:shifts? (?:slightly|position))\*?/gi,
      /\*(?:nods?|shakes? head)\*?/gi,
    ];

    let processed = text;

    actionPatterns.forEach(pattern => {
      // Always remove physical actions as they can't be vocalized
      processed = processed.replace(pattern, '');
    });

    return processed;
  }

  /**
   * Handle narrative text that shouldn't be spoken
   */
  private static handleNarrativeText(text: string, voiceMode: string): string {
    const narrativePatterns = [
      /\*[^*]*(?:sensing|feeling|noticing|observing|watching)[^*]*\*/gi,
      /\*[^*]*(?:energy|presence|space|moment)[^*]*\*/gi,
      /\*[^*]*(?:reflects?|considers?|thinks?)[^*]*\*/gi,
      /\*[^*]*(?:awareness|consciousness|attention)[^*]*\*/gi,
    ];

    let processed = text;

    narrativePatterns.forEach(pattern => {
      // Remove narrative descriptions
      processed = processed.replace(pattern, '');
    });

    return processed;
  }

  /**
   * Handle asterisk formatting
   */
  private static handleAsterisks(text: string, voiceMode: string): string {
    // Remove any remaining asterisks that might be read aloud
    return text.replace(/\*+/g, '');
  }

  /**
   * Clean up processed text and optimize for smooth voice synthesis
   */
  private static cleanupText(text: string): string {
    let cleaned = text;

    // Fix spacing issues from removed content
    cleaned = cleaned.replace(/\s+/g, ' '); // Multiple spaces to single
    cleaned = cleaned.replace(/\s+([,.!?])/g, '$1'); // Space before punctuation
    cleaned = cleaned.replace(/([,.!?])\s*([A-Z])/g, '$1 $2'); // Ensure space after punctuation
    cleaned = cleaned.replace(/^\s+|\s+$/g, ''); // Trim

    // Fix sentence flow issues
    cleaned = cleaned.replace(/\.\s*\./g, '.'); // Double periods
    cleaned = cleaned.replace(/,\s*,/g, ','); // Double commas
    cleaned = cleaned.replace(/\s*,\s*\./g, '.'); // Comma before period

    // Ensure sentences start properly
    cleaned = cleaned.replace(/^[,.]/, ''); // Remove leading punctuation

    // Optimize for smoother voice synthesis flow
    cleaned = this.optimizeForVoiceFlow(cleaned);

    return cleaned;
  }

  /**
   * Optimize text for smooth voice synthesis flow
   */
  private static optimizeForVoiceFlow(text: string): string {
    let optimized = text;

    // Advanced conjunction smoothing - the key fix for choppy "and" transitions
    // First pass: handle mid-sentence conjunctions with micro-pauses
    optimized = optimized.replace(/\s+and\s+([aeiou])/gi, ', and $1'); // Vowel starts
    optimized = optimized.replace(/\s+and\s+([^aeiou\s])/gi, ', and $1'); // Consonant starts
    optimized = optimized.replace(/\s+but\s+/gi, ', but ');
    optimized = optimized.replace(/\s+or\s+/gi, ', or ');
    optimized = optimized.replace(/\s+so\s+/gi, ', so ');
    optimized = optimized.replace(/\s+yet\s+/gi, ', yet ');

    // Special handling for sentence-starting conjunctions (more natural flow)
    optimized = optimized.replace(/\.\s*And\s+/g, '. And ');
    optimized = optimized.replace(/\?\s*And\s+/g, '? And ');
    optimized = optimized.replace(/!\s*And\s+/g, '! And ');

    // Add micro-pauses before transitional phrases that can sound choppy
    optimized = optimized.replace(/\s+(however|therefore|meanwhile|furthermore|moreover|nevertheless|nonetheless)\s+/gi, '. $1, ');

    // Smooth out phrase boundaries that can sound abrupt
    optimized = optimized.replace(/\s+(then|now|here|there)\s+/gi, ', $1 ');

    // Clean up any excessive comma accumulation
    optimized = optimized.replace(/,\s*,+/g, ',');
    optimized = optimized.replace(/,\s*([.!?])/g, '$1');
    optimized = optimized.replace(/^,\s*/, ''); // Remove leading comma

    // Final pass: ensure natural breathing spaces around key transition words
    optimized = optimized.replace(/,\s*,\s*and/gi, ', and'); // Remove double commas before and

    // Add subtle pauses before emphatic words to prevent rushed delivery
    optimized = optimized.replace(/\s+(really|truly|deeply|profoundly|absolutely|certainly|indeed)\s+/gi, ', $1 ');

    return optimized;
  }

  /**
   * Extract just the spoken content from a response
   */
  public static extractSpokenContent(text: string): string {
    // Remove stage directions entirely and return clean speech
    return this.processForVoice(text, 'natural');
  }

  /**
   * Create SSML version with prosody markup
   */
  public static createSSMLVersion(text: string): string {
    let ssml = this.processForVoice(text, 'ssml');

    // Wrap in SSML speak tags if not already wrapped
    if (!ssml.includes('<speak>')) {
      ssml = `<speak>${ssml}</speak>`;
    }

    return ssml;
  }

  /**
   * Validate that no stage directions remain
   */
  public static validateVoiceOutput(text: string): { isClean: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check for remaining asterisks
    if (text.includes('*')) {
      issues.push('Contains asterisks that might be read aloud');
    }

    // Check for narrative words that shouldn't be spoken
    const narrativeWords = ['pauses', 'takes a breath', 'sensing', 'feeling', 'with compassion'];
    narrativeWords.forEach(word => {
      if (text.toLowerCase().includes(word)) {
        issues.push(`Contains narrative phrase: "${word}"`);
      }
    });

    return {
      isClean: issues.length === 0,
      issues
    };
  }

  /**
   * Preview what will be spoken vs what was written
   */
  public static previewVoiceOutput(originalText: string): {
    original: string;
    spoken: string;
    removed: string[];
    validation: { isClean: boolean; issues: string[] };
  } {
    const spoken = this.extractSpokenContent(originalText);
    const validation = this.validateVoiceOutput(spoken);

    // Find what was removed (simplified)
    const removed: string[] = [];
    const asteriskMatches = originalText.match(/\*[^*]*\*/g);
    if (asteriskMatches) {
      removed.push(...asteriskMatches);
    }

    return {
      original: originalText,
      spoken,
      removed,
      validation
    };
  }
}