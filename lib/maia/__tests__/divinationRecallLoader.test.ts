/**
 * JARVIS-MEMORY-ORGANISM-PASS1-DIVINATION-01 — loader + formatter certification.
 *
 * Acceptance proofs pinned here (lane record §4):
 *   (1) member A cannot retrieve member B's reading — user_id is a bound parameter on
 *       the only query; the loader has no code path that omits it.
 *   (2) no write during /list retrieval — the module source contains no write statement.
 *   (3) no Sanctuary bypass — the formatter renders nothing under sanctuary.
 *   (4) exact provenance represented honestly — three blocks, three authorships, the
 *       house text framed as corpus, the member text quoted, the cast framed as computed.
 *   (6) bounded — limit + window are bound parameters; clamped.
 */

jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));

import { readFileSync } from 'fs';
import { join } from 'path';
import { query } from '@/lib/db/postgres';
import {
  DEFAULT_LIMIT,
  DEFAULT_WINDOW_DAYS,
  MAX_MEMBER_TEXT_CHARS,
  dateLabel,
  formatDivinationForPrompt,
  loadRecentIChingReadings,
  summarizeDivinationForLog,
  type IChingReadingSnapshot,
} from '../divinationRecallLoader';

const mockedQuery = query as jest.MockedFunction<typeof query>;

const MEMBER_A = 'aaaaaaaa-0000-4000-8000-000000000001';
const NOW = new Date('2026-09-03T18:00:00Z');

function row(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'r-1',
    created_at: new Date('2026-09-02T15:59:00Z'),
    cast_method: 'coins',
    question: 'Should I take the studio offer or stay independent?',
    member_notes: null,
    is_favorite: false,
    primary_hex: 61,
    primary_hex_name: 'Inner Truth',
    line_values: [7, 8, 9, 7, 8, 7],
    changing_lines: [3],
    relating_hex: 40,
    relating_hex_name: 'Deliverance',
    lower_trigram: 'Lake',
    upper_trigram: 'Wind',
    interpretation_text: 'Inner truth moves through the situation like wind over a lake.',
    guidance_text: 'Trust what is already known within.',
    ...overrides,
  };
}

function snapshot(overrides: Partial<IChingReadingSnapshot> = {}): IChingReadingSnapshot {
  return {
    id: 'r-1',
    createdAt: new Date('2026-09-02T15:59:00Z'),
    castMethod: 'coins',
    question: 'Should I take the studio offer or stay independent?',
    memberNotes: null,
    isFavorite: false,
    primaryHex: 61,
    primaryHexName: 'Inner Truth',
    lineValues: [7, 8, 9, 7, 8, 7],
    changingLines: [3],
    relatingHex: 40,
    relatingHexName: 'Deliverance',
    lowerTrigram: 'Lake',
    upperTrigram: 'Wind',
    interpretationText: 'Inner truth moves through the situation like wind over a lake.',
    guidanceText: 'Trust what is already known within.',
    ...overrides,
  };
}

beforeEach(() => {
  mockedQuery.mockReset();
});

