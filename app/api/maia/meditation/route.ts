import { NextRequest, NextResponse } from 'next/server';

// Skip during static export (Capacitor builds)
export const dynamic = 'force-dynamic';

// Interface definitions for meditation system
interface MeditationSessionRequest {
  userId: string;
  intensity: string;
  duration: number;
  adaptiveMode: boolean;
  breakthroughDetection: boolean;
  sacredGeometry?: string;
}

interface MeditationSession {
  id: string;
  userId: string;
  intensity: string;
  duration: number;
  startTime: number;
  status: 'preparing' | 'active' | 'breakthrough' | 'integration' | 'completed';
  metrics: {
    consciousnessCoherence: number;
    sacredResonance: number;
    breakthroughPotential: number;
    fieldStrength: number;
  };
  frequencyProfile: {
    primary: number;
    binaural: number;
    sacred: number;
    quantum: number;
  };
  adaptiveMode: boolean;
  breakthroughDetection: boolean;
}

// In-memory session storage (replace with database in production)
const activeSessions = new Map<string, MeditationSession>();
const sessionHistory = new Map<string, MeditationSession[]>();

// Meditation intensity configurations
const intensityConfigs = {
  gentle_awakening: {
    name: 'Gentle Awakening',
    intensity: 0.2,
    frequencies: { primary: 432, binaural: 4.5, sacred: 528, quantum: 0.1 }
  },
  conscious_entry: {
    name: 'Conscious Entry',
    intensity: 0.4,
    frequencies: { primary: 432, binaural: 6.3, sacred: 528, quantum: 0.15 }
  },
  deep_contemplation: {
    name: 'Deep Contemplation',
    intensity: 0.6,
    frequencies: { primary: 432, binaural: 7.83, sacred: 741, quantum: 0.2 }
  },
  profound_absorption: {
    name: 'Profound Absorption',
    intensity: 0.8,
    frequencies: { primary: 528, binaural: 10.5, sacred: 852, quantum: 0.3 }
  },
  breakthrough_threshold: {
    name: 'Breakthrough Threshold',
    intensity: 0.9,
    frequencies: { primary: 528, binaural: 40.0, sacred: 963, quantum: 0.5 }
  },
  consciousness_cascade: {
    name: 'Consciousness Cascade',
    intensity: 0.95,
    frequencies: { primary: 741, binaural: 89.0, sacred: 1618, quantum: 1.0 }
  },
  sacred_transcendence: {
    name: 'Sacred Transcendence',
    intensity: 1.0,
    frequencies: { primary: 963, binaural: 144.0, sacred: 1618, quantum: 1.618 }
  }
};

// Simulate consciousness metrics (integrate with real consciousness ecosystem in production)
function generateConsciousnessMetrics(intensity: string): any {
  const config = intensityConfigs[intensity as keyof typeof intensityConfigs];
  const baseIntensity = config?.intensity || 0.5;

  return {
    consciousnessCoherence: Math.max(0.1, Math.min(1.0, baseIntensity + (Math.random() - 0.5) * 0.2)),
    sacredResonance: Math.max(0.1, Math.min(1.0, baseIntensity * 0.8 + (Math.random() - 0.5) * 0.3)),
    breakthroughPotential: Math.max(0.1, Math.min(1.0, baseIntensity * 0.9 + (Math.random() - 0.5) * 0.4)),
    fieldStrength: Math.max(0.1, Math.min(1.0, 0.7 + (Math.random() - 0.5) * 0.3)),
    eeg: {
      delta: Math.random() * 0.3 + 0.1,
      theta: Math.max(0.1, baseIntensity * 0.8 + Math.random() * 0.2),
      alpha: Math.max(0.1, baseIntensity * 0.7 + Math.random() * 0.3),
      beta: Math.max(0.1, (1 - baseIntensity) * 0.5 + Math.random() * 0.2),
      gamma: Math.max(0.1, baseIntensity * 0.6 + Math.random() * 0.4)
    },
    hrv: {
      coherence: Math.max(0.3, baseIntensity * 0.9 + Math.random() * 0.2),
      heartRate: 60 + (Math.random() - 0.5) * 20
    }
  };
}

