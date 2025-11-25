/**
 * QUALIA MEASUREMENT ENGINE
 *
 * Implements QRI-compatible consciousness state measurement
 * Integrates with AIN Soph's holographic field architecture
 *
 * Core capabilities:
 * - 6-dimensional consciousness mapping
 * - Symmetry Theory of Valence (STV) integration
 * - Hedonic tone tracking
 * - Phenomenological texture capture
 * - Integration with holographic field state
 *
 * @module QualiaMeasurementEngine
 * @author Soullab
 * @created 2025-10-26
 */

import type { HolographicFieldState } from '../ain/HolographicFieldState';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Complete qualia state measurement
 */
export interface QualiaState {
  // Temporal properties
  timestamp: Date;
  duration: number;  // milliseconds

  // Valence (hedonic tone) - QRI Symmetry Theory of Valence
  valence: ValenceState;

  // 6-dimensional consciousness mapping
  dimensions: ConsciousnessDimensions;

  // Phenomenological texture
  texture: PhenomenologicalTexture;

  // Symmetry metrics (QRI STV core)
  symmetry: SymmetryMetrics;

  // AIN Soph integration
  ainSophMapping: AINSophMapping;

  // Context metadata
  context: SessionContext;

  // User annotations
  description: string;
  insights: string[];
  symbols: string[];
}

/**
 * Valence state with symmetry
 */
export interface ValenceState {
  value: number;        // -1 to +1 (negative to positive affect)
  intensity: number;    // 0 to 1 (weak to strong)
  symmetry: number;     // 0 to 1 (asymmetric to symmetric) - KEY QRI METRIC
}

/**
 * 6-dimensional consciousness state
 */
export interface ConsciousnessDimensions {
  clarity: number;           // 0 to 1 (confused to crystal clear)
  energy: number;            // 0 to 1 (depleted to energized)
  connection: number;        // 0 to 1 (isolated to unified)
  expansion: number;         // 0 to 1 (contracted to expansive)
  presence: number;          // 0 to 1 (dissociated to embodied)
  flow: number;              // 0 to 1 (stuck to flowing)
}

/**
 * Phenomenological texture
 */
export interface PhenomenologicalTexture {
  sensory: QualitativeTexture[];
  emotional: EmotionalTexture[];
  cognitive: CognitiveTexture[];
  somatic: SomaticTexture[];
}

export interface QualitativeTexture {
  type: 'visual' | 'auditory' | 'kinesthetic' | 'proprioceptive' | 'interoceptive';
  quality: string;             // "shimmering", "pulsing", "flowing", etc.
  intensity: number;           // 0-1
  location?: string;           // Spatial location if applicable
}

export interface EmotionalTexture {
  emotion: string;             // "joy", "grief", "awe", etc.
  intensity: number;           // 0-1
  valence: number;             // -1 to +1
  bodyLocation?: string;       // Where felt in body
}

export interface CognitiveTexture {
  type: 'thought' | 'insight' | 'memory' | 'imagination' | 'realization';
  clarity: number;             // 0-1
  content: string;
  significance: number;        // 0-1
}

export interface SomaticTexture {
  location: string;            // Body region
  sensation: string;           // "tight", "warm", "tingling", etc.
  intensity: number;           // 0-1
  valence: number;             // -1 to +1 (unpleasant to pleasant)
}

/**
 * Symmetry metrics (QRI Symmetry Theory of Valence)
 */
export interface SymmetryMetrics {
  global: number;              // Overall symmetry (0-1)
  local: number[];             // Regional symmetries
  harmonics: number[];         // Harmonic relationships (ratios)
  fractality: number;          // Self-similarity measure (0-1)
  coherence: number;           // Internal consistency (0-1)
}

/**
 * Mapping to AIN Soph framework
 */
export interface AINSophMapping {
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  phase: 'cardinal' | 'fixed' | 'mutable';
  alchemicalStage: 'nigredo' | 'albedo' | 'citrinitas' | 'rubedo';
  sefirah?: string[];          // Active sefirot
  fieldCoherence: number;      // Alignment with collective (0-1)
}

/**
 * Session context
 */
