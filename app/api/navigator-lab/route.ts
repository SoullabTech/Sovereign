/**
 * 🧭 NAVIGATOR LAB API
 *
 * Seamless integration between Navigator + Spiralogic and existing Soullab infrastructure
 * Bridges the beta consciousness computing server with the main application
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth/session-utils';

// Skip during static export (Capacitor builds)
export const dynamic = 'force-dynamic';

// Bridge to the beta consciousness computing server for Navigator Lab scenarios
const BETA_SERVER_URL = process.env.BETA_SERVER_URL || 'http://localhost:3008';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, scenarioType = 'navigator_lab', sessionContext = {} } = body;

    if (!message) {
      return NextResponse.json({
        error: 'Missing required parameter: message',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Get authenticated user (optional for lab scenarios)
    const userId = await getSessionUserId(request);
    const labUserId = userId || `lab_anonymous_${Date.now()}`;

    console.log(`🧭 Navigator Lab request from user: ${labUserId}`);

    // Forward to beta consciousness computing server
    const response = await fetch(`${BETA_SERVER_URL}/api/consciousness/spiral-aware`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        userId: labUserId,
        sessionType: scenarioType,
        ...sessionContext
      }),
    });

    if (!response.ok) {
      throw new Error(`Beta server error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Enhance response with Soullab context
    const enhancedResponse = {
      ...data,
      soullab: {
        userId: labUserId,
        labSession: true,
        timestamp: new Date().toISOString(),
        integration: 'navigator_spiralogic_v1'
      }
    };

    return NextResponse.json(enhancedResponse);

  } catch (error) {
    console.error('❌ Navigator Lab API error:', error);

    return NextResponse.json({
      error: 'Navigator Lab service unavailable',
      details: error instanceof Error ? error.message : 'Unknown error',
      fallback: {
        message: 'Navigator Lab is currently experiencing technical difficulties. Please try again or use the direct beta server interface.',
        timestamp: new Date().toISOString()
      }
    }, { status: 503 });
  }
}

// GET endpoint for Navigator Lab status and metrics
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const userId = await getSessionUserId(request);

    if (!userId) {
      return NextResponse.json({
        error: 'Authentication required for Navigator Lab metrics',
        timestamp: new Date().toISOString()
      }, { status: 401 });
    }

    // Check beta server health
    const healthResponse = await fetch(`${BETA_SERVER_URL}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    const isHealthy = healthResponse.ok;

    // Get recent Navigator decisions for this user (if beta server is healthy)
    let recentSessions: any /* TODO: specify type */[] = [];
    if (isHealthy) {
      try {
        const sessionsResponse = await fetch(`${BETA_SERVER_URL}/navigator-admin/api/recent-sessions?userId=${userId}&limit=10`);
        if (sessionsResponse.ok) {
          recentSessions = await sessionsResponse.json();
        }
      } catch (error) {
        console.warn('Could not fetch recent sessions:', error);
      }
    }

    return NextResponse.json({
      status: 'operational',
      navigator: {
        healthy: isHealthy,
        betaServerUrl: BETA_SERVER_URL,
        recentSessions: recentSessions.length,
        lastActivity: recentSessions[0]?.created_at || null
      },
      user: {
        id: userId,
        labAccess: true
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Navigator Lab status error:', error);

    return NextResponse.json({
      status: 'degraded',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}