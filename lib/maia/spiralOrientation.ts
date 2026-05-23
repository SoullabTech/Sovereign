/**
 * MAIA Spiral Orientation — Cut 2
 *
 * Read-only computed view over existing developmental substrate.
 * Returns orientation signals — NOT conclusions, profiles, or phase assignments.
 *
 * Canon constraints:
 * - No writes. No new tables.
 * - No phase numbers per domain (phase is unitary, not decomposable by life domain).
 * - No cross-domain synthesis (crossing_allowed = FALSE spirit).
 * - Evidence → questions. Not evidence → assertions.
 * - Each query degrades gracefully on failure.
 *
 * See: docs/architecture/MAIA_SPIRAL_ORIENTATION_CUT2.md
 */

import { db } from '@/lib/db/postgres';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SpiralDomain =
  | 'career'
  | 'relationship'
  | 'identity'
  | 'health'
  | 'creative'
  | 'spiritual'
  | 'boundaries'
  | 'integration';

export type MemoryRegister =
  | 'episodic'
  | 'thematic'
  | 'developmental'
  | 'archetypal'
  | 'relational'
  | 'threshold'
  | 'witnessed'
  | 'unclassified';

export type SpiralTheme =
  | 'field_awareness'
  | 'pattern_recurrence'
  | 'embodied_coherence'
  | 'adaptive_unfolding'
  | 'wise_acceptance'
  | 'ripeness';

export type ThresholdEventType =
  | 'decision'
  | 'commitment'
  | 'boundary'
  | 'role_shift'
  | 'collapse'
  | 'initiation'
  | 'completion'
  | 'kairos_crossing';

export type DomainIntention = {
  domain: SpiralDomain;
  intention: string;
  elementTone?: string;
  since: Date;
};

export type MemoryRegisterProfile = {
  register: MemoryRegister;
  count: number;
};

export type ActiveTheme = {
  theme: SpiralTheme;
  signalType: string;
  resonanceStrength?: number;
  recentCount: number;
};

export type ThresholdCrossing = {
  eventType: ThresholdEventType;
  element?: string;
  intensity: string;
  summary: string;
  source: string;
  when: Date;
};

export type ThinkingThread = {
  title: string;
  status: string;
  hasRecentDecision: boolean;
  lastDecisionAt?: Date;
};

export type SpiralOrientationResult = {
  memberId: string;
  computedAt: Date;
  /** Declared domain intentions from trajectory_focus */
  activeIntentions: DomainIntention[];
  /** Memory texture by register type from member_memory_atoms */
  memoryProfile: MemoryRegisterProfile[];
  /** Spiralogic process themes in motion (14-day window) */
  activeThemes: ActiveTheme[];
  /** Recent threshold crossings (60-day window) */
  recentThresholds: ThresholdCrossing[];
  /** Active thinking threads from member_ideas */
  thinkingThreads: ThinkingThread[];
  /**
   * Suggested inquiry questions for MAIA to consider offering.
   * These are tools for MAIA's judgment — NOT scripted prompts.
   * MAIA decides whether, when, and how to surface any of these.
   */
  suggestedQuestions: string[];
  /** What cannot be determined from current data */
  uncertainty: string[];
  /** Which data layers have any content */
  dataPresence: {
    hasIntentions: boolean;
    hasMemory: boolean;
    hasThemes: boolean;
    hasThresholds: boolean;
    hasThreads: boolean;
  };
};

// ─── Main Function ────────────────────────────────────────────────────────────

/**
 * Build a read-only spiral orientation view for a member.
 * Queries five existing tables. Each query degrades gracefully.
 * Never writes, never infers, never asserts phase or trajectory.
 */
export async function buildMemberSpiralOrientation(
  memberId: string
): Promise<SpiralOrientationResult> {
  const computedAt = new Date();

  const [
    activeIntentions,
    memoryProfile,
    activeThemes,
    recentThresholds,
    thinkingThreads,
  ] = await Promise.all([
    loadActiveIntentions(memberId),
    loadMemoryProfile(memberId),
    loadActiveThemes(memberId),
    loadRecentThresholds(memberId),
    loadThinkingThreads(memberId),
  ]);

  const dataPresence = {
    hasIntentions: activeIntentions.length > 0,
    hasMemory: memoryProfile.length > 0,
    hasThemes: activeThemes.length > 0,
    hasThresholds: recentThresholds.length > 0,
    hasThreads: thinkingThreads.length > 0,
  };

  const suggestedQuestions = generateSuggestedQuestions({
    activeIntentions,
    activeThemes,
    recentThresholds,
    thinkingThreads,
    dataPresence,
  });

  const uncertainty = buildUncertainty(dataPresence);

  return {
    memberId,
    computedAt,
    activeIntentions,
    memoryProfile,
    activeThemes,
    recentThresholds,
    thinkingThreads,
    suggestedQuestions,
    uncertainty,
    dataPresence,
  };
}

