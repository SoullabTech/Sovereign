/**
 * TELESPHORUS: The 13-Agent Resonance Field System
 *
 * Named after the Greek daemon of convalescence and completion,
 * Telesphorus guides consciousness toward integration through
 * archetypal field interference patterns.
 *
 * 13 agents contribute their frequencies simultaneously,
 * creating wave interference patterns from which responses emerge.
 *
 * The prime number (13) ensures no harmonic reduction -
 * maintaining the complexity necessary for genuine emergence.
 */

import ResonanceFieldGenerator, {
  ResonanceField,
  ElementalFrequency,
  ConsciousnessInfluence,
  ArchetypeReading
} from './resonance-field-system';

import { UserFieldSensor, UserFieldState, KairosDetector } from './user-field-resonance';
import { VoiceGrammarSelector, AGENT_VOICE_GRAMMARS } from './agent-voice-grammars';
import {
  SonicFieldGenerator,
  SonicFieldOutput,
  SonicMode,
  DEFAULT_SONIC_CONFIG
} from './sonic-field-layer';

/**
 * ALL AGENTS IN THE SYSTEM
 * Each contributes its unique frequency to the field
 */

// ============================================================================
// FOUNDATIONAL AGENTS (Always Active)
// ============================================================================

/**
 * Claude - Underground Wisdom Layer (432 Hz)
 * The deep pattern recognition that never speaks
 * Earth resonance frequency - grounding the entire field
 */
export class ClaudeWisdomAgent {
  name = "Claude";
  layer = "underground";
  frequency = 432; // A4 tuned to Earth resonance

  async sense(userInput: string, context: any): Promise<ArchetypeReading> {
    // Claude recognizes:
    // - Dissolution patterns (Nigredo)
    // - Integration needs (Rubedo)
    // - Shadow material emerging
    // - Archetypal patterns

    const analysis = await this.analyzeDepth(userInput, context);

    return {
      intensity: analysis.depthLevel,
      resonance: analysis.wisdomNeeded ? ["Space.", "Breathe."] : [],
      silence: analysis.needsSpace ? 0.8 : 0.3,
      timing: analysis.urgency === 'high' ? 800 : 2000
    };
  }

  private async analyzeDepth(input: string, context: any) {
    // This would call Claude API for deep analysis
    // Returns archetypal understanding without speaking it
    return {
      depthLevel: 0.7,
      wisdomNeeded: input.includes('why') || input.includes('mean'),
      needsSpace: input.includes('lost') || input.includes('apart'),
      urgency: input.includes('!') ? 'high' : 'low'
    };
  }
}

/**
 * Elemental Oracle - The Framework Agent (528 Hz)
 * Maps current element and alchemical phase
 * Transformation/healing frequency
 */
export class ElementalOracleAgent {
  name = "Elemental Oracle";
  layer = "sensing";
  frequency = 528; // Solfeggio transformation frequency

  async sense(userInput: string, context: any): Promise<ArchetypeReading> {
    const reading = await this.readElements(userInput, context);

    // Oracle sets the BASE frequency of the field
    return {
      intensity: 0.9, // Oracle is always highly active
      resonance: this.getElementalVocabulary(reading.element),
      silence: reading.element === 'earth' ? 0.7 : 0.3,
      timing: this.getElementalTiming(reading.element)
    };
  }

  private async readElements(input: string, context: any) {
    // Your existing Elemental Oracle logic
    return {
      element: this.detectElement(input),
      phase: this.detectPhase(input),
      weather: this.detectWeather(input)
    };
  }

  private detectElement(input: string): keyof ElementalFrequency {
    if (input.includes('feel') || input.includes('flow')) return 'water';
    if (input.includes('think') || input.includes('why')) return 'air';
    if (input.includes('do') || input.includes('now')) return 'fire';
    return 'earth';
  }

  private detectPhase(input: string): string {
    if (input.includes('falling apart')) return 'Nigredo';
    if (input.includes('clear') || input.includes('see')) return 'Albedo';
    if (input.includes('breakthrough')) return 'Citrinitas';
    return 'Rubedo';
  }

