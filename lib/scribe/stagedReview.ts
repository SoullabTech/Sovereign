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
/**
 * Per-call timeouts. generateSimple has no timeout of its own, so without these
 * a single stalled Claude call hangs the whole map/reduce (Promise.all never
 * resolves) and the job sits in 'processing' forever — the client then polls
 * indefinitely with no failure. Bounding each call converts a stall into a
 * clean, honest, retryable failure. (Prod walk 2026-07-19: the synthesis call
 * stalled; digests had all completed.)
 */
const DIGEST_TIMEOUT_MS = 60_000;
const SYNTH_TIMEOUT_MS = 120_000;

class LLMTimeoutError extends Error {
  constructor(label: string, ms: number) {
    super(`${label} timed out after ${ms}ms`);
    this.name = 'LLMTimeoutError';
  }
}

/** Race an LLM call against a timeout so a stalled call rejects instead of hanging. */
async function callLLMWithTimeout(
  params: Parameters<ReturnType<typeof getLLMProvider>['generateSimple']>[0],
  timeoutMs: number,
  label: string
): Promise<{ text: string }> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new LLMTimeoutError(label, timeoutMs)), timeoutMs);
  });
  try {
    return (await Promise.race([getLLMProvider().generateSimple(params), timeout])) as { text: string };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

// Progressive disclosure — recognition first, meaning second, organization
// third, evidence (transcript) on demand. Each view is generated from the
// cached session map (the per-chunk digests), so the 2nd and 3rd views only
// pay for one synthesis call, not another full read of the transcript.
export type ReviewMode = 'overview' | 'elemental' | 'organizational' | 'question';

/** Phase reported to the client for honest, specific progress states. */
export type ReviewPhase = 'reading' | ReviewMode;

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

export interface ReviewProgress {
  done: number;
  total: number;
  phase: ReviewPhase;
}

export type ReviewStatus =
  | { status: 'complete'; result: string; chunks: number }
  | { status: 'processing'; progress: ReviewProgress }
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

// The digests together ARE the session map — the structured factual layer the
// views are generated from. So the digest captures the session-map fields, not
// an interpretation: chronology, speakers, quotes/refs, themes, questions,
// decisions/commitments, shifts, unresolved threads, marked moments.
const DIGEST_SYSTEM = `You are MAIA producing a faithful structured digest of ONE segment of a longer session transcript. These digests are combined into a factual "session map" that later views (Overview, Elemental/Psychological, Organizational) are built from. This is the MAP layer: record what is there; do not interpret, do not invent.

For this segment, capture concisely under these headings (omit a heading only if the segment genuinely has nothing for it):
- Chronology: what happened, in order, and by whom.
- Themes: what this segment was about.
- Turning points / shifts: where something changed — in topic, direction, or affect.
- Participant language: short exact quotes that carry weight, each with [mm:ss].
- Questions raised: what was opened.
- Decisions / commitments / next steps: anything agreed, chosen, or promised.
- Unresolved / tensions: what was left open or pulled against itself.
- People, events, dates, resources: concrete references mentioned.
- Marked moments: if any occur here.

Anchor claims to timestamps like [12:34]. Use the speakers' own words. If the segment is thin, say so. Never fabricate. Keep it compact — this is factual evidence for later views, not the review itself.`;

async function digestChunk(
  chunk: ReviewTurn[],
  chunkIndex: number
): Promise<ChunkDigest> {
  const transcript = formatChunkTranscript(chunk);
  const user = `Segment ${chunkIndex + 1} — turns ${chunk[0].index}–${chunk[chunk.length - 1].index}, time ${chunk[0].tsLabel}–${chunk[chunk.length - 1].tsLabel}:\n\n${transcript}\n\nProduce the structured digest for this segment.`;

  let lastErr: unknown;
  for (let attempt = 0; attempt <= CHUNK_RETRIES; attempt++) {
    try {
      const res = await callLLMWithTimeout(
        {
          tier: 'core',
          forceClaude: true,
          systemPrompt: DIGEST_SYSTEM,
          messages: [{ role: 'user', content: user }],
          maxTokens: DIGEST_MAX_TOKENS,
          temperature: 0.4,
        },
        DIGEST_TIMEOUT_MS,
        `digest chunk ${chunkIndex}`
      );
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

const SYNTH_BASE = `You are MAIA in Session Review mode, building a view of a COMPLETE session from an ordered "session map" — faithful digests of every segment, in order, covering the whole session. Build ONLY from the map: preserve chronology, use the speakers' own language, anchor to [mm:ss] timestamps, never fabricate anything not in the map, and name what remains unresolved rather than forcing closure. Close by inviting the practitioner to correct you.`;

// Recognition layer — fast, factual, "which session was this and what happened".
const OVERVIEW_SYSTEM = `${SYNTH_BASE}

This is the OVERVIEW — the recognition layer. Keep it concise and factual, optimized for a practitioner to quickly recognize and orient to the session. Minimize interpretation here; that belongs to the Elemental/Psychological view.`;

// Meaning layer — interpretive, with explicit epistemic status on every claim.
const ELEMENTAL_SYSTEM = `${SYNTH_BASE}

This is the ELEMENTAL & PSYCHOLOGICAL view — the meaning layer, and it is interpretive. You MUST mark the epistemic status of what you say, so the practitioner can tell evidence from inference. Use these labels inline or as short tags:
- "Said:" — directly expressed by a participant (quote/anchor it).
- "Observed:" — a pattern visible across the material.
- "Tentative:" — your interpretation, offered provisionally.
Never present a Tentative reading as fact. Where the material does not support a dimension, say so plainly rather than inventing it. This is reflection the practitioner integrates, not a diagnosis.`;

// Organization layer — the working structure of what follows.
const ORGANIZATIONAL_SYSTEM = `${SYNTH_BASE}

This is the ORGANIZATIONAL / PRACTITIONER view — the working structure of what follows from the session. Be practical and specific. Do not draft any client/parent communication here — only note where one might, through a deliberate consented workflow, be appropriate. Flag privacy-sensitive material to be held carefully.`;

function viewSystem(mode: ReviewMode): string {
  switch (mode) {
    case 'overview': return OVERVIEW_SYSTEM;
    case 'elemental': return ELEMENTAL_SYSTEM;
    case 'organizational': return ORGANIZATIONAL_SYSTEM;
    case 'question':
    default: return SYNTH_BASE;
  }
}

function synthesisInstruction(mode: ReviewMode, question: string, clientName: string | null): string {
  const who = clientName ? `this session with ${clientName}` : 'this session';
  switch (mode) {
    case 'overview':
      return `Produce a concise Overview of ${who} for fast recognition:
- what the session was primarily about;
- major themes;
- significant shifts or turning points;
- important questions that emerged;
- commitments and next steps;
- unresolved material;
- specific moments worth returning to (with [mm:ss]).`;
    case 'elemental':
      return `Produce the Elemental & Psychological reading of ${who}. Cover, where the material supports each:
- Fire — desire, agency, purpose, conflict, transformation;
- Water — emotion, relationship, vulnerability, grief, attachment;
- Earth — body, reality, resources, structure, practical needs;
- Air — beliefs, narratives, questions, insight, mental patterns;
- Aether / Field — meaning, coherence, emergence, deeper pattern.
Alongside: emotional and relational dynamics, psychological patterns, tensions and polarities, protective strategies or defenses, developmental movement, archetypal material where supported, and areas of aliveness vs areas needing care. Label every claim's epistemic status (Said / Observed / Tentative).`;
    case 'organizational':
      return `Produce the Organizational / Practitioner view of ${who}:
- themes to carry forward;
- follow-up questions;
- practices or experiments;
- promises and commitments;
- people, events, dates, and resources mentioned;
- material for the next session;
- possible relationship-field additions;
- privacy-sensitive material to hold carefully;
- any communication that would only be appropriate through a deliberate, consented workflow (note it; do not draft it).`;
    case 'question':
    default:
      return question;
  }
}

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

# Session map — ordered segment digests (the whole session, in order)
${digestBlock}

# Task
${synthesisInstruction(input.mode, input.question, input.clientName)}`;

  const startedAt = Date.now();
  console.log(`[SessionReview] synthesis start: mode=${input.mode}, ${digests.length} segments`);
  const res = await callLLMWithTimeout(
    {
      tier: 'core',
      forceClaude: true,
      systemPrompt: viewSystem(input.mode),
      messages: [{ role: 'user', content: user }],
      maxTokens: SYNTH_MAX_TOKENS,
      temperature: input.mode === 'overview' ? 0.5 : 0.7,
    },
    SYNTH_TIMEOUT_MS,
    `synthesis (${input.mode})`
  );
  const text = (res.text || '').trim();
  if (!text) throw new Error('empty synthesis');
  console.log(`[SessionReview] synthesis done: mode=${input.mode} in ${Date.now() - startedAt}ms, ${text.length} chars`);
  return text;
}

// ── Caches + job registry (in-process) ───────────────────────────────────────

const digestCache = new Map<string, ChunkDigest>();
const artifactCache = new Map<string, { result: string; chunks: number }>();

interface Job {
  state: 'processing' | 'complete' | 'failed';
  progress: ReviewProgress;
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
  onProgress?: (done: number, total: number, phase: ReviewPhase) => void
): Promise<ReviewStatus> {
  const chunks = chunkTurns(input.turns);
  const total = chunks.length;
  let done = 0;

  const digests: ChunkDigest[] = new Array(total);
  const failedChunks: number[] = [];

  // MAP — read the whole session into the cached session map.
  await mapWithConcurrency(chunks, MAP_CONCURRENCY, async (chunk, i) => {
    const dk = digestKey(input.sessionId, transcriptHash, i);
    const cached = digestCache.get(dk);
    if (cached) {
      digests[i] = cached;
      done++;
      onProgress?.(done, total, 'reading');
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
      onProgress?.(done, total, 'reading');
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

  // REDUCE — generate the requested view from the session map.
  onProgress?.(total, total, input.mode);
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
  const job: Job = { state: 'processing', progress: { done: 0, total, phase: 'reading' } };
  jobs.set(ak, job);

  // Fire-and-forget: outlives the HTTP response in the standalone Node server.
  void runStagedReview(input, transcriptHash, (d, t, phase) => {
    job.progress = { done: d, total: t, phase };
  })
    .then(outcome => {
      if (outcome.status === 'complete') {
        job.state = 'complete';
        job.result = outcome.result;
        job.chunks = outcome.chunks;
        console.log(`[SessionReview] job complete: ${input.sessionId.slice(0, 8)}… mode=${input.mode} (${outcome.chunks} segments)`);
      } else if (outcome.status === 'failed') {
        job.state = 'failed';
        job.failure = { stage: outcome.stage, reason: outcome.reason, failedChunks: outcome.failedChunks };
        console.error(`[SessionReview] job failed at ${outcome.stage}: ${outcome.reason}`);
      }
    })
    .catch(err => {
      job.state = 'failed';
      job.failure = { stage: 'synthesis', reason: err instanceof Error ? err.message : String(err) };
      console.error(`[SessionReview] job crashed:`, err);
    });

  return { status: 'processing', progress: job.progress, started: true };
}
