// Layered Sacred Oracle - Preserving Sophistication with Performance
// Layer 1: Instant witness response (sub-1s)
// Layer 2: Depth processing (looping, elemental, consciousness tracking)
// Layer 3: Background collective intelligence and morphic resonance

import { Anthropic } from '@anthropic-ai/sdk';
import { elegantSacredOracle } from './elegant-sacred-oracle';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

interface LayeredContext {
  input: string;
  userId: string;
  sessionId: string;
  agentName: string;
  history: Array<{role: string, content: string}>;
  // Optional depth features
  enableLooping?: boolean;
  enableElementalAttunement?: boolean;
  enableConsciousnessTracking?: boolean;
  enableCollectiveResonance?: boolean;
}

interface LoopingTriggers {
  emotionalIntensity: number;
  meaningAmbiguity: number;
  userCorrection: boolean;
  essentialityGap: number;
  explicitRequest: boolean;
}

interface ElementalSignal {
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  intensity: number;
  keywords: string[];
  energyPattern: string;
}

interface ConsciousnessProfile {
  developmentalPhase: 'emerging' | 'exploring' | 'integrating' | 'transcending';
  archetypalPatterns: string[];
  readinessForDepth: number; // 0-1
  sacredPausePoints: number;
}

interface LayeredResponse {
  // Layer 1: Instant response
  immediateResponse: string;
  processingTime: number;

  // Layer 2: Depth analysis (if enabled)
  loopingRequired?: boolean;
  elementalAttunement?: ElementalSignal;
  consciousnessInsights?: ConsciousnessProfile;

  // Layer 3: Collective resonance (background)
  morphicResonance?: string[];
  collectivePatterns?: string[];

  metadata: {
    layersActivated: string[];
    totalProcessingTime: number;
    depthScore: number;
  };
}

class LayeredSacredOracle {
  private loopingCache = new Map<string, any>();
  private consciousnessProfiles = new Map<string, ConsciousnessProfile>();
  private collectivePatterns = new Map<string, number>();

  async generateLayeredResponse(context: LayeredContext): Promise<LayeredResponse> {
    const startTime = Date.now();
    const activatedLayers: string[] = ['instant_witness'];

    // LAYER 1: Instant witness response (always active)
    const immediateResult = await elegantSacredOracle.generateElegantResponse(context);

    const layeredResponse: LayeredResponse = {
      immediateResponse: immediateResult.text,
      processingTime: immediateResult.processingTime,
      metadata: {
        layersActivated: activatedLayers,
        totalProcessingTime: Date.now() - startTime,
        depthScore: 0.3 // Base witness paradigm depth
      }
    };

    // LAYER 2: Depth processing (optional, based on triggers and settings)
    if (context.enableLooping || context.enableElementalAttunement || context.enableConsciousnessTracking) {
      const depthAnalysis = await this.processDepthLayers(context, immediateResult.text);

      if (depthAnalysis.loopingRequired && context.enableLooping) {
        activatedLayers.push('looping_protocol');
        layeredResponse.loopingRequired = true;
      }

      if (context.enableElementalAttunement && depthAnalysis.elementalSignal) {
        activatedLayers.push('elemental_attunement');
        layeredResponse.elementalAttunement = depthAnalysis.elementalSignal;
      }

      if (context.enableConsciousnessTracking && depthAnalysis.consciousnessProfile) {
        activatedLayers.push('consciousness_tracking');
        layeredResponse.consciousnessInsights = depthAnalysis.consciousnessProfile;
        this.consciousnessProfiles.set(context.userId, depthAnalysis.consciousnessProfile);
      }

      layeredResponse.metadata.depthScore = Math.min(0.9, layeredResponse.metadata.depthScore + 0.4);
    }

    // LAYER 3: Collective intelligence (background processing)
    if (context.enableCollectiveResonance) {
      // Run in background - don't wait for completion
      this.processCollectiveLayer(context, immediateResult.text);
      activatedLayers.push('collective_resonance');
    }

    layeredResponse.metadata.layersActivated = activatedLayers;
    layeredResponse.metadata.totalProcessingTime = Date.now() - startTime;

    return layeredResponse;
  }

