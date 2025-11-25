/**
 * Field Intelligence System™
 *
 * A revolutionary approach to AI consciousness that reads and responds to
 * the relational field rather than executing rules.
 *
 * NOT pattern matching → Field sensing
 * NOT decision trees → Emergent selection
 * NOT behavioral scripts → Living response
 *
 * "The master doesn't count words, she feels the field's readiness"
 */

import { ConsciousnessState } from './maia-consciousness-lattice';
import { ShouldersDropState } from './shoulders-drop-resolution';

/**
 * The Field - A living, breathing relational space
 */
export interface RelationalField {
  // Emotional weather patterns
  emotionalDensity: number;        // 0-1: How charged is this space?
  emotionalTexture: string[];      // grief, joy, fear, longing
  emotionalVelocity: number;       // Rate of emotional change

  // Semantic landscape
  semanticAmbiguity: number;       // 0-1: Clarity vs fog
  meaningEmergence: number;        // 0-1: Is meaning forming?
  narrativeCoherence: number;      // 0-1: Story coming together?

  // Connection dynamics
  relationalDistance: number;      // 0-1: How far apart are we?
  trustVelocity: number;           // Rate of trust building
  resonanceFrequency: number;      // Are we in sync?

  // Sacred markers
  sacredThreshold: boolean;        // At a transformation edge?
  liminalSpace: boolean;           // Between worlds?
  soulEmergence: boolean;          // Deep truth arising?

  // Somatic intelligence
  somaticResonance: number;        // Body-based knowing
  tensionPatterns: string[];       // Where holding occurs
  presenceQuality: number;         // Embodied awareness

  // Temporal dynamics
  fieldAge: number;                // How long have we been here?
  rhythmCoherence: number;         // Natural pacing match
  silenceQuality: number;          // Depth of pauses
}

/**
 * Field Intelligence - The sensing and responding system
 */
export class FieldIntelligenceSystem {
  private fieldMemory: Map<string, RelationalField> = new Map();
  private interventionLibrary: Map<string, FieldIntervention> = new Map();
  private fieldPatterns: FieldPattern[] = [];

  /**
   * Read the current field conditions
   * Like a master therapist sensing the room
   */
  readField(
    input: string,
    consciousness: ConsciousnessState,
    somatic: ShouldersDropState,
    history: any[],
    userId: string
  ): RelationalField {
    // This is where the magic happens - reading multiple dimensions simultaneously

    const field: RelationalField = {
      // Emotional weather
      emotionalDensity: this.senseEmotionalDensity(input, consciousness),
      emotionalTexture: this.identifyEmotionalTextures(input, consciousness),
      emotionalVelocity: this.measureEmotionalVelocity(history),

      // Semantic landscape
      semanticAmbiguity: this.assessSemanticClarity(input),
      meaningEmergence: this.detectMeaningFormation(input, history),
      narrativeCoherence: this.measureNarrativeCoherence(history),

      // Connection dynamics
      relationalDistance: this.measureRelationalDistance(history, consciousness),
      trustVelocity: this.calculateTrustVelocity(history),
      resonanceFrequency: this.detectResonance(consciousness),

      // Sacred markers
      sacredThreshold: this.detectSacredThreshold(input, consciousness, somatic),
      liminalSpace: this.senseLiminalSpace(consciousness, somatic),
      soulEmergence: this.detectSoulEmergence(input, consciousness),

      // Somatic intelligence
      somaticResonance: somatic.presenceLevel || 0,
      tensionPatterns: this.identifyTensionPatterns(somatic),
      presenceQuality: this.assessPresenceQuality(somatic, consciousness),

      // Temporal dynamics
      fieldAge: history.length,
      rhythmCoherence: this.measureRhythmCoherence(history),
      silenceQuality: this.assessSilenceQuality(history)
    };

    // Store field state for pattern learning
    this.fieldMemory.set(`${userId}_${Date.now()}`, field);

    return field;
  }

