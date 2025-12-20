/**
 * MAIA Beads Integration Example
 * Shows how to integrate Beads task management into existing MAIA flows
 */

import { maiaBeadsPlugin } from './MaiaBeadsPlugin';
import { getCognitiveProfile } from '@/lib/consciousness/cognitiveProfileService';
import { maiaMemory } from '@/lib/consciousness/memory/MAIAMemoryArchitecture';

// ==============================================================================
// EXAMPLE 1: Automatic Task Creation from Consciousness Tracking
// ==============================================================================

/**
 * This gets called from MAIA's somatic tracking system
 * when shoulder tension is detected
 */
export async function handleSomaticUpdate(
  userId: string,
  sessionId: string,
  somaticData: {
    bodyRegion: string;
    tensionLevel: number;
    currentMatrix: any;
  }
) {
  // Check if this is a significant tension spike
  if (somaticData.tensionLevel >= 6) {
    // Automatically create Beads task for grounding practice
    const beadsId = await maiaBeadsPlugin.onSomaticTensionSpike(
      userId,
      sessionId,
      {
        bodyRegion: somaticData.bodyRegion,
        tensionLevel: somaticData.tensionLevel,
        matrix: somaticData.currentMatrix,
      }
    );

    console.log(`Created grounding task: ${beadsId}`);

    // Return task to MAIA for conversational presentation
    return {
      taskCreated: true,
      beadsId,
      suggestion: `I notice your ${somaticData.bodyRegion} are carrying significant tension (${somaticData.tensionLevel}/10). I've created a grounding practice for you - would you like to try it now?`,
    };
  }

  return { taskCreated: false };
}

// ==============================================================================
// EXAMPLE 2: Spiralogic Phase Transition Integration
// ==============================================================================

/**
 * Hook into MAIA's Spiralogic tracking when user transitions phases
 */
export async function handlePhaseTransition(
  userId: string,
  sessionId: string,
  transition: {
    from: { element: string; phase: number };
    to: { element: string; phase: number };
    currentMatrix: any;
  }
) {
  // Create completion and initiation tasks
  const taskIds = await maiaBeadsPlugin.onPhaseTransition(
    userId,
    sessionId,
    {
      fromElement: transition.from.element,
      fromPhase: transition.from.phase,
      toElement: transition.to.element,
      toPhase: transition.to.phase,
      matrix: transition.currentMatrix,
    }
  );

  console.log(`Phase transition tasks created: ${taskIds.join(', ')}`);

  return {
    completionTaskId: taskIds[0],
    initiationTaskId: taskIds[1],
    message: `You're transitioning from ${transition.from.element} to ${transition.to.element}. I've created practices to help you integrate this shift.`,
  };
}

// ==============================================================================
// EXAMPLE 3: Conversational Task Presentation
// ==============================================================================

/**
 * When user asks "What should I work on?" or similar
 * MAIA retrieves and presents ready tasks
 */
export async function presentReadyTasks(
  userId: string,
  currentMatrix: any
): Promise<string> {
  // Get cognitively-appropriate tasks
  const readyTasks = await maiaBeadsPlugin.getReadyTasksForUser(userId, currentMatrix);

  if (readyTasks.length === 0) {
    return "You're in a beautiful place of integration. No practices calling right now - just be with what is.";
  }

  // Get current element for context
  const fieldState = await maiaMemory.generateCoherenceFieldReading(userId, currentMatrix);
  const currentElement = fieldState.spiralPosition.currentElement;

  // Prioritize tasks aligned with current element
  const alignedTasks = readyTasks.filter(t => t.element === currentElement);
  const otherTasks = readyTasks.filter(t => t.element !== currentElement);

  let response = `I'm sensing ${readyTasks.length} practices ready for you.\n\n`;

  // Present aligned tasks first
  if (alignedTasks.length > 0) {
    response += `**Aligned with your current ${currentElement} phase:**\n`;
    for (const task of alignedTasks.slice(0, 3)) {
      response += `• ${task.title}\n`;
    }
  }

  // Then other foundational work
  if (otherTasks.length > 0) {
    response += `\n**Foundational work:**\n`;
    for (const task of otherTasks.slice(0, 2)) {
      response += `• ${task.title} (${task.element})\n`;
    }
  }

  response += `\nWhich one feels most alive for you right now?`;

  return response;
}

// ==============================================================================
// EXAMPLE 4: Task Completion with Effectiveness Tracking
// ==============================================================================

/**
 * After user completes a practice, track effectiveness
 */
