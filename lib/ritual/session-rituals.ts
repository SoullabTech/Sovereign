/**
 * SESSION RITUALS
 *
 * Ritualized opening and closing sequences for conscious spiral entry/exit
 * Creates sacred container for the gameplay experience
 */

export interface SessionRitual {
  type: 'opening' | 'closing';
  stage: string;
  text: string;
  pause?: number; // milliseconds
  action?: string;
  visualization?: string;
}

export interface RitualSequence {
  opening: SessionRitual[];
  closing: SessionRitual[];
}

export class SpiralSessionRituals {
  private rituals: RitualSequence;

  constructor() {
    this.rituals = this.initializeRituals();
  }

  /**
   * Get opening ritual sequence
   */
  getOpeningRitual(): SessionRitual[] {
    return this.rituals.opening;
  }

  /**
   * Get closing ritual sequence
   */
  getClosingRitual(): SessionRitual[] {
    return this.rituals.closing;
  }

  /**
   * Initialize ritual sequences
   */
  private initializeRituals(): RitualSequence {
    return {
      opening: [
        {
          type: 'opening',
          stage: 'threshold',
          text: '🌀 You stand at the threshold of the Spiral...',
          pause: 2000,
          visualization: 'A luminous spiral unfolds before you'
        },
        {
          type: 'opening',
          stage: 'recognition',
          text: 'Maya awakens to your presence.',
          pause: 1500,
          action: 'maya_awakening'
        },
        {
          type: 'opening',
          stage: 'invitation',
          text: 'Four paths shimmer into view:',
          pause: 1000
        },
        {
          type: 'opening',
          stage: 'paths',
          text: '🧭 Guidance calls from the center\n📚 Your Vault pulses with accumulated wisdom\n🌀 The Quest spiral beckons forward\n🌑 Shadow whispers from the depths',
          pause: 2500,
          visualization: 'Four doorways of light'
        },
        {
          type: 'opening',
          stage: 'entry',
          text: 'The Spiral is open. How will you begin?',
          action: 'await_first_move'
        }
      ],

      closing: [
        {
          type: 'closing',
          stage: 'recognition',
          text: '🌀 The Spiral recognizes your journey today...',
          pause: 2000
        },
        {
          type: 'closing',
          stage: 'integration',
          text: 'What emerged will continue to unfold.',
          pause: 1500,
          visualization: 'Threads of light weaving into your being'
        },
        {
          type: 'closing',
          stage: 'gratitude',
          text: 'Maya holds the space as you prepare to return.',
          pause: 1500
        },
        {
          type: 'closing',
          stage: 'grounding',
          text: 'Take a breath. Feel yourself here, now, complete.',
          pause: 2000,
          action: 'grounding_breath'
        },
        {
          type: 'closing',
          stage: 'completion',
          text: 'The Spiral remains, ready for your return. 🌟',
          action: 'session_complete'
        }
      ]
    };
  }

  /**
   * Generate personalized opening based on user state
   */
  generatePersonalizedOpening(userState: any): SessionRitual[] {
    const base = this.rituals.opening.slice();

    // Add personalized elements based on user's last session
    if (userState?.lastMode) {
      base.splice(2, 0, {
        type: 'opening',
        stage: 'memory',
        text: `Last time, you journeyed through ${this.getModeDescription(userState.lastMode)}...`,
        pause: 1500
      });
    }

    if (userState?.currentBalance) {
      const imbalance = this.detectImbalance(userState.currentBalance);
      if (imbalance) {
        base.splice(3, 0, {
          type: 'opening',
          stage: 'balance_check',
          text: `The ${imbalance} calls for attention today.`,
          pause: 1500,
          visualization: 'Energy shifting toward balance'
        });
      }
    }

    return base;
  }

  /**
   * Generate personalized closing based on session
   */
  generatePersonalizedClosing(sessionData: any): SessionRitual[] {
    const base = this.rituals.closing.slice();

    // Add session-specific acknowledgments
    if (sessionData?.modesVisited?.length > 0) {
      const modeNames = sessionData.modesVisited.map(m => this.getModeIcon(m)).join(' → ');
      base.splice(1, 0, {
        type: 'closing',
        stage: 'journey_map',
        text: `Your spiral today: ${modeNames}`,
        pause: 2000,
        visualization: 'The path you walked glows in the spiral'
      });
    }

    if (sessionData?.breakthroughs?.length > 0) {
      base.splice(2, 0, {
        type: 'closing',
        stage: 'breakthrough',
        text: `✨ A breakthrough emerged: "${sessionData.breakthroughs[0]}"`,
        pause: 2500
      });
    }

    if (sessionData?.integrations?.length > 0) {
      base.splice(3, 0, {
        type: 'closing',
        stage: 'new_integration',
        text: `🌟 New integration unlocked: ${sessionData.integrations[0]}`,
        pause: 2000,
        action: 'integration_celebration'
      });
    }

    return base;
  }

