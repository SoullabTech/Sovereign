/**
 * Soulprint Tracking System
 * Tracks the symbolic, archetypal, and elemental journey of each soul
 * This is where data becomes soul-tech
 */

export interface SoulprintSymbol {
  symbol: string;
  firstAppeared: Date;
  lastMentioned: Date;
  frequency: number;
  context: string[];
  elementalResonance?: string;
}

export interface ArchetypalShift {
  fromArchetype?: string;
  toArchetype: string;
  timestamp: Date;
  trigger?: string;
  shadowWork: boolean;
  integrationLevel: number; // 0-1
}

export interface ElementalBalance {
  fire: number;    // 0-1
  water: number;   // 0-1
  earth: number;   // 0-1
  air: number;     // 0-1
  aether: number;  // 0-1
  dominant?: string;
  deficient?: string;
}

export interface SoulJourneyMilestone {
  timestamp: Date;
  type: 'breakthrough' | 'threshold' | 'integration' | 'shadow-encounter' | 'awakening';
  description: string;
  spiralogicPhase?: string;
  element?: string;
  significance: 'minor' | 'major' | 'pivotal';
}

export interface EmotionalDrift {
  timestamp: Date;
  baseline: number; // -1 to 1 (negative to positive)
  current: number;
  volatility: number; // 0-1
  trend: 'rising' | 'falling' | 'stable' | 'volatile';
  dominantEmotions: string[];
}

export interface Soulprint {
  userId: string;
  userName?: string;
  created: Date;
  lastUpdated: Date;

  // Spiralogic Journey
  currentPhase: string;
  phaseHistory: Array<{
    phase: string;
    startedAt: Date;
    endedAt?: Date;
    duration?: number; // days
    completionQuality: number; // 0-1
  }>;

  // Symbolic Language
  activeSymbols: SoulprintSymbol[];
  archivedSymbols: SoulprintSymbol[];
  symbolEvolution: Array<{
    symbol: string;
    meaning: string;
    date: Date;
  }>;

  // Archetypal Journey
  currentArchetype?: string;
  archetypeHistory: ArchetypalShift[];
  shadowIntegrationScore: number; // 0-1

  // Elemental Balance
  elementalBalance: ElementalBalance;
  elementHistory: Array<{
    date: Date;
    balance: ElementalBalance;
  }>;

  // Journey Milestones
  milestones: SoulJourneyMilestone[];

  // Emotional Landscape
  emotionalState: EmotionalDrift;
  emotionalHistory: EmotionalDrift[];

  // Wisdom Threads (narrative consistency)
  narrativeThreads: Array<{
    theme: string;
    startedAt: Date;
    strength: number; // 0-1
    relatedSymbols: string[];
    status: 'emerging' | 'active' | 'integrating' | 'integrated';
  }>;

  // Ritual Engagement
  ritualsCompleted: Array<{
    ritual: string;
    completedAt: Date;
    element: string;
    depth: number; // 0-1
    integration: number; // 0-1
  }>;

  // Breakthrough Moments
  breakthroughMoments: Array<{
    timestamp: Date;
    description: string;
    catalysts: string[];
    impact: number; // 0-1
  }>;
}

export class SoulprintTracker {
  private soulprints = new Map<string, Soulprint>();

  // === INITIALIZATION ===

  createSoulprint(userId: string, userName?: string): Soulprint {
    const soulprint: Soulprint = {
      userId,
      userName,
      created: new Date(),
      lastUpdated: new Date(),
      currentPhase: 'entry',
      phaseHistory: [{
        phase: 'entry',
        startedAt: new Date(),
        completionQuality: 0
      }],
      activeSymbols: [],
      archivedSymbols: [],
      symbolEvolution: [],
      archetypeHistory: [],
      shadowIntegrationScore: 0,
      elementalBalance: {
        fire: 0.2,
        water: 0.2,
        earth: 0.2,
        air: 0.2,
        aether: 0.2
      },
      elementHistory: [],
      milestones: [],
      emotionalState: {
        timestamp: new Date(),
        baseline: 0.5,
        current: 0.5,
        volatility: 0,
        trend: 'stable',
        dominantEmotions: []
      },
      emotionalHistory: [],
      narrativeThreads: [],
      ritualsCompleted: [],
      breakthroughMoments: []
    };

    this.soulprints.set(userId, soulprint);
    console.log(`🌟 Soulprint created for ${userName || userId}`);
    return soulprint;
  }

  getSoulprint(userId: string): Soulprint | null {
    return this.soulprints.get(userId) || null;
  }

  // === SYMBOL TRACKING ===

