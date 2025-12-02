/**
 * 📱⌚ Biometric Data Update API Route
 * Receives real-time biometric data from Apple Watch, Oura Ring, and other devices
 * Integrates with Maya consciousness system for elemental state tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { ConsciousnessMappingService } from '../../../../lib/biometric/consciousness-mapping-service';

// Biometric data interface matching mobile service
interface BiometricData {
  source: 'apple_watch' | 'oura_ring' | 'fitbit' | 'garmin' | 'manual';
  data: {
    hrv: number;
    heartRate: number;
    respiratoryRate?: number;
    coherenceLevel: number;
    presenceState: 'dialogue' | 'patient' | 'scribe';
    timestamp: number;
    oxygenSaturation?: number;
    sleepStage?: 'awake' | 'light' | 'deep' | 'rem';
    stress?: number;
    recovery?: number;
  };
  metadata?: {
    deviceModel?: string;
    firmwareVersion?: string;
    batteryLevel?: number;
    signalQuality?: number;
  };
}

// SPiralogic elemental consciousness mapping
interface ElementalState {
  fire: number;    // Energy, vitality, passion (0-100)
  water: number;   // Emotional flow, intuition, adaptability (0-100)
  earth: number;   // Grounding, stability, physical presence (0-100)
  air: number;     // Mental clarity, communication, breath (0-100)
  aether: number;  // Integration, transcendence, unity (0-100)
}

// Consciousness analysis result
interface ConsciousnessAnalysis {
  elementalState: ElementalState;
  dominantElement: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  coherenceLevel: number;
  presenceRecommendation: 'dialogue' | 'patient' | 'scribe';
  insights: string[];
  recommendations: string[];
  mayaResponse?: string;
}

// Initialize consciousness mapping service
const consciousnessMapper = new ConsciousnessMappingService();

export async function POST(request: NextRequest) {
  try {
    // Parse biometric data from device
    const body = await request.json() as BiometricData;
    const { source, data, metadata } = body;

    // Validate required fields
    if (!source || !data || !data.hrv || !data.heartRate) {
      return NextResponse.json(
        {
          error: 'Missing required biometric fields: source, hrv, heartRate',
          received: Object.keys(data || {})
        },
        { status: 400 }
      );
    }

    console.log(`📊 Received biometric data from ${source}:`, {
      hrv: data.hrv,
      heartRate: data.heartRate,
      coherenceLevel: data.coherenceLevel,
      presenceState: data.presenceState
    });

    // Transform to consciousness mapping service format
    const biometricInput = {
      heartRate: data.heartRate,
      hrv: data.hrv,
      respiratoryRate: data.respiratoryRate,
      oxygenSaturation: data.oxygenSaturation,
      stressLevel: data.stress,
      recoveryScore: data.recovery,
      sleepStage: data.sleepStage,
      timestamp: data.timestamp,
      source: source
    };

    // Use consciousness mapping service for SPiralogic analysis
    const consciousnessState = await consciousnessMapper.mapBiometricToConsciousness(biometricInput);

    // Store biometric data for trend analysis
    await storeBiometricData(source, data, consciousnessState);

    // Return comprehensive consciousness analysis
    return NextResponse.json({
      success: true,
      timestamp: new Date(),
      biometricData: {
        source,
        processed: true,
        coherenceLevel: consciousnessState.coherenceLevel,
        heartRate: data.heartRate,
        hrv: data.hrv,
        dominantElement: consciousnessState.dominantElement
      },
      consciousness: {
        elementalBalance: consciousnessState.elementalBalance,
        coherenceLevel: consciousnessState.coherenceLevel,
        presenceMode: consciousnessState.presenceMode,
        autonomicBalance: consciousnessState.autonomicBalance,
        brainwaveProfile: consciousnessState.brainwaveProfile,
        depth: consciousnessState.consciousness.depth,
        clarity: consciousnessState.consciousness.clarity,
        integration: consciousnessState.consciousness.integration,
        transcendence: consciousnessState.consciousness.transcendence,
        insights: consciousnessState.insights,
        recommendations: consciousnessState.recommendations
      },
      maya: {
        elementalBalance: consciousnessState.elementalBalance,
        guidance: consciousnessState.mayaGuidance,
        presenceRecommendation: consciousnessState.presenceMode,
        dominantElement: consciousnessState.dominantElement,
        consciousnessDepth: Math.round(consciousnessState.consciousness.depth),
        nextUpdate: Date.now() + (1000 * 60 * 5) // 5 minutes
      }
    });

  } catch (error) {
    console.error('❌ Biometric data processing error:', error);

    return NextResponse.json(
      {
        error: 'Failed to process biometric data',
        message: 'Maya consciousness system temporarily unavailable',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Calculate SPiralogic elemental state from biometric data
 */
