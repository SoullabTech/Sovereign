/**
 * Symbol Extraction Engine
 * Automatically extracts symbols, archetypes, emotions, and milestones
 * from MAIA conversations using pattern matching and Claude analysis
 */

import { soulprintTracker } from '../beta/SoulprintTracking';

export interface ExtractedSymbol {
  symbol: string;
  context: string;
  elementalResonance?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  confidence: number; // 0-1
}

export interface ExtractedArchetype {
  archetype: string;
  trigger?: string;
  shadowWork: boolean;
  confidence: number;
}

export interface ExtractedEmotion {
  emotion: string;
  intensity: number; // 0-1
  valence: number; // -1 to 1 (negative to positive)
}

export interface ExtractedMilestone {
  type: 'breakthrough' | 'threshold' | 'integration' | 'shadow-encounter' | 'awakening';
  description: string;
  significance: 'minor' | 'major' | 'pivotal';
  element?: string;
}

export interface ExtractionResult {
  symbols: ExtractedSymbol[];
  archetypes: ExtractedArchetype[];
  emotions: ExtractedEmotion[];
  milestones: ExtractedMilestone[];
  narrativeThemes: string[];
  confidence: number; // Overall confidence in extraction
}

export class SymbolExtractionEngine {

  // Common symbolic archetypes (Jung, Campbell, Pearson)
  private knownArchetypes = [
    'Seeker', 'Sage', 'Warrior', 'Lover', 'Healer', 'Shadow',
    'Creator', 'Ruler', 'Caregiver', 'Magician', 'Rebel', 'Innocent',
    'Hero', 'Fool', 'Explorer', 'Guide', 'Trickster', 'Mother', 'Father'
  ];

  // Symbolic patterns with elemental associations
  private symbolPatterns = [
    // Water
    { pattern: /\b(river|ocean|sea|lake|rain|tears|flow|wave|stream|pool|well)\b/gi, element: 'water' },
    { pattern: /\b(mirror|reflection|depths|tide)\b/gi, element: 'water' },

    // Fire
    { pattern: /\b(fire|flame|light|sun|star|spark|burning|phoenix|ember)\b/gi, element: 'fire' },
    { pattern: /\b(passion|transformation|heat|radiance)\b/gi, element: 'fire' },

    // Earth
    { pattern: /\b(mountain|stone|rock|cave|root|ground|tree|forest|soil)\b/gi, element: 'earth' },
    { pattern: /\b(foundation|stability|grounded|path|valley)\b/gi, element: 'earth' },

    // Air
    { pattern: /\b(wind|sky|breath|cloud|bird|flight|feather|wings)\b/gi, element: 'air' },
    { pattern: /\b(clarity|thought|voice|song|whisper)\b/gi, element: 'air' },

    // Aether
    { pattern: /\b(spirit|soul|cosmos|void|mystery|sacred|divine|eternal)\b/gi, element: 'aether' },
    { pattern: /\b(dream|vision|threshold|gateway|portal|constellation)\b/gi, element: 'aether' }
  ];

  // Emotional lexicon
  private emotionPatterns = {
    joy: { patterns: /\b(joy|delight|happiness|elation|bliss|ecstasy)\b/gi, valence: 0.8 },
    peace: { patterns: /\b(peace|calm|serenity|tranquil|stillness|quiet)\b/gi, valence: 0.6 },
    love: { patterns: /\b(love|compassion|warmth|tenderness|care|affection)\b/gi, valence: 0.7 },
    curiosity: { patterns: /\b(curious|wonder|intrigue|fascination|interested)\b/gi, valence: 0.5 },
    clarity: { patterns: /\b(clarity|clear|understanding|insight|realization)\b/gi, valence: 0.6 },

    confusion: { patterns: /\b(confusion|unclear|lost|bewildered|perplexed)\b/gi, valence: -0.3 },
    fear: { patterns: /\b(fear|afraid|scared|terror|anxiety|worry|dread)\b/gi, valence: -0.7 },
    anger: { patterns: /\b(anger|rage|fury|frustration|irritation|resentment)\b/gi, valence: -0.6 },
    grief: { patterns: /\b(grief|sorrow|sadness|mourning|loss|heartbreak)\b/gi, valence: -0.7 },
    shame: { patterns: /\b(shame|guilt|regret|embarrassment|humiliation)\b/gi, valence: -0.8 }
  };

  // Milestone indicators
  private milestonePatterns = {
    breakthrough: /\b(breakthrough|revelation|epiphany|awakening|realization|illumination)\b/gi,
    threshold: /\b(threshold|crossing|transition|passage|doorway|beginning)\b/gi,
    integration: /\b(integration|synthesis|wholeness|unity|harmony|balance)\b/gi,
    shadowEncounter: /\b(shadow|darkness|suppressed|hidden|denied|repressed|confronting)\b/gi,
    awakening: /\b(awakening|consciousness|awareness|enlightenment|emergence)\b/gi
  };

