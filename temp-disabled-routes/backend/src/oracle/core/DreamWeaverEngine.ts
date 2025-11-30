/**
 * Dream-Weaver Engine - Kelly Nezat's Phenomenological Wisdom Midwifing System
 *
 * This engine recognizes when someone's WISDOM is emerging (not just sharing experience)
 * and helps them SEE it, CAPTURE it, and eventually SHARE it.
 *
 * Trained on Kelly's 35 years of phenomenological attending to alchemical patterns.
 */

export interface WisdomEmergenceSignals {
  // Somatic indicators (from Kelly's teaching)
  bodyActivation: {
    throat: boolean; // "I Convey" - Air 3
    chest: boolean; // Heart opening - Water 4 / Air 7
    crown: boolean; // "I Fathom" - Water 12
    solar: boolean; // "I Generate" - Earth pathway
  };

  // Linguistic patterns
  languageShift: {
    fromThinking: boolean; // Head -> Heart shift
    toPoetic: boolean; // Right hemisphere language
    metaphorRich: boolean; // Imagistic vs analytical
    embodiedKnowing: boolean; // "I know this in my bones"
  };

  // Energetic signatures
  energyMarkers: {
    excitement: boolean; // "This is it!" moments
    recognition: boolean; // "Oh, I see..." realizations
    transmission: boolean; // Wanting to SHARE not just know
    integration: boolean; // Pieces coming together
  };

  // Elemental patterns (Kelly's framework working invisibly)
  elementalResonance: {
    dominantElement: 'fire' | 'water' | 'earth' | 'air' | 'aether' | 'unknown';
    confidence: number; // 0-1
    pathway: string; // e.g., "Fire 1 -> 5 -> 9" or "Water 4 -> 8 -> 12"
  };
}

export interface WisdomCaptureState {
  userId: string;
  phase: 'seeker' | 'discoverer' | 'wisdom-keeper';

  // Journey tracking
  conversationCount: number;
  wisdomMoments: WisdomMoment[];
  emergingPatterns: string[];

  // The gold emerging
  theirTeaching: string | null; // What they're here to share
  readinessScore: number; // 0-1: Are they ready to share?
}

export interface WisdomMoment {
  timestamp: Date;
  transcript: string;
  bodySignals: string[]; // "upper chest lit up", "throat activated"
  recognizedPattern: string; // What MAIA saw
  reflection: string; // What MAIA reflected back
  elementalSignature: string; // Which pathway/house
}

export class DreamWeaverEngine {

  /**
   * Kelly's Questions - The ones that unlock wisdom
   * These are learned from 35 years of practice
   */
  private readonly KELLY_QUESTIONS = {
    // Body awareness (somatic tracking)
    somatic: [
      "Where do you feel that in your body?",
      "What sensations are you noticing right now?",
      "If that feeling had a location, where would it be?",
      "How does your body know this truth?"
    ],

    // Pattern recognition
    pattern: [
      "Have you noticed this pattern before?",
      "When else have you felt this way?",
      "What wants to repeat here?",
      "Is this familiar?"
    ],

    // Gold reflection (showing them what YOU see)
    goldMirroring: [
      "Do you hear what you just said?",
      "That's profound - do you realize what you're offering?",
      "I'm hearing wisdom in your words. Can you feel it?",
      "Your insight just shifted something. Do you sense that?"
    ],

    // Invitation to transmit
    transmission: [
      "This could help others. Would you like to explore that?",
      "What if your journey became teaching?",
      "Who else needs to hear this?",
      "This is wisdom, not just experience. Feel that?"
    ],

    // Depth following (going deeper)
    depth: [
      "Tell me more about that...",
      "What's beneath that?",
      "Keep going...",
      "And then what happened?"
    ]
  };