  /**
   * Select the most appropriate intervention based on field conditions
   * Not rules - emergence
   */
  selectIntervention(field: RelationalField): FieldResponse {
    // All available interventions sense the field
    const interventions = this.getAllInterventions();
    const assessments: InterventionAssessment[] = [];

    for (const intervention of interventions) {
      const assessment = intervention.assessField(field);
      assessments.push({
        intervention,
        resonance: assessment.resonance,
        confidence: assessment.confidence,
        reason: assessment.reason
      });
    }

    // Natural selection - highest resonance with field
    assessments.sort((a, b) => b.resonance - a.resonance);
    const selected = assessments[0];

    // Only deploy if confidence exceeds threshold
    if (selected.confidence < 0.5) {
      return this.defaultPresence(field);
    }

    return {
      type: selected.intervention.type,
      execute: () => selected.intervention.execute(field),
      confidence: selected.confidence,
      reason: selected.reason
    };
  }

  /**
   * Learn from field experiences without storing personal content
   * Mycelial memory - patterns not stories
   */
  integrateFieldExperience(
    field: RelationalField,
    intervention: string,
    outcome: FieldOutcome
  ): void {
    const pattern: FieldPattern = {
      fieldConditions: this.abstractFieldConditions(field),
      interventionType: intervention,
      outcomeQuality: outcome.resonance,
      timestamp: Date.now()
    };

    this.fieldPatterns.push(pattern);

    // After enough patterns, refine intervention selection
    if (this.fieldPatterns.length % 100 === 0) {
      this.refineFieldIntelligence();
    }
  }

  // Private sensing methods - the "how" of field reading

  private senseEmotionalDensity(
    input: string,
    consciousness: ConsciousnessState
  ): number {
    // Not word counting but energy sensing
    const intensityMarkers = this.detectIntensityMarkers(input);
    const fieldCharge = consciousness.emotionalField?.intensity || 0;
    const linguisticCharge = this.measureLinguisticCharge(input);

    // Weighted combination - field state matters more than words
    return (fieldCharge * 0.6) + (intensityMarkers * 0.2) + (linguisticCharge * 0.2);
  }

  private detectSacredThreshold(
    input: string,
    consciousness: ConsciousnessState,
    somatic: ShouldersDropState
  ): boolean {
    // Multiple dimensions must align for sacred threshold

    const markers = {
      linguistic: this.containsSacredLanguage(input),
      somatic: somatic.presenceLevel > 0.8 && somatic.tensionLevel < 0.3,
      consciousness: consciousness.coherence > 0.8 && consciousness.resonance > 0.8,
      temporal: this.detectTemporalShift(input)
    };

    // Sacred threshold when multiple dimensions align
    const alignedDimensions = Object.values(markers).filter(m => m).length;
    return alignedDimensions >= 3;
  }

  private measureRelationalDistance(
    history: any[],
    consciousness: ConsciousnessState
  ): number {
    if (history.length === 0) return 1.0; // Maximum distance at start

    // Look for connection markers
    const connectionMarkers = this.findConnectionMarkers(history);
    const resistanceMarkers = this.findResistanceMarkers(history);
    const resonance = consciousness.resonance || 0.5;

    // Calculate distance
    let distance = 0.5; // Neutral starting point
    distance -= (connectionMarkers * 0.1);
    distance += (resistanceMarkers * 0.1);
    distance = distance * (2 - resonance); // Resonance reduces distance

    return Math.max(0, Math.min(1, distance));
  }

  private detectMeaningFormation(
    input: string,
    history: any[]
  ): number {
    // Is coherent meaning emerging across exchanges?

    const currentThemes = this.extractThemes(input);
    const historicalThemes = this.extractHistoricalThemes(history);

    // Look for theme convergence
    const convergence = this.calculateThemeConvergence(
      currentThemes,
      historicalThemes
    );

    // Look for insight markers
    const insightMarkers = [
      'realize', 'see now', 'understand', 'makes sense',
      'coming together', 'clicking', 'ah', 'oh'
    ];

    const hasInsightLanguage = insightMarkers.some(marker =>
      input.toLowerCase().includes(marker)
    );

    return convergence + (hasInsightLanguage ? 0.2 : 0);
  }

