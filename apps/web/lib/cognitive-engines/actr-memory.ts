// lib/cognitive-engines/actr-memory.ts
/**
 * ACT-R Memory System - Procedural & Declarative Memory with Spiritual Learning
 * Based on John Anderson's ACT-R cognitive architecture
 * Adapted for consciousness development and wisdom integration
 */

import { WisdomPlan } from './soar-planner';

interface DeclarativeMemory {
  id: string;
  type: 'spiritual_insight' | 'emotional_pattern' | 'archetypal_wisdom' | 'elemental_knowledge' | 'consciousness_marker';
  content: string;
  associatedElements: Element[];
  archetypalResonance: string[];
  activationLevel: number;
  creationTime: number;
  lastAccessed: number;
  accessCount: number;
  consciousnessLevel: number;
  emotionalValence: number;
  strengtheningSources: string[];
}

interface ProceduralMemory {
  id: string;
  name: string;
  type: 'wisdom_generation' | 'healing_response' | 'breakthrough_catalyst' | 'integration_process' | 'consciousness_evolution';
  conditions: string[];
  actions: string[];
  expectedResults: string[];
  successRate: number;
  usageCount: number;
  elementalAlignment: Element[];
  archetypalWisdom: string;
  consciousnessRequirement: number;
  lastUsed: number;
  effectiveness: number;
}

interface MemoryChunk {
  declarative: DeclarativeMemory;
  proceduralLinks: string[]; // IDs of related procedural memories
  strengthening: number;
  interference: number;
  contextualCues: string[];
}

interface LearningEvent {
  type: 'success' | 'failure' | 'partial_success';
  procedureId: string;
  context: string;
  outcome: string;
  timestamp: number;
  consciousnessContext: ConsciousnessProfile;
  elementalState: ElementalBalance;
  strengthening: number;
}

interface MemoryIntegration {
  proceduralWisdom: ProceduralMemory[];
  declarativeWisdom: DeclarativeMemory[];
  experiencePattern: ExperiencePattern;
  learningUpdate: LearningUpdate;
  wisdomEvolution: WisdomEvolution;
  memoryStrengthening: MemoryStrengthening;
}

interface ExperiencePattern {
  recurringThemes: string[];
  successfulStrategies: string[];
  challengingAreas: string[];
  growthTrajectory: GrowthPoint[];
  elementalEvolution: ElementalEvolution;
  archetypalDevelopment: ArchetypalDevelopment;
}

interface GrowthPoint {
  timestamp: number;
  consciousnessLevel: number;
  spiralPhase: string;
  keyInsight: string;
  integrationLevel: number;
}

interface LearningUpdate {
  strengthenedProcedures: string[];
  newDeclarativeMemories: DeclarativeMemory[];
  evolutionMarkers: string[];
  nextLearningTargets: string[];
}

export class ACTRMemory {
  private declarativeMemories: Map<string, DeclarativeMemory> = new Map();
  private proceduralMemories: Map<string, ProceduralMemory> = new Map();
  private memoryChunks: Map<string, MemoryChunk> = new Map();
  private learningHistory: LearningEvent[] = [];
  
  // ACT-R parameters
  private baseActivation: number = 0.5;
  private decay: number = 0.5;
  private threshold: number = 0.0;
  private noise: number = 0.25;
  private mismatchPenalty: number = 1.0;
  
  // Spiritual learning parameters
  private consciousnessActivationBonus: number = 0.3;
  private elementalResonanceBonus: number = 0.2;
  private archetypalAlignmentBonus: number = 0.25;
  
  constructor() {
    this.initializeCoreProcedures();
    this.initializeCoreDeclarativeMemories();
  }

