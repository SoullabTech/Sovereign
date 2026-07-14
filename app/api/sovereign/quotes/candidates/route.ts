// Production web requires force-dynamic for runtime database access
// Capacitor builds: API routes are moved aside by scripts/build-capacitor.sh
export const dynamic = 'force-dynamic';

/**
 * Quote Candidates — first wire of the two-class quote-extraction substrate.
 *
 * POST /api/sovereign/quotes/candidates
 *
 * Runs lib/analysis/extractQuotes over the member's OWN recent journal writing
 * and returns lines that exist character-for-character in that writing. This is
 * the first importer of the extraction substrate (previously library + CLI
 * only): the observable proof that member material → preserved authorship can
 * happen on a live route.
 *
 * DOCTRINE (load-bearing):
 *   - MEMBER-PULLED ONLY. This route answers an explicit member request and
 *     nothing else. No detector, scheduler, or background job may call it; its
 *     output must never surface ambiently. (Mirrors the member-mark discipline
 *     of app/api/sovereign/episodes/mark/route.ts.)
 *   - EVIDENCE, NEVER MEANING. The response carries each candidate's exact
 *     source characters, its surrounding context, and where it came from —
 *     nothing else. The extractor's interpretive fields (`resonance`,
 *     `score`) are deliberately dropped server-side: ranking may use them,
 *     the member never sees them. Which lines matter is the member's call.
 *   - PROPOSES, NEVER KEEPS. This route writes nothing. Keeping a line is a
 *     separate member gesture (POST /api/sovereign/episodes/mark) that this
 *     route neither performs nor references. Suggest is within the ratified
 *     interaction grammar (juxtapose / organize / ask / suggest / scaffold);
 *     origination and auto-keeping are not.
 *   - FIRST-PARTY ONLY. Reads only journal entries the member authored
 *     (episodic_memories rows bridged from quick journal, keyed by the
 *     caller's credential). No parameter can name another member.
 *   - UI PLACEMENT DEFERRED. The Marked Moments room is copy-guarded
 *     (promises holding only) and room composition is founder-governed, so
 *     this ships route-first; the first proof is an authenticated request.
 *     Stage language: wired/reachable — not surfacing, not Live.
 *
 * AUTHORITY
 *   - lib/analysis/extractQuotes.ts (verbatim class: model proposes, code
 *     verifies char-for-char; paraphrase and invention rejected)
 *   - docs/pitch/DEVELOPMENTAL_PUBLISHING_SYSTEM_CANDIDATE.md v0.4 (ratified
 *     interaction grammar; provenance-per-passage)
 *
 * 200 { candidates, sourceEntryCount, provider }, 401 if no member,
 * 404 if the member has no journal writing yet.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { extractQuotes } from '@/lib/analysis/extractQuotes';

/** Journal-bridged episodic rows (see app/api/journal/quick — bridgeToEpisodicMemory). */
interface JournalRow {
  episode_id: string;
  experience_description: string;
  timestamp: string;
}

/** Caps: member-pulled LLM work stays bounded and predictable. */
const MAX_ENTRIES = 12;
const MAX_SOURCE_CHARS = 60_000;
const DEFAULT_MAX_QUOTES = 7;
const MAX_MAX_QUOTES = 12;

interface QuoteCandidate {
  /** Exact source characters — the member's own words, never the model's rendering. */
  text: string;
  /** ~One sentence of surrounding source text, for recognition. */
  context: string;
  /** Always 'verbatim' on this route: located character-for-character in the writing. */
  provenance: 'verbatim';
  /** Which journal entry the line lives in. */
  sourceEpisodeId: string;
  /** When that entry was written. */
  sourceDate: string;
}

export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }

  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: unknown = {};
    try {
      body = await request.json();
    } catch {
      // Empty body is fine — all inputs are optional.
    }
    const requested = (body as { maxQuotes?: unknown })?.maxQuotes;
    const maxQuotes =
      typeof requested === 'number' && Number.isFinite(requested)
        ? Math.max(1, Math.min(MAX_MAX_QUOTES, Math.floor(requested)))
        : DEFAULT_MAX_QUOTES;

    // The member's own recent journal writing, newest first. Journal-bridged
    // rows carry the entry text in experience_description with a
    // quick_journal_* context marker (see app/api/journal/quick).
    const rows = await query<JournalRow>(
      `SELECT episode_id, experience_description, timestamp
         FROM episodic_memories
        WHERE user_id = $1
          AND experience_context LIKE 'quick_journal_%'
          AND experience_description IS NOT NULL
          AND length(experience_description) > 0
        ORDER BY timestamp DESC
        LIMIT $2`,
      [memberId, MAX_ENTRIES],
    );

    if (rows.rows.length === 0) {
      return NextResponse.json(
        { error: 'No journal writing found for this member yet' },
        { status: 404 },
      );
    }

    // Join entries into one source, tracking each entry's span so every
    // located quote maps back to the entry it lives in. The separator is
    // paragraph-shaped so the extractor's chunker treats entries as distinct.
    const SEPARATOR = '\n\n';
    type Span = { start: number; end: number; row: JournalRow };
    const spans: Span[] = [];
    let source = '';
    for (const row of rows.rows) {
      if (source.length > 0) source += SEPARATOR;
      if (source.length >= MAX_SOURCE_CHARS) break;
      const start = source.length;
      source += row.experience_description.slice(0, MAX_SOURCE_CHARS - source.length);
      spans.push({ start, end: source.length, row });
    }

    const result = await extractQuotes(source, { maxQuotes, kind: 'journal' });

    // Evidence only: exact text, context, provenance class, source pointer.
    // `resonance` and `score` are interpretive and are dropped here on purpose.
    const candidates: QuoteCandidate[] = result.quotes.map((q) => {
      const span = spans.find((s) => q.start >= s.start && q.start < s.end);
      return {
        text: q.text,
        context: q.context,
        provenance: 'verbatim' as const,
        sourceEpisodeId: span?.row.episode_id ?? 'unknown',
        sourceDate: span?.row.timestamp ?? '',
      };
    });

    // Discoverable log marker. Counts only, never content.
    console.log(
      `[MAIA/sovereign] quote candidates { memberIdPrefix: ${memberId.slice(0, 8)}, ` +
        `entries: ${spans.length}, candidates: ${candidates.length}, ` +
        `rejected: ${result.rejected.length}, provider: ${result.provider} }`,
    );

    return NextResponse.json({
      candidates,
      sourceEntryCount: spans.length,
      provider: result.provider,
    });
  } catch (err) {
    console.error('[quotes/candidates] POST error:', err);
    return NextResponse.json({ error: 'Failed to extract quote candidates' }, { status: 500 });
  }
}
