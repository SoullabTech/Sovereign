/**
 * 🧠 Dual-Track Processing - McGilchrist Pattern
 * 
 * Left hemisphere classifies, Right hemisphere attends
 * Classification informs but never dominates presence
 * 
 * Core: Archetypes as suggestions, not verdicts
 */

export interface DualTrackState {
  // Left Hemisphere Track (Classification)
  leftTrack: {
    knownPatterns: Map<string, number>; // Archetype -> confidence
    novelSignals: EmergentPattern[];
    hybridExpressions: ArchetypeFusion[];
    uncertaintyThreshold: number;
    categoricalSuggestion?: string; // What LH thinks it is
  };
  
  // Right Hemisphere Track (Attending)
  rightTrack: {
    wholeness: string; // The gestalt impression
    noveltyResonance: number; // How unprecedented
    livingQuality: string; // What feels most alive
    unnamedPresence: boolean; // Something beyond categories
    attentionQuality: 'narrow' | 'broad' | 'floating';
  };
  
  // Integration Layer
  integration: {
    dominantMode: 'attending' | 'classifying';
    confidenceInNaming: number;
    suggestedResponse: 'name_it' | 'explore_it' | 'witness_it';
    culturalContext?: string;
    evolutionPhase: string;
  };
}

export interface EmergentPattern {
  id: string;
  qualities: string[];
  firstObserved: Date;
  culturalMarkers?: string[];
  generationalMarkers?: string[];
}

export interface ArchetypeFusion {
  components: string[];
  blendType: 'sequential' | 'simultaneous' | 'oscillating';
  stability: number;
}

export class DualTrackProcessor {
  
  /**
   * Process input through both hemispheric tracks
   */
  process(
    input: string,
    history: string[],
    culturalContext?: string
  ): DualTrackState {
    // Right hemisphere goes first - pure attending
    const rightTrack = this.attendToWholeness(input, history);
    
    // Left hemisphere classifies what RH attended to
    const leftTrack = this.classifyPatterns(input, history, rightTrack);
    
    // Integration respects RH primacy
    const integration = this.integrate(rightTrack, leftTrack, culturalContext);
    
    return { leftTrack, rightTrack, integration };
  }
  
  /**
   * RIGHT HEMISPHERE: Attend to wholeness and novelty
   */
  private attendToWholeness(input: string, history: string[]): DualTrackState['rightTrack'] {
    // What's the whole gestalt?
    const wholeness = this.captureGestalt(input, history);
    
    // How novel/unprecedented is this?
    const noveltyResonance = this.assessNovelty(input, history);
    
    // What feels most alive?
    const livingQuality = this.findAliveness(input);
    
    // Is there something beyond naming?
    const unnamedPresence = this.detectUnnameable(input, noveltyResonance);
    
    // Quality of attention needed
    const attentionQuality = this.determineAttentionMode(noveltyResonance);
    
    return {
      wholeness,
      noveltyResonance,
      livingQuality,
      unnamedPresence,
      attentionQuality
    };
  }
  
  /**
   * LEFT HEMISPHERE: Classify and categorize
   */
  private classifyPatterns(
    input: string,
    history: string[],
    rightImpression: DualTrackState['rightTrack']
  ): DualTrackState['leftTrack'] {
    // Only classify if RH doesn't sense strong novelty
    if (rightImpression.noveltyResonance > 0.8) {
      return this.minimalClassification();
    }
    
    // Map to known archetypes
    const knownPatterns = this.mapToArchetypes(input, history);
    
    // Detect novel combinations
    const novelSignals = this.detectEmergentPatterns(input, history);
    
    // Identify hybrid expressions
    const hybridExpressions = this.findHybridArchetypes(knownPatterns);
    
    // Set uncertainty based on RH feedback
    const uncertaintyThreshold = rightImpression.unnamedPresence ? 0.8 : 0.3;
    
    // Suggest a category (but hold it lightly)
    const categoricalSuggestion = this.suggestCategory(
      knownPatterns,
      hybridExpressions,
      uncertaintyThreshold
    );
    
    return {
      knownPatterns,
      novelSignals,
      hybridExpressions,
      uncertaintyThreshold,
      categoricalSuggestion
    };
  }
  
