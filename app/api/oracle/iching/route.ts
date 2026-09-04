export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  castIChing,
  findHexagramFromLines,
  LineValue
} from '@/lib/divination';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { divinationService, type SaveIChingInput } from '@/lib/services/divinationService';
import { memberRef } from '@/lib/privacy/memberRef';

/**
 * I Ching Oracle API
 * POST /api/oracle/iching
 *
 * Accepts a query and optional pre-cast lines, returns a complete reading.
 *
 * PERSISTENCE (Cut 1C — JARVIS-MEMORY-ORGANISM-PASS1-DIVINATION-01, 2026-09-03):
 *   A recognized member's cast is persisted through the EXISTING writer,
 *   divinationService.saveIChingReading → divination_iching_readings, so that Cut 1B
 *   (lib/maia/divinationRecallLoader) can make the reading available to the ordinary
 *   /list conversation. Census 2026-09-03: the member's reading from the observed episode
 *   existed in conversation_turns but not in divination_iching_readings — this route
 *   produced it and threw it away.
 *
 *   - Identity is resolved ONLY from the verified session credential (getMemberIdFromRequest).
 *     A body user_id is never read. An anonymous cast still returns a reading; it does not persist.
 *   - Both the pre-cast-lines path and the fresh-cast path persist through the same seam.
 *   - Persistence failure is non-fatal: the member still receives the cast; the failure is
 *     logged; the response says `persisted: false` — never a fabricated success.
 *   - No new SQL writer, no new table, no migration, no idempotency machinery.
 */

interface IChingRequest {
  query: string;
  method?: 'yarrow' | 'coins';
  lines?: Array<{ type: 'yang' | 'yin'; changing: boolean; value: number }>;
}

/** What the member sees, and (for a recognized member) what is written. */
interface ProducedReading {
  response: Record<string, unknown>;
  record: SaveIChingInput;
}

const CAST_METHODS = new Set<SaveIChingInput['cast_method']>(['coins', 'yarrow', 'rng', 'manual']);

export async function POST(request: NextRequest) {
  try {
    const body: IChingRequest = await request.json();
    const { query, method = 'yarrow', lines } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const castMethod: SaveIChingInput['cast_method'] = CAST_METHODS.has(method as SaveIChingInput['cast_method'])
      ? (method as SaveIChingInput['cast_method'])
      : 'yarrow';

    const produced = lines && Array.isArray(lines) && lines.length === 6
      ? produceFromPreCastLines(query, castMethod, lines.map(l => l.value as LineValue))
      : produceFreshCast(query, castMethod);

    // Identity from the verified session only — never from the body. A failing identity
    // store degrades to an anonymous (unpersisted) cast rather than losing the reading.
    const memberId = await resolveMemberOrNull(request);
    const persisted = memberId ? await persistForMember(memberId, produced.record) : null;

    return NextResponse.json({
      reading: produced.response,
      persisted: persisted !== null,
      ...(persisted ? { readingId: persisted } : {}),
    });
  } catch (error) {
    console.error('I Ching oracle error:', error);
    return NextResponse.json(
      { error: 'Failed to generate reading' },
      { status: 500 }
    );
  }
}

// ── Reading construction (unchanged member-facing shape) ──────────────────────

function produceFromPreCastLines(query: string, castMethod: SaveIChingInput['cast_method'], lineValues: LineValue[]): ProducedReading {
  const { hexagram, changingLines, transformedHexagram } = findHexagramFromLines(lineValues);

  // Extract just the changing line meanings for lines that are changing
  const changingLineMeanings = changingLines.map(lineNum => ({
    line: lineNum,
    meaning: hexagram.changingLinesMeanings[lineNum - 1] // 1-indexed to 0-indexed
  }));

  const response = {
    hexagram: {
      number: hexagram.number,
      name: hexagram.englishName,
      keyword: hexagram.keyword,
      lines: hexagram.lines.map(l => l === 'yang' ? '-------' : '--- ---'),
      trigrams: {
        upper: hexagram.trigrams.upper,
        lower: hexagram.trigrams.lower
      },
      interpretation: hexagram.soulInterpretation,
      guidance: hexagram.guidance,
      timing: hexagram.timing,
      changingLines: changingLines,
      changingLineMeanings: changingLineMeanings,
      transformed: transformedHexagram ? {
        number: transformedHexagram.number,
        name: transformedHexagram.englishName,
        keyword: transformedHexagram.keyword
      } : undefined
    },
    insight: hexagram.soulInterpretation,
    guidance: hexagram.guidance,
    sacredTiming: hexagram.timing,
    archetypalTheme: hexagram.archetypeCorrespondence,
    ritual: `Light a candle and meditate on the image of ${hexagram.englishName}. Journal about how this hexagram relates to your question: "${query}". Notice any changing lines as markers of transformation in your situation.`
  };

  return {
    response,
    record: {
      question: query,
      cast_method: castMethod,
      primary_hex: hexagram.number,
      primary_hex_name: hexagram.englishName,
      line_values: [...lineValues],
      changing_lines: changingLines,
      relating_hex: transformedHexagram?.number,
      relating_hex_name: transformedHexagram?.englishName,
      lower_trigram: hexagram.trigrams.lower,
      upper_trigram: hexagram.trigrams.upper,
      interpretation_text: hexagram.soulInterpretation,
      guidance_text: hexagram.guidance,
      sacred_timing: hexagram.timing,
    },
  };
}

