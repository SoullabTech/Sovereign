/**
 * BARDIC EPISODE CREATION API
 *
 * Creates crystallized memory episodes from conversation moments.
 * Optionally runs linking to connect with prior episodes.
 *
 * POST /api/consciousness/memory/episodes
 * Body: {
 *   userId: string
 *   sceneStanza?: string        // Description of the moment
 *   placeCue?: string           // Where it happened
 *   senseCues?: string[]        // Sensory details
 *   affectValence?: number      // -1 to +1 (negative to positive)
 *   affectArousal?: number      // 0 to 1 (calm to activated)
 *   elementalState?: object     // Spiralogic element balance
 *   sacredFlag?: boolean        // Mark as significant
 *   runLinking?: boolean        // Auto-run linking (default: true)
 * }
 *
 * Returns: {
 *   episodeId: string
 *   linksCreated?: number
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { EpisodeService } from '@/lib/services/episodeService';
import { getLinkingService } from '@/lib/memory/bardic/LinkingService';

export const dynamic = 'force-dynamic';

const episodeService = new EpisodeService();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      sceneStanza,
      placeCue,
      senseCues,
      affectValence,
      affectArousal,
      elementalState,
      sacredFlag,
      runLinking = true,
    } = body;

    // Validate input
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId' },
        { status: 400 }
      );
    }

    // Create episode
    const episodeId = await episodeService.createEpisode({
      userId,
      sceneStanza,
      placeCue,
      senseCues,
      affectValence,
      affectArousal,
      elementalState,
      sacredFlag,
    });

    let linksCreated = 0;

    // Optionally run linking
    if (runLinking) {
      try {
        const linkingService = getLinkingService();
        linksCreated = await linkingService.generateLinks(episodeId, userId);
        console.log(`✅ [Episode API] Created ${linksCreated} links for episode ${episodeId}`);
      } catch (linkError) {
        console.warn('[Episode API] Linking failed, episode still created:', linkError);
      }
    }

    console.log(`✅ [Episode API] Episode ${episodeId} created for ${userId}`);

    return NextResponse.json({
      success: true,
      episodeId,
      linksCreated,
    });

  } catch (error: any) {
    console.error('[Episode API] Error creating episode:', error);
    return NextResponse.json(
      {
        error: 'Episode creation failed',
        details: error.message
      },
      { status: 500 }
    );
  }
}
