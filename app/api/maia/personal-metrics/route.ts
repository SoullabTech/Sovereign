/**
 * 🔍 PERSONAL METRICS API
 *
 * API endpoint for the Sacred Lab drawer personal metrics system.
 * Provides member-facing metrics mirror derived from seven-layer architecture.
 */

import { NextRequest, NextResponse } from 'next/server';
import { PersonalMetricsService } from '@/lib/services/personal-metrics';
import { getSessionUserId } from '@/lib/auth/session-utils';

// Mock service instances - would be properly injected
const personalMetricsService = new PersonalMetricsService(
  null, // CoreMemberProfileService
  null, // SpiralConstellationService
  null, // CommunityFieldMemoryService
  null, // MAIAKnowledgeBaseService
  null, // SessionManager
  null  // EpisodeManager
);

// ==============================================================================
// GET - Personal Metrics Snapshot
// ==============================================================================

export async function GET(request: NextRequest) {
  try {
    const userId = await getSessionUserId(request);
    if (!userId) {
      return NextResponse.json({
        error: 'Authentication required for personal metrics',
        timestamp: new Date().toISOString()
      }, { status: 401 });
    }

    const url = new URL(request.url);
    const viewMode = (url.searchParams.get('view') as 'gentle' | 'detailed' | 'facilitator') || 'gentle';
    const digest = url.searchParams.get('digest') === 'true';

    if (digest) {
      // Return simplified digest for dashboard widgets
      const metricsDigest = await personalMetricsService.getMetricsDigest(userId);

      return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        data: metricsDigest,
        type: 'digest'
      }, { status: 200 });
    } else {
      // Return full metrics snapshot
      const metricsSnapshot = await personalMetricsService.getPersonalMetricsSnapshot(userId, viewMode);

      return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        data: metricsSnapshot,
        type: 'full_snapshot',
        metadata: {
          viewMode,
          dataConfidence: metricsSnapshot.dataConfidence,
          generatedAt: metricsSnapshot.generatedAt
        }
      }, { status: 200 });
    }

  } catch (error) {
    console.error('Error in personal metrics API:', error);
    return NextResponse.json({
      error: 'Failed to generate personal metrics',
      message: error instanceof Error ? error.message : 'Unknown metrics error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// ==============================================================================
// Mock session utility (replace with actual auth)
// ==============================================================================

async function getSessionUserId(request: NextRequest): Promise<string | null> {
  // This would integrate with actual authentication system
  // For demonstration, return a mock user ID
  return 'user_metrics_demo';
}