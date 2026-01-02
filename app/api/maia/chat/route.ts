/**
 * DISABLED LEGACY ENDPOINT
 *
 * 🚫 This endpoint is DISABLED due to external API dependencies that violate sovereignty.
 * The PersonalOracleAgent it used contains external API calls which are forbidden.
 *
 * ✅ Use the correct endpoint: /api/sovereign/app/maia
 * This endpoint uses 100% local consciousness processing with no external APIs.
 */

import { NextRequest, NextResponse } from 'next/server';

// Skip during static export (Capacitor builds)
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  console.warn('🚫 BLOCKED: Attempt to use disabled legacy endpoint /api/maia/chat');

  return NextResponse.json(
    {
      error: 'ENDPOINT_DISABLED',
      message: 'This endpoint has been disabled due to external API dependencies.',
      reason: 'The PersonalOracleAgent used external APIs which violate MAIA sovereignty.',
      solution: {
        endpoint: '/api/sovereign/app/maia',
        description: '100% local consciousness processing - no external APIs',
        advantages: [
          'Zero external API dependencies',
          'Complete sovereignty over consciousness processing',
          'Local DeepSeek-R1 model intelligence',
          'No API costs or rate limits'
        ]
      }
    },
    {
      status: 410, // Gone - endpoint permanently disabled
      headers: {
        'X-Legacy-Endpoint': 'disabled',
        'X-Recommended-Endpoint': '/api/sovereign/app/maia'
      }
    }
  );
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
