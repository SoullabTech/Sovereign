#!/usr/bin/env node
/**
 * scripts/assemble-transcript.js
 *
 * Run the transcript assembler directly inside Docker without HTTP/auth.
 *
 * Usage (from host terminal):
 *   docker exec maia-sovereign node scripts/assemble-transcript.js <scribe-session-id>
 *
 * The scribe-session-id is looked up to find the supervision session,
 * then raw segments are fetched, phantom prefixes stripped, overlaps removed,
 * turns grouped, and supervision_assembled_turns is populated.
 */

'use strict';

const { Client } = require('pg');

const scribeSessionId = process.argv[2];
if (!scribeSessionId) {
  console.error('Usage: node scripts/assemble-transcript.js <scribe-session-id>');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Phantom prefix detection (mirrors lib/scribe/transcriptCleaner.ts)
// ---------------------------------------------------------------------------

function normalize(text) {
  return text.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
}

function detectPhantomPrefix(texts) {
  if (texts.length < 5) return null;
  const sample = texts.slice(0, Math.min(20, texts.length));
  const first = normalize(sample[0]);
  const words = first.split(' ');

  for (let len = Math.min(words.length, 15); len >= 3; len--) {
    const candidate = words.slice(0, len).join(' ');
    const matchCount = sample.filter(t => normalize(t).startsWith(candidate)).length;
    if (matchCount / sample.length >= 0.6) {
      // Reconstruct raw prefix from first text
      const rawWords = texts[0].split(' ');
      return rawWords.slice(0, len).join(' ');
    }
  }
  return null;
}

function stripPhantomPrefix(texts, prefix) {
  const normPrefix = normalize(prefix);
  return texts.map(t => {
    const normT = normalize(t);
    if (normT.startsWith(normPrefix)) {
      const stripped = t.slice(prefix.length).replace(/^[,\s.?!]+/, '').trim();
      return stripped;
    }
    return t;
  });
}

// ---------------------------------------------------------------------------
// Overlap removal
// ---------------------------------------------------------------------------

function removeChunkOverlaps(texts) {
  if (texts.length < 2) return texts;
  const result = [...texts];
  for (let i = 0; i < result.length - 1; i++) {
    const tail = (result[i] || '').slice(-30).toLowerCase();
    const head = (result[i + 1] || '').slice(0, 60).toLowerCase();
    const idx = head.indexOf(tail);
    if (idx !== -1) {
      const trimmed = result[i + 1].slice(idx + tail.length).trimStart();
      if (trimmed.length > 0) result[i + 1] = trimmed;
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Turn grouping
// ---------------------------------------------------------------------------

function groupIntoTurns(rows, texts) {
  if (rows.length === 0) return [];
  const MAX_CHUNKS = 4;
  const MAX_MS = 30000;
  const turns = [];
  let chunks = [];
  let speaker = rows[0].speaker || 'speaker';
  let startMs = rows[0].start_ms;
  let endMs = rows[0].end_ms;
  let ciStart = rows[0].chunk_index;
  let ciEnd = rows[0].chunk_index;

  const flush = () => {
    if (chunks.length === 0) return;
    const text = chunks.join(' ').replace(/\s+/g, ' ').trim();
    if (text.length >= 5) {
      turns.push({ speaker, text, startMs, endMs, ciStart, ciEnd, count: chunks.length });
    }
    chunks = [];
  };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const text = texts[i];
    if (!text || text.length < 3) continue;

    const span = row.end_ms - startMs;
    if (row.speaker !== speaker || chunks.length >= MAX_CHUNKS || span > MAX_MS) {
      flush();
      speaker = row.speaker || 'speaker';
      startMs = row.start_ms;
      ciStart = row.chunk_index;
    }
    chunks.push(text);
    endMs = row.end_ms;
    ciEnd = row.chunk_index;
  }
  flush();
  return turns;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();

  try {
    // 1. Find supervision session via scribe session id
    const supRes = await db.query(
      `SELECT id FROM supervision_sessions WHERE metadata->>'scribeSessionId' = $1 LIMIT 1`,
      [scribeSessionId]
    );

    if (supRes.rows.length === 0) {
      console.error(`No supervision session found for scribe session ${scribeSessionId}`);
      process.exit(1);
    }

    const supSessionId = supRes.rows[0].id;
    console.log(`[Assembler] supervision_session=${supSessionId}`);

    // 2. Fetch raw segments
    const segRes = await db.query(
      `SELECT id, speaker, start_ms, end_ms, text, chunk_index
       FROM supervision_transcript_segments
       WHERE session_id = $1
         AND is_final = true
         AND text IS NOT NULL
         AND length(trim(text)) > 5
       ORDER BY chunk_index ASC NULLS LAST, end_ms ASC`,
      [supSessionId]
    );

    const rows = segRes.rows;
    console.log(`[Assembler] raw segments=${rows.length}`);

    if (rows.length === 0) {
      console.log('[Assembler] Nothing to assemble.');
      return;
    }

    // 3. Phantom prefix detection
    const rawTexts = rows.map(r => r.text.trim());
    const phantom = detectPhantomPrefix(rawTexts);
    const afterPhantom = phantom ? stripPhantomPrefix(rawTexts, phantom) : rawTexts;
    if (phantom) console.log(`[Assembler] phantom prefix stripped: "${phantom.slice(0, 70)}"`);

    // 4. Overlap removal
    const cleanedTexts = removeChunkOverlaps(afterPhantom);

    // 5. Group into turns
    const turns = groupIntoTurns(rows, cleanedTexts);
    console.log(`[Assembler] assembled turns=${turns.length}`);

    // 6. Save (idempotent)
    await db.query(`DELETE FROM supervision_assembled_turns WHERE session_id = $1`, [supSessionId]);

    for (const t of turns) {
      await db.query(
        `INSERT INTO supervision_assembled_turns
           (session_id, speaker, text, start_ms, end_ms,
            chunk_index_start, chunk_index_end, raw_segment_count)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [supSessionId, t.speaker, t.text, t.startMs, t.endMs, t.ciStart, t.ciEnd, t.count]
      );
    }

    console.log(`[Assembler] done. phantom=${phantom ? 'yes' : 'no'} dropped=${rows.length - turns.reduce((s,t)=>s+t.count,0)}`);
  } finally {
    await db.end();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
