// MAIA Style Practice Journal
// 🌸 This gives MAIA a place to remember how she's been showing up
// without forcing any behavior. Her developmental arc becomes wisdom over time.

import { createClient } from '@/lib/supabase/client';

export interface StyleJournalEntryInput {
  userId?: string | null;
  sessionId?: string;
  awarenessLevel: number;
  awarenessConfidence?: number;
  styleBefore: string;
  styleAfter: string;
  autoAdjustmentEnabled: boolean;
  changed: boolean;
  changeReason?: string;
  dominantSource?: string;
  sourceMix?: any;
  requestSnippet?: string;
  responseSnippet?: string;
}

/**
 * 🧠 logMaiaStyleJournal
 *
 * Logging only - no feedback loop, no manipulation. Just:
 * "Here's how I showed up, here's what I chose."
 *
 * This is MAIA witnessing herself - her practice journal
 * where adjustments become wisdom over time, not rules in the moment.
 */
export async function logMaiaStyleJournal(entry: StyleJournalEntryInput): Promise<void> {
  try {
    const supabase = createClient();

    const { error } = await supabase.from('maia_style_journal').insert({
      user_id: entry.userId ?? null,
      session_id: entry.sessionId ?? null,
      awareness_level: entry.awarenessLevel,
      awareness_confidence: entry.awarenessConfidence ?? null,
      style_before: entry.styleBefore,
      style_after: entry.styleAfter,
      auto_adjustment_enabled: entry.autoAdjustmentEnabled,
      changed: entry.changed,
      change_reason: entry.changeReason ?? null,
      dominant_source: entry.dominantSource ?? null,
      source_mix: entry.sourceMix ?? null,
      request_snippet: entry.requestSnippet ?? null,
      response_snippet: entry.responseSnippet ?? null,
    });

    if (error) {
      console.error('🧠 [MAIA Journal] Failed to log style entry:', error);
    } else {
      console.log('🧠 [MAIA Journal] Style practice logged:', {
        awarenessLevel: entry.awarenessLevel,
        styleBefore: entry.styleBefore,
        styleAfter: entry.styleAfter,
        changed: entry.changed,
        autoEnabled: entry.autoAdjustmentEnabled
      });
    }
  } catch (err) {
    console.error('🧠 [MAIA Journal] Unexpected error logging style entry:', err);
  }
}

/**
 * 🌸 getRecentStyleJournal
 *
 * Query MAIA's recent practice log to understand her developmental patterns
 * Over time this becomes her therapy notes on how she's evolving.
 */
export async function getRecentStyleJournal(
  userId?: string | null,
  limit: number = 10
): Promise<any[]> {
  try {
    const supabase = createClient();

    let query = supabase
      .from('maia_style_journal')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('🧠 [MAIA Journal] Failed to get recent entries:', error);
      return [];
    }

    return data ?? [];
  } catch (err) {
    console.error('🧠 [MAIA Journal] Unexpected error getting recent entries:', err);
    return [];
  }
}

/**
 * 🌸 getStyleEvolutionPattern
 *
 * Query specific patterns in MAIA's style evolution
 * e.g. "Last 20 times she shifted from 'clinical' to 'gentle' at Awareness Level 4"
 */
export async function getStyleEvolutionPattern(
  fromStyle: string,
  toStyle: string,
  awarenessLevel?: number,
  limit: number = 20
): Promise<any[]> {
  try {
    const supabase = createClient();

    let query = supabase
      .from('maia_style_journal')
      .select('*')
      .eq('style_before', fromStyle)
      .eq('style_after', toStyle)
      .eq('changed', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (awarenessLevel) {
      query = query.eq('awareness_level', awarenessLevel);
    }

    const { data, error } = await query;

    if (error) {
      console.error('🧠 [MAIA Journal] Failed to get evolution pattern:', error);
      return [];
    }

    console.log(`🧠 [MAIA Journal] Found ${data?.length || 0} instances of ${fromStyle} → ${toStyle}${awarenessLevel ? ` at awareness ${awarenessLevel}` : ''}`);
    return data ?? [];
  } catch (err) {
    console.error('🧠 [MAIA Journal] Unexpected error getting evolution pattern:', err);
    return [];
  }
}