export interface SessionContext {
  practice?: string;           // Meditation, breathwork, psychedelic, etc.
  substance?: string;          // If psychedelic research
  dose?: string;               // If applicable
  setting: string;             // Location, social context
  intention: string;           // User's intention for session
  duration: number;            // Session length in ms
  collectiveFieldState?: Partial<HolographicFieldState>;
}

/**
 * User input for qualia capture
 */
export interface QualiaInput {
  // Guided dimensional sliders (0-1 each)
  dimensions: ConsciousnessDimensions;

  // Free-form description
  freeFormDescription: string;

  // Optional structured inputs
  insights?: string[];
  symbols?: string[];
  sensoryExperience?: string;
  emotionalExperience?: string;
  cognitiveExperience?: string;
  bodyExperience?: string;

  // Optional explicit valence rating
  explicitValence?: number;    // -1 to +1

  // Context
  context: Partial<SessionContext>;
}

// ============================================================================
// QUALIA MEASUREMENT ENGINE
// ============================================================================

export class QualiaMeasurementEngine {
  private symmetryCalculator: SymmetryCalculator;
  private valenceMeasurer: ValenceMeasurer;
  private textureExtractor: TextureExtractor;
  private ainSophMapper: AINSophMapper;

  constructor() {
    this.symmetryCalculator = new SymmetryCalculator();
    this.valenceMeasurer = new ValenceMeasurer();
    this.textureExtractor = new TextureExtractor();
    this.ainSophMapper = new AINSophMapper();
  }

  /**
   * Capture complete qualia state from user input
   */
  async captureQualiaState(
    input: QualiaInput,
    userId: string,
    collectiveField?: any
  ): Promise<QualiaState> {
    const startTime = Date.now();

    // Measure valence with symmetry
    const valence = await this.valenceMeasurer.measureValence(input);

    // Extract phenomenological texture
    const texture = await this.textureExtractor.extractTexture(input);

    // Calculate symmetry metrics (QRI STV)
    const symmetry = await this.symmetryCalculator.calculateSymmetry(
      input,
      valence,
      texture
    );

    // Map to AIN Soph framework
    const ainSophMapping = await this.ainSophMapper.mapToAINSoph(
      input,
      valence,
      symmetry,
      collectiveField
    );

    const duration = Date.now() - startTime;

    return {
      timestamp: new Date(),
      duration,
      valence,
      dimensions: input.dimensions,
      texture,
      symmetry,
      ainSophMapping,
      context: {
        practice: input.context.practice,
        substance: input.context.substance,
        dose: input.context.dose,
        setting: input.context.setting || 'unspecified',
        intention: input.context.intention || '',
        duration: input.context.duration || 0,
        collectiveFieldState: collectiveField
      },
      description: input.freeFormDescription,
      insights: input.insights || [],
      symbols: input.symbols || []
    };
  }

  /**
   * Quick check-in (simplified capture)
   */
  async quickCheckIn(
    dimensions: ConsciousnessDimensions,
    userId: string
  ): Promise<QualiaState> {
    const simpleInput: QualiaInput = {
      dimensions,
      freeFormDescription: '',
      context: {
        practice: 'daily_checkin',
        setting: 'quick_capture',
        intention: 'track_state',
        duration: 0
      }
    };

    return this.captureQualiaState(simpleInput, userId);
  }

  /**
   * Analyze evolution over time
   */
  analyzeEvolution(states: QualiaState[]): EvolutionAnalysis {
    if (states.length < 2) {
      throw new Error('Need at least 2 states to analyze evolution');
    }

    // Sort by timestamp
    const sortedStates = [...states].sort((a, b) =>
      a.timestamp.getTime() - b.timestamp.getTime()
    );

    return {
      timeSpan: {
        start: sortedStates[0].timestamp,
        end: sortedStates[sortedStates.length - 1].timestamp,
        totalDays: this.daysBetween(
          sortedStates[0].timestamp,
          sortedStates[sortedStates.length - 1].timestamp
        )
      },
      dimensionalTrends: this.analyzeDimensionalTrends(sortedStates),
      valenceTrend: this.analyzeValenceTrend(sortedStates),
      symmetryTrend: this.analyzeSymmetryTrend(sortedStates),
      alchemicalProgression: this.analyzeAlchemicalProgression(sortedStates),
      fieldIntegration: this.analyzeFieldIntegration(sortedStates),
      insights: this.generateInsights(sortedStates)
    };
  }

