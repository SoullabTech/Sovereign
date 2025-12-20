/**
 * MAIA Service Integration for Beads Task Management
 *
 * Hooks into MAIA's consciousness processing to automatically create tasks
 * when significant consciousness events occur.
 *
 * Integration Points:
 * 1. Post-response processing: Check for consciousness events → create tasks
 * 2. Conversational task queries: "What should I work on?"
 * 3. Practice completion tracking
 */

import { maiaBeadsPlugin } from './MaiaBeadsPlugin';
import type { ConsciousnessMatrixV2 } from '@/lib/consciousness/memory/MAIAMemoryArchitecture';
import type { CognitiveProfile } from '@/lib/consciousness/cognitiveProfileService';
import type { BloomDetection } from '@/lib/consciousness/bloomCognitiveDetector';

/**
 * Integration hook: Call AFTER getMaiaResponse completes
 * Analyzes response metadata for consciousness events → creates tasks
 */
export async function processConsciousnessEventsForBeads(params: {
  userId: string;
  sessionId: string;
  userInput: string;
  maiaResponse: string;
  meta: {
    processingProfile?: 'FAST' | 'CORE' | 'DEEP';
    consciousnessData?: any;
    cognitiveProfile?: CognitiveProfile;
    bloomDetection?: BloomDetection;
    mythicAtlas?: any;
    fieldRouting?: any;
    spiralMeta?: any;
  };
  conversationHistory?: Array<{ userMessage: string; maiaResponse: string }>;
}): Promise<{
  tasksCreated: number;
  taskIds: string[];
  suggestions: string[];
}> {
  const { userId, sessionId, userInput, maiaResponse, meta, conversationHistory = [] } = params;

  const tasksCreated: string[] = [];
  const suggestions: string[] = [];

  // Skip task creation for FAST path (too light for task generation)
  if (meta.processingProfile === 'FAST') {
    return { tasksCreated: 0, taskIds: [], suggestions: [] };
  }

  try {
    // 1. SOMATIC TENSION DETECTION
    // Pattern: MAIA mentions body regions with tension
    const somaticPatterns = detectSomaticTensionPatterns(maiaResponse, userInput);

    if (somaticPatterns.detected && somaticPatterns.tensionLevel >= 6) {
      const beadsId = await maiaBeadsPlugin.onSomaticTensionSpike(
        userId,
        sessionId,
        {
          bodyRegion: somaticPatterns.bodyRegion!,
          tensionLevel: somaticPatterns.tensionLevel,
          matrix: buildConsciousnessMatrix(meta),
        }
      );

      if (beadsId) {
        tasksCreated.push(beadsId);
        suggestions.push(
          `I've created a grounding practice for your ${somaticPatterns.bodyRegion} tension. Would you like to try it now?`
        );
        console.log(`🌱 [Beads Integration] Created somatic task: ${beadsId}`);
      }
    }

    // 2. PHASE TRANSITION DETECTION
    // Pattern: Spiral state changed from previous session
    const phaseTransition = detectPhaseTransition(meta.spiralMeta, conversationHistory);

    if (phaseTransition.detected) {
      const taskIds = await maiaBeadsPlugin.onPhaseTransition(
        userId,
        sessionId,
        {
          fromElement: phaseTransition.fromElement!,
          fromPhase: phaseTransition.fromPhase!,
          toElement: phaseTransition.toElement!,
          toPhase: phaseTransition.toPhase!,
          matrix: buildConsciousnessMatrix(meta),
        }
      );

      tasksCreated.push(...taskIds);
      suggestions.push(
        `You're transitioning from ${phaseTransition.fromElement} to ${phaseTransition.toElement}. I've created integration practices to help you bridge this shift.`
      );
      console.log(`🌀 [Beads Integration] Created phase transition tasks: ${taskIds.join(', ')}`);
    }

    // 3. FIELD IMBALANCE DETECTION
    // Pattern: Field routing shows "not safe" or elemental deficiency
    const fieldImbalance = detectFieldImbalance(meta.fieldRouting, meta.mythicAtlas);

    if (fieldImbalance.detected && fieldImbalance.severity >= 5) {
      const beadsId = await maiaBeadsPlugin.onFieldImbalance(
        userId,
        sessionId,
        {
          element: fieldImbalance.element!,
          severity: fieldImbalance.severity,
          type: fieldImbalance.type!,
          recommendedProtocols: fieldImbalance.protocols,
          matrix: buildConsciousnessMatrix(meta),
        }
      );

      if (beadsId) {
        tasksCreated.push(beadsId);
        console.log(`⚖️ [Beads Integration] Created field balance task: ${beadsId}`);
      }
    }

    // 4. COGNITIVE DEVELOPMENT MILESTONE
    // Pattern: Bloom level jumped significantly
    const cognitiveLeap = detectCognitiveLeap(meta.bloomDetection, meta.cognitiveProfile);

    if (cognitiveLeap.detected && cognitiveLeap.levelJump >= 1) {
      // Achievement celebration handled by onAchievementUnlock
      console.log(`🧠 [Beads Integration] Cognitive leap detected: Level ${cognitiveLeap.previousLevel} → ${cognitiveLeap.newLevel}`);
    }

    return {
      tasksCreated: tasksCreated.length,
      taskIds: tasksCreated,
      suggestions,
    };
  } catch (error) {
    console.error('❌ [Beads Integration] Event processing failed (non-blocking):', error);
    return { tasksCreated: 0, taskIds: [], suggestions: [] };
  }
}

