/**
 * Insight Persistence Layer
 * Bridges Unified Insight Engine (in-memory consciousness) to Supabase (eternal memory)
 *
 * This is where temporal consciousness becomes permanent.
 */

import { createClient } from '@supabase/supabase-js';
import type { UnifiedInsight, InsightSource, SpiralMovement, ArchetypalThread } from './UnifiedInsightEngine';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials for InsightPersistence');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Save or update a UnifiedInsight to the database
 */
export async function saveUnifiedInsight(insight: UnifiedInsight): Promise<void> {
  try {
    // Check if insight already exists
    const { data: existing } = await supabase
      .from('unified_insights')
      .select('id')
      .eq('id', insight.id)
      .single();

    const insightData = {
      id: insight.id,
      user_id: insight.userId,
      core_pattern: insight.corePattern,
      essence: insight.essence,
      first_date: insight.firstEmergence.date.toISOString(),
      first_context: insight.firstEmergence.context,
      first_excerpt: insight.firstEmergence.excerpt,
      start_element: insight.elementalJourney.startElement,
      current_element: insight.elementalJourney.currentElement,
      current_depth: insight.spiralMovement.currentDepth,
      spiral_turns: insight.spiralMovement.turns,
      is_active: insight.isActive,
      last_seen: insight.lastSeen.toISOString(),
      created_at: insight.createdAt.toISOString(),
      updated_at: insight.updatedAt.toISOString()
    };

    if (existing) {
      // Update existing insight
      await supabase
        .from('unified_insights')
        .update(insightData)
        .eq('id', insight.id);

      console.log('✅ Updated unified_insight:', insight.id);
    } else {
      // Insert new insight
      await supabase
        .from('unified_insights')
        .insert(insightData);

      console.log('✅ Created unified_insight:', insight.id);
    }

    // Save recurrences
    if (insight.recurrences.length > 0) {
      await saveRecurrences(insight.id, insight.recurrences);
    }

    // Save spiral movement
    await saveSpiralMovement(insight.id, insight.userId, insight.spiralMovement);

    // Save archetypal thread if present
    if (insight.archetypalThread) {
      await saveArchetypalThread(insight.id, insight.userId, insight.archetypalThread);
    }

    // Save elemental transformations
    if (insight.elementalJourney.transformations.length > 0) {
      await saveElementalTransformations(insight.id, insight.userId, insight.elementalJourney.transformations);
    }

  } catch (error) {
    console.error('❌ Error saving unified insight:', error);
    throw error;
  }
}

/**
 * Save insight recurrences
 */
async function saveRecurrences(
  insightId: string,
  recurrences: UnifiedInsight['recurrences']
): Promise<void> {
  try {
    const recurrenceData = recurrences.map(r => ({
      insight_id: insightId,
      date: r.date.toISOString(),
      context: r.context,
      excerpt: r.excerpt,
      element: r.element,
      depth: r.depth || null,
      transformation: r.transformation || null,
      depth_change: r.depthChange || null,
      session_id: r.sessionId || null
    }));

    await supabase
      .from('insight_recurrences')
      .upsert(recurrenceData);

    console.log(`✅ Saved ${recurrences.length} recurrences for ${insightId}`);
  } catch (error) {
    console.error('❌ Error saving recurrences:', error);
  }
}

/**
 * Save spiral movement state
 */
async function saveSpiralMovement(
  insightId: string,
  userId: string,
  movement: SpiralMovement
): Promise<void> {
  try {
    await supabase
      .from('spiral_movements')
      .upsert({
        insight_id: insightId,
        user_id: userId,
        direction: movement.direction,
        current_depth: movement.currentDepth,
        turns: movement.turns,
        next_threshold: movement.nextThreshold,
        convergence_score: movement.convergenceScore,
        updated_at: new Date().toISOString()
      });

    console.log(`✅ Saved spiral movement for ${insightId}`);
  } catch (error) {
    console.error('❌ Error saving spiral movement:', error);
  }
}

