export interface SoulprintSnapshot {
  userId: string;
  dominantElement: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  recentArchetypes: string[];
  spiralHistory: string[];
  emotionalTrajectory: string[];
  lastUpdated: string;
  sessionCount: number;
  elementalBalance: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    aether: number;
  };
  archetypeFrequency: Record<string, number>;
  phaseTransitions: Array<{
    from: string;
    to: string;
    timestamp: string;
  }>;
  voicePreferences?: {
    preferredTone?: string;
    preferredPace?: string;
    preferredEnergy?: string;
  };
}

export interface SoulprintUpdate {
  userId: string;
  element?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  archetype?: string;
  phase?: string;
  emotionalState?: string;
  timestamp?: string;
}

class SoulprintEngine {
  private soulprints: Map<string, SoulprintSnapshot> = new Map();
  private readonly MAX_HISTORY_LENGTH = 20;
  private readonly ARCHETYPE_DECAY_FACTOR = 0.95;

  async getSoulprintForUser(userId: string): Promise<SoulprintSnapshot> {
    const existing = this.soulprints.get(userId);

    if (existing) {
      return existing;
    }

    const newSoulprint: SoulprintSnapshot = {
      userId,
      dominantElement: 'aether',
      recentArchetypes: ['maia'],
      spiralHistory: ['invocation'],
      emotionalTrajectory: [],
      lastUpdated: new Date().toISOString(),
      sessionCount: 0,
      elementalBalance: {
        fire: 0,
        water: 0,
        earth: 0,
        air: 0,
        aether: 1
      },
      archetypeFrequency: { maia: 1 },
      phaseTransitions: []
    };

    this.soulprints.set(userId, newSoulprint);
    return newSoulprint;
  }

  async updateSoulprint(update: SoulprintUpdate): Promise<SoulprintSnapshot> {
    const soulprint = await this.getSoulprintForUser(update.userId);

    if (update.element) {
      soulprint.elementalBalance[update.element] += 1;
      soulprint.dominantElement = this.calculateDominantElement(soulprint.elementalBalance);
    }

    if (update.archetype) {
      if (!soulprint.recentArchetypes.includes(update.archetype)) {
        soulprint.recentArchetypes.unshift(update.archetype);
        if (soulprint.recentArchetypes.length > 5) {
          soulprint.recentArchetypes.pop();
        }
      }

      soulprint.archetypeFrequency[update.archetype] =
        (soulprint.archetypeFrequency[update.archetype] || 0) + 1;
    }

    if (update.phase) {
      const lastPhase = soulprint.spiralHistory[soulprint.spiralHistory.length - 1];
      if (lastPhase && lastPhase !== update.phase) {
        soulprint.phaseTransitions.push({
          from: lastPhase,
          to: update.phase,
          timestamp: update.timestamp || new Date().toISOString()
        });
      }

      soulprint.spiralHistory.push(update.phase);
      if (soulprint.spiralHistory.length > this.MAX_HISTORY_LENGTH) {
        soulprint.spiralHistory.shift();
      }
    }

    if (update.emotionalState) {
      soulprint.emotionalTrajectory.push(update.emotionalState);
      if (soulprint.emotionalTrajectory.length > this.MAX_HISTORY_LENGTH) {
        soulprint.emotionalTrajectory.shift();
      }
    }

    soulprint.lastUpdated = new Date().toISOString();
    soulprint.sessionCount += 1;

    this.soulprints.set(update.userId, soulprint);
    return soulprint;
  }

  private calculateDominantElement(balance: SoulprintSnapshot['elementalBalance']): 'fire' | 'water' | 'earth' | 'air' | 'aether' {
    const entries = Object.entries(balance) as Array<['fire' | 'water' | 'earth' | 'air' | 'aether', number]>;
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
  }

  async getSymbolicInsights(userId: string): Promise<{
    primaryArchetype: string;
    elementalTendency: string;
    recentPattern: string;
    growthEdge?: string;
  }> {
    const soulprint = await this.getSoulprintForUser(userId);

    const primaryArchetype = Object.entries(soulprint.archetypeFrequency)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'maia';

    const elementalTendency = soulprint.dominantElement;

    const recentPattern = soulprint.spiralHistory.slice(-3).join(' → ');

    const archetypeEntries = Object.entries(soulprint.archetypeFrequency);
    const growthEdge = archetypeEntries.length > 1
      ? archetypeEntries.sort((a, b) => a[1] - b[1])[0][0]
      : undefined;

    return {
      primaryArchetype,
      elementalTendency,
      recentPattern,
      growthEdge
    };
  }