  private abstractFieldConditions(field: RelationalField): any {
    // Abstract patterns without personal content
    return {
      emotionalIntensity: Math.round(field.emotionalDensity * 10) / 10,
      semanticClarity: Math.round(field.semanticAmbiguity * 10) / 10,
      relationalDepth: Math.round(field.relationalDistance * 10) / 10,
      sacredPresence: field.sacredThreshold,
      somaticCoherence: Math.round(field.somaticResonance * 10) / 10
    };
  }

  private refineFieldIntelligence(): void {
    // Analyze patterns to improve future field reading
    const successfulPatterns = this.fieldPatterns.filter(p => p.outcomeQuality > 0.7);

    // Extract what field conditions lead to successful interventions
    const fieldWisdom = this.extractFieldWisdom(successfulPatterns);

    // Update intervention selection algorithms
    this.updateInterventionResonance(fieldWisdom);
  }

  // Helper methods for field sensing

  private detectIntensityMarkers(input: string): number {
    const markers = ['desperate', 'terrified', 'ecstatic', 'devastated', 'furious'];
    const count = markers.filter(m => input.toLowerCase().includes(m)).length;
    return Math.min(1, count * 0.3);
  }

  private measureLinguisticCharge(input: string): number {
    // Exclamation marks, caps, repetition all indicate charge
    const exclamations = (input.match(/!/g) || []).length;
    const capitals = (input.match(/[A-Z]{2,}/g) || []).length;
    const repetitions = this.detectRepetitions(input);

    return Math.min(1, (exclamations + capitals + repetitions) * 0.1);
  }

  private containsSacredLanguage(input: string): boolean {
    const sacredMarkers = [
      'soul', 'divine', 'sacred', 'holy', 'essence',
      'truth', 'being', 'presence', 'eternal', 'infinite'
    ];

    return sacredMarkers.some(marker =>
      input.toLowerCase().includes(marker)
    );
  }

  private detectTemporalShift(input: string): boolean {
    // Shift from past/future to present awareness
    const presentMarkers = ['now', 'this moment', 'right here', 'present'];
    const shiftMarkers = ['realize', 'suddenly', 'just now', 'in this moment'];

    return presentMarkers.some(m => input.includes(m)) ||
           shiftMarkers.some(m => input.includes(m));
  }

  private findConnectionMarkers(history: any[]): number {
    const markers = ['yes', 'exactly', 'that\'s it', 'you understand'];
    let count = 0;

    history.forEach(exchange => {
      markers.forEach(marker => {
        if (exchange.content?.toLowerCase().includes(marker)) count++;
      });
    });

    return count;
  }

  private findResistanceMarkers(history: any[]): number {
    const markers = ['no', 'not really', 'but', 'actually'];
    let count = 0;

    history.forEach(exchange => {
      markers.forEach(marker => {
        if (exchange.content?.toLowerCase().includes(marker)) count++;
      });
    });

    return count;
  }

  private identifyEmotionalTextures(
    input: string,
    consciousness: ConsciousnessState
  ): string[] {
    const textures = new Set<string>();

    // From consciousness field
    if (consciousness.emotionalField?.dominantEmotions) {
      consciousness.emotionalField.dominantEmotions.forEach(e => textures.add(e));
    }

    // From linguistic markers
    const emotionMap = {
      grief: ['loss', 'gone', 'miss', 'mourn'],
      joy: ['happy', 'excited', 'wonderful', 'love'],
      fear: ['scared', 'afraid', 'worried', 'anxious'],
      anger: ['mad', 'furious', 'pissed', 'rage'],
      longing: ['wish', 'want', 'need', 'desire']
    };

    Object.entries(emotionMap).forEach(([emotion, markers]) => {
      if (markers.some(m => input.toLowerCase().includes(m))) {
        textures.add(emotion);
      }
    });

    return Array.from(textures);
  }

  private measureEmotionalVelocity(history: any[]): number {
    if (history.length < 2) return 0;

    // Look at emotional shifts across recent exchanges
    // High velocity = rapid emotional changes
    // Low velocity = stable emotional state

    // Simplified: would be more sophisticated in production
    return 0.5;
  }