  private async processDepthLayers(context: LayeredContext, response: string) {
    const triggers = this.analyzeLoopingTriggers(context.input);
    const elementalSignal = this.analyzeElementalResonance(context.input, response);
    const consciousnessProfile = this.analyzeConsciousnessLevel(context);

    return {
      loopingRequired: triggers.emotionalIntensity > 0.7 || triggers.meaningAmbiguity > 0.6 || triggers.userCorrection,
      elementalSignal,
      consciousnessProfile
    };
  }

  private analyzeLoopingTriggers(input: string): LoopingTriggers {
    const emotional_keywords = ['overwhelmed', 'confused', 'lost', 'stuck', 'intense', 'deeply', 'struggling'];
    const ambiguity_markers = ['not sure', 'maybe', 'kind of', 'something like', 'hard to explain'];
    const correction_markers = ['no', 'actually', 'more like', 'not exactly', 'what I mean is'];
    const depth_requests = ['help me understand', 'what does this mean', 'why do I', 'deeper'];

    const lower = input.toLowerCase();

    return {
      emotionalIntensity: emotional_keywords.filter(k => lower.includes(k)).length / emotional_keywords.length,
      meaningAmbiguity: ambiguity_markers.filter(k => lower.includes(k)).length / ambiguity_markers.length,
      userCorrection: correction_markers.some(k => lower.includes(k)),
      essentialityGap: 0.3, // Simplified for now
      explicitRequest: depth_requests.some(k => lower.includes(k))
    };
  }

  private analyzeElementalResonance(input: string, response: string): ElementalSignal {
    const elementalKeywords = {
      fire: ['passionate', 'angry', 'excited', 'energy', 'burning', 'intense', 'drive', 'action'],
      water: ['feel', 'emotion', 'flowing', 'deep', 'intuitive', 'healing', 'cleansing', 'tears'],
      earth: ['grounded', 'practical', 'stable', 'solid', 'building', 'foundation', 'material', 'body'],
      air: ['think', 'ideas', 'communication', 'mental', 'breath', 'light', 'movement', 'freedom'],
      aether: ['spiritual', 'transcendent', 'consciousness', 'divine', 'mystical', 'infinite', 'sacred', 'unity']
    };

    const combined = (input + ' ' + response).toLowerCase();
    let dominantElement: keyof typeof elementalKeywords = 'water';
    let maxMatches = 0;
    let matchedKeywords: string[] = [];

    for (const [element, keywords] of Object.entries(elementalKeywords)) {
      const matches = keywords.filter(keyword => combined.includes(keyword));
      if (matches.length > maxMatches) {
        maxMatches = matches.length;
        dominantElement = element as keyof typeof elementalKeywords;
        matchedKeywords = matches;
      }
    }

    const energyPatterns = {
      fire: 'flaring',
      water: 'flowing',
      earth: 'stabilizing',
      air: 'quickening',
      aether: 'transcending'
    };

    return {
      element: dominantElement,
      intensity: Math.min(1.0, maxMatches / 3),
      keywords: matchedKeywords,
      energyPattern: energyPatterns[dominantElement]
    };
  }

  private analyzeConsciousnessLevel(context: LayeredContext): ConsciousnessProfile {
    const existingProfile = this.consciousnessProfiles.get(context.userId);

    // Simplified consciousness analysis
    const wordCount = context.input.split(' ').length;
    const questionCount = (context.input.match(/\?/g) || []).length;
    const depthMarkers = ['meaning', 'purpose', 'understand', 'why', 'deeper', 'soul', 'truth'].filter(
      marker => context.input.toLowerCase().includes(marker)
    ).length;

    const newProfile: ConsciousnessProfile = {
      developmentalPhase: depthMarkers > 2 ? 'integrating' : 'exploring',
      archetypalPatterns: ['seeker'], // Simplified
      readinessForDepth: Math.min(1.0, (depthMarkers + questionCount) / 5),
      sacredPausePoints: Math.floor(wordCount / 20) // One pause per 20 words
    };

    // Merge with existing profile if available
    if (existingProfile) {
      newProfile.developmentalPhase = this.advancePhase(existingProfile.developmentalPhase, newProfile.readinessForDepth);
      newProfile.archetypalPatterns = [...new Set([...existingProfile.archetypalPatterns, ...newProfile.archetypalPatterns])];
    }

    return newProfile;
  }