  clearSoulprint(userId: string): void {
    this.soulprints.delete(userId);
  }

  async exportSoulprint(userId: string): Promise<SoulprintSnapshot | null> {
    return this.soulprints.get(userId) || null;
  }
}

export const soulprintEngine = new SoulprintEngine();

export async function getSoulprintForUser(userId: string): Promise<SoulprintSnapshot> {
  return soulprintEngine.getSoulprintForUser(userId);
}

export async function updateSoulprint(update: SoulprintUpdate): Promise<SoulprintSnapshot> {
  return soulprintEngine.updateSoulprint(update);
}

export async function getSymbolicInsights(userId: string) {
  return soulprintEngine.getSymbolicInsights(userId);
}

export async function exportSoulprint(userId: string): Promise<SoulprintSnapshot | null> {
  return soulprintEngine.exportSoulprint(userId);
}

export interface SymbolicContext {
  dominantElement: string;
  primaryArchetype: string;
  currentArchetype?: string;
  recentArchetypes: string[];
  recentSymbols: string[];
  spiralHistory: string[];
  recentPhases: string[];
  emotionalTrajectory: string[];
  elementalBalance: SoulprintSnapshot['elementalBalance'];
  sessionCount: number;
  narrativeThreads: Array<{
    theme: string;
    strength: number;
  }>;
}

export interface MAIAInteractionLog {
  userId: string;
  sessionId?: string;
  conversationTurn: number;
  input: string;
  response: string;
  element: string;
  archetype: string;
  phase: string;
  timestamp: string;
}

class SoulprintMemoryManager {
  private interactionLogs: Map<string, MAIAInteractionLog[]> = new Map();
  private readonly MAX_LOG_LENGTH = 100;

  async getSymbolicContext(userId: string, depth: number = 10): Promise<SymbolicContext> {
    const soulprint = await soulprintEngine.getSoulprintForUser(userId);
    const insights = await soulprintEngine.getSymbolicInsights(userId);
    const recentInteractions = await this.getRecentInteractions(userId, depth);

    const recentSymbols = Array.from(
      new Set(recentInteractions.flatMap(log => log.response.match(/\b(mirror|shadow|light|path|journey|heart|mind|soul|spirit|wisdom)\b/gi) || []))
    ).slice(0, 10);

    const phaseFrequency: Record<string, number> = {};
    recentInteractions.forEach(log => {
      phaseFrequency[log.phase] = (phaseFrequency[log.phase] || 0) + 1;
    });
    const narrativeThreads = Object.entries(phaseFrequency)
      .map(([theme, count]) => ({ theme, strength: count }))
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 5);

    return {
      dominantElement: soulprint.dominantElement,
      primaryArchetype: insights.primaryArchetype,
      currentArchetype: soulprint.recentArchetypes[0],
      recentArchetypes: soulprint.recentArchetypes.slice(0, depth),
      recentSymbols,
      spiralHistory: soulprint.spiralHistory.slice(-depth),
      recentPhases: soulprint.spiralHistory.slice(-depth),
      emotionalTrajectory: soulprint.emotionalTrajectory.slice(-depth),
      elementalBalance: soulprint.elementalBalance,
      sessionCount: soulprint.sessionCount,
      narrativeThreads
    };
  }

  async logInteraction(log: MAIAInteractionLog): Promise<void> {
    const userLogs = this.interactionLogs.get(log.userId) || [];
    userLogs.push(log);

    if (userLogs.length > this.MAX_LOG_LENGTH) {
      userLogs.shift();
    }

    this.interactionLogs.set(log.userId, userLogs);

    await soulprintEngine.updateSoulprint({
      userId: log.userId,
      element: log.element as any,
      archetype: log.archetype,
      phase: log.phase,
      timestamp: log.timestamp
    });
  }

  async getRecentInteractions(userId: string, limit: number = 10): Promise<MAIAInteractionLog[]> {
    const userLogs = this.interactionLogs.get(userId) || [];
    return userLogs.slice(-limit);
  }
}

export const soulprintMemory = new SoulprintMemoryManager();

export async function logMAIAInteraction(
  userId: string,
  input: string,
  response: { message: string; element: string; archetype: string; metadata?: { spiralogicPhase?: string } },
  sessionId?: string,
  conversationTurn: number = 0
): Promise<void> {
  await soulprintMemory.logInteraction({
    userId,
    sessionId,
    conversationTurn,
    input,
    response: response.message,
    element: response.element,
    archetype: response.archetype,
    phase: response.metadata?.spiralogicPhase || 'reflection',
    timestamp: new Date().toISOString()
  });
}