  /**
   * Main extraction method
   */
  async extract(text: string, userId?: string): Promise<ExtractionResult> {
    const symbols = this.extractSymbols(text);
    const archetypes = this.extractArchetypes(text);
    const emotions = this.extractEmotions(text);
    const milestones = this.extractMilestones(text);
    const narrativeThemes = this.extractNarrativeThemes(text);

    // Calculate overall confidence
    const hasContent = symbols.length > 0 || archetypes.length > 0 || emotions.length > 0;
    const avgConfidence = [...symbols, ...archetypes]
      .reduce((sum, item) => sum + item.confidence, 0) / Math.max(symbols.length + archetypes.length, 1);

    const confidence = hasContent ? avgConfidence : 0;

    // Auto-track if userId provided
    if (userId) {
      this.autoTrack(userId, { symbols, archetypes, emotions, milestones, narrativeThemes, confidence });
    }

    return {
      symbols,
      archetypes,
      emotions,
      milestones,
      narrativeThemes,
      confidence
    };
  }

  /**
   * Extract symbolic language
   */
  private extractSymbols(text: string): ExtractedSymbol[] {
    const symbols: ExtractedSymbol[] = [];
    const sentences = text.split(/[.!?]+/);

    for (const pattern of this.symbolPatterns) {
      const matches = text.matchAll(pattern.pattern);

      for (const match of matches) {
        const symbol = match[1] || match[0];

        // Find context (sentence containing the symbol)
        const context = sentences.find(s =>
          s.toLowerCase().includes(symbol.toLowerCase())
        ) || symbol;

        symbols.push({
          symbol: symbol.toLowerCase(),
          context: context.trim(),
          elementalResonance: pattern.element as any,
          confidence: 0.7 // Pattern-based confidence
        });
      }
    }

    // Deduplicate
    const unique = new Map<string, ExtractedSymbol>();
    symbols.forEach(s => {
      const key = s.symbol.toLowerCase();
      if (!unique.has(key) || unique.get(key)!.confidence < s.confidence) {
        unique.set(key, s);
      }
    });

    return Array.from(unique.values());
  }

  /**
   * Extract archetypal patterns
   */
  private extractArchetypes(text: string): ExtractedArchetype[] {
    const archetypes: ExtractedArchetype[] = [];
    const lowerText = text.toLowerCase();

    for (const archetype of this.knownArchetypes) {
      const archetypeLower = archetype.toLowerCase();

      if (lowerText.includes(archetypeLower)) {
        // Check for shadow work indicators
        const hasShadowWork = /\b(shadow|confront|integrate|hidden|denied|repressed)\b/i.test(text);

        archetypes.push({
          archetype,
          shadowWork: hasShadowWork,
          confidence: 0.8
        });
      }
    }

    // Implicit archetype detection
    if (/\b(search|seek|quest|journey|explore)\b/i.test(text) && !lowerText.includes('seeker')) {
      archetypes.push({ archetype: 'Seeker', shadowWork: false, confidence: 0.6 });
    }
    if (/\b(wisdom|knowledge|understand|teach|learn)\b/i.test(text) && !lowerText.includes('sage')) {
      archetypes.push({ archetype: 'Sage', shadowWork: false, confidence: 0.5 });
    }
    if (/\b(heal|restore|mend|care|nurture)\b/i.test(text) && !lowerText.includes('healer')) {
      archetypes.push({ archetype: 'Healer', shadowWork: false, confidence: 0.6 });
    }
    if (/\b(create|make|build|craft|manifest)\b/i.test(text) && !lowerText.includes('creator')) {
      archetypes.push({ archetype: 'Creator', shadowWork: false, confidence: 0.5 });
    }

    return archetypes;
  }

  /**
   * Extract emotional states
   */
  private extractEmotions(text: string): ExtractedEmotion[] {
    const emotions: ExtractedEmotion[] = [];

    for (const [emotion, { patterns, valence }] of Object.entries(this.emotionPatterns)) {
      const matches = text.match(patterns);

      if (matches && matches.length > 0) {
        // Intensity based on frequency
        const intensity = Math.min(matches.length * 0.3, 1.0);

        emotions.push({
          emotion,
          intensity,
          valence
        });
      }
    }

    return emotions.sort((a, b) => b.intensity - a.intensity);
  }

