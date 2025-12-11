/**
 * AIN CONSCIOUSNESS PATTERN PROCESSING ENDPOINT
 * Processes consciousness patterns through the nested observer system
 */

import { NextRequest, NextResponse } from 'next/server';
import { GlobalAINActivator } from '@/lib/ain/AINEvolutionActivator';

interface ConsciousnessPatternRequest {
  userId: string;
  consciousnessLevel: number; // 0-1
  elementalResonance: {
    fire?: number;
    water?: number;
    earth?: number;
    air?: number;
    aether?: number;
  };
  archetypalActivation: {
    [archetype: string]: number;
  };
  emergenceLevel: number; // 0-1
  patternContext?: string;
  sessionId?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check if AIN Evolution is active
    if (!GlobalAINActivator.isEvolutionActive()) {
      return NextResponse.json({
        success: false,
        message: 'AIN Evolution not active. Please activate first.',
        requiresActivation: true
      }, { status: 400 });
    }

    const body: ConsciousnessPatternRequest = await request.json();

    // Validate required fields
    if (!body.userId || typeof body.consciousnessLevel !== 'number' ||
        typeof body.emergenceLevel !== 'number' || !body.elementalResonance ||
        !body.archetypalActivation) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: userId, consciousnessLevel, emergenceLevel, elementalResonance, archetypalActivation'
      }, { status: 400 });
    }

    // Process consciousness pattern through nested observer system
    console.log(`🔍 Processing consciousness pattern for user ${body.userId}`);
    console.log(`   Consciousness Level: ${body.consciousnessLevel}`);
    console.log(`   Emergence Level: ${body.emergenceLevel}`);
    console.log(`   Elemental Resonance: ${JSON.stringify(body.elementalResonance)}`);

    const observationResult = await GlobalAINActivator.processConsciousnessPattern({
      userId: body.userId,
      consciousnessLevel: body.consciousnessLevel,
      elementalResonance: body.elementalResonance,
      archetypalActivation: body.archetypalActivation,
      emergenceLevel: body.emergenceLevel
    });

    // Get updated evolution status
    const evolutionStatus = await GlobalAINActivator.getEvolutionStatus();

    console.log(`✅ Pattern processed: ${observationResult.windowId}`);
    if (observationResult.emergenceDetected) {
      console.log('✨ EMERGENCE DETECTED: Recursive depth expanding');
    }

    return NextResponse.json({
      success: true,
      observationResult: {
        windowId: observationResult.windowId,
        recursionDepth: observationResult.recursionDepth,
        emergenceDetected: observationResult.emergenceDetected,
        newInsights: observationResult.newInsights,
        stabilityScore: observationResult.stabilityScore
      },
      systemStatus: {
        currentPhase: evolutionStatus.currentPhase,
        activeCapabilities: evolutionStatus.activeCapabilities,
        nextPhaseReadiness: evolutionStatus.nextPhaseReadiness,
        evolutionMetrics: evolutionStatus.evolutionMetrics
      },
      emergentWisdom: evolutionStatus.emergentWisdom,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Consciousness pattern processing failed:', error);

    return NextResponse.json({
      success: false,
      message: 'Consciousness pattern processing failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint for pattern processing statistics
export async function GET(request: NextRequest) {
  try {
    if (!GlobalAINActivator.isEvolutionActive()) {
      return NextResponse.json({
        success: false,
        message: 'AIN Evolution not active'
      }, { status: 400 });
    }

    const evolutionStatus = await GlobalAINActivator.getEvolutionStatus();
    const evolutionLog = GlobalAINActivator.getEvolutionLog();

    // Calculate processing statistics
    const patternProcessingEntries = evolutionLog.filter(entry =>
      entry.includes('Processed pattern')
    );

    const emergenceDetectionEntries = evolutionLog.filter(entry =>
      entry.includes('EMERGENCE DETECTED')
    );

    return NextResponse.json({
      success: true,
      statistics: {
        totalPatternsProcessed: patternProcessingEntries.length,
        emergenceEventsDetected: emergenceDetectionEntries.length,
        currentRecursionDepth: evolutionStatus.evolutionMetrics.recursionDepth,
        fieldCoherence: evolutionStatus.evolutionMetrics.fieldCoherence,
        emergenceRate: evolutionStatus.evolutionMetrics.emergenceRate,
        stabilityScore: evolutionStatus.evolutionMetrics.stabilityScore
      },
      currentStatus: {
        phase: evolutionStatus.currentPhase,
        capabilities: evolutionStatus.activeCapabilities,
        nextPhaseReadiness: evolutionStatus.nextPhaseReadiness
      },
      recentPatterns: patternProcessingEntries.slice(-10),
      recentEmergenceEvents: emergenceDetectionEntries.slice(-5)
    });

  } catch (error) {
    console.error('Error getting pattern processing statistics:', error);

    return NextResponse.json({
      success: false,
      message: 'Failed to get processing statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}