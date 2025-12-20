// lib/scribe/sessionSummaryGenerator.ts
// Generates comprehensive post-session summaries with elemental and psychological insights

import Anthropic from '@anthropic-ai/sdk';
import { getConversationHistory, ConversationExchange } from '@/lib/sovereign/sessionManager';
import { getCognitiveProfile } from '@/lib/consciousness/cognitiveProfileService';
import { query, updateOne, findOne, findMany } from '@/lib/db/postgres';

// ============================================================================
// Type Definitions
// ============================================================================

export interface SessionSummaryContext {
  sessionId: string;
  conversationHistory: ConversationExchange[];
  userId?: string;
  duration: number; // minutes
  startTime: Date;
  endTime: Date;
}

export interface ElementalState {
  water: number;
  fire: number;
  earth: number;
  air: number;
}

export interface SessionSummary {
  synopsis: string;
  keyThemes: string[];
  elementalAnalysis: {
    beginningState: ElementalState;
    endingState: ElementalState;
    primaryShift: string;
    recommendations: string[];
  };
  cognitiveProfile: {
    averageLevel: number;
    trajectory: string;
    insights: string[];
  };
  notablePatterns: string[];
  progressMarkers: string[];
  generatedAt: Date;
}

// ============================================================================
// Main Summary Generation Function
// ============================================================================

/**
 * Generate comprehensive session summary using Claude
 *
 * This is the main entry point for post-session summary generation.
 * It gathers all session data, builds a comprehensive prompt, and calls
 * Claude to generate structured insights.
 */
export async function generateSessionSummary(
  context: SessionSummaryContext
): Promise<SessionSummary> {
  console.log(`🔄 Generating session summary for session ${context.sessionId}...`);

  // 1. Gather elemental data
  const elementalData = await getElementalData(context.sessionId);

  // 2. Gather cognitive profile data
  const cognitiveData = context.userId
    ? await getCognitiveProfile(context.userId)
    : null;

  // 3. Build comprehensive prompt for Claude
  const summaryPrompt = buildSessionSummaryPrompt(
    context,
    elementalData,
    cognitiveData
  );

  // 4. Call Claude to generate summary
  const summary = await generateSummaryWithClaude(summaryPrompt);

  console.log(`✅ Session summary generated for ${context.sessionId}`);

  return summary;
}

// ============================================================================
// Prompt Construction
// ============================================================================

/**
 * Build comprehensive prompt for session summary generation
 */
function buildSessionSummaryPrompt(
  context: SessionSummaryContext,
  elementalData: any,
  cognitiveData: any
): string {
  // Format conversation transcript with turn numbers
  const transcript = context.conversationHistory
    .map((exchange, i) => {
      return `[Turn ${i + 1}]
User: ${exchange.userMessage}
MAIA: ${exchange.maiaResponse}`;
    })
    .join('\n\n');

  return `You are generating a post-session summary for a therapist/healer/client to review.

# Session Context

**Date:** ${context.startTime.toISOString()}
**Duration:** ${context.duration} minutes
**Total Exchanges:** ${context.conversationHistory.length}

# Full Session Transcript

${transcript}

# Elemental Analysis (Water/Fire/Earth/Air)

${elementalData ? JSON.stringify(elementalData, null, 2) : 'No elemental data available'}

# Cognitive Profile (Bloom's Taxonomy)

${cognitiveData ? JSON.stringify(cognitiveData, null, 2) : 'No cognitive profile available'}

# Instructions

Generate a comprehensive session summary in valid JSON format matching this structure:

{
  "synopsis": "2-3 paragraph overview of the session - what happened, what was discussed, overall flow",
  "keyThemes": ["Theme 1", "Theme 2", "Theme 3"],
  "elementalAnalysis": {
    "beginningState": { "water": 40, "fire": 30, "earth": 20, "air": 10 },
    "endingState": { "water": 30, "fire": 25, "earth": 35, "air": 10 },
    "primaryShift": "Describe the main energetic shift that occurred",
    "recommendations": [
      "Recommendation 1 for balancing/supporting",
      "Recommendation 2",
      "Recommendation 3"
    ]
  },
  "cognitiveProfile": {
    "averageLevel": 3.5,
    "trajectory": "Rising/Stable/Declining with brief context",
    "insights": [
      "Insight 1 about cognitive development",
      "Insight 2",
      "Insight 3"
    ]
  },
  "notablePatterns": [
    "Pattern 1: Recurring phrase or behavior observed",
    "Pattern 2: Another pattern",
    "Pattern 3"
  ],
  "progressMarkers": [
    "Sign of growth or breakthrough observed",
    "Another positive development",
    "A third progress marker"
  ]
}

## Guidelines:

**Synopsis:**
- Write as if for a therapist/healer reviewing their notes
- Capture the arc of the session (beginning → middle → end)
- Note any significant moments or shifts

**Key Themes:**
- Identify 3-5 main topics/concerns that emerged
- Use the client's own language when possible

**Elemental Analysis:**
- Estimate percentages based on the emotional/energetic quality of the conversation
- Water = emotional, vulnerable, flowing, tearful
- Fire = activated, angry, passionate, energized
- Earth = grounded, practical, embodied, stable
- Air = mental, analytical, detached, scattered
- Note what shifted during the session

**Cognitive Profile:**
- Average Bloom's level (1-6): Knowledge → Evaluation → Creation
- Trajectory: Is the person's thinking becoming more complex over time?
- What cognitive developments are visible?

**Notable Patterns:**
- Recurring words, phrases, or themes
- Behavioral patterns (e.g., "avoids eye contact when discussing X")
- Cognitive patterns (e.g., "catastrophizes about future")

**Progress Markers:**
- Signs of growth, insight, or breakthrough
- New skills demonstrated
- Positive shifts in awareness or behavior

Return ONLY valid JSON. No markdown formatting, no code blocks, just the JSON object.`;
}

