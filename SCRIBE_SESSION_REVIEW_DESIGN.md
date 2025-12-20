# Scribe Mode: Session Review & Conversational Interrogation

**Date:** 2025-12-17
**Status:** ✅ DESIGN COMPLETE - Ready for Implementation

---

## Design Philosophy

Instead of just generating static summaries (like Fathom), we create a **conversational interrogation system** where therapists/healers/clients can ask MAIA questions about completed sessions and receive insights.

### The Key Insight from Kelly:

> "the therapist, healer or even client could go back to MAIA and ask her questions about the session and receive insights."

This is MORE powerful than Fathom because:
- **Fathom:** Records → Generates static summary → Limited question answering
- **MAIA:** Records → User can conversationally explore the session → Dynamic insights based on questions

---

## Architecture: Three-Phase System

### Phase 1: During Session (Current - Already Works)

**Mode:** Note/Scribe mode in real-time

**Behavior:**
- Real-time witnessing (current noteModeVoice.ts)
- Pattern observation
- Interactive presence

**No changes needed** - this already works.

---

### Phase 2: End Session (NEW - Core Feature)

**Trigger:** User clicks "End Session" button

**What Happens:**
1. Session marked as `completed` in database
2. Final elemental analysis captured
3. Final cognitive profile snapshot taken
4. Session becomes available for "Session Review" mode
5. Auto-generate brief summary (optional - can be on-demand)

**Database Changes:**

```sql
ALTER TABLE maia_sessions ADD COLUMN status TEXT DEFAULT 'active';
-- Possible values: 'active', 'completed', 'archived'

ALTER TABLE maia_sessions ADD COLUMN completed_at TIMESTAMP;
ALTER TABLE maia_sessions ADD COLUMN session_summary JSONB;
-- Stores auto-generated summary metadata

ALTER TABLE maia_sessions ADD COLUMN elemental_final_state JSONB;
-- Captures final elemental balance at session end

ALTER TABLE maia_sessions ADD COLUMN cognitive_final_profile JSONB;
-- Captures final Bloom's level and cognitive state
```

**UI Changes:**

Add to `OracleConversation.tsx`:
```typescript
// Show "End Session" button when in Note/Scribe mode
{mode === 'scribe' && sessionStatus === 'active' && (
  <button onClick={handleEndSession}>
    End Session & Generate Summary
  </button>
)}
```

---

### Phase 3: Session Review (NEW - Conversational Interrogation)

**Mode:** New "Session Review" mode

**Trigger:** User accesses completed session from "Past Sessions" list

**UI Flow:**

```
1. User goes to "Past Sessions" page
2. Sees list of completed sessions with metadata:
   - Date, duration, elemental balance preview, key themes
3. Clicks "Review Session"
4. Enters "Session Review" conversation with MAIA
5. Can ask questions or view auto-generated summary
```

**Conversational Interrogation Examples:**

