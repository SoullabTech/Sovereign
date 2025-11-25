/**
 * SPIRALOGIC ENGINE
 *
 * Core consciousness progression engine that replaces linear quest trees
 * with spiral deepening mechanics. Based on actual consciousness development
 * principles rather than gaming progression.
 *
 * Features:
 * - Non-linear spiral progression
 * - Balance requirements across elements
 * - Integration emergence patterns
 * - Shadow work gating system
 * - Time-based integration periods
 * - Conditional content rendering
 */

import { ObsidianVaultBridge } from '../../bridges/obsidian-vault-bridge';

export interface SpiralPosition {
  element: string;
  depth: number;
  angle: number; // 0-360 on current spiral
  phase: 'entering' | 'exploring' | 'integrating' | 'transcending';
}

export interface UserSpiralState {
  userId: string;
  position: SpiralPosition;
  elementDepths: Record<string, number>;
  integrations: string[];
  shadowDepth: number;
  lastTransition: Date;
  spiralVelocity: number;
  totalJourneyTime: number;
  emergencePatterns: string[];
}

export interface SpiralProgression {
  success: boolean;
  blocked?: boolean;
  reason?: string;
  suggestion?: string;
  element: string;
  depth: number;
  content?: any;
  integrations?: string[];
  visualization?: any;
  newUnlocks?: string[];
}

export interface IntegrationPattern {
  name: string;
  elements: string[];
  minDepthRequired: number;
  description: string;
  practices: string[];
  unlocks: string[];
}

export class SpiralogicEngine {
  private states: Map<string, UserSpiralState> = new Map();
  private obsidian: ObsidianVaultBridge;
  private integrationPatterns: IntegrationPattern[];
  private spiralQuests: any;

  constructor() {
    this.obsidian = new ObsidianVaultBridge();
    this.initializeIntegrationPatterns();
    this.initializeSpiralQuests();
  }

  async initialize() {
    console.log("🌀 Initializing Spiralogic Engine...");
    await this.obsidian.connect();
    console.log("✓ Spiralogic Engine initialized");
  }

  /**
   * Main entry point for spiral progression
   */
  async enterSpiral(userId: string, element: string): Promise<SpiralProgression> {
    let state = this.states.get(userId);

    if (!state) {
      state = this.initializeUserState(userId);
      this.states.set(userId, state);
    }

    const currentDepth = state.elementDepths[element] || 0;
    const nextDepth = currentDepth + 1;

    // Check progression rules
    const progressionCheck = this.checkProgressionRules(state, element, nextDepth);
    if (!progressionCheck.canProgress) {
      return {
        success: false,
        blocked: true,
        reason: progressionCheck.reason,
        suggestion: progressionCheck.suggestion,
        element,
        depth: currentDepth
      };
    }

    // Get content for this spiral depth
    const content = await this.getSpiralogicContent(element, nextDepth, state);

    // Update state
    state.position = {
      element,
      depth: nextDepth,
      angle: 0,
      phase: 'entering'
    };
    state.elementDepths[element] = nextDepth;
    state.lastTransition = new Date();

    // Check for emergent integrations
    const newIntegrations = this.checkEmergentIntegrations(state);
    state.integrations.push(...newIntegrations);

    // Check for new unlocks
    const newUnlocks = this.checkNewUnlocks(state, newIntegrations);

    return {
      success: true,
      element,
      depth: nextDepth,
      content,
      integrations: newIntegrations,
      visualization: this.generateSpiralVisualization(state),
      newUnlocks
    };
  }