  trackSymbol(userId: string, symbol: string, context: string, elementalResonance?: string): void {
    const soulprint = this.soulprints.get(userId);
    if (!soulprint) return;

    // Check if symbol already exists
    let existingSymbol = soulprint.activeSymbols.find(s =>
      s.symbol.toLowerCase() === symbol.toLowerCase()
    );

    if (existingSymbol) {
      existingSymbol.lastMentioned = new Date();
      existingSymbol.frequency += 1;
      existingSymbol.context.push(context);
    } else {
      // New symbol
      const newSymbol: SoulprintSymbol = {
        symbol,
        firstAppeared: new Date(),
        lastMentioned: new Date(),
        frequency: 1,
        context: [context],
        elementalResonance
      };
      soulprint.activeSymbols.push(newSymbol);
      console.log(`🔮 New symbol tracked for ${userId}: ${symbol}`);
    }

    soulprint.lastUpdated = new Date();
    this.soulprints.set(userId, soulprint);
  }

  // === ARCHETYPAL TRACKING ===

  trackArchetypeShift(
    userId: string,
    toArchetype: string,
    options: {
      fromArchetype?: string;
      trigger?: string;
      shadowWork?: boolean;
      integrationLevel?: number;
    } = {}
  ): void {
    const soulprint = this.soulprints.get(userId);
    if (!soulprint) return;

    const shift: ArchetypalShift = {
      fromArchetype: options.fromArchetype || soulprint.currentArchetype,
      toArchetype,
      timestamp: new Date(),
      trigger: options.trigger,
      shadowWork: options.shadowWork || false,
      integrationLevel: options.integrationLevel || 0.5
    };

    soulprint.archetypeHistory.push(shift);
    soulprint.currentArchetype = toArchetype;

    // Track shadow integration
    if (options.shadowWork) {
      soulprint.shadowIntegrationScore = Math.min(
        soulprint.shadowIntegrationScore + 0.1,
        1.0
      );
    }

    console.log(`🎭 Archetype shift for ${userId}: ${shift.fromArchetype || 'none'} → ${toArchetype}`);
    soulprint.lastUpdated = new Date();
    this.soulprints.set(userId, soulprint);
  }

  // === ELEMENTAL TRACKING ===

  updateElementalBalance(userId: string, element: string, intensity: number): void {
    const soulprint = this.soulprints.get(userId);
    if (!soulprint) return;

    // Update the specific element
    const elementKey = element.toLowerCase() as keyof ElementalBalance;
    if (elementKey in soulprint.elementalBalance) {
      soulprint.elementalBalance[elementKey] = Math.min(
        (soulprint.elementalBalance[elementKey] as number) + intensity,
        1.0
      );
    }

    // Normalize to sum to ~1
    const sum = Object.entries(soulprint.elementalBalance)
      .filter(([k]) => k !== 'dominant' && k !== 'deficient')
      .reduce((acc, [, v]) => acc + (v as number), 0);

    if (sum > 0) {
      ['fire', 'water', 'earth', 'air', 'aether'].forEach(el => {
        soulprint.elementalBalance[el as keyof ElementalBalance] =
          (soulprint.elementalBalance[el as keyof ElementalBalance] as number) / sum;
      });
    }

    // Identify dominant and deficient
    const elements = ['fire', 'water', 'earth', 'air', 'aether'];
    let maxElement = elements[0];
    let minElement = elements[0];

    elements.forEach(el => {
      if ((soulprint.elementalBalance[el as keyof ElementalBalance] as number) >
          (soulprint.elementalBalance[maxElement as keyof ElementalBalance] as number)) {
        maxElement = el;
      }
      if ((soulprint.elementalBalance[el as keyof ElementalBalance] as number) <
          (soulprint.elementalBalance[minElement as keyof ElementalBalance] as number)) {
        minElement = el;
      }
    });

    soulprint.elementalBalance.dominant = maxElement;
    soulprint.elementalBalance.deficient = minElement;

    // Store in history
    soulprint.elementHistory.push({
      date: new Date(),
      balance: { ...soulprint.elementalBalance }
    });

    soulprint.lastUpdated = new Date();
    this.soulprints.set(userId, soulprint);
  }

  // === MILESTONE TRACKING ===

  addMilestone(
    userId: string,
    type: SoulJourneyMilestone['type'],
    description: string,
    significance: 'minor' | 'major' | 'pivotal' = 'minor',
    context?: {
      spiralogicPhase?: string;
      element?: string;
    }
  ): void {
    const soulprint = this.soulprints.get(userId);
    if (!soulprint) return;

    const milestone: SoulJourneyMilestone = {
      timestamp: new Date(),
      type,
      description,
      significance,
      spiralogicPhase: context?.spiralogicPhase || soulprint.currentPhase,
      element: context?.element
    };

    soulprint.milestones.push(milestone);
    console.log(`✨ Milestone for ${userId}: ${type} - ${description}`);

    soulprint.lastUpdated = new Date();
    this.soulprints.set(userId, soulprint);
  }

