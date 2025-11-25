/**
 * MAIA Chat Endpoint for Custom GPT
 * Direct conversation with MAIA in selected conversation mode
 */

import { NextRequest, NextResponse } from 'next/server';
import { PersonalOracleAgent } from '@/lib/agents/PersonalOracleAgent';
import { saveConversationWithAnalytics, detectDeviceType } from '@/lib/services/conversation-analytics-service';
import { processContentForInsights } from '@/lib/services/UnifiedInsightEngine';
// TODO: Re-enable when elemental reflection hook is implemented
// import { processElementalReflection } from '@/apps/api/backend/src/services/elementalReflectionHook';
// import { getConfigWithEnvOverrides } from '@/config/elemental-reflection.config';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { userId, message, conversationMode = 'walking', voiceEnabled = false } = body;

    if (!userId || !message) {
      return NextResponse.json(
        { error: 'userId and message are required' },
        { status: 400 }
      );
    }

    console.log(`💬 MAIA chat for user ${userId} in ${conversationMode} mode`);

    // TODO: ELEMENTAL REFLECTION HOOK - Process incoming message for elemental patterns
    // const elementalConfig = getConfigWithEnvOverrides();
    // const elementalReflection = await processElementalReflection(
    //   message,
    //   userId,
    //   elementalConfig
    // );

    // Initialize Personal Oracle Agent with conversation style
    const agent = new PersonalOracleAgent(userId, {
      conversationStyle: conversationMode,
      useVoice: voiceEnabled
    });

    // Process message through MAIA
    const response = await agent.processInteraction(message, {
      sessionId: `chatgpt_${Date.now()}`,
      timestamp: Date.now()
    });

    // Save conversation with analytics
    const sessionId = `chatgpt_${Date.now()}`;
    try {
      await saveConversationWithAnalytics({
        userId,
        prompt: message,
        response: response.response,

        // Model performance from response metadata
        aiModel: response.metadata?.modelMetrics?.model,
        aiProvider: response.metadata?.modelMetrics?.provider,
        responseTimeMs: Date.now() - startTime,
        inputTokens: response.metadata?.modelMetrics?.inputTokens,
        outputTokens: response.metadata?.modelMetrics?.outputTokens,
        totalTokens: response.metadata?.modelMetrics?.totalTokens,
        costUsd: response.metadata?.modelMetrics?.costUsd,
        apiRetries: response.metadata?.modelMetrics?.retries,

        // Conversation quality
        conversationMode: conversationMode as any,
        responseWordCount: response.metadata?.qualityMetrics?.responseWordCount,
        responseSentenceCount: response.metadata?.qualityMetrics?.responseSentenceCount,
        userWordCount: response.metadata?.qualityMetrics?.userWordCount,
        brevityScore: response.metadata?.qualityMetrics?.brevityScore,

        // Session context
        sessionId,
        deviceType: detectDeviceType(),
        voiceEnabled,
        ttsEnabled: false
      });
    } catch (saveError) {
      console.error('⚠️ Failed to save analytics:', saveError);
      // Don't fail the request if analytics save fails
    }

    // 🌀 UNIFIED INSIGHT ENGINE - Process conversation for patterns
    // Run in background to not slow down response
    processContentForInsights(
      `${message}\n\n${response.response}`,
      'conversation',
      userId,
      {
        element: response.element,
        emotionalTone: response.metadata?.emotionalTone,
        sessionId,
        date: new Date()
      }
    ).catch(error => {
      console.error('⚠️ Insight processing failed (non-critical):', error);
    });

    // Return MAIA's response with elemental reflection if detected
    return NextResponse.json({
      response: response.response,
      element: response.element,
      // Include elemental reflection if present
      elementalReflection: elementalReflection ? {
        reflection: elementalReflection.reflection,
        question: elementalReflection.question
      } : undefined,
      metadata: {
        symbols: response.metadata?.symbols || [],
        archetypes: response.metadata?.archetypes || [],
        phase: response.metadata?.phase,
        conversationMode,
        modelUsed: response.metadata?.modelMetrics?.model,
        responseTime: Date.now() - startTime,
        // Internal metadata (logged, not shown to user)
        _elementalPattern: elementalReflection?._internal?.element,
        _patternConfidence: elementalReflection?._internal?.confidence
      }
    });

  } catch (error: any) {
    console.error('❌ MAIA chat error:', error);
    return NextResponse.json(
      {
        error: 'MAIA chat failed',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/maia/chat',
    method: 'POST',
    description: 'Direct conversation with MAIA',
    requiredFields: ['userId', 'message'],
    optionalFields: ['conversationMode (walking|classic|adaptive|her)', 'voiceEnabled (boolean)'],
    modes: {
      walking: 'Brief responses (5-8 words) - companion mode',
      classic: 'Depth responses (paragraphs) - transformational work',
      adaptive: 'Dynamic responses - adjusts to context',
      her: 'Intimate responses - deep presence'
    }
  });
}
