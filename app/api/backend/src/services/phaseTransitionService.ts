// phaseTransitionService.ts
// Manages elemental phase transitions using Vector Equilibrium geometry
// Integrates with oracle agents for consciousness state transitions

import {
  VectorEquilibrium,
  JitterbugPhase,
  Water2Process,
  calculateVEMetrics,
} from "./vectorEquilibrium";
import {
  getRelevantMemories,
  storeMemoryItem,
  getSpiritualPatternInsights,
} from "./memoryService";
import { ElementalBalance } from "../lib/geometryEngine";

// Phase transition types based on Spiralogic principles
export enum TransitionType {
  NATURAL_FLOW = "natural_flow", // Smooth elemental progression
  CATALYTIC_LEAP = "catalytic_leap", // Fire-driven rapid transformation
  DISSOLUTION = "dissolution", // Water 2 death process
  CRYSTALLIZATION = "crystallization", // Earth manifestation
  EXPANSION = "expansion", // Air consciousness expansion
  INTEGRATION = "integration", // Aether unification
  CRISIS = "crisis", // Forced transformation
  AWAKENING = "awakening", // Spontaneous enlightenment
}

// Transition triggers from user patterns
interface TransitionTrigger {
  type: "pattern" | "threshold" | "synchronicity" | "crisis" | "completion";
  data: any;
  strength: number; // 0-1
}

export class PhaseTransitionService {
  private ve: VectorEquilibrium;
  private userId: string;
  private currentTransition?: {
    type: TransitionType;
    startTime: number;
    duration: number;
    fromState: ElementalBalance;
    toState: ElementalBalance;
  };

  constructor(userId: string) {
    this.userId = userId;
    this.ve = new VectorEquilibrium(0, 0, 0, 100);
  }

  // Analyze user state for potential transitions
  async analyzeTransitionPotential(): Promise<TransitionTrigger[]> {
    const triggers: TransitionTrigger[] = [];

    // Get user's spiritual patterns
    const patterns = await getSpiritualPatternInsights(this.userId);
    const memories = await getRelevantMemories(this.userId, undefined, 50);

    // Check for Water 2 death/rebirth patterns
    if (this.detectWater2Pattern(patterns, memories)) {
      triggers.push({
        type: "pattern",
        data: { phase: "water2", theme: "death_rebirth" },
        strength: 0.9,
      });
    }

    // Check elemental imbalance
    const imbalance = this.calculateElementalImbalance(
      patterns.elementalBalance,
    );
    if (imbalance > 0.7) {
      triggers.push({
        type: "threshold",
        data: {
          imbalance,
          dominant: this.getDominantElement(patterns.elementalBalance),
        },
        strength: imbalance,
      });
    }

    // Check for synchronicities indicating transition
    if (patterns.currentSynchronicities.length >= 3) {
      triggers.push({
        type: "synchronicity",
        data: { synchronicities: patterns.currentSynchronicities },
        strength: Math.min(patterns.currentSynchronicities.length / 5, 1),
      });
    }

    // Check for completion patterns
    if (this.detectCompletionPattern(memories)) {
      triggers.push({
        type: "completion",
        data: { cycle: "elemental_journey" },
        strength: 0.8,
      });
    }

    return triggers;
  }

  // Initiate phase transition based on triggers
  async initiateTransition(trigger: TransitionTrigger): Promise<void> {
    const transitionType = this.determineTransitionType(trigger);
    const currentBalance = this.ve.getElementalBalance();

    // Store transition initiation
    await storeMemoryItem({
      clientId: this.userId,
      content: `Phase transition initiated: ${transitionType}`,
      element: "aether",
      sourceAgent: "vector-equilibrium",
      metadata: {
        transitionType,
        trigger,
        startingBalance: currentBalance,
        veMetrics: calculateVEMetrics(this.ve),
      },
    });

    // Execute transition based on type
    switch (transitionType) {
      case TransitionType.DISSOLUTION:
        await this.executeWater2Transition();
        break;

      case TransitionType.CRYSTALLIZATION:
        await this.executeEarthTransition();
        break;

      case TransitionType.EXPANSION:
        await this.executeAirTransition();
        break;

      case TransitionType.CATALYTIC_LEAP:
        await this.executeFireTransition();
        break;

      case TransitionType.INTEGRATION:
        await this.executeAetherTransition();
        break;

      default:
        await this.executeNaturalFlow();
    }
  }

