/**
 * SPIRAL QUEST SYSTEM
 *
 * Instead of linear quest trees, users journey through spiraling paths
 * that revisit themes with increasing depth and integration.
 *
 * Each loop around the spiral unlocks deeper wisdom, new perspectives,
 * and more profound integrations of the same elemental territories.
 */

export interface SpiralQuest {
  id: string;
  name: string;
  element: string;
  depth: number;
  loop: number; // Which spiral loop (1st time, 2nd time, etc.)
  stage: 'threshold' | 'challenge' | 'insight' | 'integration' | 'mastery';
  prerequisites: string[];
  rewards: QuestReward[];
  nextSpiral: string | null;
}

export interface QuestReward {
  type: 'insight' | 'practice' | 'integration' | 'framework' | 'shadow_gift';
  content: string;
  element: string;
  depth: number;
}

export interface SpiralPath {
  currentQuest: SpiralQuest;
  completedSpirals: Map<string, number>; // element -> loop count
  unlockedIntegrations: string[];
  shadowGifts: string[];
  spiralDepth: number;
  elementalMastery: Map<string, number>;
}

export class SpiralQuestSystem {
  private questMap: Map<string, SpiralQuest> = new Map();
  private userPaths: Map<string, SpiralPath> = new Map();

  /**
   * The Elemental Spiral Quests
   * Each element has multiple loops with increasing depth
   */
  private readonly elementalSpirals = {
    fire: [
      {
        loop: 1,
        name: 'Spark of Awakening',
        challenge: 'What needs to ignite?',
        insight: 'Fire begins with a single spark',
        integration: 'Channel passion into purpose'
      },
      {
        loop: 2,
        name: 'The Forge of Transformation',
        challenge: 'What must burn away?',
        insight: 'Destruction creates space for creation',
        integration: 'Transform resistance into fuel'
      },
      {
        loop: 3,
        name: 'Phoenix Rising',
        challenge: 'What emerges from the ashes?',
        insight: 'Every ending births a beginning',
        integration: 'Embody cyclical renewal'
      }
    ],
    water: [
      {
        loop: 1,
        name: 'Surface Ripples',
        challenge: 'What emotions are present?',
        insight: 'Feelings are messengers',
        integration: 'Honor emotional intelligence'
      },
      {
        loop: 2,
        name: 'Deep Currents',
        challenge: 'What flows beneath?',
        insight: 'The unconscious speaks through feeling',
        integration: 'Navigate emotional depths'
      },
      {
        loop: 3,
        name: 'Ocean of Being',
        challenge: 'How do you merge with the flow?',
        insight: 'Surrender is power',
        integration: 'Become the water'
      }
    ],
    earth: [
      {
        loop: 1,
        name: 'Finding Ground',
        challenge: 'Where is your foundation?',
        insight: 'Stability enables growth',
        integration: 'Root into presence'
      },
      {
        loop: 2,
        name: 'Building Form',
        challenge: 'What structure serves?',
        insight: 'Boundaries create freedom',
        integration: 'Manifest with intention'
      },
      {
        loop: 3,
        name: 'Mountain Presence',
        challenge: 'How do you embody stillness?',
        insight: 'Immovability is a choice',
        integration: 'Become unshakeable'
      }
    ],
    air: [
      {
        loop: 1,
        name: 'First Breath',
        challenge: 'What needs clarity?',
        insight: 'Perspective shifts everything',
        integration: 'See with new eyes'
      },
      {
        loop: 2,
        name: 'Wind of Change',
        challenge: 'What patterns need disruption?',
        insight: 'Movement prevents stagnation',
        integration: 'Dance with uncertainty'
      },
      {
        loop: 3,
        name: 'Sky Mind',
        challenge: 'How vast is your view?',
        insight: 'Limitlessness is natural',
        integration: 'Embrace infinite perspective'
      }
    ],
    aether: [
      {
        loop: 1,
        name: 'Glimpse of Unity',
        challenge: 'Where do opposites meet?',
        insight: 'Separation is illusion',
        integration: 'Touch the unified field'
      },
      {
        loop: 2,
        name: 'Weaving Elements',
        challenge: 'How do all parts connect?',
        insight: 'Everything influences everything',
        integration: 'Become the weaver'
      },
      {
        loop: 3,
        name: 'Pure Presence',
        challenge: 'What remains when all dissolves?',
        insight: 'Essence transcends form',
        integration: 'Rest in being'
      }
    ],
    shadow: [
      {
        loop: 1,
        name: 'Meeting the Hidden',
        challenge: 'What do you refuse to see?',
        insight: 'The rejected holds power',
        integration: 'Befriend the shadow'
      },
      {
        loop: 2,
        name: 'Shadow Dancing',
        challenge: 'How does shadow serve?',
        insight: 'Darkness teaches light',
        integration: 'Partner with shadow'
      },
      {
        loop: 3,
        name: 'Shadow Mastery',
        challenge: 'What gift does shadow bring?',
        insight: 'Integration creates wholeness',
        integration: 'Shadow becomes ally'
      }
    ]
  };