describe('loadRecentIChingReadings — read-only, user-scoped, bounded', () => {
  it('(1) binds the member id as $1 on the only query and scopes the WHERE to user_id', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [row()] } as any);
    const out = await loadRecentIChingReadings(MEMBER_A);
    expect(mockedQuery).toHaveBeenCalledTimes(1);
    const [sql, params] = mockedQuery.mock.calls[0];
    expect(String(sql)).toMatch(/WHERE\s+user_id\s*=\s*\$1/);
    expect(params?.[0]).toBe(MEMBER_A);
    expect(out).toHaveLength(1);
    expect(out[0].primaryHex).toBe(61);
  });

  it('(1) refuses an empty member id without touching the database', async () => {
    const out = await loadRecentIChingReadings('');
    expect(out).toEqual([]);
    expect(mockedQuery).not.toHaveBeenCalled();
  });

  it('(2) the module source carries no write statement', () => {
    const src = readFileSync(join(__dirname, '..', 'divinationRecallLoader.ts'), 'utf8');
    // Strip comments so the doc header ("Does NOT write") cannot be mistaken for code.
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    expect(code).not.toMatch(/\bINSERT\b/i);
    expect(code).not.toMatch(/\bUPDATE\b/i);
    expect(code).not.toMatch(/\bDELETE\b/i);
    expect(code).not.toMatch(/\bTRUNCATE\b/i);
  });

  it('(2) issues exactly one SELECT per load', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [] } as any);
    await loadRecentIChingReadings(MEMBER_A);
    expect(mockedQuery).toHaveBeenCalledTimes(1);
    expect(String(mockedQuery.mock.calls[0][0]).trim()).toMatch(/^SELECT\b/);
  });

  it('(6) excludes archived readings and binds limit + window as parameters', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [] } as any);
    await loadRecentIChingReadings(MEMBER_A);
    const [sql, params] = mockedQuery.mock.calls[0];
    expect(String(sql)).toMatch(/is_archived\s*=\s*FALSE/);
    expect(String(sql)).toMatch(/make_interval\(days => \$3\)/);
    expect(String(sql)).toMatch(/LIMIT \$2/);
    expect(params).toEqual([MEMBER_A, DEFAULT_LIMIT, DEFAULT_WINDOW_DAYS]);
  });

  it('(6) clamps caller-supplied bounds', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [] } as any);
    await loadRecentIChingReadings(MEMBER_A, { limit: 500, windowDays: 0 });
    expect(mockedQuery.mock.calls[0][1]).toEqual([MEMBER_A, 10, 1]);
  });

  it('fails soft to [] on a database error', async () => {
    mockedQuery.mockRejectedValueOnce(new Error('connection refused'));
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    await expect(loadRecentIChingReadings(MEMBER_A)).resolves.toEqual([]);
    warn.mockRestore();
  });

  it('normalises empty strings to null and missing arrays to []', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [row({ question: '   ', line_values: null, changing_lines: null, relating_hex: null, relating_hex_name: '' })] } as any);
    const [r] = await loadRecentIChingReadings(MEMBER_A);
    expect(r.question).toBeNull();
    expect(r.lineValues).toEqual([]);
    expect(r.changingLines).toEqual([]);
    expect(r.relatingHex).toBeNull();
    expect(r.relatingHexName).toBeNull();
  });
});

