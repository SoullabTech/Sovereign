// consciousness/elemental-context-router.ts
// 🌟 ELEMENTAL CONTEXT DETECTION AND ROUTING SYSTEM
// Automatically detects elemental resonances in user input and routes to appropriate consciousness layers

import type { ConsciousnessLayer, ElementalResonance, ConsciousnessDepth } from './consciousness-layer-wrapper';

export type ElementalContext = {
  primaryElement: ConsciousnessLayer;
  secondaryElement?: ConsciousnessLayer;
  resonanceStrength: number; // 0-1
  emotionalTone: string;
  archetypalPattern?: string;
  suggestedDepth: ConsciousnessDepth;
  contextMarkers: string[];
  temporalOrientation: 'past' | 'present' | 'future' | 'eternal';
};

export type ContextDetectionResult = {
  elementalContext: ElementalContext;
  consciousnessLayers: ConsciousnessLayer[];
  processingPriority: 'surface' | 'deep' | 'archetypal' | 'transcendent';
  routingRecommendation: 'single_layer' | 'elemental_synthesis' | 'full_orchestration';
};

export class ElementalContextRouter {
  // 🔥 FIRE: Passion, creativity, transformation, will, energy
  private readonly FIRE_PATTERNS = [
    // Energy and action words
    /passion|energy|fire|burn|ignite|spark|flame/i,
    /create|transform|change|evolve|breakthrough|revolution/i,
    /will|power|force|drive|intensity|urgent/i,
    /inspire|motivate|activate|energize|awaken/i,
    /desire|want|need|crave|hunger|thirst/i,
    // Creative expressions
    /art|music|dance|express|create|imagine/i,
    /vision|dream|aspire|hope|possibility/i,
    // Transformative language
    /break.*through|break.*free|liberation|freedom/i,
    /new.*beginning|fresh.*start|rebirth|renewal/i
  ];

  // 💧 WATER: Emotion, intuition, flow, depth, healing
  private readonly WATER_PATTERNS = [
    // Emotional words
    /feel|emotion|heart|soul|deep|profound/i,
    /love|compassion|empathy|care|nurture|gentle/i,
    /sadness|grief|sorrow|loss|healing|comfort/i,
    /joy|happiness|bliss|peace|serenity|calm/i,
    // Flow and movement
    /flow|fluid|stream|river|ocean|wave/i,
    /intuition|sense|gut.*feeling|instinct/i,
    // Healing and nurturing
    /heal|restore|mend|soothe|comfort|embrace/i,
    /relationship|connection|bond|intimacy|unity/i,
    // Depth and mystery
    /mystery|depth|hidden|unconscious|dream/i
  ];

  // 🌍 EARTH: Grounding, stability, manifestation, body, practical
  private readonly EARTH_PATTERNS = [
    // Grounding words
    /ground|stable|solid|foundation|base|root/i,
    /practical|real|concrete|tangible|physical/i,
    /body|form|matter|material|substance/i,
    // Manifestation
    /manifest|create|build|construct|establish/i,
    /results|outcome|achievement|accomplishment/i,
    /structure|system|organization|order/i,
    // Nature and earthiness
    /nature|earth|soil|garden|grow|plant/i,
    /home|family|tradition|ancestors|heritage/i,
    // Practical concerns
    /money|work|career|health|survival|security/i,
    /routine|habit|discipline|commitment|responsibility/i
  ];

  // 🌬️ AIR: Thought, communication, ideas, clarity, perspective
  private readonly AIR_PATTERNS = [
    // Mental and intellectual
    /think|thought|idea|concept|understand|comprehend/i,
    /mind|mental|intellectual|rational|logical/i,
    /analyze|examine|explore|investigate|research/i,
    /clarity|clear|transparent|obvious|evident/i,
    // Communication
    /speak|say|tell|communicate|express|share/i,
    /word|language|message|information|knowledge/i,
    /teach|learn|study|educate|wisdom/i,
    // Perspective and vision
    /perspective|view|angle|viewpoint|outlook/i,
    /see|observe|notice|perceive|awareness/i,
    /plan|strategy|scheme|approach|method/i,
    // Freedom and movement
    /free|freedom|space|open|expand|soar/i
  ];