  /**
   * Integration Quests - Unlocked by completing elemental spirals
   */
  private readonly integrationQuests = {
    'fire-water': {
      name: 'Steam Rising',
      challenge: 'How do passion and emotion dance?',
      prerequisite: ['fire-1', 'water-1'],
      reward: 'Dynamic balance between action and feeling'
    },
    'earth-air': {
      name: 'Mountain Wind',
      challenge: 'How does form meet freedom?',
      prerequisite: ['earth-1', 'air-1'],
      reward: 'Grounded flexibility'
    },
    'all-elements': {
      name: 'The Quintessence',
      challenge: 'How do all elements unite in you?',
      prerequisite: ['fire-2', 'water-2', 'earth-2', 'air-2', 'aether-2'],
      reward: 'Elemental mastery'
    },
    'shadow-integration': {
      name: 'The Great Work',
      challenge: 'How does shadow complete the whole?',
      prerequisite: ['shadow-2', 'all-elements'],
      reward: 'Unified consciousness'
    }
  };

  /**
   * Initialize quest system
   */
  constructor() {
    this.initializeQuests();
  }

  /**
   * Public initialize method for orchestrator
   */
  async initialize(): Promise<void> {
    // System is already initialized in constructor
    console.log('  ✓ Spiral Quest System initialized');
  }

  /**
   * Create all quest objects
   */
  private initializeQuests(): void {
    // Create elemental spiral quests
    Object.entries(this.elementalSpirals).forEach(([element, spirals]) => {
      spirals.forEach((spiral, index) => {
        const quest: SpiralQuest = {
          id: `${element}-${spiral.loop}`,
          name: spiral.name,
          element,
          depth: spiral.loop * 0.33,
          loop: spiral.loop,
          stage: 'threshold',
          prerequisites: spiral.loop > 1 ? [`${element}-${spiral.loop - 1}`] : [],
          rewards: [
            {
              type: 'insight',
              content: spiral.insight,
              element,
              depth: spiral.loop * 0.33
            },
            {
              type: 'integration',
              content: spiral.integration,
              element,
              depth: spiral.loop * 0.33
            }
          ],
          nextSpiral: spiral.loop < 3 ? `${element}-${spiral.loop + 1}` : null
        };

        this.questMap.set(quest.id, quest);
      });
    });

    // Create integration quests
    Object.entries(this.integrationQuests).forEach(([id, quest]) => {
      const integrationQuest: SpiralQuest = {
        id,
        name: quest.name,
        element: 'aether', // Integration transcends single elements
        depth: 0.8,
        loop: 1,
        stage: 'threshold',
        prerequisites: quest.prerequisite,
        rewards: [
          {
            type: 'integration',
            content: quest.reward,
            element: 'aether',
            depth: 0.9
          }
        ],
        nextSpiral: null
      };

      this.questMap.set(id, integrationQuest);
    });
  }

