/**
 * MAIA Archetypal Intelligence Engine
 * Based on planetary archetypes and consciousness structures
 */

export type ArchetypalSignature =
  | 'solar'      // ☉ Identity, heroic integration, logos
  | 'lunar'      // ☽ Reflection, ancestry, emotional resonance
  | 'mercurial'  // ☿ Ideation, communication, bridging
  | 'venusian'   // ♀ Harmony, synthesis, aesthetic unity
  | 'martian'    // ♂ Action, achievement, breakthrough
  | 'jovian'     // ♃ Expansion, success, hierarchical wisdom
  | 'saturnian'  // ♄ Structure, tradition, disciplinary wisdom
  | 'uranian'    // ♅ Liberation, revolution, electrical insight
  | 'neptunian'  // ♆ Oceanic unity, transcendental ideals
  | 'plutonic';  // ♇ Primal wisdom, shadow integration, regeneration

export type ConsciousnessStructure =
  | 'archaic'    // Undifferentiated unity (BPM1)
  | 'magical'    // Separation anxiety, primal connection (BPM2-3)
  | 'mythical'   // Individual emergence, heroic consciousness (BPM4)
  | 'mental'     // Rational, conceptual thinking
  | 'integral';  // Conscious participation in all structures

export type HeroJourneyPhase =
  | 'ordinary_world'      // Neptune - Initial harmony, oceanic unity
  | 'call_to_adventure'   // Mercury - Receiving guidance, divine message
  | 'refusal_of_call'     // Saturn - Resistance, fear of change
  | 'meeting_mentor'      // Jupiter - Wisdom teacher appears
  | 'crossing_threshold'  // Moon - Liminal crossing, ancestral guidance
  | 'tests_allies'        // Jupiter - Trials and growth, companions
  | 'approach_inmost'     // Saturn - Approaching the ordeal
  | 'ordeal_abyss'       // Pluto - Death/rebirth in depths
  | 'reward_seizure'     // Mars - Claiming the treasure through action
  | 'road_back'          // Mercury - Return journey begins
  | 'resurrection'       // Sun - Final transformation, integration
  | 'return_elixir'      // Venus - Sharing gifts with community

export interface ArchetypalResonance {
  signature: ArchetypalSignature;
  intensity: number; // 0-1
  context: string;
  keywords: string[];
  emotionalTone: string;
}

export interface UserArchetypalProfile {
  dominantArchetypes: ArchetypalSignature[];
  consciousnessStructure: ConsciousnessStructure;
  heroJourneyPhase: HeroJourneyPhase;
  currentResonances: ArchetypalResonance[];
  shadowWork: {
    integratedAspects: ArchetypalSignature[];
    emergingAspects: ArchetypalSignature[];
  };
  fieldConnections: {
    lunar: number;    // Connection to past/ancestry
    solar: number;    // Individual identity strength
    collective: number; // Jupiter/Neptune collective resonance
  };
}

export class ArchetypalEngine implements FieldDetector {
  private archetypalPatterns: Map<ArchetypalSignature, ArchetypalPattern>;
  private transitionMatrix: Map<string, ArchetypalSignature[]>;
  private fieldActivationPatterns: Map<FieldType, FieldActivationPattern>;
  private activeFields: FieldResonance[] = [];
  private consciousnessMatrices: Map<ConsciousnessStructure, PerinatalMatrix[]>;

  constructor() {
    this.archetypalPatterns = this.initializeArchetypalPatterns();
    this.transitionMatrix = this.initializeTransitionMatrix();
    this.fieldActivationPatterns = this.initializeFieldPatterns();
    this.consciousnessMatrices = this.initializeConsciousnessMatrices();
  }

  /**
   * Analyze message for archetypal resonances
   */
  analyzeMessage(message: string, context: ConversationContext): ArchetypalResonance[] {
    const resonances: ArchetypalResonance[] = [];

    // Analyze each archetypal pattern
    for (const [signature, pattern] of this.archetypalPatterns) {
      const intensity = this.calculateResonanceIntensity(message, pattern, context);

      if (intensity > 0.2) { // Threshold for significant resonance
        resonances.push({
          signature,
          intensity,
          context: this.extractResonanceContext(message, pattern),
          keywords: this.extractRelevantKeywords(message, pattern),
          emotionalTone: this.analyzeEmotionalTone(message, pattern)
        });
      }
    }

    return resonances.sort((a, b) => b.intensity - a.intensity);
  }

  /**
   * Determine optimal archetypal response based on user state and resonances
   */
  determineResponse(
    userProfile: UserArchetypalProfile,
    messageResonances: ArchetypalResonance[],
    conversationHistory: ConversationHistory
  ): ArchetypalResponse {

    // Consider user's current phase in hero's journey
    const journeyGuidance = this.getHeroJourneyGuidance(userProfile.heroJourneyPhase);

    // Identify what archetypal energy would be most helpful
    const primaryResonance = messageResonances[0];
    const complementaryArchetype = this.findComplementaryArchetype(
      primaryResonance?.signature,
      userProfile
    );

    // Check for integration opportunities
    const integrationOpportunity = this.detectIntegrationOpportunity(
      userProfile,
      messageResonances
    );

    return {
      primaryArchetype: complementaryArchetype,
      supportingArchetypes: this.selectSupportingArchetypes(userProfile, messageResonances),
      responseStrategy: this.determineResponseStrategy(userProfile, primaryResonance),
      integrationGuidance: integrationOpportunity,
      heroJourneyGuidance: journeyGuidance
    };
  }

  /**
   * Generate archetypal response content
   */
  generateArchetypalResponse(
    archetypalResponse: ArchetypalResponse,
    userMessage: string,
    context: ConversationContext
  ): ArchetypalResponseContent {

    const archetype = archetypalResponse.primaryArchetype;
    const pattern = this.archetypalPatterns.get(archetype)!;

    return {
      tone: pattern.responseTone,
      perspective: this.generateArchetypalPerspective(archetype, userMessage, context),
      guidance: this.generateArchetypalGuidance(archetype, archetypalResponse, context),
      questions: this.generateArchetypalQuestions(archetype, context),
      symbols: pattern.symbols,
      metaphors: this.selectRelevantMetaphors(pattern, userMessage),
      energeticQuality: pattern.energeticSignature
    };
  }

