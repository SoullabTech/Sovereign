/**
 * SHIFt Narrative API
 * 
 * Generates oracular narratives for individual, group, and collective levels
 * using the SHIFt elemental framework.
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import { CollectiveIntelligence, collective, Logger, PatternRecognitionEngine, SHIFtNarrativeService, SHIFtInferenceService } from '@/lib/stubs/CollectiveIntelligence';
// Temporarily stub out backend imports that are excluded from build
// import { SHIFtNarrativeService } from '@/backend/src/services/SHIFtNarrativeService';
// Temporarily stub out backend imports that are excluded from build
// import { SHIFtInferenceService } from '@/backend/src/services/SHIFtInferenceService';
// import { CollectiveIntelligence } from '@/lib/stubs/CollectiveIntelligence'; // Using from _stubs
// Temporarily stub out backend imports that are excluded from build
// import { logger } from '@/backend/src/utils/logger';
import { z } from 'zod';
import type { ElementalSignature, ArchetypeMap } from '@/lib/stubs/CollectiveIntelligence';

// Use logger from imported stubs
const logger: Logger = {
  info: (msg: any, meta?: any) => console.info(`[SHIFtNarrative] ${msg}`, meta),
  error: (msg: any, error?: any, meta?: any) => console.error(`[SHIFtNarrative] ${msg}`, error, meta),
  warn: (msg: any, meta?: any) => console.warn(`[SHIFtNarrative] ${msg}`, meta),
  debug: (msg: any, meta?: any) => console.debug(`[SHIFtNarrative] ${msg}`, meta)
};

// Helper functions
function getTopElement(signature: ElementalSignature): string {
  const elements = Object.entries(signature) as [keyof ElementalSignature, number][];
  return elements.reduce((a, b) => signature[a[0]] > signature[b[0]] ? a : b)[0];
}

function getTopArchetype(archetype: ArchetypeMap): string {
  const archetypes = Object.entries(archetype) as [keyof ArchetypeMap, number][];
  return archetypes.reduce((a, b) => archetype[a[0]] > archetype[b[0]] ? a : b)[0];
}

// Request schemas
const IndividualNarrativeSchema = z.object({
  userId: z.string(),
  length: z.enum(['short', 'medium', 'long']).optional()
});

const GroupNarrativeSchema = z.object({
  groupId: z.string(),
  participantIds: z.array(z.string()).optional(),
  length: z.enum(['short', 'medium', 'long']).optional()
});

const CollectiveNarrativeSchema = z.object({
  window: z.string().optional().default('7d'),
  length: z.enum(['short', 'medium', 'long']).optional()
});

const NarrativeRequestSchema = z.object({
  scope: z.enum(['individual', 'group', 'collective']),
  params: z.union([
    IndividualNarrativeSchema,
    GroupNarrativeSchema,
    CollectiveNarrativeSchema
  ])
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request
    const parsed = NarrativeRequestSchema.parse(body);
    const { scope, params } = parsed;

    const narrativeService = SHIFtNarrativeService.getInstance();
    
    switch (scope) {
      case 'individual': {
        const { userId, length = 'medium' } = params as z.infer<typeof IndividualNarrativeSchema>;
        
        // Get user&apos;s SHIFt profile
        const inferenceService = new SHIFtInferenceService();
        const profile = await inferenceService.compute({ userId });
        
        if (!profile) {
          return NextResponse.json(
            { error: 'User profile not found' },
            { status: 404 }
          );
        }

        const narrative = await narrativeService.generateIndividual(profile, length);
        
        return NextResponse.json({
          success: true,
          narrative: {
            ...narrative,
            // Convert narrative segments to readable format
            text: formatNarrativeText(narrative.narrative),
            practice: narrative.practice
          }
        });
      }

      case 'group': {
        const { groupId, participantIds, length = 'medium' } = params as z.infer<typeof GroupNarrativeSchema>;
        
        // In production, this would aggregate participant profiles
        // For now, generate a sample group snapshot
        const groupSnapshot = await generateGroupSnapshot(groupId, participantIds);
        
        const narrative = narrativeService.generateGroup(groupSnapshot, groupId, length);
        
        return NextResponse.json({
          success: true,
          narrative: {
            ...narrative,
            text: formatNarrativeText(narrative.narrative)
          }
        });
      }

      case 'collective': {
        const { window, length = 'medium' } = params as z.infer<typeof CollectiveNarrativeSchema>;
        
        // Get collective patterns from AIN
        const collectiveIntelligence = new CollectiveIntelligence();
        const patterns = collectiveIntelligence.getActivePatterns();
        
        // Convert to narrative service format
        const collectivePatterns = patterns.map(p => ({
          type: p.type as any,
          data: {
            element: getTopElement(p.elementalSignature) as any,
            archetype: getTopArchetype(p.archetypeInvolvement)
          },
          strength: p.strength || 0.5,
          participantCount: p.participants?.length || 0,
          confidence: p.confidence || 0.7,
          description: `${p.type} pattern affecting ${p.participants?.length || 0} participants`
        }));
        
        // Detect current phase from patterns
        const phase = detectCollectivePhase(collectivePatterns);
        
        const narrative = narrativeService.generateCollective(collectivePatterns, phase, length);
        
        return NextResponse.json({
          success: true,
          narrative: {
            ...narrative,
            text: formatNarrativeText(narrative.narrative)
          }
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid scope' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.error('Error generating narrative:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate narrative' },
      { status: 500 }
    );
  }
}

// Helper functions

function formatNarrativeText(narrative: { opening: string; insights: any[]; closing: string }): string {
  const insightText = narrative.insights
    .map(i => i.narrative)
    .join(' ');
  
  return `${narrative.opening}\n\n${insightText}\n\n${narrative.closing}`;
}

async function generateGroupSnapshot(groupId: string, participantIds?: string[]): Promise<any> {
  // In production, this would aggregate real participant data
  // For now, return a sample snapshot
  return {
    groupId,
    date: new Date(),
    elementMeans: {
      fire: 65,
      earth: 55,
      water: 70,
      air: 60,
      aether: 62,
      confidence: 0.8
    },
    facetMeans: {},
    coherence: 0.75,
    coherenceScore: 0.75,
    participantCount: participantIds?.length || 10,
    dominantPhase: 'collaboration',
    dominantElement: 'water',
    lowestElement: 'earth',
    imbalanceScore: 0.3,
    emergingPatterns: ['emotional resonance', 'collective visioning']
  };
}

function detectCollectivePhase(patterns: any[]): string {
  // Simple phase detection based on patterns
  const phasePatterns = patterns.filter(p => p.type === 'integration_phase');
  if (phasePatterns.length > 0 && phasePatterns[0].data.phase) {
    return phasePatterns[0].data.phase;
  }
  
  // Default phases based on pattern types
  if (patterns.some(p => p.type === 'elemental_wave' && p.data.element === 'fire')) {
    return 'Initiation';
  } else if (patterns.some(p => p.type === 'shadow_pattern')) {
    return 'Transformation';
  }
  
  return 'Collaboration';
}