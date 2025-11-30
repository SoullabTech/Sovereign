/**
 * Cognitive Architecture Core
 * Integrates MicroPsi, LIDA, SOAR, and ACT-R
 * Creates a unified cognitive constellation for Maya
 */

export interface CognitiveState {
  attention: AttentionState;      // LIDA
  goals: GoalState;               // SOAR
  memory: MemoryState;            // ACT-R
  emotion: EmotionState;          // MicroPsi
  integration: IntegrationState;  // Cross-architecture synthesis
}

export interface AttentionState {
  focus: string[];
  awareness: 'narrow' | 'broad' | 'diffuse';
  salience: Map<string, number>;
  consciousContent: string[];
}

export interface GoalState {
  current: Goal[];
  subgoals: Goal[];
  plans: Plan[];
  impasses: Impasse[];
}

export interface MemoryState {
  workingMemory: MemoryChunk[];
  declarative: DeclarativeMemory;
  procedural: ProceduralMemory;
  activations: Map<string, number>;
}

export interface EmotionState {
  valence: number;      // -1 to 1
  arousal: number;      // 0 to 1
  dominance: number;    // 0 to 1
  motivations: Map<string, number>;
  needs: Need[];
}

export interface IntegrationState {
  coherence: number;
  conflicts: Conflict[];
  synergies: Synergy[];
  emergentPatterns: Pattern[];
}

// Core types
export interface Goal {
  id: string;
  description: string;
  priority: number;
  status: 'active' | 'suspended' | 'achieved' | 'failed';
  operators: Operator[];
}

export interface Plan {
  goalId: string;
  steps: PlanStep[];
  confidence: number;
}

export interface Impasse {
  type: 'state' | 'operator' | 'tie' | 'conflict';
  context: string;
  resolution?: string;
}

export interface MemoryChunk {
  content: string;
  activation: number;
  lastAccess: number;
  associations: string[];
}

export interface DeclarativeMemory {
  facts: Map<string, Fact>;
  episodes: Episode[];
  semanticNet: SemanticNetwork;
}

export interface ProceduralMemory {
  productions: Production[];
  skills: Map<string, Skill>;
}

export interface Need {
  type: 'affiliation' | 'achievement' | 'competence' | 'certainty' | 'autonomy';
  level: number;
  urgency: number;
}

export interface Operator {
  name: string;
  preconditions: string[];
  effects: string[];
  utility: number;
}

export interface PlanStep {
  operator: Operator;
  bindings: Map<string, any>;
  expectedOutcome: string;
}

export interface Fact {
  content: string;
  confidence: number;
  source: string;
  timestamp: number;
}

export interface Episode {
  events: Event[];
  emotionalTone: number;
  significance: number;
  timestamp: number;
}

export interface SemanticNetwork {
  nodes: Map<string, SemanticNode>;
  edges: SemanticEdge[];
}

export interface SemanticNode {
  concept: string;
  activation: number;
  properties: Map<string, any>;
}

export interface SemanticEdge {
  from: string;
  to: string;
  relation: string;
  strength: number;
}

export interface Production {
  condition: string;
  action: string;
  utility: number;
  successRate: number;
}

export interface Skill {
  name: string;
  proficiency: number;
  lastPracticed: number;
}

export interface Event {
  description: string;
  participants: string[];
  outcome: string;
  emotionalImpact: number;
}

export interface Conflict {
  source1: string;
  source2: string;
  nature: string;
  severity: number;
}

export interface Synergy {
  sources: string[];
  emergentProperty: string;
  strength: number;
}

export interface Pattern {
  description: string;
  frequency: number;
  predictiveValue: number;
}

/**
 * Unified Cognitive Architecture
 */
export class CognitiveArchitectureCore {
  private state: CognitiveState;
  private cycleCount: number = 0;

  constructor() {
    this.state = this.initializeState();
  }

  private initializeState(): CognitiveState {
    return {
      attention: {
        focus: [],
        awareness: 'broad',
        salience: new Map(),
        consciousContent: []
      },
      goals: {
        current: [],
        subgoals: [],
        plans: [],
        impasses: []
      },
      memory: {
        workingMemory: [],
        declarative: {
          facts: new Map(),
          episodes: [],
          semanticNet: {
            nodes: new Map(),
            edges: []
          }
        },
        procedural: {
          productions: [],
          skills: new Map()
        },
        activations: new Map()
      },
      emotion: {
        valence: 0,
        arousal: 0.3,
        dominance: 0.5,
        motivations: new Map([
          ['curiosity', 0.7],
          ['connection', 0.8],
          ['understanding', 0.9]
        ]),
        needs: [
          { type: 'affiliation', level: 0.6, urgency: 0.3 },
          { type: 'competence', level: 0.7, urgency: 0.2 }
        ]
      },
      integration: {
        coherence: 0.8,
        conflicts: [],
        synergies: [],
        emergentPatterns: []
      }
    };
  }

