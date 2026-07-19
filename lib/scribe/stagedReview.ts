/**
 * Staged session review — map-reduce synthesis for long encounters.
 *
 * Ruling (Kelly, 2026-07-19): a 373-turn / 139-minute session is a NORMAL
 * production session. The review must preserve the whole encounter, not
 * truncate it and not merely wait longer on one giant call. So long sessions
 * are reviewed in two stages:
 *
 *   MAP    — split the full transcript into ordered, bounded chunks at turn
 *            boundaries; produce a faithful structured digest per chunk.
 *   REDUCE — synthesize every chunk digest into the requested artifact
 *            (Overview / Outline / Insights / free question).
 *
 * Design constraints honored here:
 *  - Coverage: every turn lands in exactly one chunk (asserted by tests).
 *  - No false completeness: if any chunk digest fails after bounded retry,
 *    the whole review fails with an explicit stage — never a synthesized
 *    artifact that silently omits part of the session.
 *  - Job model: the heavy work runs in a background job (Node standalone keeps
 *    it alive past the response). The HTTP route never blocks on the full
 *    generation, so no single request must survive it — which is what turned
 *    the old single-call path into a gateway "Connection error".
 *  - Cache: digests are cached per (session, transcript hash, chunk, prompt
 *    version); artifacts per (…, mode, question). Switching tabs or refreshing
 *    reuses work and never launches a duplicate concurrent generation.
 *  - Honest states: processing / failed(stage) are distinct and truthful.
 *  - The raw Transcript path is untouched (served elsewhere, verbatim).
 */

import crypto from 'crypto';
import { getLLMProvider } from '@/lib/consciousness/LLMProvider';
import type { ReviewTurn } from '@/lib/scribe/sessionReviewMode';

// ── Tunables ────────────────────────────────────────────────────────────────
/** At or below this turn count, the route uses the simple single-prompt path. */
export const SIMPLE_MAX_TURNS = 120;
/** Turns per chunk in the staged path. Bounded so each digest call is fast. */
export const CHUNK_TURNS = 40;
/** Concurrent chunk-digest calls. */
export const MAP_CONCURRENCY = 4;
/** Retries per chunk digest before the whole review fails. */
export const CHUNK_RETRIES = 2;
/** Bump when prompts change so stale cached artifacts are not reused. */
export const PROMPT_VERSION = 'sr-staged-v1';

const DIGEST_MAX_TOKENS = 750;
const SYNTH_MAX_TOKENS = 3000;

export type ReviewMode = 'overview' | 'outline' | 'insights' | 'question';

export interface StagedInput {
  sessionId: string;
  turns: ReviewTurn[];
  markersText: string;
  mode: ReviewMode;
  /** Raw user question — used verbatim for mode 'question', else ignored. */
  question: string;
  lens: string;
  clientName: string | null;
  sessionMeta: { container: string; durationMin: number; startedAt: Date; title: string | null };
}

export interface ChunkDigest {
  chunkIndex: number;
  turnRange: [number, number];
  timeRange: [string, string];
  digest: string;
}

export type ReviewStatus =
  | { status: 'complete'; result: string; chunks: number }
  | { status: 'processing'; progress: { done: number; total: number } }
  | { status: 'failed'; stage: 'digest' | 'synthesis'; reason: string; failedChunks?: number[] };

// ── Utilities ────────────────────────────────────────────────────────────────

export function hashTranscript(turns: ReviewTurn[]): string {
  const h = crypto.createHash('sha256');
  for (const t of turns) h.update(`${t.speaker}${t.text}`);
  return h.digest('hex').slice(0, 16);
}

export function isLongSession(turnCount: number): boolean {
  return turnCount > SIMPLE_MAX_TURNS;
}

/**
 * Split ordered turns into contiguous chunks of at most CHUNK_TURNS.
 * Invariant (tested): concatenating the chunks in order reproduces the input
 * exactly — every turn is represented in exactly one chunk, none duplicated,
 * none dropped.
 */
export function chunkTurns(turns: ReviewTurn[], size: number = CHUNK_TURNS): ReviewTurn[][] {
  if (size < 1) throw new Error('chunk size must be >= 1');
  const chunks: ReviewTurn[][] = [];
  for (let i = 0; i < turns.length; i += size) {
    chunks.push(turns.slice(i, i + size));
  }
  return chunks;
}

function normalizeQuestion(mode: ReviewMode, question: string): string {
  if (mode !== 'question') return mode;
  return question.trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 200);
}

export function artifactKey(input: StagedInput, transcriptHash: string): string {
  return [
    input.sessionId,
    transcriptHash,
    input.lens,
    normalizeQuestion(input.mode, input.question),
    PROMPT_VERSION,
  ].join('|');
}

