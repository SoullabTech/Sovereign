// lib/scribe/sessionReviewMode.ts
// Enables conversational interrogation of completed sessions
// Users can ask MAIA questions about past sessions and receive insights

import { getConversationHistory, ConversationExchange } from '@/lib/sovereign/sessionManager';
import { generateSessionSummary, getSessionSummary, SessionSummary } from './sessionSummaryGenerator';
import { query } from '@/lib/db/postgres';

// ============================================================================
// Type Definitions
// ============================================================================

export interface SessionReviewContext {
  reviewedSessionId: string; // The session being reviewed
  currentSessionId: string;  // The current review conversation session
  questionNumber: number;    // How many questions asked so far
}

export interface CompletedSessionData {
  sessionId: string;
  userId?: string;
  conversationHistory: ConversationExchange[];
  summary?: SessionSummary;
  elementalData?: any;
  cognitiveData?: any;
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
  metadata?: any;
}

// ============================================================================
// Session Review Prompt Construction
// ============================================================================

/**
 * Build MAIA prompt for session review mode
 *
 * This gives MAIA full access to the completed session and instructions
 * for answering questions about it.
 *
 * IMPORTANT: This is used for AFTER-session review. During an active session,
 * users can already ask MAIA questions and MAIA has access to conversation history.
 */
export async function buildSessionReviewPrompt(
  context: SessionReviewContext,
  userQuestion: string
): Promise<string> {
  // 1. Load the completed session data
  const sessionData = await getCompletedSessionData(context.reviewedSessionId);

  // 2. Load or generate the session summary
  let summary = sessionData.summary;
  if (!summary) {
    console.log(`🔄 No summary found for ${context.reviewedSessionId}, generating...`);
    summary = await generateSessionSummary({
      sessionId: context.reviewedSessionId,
      conversationHistory: sessionData.conversationHistory,
      userId: sessionData.userId,
      duration: sessionData.duration,
      startTime: sessionData.startTime,
      endTime: sessionData.endTime,
    });
  }

  // 3. Build comprehensive prompt
  return `You are MAIA in Session Review mode.

# Your Role

You are helping someone reflect on and analyze a completed session. They can ask you:
- Questions about what happened in the session
- To generate structured documentation (SOAP notes, progress notes, etc.)
- About patterns, themes, and insights
- For comparisons across sessions (if they provide context)
- About elemental/energetic shifts
- About cognitive development observations
- To interpret specific moments (like tarot readings mentioned in the session)

# The Session Being Reviewed

**Session ID:** ${context.reviewedSessionId}
**Date:** ${sessionData.startTime.toISOString()}
**Duration:** ${sessionData.duration} minutes

## Auto-Generated Summary

${JSON.stringify(summary, null, 2)}

## Full Session Transcript

${formatTranscript(sessionData.conversationHistory)}

## Elemental Data

${sessionData.elementalData ? JSON.stringify(sessionData.elementalData, null, 2) : 'No elemental data available'}

## Cognitive Profile

${sessionData.cognitiveData ? JSON.stringify(sessionData.cognitiveData, null, 2) : 'No cognitive profile available'}

# Current Question (Question ${context.questionNumber})

${userQuestion}

# Instructions

- Answer the question with reference to specific moments in the session
- Use evidence from the transcript (cite turn numbers when helpful)
- Provide insights based on elemental analysis, cognitive profile, and patterns
- If asked for structured output (SOAP, DAP, etc.), format it professionally
- If comparing across sessions, note developmental trajectory
- If asked to interpret something mentioned in the session (like a tarot reading), provide deep insight based on:
  - The client's state and concerns in that session
  - The elemental/energetic context
  - The overall session themes
- Be specific, grounded, and clinically/therapeutically useful
- Use the client's own language and metaphors when possible

Your response:`;
}

// ============================================================================
// Data Loading Functions
// ============================================================================

/**
 * Load completed session data with all metadata
 */
export async function getCompletedSessionData(
  sessionId: string
): Promise<CompletedSessionData> {
  const result = await query(
    `SELECT * FROM maia_sessions WHERE id = $1 AND status = 'completed'`,
    [sessionId]
  );

  const session = result.rows[0];

  if (!session) {
    throw new Error(`Session ${sessionId} not found or not completed`);
  }

  // Load conversation history
  const conversationHistory = await getConversationHistory(sessionId);

  // Calculate duration
  const startTime = new Date(session.created_at);
  const endTime = new Date(session.completed_at);
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

  return {
    sessionId: session.id,
    userId: session.user_id,
    conversationHistory,
    summary: session.session_summary,
    elementalData: session.elemental_final_state,
    cognitiveData: session.cognitive_final_profile,
    startTime,
    endTime,
    duration,
    metadata: session.metadata,
  };
}

/**
 * Get summary for session (loads from DB or generates if needed)
 */
export async function getOrGenerateSessionSummary(
  sessionId: string
): Promise<SessionSummary> {
  // Try to load existing summary
  const existingSummary = await getSessionSummary(sessionId);
  if (existingSummary) {
    return existingSummary;
  }

  // Generate new summary
  console.log(`🔄 Generating summary for session ${sessionId}...`);
  const sessionData = await getCompletedSessionData(sessionId);

  const summary = await generateSessionSummary({
    sessionId,
    conversationHistory: sessionData.conversationHistory,
    userId: sessionData.userId,
    duration: sessionData.duration,
    startTime: sessionData.startTime,
    endTime: sessionData.endTime,
  });

  return summary;
}

// ============================================================================
// Formatting Functions
// ============================================================================

/**
 * Format conversation history for prompt
 */
function formatTranscript(history: ConversationExchange[]): string {
  return history
    .map((exchange, i) => {
      return `[Turn ${i + 1}]
User: ${exchange.userMessage}
MAIA: ${exchange.maiaResponse}
`;
    })
    .join('\n');
}

/**
 * Format session data for display
 */
export function formatSessionForDisplay(
  sessionData: CompletedSessionData
): string {
  return `Session: ${sessionData.sessionId}
Date: ${sessionData.startTime.toLocaleDateString()}
Duration: ${sessionData.duration} minutes
Exchanges: ${sessionData.conversationHistory.length}
`;
}

// ============================================================================
// Multi-Session Comparison (Future Enhancement)
// ============================================================================

/**
 * Compare multiple sessions for pattern analysis
 * (Placeholder for future implementation)
 */
export async function compareSessionsPrompt(
  sessionIds: string[],
  question: string
): Promise<string> {
  const sessions = await Promise.all(
    sessionIds.map(id => getCompletedSessionData(id))
  );

  const transcripts = sessions
    .map((session, i) => {
      return `# Session ${i + 1} (${session.startTime.toISOString()})

Duration: ${session.duration} minutes

## Transcript

${formatTranscript(session.conversationHistory)}

## Summary

${JSON.stringify(session.summary, null, 2)}
`;
    })
    .join('\n\n---\n\n');

  return `You are MAIA analyzing multiple sessions for pattern recognition.

# Sessions Being Compared

${transcripts}

# User's Question

${question}

# Instructions

- Identify patterns across the sessions
- Note developmental trajectory (are themes evolving? regressing? stable?)
- Compare elemental shifts across sessions
- Identify recurring concerns or breakthroughs
- Provide insights about the person's journey over time

Your response:`;
}

// ============================================================================
// Export Main Functions
// ============================================================================

export default {
  buildSessionReviewPrompt,
  getCompletedSessionData,
  getOrGenerateSessionSummary,
  formatSessionForDisplay,
  compareSessionsPrompt,
};