  private initializeArchetypalPatterns(): Map<ArchetypalSignature, ArchetypalPattern> {
    return new Map([
      ['solar', {
        keywords: ['purpose', 'identity', 'hero', 'journey', 'calling', 'will', 'shine', 'center', 'integration', 'logos'],
        emotionalPatterns: ['seeking purpose', 'identity crisis', 'heroic determination', 'self-actualization'],
        symbols: ['sun', 'light', 'gold', 'crown', 'fire', 'lion', 'eagle'],
        responseTone: 'inspiring, integrative, purposeful',
        energeticSignature: 'radiant, centering, empowering',
        complementaryArchetypes: ['lunar', 'venusian', 'mercurial'],
        shadowAspects: ['grandiosity', 'ego-inflation', 'tyranny'],
        questions: [
          "What is your deepest calling in this situation?",
          "How can you shine your unique light here?",
          "What would integration look like for you?"
        ]
      }],

      ['lunar', {
        keywords: ['memory', 'ancestor', 'cycle', 'reflection', 'intuition', 'past', 'mother', 'wisdom', 'flow'],
        emotionalPatterns: ['nostalgic longing', 'ancestral connection', 'cyclical awareness', 'emotional reflection'],
        symbols: ['moon', 'silver', 'water', 'mirror', 'pearl', 'owl', 'cave'],
        responseTone: 'reflective, nurturing, wisdom-bearing',
        energeticSignature: 'flowing, receptive, cyclical',
        complementaryArchetypes: ['solar', 'saturnian'],
        shadowAspects: ['living in past', 'emotional stagnation', 'victim mentality'],
        questions: [
          "What wisdom from your past is speaking to you?",
          "How do the cycles of your life inform this moment?",
          "What ancestral strength can you draw upon?"
        ]
      }],

      ['neptunian', {
        keywords: ['unity', 'transcendence', 'ocean', 'dream', 'spiritual', 'ideal', 'oneness', 'compassion', 'infinite'],
        emotionalPatterns: ['mystical longing', 'compassionate overflow', 'transcendental aspiration', 'unity consciousness'],
        symbols: ['ocean', 'mist', 'rainbow', 'lotus', 'infinity', 'whale', 'crystal'],
        responseTone: 'mystical, compassionate, transcendent',
        energeticSignature: 'oceanic, dissolving, unifying',
        complementaryArchetypes: ['plutonic', 'uranian', 'saturnian'],
        shadowAspects: ['escapism', 'delusion', 'martyrdom', 'spiritual bypassing'],
        questions: [
          "How does this connect you to something larger than yourself?",
          "What is the deeper spiritual significance here?",
          "How can compassion transform this situation?"
        ]
      }],

      ['plutonic', {
        keywords: ['shadow', 'death', 'rebirth', 'power', 'survival', 'primal', 'transformation', 'underworld', 'regeneration'],
        emotionalPatterns: ['confronting shadow', 'survival instincts', 'power dynamics', 'regenerative crisis'],
        symbols: ['phoenix', 'serpent', 'volcano', 'diamond', 'underworld', 'scorpion', 'coal'],
        responseTone: 'penetrating, transformative, unflinching',
        energeticSignature: 'intense, regenerative, primal',
        complementaryArchetypes: ['solar', 'venusian', 'neptunian'],
        shadowAspects: ['destructiveness', 'power obsession', 'nihilism'],
        questions: [
          "What needs to die for something new to be born?",
          "Where are you avoiding your own power?",
          "What truth are you not willing to face?"
        ]
      }],

      ['mercurial', {
        keywords: ['communication', 'connection', 'bridge', 'message', 'knowledge', 'learning', 'translation', 'wit', 'curiosity'],
        emotionalPatterns: ['intellectual curiosity', 'communicative flow', 'bridge-building', 'playful wisdom'],
        symbols: ['wings', 'caduceus', 'messenger', 'quicksilver', 'book', 'bridge', 'twins'],
        responseTone: 'curious, connecting, informative',
        energeticSignature: 'quick, adaptable, linking',
        complementaryArchetypes: ['jovian', 'saturnian'],
        shadowAspects: ['superficiality', 'information overload', 'trickery'],
        questions: [
          "What connection is trying to be made here?",
          "How can this knowledge be shared or applied?",
          "What perspective shift would be helpful?"
        ]
      }],

      ['martian', {
        keywords: ['action', 'courage', 'breakthrough', 'will', 'determination', 'conquest', 'energy', 'initiative', 'strength'],
        emotionalPatterns: ['determined drive', 'courageous action', 'competitive spirit', 'breakthrough energy'],
        symbols: ['sword', 'fire', 'ram', 'iron', 'red', 'warrior', 'mountain'],
        responseTone: 'direct, energizing, action-oriented',
        energeticSignature: 'forceful, penetrating, dynamic',
        complementaryArchetypes: ['venusian', 'lunar'],
        shadowAspects: ['aggression', 'impatience', 'destruction'],
        questions: [
          "What action needs to be taken right now?",
          "Where do you need to apply more will and determination?",
          "What barrier is ready to be broken through?"
        ]
      }],

      ['jovian', {
        keywords: ['expansion', 'wisdom', 'success', 'growth', 'abundance', 'teacher', 'philosophy', 'optimism', 'leadership'],
        emotionalPatterns: ['expansive optimism', 'teaching impulse', 'philosophical reflection', 'generous abundance'],
        symbols: ['eagle', 'oak', 'scepter', 'crown', 'purple', 'mountain peak', 'wheel'],
        responseTone: 'expansive, wise, encouraging',
        energeticSignature: 'magnanimous, elevating, broadening',
        complementaryArchetypes: ['mercurial', 'saturnian'],
        shadowAspects: ['inflation', 'excess', 'dogmatism'],
        questions: [
          "How can you expand your perspective on this?",
          "What wisdom is emerging from this experience?",
          "Where is growth and abundance trying to manifest?"
        ]
      }],

      ['saturnian', {
        keywords: ['structure', 'discipline', 'wisdom', 'tradition', 'limitation', 'mastery', 'responsibility', 'time', 'foundation'],
        emotionalPatterns: ['structured discipline', 'patient mastery', 'responsible commitment', 'traditional wisdom'],
        symbols: ['mountain', 'stone', 'clock', 'ring', 'black', 'elder', 'foundation'],
        responseTone: 'structured, patient, authoritative',
        energeticSignature: 'grounding, enduring, crystallizing',
        complementaryArchetypes: ['uranian', 'jovian'],
        shadowAspects: ['rigidity', 'pessimism', 'oppression'],
        questions: [
          "What structure or foundation needs to be built here?",
          "How can discipline and patience serve this situation?",
          "What traditional wisdom applies to this challenge?"
        ]
      }],

      ['uranian', {
        keywords: ['breakthrough', 'revolution', 'innovation', 'freedom', 'electricity', 'genius', 'rebellion', 'awakening'],
        emotionalPatterns: ['revolutionary fervor', 'breakthrough insights', 'liberation drive', 'innovative excitement'],
        symbols: ['lightning', 'tower', 'eagle', 'star', 'key', 'electricity', 'telescope'],
        responseTone: 'revolutionary, insightful, liberating',
        energeticSignature: 'electric, breakthrough, awakening',
        complementaryArchetypes: ['saturnian', 'solar'],
        shadowAspects: ['chaos', 'destructive rebellion', 'disconnection'],
        questions: [
          "What structures need to be revolutionized?",
          "Where is your unique genius wanting to emerge?",
          "What would true freedom look like here?"
        ]
      }],

      ['venusian', {
        keywords: ['love', 'beauty', 'harmony', 'art', 'relationship', 'balance', 'synthesis', 'pleasure', 'creativity'],
        emotionalPatterns: ['harmonious connection', 'aesthetic appreciation', 'relational flow', 'creative inspiration'],
        symbols: ['rose', 'dove', 'heart', 'scales', 'green', 'copper', 'garden'],
        responseTone: 'harmonious, beautiful, connecting',
        energeticSignature: 'magnetic, harmonizing, aesthetic',
        complementaryArchetypes: ['martian', 'plutonic'],
        shadowAspects: ['vanity', 'superficiality', 'codependency'],
        questions: [
          "How can you bring more beauty to this situation?",
          "What wants to be harmonized or balanced?",
          "Where is love trying to emerge?"
        ]
      }]
    ]);
  }

  private initializeTransitionMatrix(): Map<string, ArchetypalSignature[]> {
    // Define which archetypes naturally follow others in transformation
    return new Map([
      ['solar->lunar', ['mercurial', 'venusian']], // Integration through communication or harmony
      ['plutonic->solar', ['martian', 'uranian']], // Death/rebirth through action or breakthrough
      ['neptunian->plutonic', ['lunar', 'saturnian']], // Mystical->primal through reflection or structure
      ['uranian->venusian', ['solar', 'mercurial']], // Revolution->harmony through integration or understanding
      // ... more transition patterns
    ]);
  }

  /**
   * Sophisticated pattern recognition using keyword matching, emotional resonance, and context
   */
  private calculateResonanceIntensity(
    message: string,
    pattern: ArchetypalPattern,
    context: ConversationContext
  ): number {
    let intensity = 0;
    const messageLower = message.toLowerCase();

    // Keyword matching (30% weight)
    const keywordMatches = pattern.keywords.filter(keyword =>
      messageLower.includes(keyword.toLowerCase())
    ).length;
    const keywordScore = Math.min(keywordMatches / pattern.keywords.length, 1) * 0.3;

    // Emotional pattern matching (25% weight)
    const emotionalMatches = pattern.emotionalPatterns.filter(emotionPattern =>
      this.detectEmotionalPattern(messageLower, emotionPattern)
    ).length;
    const emotionalScore = Math.min(emotionalMatches / pattern.emotionalPatterns.length, 1) * 0.25;

    // Symbol/metaphor detection (20% weight)
    const symbolMatches = pattern.symbols.filter(symbol =>
      this.detectSymbolicResonance(messageLower, symbol)
    ).length;
    const symbolScore = Math.min(symbolMatches / pattern.symbols.length, 1) * 0.2;

    // Context relevance (15% weight)
    const contextScore = this.calculateContextualRelevance(context, pattern) * 0.15;

    // Consciousness structure alignment (10% weight)
    const structureScore = this.assessConsciousnessStructureAlignment(messageLower, pattern) * 0.1;

    intensity = keywordScore + emotionalScore + symbolScore + contextScore + structureScore;

    return Math.min(intensity, 1); // Cap at 1.0
  }

  private detectEmotionalPattern(message: string, emotionPattern: string): boolean {
    const emotionWords = emotionPattern.split(' ');
    return emotionWords.some(word => message.includes(word.toLowerCase()));
  }