function produceFreshCast(query: string, castMethod: SaveIChingInput['cast_method']): ProducedReading {
  // Cast fresh using the library
  const castReading = castIChing(query, castMethod === 'coins' ? 'coins' : 'yarrow');
  const hexagram = castReading.primaryHexagram;
  const transformedHexagram = castReading.transformedHexagram;

  // Extract just the changing line meanings for lines that are changing
  const freshChangingLineMeanings = castReading.changingLines.map(lineNum => ({
    line: lineNum,
    meaning: hexagram.changingLinesMeanings[lineNum - 1]
  }));

  const response = {
    hexagram: {
      number: hexagram.number,
      name: hexagram.englishName,
      keyword: hexagram.keyword,
      lines: hexagram.lines.map(l => l === 'yang' ? '-------' : '--- ---'),
      trigrams: {
        upper: hexagram.trigrams.upper,
        lower: hexagram.trigrams.lower
      },
      interpretation: hexagram.soulInterpretation,
      guidance: hexagram.guidance,
      timing: hexagram.timing,
      changingLines: castReading.changingLines,
      changingLineMeanings: freshChangingLineMeanings,
      transformed: transformedHexagram ? {
        number: transformedHexagram.number,
        name: transformedHexagram.englishName,
        keyword: transformedHexagram.keyword
      } : undefined
    },
    insight: castReading.insight,
    guidance: castReading.soulGuidance,
    sacredTiming: hexagram.timing,
    archetypalTheme: hexagram.archetypeCorrespondence,
    ritual: castReading.ritual?.steps.join(' ')
  };

  return {
    response,
    record: {
      question: query,
      cast_method: castMethod,
      primary_hex: hexagram.number,
      primary_hex_name: hexagram.englishName,
      line_values: [...castReading.castLines],
      changing_lines: castReading.changingLines,
      relating_hex: transformedHexagram?.number,
      relating_hex_name: transformedHexagram?.englishName,
      lower_trigram: hexagram.trigrams.lower,
      upper_trigram: hexagram.trigrams.upper,
      // What the member was shown: corpus interpretation (+ transformation note) and
      // guidance (+ changing-line text) — the same house text the response carries.
      interpretation_text: castReading.insight,
      guidance_text: castReading.soulGuidance,
      sacred_timing: hexagram.timing,
    },
  };
}

// ── Identity (session credential only) ────────────────────────────────────────

async function resolveMemberOrNull(request: NextRequest): Promise<string | null> {
  try {
    return await getMemberIdFromRequest(request);
  } catch (err) {
    console.warn('[oracle/iching] identity resolution failed — treating cast as anonymous (not persisted)', err instanceof Error ? err.message : String(err));
    return null;
  }
}

// ── Persistence seam (the ONE writer) ─────────────────────────────────────────

/**
 * Persist through divinationService.saveIChingReading. Returns the row id, or null on
 * failure. Never throws — a failed write must not turn a valid cast into a 500.
 */
async function persistForMember(memberId: string, record: SaveIChingInput): Promise<string | null> {
  try {
    const saved = await divinationService.saveIChingReading(record, memberId);
    if (saved?.id) {
      console.log('[oracle/iching] reading persisted', { memberRef: memberRef(memberId), readingId: saved.id, primaryHex: record.primary_hex });
      return saved.id;
    }
    console.warn('[oracle/iching] reading NOT persisted (writer returned null)', { memberRef: memberRef(memberId), primaryHex: record.primary_hex });
    return null;
  } catch (err) {
    console.warn('[oracle/iching] reading NOT persisted (writer threw)', { memberRef: memberRef(memberId), error: err instanceof Error ? err.message : String(err) });
    return null;
  }
}