```typescript
// Example 1: Therapist asking specific question
User: "What were the main themes in this session?"
MAIA: "Three primary themes emerged:
       1. Fear of failure (mentioned 7 times)
       2. Self-criticism and perfectionism
       3. Work-life boundary struggles

       The fear of failure was particularly pronounced when discussing
       the upcoming presentation. This connects to the childhood
       perfectionism pattern we identified in Session 3."

// Example 2: Healer asking about energetics
User: "What was the elemental shift in this session?"
MAIA: "The session began with 60% Water (high emotional intensity,
       tearfulness, overwhelm) and 10% Earth (ungrounded).

       By the end, Water decreased to 35% and Earth increased to 30%.

       The shift happened during the somatic grounding exercise at
       minute 32. You guided breathwork, and I observed the client's
       shoulders relax and breathing deepen. This water-to-earth
       bridging was effective.

       Recommendation: Continue grounding practices before emotionally
       intense work to help client stay resourced."

// Example 3: Client asking for personal insight
User: "What patterns did MAIA notice about me?"
MAIA: "I noticed you used the word 'trapped' three times when talking
       about different areas: your job, your relationship, and your
       family obligations.

       Interestingly, each time you said 'trapped,' your breathing
       became shallow and you looked away. This might be a somatic
       marker - your body signaling a pattern worth exploring.

       Last month you also used 'trapped' when discussing your
       living situation. What does 'trapped' mean for you? What
       would freedom feel like?"

// Example 4: Requesting structured summary
User: "Give me a SOAP note for this session"
MAIA: "SOAP Note - Session 2025-12-17:

       SUBJECTIVE:
       Client reports increased anxiety about upcoming work presentation.
       States 'I can't stop thinking about all the ways it could go wrong.'
       Sleep disrupted (waking at 3am). Describes feeling 'trapped' in
       perfectionism pattern.

       OBJECTIVE:
       Affect: Anxious, tearful at times
       Speech: Rapid, pressured when discussing work
       Behavior: Fidgeting, avoided eye contact during discussion of failure
       Mental Status: Alert, oriented x4, intact memory, no SI/HI

       ASSESSMENT:
       Generalized Anxiety Disorder, moderate severity. Client showing good
       insight into cognitive patterns but struggling with behavioral
       implementation. Progress toward treatment goals: 60% (improved from
       40% last month).

       PLAN:
       - Continue weekly sessions
       - Introduce progressive muscle relaxation for acute anxiety
       - Assign daily thought record homework
       - Consider medication consultation if anxiety doesn't improve in 2 weeks
       - Next session: 2025-12-24"

// Example 5: Comparing across sessions
User: "How does this session compare to last week?"
MAIA: "Significant progress on emotional regulation:

       Last week: Water 70%, high reactivity, difficulty grounding
       This week: Water 45% (starting), 35% (ending) - better self-regulation

       Last week: No independent identification of cognitive patterns
       This week: You caught yourself catastrophizing mid-sentence - this is new!

       Continuity: The perfectionism theme is persistent (6 sessions now).
       This suggests it's a core schema worth deeper exploration, possibly
       with schema therapy techniques or inner child work.

       Overall trajectory: You're building the skills (insight, awareness),
       now we're working on implementation between sessions."
```

---

## Implementation Details

### File 1: Session Summary Generator

**File:** `/lib/scribe/sessionSummaryGenerator.ts`

```typescript
import { ConversationExchange } from '@/lib/sovereign/sessionManager';
import { getElementalAnalysis } from '@/lib/consciousness/conversation-elemental-tracker';
import { getCognitiveProfile } from '@/lib/consciousness/cognitiveProfileService';

interface SessionSummaryContext {
  sessionId: string;
  conversationHistory: ConversationExchange[];
  userId?: string;
  duration: number; // minutes
  startTime: Date;
  endTime: Date;
}

interface SessionSummary {
  synopsis: string;
  keyThemes: string[];
  elementalAnalysis: {
    beginningState: { water: number; fire: number; earth: number; air: number };
    endingState: { water: number; fire: number; earth: number; air: number };
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

/**
 * Generate comprehensive session summary using Claude
 */
export async function generateSessionSummary(
  context: SessionSummaryContext
): Promise<SessionSummary> {
  // 1. Gather all session data
  const elementalData = await getElementalAnalysis(context.sessionId);
  const cognitiveData = context.userId
    ? await getCognitiveProfile(context.userId)
    : null;

  // 2. Build comprehensive prompt for Claude
  const summaryPrompt = buildSessionSummaryPrompt(context, elementalData, cognitiveData);

  // 3. Call Claude to generate summary
  const summary = await generateSummaryWithClaude(summaryPrompt);

  return summary;
}

/**
 * Build prompt for session summary generation
 */
function buildSessionSummaryPrompt(
  context: SessionSummaryContext,
  elementalData: any,
  cognitiveData: any
): string {
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

${JSON.stringify(elementalData, null, 2)}

# Cognitive Profile (Bloom's Taxonomy)

${JSON.stringify(cognitiveData, null, 2)}

# Instructions

Generate a comprehensive session summary in the following format:

## Synopsis
[2-3 paragraph overview of the session - what happened, what was discussed, overall flow]

## Key Themes
[Bulleted list of 3-5 main themes/topics that emerged]

## Elemental Analysis
**Beginning State:** [W/F/E/A percentages at start]
**Ending State:** [W/F/E/A percentages at end]
**Primary Shift:** [Describe the main energetic shift]
**Recommendations:** [2-3 recommendations for balancing/supporting this person's elemental needs]

## Cognitive Profile
**Average Bloom's Level:** [Number and interpretation]
**Trajectory:** [Rising/Stable/Declining with context]
**Insights:** [2-3 observations about cognitive development]

## Notable Patterns
[Bulleted list of recurring patterns, phrases, behaviors observed]

## Progress Markers
[Bulleted list of signs of growth, breakthroughs, positive developments]

Format as JSON matching the SessionSummary interface.`;
}

