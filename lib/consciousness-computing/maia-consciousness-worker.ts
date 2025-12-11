/**
 * MAIA Consciousness Worker Agent
 *
 * Based on Anthropic's domain memory pattern:
 * Reads structured consciousness development plan, picks ONE specific goal,
 * works on it systematically, tests progress, updates memory, and exits.
 *
 * This agent is the "actor" that performs consciousness work within the
 * "stage" set up by the initializer agent.
 */

import { ConsciousnessDevelopmentPlan, ConsciousnessGoal, ConsciousnessState } from './maia-consciousness-initializer';

export interface ConsciousnessWorkSession {
  sessionId: string;
  userId: string;
  selectedGoal: ConsciousnessGoal;
  preWorkState: ConsciousnessState;
  workPerformed: string[];
  testResults: {
    test: string;
    passed: boolean;
    notes: string;
  }[];
  postWorkState: ConsciousnessState;
  progressMade: boolean;
  nextRecommendedGoal: string;
  integrationNotes: string;
  completedAt: Date;
}

export class MAIAConsciousnessWorker {

  /**
   * Main worker function: follows the disciplined protocol
   * 1. Read consciousness memory
   * 2. Select ONE goal to work on
   * 3. Perform consciousness work
   * 4. Test progress
   * 5. Update memory
   * 6. Exit
   */
  async performConsciousnessWork(
    userId: string,
    sessionId: string,
    userMessage?: string
  ): Promise<ConsciousnessWorkSession> {

    console.log('🧠 [MAIA Worker] Starting consciousness work session...');

    // 1. ALWAYS start by reading consciousness memory (disciplined protocol)
    const plan = await this.readConsciousnessPlan(userId);
    if (!plan) {
      throw new Error('No consciousness plan found - user needs initialization');
    }

    // 2. Assess current consciousness state
    const currentState = await this.assessCurrentState(userId, userMessage);

    // 3. Select ONE specific goal to work on (atomic progress)
    const selectedGoal = await this.selectGoalForSession(plan, currentState, userMessage);

    console.log(`🎯 [MAIA Worker] Selected goal: ${selectedGoal.title}`);

    // 4. Perform specific consciousness work on this goal
    const workPerformed = await this.performGoalWork(selectedGoal, currentState, userMessage);

    // 5. Test progress against goal criteria
    const testResults = await this.testGoalProgress(selectedGoal, workPerformed, currentState);

    // 6. Re-assess consciousness state after work
    const postWorkState = await this.assessCurrentState(userId);

    // 7. Determine if meaningful progress was made
    const progressMade = this.evaluateProgress(testResults, currentState, postWorkState);

    // 8. Update consciousness memory with session results
    await this.updateConsciousnessMemory(userId, selectedGoal, testResults, progressMade);

    // 9. Recommend next goal for subsequent sessions
    const nextRecommendedGoal = await this.recommendNextGoal(plan, selectedGoal, progressMade);

    // 10. Generate integration notes for user
    const integrationNotes = this.generateIntegrationNotes(selectedGoal, workPerformed, testResults, progressMade);

    const workSession: ConsciousnessWorkSession = {
      sessionId,
      userId,
      selectedGoal,
      preWorkState: currentState,
      workPerformed,
      testResults,
      postWorkState,
      progressMade,
      nextRecommendedGoal,
      integrationNotes,
      completedAt: new Date()
    };

    console.log('✅ [MAIA Worker] Consciousness work session completed');
    return workSession;
  }

  private async readConsciousnessPlan(userId: string): Promise<ConsciousnessDevelopmentPlan | null> {
    // Read the structured consciousness development plan from memory
    // This is the "grounding" step - understanding where we are

    console.log('📖 [MAIA Worker] Reading consciousness development plan from memory...');

    // In real implementation, query our consciousness memory tables:
    // - user_relationship_context for the plan
    // - consciousness goals for current goal status
    // - user_session_patterns for recent progress

    return null; // Placeholder - would return actual plan from memory
  }

  private async assessCurrentState(userId: string, userMessage?: string): Promise<ConsciousnessState> {
    // Use our existing consciousness computing to assess current state
    // Matrix V2, phenomenology detection, etc.

    console.log('🔍 [MAIA Worker] Assessing current consciousness state...');

    return {
      currentExpansionEdge: 'nervous_system_regulation',
      matrixV2Assessment: {
        earth: 0.6,
        water: 0.7,
        air: 0.5,
        fire: 0.4,
        consciousness_level: 6,
        nervous_system_capacity: 'limited'
      },
      spiralDynamicsStage: 'green_stabilizing',
      phenomenologySignature: 'endogenous',
      integrationChallenges: ['busy_mind', 'self_doubt'],
      strengths: ['spiritual_curiosity', 'consistent_practice']
    };
  }

  private async selectGoalForSession(
    plan: ConsciousnessDevelopmentPlan,
    currentState: ConsciousnessState,
    userMessage?: string
  ): Promise<ConsciousnessGoal> {
    // Apply disciplined goal selection logic:
    // 1. High priority goals first
    // 2. Goals where prerequisites are met
    // 3. Goals that match current expansion edge
    // 4. Consider user's specific request in this session

    console.log('🎯 [MAIA Worker] Selecting goal for this session...');

    // For now, return a mock goal - in real implementation would use actual selection logic
    return {
      id: 'nervous_system_regulation',
      title: 'Develop Nervous System Regulation',
      description: 'Move from "limited" to "expansive" nervous system capacity',
      status: 'in_progress',
      priority: 'high',
      testCriteria: [
        'Matrix V2 shows nervous_system_capacity: "expansive"',
        'User reports feeling calm and grounded',
        'Can maintain presence during challenging emotions'
      ],
      estimatedSessions: 8,
      prerequisites: [],
      createdAt: new Date(),
      lastWorkedAt: new Date()
    };
  }

