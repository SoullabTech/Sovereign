import { NextRequest, NextResponse } from 'next/server';

// Session status endpoint for transformational experience
// Provides session information for pathway detection

interface SessionStatusResponse {
  status: 'active' | 'expired' | 'none';
  pathway: 'PATHWAY_1_INITIATION' | 'PATHWAY_2_RETURNING' | 'PATHWAY_3_CONTINUOUS';
  user?: {
    id: string;
    name: string;
    element: string;
    elementName: string;
    lastActive: string;
    needsAuth: boolean;
  };
}

export async function GET(request: NextRequest) {
  try {
    // In a client-side session system, we rely on the client to provide session info
    // This endpoint can be used for server-side session validation if needed

    const authHeader = request.headers.get('authorization');
    const sessionToken = authHeader?.replace('Bearer ', '');

    if (!sessionToken) {
      return NextResponse.json({
        status: 'none',
        pathway: 'PATHWAY_1_INITIATION'
      } as SessionStatusResponse);
    }

    // Basic token validation (expand as needed)
    try {
      const sessionData = JSON.parse(atob(sessionToken));

      // Validate session hasn't expired (30 days)
      const now = Date.now();
      const lastActive = sessionData.lastActive;
      const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days

      if (now - lastActive > maxAge || sessionData.signedOut) {
        return NextResponse.json({
          status: 'expired',
          pathway: 'PATHWAY_2_RETURNING',
          user: {
            id: sessionData.id,
            name: sessionData.name,
            element: sessionData.element,
            elementName: sessionData.elementName,
            lastActive: new Date(sessionData.lastActive).toISOString(),
            needsAuth: true
          }
        } as SessionStatusResponse);
      }

      // Active session
      return NextResponse.json({
        status: 'active',
        pathway: 'PATHWAY_3_CONTINUOUS',
        user: {
          id: sessionData.id,
          name: sessionData.name,
          element: sessionData.element,
          elementName: sessionData.elementName,
          lastActive: new Date(sessionData.lastActive).toISOString(),
          needsAuth: false
        }
      } as SessionStatusResponse);

    } catch (decodeError) {
      // Invalid token format
      return NextResponse.json({
        status: 'none',
        pathway: 'PATHWAY_1_INITIATION'
      } as SessionStatusResponse);
    }

  } catch (error) {
    console.error('Session status check error:', error);

    return NextResponse.json(
      { error: 'Session service temporarily unavailable' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Update session activity
    const body = await request.json();
    const { action, sessionData } = body;

    if (action === 'heartbeat' && sessionData) {
      // Update last active timestamp
      console.log('🧘 Session heartbeat:', {
        userId: sessionData.id,
        element: sessionData.element,
        timestamp: new Date().toISOString()
      });

      return NextResponse.json({ success: true });
    }

    if (action === 'signout' && sessionData) {
      // Log signout event
      console.log('👋 Sacred signout:', {
        userId: sessionData.id,
        element: sessionData.element,
        timestamp: new Date().toISOString()
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Session update error:', error);
    return NextResponse.json(
      { error: 'Session update failed' },
      { status: 500 }
    );
  }
}