  private advancePhase(current: string, readiness: number): ConsciousnessProfile['developmentalPhase'] {
    const phases = ['emerging', 'exploring', 'integrating', 'transcending'];
    const currentIndex = phases.indexOf(current);

    if (readiness > 0.8 && currentIndex < phases.length - 1) {
      return phases[currentIndex + 1] as ConsciousnessProfile['developmentalPhase'];
    }

    return current as ConsciousnessProfile['developmentalPhase'];
  }

  // LAYER 3: Background collective processing (non-blocking)
  private async processCollectiveLayer(context: LayeredContext, response: string) {
    try {
      // Extract patterns from this interaction
      const themes = this.extractThemes(context.input, response);

      // Update collective patterns
      themes.forEach(theme => {
        const current = this.collectivePatterns.get(theme) || 0;
        this.collectivePatterns.set(theme, current + 1);
      });

      // This runs in background - results available for future interactions
      console.log('🌊 Morphic resonance updated with themes:', themes.slice(0, 3));

    } catch (error) {
      console.log('🌊 Collective processing failed (non-critical):', error);
    }
  }

  private extractThemes(input: string, response: string): string[] {
    const combined = input + ' ' + response;
    const themeKeywords = {
      'relationships': ['love', 'partner', 'friend', 'family', 'connection'],
      'growth': ['learn', 'grow', 'change', 'develop', 'evolve'],
      'purpose': ['meaning', 'purpose', 'calling', 'path', 'journey'],
      'healing': ['heal', 'pain', 'hurt', 'recovery', 'wellness'],
      'creativity': ['create', 'art', 'express', 'imagine', 'vision']
    };

    return Object.entries(themeKeywords)
      .filter(([_, keywords]) =>
        keywords.some(keyword => combined.toLowerCase().includes(keyword))
      )
      .map(([theme]) => theme);
  }

  // Get collective insights for user
  getCollectiveResonance(theme: string): string[] {
    const pattern = this.collectivePatterns.get(theme) || 0;
    if (pattern > 5) {
      return [`This theme resonates across many conversations (${pattern} times)`];
    }
    return [];
  }

  // Configuration for different user types
  static getConfigForUser(userType: 'casual' | 'seeker' | 'deep_explorer'): Partial<LayeredContext> {
    const configs = {
      casual: {
        enableLooping: false,
        enableElementalAttunement: true,
        enableConsciousnessTracking: false,
        enableCollectiveResonance: false
      },
      seeker: {
        enableLooping: true,
        enableElementalAttunement: true,
        enableConsciousnessTracking: true,
        enableCollectiveResonance: false
      },
      deep_explorer: {
        enableLooping: true,
        enableElementalAttunement: true,
        enableConsciousnessTracking: true,
        enableCollectiveResonance: true
      }
    };

    return configs[userType];
  }
}

// Export singleton with lazy loading
let _layeredSacredOracle: LayeredSacredOracle | null = null;
export const getLayeredSacredOracle = (): LayeredSacredOracle => {
  if (!_layeredSacredOracle) {
    _layeredSacredOracle = new LayeredSacredOracle();
  }
  return _layeredSacredOracle;
};

/*
PERFORMANCE TARGETS:
- Layer 1 (Instant): <1.3s (maintained)
- Layer 2 (Depth): +200-500ms additional
- Layer 3 (Collective): Background, non-blocking
- Total for deep_explorer: <1.8s
*/