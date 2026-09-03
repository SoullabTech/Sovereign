/**
 * SIGNIFICANT MOMENTS SERVICE
 *
 * Loads the pre-distilled essence of what matters most to a member:
 * - Captures (manual or auto-detected moments of significance)
 * - Breakthroughs (insight moments, pattern recognitions)
 * - Journal entries (reflective writing)
 *
 * Philosophy:
 * - These are the signal, not the noise
 * - 16,000 conversation turns contain everything; this contains what MATTERED
 * - Auto-detected breakthroughs + manual captures = member-curated memory
 */

import { query as dbQuery } from '@/lib/db/postgres';
import {
  adjudicateBreakthroughRow,
  admittedBreakthroughs,
  excludedBreakthroughCount,
  type BreakthroughSnapshot,
  type AdmittedBreakthrough,
} from './breakthroughParticipation';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface CaptureNote {
  id: string;
  tag: 'ship' | 'fix' | 'decision' | 'blocked' | 'next';
  text: string;
  createdAt: Date;
  sessionId?: string;
  meta?: Record<string, unknown>;
}

export interface BreakthroughMoment {
  id: string;
  insight: string;
  element?: string; // Fire, Water, Earth, Air, Aether
  createdAt: Date;
  integrated: boolean;
  sessionId?: string;
}

export interface JournalEntry {
  id: string;
  content: string;
  mood?: string;
  themes?: string[];
  createdAt: Date;
}