  /**
   * Main ACT-R integration method
   */
  async integrateExperience(
    wisdomPlan: WisdomPlan,
    conversationHistory: ConversationHistory
  ): Promise<MemoryIntegration> {
    
    // 1. Retrieve relevant procedural and declarative memories
    const proceduralWisdom = await this.retrieveProceduralKnowledge(wisdomPlan);
    const declarativeWisdom = await this.retrieveDeclarativeKnowledge(wisdomPlan);
    
    // 2. Integrate with conversation history to identify patterns
    const experiencePattern = this.analyzeExperiencePatterns(
      conversationHistory,
      proceduralWisdom,
      declarativeWisdom
    );
    
    // 3. Update memory strengths based on usage and success
    const memoryStrengthening = this.updateMemoryStrengths(
      proceduralWisdom,
      declarativeWisdom,
      experiencePattern
    );
    
    // 4. Generate learning updates
    const learningUpdate = this.generateLearningUpdates(
      experiencePattern,
      wisdomPlan
    );
    
    // 5. Track wisdom evolution over time
    const wisdomEvolution = this.trackWisdomEvolution(
      experiencePattern,
      conversationHistory
    );
    
    return {
      proceduralWisdom,
      declarativeWisdom,
      experiencePattern,
      learningUpdate,
      wisdomEvolution,
      memoryStrengthening
    };
  }

  /**
   * Retrieve procedural knowledge relevant to the wisdom plan
   */
  private async retrieveProceduralKnowledge(wisdomPlan: WisdomPlan): Promise<ProceduralMemory[]> {
    const relevantProcedures: ProceduralMemory[] = [];
    
    // Calculate activation for each procedural memory
    for (const [id, procedure] of this.proceduralMemories) {
      const activation = this.calculateProceduralActivation(procedure, wisdomPlan);
      
      if (activation > this.threshold) {
        // Create a copy with current activation for this retrieval
        const activatedProcedure = {
          ...procedure,
          effectiveness: activation
        };
        relevantProcedures.push(activatedProcedure);
      }
    }
    
    // Sort by activation level (most relevant first)
    relevantProcedures.sort((a, b) => b.effectiveness - a.effectiveness);
    
    // Update usage statistics
    relevantProcedures.forEach(procedure => {
      this.updateProceduralUsage(procedure.id);
    });
    
    return relevantProcedures.slice(0, 5); // Return top 5 most relevant
  }

  /**
   * Retrieve declarative knowledge relevant to the wisdom plan
   */
  private async retrieveDeclarativeKnowledge(wisdomPlan: WisdomPlan): Promise<DeclarativeMemory[]> {
    const relevantMemories: DeclarativeMemory[] = [];
    
    // Calculate activation for each declarative memory
    for (const [id, memory] of this.declarativeMemories) {
      const activation = this.calculateDeclarativeActivation(memory, wisdomPlan);
      
      if (activation > this.threshold) {
        // Create a copy with current activation
        const activatedMemory = {
          ...memory,
          activationLevel: activation
        };
        relevantMemories.push(activatedMemory);
      }
    }
    
    // Sort by activation level
    relevantMemories.sort((a, b) => b.activationLevel - a.activationLevel);
    
    // Update access statistics
    relevantMemories.forEach(memory => {
      this.updateDeclarativeAccess(memory.id);
    });
    
    return relevantMemories.slice(0, 7); // Return top 7 most relevant
  }

  /**
   * Calculate procedural memory activation using ACT-R principles
   */
  private calculateProceduralActivation(
    procedure: ProceduralMemory,
    wisdomPlan: WisdomPlan
  ): number {
    // Base activation from usage frequency and recency
    const usageFrequency = Math.log(procedure.usageCount + 1);
    const recency = this.calculateRecencyActivation(procedure.lastUsed);
    let activation = this.baseActivation + usageFrequency + recency;
    
    // Consciousness alignment bonus
    const consciousnessAlignment = this.calculateConsciousnessAlignment(
      procedure.consciousnessRequirement,
      wisdomPlan.primaryGoal.consciousnessLevel
    );
    activation += consciousnessAlignment * this.consciousnessActivationBonus;
    
    // Elemental resonance bonus
    const elementalResonance = this.calculateElementalResonance(
      procedure.elementalAlignment,
      wisdomPlan.primaryGoal.elementalAlignment
    );
    activation += elementalResonance * this.elementalResonanceBonus;
    
    // Archetypal alignment bonus
    const archetypalAlignment = this.calculateArchetypalAlignment(
      procedure.archetypalWisdom,
      wisdomPlan.primaryGoal.archetypalResonance
    );
    activation += archetypalAlignment * this.archetypalAlignmentBonus;
    
    // Success rate bonus
    activation += procedure.successRate * 0.2;
    
    // Add noise for realistic variability
    activation += (Math.random() - 0.5) * this.noise;
    
    return activation;
  }