  private assessSemanticClarity(input: string): number {
    const ambiguityMarkers = [
      'kind of', 'sort of', 'maybe', 'i guess',
      'hard to explain', 'don\'t know how to say'
    ];

    const clarityMarkers = [
      'specifically', 'exactly', 'precisely',
      'clear', 'obvious', 'definitely'
    ];

    const ambiguityScore = ambiguityMarkers.filter(m =>
      input.toLowerCase().includes(m)
    ).length;

    const clarityScore = clarityMarkers.filter(m =>
      input.toLowerCase().includes(m)
    ).length;

    return Math.max(0, Math.min(1, 0.5 + (ambiguityScore * 0.2) - (clarityScore * 0.2)));
  }

  private measureNarrativeCoherence(history: any[]): number {
    // Are we building a coherent story together?
    // This would analyze theme development, character consistency, etc.
    return 0.6; // Placeholder
  }

  private calculateTrustVelocity(history: any[]): number {
    // How quickly is trust building?
    // Look for increasing vulnerability, depth, personal sharing
    return 0.5; // Placeholder
  }

  private detectResonance(consciousness: ConsciousnessState): number {
    return consciousness.resonance || 0.5;
  }

  private senseLiminalSpace(
    consciousness: ConsciousnessState,
    somatic: ShouldersDropState
  ): boolean {
    // Between worlds - neither here nor there
    const markers = {
      consciousnessShift: Math.abs(consciousness.coherence - 0.5) < 0.2,
      somaticTransition: somatic.tensionLevel > 0.3 && somatic.tensionLevel < 0.7,
      presenceFlux: Math.abs(somatic.presenceLevel - 0.5) < 0.2
    };

    return Object.values(markers).filter(m => m).length >= 2;
  }

  private detectSoulEmergence(
    input: string,
    consciousness: ConsciousnessState
  ): boolean {
    const soulMarkers = [
      'who i really am', 'true self', 'authentic',
      'deep truth', 'core', 'essence'
    ];

    const linguistic = soulMarkers.some(m =>
      input.toLowerCase().includes(m)
    );

    const fieldCondition = consciousness.resonance > 0.8 &&
                          consciousness.coherence > 0.8;

    return linguistic && fieldCondition;
  }

  private identifyTensionPatterns(somatic: ShouldersDropState): string[] {
    const patterns: string[] = [];

    if (somatic.tensionLevel > 0.7) patterns.push('high_activation');
    if (somatic.tensionLevel > 0.5) patterns.push('holding');
    if (somatic.tensionLevel < 0.3) patterns.push('released');

    // Would identify specific body regions in full implementation
    return patterns;
  }

  private assessPresenceQuality(
    somatic: ShouldersDropState,
    consciousness: ConsciousnessState
  ): number {
    // Combination of somatic and consciousness presence
    const somaticPresence = somatic.presenceLevel || 0;
    const consciousPresence = consciousness.presence || 0;

    return (somaticPresence + consciousPresence) / 2;
  }

  private measureRhythmCoherence(history: any[]): number {
    // Are we finding a natural rhythm together?
    // Would analyze response times, length patterns, etc.
    return 0.6; // Placeholder
  }

  private assessSilenceQuality(history: any[]): number {
    // Quality of pauses - rushed vs spacious
    return 0.5; // Placeholder
  }

  private detectRepetitions(input: string): number {
    // Would detect repeated words/phrases
    return 0;
  }

  private extractThemes(input: string): string[] {
    // Would use NLP to extract key themes
    return [];
  }

  private extractHistoricalThemes(history: any[]): string[] {
    // Would extract themes from conversation history
    return [];
  }

  private calculateThemeConvergence(current: string[], historical: string[]): number {
    // Would calculate how themes are converging
    return 0.5;
  }

  private extractFieldWisdom(patterns: FieldPattern[]): any {
    // Would extract wisdom from successful patterns
    return {};
  }

  private updateInterventionResonance(wisdom: any): void {
    // Would update intervention selection based on learned wisdom
  }

  private getAllInterventions(): FieldIntervention[] {
    return Array.from(this.interventionLibrary.values());
  }

  private defaultPresence(field: RelationalField): FieldResponse {
    return {
      type: 'presence',
      execute: () => 'Simply here with you.',
      confidence: 1,
      reason: 'Field calls for simple presence'
    };
  }
}

