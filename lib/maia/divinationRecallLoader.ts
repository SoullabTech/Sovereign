/**
 * Divination Recall Loader — durable I Ching readings made available to the ordinary
 * /list conversation, through the one canonical lineage.
 *
 * Lane: JARVIS-MEMORY-ORGANISM-PASS1-DIVINATION-01 (Pass 1 — turn on what exists).
 * Charter: docs/programme/MAIA_JARVIS_MEMORY_ORGANISM_FULL_OPERATIONALIZATION.md
 * Lane record: docs/programme/JARVIS-MEMORY-ORGANISM-PASS1-DIVINATION-01.md
 *
 * Authority chain:
 *   - database/migrations/20260130000001_bazi_iching_tables.sql (divination_iching_readings)
 *   - database/migrations/20260201000001_divination_readings.sql (member_notes / is_archived)
 *   - lib/maia/canonical-turn/producerRegistry.ts (the three producers this loader feeds)
 *   - lib/maia/memoryAtomsLoader.ts / lib/maia/episodicRecallBlock.ts (the pattern mirrored)
 *
 * PROVENANCE — assigned from the WRITE PATH, not guessed (founder directive 2026-09-03).
 *   Two writers exist for divination_iching_readings:
 *     1. lib/services/divinationService.saveIChingReading ← POST /api/divination/save
 *        (requireMemberId; a member save act after a cast on the divination surface)
 *     2. lib/divination/iching/wuxing-enhanced-casting.persistReading
 *        (persists when options.userId is set and persist !== false; MAIA-side casting)
 *   Both write the SAME separable fields, and the fields do not share an author:
 *     question, member_notes            → the MEMBER's words           (member / authored)
 *     primary_hex, line_values,
 *     changing_lines, relating_hex,
 *     trigrams, cast_method            → the CAST, computed by the      (system / computed)
 *                                        casting engine under the
 *                                        member's invocation
 *     interpretation_text,
 *     guidance_text                    → HOUSE corpus text keyed to the  (house / authored)
 *                                        hexagram (lib/divination/iching/
 *                                        hexagrams.ts soulInterpretation
 *                                        / guidance), copied at write
 *                                        time; NOT model-generated, NOT
 *                                        the member's words
 *   A single block mixing these would collapse three authorships into one scalar — the
 *   exact conflation pdc-1 forbids. This loader therefore renders THREE CandidateBlocks,
 *   one per producer, and the registry classifies each on its own three axes.
 *
 * What this module does:
 *   - Reads the member's own recent, un-archived I Ching readings (bounded: last
 *     DEFAULT_LIMIT within DEFAULT_WINDOW_DAYS). Read-only; explicit column list.
 *   - Renders three provenance-separated prompt blocks, each line dated.
 *
 * What this module does NOT do:
 *   - Does NOT write. No INSERT / UPDATE / DELETE exists in this file (pinned by test).
 *   - Does NOT read another member's readings — user_id is a bound parameter on every query.
 *   - Does NOT render anything under Sanctuary (defense-in-depth; MIPA holds it again).
 *   - Does NOT re-interpret the cast, synthesize across readings, or rank by salience.
 *     Pass 1 relevance is the bounded recency window; a salience engine is excluded.
 *   - Does NOT instruct MAIA to raise readings unprompted (see discipline line in each block).
 */

import { query } from '@/lib/db/postgres';

// ════════════════════════════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════════════════════════════

export type IChingCastMethod = 'coins' | 'yarrow' | 'rng' | 'manual';

export interface IChingReadingSnapshot {
  id: string;
  createdAt: Date;
  castMethod: IChingCastMethod | string;
  /** Member-authored: the question brought to the cast (nullable at write). */
  question: string | null;
  /** Member-authored: notes the member added after the reading (nullable). */
  memberNotes: string | null;
  /** Member-marked flag — carried as a fact, never used to rank. */
  isFavorite: boolean;
  /** System-computed cast. */
  primaryHex: number;
  primaryHexName: string;
  lineValues: number[];
  changingLines: number[];
  relatingHex: number | null;
  relatingHexName: string | null;
  lowerTrigram: string;
  upperTrigram: string;
  /** House corpus text copied at write time (hexagrams.ts). */
  interpretationText: string | null;
  guidanceText: string | null;
}

export interface DivinationLoadOptions {
  /** Max readings, most recent first. */
  limit?: number;
  /** Only readings cast within this many days. */
  windowDays?: number;
}

export const DEFAULT_LIMIT = 3;
export const DEFAULT_WINDOW_DAYS = 60;
/** Per-field clip for member text — long enough that a question survives whole. */
export const MAX_MEMBER_TEXT_CHARS = 600;
/** Per-field clip for house corpus text. */
export const MAX_HOUSE_TEXT_CHARS = 700;

// ════════════════════════════════════════════════════════════════════════════
// Loader (read-only)
// ════════════════════════════════════════════════════════════════════════════