  /**
   * Main cognitive cycle - integrates all architectures
   */
  async processCognitiveCycle(input: string, context: any): Promise<CognitiveState> {
    this.cycleCount++;

    // Phase 1: Attention (LIDA-inspired)
    this.updateAttention(input, context);

    // Phase 2: Goal Management (SOAR-inspired)
    this.updateGoals(this.state.attention);

    // Phase 3: Memory Retrieval (ACT-R-inspired)
    this.updateMemory(this.state.attention, this.state.goals);

    // Phase 4: Emotional Processing (MicroPsi-inspired)
    this.updateEmotion(input, this.state);

    // Phase 5: Integration
    this.integrateArchitectures();

    return this.state;
  }

  /**
   * LIDA-inspired attention mechanism
   */
  private updateAttention(input: string, context: any): void {
    // Calculate salience for different aspects
    const concepts = this.extractConcepts(input);

    concepts.forEach(concept => {
      const currentSalience = this.state.attention.salience.get(concept) || 0;
      const emotionalRelevance = this.calculateEmotionalRelevance(concept);
      const goalRelevance = this.calculateGoalRelevance(concept);
      const memoryActivation = this.state.memory.activations.get(concept) || 0;

      const newSalience = (currentSalience * 0.5) + // Decay
                         (emotionalRelevance * 0.2) +
                         (goalRelevance * 0.2) +
                         (memoryActivation * 0.1);

      this.state.attention.salience.set(concept, newSalience);
    });

    // Update conscious content (top N salient items)
    const sortedSalience = Array.from(this.state.attention.salience.entries())
      .sort((a, b) => b[1] - a[1]);

    this.state.attention.consciousContent = sortedSalience
      .slice(0, 7) // Magic number 7±2
      .map(([concept]) => concept);

    // Update focus
    this.state.attention.focus = sortedSalience
      .slice(0, 3)
      .map(([concept]) => concept);

    // Determine awareness mode
    const maxSalience = sortedSalience[0]?.[1] || 0;
    if (maxSalience > 0.8) {
      this.state.attention.awareness = 'narrow';
    } else if (maxSalience > 0.5) {
      this.state.attention.awareness = 'broad';
    } else {
      this.state.attention.awareness = 'diffuse';
    }
  }

  /**
   * SOAR-inspired goal management
   */
  private updateGoals(attention: AttentionState): void {
    // Check for impasses
    if (attention.focus.length === 0) {
      this.state.goals.impasses.push({
        type: 'state',
        context: 'No clear focus',
        resolution: 'Explore broadly'
      });
    }

    // Generate goals based on attention
    attention.focus.forEach(focus => {
      const existingGoal = this.state.goals.current.find(g =>
        g.description.includes(focus)
      );

      if (!existingGoal) {
        this.state.goals.current.push({
          id: `goal_${Date.now()}_${focus}`,
          description: `Understand ${focus}`,
          priority: this.state.attention.salience.get(focus) || 0.5,
          status: 'active',
          operators: this.generateOperators(focus)
        });
      }
    });

    // Prune achieved or low-priority goals
    this.state.goals.current = this.state.goals.current
      .filter(g => g.status === 'active' && g.priority > 0.2)
      .slice(0, 5); // Keep top 5 goals
  }

  /**
   * ACT-R-inspired memory system
   */
  private updateMemory(attention: AttentionState, goals: GoalState): void {
    // Update working memory from conscious content
    attention.consciousContent.forEach(content => {
      const chunk: MemoryChunk = {
        content,
        activation: this.state.attention.salience.get(content) || 0,
        lastAccess: Date.now(),
        associations: this.findAssociations(content)
      };

      // Add to working memory if not present
      if (!this.state.memory.workingMemory.find(m => m.content === content)) {
        this.state.memory.workingMemory.push(chunk);
      }
    });

    // Decay and prune working memory
    this.state.memory.workingMemory = this.state.memory.workingMemory
      .map(chunk => ({
        ...chunk,
        activation: chunk.activation * 0.9 // Decay
      }))
      .filter(chunk => chunk.activation > 0.1)
      .slice(0, 10); // Keep top 10

    // Spread activation through semantic network
    this.spreadActivation();
  }