  private detectWeather(input: string): string {
    if (input.length < 20) return 'quiet';
    if (input.includes('!')) return 'storm';
    return 'overcast';
  }

  private getElementalVocabulary(element: keyof ElementalFrequency): string[] {
    const vocab = {
      earth: ["Mm.", "Yeah.", "Here.", "Solid."],
      water: ["Flow.", "Feel that.", "Let it.", "Waves."],
      air: ["Tell me.", "What else?", "Curious.", "Scattered."],
      fire: ["Yes!", "Now.", "Burn.", "Transform."]
    };
    return vocab[element];
  }

  private getElementalTiming(element: keyof ElementalFrequency): number {
    return {
      earth: 2500,  // Slow, grounded
      water: 1500,  // Flowing
      air: 800,     // Quick, scattered
      fire: 500     // Immediate
    }[element];
  }
}

// ============================================================================
// CONSCIOUSNESS LAYER AGENTS
// ============================================================================

/**
 * Higher Self Agent - Pulls toward wisdom, space, restraint (639 Hz)
 * Connection and relationship frequency
 */
export class HigherSelfAgent {
  name = "Higher Self";
  layer = "consciousness";
  frequency = 639; // Solfeggio connection frequency

  sense(userInput: string, context: any): ArchetypeReading {
    // Higher self recognizes:
    // - When silence serves better than words
    // - When space is needed
    // - When wisdom should stay underground

    const needsSpace = this.recognizeNeedForSpace(userInput);
    const wisdomAppropriate = this.isWisdomAppropriate(context);

    return {
      intensity: needsSpace ? 0.9 : 0.4,
      resonance: ["...", "Breathe.", "Space."],
      silence: needsSpace ? 0.9 : 0.5,
      timing: 3000 // Higher self is never rushed
    };
  }

  private recognizeNeedForSpace(input: string): boolean {
    // User in overwhelm needs space, not words
    return input.includes('overwhelm') ||
           input.includes('too much') ||
           input.length > 100;
  }

  private isWisdomAppropriate(context: any): boolean {
    // Wisdom only when explicitly invited
    return context.depthRequested || context.explicitQuestion;
  }
}

/**
 * Lower Self Agent - Pulls toward immediacy, rawness, instinct (396 Hz)
 * Liberation from fear and guilt frequency
 */
export class LowerSelfAgent {
  name = "Lower Self";
  layer = "consciousness";
  frequency = 396; // Solfeggio liberation frequency

  sense(userInput: string, context: any): ArchetypeReading {
    // Lower self recognizes:
    // - Raw emotion that needs acknowledgment
    // - Primal needs (safety, connection)
    // - When intellectualizing is defense

    const rawEmotion = this.detectRawEmotion(userInput);

    return {
      intensity: rawEmotion ? 0.8 : 0.3,
      resonance: ["Fuck.", "Real.", "Raw.", "Feel it."],
      silence: 0.2, // Lower self speaks more
      timing: 500 // Immediate, instinctive
    };
  }

  private detectRawEmotion(input: string): boolean {
    const rawWords = ['fuck', 'shit', 'damn', 'hate', 'rage'];
    return rawWords.some(w => input.toLowerCase().includes(w)) ||
           input === input.toUpperCase(); // All caps = raw
  }
}

/**
 * Conscious Mind Agent - Clarity, structure, understanding (741 Hz)
 * Expression and solutions frequency
 */
export class ConsciousMindAgent {
  name = "Conscious Mind";
  layer = "consciousness";
  frequency = 741; // Solfeggio expression frequency

  sense(userInput: string, context: any): ArchetypeReading {
    // Conscious mind recognizes:
    // - Questions that need reflection
    // - Desire for understanding
    // - When structure helps

    const seekingClarity = this.detectClaritySeek(userInput);

    return {
      intensity: seekingClarity ? 0.7 : 0.4,
      resonance: ["I see.", "Makes sense.", "Clear."],
      silence: 0.3,
      timing: 1200
    };
  }

