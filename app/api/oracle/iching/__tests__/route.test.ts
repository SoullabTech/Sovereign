/**
 * Cut 1C — JARVIS-MEMORY-ORGANISM-PASS1-DIVINATION-01: oracle I Ching persistence.
 *
 * Pinned properties (founder authorization 2026-09-03):
 *   - anonymous request → reading returned, saveIChingReading never called
 *   - recognized member → exactly one save call with the authenticated member id
 *   - body cannot choose another member
 *   - pre-cast lines persist their actual line_values
 *   - fresh cast persists its actual line_values
 *   - question persists verbatim
 *   - primary/relating hexagram, trigrams, changing lines, interpretation, guidance map correctly
 *   - save failure does not turn a valid cast into HTTP 500
 *   - no second persistence implementation appears in the route
 *
 * Hermetic: identity resolver and the divination writer are mocked; the casting library is real.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { readFileSync } from 'fs';
import { join } from 'path';
import { NextRequest } from 'next/server';
import { findHexagramFromLines, type LineValue } from '@/lib/divination';

const MEMBER = '11111111-1111-4111-8111-111111111111';
const OTHER = '22222222-2222-4222-8222-222222222222';

const mockGetMemberId = jest.fn<(req: unknown) => Promise<string | null>>();
jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: (req: unknown) => mockGetMemberId(req),
}));

const mockSave = jest.fn<(input: Record<string, unknown>, userId: string) => Promise<{ id: string } | null>>();
jest.mock('@/lib/services/divinationService', () => ({
  divinationService: {
    saveIChingReading: (input: Record<string, unknown>, userId: string) => mockSave(input, userId),
  },
}));

import { POST } from '../route';

function post(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/oracle/iching', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// Hexagram 61 Inner Truth: lines bottom→top = yang yang yin yin yang yang; line 3 old yin (6) → changes.
const PRE_CAST: LineValue[] = [7, 7, 6, 8, 7, 7];
const preCastLines = PRE_CAST.map((value) => ({ type: value % 2 === 1 ? 'yang' : 'yin', changing: value === 6 || value === 9, value }));

beforeEach(() => {
  mockGetMemberId.mockReset();
  mockSave.mockReset();
  mockSave.mockResolvedValue({ id: 'reading-1' });
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('anonymous cast', () => {
  it('returns the reading and never calls the writer', async () => {
    mockGetMemberId.mockResolvedValue(null);
    const res = await POST(post({ query: 'What now?', method: 'coins' }));
    expect(res.status).toBe(200);
    const json = (await res.json()) as { reading: { hexagram: { number: number } }; persisted: boolean; readingId?: string };
    expect(json.reading.hexagram.number).toBeGreaterThanOrEqual(1);
    expect(json.persisted).toBe(false);
    expect(json.readingId).toBeUndefined();
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('a body user_id does not make an anonymous cast persist', async () => {
    mockGetMemberId.mockResolvedValue(null);
    const res = await POST(post({ query: 'q', user_id: OTHER, userId: OTHER, lines: preCastLines }));
    expect(res.status).toBe(200);
    expect(mockSave).not.toHaveBeenCalled();
  });
});

describe('recognized member — pre-cast lines path', () => {
  it('persists exactly once, scoped to the authenticated member, with the actual line_values', async () => {
    mockGetMemberId.mockResolvedValue(MEMBER);
    const res = await POST(post({ query: 'Should I take the studio offer?', method: 'coins', lines: preCastLines }));
    expect(res.status).toBe(200);
    const json = (await res.json()) as { persisted: boolean; readingId?: string };
    expect(json.persisted).toBe(true);
    expect(json.readingId).toBe('reading-1');

    expect(mockSave).toHaveBeenCalledTimes(1);
    const [record, userId] = mockSave.mock.calls[0];
    expect(userId).toBe(MEMBER);
    expect(record.line_values).toEqual(PRE_CAST);
    expect(record.cast_method).toBe('coins');
    expect(record.question).toBe('Should I take the studio offer?');
  });

  it('maps hexagram, relating hexagram, trigrams, changing lines, interpretation and guidance from the cast', async () => {
    mockGetMemberId.mockResolvedValue(MEMBER);
    const expected = findHexagramFromLines(PRE_CAST);
    await POST(post({ query: 'q', lines: preCastLines }));
    const [record] = mockSave.mock.calls[0];
    expect(record.primary_hex).toBe(expected.hexagram.number);
    expect(record.primary_hex_name).toBe(expected.hexagram.englishName);
    expect(record.changing_lines).toEqual(expected.changingLines);
    expect(record.changing_lines).toEqual([3]);
    expect(record.relating_hex).toBe(expected.transformedHexagram?.number);
    expect(record.relating_hex_name).toBe(expected.transformedHexagram?.englishName);
    expect(record.lower_trigram).toBe(expected.hexagram.trigrams.lower);
    expect(record.upper_trigram).toBe(expected.hexagram.trigrams.upper);
    expect(record.interpretation_text).toBe(expected.hexagram.soulInterpretation);
    expect(record.guidance_text).toBe(expected.hexagram.guidance);
  });

  it('body user_id / userId cannot choose another member', async () => {
    mockGetMemberId.mockResolvedValue(MEMBER);
    await POST(post({ query: 'q', lines: preCastLines, user_id: OTHER, userId: OTHER, memberId: OTHER }));
    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(mockSave.mock.calls[0][1]).toBe(MEMBER);
    expect(JSON.stringify(mockSave.mock.calls[0][0])).not.toContain(OTHER);
  });
});

describe('recognized member — fresh cast path', () => {
  it('persists exactly once with the actual cast line_values and the response hexagram', async () => {
    mockGetMemberId.mockResolvedValue(MEMBER);
    const res = await POST(post({ query: 'A fresh question, verbatim.', method: 'yarrow' }));
    const json = (await res.json()) as { reading: { hexagram: { number: number; changingLines: number[]; transformed?: { number: number } } }; persisted: boolean };
    expect(json.persisted).toBe(true);
    expect(mockSave).toHaveBeenCalledTimes(1);
    const [record, userId] = mockSave.mock.calls[0];
    expect(userId).toBe(MEMBER);
    expect(record.question).toBe('A fresh question, verbatim.');
    expect(record.cast_method).toBe('yarrow');

    const lineValues = record.line_values as number[];
    expect(lineValues).toHaveLength(6);
    for (const v of lineValues) expect([6, 7, 8, 9]).toContain(v);
    // The persisted lines are the lines that produced the response hexagram.
    const recomputed = findHexagramFromLines(lineValues as LineValue[]);
    expect(record.primary_hex).toBe(recomputed.hexagram.number);
    expect(record.primary_hex).toBe(json.reading.hexagram.number);
    expect(record.changing_lines).toEqual(json.reading.hexagram.changingLines);
    expect(record.relating_hex).toBe(json.reading.hexagram.transformed?.number);
    expect(typeof record.interpretation_text).toBe('string');
    expect(typeof record.guidance_text).toBe('string');
  });
});

describe('persistence failure is non-fatal', () => {
  it('writer returns null → 200 with persisted:false and the reading intact', async () => {
    mockGetMemberId.mockResolvedValue(MEMBER);
    mockSave.mockResolvedValue(null);
    const res = await POST(post({ query: 'q', lines: preCastLines }));
    expect(res.status).toBe(200);
    const json = (await res.json()) as { reading: unknown; persisted: boolean; readingId?: string };
    expect(json.reading).toBeDefined();
    expect(json.persisted).toBe(false);
    expect(json.readingId).toBeUndefined();
  });

  it('writer throws → 200 with persisted:false, never a 500', async () => {
    mockGetMemberId.mockResolvedValue(MEMBER);
    mockSave.mockRejectedValue(new Error('db down'));
    const res = await POST(post({ query: 'q', lines: preCastLines }));
    expect(res.status).toBe(200);
    expect(((await res.json()) as { persisted: boolean }).persisted).toBe(false);
  });

  it('identity resolver throwing does not lose the cast either', async () => {
    mockGetMemberId.mockRejectedValue(new Error('session store down'));
    const res = await POST(post({ query: 'q', lines: preCastLines }));
    expect(res.status).toBe(200);
    expect(((await res.json()) as { persisted: boolean }).persisted).toBe(false);
    expect(mockSave).not.toHaveBeenCalled();
  });
});

describe('validation unchanged', () => {
  it('missing query → 400, nothing persisted', async () => {
    mockGetMemberId.mockResolvedValue(MEMBER);
    const res = await POST(post({}));
    expect(res.status).toBe(400);
    expect(mockSave).not.toHaveBeenCalled();
  });
});

describe('one writer', () => {
  it('the route carries no SQL of its own and persists only through divinationService', () => {
    const src = readFileSync(join(__dirname, '..', 'route.ts'), 'utf8');
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    expect(code).not.toMatch(/\bINSERT\b/i);
    expect(code).not.toMatch(/\bUPDATE\b/i);
    expect(code).not.toMatch(/lib\/db\/postgres/);
    expect(code).toMatch(/divinationService\.saveIChingReading\(/);
    expect((code.match(/saveIChingReading\(/g) ?? []).length).toBe(1);
    expect(code).not.toMatch(/body\.(user_id|userId|memberId)/);
  });
});
