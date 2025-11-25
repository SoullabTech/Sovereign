/**
 * Unified Insights Storage Layer
 *
 * Connects the UnifiedInsightEngine to Supabase database.
 * Provides clean interface for storing and retrieving insights,
 * recurrences, spiral movements, and archetypal threads.
 */

import { createClient } from '@supabase/supabase-js';
import {
  UnifiedInsight,
  InsightSource,
  SpiralMovement,
  ArchetypalThread,
  SpiralReport,
  Element,
  InsightContext,
  ArchetypalPhase,
  SpiralDirection
} from '../services/UnifiedInsightEngine';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================================================
// Type Mappings (Database <-> Application)
// ============================================================================

interface DBUnifiedInsight {
  id: string;
  user_id: string;
  core_pattern: string;
  essence: string;
  first_context: InsightContext;
  first_date: string;
  first_excerpt: string | null;
  first_element: Element;
  first_depth: number | null;
  first_session_id: string | null;
  current_element: Element;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_seen: string;
}

interface DBInsightRecurrence {
  id: string;
  insight_id: string;
  context: InsightContext;
  date: string;
  excerpt: string;
  element: Element;
  depth: number | null;
  session_id: string | null;
  transformation: string | null;
  depth_change: number | null;
  emotional_tone: string | null;
  created_at: string;
}

interface DBSpiralMovement {
  id: string;
  insight_id: string;
  direction: SpiralDirection;
  current_depth: number;
  turns: number;
  next_threshold: string | null;
  convergence_score: number;
  updated_at: string;
}

interface DBArchetypalThread {
  id: string;
  insight_id: string;
  archetype: string;
  phase: ArchetypalPhase;
  birth_chart_placement: string | null;
  readiness_score: number;
  updated_at: string;
}

interface DBElementalTransformation {
  id: string;
  insight_id: string;
  from_element: Element;
  to_element: Element;
  date: string;
  context: InsightContext;
  description: string | null;
  created_at: string;
}

// ============================================================================
// Storage Functions
// ============================================================================

/**
 * Save a new UnifiedInsight to the database
 */
export async function saveUnifiedInsight(insight: UnifiedInsight): Promise<void> {
  try {
    // 1. Insert the main insight record
    const { data: insightData, error: insightError } = await supabase
      .from('unified_insights')
      .insert({
        id: insight.id,
        user_id: insight.userId,
        core_pattern: insight.corePattern,
        essence: insight.essence,
        first_context: insight.firstEmergence.context,
        first_date: insight.firstEmergence.date.toISOString(),
        first_excerpt: insight.firstEmergence.excerpt,
        first_element: insight.firstEmergence.element,
        first_depth: insight.firstEmergence.depth,
        first_session_id: insight.firstEmergence.sessionId,
        current_element: insight.elementalJourney.currentElement,
        is_active: insight.isActive,
        last_seen: insight.lastSeen.toISOString()
      })
      .select()
      .single();

    if (insightError) throw insightError;

    // 2. Insert spiral movement
    const { error: spiralError } = await supabase
      .from('spiral_movements')
      .insert({
        insight_id: insight.id,
        direction: insight.spiralMovement.direction,
        current_depth: insight.spiralMovement.currentDepth,
        turns: insight.spiralMovement.turns,
        next_threshold: insight.spiralMovement.nextThreshold,
        convergence_score: insight.spiralMovement.convergenceScore
      });

    if (spiralError) throw spiralError;

    // 3. Insert archetypal thread if present
    if (insight.archetypalThread) {
      const { error: archetypeError } = await supabase
        .from('archetypal_threads')
        .insert({
          insight_id: insight.id,
          archetype: insight.archetypalThread.archetype,
          phase: insight.archetypalThread.phase,
          birth_chart_placement: insight.archetypalThread.birthChartPlacement,
          readiness_score: insight.archetypalThread.readinessScore
        });

      if (archetypeError) throw archetypeError;
    }

    // 4. Insert recurrences if any
    if (insight.recurrences.length > 0) {
      const recurrenceRecords = insight.recurrences.map(r => ({
        insight_id: insight.id,
        context: r.context,
        date: r.date.toISOString(),
        excerpt: r.excerpt,
        element: r.element,
        depth: r.depth,
        session_id: r.sessionId,
        transformation: r.transformation,
        depth_change: r.depthChange,
        emotional_tone: r.emotionalTone
      }));

      const { error: recurrenceError } = await supabase
        .from('insight_recurrences')
        .insert(recurrenceRecords);

      if (recurrenceError) throw recurrenceError;
    }

    console.log('✅ Saved UnifiedInsight:', insight.id);
  } catch (error) {
    console.error('Error saving UnifiedInsight:', error);
    throw error;
  }
}

/**
 * Update an existing UnifiedInsight
 */