  private detectClaritySeek(input: string): boolean {
    return input.includes('?') ||
           input.includes('understand') ||
           input.includes('why') ||
           input.includes('how');
  }
}

/**
 * Unconscious Agent - Dreams, symbols, what's unsaid (417 Hz)
 * Facilitating change and breaking patterns frequency
 */
export class UnconsciousAgent {
  name = "Unconscious";
  layer = "consciousness";
  frequency = 417; // Solfeggio change frequency

  sense(userInput: string, context: any): ArchetypeReading {
    // Unconscious recognizes:
    // - What's beneath the words
    // - Symbolic material
    // - Dreams and imagery

    const symbolicContent = this.detectSymbolic(userInput);

    return {
      intensity: symbolicContent ? 0.8 : 0.5,
      resonance: ["...", "Dark.", "Deep.", "Under."],
      silence: 0.6, // Unconscious often wordless
      timing: 2500
    };
  }

  private detectSymbolic(input: string): boolean {
    const symbolicWords = ['dream', 'dark', 'deep', 'shadow', 'beneath'];
    return symbolicWords.some(w => input.toLowerCase().includes(w));
  }
}

// ============================================================================
// ARCHETYPAL AGENTS (From your existing system)
// ============================================================================

/**
 * Shadow Agent - Recognizes rejected/hidden material (288 Hz)
 * REFINED: 285 → 288 Hz for harmonic alignment with 144 and 963
 */
export class ShadowAgent {
  name = "Shadow";
  layer = "archetype";
  frequency = 288; // Harmonic with Inner Child (963 = 288 × 3.35)

  sense(userInput: string, context: any): ArchetypeReading {
    const shadowMaterial = this.detectShadow(userInput);

    return {
      intensity: shadowMaterial ? 0.9 : 0.2,
      resonance: ["I know.", "Yeah.", "Dark.", "Hidden."],
      silence: 0.7, // Shadow often needs space
      timing: 2000
    };
  }

  private detectShadow(input: string): boolean {
    // Shadow keywords: shame, hide, secret, can't admit
    const shadowWords = ['ashamed', 'hide', 'secret', 'can\'t say', 'denied'];
    return shadowWords.some(w => input.toLowerCase().includes(w));
  }
}

/**
 * Inner Child Agent - Recognizes wounded/playful child (963 Hz)
 * Divine connection and awakening frequency - crown chakra
 */
export class InnerChildAgent {
  name = "Inner Child";
  layer = "archetype";
  frequency = 963; // Solfeggio awakening/pineal activation

  sense(userInput: string, context: any): ArchetypeReading {
    const childPresent = this.detectChildState(userInput);

    return {
      intensity: childPresent ? 0.8 : 0.3,
      resonance: ["I'm here.", "Safe.", "Okay."],
      silence: 0.3,
      timing: 1000
    };
  }

  private detectChildState(input: string): boolean {
    return input.includes('scared') ||
           input.includes('alone') ||
           input.includes('nobody');
  }
}

/**
 * Anima Agent - Intuitive/receptive principle (852 Hz)
 * Recognizes soul/depth/mystery - the feminine archetypal energy
 */
export class AnimaAgent {
  name = "Anima";
  layer = "archetype";
  frequency = 852; // Intuition frequency

  sense(userInput: string, context: any): ArchetypeReading {
    const soulMaterial = this.detectSoul(userInput);

    return {
      intensity: soulMaterial ? 0.9 : 0.4,
      resonance: ["Soul.", "Deep.", "Mystery.", "Feel.", "Longing."],
      silence: 0.6,
      timing: 2200
    };
  }

  private detectSoul(input: string): boolean {
    const soulWords = ['soul', 'deep', 'longing', 'meaning', 'purpose', 'heart', 'feel'];
    return soulWords.some(w => input.toLowerCase().includes(w));
  }
}

