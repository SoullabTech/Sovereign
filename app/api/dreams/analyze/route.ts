import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { betaSession } from '@/lib/auth/betaSession';
import { DreamWeaverEngine } from '@/app/api/backend/src/oracle/core/DreamWeaverEngine';

const prisma = new PrismaClient();

// Dream Analysis API - Real-time archetypal analysis and wisdom emergence detection
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
    const { dreamId, content, analysisType = 'comprehensive' } = body;

    let dreamContent: string;
    let existingDream: any = null;

    // Get dream content - either from existing dream or new content
    if (dreamId) {
      existingDream = await prisma.dreamMemory.findFirst({
        where: { id: dreamId, userId: user.id }
      });

      if (!existingDream) {
        return NextResponse.json(
          { error: 'Dream not found' },
          { status: 404 }
        );
      }

      dreamContent = existingDream.content;
    } else if (content) {
      dreamContent = content;
    } else {
      return NextResponse.json(
        { error: 'Either dreamId or content must be provided' },
        { status: 400 }
      );
    }

    // Initialize DreamWeaver Engine
    const dreamWeaver = new DreamWeaverEngine();

    // Perform analysis based on type
    let analysis: any = {};

    switch (analysisType) {
      case 'archetypal':
        analysis = await performArchetypalAnalysis(dreamWeaver, dreamContent);
        break;

      case 'wisdom_emergence':
        analysis = await performWisdomEmergenceAnalysis(dreamWeaver, dreamContent, user.id);
        break;

      case 'shadow_work':
        analysis = await performShadowWorkAnalysis(dreamWeaver, dreamContent);
        break;

      case 'pattern_recognition':
        analysis = await performPatternRecognition(dreamWeaver, dreamContent, user.id);
        break;

      case 'comprehensive':
      default:
        analysis = await performComprehensiveAnalysis(dreamWeaver, dreamContent, user.id);
        break;
    }

    // Update existing dream with new analysis if dreamId provided
    if (dreamId && existingDream) {
      await prisma.dreamMemory.update({
        where: { id: dreamId },
        data: {
          wisdomEmergenceSignals: analysis.wisdomEmergence || existingDream.wisdomEmergenceSignals,
          elementalPatterns: analysis.elementalPatterns || existingDream.elementalPatterns,
          consciousnessDepth: analysis.depthScore || existingDream.consciousnessDepth,
          transformationMarkers: analysis.transformationMarkers || existingDream.transformationMarkers,
          wisdomExtracted: analysis.extractedWisdom || existingDream.wisdomExtracted,
          lastAnalyzed: new Date()
        }
      });
    }

    console.log('✨ Dream analysis completed:', {
      userId: user.id,
      dreamId: dreamId || 'new_content',
      analysisType,
      archetypes: analysis.archetypes?.length || 0,
      wisdomEmergence: analysis.wisdomEmergence ? 'detected' : 'none',
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      analysis,
      analysisType,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Dream analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Comprehensive multi-dimensional analysis
async function performComprehensiveAnalysis(dreamWeaver: any, content: string, userId: string) {
  const analysis = await dreamWeaver.analyzeDream({
    content,
    userId,
    analysisDepth: 'comprehensive'
  });

  return {
    // Jungian Archetypal Analysis
    archetypes: analysis.archetypes || [],
    archetypeStrengths: analysis.archetypeStrengths || {},
    shadowWork: analysis.shadowAspects || {},

    // Wisdom Emergence Detection
    wisdomEmergence: analysis.wisdomSignals || null,
    extractedWisdom: analysis.primaryWisdom || null,

    // Elemental Consciousness Patterns
    elementalPatterns: analysis.elementalPatterns || {},
    consciousnessDepth: analysis.depthScore || 0,

    // Transformation & Integration
    transformationMarkers: analysis.transformationIndicators || [],
    integrationOpportunities: analysis.integrationPaths || [],

    // Symbol Analysis
    symbols: analysis.dreamSymbols || [],
    symbolMeanings: analysis.symbolInterpretations || {},

    // Emotional Resonance
    emotionalLandscape: analysis.emotionalTone || {},
    energeticSignature: analysis.energeticPatterns || {},

    // Recommended Actions
    recommendations: analysis.actionableInsights || [],
    followUpQuestions: analysis.deepeningQuestions || []
  };
}

// Focused archetypal analysis using Jungian framework
async function performArchetypalAnalysis(dreamWeaver: any, content: string) {
  const analysis = await dreamWeaver.detectArchetypes(content);

  return {
    archetypes: analysis.primaryArchetypes || [],
    archetypeDetails: analysis.archetypeAnalysis || {},
    archetypeInteractions: analysis.archetypeRelationships || [],
    dominantArchetype: analysis.dominantArchetype || null,
    shadowArchetypes: analysis.shadowArchetypes || [],
    evolutionaryStage: analysis.archetypeEvolution || null,
    integrationGuidance: analysis.integrationAdvice || []
  };
}

// Wisdom emergence detection using DreamWeaver's proprietary system
async function performWisdomEmergenceAnalysis(dreamWeaver: any, content: string, userId: string) {
  const analysis = await dreamWeaver.detectWisdomEmergence({
    content,
    userId,
    includeBodyActivation: true,
    includeLanguageShift: true
  });

  return {
    wisdomEmergence: analysis.wisdomSignals || null,
    bodyActivation: analysis.bodyActivation || {},
    languageShift: analysis.languageShift || {},
    energyMarkers: analysis.energyMarkers || {},
    emergenceLevel: analysis.emergenceStrength || 0,
    extractedWisdom: analysis.emergentWisdom || null,
    integrationPath: analysis.integrationGuidance || []
  };
}

// Shadow work analysis for psychological integration
async function performShadowWorkAnalysis(dreamWeaver: any, content: string) {
  const analysis = await dreamWeaver.analyzeShadowAspects(content);

  return {
    shadowAspects: analysis.shadowElements || [],
    shadowProjections: analysis.projectedShadow || [],
    integrationOpportunities: analysis.shadowIntegration || [],
    resistancePatterns: analysis.resistanceIndicators || [],
    healingPathways: analysis.healingApproaches || [],
    shadowGifts: analysis.shadowWisdom || []
  };
}

// Pattern recognition across consciousness states
async function performPatternRecognition(dreamWeaver: any, content: string, userId: string) {
  // Get user's recent dreams for pattern analysis
  const recentDreams = await prisma.dreamMemory.findMany({
    where: {
      userId,
      timestamp: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      }
    },
    orderBy: { timestamp: 'desc' },
    take: 10,
    select: {
      content: true,
      archetypes: true,
      elementalPatterns: true,
      timestamp: true
    }
  });

  const analysis = await dreamWeaver.detectPatterns({
    currentContent: content,
    historicalDreams: recentDreams,
    patternTypes: ['archetypal', 'elemental', 'symbolic', 'temporal']
  });

  return {
    recurringPatterns: analysis.patterns || [],
    evolutionaryTrends: analysis.trends || [],
    consciousnessProgression: analysis.progression || {},
    cyclicalPatterns: analysis.cycles || [],
    emergentThemes: analysis.themes || [],
    patternStrength: analysis.patternCoherence || 0,
    recommendations: analysis.patternInsights || []
  };
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { message: 'Method not allowed. Use POST to analyze dreams.' },
    { status: 405 }
  );
}