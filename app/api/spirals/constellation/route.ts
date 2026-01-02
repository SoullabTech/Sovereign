/**
 * 🌌 SPIRAL CONSTELLATION API
 *
 * Dedicated endpoint for spiral constellation visualization and management.
 * Provides constellation data for the MySpiralsDashboard and ConstellationVisualizer.
 */

import { NextRequest, NextResponse } from 'next/server';
import { spiralConstellationService } from '@/lib/services/spiral-constellation';
import { getSessionUserId } from '@/lib/auth/session-utils';

// Skip during static export (Capacitor builds)
export const dynamic = 'force-dynamic';

// ==============================================================================
// GET - Retrieve Spiral Constellation
// ==============================================================================

export async function GET(request: NextRequest) {
  try {
    const userId = await getSessionUserId(request);
    if (!userId) {
      return NextResponse.json({
        error: 'Authentication required for constellation access',
        timestamp: new Date().toISOString()
      }, { status: 401 });
    }

    const url = new URL(request.url);
    const exposureLevel = url.searchParams.get('exposure') || 'standard';
    const includePatterns = url.searchParams.get('patterns') === 'true';

    // Get full constellation from service
    const constellation = await spiralConstellationService.getConstellationForMember(userId);

    // Apply visibility filtering based on member readiness
    const visibleConstellation = filterConstellationByExposure(constellation, exposureLevel, includePatterns);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: visibleConstellation,
      metadata: {
        exposureLevel,
        includePatterns,
        spiralCount: constellation.activeSpirals.length,
        constellationHealth: constellation.constellationHealth,
        harmonicCoherence: constellation.overallHarmonicCoherence
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error retrieving spiral constellation:', error);
    return NextResponse.json({
      error: 'Failed to retrieve spiral constellation',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// ==============================================================================
// POST - Update Constellation from Episode
// ==============================================================================

export async function POST(request: NextRequest) {
  try {
    const userId = await getSessionUserId(request);
    if (!userId) {
      return NextResponse.json({
        error: 'Authentication required',
        timestamp: new Date().toISOString()
      }, { status: 401 });
    }

    const body = await request.json();
    const { spiralId, episodeData } = body;

    if (!spiralId || !episodeData) {
      return NextResponse.json({
        error: 'Missing required parameters: spiralId, episodeData',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Update constellation based on new episode
    await spiralConstellationService.updateConstellationFromEpisode(
      userId,
      spiralId,
      episodeData
    );

    // Return updated constellation
    const updatedConstellation = await spiralConstellationService.getConstellationForMember(userId);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        message: 'Constellation updated successfully',
        updatedConstellation: filterConstellationByExposure(updatedConstellation, 'standard', false),
        spiralId,
        episodeId: episodeData.id
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error updating constellation:', error);
    return NextResponse.json({
      error: 'Failed to update constellation',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// ==============================================================================
// VISIBILITY FILTERING
// ==============================================================================

function filterConstellationByExposure(
  constellation: any,
  exposureLevel: string,
  includePatterns: boolean
) {
  switch (exposureLevel) {
    case 'minimal':
      return {
        memberId: constellation.memberId,
        activeSpirals: constellation.activeSpirals.map((spiral: any) => ({
          id: spiral.id,
          lifeDomain: spiral.lifeDomain,
          title: spiral.title,
          status: spiral.status,
          intensity: spiral.intensity,
          elementalSignature: spiral.elementalSignature
        })),
        overallHarmonicCoherence: constellation.overallHarmonicCoherence,
        elementalBalance: constellation.elementalBalance,
        constellationHealth: constellation.constellationHealth,
        generatedAt: constellation.generatedAt
      };

    case 'standard':
      return {
        ...constellation,
        crossPatterns: includePatterns ?
          constellation.crossPatterns.slice(0, 3) : [], // Limit patterns
        architecturalInsights: undefined // Hide deep insights
      };

    case 'advanced':
      return constellation; // Full constellation data

    case 'facilitator':
      return {
        ...constellation,
        debug: {
          rawSpirals: constellation.activeSpirals,
          allPatterns: constellation.crossPatterns,
          internalMetrics: {
            patternDetectionConfidence: 0.85,
            constellationStability: 0.78,
            crossSpiralCoherence: 0.82
          }
        }
      };

    default:
      return filterConstellationByExposure(constellation, 'standard', includePatterns);
  }
}

// ==============================================================================
// Uses imported getSessionUserId from lib/auth/session-utils
// ==============================================================================