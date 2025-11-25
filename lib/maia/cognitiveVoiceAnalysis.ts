import { JournalEntry } from './state';
import { VoiceMetrics, analyzeVoiceMetrics } from './voicePatterns';

// Import the dormant cognitive architectures
import { LIDAWorkspace, PerceptualCue } from '../cognitive-engines/lida-workspace';
import { SOARPlanner, WisdomGoal } from '../cognitive-engines/soar-planner';
import { ACTRMemory, MemoryElement } from '../cognitive-engines/actr-memory';
import { MicroPsiCore, EmotionalState } from '../cognitive-engines/micropsi-core';

// TODO: Restore when elemental agents are implemented
// Import elemental agents
// import { FireAgent } from '../elemental-agents/FireAgent';
// import { WaterAgent } from '../elemental-agents/WaterAgent';
// import { EarthAgent } from '../elemental-agents/EarthAgent';
// import { AirAgent } from '../elemental-agents/AirAgent';
// import { AetherAgent } from '../elemental-agents/AetherAgent';

export interface CognitiveVoiceAnalysis {
  // Basic voice patterns
  voiceMetrics: VoiceMetrics;

  // Layer 1: Consciousness Intelligence Analysis
  lidaAnalysis: {
    perceptualCues: PerceptualCue[];
    attentionFocus: string;
    consciousBroadcast: string[];
    awarenessMode: 'narrow' | 'broad' | 'diffuse';
  };

  soarAnalysis: {
    detectedGoals: WisdomGoal[];
    activeOperators: string[];
    recommendedWisdom: string;
    ritualGuidance?: string;
  };

  actrAnalysis: {
    activatedMemories: MemoryElement[];
    learningEvent?: 'success' | 'failure' | 'partial';
    experiencePatterns: string[];
    consciousnessEvolution: number;
  };

  microPsiAnalysis: {
    primaryEmotion: string;
    emotionalIntensity: number;
    motivationalDrives: string[];
    archetypalResonance: string[];
    healingNeeds: string[];
    consciousnessLevel: number;
  };

  // Layer 2: Elemental Routing Analysis
  elementalResonance: {
    fire: { activation: number; patterns: string[] };
    water: { activation: number; patterns: string[] };
    earth: { activation: number; patterns: string[] };
    air: { activation: number; patterns: string[] };
    aether: { activation: number; patterns: string[] };
    dominant: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  };

  // Integrated clinical insights
  clinicalInsights: {
    coherenceProfile: string;
    developmentalStage: string;
    integrationReadiness: number;
    recommendedApproach: string;
    consciousnessMarkers: string[];
  };
}

export class CognitiveVoiceProcessor {
  private lida: LIDAWorkspace;
  private soar: SOARPlanner;
  private actr: ACTRMemory;
  private microPsi: MicroPsiCore;

  // TODO: Restore when elemental agents are implemented
  // private fireAgent: FireAgent;
  // private waterAgent: WaterAgent;
  // private earthAgent: EarthAgent;
  // private airAgent: AirAgent;
  // private aetherAgent: AetherAgent;

  constructor() {
    // Initialize cognitive architectures
    this.lida = new LIDAWorkspace();
    this.soar = new SOARPlanner();
    this.actr = new ACTRMemory();
    this.microPsi = new MicroPsiCore();

    // TODO: Restore when elemental agents are implemented
    // Initialize elemental agents
    // this.fireAgent = new FireAgent();
    // this.waterAgent = new WaterAgent();
    // this.earthAgent = new EarthAgent();
    // this.airAgent = new AirAgent();
    // this.aetherAgent = new AetherAgent();
  }