interface Row {
  id: string;
  created_at: Date | string;
  cast_method: string;
  question: string | null;
  member_notes: string | null;
  is_favorite: boolean | null;
  primary_hex: number;
  primary_hex_name: string;
  line_values: number[] | null;
  changing_lines: number[] | null;
  relating_hex: number | null;
  relating_hex_name: string | null;
  lower_trigram: string;
  upper_trigram: string;
  interpretation_text: string | null;
  guidance_text: string | null;
}

/**
 * Load the member's own recent I Ching readings. User-scoped by bound parameter;
 * archived readings excluded; bounded by limit + window. Fails soft to [].
 */
export async function loadRecentIChingReadings(
  userId: string,
  options: DivinationLoadOptions = {},
): Promise<IChingReadingSnapshot[]> {
  if (!userId) return [];
  const limit = clampInt(options.limit ?? DEFAULT_LIMIT, 1, 10);
  const windowDays = clampInt(options.windowDays ?? DEFAULT_WINDOW_DAYS, 1, 365);
  try {
    const result = await query<Row>(
      `SELECT id, created_at, cast_method, question, member_notes, is_favorite,
              primary_hex, primary_hex_name, line_values, changing_lines,
              relating_hex, relating_hex_name, lower_trigram, upper_trigram,
              interpretation_text, guidance_text
         FROM divination_iching_readings
        WHERE user_id = $1
          AND is_archived = FALSE
          AND created_at > NOW() - make_interval(days => $3)
        ORDER BY created_at DESC
        LIMIT $2`,
      [userId, limit, windowDays],
    );
    return result.rows.map(rowToSnapshot);
  } catch (err) {
    console.warn('[divinationRecallLoader] loadRecentIChingReadings failed (non-fatal):', err);
    return [];
  }
}

function rowToSnapshot(r: Row): IChingReadingSnapshot {
  return {
    id: r.id,
    createdAt: r.created_at instanceof Date ? r.created_at : new Date(r.created_at),
    castMethod: r.cast_method,
    question: emptyToNull(r.question),
    memberNotes: emptyToNull(r.member_notes),
    isFavorite: r.is_favorite === true,
    primaryHex: r.primary_hex,
    primaryHexName: r.primary_hex_name,
    lineValues: Array.isArray(r.line_values) ? r.line_values : [],
    changingLines: Array.isArray(r.changing_lines) ? r.changing_lines : [],
    relatingHex: r.relating_hex ?? null,
    relatingHexName: emptyToNull(r.relating_hex_name),
    lowerTrigram: r.lower_trigram,
    upperTrigram: r.upper_trigram,
    interpretationText: emptyToNull(r.interpretation_text),
    guidanceText: emptyToNull(r.guidance_text),
  };
}

function emptyToNull(v: string | null | undefined): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t.length > 0 ? t : null;
}

function clampInt(n: number, lo: number, hi: number): number {
  if (!Number.isFinite(n)) return lo;
  return Math.max(lo, Math.min(hi, Math.floor(n)));
}

// ════════════════════════════════════════════════════════════════════════════
// Formatter — three provenance-separated blocks
// ════════════════════════════════════════════════════════════════════════════

export type DivinationSuppressionContext = {
  /** Sanctuary session — defense-in-depth; the route already skips the loader. */
  sanctuary: boolean;
};

export type DivinationBlockResult = {
  /** member / authored — the member's question + notes. Undefined when no member text exists. */
  intent?: string;
  /** system / computed — the cast itself. */
  cast?: string;
  /** house / authored — the corpus interpretation keyed to the cast hexagram. */
  interpretation?: string;
  emitted: boolean;
  surfacedCount: number;
  suppressedReason?: 'sanctuary' | 'empty';
};

const DISCIPLINE =
  'Discipline: these are records of the member\'s own readings, dated. Speak from them ' +
  'when the member refers to a reading, a hexagram, or what the I Ching said — answer ' +
  'from the record, do not reconstruct from memory of the conversation. Do NOT raise a ' +
  'reading unprompted, do not re-cast, and do not claim the reading means anything ' +
  'beyond what the member asks about.';

export function formatDivinationForPrompt(
  readings: IChingReadingSnapshot[],
  ctx: DivinationSuppressionContext,
): DivinationBlockResult {
  if (ctx.sanctuary) return { emitted: false, surfacedCount: 0, suppressedReason: 'sanctuary' };
  if (!readings || readings.length === 0) return { emitted: false, surfacedCount: 0, suppressedReason: 'empty' };

  const intent = renderIntentBlock(readings);
  const cast = renderCastBlock(readings);
  const interpretation = renderInterpretationBlock(readings);

  return {
    ...(intent ? { intent } : {}),
    ...(cast ? { cast } : {}),
    ...(interpretation ? { interpretation } : {}),
    emitted: Boolean(cast),
    surfacedCount: readings.length,
  };
}

