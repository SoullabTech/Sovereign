/**
 * MAIA Beads Plugin
 * Automatically creates and manages Beads tasks based on consciousness events
 * Integrates with Spiralogic phase transitions and developmental milestones
 */

import { getCognitiveProfile } from '@/lib/consciousness/cognitiveProfileService';
import { maiaMemory } from '@/lib/consciousness/memory/MAIAMemoryArchitecture';
import type { ConsciousnessMatrixV2 } from '@/lib/consciousness-computing/matrix-v2-implementation';
import type { CognitiveProfile } from '@/lib/consciousness/cognitiveProfileService';
import type { CoherenceFieldState } from '@/lib/consciousness/memory/MAIAMemoryArchitecture';

// ==============================================================================
// TYPES
// ==============================================================================

interface BeadsSyncClient {
  createTask(params: TaskCreationParams): Promise<{ beadsId: string }>;
  completeTask(beadsId: string, completion: TaskCompletionParams): Promise<void>;
  getReadyTasks(userId: string, filters: ReadyTaskFilters): Promise<any[]>;
}

interface TaskCreationParams {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  maiaMeta?: {
    userId: string;
    sessionId?: string;
    element?: string;
    phase?: number;
    archetype?: string;
    realm?: string;
    cognitive?: {
      requiredLevel: number;
      recommendedLevel: number;
      bypassRisk?: 'none' | 'spiritual' | 'intellectual';
    };
    somatic?: {
      bodyRegion?: string;
      tensionLevel?: number;
      practiceName?: string;
    };
    field?: {
      intensity: 'low' | 'medium' | 'high';
      safetyCheck: boolean;
      coherenceRequired?: number;
    };
    evolution?: {
      firstAppearance: string;
      integrationLevel: number;
    };
    experience?: {
      type: string;
      readinessLevel: number;
      layerDepth: string;
    };
  };
}

interface TaskCompletionParams {
  effectiveness: number;
  somaticShift?: { before: number; after: number };
  insight?: string;
  breakthrough?: boolean;
}

interface ReadyTaskFilters {
  cognitiveLevel?: number;
  spiritualBypassing?: number;
  intellectualBypassing?: number;
  coherence?: number;
}

// ==============================================================================
// BEADS SYNC CLIENT
// ==============================================================================

class BeadsSyncAPIClient implements BeadsSyncClient {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.BEADS_SYNC_URL || 'http://localhost:3100') {
    this.baseUrl = baseUrl;
  }

  async createTask(params: TaskCreationParams): Promise<{ beadsId: string }> {
    const response = await fetch(`${this.baseUrl}/beads/task`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Failed to create task: ${response.statusText}`);
    }

    return response.json();
  }

  async completeTask(beadsId: string, completion: TaskCompletionParams): Promise<void> {
    const response = await fetch(`${this.baseUrl}/beads/task/${beadsId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(completion),
    });

    if (!response.ok) {
      throw new Error(`Failed to complete task: ${response.statusText}`);
    }
  }

  async getReadyTasks(userId: string, filters: ReadyTaskFilters = {}): Promise<any[]> {
    const params = new URLSearchParams({
      userId,
      cognitiveLevel: String(filters.cognitiveLevel || 6),
      spiritualBypassing: String(filters.spiritualBypassing || 0),
      intellectualBypassing: String(filters.intellectualBypassing || 0),
      coherence: String(filters.coherence || 1),
    });

    const response = await fetch(`${this.baseUrl}/beads/ready/${userId}?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to get ready tasks: ${response.statusText}`);
    }

    const data = await response.json();
    return data.readyTasks || [];
  }
}

// ==============================================================================
// MAIA BEADS PLUGIN
// ==============================================================================

export class MaiaBeadsPlugin {
  private client: BeadsSyncClient;
  private taskRegistry: Map<string, string[]> = new Map(); // userId -> beadsIds

  constructor(syncServiceUrl?: string) {
    this.client = new BeadsSyncAPIClient(syncServiceUrl);
  }

  // ============================================================================
  // CONSCIOUSNESS EVENT HANDLERS
  // ============================================================================