  public async analyzeCognitiveVoicePatterns(
    words: Array<{ word: string; start: number; end: number }>,
    duration: number,
    transcript: string,
    segments?: Array<{ start: number; end: number; text: string }>,
    voiceHistory?: JournalEntry[]
  ): Promise<CognitiveVoiceAnalysis> {

    // Step 1: Basic voice metrics
    const voiceMetrics = analyzeVoiceMetrics(words, duration, segments);

    // Step 2: Layer 1 - Consciousness Intelligence Analysis

    // LIDA: Attention and conscious workspace processing
    const perceptualCues = this.extractPerceptualCues(transcript, voiceMetrics);
    const lidaResult = this.lida.processPerception(perceptualCues);

    // SOAR: Goal detection and wisdom planning
    const detectedGoals = this.extractWisdomGoals(transcript, voiceMetrics, lidaResult);
    const soarResult = this.soar.planWisdomResponse(detectedGoals, {
      consciousnessLevel: this.estimateConsciousnessLevel(voiceMetrics, transcript),
      elementalBalance: this.estimateElementalBalance(transcript, voiceMetrics)
    });

    // ACT-R: Memory activation and learning
    const memoryContext = {
      transcript,
      voiceMetrics,
      voiceHistory: voiceHistory || [],
      consciousness: lidaResult.awarenessLevel
    };
    const actrResult = this.actr.processVoiceExperience(memoryContext);

    // MicroPsi: Emotional and motivational processing
    const emotionalContext = {
      transcript,
      voiceMetrics,
      pausePatterns: this.analyzePauseEmotions(words),
      prosodyShifts: this.analyzeProsodyEmotions(segments || [])
    };
    const microPsiResult = this.microPsi.processEmotionalVoice(emotionalContext);

    // Step 3: Layer 2 - Elemental Agent Analysis
    const elementalAnalysis = await this.processElementalResonance(
      transcript,
      voiceMetrics,
      microPsiResult,
      lidaResult
    );

    // Step 4: Clinical Integration
    const clinicalInsights = this.synthesizeClinicalInsights({
      lidaResult,
      soarResult,
      actrResult,
      microPsiResult,
      elementalAnalysis,
      voiceMetrics
    });

    return {
      voiceMetrics,
      lidaAnalysis: {
        perceptualCues,
        attentionFocus: lidaResult.attentionFocus,
        consciousBroadcast: lidaResult.consciousBroadcast,
        awarenessMode: lidaResult.awarenessMode
      },
      soarAnalysis: {
        detectedGoals: soarResult.goals,
        activeOperators: soarResult.activeOperators,
        recommendedWisdom: soarResult.wisdomGuidance,
        ritualGuidance: soarResult.ritualGuidance
      },
      actrAnalysis: {
        activatedMemories: actrResult.activatedMemories,
        learningEvent: actrResult.learningEvent,
        experiencePatterns: actrResult.patterns,
        consciousnessEvolution: actrResult.consciousnessGrowth
      },
      microPsiAnalysis: {
        primaryEmotion: microPsiResult.primaryEmotion,
        emotionalIntensity: microPsiResult.intensity,
        motivationalDrives: microPsiResult.activeDrives,
        archetypalResonance: microPsiResult.archetypes,
        healingNeeds: microPsiResult.healingNeeds,
        consciousnessLevel: microPsiResult.consciousnessLevel
      },
      elementalResonance: elementalAnalysis,
      clinicalInsights
    };
  }

  private extractPerceptualCues(transcript: string, metrics: VoiceMetrics): PerceptualCue[] {
    const cues: PerceptualCue[] = [];

    // Voice-based perceptual cues
    cues.push({
      content: `Speech rate: ${Math.round(metrics.speechRate)} WPM`,
      intensity: this.normalizeMetric(metrics.speechRate, 120, 180),
      type: 'cognitive'
    });

    cues.push({
      content: `Emotional intensity: ${(metrics.emotionalIntensity * 100).toFixed(0)}%`,
      intensity: metrics.emotionalIntensity,
      type: 'emotional'
    });

    cues.push({
      content: `Breathing pattern: ${metrics.breathPattern}`,
      intensity: metrics.breathPattern === 'deep' ? 0.8 : metrics.breathPattern === 'shallow' ? 0.3 : 0.5,
      type: 'somatic'
    });

    cues.push({
      content: `Voice coherence: ${(metrics.coherence * 100).toFixed(0)}%`,
      intensity: metrics.coherence,
      type: 'cognitive'
    });

    // Content-based perceptual cues
    const emotionalWords = this.detectEmotionalContent(transcript);
    if (emotionalWords.length > 0) {
      cues.push({
        content: `Emotional content: ${emotionalWords.join(', ')}`,
        intensity: Math.min(emotionalWords.length / 5, 1),
        type: 'emotional'
      });
    }

    return cues;
  }