  /**
   * Extract milestone moments
   */
  private extractMilestones(text: string): ExtractedMilestone[] {
    const milestones: ExtractedMilestone[] = [];

    for (const [type, pattern] of Object.entries(this.milestonePatterns)) {
      const matches = text.match(pattern);

      if (matches && matches.length > 0) {
        const sentences = text.split(/[.!?]+/);
        const relevantSentence = sentences.find(s => pattern.test(s)) || matches[0];

        // Determine significance
        let significance: 'minor' | 'major' | 'pivotal' = 'minor';
        if (/\b(profound|deep|significant|pivotal|transformative)\b/i.test(text)) {
          significance = 'pivotal';
        } else if (/\b(important|meaningful|powerful)\b/i.test(text)) {
          significance = 'major';
        }

        milestones.push({
          type: this.normalizeMilestoneType(type),
          description: relevantSentence.trim().slice(0, 200),
          significance,
          element: this.inferElement(relevantSentence)
        });
      }
    }

    return milestones;
  }

  /**
   * Extract narrative themes
   */
  private extractNarrativeThemes(text: string): string[] {
    const themes: string[] = [];

    const themePatterns = [
      { theme: 'The Descent', pattern: /\b(descent|darkness|underworld|depths|falling)\b/gi },
      { theme: 'The Return', pattern: /\b(return|coming back|homecoming|restoration)\b/gi },
      { theme: 'Crossing the Threshold', pattern: /\b(threshold|crossing|passage|doorway)\b/gi },
      { theme: 'Shadow Integration', pattern: /\b(shadow|integrate|darkness|hidden)\b/gi },
      { theme: 'Awakening', pattern: /\b(awaken|consciousness|awareness|illumination)\b/gi },
      { theme: 'The Quest', pattern: /\b(quest|search|journey|seek)\b/gi },
      { theme: 'Transformation', pattern: /\b(transform|change|metamorphosis|evolution)\b/gi },
      { theme: 'Sacred Union', pattern: /\b(union|merge|unity|wholeness|integration)\b/gi }
    ];

    for (const { theme, pattern } of themePatterns) {
      if (pattern.test(text)) {
        themes.push(theme);
      }
    }

    return themes;
  }

  /**
   * Automatically track extracted data in soulprint
   */
  private autoTrack(userId: string, result: ExtractionResult): void {
    // Track symbols
    result.symbols.forEach(s => {
      soulprintTracker.trackSymbol(userId, s.symbol, s.context, s.elementalResonance);
    });

    // Track archetypes (only high-confidence ones)
    result.archetypes
      .filter(a => a.confidence >= 0.6)
      .forEach(a => {
        soulprintTracker.trackArchetypeShift(userId, a.archetype, {
          trigger: a.trigger,
          shadowWork: a.shadowWork,
          integrationLevel: a.confidence
        });
      });

    // Track emotional state
    if (result.emotions.length > 0) {
      const dominantEmotions = result.emotions.slice(0, 5).map(e => e.emotion);
      const avgValence = result.emotions.reduce((sum, e) => sum + e.valence, 0) / result.emotions.length;

      soulprintTracker.trackEmotionalState(userId, avgValence, dominantEmotions);
    }

    // Track milestones
    result.milestones.forEach(m => {
      soulprintTracker.addMilestone(userId, m.type, m.description, m.significance, {
        element: m.element
      });
    });

    console.log(`✨ Auto-tracked for ${userId}: ${result.symbols.length} symbols, ${result.archetypes.length} archetypes, ${result.emotions.length} emotions`);
  }

  /**
   * Helpers
   */
  private normalizeMilestoneType(type: string): any {
    const map: Record<string, any> = {
      breakthrough: 'breakthrough',
      threshold: 'threshold',
      integration: 'integration',
      shadowEncounter: 'shadow-encounter',
      awakening: 'awakening'
    };
    return map[type] || 'breakthrough';
  }

  private inferElement(text: string): string | undefined {
    const lowerText = text.toLowerCase();
    if (/water|ocean|river|flow|tear/i.test(lowerText)) return 'water';
    if (/fire|flame|light|passion|burn/i.test(lowerText)) return 'fire';
    if (/earth|ground|stone|mountain|root/i.test(lowerText)) return 'earth';
    if (/air|wind|breath|sky|flight/i.test(lowerText)) return 'air';
    if (/spirit|soul|divine|sacred|mystery/i.test(lowerText)) return 'aether';
    return undefined;
  }

  /**
   * Batch process multiple messages
   */
  async extractBatch(messages: Array<{ text: string; userId?: string }>): Promise<ExtractionResult[]> {
    return Promise.all(messages.map(m => this.extract(m.text, m.userId)));
  }
}

export const symbolExtractor = new SymbolExtractionEngine();