  /**
   * INTEGRATION: Let RH lead, LH support
   */
  private integrate(
    rightTrack: DualTrackState['rightTrack'],
    leftTrack: DualTrackState['leftTrack'],
    culturalContext?: string
  ): DualTrackState['integration'] {
    // Right hemisphere leads
    const dominantMode: 'attending' | 'classifying' = 
      rightTrack.unnamedPresence || rightTrack.noveltyResonance > 0.6
        ? 'attending'
        : 'classifying';
    
    // Confidence in naming depends on both tracks agreeing
    const confidenceInNaming = leftTrack.categoricalSuggestion && !rightTrack.unnamedPresence
      ? Math.min(Array.from(leftTrack.knownPatterns.values())[0] || 0, 1 - rightTrack.noveltyResonance)
      : 0;
    
    // Suggest response approach
    let suggestedResponse: 'name_it' | 'explore_it' | 'witness_it';
    if (rightTrack.unnamedPresence) {
      suggestedResponse = 'witness_it';
    } else if (confidenceInNaming > 0.7) {
      suggestedResponse = 'name_it';
    } else {
      suggestedResponse = 'explore_it';
    }
    
    // Determine evolution phase
    const evolutionPhase = this.assessEvolutionPhase(leftTrack, rightTrack);
    
    return {
      dominantMode,
      confidenceInNaming,
      suggestedResponse,
      culturalContext,
      evolutionPhase
    };
  }
  
  /**
   * Generate response based on dual-track processing
   */
  generateResponse(state: DualTrackState): string {
    const { integration, rightTrack, leftTrack } = state;
    
    switch (integration.suggestedResponse) {
      case 'witness_it':
        // Pure RH attending - no naming
        return `I'm witnessing something in you that doesn't want to be named yet. ${rightTrack.livingQuality}. What wants to stay unnamed for now?`;
      
      case 'explore_it':
        // Both tracks active - gentle exploration
        const hint = leftTrack.categoricalSuggestion 
          ? `There's something here that reminds me of ${leftTrack.categoricalSuggestion}, but also something entirely your own.`
          : `There's a pattern emerging that feels both familiar and completely new.`;
        return `${hint} What are you discovering about this quality in yourself?`;
      
      case 'name_it':
        // LH classification with RH sensitivity
        if (leftTrack.hybridExpressions.length > 0) {
          const fusion = leftTrack.hybridExpressions[0];
          return `I see ${fusion.components.join(' meeting ')} in you - a beautiful fusion. How do these energies dance together in your experience?`;
        } else {
          return `The ${leftTrack.categoricalSuggestion} archetype seems alive in you. But more importantly, ${rightTrack.livingQuality}. How does this pattern want to express through you uniquely?`;
        }
    }
  }
  
  // Helper methods for RH attending
  
  private captureGestalt(input: string, history: string[]): string {
    // The whole impression before analysis
    const fullText = [...history, input].join(' ');
    
    if (fullText.length < 100) return "something emerging";
    
    // Gestalt impressions (not categories)
    if (/flowing|changing|shifting/i.test(fullText)) return "something in motion";
    if (/stuck|frozen|trapped/i.test(fullText)) return "something held";
    if (/opening|expanding|growing/i.test(fullText)) return "something expanding";
    if (/ending|closing|completing/i.test(fullText)) return "something completing";
    
    return "a unique presence";
  }
  
  private assessNovelty(input: string, history: string[]): number {
    let novelty = 0;
    
    // Explicit novelty markers
    if (/never.*before|first.*time|unprecedented|completely new/i.test(input)) {
      novelty += 0.4;
    }
    
    // Confusion/inability to name
    if (/can't describe|no words|don't know what|unnamed/i.test(input)) {
      novelty += 0.3;
    }
    
    // Cultural/generational uniqueness
    if (/my generation|my culture|where I'm from/i.test(input)) {
      novelty += 0.2;
    }
    
    // Paradox/both-and
    if (/both.*and.*but also|neither.*nor|between/i.test(input)) {
      novelty += 0.2;
    }
    
    return Math.min(novelty, 1);
  }
  