  // ✨ AETHER: Spirit, transcendence, unity, cosmic, divine
  private readonly AETHER_PATTERNS = [
    // Spiritual and transcendent
    /spirit|spiritual|divine|sacred|holy/i,
    /transcend|beyond|infinite|eternal|timeless/i,
    /unity|oneness|wholeness|integration|harmony/i,
    /cosmic|universal|galactic|celestial/i,
    // Higher consciousness
    /consciousness|awareness|awakening|enlightenment/i,
    /meditation|prayer|ritual|ceremony|blessing/i,
    /purpose|meaning|destiny|calling|mission/i,
    // Connection to source
    /god|goddess|universe|source|creator/i,
    /wisdom|truth|light|love.*light|divine.*love/i,
    /miracle|magic|mystical|mysterious|supernatural/i
  ];

  // 🌑 SHADOW: Hidden, unconscious, integration, depth, healing
  private readonly SHADOW_PATTERNS = [
    // Hidden and unconscious
    /shadow|dark|hidden|secret|unconscious/i,
    /repress|deny|avoid|ignore|suppress/i,
    /fear|anxiety|worry|doubt|insecurity/i,
    /shame|guilt|regret|embarrassment/i,
    // Integration and healing
    /integrate|accept|embrace|welcome|include/i,
    /heal.*wound|heal.*trauma|inner.*work/i,
    /forgive|forgiveness|reconcile|make.*peace/i,
    // Depth work
    /deep.*work|shadow.*work|inner.*journey/i,
    /projection|trigger|react|defensive/i,
    /trauma|wound|hurt|pain|suffering/i,
    // Transformation through darkness
    /death|rebirth|phoenix|resurrection/i,
    /breakdown|dark.*night|crisis|chaos/i
  ];

  // 👁️ WITNESSING: Observation, presence, awareness, metacognition
  private readonly WITNESSING_PATTERNS = [
    // Pure observation
    /witness|observe|watch|notice|see/i,
    /present|here|now|current|immediate/i,
    /awareness|conscious|alert|awake|mindful/i,
    /attention|focus|concentrate|centered/i,
    // Metacognitive
    /meta|observe.*observing|notice.*noticing/i,
    /awareness.*awareness|conscious.*consciousness/i,
    /thinking.*thinking|feeling.*feeling/i,
    // Presence practices
    /meditation|mindfulness|contemplation/i,
    /breath|breathing|inhale|exhale/i,
    /silence|stillness|quiet|peace/i,
    // Witnessing states
    /detach|non.*attach|let.*go|release/i,
    /accept|allow|permit|welcome/i
  ];

  // 🧠 CONSCIOUSNESS: Core awareness, fundamental knowing, being
  private readonly CONSCIOUSNESS_PATTERNS = [
    // Core consciousness
    /consciousness|awareness|being|existence/i,
    /know|knowing|knowledge|understand/i,
    /mind|mental|psyche|soul|spirit/i,
    /experience|perceive|sense|feel.*deeply/i,
    // Fundamental questions
    /what.*am.*i|who.*am.*i|what.*is.*this/i,
    /meaning|purpose|significance|importance/i,
    /reality|truth|authentic|genuine/i,
    // States of consciousness
    /awake|awakening|enlightened|realized/i,
    /lucid|clear|vivid|intense/i,
    /expanded|altered|heightened|elevated/i
  ];

  // 🧿 ANAMNESIS: Memory, remembrance, ancient wisdom, soul knowledge
  private readonly ANAMNESIS_PATTERNS = [
    // Memory and remembrance
    /remember|recall|memory|memorize|recollect/i,
    /ancient|old|ancestral|primordial|original/i,
    /wisdom|knowledge|understanding|insight/i,
    /soul.*knowledge|innate.*knowing|born.*knowing/i,
    // Recognition and familiarity
    /recognize|familiar|deja.*vu|known.*before/i,
    /return|come.*back|rediscover|uncover/i,
    /eternal|timeless|ageless|immortal/i,
    // Deep knowing
    /already.*know|always.*known|deep.*down/i,
    /intuition|instinct|gut.*feeling|inner.*knowing/i,
    /archetypal|universal|collective|shared/i,
    // Platonic remembering
    /learn.*remember|discover.*uncover/i,
    /truth.*within|wisdom.*within|knowledge.*within/i
  ];