  private extractWisdomGoals(transcript: string, metrics: VoiceMetrics, lidaResult: any): WisdomGoal[] {
    const goals: WisdomGoal[] = [];

    // Coherence-based goals
    if (metrics.coherence < 0.4) {
      goals.push({
        type: 'clarity',
        urgency: 1 - metrics.coherence,
        description: 'Voice patterns suggest need for mental clarity and grounding'
      });
    }

    // Energy-based goals
    if (metrics.energyLevel === 'low') {
      goals.push({
        type: 'vitality',
        urgency: 0.7,
        description: 'Voice energy suggests need for revitalization and inspiration'
      });
    } else if (metrics.energyLevel === 'breakthrough') {
      goals.push({
        type: 'integration',
        urgency: 0.9,
        description: 'Breakthrough energy detected - integration support needed'
      });
    }

    // Breathing-based goals
    if (metrics.breathPattern === 'shallow' || metrics.breathPattern === 'irregular') {
      goals.push({
        type: 'grounding',
        urgency: 0.6,
        description: 'Breathing patterns suggest need for somatic grounding'
      });
    }

    // Emotional intensity goals
    if (metrics.emotionalIntensity > 0.7) {
      goals.push({
        type: 'emotional_regulation',
        urgency: metrics.emotionalIntensity,
        description: 'High emotional intensity detected - emotional support needed'
      });
    }

    return goals;
  }

  private async processElementalResonance(
    transcript: string,
    metrics: VoiceMetrics,
    emotionalState: any,
    attentionState: any
  ) {
    const fireActivation = this.calculateFireResonance(transcript, metrics, emotionalState);
    const waterActivation = this.calculateWaterResonance(transcript, metrics, emotionalState);
    const earthActivation = this.calculateEarthResonance(transcript, metrics);
    const airActivation = this.calculateAirResonance(transcript, metrics, attentionState);
    const aetherActivation = this.calculateAetherResonance(transcript, metrics, emotionalState);

    const activations = {
      fire: fireActivation,
      water: waterActivation,
      earth: earthActivation,
      air: airActivation,
      aether: aetherActivation
    };

    const dominant = Object.entries(activations).reduce((a, b) =>
      activations[a[0]] > activations[b[0]] ? a : b
    )[0] as 'fire' | 'water' | 'earth' | 'air' | 'aether';

    return {
      fire: { activation: fireActivation, patterns: this.getFirePatterns(transcript, metrics) },
      water: { activation: waterActivation, patterns: this.getWaterPatterns(transcript, metrics) },
      earth: { activation: earthActivation, patterns: this.getEarthPatterns(transcript, metrics) },
      air: { activation: airActivation, patterns: this.getAirPatterns(transcript, metrics) },
      aether: { activation: aetherActivation, patterns: this.getAetherPatterns(transcript, metrics) },
      dominant
    };
  }

  private synthesizeClinicalInsights(data: any) {
    const coherenceLevel = data.voiceMetrics.coherence;
    const emotionalIntensity = data.microPsiResult.intensity;
    const consciousnessLevel = data.microPsiResult.consciousnessLevel;

    let coherenceProfile = 'integrated';
    if (coherenceLevel < 0.3) coherenceProfile = 'fragmented';
    else if (coherenceLevel < 0.6) coherenceProfile = 'emerging';

    let developmentalStage = 'integration';
    if (consciousnessLevel < 0.3) developmentalStage = 'initiation';
    else if (consciousnessLevel < 0.6) developmentalStage = 'exploration';

    const integrationReadiness = (coherenceLevel + consciousnessLevel) / 2;

    let recommendedApproach = 'witness and reflect';
    if (emotionalIntensity > 0.7) recommendedApproach = 'emotional regulation first';
    else if (coherenceLevel < 0.4) recommendedApproach = 'grounding and stabilization';
    else if (data.microPsiResult.healingNeeds.length > 0) recommendedApproach = 'targeted healing work';

    return {
      coherenceProfile,
      developmentalStage,
      integrationReadiness,
      recommendedApproach,
      consciousnessMarkers: [
        `Coherence: ${(coherenceLevel * 100).toFixed(0)}%`,
        `Integration readiness: ${(integrationReadiness * 100).toFixed(0)}%`,
        `Primary element: ${data.elementalAnalysis.dominant}`,
        `Energy state: ${data.voiceMetrics.energyLevel}`
      ]
    };
  }

