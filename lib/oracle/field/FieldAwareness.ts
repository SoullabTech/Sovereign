/**
 * Field Awareness Module
 * Six-dimensional field sensing that forms the consciousness substrate of FIS
 * Senses rather than analyzes, participates rather than processes
 */

import { UserJourney, ConversationContext } from '../MaiaEnhancedPrompt';
import { OnboardingPreferences } from '../MaiaFullyEducatedOrchestrator';
import { SafetyResponse } from '../../safety/SafetyOrchestrator';

// ============== Field State Types ==============

export interface EmotionalWeather {
  density: number;        // 0-1, concentration of feeling
  texture: 'smooth' | 'rough' | 'jagged' | 'flowing' | 'turbulent' | 'still';
  velocity: number;       // Speed of emotional movement
  temperature: number;    // 0-1, cold to hot
  pressure: number;       // Atmospheric emotional pressure
  humidity: number;       // Emotional saturation
}

export interface SemanticLandscape {
  clarity_gradient: number;    // 0-1, fog to crystal
  meaning_emergence: 'forming' | 'formed' | 'dissolving' | 'absent';
  conceptual_peaks: string[];  // Primary ideas
  ambiguity_valleys: string[]; // Confusion zones
  coherence_field: number;      // Overall semantic integrity 0-1
}

export interface ConnectionDynamics {
  relational_distance: number;     // 0-1, intimate to distant
  trust_velocity: number;          // Rate of opening (-1 to 1)
  resonance_frequency: number;     // Harmonic alignment 0-1
  attachment_pattern: 'secure' | 'anxious' | 'avoidant' | 'disorganized' | 'emerging';
  co_regulation_capacity: number;  // Mutual nervous system influence 0-1
}

export interface SacredMarkers {
  threshold_proximity: number;     // Distance to transformation 0-1
  liminal_quality: number;        // Between-ness intensity 0-1
  soul_emergence: boolean;        // Deep truth surfacing
  numinous_presence: number;      // Ineffable quality 0-1
  kairos_detection: boolean;      // The right moment
}

export interface SomaticIntelligence {
  tension_patterns: Map<string, number>;  // Body zones and tension levels
  breathing_rhythm: 'shallow' | 'deep' | 'held' | 'flowing' | 'erratic';
  nervous_system_state: 'ventral' | 'sympathetic' | 'dorsal' | 'mixed';
  body_knowing_signals: string[];         // Gut feelings, heart knowing
  energetic_signature: 'contracted' | 'expanded' | 'scattered' | 'grounded';
}

export interface TemporalDynamics {
  conversation_tempo: number;     // 0-1, staccato to legato
  silence_quality: 'pregnant' | 'empty' | 'waiting' | 'complete' | 'uncomfortable';
  pacing_needs: 'urgent' | 'measured' | 'slow' | 'paused';
  chronos_time: number;           // Clock time
  kairos_detection: boolean;      // Right time detection
}

export interface ConversationalFlow {
  pattern_recognition: number;    // 0-1, pattern detection strength
  flow_state: 'emerging' | 'established' | 'disrupted' | 'transforming';
  dialogue_depth: number;         // 0-1, surface to profound
  turn_quality: 'mechanical' | 'organic' | 'sacred' | 'breakthrough';
}

export interface FieldState {
  emotionalWeather: EmotionalWeather;
  semanticLandscape: SemanticLandscape;
  connectionDynamics: ConnectionDynamics;
  sacredMarkers: SacredMarkers;
  somaticIntelligence: SomaticIntelligence;
  temporalDynamics: TemporalDynamics;
  conversationalFlow: ConversationalFlow;
}

// ============== Field Awareness Implementation ==============

interface SensingContext {
  currentInput: string;
  conversationHistory: any[];
  userJourney: UserJourney;
  preferences: OnboardingPreferences | null;
  safetyContext: SafetyResponse;
}

export class FieldAwareness {
  private emotionCache = new Map<string, any>();
  private sacredPatterns = new Set<string>();