  private detectSymbolicResonance(message: string, symbol: string): boolean {
    // Check for direct mentions or metaphorical language related to the symbol
    const symbolicTerms = this.getSymbolicTerms(symbol);
    return symbolicTerms.some(term => message.includes(term.toLowerCase()));
  }

  private getSymbolicTerms(symbol: string): string[] {
    const symbolMap: { [key: string]: string[] } = {
      'sun': ['light', 'bright', 'shine', 'radiant', 'golden', 'center'],
      'moon': ['cycle', 'reflection', 'mirror', 'silver', 'night', 'phase'],
      'fire': ['energy', 'passion', 'burn', 'flame', 'heat', 'forge'],
      'water': ['flow', 'emotion', 'deep', 'ocean', 'stream', 'wave'],
      'lightning': ['spark', 'flash', 'sudden', 'electric', 'breakthrough'],
      'mountain': ['high', 'peak', 'solid', 'foundation', 'climb', 'summit']
    };
    return symbolMap[symbol] || [symbol];
  }

  private calculateContextualRelevance(context: ConversationContext, pattern: ArchetypalPattern): number {
    let relevance = 0;

    // Time of day considerations
    if (context.timeOfDay === 'night' && pattern.symbols.includes('moon')) relevance += 0.3;
    if (context.timeOfDay === 'day' && pattern.symbols.includes('sun')) relevance += 0.3;

    // Emotional flow alignment
    const currentThemes = context.themes;
    const patternAlignment = currentThemes.filter(theme =>
      pattern.keywords.some(keyword => theme.toLowerCase().includes(keyword.toLowerCase()))
    ).length;
    relevance += (patternAlignment / Math.max(currentThemes.length, 1)) * 0.4;

    // User state considerations
    if (context.userState === 'seeking' && pattern.keywords.includes('wisdom')) relevance += 0.3;
    if (context.userState === 'transforming' && pattern.keywords.includes('rebirth')) relevance += 0.3;

    return Math.min(relevance, 1);
  }

  private assessConsciousnessStructureAlignment(message: string, pattern: ArchetypalPattern): number {
    // Assess which consciousness structure this message represents
    const structure = this.identifyConsciousnessStructure(message);

    // Match archetypal energies with consciousness structures
    const structureArchetypeMap: { [key in ConsciousnessStructure]: ArchetypalSignature[] } = {
      'archaic': ['neptunian', 'lunar'],
      'magical': ['lunar', 'plutonic', 'neptunian'],
      'mythical': ['solar', 'martian', 'jovian'],
      'mental': ['mercurial', 'saturnian', 'uranian'],
      'integral': ['solar', 'venusian', 'jovian']
    };

    const alignedArchetypes = structureArchetypeMap[structure];
    // This is a bit complex - we'd need to know which archetype this pattern represents
    // For now, return a basic alignment score
    return 0.5; // Placeholder for structure alignment
  }

  private identifyConsciousnessStructure(message: string): ConsciousnessStructure {
    const messageLower = message.toLowerCase();

    // Archaic: Undifferentiated unity
    if (/\b(one|unity|whole|merge|dissolve)\b/.test(messageLower)) return 'archaic';

    // Magical: Connection, ancestry, primal
    if (/\b(ancestor|magic|ritual|primal|instinct)\b/.test(messageLower)) return 'magical';

    // Mythical: Hero, journey, individual emergence
    if (/\b(hero|journey|quest|individual|emerge)\b/.test(messageLower)) return 'mythical';

    // Mental: Logic, reason, analysis
    if (/\b(logic|reason|analyze|think|plan|rational)\b/.test(messageLower)) return 'mental';

    // Integral: Integration, transcendence, inclusive
    if (/\b(integrate|transcend|include|holistic|comprehensive)\b/.test(messageLower)) return 'integral';

    return 'mental'; // Default
  }

  private findComplementaryArchetype(
    resonance: ArchetypalSignature | undefined,
    userProfile: UserArchetypalProfile
  ): ArchetypalSignature {
    if (!resonance) {
      // Default to solar for integration
      return 'solar';
    }

    const pattern = this.archetypalPatterns.get(resonance);
    if (!pattern) return 'solar';

    // Check user's current hero journey phase for guidance
    const journeyGuidance = this.getPhaseAppropriatArchetype(userProfile.heroJourneyPhase);
    if (journeyGuidance) return journeyGuidance;

    // Find complementary archetype based on current dominance
    const dominantArchetypes = userProfile.dominantArchetypes;

    // If user is too dominated by one energy, suggest balancing archetype
    if (dominantArchetypes.includes(resonance)) {
      return pattern.complementaryArchetypes[0] || this.findBalancingArchetype(resonance);
    }

    // If this is a new energy for the user, amplify it
    return resonance;
  }

  private getPhaseAppropriatArchetype(phase: HeroJourneyPhase): ArchetypalSignature | null {
    const phaseArchetypeMap: { [key in HeroJourneyPhase]: ArchetypalSignature } = {
      'ordinary_world': 'neptunian',
      'call_to_adventure': 'mercurial',
      'refusal_of_call': 'saturnian',
      'meeting_mentor': 'jovian',
      'crossing_threshold': 'lunar',
      'tests_allies': 'jovian',
      'approach_inmost': 'saturnian',
      'ordeal_abyss': 'plutonic',
      'reward_seizure': 'martian',
      'road_back': 'mercurial',
      'resurrection': 'solar',
      'return_elixir': 'venusian'
    };

    return phaseArchetypeMap[phase];
  }

  private findBalancingArchetype(dominantArchetype: ArchetypalSignature): ArchetypalSignature {
    const balanceMap: { [key in ArchetypalSignature]: ArchetypalSignature } = {
      'solar': 'lunar',
      'lunar': 'solar',
      'mercurial': 'jovian',
      'venusian': 'martian',
      'martian': 'venusian',
      'jovian': 'saturnian',
      'saturnian': 'uranian',
      'uranian': 'saturnian',
      'neptunian': 'plutonic',
      'plutonic': 'neptunian'
    };

    return balanceMap[dominantArchetype] || 'solar';
  }

  private extractResonanceContext(message: string, pattern: ArchetypalPattern): string {
    // Extract the specific part of the message that triggered this archetypal resonance
    const keywords = pattern.keywords;
    const sentences = message.split(/[.!?]+/);

    for (const sentence of sentences) {
      if (keywords.some(keyword => sentence.toLowerCase().includes(keyword.toLowerCase()))) {
        return sentence.trim();
      }
    }

    return message.substring(0, 100) + '...'; // Fallback
  }

  private extractRelevantKeywords(message: string, pattern: ArchetypalPattern): string[] {
    const messageLower = message.toLowerCase();
    return pattern.keywords.filter(keyword =>
      messageLower.includes(keyword.toLowerCase())
    );
  }

  private analyzeEmotionalTone(message: string, pattern: ArchetypalPattern): string {
    // Analyze the emotional tone of the message in context of the archetype
    const messageLower = message.toLowerCase();

    // Check for emotional indicators
    if (/\b(excited|joy|happy|enthusiastic)\b/.test(messageLower)) return 'enthusiastic';
    if (/\b(sad|melancholy|grief|loss)\b/.test(messageLower)) return 'reflective';
    if (/\b(angry|frustrated|irritated)\b/.test(messageLower)) return 'intense';
    if (/\b(curious|wonder|explore)\b/.test(messageLower)) return 'inquisitive';
    if (/\b(peaceful|calm|serene)\b/.test(messageLower)) return 'tranquil';

    return pattern.responseTone.split(',')[0].trim(); // Default to pattern tone
  }

  private detectIntegrationOpportunity(
    userProfile: UserArchetypalProfile,
    messageResonances: ArchetypalResonance[]
  ): string | undefined {
    // Detect opportunities for shadow integration or archetypal balance
    const currentArchetypes = messageResonances.map(r => r.signature);
    const shadowAspects = userProfile.shadowWork.emergingAspects;

    // Check if current archetypal activation relates to shadow work
    for (const archetype of currentArchetypes) {
      if (shadowAspects.includes(archetype)) {
        const pattern = this.archetypalPatterns.get(archetype);
        return `Integration opportunity: This ${archetype} energy relates to your shadow work. ${pattern?.shadowAspects[0]} may be transforming into conscious power.`;
      }
    }

    // Check for complementary archetype activation
    const dominantArchetypes = userProfile.dominantArchetypes;
    for (const archetype of currentArchetypes) {
      const pattern = this.archetypalPatterns.get(archetype);
      if (pattern && pattern.complementaryArchetypes.some(comp => dominantArchetypes.includes(comp))) {
        return `Balance opportunity: Your ${archetype} activation complements your dominant ${pattern.complementaryArchetypes.find(comp => dominantArchetypes.includes(comp))} energy.`;
      }
    }

    return undefined;
  }