  /**
   * Check if user can progress based on Spiralogic rules
   */
  private checkProgressionRules(state: UserSpiralState, element: string, targetDepth: number): any {
    // Rule 1: Can't skip depths
    const currentDepth = state.elementDepths[element] || 0;
    if (targetDepth > currentDepth + 1) {
      return {
        canProgress: false,
        reason: "You cannot skip spiral depths. Each loop must be completed.",
        suggestion: `Complete depth ${currentDepth + 1} of ${element} first.`
      };
    }

    // Rule 2: Balance requirement - can't be more than 2 depths ahead of others
    const depths = Object.values(state.elementDepths);
    const minDepth = depths.length > 0 ? Math.min(...depths) : 0;
    if (targetDepth > minDepth + 2) {
      const laggingElements = Object.entries(state.elementDepths)
        .filter(([_, depth]) => depth === minDepth)
        .map(([elem, _]) => elem);

      return {
        canProgress: false,
        reason: "Balance must be maintained across all elements.",
        suggestion: `Explore ${laggingElements.join(' or ')} to maintain spiral balance.`
      };
    }

    // Rule 3: Shadow work gate at average depth 2
    const avgDepth = depths.length > 0 ? depths.reduce((a, b) => a + b, 0) / depths.length : 0;
    if (avgDepth >= 2 && state.shadowDepth === 0 && element !== 'shadow') {
      return {
        canProgress: false,
        reason: "The shadow calls. Deep work requires shadow integration.",
        suggestion: "Begin shadow work before deepening other elements."
      };
    }

    // Rule 4: Integration time requirement
    const timeSinceLastTransition = Date.now() - state.lastTransition.getTime();
    const requiredTime = this.calculateIntegrationTime(targetDepth);
    if (timeSinceLastTransition < requiredTime) {
      const hoursRemaining = Math.ceil((requiredTime - timeSinceLastTransition) / (60 * 60 * 1000));
      return {
        canProgress: false,
        reason: "Integration time is required for spiral deepening.",
        suggestion: `Return in ${hoursRemaining} hours for deeper spiral work.`
      };
    }

    return { canProgress: true };
  }

  /**
   * Get content based on spiral depth and Obsidian vault
   */
  private async getSpiralogicContent(element: string, depth: number, state: UserSpiralState) {
    // Get content from Obsidian vault
    const vaultContent = await this.obsidian.getElementalWisdom(element);

    // Get spiral-specific quest
    const quest = this.spiralQuests[element]?.[depth] || this.getDefaultQuest(element, depth);

    // Get practices for this depth
    const practices = this.getPracticesForDepth(element, depth);

    // Get integration suggestions
    const integrationSuggestions = this.getIntegrationSuggestions(state, element);

    // Generate reflection prompts
    const reflections = this.generateReflections(element, depth, state);

    return {
      quest,
      practices,
      vaultWisdom: vaultContent,
      integrationSuggestions,
      reflections,
      depth,
      element
    };
  }

  /**
   * Check for emergent integration patterns
   */
  private checkEmergentIntegrations(state: UserSpiralState): string[] {
    const newIntegrations: string[] = [];

    for (const pattern of this.integrationPatterns) {
      // Skip if already integrated
      if (state.integrations.includes(pattern.name)) continue;

      // Check if all required elements are at minimum depth
      const hasRequiredElements = pattern.elements.every(element =>
        (state.elementDepths[element] || 0) >= pattern.minDepthRequired
      );

      if (hasRequiredElements) {
        newIntegrations.push(pattern.name);
        console.log(`🌟 New integration emerged: ${pattern.name}`);
      }
    }

    return newIntegrations;
  }

  /**
   * Generate spiral visualization
   */
  private generateSpiralVisualization(state: UserSpiralState) {
    const elements = ['fire', 'water', 'earth', 'air', 'aether', 'shadow'];
    const visualization: any = {};

    elements.forEach(element => {
      const depth = state.elementDepths[element] || 0;
      const maxDepth = 3;

      visualization[element] = {
        current: depth,
        max: maxDepth,
        progress: this.renderProgressSpiral(depth, maxDepth, element === state.position.element),
        mastered: depth === maxDepth,
        icon: this.getElementIcon(element),
        color: this.getElementColor(element)
      };
    });

    // Calculate total spiral completion
    const totalDepth = Object.values(state.elementDepths).reduce((a: number, b: number) => a + b, 0);
    const maxTotalDepth = elements.length * 3 + 3; // +3 for shadow work
    const spiralCompletion = (totalDepth / maxTotalDepth) * 100;

    return {
      elements: visualization,
      spiralCompletion: `${spiralCompletion.toFixed(1)}%`,
      integrations: state.integrations,
      emergencePatterns: state.emergencePatterns,
      currentPosition: state.position,
      shadowDepth: state.shadowDepth
    };
  }