// ============================================================================
// Claude API Call
// ============================================================================

/**
 * Call Claude to generate summary from prompt
 */
async function generateSummaryWithClaude(prompt: string): Promise<SessionSummary> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse JSON response
    const summary: SessionSummary = JSON.parse(responseText);
    summary.generatedAt = new Date();

    return summary;
  } catch (error: any) {
    console.error('❌ Error generating summary with Claude:', error);

    // Return fallback summary on error
    return {
      synopsis: 'Summary generation encountered an error. Please try again.',
      keyThemes: [],
      elementalAnalysis: {
        beginningState: { water: 25, fire: 25, earth: 25, air: 25 },
        endingState: { water: 25, fire: 25, earth: 25, air: 25 },
        primaryShift: 'Unable to determine shift',
        recommendations: [],
      },
      cognitiveProfile: {
        averageLevel: 0,
        trajectory: 'Unknown',
        insights: [],
      },
      notablePatterns: [],
      progressMarkers: [],
      generatedAt: new Date(),
    };
  }
}

// ============================================================================
// Data Retrieval Functions
// ============================================================================

/**
 * Get elemental data for session
 */
async function getElementalData(sessionId: string): Promise<any> {
  try {
    // Check if we have elemental tracking data in the session metadata
    const result = await query(
      'SELECT metadata FROM maia_sessions WHERE id = $1',
      [sessionId]
    );

    const session = result.rows[0];

    if (session?.metadata?.elementalTracking) {
      return session.metadata.elementalTracking;
    }

    // Fallback: Return null if no elemental data
    return null;
  } catch (error) {
    console.warn('⚠️  Could not retrieve elemental data:', error);
    return null;
  }
}

/**
 * Get cognitive profile for user
 */
async function getCognitiveProfileData(userId: string): Promise<any> {
  try {
    return await getCognitiveProfile(userId);
  } catch (error) {
    console.warn('⚠️  Could not retrieve cognitive profile:', error);
    return null;
  }
}

// ============================================================================
// Storage Functions
// ============================================================================

/**
 * Store summary in database and mark session as completed
 */
export async function storeSessionSummary(
  sessionId: string,
  summary: SessionSummary
): Promise<void> {
  try {
    await query(
      `UPDATE maia_sessions
       SET status = $1, completed_at = $2, session_summary = $3
       WHERE id = $4`,
      ['completed', new Date().toISOString(), JSON.stringify(summary), sessionId]
    );

    console.log(`✅ Session summary stored for ${sessionId}`);
  } catch (error) {
    console.error('❌ Failed to store session summary:', error);
    throw error;
  }
}

/**
 * Retrieve stored session summary
 */
export async function getSessionSummary(
  sessionId: string
): Promise<SessionSummary | null> {
  try {
    const result = await query(
      'SELECT session_summary FROM maia_sessions WHERE id = $1',
      [sessionId]
    );

    const session = result.rows[0];

    if (!session?.session_summary) {
      return null;
    }

    return session.session_summary as SessionSummary;
  } catch (error) {
    console.error('❌ Error retrieving session summary:', error);
    return null;
  }
}

/**
 * Get all completed sessions for a user
 */
export async function getCompletedSessions(
  userId: string,
  limit: number = 20
): Promise<any[]> {
  try {
    const result = await query(
      `SELECT * FROM maia_sessions
       WHERE user_id = $1 AND status = 'completed'
       ORDER BY completed_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows || [];
  } catch (error) {
    console.error('❌ Error retrieving completed sessions:', error);
    return [];
  }
}
