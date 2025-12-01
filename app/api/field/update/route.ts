import { NextRequest, NextResponse } from 'next/server';

interface FieldVector {
  // Frequency components (Hz)
  fx: number; // Cognitive frequency
  fy: number; // Emotional frequency
  fz: number; // Somatic frequency

  // Amplitude components (normalized 0-1)
  ax: number; // Cognitive amplitude
  ay: number; // Emotional amplitude
  az: number; // Somatic amplitude

  // Phase components (degrees)
  phx: number; // Cognitive phase
  phy: number; // Emotional phase
  phz: number; // Somatic phase
}

interface FieldUpdateRequest {
  userId: string;
  sessionId: string;
  fieldVector: FieldVector;
  timestamp?: number;
  metadata?: {
    source?: string;
    confidence?: number;
    userInput?: string;
  };
}

interface FieldMetrics {
  coherence: number;
  stability: number;
  amplitudeVariance: number;
  frequencyDrift: number;
  interventionRecommended: boolean;
  interventionType?: string;
  supportLevel: number;
  engagementLevel: number;
}

// Calculate field coherence using the equation from the documentation:
// C(t) = cos(φ_cognitive - φ_emotional) × cos(φ_emotional - φ_somatic) × cos(φ_somatic - φ_cognitive)
function calculateCoherence(field: FieldVector): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const phCogRad = toRadians(field.phx);
  const phEmoRad = toRadians(field.phy);
  const phSomRad = toRadians(field.phz);

  const coherence =
    Math.cos(phCogRad - phEmoRad) *
    Math.cos(phEmoRad - phSomRad) *
    Math.cos(phSomRad - phCogRad);

  return coherence;
}

function calculateStability(field: FieldVector): number {
  // Stability based on frequency and amplitude consistency
  const freqStdev = calculateStandardDeviation([field.fx, field.fy, field.fz]);
  const ampStdev = calculateStandardDeviation([field.ax, field.ay, field.az]);

  // Lower standard deviation = higher stability
  const freqStability = Math.max(0, 1 - (freqStdev / 10));
  const ampStability = Math.max(0, 1 - (ampStdev / 0.5));

  return (freqStability + ampStability) / 2;
}

function calculateAmplitudeVariance(field: FieldVector): number {
  const mean = (field.ax + field.ay + field.az) / 3;
  const variance =
    Math.pow(field.ax - mean, 2) +
    Math.pow(field.ay - mean, 2) +
    Math.pow(field.az - mean, 2);

  return (Math.sqrt(variance / 3) / mean) * 100;
}

function calculateFrequencyDrift(field: FieldVector): number {
  const mean = (field.fx + field.fy + field.fz) / 3;
  const maxDrift = Math.max(
    Math.abs(field.fx - mean),
    Math.abs(field.fy - mean),
    Math.abs(field.fz - mean)
  );

  return maxDrift;
}

