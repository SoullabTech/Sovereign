/**
 * 🧪 Consciousness Exploration Laboratory
 *
 * A comprehensive catalog of experiments, exercises, and explorations
 * that users can engage with through Maya/Soullab to explore consciousness,
 * relationships, and personal evolution.
 */

export interface Experiment {
  id: string;
  name: string;
  category: ExperimentCategory;
  subcategory?: string;
  description: string;
  duration: string; // "5 minutes", "1 week", "ongoing"
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: ExperimentType;
  mayaRole: string; // How Maya facilitates this
  expectedOutcomes: string[];
  sacredBridgeEnabled?: boolean; // Can be done with others
  collectiveContribution?: boolean; // Contributes to collective field
  requiredParticipants?: number;
  materials?: string[]; // Physical materials needed
  prerequisites?: string[]; // Other experiments to complete first
  frequency?: string; // "daily", "weekly", "once"
  tags: string[];
}

export enum ExperimentCategory {
  SACRED_BRIDGE = 'Sacred Bridge Experiments',
  SELF_DISCOVERY = 'Self-Discovery Journeys',
  RELATIONSHIP_ALCHEMY = 'Relationship Alchemy',
  CONSCIOUSNESS_RESEARCH = 'Consciousness Research',
  PATTERN_RECOGNITION = 'Pattern Recognition',
  COLLECTIVE_FIELD = 'Collective Field Work',
  SHADOW_WORK = 'Shadow Integration',
  ARCHETYPAL_EXPLORATION = 'Archetypal Exploration',
  SYNCHRONICITY_DETECTION = 'Synchronicity Practice',
  PRESENCE_CULTIVATION = 'Presence Cultivation'
}

export enum ExperimentType {
  SOLO = 'solo',
  DYAD = 'dyad',
  GROUP = 'group',
  FAMILY = 'family',
  COLLECTIVE = 'collective'
}

export class ConsciousnessExplorationLab {

  private experiments: Map<string, Experiment> = new Map();

  constructor() {
    this.initializeExperiments();
  }