  /**
   * Handle somatic tension spike
   * Creates grounding protocol task
   */
  async onSomaticTensionSpike(
    userId: string,
    sessionId: string,
    event: {
      bodyRegion: string;
      tensionLevel: number;
      matrix: ConsciousnessMatrixV2;
    }
  ): Promise<string | null> {
    console.log(`[MAIA Beads] Somatic tension spike detected: ${event.bodyRegion} @ ${event.tensionLevel}/10`);

    if (event.tensionLevel < 6) {
      console.log('[MAIA Beads] Below threshold, skipping task creation');
      return null;
    }

    const cognitiveProfile = await getCognitiveProfile(userId);
    const fieldState = await maiaMemory.generateCoherenceFieldReading(userId, event.matrix);

    const practiceName = this.selectGroundingPractice(event.bodyRegion, event.tensionLevel);

    const { beadsId } = await this.client.createTask({
      title: `Ground ${event.bodyRegion} tension`,
      description: `Practice ${practiceName} to release chronic tension in ${event.bodyRegion}. Current level: ${event.tensionLevel}/10.`,
      priority: event.tensionLevel >= 8 ? 'urgent' : 'high',
      tags: ['somatic', 'grounding', event.bodyRegion],
      maiaMeta: {
        userId,
        sessionId,
        element: 'earth',
        phase: 1,
        archetype: 'Healer',
        realm: this.determineRealm(cognitiveProfile, fieldState),
        cognitive: {
          requiredLevel: 3, // APPLY level - can follow protocol
          recommendedLevel: cognitiveProfile?.currentLevel || 3,
          bypassRisk: 'none',
        },
        somatic: {
          bodyRegion: event.bodyRegion,
          tensionLevel: event.tensionLevel,
          practiceName,
        },
        field: {
          intensity: event.tensionLevel >= 8 ? 'high' : 'medium',
          safetyCheck: true,
          coherenceRequired: 0.5,
        },
        evolution: {
          firstAppearance: new Date().toISOString(),
          integrationLevel: 1,
        },
        experience: {
          type: 'somatic_inquiry',
          readinessLevel: cognitiveProfile?.currentLevel || 5,
          layerDepth: 'personal',
        },
      },
    });

    this.trackTask(userId, beadsId);
    console.log(`[MAIA Beads] Created task ${beadsId}: Ground ${event.bodyRegion} tension`);

    return beadsId;
  }

  /**
   * Handle field imbalance detection
   * Creates elemental restoration task
   */
  async onFieldImbalance(
    userId: string,
    sessionId: string,
    event: {
      element: string;
      severity: number;
      type: 'deficient' | 'flooding' | 'blocked';
      recommendedProtocols: string[];
      matrix: ConsciousnessMatrixV2;
    }
  ): Promise<string | null> {
    console.log(`[MAIA Beads] Field imbalance: ${event.element} ${event.type} (severity: ${event.severity}/10)`);

    if (event.severity < 5) {
      return null; // Minor imbalance, let it self-regulate
    }

    const cognitiveProfile = await getCognitiveProfile(userId);
    const fieldState = await maiaMemory.generateCoherenceFieldReading(userId, event.matrix);

    const protocol = event.recommendedProtocols[0] || `${event.element}_restoration`;

    const { beadsId } = await this.client.createTask({
      title: `Restore ${event.element} balance`,
      description: `Your ${event.element} element is ${event.type}. Recommended practice: ${protocol}`,
      priority: event.severity >= 8 ? 'urgent' : event.severity >= 6 ? 'high' : 'medium',
      tags: ['field-work', 'elemental', event.element, event.type],
      maiaMeta: {
        userId,
        sessionId,
        element: event.element,
        phase: this.getPhaseFromType(event.type),
        archetype: this.getArchetypeForElement(event.element),
        realm: this.determineRealm(cognitiveProfile, fieldState),
        cognitive: {
          requiredLevel: 4, // ANALYZE level - understand elemental dynamics
          recommendedLevel: cognitiveProfile?.currentLevel || 4,
          bypassRisk: event.element === 'aether' ? 'spiritual' : 'none',
        },
        field: {
          intensity: event.severity >= 8 ? 'high' : 'medium',
          safetyCheck: true,
          coherenceRequired: 0.6,
        },
        evolution: {
          firstAppearance: new Date().toISOString(),
          integrationLevel: 1,
        },
        experience: {
          type: 'reflective_practice',
          readinessLevel: cognitiveProfile?.currentLevel || 5,
          layerDepth: 'transpersonal',
        },
      },
    });

    this.trackTask(userId, beadsId);
    return beadsId;
  }