  // Water 2 death/rebirth transition
  private async executeWater2Transition(): Promise<void> {
    const water2Process = new Water2Process(this.ve);

    // Create transition record
    this.currentTransition = {
      type: TransitionType.DISSOLUTION,
      startTime: Date.now(),
      duration: 10000, // 10 seconds for full cycle
      fromState: this.ve.getElementalBalance(),
      toState: { water: 80, aether: 20 }, // Target state
    };

    // Execute the death/rebirth process
    await water2Process.initiate();

    // Store completion
    await storeMemoryItem({
      clientId: this.userId,
      content: `Water 2 death/rebirth cycle completed. ${water2Process.getArchetypalMessage()}`,
      element: "water",
      sourceAgent: "vector-equilibrium",
      metadata: {
        transitionType: TransitionType.DISSOLUTION,
        stage: "completed",
        newBalance: this.ve.getElementalBalance(),
        coherence: this.ve.getCoherence(),
      },
    });
  }

  // Earth crystallization transition
  private async executeEarthTransition(): Promise<void> {
    // Contract to tetrahedron (maximum density)
    this.ve.setPhase(JitterbugPhase.TETRAHEDRON, 0);

    await this.animatePhaseTransition(3000);

    // Return to VE with earth dominance
    this.ve.setPhase(JitterbugPhase.VECTOR_EQUILIBRIUM, 0);

    await storeMemoryItem({
      clientId: this.userId,
      content:
        "Manifestation crystallized into form. Earth element anchors vision into reality.",
      element: "earth",
      sourceAgent: "vector-equilibrium",
      metadata: {
        transitionType: TransitionType.CRYSTALLIZATION,
        newBalance: this.ve.getElementalBalance(),
      },
    });
  }

  // Air expansion transition
  private async executeAirTransition(): Promise<void> {
    // Expand through octahedron
    this.ve.setPhase(JitterbugPhase.OCTAHEDRON, 0);

    await this.animatePhaseTransition(3000);

    // Further expansion
    this.ve.setPhase(JitterbugPhase.ICOSAHEDRON, 0);

    await this.animatePhaseTransition(2000);

    await storeMemoryItem({
      clientId: this.userId,
      content:
        "Consciousness expands into new perspectives. Air element brings clarity and vision.",
      element: "air",
      sourceAgent: "vector-equilibrium",
      metadata: {
        transitionType: TransitionType.EXPANSION,
        newBalance: this.ve.getElementalBalance(),
      },
    });
  }

  // Fire catalytic transition
  private async executeFireTransition(): Promise<void> {
    // Rapid phase oscillation for catalytic effect
    const phases = [
      JitterbugPhase.OCTAHEDRON,
      JitterbugPhase.ICOSAHEDRON,
      JitterbugPhase.VECTOR_EQUILIBRIUM,
    ];

    for (let i = 0; i < 3; i++) {
      for (const phase of phases) {
        this.ve.setPhase(phase, 0);
        await this.animatePhaseTransition(500); // Fast transitions
      }
    }

    await storeMemoryItem({
      clientId: this.userId,
      content:
        "Catalytic fire transformation complete. Old patterns transmuted into new potential.",
      element: "fire",
      sourceAgent: "vector-equilibrium",
      metadata: {
        transitionType: TransitionType.CATALYTIC_LEAP,
        newBalance: this.ve.getElementalBalance(),
      },
    });
  }

  // Aether integration transition
  private async executeAetherTransition(): Promise<void> {
    // Return to perfect VE balance
    this.ve.setPhase(JitterbugPhase.VECTOR_EQUILIBRIUM, 0);

    await this.animatePhaseTransition(5000);

    await storeMemoryItem({
      clientId: this.userId,
      content:
        "All elements unified in perfect balance. Aether consciousness achieved.",
      element: "aether",
      sourceAgent: "vector-equilibrium",
      metadata: {
        transitionType: TransitionType.INTEGRATION,
        newBalance: this.ve.getElementalBalance(),
        coherence: this.ve.getCoherence(),
      },
    });
  }