  // Helper methods for elemental calculations
  private calculateFireResonance(transcript: string, metrics: VoiceMetrics, emotional: any): number {
    let activation = 0;

    // Energy level contribution
    if (metrics.energyLevel === 'breakthrough') activation += 0.8;
    else if (metrics.energyLevel === 'elevated') activation += 0.6;

    // Speech rate (fire energy)
    if (metrics.speechRate > 160) activation += 0.4;

    // Transformation language
    const fireWords = ['change', 'transform', 'create', 'breakthrough', 'passion', 'vision', 'action'];
    const fireCount = fireWords.filter(word => transcript.toLowerCase().includes(word)).length;
    activation += Math.min(fireCount * 0.1, 0.3);

    // Emotional intensity
    if (metrics.emotionalIntensity > 0.6) activation += 0.3;

    return Math.min(activation, 1);
  }

  private calculateWaterResonance(transcript: string, metrics: VoiceMetrics, emotional: any): number {
    let activation = 0;

    // Emotional content
    if (metrics.emotionalIntensity > 0.4) activation += 0.4;

    // Flowing speech patterns (less pauses)
    if (metrics.pauseDensity < 8) activation += 0.3;

    // Emotional language
    const waterWords = ['feel', 'emotion', 'heart', 'love', 'connect', 'flow', 'intuition'];
    const waterCount = waterWords.filter(word => transcript.toLowerCase().includes(word)).length;
    activation += Math.min(waterCount * 0.15, 0.4);

    return Math.min(activation, 1);
  }

  private calculateEarthResonance(transcript: string, metrics: VoiceMetrics): number {
    let activation = 0;

    // Grounded breathing
    if (metrics.breathPattern === 'deep') activation += 0.5;
    else if (metrics.breathPattern === 'rhythmic') activation += 0.3;

    // Steady speech rate
    if (metrics.speechRate >= 100 && metrics.speechRate <= 140) activation += 0.3;

    // Grounding language
    const earthWords = ['ground', 'stable', 'body', 'practical', 'real', 'solid', 'foundation'];
    const earthCount = earthWords.filter(word => transcript.toLowerCase().includes(word)).length;
    activation += Math.min(earthCount * 0.1, 0.3);

    // High coherence
    if (metrics.coherence > 0.7) activation += 0.2;

    return Math.min(activation, 1);
  }

  private calculateAirResonance(transcript: string, metrics: VoiceMetrics, attention: any): number {
    let activation = 0;

    // Clear coherence
    if (metrics.coherence > 0.6) activation += 0.4;

    // Thoughtful pacing
    if (metrics.speechRate < 120) activation += 0.3;

    // Intellectual language
    const airWords = ['think', 'understand', 'clarity', 'perspective', 'analyze', 'communicate'];
    const airCount = airWords.filter(word => transcript.toLowerCase().includes(word)).length;
    activation += Math.min(airCount * 0.15, 0.4);

    return Math.min(activation, 1);
  }

  private calculateAetherResonance(transcript: string, metrics: VoiceMetrics, emotional: any): number {
    let activation = 0;

    // Integration indicators
    if (metrics.coherence > 0.7 && metrics.emotionalIntensity > 0.3 && metrics.emotionalIntensity < 0.7) {
      activation += 0.5; // Balanced integration
    }

    // Transcendent language
    const aetherWords = ['integrate', 'whole', 'unity', 'sacred', 'transcend', 'awareness', 'consciousness'];
    const aetherCount = aetherWords.filter(word => transcript.toLowerCase().includes(word)).length;
    activation += Math.min(aetherCount * 0.2, 0.4);

    // Balanced energy
    if (metrics.energyLevel === 'balanced') activation += 0.3;

    return Math.min(activation, 1);
  }