  /**
   * Render progress spiral for element
   */
  private renderProgressSpiral(current: number, max: number, isActive: boolean): string {
    const symbols = Array(max).fill(0).map((_, i) => {
      if (i < current) return '●';
      if (i === current && isActive) return '◐';
      return '○';
    });

    return symbols.join('→');
  }

  /**
   * Initialize integration patterns
   */
  private initializeIntegrationPatterns() {
    this.integrationPatterns = [
      {
        name: 'steam-rising',
        elements: ['fire', 'water'],
        minDepthRequired: 1,
        description: 'Fire and Water dance together - emotional alchemy',
        practices: ['steam-breathing', 'emotional-fire', 'passion-flow'],
        unlocks: ['emotional-mastery', 'creative-flow']
      },
      {
        name: 'grounded-fire',
        elements: ['fire', 'earth'],
        minDepthRequired: 1,
        description: 'Passion manifests through solid foundation',
        practices: ['rooted-flame', 'manifesting-fire', 'earth-forge'],
        unlocks: ['sustained-passion', 'creative-manifestation']
      },
      {
        name: 'flowing-earth',
        elements: ['water', 'earth'],
        minDepthRequired: 2,
        description: 'Emotions shape form - the mud lotus blooms',
        practices: ['mudra-flow', 'earth-tears', 'lotus-emergence'],
        unlocks: ['emotional-grounding', 'form-fluidity']
      },
      {
        name: 'sacred-breath',
        elements: ['air', 'fire', 'water'],
        minDepthRequired: 2,
        description: 'Breath unites passion and emotion through clarity',
        practices: ['trinity-breathing', 'elemental-pranayama', 'unified-breath'],
        unlocks: ['conscious-breathing', 'elemental-harmony']
      },
      {
        name: 'quintessence',
        elements: ['fire', 'water', 'earth', 'air', 'aether'],
        minDepthRequired: 2,
        description: 'All elements unite in the fifth essence',
        practices: ['quintessence-meditation', 'five-element-flow', 'unity-practice'],
        unlocks: ['elemental-mastery', 'unified-consciousness']
      },
      {
        name: 'great-work',
        elements: ['fire', 'water', 'earth', 'air', 'aether', 'shadow'],
        minDepthRequired: 3,
        description: 'The alchemical opus - lead into gold',
        practices: ['solve-et-coagula', 'shadow-fire', 'philosophers-stone'],
        unlocks: ['mastery', 'awakened-consciousness', 'teacher-initiation']
      }
    ];
  }