function calculateStandardDeviation(values: number[]): number {
  const mean = values.reduce((a, b) => a + b) / values.length;
  const squareDiffs = values.map(value => Math.pow(value - mean, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b) / values.length;
  return Math.sqrt(avgSquareDiff);
}

function calculateSupportLevel(coherence: number, stability: number): number {
  // Support level based on how much assistance the field needs
  // Lower coherence and stability = higher support needed
  const needFactor = 1 - ((coherence + 1) / 2 * stability);
  return Math.max(0, Math.min(1, needFactor));
}

function calculateEngagementLevel(field: FieldVector, coherence: number): number {
  // Engagement based on overall field activity and coherence
  const avgAmplitude = (field.ax + field.ay + field.az) / 3;
  const avgFrequency = (field.fx + field.fy + field.fz) / 3;

  // Normalize frequency (typical range 0-20 Hz)
  const normalizedFreq = Math.min(1, avgFrequency / 20);

  // Higher coherence + moderate activity = higher engagement
  const engagement = (coherence + 1) / 2 * 0.4 + avgAmplitude * 0.3 + normalizedFreq * 0.3;

  return Math.max(0, Math.min(1, engagement));
}

function analyzeFieldMetrics(field: FieldVector): FieldMetrics {
  const coherence = calculateCoherence(field);
  const stability = calculateStability(field);
  const amplitudeVariance = calculateAmplitudeVariance(field);
  const frequencyDrift = calculateFrequencyDrift(field);

  // Intervention recommendations based on thresholds from documentation
  const interventionRecommended =
    coherence < 0.3 ||
    amplitudeVariance > 40 ||
    stability < 0.4 ||
    frequencyDrift > 5;

  let interventionType: string | undefined;
  if (interventionRecommended) {
    if (coherence < 0.3) {
      interventionType = 'Coherence Restoration Protocol';
    } else if (amplitudeVariance > 40) {
      interventionType = 'Amplitude Stabilization Protocol';
    } else if (stability < 0.4) {
      interventionType = 'Field Stabilization Protocol';
    } else if (frequencyDrift > 5) {
      interventionType = 'Frequency Alignment Protocol';
    }
  }

  const supportLevel = calculateSupportLevel(coherence, stability);
  const engagementLevel = calculateEngagementLevel(field, coherence);

  return {
    coherence,
    stability,
    amplitudeVariance,
    frequencyDrift,
    interventionRecommended,
    interventionType,
    supportLevel,
    engagementLevel
  };
}

export async function POST(request: NextRequest) {
  try {
    const data: FieldUpdateRequest = await request.json();

    // Validate required fields
    if (!data.userId || !data.fieldVector) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and fieldVector' },
        { status: 400 }
      );
    }

    // Validate field vector components
    const { fieldVector } = data;
    const requiredComponents = ['fx', 'fy', 'fz', 'ax', 'ay', 'az', 'phx', 'phy', 'phz'];
    const missingComponents = requiredComponents.filter(comp =>
      fieldVector[comp as keyof FieldVector] === undefined
    );

    if (missingComponents.length > 0) {
      return NextResponse.json(
        { error: `Missing field vector components: ${missingComponents.join(', ')}` },
        { status: 400 }
      );
    }

    // Analyze field metrics
    const metrics = analyzeFieldMetrics(fieldVector);

    // Store field data (in a real implementation, this would go to a database)
    const fieldRecord = {
      userId: data.userId,
      sessionId: data.sessionId,
      fieldVector: fieldVector,
      metrics: metrics,
      timestamp: data.timestamp || Date.now(),
      metadata: data.metadata
    };

    // Log field update for monitoring
    console.log(`[PFI] Field update for user ${data.userId}:`, {
      coherence: metrics.coherence.toFixed(3),
      stability: metrics.stability.toFixed(3),
      support: metrics.supportLevel.toFixed(3),
      engagement: metrics.engagementLevel.toFixed(3),
      intervention: metrics.interventionRecommended ? metrics.interventionType : 'None'
    });

    // Return analysis results
    return NextResponse.json({
      success: true,
      fieldId: `field_${Date.now()}`,
      metrics: metrics,
      recommendations: {
        intervention: metrics.interventionRecommended,
        type: metrics.interventionType,
        priority: metrics.coherence < 0.2 ? 'high' :
                 metrics.coherence < 0.5 ? 'medium' : 'low'
      },
      timestamp: fieldRecord.timestamp
    });

  } catch (error) {
    console.error('[PFI] Field update error:', error);
    return NextResponse.json(
      { error: 'Failed to process field update' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter required' },
        { status: 400 }
      );
    }

    // In a real implementation, retrieve from database
    // For now, return sample data structure
    return NextResponse.json({
      success: true,
      userId: userId,
      sessionId: sessionId,
      currentMetrics: {
        coherence: 0.75,
        stability: 0.68,
        supportLevel: 0.42,
        engagementLevel: 0.83,
        lastUpdate: Date.now()
      },
      fieldHistory: [],
      interventionHistory: []
    });

  } catch (error) {
    console.error('[PFI] Field retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve field data' },
      { status: 500 }
    );
  }
}