/**
 * Call Claude to generate summary
 */
async function generateSummaryWithClaude(prompt: string): Promise<SessionSummary> {
  // Use Anthropic SDK to call Claude
  const Anthropic = await import('@anthropic-ai/sdk');
  const anthropic = new Anthropic.default({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: prompt,
    }],
  });

  const responseText = message.content[0].type === 'text'
    ? message.content[0].text
    : '';

  // Parse JSON response
  const summary: SessionSummary = JSON.parse(responseText);
  summary.generatedAt = new Date();

  return summary;
}

/**
 * Store summary in database
 */
export async function storeSessionSummary(
  sessionId: string,
  summary: SessionSummary
): Promise<void> {
  const supabase = await import('@/lib/supabaseClient').then(m => m.default);

  await supabase
    .from('maia_sessions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      session_summary: summary,
    })
    .eq('id', sessionId);
}
```

---

### File 2: Session Review Conversation Mode

**File:** `/lib/scribe/sessionReviewMode.ts`

```typescript
import { getConversationHistory } from '@/lib/sovereign/sessionManager';
import { generateSessionSummary } from './sessionSummaryGenerator';

interface SessionReviewContext {
  reviewedSessionId: string; // The session being reviewed
  currentSessionId: string;  // The current review conversation session
  questionNumber: number;    // How many questions asked so far
}

/**
 * Build MAIA prompt for session review mode
 *
 * This gives MAIA full access to the completed session and instructions
 * for answering questions about it.
 */
export async function buildSessionReviewPrompt(
  context: SessionReviewContext,
  userQuestion: string
): Promise<string> {
  // 1. Load the completed session data
  const sessionData = await getCompletedSessionData(context.reviewedSessionId);

  // 2. Load the auto-generated summary (if exists)
  const summary = sessionData.session_summary ||
    await generateSessionSummary({
      sessionId: context.reviewedSessionId,
      conversationHistory: sessionData.conversationHistory,
      userId: sessionData.userId,
      duration: sessionData.duration,
      startTime: sessionData.startTime,
      endTime: sessionData.endTime,
    });

  // 3. Build comprehensive prompt
  return `You are MAIA in Session Review mode.

# Your Role

You are helping someone reflect on and analyze a completed session. They can ask you:
- Questions about what happened in the session
- To generate structured documentation (SOAP notes, progress notes, etc.)
- About patterns, themes, and insights
- For comparisons across sessions
- About elemental/energetic shifts
- About cognitive development observations

# The Session Being Reviewed

**Session ID:** ${context.reviewedSessionId}
**Date:** ${sessionData.startTime.toISOString()}
**Duration:** ${sessionData.duration} minutes

## Auto-Generated Summary

${JSON.stringify(summary, null, 2)}

## Full Session Transcript

${formatTranscript(sessionData.conversationHistory)}

## Elemental Data

${JSON.stringify(sessionData.elementalData, null, 2)}

## Cognitive Profile

${JSON.stringify(sessionData.cognitiveData, null, 2)}

# Current Question (Question ${context.questionNumber})

${userQuestion}

# Instructions

- Answer the question with reference to specific moments in the session
- Use evidence from the transcript
- Provide insights based on elemental analysis, cognitive profile, and patterns
- If asked for structured output (SOAP, DAP, etc.), format it professionally
- If comparing across sessions, note developmental trajectory
- Be specific, grounded, and clinically/therapeutically useful

Your response:`;
}