function digestKey(sessionId: string, transcriptHash: string, chunkIndex: number): string {
  return `${sessionId}|${transcriptHash}|${chunkIndex}|${PROMPT_VERSION}`;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

// ── MAP: per-chunk digest ────────────────────────────────────────────────────

function formatChunkTranscript(chunk: ReviewTurn[]): string {
  return chunk.map(t => `[${t.tsLabel}] ${t.speaker}: ${t.text}`).join('\n');
}

const DIGEST_SYSTEM = `You are MAIA producing a faithful structured digest of ONE segment of a longer session transcript. This digest will later be combined with the digests of the other segments to review the whole session. Preserve, do not interpret beyond the material, and do not invent.

For this segment, capture concisely under these headings (omit a heading only if the segment genuinely has nothing for it):
- Chronology: what happened, in order.
- Turning points: moments where something shifted.
- Participant language: short exact quotes that carry weight (with [mm:ss]).
- Unresolved questions: what was opened and not closed.
- Contradictions/tensions: anything that pulled against itself.
- Marked moments: if any occur in this segment.

Anchor claims to timestamps like [12:34]. Use the speakers' own words. If the segment is thin, say so. Never fabricate. Keep it compact — this is evidence for a later synthesis, not the final review.`;

async function digestChunk(
  chunk: ReviewTurn[],
  chunkIndex: number
): Promise<ChunkDigest> {
  const transcript = formatChunkTranscript(chunk);
  const user = `Segment ${chunkIndex + 1} — turns ${chunk[0].index}–${chunk[chunk.length - 1].index}, time ${chunk[0].tsLabel}–${chunk[chunk.length - 1].tsLabel}:\n\n${transcript}\n\nProduce the structured digest for this segment.`;

  let lastErr: unknown;
  for (let attempt = 0; attempt <= CHUNK_RETRIES; attempt++) {
    try {
      const res = await getLLMProvider().generateSimple({
        tier: 'core',
        forceClaude: true,
        systemPrompt: DIGEST_SYSTEM,
        messages: [{ role: 'user', content: user }],
        maxTokens: DIGEST_MAX_TOKENS,
        temperature: 0.4,
      });
      const text = (res.text || '').trim();
      if (!text) throw new Error('empty digest');
      return {
        chunkIndex,
        turnRange: [chunk[0].index, chunk[chunk.length - 1].index],
        timeRange: [chunk[0].tsLabel, chunk[chunk.length - 1].tsLabel],
        digest: text,
      };
    } catch (err) {
      lastErr = err;
    }
  }
  throw new Error(`chunk ${chunkIndex} digest failed: ${lastErr instanceof Error ? lastErr.message : String(lastErr)}`);
}

// ── REDUCE: synthesize digests into the requested artifact ────────────────────

function synthesisInstruction(mode: ReviewMode, question: string, clientName: string | null): string {
  const who = clientName ? `with ${clientName}` : 'this session';
  switch (mode) {
    case 'overview':
      return `Provide a layered overview of ${who}: what happened across the whole session, how it moved from beginning to end, what mattered, and what remains alive and unresolved.`;
    case 'outline':
      return `Provide a structured outline of ${who} — the main sections in order and how the session moved from beginning to end.`;
    case 'insights':
      return `Surface the key insights and themes across the whole of ${who}.`;
    case 'question':
    default:
      return question;
  }
}

const SYNTH_SYSTEM = `You are MAIA in Session Review mode, synthesizing a review of a COMPLETE session from ordered digests of its segments. Each digest faithfully represents one segment; together they cover the entire session in order. Build your answer from ALL of them — preserve chronology, carry forward turning points, contradictions, participant language, unresolved questions, and marked moments. Reference moments by their [mm:ss] timestamps. This is reflection, not interpretation: use the speakers' own language, never fabricate, and name what remains unresolved rather than forcing closure. Close by inviting the practitioner to correct you.`;

async function synthesize(
  digests: ChunkDigest[],
  input: StagedInput
): Promise<string> {
  const lensLine = `Active lens: ${input.lens.toUpperCase()}.`;
  const digestBlock = digests
    .map(
      d =>
        `### Segment ${d.chunkIndex + 1} (turns ${d.turnRange[0]}–${d.turnRange[1]}, ${d.timeRange[0]}–${d.timeRange[1]})\n${d.digest}`
    )
    .join('\n\n');

  const sessionLabel = input.clientName
    ? `Session with ${input.clientName}`
    : input.sessionMeta.title || `${input.sessionMeta.container} session`;

  const user = `${lensLine}

# Session
**Label:** ${sessionLabel}
**Container:** ${input.sessionMeta.container}
**Duration:** ${input.sessionMeta.durationMin} minutes
**Coverage:** ${digests.length} segments, complete (every part of the session is represented below).

# Markers placed during the session
${input.markersText}

# Ordered segment digests (the whole session, in order)
${digestBlock}

# Task
${synthesisInstruction(input.mode, input.question, input.clientName)}`;

  const res = await getLLMProvider().generateSimple({
    tier: 'core',
    forceClaude: true,
    systemPrompt: SYNTH_SYSTEM,
    messages: [{ role: 'user', content: user }],
    maxTokens: SYNTH_MAX_TOKENS,
    temperature: 0.7,
  });
  const text = (res.text || '').trim();
  if (!text) throw new Error('empty synthesis');
  return text;
}

// ── Caches + job registry (in-process) ───────────────────────────────────────

const digestCache = new Map<string, ChunkDigest>();
const artifactCache = new Map<string, { result: string; chunks: number }>();

interface Job {
  state: 'processing' | 'complete' | 'failed';
  progress: { done: number; total: number };
  result?: string;
  chunks?: number;
  failure?: { stage: 'digest' | 'synthesis'; reason: string; failedChunks?: number[] };
}
const jobs = new Map<string, Job>();

/** Test/ops hook — clear all in-process state. */
export function _resetStagedReviewState(): void {
  digestCache.clear();
  artifactCache.clear();
  jobs.clear();
}

/**
 * Run the full map→reduce once. Digests are cached per chunk; if any chunk
 * fails after retries the whole review fails (no partial synthesis). Progress
 * is reported through the onProgress callback as chunk digests land.
 */
export async function runStagedReview(
  input: StagedInput,
  transcriptHash: string,
  onProgress?: (done: number, total: number) => void
): Promise<ReviewStatus> {
  const chunks = chunkTurns(input.turns);
  const total = chunks.length;
  let done = 0;

  const digests: ChunkDigest[] = new Array(total);
  const failedChunks: number[] = [];

  await mapWithConcurrency(chunks, MAP_CONCURRENCY, async (chunk, i) => {
    const dk = digestKey(input.sessionId, transcriptHash, i);
    const cached = digestCache.get(dk);
    if (cached) {
      digests[i] = cached;
      done++;
      onProgress?.(done, total);
      return;
    }
    try {
      const d = await digestChunk(chunk, i);
      digestCache.set(dk, d);
      digests[i] = d;
    } catch {
      failedChunks.push(i);
    } finally {
      done++;
      onProgress?.(done, total);
    }
  });

  if (failedChunks.length > 0) {
    // No false completeness: refuse to synthesize an incomplete session.
    return {
      status: 'failed',
      stage: 'digest',
      reason: `${failedChunks.length} of ${total} segments could not be digested`,
      failedChunks: failedChunks.sort((a, b) => a - b),
    };
  }

  try {
    const result = await synthesize(digests, input);
    const ak = artifactKey(input, transcriptHash);
    artifactCache.set(ak, { result, chunks: total });
    return { status: 'complete', result, chunks: total };
  } catch (err) {
    return {
      status: 'failed',
      stage: 'synthesis',
      reason: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Job-based entry the route calls for long sessions. Returns immediately:
 *  - complete  → served from artifact cache
 *  - processing→ a job is running (dedup: one job per artifact key, so tab
 *                switches / refresh / re-entry rejoin the same job)
 *  - failed    → the job failed; the job is cleared so a later user action
 *                starts a fresh attempt (explicit retry, not auto-retry).
 */
export function getOrStartReview(
  input: StagedInput,
  transcriptHash: string
): ReviewStatus & { started: boolean } {
  const ak = artifactKey(input, transcriptHash);

  const cached = artifactCache.get(ak);
  if (cached) return { status: 'complete', result: cached.result, chunks: cached.chunks, started: false };

  const existing = jobs.get(ak);
  if (existing) {
    if (existing.state === 'complete') {
      return { status: 'complete', result: existing.result!, chunks: existing.chunks ?? 0, started: false };
    }
    if (existing.state === 'failed') {
      jobs.delete(ak);
      return { status: 'failed', ...existing.failure!, started: false };
    }
    return { status: 'processing', progress: existing.progress, started: false };
  }

  const total = chunkTurns(input.turns).length;
  const job: Job = { state: 'processing', progress: { done: 0, total } };
  jobs.set(ak, job);

  // Fire-and-forget: outlives the HTTP response in the standalone Node server.
  void runStagedReview(input, transcriptHash, (d, t) => {
    job.progress = { done: d, total: t };
  })
    .then(outcome => {
      if (outcome.status === 'complete') {
        job.state = 'complete';
        job.result = outcome.result;
        job.chunks = outcome.chunks;
      } else if (outcome.status === 'failed') {
        job.state = 'failed';
        job.failure = { stage: outcome.stage, reason: outcome.reason, failedChunks: outcome.failedChunks };
      }
    })
    .catch(err => {
      job.state = 'failed';
      job.failure = { stage: 'synthesis', reason: err instanceof Error ? err.message : String(err) };
    });

  return { status: 'processing', progress: job.progress, started: true };
}