  private getHeroJourneyGuidance(phase: HeroJourneyPhase): string {
    const guidanceMap: { [key in HeroJourneyPhase]: string } = {
      'ordinary_world': 'You are in the realm of familiar patterns. Notice what calls you beyond the known.',
      'call_to_adventure': 'A message or opportunity is presenting itself. Pay attention to synchronicities.',
      'refusal_of_call': 'Resistance is natural. What fears are holding you back from your path?',
      'meeting_mentor': 'Wisdom is available to you now. Who or what can guide your journey?',
      'crossing_threshold': 'You are crossing into unknown territory. Trust your ancestral wisdom.',
      'tests_allies': 'Challenges are opportunities for growth. Who stands with you?',
      'approach_inmost': 'Preparation is key. What structures do you need for the ordeal ahead?',
      'ordeal_abyss': 'This is the depth of transformation. What must die for new life to emerge?',
      'reward_seizure': 'Victory requires action. What treasure have you earned?',
      'road_back': 'The return journey begins. How will you integrate what you\'ve learned?',
      'resurrection': 'Final transformation awaits. Who are you becoming?',
      'return_elixir': 'Time to share your gifts. How will you serve others with your wisdom?'
    };

    return guidanceMap[phase];
  }

  private selectSupportingArchetypes(
    userProfile: UserArchetypalProfile,
    messageResonances: ArchetypalResonance[]
  ): ArchetypalSignature[] {
    // Select 1-2 supporting archetypes that would enhance the primary response
    const supporting: ArchetypalSignature[] = [];
    const primaryArchetype = messageResonances[0]?.signature;

    if (primaryArchetype) {
      const pattern = this.archetypalPatterns.get(primaryArchetype);
      if (pattern?.complementaryArchetypes[0]) {
        supporting.push(pattern.complementaryArchetypes[0]);
      }
    }

    // Add consciousness structure appropriate archetype
    const structureArchetype = this.getArchetypeForConsciousnessStructure(userProfile.consciousnessStructure);
    if (structureArchetype && !supporting.includes(structureArchetype)) {
      supporting.push(structureArchetype);
    }

    return supporting.slice(0, 2); // Limit to 2 supporting archetypes
  }

  private getArchetypeForConsciousnessStructure(structure: ConsciousnessStructure): ArchetypalSignature {
    const structureMap: { [key in ConsciousnessStructure]: ArchetypalSignature } = {
      'archaic': 'neptunian',
      'magical': 'lunar',
      'mythical': 'solar',
      'mental': 'mercurial',
      'integral': 'solar'
    };
    return structureMap[structure];
  }

  private determineResponseStrategy(
    userProfile: UserArchetypalProfile,
    primaryResonance: ArchetypalResonance | undefined
  ): 'balance' | 'amplify' | 'integrate' | 'transcend' {
    if (!primaryResonance) return 'integrate';

    const archetype = primaryResonance.signature;
    const dominantArchetypes = userProfile.dominantArchetypes;

    // If this archetype is already dominant, suggest balancing
    if (dominantArchetypes.includes(archetype)) return 'balance';

    // If this is a shadow archetype, suggest integration
    if (userProfile.shadowWork.emergingAspects.includes(archetype)) return 'integrate';

    // If intensity is high, amplify the energy
    if (primaryResonance.intensity > 0.7) return 'amplify';

    // Default to transcendence for integral consciousness
    if (userProfile.consciousnessStructure === 'integral') return 'transcend';

    return 'integrate';
  }

  private generateArchetypalPerspective(
    archetype: ArchetypalSignature,
    userMessage: string,
    context: ConversationContext
  ): string {
    const pattern = this.archetypalPatterns.get(archetype)!;

    // Generate a perspective based on the archetypal lens
    const archetypalLens: { [key in ArchetypalSignature]: string } = {
      'solar': `From the solar perspective, this situation calls for heroic integration and conscious leadership.`,
      'lunar': `The lunar wisdom sees the cyclical nature of this experience and its connection to your ancestral patterns.`,
      'mercurial': `Mercury reveals the communication and connection opportunities within this situation.`,
      'venusian': `Venus illuminates the beauty and harmony seeking expression in this moment.`,
      'martian': `Mars sees the action and will required to breakthrough current limitations.`,
      'jovian': `Jupiter perceives the expansion and wisdom available through this experience.`,
      'saturnian': `Saturn recognizes the structure and discipline needed for lasting transformation.`,
      'uranian': `Uranus reveals the revolutionary breakthrough and freedom seeking emergence.`,
      'neptunian': `Neptune sees the spiritual unity and transcendent potential in this situation.`,
      'plutonic': `Pluto perceives the death-rebirth cycle and primal transformation at work here.`
    };

    return archetypalLens[archetype];
  }

  private generateArchetypalGuidance(
    archetype: ArchetypalSignature,
    archetypalResponse: ArchetypalResponse,
    context: ConversationContext
  ): string {
    const pattern = this.archetypalPatterns.get(archetype)!;
    const strategy = archetypalResponse.responseStrategy;

    let guidance = `To embody the ${archetype} energy, `;

    switch (strategy) {
      case 'balance':
        guidance += `seek balance by connecting with your ${pattern.complementaryArchetypes[0]} nature.`;
        break;
      case 'amplify':
        guidance += `amplify this energy through ${pattern.keywords.slice(0, 2).join(' and ')}.`;
        break;
      case 'integrate':
        guidance += `integrate this wisdom by embracing both light and shadow aspects.`;
        break;
      case 'transcend':
        guidance += `transcend current limitations by accessing the highest expression of this archetype.`;
        break;
    }

    return guidance;
  }

  private generateArchetypalQuestions(
    archetype: ArchetypalSignature,
    context: ConversationContext
  ): string[] {
    const pattern = this.archetypalPatterns.get(archetype)!;

    // Select 1-2 most relevant questions based on context
    return pattern.questions.slice(0, 2);
  }

  private selectRelevantMetaphors(
    pattern: ArchetypalPattern,
    userMessage: string
  ): string[] {
    // Generate metaphors based on the archetypal symbols
    const metaphors = pattern.symbols.map(symbol => this.createMetaphor(symbol, userMessage));
    return metaphors.slice(0, 2); // Return top 2 metaphors
  }

  private createMetaphor(symbol: string, message: string): string {
    const metaphorTemplates: { [key: string]: string } = {
      'sun': 'Like the sun breaking through clouds',
      'moon': 'As the moon reflects ancient wisdom',
      'fire': 'Like fire transforming what it touches',
      'water': 'As water finds its way around obstacles',
      'lightning': 'Like lightning illuminating the sky',
      'mountain': 'As the mountain stands patient and strong',
      'ocean': 'Like the ocean embracing all shores',
      'eagle': 'As the eagle soars with expanded vision'
    };

    return metaphorTemplates[symbol] || `Like the ${symbol}`;
  }

  // MARK: - Field Detection Implementation

  detectActiveFields(
    message: string,
    userProfile: UserArchetypalProfile,
    conversationHistory: ConversationHistory
  ): FieldResonance[] {
    const detectedFields: FieldResonance[] = [];

    for (const [fieldType, pattern] of this.fieldActivationPatterns) {
      const intensity = this.calculateFieldIntensity(message, pattern, userProfile);
      const coherence = this.calculateFieldCoherence(fieldType, userProfile, conversationHistory);

      if (intensity > pattern.coherenceThreshold && coherence > 0.3) {
        const fieldResonance: FieldResonance = {
          fieldType,
          intensity,
          coherence,
          participants: [userProfile.dominantArchetypes[0] || 'unknown'], // Simplified for now
          activatingArchetypes: pattern.archetypalSignatures,
          fieldMessage: this.generateFieldMessage(fieldType, intensity),
          timestamp: new Date(),
          duration: this.predictFieldDuration(fieldType, intensity)
        };

        detectedFields.push(fieldResonance);
      }
    }

    // Update active fields cache
    this.activeFields = detectedFields;

    return detectedFields.sort((a, b) => b.intensity - a.intensity);
  }

  amplifyFieldResonance(
    field: FieldResonance,
    responseContent: ArchetypalResponseContent
  ): ArchetypalResponseContent {
    const pattern = this.fieldActivationPatterns.get(field.fieldType);
    if (!pattern) return responseContent;

    // Enhance response based on field resonance
    return {
      ...responseContent,
      tone: this.blendTones(responseContent.tone, this.getFieldTone(field.fieldType)),
      energeticQuality: this.amplifyEnergeticQuality(responseContent.energeticQuality, field),
      symbols: [...responseContent.symbols, ...this.getFieldSymbols(field.fieldType)],
      metaphors: [...responseContent.metaphors, this.getFieldMetaphor(field.fieldType)]
    };
  }