describe('formatDivinationForPrompt — three provenance-separated blocks', () => {
  it('(3) renders nothing under sanctuary, whatever the readings', () => {
    const out = formatDivinationForPrompt([snapshot()], { sanctuary: true });
    expect(out).toEqual({ emitted: false, surfacedCount: 0, suppressedReason: 'sanctuary' });
  });

  it('renders nothing when there are no readings', () => {
    const out = formatDivinationForPrompt([], { sanctuary: false });
    expect(out).toEqual({ emitted: false, surfacedCount: 0, suppressedReason: 'empty' });
  });

  it('(4) partitions member text, computed cast, and house corpus into three separate blocks', () => {
    const out = formatDivinationForPrompt([snapshot()], { sanctuary: false });
    expect(out.emitted).toBe(true);
    expect(out.surfacedCount).toBe(1);

    // member-authored block: the member's question, quoted; no house text; no cast numbers as claims
    expect(out.intent).toContain("# MEMBER'S I CHING QUESTIONS (member-authored)");
    expect(out.intent).toContain('asked: "Should I take the studio offer or stay independent?"');
    expect(out.intent).not.toContain('wind over a lake');

    // computed block: hexagram, trigrams, changing lines, relating hexagram, method
    expect(out.cast).toContain('# I CHING CASTS ON RECORD (computed)');
    expect(out.cast).toContain('Hexagram 61 Inner Truth');
    expect(out.cast).toContain('Lake below / Wind above');
    expect(out.cast).toContain('changing line 3');
    expect(out.cast).toContain('relating hexagram 40 Deliverance');
    expect(out.cast).toContain('cast by coins');
    expect(out.cast).not.toContain('Should I take the studio offer');
    expect(out.cast).not.toContain('wind over a lake');

    // house block: framed as corpus, not the member's words
    expect(out.interpretation).toContain("# HOUSE I CHING INTERPRETATION (Soullab corpus, not the member's words)");
    expect(out.interpretation).toContain('interpretation: Inner truth moves through the situation like wind over a lake.');
    expect(out.interpretation).toContain('guidance: Trust what is already known within.');
    expect(out.interpretation).not.toContain('Should I take the studio offer');
  });

  it('(4) every block line carries the reading date', () => {
    const out = formatDivinationForPrompt([snapshot()], { sanctuary: false });
    for (const block of [out.intent, out.cast, out.interpretation]) {
      expect(block).toContain('2026-09-02');
    }
  });

  it('(4) omits the member block when no reading carries member text, and the house block when no corpus text was stored', () => {
    const out = formatDivinationForPrompt(
      [snapshot({ question: null, memberNotes: null, interpretationText: null, guidanceText: null })],
      { sanctuary: false },
    );
    expect(out.intent).toBeUndefined();
    expect(out.interpretation).toBeUndefined();
    expect(out.cast).toBeDefined();
    expect(out.emitted).toBe(true);
  });

  it('(4) member notes are rendered in the member block, not the house block', () => {
    const out = formatDivinationForPrompt([snapshot({ memberNotes: 'This landed — I said yes.' })], { sanctuary: false });
    expect(out.intent).toContain('member\'s notes: "This landed — I said yes."');
    expect(out.interpretation).not.toContain('I said yes');
    expect(out.cast).not.toContain('I said yes');
  });

  it('renders a reading with no changing lines and no relating hexagram honestly', () => {
    const out = formatDivinationForPrompt([snapshot({ changingLines: [], relatingHex: null, relatingHexName: null })], { sanctuary: false });
    expect(out.cast).toContain('no changing lines');
    expect(out.cast).not.toContain('relating hexagram');
  });

  it('carries the member favorite mark as a fact on the cast line', () => {
    const out = formatDivinationForPrompt([snapshot({ isFavorite: true })], { sanctuary: false });
    expect(out.cast).toContain('marked favorite by the member');
  });

  it('clips long member text at the declared bound without dropping the head', () => {
    const long = 'x'.repeat(MAX_MEMBER_TEXT_CHARS + 50);
    const out = formatDivinationForPrompt([snapshot({ question: long })], { sanctuary: false });
    expect(out.intent).toContain('asked: "' + 'x'.repeat(MAX_MEMBER_TEXT_CHARS - 1) + '…"');
  });

  it('every block ends with the no-unprompted-raise discipline line', () => {
    const out = formatDivinationForPrompt([snapshot()], { sanctuary: false });
    for (const block of [out.intent, out.cast, out.interpretation]) {
      expect(block).toContain('Do NOT raise a reading unprompted');
    }
  });

  it('log summary carries counts and sizes only — never content', () => {
    const out = formatDivinationForPrompt([snapshot()], { sanctuary: false });
    const log = summarizeDivinationForLog(out);
    expect(log.emitted).toBe(true);
    expect(log.surfacedCount).toBe(1);
    expect(log.intentChars).toBe(out.intent!.length);
    expect(log.castChars).toBe(out.cast!.length);
    expect(log.interpretationChars).toBe(out.interpretation!.length);
    expect(JSON.stringify(log)).not.toContain('studio offer');
    expect(JSON.stringify(log)).not.toContain('Inner Truth');
  });
});

describe('dateLabel', () => {
  it('pairs the ISO date with a relative phrase', () => {
    expect(dateLabel(new Date('2026-09-02T15:59:00Z'), NOW)).toBe('2026-09-02, yesterday');
    expect(dateLabel(new Date('2026-09-03T01:00:00Z'), NOW)).toBe('2026-09-03, today');
    expect(dateLabel(new Date('2026-08-20T01:00:00Z'), NOW)).toBe('2026-08-20, 2 weeks ago');
  });
});