  /**
   * Calculate declarative memory activation using ACT-R principles
   */
  private calculateDeclarativeActivation(
    memory: DeclarativeMemory,
    wisdomPlan: WisdomPlan
  ): number {
    // Base activation from access frequency and recency
    const accessFrequency = Math.log(memory.accessCount + 1);
    const recency = this.calculateRecencyActivation(memory.lastAccessed);
    let activation = this.baseActivation + accessFrequency + recency;
    
    // Consciousness level alignment
    const consciousnessAlignment = this.calculateConsciousnessAlignment(
      memory.consciousnessLevel,
      wisdomPlan.primaryGoal.consciousnessLevel
    );
    activation += consciousnessAlignment * this.consciousnessActivationBonus;
    
    // Elemental resonance
    const elementalResonance = this.calculateElementalResonance(
      memory.associatedElements,
      wisdomPlan.primaryGoal.elementalAlignment
    );
    activation += elementalResonance * this.elementalResonanceBonus;
    
    // Archetypal resonance
    const archetypalResonance = this.calculateArchetypalAlignment(
      memory.archetypalResonance,
      wisdomPlan.primaryGoal.archetypalResonance
    );
    activation += archetypalResonance * this.archetypalAlignmentBonus;
    
    // Emotional valence consideration
    if (Math.abs(memory.emotionalValence) > 0.7) {
      activation += 0.15; // Strong emotions increase memorability
    }
    
    // Add noise
    activation += (Math.random() - 0.5) * this.noise;
    
    return activation;
  }

  /**
   * Analyze experience patterns from conversation history
   */
  private analyzeExperiencePatterns(
    history: ConversationHistory,
    proceduralWisdom: ProceduralMemory[],
    declarativeWisdom: DeclarativeMemory[]
  ): ExperiencePattern {
    
    // Extract recurring themes from conversation history
    const recurringThemes = this.extractRecurringThemes(history);
    
    // Identify successful strategies based on procedural memory usage
    const successfulStrategies = proceduralWisdom
      .filter(proc => proc.successRate > 0.7)
      .map(proc => proc.name)
      .slice(0, 3);
    
    // Identify challenging areas from failed or partially successful procedures
    const challengingAreas = proceduralWisdom
      .filter(proc => proc.successRate < 0.5)
      .map(proc => proc.type)
      .slice(0, 3);
    
    // Track growth trajectory
    const growthTrajectory = this.extractGrowthTrajectory(history);
    
    // Analyze elemental evolution over time
    const elementalEvolution = this.analyzeElementalEvolution(history);
    
    // Track archetypal development
    const archetypalDevelopment = this.analyzeArchetypalDevelopment(history);
    
    return {
      recurringThemes,
      successfulStrategies,
      challengingAreas,
      growthTrajectory,
      elementalEvolution,
      archetypalDevelopment
    };
  }