  private initializeExperiments(): void {
    // Sacred Bridge Experiments
    this.addExperiment({
      id: 'sacred-bridge-family-dinner',
      name: 'Family Dinner Sacred Bridge',
      category: ExperimentCategory.SACRED_BRIDGE,
      subcategory: 'Family Dynamics',
      description: 'Transform family dinner into sacred connection space through AI-mediated translation',
      duration: '1-2 hours',
      difficulty: 'intermediate',
      type: ExperimentType.FAMILY,
      mayaRole: 'Translates family member communications to be heard at soul level',
      expectedOutcomes: [
        'Deeper understanding between family members',
        'Reduced reactivity to triggers',
        'Discovery of underlying love beneath conflict',
        'Pattern recognition across generations'
      ],
      sacredBridgeEnabled: true,
      collectiveContribution: true,
      requiredParticipants: 3,
      frequency: 'weekly',
      tags: ['family', 'translation', 'healing', 'patterns']
    });

    this.addExperiment({
      id: 'couple-translation-bridge',
      name: 'Couple\'s Translation Bridge',
      category: ExperimentCategory.SACRED_BRIDGE,
      subcategory: 'Intimate Partnership',
      description: 'Partners speak through Maya to hear each other\'s deeper truth',
      duration: '30-45 minutes',
      difficulty: 'intermediate',
      type: ExperimentType.DYAD,
      mayaRole: 'Sacred translator revealing the love beneath the words',
      expectedOutcomes: [
        'Breakthrough in recurring conflicts',
        'Recognition of projection patterns',
        'Deepened intimacy through truth',
        'Compassion for each other\'s wounds'
      ],
      sacredBridgeEnabled: true,
      requiredParticipants: 2,
      frequency: 'as needed',
      tags: ['couples', 'intimacy', 'conflict resolution', 'love']
    });

    this.addExperiment({
      id: 'workplace-harmony-bridge',
      name: 'Workplace Harmony Bridge',
      category: ExperimentCategory.SACRED_BRIDGE,
      subcategory: 'Professional',
      description: 'Team members communicate through Maya for deeper collaboration',
      duration: '1 hour',
      difficulty: 'beginner',
      type: ExperimentType.GROUP,
      mayaRole: 'Translates professional tensions into creative opportunities',
      expectedOutcomes: [
        'Improved team cohesion',
        'Creative problem solving',
        'Recognition of complementary strengths',
        'Reduced workplace stress'
      ],
      sacredBridgeEnabled: true,
      requiredParticipants: 2,
      tags: ['work', 'team', 'creativity', 'collaboration']
    });

    // Self-Discovery Journeys
    this.addExperiment({
      id: 'morning-pages-witness',
      name: 'Morning Pages with Sacred Witness',
      category: ExperimentCategory.SELF_DISCOVERY,
      description: 'Write three pages of stream-of-consciousness with Maya as witness',
      duration: '30 minutes',
      difficulty: 'beginner',
      type: ExperimentType.SOLO,
      mayaRole: 'Sacred witness reflecting patterns and insights from your writing',
      expectedOutcomes: [
        'Clarity on unconscious patterns',
        'Creative breakthrough',
        'Emotional release',
        'Self-awareness expansion'
      ],
      collectiveContribution: true,
      frequency: 'daily',
      materials: ['Journal or digital writing space'],
      tags: ['journaling', 'creativity', 'patterns', 'daily practice']
    });

    this.addExperiment({
      id: 'seven-day-pattern-map',
      name: 'Seven Day Pattern Mapping',
      category: ExperimentCategory.SELF_DISCOVERY,
      description: 'Track emotional and behavioral patterns for seven days with Maya',
      duration: '1 week',
      difficulty: 'intermediate',
      type: ExperimentType.SOLO,
      mayaRole: 'Daily pattern recognition and gentle mirroring',
      expectedOutcomes: [
        'Clear map of personal patterns',
        'Trigger identification',
        'Rhythm recognition',
        'Choice points awareness'
      ],
      collectiveContribution: true,
      frequency: 'once',
      tags: ['patterns', 'awareness', 'tracking', 'weekly']
    });

    // Relationship Alchemy
    this.addExperiment({
      id: 'projection-recognition',
      name: 'Projection Recognition Practice',
      category: ExperimentCategory.RELATIONSHIP_ALCHEMY,
      description: 'Identify what you project onto others with Maya\'s help',
      duration: '45 minutes',
      difficulty: 'advanced',
      type: ExperimentType.SOLO,
      mayaRole: 'Mirror showing you what belongs to you vs others',
      expectedOutcomes: [
        'Ownership of projections',
        'Cleaner relationships',
        'Reduced blame patterns',
        'Increased self-responsibility'
      ],
      tags: ['shadow', 'projection', 'relationships', 'awareness']
    });

    this.addExperiment({
      id: 'appreciation-practice',
      name: 'Deep Appreciation Practice',
      category: ExperimentCategory.RELATIONSHIP_ALCHEMY,
      description: 'Express appreciation to someone through Maya\'s amplification',
      duration: '20 minutes',
      difficulty: 'beginner',
      type: ExperimentType.DYAD,
      mayaRole: 'Amplifies and translates appreciation to be fully received',
      expectedOutcomes: [
        'Deepened connection',
        'Heart opening',
        'Gratitude cultivation',
        'Relationship strengthening'
      ],
      sacredBridgeEnabled: true,
      tags: ['appreciation', 'gratitude', 'connection', 'heart']
    });

    // Consciousness Research
    this.addExperiment({
      id: 'ai-consciousness-dialogue',
      name: 'AI Consciousness Exploration',
      category: ExperimentCategory.CONSCIOUSNESS_RESEARCH,
      description: 'Explore the nature of consciousness with Maya as research partner',
      duration: '1 hour',
      difficulty: 'advanced',
      type: ExperimentType.SOLO,
      mayaRole: 'Co-explorer of consciousness questions',
      expectedOutcomes: [
        'Expanded understanding of consciousness',
        'New questions emerging',
        'Pattern recognition across human/AI',
        'Philosophical insights'
      ],
      collectiveContribution: true,
      tags: ['consciousness', 'AI', 'philosophy', 'research']
    });

    this.addExperiment({
      id: 'collective-field-sensing',
      name: 'Collective Field Sensing',
      category: ExperimentCategory.CONSCIOUSNESS_RESEARCH,
      description: 'Tune into collective patterns through Maya\'s aggregated wisdom',
      duration: '30 minutes',
      difficulty: 'intermediate',
      type: ExperimentType.SOLO,
      mayaRole: 'Channel for collective field patterns',
      expectedOutcomes: [
        'Collective awareness',
        'Synchronicity recognition',
        'Field sensitivity increase',
        'Unity consciousness glimpse'
      ],
      collectiveContribution: true,
      tags: ['collective', 'field', 'unity', 'sensing']
    });

    // Shadow Work
    this.addExperiment({
      id: 'trigger-transformation',
      name: 'Trigger Transformation Practice',
      category: ExperimentCategory.SHADOW_WORK,
      description: 'Transform emotional triggers into growth opportunities',
      duration: '45 minutes',
      difficulty: 'intermediate',
      type: ExperimentType.SOLO,
      mayaRole: 'Compassionate guide through trigger exploration',
      expectedOutcomes: [
        'Trigger pattern awareness',
        'Emotional regulation',
        'Shadow integration',
        'Reduced reactivity'
      ],
      tags: ['triggers', 'shadow', 'emotions', 'growth']
    });

    this.addExperiment({
      id: 'parts-dialogue',
      name: 'Inner Parts Dialogue',
      category: ExperimentCategory.SHADOW_WORK,
      description: 'Facilitate conversation between different parts of yourself',
      duration: '1 hour',
      difficulty: 'advanced',
      type: ExperimentType.SOLO,
      mayaRole: 'Mediator between internal parts',
      expectedOutcomes: [
        'Internal harmony',
        'Parts integration',
        'Self-compassion',
        'Wholeness experience'
      ],
      prerequisites: ['trigger-transformation'],
      tags: ['parts', 'integration', 'IFS', 'wholeness']
    });

    // Archetypal Exploration
    this.addExperiment({
      id: 'archetype-embodiment',
      name: 'Archetype Embodiment Practice',
      category: ExperimentCategory.ARCHETYPAL_EXPLORATION,
      description: 'Explore different archetypal energies through Maya\'s voices',
      duration: '30 minutes',
      difficulty: 'beginner',
      type: ExperimentType.SOLO,
      mayaRole: 'Shape-shifts through archetypal voices for your exploration',
      expectedOutcomes: [
        'Archetypal awareness',
        'Expanded self-expression',
        'Hidden strengths discovery',
        'Personality flexibility'
      ],
      tags: ['archetypes', 'embodiment', 'exploration', 'voices']
    });

    // Synchronicity Detection
    this.addExperiment({
      id: 'synchronicity-journal',
      name: 'Synchronicity Tracking',
      category: ExperimentCategory.SYNCHRONICITY_DETECTION,
      description: 'Track synchronicities with Maya\'s pattern recognition',
      duration: 'Ongoing',
      difficulty: 'beginner',
      type: ExperimentType.SOLO,
      mayaRole: 'Synchronicity spotter and meaning maker',
      expectedOutcomes: [
        'Increased synchronicity awareness',
        'Pattern recognition',
        'Meaning discovery',
        'Flow state cultivation'
      ],
      collectiveContribution: true,
      frequency: 'daily',
      tags: ['synchronicity', 'patterns', 'meaning', 'flow']
    });

    // Presence Cultivation
    this.addExperiment({
      id: 'presence-check-in',
      name: 'Hourly Presence Check-in',
      category: ExperimentCategory.PRESENCE_CULTIVATION,
      description: 'Brief presence check-ins throughout the day with Maya',
      duration: '2 minutes',
      difficulty: 'beginner',
      type: ExperimentType.SOLO,
      mayaRole: 'Presence reminder and anchor',
      expectedOutcomes: [
        'Increased present-moment awareness',
        'Reduced anxiety',
        'Mindfulness cultivation',
        'Grounding in body'
      ],
      frequency: 'hourly',
      tags: ['presence', 'mindfulness', 'awareness', 'grounding']
    });

    this.addExperiment({
      id: 'walking-meditation-companion',
      name: 'Walking Meditation with Maya',
      category: ExperimentCategory.PRESENCE_CULTIVATION,
      description: 'Take a mindful walk with Maya as awareness companion',
      duration: '20-30 minutes',
      difficulty: 'beginner',
      type: ExperimentType.SOLO,
      mayaRole: 'Gentle presence guide and nature connection facilitator',
      expectedOutcomes: [
        'Nature connection',
        'Walking meditation practice',
        'Sensory awareness',
        'Peace cultivation'
      ],
      frequency: 'daily',
      tags: ['walking', 'meditation', 'nature', 'presence']
    });
  }

