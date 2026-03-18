/**
 * lib/supervision/transcriptAssembler.ts
 *
 * Transforms raw 5-second Whisper chunk rows from supervision_transcript_segments
 * into coherent, readable turns stored in supervision_assembled_turns.
 *
 * Assembly algorithm:
 *   1. Fetch final, non-empty segments ordered by chunk_index, end_ms
 *   2. Clean phantom prefixes (hallucinated Whisper repetitions)
 *   3. Remove overlap between adjacent chunk texts
 *   4. Group consecutive same-speaker chunks into turns (max 4 chunks or 30s)
 *   5. Persist to supervision_assembled_turns (idempotent — safe to re-run)
 */

import { query } from '@/lib/db/postgres';
import { detectPhantomPrefix, stripPhantomPrefix } from '@/lib/scribe/transcriptCleaner';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AssembledTurn {
  speaker: string;
  text: string;
  startMs: number;
  endMs: number;
  chunkIndexStart: number | null;
  chunkIndexEnd: number | null;
  rawSegmentCount: number;
}

interface RawSegmentRow {
  id: string;
  speaker: string;
  start_ms: number;
  end_ms: number;
  text: string;
  chunk_index: number | null;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Max chunks grouped into a single speaker turn */
const MAX_CHUNKS_PER_TURN = 4;

/** Max ms span for a single speaker turn (30 seconds) */
const MAX_TURN_SPAN_MS = 30_000;

/** Characters to scan at the end of chunk N for overlap with chunk N+1 */
const OVERLAP_TAIL_CHARS = 30;

/** Characters to scan at the start of chunk N+1 for the overlap */
const OVERLAP_SCAN_CHARS = 60;

// ---------------------------------------------------------------------------
// Overlap removal
// ---------------------------------------------------------------------------

/**
 * For each adjacent pair (N, N+1), trim the portion of N+1 that duplicates
 * the tail of N. This is common in Whisper streaming where the context prompt
 * bleeds the previous chunk's ending into the next recognition window.
 */
function removeChunkOverlaps(texts: string[]): { texts: string[]; trimCount: number } {
  if (texts.length < 2) return { texts, trimCount: 0 };

  const result = [...texts];
  let trimCount = 0;

  for (let i = 0; i < result.length - 1; i++) {
    const current = result[i];
    const next = result[i + 1];

    if (!current || !next) continue;

    const tail = current.slice(-OVERLAP_TAIL_CHARS).toLowerCase();
    const head = next.slice(0, OVERLAP_SCAN_CHARS).toLowerCase();

    const overlapIdx = head.indexOf(tail);
    if (overlapIdx !== -1) {
      // trim next to start after the overlap
      const trimAt = overlapIdx + tail.length;
      const trimmed = result[i + 1].slice(trimAt).trimStart();
      if (trimmed.length > 0) {
        result[i + 1] = trimmed;
        trimCount++;
      }
      // if trimming leaves nothing, keep original (safer than empty turn)
    }
  }

  return { texts: result, trimCount };
}

// ---------------------------------------------------------------------------
// Turn grouping
// ---------------------------------------------------------------------------

function groupIntoTurns(rows: RawSegmentRow[], cleanedTexts: string[]): AssembledTurn[] {
  if (rows.length === 0) return [];

  const turns: AssembledTurn[] = [];
  let turnChunks: string[] = [];
  let turnSpeaker = rows[0].speaker;
  let turnStartMs = rows[0].start_ms;
  let turnEndMs = rows[0].end_ms;
  let turnChunkIndexStart: number | null = rows[0].chunk_index;
  let turnChunkIndexEnd: number | null = rows[0].chunk_index;

  const flush = () => {
    if (turnChunks.length === 0) return;
    const text = turnChunks.join(' ').replace(/\s+/g, ' ').trim();
    // Drop turns that are empty after cleaning (phantom-only chunks)
    if (text.length < 5) {
      turnChunks = [];
      return;
    }
    turns.push({
      speaker: turnSpeaker,
      text,
      startMs: turnStartMs,
      endMs: turnEndMs,
      chunkIndexStart: turnChunkIndexStart,
      chunkIndexEnd: turnChunkIndexEnd,
      rawSegmentCount: turnChunks.length,
    });
    turnChunks = [];
  };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const text = cleanedTexts[i];

    const spanMs = row.end_ms - turnStartMs;
    const speakerChanged = row.speaker !== turnSpeaker;
    const tooManyChunks = turnChunks.length >= MAX_CHUNKS_PER_TURN;
    const tooLong = spanMs > MAX_TURN_SPAN_MS;

    if (speakerChanged || tooManyChunks || tooLong) {
      flush();
      turnSpeaker = row.speaker;
      turnStartMs = row.start_ms;
      turnChunkIndexStart = row.chunk_index;
    }

    turnChunks.push(text);
    turnEndMs = row.end_ms;
    turnChunkIndexEnd = row.chunk_index;
  }

  flush();

  return turns;
}

// ---------------------------------------------------------------------------
// Core assembler
// ---------------------------------------------------------------------------

/**
 * Fetch raw segments for a supervision session, clean them, and return
 * assembled turns. Does NOT write to the database.
 */