  // ========================================================================
  // PRIVATE HELPER METHODS
  // ========================================================================

  private daysBetween(start: Date, end: Date): number {
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  }

  private analyzeDimensionalTrends(states: QualiaState[]): DimensionalTrends {
    const dimensions: (keyof ConsciousnessDimensions)[] = [
      'clarity', 'energy', 'connection', 'expansion', 'presence', 'flow'
    ];

    const trends: any = {};

    dimensions.forEach(dim => {
      const values = states.map(s => s.dimensions[dim]);
      trends[dim] = {
        initial: values[0],
        final: values[values.length - 1],
        change: values[values.length - 1] - values[0],
        mean: values.reduce((a, b) => a + b, 0) / values.length,
        trend: this.calculateTrend(values)
      };
    });

    return trends;
  }

  private analyzeValenceTrend(states: QualiaState[]): ValenceTrend {
    const values = states.map(s => s.valence.value);
    const symmetries = states.map(s => s.valence.symmetry);

    return {
      initial: values[0],
      final: values[values.length - 1],
      change: values[values.length - 1] - values[0],
      mean: values.reduce((a, b) => a + b, 0) / values.length,
      symmetryCorrelation: this.correlation(values, symmetries),
      stvValidation: this.validateSTV(values, symmetries)
    };
  }

  private analyzeSymmetryTrend(states: QualiaState[]): SymmetryTrend {
    const globalSymmetries = states.map(s => s.symmetry.global);

    return {
      initial: globalSymmetries[0],
      final: globalSymmetries[globalSymmetries.length - 1],
      change: globalSymmetries[globalSymmetries.length - 1] - globalSymmetries[0],
      mean: globalSymmetries.reduce((a, b) => a + b, 0) / globalSymmetries.length,
      trend: this.calculateTrend(globalSymmetries)
    };
  }

  private analyzeAlchemicalProgression(states: QualiaState[]): AlchemicalProgress {
    const stages = states.map(s => s.ainSophMapping.alchemicalStage);
    const stageOrder = ['nigredo', 'albedo', 'citrinitas', 'rubedo'];

    const progressions = stages.map((stage, i) => {
      if (i === 0) return 0;
      const prevIndex = stageOrder.indexOf(stages[i - 1]);
      const currIndex = stageOrder.indexOf(stage);
      return currIndex - prevIndex;
    });

    return {
      currentStage: stages[stages.length - 1],
      stageChanges: progressions.filter(p => p !== 0).length,
      overallProgression: this.sum(progressions),
      timeInStages: this.timeInEachStage(states)
    };
  }

  private analyzeFieldIntegration(states: QualiaState[]): FieldIntegrationAnalysis {
    const coherences = states.map(s => s.ainSophMapping.fieldCoherence);

    return {
      initialCoherence: coherences[0],
      finalCoherence: coherences[coherences.length - 1],
      meanCoherence: coherences.reduce((a, b) => a + b, 0) / coherences.length,
      trend: this.calculateTrend(coherences)
    };
  }

  private generateInsights(states: QualiaState[]): string[] {
    const insights: string[] = [];

    // Dimensional insights
    const dimTrends = this.analyzeDimensionalTrends(states);
    Object.entries(dimTrends).forEach(([dim, trend]: [string, any]) => {
      if (trend.change > 0.2) {
        insights.push(`Significant increase in ${dim} (+${(trend.change * 100).toFixed(0)}%)`);
      } else if (trend.change < -0.2) {
        insights.push(`Notable decrease in ${dim} (${(trend.change * 100).toFixed(0)}%)`);
      }
    });

    // Valence insights
    const valenceTrend = this.analyzeValenceTrend(states);
    if (valenceTrend.symmetryCorrelation > 0.7) {
      insights.push(`Strong STV validation: symmetry predicts valence (r=${valenceTrend.symmetryCorrelation.toFixed(2)})`);
    }

    // Alchemical insights
    const alchemical = this.analyzeAlchemicalProgression(states);
    if (alchemical.overallProgression > 0) {
      insights.push(`Alchemical progression detected: ${alchemical.stageChanges} stage transitions`);
    }

    // Field insights
    const field = this.analyzeFieldIntegration(states);
    if (field.trend === 'increasing') {
      insights.push(`Increasing field integration (coherence +${((field.finalCoherence - field.initialCoherence) * 100).toFixed(0)}%)`);
    }

    return insights;
  }