/**
 * Integration hook: Handle "What should I work on?" queries
 */
export async function handleTaskReadinessQuery(params: {
  userId: string;
  userInput: string;
  meta: {
    cognitiveProfile?: CognitiveProfile;
    mythicAtlas?: any;
    spiralMeta?: any;
  };
}): Promise<{ isTaskQuery: boolean; response?: string }> {
  const { userId, userInput, meta } = params;

  // Detect task-related queries
  const isTaskQuery =
    /what should i (work on|do|focus on)/i.test(userInput) ||
    /what('s|s) (next|ready)/i.test(userInput) ||
    /any (practices|tasks|exercises)/i.test(userInput);

  if (!isTaskQuery) {
    return { isTaskQuery: false };
  }

  try {
    const readyTasks = await maiaBeadsPlugin.getReadyTasksForUser(
      userId,
      buildConsciousnessMatrix(meta)
    );

    if (readyTasks.length === 0) {
      return {
        isTaskQuery: true,
        response: "You're in a beautiful place of integration right now. No practices are calling — just be with what is.",
      };
    }

    // Get current element for prioritization
    const currentElement = meta.spiralMeta?.element || meta.mythicAtlas?.element || null;

    // Prioritize tasks aligned with current element
    const alignedTasks = currentElement
      ? readyTasks.filter((t) => t.element === currentElement)
      : [];
    const otherTasks = readyTasks.filter((t) => t.element !== currentElement);

    let response = `I'm sensing ${readyTasks.length} practice${readyTasks.length > 1 ? 's' : ''} ready for you.\n\n`;

    // Present aligned tasks first
    if (alignedTasks.length > 0) {
      response += `**Aligned with your current ${currentElement} phase:**\n`;
      for (const task of alignedTasks.slice(0, 3)) {
        response += `• ${task.title}\n`;
      }
    }

    // Then other foundational work
    if (otherTasks.length > 0 && alignedTasks.length < readyTasks.length) {
      response += `\n**Foundational work:**\n`;
      for (const task of otherTasks.slice(0, 2)) {
        response += `• ${task.title} (${task.element})\n`;
      }
    }

    response += `\nWhich one feels most alive for you right now?`;

    console.log(`🎯 [Beads Integration] Presented ${readyTasks.length} ready tasks`);

    return { isTaskQuery: true, response };
  } catch (error) {
    console.error('❌ [Beads Integration] Task readiness query failed:', error);
    return {
      isTaskQuery: true,
      response: "I'm having trouble accessing your practices right now. Let me know what area you'd like to work on and we can explore it together.",
    };
  }
}

/**
 * Integration hook: Track practice completion from conversation
 */
export async function detectAndLogPracticeCompletion(params: {
  userId: string;
  userInput: string;
  conversationHistory: Array<{ userMessage: string; maiaResponse: string }>;
}): Promise<{ completionDetected: boolean; followUpQuestion?: string }> {
  const { userId, userInput, conversationHistory } = params;

  // Detect completion statements
  const isCompletingPractice =
    /(just (did|finished|completed)|done with)/i.test(userInput) ||
    /i (tried|practiced|worked on)/i.test(userInput);

  if (!isCompletingPractice) {
    return { completionDetected: false };
  }

  // Check if previous MAIA response suggested a specific practice
  const lastMaiaResponse = conversationHistory[conversationHistory.length - 1]?.maiaResponse || '';
  const suggestedPractice = extractPracticeName(lastMaiaResponse);

  if (!suggestedPractice) {
    // Generic practice completion - ask for effectiveness
    return {
      completionDetected: true,
      followUpQuestion: "How did that practice feel? On a scale of 1-10, how effective was it?",
    };
  }

  console.log(`✅ [Beads Integration] Practice completion detected: ${suggestedPractice}`);

  // Return follow-up question to gather effectiveness data
  return {
    completionDetected: true,
    followUpQuestion: `How did the ${suggestedPractice} practice feel? On a scale of 1-10, how effective was it for you?`,
  };
}

// ==============================================================================
// HELPER FUNCTIONS
// ==============================================================================

/**
 * Detect somatic tension patterns in MAIA's response or user input
 */
function detectSomaticTensionPatterns(maiaResponse: string, userInput: string): {
  detected: boolean;
  bodyRegion?: string;
  tensionLevel: number;
} {
  const combinedText = `${userInput} ${maiaResponse}`.toLowerCase();

  // Body region detection
  const bodyRegions = ['shoulders', 'neck', 'jaw', 'chest', 'stomach', 'back', 'hips'];
  const detectedRegion = bodyRegions.find((region) => combinedText.includes(region));

  // Tension level inference from language intensity
  const tensionKeywords = {
    high: ['very tense', 'extremely tight', 'severe', 'overwhelming', 'unbearable'],
    medium: ['tense', 'tight', 'uncomfortable', 'stiff', 'holding'],
    low: ['slightly', 'a little', 'minor', 'subtle'],
  };

  let tensionLevel = 0;

  if (tensionKeywords.high.some((keyword) => combinedText.includes(keyword))) {
    tensionLevel = 8;
  } else if (tensionKeywords.medium.some((keyword) => combinedText.includes(keyword))) {
    tensionLevel = 6;
  } else if (tensionKeywords.low.some((keyword) => combinedText.includes(keyword))) {
    tensionLevel = 4;
  } else if (detectedRegion) {
    // Default tension if region mentioned but no intensity
    tensionLevel = 5;
  }

  return {
    detected: !!detectedRegion && tensionLevel >= 4,
    bodyRegion: detectedRegion,
    tensionLevel,
  };
}

/**
 * Detect phase transitions from spiral metadata
 */
function detectPhaseTransition(
  currentSpiralMeta: any,
  conversationHistory: Array<any>
): {
  detected: boolean;
  fromElement?: string;
  fromPhase?: number;
  toElement?: string;
  toPhase?: number;
} {
  if (!currentSpiralMeta?.injected) {
    return { detected: false };
  }

  // TODO: Implement spiral state history tracking
  // For now, return false - will be implemented when spiral state history is available
  return { detected: false };
}

/**
 * Detect field imbalances from field routing and mythic atlas
 */
function detectFieldImbalance(
  fieldRouting: any,
  mythicAtlas: any
): {
  detected: boolean;
  element?: string;
  severity: number;
  type?: 'deficient' | 'flooding' | 'blocked';
  protocols: string[];
} {
  // Field not safe = possible imbalance
  if (fieldRouting && !fieldRouting.fieldWorkSafe) {
    const element = mythicAtlas?.element || 'earth'; // Default to grounding

    return {
      detected: true,
      element,
      severity: 6,
      type: 'deficient', // Assume deficiency when field work unsafe
      protocols: [`${element}-grounding`, 'coherence-restoration'],
    };
  }

  return { detected: false, severity: 0, protocols: [] };
}

/**
 * Detect cognitive leaps from Bloom detection
 */
function detectCognitiveLeap(
  bloomDetection: BloomDetection | undefined,
  cognitiveProfile: CognitiveProfile | undefined
): {
  detected: boolean;
  previousLevel?: number;
  newLevel?: number;
  levelJump: number;
} {
  if (!bloomDetection || !cognitiveProfile) {
    return { detected: false, levelJump: 0 };
  }

  const currentLevel = bloomDetection.numericLevel;
  const averageLevel = cognitiveProfile.rollingAverage;

  // Detect if current level is significantly higher than average (indicates growth)
  const levelJump = currentLevel - averageLevel;

  return {
    detected: levelJump >= 1,
    previousLevel: Math.floor(averageLevel),
    newLevel: currentLevel,
    levelJump,
  };
}

/**
 * Build consciousness matrix from response metadata
 */
function buildConsciousnessMatrix(meta: any): ConsciousnessMatrixV2 {
  // Minimal matrix construction - will be enhanced as more data becomes available
  return {
    elementalField: {
      fire: 0.5,
      water: 0.5,
      earth: 0.5,
      air: 0.5,
      aether: 0.5,
    },
    spiralPosition: {
      currentElement: meta.mythicAtlas?.element || meta.spiralMeta?.element || 'earth',
      currentPhase: meta.spiralMeta?.phase || 1,
      depth: 1,
    },
    coherence: {
      overall: meta.fieldRouting?.fieldWorkSafe ? 0.7 : 0.4,
      byElement: {
        fire: 0.5,
        water: 0.5,
        earth: 0.5,
        air: 0.5,
        aether: 0.5,
      },
    },
    cognitive: {
      currentLevel: meta.bloomDetection?.numericLevel || 3,
      averageLevel: meta.cognitiveProfile?.rollingAverage || 3,
      bypassingFrequency: {
        spiritual: meta.cognitiveProfile?.bypassingFrequency?.spiritual || 0,
        intellectual: meta.cognitiveProfile?.bypassingFrequency?.intellectual || 0,
      },
    },
  } as ConsciousnessMatrixV2;
}

/**
 * Extract practice name from MAIA's response
 */
function extractPracticeName(maiaResponse: string): string | null {
  // Look for common practice patterns
  const practicePatterns = [
    /try\s+(?:the\s+)?([a-z\s-]+)\s+practice/i,
    /I've created\s+(?:a\s+)?([a-z\s-]+)\s+(?:practice|task)/i,
    /work on\s+([a-z\s-]+)/i,
  ];

  for (const pattern of practicePatterns) {
    const match = maiaResponse.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
}