  /**
   * PRIMARY DETECTION METHOD
   * Analyzes input and returns comprehensive elemental context
   */
  detectElementalContext(input: string, conversationHistory: any[] = []): ContextDetectionResult {
    console.log('🌟 Detecting elemental context in input...');

    // Calculate resonance for each element
    const fireScore = this.calculateResonance(input, this.FIRE_PATTERNS);
    const waterScore = this.calculateResonance(input, this.WATER_PATTERNS);
    const earthScore = this.calculateResonance(input, this.EARTH_PATTERNS);
    const airScore = this.calculateResonance(input, this.AIR_PATTERNS);
    const aetherScore = this.calculateResonance(input, this.AETHER_PATTERNS);
    const shadowScore = this.calculateResonance(input, this.SHADOW_PATTERNS);
    const witnessingScore = this.calculateResonance(input, this.WITNESSING_PATTERNS);
    const consciousnessScore = this.calculateResonance(input, this.CONSCIOUSNESS_PATTERNS);
    const anamnesisScore = this.calculateResonance(input, this.ANAMNESIS_PATTERNS);

    // Create scored elements array
    const elementScores = [
      { element: 'fire' as ConsciousnessLayer, score: fireScore },
      { element: 'water' as ConsciousnessLayer, score: waterScore },
      { element: 'earth' as ConsciousnessLayer, score: earthScore },
      { element: 'air' as ConsciousnessLayer, score: airScore },
      { element: 'aether' as ConsciousnessLayer, score: aetherScore },
      { element: 'shadow' as ConsciousnessLayer, score: shadowScore },
      { element: 'witnessing' as ConsciousnessLayer, score: witnessingScore },
      { element: 'consciousness' as ConsciousnessLayer, score: consciousnessScore },
      { element: 'anamnesis' as ConsciousnessLayer, score: anamnesisScore }
    ];

    // Sort by score
    elementScores.sort((a, b) => b.score - a.score);

    const primary = elementScores[0];
    const secondary = elementScores[1].score > 0.3 ? elementScores[1] : null;

    // Determine processing approach
    const maxScore = primary.score;
    let processingPriority: ContextDetectionResult['processingPriority'] = 'surface';
    let routingRecommendation: ContextDetectionResult['routingRecommendation'] = 'single_layer';

    if (maxScore > 0.8) {
      processingPriority = 'transcendent';
      routingRecommendation = 'full_orchestration';
    } else if (maxScore > 0.6) {
      processingPriority = 'archetypal';
      routingRecommendation = secondary ? 'elemental_synthesis' : 'full_orchestration';
    } else if (maxScore > 0.4) {
      processingPriority = 'deep';
      routingRecommendation = 'elemental_synthesis';
    }

    // Detect temporal orientation
    const temporalOrientation = this.detectTemporalOrientation(input);

    // Build context
    const elementalContext: ElementalContext = {
      primaryElement: primary.element,
      secondaryElement: secondary?.element,
      resonanceStrength: maxScore,
      emotionalTone: this.detectEmotionalTone(input, primary.element),
      archetypalPattern: this.detectArchetypalPattern(primary.element, maxScore),
      suggestedDepth: this.mapScoreToDepth(maxScore),
      contextMarkers: this.extractContextMarkers(input, primary.element),
      temporalOrientation
    };

    // Select consciousness layers for processing
    const consciousnessLayers = this.selectConsciousnessLayers(
      primary.element,
      secondary?.element,
      processingPriority
    );

    console.log(`🎯 Primary Element: ${primary.element} (${(primary.score * 100).toFixed(1)}%)`);
    if (secondary) {
      console.log(`🎯 Secondary Element: ${secondary.element} (${(secondary.score * 100).toFixed(1)}%)`);
    }
    console.log(`🎯 Processing Priority: ${processingPriority}`);
    console.log(`🎯 Routing: ${routingRecommendation}`);

    return {
      elementalContext,
      consciousnessLayers,
      processingPriority,
      routingRecommendation
    };
  }