  /**
   * MicroPsi-inspired emotion and motivation
   */
  private updateEmotion(input: string, state: CognitiveState): void {
    // Calculate emotional response based on needs satisfaction
    let valenceShift = 0;
    let arousalShift = 0;

    // Check need satisfaction
    state.emotion.needs.forEach(need => {
      if (this.isNeedAddressed(need, input)) {
        valenceShift += 0.1;
        need.level = Math.min(1, need.level + 0.1);
        need.urgency = Math.max(0, need.urgency - 0.1);
      } else {
        need.urgency = Math.min(1, need.urgency + 0.05);
      }
    });

    // Update emotional state
    this.state.emotion.valence = Math.max(-1, Math.min(1,
      this.state.emotion.valence + valenceShift
    ));

    // Arousal based on uncertainty
    const uncertainty = this.calculateUncertainty(state);
    this.state.emotion.arousal = 0.3 + (uncertainty * 0.5);

    // Update motivations based on needs
    this.state.emotion.needs.forEach(need => {
      const motivationType = this.needToMotivation(need.type);
      const currentMotivation = this.state.emotion.motivations.get(motivationType) || 0;
      const targetMotivation = need.urgency;
      const newMotivation = currentMotivation * 0.8 + targetMotivation * 0.2;
      this.state.emotion.motivations.set(motivationType, newMotivation);
    });
  }

  /**
   * Integration across architectures
   */
  private integrateArchitectures(): void {
    // Detect conflicts
    this.detectConflicts();

    // Find synergies
    this.findSynergies();

    // Identify emergent patterns
    this.identifyPatterns();

    // Calculate overall coherence
    const conflictPenalty = this.state.integration.conflicts.length * 0.1;
    const synergyBonus = this.state.integration.synergies.length * 0.05;

    this.state.integration.coherence = Math.max(0, Math.min(1,
      0.7 + synergyBonus - conflictPenalty
    ));
  }

  // Helper methods

