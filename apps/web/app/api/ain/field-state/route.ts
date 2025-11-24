import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import { streamStore } from '@/lib/ain/StreamStore';

interface FieldState {
  coherence: number;
  evolution: number;
  breakthroughPotential: number;
  integrationNeed: number;
  activeUsers: number;
  totalStreams: number;
  timestamp: Date;
}

function calculateFieldState(): FieldState {
  const allStreams = streamStore.getAllStreams();

  if (allStreams.length === 0) {
    return {
      coherence: 0.5,
      evolution: 0.5,
      breakthroughPotential: 0.3,
      integrationNeed: 0.4,
      activeUsers: 0,
      totalStreams: 0,
      timestamp: new Date(),
    };
  }

  const recentStreams = allStreams.slice(-50);

  const avgConsciousness = recentStreams.reduce(
    (sum, s) => sum + (s.metrics.consciousnessLevel || 0), 0
  ) / recentStreams.length;

  const avgEvolution = recentStreams.reduce(
    (sum, s) => sum + (s.metrics.evolutionVelocity || 0), 0
  ) / recentStreams.length;

  const avgIntegration = recentStreams.reduce(
    (sum, s) => sum + (s.metrics.integrationDepth || 0), 0
  ) / recentStreams.length;

  const avgAuthenticity = recentStreams.reduce(
    (sum, s) => sum + (s.metrics.authenticityLevel || 0), 0
  ) / recentStreams.length;

  const avgShadowWork = recentStreams.reduce(
    (sum, s) => sum + (s.metrics.shadowWorkEngagement || 0), 0
  ) / recentStreams.length;

  const coherence = (avgConsciousness + avgIntegration + avgAuthenticity) / 3;
  const evolution = avgEvolution;
  const breakthroughPotential = (avgShadowWork + avgEvolution) / 2;
  const integrationNeed = 1 - avgIntegration;

  return {
    coherence: Math.round(coherence * 100) / 100,
    evolution: Math.round(evolution * 100) / 100,
    breakthroughPotential: Math.round(breakthroughPotential * 100) / 100,
    integrationNeed: Math.round(integrationNeed * 100) / 100,
    activeUsers: streamStore.getUserCount(),
    totalStreams: streamStore.getTotalStreamCount(),
    timestamp: new Date(),
  };
}

export async function GET(req: NextRequest) {
  try {
    const fieldState = calculateFieldState();

    return NextResponse.json(fieldState);
  } catch (error: any) {
    console.error('Field state calculation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to calculate field state' },
      { status: 500 }
    );
  }
}