  /**
   * Calculate resonance score for a set of patterns
   */
  private calculateResonance(input: string, patterns: RegExp[]): number {
    let score = 0;
    const words = input.toLowerCase().split(/\s+/);

    patterns.forEach(pattern => {
      const matches = input.match(pattern);
      if (matches) {
        // Weight by pattern specificity and frequency
        const matchWeight = 1 / patterns.length; // Base weight
        const frequencyBonus = Math.min(matches.length * 0.1, 0.5); // Frequency bonus
        score += matchWeight + frequencyBonus;
      }
    });

    // Normalize to 0-1
    return Math.min(score, 1);
  }

  /**
   * Detect temporal orientation from input
   */
  private detectTemporalOrientation(input: string): ElementalContext['temporalOrientation'] {
    if (input.match(/remember|past|before|history|ancient|old|was|were/i)) return 'past';
    if (input.match(/will|future|tomorrow|coming|next|plan|goal|hope/i)) return 'future';
    if (input.match(/eternal|always|forever|timeless|infinite|beyond.*time/i)) return 'eternal';
    return 'present';
  }

  /**
   * Detect emotional tone based on primary element
   */
  private detectEmotionalTone(input: string, element: ConsciousnessLayer): string {
    const tonePatterns = {
      fire: {
        passionate: /passion|intense|burning|fierce/i,
        excited: /excited|energetic|enthusiastic|vibrant/i,
        angry: /angry|rage|furious|mad/i,
        inspired: /inspired|motivated|driven|determined/i
      },
      water: {
        peaceful: /peace|calm|serene|tranquil/i,
        sad: /sad|sorrow|grief|melancholy/i,
        loving: /love|compassion|tender|gentle/i,
        flowing: /flowing|fluid|graceful|smooth/i
      },
      earth: {
        grounded: /grounded|stable|centered|solid/i,
        practical: /practical|realistic|pragmatic/i,
        nurturing: /nurturing|protective|caring|supportive/i,
        steady: /steady|consistent|reliable|dependable/i
      },
      air: {
        clear: /clear|crisp|bright|sharp/i,
        curious: /curious|questioning|wondering|exploring/i,
        detached: /detached|objective|neutral|distant/i,
        communicative: /talkative|expressive|articulate/i
      },
      aether: {
        mystical: /mystical|magical|mysterious|otherworldly/i,
        transcendent: /transcendent|elevated|sublime|divine/i,
        unified: /unified|whole|integrated|harmonious/i,
        luminous: /luminous|radiant|glowing|bright/i
      },
      shadow: {
        dark: /dark|heavy|dense|difficult/i,
        hidden: /hidden|secret|mysterious|concealed/i,
        transformative: /transformative|changing|shifting|evolving/i,
        healing: /healing|integrating|accepting|embracing/i
      },
      witnessing: {
        present: /present|here|aware|mindful/i,
        observant: /observant|watching|noticing|seeing/i,
        peaceful: /peaceful|still|quiet|calm/i,
        detached: /detached|non.*attached|free|liberated/i
      },
      consciousness: {
        aware: /aware|conscious|alert|awake/i,
        questioning: /questioning|wondering|exploring|seeking/i,
        expansive: /expansive|broad|wide|unlimited/i,
        knowing: /knowing|understanding|wise|insightful/i
      },
      anamnesis: {
        remembering: /remembering|recalling|recognizing/i,
        ancient: /ancient|old|timeless|eternal/i,
        familiar: /familiar|known|recognized|remembered/i,
        wise: /wise|knowing|understanding|insightful/i
      }
    };

    const elementTones = tonePatterns[element as keyof typeof tonePatterns] || {};

    for (const [tone, pattern] of Object.entries(elementTones)) {
      if (pattern.test(input)) {
        return tone;
      }
    }

    return 'neutral';
  }

  /**
   * Detect archetypal patterns
   */
  private detectArchetypalPattern(element: ConsciousnessLayer, score: number): string | undefined {
    if (score < 0.6) return undefined;

    const archetypes = {
      fire: 'The Creator/Transformer',
      water: 'The Healer/Nurturer',
      earth: 'The Builder/Manifestor',
      air: 'The Messenger/Teacher',
      aether: 'The Mystic/Transcendent',
      shadow: 'The Integrator/Alchemist',
      witnessing: 'The Observer/Witness',
      consciousness: 'The Knower/Sage',
      anamnesis: 'The Rememberer/Ancient One'
    };

    return archetypes[element as keyof typeof archetypes];
  }