  private calculateTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 2) return 'stable';

    const slope = this.linearRegression(values).slope;

    if (slope > 0.01) return 'increasing';
    if (slope < -0.01) return 'decreasing';
    return 'stable';
  }

  private linearRegression(values: number[]): { slope: number; intercept: number } {
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = values;

    const sumX = this.sum(x);
    const sumY = this.sum(y);
    const sumXY = this.sum(x.map((xi, i) => xi * y[i]));
    const sumX2 = this.sum(x.map(xi => xi * xi));

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }

  private correlation(x: number[], y: number[]): number {
    if (x.length !== y.length) throw new Error('Arrays must have same length');

    const n = x.length;
    const meanX = this.sum(x) / n;
    const meanY = this.sum(y) / n;

    const numerator = this.sum(x.map((xi, i) => (xi - meanX) * (y[i] - meanY)));
    const denomX = Math.sqrt(this.sum(x.map(xi => Math.pow(xi - meanX, 2))));
    const denomY = Math.sqrt(this.sum(y.map(yi => Math.pow(yi - meanY, 2))));

    return numerator / (denomX * denomY);
  }

  private validateSTV(valences: number[], symmetries: number[]): STVValidation {
    const correlation = this.correlation(valences, symmetries);
    const rSquared = correlation * correlation;

    return {
      correlation,
      rSquared,
      pValue: this.calculatePValue(correlation, valences.length),
      validated: correlation > 0.5 && this.calculatePValue(correlation, valences.length) < 0.05
    };
  }

  private calculatePValue(r: number, n: number): number {
    // Simplified p-value calculation
    // In production, use proper statistical library
    const t = r * Math.sqrt((n - 2) / (1 - r * r));
    // This is a rough approximation
    return Math.max(0.001, Math.min(0.999, 1 - Math.abs(t) / 10));
  }

  private sum(arr: number[]): number {
    return arr.reduce((a, b) => a + b, 0);
  }

  private timeInEachStage(states: QualiaState[]): Record<string, number> {
    const timeInStage: Record<string, number> = {
      nigredo: 0,
      albedo: 0,
      citrinitas: 0,
      rubedo: 0
    };

    for (let i = 0; i < states.length - 1; i++) {
      const stage = states[i].ainSophMapping.alchemicalStage;
      const timeDiff = states[i + 1].timestamp.getTime() - states[i].timestamp.getTime();
      timeInStage[stage] += timeDiff;
    }

    return timeInStage;
  }
}

// ============================================================================
// SUPPORTING CLASSES
// ============================================================================

/**
 * Symmetry Calculator (QRI STV Implementation)
 */
class SymmetryCalculator {
  async calculateSymmetry(
    input: QualiaInput,
    valence: ValenceState,
    texture: PhenomenologicalTexture
  ): Promise<SymmetryMetrics> {
    // Calculate global symmetry from multiple sources
    const linguisticSymmetry = this.analyzeLinguisticSymmetry(input.freeFormDescription);
    const dimensionalSymmetry = this.analyzeDimensionalBalance(input.dimensions);
    const textureSymmetry = this.analyzeTextureSymmetry(texture);

    const globalSymmetry = (linguisticSymmetry + dimensionalSymmetry + textureSymmetry) / 3;

    // Calculate local symmetries (by region/aspect)
    const localSymmetries = [
      linguisticSymmetry,
      dimensionalSymmetry,
      textureSymmetry
    ];

    // Detect harmonic relationships
    const harmonics = this.detectHarmonics(input.dimensions);

    // Measure fractality (self-similarity)
    const fractality = this.measureFractality(input);

    // Calculate coherence
    const coherence = this.calculateCoherence(localSymmetries);

    return {
      global: globalSymmetry,
      local: localSymmetries,
      harmonics,
      fractality,
      coherence
    };
  }