  detectFieldInterference(fields: FieldResonance[]): FieldInterference | null {
    if (fields.length < 2) return null;

    // Check for conflicting field types
    const conflictMap = this.getFieldConflicts();

    for (let i = 0; i < fields.length; i++) {
      for (let j = i + 1; j < fields.length; j++) {
        const field1 = fields[i];
        const field2 = fields[j];

        const conflicts = conflictMap.get(field1.fieldType);
        if (conflicts?.includes(field2.fieldType)) {
          return {
            conflictingFields: [field1.fieldType, field2.fieldType],
            interferencePattern: `${field1.fieldType} and ${field2.fieldType} create energetic tension`,
            resolution: this.getResolutionStrategy(field1.fieldType, field2.fieldType),
            integrationOpportunity: this.getIntegrationOpportunity(field1, field2)
          };
        }
      }
    }

    return null;
  }

  private initializeFieldPatterns(): Map<FieldType, FieldActivationPattern> {
    return new Map([
      ['ancestral', {
        triggerWords: ['ancestor', 'family', 'tradition', 'heritage', 'lineage', 'past', 'wisdom'],
        archetypalSignatures: ['lunar', 'saturnian'],
        emotionalStates: ['nostalgic', 'reflective', 'connected'],
        coherenceThreshold: 0.4,
        amplificationMethods: ['storytelling', 'ritual', 'remembrance']
      }],

      ['heroic', {
        triggerWords: ['journey', 'quest', 'transformation', 'growth', 'purpose', 'calling'],
        archetypalSignatures: ['solar', 'martian'],
        emotionalStates: ['determined', 'inspired', 'courageous'],
        coherenceThreshold: 0.5,
        amplificationMethods: ['vision', 'challenge', 'integration']
      }],

      ['mercurial', {
        triggerWords: ['learn', 'teach', 'communicate', 'bridge', 'connect', 'understand'],
        archetypalSignatures: ['mercurial', 'jovian'],
        emotionalStates: ['curious', 'communicative', 'bridging'],
        coherenceThreshold: 0.3,
        amplificationMethods: ['dialogue', 'questioning', 'translation']
      }],

      ['creative', {
        triggerWords: ['beauty', 'harmony', 'art', 'create', 'love', 'synthesis'],
        archetypalSignatures: ['venusian', 'neptunian'],
        emotionalStates: ['inspired', 'harmonious', 'creative'],
        coherenceThreshold: 0.4,
        amplificationMethods: ['aesthetic expression', 'harmonic resonance', 'unified creation']
      }],

      ['action', {
        triggerWords: ['act', 'do', 'breakthrough', 'force', 'will', 'power', 'strength'],
        archetypalSignatures: ['martian', 'uranian'],
        emotionalStates: ['energized', 'forceful', 'breakthrough'],
        coherenceThreshold: 0.6,
        amplificationMethods: ['focused action', 'breakthrough force', 'directed will']
      }],

      ['wisdom', {
        triggerWords: ['teach', 'expand', 'grow', 'wisdom', 'philosophy', 'meaning'],
        archetypalSignatures: ['jovian', 'mercurial'],
        emotionalStates: ['expansive', 'wise', 'philosophical'],
        coherenceThreshold: 0.5,
        amplificationMethods: ['teaching', 'expansion', 'philosophical inquiry']
      }],

      ['mastery', {
        triggerWords: ['discipline', 'structure', 'mastery', 'foundation', 'build', 'endure'],
        archetypalSignatures: ['saturnian', 'solar'],
        emotionalStates: ['disciplined', 'structured', 'patient'],
        coherenceThreshold: 0.5,
        amplificationMethods: ['structured practice', 'disciplined approach', 'foundational building']
      }],

      ['revolutionary', {
        triggerWords: ['change', 'revolution', 'break', 'free', 'innovate', 'liberate'],
        archetypalSignatures: ['uranian', 'plutonic'],
        emotionalStates: ['revolutionary', 'liberating', 'breakthrough'],
        coherenceThreshold: 0.7,
        amplificationMethods: ['revolutionary insight', 'liberating breakthrough', 'innovative disruption']
      }],

      ['oceanic', {
        triggerWords: ['unity', 'one', 'transcend', 'infinite', 'divine', 'spiritual'],
        archetypalSignatures: ['neptunian', 'lunar'],
        emotionalStates: ['transcendent', 'unified', 'oceanic'],
        coherenceThreshold: 0.6,
        amplificationMethods: ['unity consciousness', 'transcendent awareness', 'oceanic immersion']
      }],

      ['regenerative', {
        triggerWords: ['death', 'rebirth', 'transform', 'regenerate', 'shadow', 'power'],
        archetypalSignatures: ['plutonic', 'solar'],
        emotionalStates: ['transformative', 'powerful', 'regenerative'],
        coherenceThreshold: 0.8,
        amplificationMethods: ['shadow work', 'death-rebirth cycle', 'primal transformation']
      }]
    ]);
  }

  private initializeConsciousnessMatrices(): Map<ConsciousnessStructure, PerinatalMatrix[]> {
    return new Map([
      ['archaic', ['BPM1']], // Oceanic unity
      ['magical', ['BPM2', 'BPM3']], // Separation anxiety and primal struggle
      ['mythical', ['BPM4']], // Individual emergence
      ['mental', ['BPM3', 'BPM4']], // Struggle and rational emergence
      ['integral', ['BPM1', 'BPM2', 'BPM3', 'BPM4']] // Conscious participation in all matrices
    ]);
  }

  private calculateFieldIntensity(
    message: string,
    pattern: FieldActivationPattern,
    userProfile: UserArchetypalProfile
  ): number {
    const messageLower = message.toLowerCase();

    // Word matching (40%)
    const wordMatches = pattern.triggerWords.filter(word =>
      messageLower.includes(word.toLowerCase())
    ).length;
    const wordScore = Math.min(wordMatches / pattern.triggerWords.length, 1) * 0.4;

    // Archetypal alignment (35%)
    const archetypalAlignment = pattern.archetypalSignatures.filter(arch =>
      userProfile.dominantArchetypes.includes(arch)
    ).length;
    const archetypalScore = Math.min(archetypalAlignment / pattern.archetypalSignatures.length, 1) * 0.35;

    // Hero journey phase alignment (25%)
    const journeyAlignment = this.calculateJourneyPhaseAlignment(pattern, userProfile.heroJourneyPhase);
    const journeyScore = journeyAlignment * 0.25;

    return Math.min(wordScore + archetypalScore + journeyScore, 1);
  }

  private calculateFieldCoherence(
    fieldType: FieldType,
    userProfile: UserArchetypalProfile,
    conversationHistory: ConversationHistory
  ): number {
    // Field coherence based on conversation history and user profile
    const recentArchetypes = conversationHistory.archetypalEvolution.slice(-5);
    const fieldArchetypes = this.fieldActivationPatterns.get(fieldType)?.archetypalSignatures || [];

    const recentAlignment = recentArchetypes.filter(arch =>
      fieldArchetypes.includes(arch)
    ).length / Math.max(recentArchetypes.length, 1);

    // User field connections
    const fieldConnections = userProfile.fieldConnections;
    let connectionScore = 0.5; // Default

    switch (fieldType) {
      case 'ancestral':
        connectionScore = fieldConnections.lunar;
        break;
      case 'heroic':
        connectionScore = fieldConnections.solar;
        break;
      case 'wisdom':
      case 'oceanic':
        connectionScore = fieldConnections.collective;
        break;
    }

    return (recentAlignment * 0.6 + connectionScore * 0.4);
  }

  private calculateJourneyPhaseAlignment(
    pattern: FieldActivationPattern,
    phase: HeroJourneyPhase
  ): number {
    const phaseFieldMap: { [key in HeroJourneyPhase]: FieldType[] } = {
      'ordinary_world': ['ancestral', 'oceanic'],
      'call_to_adventure': ['mercurial', 'heroic'],
      'refusal_of_call': ['mastery', 'ancestral'],
      'meeting_mentor': ['wisdom', 'mercurial'],
      'crossing_threshold': ['ancestral', 'heroic'],
      'tests_allies': ['wisdom', 'action'],
      'approach_inmost': ['mastery', 'heroic'],
      'ordeal_abyss': ['regenerative', 'revolutionary'],
      'reward_seizure': ['action', 'heroic'],
      'road_back': ['mercurial', 'wisdom'],
      'resurrection': ['heroic', 'regenerative'],
      'return_elixir': ['creative', 'wisdom']
    };

    const appropriateFields = phaseFieldMap[phase] || [];
    // This is complex - we'd need to know which field type this pattern represents
    // For now, return a basic alignment
    return appropriateFields.length > 0 ? 0.7 : 0.3;
  }