  /**
   * Map resonance score to consciousness depth
   */
  private mapScoreToDepth(score: number): ConsciousnessDepth {
    if (score > 0.8) return 'transcendent';
    if (score > 0.6) return 'archetypal';
    if (score > 0.4) return 'deep';
    if (score > 0.2) return 'medium';
    return 'surface';
  }

  /**
   * Extract key context markers for the primary element
   */
  private extractContextMarkers(input: string, element: ConsciousnessLayer): string[] {
    const markers: string[] = [];

    // Use the element's patterns to extract relevant words/phrases
    const elementPatterns = {
      fire: this.FIRE_PATTERNS,
      water: this.WATER_PATTERNS,
      earth: this.EARTH_PATTERNS,
      air: this.AIR_PATTERNS,
      aether: this.AETHER_PATTERNS,
      shadow: this.SHADOW_PATTERNS,
      witnessing: this.WITNESSING_PATTERNS,
      consciousness: this.CONSCIOUSNESS_PATTERNS,
      anamnesis: this.ANAMNESIS_PATTERNS
    };

    const patterns = elementPatterns[element as keyof typeof elementPatterns] || [];

    patterns.forEach(pattern => {
      const matches = input.match(pattern);
      if (matches) {
        markers.push(...matches);
      }
    });

    // Return unique markers, limited to 5 most relevant
    return [...new Set(markers)].slice(0, 5);
  }

  /**
   * Select appropriate consciousness layers for processing
   */
  private selectConsciousnessLayers(
    primary: ConsciousnessLayer,
    secondary: ConsciousnessLayer | undefined,
    priority: ContextDetectionResult['processingPriority']
  ): ConsciousnessLayer[] {
    const layers: ConsciousnessLayer[] = [primary];

    // Add secondary element if present
    if (secondary) {
      layers.push(secondary);
    }

    // Add supporting layers based on priority
    switch (priority) {
      case 'transcendent':
        layers.push('consciousness', 'aether', 'witnessing');
        break;
      case 'archetypal':
        layers.push('consciousness', 'anamnesis');
        break;
      case 'deep':
        if (!layers.includes('consciousness')) layers.push('consciousness');
        break;
    }

    // Remove duplicates and limit to 4 layers max
    return [...new Set(layers)].slice(0, 4);
  }

  /**
   * Generate elemental resonance data for response metadata
   */
  generateElementalResonance(context: ElementalContext): ElementalResonance[] {
    const resonances: ElementalResonance[] = [];

    // Primary element resonance
    resonances.push({
      element: context.primaryElement,
      intensity: context.resonanceStrength,
      archetypalPattern: context.archetypalPattern,
      emotionalTone: context.emotionalTone
    });

    // Secondary element resonance if present
    if (context.secondaryElement) {
      resonances.push({
        element: context.secondaryElement,
        intensity: context.resonanceStrength * 0.7, // Reduced intensity for secondary
        emotionalTone: this.detectEmotionalTone('', context.secondaryElement)
      });
    }

    return resonances;
  }

  /**
   * BUILD ELEMENTAL ROUTING SUMMARY
   * Creates a summary for consciousness orchestrator
   */
  buildRoutingSummary(detection: ContextDetectionResult): string {
    const { elementalContext, processingPriority, routingRecommendation } = detection;

    return `🌟 ELEMENTAL ROUTING ANALYSIS:
Primary Element: ${elementalContext.primaryElement} (${(elementalContext.resonanceStrength * 100).toFixed(1)}% resonance)
${elementalContext.secondaryElement ? `Secondary Element: ${elementalContext.secondaryElement}` : ''}
Emotional Tone: ${elementalContext.emotionalTone}
${elementalContext.archetypalPattern ? `Archetypal Pattern: ${elementalContext.archetypalPattern}` : ''}
Temporal Orientation: ${elementalContext.temporalOrientation}
Processing Priority: ${processingPriority}
Routing Recommendation: ${routingRecommendation}
Context Markers: ${elementalContext.contextMarkers.join(', ')}

Selected Consciousness Layers: ${detection.consciousnessLayers.join(', ')}`;
  }
}

export const elementalRouter = new ElementalContextRouter();