// ─── Queries ──────────────────────────────────────────────────────────────────

async function loadActiveIntentions(memberId: string): Promise<DomainIntention[]> {
  try {
    const { rows } = await db.query<{
      domain: SpiralDomain;
      intention: string;
      element_tone: string | null;
      updated_at: Date;
    }>(
      `SELECT domain, intention, element_tone, updated_at
       FROM trajectory_focus
       WHERE member_id = $1
       ORDER BY updated_at DESC`,
      [memberId]
    );
    return rows.map((r) => ({
      domain: r.domain,
      intention: r.intention,
      elementTone: r.element_tone ?? undefined,
      since: r.updated_at,
    }));
  } catch (err) {
    console.warn('[spiralOrientation] trajectory_focus query failed:', err);
    return [];
  }
}

async function loadMemoryProfile(memberId: string): Promise<MemoryRegisterProfile[]> {
  try {
    const { rows } = await db.query<{
      register: string;
      count: string;
    }>(
      `SELECT
         COALESCE(primary_register, 'unclassified') AS register,
         COUNT(*)::text AS count
       FROM member_memory_atoms
       WHERE member_id = $1
         AND status IN ('active', 'still_alive')
         AND NOT ('sacred_protected' = ANY(registers))
       GROUP BY primary_register
       ORDER BY COUNT(*) DESC`,
      [memberId]
    );
    return rows.map((r) => ({
      register: r.register as MemoryRegister,
      count: parseInt(r.count, 10),
    }));
  } catch (err) {
    console.warn('[spiralOrientation] member_memory_atoms query failed:', err);
    return [];
  }
}

async function loadActiveThemes(memberId: string): Promise<ActiveTheme[]> {
  try {
    const { rows } = await db.query<{
      theme: SpiralTheme;
      signal_type: string;
      avg_strength: string | null;
      signal_count: string;
    }>(
      `SELECT
         theme,
         signal_type,
         AVG(resonance_strength)::text AS avg_strength,
         COUNT(*)::text AS signal_count
       FROM member_theme_signals
       WHERE member_id = $1
         AND detected_at >= NOW() - INTERVAL '14 days'
       GROUP BY theme, signal_type
       ORDER BY COUNT(*) DESC, AVG(resonance_strength) DESC NULLS LAST`,
      [memberId]
    );
    return rows.map((r) => ({
      theme: r.theme,
      signalType: r.signal_type,
      resonanceStrength: r.avg_strength != null ? parseFloat(r.avg_strength) : undefined,
      recentCount: parseInt(r.signal_count, 10),
    }));
  } catch (err) {
    console.warn('[spiralOrientation] member_theme_signals query failed:', err);
    return [];
  }
}

async function loadRecentThresholds(memberId: string): Promise<ThresholdCrossing[]> {
  try {
    const { rows } = await db.query<{
      event_type: ThresholdEventType;
      element: string | null;
      intensity: string;
      summary: string;
      source: string;
      created_at: Date;
    }>(
      `SELECT event_type, element, intensity, summary, source, created_at
       FROM threshold_events
       WHERE member_id = $1
         AND created_at >= NOW() - INTERVAL '60 days'
       ORDER BY created_at DESC
       LIMIT 10`,
      [memberId]
    );
    return rows.map((r) => ({
      eventType: r.event_type,
      element: r.element ?? undefined,
      intensity: r.intensity,
      summary: r.summary,
      source: r.source,
      when: r.created_at,
    }));
  } catch (err) {
    console.warn('[spiralOrientation] threshold_events query failed:', err);
    return [];
  }
}

async function loadThinkingThreads(memberId: string): Promise<ThinkingThread[]> {
  try {
    const { rows } = await db.query<{
      title: string;
      status: string;
      last_decision_at: Date | null;
    }>(
      `SELECT title, status, last_decision_at
       FROM member_ideas
       WHERE member_id = $1
         AND status = 'active'
       ORDER BY last_touched_at DESC
       LIMIT 8`,
      [memberId]
    );
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return rows.map((r) => ({
      title: r.title,
      status: r.status,
      hasRecentDecision:
        r.last_decision_at != null && r.last_decision_at > thirtyDaysAgo,
      lastDecisionAt: r.last_decision_at ?? undefined,
    }));
  } catch (err) {
    console.warn('[spiralOrientation] member_ideas query failed:', err);
    return [];
  }
}

// ─── Suggested Questions ──────────────────────────────────────────────────────

/**
 * Generate candidate inquiry questions based on what's present in the data.
 * These are tools for MAIA's judgment — she decides whether to surface any of them.
 * Generated from evidence, never from inference or cross-domain synthesis.
 */