  /**
   * Handle Spiralogic phase transition
   * Creates integration tasks for new phase
   */
  async onPhaseTransition(
    userId: string,
    sessionId: string,
    event: {
      fromElement: string;
      fromPhase: number;
      toElement: string;
      toPhase: number;
      matrix: ConsciousnessMatrixV2;
    }
  ): Promise<string[]> {
    console.log(
      `[MAIA Beads] Phase transition: ${event.fromElement}${event.fromPhase} → ${event.toElement}${event.toPhase}`
    );

    const cognitiveProfile = await getCognitiveProfile(userId);
    const fieldState = await maiaMemory.generateCoherenceFieldReading(userId, event.matrix);

    const tasks: string[] = [];

    // Create completion ritual for previous phase
    if (event.fromElement && event.fromPhase === 3) {
      const completionTask = await this.client.createTask({
        title: `Complete ${event.fromElement} journey`,
        description: `Integrate learnings from ${event.fromElement} phase before moving forward`,
        priority: 'high',
        tags: ['completion', 'integration', event.fromElement],
        maiaMeta: {
          userId,
          sessionId,
          element: event.fromElement,
          phase: 3,
          archetype: this.getArchetypeForElement(event.fromElement),
          realm: this.determineRealm(cognitiveProfile, fieldState),
          cognitive: {
            requiredLevel: 5, // EVALUATE - reflect on growth
            recommendedLevel: cognitiveProfile?.currentLevel || 5,
          },
          experience: {
            type: 'reflective_practice',
            readinessLevel: 8,
            layerDepth: 'transpersonal',
          },
        },
      });
      tasks.push(completionTask.beadsId);
    }

    // Create initiation task for new phase
    const initiationTask = await this.client.createTask({
      title: `Enter ${event.toElement} phase ${event.toPhase}`,
      description: this.getPhaseDescription(event.toElement, event.toPhase),
      priority: 'high',
      tags: ['initiation', event.toElement, `phase-${event.toPhase}`],
      maiaMeta: {
        userId,
        sessionId,
        element: event.toElement,
        phase: event.toPhase,
        archetype: this.getArchetypeForElement(event.toElement),
        realm: this.determineRealm(cognitiveProfile, fieldState),
        cognitive: {
          requiredLevel: this.getRequiredLevelForPhase(event.toPhase),
          recommendedLevel: cognitiveProfile?.currentLevel || 4,
        },
        experience: {
          type: event.toPhase === 1 ? 'somatic_inquiry' : 'reflective_practice',
          readinessLevel: cognitiveProfile?.currentLevel || 6,
          layerDepth: event.toPhase === 3 ? 'transpersonal' : 'interpersonal',
        },
      },
    });
    tasks.push(initiationTask.beadsId);

    tasks.forEach((id) => this.trackTask(userId, id));
    return tasks;
  }

  /**
   * Handle achievement unlock
   * Creates celebration milestone
   */
  async onAchievementUnlock(
    userId: string,
    achievement: {
      achievementId: string;
      title: string;
      description: string;
      rarity: string;
    }
  ): Promise<string> {
    const { beadsId } = await this.client.createTask({
      title: `🎉 ${achievement.title}`,
      description: achievement.description,
      priority: 'medium',
      tags: ['achievement', 'celebration', achievement.rarity],
      maiaMeta: {
        userId,
        element: 'aether',
        phase: 3,
        experience: {
          type: 'reflective_practice',
          readinessLevel: 10,
          layerDepth: 'universal',
        },
      },
    });

    // Auto-complete celebration tasks
    await this.client.completeTask(beadsId, {
      effectiveness: 10,
      breakthrough: true,
      insight: `Achievement unlocked: ${achievement.title}`,
    });

    return beadsId;
  }

  // ============================================================================
  // TASK RETRIEVAL & COMPLETION
  // ============================================================================

