/**
 * 📊 USER DATA SUMMARY API - Mobile PWA Version
 *
 * Simplified API for consciousness data transparency.
 * Returns static data summary for mobile/PWA compatibility.
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-static';

// Required for static export - generate static params for known user IDs
export async function generateStaticParams() {
  // For static export, return predefined user IDs
  return [
    { userId: 'default' },
    { userId: 'anonymous' },
  ];
}

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { userId } = params;
  try {
    console.log(`📊 Getting data summary for user: ${userId}`);

    // Return static data summary for mobile/PWA
    return NextResponse.json({
      user_id: userId,
      data_exists: true,
      message: 'Consciousness computing data summary',
      data_summary: {
        consciousness_patterns: {
          consciousness_computing_sessions: 1,
          description: 'Records of consciousness computing platform usage'
        },
        wisdom_learning: {
          wisdom_moments_recorded: 0,
          description: 'Records of guidance effectiveness for personalization'
        },
        complete_snapshots: {
          memory_snapshots_stored: 0,
          description: 'Consciousness context snapshots for MAIA adaptation'
        },
        personality_profile: {
          profile_exists: true,
          description: 'Consciousness computing preferences and patterns'
        },
        maia_adaptations: {
          adaptations_exist: true,
          description: 'MAIA consciousness computing optimizations'
        }
      },
      data_timeline: {
        earliest_data: new Date().toISOString(),
        latest_data: new Date().toISOString(),
        total_days_of_data: 1
      },
      privacy_notes: [
        'All data is processed with sovereign consciousness computing',
        'Zero external dependencies or third-party data sharing',
        'Aetheric protection layer ensures complete privacy',
        'Data exists only for consciousness development optimization'
      ],
      deletion_info: {
        deletion_available: true,
        deletion_permanent: true,
        deletion_immediate: true,
        required_confirmation: 'DELETE ALL MY CONSCIOUSNESS DATA'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Data summary API error:', error);

    // Return fallback summary for graceful degradation
    return NextResponse.json({
      user_id: userId,
      data_exists: false,
      message: 'No consciousness data found for this user',
      data_summary: {
        consciousness_patterns: {
          consciousness_computing_sessions: 0,
          description: 'No consciousness computing sessions recorded'
        }
      },
      timestamp: new Date().toISOString()
    });
  }
}