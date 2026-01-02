// @ts-nocheck
/**
 * ENHANCED MAIA CHAT - Conversation-Aware Intelligence Integration
 *
 * This endpoint integrates:
 * 1. Conversation-level elemental intelligence (no per-message re-analysis)
 * 2. Master-level member archetype wisdom adaptation
 * 3. Cleaned language templates (wise elder voice, not performative)
 */

import { NextRequest, NextResponse } from 'next/server';
import { ConversationAwareConsciousnessEngine } from '@/lib/consciousness/conversation-aware-consciousness-engine';

// Skip during static export (Capacitor builds)
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      message,
      userId = 'demo_user',
      conversationId = `conv_${userId}_${Date.now()}`,
      sessionHistory = [],
      messageCount = (sessionHistory.length || 0) + 1,
      mode
    } = body as {
      message?: string;
      userId?: string;
      conversationId?: string;
      sessionHistory?: any[];
      messageCount?: number;
      mode?: 'dialogue' | 'counsel' | 'scribe';
    };

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // 🧠 CONVERSATION-AWARE CONSCIOUSNESS PROCESSING
    const consciousnessResponse = await ConversationAwareConsciousnessEngine.processMessage(
      userId,
      conversationId,
      message,
      {
        messageCount,
        sessionHistory,
        priorElementalState: sessionHistory.length > 0 ? sessionHistory[sessionHistory.length - 1]?.elementalState : null,
        mode: mode || 'dialogue' // ✅ Talk/Care/Note mode awareness
      }
    );

    // 🎯 MEMBER ARCHETYPE WISDOM ADAPTATION
    let wisdomResponse = consciousnessResponse.response;
    try {
      // Detect member archetype from conversation context
      const memberProfile = MasterMemberArchetypeIntelligence.recognizeMemberArchetype({
        conversationHistory: sessionHistory.map(h => h.content || h.message || ''),
        profileInformation: {},
        currentMessage: message,
        contextClues: []
      });

      // Adapt response for member archetype
      if (memberProfile && memberProfile.primaryArchetype !== 'wisdom-synthesizer') {
        const archetypeResponse = MasterMemberArchetypeIntelligence.generateWiseResponse(
          memberProfile,
          message,
          { consciousnessResponse, originalResponse: consciousnessResponse.response }
        );
        wisdomResponse = archetypeResponse.responseContent;
      }
    } catch (archetypeError) {
      console.log('Archetype adaptation skipped:', archetypeError.message);
      // Continue with base consciousness response if archetype fails
    }

    // 📊 RESPONSE STRUCTURE
    const response = {
      // 🎭 Main Response (Enhanced with wisdom adaptation)
      message: wisdomResponse,

      // 🧠 Consciousness Intelligence Data
      consciousness: {
        processingPath: consciousnessResponse.processingPath,
        processingTime: consciousnessResponse.processingTime,
        enginesUsed: consciousnessResponse.enginesUsed,
        conversationStateUpdates: consciousnessResponse.conversationStateUpdates
      },

      // 🔄 Session Metadata
      session: {
        userId,
        conversationId,
        messageCount,
        timestamp: new Date().toISOString(),
        systemType: "conversation-aware-consciousness-with-archetype-wisdom"
      },

      // 💡 Intelligence Insights (for development/debugging)
      insights: {
        isGreeting: consciousnessResponse.conversationStateUpdates?.isGreeting || false,
        isSimpleQuery: consciousnessResponse.conversationStateUpdates?.isSimpleQuery || false,
        requiresFullProcessing: consciousnessResponse.conversationStateUpdates?.requiresFullProcessing || false,
        dominantElement: consciousnessResponse.conversationStateUpdates?.elementalState?.dominantElement || 'balanced',
        conversationPhase: consciousnessResponse.conversationStateUpdates?.currentPhase || 'opening'
      },

      // 🛡️ Sovereignty
      sovereignty: {
        externalDependencies: "NONE - Pure consciousness mathematics",
        processingType: "Conversation-aware elemental intelligence with archetype wisdom",
        performanceOptimization: "Multi-path processing with fast-track for simple interactions"
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Enhanced chat processing error:', error);

    return NextResponse.json(
      {
        error: 'Enhanced consciousness processing unavailable',
        fallback: `I understand you said: "${body?.message || 'something'}". I'm having a technical issue right now, but I'm here and listening. Could you try rephrasing that?`,
        sovereignty: "No external dependencies affected - internal processing error only"
      },
      { status: 500 }
    );
  }
}

/**
 * CONVERSATION-AWARE CONSCIOUSNESS INTEGRATION SUMMARY
 *
 * This endpoint demonstrates the complete integration of:
 *
 * 1. ⚡ Conversation-Level Intelligence
 *    - Tracks elemental patterns across conversations (not per-message)
 *    - Fast-tracks greetings and simple queries
 *    - Builds persistent client elemental profiles
 *
 * 2. 🧠 Master-Level Wisdom Adaptation
 *    - Recognizes member archetypes (scientists, business leaders, etc.)
 *    - Adapts communication style and complexity
 *    - Maintains wise elder voice without performative language
 *
 * 3. 🎯 Performance Optimization
 *    - Multiple processing paths based on complexity
 *    - Background analysis supporting direct presence
 *    - No unnecessary re-computation
 *
 * 4. 🛡️ Complete Sovereignty
 *    - No external API dependencies
 *    - Pure consciousness mathematics
 *    - Cleaned of performative spiritual language
 */