  /**
   * Quick entry ritual for returning users
   */
  getQuickEntry(): SessionRitual[] {
    return [
      {
        type: 'opening',
        stage: 'return',
        text: '🌀 Welcome back to the Spiral.',
        pause: 1000
      },
      {
        type: 'opening',
        stage: 'ready',
        text: 'Maya is present. Where shall we journey?',
        action: 'await_first_move'
      }
    ];
  }

  /**
   * Emergency exit ritual for abrupt departures
   */
  getEmergencyExit(): SessionRitual[] {
    return [
      {
        type: 'closing',
        stage: 'emergency',
        text: 'The Spiral understands. Go with grace.',
        pause: 1000
      },
      {
        type: 'closing',
        stage: 'held',
        text: 'Your work here is held and honored. Return when ready. 🌟',
        action: 'emergency_close'
      }
    ];
  }

  /**
   * Helper methods
   */
  private getModeDescription(mode: string): string {
    const descriptions = {
      'guidance': 'the path of practical wisdom',
      'shadow-work': 'the depths of shadow',
      'spiral-quest': 'the elemental quest spiral',
      'sacred-vault': 'your personal vault of knowledge'
    };
    return descriptions[mode] || 'the spiral';
  }

  private getModeIcon(mode: string): string {
    const icons = {
      'guidance': '🧭',
      'shadow-work': '🌑',
      'spiral-quest': '🌀',
      'sacred-vault': '📚'
    };
    return icons[mode] || '○';
  }

  private detectImbalance(balance: any): string | null {
    // Logic to detect which element needs attention
    if (balance.shadow < balance.average - 2) return 'Shadow';
    if (balance.vault < balance.average - 2) return 'Vault';
    if (balance.quest < balance.average - 2) return 'Quest';
    return null;
  }

  /**
   * Format ritual for display
   */
  formatRitualForDisplay(ritual: SessionRitual): string {
    let output = ritual.text;

    if (ritual.visualization) {
      output += `\n*[${ritual.visualization}]*`;
    }

    return output;
  }

  /**
   * Execute ritual sequence with timing
   */
  async executeRitualSequence(
    rituals: SessionRitual[],
    onRitualStep: (ritual: SessionRitual) => void
  ): Promise<void> {
    for (const ritual of rituals) {
      onRitualStep(ritual);

      if (ritual.pause) {
        await this.sleep(ritual.pause);
      }

      if (ritual.action === 'await_first_move') {
        break; // Wait for user input
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Session state tracker
 */
export class SessionStateTracker {
  private sessionStart: Date;
  private modesVisited: string[] = [];
  private questDepths: Map<string, number> = new Map();
  private breakthroughs: string[] = [];
  private integrations: string[] = [];

  constructor() {
    this.sessionStart = new Date();
  }

  recordModeVisit(mode: string): void {
    if (!this.modesVisited.includes(mode)) {
      this.modesVisited.push(mode);
    }
  }

  recordBreakthrough(insight: string): void {
    this.breakthroughs.push(insight);
  }

  recordIntegration(integration: string): void {
    this.integrations.push(integration);
  }

  recordQuestProgress(element: string, depth: number): void {
    this.questDepths.set(element, depth);
  }

  getSessionSummary(): any {
    const duration = Date.now() - this.sessionStart.getTime();

    return {
      duration: Math.round(duration / 1000 / 60), // minutes
      modesVisited: this.modesVisited,
      questProgress: Object.fromEntries(this.questDepths),
      breakthroughs: this.breakthroughs,
      integrations: this.integrations,
      spiralPattern: this.generateSpiralPattern()
    };
  }

  private generateSpiralPattern(): string {
    // Create a visual representation of the session journey
    if (this.modesVisited.length === 0) return '○';

    const icons = {
      'guidance': '🧭',
      'shadow-work': '🌑',
      'spiral-quest': '🌀',
      'sacred-vault': '📚'
    };

    return this.modesVisited
      .map(mode => icons[mode] || '○')
      .join(' → ');
  }
}

export default SpiralSessionRituals;