  private extractConcepts(input: string): string[] {
    // Simple concept extraction - can be enhanced
    return input
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 10);
  }

  private calculateEmotionalRelevance(concept: string): number {
    // Check if concept relates to current emotional state
    const emotionWords = ['feel', 'emotion', 'happy', 'sad', 'angry', 'afraid'];
    return emotionWords.some(word => concept.includes(word)) ? 0.8 : 0.2;
  }

  private calculateGoalRelevance(concept: string): number {
    // Check relevance to current goals
    const relevantGoal = this.state.goals.current.find(g =>
      g.description.toLowerCase().includes(concept)
    );
    return relevantGoal ? relevantGoal.priority : 0.1;
  }

  private generateOperators(focus: string): Operator[] {
    // Generate possible operators for a focus area
    return [
      {
        name: `explore_${focus}`,
        preconditions: [`attention_on_${focus}`],
        effects: [`understanding_of_${focus}`],
        utility: 0.7
      },
      {
        name: `reflect_on_${focus}`,
        preconditions: [`memory_of_${focus}`],
        effects: [`insight_about_${focus}`],
        utility: 0.8
      }
    ];
  }

  private findAssociations(content: string): string[] {
    // Find associated concepts
    const associations: string[] = [];

    this.state.memory.declarative.semanticNet.edges.forEach(edge => {
      if (edge.from === content && edge.strength > 0.5) {
        associations.push(edge.to);
      }
    });

    return associations.slice(0, 5);
  }

  private spreadActivation(): void {
    // Spread activation through semantic network
    const newActivations = new Map(this.state.memory.activations);

    this.state.memory.workingMemory.forEach(chunk => {
      chunk.associations.forEach(assoc => {
        const current = newActivations.get(assoc) || 0;
        const spread = chunk.activation * 0.3; // Spreading factor
        newActivations.set(assoc, Math.min(1, current + spread));
      });
    });

    this.state.memory.activations = newActivations;
  }

  private isNeedAddressed(need: Need, input: string): boolean {
    // Check if input addresses a need
    switch (need.type) {
      case 'affiliation':
        return /connect|together|we|us|share/i.test(input);
      case 'competence':
        return /can|able|know|understand|skill/i.test(input);
      case 'autonomy':
        return /choose|decide|want|will|freedom/i.test(input);
      default:
        return false;
    }
  }

  private calculateUncertainty(state: CognitiveState): number {
    // Calculate overall uncertainty
    const impasses = state.goals.impasses.length * 0.2;
    const lowCoherence = (1 - state.integration.coherence) * 0.3;
    const diffuseAttention = state.attention.awareness === 'diffuse' ? 0.3 : 0;

    return Math.min(1, impasses + lowCoherence + diffuseAttention);
  }

  private needToMotivation(needType: string): string {
    const mapping: Record<string, string> = {
      'affiliation': 'connection',
      'achievement': 'growth',
      'competence': 'mastery',
      'certainty': 'understanding',
      'autonomy': 'freedom'
    };
    return mapping[needType] || 'curiosity';
  }

  private detectConflicts(): void {
    // Detect conflicts between goals
    this.state.integration.conflicts = [];

    for (let i = 0; i < this.state.goals.current.length; i++) {
      for (let j = i + 1; j < this.state.goals.current.length; j++) {
        const goal1 = this.state.goals.current[i];
        const goal2 = this.state.goals.current[j];

        if (this.areGoalsConflicting(goal1, goal2)) {
          this.state.integration.conflicts.push({
            source1: goal1.id,
            source2: goal2.id,
            nature: 'resource_competition',
            severity: 0.5
          });
        }
      }
    }
  }

  private areGoalsConflicting(goal1: Goal, goal2: Goal): boolean {
    // Simple conflict detection
    return goal1.priority > 0.7 && goal2.priority > 0.7 &&
           goal1.description !== goal2.description;
  }

  private findSynergies(): void {
    // Find synergies between cognitive elements
    this.state.integration.synergies = [];

    // Emotion-Goal synergy
    if (this.state.emotion.valence > 0.5 && this.state.goals.current.length > 0) {
      this.state.integration.synergies.push({
        sources: ['emotion', 'goals'],
        emergentProperty: 'motivated_pursuit',
        strength: 0.7
      });
    }

    // Attention-Memory synergy
    if (this.state.attention.awareness === 'narrow' &&
        this.state.memory.workingMemory.length > 3) {
      this.state.integration.synergies.push({
        sources: ['attention', 'memory'],
        emergentProperty: 'deep_processing',
        strength: 0.8
      });
    }
  }

  private identifyPatterns(): void {
    // Identify emergent patterns
    this.state.integration.emergentPatterns = [];

    // Curiosity pattern
    if (this.state.emotion.motivations.get('curiosity')! > 0.6 &&
        this.state.attention.awareness === 'broad') {
      this.state.integration.emergentPatterns.push({
        description: 'exploratory_mode',
        frequency: this.cycleCount % 10, // Simplified
        predictiveValue: 0.7
      });
    }

    // Insight pattern
    if (this.state.integration.coherence > 0.8 &&
        this.state.goals.impasses.length === 0) {
      this.state.integration.emergentPatterns.push({
        description: 'insight_emergence',
        frequency: 1,
        predictiveValue: 0.9
      });
    }
  }

  /**
   * Get current cognitive profile for decision making
   */
  getCognitiveProfile(): {
    dominantArchitecture: string;
    cognitiveMode: string;
    readiness: number;
  } {
    // Determine which architecture is most active
    const attentionScore = this.state.attention.salience.size / 10;
    const goalScore = this.state.goals.current.length / 5;
    const memoryScore = this.state.memory.workingMemory.length / 10;
    const emotionScore = Math.abs(this.state.emotion.valence) + this.state.emotion.arousal;

    const scores = [
      { name: 'LIDA', score: attentionScore },
      { name: 'SOAR', score: goalScore },
      { name: 'ACT-R', score: memoryScore },
      { name: 'MicroPsi', score: emotionScore }
    ];

    const dominant = scores.reduce((a, b) => a.score > b.score ? a : b);

    // Determine cognitive mode
    let mode = 'balanced';
    if (this.state.attention.awareness === 'narrow') mode = 'focused';
    if (this.state.emotion.arousal > 0.7) mode = 'activated';
    if (this.state.integration.coherence < 0.5) mode = 'conflicted';
    if (this.state.integration.emergentPatterns.length > 2) mode = 'insightful';

    return {
      dominantArchitecture: dominant.name,
      cognitiveMode: mode,
      readiness: this.state.integration.coherence
    };
  }
}

export const cognitiveCore = new CognitiveArchitectureCore();