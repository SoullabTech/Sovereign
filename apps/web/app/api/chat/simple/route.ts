/**
 * Simplified Chat API - MVP Version
 * Focus: Clear value, safety first, measurable outcomes
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import { z } from 'zod';
import { SafetyMonitor } from '@/lib/safety/SafetyMonitor';
import { SimpleInsightGenerator } from '@/lib/insights/SimpleInsightGenerator';
// import { BasicMetricsTracker } from '@/lib/metrics/BasicMetricsTracker'; // Stubbed
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const safetyMonitor = new SafetyMonitor();
// Stub BasicMetricsTracker
const metricsTracker = {
  track: async (data: any) => {
    // Stub implementation - just log for now
    console.log('Metrics tracked:', data);
  }
};

// Simple request schema - no mystical elements
const ChatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  userId: z.string(),
  sessionId: z.string(),
  previousMood: z.number().min(1).max(10).optional(),
});

// Simple conversation context
interface SimpleContext {
  recentTopics: string[];
  currentMood: number;
  sessionCount: number;
  lastInsight: string | null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, userId, sessionId, previousMood } = ChatRequestSchema.parse(body);

    // 1. Safety check first - non-negotiable
    const safetyCheck = await safetyMonitor.checkMessage(message);
    if (!safetyCheck.safe) {
      return NextResponse.json({
        response: safetyCheck.response,
        action: safetyCheck.action,
        resources: safetyCheck.resources,
      });
    }

    // 2. Get simple context (no complex archetypal analysis)
    const context = await getSimpleContext(userId);

    // 3. Generate response with clear boundaries
    const response = await generateSimpleResponse(message, context);

    // 4. Extract simple insights
    const insightData = {
      conversation_id: 'simple-chat',
      user_message: message,
      oracle_response: response.content
    };
    const insights = SimpleInsightGenerator.generateInsights([insightData]);
    const firstInsight = insights[0] || {};

    // 5. Track basic metrics
    await metricsTracker.track({
      userId,
      sessionId,
      mood: (firstInsight as any).detectedMood || 5,
      topics: (firstInsight as any).topics || [],
      engagement: (firstInsight as any).engagementLevel || 'medium',
    });

    // 6. Return clear, actionable response
    return NextResponse.json({
      response: response.content,
      mood: (firstInsight as any).detectedMood || 5,
      insight: (firstInsight as any).primaryInsight || '',
      suggestion: (firstInsight as any).actionableSuggestion || '',
      progress: {
        sessionsCompleted: context.sessionCount + 1,
        patternsIdentified: (insights as any).patterns?.length || 0,
        moodTrend: (insights as any).moodTrend || 'stable',
      },
    });

  } catch (error) {
    console.error('Chat error:', error);
    
    // User-friendly error message
    return NextResponse.json({
      response: "I'm having trouble processing that right now. Let's try again - how are you feeling today?",
      error: true,
    }, { status: 500 });
  }
}

async function getSimpleContext(userId: string): Promise<SimpleContext> {
  // In production, fetch from database
  // For MVP, use simple in-memory or Redis cache
  
  return {
    recentTopics: ['work stress', 'family', 'self-care'],
    currentMood: 6,
    sessionCount: 3,
    lastInsight: 'You tend to be hardest on yourself on Mondays',
  };
}

async function generateSimpleResponse(
  message: string, 
  context: SimpleContext
): Promise<{ content: string; reasoning: string }> {
  
  const systemPrompt = `You are Maya, a supportive AI reflection partner. 

Your role:
- Help users understand their patterns through gentle questioning
- Offer practical insights based on what they share
- Maintain clear boundaries (you're not a therapist)
- Keep responses concise and actionable

User context:
- Recent topics: ${context.recentTopics.join(', ')}
- Current mood: ${context.currentMood}/10
- Sessions completed: ${context.sessionCount}

Guidelines:
- Use simple, conversational language
- Ask one follow-up question at most
- Offer concrete observations when you notice patterns
- Suggest simple, actionable steps when appropriate
- Always be encouraging but realistic`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo', // Cost-effective for MVP
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ],
    temperature: 0.7,
    max_tokens: 300, // Keep responses concise
  });

  const response = completion.choices[0]?.message?.content || 
    "I hear you. Tell me more about what's on your mind.";

  return {
    content: response,
    reasoning: 'Generated simple supportive response',
  };
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    service: 'simple-chat',
    timestamp: new Date().toISOString(),
  });
}