  // Pattern extraction methods
  private getFirePatterns(transcript: string, metrics: VoiceMetrics): string[] {
    const patterns = [];
    if (metrics.energyLevel === 'breakthrough') patterns.push('breakthrough energy');
    if (metrics.speechRate > 160) patterns.push('rapid expression');
    if (transcript.toLowerCase().includes('create')) patterns.push('creative impulse');
    if (metrics.emotionalIntensity > 0.7) patterns.push('passionate intensity');
    return patterns;
  }

  private getWaterPatterns(transcript: string, metrics: VoiceMetrics): string[] {
    const patterns = [];
    if (metrics.emotionalIntensity > 0.4) patterns.push('emotional awareness');
    if (metrics.pauseDensity < 8) patterns.push('flowing expression');
    if (transcript.toLowerCase().includes('feel')) patterns.push('feeling-centered');
    return patterns;
  }

  private getEarthPatterns(transcript: string, metrics: VoiceMetrics): string[] {
    const patterns = [];
    if (metrics.breathPattern === 'deep') patterns.push('grounded breathing');
    if (metrics.coherence > 0.7) patterns.push('stable presence');
    if (metrics.speechRate >= 100 && metrics.speechRate <= 140) patterns.push('steady rhythm');
    return patterns;
  }

  private getAirPatterns(transcript: string, metrics: VoiceMetrics): string[] {
    const patterns = [];
    if (metrics.coherence > 0.6) patterns.push('clear communication');
    if (metrics.speechRate < 120) patterns.push('thoughtful pacing');
    if (transcript.toLowerCase().includes('understand')) patterns.push('analytical thinking');
    return patterns;
  }

  private getAetherPatterns(transcript: string, metrics: VoiceMetrics): string[] {
    const patterns = [];
    if (metrics.coherence > 0.7 && metrics.emotionalIntensity > 0.3 && metrics.emotionalIntensity < 0.7) {
      patterns.push('integrated awareness');
    }
    if (metrics.energyLevel === 'balanced') patterns.push('balanced presence');
    if (transcript.toLowerCase().includes('whole')) patterns.push('wholeness seeking');
    return patterns;
  }

  // Utility methods
  private normalizeMetric(value: number, min: number, max: number): number {
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
  }

  private detectEmotionalContent(transcript: string): string[] {
    const emotionalWords = ['happy', 'sad', 'angry', 'afraid', 'excited', 'worried', 'frustrated', 'grateful', 'love', 'hate'];
    return emotionalWords.filter(word => transcript.toLowerCase().includes(word));
  }

  private estimateConsciousnessLevel(metrics: VoiceMetrics, transcript: string): number {
    let level = 0.5; // baseline

    if (metrics.coherence > 0.7) level += 0.2;
    if (metrics.breathPattern === 'deep') level += 0.1;
    if (metrics.energyLevel === 'balanced') level += 0.1;

    const awarenessWords = ['aware', 'conscious', 'notice', 'realize', 'understand'];
    const awarenessCount = awarenessWords.filter(word => transcript.toLowerCase().includes(word)).length;
    level += Math.min(awarenessCount * 0.05, 0.1);

    return Math.min(level, 1);
  }

  private estimateElementalBalance(transcript: string, metrics: VoiceMetrics): any {
    return {
      fire: this.calculateFireResonance(transcript, metrics, null),
      water: this.calculateWaterResonance(transcript, metrics, null),
      earth: this.calculateEarthResonance(transcript, metrics),
      air: this.calculateAirResonance(transcript, metrics, null),
      aether: this.calculateAetherResonance(transcript, metrics, null)
    };
  }

  private analyzePauseEmotions(words: Array<{ word: string; start: number; end: number }>): any {
    // Analyze emotional patterns in pauses
    const pauses = [];
    for (let i = 1; i < words.length; i++) {
      const pauseLength = words[i].start - words[i - 1].end;
      if (pauseLength > 0.5) {
        pauses.push({
          duration: pauseLength,
          beforeWord: words[i - 1].word,
          afterWord: words[i].word
        });
      }
    }

    return { pauses, emotionalPauses: pauses.filter(p => p.duration > 1.0) };
  }

  private analyzeProsodyEmotions(segments: Array<{ start: number; end: number; text: string }>): any {
    // Analyze emotional shifts across segments
    return { segments: segments.length, emotionalShifts: Math.floor(segments.length / 3) };
  }
}