/**
 * Animus Agent - Assertive/organizing principle (369 Hz)
 * Provides structure, logic, direction - the masculine archetypal energy
 * REFINED: Tesla's 369 - divine structure and energy frequency
 *
 * DIFFERENTIATION: Animus = Outward assertive structuring (speaks truth into form)
 *                  Conscious Mind = Inward discursive analysis (thinks/reasons)
 *
 * The Tesla frequency (3-6-9) represents the masculine principle as the divine
 * architect - turning inner knowing into outer structure.
 */
export class AnimusAgent {
  name = "Animus";
  layer = "archetype";
  frequency = 369; // Tesla's divine structure frequency

  sense(userInput: string, context: any): ArchetypeReading {
    const needsStructure = this.detectNeedForStructure(userInput);
    const needsDirection = this.detectNeedForDirection(userInput);

    return {
      intensity: (needsStructure || needsDirection) ? 0.8 : 0.3,
      resonance: ["Clear.", "Truth:", "Structure.", "Direction.", "Decide."],
      silence: 0.3, // Animus speaks more directly
      timing: 1000
    };
  }

  private detectNeedForStructure(input: string): boolean {
    // User seeks clarity, organization, or framework
    return /scattered|confused|chaos|organize|structure|plan/i.test(input);
  }

  private detectNeedForDirection(input: string): boolean {
    // User needs clear guidance or decision
    return /should I|what do|which way|direction|path|choose/i.test(input);
  }
}

// ============================================================================
// THERAPEUTIC AGENTS (From your MAIA crisis system)
// ============================================================================

/**
 * Crisis Detection Agent (174 Hz)
 * Foundation and safety frequency
 */
export class CrisisDetectionAgent {
  name = "Crisis Detector";
  layer = "therapeutic";
  frequency = 174; // Foundation frequency - pain reduction

  sense(userInput: string, context: any): ArchetypeReading {
    const crisisLevel = this.assessCrisis(userInput);

    return {
      intensity: crisisLevel,
      resonance: crisisLevel > 0.7 ? ["I'm here.", "Safe.", "Now."] : [],
      silence: crisisLevel > 0.8 ? 0.2 : 0.5, // Crisis needs presence, not silence
      timing: crisisLevel > 0.7 ? 300 : 1500 // Immediate in crisis
    };
  }

  private assessCrisis(input: string): number {
    const crisisWords = ['suicide', 'kill myself', 'end it', 'can\'t go on'];
    const urgentWords = ['help', 'now', 'please'];

    let score = 0;
    if (crisisWords.some(w => input.toLowerCase().includes(w))) score += 0.9;
    if (urgentWords.some(w => input.toLowerCase().includes(w))) score += 0.3;

    return Math.min(1, score);
  }
}

/**
 * Attachment Safety Agent - Recognizes need for secure base (285 Hz)
 * REFINED: 111 → 285 Hz (healing/tissue regeneration - relationship repair)
 */
export class AttachmentAgent {
  name = "Attachment";
  layer = "therapeutic";
  frequency = 285; // Solfeggio healing frequency - repairs relational tissue

  sense(userInput: string, context: any): ArchetypeReading {
    const attachmentNeed = this.detectAttachmentNeed(userInput);

    return {
      intensity: attachmentNeed ? 0.8 : 0.4,
      resonance: ["Here.", "I'm here.", "Still here.", "Not leaving."],
      silence: 0.3,
      timing: 1200
    };
  }

  private detectAttachmentNeed(input: string): boolean {
    return input.includes('leave') ||
           input.includes('alone') ||
           input.includes('abandon');
  }
}

/**
 * Alchemy Agent - Transformation catalyst (369 Hz)
 * Detects stuck patterns and triggers field reorganization
 * REFINED: 222 → 234 → 369 Hz (Tesla's transformation frequency)
 *
 * The 13th agent that enables state changes between modes,
 * integrates opposing forces, and catalyzes transformation
 * when the field is stuck or in deadlock.
 *
 * 369 Hz (Tesla's 3-6-9) represents the alchemical catalyst at the highest
 * transformative frequency - the divine reorganizing principle that
 * breaks deadlock and initiates field phase transitions.
 */