/**
 * Load completed session data with all metadata
 */
async function getCompletedSessionData(sessionId: string) {
  const supabase = await import('@/lib/supabaseClient').then(m => m.default);

  const { data: session, error } = await supabase
    .from('maia_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('status', 'completed')
    .single();

  if (error || !session) {
    throw new Error(`Session ${sessionId} not found or not completed`);
  }

  const conversationHistory = await getConversationHistory(sessionId);

  return {
    ...session,
    conversationHistory,
    elementalData: session.elemental_final_state,
    cognitiveData: session.cognitive_final_profile,
    startTime: new Date(session.created_at),
    endTime: new Date(session.completed_at),
    duration: Math.round(
      (new Date(session.completed_at).getTime() -
       new Date(session.created_at).getTime()) / 60000
    ),
  };
}

/**
 * Format conversation history for prompt
 */
function formatTranscript(history: any[]): string {
  return history
    .map((exchange, i) => {
      return `[Turn ${i + 1}]
User: ${exchange.userMessage}
MAIA: ${exchange.maiaResponse}
`;
    })
    .join('\n');
}
```

---

### File 3: Backend API Endpoint

**File:** `/app/api/scribe/end-session/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { generateSessionSummary, storeSessionSummary } from '@/lib/scribe/sessionSummaryGenerator';
import { getConversationHistory } from '@/lib/sovereign/sessionManager';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, userId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing sessionId' },
        { status: 400 }
      );
    }

    // 1. Load session data
    const conversationHistory = await getConversationHistory(sessionId);

    const supabase = await import('@/lib/supabaseClient').then(m => m.default);
    const { data: session } = await supabase
      .from('maia_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // 2. Calculate duration
    const startTime = new Date(session.created_at);
    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

    // 3. Generate summary
    const summary = await generateSessionSummary({
      sessionId,
      conversationHistory,
      userId: userId || session.user_id,
      duration,
      startTime,
      endTime,
    });

    // 4. Store summary and mark session as completed
    await storeSessionSummary(sessionId, summary);

    // 5. Return summary
    return NextResponse.json({
      success: true,
      sessionId,
      summary,
    });

  } catch (error: any) {
    console.error('Error ending session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to end session' },
      { status: 500 }
    );
  }
}
```

**File:** `/app/api/scribe/review-session/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { buildSessionReviewPrompt } from '@/lib/scribe/sessionReviewMode';