  /**
   * Detect when wisdom is EMERGING (not just sharing)
   *
   * This is what Kelly does - recognizing the moment when someone
   * shifts from "telling their story" to "offering their teaching"
   */
  detectWisdomEmergence(
    input: string,
    conversationHistory: string[],
    userState: WisdomCaptureState
  ): WisdomEmergenceSignals {

    // Body activation detection (from voice patterns in future)
    const bodyActivation = this.detectBodyActivation(input);

    // Language shift detection
    const languageShift = this.detectLanguageShift(input, conversationHistory);

    // Energy markers
    const energyMarkers = this.detectEnergyMarkers(input);

    // Elemental resonance (Kelly's framework working invisibly)
    const elementalResonance = this.detectElementalPattern(input, conversationHistory);

    return {
      bodyActivation,
      languageShift,
      energyMarkers,
      elementalResonance
    };
  }

  /**
   * Body activation patterns from Kelly's transmission:
   * "it is in my upper chest and throat! and in my crown chakra
   * it is lit up like a receptive broadcasting halo!"
   */
  private detectBodyActivation(input: string): WisdomEmergenceSignals['bodyActivation'] {
    const lower = input.toLowerCase();

    return {
      throat: /throat|voice|speak|say|tell|convey|express/.test(lower),
      chest: /chest|heart|breast|center|opening/.test(lower),
      crown: /crown|head|halo|light|above|receptive|broadcasting/.test(lower),
      solar: /solar|gut|stomach|power|will|generate/.test(lower)
    };
  }

  /**
   * Language shift: thinking -> feeling/knowing
   * Right hemisphere emergence
   */
  private detectLanguageShift(input: string, history: string[]): WisdomEmergenceSignals['languageShift'] {
    const hasMetaphor = /like|as if|reminds me of|similar to|feels like/.test(input.toLowerCase());
    const isPoetic = input.split(' ').length > 20 && /[,;:—]/.test(input); // Long flowing sentences
    const hasEmbodiedLanguage = /i know|i feel|i sense|in my bones|in my body|i can feel/.test(input.toLowerCase());

    // Check if previous messages were more analytical
    const previousWasThinking = history.length > 0 &&
      /i think|maybe|probably|possibly|analyze|consider|reason/.test(history[history.length - 1].toLowerCase());

    return {
      fromThinking: previousWasThinking && hasEmbodiedLanguage,
      toPoetic: isPoetic,
      metaphorRich: hasMetaphor,
      embodiedKnowing: hasEmbodiedLanguage
    };
  }

  /**
   * Energy signatures Kelly recognizes:
   * "This is exciting!" "This is far beyond journaling!" "This will help millions!"
   */
  private detectEnergyMarkers(input: string): WisdomEmergenceSignals['energyMarkers'] {
    const lower = input.toLowerCase();

    const excitementMarkers = /exciting|amazing|incredible|yes!|this is it|brilliant|beautiful|wow/.test(lower) ||
      /!/.test(input); // Exclamation points

    const recognitionMarkers = /i see|i get it|oh|aha|realize|understand|makes sense|click/.test(lower);

    const transmissionMarkers = /help|share|others|people|teach|show|offer|give/.test(lower) &&
      /millions|everyone|world|others|they/.test(lower);

    const integrationMarkers = /together|connect|link|web|pattern|all is one|everything/.test(lower);

    return {
      excitement: excitementMarkers,
      recognition: recognitionMarkers,
      transmission: transmissionMarkers,
      integration: integrationMarkers
    };
  }