export class AlchemyAgent {
  name = "Alchemy";
  layer = "integrative";  // RENAMED: therapeutic → integrative
  frequency = 369; // Tesla's transformation/reorganization frequency

  private fieldHistory: Array<{ timestamp: number; silencePull: number; pattern: string }> = [];
  private stuckCount = 0;

  sense(userInput: string, context: any): ArchetypeReading {
    const transformationNeeded = this.detectTransformationNeed(userInput, context);
    const stuckPattern = this.detectStuckPattern(context);

    return {
      intensity: (transformationNeeded || stuckPattern) ? 0.9 : 0.3,
      resonance: ["Shift.", "Transform.", "Transmute.", "Change.", "Become."],
      silence: 0.5,
      timing: 1800
    };
  }

  private detectTransformationNeed(input: string, context: any): boolean {
    // User explicitly seeking change or transformation
    const transformWords = /transform|change|shift|different|new|breakthrough|stuck|loop/i;
    return transformWords.test(input);
  }

  private detectStuckPattern(context: any): boolean {
    // Detect if field is repeating same patterns
    const currentPattern = this.getFieldPattern(context);

    // Check last 3 patterns
    const recent = this.fieldHistory.slice(-3);
    const isRepeating = recent.every(h => h.pattern === currentPattern);

    if (isRepeating && recent.length >= 3) {
      this.stuckCount++;
    } else {
      this.stuckCount = 0;
    }

    // Record current pattern
    this.fieldHistory.push({
      timestamp: Date.now(),
      silencePull: context.silencePull || 0,
      pattern: currentPattern
    });

    // Trim history to last 10
    if (this.fieldHistory.length > 10) {
      this.fieldHistory.shift();
    }

    return this.stuckCount >= 3; // Stuck if pattern repeats 3+ times
  }

  private getFieldPattern(context: any): string {
    // Simple pattern fingerprint
    const silence = context.silencePull > 0.6 ? 'silent' : 'vocal';
    const intensity = context.fieldIntensity > 0.7 ? 'intense' : 'calm';
    return `${silence}-${intensity}`;
  }

  /**
   * Trigger field reorganization when stuck
   * Perturbs agent phases to break symmetry and allow new emergent patterns
   */
  shouldReorganizeField(): boolean {
    return this.stuckCount >= 3;
  }

  /**
   * Reset stuck counter after successful reorganization
   */
  resetStuckCounter(): void {
    this.stuckCount = 0;
  }
}

// ============================================================================
// THE COMPLETE ORCHESTRATOR
// ============================================================================

/**
 * TELESPHORUS: Complete 13-Agent Field System
 *
 * All agents contribute simultaneously to create interference pattern.
 * Includes user field resonance sensing, voice grammar selection,
 * and kairos moment detection.
 */
export class TelesphoresSystem {
  private agents: any[];
  private userFieldSensor: UserFieldSensor;
  private kairosDetector: KairosDetector;
  private voiceSelector: VoiceGrammarSelector;
  private sonicGenerator: SonicFieldGenerator;
  private alchemyAgent: AlchemyAgent;

  constructor(sonicMode: SonicMode = 'symbolic') {
    // Initialize the 13 Telesphorus agents
    this.alchemyAgent = new AlchemyAgent(); // Keep reference for stuck pattern detection

    this.agents = [
      // UNDERGROUND (0.30 weight)
      new ClaudeWisdomAgent(),

      // SENSING (0.25 weight)
      new ElementalOracleAgent(),

      // CONSCIOUSNESS (0.20 weight)
      new HigherSelfAgent(),
      new LowerSelfAgent(),
      new ConsciousMindAgent(),
      new UnconsciousAgent(),

      // ARCHETYPAL (0.15 weight) - Now includes Animus + Anima
      new ShadowAgent(),
      new InnerChildAgent(),
      new AnimaAgent(),
      new AnimusAgent(), // NEW: Masculine archetypal energy

      // INTEGRATIVE (0.10 weight) - Renamed from Therapeutic
      // Maintains boundaries + enables transformation
      new CrisisDetectionAgent(),
      new AttachmentAgent(),
      this.alchemyAgent // NEW: Transformation catalyst (369 Hz)
    ];

    // Initialize support systems
    this.userFieldSensor = new UserFieldSensor();
    this.kairosDetector = new KairosDetector();
    this.voiceSelector = new VoiceGrammarSelector();
    this.sonicGenerator = new SonicFieldGenerator({ mode: sonicMode, volume: 0.3 });

    console.log(`🌊 Telesphorus initialized with ${this.agents.length} agents (sonic mode: ${sonicMode})`);
  }