export async function updateUnifiedInsight(insight: UnifiedInsight): Promise<void> {
  try {
    // 1. Update main insight
    const { error: insightError } = await supabase
      .from('unified_insights')
      .update({
        current_element: insight.elementalJourney.currentElement,
        is_active: insight.isActive,
        last_seen: insight.lastSeen.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', insight.id);

    if (insightError) throw insightError;

    // 2. Update spiral movement
    const { error: spiralError } = await supabase
      .from('spiral_movements')
      .update({
        direction: insight.spiralMovement.direction,
        current_depth: insight.spiralMovement.currentDepth,
        turns: insight.spiralMovement.turns,
        next_threshold: insight.spiralMovement.nextThreshold,
        convergence_score: insight.spiralMovement.convergenceScore,
        updated_at: new Date().toISOString()
      })
      .eq('insight_id', insight.id);

    if (spiralError) throw spiralError;

    // 3. Update archetypal thread if present
    if (insight.archetypalThread) {
      const { error: archetypeError } = await supabase
        .from('archetypal_threads')
        .upsert({
          insight_id: insight.id,
          archetype: insight.archetypalThread.archetype,
          phase: insight.archetypalThread.phase,
          birth_chart_placement: insight.archetypalThread.birthChartPlacement,
          readiness_score: insight.archetypalThread.readinessScore,
          updated_at: new Date().toISOString()
        });

      if (archetypeError) throw archetypeError;
    }

    console.log('✅ Updated UnifiedInsight:', insight.id);
  } catch (error) {
    console.error('Error updating UnifiedInsight:', error);
    throw error;
  }
}

/**
 * Add a recurrence to an existing insight
 */
export async function addInsightRecurrence(
  insightId: string,
  recurrence: InsightSource & {
    transformation?: string;
    depthChange?: number;
  }
): Promise<void> {
  try {
    const { error } = await supabase
      .from('insight_recurrences')
      .insert({
        insight_id: insightId,
        context: recurrence.context,
        date: recurrence.date.toISOString(),
        excerpt: recurrence.excerpt,
        element: recurrence.element,
        depth: recurrence.depth,
        session_id: recurrence.sessionId,
        transformation: recurrence.transformation,
        depth_change: recurrence.depthChange,
        emotional_tone: recurrence.emotionalTone
      });

    if (error) throw error;

    // Update last_seen on the main insight
    await supabase
      .from('unified_insights')
      .update({ last_seen: recurrence.date.toISOString() })
      .eq('id', insightId);

    console.log('✅ Added recurrence to insight:', insightId);
  } catch (error) {
    console.error('Error adding recurrence:', error);
    throw error;
  }
}

/**
 * Record an elemental transformation
 */
export async function recordElementalTransformation(
  insightId: string,
  fromElement: Element,
  toElement: Element,
  context: InsightContext,
  description?: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('elemental_transformations')
      .insert({
        insight_id: insightId,
        from_element: fromElement,
        to_element: toElement,
        date: new Date().toISOString(),
        context,
        description
      });

    if (error) throw error;

    console.log('✅ Recorded elemental transformation:', `${fromElement} → ${toElement}`);
  } catch (error) {
    console.error('Error recording transformation:', error);
    throw error;
  }
}

/**
 * Load all insights for a user
 */
export async function loadUserInsights(userId: string): Promise<UnifiedInsight[]> {
  try {
    const { data: insights, error: insightsError } = await supabase
      .from('unified_insights')
      .select('*')
      .eq('user_id', userId)
      .order('last_seen', { ascending: false });

    if (insightsError) throw insightsError;
    if (!insights) return [];

    // Load related data for each insight
    const unifiedInsights: UnifiedInsight[] = [];

    for (const insight of insights) {
      // Load spiral movement
      const { data: spiral } = await supabase
        .from('spiral_movements')
        .select('*')
        .eq('insight_id', insight.id)
        .single();

      // Load archetypal thread
      const { data: archetype } = await supabase
        .from('archetypal_threads')
        .select('*')
        .eq('insight_id', insight.id)
        .single();

      // Load recurrences
      const { data: recurrences } = await supabase
        .from('insight_recurrences')
        .select('*')
        .eq('insight_id', insight.id)
        .order('date', { ascending: false });

      // Load elemental transformations
      const { data: transformations } = await supabase
        .from('elemental_transformations')
        .select('*')
        .eq('insight_id', insight.id)
        .order('date', { ascending: true });

      unifiedInsights.push(mapDBToUnifiedInsight(
        insight,
        spiral,
        archetype,
        recurrences || [],
        transformations || []
      ));
    }

    return unifiedInsights;
  } catch (error) {
    console.error('Error loading user insights:', error);
    return [];
  }
}

/**
 * Get converging insights (ready for integration)
 */
export async function getConvergingInsights(
  userId: string,
  threshold: number = 70
): Promise<UnifiedInsight[]> {
  try {
    const { data, error } = await supabase
      .from('v_converging_insights')
      .select('*')
      .eq('user_id', userId)
      .gte('convergence_score', threshold);

    if (error) throw error;
    if (!data) return [];

    // Note: This view returns flattened data, so we need to reconstruct
    // For now, return empty and use loadUserInsights with filtering
    const allInsights = await loadUserInsights(userId);
    return allInsights.filter(i => i.spiralMovement.convergenceScore >= threshold);
  } catch (error) {
    console.error('Error getting converging insights:', error);
    return [];
  }
}

/**
 * Save a Spiral Report
 */
export async function saveSpiralReport(report: SpiralReport): Promise<void> {
  try {
    const { error } = await supabase
      .from('spiral_reports')
      .insert({
        user_id: report.userId,
        period_start: report.period.start.toISOString(),
        period_end: report.period.end.toISOString(),
        converging_insight_ids: report.convergingInsights.map(i => i.id),
        dominant_element: report.elementalSummary.dominantElement,
        elemental_journey: report.elementalSummary.journey,
        elemental_completion: report.elementalSummary.completion,
        active_archetypes: JSON.stringify(report.activeArchetypes),
        integration_opportunities: JSON.stringify(report.integrationOpportunities),
        synthesis: report.synthesis
      });

    if (error) throw error;

    console.log('✅ Saved Spiral Report for user:', report.userId);
  } catch (error) {
    console.error('Error saving Spiral Report:', error);
    throw error;
  }
}

/**
 * Get latest Spiral Report for a user
 */
export async function getLatestSpiralReport(userId: string): Promise<SpiralReport | null> {
  try {
    const { data, error } = await supabase
      .from('spiral_reports')
      .select('*')
      .eq('user_id', userId)
      .order('generated_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      userId: data.user_id,
      period: {
        start: new Date(data.period_start),
        end: new Date(data.period_end)
      },
      convergingInsights: [], // TODO: Load from IDs
      elementalSummary: {
        dominantElement: data.dominant_element as Element,
        journey: data.elemental_journey,
        completion: data.elemental_completion
      },
      activeArchetypes: JSON.parse(data.active_archetypes),
      integrationOpportunities: JSON.parse(data.integration_opportunities),
      synthesis: data.synthesis,
      generatedAt: new Date(data.generated_at)
    };
  } catch (error) {
    console.error('Error getting latest Spiral Report:', error);
    return null;
  }
}

// ============================================================================
// Helper: Map DB records to UnifiedInsight
// ============================================================================

function mapDBToUnifiedInsight(
  insight: DBUnifiedInsight,
  spiral: DBSpiralMovement | null,
  archetype: DBArchetypalThread | null,
  recurrences: DBInsightRecurrence[],
  transformations: DBElementalTransformation[]
): UnifiedInsight {
  return {
    id: insight.id,
    userId: insight.user_id,
    corePattern: insight.core_pattern,
    essence: insight.essence,
    firstEmergence: {
      id: `source_${insight.id}_first`,
      context: insight.first_context,
      date: new Date(insight.first_date),
      excerpt: insight.first_excerpt || '',
      element: insight.first_element,
      depth: insight.first_depth || undefined,
      userId: insight.user_id,
      sessionId: insight.first_session_id || undefined
    },
    recurrences: recurrences.map(r => ({
      id: r.id,
      context: r.context,
      date: new Date(r.date),
      excerpt: r.excerpt,
      element: r.element,
      depth: r.depth || undefined,
      userId: insight.user_id,
      sessionId: r.session_id || undefined,
      emotionalTone: r.emotional_tone || undefined,
      transformation: r.transformation || undefined,
      depthChange: r.depth_change || undefined
    })),
    archetypalThread: archetype ? {
      archetype: archetype.archetype,
      phase: archetype.phase,
      birthChartPlacement: archetype.birth_chart_placement || undefined,
      readinessScore: archetype.readiness_score
    } : undefined,
    spiralMovement: spiral ? {
      direction: spiral.direction,
      currentDepth: spiral.current_depth,
      turns: spiral.turns,
      nextThreshold: spiral.next_threshold || 'Unknown',
      convergenceScore: spiral.convergence_score
    } : {
      direction: 'descending',
      currentDepth: 30,
      turns: 0,
      nextThreshold: 'Unknown',
      convergenceScore: 0
    },
    elementalJourney: {
      startElement: insight.first_element,
      currentElement: insight.current_element,
      transformations: transformations.map(t => ({
        from: t.from_element,
        to: t.to_element,
        date: new Date(t.date),
        context: t.context,
        description: t.description || ''
      }))
    },
    createdAt: new Date(insight.created_at),
    updatedAt: new Date(insight.updated_at),
    lastSeen: new Date(insight.last_seen),
    isActive: insight.is_active
  };
}