  /**
   * Update memory strengths based on usage patterns and success
   */
  private updateMemoryStrengths(
    proceduralWisdom: ProceduralMemory[],
    declarativeWisdom: DeclarativeMemory[],
    experiencePattern: ExperiencePattern
  ): MemoryStrengthening {
    
    const strengtheningEvents: string[] = [];
    
    // Strengthen successful procedural memories
    proceduralWisdom.forEach(proc => {
      if (experiencePattern.successfulStrategies.includes(proc.name)) {
        this.strengthenProceduralMemory(proc.id, 0.1);
        strengtheningEvents.push(`Strengthened procedure: ${proc.name}`);
      }
    });
    
    // Strengthen frequently accessed declarative memories
    declarativeWisdom.forEach(mem => {
      if (mem.accessCount > 5) {
        this.strengthenDeclarativeMemory(mem.id, 0.05);
        strengtheningEvents.push(`Strengthened memory: ${mem.type}`);
      }
    });
    
    // Create new memories from recent insights
    const newMemories = this.createMemoriesFromInsights(experiencePattern);
    newMemories.forEach(memory => {
      this.addDeclarativeMemory(memory);
      strengtheningEvents.push(`Created new memory: ${memory.type}`);
    });
    
    return {
      events: strengtheningEvents,
      proceduralUpdates: proceduralWisdom.length,
      declarativeUpdates: declarativeWisdom.length,
      newMemories: newMemories.length
    };
  }

  /**
   * Initialize core procedural memories for spiritual guidance
   */
  private initializeCoreProcedures(): void {
    const coreProcedures: ProceduralMemory[] = [
      {
        id: 'inquiry_deepening',
        name: 'Deep Inquiry Process',
        type: 'wisdom_generation',
        conditions: ['user_seeking', 'confusion_present', 'openness_detected'],
        actions: ['ask_penetrating_question', 'explore_assumptions', 'guide_reflection'],
        expectedResults: ['increased_clarity', 'assumption_questioning', 'deeper_understanding'],
        successRate: 0.75,
        usageCount: 0,
        elementalAlignment: ['air', 'aether'],
        archetypalWisdom: 'sage',
        consciousnessRequirement: 0.4,
        lastUsed: Date.now(),
        effectiveness: 0.75
      },
      
      {
        id: 'emotional_healing',
        name: 'Emotional Healing Response',
        type: 'healing_response',
        conditions: ['emotional_pain', 'healing_needed', 'safety_established'],
        actions: ['acknowledge_pain', 'offer_compassion', 'guide_healing_process'],
        expectedResults: ['emotional_release', 'healing_progress', 'inner_peace'],
        successRate: 0.8,
        usageCount: 0,
        elementalAlignment: ['water', 'earth'],
        archetypalWisdom: 'healer',
        consciousnessRequirement: 0.3,
        lastUsed: Date.now(),
        effectiveness: 0.8
      },
      
      {
        id: 'breakthrough_catalyst',
        name: 'Breakthrough Catalyst',
        type: 'breakthrough_catalyst',
        conditions: ['stagnation_present', 'readiness_for_change', 'fire_energy_needed'],
        actions: ['challenge_limiting_beliefs', 'ignite_vision', 'catalyze_action'],
        expectedResults: ['breakthrough_achieved', 'momentum_created', 'transformation_begun'],
        successRate: 0.65,
        usageCount: 0,
        elementalAlignment: ['fire', 'air'],
        archetypalWisdom: 'warrior',
        consciousnessRequirement: 0.5,
        lastUsed: Date.now(),
        effectiveness: 0.65
      },
      
      {
        id: 'integration_synthesis',
        name: 'Integration Synthesis',
        type: 'integration_process',
        conditions: ['fragmentation_present', 'multiple_perspectives', 'integration_readiness'],
        actions: ['synthesize_perspectives', 'find_common_ground', 'create_wholeness'],
        expectedResults: ['integration_achieved', 'wholeness_increased', 'paradox_resolved'],
        successRate: 0.7,
        usageCount: 0,
        elementalAlignment: ['aether', 'earth'],
        archetypalWisdom: 'sage',
        consciousnessRequirement: 0.6,
        lastUsed: Date.now(),
        effectiveness: 0.7
      },
      
      {
        id: 'consciousness_evolution',
        name: 'Consciousness Evolution Guide',
        type: 'consciousness_evolution',
        conditions: ['growth_readiness', 'higher_consciousness', 'evolution_calling'],
        actions: ['recognize_evolution', 'support_expansion', 'integrate_new_level'],
        expectedResults: ['consciousness_expansion', 'evolution_progress', 'new_perspective'],
        successRate: 0.6,
        usageCount: 0,
        elementalAlignment: ['aether', 'fire'],
        archetypalWisdom: 'magician',
        consciousnessRequirement: 0.7,
        lastUsed: Date.now(),
        effectiveness: 0.6
      }
    ];
    
    coreProcedures.forEach(proc => {
      this.proceduralMemories.set(proc.id, proc);
    });
  }

