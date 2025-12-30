// @ts-nocheck - Prototype file, not type-checked
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { betaSession } from '@/lib/auth/betaSession';
import { DreamWeaverEngine } from '@/app/api/backend/src/oracle/core/DreamWeaverEngine';
import { DreamMemorySchema } from '@/app/api/backend/src/schemas/dreamMemory.schema';

const prisma = new PrismaClient();

// Dream Recording API - Integrates DreamWeaver Engine with Database
export async function POST(request: NextRequest) {
  try {
    const user = betaSession.getCurrentUser();
    if (!user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate dream content with existing schema
    const dreamValidation = DreamMemorySchema.safeParse(body);
    if (!dreamValidation.success) {
      return NextResponse.json(
        { error: 'Invalid dream data', details: dreamValidation.error.issues },
        { status: 400 }
      );
    }

    const dreamData = dreamValidation.data;

    // Initialize DreamWeaver Engine for wisdom emergence analysis
    const dreamWeaver = new DreamWeaverEngine();

    // Perform comprehensive dream analysis
    const analysis = await dreamWeaver.analyzeDream({
      content: dreamData.content,
      emotionalTone: dreamData.emotionalTone,
      symbols: dreamData.dreamSymbols,
      userId: user.id
    });

    // Record dream in database with DreamWeaver insights
    const dreamMemory = await prisma.dreamMemory.create({
      data: {
        userId: user.id,
        content: dreamData.content,
        type: dreamData.type,
        lucidityLevel: dreamData.lucidityLevel || 0,
        vividnessScore: dreamData.vividnessScore || 0,
        emotionalIntensity: dreamData.emotionalIntensity || 0,

        // Jungian Archetypal Analysis
        archetypes: dreamData.archetypes,
        dreamSymbols: dreamData.dreamSymbols,
        emotionalTone: dreamData.emotionalTone,
        shadowAspects: dreamData.shadowAspects,

        // DreamWeaver Engine Analysis
        wisdomEmergenceSignals: analysis.wisdomSignals,
        elementalPatterns: analysis.elementalPatterns,
        consciousnessDepth: analysis.depthScore,
        transformationMarkers: analysis.transformationIndicators,

        // Spiral Dynamics Phase
        spiralPhase: dreamData.spiralPhase,

        // Sleep Context
        sleepQuality: dreamData.sleepQuality,
        timeInBed: dreamData.timeInBed,
        wakeTime: dreamData.wakeTime,
        moonPhase: dreamData.moonPhase,
        circadianPhase: dreamData.circadianPhase,

        // Environment
        location: dreamData.location,
        temperature: dreamData.temperature,
        soundscape: dreamData.soundscape,

        // Integration tracking
        integrationLevel: 0, // Initial
        wisdomExtracted: analysis.primaryWisdom || null,
        followUpNeeded: analysis.requiresFollowUp || false,

        // Metadata
        recordedAt: new Date(),
        deviceType: request.headers.get('user-agent')?.includes('Mobile') ? 'mobile' : 'desktop'
      }
    });

    // Create cross-consciousness correlations
    await createConsciousnessCorrelations(user.id, dreamMemory.id, analysis);

    // Log successful dream recording
    console.log('✨ Dream recorded successfully:', {
      userId: user.id,
      dreamId: dreamMemory.id,
      archetypes: dreamData.archetypes,
      wisdomEmergence: analysis.wisdomSignals?.bodyActivation ? 'detected' : 'none',
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      dreamId: dreamMemory.id,
      analysis: {
        archetypes: dreamData.archetypes,
        wisdomEmergence: analysis.wisdomSignals,
        elementalPatterns: analysis.elementalPatterns,
        transformationLevel: analysis.depthScore,
        primaryWisdom: analysis.primaryWisdom
      },
      message: 'Dream recorded and analyzed successfully'
    });

  } catch (error) {
    console.error('Dream recording error:', error);
    return NextResponse.json(
      { error: 'Failed to record dream', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Create consciousness correlations between dreams and other MAIA data
async function createConsciousnessCorrelations(
  userId: string,
  dreamId: string,
  analysis: any
) {
  try {
    // Link to recent elemental states
    const recentElementalStates = await prisma.elementalState.findMany({
      where: {
        userId,
        timestamp: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 10
    });

    // Create dream-consciousness correlations
    for (const elementalState of recentElementalStates) {
      await prisma.dreamConsciousnessCorrelation.create({
        data: {
          dreamId,
          relatedType: 'elemental_state',
          relatedId: elementalState.id,
          correlationStrength: calculateCorrelationStrength(analysis, elementalState),
          correlationMetrics: {
            elementalAlignment: analysis.elementalPatterns,
            temporalProximity: calculateTemporalProximity(new Date(), elementalState.timestamp),
            thematicResonance: calculateThematicResonance(analysis, elementalState)
          }
        }
      });
    }

    // Link to recent MAIA memories for pattern detection
    const recentMemories = await prisma.mAIAMemory.findMany({
      where: {
        userId,
        timestamp: {
          gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // Last 3 days
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 5
    });

    for (const memory of recentMemories) {
      await prisma.dreamConsciousnessCorrelation.create({
        data: {
          dreamId,
          relatedType: 'maia_memory',
          relatedId: memory.id,
          correlationStrength: calculateMemoryCorrelation(analysis, memory),
          correlationMetrics: {
            thematicOverlap: calculateThematicOverlap(analysis, memory),
            temporalProximity: calculateTemporalProximity(new Date(), memory.timestamp)
          }
        }
      });
    }

  } catch (error) {
    console.error('Consciousness correlation creation failed:', error);
    // Don't fail the main request for correlation errors
  }
}

// Helper functions for correlation analysis
function calculateCorrelationStrength(dreamAnalysis: any, elementalState: any): number {
  // Sophisticated correlation algorithm based on elemental patterns
  let strength = 0.0;

  if (dreamAnalysis.elementalPatterns && elementalState.pathway) {
    if (dreamAnalysis.elementalPatterns.dominant === elementalState.pathway) {
      strength += 0.4;
    }
    if (dreamAnalysis.elementalPatterns.secondary === elementalState.pathway) {
      strength += 0.2;
    }
  }

  return Math.min(1.0, strength);
}

function calculateTemporalProximity(dreamTime: Date, eventTime: Date): number {
  const timeDiffHours = Math.abs(dreamTime.getTime() - eventTime.getTime()) / (1000 * 60 * 60);
  return Math.max(0, 1 - (timeDiffHours / (24 * 7))); // Decays over 7 days
}

function calculateThematicResonance(dreamAnalysis: any, elementalState: any): number {
  // Compare thematic elements between dream and elemental state
  return 0.5; // Placeholder for sophisticated thematic analysis
}

function calculateMemoryCorrelation(dreamAnalysis: any, memory: any): number {
  // Analyze correlation between dream content and MAIA memory patterns
  return 0.3; // Placeholder for sophisticated memory correlation
}

function calculateThematicOverlap(dreamAnalysis: any, memory: any): number {
  // Calculate thematic overlap between dream symbols and memory content
  return 0.4; // Placeholder for sophisticated thematic overlap analysis
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { message: 'Method not allowed. Use POST to record dreams.' },
    { status: 405 }
  );
}