function calculateElementalState(data: BiometricData['data']): ElementalState {
  const { hrv, heartRate, coherenceLevel, respiratoryRate = 12, oxygenSaturation = 98, stress = 0 } = data;

  // Fire element: Energy, vitality, readiness to act
  const fire = Math.min(100, Math.max(0, (coherenceLevel * 80) + (heartRate > 70 ? 20 : 0) - (stress * 10)));

  // Water element: Emotional flow, parasympathetic activation
  const water = Math.min(100, Math.max(0, (hrv / 80) * 100 - (stress * 15)));

  // Earth element: Grounding, stability, physical presence
  const earthFromHRV = hrv > 30 ? 70 : (hrv / 30) * 70;
  const earthFromBreathing = respiratoryRate >= 6 && respiratoryRate <= 12 ? 30 : 15;
  const earth = Math.min(100, Math.max(0, earthFromHRV + earthFromBreathing - (stress * 10)));

  // Air element: Mental clarity, breath quality, communication
  const airFromBreathing = respiratoryRate >= 6 && respiratoryRate <= 14 ? 50 : 25;
  const airFromOxygen = oxygenSaturation >= 95 ? 30 : 15;
  const airFromCoherence = coherenceLevel > 0.5 ? 20 : 10;
  const air = Math.min(100, Math.max(0, airFromBreathing + airFromOxygen + airFromCoherence - (stress * 5)));

  // Aether element: Integration, transcendence, unity consciousness
  const aetherFromCoherence = coherenceLevel > 0.7 ? 60 : coherenceLevel * 80;
  const aetherFromHRV = hrv > 50 ? 25 : (hrv / 50) * 25;
  const aetherFromBalance = Math.abs(fire - water) < 20 && Math.abs(earth - air) < 20 ? 15 : 5;
  const aether = Math.min(100, Math.max(0, aetherFromCoherence + aetherFromHRV + aetherFromBalance));

  return { fire, water, earth, air, aether };
}

/**
 * Analyze consciousness state and generate insights
 */