  /**
   * Initialize spiral quests
   */
  private initializeSpiralQuests() {
    this.spiralQuests = {
      fire: {
        1: {
          question: "What needs to ignite?",
          theme: "The Spark Within",
          focus: "Discovering your inner flame and passion"
        },
        2: {
          question: "What must burn away?",
          theme: "The Sacred Destruction",
          focus: "Releasing what no longer serves through fire"
        },
        3: {
          question: "What emerges from the ashes?",
          theme: "The Phoenix Rising",
          focus: "Rebirth and renewal through conscious destruction"
        }
      },
      water: {
        1: {
          question: "What emotions are present?",
          theme: "The Feeling Waters",
          focus: "Sensing and honoring your emotional landscape"
        },
        2: {
          question: "What flows beneath the surface?",
          theme: "The Deep Currents",
          focus: "Exploring unconscious emotional patterns"
        },
        3: {
          question: "How do you merge with the flow?",
          theme: "Becoming Water",
          focus: "Dissolving resistance and becoming fluid awareness"
        }
      },
      earth: {
        1: {
          question: "Where is your foundation?",
          theme: "The Solid Ground",
          focus: "Establishing stability and presence"
        },
        2: {
          question: "What structure serves your growth?",
          theme: "The Sacred Architecture",
          focus: "Building sustainable patterns and practices"
        },
        3: {
          question: "How do you embody stillness?",
          theme: "The Mountain Being",
          focus: "Becoming unshakeable presence and wisdom"
        }
      },
      air: {
        1: {
          question: "What thoughts arise?",
          theme: "The Mental Winds",
          focus: "Observing the movements of mind"
        },
        2: {
          question: "What clarity seeks expression?",
          theme: "The Clear Sky",
          focus: "Finding truth beyond mental formations"
        },
        3: {
          question: "How does wisdom speak through you?",
          theme: "The Voice of Truth",
          focus: "Becoming a channel for clear expression"
        }
      },
      aether: {
        1: {
          question: "What connects all things?",
          theme: "The Unified Field",
          focus: "Sensing the underlying unity"
        },
        2: {
          question: "How does spirit manifest?",
          theme: "The Sacred Manifestation",
          focus: "Witnessing consciousness in form"
        },
        3: {
          question: "What transcends duality?",
          theme: "The Non-Dual Awareness",
          focus: "Resting in undivided consciousness"
        }
      },
      shadow: {
        1: {
          question: "What remains hidden?",
          theme: "The Unseen Aspects",
          focus: "Acknowledging what you've avoided or denied"
        },
        2: {
          question: "What seeks integration?",
          theme: "The Shadow Dance",
          focus: "Embracing and integrating rejected parts"
        },
        3: {
          question: "How does darkness illuminate?",
          theme: "The Dark Light",
          focus: "Finding wisdom and gifts in the shadow"
        }
      }
    };
  }

  /**
   * Helper methods
   */
  private initializeUserState(userId: string): UserSpiralState {
    return {
      userId,
      position: { element: 'fire', depth: 0, angle: 0, phase: 'entering' },
      elementDepths: {},
      integrations: [],
      shadowDepth: 0,
      lastTransition: new Date(Date.now() - 24 * 60 * 60 * 1000), // Allow immediate first progression
      spiralVelocity: 1,
      totalJourneyTime: 0,
      emergencePatterns: []
    };
  }

  private calculateIntegrationTime(depth: number): number {
    // Progressive integration time: 1 hour, 6 hours, 12 hours
    const baseTime = 60 * 60 * 1000; // 1 hour in milliseconds
    return baseTime * Math.pow(2, depth - 1);
  }

  private getPracticesForDepth(element: string, depth: number): string[] {
    const practices: any = {
      fire: {
        1: ['candle-gazing', 'spark-meditation', 'passion-sensing'],
        2: ['fire-breathing', 'release-ritual', 'anger-alchemy'],
        3: ['phoenix-embodiment', 'eternal-flame', 'sacred-destruction']
      },
      water: {
        1: ['flow-sensing', 'emotion-waves', 'water-scrying'],
        2: ['deep-diving', 'current-navigation', 'emotional-depth'],
        3: ['ocean-merge', 'formless-flow', 'water-consciousness']
      },
      earth: {
        1: ['grounding-roots', 'foundation-sensing', 'earth-connection'],
        2: ['mountain-sitting', 'structure-building', 'earth-wisdom'],
        3: ['bedrock-being', 'crystallization', 'mountain-consciousness']
      },
      air: {
        1: ['breath-awareness', 'mind-watching', 'thought-clouds'],
        2: ['clarity-breathing', 'mental-spaciousness', 'air-wisdom'],
        3: ['wind-consciousness', 'thought-mastery', 'clear-expression']
      },
      aether: {
        1: ['unity-sensing', 'connection-awareness', 'field-perception'],
        2: ['spirit-manifestation', 'consciousness-recognition', 'unity-practice'],
        3: ['non-dual-awareness', 'consciousness-embodiment', 'unity-being']
      },
      shadow: {
        1: ['shadow-acknowledgment', 'projection-recognition', 'denied-aspects'],
        2: ['shadow-dialogue', 'integration-practice', 'wholeness-embrace'],
        3: ['shadow-mastery', 'dark-light-unity', 'complete-acceptance']
      }
    };

    return practices[element]?.[depth] || ['contemplation', 'presence-practice'];
  }