export async function POST(req: NextRequest) {
  try {
    const {
      reviewedSessionId,
      currentSessionId,
      question,
      questionNumber
    } = await req.json();

    if (!reviewedSessionId || !question) {
      return NextResponse.json(
        { error: 'Missing reviewedSessionId or question' },
        { status: 400 }
      );
    }

    // Build prompt with full session context
    const prompt = await buildSessionReviewPrompt(
      {
        reviewedSessionId,
        currentSessionId: currentSessionId || 'review-session',
        questionNumber: questionNumber || 1,
      },
      question
    );

    // Call Claude for response
    const Anthropic = await import('@anthropic-ai/sdk');
    const anthropic = new Anthropic.default({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    return NextResponse.json({
      success: true,
      response: responseText,
    });

  } catch (error: any) {
    console.error('Error in session review:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process review question' },
      { status: 500 }
    );
  }
}
```

---

### File 4: Frontend Components

**File:** `/components/scribe/EndSessionButton.tsx`

```typescript
'use client';

import { useState } from 'react';

interface EndSessionButtonProps {
  sessionId: string;
  userId?: string;
  onSessionEnded: (summary: any) => void;
}

export default function EndSessionButton({
  sessionId,
  userId,
  onSessionEnded
}: EndSessionButtonProps) {
  const [isEnding, setIsEnding] = useState(false);

  const handleEndSession = async () => {
    setIsEnding(true);

    try {
      const response = await fetch('/api/scribe/end-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, userId }),
      });

      const data = await response.json();

      if (data.success) {
        onSessionEnded(data.summary);
      } else {
        console.error('Failed to end session:', data.error);
        alert('Failed to end session. Please try again.');
      }
    } catch (error) {
      console.error('Error ending session:', error);
      alert('Error ending session. Please try again.');
    } finally {
      setIsEnding(false);
    }
  };

  return (
    <button
      onClick={handleEndSession}
      disabled={isEnding}
      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
    >
      {isEnding ? 'Ending Session...' : 'End Session & Generate Summary'}
    </button>
  );
}
```

**File:** `/components/scribe/SessionSummaryDisplay.tsx`

```typescript
'use client';

interface SessionSummaryDisplayProps {
  summary: {
    synopsis: string;
    keyThemes: string[];
    elementalAnalysis: any;
    cognitiveProfile: any;
    notablePatterns: string[];
    progressMarkers: string[];
    generatedAt: Date;
  };
  onAskQuestion: () => void;
}