export interface SignificantMoments {
  captures: CaptureNote[];
  breakthroughs: BreakthroughSnapshot[];
  journals: JournalEntry[];
  summary: {
    totalCaptures: number;
    totalBreakthroughs: number;
    breakthroughsExcluded?: number;
    totalJournals: number;
    recentThemes: string[];
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// LOADERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Load recent captures for a user
 */
export async function loadCaptures(
  userId: string,
  limit = 20
): Promise<CaptureNote[]> {
  try {
    const result = await dbQuery<{
      id: string;
      tag: string;
      text: string;
      created_at: Date;
      session_id: string;
      meta: Record<string, unknown>;
    }>(`
      SELECT id, tag, text, created_at, session_id, meta
      FROM capture_notes
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `, [userId, limit]);

    return result.rows.map(row => ({
      id: row.id,
      tag: row.tag as CaptureNote['tag'],
      text: row.text,
      createdAt: new Date(row.created_at),
      sessionId: row.session_id,
      meta: row.meta
    }));
  } catch (error) {
    console.warn('[SignificantMoments] Error loading captures:', error);
    return [];
  }
}

/**
 * Load breakthrough moments for a user
 */
/**
 * P3f — ADJUDICATED AT THE REPRESENTATION BOUNDARY, LIKE EVERY OTHER READER.
 *
 * This loader handed out the raw machine-extracted `insight`, and
 * `formatSignificantMomentsAddendum` composed it verbatim as
 * `## Breakthrough Moments`. R25 had already settled the epistemic status of
 * `breakthrough_moments`; this reader had simply never passed through it.
 *
 * It was found by P3f's own requirement that no ALTERNATE reader be able to
 * reconstruct the excluded representation — not by resuming general exposure
 * hunting. Same representation, same rule, one boundary.
 */
export async function loadBreakthroughs(
  userId: string,
  limit = 10
): Promise<BreakthroughSnapshot[]> {
  try {
    const result = await dbQuery<{
      id: string;
      insight: string;
      element: string | null;
      created_at: Date;
      integrated: boolean;
      conversation_id: string | null;
    }>(`
      SELECT id, insight, element, created_at, integrated, conversation_id
      FROM breakthrough_moments
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `, [userId, limit]);

    return result.rows.map(adjudicateBreakthroughRow);
  } catch (error) {
    console.warn('[SignificantMoments] Error loading breakthroughs:', error);
    return [];
  }
}

/**
 * Load journal entries for a user.
 *
 * Reads from the two live journal tables:
 *   quick_journal_entries   — dream / day / handwriting captures (QuickJournalSheet)
 *   elemental_journal_entries — practice-linked elemental journal
 *
 * The legacy `journal_entries` table was never created and is intentionally
 * not queried here. All new writes go to quick_journal_entries.
 */
export async function loadJournals(
  userId: string,
  limit = 10
): Promise<JournalEntry[]> {
  try {
    const result = await dbQuery<{
      id: string;
      content: string;
      entry_type: string | null;
      tags: string[] | null;
      created_at: Date;
    }>(`
      SELECT
        id::text,
        content,
        entry_type,
        tags,
        created_at
      FROM quick_journal_entries
      WHERE user_id = $1

      UNION ALL

      SELECT
        id::text,
        content,
        'elemental' AS entry_type,
        tags,
        created_at
      FROM elemental_journal_entries
      WHERE user_id = $1

      ORDER BY created_at DESC
      LIMIT $2
    `, [userId, limit]);

    return result.rows.map(row => ({
      id: row.id,
      content: row.content,
      // Surface entry_type as a theme tag so MAIA knows "dream" vs "day" vs "elemental"
      themes: [
        ...(row.entry_type ? [row.entry_type] : []),
        ...(row.tags ?? []),
      ].filter(Boolean).slice(0, 5) || undefined,
      createdAt: new Date(row.created_at),
    }));
  } catch (error) {
    console.warn('[SignificantMoments] Error loading journals:', error);
    return [];
  }
}

/**
 * Load all significant moments for a user
 */
export async function loadSignificantMoments(
  userId: string,
  options: {
    maxCaptures?: number;
    maxBreakthroughs?: number;
    maxJournals?: number;
  } = {}
): Promise<SignificantMoments> {
  const {
    maxCaptures = 15,
    maxBreakthroughs = 10,
    maxJournals = 5
  } = options;

  const [captures, breakthroughs, journals] = await Promise.all([
    loadCaptures(userId, maxCaptures),
    loadBreakthroughs(userId, maxBreakthroughs),
    loadJournals(userId, maxJournals)
  ]);

  // Extract themes from captures and breakthroughs
  const recentThemes = extractThemes(captures, admittedBreakthroughs(breakthroughs));

  return {
    captures,
    breakthroughs,
    journals,
    summary: {
      totalCaptures: captures.length,
      totalBreakthroughs: breakthroughs.length,
      // Observability only — reported after adjudication, never composed.
      breakthroughsExcluded: excludedBreakthroughCount(breakthroughs),
      totalJournals: journals.length,
      recentThemes
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTEXT FORMATTING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Format significant moments as context addendum for MAIA
 */
export function formatSignificantMomentsAddendum(
  moments: SignificantMoments
): string {
  const sections: string[] = [];

  // Breakthroughs — P3f.
  //
  // Composition is reachable only through the certified accessor. Under the
  // current adjudication nothing is admitted: the table has no provenance
  // column, so authorship cannot be established for any row. Kept as a governed
  // path rather than deleted, so a future reintroduction reads as the
  // restoration the gate must refuse.
  const admittedMoments = admittedBreakthroughs(moments.breakthroughs);
  if (admittedMoments.length > 0) {
    const breakthroughLines = admittedMoments.map(b => {
      const elementTag = b.element ? ` [${b.element}]` : '';
      const date = formatRelativeDate(b.timestamp);
      return `- "${b.insight}"${elementTag} (${date})`;
    });
    sections.push(`## Breakthrough Moments\n${breakthroughLines.join('\n')}`);
  }

  // Captures (member-flagged significant moments)
  if (moments.captures.length > 0) {
    const capturesByTag = groupBy(moments.captures, c => c.tag);
    const captureLines: string[] = [];

    // Order: decisions, next, ship, fix, blocked
    const tagOrder: CaptureNote['tag'][] = ['decision', 'next', 'ship', 'fix', 'blocked'];
    for (const tag of tagOrder) {
      const tagged = capturesByTag[tag];
      if (tagged && tagged.length > 0) {
        captureLines.push(`**${tagLabel(tag)}:**`);
        tagged.slice(0, 5).forEach(c => {
          captureLines.push(`- ${c.text} (${formatRelativeDate(c.createdAt)})`);
        });
      }
    }

    if (captureLines.length > 0) {
      sections.push(`## What Matters (Captures)\n${captureLines.join('\n')}`);
    }
  }

  // Journals (reflective context)
  if (moments.journals.length > 0) {
    const journalLines = moments.journals.slice(0, 3).map(j => {
      const preview = j.content.slice(0, 150) + (j.content.length > 150 ? '...' : '');
      const mood = j.mood ? ` [Mood: ${j.mood}]` : '';
      return `- ${preview}${mood} (${formatRelativeDate(j.createdAt)})`;
    });
    sections.push(`## Recent Reflections\n${journalLines.join('\n')}`);
  }

  if (sections.length === 0) {
    return ''; // No significant moments to add
  }

  return `
═══════════════════════════════════════════════════════════════════════════
SIGNIFICANT MOMENTS — What This Member Has Flagged as Important
═══════════════════════════════════════════════════════════════════════════

${sections.join('\n\n')}

These represent the distilled essence of what matters to this person.
Reference these patterns and insights naturally, not mechanically.
`.trim();
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * P3f — a theme extracted from an excluded insight is still that insight.
 *
 * The derivation rule: a derived representation cannot acquire greater
 * participation authority than the material required to produce it. So this
 * takes ADMITTED breakthroughs only; deriving a keyword from an excluded one
 * would smuggle the inference back as a category.
 */
function extractThemes(
  captures: CaptureNote[],
  breakthroughs: AdmittedBreakthrough[]
): string[] {
  // Simple keyword extraction - could be enhanced with NLP
  const allText = [
    ...captures.map(c => c.text),
    ...breakthroughs.map(b => b.insight)
  ].join(' ').toLowerCase();

  // Common themes to look for
  const themePatterns = [
    'anxiety', 'stress', 'breathwork', 'meditation', 'focus',
    'creativity', 'relationship', 'work', 'health', 'sleep',
    'growth', 'fear', 'joy', 'grief', 'transition', 'decision'
  ];

  return themePatterns.filter(theme => allText.includes(theme));
}

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

function tagLabel(tag: CaptureNote['tag']): string {
  const labels: Record<CaptureNote['tag'], string> = {
    decision: 'Decisions Made',
    next: 'Next Steps',
    ship: 'Shipped/Completed',
    fix: 'Fixed/Resolved',
    blocked: 'Blocked/Stuck'
  };
  return labels[tag];
}

function groupBy<T>(arr: T[], fn: (item: T) => string): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const key = fn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}