  /**
   * Get ready tasks for user based on current consciousness state
   */
  async getReadyTasksForUser(
    userId: string,
    matrix: ConsciousnessMatrixV2
  ): Promise<any[]> {
    const cognitiveProfile = await getCognitiveProfile(userId);
    const fieldState = await maiaMemory.generateCoherenceFieldReading(userId, matrix);

    if (!cognitiveProfile) {
      return [];
    }

    return this.client.getReadyTasks(userId, {
      cognitiveLevel: cognitiveProfile.currentLevel,
      spiritualBypassing: cognitiveProfile.bypassingFrequency.spiritual,
      intellectualBypassing: cognitiveProfile.bypassingFrequency.intellectual,
      coherence: fieldState.overallCoherence,
    });
  }

  /**
   * Complete task with effectiveness feedback
   */
  async completeTask(
    beadsId: string,
    completion: TaskCompletionParams
  ): Promise<void> {
    await this.client.completeTask(beadsId, completion);
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private trackTask(userId: string, beadsId: string): void {
    const tasks = this.taskRegistry.get(userId) || [];
    tasks.push(beadsId);
    this.taskRegistry.set(userId, tasks);
  }

  private determineRealm(
    profile: CognitiveProfile | null,
    field: CoherenceFieldState
  ): 'UNDERWORLD' | 'MIDDLEWORLD' | 'UPPERWORLD_SYMBOLIC' {
    if (!profile) return 'MIDDLEWORLD';

    if (profile.rollingAverage < 2.5) return 'UNDERWORLD';

    const highBypassing =
      profile.bypassingFrequency.spiritual > 0.5 ||
      profile.bypassingFrequency.intellectual > 0.5;

    if (highBypassing) return 'MIDDLEWORLD';

    if (profile.rollingAverage >= 4.0 && field.overallCoherence > 0.7) {
      return 'UPPERWORLD_SYMBOLIC';
    }

    return 'MIDDLEWORLD';
  }

  private selectGroundingPractice(bodyRegion: string, tensionLevel: number): string {
    const practices: Record<string, string> = {
      shoulders: 'breathing_shoulder_rolls',
      chest: 'heart_opening_breath',
      throat: 'vocal_toning',
      jaw: 'jaw_release_massage',
      back: 'spinal_grounding',
      belly: 'belly_breathing',
      hips: 'hip_opening_stretch',
      legs: 'earth_walking',
      full_body: 'body_scan_meditation',
    };

    return practices[bodyRegion] || 'grounding_meditation';
  }

  private getArchetypeForElement(element: string): string {
    const archetypes: Record<string, string> = {
      earth: 'Healer',
      water: 'Mystic',
      fire: 'Warrior',
      air: 'Sage',
      aether: 'Magician',
    };

    return archetypes[element] || 'Explorer';
  }

  private getPhaseFromType(type: string): number {
    const phaseMap: Record<string, number> = {
      deficient: 1, // Emergence - need to activate
      blocked: 2,   // Integration - need to clear
      flooding: 3,  // Transcendence - need to balance
    };

    return phaseMap[type] || 2;
  }

  private getPhaseDescription(element: string, phase: number): string {
    const descriptions: Record<string, Record<number, string>> = {
      earth: {
        1: 'Ground into your body and physical reality',
        2: 'Integrate stability and structure',
        3: 'Embody wisdom in daily practice',
      },
      water: {
        1: 'Allow emotional flow and feeling',
        2: 'Practice emotional alchemy and integration',
        3: 'Embody compassion and deep feeling',
      },
      fire: {
        1: 'Ignite will and creative passion',
        2: 'Integrate power with purpose',
        3: 'Embody inspired action',
      },
      air: {
        1: 'Expand perspective and mental clarity',
        2: 'Integrate wisdom with understanding',
        3: 'Embody clear seeing',
      },
      aether: {
        1: 'Open to unity consciousness',
        2: 'Integrate spiritual insight',
        3: 'Embody cosmic awareness',
      },
    };

    return descriptions[element]?.[phase] || `Explore ${element} consciousness`;
  }

  private getRequiredLevelForPhase(phase: number): number {
    // Phase 1: Remember/Understand (1-2)
    // Phase 2: Apply/Analyze (3-4)
    // Phase 3: Evaluate/Create (5-6)
    return phase === 1 ? 2 : phase === 2 ? 4 : 5;
  }
}

// ==============================================================================
// SINGLETON INSTANCE
// ==============================================================================

export const maiaBeadsPlugin = new MaiaBeadsPlugin();