  private analyzeLinguisticSymmetry(text: string): number {
    if (!text || text.length < 10) return 0.5;

    // Analyze linguistic patterns for symmetry
    // Higher symmetry = more balanced, harmonic language
    // Lower symmetry = more chaotic, fragmented language

    const words = text.toLowerCase().split(/\s+/);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

    // Word length variance (lower = more symmetric)
    const wordLengths = words.map(w => w.length);
    const wordLengthVariance = this.variance(wordLengths);
    const wordSymmetry = 1 - Math.min(1, wordLengthVariance / 10);

    // Sentence length variance
    const sentenceLengths = sentences.map(s => s.trim().split(/\s+/).length);
    const sentenceVariance = this.variance(sentenceLengths);
    const sentenceSymmetry = 1 - Math.min(1, sentenceVariance / 20);

    // Emotional balance (positive vs negative words)
    const positiveWords = this.countPositiveWords(words);
    const negativeWords = this.countNegativeWords(words);
    const emotionalBalance = 1 - Math.abs(positiveWords - negativeWords) / words.length;

    return (wordSymmetry + sentenceSymmetry + emotionalBalance) / 3;
  }

  private analyzeDimensionalBalance(dimensions: ConsciousnessDimensions): number {
    // Perfect symmetry = all dimensions equal
    // Lower symmetry = high variance between dimensions

    const values = Object.values(dimensions);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;

    return 1 - Math.min(1, variance * 2);
  }

  private analyzeTextureSymmetry(texture: PhenomenologicalTexture): number {
    // Analyze balance across sensory/emotional/cognitive/somatic

    const sensorCount = texture.sensory.length;
    const emotCount = texture.emotional.length;
    const cogCount = texture.cognitive.length;
    const somCount = texture.somatic.length;

    const counts = [sensorCount, emotCount, cogCount, somCount];
    const totalCount = this.sum(counts);

    if (totalCount === 0) return 0.5;

    // Perfect symmetry = equal across all types
    const mean = totalCount / 4;
    const variance = counts.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / 4;

    return 1 - Math.min(1, variance / (mean + 1));
  }

  private detectHarmonics(dimensions: ConsciousnessDimensions): number[] {
    // Detect harmonic relationships between dimensions
    // Common harmonics: 1/2, 2/3, 3/4, 4/5, etc.

    const values = Object.values(dimensions);
    const harmonics: number[] = [];

    for (let i = 0; i < values.length; i++) {
      for (let j = i + 1; j < values.length; j++) {
        if (values[j] !== 0) {
          harmonics.push(values[i] / values[j]);
        }
      }
    }

    return harmonics;
  }

  private measureFractality(input: QualiaInput): number {
    // Measure self-similarity at different scales

    const text = input.freeFormDescription;
    if (!text || text.length < 20) return 0.5;

    // Simple fractality: similarity between sentence structures
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length < 2) return 0.5;

    // Compare structure similarity
    let similarities = 0;
    for (let i = 0; i < sentences.length - 1; i++) {
      const sim = this.sentenceSimilarity(sentences[i], sentences[i + 1]);
      similarities += sim;
    }

    return similarities / (sentences.length - 1);
  }

  private calculateCoherence(localSymmetries: number[]): number {
    // How consistent are the local symmetries?
    const mean = this.sum(localSymmetries) / localSymmetries.length;
    const variance = localSymmetries.reduce((sum, s) =>
      sum + Math.pow(s - mean, 2), 0
    ) / localSymmetries.length;

    return 1 - Math.min(1, variance);
  }

  // Helper methods
  private variance(values: number[]): number {
    const mean = this.sum(values) / values.length;
    return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  }

  private sum(arr: number[]): number {
    return arr.reduce((a, b) => a + b, 0);
  }

  private countPositiveWords(words: string[]): number {
    const positiveWords = ['happy', 'joy', 'peace', 'love', 'beautiful', 'amazing', 'wonderful', 'good', 'great', 'excellent', 'clear', 'bright', 'free', 'open'];
    return words.filter(w => positiveWords.includes(w)).length;
  }

  private countNegativeWords(words: string[]): number {
    const negativeWords = ['sad', 'pain', 'suffering', 'dark', 'difficult', 'hard', 'struggle', 'bad', 'awful', 'terrible', 'confused', 'stuck', 'trapped'];
    return words.filter(w => negativeWords.includes(w)).length;
  }

  private sentenceSimilarity(s1: string, s2: string): number {
    const words1 = new Set(s1.toLowerCase().split(/\s+/));
    const words2 = new Set(s2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }
}

/**
 * Valence Measurer
 */