  /**
   * Initialize core declarative memories for spiritual wisdom
   */
  private initializeCoreDeclarativeMemories(): void {
    const coreMemories: DeclarativeMemory[] = [
      {
        id: 'consciousness_levels',
        type: 'consciousness_marker',
        content: 'Consciousness develops through stages: Survival -> Emotional -> Mental -> Integral -> Cosmic',
        associatedElements: ['aether', 'air'],
        archetypalResonance: ['sage', 'oracle'],
        activationLevel: 0.8,
        creationTime: Date.now(),
        lastAccessed: Date.now(),
        accessCount: 1,
        consciousnessLevel: 0.7,
        emotionalValence: 0.3,
        strengtheningSources: ['core_wisdom']
      },
      
      {
        id: 'elemental_balance',
        type: 'elemental_knowledge',
        content: 'Balance of Fire (action), Water (emotion), Earth (grounding), Air (clarity), Aether (transcendence) creates harmony',
        associatedElements: ['fire', 'water', 'earth', 'air', 'aether'],
        archetypalResonance: ['magician', 'healer'],
        activationLevel: 0.9,
        creationTime: Date.now(),
        lastAccessed: Date.now(),
        accessCount: 1,
        consciousnessLevel: 0.5,
        emotionalValence: 0.2,
        strengtheningSources: ['elemental_wisdom']
      },
      
      {
        id: 'shadow_integration',
        type: 'spiritual_insight',
        content: 'What we reject in others often reflects our own unintegrated shadow aspects',
        associatedElements: ['water', 'earth'],
        archetypalResonance: ['magician', 'sage'],
        activationLevel: 0.7,
        creationTime: Date.now(),
        lastAccessed: Date.now(),
        accessCount: 1,
        consciousnessLevel: 0.6,
        emotionalValence: -0.1,
        strengtheningSources: ['jungian_psychology']
      },
      
      {
        id: 'archetypal_wisdom',
        type: 'archetypal_wisdom',
        content: 'Archetypes are universal patterns that guide human experience and development',
        associatedElements: ['aether', 'water'],
        archetypalResonance: ['sage', 'oracle', 'magician'],
        activationLevel: 0.8,
        creationTime: Date.now(),
        lastAccessed: Date.now(),
        accessCount: 1,
        consciousnessLevel: 0.7,
        emotionalValence: 0.4,
        strengtheningSources: ['archetypal_psychology']
      }
    ];
    
    coreMemories.forEach(memory => {
      this.declarativeMemories.set(memory.id, memory);
      this.memoryChunks.set(memory.id, {
        declarative: memory,
        proceduralLinks: [],
        strengthening: 1.0,
        interference: 0.0,
        contextualCues: []
      });
    });
  }

  // Helper methods for memory calculations and updates
  private calculateRecencyActivation(lastUsed: number): number {
    const timeSince = Date.now() - lastUsed;
    const days = timeSince / (1000 * 60 * 60 * 24);
    return -this.decay * Math.log(days + 1);
  }

  private calculateConsciousnessAlignment(level1: number, level2: number): number {
    return 1 - Math.abs(level1 - level2);
  }

  private calculateElementalResonance(elements1: Element[], elements2: Element[]): number {
    const intersection = elements1.filter(e => elements2.includes(e));
    const union = [...new Set([...elements1, ...elements2])];
    return intersection.length / union.length;
  }

  private calculateArchetypalAlignment(archetype: string | string[], archetypes: string[]): number {
    const archetypeArray = Array.isArray(archetype) ? archetype : [archetype];
    const intersection = archetypeArray.filter(a => archetypes.includes(a));
    return intersection.length / Math.max(archetypeArray.length, archetypes.length);
  }