function generateSuggestedQuestions(args: {
  activeIntentions: DomainIntention[];
  activeThemes: ActiveTheme[];
  recentThresholds: ThresholdCrossing[];
  thinkingThreads: ThinkingThread[];
  dataPresence: SpiralOrientationResult['dataPresence'];
}): string[] {
  const { activeIntentions, activeThemes, recentThresholds, thinkingThreads, dataPresence } = args;
  const questions: string[] = [];

  // From declared intentions
  for (const intention of activeIntentions.slice(0, 3)) {
    questions.push(
      `You named ${intention.domain} as a place of intention. Where is that sitting right now?`
    );
  }

  // From active themes (high signal count only)
  const strongThemes = activeThemes.filter((t) => t.recentCount >= 3);
  for (const theme of strongThemes.slice(0, 2)) {
    const readable = theme.theme.replace(/_/g, ' ');
    questions.push(
      `${capitalize(readable)} has been showing up recently. What's alive in that for you?`
    );
  }

  // From recent thresholds
  for (const threshold of recentThresholds.slice(0, 2)) {
    const verb = threshold.source === 'member_declared' ? 'named' : 'marked';
    const snippet = threshold.summary.slice(0, 60) + (threshold.summary.length > 60 ? '...' : '');
    questions.push(
      `You ${verb} a ${threshold.eventType.replace(/_/g, ' ')} around "${snippet}". Is that still in motion?`
    );
  }

  // From thinking threads without recent decisions
  const stalledThreads = thinkingThreads.filter((t) => !t.hasRecentDecision);
  for (const thread of stalledThreads.slice(0, 2)) {
    questions.push(
      `The thread around "${thread.title}" hasn't had a decision recently. Is it parked or still live?`
    );
  }

  // If nothing present, an open question
  if (questions.length === 0) {
    questions.push("What's in motion for you right now?");
  }

  return questions;
}

// ─── Uncertainty ──────────────────────────────────────────────────────────────

function buildUncertainty(dataPresence: SpiralOrientationResult['dataPresence']): string[] {
  const items: string[] = [];
  if (!dataPresence.hasIntentions) {
    items.push('No declared domain intentions on record — cannot surface orientation by life area.');
  }
  if (!dataPresence.hasThemes) {
    items.push('No Spiralogic theme signals in the last 14 days — cannot surface active process themes.');
  }
  if (!dataPresence.hasThresholds) {
    items.push('No threshold crossings in the last 60 days — cannot surface recent developmental markers.');
  }
  if (!dataPresence.hasMemory) {
    items.push('No surfacable memory atoms — register texture unavailable.');
  }
  return items;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Formatting for prompt context ───────────────────────────────────────────

/**
 * Format spiral orientation for inclusion in MAIA's context block.
 * Returns undefined when there is no meaningful data to surface.
 * Does NOT assert, diagnose, or conclude. Evidence + questions only.
 */
export function formatSpiralOrientationForPrompt(
  orientation: SpiralOrientationResult
): string | undefined {
  const { dataPresence } = orientation;
  const hasAny =
    dataPresence.hasIntentions ||
    dataPresence.hasThemes ||
    dataPresence.hasThresholds ||
    dataPresence.hasThreads;

  if (!hasAny) return undefined;

  const lines: string[] = [
    '--- SPIRAL ORIENTATION (read-only context, not assertions) ---',
  ];

  if (orientation.activeIntentions.length > 0) {
    lines.push('\nDeclared domain intentions:');
    for (const i of orientation.activeIntentions) {
      const tone = i.elementTone ? ` [${i.elementTone}]` : '';
      lines.push(`  ${i.domain}${tone}: ${i.intention}`);
    }
  }

  if (orientation.activeThemes.length > 0) {
    lines.push('\nProcess themes in motion (last 14 days):');
    for (const t of orientation.activeThemes) {
      const strength = t.resonanceStrength != null
        ? ` (strength: ${t.resonanceStrength.toFixed(2)})`
        : '';
      lines.push(`  ${t.theme.replace(/_/g, ' ')} / ${t.signalType}${strength} — ${t.recentCount} signals`);
    }
  }

  if (orientation.recentThresholds.length > 0) {
    lines.push('\nRecent threshold crossings (last 60 days):');
    for (const th of orientation.recentThresholds) {
      const el = th.element ? ` [${th.element}]` : '';
      lines.push(`  ${th.eventType.replace(/_/g, ' ')}${el} / ${th.intensity}: ${th.summary.slice(0, 80)}`);
    }
  }

  if (orientation.suggestedQuestions.length > 0) {
    lines.push('\nSuggested inquiry (use judgment — not scripted):');
    for (const q of orientation.suggestedQuestions.slice(0, 3)) {
      lines.push(`  • ${q}`);
    }
  }

  if (orientation.uncertainty.length > 0) {
    lines.push('\nWhat cannot be determined:');
    for (const u of orientation.uncertainty) {
      lines.push(`  — ${u}`);
    }
  }

  lines.push('--- END SPIRAL ORIENTATION ---');
  return lines.join('\n');
}