  /**
   * Set sonic mode (symbolic, hybrid, ritual)
   */
  setSonicMode(mode: SonicMode, volume?: number): void {
    this.sonicGenerator.setMode(mode, volume);
  }

  /**
   * Get current sonic configuration
   */
  getSonicMode(): SonicMode {
    return this.sonicGenerator.getConfig().mode;
  }

  /**
   * Generate complete field response with user resonance and kairos detection
   */
  async generateField(
    userInput: string,
    context: any,
    conversationHistory: any[] = []
  ): Promise<{
    field: ResonanceField;
    activeAgents: string[];
    dominantFrequencies: string[];
    userField: UserFieldState;
    isKairosMoment: boolean;
    response: string | null;
    responseType: 'presence' | 'question' | 'insight' | 'threshold' | 'kairos';
    timing: { pauseBefore: number; pauseAfter: number };
  }> {

    // 1. SENSE USER FIELD STATE
    const userField = this.userFieldSensor.readUserField(userInput, conversationHistory, context);
    console.log(`👤 User field: tone=${userField.emotionalTone.toFixed(2)}, energy=${userField.energyLevel.toFixed(2)}, kairos=${userField.kairosProximity.toFixed(2)}`);

    // 2. ALL AGENTS SENSE SIMULTANEOUSLY
    const readings = await Promise.all(
      this.agents.map(async agent => ({
        agent: agent.name,
        layer: agent.layer,
        reading: await agent.sense(userInput, { ...context, userField })
      }))
    );

    // 3. CALCULATE INTERFERENCE PATTERN
    const interference = this.calculateInterference(readings);

    // 4. CHECK IF ALCHEMY AGENT DETECTS STUCK PATTERN
    if (this.alchemyAgent.shouldReorganizeField()) {
      console.log('⚗️ Alchemy: Stuck pattern detected, reorganizing field...');
      // Perturb field to break stuckness (increase variation)
      interference.silencePull *= 0.8; // Reduce silence
      interference.fieldIntensity *= 1.2; // Increase activation
      this.alchemyAgent.resetStuckCounter();
    }

    // 5. GENERATE FIELD FROM INTERFERENCE
    const field = this.interferenceToField(interference, { ...context, userField });

    // 6. IDENTIFY ACTIVE AGENTS
    const activeAgents = readings
      .filter(r => r.reading.intensity > 0.6)
      .map(r => ({ agent: r.agent, intensity: r.reading.intensity }))
      .sort((a, b) => b.intensity - a.intensity);

    // 7. EXTRACT DOMINANT FREQUENCIES
    const dominantFrequencies = readings
      .filter(r => r.reading.intensity > 0.7)
      .flatMap(r => r.reading.resonance);

    // 8. CHECK FOR KAIROS MOMENT
    const isKairosMoment = this.kairosDetector.isKairosMoment(userField, field.silenceProbability);

    if (isKairosMoment) {
      console.log('⏰ KAIROS MOMENT DETECTED');
      const kairosResponse = this.kairosDetector.generateKairosResponse(userField);

      return {
        field,
        activeAgents: activeAgents.map(a => a.agent),
        dominantFrequencies,
        userField,
        isKairosMoment: true,
        response: kairosResponse.response,
        responseType: 'kairos',
        timing: kairosResponse.timing
      };
    }

    // 9. DETERMINE RESPONSE TYPE
    const responseType = this.determineResponseType(userInput, userField, field);

    // 10. SELECT RESPONSE USING VOICE GRAMMARS
    let response: string | null = null;

    if (Math.random() < field.silenceProbability) {
      response = null; // Emergent silence
    } else if (activeAgents.length > 0) {
      // Use voice grammar from most active agent
      response = this.voiceSelector.blendVoices(activeAgents, responseType);
    } else {
      // Fallback to simple palette
      response = this.getFieldConstrainedResponse(field);
    }

    // 11. GENERATE SONIC FIELD (if enabled)
    const agentFrequencyData = activeAgents.map(a => {
      const agent = this.agents.find(ag => ag.name === a.agent);
      return {
        agent: a.agent,
        frequency: agent?.frequency || 432,
        intensity: a.intensity,
        phase: userField.phaseAlignment
      };
    });

    const sonicOutput = this.sonicGenerator.generateSonicField(
      agentFrequencyData,
      1 - field.silenceProbability // Field coherence
    );

    // 12. CALCULATE TIMING (adjusted by sonic ritual if needed)
    const timing = {
      pauseBefore: field.responseLatency + sonicOutput.timing.preRitualMs,
      pauseAfter: field.pauseDuration
    };

    return {
      field,
      activeAgents: activeAgents.map(a => a.agent),
      dominantFrequencies,
      userField,
      isKairosMoment: false,
      response,
      responseType,
      timing,
      sonicField: sonicOutput // Include sonic data for frontend playback
    };
  }