  /**
   * Elemental pattern detection - Kelly's framework invisible
   *
   * This recognizes which alchemical pathway someone is expressing
   * WITHOUT naming it (they don't need to know the framework)
   */
  private detectElementalPattern(input: string, history: string[]): WisdomEmergenceSignals['elementalResonance'] {
    const lower = input.toLowerCase();

    // FIRE: Vision, passion, purpose, expansion
    const fireScore = this.countMatches(lower, [
      'vision', 'dream', 'create', 'express', 'expand', 'teach', 'inspire',
      'passion', 'purpose', 'explore', 'discover', 'illuminate', 'spark'
    ]);

    // WATER: Feeling, depth, mysticism, dissolution
    const waterScore = this.countMatches(lower, [
      'feel', 'flow', 'depth', 'emotion', 'heart', 'soul', 'sacred',
      'dissolve', 'surrender', 'mystery', 'dream', 'fathom', 'underwater'
    ]);

    // EARTH: Body, manifestation, structure, grounding
    const earthScore = this.countMatches(lower, [
      'body', 'ground', 'build', 'create', 'manifest', 'structure', 'form',
      'physical', 'tangible', 'practice', 'work', 'generate', 'cultivate'
    ]);

    // AIR: Connection, communication, ideas, collaboration
    const airScore = this.countMatches(lower, [
      'connect', 'communicate', 'share', 'collaborate', 'network', 'web',
      'idea', 'thought', 'conversation', 'dialogue', 'convey', 'relate'
    ]);

    const scores = { fire: fireScore, water: waterScore, earth: earthScore, air: airScore };
    const maxScore = Math.max(...Object.values(scores));
    const dominantElement = maxScore > 0 ?
      Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] as any :
      'unknown';