/**
 * Save archetypal thread
 */
async function saveArchetypalThread(
  insightId: string,
  userId: string,
  thread: ArchetypalThread
): Promise<void> {
  try {
    await supabase
      .from('archetypal_threads')
      .upsert({
        insight_id: insightId,
        user_id: userId,
        archetype: thread.archetype,
        phase: thread.phase,
        birth_chart_placement: thread.birthChartPlacement || null,
        readiness_score: thread.readinessScore,
        updated_at: new Date().toISOString()
      });

    console.log(`✅ Saved archetypal thread for ${insightId}`);
  } catch (error) {
    console.error('❌ Error saving archetypal thread:', error);
  }
}

/**
 * Save elemental transformations
 */
async function saveElementalTransformations(
  insightId: string,
  userId: string,
  transformations: UnifiedInsight['elementalJourney']['transformations']
): Promise<void> {
  try {
    const transformData = transformations.map(t => ({
      insight_id: insightId,
      user_id: userId,
      from_element: t.from,
      to_element: t.to,
      transformation_date: t.date.toISOString(),
      context: t.context,
      description: t.description
    }));

    await supabase
      .from('elemental_transformations')
      .upsert(transformData);

    console.log(`✅ Saved ${transformations.length} elemental transformations for ${insightId}`);
  } catch (error) {
    console.error('❌ Error saving elemental transformations:', error);
  }
}

/**
 * Load existing UnifiedInsights for a user from database
 */
export async function loadUserInsights(userId: string): Promise<UnifiedInsight[]> {
  try {
    const { data: insights, error } = await supabase
      .from('unified_insights')
      .select(`
        *,
        recurrences:insight_recurrences(*),
        spiral:spiral_movements(*),
        archetypal:archetypal_threads(*),
        transformations:elemental_transformations(*)
      `)
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) throw error;
    if (!insights) return [];

    // Transform database format to UnifiedInsight format
    return insights.map(row => ({
      id: row.id,
      userId: row.user_id,
      corePattern: row.core_pattern,
      essence: row.essence,
      firstEmergence: {
        id: `first_${row.id}`,
        context: row.first_context as any,
        date: new Date(row.first_date),
        excerpt: row.first_excerpt,
        element: row.start_element as any,
        userId: row.user_id
      },
      recurrences: (row.recurrences || []).map((r: any) => ({
        id: r.id,
        context: r.context as any,
        date: new Date(r.date),
        excerpt: r.excerpt,
        element: r.element as any,
        depth: r.depth,
        userId: row.user_id,
        transformation: r.transformation,
        depthChange: r.depth_change,
        sessionId: r.session_id
      })),
      archetypalThread: row.archetypal?.length > 0 ? {
        archetype: row.archetypal[0].archetype,
        phase: row.archetypal[0].phase as any,
        birthChartPlacement: row.archetypal[0].birth_chart_placement,
        readiness_score: row.archetypal[0].readiness_score
      } : undefined,
      spiralMovement: row.spiral?.length > 0 ? {
        direction: row.spiral[0].direction as any,
        currentDepth: row.spiral[0].current_depth,
        turns: row.spiral[0].turns,
        nextThreshold: row.spiral[0].next_threshold,
        convergenceScore: row.spiral[0].convergence_score
      } : {
        direction: 'descending',
        currentDepth: row.current_depth,
        turns: row.spiral_turns,
        nextThreshold: 'Unknown',
        convergenceScore: 10
      },
      elementalJourney: {
        startElement: row.start_element as any,
        currentElement: row.current_element as any,
        transformations: (row.transformations || []).map((t: any) => ({
          from: t.from_element as any,
          to: t.to_element as any,
          date: new Date(t.transformation_date),
          context: t.context as any,
          description: t.description
        }))
      },
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      lastSeen: new Date(row.last_seen),
      isActive: row.is_active
    }));
  } catch (error) {
    console.error('❌ Error loading user insights:', error);
    return [];
  }
}
