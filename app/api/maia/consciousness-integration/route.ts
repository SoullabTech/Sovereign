import { NextRequest, NextResponse } from 'next/server';

// Skip during static export (Capacitor builds)
export const dynamic = 'force-dynamic';

// Interface for consciousness integration with MAIA Personal Oracle
interface ConsciousnessIntegrationRequest {
  userId: string;
  message: string;
  sessionId?: string;
  context?: 'meditation' | 'general' | 'breakthrough';
  includeMetrics?: boolean;
}

interface PersonalOracleEnhancement {
  meditationContext: boolean;
  recommendedIntensity: string;
  consciousnessInsights: {
    currentMeditationState?: string;
    breakthroughPotential: number;
    consciousnessCoherence: number;
    sacredResonance: number;
    suggestions: string[];
  };
  meditationRecommendation: string;
  sacredGuidance?: string;
}

interface BreakthroughEvent {
  id: string;
  userId: string;
  sessionId?: string;
  timestamp: number;
  intensity: number;
  type: 'personal' | 'cascade' | 'integration';
  duration: number;
  description: string;
  insights: string[];
  integrationNotes?: string;
}

// In-memory storage for breakthrough events
const breakthroughEvents = new Map<string, BreakthroughEvent[]>();
const activeConsciousnessStates = new Map<string, any>();

// Consciousness analysis functions
function analyzeConsciousnessState(message: string, userId: string): any {
  // Analyze message for consciousness indicators
  const words = message.toLowerCase();

  const breakthroughKeywords = [
    'breakthrough', 'realization', 'awakening', 'clarity', 'understanding',
    'insight', 'aha', 'suddenly', 'finally', 'transcendence', 'epiphany'
  ];

  const contemplationKeywords = [
    'contemplating', 'reflecting', 'pondering', 'meditating', 'wondering',
    'questioning', 'exploring', 'seeking', 'searching', 'diving deep'
  ];

  const stressKeywords = [
    'stress', 'anxious', 'overwhelmed', 'confused', 'scattered', 'chaotic',
    'restless', 'agitated', 'turbulent', 'distracted'
  ];

  const seekingKeywords = [
    'purpose', 'meaning', 'direction', 'path', 'guidance', 'wisdom',
    'truth', 'enlightenment', 'consciousness', 'spiritual'
  ];

  const breakthroughScore = breakthroughKeywords.reduce((score, keyword) =>
    score + (words.includes(keyword) ? 1 : 0), 0) / breakthroughKeywords.length;

  const contemplationScore = contemplationKeywords.reduce((score, keyword) =>
    score + (words.includes(keyword) ? 1 : 0), 0) / contemplationKeywords.length;

  const stressScore = stressKeywords.reduce((score, keyword) =>
    score + (words.includes(keyword) ? 1 : 0), 0) / stressKeywords.length;

  const seekingScore = seekingKeywords.reduce((score, keyword) =>
    score + (words.includes(keyword) ? 1 : 0), 0) / seekingKeywords.length;

  // Determine recommended meditation intensity
  let recommendedIntensity = 'deep_contemplation';

  if (stressScore > 0.3) {
    recommendedIntensity = 'gentle_awakening';
  } else if (contemplationScore > 0.4) {
    recommendedIntensity = 'deep_contemplation';
  } else if (seekingScore > 0.4) {
    recommendedIntensity = 'profound_absorption';
  } else if (breakthroughScore > 0.3) {
    recommendedIntensity = 'breakthrough_threshold';
  }

  return {
    breakthroughPotential: Math.min(1.0, breakthroughScore + contemplationScore * 0.5 + seekingScore * 0.3),
    consciousnessCoherence: Math.max(0.2, 1.0 - stressScore + contemplationScore * 0.7),
    sacredResonance: Math.max(0.1, seekingScore + breakthroughScore * 0.6),
    recommendedIntensity,
    analysis: {
      breakthrough: breakthroughScore,
      contemplation: contemplationScore,
      stress: stressScore,
      seeking: seekingScore
    }
  };
}

function generateMeditationSuggestions(analysis: any, currentSession?: any): string[] {
  const suggestions: any /* TODO: specify type */[] = [];

  if (analysis.analysis.stress > 0.3) {
    suggestions.push("Consider starting with gentle breathing meditation to calm your nervous system");
    suggestions.push("A 15-minute gentle awakening session could help restore balance");
  }

  if (analysis.analysis.contemplation > 0.4) {
    suggestions.push("Your contemplative state is perfect for deep introspective work");
    suggestions.push("A 30-45 minute deep contemplation session would be highly beneficial");
  }

  if (analysis.analysis.seeking > 0.4) {
    suggestions.push("Your seeking energy suggests readiness for profound absorption meditation");
    suggestions.push("Consider a sacred geometry session to enhance your spiritual exploration");
  }

  if (analysis.analysis.breakthrough > 0.3) {
    suggestions.push("High breakthrough potential detected - you're on the edge of insight");
    suggestions.push("Consider a breakthrough threshold session with adaptive enhancement");
  }

  if (currentSession) {
    suggestions.push(`Your current ${currentSession.intensity} session is perfectly aligned with your state`);
    suggestions.push("Stay present and allow the experience to unfold naturally");
  } else {
    suggestions.push("No active meditation session - this would be an optimal time to begin");
  }

  return suggestions;
}