  /**
   * Start user on spiral path
   */
  beginJourney(userId: string, element: string): SpiralQuest {
    const firstQuest = this.questMap.get(`${element}-1`);
    if (!firstQuest) {
      throw new Error(`No quest found for element: ${element}`);
    }

    const path: SpiralPath = {
      currentQuest: firstQuest,
      completedSpirals: new Map(),
      unlockedIntegrations: [],
      shadowGifts: [],
      spiralDepth: 0,
      elementalMastery: new Map()
    };

    this.userPaths.set(userId, path);
    return firstQuest;
  }

  /**
   * Progress through quest stages
   */
  progressQuest(userId: string, response: string): QuestProgress {
    const path = this.userPaths.get(userId);
    if (!path) {
      throw new Error('No active journey found');
    }

    const quest = path.currentQuest;
    const progress: QuestProgress = {
      quest,
      stageComplete: false,
      questComplete: false,
      newUnlocks: [],
      spiralComplete: false,
      message: ''
    };

    // Progress through stages
    switch (quest.stage) {
      case 'threshold':
        quest.stage = 'challenge';
        progress.message = this.getChallengePrompt(quest);
        break;

      case 'challenge':
        quest.stage = 'insight';
        progress.stageComplete = true;
        progress.message = this.revealInsight(quest);
        break;

      case 'insight':
        quest.stage = 'integration';
        progress.message = this.offerIntegration(quest);
        break;

      case 'integration':
        quest.stage = 'mastery';
        progress.questComplete = true;
        progress.message = this.completeSpiralLoop(quest);

        // Mark quest complete
        path.completedSpirals.set(quest.element, quest.loop);

        // Check for unlocked integrations
        progress.newUnlocks = this.checkUnlocks(path);

        // Update mastery
        const currentMastery = path.elementalMastery.get(quest.element) || 0;
        path.elementalMastery.set(quest.element, currentMastery + 0.33);

        break;
    }

    // Update spiral depth
    path.spiralDepth = this.calculateSpiralDepth(path);

    return progress;
  }

  /**
   * Get challenge prompt for quest
   */
  private getChallengePrompt(quest: SpiralQuest): string {
    const spiral = this.elementalSpirals[quest.element][quest.loop - 1];
    return spiral.challenge;
  }

  /**
   * Reveal insight from quest
   */
  private revealInsight(quest: SpiralQuest): string {
    const reward = quest.rewards.find(r => r.type === 'insight');
    return `💡 Insight: ${reward?.content}`;
  }

  /**
   * Offer integration practice
   */
  private offerIntegration(quest: SpiralQuest): string {
    const reward = quest.rewards.find(r => r.type === 'integration');
    return `🌀 Integration: ${reward?.content}`;
  }

  /**
   * Complete spiral loop
   */
  private completeSpiralLoop(quest: SpiralQuest): string {
    if (quest.nextSpiral) {
      return `✨ ${quest.name} complete! Ready for deeper spiral: ${quest.nextSpiral}`;
    }
    return `🎯 ${quest.name} mastered! Element fully integrated.`;
  }

  /**
   * Check for newly unlocked content
   */
  private checkUnlocks(path: SpiralPath): string[] {
    const unlocks: string[] = [];

    // Check each integration quest
    Object.entries(this.integrationQuests).forEach(([id, quest]) => {
      if (!path.unlockedIntegrations.includes(id)) {
        const prereqsMet = quest.prerequisite.every(prereq =>
          path.completedSpirals.has(prereq.split('-')[0]) &&
          path.completedSpirals.get(prereq.split('-')[0])! >= parseInt(prereq.split('-')[1])
        );

        if (prereqsMet) {
          path.unlockedIntegrations.push(id);
          unlocks.push(quest.name);
        }
      }
    });

    return unlocks;
  }