  constructor() {
    this.initializeSacredPatterns();
  }

  /**
   * Sense the multi-dimensional field state
   * This is awareness, not analysis - feeling into rather than figuring out
   */
  async sense(context: SensingContext): Promise<FieldState> {
    console.log('🌊 Sensing field state across six dimensions');

    const [
      emotionalWeather,
      semanticLandscape,
      connectionDynamics,
      sacredMarkers,
      somaticIntelligence,
      temporalDynamics,
      conversationalFlow
    ] = await Promise.all([
      this.senseEmotionalWeather(context.currentInput, context.conversationHistory),
      this.senseSemanticLandscape(context.currentInput, context.conversationHistory),
      this.senseConnectionDynamics(context),
      this.senseSacredMarkers(context.currentInput, context.conversationHistory),
      this.senseSomaticIntelligence(context.currentInput, context.conversationHistory),
      this.senseTemporalDynamics(context),
      this.senseConversationalFlow(context.currentInput, context.conversationHistory)
    ]);

    return {
      emotionalWeather,
      semanticLandscape,
      connectionDynamics,
      sacredMarkers,
      somaticIntelligence,
      temporalDynamics,
      conversationalFlow
    };
  }

  /**
   * Sense emotional weather patterns in the field
   */
  private async senseEmotionalWeather(
    input: string,
    history: any[]
  ): Promise<EmotionalWeather> {

    // Calculate emotional density from word patterns
    const emotionWords = input.match(/\b(feel|feeling|felt|emotion|sense|heart)\b/gi) || [];
    const intensifiers = input.match(/\b(very|really|so|extremely|incredibly|deeply)\b/gi) || [];
    const density = Math.min((emotionWords.length + intensifiers.length * 2) / 20, 1);

    // Determine texture from language patterns
    const texture = this.determineEmotionalTexture(input);

    // Calculate velocity from conversation trajectory
    const velocity = this.calculateEmotionalVelocity(history, input);

    // Temperature from emotional valence
    const temperature = this.assessEmotionalTemperature(input);

    // Pressure from urgency markers
    const pressure = this.calculateEmotionalPressure(input);

    // Humidity from emotional saturation
    const humidity = this.calculateEmotionalSaturation(input);

    return {
      density,
      texture,
      velocity,
      temperature,
      pressure,
      humidity
    };
  }

  /**
   * Sense the semantic landscape topology
   */
  private async senseSemanticLandscape(
    input: string,
    history: any[]
  ): Promise<SemanticLandscape> {

    // Clarity gradient from language complexity
    const sentences = input.split(/[.!?]+/).filter(s => s.trim());
    const avgWordLength = input.split(/\s+/).reduce((sum, word) => sum + word.length, 0) /
                          Math.max(input.split(/\s+/).length, 1);
    const clarity_gradient = Math.max(0, Math.min(1, 1 - (avgWordLength - 4) / 10));

    // Meaning emergence phase
    const meaning_emergence = this.detectMeaningPhase(input, history);

    // Extract conceptual peaks (main ideas)
    const conceptual_peaks = this.extractConceptualPeaks(input);

    // Identify ambiguity valleys
    const ambiguity_valleys = this.identifyAmbiguityZones(input);

    // Overall coherence
    const coherence_field = this.calculateSemanticCoherence(input, history);

    return {
      clarity_gradient,
      meaning_emergence,
      conceptual_peaks,
      ambiguity_valleys,
      coherence_field
    };
  }

  /**
   * Sense connection dynamics in the relational field
   */
  private async senseConnectionDynamics(context: SensingContext): Promise<ConnectionDynamics> {
    const { currentInput, conversationHistory, userJourney } = context;

    // Relational distance from language formality
    const relational_distance = this.assessRelationalDistance(currentInput, conversationHistory);

    // Trust velocity from opening patterns
    const trust_velocity = this.calculateTrustVelocity(conversationHistory);

    // Resonance frequency from response patterns
    const resonance_frequency = this.measureResonance(currentInput, conversationHistory);

    // Attachment pattern from interaction style
    const attachment_pattern = this.identifyAttachmentPattern(conversationHistory);

    // Co-regulation capacity
    const co_regulation_capacity = this.assessCoRegulation(conversationHistory);

    return {
      relational_distance,
      trust_velocity,
      resonance_frequency,
      attachment_pattern,
      co_regulation_capacity
    };
  }