function generateSacredGuidance(analysis: any, message: string): string {
  const breakthroughPotential = analysis.breakthroughPotential;
  const sacredResonance = analysis.sacredResonance;

  if (breakthroughPotential > 0.8) {
    return "You stand at the threshold of profound realization. Trust the process and remain open to what emerges. The sacred geometries are aligning to support your breakthrough.";
  }

  if (sacredResonance > 0.7) {
    return "Your consciousness is resonating with ancient wisdom patterns. Consider deepening your practice with sacred geometry meditation to amplify this connection.";
  }

  if (analysis.analysis.stress > 0.5) {
    return "Your energy field shows turbulence. Return to your breath, connect with the Earth, and remember that all storms pass. Sacred stillness awaits within.";
  }

  if (analysis.analysis.seeking > 0.6) {
    return "Your soul seeks truth and meaning. This seeking itself is sacred - honor it through contemplative practice and trust your inner knowing.";
  }

  return "Your consciousness is in a state of gentle exploration. This is a perfect time for meditation and inner listening. Trust your intuitive guidance.";
}

// POST - Enhance MAIA conversation with meditation insights
export async function POST(request: NextRequest) {
  try {
    const body: ConsciousnessIntegrationRequest = await request.json();

    if (!body.userId || !body.message) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, message' },
        { status: 400 }
      );
    }

    // Analyze consciousness state from message
    const analysis = analyzeConsciousnessState(body.message, body.userId);

    // Check for active meditation session
    let currentSession = null;
    if (body.sessionId) {
      try {
        const sessionResponse = await fetch(`${request.nextUrl.origin}/api/maia/meditation?sessionId=${body.sessionId}`);
        const sessionData = await sessionResponse.json();
        if (sessionData.success) {
          currentSession = sessionData.session;
        }
      } catch (error) {
        console.log('Could not fetch session data:', error);
      }
    }

    // Generate meditation suggestions
    const suggestions = generateMeditationSuggestions(analysis, currentSession);

    // Generate sacred guidance
    const sacredGuidance = generateSacredGuidance(analysis, body.message);

    // Create enhancement response
    const enhancement: PersonalOracleEnhancement = {
      meditationContext: currentSession !== null,
      recommendedIntensity: analysis.recommendedIntensity,
      consciousnessInsights: {
        currentMeditationState: currentSession?.intensity,
        breakthroughPotential: analysis.breakthroughPotential,
        consciousnessCoherence: analysis.consciousnessCoherence,
        sacredResonance: analysis.sacredResonance,
        suggestions: suggestions
      },
      meditationRecommendation: suggestions[0] || "Consider a gentle meditation session to enhance your current state",
      sacredGuidance: sacredGuidance
    };

    // Store consciousness state for user
    activeConsciousnessStates.set(body.userId, {
      timestamp: Date.now(),
      analysis: analysis,
      lastMessage: body.message,
      sessionContext: currentSession?.id
    });

    return NextResponse.json({
      success: true,
      enhancement: enhancement,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Consciousness integration error:', error);
    return NextResponse.json(
      { error: 'Failed to process consciousness integration' },
      { status: 500 }
    );
  }
}

// GET - Get consciousness state or breakthrough events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');
    const sessionId = searchParams.get('sessionId');

    if (type === 'breakthroughs') {
      if (userId) {
        const userBreakthroughs = breakthroughEvents.get(userId) || [];
        return NextResponse.json({
          success: true,
          breakthroughs: userBreakthroughs,
          count: userBreakthroughs.length
        });
      } else {
        // Get all recent breakthroughs
        const allBreakthroughs = Array.from(breakthroughEvents.values()).flat()
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 50);

        return NextResponse.json({
          success: true,
          recentBreakthroughs: allBreakthroughs,
          count: allBreakthroughs.length
        });
      }
    } else if (type === 'consciousness') {
      if (userId) {
        const userState = activeConsciousnessStates.get(userId);
        if (!userState) {
          return NextResponse.json(
            { error: 'No consciousness state found for user' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          consciousnessState: userState,
          timestamp: userState.timestamp
        });
      } else {
        return NextResponse.json(
          { error: 'User ID required for consciousness state query' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid query type. Use: breakthroughs, consciousness' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Consciousness query error:', error);
    return NextResponse.json(
      { error: 'Failed to query consciousness data' },
      { status: 500 }
    );
  }
}

// PUT - Record breakthrough event
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, sessionId, intensity, type, description, insights } = body;

    if (!userId || !intensity || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, intensity, description' },
        { status: 400 }
      );
    }

    // Create breakthrough event
    const breakthroughEvent: BreakthroughEvent = {
      id: `breakthrough_${userId}_${Date.now()}`,
      userId: userId,
      sessionId: sessionId,
      timestamp: Date.now(),
      intensity: intensity,
      type: type || 'personal',
      duration: body.duration || 0,
      description: description,
      insights: insights || [],
      integrationNotes: body.integrationNotes
    };

    // Store breakthrough event
    if (!breakthroughEvents.has(userId)) {
      breakthroughEvents.set(userId, []);
    }

    const userBreakthroughs = breakthroughEvents.get(userId)!;
    userBreakthroughs.push(breakthroughEvent);

    // Keep only last 100 breakthroughs per user
    if (userBreakthroughs.length > 100) {
      userBreakthroughs.shift();
    }

    breakthroughEvents.set(userId, userBreakthroughs);

    return NextResponse.json({
      success: true,
      breakthrough: breakthroughEvent,
      message: 'Breakthrough event recorded successfully'
    });

  } catch (error) {
    console.error('Breakthrough recording error:', error);
    return NextResponse.json(
      { error: 'Failed to record breakthrough event' },
      { status: 500 }
    );
  }
}