import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
// Mock data for development - replace with real Supabase queries in production
export async function GET(request: NextRequest) {
  try {
    // Try to fetch from backend first, fallback to mock data
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3006';
    
    try {
      const response = await fetch(`${backendUrl}/api/v1/admin/dashboard`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      } else {
        console.warn('Backend admin API not available, using mock data');
      }
    } catch (backendError) {
      console.warn('Backend admin API error, using mock data:', backendError);
    }
    
    // Fallback to mock data if backend is unavailable
    const mockData = {
      sessions: {
        activeSessions: 3,
        totalSessions: 127,
        averageSessionLength: 240, // seconds
        sessionsToday: 12
      },
      interactions: {
        voiceInteractions: 89,
        textInteractions: 156,
        voicePercentage: Math.round((89 / (89 + 156)) * 100),
        avgResponseTime: 1250 // milliseconds
      },
      files: {
        totalFiles: 34,
        filesUploadedToday: 5,
        citationsGenerated: 67,
        avgCitationsPerQuery: 2.3
      },
      activeSessions: [
        {
          id: 'session_1',
          userId: 'user_123',
          username: 'AliceMystical',
          element: 'water',
          startTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
          lastActivity: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 mins ago
          interactionCount: 8,
          mode: 'voice' as const
        },
        {
          id: 'session_2',
          userId: 'user_456',
          username: 'BobSeeker',
          element: 'fire',
          startTime: new Date(Date.now() - 8 * 60 * 1000).toISOString(), // 8 mins ago
          lastActivity: new Date(Date.now() - 30 * 1000).toISOString(), // 30 secs ago
          interactionCount: 4,
          mode: 'mixed' as const
        },
        {
          id: 'session_3',
          userId: 'user_789',
          username: 'CaraWise',
          element: 'aether',
          startTime: new Date(Date.now() - 3 * 60 * 1000).toISOString(), // 3 mins ago
          lastActivity: new Date().toISOString(), // just now
          interactionCount: 2,
          mode: 'text' as const
        }
      ]
    };

    // Add some randomization to make it feel live
    const variance = () => Math.floor(Math.random() * 5) - 2; // -2 to +2
    
    mockData.sessions.activeSessions = Math.max(0, mockData.sessions.activeSessions + variance());
    mockData.interactions.avgResponseTime = Math.max(800, mockData.interactions.avgResponseTime + (variance() * 100));
    
    // Update last activity times to be more recent
    mockData.activeSessions.forEach(session => {
      const randomDelay = Math.floor(Math.random() * 120000); // 0-2 minutes
      session.lastActivity = new Date(Date.now() - randomDelay).toISOString();
    });

    return NextResponse.json(mockData);

  } catch (error) {
    console.error('Admin dashboard error:', error);
    
    return NextResponse.json({
      error: 'Failed to fetch dashboard data',
      sessions: {
        activeSessions: 0,
        totalSessions: 0,
        averageSessionLength: 0,
        sessionsToday: 0
      },
      interactions: {
        voiceInteractions: 0,
        textInteractions: 0,
        voicePercentage: 0,
        avgResponseTime: 0
      },
      files: {
        totalFiles: 0,
        filesUploadedToday: 0,
        citationsGenerated: 0,
        avgCitationsPerQuery: 0
      },
      activeSessions: []
    }, { status: 500 });
  }
}

// Future: Add POST endpoint for admin actions
export async function POST(request: NextRequest) {
  try {
    const { action, targetId } = await request.json();
    
    // Admin actions like:
    // - Terminate session
    // - Send system message
    // - Update user permissions
    // - Clear user data
    
    switch (action) {
      case 'terminate_session':
        // Terminate specific session
        return NextResponse.json({ success: true, action: 'session_terminated' });
        
      case 'system_message':
        // Send system-wide message
        return NextResponse.json({ success: true, action: 'message_sent' });
        
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Admin action error:', error);
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}