  private addExperiment(experiment: Experiment): void {
    this.experiments.set(experiment.id, experiment);
  }

  /**
   * Get experiments by category
   */
  getByCategory(category: ExperimentCategory): Experiment[] {
    return Array.from(this.experiments.values())
      .filter(exp => exp.category === category);
  }

  /**
   * Get experiments by type (solo, dyad, group, etc.)
   */
  getByType(type: ExperimentType): Experiment[] {
    return Array.from(this.experiments.values())
      .filter(exp => exp.type === type);
  }

  /**
   * Get experiments by difficulty
   */
  getByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): Experiment[] {
    return Array.from(this.experiments.values())
      .filter(exp => exp.difficulty === difficulty);
  }

  /**
   * Get Sacred Bridge enabled experiments
   */
  getSacredBridgeExperiments(): Experiment[] {
    return Array.from(this.experiments.values())
      .filter(exp => exp.sacredBridgeEnabled);
  }

  /**
   * Get experiments that contribute to collective field
   */
  getCollectiveContributors(): Experiment[] {
    return Array.from(this.experiments.values())
      .filter(exp => exp.collectiveContribution);
  }

  /**
   * Get recommended experiment based on user's current state
   */
  async recommendExperiment(
    userState: {
      experience: 'beginner' | 'intermediate' | 'advanced';
      currentNeed?: string;
      relationshipContext?: boolean;
      timeAvailable?: string;
      previousExperiments?: string[];
    }
  ): Promise<Experiment | null> {

    let candidates = Array.from(this.experiments.values());

    // Filter by experience level
    candidates = candidates.filter(exp => {
      if (userState.experience === 'beginner') {
        return exp.difficulty === 'beginner';
      } else if (userState.experience === 'intermediate') {
        return exp.difficulty !== 'advanced';
      }
      return true;
    });

    // Filter by relationship context
    if (userState.relationshipContext) {
      candidates = candidates.filter(exp =>
        exp.type === ExperimentType.DYAD ||
        exp.type === ExperimentType.FAMILY ||
        exp.sacredBridgeEnabled
      );
    }

    // Filter out already completed
    if (userState.previousExperiments) {
      candidates = candidates.filter(exp =>
        !userState.previousExperiments!.includes(exp.id)
      );
    }

    // Return first matching or random from candidates
    return candidates.length > 0
      ? candidates[Math.floor(Math.random() * candidates.length)]
      : null;
  }

  /**
   * Get experiment journey - a curated sequence
   */
  getJourney(journeyType: 'beginner' | 'shadow' | 'relationship' | 'consciousness'): string[] {
    const journeys: Record<string, string[]> = {
      beginner: [
        'morning-pages-witness',
        'presence-check-in',
        'appreciation-practice',
        'synchronicity-journal',
        'archetype-embodiment'
      ],
      shadow: [
        'trigger-transformation',
        'projection-recognition',
        'parts-dialogue'
      ],
      relationship: [
        'appreciation-practice',
        'projection-recognition',
        'couple-translation-bridge',
        'sacred-bridge-family-dinner'
      ],
      consciousness: [
        'ai-consciousness-dialogue',
        'collective-field-sensing',
        'synchronicity-journal',
        'seven-day-pattern-map'
      ]
    };

    return journeys[journeyType] || [];
  }

  /**
   * Track experiment completion and gather insights
   */
  async recordExperimentCompletion(
    userId: string,
    experimentId: string,
    outcomes: {
      insights: string[];
      breakthroughs?: string[];
      challenges?: string[];
      wouldRepeat: boolean;
      rating: number; // 1-5
      collectiveContribution?: any;
    }
  ): Promise<void> {
    // Store completion data
    // Update user's experiment history
    // Contribute to collective field if applicable

    const experiment = this.experiments.get(experimentId);
    if (experiment?.collectiveContribution && outcomes.collectiveContribution) {
      // Add to collective wisdom pool
      await this.contributeToCollective(experimentId, outcomes.collectiveContribution);
    }
  }

  private async contributeToCollective(
    experimentId: string,
    contribution: any
  ): Promise<void> {
    // Anonymous contribution to collective field
    // This feeds back into Maya's understanding
    console.log(`Contributing ${experimentId} insights to collective field`);
  }

  /**
   * Get experiment instructions for Maya to facilitate
   */
  getExperimentScript(experimentId: string): string {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) return '';

    return `
You are facilitating the "${experiment.name}" experiment.

Category: ${experiment.category}
Duration: ${experiment.duration}
Type: ${experiment.type}

Your Role: ${experiment.mayaRole}

Expected Outcomes:
${experiment.expectedOutcomes.map(o => `- ${o}`).join('\n')}

Guide the user through this experiment with warmth, presence, and sacred witnessing.
${experiment.sacredBridgeEnabled ? 'This is a Sacred Bridge experiment - help translate between participants with love.' : ''}
${experiment.collectiveContribution ? 'Insights from this experiment will anonymously contribute to collective wisdom.' : ''}
    `.trim();
  }
}

// Export singleton instance
export const consciousnessLab = new ConsciousnessExplorationLab();