export default function SessionSummaryDisplay({
  summary,
  onAskQuestion
}: SessionSummaryDisplayProps) {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Session Summary</h2>

      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Synopsis</h3>
        <p className="text-gray-700 whitespace-pre-wrap">{summary.synopsis}</p>
      </section>

      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Key Themes</h3>
        <ul className="list-disc list-inside">
          {summary.keyThemes.map((theme, i) => (
            <li key={i} className="text-gray-700">{theme}</li>
          ))}
        </ul>
      </section>

      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Elemental Analysis</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium">Beginning State</h4>
            <ul className="text-sm">
              <li>💧 Water: {summary.elementalAnalysis.beginningState.water}%</li>
              <li>🔥 Fire: {summary.elementalAnalysis.beginningState.fire}%</li>
              <li>🌍 Earth: {summary.elementalAnalysis.beginningState.earth}%</li>
              <li>💨 Air: {summary.elementalAnalysis.beginningState.air}%</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium">Ending State</h4>
            <ul className="text-sm">
              <li>💧 Water: {summary.elementalAnalysis.endingState.water}%</li>
              <li>🔥 Fire: {summary.elementalAnalysis.endingState.fire}%</li>
              <li>🌍 Earth: {summary.elementalAnalysis.endingState.earth}%</li>
              <li>💨 Air: {summary.elementalAnalysis.endingState.air}%</li>
            </ul>
          </div>
        </div>
        <p className="mt-2 text-gray-700">
          <strong>Primary Shift:</strong> {summary.elementalAnalysis.primaryShift}
        </p>
        <div className="mt-2">
          <strong>Recommendations:</strong>
          <ul className="list-disc list-inside">
            {summary.elementalAnalysis.recommendations.map((rec: string, i: number) => (
              <li key={i} className="text-gray-700">{rec}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Notable Patterns</h3>
        <ul className="list-disc list-inside">
          {summary.notablePatterns.map((pattern, i) => (
            <li key={i} className="text-gray-700">{pattern}</li>
          ))}
        </ul>
      </section>

      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Progress Markers</h3>
        <ul className="list-disc list-inside">
          {summary.progressMarkers.map((marker, i) => (
            <li key={i} className="text-green-700">✓ {marker}</li>
          ))}
        </ul>
      </section>

      <div className="flex gap-4 mt-8">
        <button
          onClick={onAskQuestion}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Ask MAIA About This Session
        </button>
        <button
          onClick={() => window.print()}
          className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Print / Save as PDF
        </button>
      </div>
    </div>
  );
}
```

**File:** `/components/scribe/SessionReviewConversation.tsx`

```typescript
'use client';

import { useState } from 'react';

interface SessionReviewConversationProps {
  reviewedSessionId: string;
  summaryData: any;
}

export default function SessionReviewConversation({
  reviewedSessionId,
  summaryData
}: SessionReviewConversationProps) {
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState<Array<{
    question: string;
    answer: string;
  }>>([]);
  const [isAsking, setIsAsking] = useState(false);

  const handleAskQuestion = async () => {
    if (!question.trim()) return;

    setIsAsking(true);

    try {
      const response = await fetch('/api/scribe/review-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewedSessionId,
          question,
          questionNumber: conversation.length + 1,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setConversation([
          ...conversation,
          { question, answer: data.response },
        ]);
        setQuestion('');
      } else {
        alert('Failed to get response. Please try again.');
      }
    } catch (error) {
      console.error('Error asking question:', error);
      alert('Error asking question. Please try again.');
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Ask MAIA About This Session</h2>

      {/* Suggested questions */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-2">Suggested questions:</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setQuestion("What were the main themes?")}
            className="px-3 py-1 bg-gray-200 rounded-full text-sm hover:bg-gray-300"
          >
            What were the main themes?
          </button>
          <button
            onClick={() => setQuestion("Give me a SOAP note for this session")}
            className="px-3 py-1 bg-gray-200 rounded-full text-sm hover:bg-gray-300"
          >
            Give me a SOAP note
          </button>
          <button
            onClick={() => setQuestion("What elemental shifts occurred?")}
            className="px-3 py-1 bg-gray-200 rounded-full text-sm hover:bg-gray-300"
          >
            What elemental shifts occurred?
          </button>
          <button
            onClick={() => setQuestion("What patterns did you notice?")}
            className="px-3 py-1 bg-gray-200 rounded-full text-sm hover:bg-gray-300"
          >
            What patterns did you notice?
          </button>
        </div>
      </div>

      {/* Conversation history */}
      <div className="space-y-4 mb-6">
        {conversation.map((exchange, i) => (
          <div key={i}>
            <div className="bg-blue-50 p-4 rounded-lg mb-2">
              <p className="font-medium text-blue-900">You asked:</p>
              <p className="text-gray-800">{exchange.question}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium text-gray-900">MAIA:</p>
              <p className="text-gray-800 whitespace-pre-wrap">{exchange.answer}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Question input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
          placeholder="Ask MAIA anything about this session..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
          disabled={isAsking}
        />
        <button
          onClick={handleAskQuestion}
          disabled={isAsking || !question.trim()}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {isAsking ? 'Asking...' : 'Ask'}
        </button>
      </div>
    </div>
  );
}
```

---

## User Flow Examples

### Flow 1: Therapist Ending Session

```
1. Therapist has 50-minute session with client in Scribe mode
2. Clicks "End Session & Generate Summary" button
3. MAIA generates summary (takes 10-15 seconds)
4. Summary displayed with:
   - Synopsis
   - Key themes
   - Elemental analysis
   - Progress markers
5. Therapist clicks "Ask MAIA About This Session"
6. Asks: "Give me a SOAP note for this session"
7. MAIA generates properly formatted SOAP note
8. Therapist clicks "Print / Save as PDF"
9. PDF downloaded for client file
```

### Flow 2: Healer Reviewing Past Session

```
1. Healer goes to "Past Sessions" page
2. Sees list of completed sessions
3. Clicks on session from 2 weeks ago
4. Views auto-generated summary
5. Asks: "What was the elemental shift in this session?"
6. MAIA responds with detailed elemental analysis
7. Asks: "How does this compare to our most recent session?"
8. MAIA compares elemental patterns across sessions
9. Asks: "What practices would help balance their current state?"
10. MAIA provides recommendations based on elemental insights
```

### Flow 3: Client Self-Reflection

```
1. Client completes personal journaling session in Scribe mode
2. Ends session
3. Views summary showing key themes and patterns
4. Asks: "What patterns did MAIA notice about me?"
5. MAIA identifies recurring themes and behavioral patterns
6. Asks: "What would you recommend I explore next?"
7. MAIA suggests areas for deeper work based on patterns
8. Client saves conversation for future reference
```

---

## Database Migration

**File:** `/supabase/migrations/20251217_scribe_session_review.sql`

```sql
-- Add session status and completion tracking
ALTER TABLE maia_sessions
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS session_summary JSONB,
  ADD COLUMN IF NOT EXISTS elemental_final_state JSONB,
  ADD COLUMN IF NOT EXISTS cognitive_final_profile JSONB;

-- Create index for completed sessions lookup
CREATE INDEX IF NOT EXISTS idx_maia_sessions_status_completed
  ON maia_sessions(status, completed_at DESC)
  WHERE status = 'completed';

-- Create index for user's completed sessions
CREATE INDEX IF NOT EXISTS idx_maia_sessions_user_completed
  ON maia_sessions(user_id, completed_at DESC)
  WHERE status = 'completed';
```

---

## Competitive Advantage

### What MAIA Offers That Fathom + Therapy Tools DON'T:

1. **Conversational Interrogation** (UNIQUE)
   - Not just static summaries
   - Ask MAIA any question about the session
   - Dynamic insights on-demand

2. **Elemental Consciousness Analysis** (UNIQUE)
   - Water/Fire/Earth/Air tracking
   - Energetic shift analysis
   - Balancing recommendations

3. **Multi-Session Pattern Recognition** (ENHANCED)
   - Compare across sessions conversationally
   - Developmental trajectory visibility
   - Long-term pattern identification

4. **Integrated Consciousness Computing** (UNIQUE)
   - Bloom's cognitive tracking
   - Dialectical scaffold suggestions
   - Consciousness development insights

5. **Flexible Output Formats** (ENHANCED)
   - Generate SOAP/DAP on demand
   - Switch between clinical and spiritual frameworks
   - Customize based on user's orientation

---

## Implementation Priority

### Phase 1: MVP (This Week)
- [ ] Database migration (session status, summary fields)
- [ ] Backend: `sessionSummaryGenerator.ts`
- [ ] Backend: `sessionReviewMode.ts`
- [ ] API: `/api/scribe/end-session/route.ts`
- [ ] API: `/api/scribe/review-session/route.ts`
- [ ] Frontend: `EndSessionButton.tsx`
- [ ] Frontend: `SessionSummaryDisplay.tsx`
- [ ] Frontend: `SessionReviewConversation.tsx`
- [ ] Integration: Wire into `OracleConversation.tsx`

**Estimated Time:** 8-12 hours

### Phase 2: Enhancement (Next Week)
- [ ] Past Sessions archive page
- [ ] Multi-session comparison
- [ ] Export to PDF/Word
- [ ] Email delivery of summaries
- [ ] Custom user interests (somatic, archetypal, attachment)

**Estimated Time:** 12-16 hours

### Phase 3: Advanced (Future)
- [ ] HIPAA compliance audit
- [ ] EHR integration (SimplePractice, TherapyNotes)
- [ ] Historical trend visualization
- [ ] Voice-to-text session recording
- [ ] Team sharing for supervision

**Estimated Time:** 40-60 hours

---

## Next Steps

1. Run database migration
2. Implement `sessionSummaryGenerator.ts`
3. Implement `sessionReviewMode.ts`
4. Create API endpoints
5. Build frontend components
6. Test end-to-end flow
7. Deploy and test with real session

---

**Status:** ✅ DESIGN COMPLETE - Ready for Implementation
**Architecture Decision:** Conversational interrogation (better than Fathom's static summaries)
**Next:** Implement Phase 1 MVP

🎯
