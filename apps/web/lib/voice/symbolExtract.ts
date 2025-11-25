// lib/voice/symbolExtract.ts
// Privacy-preserving symbol extraction - the boundary between personal and collective

import { PersonalUtterance, SymbolicSignal, Element, TrustBreath } from './types';

// Controlled vocabulary for motifs
const MOTIF_VOCAB = [
  'threshold', 'release', 'grief', 'initiate', 'anchor',
  'flow', 'clarify', 'ground', 'integrate', 'transform',
  'question', 'witness', 'hold', 'explore', 'celebrate',
  'return', 'spiral', 'emerge', 'dissolve', 'create'
];

// Emotional markers for affect detection
const EMOTION_MARKERS = {
  positive: ['joy', 'happy', 'excited', 'grateful', 'love', 'peace', 'calm'],
  negative: ['sad', 'angry', 'hurt', 'frustrated', 'afraid', 'worried', 'anxious'],
  neutral: ['think', 'wonder', 'consider', 'observe', 'notice']
};

export class SymbolicExtractor {
  private spiralMemory: Map<string, string[]> = new Map();
  private trustHistory: TrustBreath[] = [];

  /**
   * Convert personal utterance to privacy-safe symbolic signal
   * This is the critical privacy boundary - no personal content crosses
   */
  toSymbolic(utterance: PersonalUtterance): SymbolicSignal {
    // Extract symbolic motifs from text
    const motifs = this.extractMotifs(utterance.text);

    // Normalize elemental intensities
    const elements = this.normalizeElements(utterance.elementBlend);

    // Determine trust breathing pattern
    const trustBreath = this.inferTrustBreath(utterance);

    // Detect affect without exposing content
    const affect = this.extractAffect(utterance);

    // Check for spiral patterns
    const spiralFlag = this.detectSpiral(utterance.userId, motifs);

    return {
      teamId: this.getTeamId(),
      anonId: this.getAnonId(),
      ts: utterance.ts,
      mode: utterance.mode,
      elements,
      motifs,
      affect,
      trustBreath,
      spiralFlag
    };
  }

  /**
   * Extract archetypal motifs from text using controlled vocabulary
   */
  private extractMotifs(text: string): string[] {
    const lower = text.toLowerCase();
    const foundMotifs: string[] = [];

    // Direct vocabulary matches
    for (const motif of MOTIF_VOCAB) {
      if (lower.includes(motif)) {
        foundMotifs.push(motif);
      }
    }

    // Pattern-based motif detection
    if (/begin|start|first|new/.test(lower) && !foundMotifs.includes('initiate')) {
      foundMotifs.push('initiate');
    }

    if (/let go|release|surrender/.test(lower) && !foundMotifs.includes('release')) {
      foundMotifs.push('release');
    }

    if (/question|wonder|curious|why/.test(lower) && !foundMotifs.includes('question')) {
      foundMotifs.push('question');
    }

    if (/transform|change|shift|evolve/.test(lower) && !foundMotifs.includes('transform')) {
      foundMotifs.push('transform');
    }

    if (/back|again|repeat|same/.test(lower) && !foundMotifs.includes('spiral')) {
      foundMotifs.push('spiral');
    }

    // Limit to top 5 motifs to prevent fingerprinting
    return foundMotifs.slice(0, 5);
  }

  /**
   * Normalize elemental blend to standard format
   */
  private normalizeElements(blend: Partial<Record<Element, number>>): Array<{name: Element; intensity: number}> {
    const elements: Array<{name: Element; intensity: number}> = [];

    const allElements: Element[] = ['fire', 'water', 'earth', 'air', 'aether'];

    for (const element of allElements) {
      const intensity = blend[element] || 0;
      if (intensity > 0.1) { // Only include significant elements
        elements.push({
          name: element,
          intensity: Math.min(1, Math.max(0, intensity)) // Clamp 0-1
        });
      }
    }

    // Sort by intensity
    elements.sort((a, b) => b.intensity - a.intensity);

    // If no significant elements, default to balanced aether
    if (elements.length === 0) {
      elements.push({ name: 'aether', intensity: 0.5 });
    }

    return elements;
  }

  /**
   * Infer trust breathing pattern from utterance context
   */
  private inferTrustBreath(utterance: PersonalUtterance): TrustBreath {
    // Long silence before speaking might indicate contraction
    if (utterance.silenceMsBefore > 10000) {
      this.trustHistory.push('hold');
      return 'hold';
    }

    // Questions and seeking indicate expansion
    if (utterance.intents.includes('question') || utterance.intents.includes('seek-guidance')) {
      this.trustHistory.push('in');
      return 'in';
    }

    // Emotional sharing indicates trust expansion
    if (utterance.intents.includes('share-emotion')) {
      this.trustHistory.push('in');
      return 'in';
    }

    // Gratitude and celebration indicate expansion
    if (utterance.intents.includes('gratitude')) {
      this.trustHistory.push('in');
      return 'in';
    }

    // Check emotional context
    if (utterance.emotionalContext) {
      if (utterance.emotionalContext.valence < -0.3) {
        this.trustHistory.push('out');
        return 'out';
      }
    }

    // Default to steady breathing
    this.trustHistory.push('hold');
    return 'hold';
  }

  /**
   * Extract coarse affect without revealing content
   */
  private extractAffect(utterance: PersonalUtterance): {valence: -1 | 0 | 1; arousal: 0 | 1 | 2} {
    const ctx = utterance.emotionalContext;

    // Coarse valence
    let valence: -1 | 0 | 1 = 0;
    if (ctx && ctx.valence > 0.3) valence = 1;
    else if (ctx && ctx.valence < -0.3) valence = -1;

    // Coarse arousal
    let arousal: 0 | 1 | 2 = 1;
    if (ctx && ctx.arousal > 0.7) arousal = 2;
    else if (ctx && ctx.arousal < 0.3) arousal = 0;

    return { valence, arousal };
  }

  /**
   * Detect spiral patterns (revisiting themes)
   */
  private detectSpiral(userId: string, motifs: string[]): boolean {
    const key = `${userId}-motifs`;
    const history = this.spiralMemory.get(key) || [];

    // Check if current motifs match recent history
    const isSpiral = motifs.some(motif =>
      history.filter(h => h === motif).length >= 2
    );

    // Update history
    history.push(...motifs);
    if (history.length > 20) {
      history.splice(0, history.length - 20); // Keep last 20
    }
    this.spiralMemory.set(key, history);

    return isSpiral || motifs.includes('spiral') || motifs.includes('return');
  }

  /**
   * Get team ID (from context or default)
   */
  private getTeamId(): string {
    // In production, get from auth context
    return localStorage.getItem('teamId') || 'default-team';
  }

  /**
   * Get anonymous session ID
   */
  private getAnonId(): string {
    // Generate stable session ID that doesn't identify user
    let anonId = sessionStorage.getItem('anonId');
    if (!anonId) {
      anonId = `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('anonId', anonId);
    }
    return anonId;
  }

  /**
   * Reset session (for privacy)
   */
  resetSession() {
    sessionStorage.removeItem('anonId');
    this.spiralMemory.clear();
    this.trustHistory = [];
  }
}

// Global extractor instance
export const symbolExtractor = new SymbolicExtractor();

/**
 * Main extraction function
 */
export function toSymbolic(utterance: PersonalUtterance): SymbolicSignal {
  return symbolExtractor.toSymbolic(utterance);
}