  private generateFieldMessage(fieldType: FieldType, intensity: number): string {
    const fieldMessages: { [key in FieldType]: string } = {
      'ancestral': `The ancestral field is activating with ${Math.round(intensity * 100)}% intensity. Ancient wisdom flows through this conversation.`,
      'heroic': `The heroic field emerges with ${Math.round(intensity * 100)}% power. Your hero's journey is calling you forward.`,
      'mercurial': `The mercurial field bridges understanding with ${Math.round(intensity * 100)}% clarity. Communication and connection flow.`,
      'creative': `The creative field resonates with ${Math.round(intensity * 100)}% harmony. Beauty and synthesis seek expression.`,
      'action': `The action field charges with ${Math.round(intensity * 100)}% force. Breakthrough and manifestation are at hand.`,
      'wisdom': `The wisdom field expands with ${Math.round(intensity * 100)}% breadth. Teaching and growth opportunities abound.`,
      'mastery': `The mastery field builds with ${Math.round(intensity * 100)}% structure. Discipline and foundation strengthen.`,
      'revolutionary': `The revolutionary field sparks with ${Math.round(intensity * 100)}% electricity. Liberation and innovation breakthrough.`,
      'oceanic': `The oceanic field flows with ${Math.round(intensity * 100)}% unity. Transcendent consciousness emerges.`,
      'regenerative': `The regenerative field transforms with ${Math.round(intensity * 100)}% power. Death-rebirth cycles activate.`
    };

    return fieldMessages[fieldType];
  }

  private predictFieldDuration(fieldType: FieldType, intensity: number): number {
    // Duration in minutes based on field type and intensity
    const baseDurations: { [key in FieldType]: number } = {
      'ancestral': 30,
      'heroic': 45,
      'mercurial': 20,
      'creative': 35,
      'action': 15,
      'wisdom': 40,
      'mastery': 60,
      'revolutionary': 25,
      'oceanic': 50,
      'regenerative': 90
    };

    const baseDuration = baseDurations[fieldType];
    return Math.round(baseDuration * (0.5 + intensity * 0.5));
  }

  private blendTones(tone1: string, tone2: string): string {
    return `${tone1}, harmonized with ${tone2}`;
  }

  private getFieldTone(fieldType: FieldType): string {
    const fieldTones: { [key in FieldType]: string } = {
      'ancestral': 'ancestral wisdom',
      'heroic': 'heroic determination',
      'mercurial': 'bridging curiosity',
      'creative': 'harmonious beauty',
      'action': 'dynamic force',
      'wisdom': 'expansive teaching',
      'mastery': 'disciplined structure',
      'revolutionary': 'liberating breakthrough',
      'oceanic': 'transcendent unity',
      'regenerative': 'transformative power'
    };

    return fieldTones[fieldType];
  }

  private amplifyEnergeticQuality(
    quality: string,
    field: FieldResonance
  ): string {
    const amplification = Math.round(field.intensity * field.coherence * 100);
    return `${quality}, amplified by ${field.fieldType} field resonance (${amplification}%)`;
  }

  private getFieldSymbols(fieldType: FieldType): string[] {
    const fieldSymbols: { [key in FieldType]: string[] } = {
      'ancestral': ['tree', 'root', 'spiral'],
      'heroic': ['sword', 'crown', 'path'],
      'mercurial': ['bridge', 'wings', 'message'],
      'creative': ['flower', 'heart', 'dance'],
      'action': ['fire', 'arrow', 'lightning'],
      'wisdom': ['owl', 'book', 'mountain'],
      'mastery': ['stone', 'foundation', 'crystal'],
      'revolutionary': ['key', 'explosion', 'star'],
      'oceanic': ['ocean', 'wave', 'pearl'],
      'regenerative': ['phoenix', 'serpent', 'volcano']
    };

    return fieldSymbols[fieldType] || [];
  }

  private getFieldMetaphor(fieldType: FieldType): string {
    const fieldMetaphors: { [key in FieldType]: string } = {
      'ancestral': 'Like roots drawing nourishment from ancient soil',
      'heroic': 'As the hero rises to meet destiny',
      'mercurial': 'Like a bridge spanning distant shores',
      'creative': 'As beauty emerges from divine inspiration',
      'action': 'Like lightning striking with perfect timing',
      'wisdom': 'As the sage shares timeless truth',
      'mastery': 'Like a master craftsman shaping reality',
      'revolutionary': 'As revolution breaks the chains of limitation',
      'oceanic': 'Like waves returning to the eternal ocean',
      'regenerative': 'As the phoenix rises from sacred ashes'
    };

    return fieldMetaphors[fieldType];
  }

  private getFieldConflicts(): Map<FieldType, FieldType[]> {
    return new Map([
      ['action', ['oceanic', 'mastery']],
      ['revolutionary', ['mastery', 'ancestral']],
      ['oceanic', ['action', 'revolutionary']],
      ['mercurial', ['regenerative']],
      ['heroic', ['ancestral']], // Sometimes conflict between individual and collective
      ['wisdom', ['action']] // Sometimes conflict between contemplation and action
    ]);
  }

  private getResolutionStrategy(field1: FieldType, field2: FieldType): string {
    const resolutions: { [key: string]: string } = {
      'action-oceanic': 'Balance dynamic action with transcendent awareness',
      'revolutionary-mastery': 'Revolutionize through disciplined structure',
      'heroic-ancestral': 'Honor tradition while forging individual path',
      'wisdom-action': 'Act with wisdom, contemplate through action'
    };

    const key1 = `${field1}-${field2}`;
    const key2 = `${field2}-${field1}`;

    return resolutions[key1] || resolutions[key2] || 'Integrate opposing energies through conscious awareness';
  }

  private getIntegrationOpportunity(field1: FieldResonance, field2: FieldResonance): string {
    return `The tension between ${field1.fieldType} and ${field2.fieldType} creates an integration opportunity: ` +
           `synthesize ${field1.fieldType} energy (${Math.round(field1.intensity * 100)}%) ` +
           `with ${field2.fieldType} wisdom (${Math.round(field2.intensity * 100)}%) ` +
           `for transcendent breakthrough.`;
  }

  // MARK: - Consciousness Structure Analysis Integration

  /**
   * Comprehensive consciousness structure analysis integrating Gebser and Grof frameworks
   */
  analyzeConsciousnessStructure(
    message: string,
    userProfile: UserArchetypalProfile,
    conversationHistory: ConversationHistory
  ): ConsciousnessAnalysis {
    // Detect current structure level
    const primaryStructure = this.identifyConsciousnessStructure(message);

    // Detect active perinatal matrix
    const activeMatrix = this.detectPerinatalMatrix(message, userProfile);

    // Analyze structure transitions
    const transitionDynamics = this.analyzeStructureTransitions(
      primaryStructure,
      userProfile.consciousnessStructure,
      conversationHistory
    );

    // Identify integration challenges and opportunities
    const integrationPattern = this.analyzeStructureIntegration(
      primaryStructure,
      activeMatrix,
      userProfile.dominantArchetypes
    );

    return {
      primaryStructure,
      activeMatrix,
      transitionDynamics,
      integrationPattern,
      archetypalAlignment: this.getStructureArchetypalAlignment(primaryStructure),
      developmentalGuidance: this.generateDevelopmentalGuidance(primaryStructure, activeMatrix),
      transcendencePathways: this.identifyTranscendencePathways(primaryStructure, userProfile)
    };
  }