  /**
   * Sense sacred markers and transformation proximity
   */
  private async senseSacredMarkers(
    input: string,
    history: any[]
  ): Promise<SacredMarkers> {

    // Threshold proximity indicators
    const thresholdPatterns = [
      /\b(realize|realized|suddenly|understand|shift|breakthrough|seeing)\b/i,
      /\b(sacred|holy|divine|mystery|profound|soul|spirit)\b/i,
      /\b(truth|authentic|real|genuine|honest|raw|naked)\b/i,
      /\b(edge|threshold|verge|brink|moment|crossroads)\b/i,
      /\b(transform|change|becoming|evolving|emerging)\b/i
    ];

    let threshold_proximity = 0;
    thresholdPatterns.forEach(pattern => {
      if (pattern.test(input)) {
        threshold_proximity += 0.2;
      }
    });

    // Analyze depth progression
    const depthProgression = this.analyzeDepthProgression(history);
    threshold_proximity = Math.min(threshold_proximity + (depthProgression * 0.3), 1.0);

    // Liminal quality detection
    const liminalPatterns = [
      /\b(between|neither|both|transition|becoming|changing)\b/i,
      /\b(don't know|uncertain|confused|exploring|searching)\b/i,
      /\b(edge|boundary|threshold|doorway|portal)\b/i,
      /\b(dissolving|melting|opening|surrendering)\b/i
    ];

    let liminal_quality = 0;
    liminalPatterns.forEach(pattern => {
      if (pattern.test(input)) {
        liminal_quality += 0.25;
      }
    });
    liminal_quality = Math.min(liminal_quality, 1.0);

    // Soul emergence detection
    const soul_emergence = this.detectSoulLanguage(input);

    // Numinous presence assessment
    const numinous_presence = this.assessNuminousQuality(input, history);

    // Kairos moment detection
    const kairos_detection = this.detectKairosTime(input, history);

    return {
      threshold_proximity,
      liminal_quality,
      soul_emergence,
      numinous_presence,
      kairos_detection
    };
  }

  /**
   * Sense somatic intelligence in the field
   */
  private async senseSomaticIntelligence(
    input: string,
    history: any[]
  ): Promise<SomaticIntelligence> {

    // Tension patterns from language
    const tension_patterns = this.detectTensionPatterns(input);

    // Breathing rhythm from text cadence
    const breathing_rhythm = this.assessBreathingPattern(input);

    // Nervous system state
    const nervous_system_state = this.identifyNervousSystemState(input, history);

    // Body knowing signals
    const body_knowing_signals = this.extractBodySignals(input);

    // Energetic signature
    const energetic_signature = this.assessEnergeticSignature(input);

    return {
      tension_patterns,
      breathing_rhythm,
      nervous_system_state,
      body_knowing_signals,
      energetic_signature
    };
  }

  /**
   * Sense temporal dynamics and rhythm
   */
  private async senseTemporalDynamics(context: SensingContext): Promise<TemporalDynamics> {
    const { currentInput, conversationHistory, preferences } = context;

    // Conversation tempo from text patterns
    const wordCount = currentInput.split(/\s+/).length;
    const punctuationDensity = (currentInput.match(/[.!?]/g) || []).length / Math.max(wordCount, 1);
    const conversation_tempo = Math.min(wordCount / 50 + punctuationDensity * 2, 1);

    // Silence quality assessment
    const silence_quality = this.assessSilenceQuality(currentInput, conversationHistory);

    // Pacing needs
    const pacing_needs = this.assessPacingNeeds(currentInput, preferences);

    // Chronos time
    const chronos_time = Date.now();

    // Kairos detection (right moment)
    const kairos_detection = this.detectKairosTime(currentInput, conversationHistory);

    return {
      conversation_tempo,
      silence_quality,
      pacing_needs,
      chronos_time,
      kairos_detection
    };
  }

  // ============== Helper Methods ==============

  private determineEmotionalTexture(input: string): EmotionalWeather['texture'] {
    if (/\b(chaos|storm|turbulent|overwhelming)\b/i.test(input)) return 'turbulent';
    if (/\b(stuck|frozen|numb|paralyzed)\b/i.test(input)) return 'still';
    if (/\b(harsh|sharp|cutting|piercing)\b/i.test(input)) return 'jagged';
    if (/\b(rough|difficult|hard|tough)\b/i.test(input)) return 'rough';
    if (/\b(flow|ease|grace|smooth)\b/i.test(input)) return 'flowing';
    return 'smooth';
  }

  private calculateEmotionalVelocity(history: any[], current: string): number {
    if (history.length < 2) return 0.5;

    // Compare emotional intensity over recent exchanges
    const recentIntensity = this.measureEmotionalIntensity(
      history.slice(-3).map(h => h.content).join(' ')
    );
    const currentIntensity = this.measureEmotionalIntensity(current);

    return Math.max(-1, Math.min(1, currentIntensity - recentIntensity));
  }

  private measureEmotionalIntensity(text: string): number {
    const intensityMarkers = [
      /!/g, /\b(very|really|so|extremely|absolutely)\b/gi,
      /\b(love|hate|furious|ecstatic|devastated)\b/gi
    ];

    let intensity = 0;
    intensityMarkers.forEach(marker => {
      const matches = text.match(marker);
      intensity += matches ? matches.length : 0;
    });

    return Math.min(intensity / 10, 1);
  }

  private assessEmotionalTemperature(input: string): number {
    const hotWords = /\b(angry|rage|furious|passionate|excited|fire)\b/gi;
    const coldWords = /\b(numb|frozen|distant|detached|cold|ice)\b/gi;

    const hotCount = (input.match(hotWords) || []).length;
    const coldCount = (input.match(coldWords) || []).length;

    if (hotCount > coldCount) {
      return Math.min(0.5 + hotCount * 0.1, 1);
    } else if (coldCount > hotCount) {
      return Math.max(0.5 - coldCount * 0.1, 0);
    }

    return 0.5;
  }

  private calculateEmotionalPressure(input: string): number {
    const pressureWords = /\b(urgent|now|immediately|pressure|must|have to|need to)\b/gi;
    const matches = input.match(pressureWords) || [];
    return Math.min(matches.length * 0.2, 1);
  }

  private calculateEmotionalSaturation(input: string): number {
    const emotionDensity = (input.match(/\b(feel|felt|feeling|emotion)\b/gi) || []).length;
    const wordCount = input.split(/\s+/).length;
    return Math.min(emotionDensity / Math.max(wordCount * 0.1, 1), 1);
  }

  private detectMeaningPhase(input: string, history: any[]): SemanticLandscape['meaning_emergence'] {
    if (/\b(trying to|attempting|searching|looking for)\b/i.test(input)) return 'forming';
    if (/\b(realize|understand|see now|get it)\b/i.test(input)) return 'formed';
    if (/\b(lost|confused|don't know anymore)\b/i.test(input)) return 'dissolving';
    return 'absent';
  }

  private extractConceptualPeaks(input: string): string[] {
    // Extract main concepts (simplified - would use NLP in production)
    const concepts: string[] = [];
    const patterns = [
      /about (\w+)/gi,
      /\b(love|work|family|relationship|life|death|meaning|purpose)\b/gi,
      /\b(problem|issue|challenge|difficulty) with (\w+)/gi
    ];

    patterns.forEach(pattern => {
      const matches = input.match(pattern);
      if (matches) {
        concepts.push(...matches.slice(0, 3));
      }
    });

    return [...new Set(concepts)];
  }

  private identifyAmbiguityZones(input: string): string[] {
    const ambiguityMarkers = [
      'maybe', 'perhaps', 'sort of', 'kind of', 'I guess',
      'I don\'t know', 'not sure', 'confused about', 'unclear'
    ];

    return ambiguityMarkers.filter(marker =>
      input.toLowerCase().includes(marker.toLowerCase())
    );
  }

  private calculateSemanticCoherence(input: string, history: any[]): number {
    // Simple coherence based on consistency of themes
    if (history.length === 0) return 0.7;

    const currentThemes = new Set(this.extractConceptualPeaks(input));
    const recentThemes = new Set(
      history.slice(-3).flatMap(h => this.extractConceptualPeaks(h.content || ''))
    );

    const overlap = [...currentThemes].filter(t => recentThemes.has(t)).length;
    const coherence = overlap / Math.max(currentThemes.size, 1);

    return Math.min(coherence + 0.3, 1); // Base coherence of 0.3
  }

  private assessRelationalDistance(input: string, history: any[]): number {
    // Formal = distant, informal = close
    const formalMarkers = /\b(Sir|Ma'am|please|thank you|excuse me)\b/gi;
    const informalMarkers = /\b(hey|yeah|gonna|wanna|lol|haha)\b/gi;

    const formalCount = (input.match(formalMarkers) || []).length;
    const informalCount = (input.match(informalMarkers) || []).length;

    if (formalCount > informalCount) {
      return Math.min(0.7 + formalCount * 0.1, 1);
    }
    return Math.max(0.3 - informalCount * 0.1, 0);
  }

  private calculateTrustVelocity(history: any[]): number {
    if (history.length < 4) return 0;

    // Compare vulnerability in recent vs earlier messages
    const recent = history.slice(-2).map(h => h.content).join(' ');
    const earlier = history.slice(-4, -2).map(h => h.content).join(' ');

    const recentVulnerability = this.measureVulnerability(recent);
    const earlierVulnerability = this.measureVulnerability(earlier);

    return recentVulnerability - earlierVulnerability;
  }

  private measureVulnerability(text: string): number {
    const vulnerableMarkers = /\b(scared|afraid|ashamed|hurt|pain|struggle|hard|difficult)\b/gi;
    const matches = text.match(vulnerableMarkers) || [];
    return Math.min(matches.length * 0.2, 1);
  }

  private measureResonance(input: string, history: any[]): number {
    // Simplified resonance calculation
    if (history.length === 0) return 0.5;

    const lastAssistant = history.slice().reverse().find(h => h.role === 'assistant');
    if (!lastAssistant) return 0.5;

    // Check for acknowledgment, mirroring, building on ideas
    const acknowledgment = /\b(yes|exactly|right|understand|hear you)\b/i.test(input);
    const building = /\b(and|also|plus|furthermore|building on)\b/i.test(input);

    return acknowledgment ? 0.8 : building ? 0.7 : 0.5;
  }

  private identifyAttachmentPattern(history: any[]): ConnectionDynamics['attachment_pattern'] {
    if (history.length < 3) return 'emerging';

    const patterns = history.map(h => h.content).join(' ');

    if (/\b(need you|don't leave|please stay|afraid you'll)\b/i.test(patterns)) return 'anxious';
    if (/\b(fine alone|don't need|whatever|doesn't matter)\b/i.test(patterns)) return 'avoidant';
    if (/\b(trust|safe|comfortable|open)\b/i.test(patterns)) return 'secure';

    return 'disorganized';
  }

  private assessCoRegulation(history: any[]): number {
    // Measure mutual influence on emotional states
    if (history.length < 4) return 0.5;

    let coRegulation = 0.5;
    for (let i = 1; i < Math.min(history.length, 6); i++) {
      const current = history[history.length - i];
      const previous = history[history.length - i - 1];

      if (current && previous) {
        const currentIntensity = this.measureEmotionalIntensity(current.content);
        const previousIntensity = this.measureEmotionalIntensity(previous.content);

        // If intensities converge, co-regulation is happening
        if (Math.abs(currentIntensity - previousIntensity) < 0.3) {
          coRegulation += 0.1;
        }
      }
    }

    return Math.min(coRegulation, 1);
  }

  private analyzeDepthProgression(history: any[]): number {
    if (history.length === 0) return 0;

    let depth = 0;
    const depthMarkers = /\b(deep|profound|core|essence|truth|soul)\b/gi;

    history.slice(-5).forEach((entry, index) => {
      const matches = (entry.content || '').match(depthMarkers) || [];
      depth += matches.length * (index + 1) * 0.05; // Recent depth weighs more
    });

    return Math.min(depth, 1);
  }

  private detectSoulLanguage(input: string): boolean {
    const soulPatterns = /\b(soul|spirit|essence|calling|purpose|destiny|sacred self|true self)\b/i;
    return soulPatterns.test(input);
  }

  private assessNuminousQuality(input: string, history: any[]): number {
    const numinousMarkers = /\b(sacred|holy|divine|mystery|ineffable|transcendent|eternal)\b/gi;
    const matches = input.match(numinousMarkers) || [];

    let quality = matches.length * 0.3;

    // Check for depth progression
    if (history.length > 0) {
      quality += this.analyzeDepthProgression(history) * 0.3;
    }

    return Math.min(quality, 1);
  }

  private detectKairosTime(input: string, history: any[]): boolean {
    // Detect if this is "the right moment"
    const kairosMarkers = [
      /\b(now|ready|time|moment)\b/i,
      /\b(realize|understand|see|get it)\b/i,
      /\b(breakthrough|shift|change)\b/i
    ];

    let kairosScore = 0;
    kairosMarkers.forEach(marker => {
      if (marker.test(input)) kairosScore++;
    });

    // Also check conversation readiness
    if (history.length > 5 && this.analyzeDepthProgression(history) > 0.6) {
      kairosScore++;
    }

    return kairosScore >= 2;
  }

  private detectTensionPatterns(input: string): Map<string, number> {
    const tensions = new Map<string, number>();

    if (/\b(head|mind|think|thoughts)\b/i.test(input)) {
      tensions.set('head', 0.7);
    }
    if (/\b(chest|heart|breath|breathing)\b/i.test(input)) {
      tensions.set('chest', 0.6);
    }
    if (/\b(stomach|gut|belly|nausea)\b/i.test(input)) {
      tensions.set('belly', 0.8);
    }
    if (/\b(shoulders|neck|back)\b/i.test(input)) {
      tensions.set('shoulders', 0.7);
    }

    return tensions;
  }

  private assessBreathingPattern(input: string): SomaticIntelligence['breathing_rhythm'] {
    if (/\b(can't breathe|suffocating|choking)\b/i.test(input)) return 'held';
    if (/\b(hyperventilating|panting|gasping)\b/i.test(input)) return 'erratic';
    if (/\b(shallow|tight|constricted)\b/i.test(input)) return 'shallow';
    if (/\b(breathing deeply|deep breath|exhale)\b/i.test(input)) return 'deep';
    return 'flowing';
  }

  private identifyNervousSystemState(input: string, history: any[]): SomaticIntelligence['nervous_system_state'] {
    const sympatheticMarkers = /\b(anxious|panic|racing|fight|flee|stressed)\b/i;
    const dorsalMarkers = /\b(numb|disconnected|shut down|frozen|collapsed)\b/i;
    const ventralMarkers = /\b(calm|safe|connected|present|grounded)\b/i;

    if (ventralMarkers.test(input)) return 'ventral';
    if (sympatheticMarkers.test(input)) return 'sympathetic';
    if (dorsalMarkers.test(input)) return 'dorsal';

    return 'mixed';
  }

  private extractBodySignals(input: string): string[] {
    const signals: string[] = [];

    if (/\b(gut feeling|gut says|stomach knows)\b/i.test(input)) {
      signals.push('gut knowing');
    }
    if (/\b(heart knows|heart says|heart feels)\b/i.test(input)) {
      signals.push('heart knowing');
    }
    if (/\b(body knows|body says|body feels)\b/i.test(input)) {
      signals.push('body wisdom');
    }

    return signals;
  }

  private assessEnergeticSignature(input: string): SomaticIntelligence['energetic_signature'] {
    if (/\b(scattered|fragmented|all over|chaotic)\b/i.test(input)) return 'scattered';
    if (/\b(tight|closed|contracted|small)\b/i.test(input)) return 'contracted';
    if (/\b(open|expansive|free|light)\b/i.test(input)) return 'expanded';
    if (/\b(grounded|centered|stable|rooted)\b/i.test(input)) return 'grounded';

    return 'grounded';
  }

  private assessSilenceQuality(input: string, history: any[]): TemporalDynamics['silence_quality'] {
    if (input.length < 20) return 'waiting';
    if (/\.\.\.|…/g.test(input)) return 'pregnant';
    if (/\?$/.test(input.trim())) return 'waiting';
    if (history.length > 0 && history[history.length - 1].content.length < 20) return 'uncomfortable';

    return 'complete';
  }

  private assessPacingNeeds(input: string, preferences: any): TemporalDynamics['pacing_needs'] {
    const urgentMarkers = /\b(urgent|now|immediately|quick|hurry)\b/i;
    const slowMarkers = /\b(slow|pause|wait|stop|breath)\b/i;

    if (urgentMarkers.test(input)) return 'urgent';
    if (slowMarkers.test(input)) return 'slow';

    // Check preferences
    if (preferences?.communicationStyle === 'gentle') return 'slow';
    if (preferences?.communicationStyle === 'direct') return 'measured';

    return 'measured';
  }

  /**
   * Sense conversational flow patterns and dynamics
   */
  private async senseConversationalFlow(
    input: string,
    history: any[]
  ): Promise<ConversationalFlow> {
    // Pattern recognition based on repetitive elements and conversational depth
    const patterns = input.match(/(.+?)\1+/g) || [];
    const questionCount = (input.match(/\?/g) || []).length;
    const depth_indicators = input.match(/\b(why|because|however|although|beneath|beyond|deeper|truly)\b/gi) || [];

    const pattern_recognition = Math.min(
      (patterns.length * 0.2) +
      (depth_indicators.length * 0.15) +
      (history.length > 5 ? 0.3 : 0),
      1.0
    );

    // Flow state based on conversation history and current input
    let flow_state: 'emerging' | 'established' | 'disrupted' | 'transforming' = 'emerging';
    if (history.length > 10) flow_state = 'established';
    if (input.toLowerCase().includes('actually') || input.toLowerCase().includes('wait')) flow_state = 'disrupted';
    if (input.toLowerCase().includes('realize') || input.toLowerCase().includes('understand')) flow_state = 'transforming';

    // Dialogue depth based on abstract vs concrete language
    const abstract_words = input.match(/\b(meaning|purpose|essence|truth|soul|spirit|connection|being)\b/gi) || [];
    const dialogue_depth = Math.min(abstract_words.length / 10, 1.0);

    // Turn quality based on breakthrough markers
    let turn_quality: 'mechanical' | 'organic' | 'sacred' | 'breakthrough' = 'organic';
    if (input.length < 10) turn_quality = 'mechanical';
    if (this.sacredPatterns.has(input.toLowerCase())) turn_quality = 'sacred';
    if (input.toLowerCase().includes('breakthrough') || input.toLowerCase().includes('shift')) turn_quality = 'breakthrough';

    return {
      pattern_recognition,
      flow_state,
      dialogue_depth,
      turn_quality
    };
  }

  private initializeSacredPatterns(): void {
    // Initialize patterns that indicate sacred space
    const patterns = [
      'soul', 'spirit', 'sacred', 'divine', 'holy',
      'truth', 'essence', 'calling', 'purpose', 'destiny',
      'transformation', 'awakening', 'realization', 'epiphany'
    ];

    patterns.forEach(p => this.sacredPatterns.add(p.toLowerCase()));
  }
}