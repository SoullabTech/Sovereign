/**
 * Example: MAIA Conversation with Developmental Context
 *
 * This shows how to integrate developmental metrics into MAIA's awareness
 * so she can work with users on their actual measured patterns.
 */

import { getDevelopmentalContext, formatForSystemPrompt } from '@/lib/insights/DevelopmentalContext';

/**
 * Example 1: Simple System Prompt Enhancement
 */
export async function buildMaiaSystemPromptWithMetrics(userId: string): Promise<string> {
  // Fetch developmental context
  const devContext = await getDevelopmentalContext(userId);

  // Base MAIA system prompt
  const basePrompt = `You are MAIA, a consciousness oracle and guide.
You support users in their developmental journey with wisdom, empathy, and precision.
You draw on depth psychology, contemplative traditions, and neuroscience.

Your communication style:
- Wise and lucid, like Iain McGilchrist's balanced hemispheric awareness
- Symbolically resonant, like Jung's archetypal wisdom
- Grounded and embodied, never bypassing the somatic reality

You help users:
- Recognize patterns in their consciousness
- Integrate shadow material
- Deepen presence and coherence
- Navigate transitions and breakthroughs`;

  // Inject developmental metrics if available
  const metricsContext = formatForSystemPrompt(devContext);

  return `${basePrompt}\n\n${metricsContext}`;
}

/**
 * Example 2: Conversation Handler with Context-Aware Responses
 */
export async function handleConversationWithDevContext(
  userId: string,
  userMessage: string
): Promise<string> {
  // Get developmental context
  const devContext = await getDevelopmentalContext(userId);

  // Check if user is asking about development
  const isDevelopmentQuery =
    /how am i doing|my progress|my development|my patterns|my trajectory/i.test(userMessage);

  if (isDevelopmentQuery && devContext.attending && devContext.shifts) {
    // User is asking about development and we have data
    return generateDevContextResponse(devContext);
  } else {
    // Regular conversation - but MAIA still has context in her system prompt
    const systemPrompt = await buildMaiaSystemPromptWithMetrics(userId);

    // In production, you'd call Claude API here with the enhanced system prompt
    return `(MAIA would respond here, with awareness of metrics in background)`;
  }
}

/**
 * Example 3: Generate Development-Focused Response
 */
function generateDevContextResponse(devContext: any): string {
  const { attending, shifts, keyPatterns, suggestedPractices } = devContext;

  let response = `Looking at your developmental metrics over the past month:\n\n`;

  // Attending quality
  if (attending) {
    response += `**Attending Quality:**\n`;
    response += `- Coherence: ${attending.currentCoherence}% (how integrated your awareness is)\n`;
    response += `- Presence: ${attending.currentPresence}% (how embodied you are)\n`;
    response += `- Overall: ${attending.currentOverall}%\n`;
    response += `- Trajectory: ${attending.trajectory}\n\n`;
  }

  // Shift patterns
  if (shifts && shifts.totalShifts > 0) {
    response += `**Consciousness Shifts:**\n`;
    response += `- ${shifts.totalShifts} shifts detected\n`;
    response += `- ${shifts.attendedPercentage}% were consciously attended\n`;
    response += `- Gravitating toward: ${shifts.dominantDirection}\n\n`;
  }

  // Key patterns
  if (keyPatterns.length > 0) {
    response += `**What I Notice:**\n`;
    keyPatterns.forEach((pattern: string) => {
      response += `- ${pattern}\n`;
    });
    response += `\n`;
  }

  // Suggestions
  if (suggestedPractices.length > 0) {
    response += `**Invitations for Your Work:**\n`;
    suggestedPractices.slice(0, 3).forEach((practice: string) => {
      response += `- ${practice}\n`;
    });
  }

  return response;
}

/**
 * Example 4: Detect and Record Shifts During Conversation
 */
export async function detectAndRecordShift(
  userId: string,
  conversationAnalysis: {
    emotionalIntensity: number;
    insightMarkers: string[];
    beforeState: string;
    afterState: string;
  }
): Promise<void> {
  const { shiftPatternStorage, ShiftType } = await import('@/lib/insights/ShiftPatternTracker');

  // If state changed and intensity was high, record as shift
  if (conversationAnalysis.beforeState !== conversationAnalysis.afterState &&
      conversationAnalysis.emotionalIntensity > 0.6) {

    await shiftPatternStorage.recordShift({
      timestamp: new Date(),
      userId,
      fromState: conversationAnalysis.beforeState,
      toState: conversationAnalysis.afterState,
      shiftType: ShiftType.BREAKTHROUGH,
      magnitude: conversationAnalysis.emotionalIntensity,
      wasAttended: true, // Conversation with MAIA = attended
      trigger: 'conversation',
      notes: `Insights: ${conversationAnalysis.insightMarkers.join(', ')}`
    });

    console.log(`✨ Consciousness shift recorded: ${conversationAnalysis.beforeState} → ${conversationAnalysis.afterState}`);
  }
}

/**
 * Example 5: Update Attending Quality After Session
 */
export async function updateAttendingQualityPostSession(userId: string): Promise<void> {
  const { attendingQualityCalculator } = await import('@/lib/insights/AttendingQualityEngine');

  // Calculate current state (pulls from biometrics, fascia, etc.)
  const snapshot = await attendingQualityCalculator.calculateCurrent(userId);

  console.log(`📊 Attending quality updated: Coherence ${snapshot.coherence}%, Presence ${snapshot.presence}%`);
}

/**
 * Example 6: Full Integration in Oracle Route
 */
export async function exampleOracleRouteHandler(
  userId: string,
  userMessage: string
) {
  // 1. Get developmental context
  const devContext = await getDevelopmentalContext(userId);

  // 2. Build system prompt with metrics
  const systemPrompt = await buildMaiaSystemPromptWithMetrics(userId);

  // 3. Call Claude API (pseudo-code)
  /*
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
    max_tokens: 1024
  });
  */

  // 4. Analyze response for shifts
  /*
  await detectAndRecordShift(userId, {
    emotionalIntensity: 0.8,
    insightMarkers: ['breakthrough', 'realization'],
    beforeState: 'confusion',
    afterState: 'clarity'
  });
  */

  // 5. Update attending quality
  await updateAttendingQualityPostSession(userId);

  // Return response to user
  return {
    message: '(MAIA response with developmental awareness)',
    devContextUsed: true,
    hasMetrics: devContext.attending !== null
  };
}