  // Natural flow through elements
  private async executeNaturalFlow(): Promise<void> {
    const phases = Object.values(JitterbugPhase);

    for (const phase of phases) {
      this.ve.setPhase(phase, 0);
      await this.animatePhaseTransition(2000);
    }
  }

  // Helper methods
  private detectWater2Pattern(patterns: any, memories: any[]): boolean {
    // Look for death/rebirth themes
    const deathThemes = ["death_rebirth", "void_work", "dark_night"];
    const hasDeathTheme = patterns.activeThemes.some((theme: string) =>
      deathThemes.includes(theme),
    );

    // Check recent memories for water + shadow
    const recentWaterShadow =
      memories
        .slice(0, 10)
        .filter(
          (m) =>
            m.element === "water" &&
            (m.content.toLowerCase().includes("shadow") ||
              m.content.toLowerCase().includes("death") ||
              m.content.toLowerCase().includes("void")),
        ).length >= 2;

    return hasDeathTheme || recentWaterShadow;
  }

  private calculateElementalImbalance(balance: ElementalBalance): number {
    const values = Object.values(balance).filter(
      (v) => v !== undefined,
    ) as number[];
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return (max - avg) / 100;
  }

  private getDominantElement(balance: ElementalBalance): string {
    let maxElement = "aether";
    let maxValue = 0;

    Object.entries(balance).forEach(([element, value]) => {
      if (value && value > maxValue) {
        maxValue = value;
        maxElement = element;
      }
    });

    return maxElement;
  }

  private detectCompletionPattern(memories: any[]): boolean {
    // Check if user has experienced all elements recently
    const recentElements = new Set(
      memories
        .slice(0, 20)
        .map((m) => m.element)
        .filter((e) => e),
    );

    return recentElements.size >= 5; // All 5 elements
  }

  private determineTransitionType(trigger: TransitionTrigger): TransitionType {
    switch (trigger.type) {
      case "pattern":
        if (trigger.data.phase === "water2") {
          return TransitionType.DISSOLUTION;
        }
        break;

      case "threshold":
        if (trigger.data.dominant === "earth") {
          return TransitionType.CRYSTALLIZATION;
        } else if (trigger.data.dominant === "air") {
          return TransitionType.EXPANSION;
        } else if (trigger.data.dominant === "fire") {
          return TransitionType.CATALYTIC_LEAP;
        }
        break;

      case "synchronicity":
        return TransitionType.AWAKENING;

      case "completion":
        return TransitionType.INTEGRATION;

      case "crisis":
        return TransitionType.CRISIS;
    }

    return TransitionType.NATURAL_FLOW;
  }

  private animatePhaseTransition(duration: number): Promise<void> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        this.ve.animateJitterbug(0.016, progress); // 60fps

        if (progress >= 1) {
          resolve();
        } else {
          requestAnimationFrame(animate);
        }
      };
      animate();
    });
  }

  // Get current VE state for visualization
  getCurrentState(): {
    svg: string;
    metrics: ReturnType<typeof calculateVEMetrics>;
    transition?: typeof this.currentTransition;
  } {
    return {
      svg: this.ve.generateSVG(400, 400),
      metrics: calculateVEMetrics(this.ve),
      transition: this.currentTransition,
    };
  }
}

// Singleton instance per user
const transitionServices = new Map<string, PhaseTransitionService>();

export function getPhaseTransitionService(
  userId: string,
): PhaseTransitionService {
  if (!transitionServices.has(userId)) {
    transitionServices.set(userId, new PhaseTransitionService(userId));
  }
  return transitionServices.get(userId)!;
}

// Export for oracle agents to check transition states
export async function checkForPhaseTransition(userId: string): Promise<{
  shouldTransition: boolean;
  triggers: TransitionTrigger[];
  currentState: ReturnType<PhaseTransitionService["getCurrentState"]>;
}> {
  const service = getPhaseTransitionService(userId);
  const triggers = await service.analyzeTransitionPotential();
  const shouldTransition = triggers.some((t) => t.strength > 0.7);

  return {
    shouldTransition,
    triggers,
    currentState: service.getCurrentState(),
  };
}