class ValenceMeasurer {
  async measureValence(input: QualiaInput): Promise<ValenceState> {
    // Use explicit valence if provided
    if (input.explicitValence !== undefined) {
      const symmetry = await this.estimateSymmetry(input);
      return {
        value: input.explicitValence,
        intensity: this.measureIntensity(input),
        symmetry
      };
    }

    // Otherwise infer from description and dimensions
    const inferredValence = this.inferValence(input);
    const intensity = this.measureIntensity(input);
    const symmetry = await this.estimateSymmetry(input);

    return {
      value: inferredValence,
      intensity,
      symmetry
    };
  }

  private inferValence(input: QualiaInput): number {
    const text = input.freeFormDescription.toLowerCase();
    const dims = input.dimensions;

    // Sentiment analysis from text
    const textValence = this.textSentiment(text);

    // Dimensional contribution
    const dimValence = (dims.clarity + dims.energy + dims.connection +
                        dims.expansion + dims.presence + dims.flow) / 6;
    const dimContribution = (dimValence - 0.5) * 2; // Scale to -1 to +1

    // Weight both sources
    return (textValence * 0.4 + dimContribution * 0.6);
  }

  private textSentiment(text: string): number {
    // Simple sentiment analysis
    const positiveWords = ['happy', 'joy', 'peace', 'love', 'beautiful', 'amazing', 'wonderful', 'good', 'great', 'clear', 'free', 'light', 'open', 'flow'];
    const negativeWords = ['sad', 'pain', 'suffering', 'dark', 'difficult', 'hard', 'struggle', 'bad', 'awful', 'confused', 'stuck', 'heavy', 'trapped'];

    const words = text.split(/\s+/);
    let score = 0;

    words.forEach(word => {
      if (positiveWords.includes(word)) score += 1;
      if (negativeWords.includes(word)) score -= 1;
    });

    return Math.max(-1, Math.min(1, score / (words.length / 10)));
  }

  private measureIntensity(input: QualiaInput): number {
    const text = input.freeFormDescription;

    // Intensity from text length and punctuation
    const exclamations = (text.match(/!/g) || []).length;
    const allCaps = (text.match(/[A-Z]{3,}/g) || []).length;
    const textIntensity = Math.min(1, (exclamations * 0.2 + allCaps * 0.1));

    // Intensity from dimensions
    const dimValues = Object.values(input.dimensions);
    const dimIntensity = Math.max(...dimValues);

    return Math.max(textIntensity, dimIntensity);
  }

  private async estimateSymmetry(input: QualiaInput): number {
    // Estimate symmetry from dimensional balance
    const dims = Object.values(input.dimensions);
    const mean = dims.reduce((a, b) => a + b, 0) / dims.length;
    const variance = dims.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / dims.length;

    return 1 - Math.min(1, variance * 2);
  }
}

/**
 * Texture Extractor
 */
class TextureExtractor {
  async extractTexture(input: QualiaInput): Promise<PhenomenologicalTexture> {
    return {
      sensory: this.extractSensory(input),
      emotional: this.extractEmotional(input),
      cognitive: this.extractCognitive(input),
      somatic: this.extractSomatic(input)
    };
  }

  private extractSensory(input: QualiaInput): QualitativeTexture[] {
    if (!input.sensoryExperience) return [];

    const text = input.sensoryExperience.toLowerCase();
    const textures: QualitativeTexture[] = [];

    // Visual
    if (/visual|see|light|color|bright|pattern/i.test(text)) {
      textures.push({
        type: 'visual',
        quality: this.extractQuality(text, ['shimmering', 'pulsing', 'geometric', 'fractal']),
        intensity: 0.7
      });
    }

    // Auditory
    if (/sound|hear|music|tone|frequency/i.test(text)) {
      textures.push({
        type: 'auditory',
        quality: this.extractQuality(text, ['harmonic', 'resonant', 'melodic', 'rhythmic']),
        intensity: 0.6
      });
    }

    return textures;
  }