  private updateProceduralUsage(procedureId: string): void {
    const procedure = this.proceduralMemories.get(procedureId);
    if (procedure) {
      procedure.usageCount++;
      procedure.lastUsed = Date.now();
    }
  }

  private updateDeclarativeAccess(memoryId: string): void {
    const memory = this.declarativeMemories.get(memoryId);
    if (memory) {
      memory.accessCount++;
      memory.lastAccessed = Date.now();
    }
  }

  private strengthenProceduralMemory(id: string, amount: number): void {
    const procedure = this.proceduralMemories.get(id);
    if (procedure) {
      procedure.successRate = Math.min(procedure.successRate + amount, 1.0);
    }
  }

  private strengthenDeclarativeMemory(id: string, amount: number): void {
    const chunk = this.memoryChunks.get(id);
    if (chunk) {
      chunk.strengthening = Math.min(chunk.strengthening + amount, 2.0);
    }
  }

  private addDeclarativeMemory(memory: DeclarativeMemory): void {
    this.declarativeMemories.set(memory.id, memory);
    this.memoryChunks.set(memory.id, {
      declarative: memory,
      proceduralLinks: [],
      strengthening: 1.0,
      interference: 0.0,
      contextualCues: []
    });
  }

  // Stub implementations for complex analysis methods
  private extractRecurringThemes(history: ConversationHistory): string[] {
    // Analyze conversation history for recurring patterns
    return ['spiritual_seeking', 'emotional_healing', 'life_purpose'];
  }

  private extractGrowthTrajectory(history: ConversationHistory): GrowthPoint[] {
    // Track consciousness evolution over time
    return [{
      timestamp: Date.now(),
      consciousnessLevel: 0.6,
      spiralPhase: 'transparent_prism',
      keyInsight: 'Integration of shadow aspects',
      integrationLevel: 0.7
    }];
  }

  private analyzeElementalEvolution(history: ConversationHistory): ElementalEvolution {
    // Track how elemental balance changes over time
    return {
      trajectory: 'earth_to_fire_evolution',
      currentBalance: { fire: 0.3, water: 0.2, earth: 0.2, air: 0.2, aether: 0.1 },
      evolutionRate: 0.05,
      nextPhase: 'fire_integration'
    };
  }

  private analyzeArchetypalDevelopment(history: ConversationHistory): ArchetypalDevelopment {
    // Track archetypal activation and development
    return {
      primaryArchetype: 'sage',
      emergingArchetype: 'magician',
      developmentStage: 'integration',
      activationHistory: []
    };
  }

  private generateLearningUpdates(
    experiencePattern: ExperiencePattern,
    wisdomPlan: WisdomPlan
  ): LearningUpdate {
    return {
      strengthenedProcedures: ['inquiry_deepening', 'emotional_healing'],
      newDeclarativeMemories: [],
      evolutionMarkers: ['consciousness_expansion_detected'],
      nextLearningTargets: ['integration_mastery', 'breakthrough_catalyst']
    };
  }

  private trackWisdomEvolution(
    experiencePattern: ExperiencePattern,
    history: ConversationHistory
  ): WisdomEvolution {
    return {
      wisdomLevel: 0.7,
      evolutionRate: 0.02,
      keyDevelopments: ['shadow_integration', 'archetypal_embodiment'],
      nextEvolutionThreshold: 0.75,
      predictedTimeframe: '2-3 months'
    };
  }

  private createMemoriesFromInsights(experiencePattern: ExperiencePattern): DeclarativeMemory[] {
    // Create new declarative memories from recent insights
    return [];
  }
}

// Export singleton instance with lazy loading
let _actrMemory: ACTRMemory | null = null;
export const getACTRMemory = (): ACTRMemory => {
  if (!_actrMemory) {
    _actrMemory = new ACTRMemory();
  }
  return _actrMemory;
};