/** MEMBER-AUTHORED: question + notes. Empty when no reading carries member text. */
function renderIntentBlock(readings: IChingReadingSnapshot[]): string | undefined {
  const lines: string[] = [];
  for (const r of readings) {
    const parts: string[] = [];
    if (r.question) parts.push(`asked: "${clip(r.question, MAX_MEMBER_TEXT_CHARS)}"`);
    if (r.memberNotes) parts.push(`member's notes: "${clip(r.memberNotes, MAX_MEMBER_TEXT_CHARS)}"`);
    if (parts.length === 0) continue;
    lines.push(`- ${dateLabel(r.createdAt)} (${castRef(r)}) — ${parts.join(' — ')}`);
  }
  if (lines.length === 0) return undefined;
  return [
    '# MEMBER\'S I CHING QUESTIONS (member-authored)',
    '',
    'What the member themselves brought to each reading — their question, and any notes ' +
      'they added afterward. These are the member\'s own words, quoted, not system inference.',
    '',
    ...lines,
    '',
    DISCIPLINE,
    '',
  ].join('\n');
}

/** SYSTEM-COMPUTED: the cast, as the casting engine produced it under the member's invocation. */
function renderCastBlock(readings: IChingReadingSnapshot[]): string | undefined {
  const lines: string[] = [];
  for (const r of readings) {
    const parts: string[] = [`Hexagram ${r.primaryHex} ${r.primaryHexName}`];
    parts.push(`${r.lowerTrigram} below / ${r.upperTrigram} above`);
    if (r.changingLines.length > 0) {
      parts.push(`changing line${r.changingLines.length > 1 ? 's' : ''} ${r.changingLines.join(', ')}`);
    } else {
      parts.push('no changing lines');
    }
    if (r.relatingHex) {
      parts.push(`relating hexagram ${r.relatingHex}${r.relatingHexName ? ' ' + r.relatingHexName : ''}`);
    }
    parts.push(`cast by ${r.castMethod}`);
    if (r.isFavorite) parts.push('marked favorite by the member');
    lines.push(`- ${dateLabel(r.createdAt)} — ${parts.join(' — ')}`);
  }
  if (lines.length === 0) return undefined;
  return [
    '# I CHING CASTS ON RECORD (computed)',
    '',
    `The member's ${readings.length === 1 ? 'most recent reading' : `${readings.length} most recent readings`} ` +
      `within the last ${DEFAULT_WINDOW_DAYS} days. The cast is what the casting engine produced when ` +
      'the member invoked it — a computed fact of record, not an interpretation.',
    '',
    ...lines,
    '',
    DISCIPLINE,
    '',
  ].join('\n');
}

/** HOUSE-AUTHORED: corpus interpretation/guidance keyed to the hexagram, copied at write time. */
function renderInterpretationBlock(readings: IChingReadingSnapshot[]): string | undefined {
  const lines: string[] = [];
  for (const r of readings) {
    if (!r.interpretationText && !r.guidanceText) continue;
    lines.push(`- ${dateLabel(r.createdAt)} (${castRef(r)}):`);
    if (r.interpretationText) lines.push(`    interpretation: ${clip(r.interpretationText, MAX_HOUSE_TEXT_CHARS)}`);
    if (r.guidanceText) lines.push(`    guidance: ${clip(r.guidanceText, MAX_HOUSE_TEXT_CHARS)}`);
  }
  if (lines.length === 0) return undefined;
  return [
    '# HOUSE I CHING INTERPRETATION (Soullab corpus, not the member\'s words)',
    '',
    'The interpretation and guidance text stored with each reading is Soullab\'s hexagram ' +
      'corpus, keyed to the cast. It is house-authored — neither the member\'s words nor a ' +
      'prior MAIA reading. Attribute it as the corpus text if you draw on it.',
    '',
    ...lines,
    '',
    DISCIPLINE,
    '',
  ].join('\n');
}

// ════════════════════════════════════════════════════════════════════════════
// Helpers
// ════════════════════════════════════════════════════════════════════════════

function castRef(r: IChingReadingSnapshot): string {
  return `Hexagram ${r.primaryHex}${r.relatingHex ? ` → ${r.relatingHex}` : ''}`;
}

/** ISO date + relative phrase, so the block carries provenance either way. */
export function dateLabel(d: Date, now: Date = new Date()): string {
  const iso = d.toISOString().slice(0, 10);
  return `${iso}, ${relativeTime(d, now)}`;
}

function relativeTime(d: Date, now: Date): string {
  const day = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  if (day < 1) return 'today';
  if (day === 1) return 'yesterday';
  if (day < 7) return `${day} days ago`;
  if (day < 14) return 'last week';
  if (day < 30) return `${Math.floor(day / 7)} weeks ago`;
  if (day < 60) return 'last month';
  return `${Math.floor(day / 30)} months ago`;
}

function clip(s: string, max: number): string {
  const t = s.replace(/\s+/g, ' ').trim();
  return t.length > max ? t.slice(0, max - 1) + '…' : t;
}

/** Log summary — counts and flags only, never content. */
export function summarizeDivinationForLog(result: DivinationBlockResult): {
  emitted: boolean;
  surfacedCount: number;
  suppressedReason?: string;
  intentChars: number;
  castChars: number;
  interpretationChars: number;
} {
  return {
    emitted: result.emitted,
    surfacedCount: result.surfacedCount,
    ...(result.suppressedReason ? { suppressedReason: result.suppressedReason } : {}),
    intentChars: result.intent?.length ?? 0,
    castChars: result.cast?.length ?? 0,
    interpretationChars: result.interpretation?.length ?? 0,
  };
}
