/**
 * ELEMENTAL JOURNEY API ROUTE
 *
 * GET /api/elemental-alchemy/journey?userId=xxx
 * Get user's current journey state and snapshot
 *
 * POST /api/elemental-alchemy/journey
 * Update journey progress
 *
 * Response: { currentFacet, stage, progress, nextSteps, milestones }
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getJourneySnapshot,
  updateJourneyProgress,
  detectCurrentFacet,
} from '@/lib/features/ElementalJourneyTracker';
import { query, insertOne, findOne, updateOne } from '@/lib/db/postgres';

// Skip during static export (Capacitor builds)
export const dynamic = 'force-dynamic';

/**
 * GET - Fetch user's journey snapshot
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Get journey snapshot from service
    const snapshot = await getJourneySnapshot(userId);

    // Get journey state from database
    const dbState = await findOne('ea_journey_state', 'user_id', userId);

    return NextResponse.json({
      success: true,
      data: {
        // Current position
        currentFacet: {
          id: snapshot.currentFacet.facetId,
          number: snapshot.currentFacet.facetNumber,
          element: snapshot.currentFacet.element,
          phase: snapshot.currentFacet.phase,
          quality: snapshot.currentFacet.quality,
        },

        // Progress
        progress: {
          inFacet: Math.round(snapshot.progressInFacet * 100), // 0-100
          facetsCompleted: snapshot.totalFacetsCompleted,
          spiralLevel: snapshot.spiralLevel,
          journeyDuration: snapshot.journeyDuration,
        },

        // Alchemical context
        alchemical: {
          stage: snapshot.alchemicalStage.current,
          color: snapshot.alchemicalStage.color,
          overallProgress: Math.round(snapshot.alchemicalStage.overallProgress * 100),
          progressByStage: {
            nigredo: Math.round(snapshot.alchemicalStage.progressByStage.nigredo * 100),
            albedo: Math.round(snapshot.alchemicalStage.progressByStage.albedo * 100),
            citrinitas: Math.round(snapshot.alchemicalStage.progressByStage.citrinitas * 100),
            rubedo: Math.round(snapshot.alchemicalStage.progressByStage.rubedo * 100),
            quinta_essentia: Math.round(snapshot.alchemicalStage.progressByStage.quinta_essentia * 100),
          },
        },

        // Current teachings
        teachings: {
          theme: snapshot.developmentalTheme,
          shadowToWatch: snapshot.shadowToWatch,
          goldMedicine: snapshot.goldMedicineAvailable,
          consciousnessFocus: snapshot.consciousnessFocus,
        },

        // Guidance
        guidance: {
          typicalQuestions: snapshot.typicalQuestions,
          healingPractices: snapshot.healingPractices,
          integrationTasks: snapshot.integrationTasks,
        },

        // Navigation
        navigation: {
          next: snapshot.nextFacet,
          previous: snapshot.previousFacet,
        },

        // Achievements
        achievements: snapshot.achievements,

        // Database state (if exists)
        dbState: dbState ? {
          currentFacet: dbState.current_facet,
          currentElement: dbState.current_element,
          currentStage: dbState.current_stage,
          progressPct: dbState.progress_pct,
          updatedAt: dbState.updated_at,
        } : null,
      },
    });

  } catch (error) {
    console.error('❌ [JOURNEY API GET] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch journey',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Update journey progress
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, update, messages } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // If messages provided, detect facet from conversation
    let detectedFacet;
    if (messages && Array.isArray(messages)) {
      detectedFacet = await detectCurrentFacet(userId, messages);
    }

    // Update journey progress
    const updatedState = await updateJourneyProgress(userId, update || {});

    // Save to database
    const dbState = await findOne('ea_journey_state', 'user_id', userId);

    const journeyData = {
      user_id: userId,
      current_facet: `${updatedState.currentFacetNumber}`,
      current_element: getCurrentElement(updatedState.currentFacetNumber),
      current_stage: getCurrentStage(updatedState.currentFacetNumber),
      progress_pct: updatedState.progressInFacet * 100,
      facets_completed: JSON.stringify(updatedState.facetsCompleted),
      spiral_level: updatedState.spiralLevel,
      journey_started_at: updatedState.journeyStarted,
      updated_at: new Date().toISOString(),
    };

    if (dbState) {
      // Update existing
      await query(
        `
        UPDATE ea_journey_state
        SET
          current_facet = $2,
          current_element = $3,
          current_stage = $4,
          progress_pct = $5,
          facets_completed = $6,
          spiral_level = $7,
          updated_at = $8
        WHERE user_id = $1
        `,
        [
          userId,
          journeyData.current_facet,
          journeyData.current_element,
          journeyData.current_stage,
          journeyData.progress_pct,
          journeyData.facets_completed,
          journeyData.spiral_level,
          journeyData.updated_at,
        ]
      );
    } else {
      // Insert new
      await query(
        `
        INSERT INTO ea_journey_state (
          user_id,
          current_facet,
          current_element,
          current_stage,
          progress_pct,
          facets_completed,
          spiral_level,
          journey_started_at,
          updated_at,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        `,
        [
          userId,
          journeyData.current_facet,
          journeyData.current_element,
          journeyData.current_stage,
          journeyData.progress_pct,
          journeyData.facets_completed,
          journeyData.spiral_level,
          journeyData.journey_started_at,
          journeyData.updated_at,
        ]
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        currentFacetNumber: updatedState.currentFacetNumber,
        progressInFacet: updatedState.progressInFacet,
        facetsCompleted: updatedState.facetsCompleted,
        spiralLevel: updatedState.spiralLevel,
        detectedFacet: detectedFacet ? {
          facetId: detectedFacet.suggestedFacet.facetId,
          confidence: Math.round(detectedFacet.confidence * 100),
          reasoning: detectedFacet.reasoning,
        } : null,
      },
    });

  } catch (error) {
    console.error('❌ [JOURNEY API POST] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to update journey',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Helper: Get element for facet number
 */
function getCurrentElement(facetNumber: number): string {
  const elementMap: Record<number, string> = {
    1: 'Fire', 2: 'Fire', 3: 'Fire',
    4: 'Water', 5: 'Water', 6: 'Water',
    7: 'Earth', 8: 'Earth', 9: 'Earth',
    10: 'Air', 11: 'Air',
    12: 'Aether',
  };
  return elementMap[facetNumber] || 'Fire';
}

/**
 * Helper: Get alchemical stage for facet number
 */
function getCurrentStage(facetNumber: number): string {
  const stageMap: Record<number, string> = {
    1: 'nigredo', 2: 'nigredo', 3: 'nigredo',
    4: 'albedo', 5: 'albedo', 6: 'albedo',
    7: 'citrinitas', 8: 'citrinitas', 9: 'citrinitas',
    10: 'rubedo', 11: 'rubedo',
    12: 'quinta_essentia',
  };
  return stageMap[facetNumber] || 'nigredo';
}