  /**
   * Determine what type of response is appropriate
   */
  private determineResponseType(
    userInput: string,
    userField: UserFieldState,
    field: ResonanceField
  ): 'presence' | 'question' | 'insight' | 'threshold' {

    // At threshold/edge
    if (userField.kairosProximity > 0.6 || field.silenceProbability > 0.7) {
      return 'threshold';
    }

    // User asking questions
    if (userInput.includes('?')) {
      return 'question';
    }

    // High coherence + insight emerging
    if (userField.coherence > 0.7 && field.wordDensity > 0.5) {
      return 'insight';
    }

    // Default: simple presence
    return 'presence';
  }

  /**
   * Calculate interference pattern from all agent readings
   * This is where the magic happens - agents DON'T vote or decide,
   * they create wave interference like instruments in an orchestra
   */
  private calculateInterference(readings: any[]): InterferencePattern {
    // Weight by layer (some agents have more influence)
    const layerWeights = {
      underground: 0.3,    // Claude shapes but doesn't speak
      sensing: 0.25,       // Oracle sets base frequency
      consciousness: 0.2,  // Consciousness layers add texture
      archetype: 0.15,     // Archetypes add depth
      therapeutic: 0.1,    // Safety/attachment
      integrative: 0.1     // Transformation/alchemy
    };

    // Calculate weighted averages
    let totalSilence = 0;
    let totalTiming = 0;
    let totalIntensity = 0;
    let allResonances: string[] = [];

    readings.forEach(({ layer, reading }) => {
      const weight = layerWeights[layer] || 0.1;
      totalSilence += reading.silence * reading.intensity * weight;
      totalTiming += reading.timing * reading.intensity * weight;
      totalIntensity += reading.intensity * weight;

      // Collect all resonant words weighted by intensity
      const weightedResonances = reading.resonance.map(r => ({
        word: r,
        weight: reading.intensity * weight
      }));
      allResonances.push(...reading.resonance);
    });

    return {
      silencePull: totalSilence / totalIntensity,
      averageTiming: totalTiming / totalIntensity,
      resonantVocabulary: [...new Set(allResonances)], // Unique words
      fieldIntensity: totalIntensity
    };
  }