  private getIntegrationSuggestions(state: UserSpiralState, element: string): string[] {
    const suggestions: string[] = [];

    // Suggest based on available integrations
    for (const pattern of this.integrationPatterns) {
      if (pattern.elements.includes(element) && !state.integrations.includes(pattern.name)) {
        const otherElements = pattern.elements.filter(e => e !== element);
        const needsWork = otherElements.filter(e =>
          (state.elementDepths[e] || 0) < pattern.minDepthRequired
        );

        if (needsWork.length === 0) {
          suggestions.push(`Ready for ${pattern.name} integration`);
        } else if (needsWork.length === 1) {
          suggestions.push(`Develop ${needsWork[0]} to unlock ${pattern.name}`);
        }
      }
    }

    return suggestions;
  }

  private generateReflections(element: string, depth: number, state: UserSpiralState): string[] {
    const baseReflections = [
      `How has your relationship with ${element} evolved?`,
      `What resistance do you notice with ${element}?`,
      `How does ${element} want to express through you?`
    ];

    if (depth > 1) {
      baseReflections.push(`What did you discover in your previous ${element} spiral?`);
    }

    if (state.integrations.length > 0) {
      baseReflections.push(`How does ${element} connect with your other integrated elements?`);
    }

    return baseReflections;
  }

  private getDefaultQuest(element: string, depth: number) {
    return {
      question: `What does ${element} reveal at depth ${depth}?`,
      theme: `${element} Depth ${depth}`,
      focus: `Exploring ${element} at a deeper level`
    };
  }

  private checkNewUnlocks(state: UserSpiralState, newIntegrations: string[]): string[] {
    const unlocks: string[] = [];

    // Check integration unlocks
    for (const integration of newIntegrations) {
      const pattern = this.integrationPatterns.find(p => p.name === integration);
      if (pattern) {
        unlocks.push(...pattern.unlocks);
      }
    }

    // Check depth-based unlocks
    const totalDepth = Object.values(state.elementDepths).reduce((a: number, b: number) => a + b, 0);
    if (totalDepth >= 10 && !unlocks.includes('spiral-teacher')) {
      unlocks.push('spiral-teacher');
    }

    return unlocks;
  }

  private getElementIcon(element: string): string {
    const icons: any = {
      fire: '🔥',
      water: '💧',
      earth: '🌍',
      air: '💨',
      aether: '✨',
      shadow: '🌑'
    };
    return icons[element] || '⚫';
  }

  private getElementColor(element: string): string {
    const colors: any = {
      fire: '#ff4444',
      water: '#4444ff',
      earth: '#44aa44',
      air: '#ffff44',
      aether: '#aa44ff',
      shadow: '#444444'
    };
    return colors[element] || '#888888';
  }

  /**
   * Public API methods
   */
  public async getUserState(userId: string): Promise<UserSpiralState | null> {
    return this.states.get(userId) || null;
  }

  public async checkUserIntegrations(userId: string): Promise<string[]> {
    const state = this.states.get(userId);
    return state ? state.integrations : [];
  }

  public async getUserSpiralPosition(userId: string): Promise<SpiralPosition | null> {
    const state = this.states.get(userId);
    return state ? state.position : null;
  }

  public async processQuestAction(userId: string, element: string, data: any): Promise<any> {
    // Implementation for processing quest actions
    return await this.enterSpiral(userId, element);
  }
}

export default SpiralogicEngine;