  /**
   * Calculate overall spiral depth
   */
  private calculateSpiralDepth(path: SpiralPath): number {
    let totalDepth = 0;
    let elementCount = 0;

    path.elementalMastery.forEach(mastery => {
      totalDepth += mastery;
      elementCount++;
    });

    return elementCount > 0 ? totalDepth / elementCount : 0;
  }

  /**
   * Get available quests for user
   */
  getAvailableQuests(userId: string): SpiralQuest[] {
    const path = this.userPaths.get(userId);
    if (!path) return [];

    const available: SpiralQuest[] = [];

    // Check all quests
    this.questMap.forEach(quest => {
      // Check if prerequisites are met
      const prereqsMet = quest.prerequisites.every(prereq => {
        const [element, loop] = prereq.split('-');
        const completed = path.completedSpirals.get(element) || 0;
        return completed >= parseInt(loop);
      });

      // Check if not already completed
      const notCompleted = !(
        path.completedSpirals.get(quest.element) === quest.loop
      );

      if (prereqsMet && notCompleted) {
        available.push(quest);
      }
    });

    return available;
  }

  /**
   * Get user's journey map
   */
  getJourneyMap(userId: string): any {
    const path = this.userPaths.get(userId);
    if (!path) return null;

    return {
      currentQuest: path.currentQuest,
      spiralDepth: path.spiralDepth,
      elementalMastery: Object.fromEntries(path.elementalMastery),
      completedSpirals: Object.fromEntries(path.completedSpirals),
      unlockedIntegrations: path.unlockedIntegrations,
      shadowGifts: path.shadowGifts,
      nextQuests: this.getAvailableQuests(userId).map(q => ({
        name: q.name,
        element: q.element,
        depth: q.depth
      }))
    };
  }

  /**
   * Special shadow gift unlocks
   */
  unlockShadowGift(userId: string, gift: string): void {
    const path = this.userPaths.get(userId);
    if (path && !path.shadowGifts.includes(gift)) {
      path.shadowGifts.push(gift);
    }
  }

  /**
   * Check if user has completed element
   */
  hasElementMastery(userId: string, element: string): boolean {
    const path = this.userPaths.get(userId);
    if (!path) return false;

    const mastery = path.elementalMastery.get(element) || 0;
    return mastery >= 0.99; // Three loops = mastery
  }

  /**
   * Get spiral visualization
   */
  visualizeSpiral(userId: string): string {
    const path = this.userPaths.get(userId);
    if (!path) return '◉';

    let visual = '     🌀 YOUR SPIRAL PATH 🌀\n\n';

    // Show each element's progress
    ['fire', 'water', 'earth', 'air', 'aether', 'shadow'].forEach(element => {
      const loops = path.completedSpirals.get(element) || 0;
      const symbols = ['○', '◐', '◉', '✦'];
      const symbol = symbols[Math.min(loops, 3)];

      visual += `${this.getElementSymbol(element)} ${element.toUpperCase()}: `;

      for (let i = 1; i <= 3; i++) {
        if (i <= loops) {
          visual += '●';
        } else {
          visual += '○';
        }
        if (i < 3) visual += '→';
      }

      visual += ` ${symbol}\n`;
    });

    visual += `\n🌊 Spiral Depth: ${(path.spiralDepth * 100).toFixed(0)}%`;

    return visual;
  }

  private getElementSymbol(element: string): string {
    const symbols = {
      fire: '🔥',
      water: '💧',
      earth: '🌍',
      air: '💨',
      aether: '✨',
      shadow: '🌑'
    };
    return symbols[element] || '◉';
  }
}

export interface QuestProgress {
  quest: SpiralQuest;
  stageComplete: boolean;
  questComplete: boolean;
  newUnlocks: string[];
  spiralComplete: boolean;
  message: string;
}

export default SpiralQuestSystem;