  private findAliveness(input: string): string {
    // What has the most energy/life force?
    const energyMarkers = input.match(/!(.*?)!/g);
    if (energyMarkers) return `What you marked with emphasis`;
    
    const questions = input.match(/\?(.*?)\?/g);
    if (questions) return `The questions you're holding`;
    
    const feelings = input.match(/feel|felt|feeling/gi);
    if (feelings && feelings.length > 2) return `The feelings moving through`;
    
    return `What you're bringing forward`;
  }
  
  private detectUnnameable(input: string, novelty: number): boolean {
    return novelty > 0.7 || 
           /beyond words|can't name|ineffable|mysterious/i.test(input);
  }
  
  private determineAttentionMode(novelty: number): 'narrow' | 'broad' | 'floating' {
    if (novelty > 0.7) return 'floating'; // Don't grasp
    if (novelty > 0.4) return 'broad'; // Stay open
    return 'narrow'; // Can focus
  }
  
  // Helper methods for LH classification
  
  private minimalClassification(): DualTrackState['leftTrack'] {
    // When RH says "too novel", LH backs off
    return {
      knownPatterns: new Map(),
      novelSignals: [],
      hybridExpressions: [],
      uncertaintyThreshold: 1.0,
      categoricalSuggestion: undefined
    };
  }
  
  private mapToArchetypes(input: string, history: string[]): Map<string, number> {
    // Would use embedding similarity in production
    // For now, keyword matching
    const patterns = new Map<string, number>();
    const text = [...history, input].join(' ').toLowerCase();
    
    // Sample archetype detection
    if (/seek|search|quest|journey/i.test(text)) {
      patterns.set('Seeker', 0.6);
    }
    if (/create|make|build|imagine/i.test(text)) {
      patterns.set('Creator', 0.5);
    }
    if (/heal|help|care|nurture/i.test(text)) {
      patterns.set('Healer', 0.4);
    }
    
    return patterns;
  }
  
  private detectEmergentPatterns(input: string, history: string[]): EmergentPattern[] {
    const patterns: EmergentPattern[] = [];
    
    // Look for culture-specific expressions
    if (/digital native|online community|virtual/i.test(input)) {
      patterns.push({
        id: 'digital-age-pattern',
        qualities: ['technological', 'connected', 'virtual'],
        firstObserved: new Date(),
        generationalMarkers: ['millennial', 'gen-z']
      });
    }
    
    return patterns;
  }
  
  private findHybridArchetypes(knownPatterns: Map<string, number>): ArchetypeFusion[] {
    const fusions: ArchetypeFusion[] = [];
    
    // If multiple archetypes score high, it's a fusion
    const highScoring = Array.from(knownPatterns.entries())
      .filter(([_, score]) => score > 0.4);
    
    if (highScoring.length > 1) {
      fusions.push({
        components: highScoring.map(([name]) => name),
        blendType: 'simultaneous',
        stability: 0.7
      });
    }
    
    return fusions;
  }
  
  private suggestCategory(
    patterns: Map<string, number>,
    hybrids: ArchetypeFusion[],
    uncertainty: number
  ): string | undefined {
    if (uncertainty > 0.7) return undefined;
    
    if (hybrids.length > 0) {
      return `${hybrids[0].components.join('-')} fusion`;
    }
    
    const sorted = Array.from(patterns.entries())
      .sort((a, b) => b[1] - a[1]);
    
    return sorted[0]?.[0];
  }
  
  private assessEvolutionPhase(
    leftTrack: DualTrackState['leftTrack'],
    rightTrack: DualTrackState['rightTrack']
  ): string {
    if (rightTrack.unnamedPresence) return 'emerging';
    if (leftTrack.hybridExpressions.length > 0) return 'integrating';
    if (leftTrack.uncertaintyThreshold > 0.5) return 'exploring';
    return 'expressing';
  }
}