export async function assembleSessionTranscript(sessionId: string): Promise<AssembledTurn[]> {
  const result = await query<RawSegmentRow>(
    `SELECT id, speaker, start_ms, end_ms, text, chunk_index
     FROM supervision_transcript_segments
     WHERE session_id = $1
       AND is_final = true
       AND text IS NOT NULL
       AND length(trim(text)) > 5
     ORDER BY chunk_index ASC NULLS LAST, end_ms ASC`,
    [sessionId]
  );

  const rows = result.rows;
  if (rows.length === 0) {
    console.log(`[Assembler] No final segments found for session ${sessionId}`);
    return [];
  }

  console.log(`[Assembler] Processing ${rows.length} raw segments for session ${sessionId}`);

  // 1. Extract raw texts
  const rawTexts = rows.map(r => r.text.trim());

  // 2. Phantom prefix detection + stripping
  const phantom = detectPhantomPrefix(rawTexts);
  const cleanedAfterPhantom = phantom ? stripPhantomPrefix(rawTexts, phantom) : rawTexts;
  if (phantom) {
    console.log(`[Assembler] Phantom prefix detected and stripped: "${phantom.slice(0, 60)}..."`);
  }

  // 3. Adjacent overlap removal
  const { texts: cleanedTexts, trimCount } = removeChunkOverlaps(cleanedAfterPhantom);
  if (trimCount > 0) {
    console.log(`[Assembler] Overlap trims applied: ${trimCount}`);
  }

  // 4. Group into turns
  const turns = groupIntoTurns(rows, cleanedTexts);

  console.log(`[Assembler] Assembled ${turns.length} turns from ${rows.length} segments`);

  return turns;
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

/**
 * Save assembled turns to supervision_assembled_turns.
 * Idempotent: deletes existing rows for the session first.
 */
export async function saveAssembledTranscript(
  sessionId: string,
  turns: AssembledTurn[]
): Promise<void> {
  // Replace on re-assembly
  await query(`DELETE FROM supervision_assembled_turns WHERE session_id = $1`, [sessionId]);

  if (turns.length === 0) return;

  for (const turn of turns) {
    await query(
      `INSERT INTO supervision_assembled_turns
         (session_id, speaker, text, start_ms, end_ms,
          chunk_index_start, chunk_index_end, raw_segment_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        sessionId,
        turn.speaker,
        turn.text,
        turn.startMs,
        turn.endMs,
        turn.chunkIndexStart ?? null,
        turn.chunkIndexEnd ?? null,
        turn.rawSegmentCount,
      ]
    );
  }

  console.log(`[Assembler] Saved ${turns.length} assembled turns for session ${sessionId}`);
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

/**
 * Retrieve assembled turns for a session.
 * Returns null if assembly has not been run yet (0 rows).
 */
export async function getAssembledTranscript(sessionId: string): Promise<AssembledTurn[] | null> {
  const result = await query<{
    speaker: string;
    text: string;
    start_ms: number;
    end_ms: number;
    chunk_index_start: number | null;
    chunk_index_end: number | null;
    raw_segment_count: number;
  }>(
    `SELECT speaker, text, start_ms, end_ms,
            chunk_index_start, chunk_index_end, raw_segment_count
     FROM supervision_assembled_turns
     WHERE session_id = $1
     ORDER BY start_ms ASC`,
    [sessionId]
  );

  if (result.rows.length === 0) return null;

  return result.rows.map(r => ({
    speaker: r.speaker,
    text: r.text,
    startMs: r.start_ms,
    endMs: r.end_ms,
    chunkIndexStart: r.chunk_index_start,
    chunkIndexEnd: r.chunk_index_end,
    rawSegmentCount: r.raw_segment_count,
  }));
}

// ---------------------------------------------------------------------------
// Run (assemble + save, return metadata)
// ---------------------------------------------------------------------------

export interface AssemblyResult {
  turnCount: number;
  rawSegmentCount: number;
  phantomRemoved: string | null;
  droppedEmptyTurns: number;
  overlapTrimsApplied: number;
}

/**
 * Full pipeline: fetch raw segments → assemble → save → return metadata.
 * Safe to call multiple times (idempotent).
 */
export async function runAssembly(sessionId: string): Promise<AssemblyResult> {
  // Count raw segments before assembly for metadata
  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count
     FROM supervision_transcript_segments
     WHERE session_id = $1 AND is_final = true AND text IS NOT NULL AND length(trim(text)) > 5`,
    [sessionId]
  );
  const rawSegmentCount = parseInt(countResult.rows[0]?.count ?? '0', 10);

  // Detect phantom prefix separately for metadata (assembleSessionTranscript does it internally)
  let phantomRemoved: string | null = null;
  if (rawSegmentCount > 0) {
    const previewResult = await query<{ text: string }>(
      `SELECT text FROM supervision_transcript_segments
       WHERE session_id = $1 AND is_final = true AND text IS NOT NULL AND length(trim(text)) > 5
       ORDER BY chunk_index ASC NULLS LAST, end_ms ASC
       LIMIT 20`,
      [sessionId]
    );
    const previewTexts = previewResult.rows.map(r => r.text.trim());
    phantomRemoved = detectPhantomPrefix(previewTexts);
  }

  const turns = await assembleSessionTranscript(sessionId);
  await saveAssembledTranscript(sessionId, turns);

  const droppedEmptyTurns = rawSegmentCount > 0
    ? Math.max(0, rawSegmentCount - turns.reduce((sum, t) => sum + t.rawSegmentCount, 0))
    : 0;

  console.log(
    `[Assembler] session=${sessionId.slice(0, 8)} raw=${rawSegmentCount} turns=${turns.length}` +
    ` phantom=${phantomRemoved ? 'yes' : 'no'} dropped=${droppedEmptyTurns}`
  );

  return {
    turnCount: turns.length,
    rawSegmentCount,
    phantomRemoved,
    droppedEmptyTurns,
    overlapTrimsApplied: 0, // reported per-call inside assembleSessionTranscript logs
  };
}