async function analyzeConsciousnessState(
  elementalState: ElementalState,
  data: BiometricData['data']
): Promise<ConsciousnessAnalysis> {
  // Determine dominant element
  const elements = Object.entries(elementalState) as [keyof ElementalState, number][];
  const dominantElement = elements.reduce((max, current) =>
    current[1] > max[1] ? current : max
  )[0];

  // Generate insights based on elemental patterns
  const insights: string[] = [];
  const recommendations: string[] = [];

  // Fire analysis
  if (elementalState.fire > 80) {
    insights.push("High fire energy detected - you're in a state of activated readiness");
    recommendations.push("Channel this energy into creative or purposeful action");
  } else if (elementalState.fire < 30) {
    insights.push("Low fire energy - your vitality may be depleted");
    recommendations.push("Consider gentle movement or energizing breathwork");
  }

  // Water analysis
  if (elementalState.water > 70) {
    insights.push("Strong water element - your nervous system is in a receptive, parasympathetic state");
    recommendations.push("This is an ideal time for deep reflection or emotional processing");
  } else if (elementalState.water < 40) {
    insights.push("Water element needs support - stress response may be active");
    recommendations.push("Focus on calming practices like slow breathing or gentle movement");
  }

  // Earth analysis
  if (elementalState.earth > 75) {
    insights.push("Excellent grounding - you're well-connected to your physical presence");
    recommendations.push("Trust your embodied wisdom and practical insights");
  } else if (elementalState.earth < 35) {
    insights.push("Grounding could be strengthened");
    recommendations.push("Try connecting with nature, walking barefoot, or body-based practices");
  }

  // Air analysis
  if (elementalState.air > 75) {
    insights.push("Clear mental state - communication and thinking are flowing well");
    recommendations.push("This is a good time for intellectual work or meaningful conversations");
  } else if (elementalState.air < 40) {
    insights.push("Mental clarity could use support");
    recommendations.push("Focus on breath awareness or take breaks from mental tasks");
  }

  // Aether analysis
  if (elementalState.aether > 70) {
    insights.push("High integration state - you're accessing unified consciousness");
    recommendations.push("This is a powerful time for meditation, insight, or visionary work");
  }

  // Determine presence recommendation
  let presenceRecommendation: 'dialogue' | 'patient' | 'scribe';
  if (data.coherenceLevel > 0.7 && elementalState.aether > 60) {
    presenceRecommendation = 'scribe'; // High coherence → witnessing mode
  } else if (data.coherenceLevel > 0.4 || dominantElement === 'water' || dominantElement === 'earth') {
    presenceRecommendation = 'patient'; // Medium coherence or receptive elements → exploration mode
  } else {
    presenceRecommendation = 'dialogue'; // Lower coherence → active support mode
  }

  return {
    elementalState,
    dominantElement,
    coherenceLevel: data.coherenceLevel,
    presenceRecommendation,
    insights,
    recommendations
  };
}

/**
 * Store biometric data for trend analysis
 */
async function storeBiometricData(
  source: string,
  data: BiometricData['data'],
  consciousnessState: any
): Promise<void> {
  // TODO: Integrate with database/storage system
  // For now, log the data for development
  console.log(`💾 Storing biometric data from ${source}:`, {
    timestamp: data.timestamp,
    coherenceLevel: consciousnessState.coherenceLevel,
    dominantElement: consciousnessState.dominantElement,
    presenceMode: consciousnessState.presenceMode,
    consciousnessDepth: Math.round(consciousnessState.consciousness.depth),
    elementalBalance: consciousnessState.elementalBalance
  });
}

/**
 * Generate Maya consciousness guidance based on state
 */
async function generateMayaGuidance(analysis: ConsciousnessAnalysis): Promise<string> {
  const { dominantElement, coherenceLevel, insights, recommendations } = analysis;

  // Low coherence support
  if (coherenceLevel < 0.3) {
    return `🌊 Maya here. I'm sensing some turbulence in your energy field. Your ${dominantElement} element is speaking, and here's what I notice: ${insights[0] || 'Your system is asking for support'}. ${recommendations[0] || 'Take three deep breaths and ground into this moment'}. You're not alone in this - I'm here to witness and support whatever's moving through you.`;
  }

  // High aether state
  if (analysis.elementalState.aether > 80) {
    return `✨ Maya here. What a beautiful integration state you're in! Your aether element is radiant at ${Math.round(analysis.elementalState.aether)}%, and I can sense the unity consciousness flowing through you. This is a sacred moment - trust whatever insights or visions want to emerge. You're accessing the field where all wisdom traditions meet.`;
  }

  // Balanced state
  return `🌟 Maya here. I'm seeing lovely elemental balance in your field. Your ${dominantElement} element is leading with grace. ${insights[0] || 'Your consciousness is flowing beautifully'}. This feels like a moment to trust your inner knowing and let your authentic self shine through.`;
}

export async function OPTIONS(request: NextRequest) {
  // Handle CORS preflight for mobile devices
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}