  // === EMOTIONAL TRACKING ===

  trackEmotionalState(
    userId: string,
    current: number,
    dominantEmotions: string[]
  ): void {
    const soulprint = this.soulprints.get(userId);
    if (!soulprint) return;

    const previousState = soulprint.emotionalState;

    // Calculate volatility based on recent history
    const recentHistory = soulprint.emotionalHistory.slice(-5);
    const volatility = recentHistory.length > 0
      ? Math.abs(current - recentHistory[recentHistory.length - 1].current)
      : 0;

    // Determine trend
    let trend: EmotionalDrift['trend'] = 'stable';
    if (recentHistory.length >= 3) {
      const changes = recentHistory.slice(-3).map(h => h.current);
      const avgChange = changes.reduce((sum, val, i) =>
        i > 0 ? sum + (val - changes[i-1]) : sum, 0
      ) / (changes.length - 1);

      if (Math.abs(avgChange) > 0.1) {
        trend = volatility > 0.3 ? 'volatile' : avgChange > 0 ? 'rising' : 'falling';
      }
    }

    const newState: EmotionalDrift = {
      timestamp: new Date(),
      baseline: previousState.baseline,
      current,
      volatility,
      trend,
      dominantEmotions
    };

    soulprint.emotionalState = newState;
    soulprint.emotionalHistory.push(newState);

    // Keep only last 30 entries
    if (soulprint.emotionalHistory.length > 30) {
      soulprint.emotionalHistory = soulprint.emotionalHistory.slice(-30);
    }

    soulprint.lastUpdated = new Date();
    this.soulprints.set(userId, soulprint);
  }

  // === ANALYTICS ===

  getSoulprintSummary(userId: string): any {
    const soulprint = this.soulprints.get(userId);
    if (!soulprint) return null;

    return {
      userId: soulprint.userId,
      userName: soulprint.userName,
      journeyDuration: Math.floor(
        (Date.now() - soulprint.created.getTime()) / (1000 * 60 * 60 * 24)
      ),
      currentPhase: soulprint.currentPhase,
      currentArchetype: soulprint.currentArchetype,
      activeSymbols: soulprint.activeSymbols.slice(0, 5),
      elementalDominance: soulprint.elementalBalance.dominant,
      elementalDeficiency: soulprint.elementalBalance.deficient,
      milestoneCount: soulprint.milestones.length,
      breakthroughCount: soulprint.breakthroughMoments.length,
      emotionalTrend: soulprint.emotionalState.trend,
      narrativeThreads: soulprint.narrativeThreads.filter(t => t.status === 'active').length,
      shadowIntegration: soulprint.shadowIntegrationScore
    };
  }

  // === ALERTS & THRESHOLDS ===

  checkThresholds(userId: string): string[] {
    const soulprint = this.soulprints.get(userId);
    if (!soulprint) return [];

    const alerts: string[] = [];

    // Emotional volatility alert
    if (soulprint.emotionalState.volatility > 0.5) {
      alerts.push(`High emotional volatility detected (${(soulprint.emotionalState.volatility * 100).toFixed(0)}%)`);
    }

    // Elemental imbalance alert
    const deficientValue = soulprint.elementalBalance[
      soulprint.elementalBalance.deficient as keyof ElementalBalance
    ] as number;
    if (deficientValue < 0.1) {
      alerts.push(`Significant ${soulprint.elementalBalance.deficient} deficiency detected`);
    }

    // Stagnation alert (no milestones in 7+ days)
    const lastMilestone = soulprint.milestones[soulprint.milestones.length - 1];
    if (lastMilestone) {
      const daysSinceLastMilestone =
        (Date.now() - lastMilestone.timestamp.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceLastMilestone > 7) {
        alerts.push(`No milestones in ${Math.floor(daysSinceLastMilestone)} days - possible stagnation`);
      }
    }

    // Symbol stagnation (no new symbols in 5+ sessions)
    const recentSymbols = soulprint.activeSymbols.filter(s =>
      (Date.now() - s.lastMentioned.getTime()) < (5 * 24 * 60 * 60 * 1000)
    );
    if (recentSymbols.length === 0 && soulprint.activeSymbols.length === 0) {
      alerts.push('No active symbols - symbolic language may be stagnant');
    }

    return alerts;
  }

  // === RETRIEVAL METHODS ===

  /**
   * Get all soulprints (for dashboards and analytics)
   */
  getAllSoulprints(): Soulprint[] {
    return Array.from(this.soulprints.values());
  }

  /**
   * Get soulprint count
   */
  getSoulprintCount(): number {
    return this.soulprints.size;
  }
}

// Singleton instance
export const soulprintTracker = new SoulprintTracker();