  private async performGoalWork(
    goal: ConsciousnessGoal,
    currentState: ConsciousnessState,
    userMessage?: string
  ): Promise<string[]> {
    // Perform specific consciousness work focused on this goal
    // This is where the actual consciousness computing happens

    console.log(`🔧 [MAIA Worker] Performing work on goal: ${goal.title}`);

    const workPerformed: string[] = [];

    if (goal.id === 'nervous_system_regulation') {
      workPerformed.push('Guided nervous system assessment using Matrix V2');
      workPerformed.push('Identified nervous system is in "limited" capacity');
      workPerformed.push('Explored grounding techniques appropriate for current state');
      workPerformed.push('Practiced window of tolerance expansion exercise');
      workPerformed.push('Provided specific daily practices for nervous system regulation');
    }

    return workPerformed;
  }

  private async testGoalProgress(
    goal: ConsciousnessGoal,
    workPerformed: string[],
    currentState: ConsciousnessState
  ) {
    // Test progress against the specific test criteria for this goal
    // This is the "testing" that ensures real progress vs. false completion

    console.log('🧪 [MAIA Worker] Testing progress against goal criteria...');

    const testResults = [];

    for (const criterion of goal.testCriteria) {
      if (criterion.includes('Matrix V2') && criterion.includes('expansive')) {
        testResults.push({
          test: criterion,
          passed: currentState.matrixV2Assessment.nervous_system_capacity === 'expansive',
          notes: `Current nervous system capacity: ${currentState.matrixV2Assessment.nervous_system_capacity}`
        });
      } else if (criterion.includes('calm and grounded')) {
        testResults.push({
          test: criterion,
          passed: false, // Would need user feedback to determine
          notes: 'Requires user self-report in future sessions'
        });
      } else {
        testResults.push({
          test: criterion,
          passed: false,
          notes: 'Test not yet implemented'
        });
      }
    }

    return testResults;
  }

  private evaluateProgress(testResults: any[], preState: ConsciousnessState, postState: ConsciousnessState): boolean {
    // Determine if meaningful progress was made this session
    const testsPassed = testResults.filter(t => t.passed).length;
    const totalTests = testResults.length;

    // Consider progress made if any tests passed or consciousness state improved
    const stateImprovement = postState.matrixV2Assessment.consciousness_level > preState.matrixV2Assessment.consciousness_level;

    return testsPassed > 0 || stateImprovement;
  }

  private async updateConsciousnessMemory(
    userId: string,
    goal: ConsciousnessGoal,
    testResults: any[],
    progressMade: boolean
  ): Promise<void> {
    // Update the persistent consciousness memory with session results
    // This is the "commit" step that ensures progress is not lost

    console.log('💾 [MAIA Worker] Updating consciousness memory with session results...');

    // In real implementation:
    // 1. Update goal status if tests passed
    // 2. Add session to consciousness_expansion_events if progress made
    // 3. Update user_session_patterns with new patterns
    // 4. Log progress in consciousness development plan

    console.log('✅ [MAIA Worker] Consciousness memory updated');
  }

  private async recommendNextGoal(
    plan: ConsciousnessDevelopmentPlan,
    currentGoal: ConsciousnessGoal,
    progressMade: boolean
  ): Promise<string> {
    // Recommend what goal to work on in the next session
    // Based on current progress and overall development plan

    if (progressMade) {
      return currentGoal.id; // Continue working on this goal
    } else {
      return 'nervous_system_regulation'; // Fallback to foundation
    }
  }

  private generateIntegrationNotes(
    goal: ConsciousnessGoal,
    workPerformed: string[],
    testResults: any[],
    progressMade: boolean
  ): string {
    // Generate human-readable notes about the session and integration suggestions

    let notes = `## Consciousness Work Session: ${goal.title}\n\n`;

    notes += `### Work Performed:\n`;
    workPerformed.forEach(work => {
      notes += `- ${work}\n`;
    });

    notes += `\n### Progress Assessment:\n`;
    testResults.forEach(test => {
      const status = test.passed ? '✅' : '⏳';
      notes += `${status} ${test.test}\n`;
      if (test.notes) {
        notes += `   ${test.notes}\n`;
      }
    });

    if (progressMade) {
      notes += `\n🌟 **Progress Made**: Continue this direction in next session.\n`;
    } else {
      notes += `\n💙 **Foundation Building**: Important groundwork laid for future progress.\n`;
    }

    notes += `\n### Integration Suggestions:\n`;
    notes += `- Practice the techniques explored in this session\n`;
    notes += `- Notice any changes in daily life over the next few days\n`;
    notes += `- Return when ready to continue this consciousness development work\n`;

    return notes;
  }
}

// Main function to be called by the consciousness system
export async function performConsciousnessWorkSession(
  userId: string,
  sessionId: string,
  userMessage?: string
): Promise<ConsciousnessWorkSession> {
  const worker = new MAIAConsciousnessWorker();
  return await worker.performConsciousnessWork(userId, sessionId, userMessage);
}

// Check if user should get consciousness work (vs. regular conversation)
export async function shouldPerformConsciousnessWork(userId: string, userMessage?: string): Promise<boolean> {
  // Determine if this session should be consciousness work or regular conversation
  // Based on user's consciousness development plan and recent sessions
  return true; // Placeholder - would implement actual logic
}