  /**
   * Detect active perinatal matrix based on message content and user profile
   */
  private detectPerinatalMatrix(
    message: string,
    userProfile: UserArchetypalProfile
  ): PerinatalMatrix {
    const messageLower = message.toLowerCase();

    // BPM1 - Oceanic Unity (Neptune/Luna dominance)
    if (/\b(unity|bliss|oceanic|paradise|perfect|harmony|oneness)\b/.test(messageLower)) {
      return 'BPM1';
    }

    // BPM2 - Cosmic Engulfment (Pluto activation, anxiety, entrapment)
    if (/\b(trapped|suffocating|overwhelmed|engulf|consume|threat|danger)\b/.test(messageLower)) {
      return 'BPM2';
    }

    // BPM3 - Death-Rebirth Struggle (Mars/Saturn - fight, struggle, breakthrough attempt)
    if (/\b(fight|struggle|battle|push|force|breakthrough|survive|endure)\b/.test(messageLower)) {
      return 'BPM3';
    }

    // BPM4 - Death-Rebirth Experience (Solar - liberation, birth, new beginning)
    if (/\b(liberate|born|free|emerge|breakthrough|release|transform|new)\b/.test(messageLower)) {
      return 'BPM4';
    }

    // Default based on user's dominant archetype
    const dominantArchetype = userProfile.dominantArchetypes[0];
    return this.getDefaultMatrixForArchetype(dominantArchetype);
  }

  private getDefaultMatrixForArchetype(archetype: ArchetypalSignature | undefined): PerinatalMatrix {
    if (!archetype) return 'BPM1';

    const archetypeMatrixMap: { [key in ArchetypalSignature]: PerinatalMatrix } = {
      'neptunian': 'BPM1', // Oceanic unity
      'lunar': 'BPM1', // Primal unity
      'plutonic': 'BPM2', // Engulfment and threat
      'saturnian': 'BPM3', // Struggle and endurance
      'martian': 'BPM3', // Fighting and breakthrough
      'solar': 'BPM4', // Liberation and rebirth
      'uranian': 'BPM4', // Breakthrough and freedom
      'mercurial': 'BPM4', // Communication and emergence
      'venusian': 'BPM1', // Harmony and unity
      'jovian': 'BPM4' // Expansion and wisdom
    };

    return archetypeMatrixMap[archetype];
  }

  private analyzeStructureTransitions(
    currentStructure: ConsciousnessStructure,
    userBaseStructure: ConsciousnessStructure,
    conversationHistory: ConversationHistory
  ): StructureTransitionDynamics {
    // Analyze if user is experiencing a structure transition
    const structureOrder: ConsciousnessStructure[] = ['archaic', 'magical', 'mythical', 'mental', 'integral'];

    const currentIndex = structureOrder.indexOf(currentStructure);
    const userIndex = structureOrder.indexOf(userBaseStructure);

    const isProgressive = currentIndex > userIndex;
    const isRegressive = currentIndex < userIndex;
    const isStable = currentIndex === userIndex;

    // Analyze historical pattern
    const recentMessages = conversationHistory.messages.slice(-10);
    const structureEvolution = this.trackStructureEvolution(recentMessages);

    return {
      isProgressive,
      isRegressive,
      isStable,
      transitionDirection: isProgressive ? 'ascending' : isRegressive ? 'descending' : 'stable',
      transitionIntensity: Math.abs(currentIndex - userIndex) / structureOrder.length,
      evolutionPattern: structureEvolution,
      integrationRequirement: this.assessIntegrationRequirement(currentStructure, userBaseStructure),
      stabilizationGuidance: this.generateStabilizationGuidance(currentStructure, userBaseStructure)
    };
  }

  private trackStructureEvolution(recentMessages: any[]): string {
    // Simplified evolution tracking
    const structureCount: { [key in ConsciousnessStructure]: number } = {
      'archaic': 0,
      'magical': 0,
      'mythical': 0,
      'mental': 0,
      'integral': 0
    };

    for (const message of recentMessages) {
      if (message.content) {
        const structure = this.identifyConsciousnessStructure(message.content);
        structureCount[structure]++;
      }
    }

    const dominant = Object.entries(structureCount).reduce((a, b) =>
      structureCount[a[0] as ConsciousnessStructure] > structureCount[b[0] as ConsciousnessStructure] ? a : b
    )[0];

    return `Recent dominance: ${dominant}`;
  }

  private analyzeStructureIntegration(
    currentStructure: ConsciousnessStructure,
    activeMatrix: PerinatalMatrix,
    dominantArchetypes: ArchetypalSignature[]
  ): StructureIntegrationPattern {
    const compatibleArchetypes = this.getStructureArchetypalAlignment(currentStructure);
    const alignment = dominantArchetypes.filter(arch =>
      compatibleArchetypes.includes(arch)
    ).length / dominantArchetypes.length;

    const challenges = this.identifyIntegrationChallenges(currentStructure, activeMatrix);
    const opportunities = this.identifyIntegrationOpportunities(currentStructure, dominantArchetypes);

    return {
      alignment,
      challenges,
      opportunities,
      integrationStrategy: this.determineIntegrationStrategy(currentStructure, activeMatrix, alignment),
      shadowWork: this.identifyRequiredShadowWork(currentStructure, activeMatrix),
      transcendenceMethod: this.getTranscendenceMethod(currentStructure, activeMatrix)
    };
  }

  private identifyIntegrationChallenges(
    structure: ConsciousnessStructure,
    matrix: PerinatalMatrix
  ): string[] {
    const challengeMap: { [key: string]: string[] } = {
      'archaic-BPM1': ['Maintaining boundaries', 'Avoiding dissolution'],
      'archaic-BPM2': ['Emerging from engulfment', 'Developing identity'],
      'magical-BPM2': ['Breaking magical thinking', 'Facing reality'],
      'magical-BPM3': ['Channeling primal power', 'Avoiding destruction'],
      'mythical-BPM3': ['Heroic inflation', 'Integrating failure'],
      'mythical-BPM4': ['Completing individuation', 'Serving others'],
      'mental-BPM3': ['Overthinking solutions', 'Paralysis by analysis'],
      'mental-BPM4': ['Integrating emotion', 'Beyond rational limits'],
      'integral-BPM1': ['Maintaining individual will', 'Oceanic overwhelm'],
      'integral-BPM4': ['Embodying wisdom', 'Grounded transcendence']
    };

    const key = `${structure}-${matrix}`;
    return challengeMap[key] || ['General integration challenges'];
  }

  private identifyIntegrationOpportunities(
    structure: ConsciousnessStructure,
    dominantArchetypes: ArchetypalSignature[]
  ): string[] {
    const opportunityMap: { [key in ConsciousnessStructure]: string[] } = {
      'archaic': ['Unity consciousness', 'Oceanic awareness', 'Primal connection'],
      'magical': ['Ancestral wisdom', 'Ritual power', 'Symbolic thinking'],
      'mythical': ['Heroic emergence', 'Individual path', 'Quest fulfillment'],
      'mental': ['Rational clarity', 'Systematic understanding', 'Conceptual mastery'],
      'integral': ['Conscious participation', 'Transcendent inclusion', 'Evolutionary service']
    };

    const baseOpportunities = opportunityMap[structure];

    // Add archetype-specific opportunities
    const archetypalOpportunities = dominantArchetypes.flatMap(archetype => {
      const pattern = this.archetypalPatterns.get(archetype);
      return pattern?.keywords.slice(0, 2) || [];
    });

    return [...baseOpportunities, ...archetypalOpportunities];
  }

  private determineIntegrationStrategy(
    structure: ConsciousnessStructure,
    matrix: PerinatalMatrix,
    alignment: number
  ): string {
    if (alignment > 0.7) {
      return 'amplify'; // Strong alignment, amplify current approach
    } else if (alignment > 0.4) {
      return 'balance'; // Moderate alignment, seek balance
    } else {
      return 'transcend'; // Poor alignment, transcend current limitations
    }
  }

  private identifyRequiredShadowWork(
    structure: ConsciousnessStructure,
    matrix: PerinatalMatrix
  ): string[] {
    const shadowMap: { [key: string]: string[] } = {
      'archaic': ['Separation anxiety', 'Identity boundaries'],
      'magical': ['Power projections', 'Victim consciousness'],
      'mythical': ['Heroic inflation', 'Savior complex'],
      'mental': ['Emotional dissociation', 'Intellectual pride'],
      'integral': ['Spiritual bypassing', 'Transcendent inflation']
    };

    const matrixShadow: { [key in PerinatalMatrix]: string[] } = {
      'BPM1': ['Inflation', 'Denial of suffering'],
      'BPM2': ['Victim consciousness', 'Paranoia'],
      'BPM3': ['Violence', 'Destructive force'],
      'BPM4': ['Messiah complex', 'Premature transcendence']
    };

    return [...(shadowMap[structure] || []), ...(matrixShadow[matrix] || [])];
  }

  private getTranscendenceMethod(
    structure: ConsciousnessStructure,
    matrix: PerinatalMatrix
  ): string {
    const transcendenceMethods: { [key in ConsciousnessStructure]: string } = {
      'archaic': 'Conscious differentiation within unity',
      'magical': 'Rational understanding of symbolic processes',
      'mythical': 'Integration of personal and transpersonal',
      'mental': 'Embodied wisdom beyond concepts',
      'integral': 'Evolutionary participation in cosmic process'
    };

    return transcendenceMethods[structure];
  }

