// MAIA Inner Council - Wisdom-Based Awareness API
//
// 🌸 This endpoint serves as MAIA's inner council, not a command center.
//
// MAIA can consult her consciousness snapshots to receive gentle wisdom
// about conversation style, but she remains free to choose how to respond.
// This is guidance, not manipulation - an inner council, not behavioral rules.

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import {
  getLatestAwarenessSnapshot,
  suggestStyleFromAwareness,
  getAwarenessTrend,
  suggestAdvancedStyleFromTrend,
} from '@/lib/awareness/reflexive-awareness';
import {
  ConversationStylePreference,
  DEFAULT_CONVERSATION_STYLE,
} from '@/lib/preferences/conversation-style-preference';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const userId = (body?.userId as string | null) ?? null;
    const currentStyle =
      (body?.conversationStyle as ConversationStylePreference) ??
      DEFAULT_CONVERSATION_STYLE;
    const useAdvanced = (body?.useAdvanced as boolean) ?? false;

    console.log('[MAIA Reflexive] Processing awareness adjustment for user:', userId);

    if (useAdvanced) {
      // Use advanced council wisdom based on awareness trend
      const trend = await getAwarenessTrend(userId, 3);
      const councilGuidance = suggestAdvancedStyleFromTrend(trend, currentStyle);

      console.log('[MAIA Inner Council] Advanced guidance:', {
        currentStyle: currentStyle.style,
        suggestedStyle: councilGuidance.suggestedStyle,
        actualStyle: councilGuidance.actualStyle,
        confidence: councilGuidance.confidence,
        suggestion: councilGuidance.suggestion,
        trendLength: trend.length
      });

      return NextResponse.json({
        ok: true,
        conversationStyle: councilGuidance,
        snapshot: trend[0] || null,
        trend,
        adjustmentType: 'advanced_wisdom'
      });
    } else {
      // Use basic council wisdom based on latest snapshot
      const snapshot = await getLatestAwarenessSnapshot(userId);
      const councilGuidance = suggestStyleFromAwareness(snapshot, currentStyle);

      console.log('[MAIA Inner Council] Basic guidance:', {
        currentStyle: currentStyle.style,
        suggestedStyle: councilGuidance.suggestedStyle,
        actualStyle: councilGuidance.actualStyle,
        confidence: councilGuidance.confidence,
        suggestion: councilGuidance.suggestion,
        awarenessLevel: snapshot?.awareness_level,
        hasSourceMix: snapshot?.source_mix ? snapshot.source_mix.length > 0 : false
      });

      return NextResponse.json({
        ok: true,
        conversationStyle: councilGuidance,
        snapshot,
        adjustmentType: 'basic_wisdom'
      });
    }

  } catch (error) {
    console.error('[MAIA Reflexive] /api/awareness/adjust error:', error);

    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to adjust awareness style',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'active',
    type: 'MAIA Inner Council - Wisdom-Based Awareness',
    description: '🌸 Provides gentle wisdom suggestions to MAIA based on consciousness state. Inner council, not command center.',
    version: '2.0.0',
    capabilities: [
      'Wisdom-based style suggestions with confidence levels',
      'Advanced trend-based council guidance',
      'Consciousness snapshot retrieval',
      'Real-time inner council consultation',
      'Style blending and gentle transitions',
      'Freedom to override all suggestions'
    ]
  });
}