  private extractEmotional(input: QualiaInput): EmotionalTexture[] {
    if (!input.emotionalExperience) return [];

    const text = input.emotionalExperience;
    const emotions: EmotionalTexture[] = [];

    // Common emotions
    const emotionPatterns = {
      joy: /joy|happy|delight|bliss/i,
      peace: /peace|calm|serene|tranquil/i,
      love: /love|compassion|warmth|tenderness/i,
      grief: /grief|sad|sorrow|loss/i,
      fear: /fear|afraid|anxious|scared/i,
      anger: /anger|rage|fury|frustration/i
    };

    Object.entries(emotionPatterns).forEach(([emotion, pattern]) => {
      if (pattern.test(text)) {
        emotions.push({
          emotion,
          intensity: 0.7,
          valence: this.emotionValence(emotion),
          bodyLocation: this.detectBodyLocation(text)
        });
      }
    });

    return emotions;
  }

  private extractCognitive(input: QualiaInput): CognitiveTexture[] {
    if (!input.cognitiveExperience) return [];

    const text = input.cognitiveExperience;
    const cognitive: CognitiveTexture[] = [];

    if (/insight|reali[zs]ation|understand|clarity/i.test(text)) {
      cognitive.push({
        type: 'insight',
        clarity: 0.8,
        content: text.substring(0, 200),
        significance: 0.7
      });
    }

    return cognitive;
  }

  private extractSomatic(input: QualiaInput): SomaticTexture[] {
    if (!input.bodyExperience) return [];

    const text = input.bodyExperience.toLowerCase();
    const somatic: SomaticTexture[] = [];

    const bodyRegions = ['chest', 'heart', 'stomach', 'throat', 'head', 'shoulders', 'back'];
    const sensations = ['tight', 'warm', 'tingling', 'heavy', 'light', 'expansive', 'contracted'];

    bodyRegions.forEach(region => {
      if (text.includes(region)) {
        const sensation = sensations.find(s => text.includes(s)) || 'sensation';
        somatic.push({
          location: region,
          sensation,
          intensity: 0.6,
          valence: this.sensationValence(sensation)
        });
      }
    });

    return somatic;
  }

  private extractQuality(text: string, qualities: string[]): string {
    return qualities.find(q => text.includes(q)) || qualities[0];
  }

  private emotionValence(emotion: string): number {
    const valences: Record<string, number> = {
      joy: 0.8,
      peace: 0.6,
      love: 0.9,
      grief: -0.6,
      fear: -0.7,
      anger: -0.5
    };
    return valences[emotion] || 0;
  }

  private sensationValence(sensation: string): number {
    const valences: Record<string, number> = {
      warm: 0.5,
      light: 0.6,
      expansive: 0.7,
      tight: -0.4,
      heavy: -0.3,
      contracted: -0.5
    };
    return valences[sensation] || 0;
  }

  private detectBodyLocation(text: string): string | undefined {
    const locations = ['chest', 'heart', 'stomach', 'throat', 'head', 'shoulders'];
    return locations.find(loc => text.toLowerCase().includes(loc));
  }
}

/**
 * AIN Soph Mapper
 */
class AINSophMapper {
  async mapToAINSoph(
    input: QualiaInput,
    valence: ValenceState,
    symmetry: SymmetryMetrics,
    collectiveField?: any
  ): Promise<AINSophMapping> {
    const element = this.detectElement(input, valence);
    const phase = this.detectPhase(valence, symmetry);
    const alchemicalStage = this.detectAlchemicalStage(valence, symmetry);
    const sefirah = this.detectSefirot(input, valence);
    const fieldCoherence = this.calculateFieldCoherence(symmetry, collectiveField);

    return {
      element,
      phase,
      alchemicalStage,
      sefirah,
      fieldCoherence
    };
  }

  private detectElement(input: QualiaInput, valence: ValenceState): AINSophMapping['element'] {
    const dims = input.dimensions;

    // Fire: High energy, expansion, transformation
    const fireScore = dims.energy * 0.4 + dims.expansion * 0.3 + valence.intensity * 0.3;

    // Water: High connection, flow, emotional depth
    const waterScore = dims.connection * 0.4 + dims.flow * 0.4 + (Math.abs(valence.value) * 0.2);

    // Earth: High presence, low energy, grounded
    const earthScore = dims.presence * 0.5 + (1 - dims.energy) * 0.3 + dims.clarity * 0.2;

    // Air: High clarity, thought-oriented
    const airScore = dims.clarity * 0.6 + dims.expansion * 0.2 + dims.flow * 0.2;

    // Aether: High symmetry, unity, transcendence
    const aetherScore = symmetry.global * 0.5 + dims.connection * 0.3 + valence.symmetry * 0.2;

    const scores = { fire: fireScore, water: waterScore, earth: earthScore, air: airScore, aether: aetherScore };
    const dominant = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b)[0] as AINSophMapping['element'];

