/**
 * Soul Story API
 *
 * GET - Fetch member's soul story (creates if doesn't exist)
 * POST - Initialize story with birth chart data
 * PATCH - Update story settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, insertOne } from '@/lib/db/postgres';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { generateGenesisChapter, BirthChartData } from '@/lib/story/storyWeaver';
import { resolveMemberDisplayName } from '@/lib/stellium/clients';

export const dynamic = 'force-dynamic';

interface SoulStoryRow {
  id: string;
  member_id: string;
  title: string;
  subtitle: string | null;
  sun_sign: string | null;
  moon_sign: string | null;
  rising_sign: string | null;
  chart_pattern: string | null;
  dominant_element: string | null;
  key_themes: string[];
  narrative_voice: string;
  archetype_depth: string;
  auto_generate_chapters: boolean;
  include_transits: boolean;
  created_at: Date;
  updated_at: Date;
}

interface StoryChapterRow {
  id: string;
  story_id: string;
  member_id: string;
  title: string;
  chapter_number: number;
  status: string;
  current_draft: string;
  source_data: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
  approved_at: Date | null;
  period_start: Date | null;
  period_end: Date | null;
}

/**
 * GET /api/story
 *
 * Fetch the current member's soul story with chapters
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session?.memberId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch story
    const story = await queryOne<SoulStoryRow>(
      `SELECT * FROM soul_stories WHERE member_id = $1`,
      [session.memberId]
    );

    if (!story) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No story found. Use POST to initialize.',
      });
    }

    // Fetch chapters
    const chaptersResult = await query<StoryChapterRow>(
      `SELECT * FROM story_chapters WHERE story_id = $1 ORDER BY chapter_number ASC`,
      [story.id]
    );

    // Fetch threads
    const threadsResult = await query(
      `SELECT * FROM story_threads WHERE story_id = $1 ORDER BY last_updated DESC`,
      [story.id]
    );

    // Fetch timeline events
    const timelineResult = await query(
      `SELECT * FROM story_timeline_events WHERE story_id = $1 ORDER BY event_date DESC LIMIT 20`,
      [story.id]
    );

    return NextResponse.json({
      success: true,
      data: {
        story: {
          id: story.id,
          memberId: story.member_id,
          title: story.title,
          subtitle: story.subtitle,
          chartSummary: {
            sunSign: story.sun_sign,
            moonSign: story.moon_sign,
            risingSign: story.rising_sign,
            chartPattern: story.chart_pattern,
            dominantElement: story.dominant_element,
            keyThemes: story.key_themes || [],
          },
          settings: {
            narrativeVoice: story.narrative_voice,
            archetypeDepth: story.archetype_depth,
            autoGenerateChapters: story.auto_generate_chapters,
            includeTransits: story.include_transits,
          },
          createdAt: story.created_at,
          updatedAt: story.updated_at,
        },
        chapters: chaptersResult.rows.map((ch) => ({
          id: ch.id,
          title: ch.title,
          chapterNumber: ch.chapter_number,
          status: ch.status,
          currentDraft: ch.current_draft,
          sourceData: ch.source_data,
          createdAt: ch.created_at,
          updatedAt: ch.updated_at,
          approvedAt: ch.approved_at,
          periodStart: ch.period_start,
          periodEnd: ch.period_end,
        })),
        threads: threadsResult.rows,
        timeline: timelineResult.rows,
      },
    });
  } catch (error) {
    console.error('[Story API] GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch story' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/story
 *
 * Initialize a new soul story with birth chart data
 * Generates the Genesis chapter automatically
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session?.memberId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { chartData } = body as { chartData?: BirthChartData };

    if (!chartData) {
      return NextResponse.json(
        { success: false, error: 'chartData is required' },
        { status: 400 }
      );
    }

    if (!chartData.sun || !chartData.moon || !chartData.rising) {
      return NextResponse.json(
        { success: false, error: 'chartData must include sun, moon, and rising' },
        { status: 400 }
      );
    }

    // Check if story already exists
    const existingStory = await queryOne<SoulStoryRow>(
      `SELECT id FROM soul_stories WHERE member_id = $1`,
      [session.memberId]
    );

    if (existingStory) {
      return NextResponse.json(
        { success: false, error: 'Story already exists. Use PATCH to update.' },
        { status: 409 }
      );
    }

    // Get member name for personalization
    const member = await queryOne<{ name: string; preferred_name: string | null }>(
      `SELECT name, preferred_name FROM members WHERE id = $1`,
      [session.memberId]
    );
    const memberName = resolveMemberDisplayName(member, 'Soul');

    // Extract key themes from chart
    const keyThemes = extractKeyThemes(chartData);

    // Create the story
    const story = await insertOne<SoulStoryRow>('soul_stories', {
      member_id: session.memberId,
      title: `${memberName}'s Evolutionary Journey`,
      subtitle: 'A Living Mythology Co-Authored with MAIA',
      sun_sign: chartData.sun.sign,
      moon_sign: chartData.moon.sign,
      rising_sign: chartData.rising.sign,
      chart_pattern: chartData.chartPattern || null,
      dominant_element: chartData.dominantElement || null,
      key_themes: JSON.stringify(keyThemes),
    });

    // Generate Genesis chapter
    const genesisNarrative = generateGenesisChapter(chartData);

    const genesisChapter = await insertOne<StoryChapterRow>('story_chapters', {
      story_id: story.id,
      member_id: session.memberId,
      title: 'Genesis',
      chapter_number: 0,
      status: 'draft',
      current_draft: genesisNarrative,
      source_data: JSON.stringify({ chartInsights: ['Birth chart synthesis'] }),
    });

    // Create initial timeline event
    await insertOne('story_timeline_events', {
      story_id: story.id,
      member_id: session.memberId,
      event_type: 'chapter-created',
      title: 'Your Story Begins',
      description: 'Genesis chapter created from birth chart',
      related_chapter_id: genesisChapter.id,
    });

    // Create initial thread from chart
    const initialThreadName = detectInitialThread(chartData);
    await insertOne('story_threads', {
      story_id: story.id,
      member_id: session.memberId,
      name: initialThreadName,
      description: 'Your primary archetypal journey, revealed in your birth chart',
      status: 'active',
      related_chapters: `{${genesisChapter.id}}`,
      chart_context: JSON.stringify(chartData),
    });

    return NextResponse.json({
      success: true,
      data: {
        storyId: story.id,
        genesisChapterId: genesisChapter.id,
        message: 'Soul story initialized with Genesis chapter',
      },
    });
  } catch (error) {
    console.error('[Story API] POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize story' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/story
 *
 * Update story settings
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session?.memberId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { settings } = body as {
      settings?: {
        narrativeVoice?: string;
        archetypeDepth?: string;
        autoGenerateChapters?: boolean;
        includeTransits?: boolean;
      };
    };

    if (!settings) {
      return NextResponse.json(
        { success: false, error: 'settings object is required' },
        { status: 400 }
      );
    }

    // Build update query
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (settings.narrativeVoice !== undefined) {
      updates.push(`narrative_voice = $${paramIndex++}`);
      values.push(settings.narrativeVoice);
    }
    if (settings.archetypeDepth !== undefined) {
      updates.push(`archetype_depth = $${paramIndex++}`);
      values.push(settings.archetypeDepth);
    }
    if (settings.autoGenerateChapters !== undefined) {
      updates.push(`auto_generate_chapters = $${paramIndex++}`);
      values.push(settings.autoGenerateChapters);
    }
    if (settings.includeTransits !== undefined) {
      updates.push(`include_transits = $${paramIndex++}`);
      values.push(settings.includeTransits);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid settings to update' },
        { status: 400 }
      );
    }

    values.push(session.memberId);
    const sql = `UPDATE soul_stories SET ${updates.join(', ')} WHERE member_id = $${paramIndex} RETURNING id`;

    const result = await queryOne<{ id: string }>(sql, values);

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Story not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated',
    });
  } catch (error) {
    console.error('[Story API] PATCH error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update story' },
      { status: 500 }
    );
  }
}

// Helper functions

function extractKeyThemes(chartData: BirthChartData): string[] {
  const themes: string[] = [];

  if (chartData.chartPattern === 'Bucket') {
    themes.push('Focused Specialization', 'Pouring Energy Through Singular Purpose');
  }

  if (chartData.dominantElement === 'Fire') {
    themes.push('Active Transformation', 'Learning Through Experience');
  } else if (chartData.dominantElement === 'Water') {
    themes.push('Emotional Depth', 'Healing Through Feeling');
  } else if (chartData.dominantElement === 'Earth') {
    themes.push('Grounded Manifestation', 'Building What Lasts');
  } else if (chartData.dominantElement === 'Air') {
    themes.push('Pattern Recognition', 'Collective Consciousness');
  }

  if (chartData.angularPlanets && chartData.angularPlanets.length > 0) {
    themes.push('High Volume Expression', 'Public Visibility');
  }

  return themes;
}

function detectInitialThread(chartData: BirthChartData): string {
  if (chartData.chartPattern === 'Bucket' && chartData.focalPlanet) {
    return `${chartData.focalPlanet} Focal Point Work`;
  }

  if (chartData.dominantElement) {
    const elementalThreads: Record<string, string> = {
      Fire: 'The Fire Path: From Experience to Expression',
      Water: 'The Water Path: From Heart to Healing',
      Earth: 'The Earth Path: From Vision to Manifestation',
      Air: 'The Air Path: From Pattern to Purpose',
    };
    return elementalThreads[chartData.dominantElement];
  }

  return 'Finding Your Unique Path';
}