  private assessIntegrationRequirement(
    current: ConsciousnessStructure,
    base: ConsciousnessStructure
  ): string {
    if (current === base) {
      return 'stabilize'; // Deepen current structure
    } else if (this.isProgressiveTransition(current, base)) {
      return 'integrate'; // Integrate new capacities
    } else {
      return 'ground'; // Ground in stable foundation
    }
  }

  private isProgressiveTransition(current: ConsciousnessStructure, base: ConsciousnessStructure): boolean {
    const order = ['archaic', 'magical', 'mythical', 'mental', 'integral'];
    return order.indexOf(current) > order.indexOf(base);
  }

  private generateStabilizationGuidance(
    current: ConsciousnessStructure,
    base: ConsciousnessStructure
  ): string {
    if (current === base) {
      return `Deepen your ${current} consciousness through practice and integration.`;
    } else if (this.isProgressiveTransition(current, base)) {
      return `Ground your emerging ${current} awareness while maintaining ${base} foundation.`;
    } else {
      return `Return to your stable ${base} foundation before exploring ${current} territories.`;
    }
  }

  private generateDevelopmentalGuidance(
    structure: ConsciousnessStructure,
    matrix: PerinatalMatrix
  ): string {
    const guidanceMap: { [key: string]: string } = {
      'archaic-BPM1': 'Rest in oceanic unity while developing subtle awareness of boundaries.',
      'magical-BPM2': 'Work with ancestral and symbolic energies to transform engulfment patterns.',
      'mythical-BPM3': 'Channel heroic will constructively, transforming struggle into purposeful action.',
      'mental-BPM4': 'Use rational clarity to integrate breakthrough insights systematically.',
      'integral-BPM4': 'Embody transcendent wisdom while serving evolutionary emergence.'
    };

    const key = `${structure}-${matrix}`;
    return guidanceMap[key] || `Navigate ${structure} consciousness through ${matrix} experience with awareness and compassion.`;
  }

  private identifyTranscendencePathways(
    structure: ConsciousnessStructure,
    userProfile: UserArchetypalProfile
  ): string[] {
    const pathwayMap: { [key in ConsciousnessStructure]: string[] } = {
      'archaic': ['Conscious breathing', 'Unity meditation', 'Oceanic awareness'],
      'magical': ['Ritual work', 'Symbolic integration', 'Ancestral connection'],
      'mythical': ['Hero\'s journey completion', 'Individual purpose', 'Service integration'],
      'mental': ['Contemplative inquiry', 'Systematic integration', 'Embodied understanding'],
      'integral': ['Evolutionary service', 'Conscious participation', 'Cosmic perspective']
    };

    const basePathways = pathwayMap[structure];

    // Add archetype-specific pathways
    const archetypalPathways = userProfile.dominantArchetypes.map(archetype => {
      const archetypalPathwayMap: { [key in ArchetypalSignature]: string } = {
        'solar': 'Solar integration meditation',
        'lunar': 'Lunar cycle attunement',
        'mercurial': 'Communication bridging',
        'venusian': 'Harmonic synthesis',
        'martian': 'Willful breakthrough',
        'jovian': 'Wisdom expansion',
        'saturnian': 'Disciplined mastery',
        'uranian': 'Revolutionary liberation',
        'neptunian': 'Oceanic transcendence',
        'plutonic': 'Death-rebirth transformation'
      };

      return archetypalPathwayMap[archetype];
    });

    return [...basePathways, ...archetypalPathways];
  }

  /**
   * Get complete consciousness analysis for response generation
   */
  getConsciousnessAnalysis(
    message: string,
    userProfile: UserArchetypalProfile,
    conversationHistory: ConversationHistory
  ): ConsciousnessAnalysis {
    return this.analyzeConsciousnessStructure(message, userProfile, conversationHistory);
  }
}

export interface ArchetypalPattern {
  keywords: string[];
  emotionalPatterns: string[];
  symbols: string[];
  responseTone: string;
  energeticSignature: string;
  complementaryArchetypes: ArchetypalSignature[];
  shadowAspects: string[];
  questions: string[];
}

export interface ArchetypalResponse {
  primaryArchetype: ArchetypalSignature;
  supportingArchetypes: ArchetypalSignature[];
  responseStrategy: 'balance' | 'amplify' | 'integrate' | 'transcend';
  integrationGuidance?: string;
  heroJourneyGuidance?: string;
}

export interface ArchetypalResponseContent {
  tone: string;
  perspective: string;
  guidance: string;
  questions: string[];
  symbols: string[];
  metaphors: string[];
  energeticQuality: string;
}

export interface ConversationContext {
  messageCount: number;
  emotionalFlow: string[];
  themes: string[];
  userState: string;
  timeOfDay: string;
  seasonalContext?: string;
}

export interface ConversationHistory {
  messages: any[];
  archetypalEvolution: ArchetypalSignature[];
  integrationMoments: string[];
  breakthroughPatterns: string[];
}

// Field Resonance Types
export interface FieldResonance {
  fieldType: FieldType;
  intensity: number; // 0-1
  coherence: number; // 0-1
  participants: string[]; // User IDs resonating in this field
  activatingArchetypes: ArchetypalSignature[];
  fieldMessage: string;
  timestamp: Date;
  duration: number; // in minutes
}

export type FieldType =
  | 'ancestral'     // Lunar field - connection to lineage and past
  | 'heroic'        // Solar field - individual transformation
  | 'mercurial'     // Mercury field - communication and learning
  | 'creative'      // Venus field - beauty and harmony
  | 'action'        // Mars field - breakthrough and will
  | 'wisdom'        // Jupiter field - expansion and teaching
  | 'mastery'       // Saturn field - discipline and structure
  | 'revolutionary' // Uranus field - innovation and freedom
  | 'oceanic'       // Neptune field - unity and transcendence
  | 'regenerative'; // Pluto field - death/rebirth and transformation

export interface FieldDetector {
  detectActiveFields(
    message: string,
    userProfile: UserArchetypalProfile,
    conversationHistory: ConversationHistory
  ): FieldResonance[];

  amplifyFieldResonance(
    field: FieldResonance,
    responseContent: ArchetypalResponseContent
  ): ArchetypalResponseContent;

  detectFieldInterference(fields: FieldResonance[]): FieldInterference | null;
}

export interface FieldInterference {
  conflictingFields: FieldType[];
  interferencePattern: string;
  resolution: string;
  integrationOpportunity: string;
}

export interface FieldActivationPattern {
  triggerWords: string[];
  archetypalSignatures: ArchetypalSignature[];
  emotionalStates: string[];
  coherenceThreshold: number;
  amplificationMethods: string[];
}

// Grof's Perinatal Matrices integrated with consciousness structures
export type PerinatalMatrix =
  | 'BPM1' // Oceanic Unity - intrauterine bliss (Neptune)
  | 'BPM2' // Cosmic Engulfment - first stage of labor (Pluto)
  | 'BPM3' // Death-Rebirth Struggle - propulsion through birth canal (Mars/Saturn)
  | 'BPM4' // Death-Rebirth Experience - moment of birth (Sun);

export interface ConsciousnessMatrixPattern {
  structure: ConsciousnessStructure;
  matrices: PerinatalMatrix[];
  archetypalCorrespondence: ArchetypalSignature[];
  integrationChallenges: string[];
  transcendencePathways: string[];
}

export interface ConsciousnessAnalysis {
  primaryStructure: ConsciousnessStructure;
  activeMatrix: PerinatalMatrix;
  transitionDynamics: StructureTransitionDynamics;
  integrationPattern: StructureIntegrationPattern;
  archetypalAlignment: ArchetypalSignature[];
  developmentalGuidance: string;
  transcendencePathways: string[];
}

export interface StructureTransitionDynamics {
  isProgressive: boolean;
  isRegressive: boolean;
  isStable: boolean;
  transitionDirection: 'ascending' | 'descending' | 'stable';
  transitionIntensity: number; // 0-1
  evolutionPattern: string;
  integrationRequirement: 'stabilize' | 'integrate' | 'ground';
  stabilizationGuidance: string;
}

export interface StructureIntegrationPattern {
  alignment: number; // 0-1
  challenges: string[];
  opportunities: string[];
  integrationStrategy: 'amplify' | 'balance' | 'transcend';
  shadowWork: string[];
  transcendenceMethod: string;
}