    return dominant;
  }

  private detectPhase(valence: ValenceState, symmetry: SymmetryMetrics): AINSophMapping['phase'] {
    // Cardinal: Initiation, activation
    // Fixed: Consolidation, stability
    // Mutable: Transformation, flux

    if (valence.intensity > 0.7 && symmetry.coherence < 0.5) {
      return 'cardinal'; // High intensity, low coherence = initiating
    } else if (symmetry.coherence > 0.7 && valence.value > 0.5) {
      return 'fixed'; // High coherence, positive = stable
    } else {
      return 'mutable'; // Transformation, change
    }
  }

  private detectAlchemicalStage(
    valence: ValenceState,
    symmetry: SymmetryMetrics
  ): AINSophMapping['alchemicalStage'] {
    // Nigredo: Low symmetry, negative valence, decomposition
    if (symmetry.global < 0.4 && valence.value < 0) {
      return 'nigredo';
    }

    // Albedo: Medium-high symmetry, neutral to positive valence, clarity
    if (symmetry.global > 0.6 && symmetry.global < 0.8 && valence.value >= 0) {
      return 'albedo';
    }

    // Citrinitas: High symmetry, positive valence, embodiment
    if (symmetry.global > 0.75 && valence.value > 0.5) {
      return 'citrinitas';
    }

    // Rubedo: Very high symmetry, high positive valence, integration
    if (symmetry.global > 0.85 && valence.value > 0.7) {
      return 'rubedo';
    }

    // Default to nigredo if unclear
    return 'nigredo';
  }

  private detectSefirot(input: QualiaInput, valence: ValenceState): string[] {
    const active: string[] = [];
    const dims = input.dimensions;

    if (dims.clarity > 0.7) active.push('Binah'); // Understanding
    if (dims.energy > 0.7) active.push('Geburah'); // Strength
    if (dims.connection > 0.7) active.push('Chesed'); // Mercy
    if (dims.expansion > 0.7) active.push('Chokmah'); // Wisdom
    if (dims.presence > 0.7) active.push('Malkuth'); // Kingdom
    if (dims.flow > 0.7) active.push('Yesod'); // Foundation
    if (valence.symmetry > 0.8) active.push('Tiferet'); // Beauty

    return active;
  }

  private calculateFieldCoherence(symmetry: SymmetryMetrics, collectiveField?: any): number {
    if (!collectiveField) return symmetry.global;

    // If collective field state available, calculate resonance
    const personalSymmetry = symmetry.global;
    const collectiveSymmetry = collectiveField.coherence || 0.5;

    // Coherence = how aligned personal symmetry is with collective
    return 1 - Math.abs(personalSymmetry - collectiveSymmetry);
  }
}

// ============================================================================
// ANALYSIS RESULT INTERFACES
// ============================================================================

export interface EvolutionAnalysis {
  timeSpan: {
    start: Date;
    end: Date;
    totalDays: number;
  };
  dimensionalTrends: DimensionalTrends;
  valenceTrend: ValenceTrend;
  symmetryTrend: SymmetryTrend;
  alchemicalProgression: AlchemicalProgress;
  fieldIntegration: FieldIntegrationAnalysis;
  insights: string[];
}

export interface DimensionalTrends {
  [key: string]: {
    initial: number;
    final: number;
    change: number;
    mean: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
}

export interface ValenceTrend {
  initial: number;
  final: number;
  change: number;
  mean: number;
  symmetryCorrelation: number;
  stvValidation: STVValidation;
}

export interface STVValidation {
  correlation: number;
  rSquared: number;
  pValue: number;
  validated: boolean;
}

export interface SymmetryTrend {
  initial: number;
  final: number;
  change: number;
  mean: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface AlchemicalProgress {
  currentStage: string;
  stageChanges: number;
  overallProgression: number;
  timeInStages: Record<string, number>;
}

export interface FieldIntegrationAnalysis {
  initialCoherence: number;
  finalCoherence: number;
  meanCoherence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

// ============================================================================
// EXPORT
// ============================================================================

export default QualiaMeasurementEngine;