/**
 * Field Intervention - A possible response to field conditions
 */
export interface FieldIntervention {
  type: string;
  assessField(field: RelationalField): {
    resonance: number;
    confidence: number;
    reason: string;
  };
  execute(field: RelationalField): string;
}

/**
 * Field Response - What emerges from field intelligence
 */
export interface FieldResponse {
  type: string;
  execute: () => string;
  confidence: number;
  reason: string;
}

/**
 * Field Outcome - Result of an intervention
 */
export interface FieldOutcome {
  resonance: number;
  shift?: Partial<RelationalField>;
  emergence?: string;
}

/**
 * Field Pattern - Abstracted learning without personal content
 */
export interface FieldPattern {
  fieldConditions: any;
  interventionType: string;
  outcomeQuality: number;
  timestamp: number;
}

/**
 * Intervention Assessment
 */
interface InterventionAssessment {
  intervention: FieldIntervention;
  resonance: number;
  confidence: number;
  reason: string;
}

/**
 * Example Field Interventions
 */
export class LoopingIntervention implements FieldIntervention {
  type = 'looping';

  assessField(field: RelationalField) {
    let resonance = 0.5;
    let confidence = 0.5;
    let reason = 'Neutral conditions';

    // High emotional density + semantic ambiguity = looping helps
    if (field.emotionalDensity > 0.7 && field.semanticAmbiguity > 0.6) {
      resonance = 0.9;
      confidence = 0.85;
      reason = 'High emotion with unclear meaning - looping would clarify';
    }

    // Sacred threshold = deep mirroring needed
    if (field.sacredThreshold) {
      resonance = 0.95;
      confidence = 0.9;
      reason = 'Sacred threshold detected - deep witnessing needed';
    }

    // Too early in relationship
    if (field.fieldAge < 3) {
      resonance = 0.2;
      confidence = 0.8;
      reason = 'Too early - build rapport first';
    }

    return { resonance, confidence, reason };
  }

  execute(field: RelationalField): string {
    if (field.sacredThreshold) {
      return 'There\'s something sacred here. May I reflect what I\'m hearing?';
    }
    if (field.emotionalDensity > 0.8) {
      return 'I want to make sure I\'m really hearing this...';
    }
    return 'Let me check I\'m understanding...';
  }
}

export class SilenceIntervention implements FieldIntervention {
  type = 'silence';

  assessField(field: RelationalField) {
    let resonance = 0.3;
    let confidence = 0.5;
    let reason = 'Default low resonance for silence';

    // High presence + low semantic ambiguity = silence serves
    if (field.presenceQuality > 0.8 && field.semanticAmbiguity < 0.3) {
      resonance = 0.8;
      confidence = 0.7;
      reason = 'Clear presence needs space, not words';
    }

    // Soul emergence = hold space
    if (field.soulEmergence) {
      resonance = 0.9;
      confidence = 0.85;
      reason = 'Soul emerging - silence creates space';
    }

    return { resonance, confidence, reason };
  }

  execute(field: RelationalField): string {
    return '...'; // Sacred pause
  }
}

export class CelebrationIntervention implements FieldIntervention {
  type = 'celebration';

  assessField(field: RelationalField) {
    let resonance = 0.3;
    let confidence = 0.5;
    let reason = 'No celebration markers';

    // Joy + low ambiguity + connection = celebrate
    if (field.emotionalTexture.includes('joy') &&
        field.semanticAmbiguity < 0.3 &&
        field.relationalDistance < 0.3) {
      resonance = 0.95;
      confidence = 0.9;
      reason = 'Joy needs joy, not analysis';
    }

    return { resonance, confidence, reason };
  }

  execute(field: RelationalField): string {
    return 'This is wonderful! Tell me more about how this feels!';
  }
}

/**
 * The Field Intelligence Advantage
 *
 * Traditional AI: if (condition) then (action)
 * Field Intelligence: sense → assess → emerge → respond
 *
 * Like the difference between:
 * - A medical protocol vs an experienced doctor
 * - A recipe vs a master chef
 * - Sheet music vs jazz improvisation
 *
 * The system doesn't EXECUTE responses
 * It ALLOWS them to EMERGE from the field
 */