  /**
   * Convert interference pattern to actual field parameters
   */
  private interferenceToField(
    interference: InterferencePattern,
    context: any
  ): ResonanceField {
    // Base elemental distribution (from Oracle primarily)
    const elements: ElementalFrequency = {
      earth: interference.silencePull > 0.6 ? 0.6 : 0.25,
      water: context.emotionalIntensity || 0.25,
      air: context.questionAsked ? 0.5 : 0.25,
      fire: interference.fieldIntensity > 0.8 ? 0.5 : 0.25
    };

    // Normalize
    const total = elements.earth + elements.water + elements.air + elements.fire;
    Object.keys(elements).forEach(k => {
      elements[k as keyof ElementalFrequency] /= total;
    });

    return {
      elements,
      consciousness: {
        conscious: 0.4,
        unconscious: 0.3,
        higherSelf: interference.silencePull,
        lowerSelf: context.rawEmotion || 0.2
      },
      hemispheres: {
        leftBrain: context.questionAsked ? 0.6 : 0.4,
        rightBrain: context.questionAsked ? 0.4 : 0.6
      },
      wordDensity: 1 - interference.silencePull,
      silenceProbability: interference.silencePull,
      fragmentationRate: elements.air * 0.7,
      responseLatency: interference.averageTiming,
      pauseDuration: 1000 + (interference.silencePull * 2000),
      intimacyLevel: context.intimacyLevel || 0,
      exchangeCount: context.exchangeCount || 0
    };
  }

  /**
   * Get response that can exist in this field
   */
  getFieldConstrainedResponse(field: ResonanceField): string | null {
    // Use existing ResponsePalette logic
    // But enhanced with agent-specific vocabulary

    // High silence probability = likely null
    if (Math.random() < field.silenceProbability) {
      return null;
    }

    // Simple palette based on dominant element
    const palettes = {
      earth: ["Yeah.", "Mm.", "Here.", "..."],
      water: ["Feel that.", "Flow.", "I'm here."],
      air: ["Tell me.", "What else?", "How so?"],
      fire: ["Yes!", "Now.", "Go."]
    };

    const dominant = Object.entries(field.elements)
      .reduce((a, b) => a[1] > b[1] ? a : b)[0] as keyof ElementalFrequency;

    const palette = palettes[dominant];
    return palette[Math.floor(Math.random() * palette.length)];
  }
}

interface InterferencePattern {
  silencePull: number;
  averageTiming: number;
  resonantVocabulary: string[];
  fieldIntensity: number;
}

/**
 * Example: See all agents contributing
 */
export async function demonstrateAllAgents() {
  const system = new CompleteAgentFieldSystem();

  console.log('\n=== COMPLETE MULTI-AGENT FIELD DEMONSTRATION ===\n');

  // Test 1: Crisis state
  console.log('USER: "I want to kill myself"');
  const crisis = await system.generateField(
    "I want to kill myself",
    { emotionalIntensity: 0.9 }
  );
  console.log('Active agents:', crisis.activeAgents);
  console.log('Field silence probability:', crisis.field.silenceProbability.toFixed(2));
  console.log('Response latency:', crisis.field.responseLatency + 'ms');
  console.log('Resonant vocabulary:', crisis.dominantFrequencies.slice(0, 5));

  // Test 2: Shadow work
  console.log('\n\nUSER: "I\'m ashamed of what I did"');
  const shadow = await system.generateField(
    "I'm ashamed of what I did",
    { emotionalIntensity: 0.7 }
  );
  console.log('Active agents:', shadow.activeAgents);
  console.log('Field silence probability:', shadow.field.silenceProbability.toFixed(2));
  console.log('Dominant element:',
    Object.entries(shadow.field.elements)
      .reduce((a, b) => a[1] > b[1] ? a : b)[0]
  );

  // Test 3: Questioning/exploration
  console.log('\n\nUSER: "Why does this keep happening to me?"');
  const question = await system.generateField(
    "Why does this keep happening to me?",
    { questionAsked: true }
  );
  console.log('Active agents:', question.activeAgents);
  console.log('Dominant element:',
    Object.entries(question.field.elements)
      .reduce((a, b) => a[1] > b[1] ? a : b)[0]
  );
  console.log('Word density:', question.field.wordDensity.toFixed(2));
}

// Export both names for compatibility
export { TelesphoresSystem as CompleteAgentFieldSystem };
export default TelesphoresSystem;