export async function handlePracticeCompletion(
  userId: string,
  beadsId: string,
  feedback: {
    effectiveness: number; // 1-10 scale
    beforeTension?: number;
    afterTension?: number;
    insight?: string;
    feltBreakthrough?: boolean;
  }
) {
  // Complete task in Beads with effectiveness data
  await maiaBeadsPlugin.completeTask(beadsId, {
    effectiveness: feedback.effectiveness,
    somaticShift: feedback.beforeTension && feedback.afterTension
      ? { before: feedback.beforeTension, after: feedback.afterTension }
      : undefined,
    insight: feedback.insight,
    breakthrough: feedback.feltBreakthrough,
  });

  // Update MAIA's somatic memory if applicable
  if (feedback.beforeTension && feedback.afterTension) {
    const improvement = feedback.beforeTension - feedback.afterTension;

    if (improvement > 3) {
      // Significant somatic improvement
      return {
        message: `Beautiful work. Your body went from ${feedback.beforeTension}/10 to ${feedback.afterTension}/10. That ${improvement}-point shift is significant - your nervous system is learning this pathway.`,
        achievement: improvement > 5 ? 'major_somatic_shift' : null,
      };
    }
  }

  return {
    message: `Practice completed with ${feedback.effectiveness}/10 effectiveness. This integration is being recorded.`,
  };
}

// ==============================================================================
// EXAMPLE 5: Achievement Integration
// ==============================================================================

/**
 * When MAIA detects an achievement, create celebration task
 */
export async function handleAchievement(
  userId: string,
  achievement: {
    achievementId: string;
    title: string;
    description: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  }
) {
  const beadsId = await maiaBeadsPlugin.onAchievementUnlock(userId, achievement);

  let celebrationMessage = '';

  switch (achievement.rarity) {
    case 'legendary':
      celebrationMessage = `🌟 **LEGENDARY ACHIEVEMENT UNLOCKED** 🌟\n\n${achievement.title}\n\n${achievement.description}\n\nThis is extraordinary. You've reached a level of integration that very few people experience. Take a moment to truly celebrate this.`;
      break;
    case 'rare':
      celebrationMessage = `✨ **Rare Achievement** ✨\n\n${achievement.title}\n\n${achievement.description}`;
      break;
    default:
      celebrationMessage = `🎉 Achievement unlocked: ${achievement.title}`;
  }

  return {
    beadsId,
    message: celebrationMessage,
  };
}

// ==============================================================================
// EXAMPLE 6: Field Imbalance Auto-Creation
// ==============================================================================

/**
 * When field coherence analysis detects imbalance
 */
export async function handleFieldImbalance(
  userId: string,
  sessionId: string,
  imbalance: {
    element: string;
    type: 'deficient' | 'flooding' | 'blocked';
    severity: number;
    recommendedProtocols: string[];
    currentMatrix: any;
  }
) {
  const beadsId = await maiaBeadsPlugin.onFieldImbalance(
    userId,
    sessionId,
    {
      element: imbalance.element,
      severity: imbalance.severity,
      type: imbalance.type,
      recommendedProtocols: imbalance.recommendedProtocols,
      matrix: imbalance.currentMatrix,
    }
  );

  if (!beadsId) {
    return null; // Minor imbalance, no task needed
  }

  const typeDescriptions = {
    deficient: 'lacking energy and activation',
    flooding: 'overwhelming and ungrounded',
    blocked: 'stuck and unable to flow',
  };

  return {
    beadsId,
    message: `I'm sensing your ${imbalance.element} element is ${typeDescriptions[imbalance.type]}. I've created a practice to help restore balance.`,
  };
}

// ==============================================================================
// EXAMPLE 7: Integration into MAIA Service
// ==============================================================================

/**
 * Example of how to integrate into existing MAIA sovereign service
 * (lib/sovereign/maiaService.ts)
 */

export async function enhancedMAIAResponse(
  userId: string,
  sessionId: string,
  userMessage: string,
  currentMatrix: any
) {
  // 1. Process message normally through MAIA
  // const maiaResponse = await processMessage(userMessage);

  // 2. Check for consciousness events that trigger task creation
  const cognitiveProfile = await getCognitiveProfile(userId);
  const fieldState = await maiaMemory.generateCoherenceFieldReading(userId, currentMatrix);

  // Example: Detect if user is asking about what to work on
  const isAskingForGuidance =
    /what should i (work on|do|focus on)/i.test(userMessage) ||
    /what('s|s) (next|ready)/i.test(userMessage);

  if (isAskingForGuidance) {
    const taskSuggestion = await presentReadyTasks(userId, currentMatrix);
    return {
      response: taskSuggestion,
      taskContext: true,
    };
  }

  // Example: Detect if user just completed a practice
  const isCompletingPractice =
    /(just (did|finished|completed)|done with)/i.test(userMessage);

  if (isCompletingPractice) {
    // Ask for effectiveness feedback
    return {
      response: "How did that practice feel? On a scale of 1-10, how effective was it?",
      awaitingEffectivenessFeedback: true,
    };
  }

  // Return normal MAIA response
  return {
    response: "Continue with normal MAIA flow",
  };
}