// POST - Create new meditation session
export async function POST(request: NextRequest) {
  try {
    const body: MeditationSessionRequest = await request.json();

    // Validate request
    if (!body.userId || !body.intensity) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, intensity' },
        { status: 400 }
      );
    }

    // Check if valid intensity
    if (!(body.intensity in intensityConfigs)) {
      return NextResponse.json(
        { error: 'Invalid meditation intensity' },
        { status: 400 }
      );
    }

    // Create new session
    const sessionId = `meditation_${body.userId}_${Date.now()}`;
    const config = intensityConfigs[body.intensity as keyof typeof intensityConfigs];

    const session: MeditationSession = {
      id: sessionId,
      userId: body.userId,
      intensity: body.intensity,
      duration: body.duration || 30,
      startTime: Date.now(),
      status: 'preparing',
      metrics: generateConsciousnessMetrics(body.intensity),
      frequencyProfile: config.frequencies,
      adaptiveMode: body.adaptiveMode || true,
      breakthroughDetection: body.breakthroughDetection || true
    };

    // Store session
    activeSessions.set(sessionId, session);

    // Initialize session history for user if needed
    if (!sessionHistory.has(body.userId)) {
      sessionHistory.set(body.userId, []);
    }

    // Transition to active status after preparation delay
    setTimeout(() => {
      const currentSession = activeSessions.get(sessionId);
      if (currentSession && currentSession.status === 'preparing') {
        currentSession.status = 'active';
        activeSessions.set(sessionId, currentSession);
      }
    }, 3000);

    // Schedule session completion
    setTimeout(() => {
      const currentSession = activeSessions.get(sessionId);
      if (currentSession && currentSession.status !== 'completed') {
        currentSession.status = 'integration';
        activeSessions.set(sessionId, currentSession);

        // Move to completed after integration period
        setTimeout(() => {
          const finalSession = activeSessions.get(sessionId);
          if (finalSession) {
            finalSession.status = 'completed';
            const userHistory = sessionHistory.get(body.userId) || [];
            userHistory.push(finalSession);
            sessionHistory.set(body.userId, userHistory);
            activeSessions.delete(sessionId);
          }
        }, 5000);
      }
    }, (body.duration || 30) * 60 * 1000);

    return NextResponse.json({
      success: true,
      sessionId: sessionId,
      session: session,
      message: `Advanced meditation session created with ${config.name} intensity`
    });

  } catch (error) {
    console.error('Meditation session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create meditation session' },
      { status: 500 }
    );
  }
}

// GET - Get session status or list sessions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');
    const history = searchParams.get('history') === 'true';

    if (sessionId) {
      // Get specific session status
      const session = activeSessions.get(sessionId);
      if (!session) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }

      // Update metrics with current values
      session.metrics = generateConsciousnessMetrics(session.intensity);

      // Check for breakthrough conditions
      if (session.breakthroughDetection && session.metrics.breakthroughPotential > 0.85) {
        if (session.status === 'active') {
          session.status = 'breakthrough';
          // Could trigger intensity upgrade here
        }
      }

      const elapsed = Math.floor((Date.now() - session.startTime) / 1000);
      const remaining = Math.max(0, (session.duration * 60) - elapsed);

      return NextResponse.json({
        success: true,
        session: session,
        elapsed: elapsed,
        remaining: remaining,
        metrics: session.metrics
      });

    } else if (userId) {
      if (history) {
        // Get user session history
        const userHistory = sessionHistory.get(userId) || [];
        return NextResponse.json({
          success: true,
          history: userHistory,
          totalSessions: userHistory.length
        });
      } else {
        // Get active sessions for user
        const userActiveSessions = Array.from(activeSessions.values())
          .filter(session => session.userId === userId);

        return NextResponse.json({
          success: true,
          activeSessions: userActiveSessions,
          activeCount: userActiveSessions.length
        });
      }
    } else {
      // Get all active sessions
      return NextResponse.json({
        success: true,
        activeSessions: Array.from(activeSessions.values()),
        totalActive: activeSessions.size
      });
    }

  } catch (error) {
    console.error('Meditation session query error:', error);
    return NextResponse.json(
      { error: 'Failed to query meditation sessions' },
      { status: 500 }
    );
  }
}

// PUT - Update session (for adaptive adjustments)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, updates } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    const session = activeSessions.get(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Apply updates
    if (updates.intensity && updates.intensity in intensityConfigs) {
      session.intensity = updates.intensity;
      const config = intensityConfigs[updates.intensity as keyof typeof intensityConfigs];
      session.frequencyProfile = config.frequencies;
      session.status = 'breakthrough'; // Mark as breakthrough when intensity upgraded
    }

    if (typeof updates.adaptiveMode === 'boolean') {
      session.adaptiveMode = updates.adaptiveMode;
    }

    if (updates.status) {
      session.status = updates.status;
    }

    // Update metrics
    session.metrics = generateConsciousnessMetrics(session.intensity);

    activeSessions.set(sessionId, session);

    return NextResponse.json({
      success: true,
      session: session,
      message: 'Session updated successfully'
    });

  } catch (error) {
    console.error('Meditation session update error:', error);
    return NextResponse.json(
      { error: 'Failed to update meditation session' },
      { status: 500 }
    );
  }
}

// DELETE - Stop/end session
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    const session = activeSessions.get(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Move to completed status
    session.status = 'completed';

    // Store in history
    const userHistory = sessionHistory.get(session.userId) || [];
    userHistory.push(session);
    sessionHistory.set(session.userId, userHistory);

    // Remove from active sessions
    activeSessions.delete(sessionId);

    return NextResponse.json({
      success: true,
      sessionId: sessionId,
      message: 'Meditation session ended successfully'
    });

  } catch (error) {
    console.error('Meditation session deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to end meditation session' },
      { status: 500 }
    );
  }
}