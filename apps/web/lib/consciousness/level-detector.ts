// Consciousness Level Detector - Detects user's consciousness development stage
// No cringe. Just intelligent pattern recognition based on actual journey data.

export type ConsciousnessLevel = 1 | 2 | 3 | 4 | 5;

export interface UserJourneyData {
  journalEntries: number;
  completedMissions: number;
  completedRituals: number;
  daysActive: number;
  usesElementalLanguage: boolean;
  consciousLanguageFrequency: number;
  teachesOthers: boolean;
  isAdvocate: boolean;
  isElder: boolean;
  vocabularyMastery: number; // 0-1, based on use of consciousness frameworks
  depthOfEntries: number; // 0-1, based on journal analysis
  communityEngagement: number; // 0-1, based on helping others
}

export class ConsciousnessLevelDetector {

  async detectLevel(userId: string): Promise<ConsciousnessLevel> {
    const journey = await this.getUserJourney(userId);

    // Level 5: Teaching/Transmuting - The wisdom holders
    if (journey.isElder ||
        (journey.isAdvocate && journey.teachesOthers) ||
        (journey.communityEngagement > 0.8 && journey.vocabularyMastery > 0.9)) {
      return 5;
    }

    // Level 4: Integrated/Fluent - Living the work
    if (journey.daysActive >= 90 ||
        journey.completedMissions >= 10 ||
        (journey.usesElementalLanguage &&
         journey.consciousLanguageFrequency >= 0.7 &&
         journey.vocabularyMastery > 0.7)) {
      return 4;
    }

    // Level 3: Practicing/Developing - Learning the language
    if (journey.completedRituals >= 3 ||
        journey.daysActive >= 30 ||
        journey.usesElementalLanguage ||
        journey.completedMissions >= 3 ||
        (journey.vocabularyMastery > 0.4 && journey.depthOfEntries > 0.5)) {
      return 3;
    }

    // Level 2: Awakening/Curious - Getting into it
    if (journey.journalEntries >= 5 ||
        journey.completedMissions >= 1 ||
        journey.daysActive >= 7 ||
        journey.depthOfEntries > 0.3) {
      return 2;
    }

    // Level 1: Asleep/Unconscious - New or not engaged
    return 1;
  }

  private async getUserJourney(userId: string): Promise<UserJourneyData> {
    // TODO: Query actual database for user's journey data
    // For now, returning example data structure
    // This will integrate with Supabase user_files, journal_entries, etc.

    // Mock data for testing - replace with actual queries
    return {
      journalEntries: 0,
      completedMissions: 0,
      completedRituals: 0,
      daysActive: 0,
      usesElementalLanguage: false,
      consciousLanguageFrequency: 0,
      teachesOthers: false,
      isAdvocate: false,
      isElder: false,
      vocabularyMastery: 0,
      depthOfEntries: 0,
      communityEngagement: 0
    };
  }

  // Analyze consciousness vocabulary usage in text
  analyzeVocabularyMastery(text: string): number {
    const elementalTerms = ['fire', 'water', 'earth', 'air', 'aether'];
    const alchemicalTerms = ['nigredo', 'albedo', 'rubedo', 'transmutation', 'alchemical'];
    const archetypalTerms = ['shadow', 'anima', 'animus', 'self', 'archetypal'];

    const elementalCount = this.countTermUsage(text, elementalTerms);
    const alchemicalCount = this.countTermUsage(text, alchemicalTerms);
    const archetypalCount = this.countTermUsage(text, archetypalTerms);

    const wordCount = text.split(/\s+/).length;
    const totalTerms = elementalCount + alchemicalCount + archetypalCount;

    // Return ratio of consciousness terms to total words, capped at 1.0
    return Math.min(totalTerms / Math.max(wordCount * 0.1, 1), 1.0);
  }

  // Analyze depth of consciousness engagement in text
  analyzeDepthOfEngagement(text: string): number {
    const depthIndicators = [
      'insight', 'pattern', 'shadow work', 'integration', 'trigger',
      'projection', 'unconscious', 'awareness', 'witness', 'presence',
      'embodied', 'grounded', 'activated', 'transformed'
    ];

    const depthCount = this.countTermUsage(text, depthIndicators);
    const wordCount = text.split(/\s+/).length;

    // Base depth on introspective language usage
    const baseDepth = Math.min(depthCount / Math.max(wordCount * 0.05, 1), 1.0);

    // Bonus for longer, more thoughtful entries
    const lengthBonus = Math.min(wordCount / 500, 0.3);

    return Math.min(baseDepth + lengthBonus, 1.0);
  }

  private countTermUsage(text: string, terms: string[]): number {
    const lowerText = text.toLowerCase();
    return terms.reduce((count, term) => {
      const regex = new RegExp(`\\b${term}\\b`, 'g');
      return count + (lowerText.match(regex)?.length || 0);
    }, 0);
  }
}