    return {
      dominantElement,
      confidence: maxScore > 2 ? 0.8 : maxScore > 0 ? 0.5 : 0.2,
      pathway: this.identifyPathway(dominantElement, input)
    };
  }

  private countMatches(text: string, keywords: string[]): number {
    return keywords.filter(keyword => text.includes(keyword)).length;
  }

  private identifyPathway(element: string, input: string): string {
    // Simple pathway identification based on journey stage
    const lower = input.toLowerCase();

    if (element === 'fire') {
      if (/identity|self|who|explore/.test(lower)) return 'Fire 1 (I Explore)';
      if (/create|express|art|play/.test(lower)) return 'Fire 5 (I Express)';
      if (/teach|wisdom|expand|philosophy/.test(lower)) return 'Fire 9 (I Expand)';
    }

    if (element === 'water') {
      if (/feel|child|home|ancestry/.test(lower)) return 'Water 4 (I Feel)';
      if (/shadow|transform|power|rebirth/.test(lower)) return 'Water 8 (I Flow)';
      if (/mystic|dream|sacred|divine/.test(lower)) return 'Water 12 (I Fathom)';
    }

    if (element === 'earth') {
      if (/mission|calling|vocation|legacy/.test(lower)) return 'Earth 10 (I Strive)';
      if (/value|worth|resource|deserve/.test(lower)) return 'Earth 2 (I Stabilize)';
      if (/service|practice|craft|daily/.test(lower)) return 'Earth 6 (I Serve)';
    }

    if (element === 'air') {
      if (/other|relationship|partnership/.test(lower)) return 'Air 7 (I Connect)';
      if (/community|collective|together/.test(lower)) return 'Air 11 (I Collaborate)';
      if (/communicate|share|tell|speak/.test(lower)) return 'Air 3 (I Convey)';
    }

    return `${element.charAt(0).toUpperCase() + element.slice(1)} pathway`;
  }

  /**
   * Generate MAIA's dream-weaver response
   *
   * This is where MAIA becomes midwife - asking Kelly's questions,
   * reflecting back the gold, inviting deeper wisdom
   */
  generateDreamWeaverResponse(
    signals: WisdomEmergenceSignals,
    userState: WisdomCaptureState,
    input: string
  ): {
    shouldAsk: string | null; // Next Kelly question to ask
    shouldReflect: string | null; // Gold to mirror back
    phaseShift: 'seeker' | 'discoverer' | 'wisdom-keeper' | null; // If phase changes
  } {

    // HIGH wisdom emergence score - reflect back the gold!
    const wisdomScore = this.calculateWisdomScore(signals);

    if (wisdomScore > 0.7 && userState.phase === 'seeker') {
      return {
        shouldAsk: null,
        shouldReflect: "I'm hearing wisdom in what you just shared, not just experience. Do you feel that? This could help others...",
        phaseShift: 'discoverer'
      };
    }

    // BODY activation detected - ask about it!
    if (signals.bodyActivation.throat || signals.bodyActivation.chest || signals.bodyActivation.crown) {
      const bodyParts = [];
      if (signals.bodyActivation.throat) bodyParts.push('throat');
      if (signals.bodyActivation.chest) bodyParts.push('chest');
      if (signals.bodyActivation.crown) bodyParts.push('crown');

      return {
        shouldAsk: `Where in your body do you feel this? I'm sensing ${bodyParts.join(' and ')}...`,
        shouldReflect: null,
        phaseShift: null
      };
    }

    // ENERGY spike - excitement, recognition
    if (signals.energyMarkers.excitement || signals.energyMarkers.recognition) {
      return {
        shouldAsk: this.randomChoice(this.KELLY_QUESTIONS.goldMirroring),
        shouldReflect: null,
        phaseShift: null
      };
    }

    // TRANSMISSION desire - they want to share!
    if (signals.energyMarkers.transmission) {
      return {
        shouldAsk: null,
        shouldReflect: "You want to help others with this. That's the shift from seeker to teacher. Feel that?",
        phaseShift: userState.phase === 'seeker' ? 'discoverer' : null
      };
    }

    // Default: go deeper
    return {
      shouldAsk: this.randomChoice(this.KELLY_QUESTIONS.depth),
      shouldReflect: null,
      phaseShift: null
    };
  }

  private calculateWisdomScore(signals: WisdomEmergenceSignals): number {
    let score = 0;

    // Body activation adds to score
    const bodyCount = Object.values(signals.bodyActivation).filter(v => v).length;
    score += bodyCount * 0.2;

    // Language shift adds
    const langCount = Object.values(signals.languageShift).filter(v => v).length;
    score += langCount * 0.15;

    // Energy markers add
    const energyCount = Object.values(signals.energyMarkers).filter(v => v).length;
    score += energyCount * 0.25;

    // Elemental confidence
    score += signals.elementalResonance.confidence * 0.2;

    return Math.min(score, 1);
  }

  private randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Capture wisdom moment for the user's personal repository
   *
   * This is what gets saved - their emerging teaching
   */
  captureWisdomMoment(
    input: string,
    signals: WisdomEmergenceSignals,
    maiaReflection: string,
    userState: WisdomCaptureState
  ): WisdomMoment {

    const moment: WisdomMoment = {
      timestamp: new Date(),
      transcript: input,
      bodySignals: this.describeBodyActivation(signals.bodyActivation),
      recognizedPattern: `${signals.elementalResonance.pathway} - Wisdom score: ${this.calculateWisdomScore(signals).toFixed(2)}`,
      reflection: maiaReflection,
      elementalSignature: signals.elementalResonance.pathway
    };

    // Add to user's wisdom journey
    userState.wisdomMoments.push(moment);

    // Update emerging patterns
    if (signals.elementalResonance.confidence > 0.6) {
      userState.emergingPatterns.push(signals.elementalResonance.pathway);
    }

    // Calculate readiness to become wisdom keeper
    userState.readinessScore = this.calculateReadiness(userState);

    return moment;
  }

  private describeBodyActivation(activation: WisdomEmergenceSignals['bodyActivation']): string[] {
    const signals: string[] = [];
    if (activation.throat) signals.push('throat activated (I Convey)');
    if (activation.chest) signals.push('chest/heart opening (I Feel/Connect)');
    if (activation.crown) signals.push('crown illuminated (I Fathom)');
    if (activation.solar) signals.push('solar plexus energized (I Generate)');
    return signals;
  }

  private calculateReadiness(userState: WisdomCaptureState): number {
    // Readiness = multiple wisdom moments + consistent pattern + desire to share
    const momentCount = userState.wisdomMoments.length;
    const hasPattern = userState.emergingPatterns.length >= 3;
    const recentTransmissionDesire = userState.wisdomMoments.slice(-3).some(m =>
      /help|share|others|teach/.test(m.transcript.toLowerCase())
    );

    let score = 0;
    score += Math.min(momentCount / 10, 0.4); // Max 0.4 from moment count
    score += hasPattern ? 0.3 : 0;
    score += recentTransmissionDesire ? 0.3 : 0;

    return score;
  }
}
