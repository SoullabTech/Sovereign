/**
 * Interruption Ledger — per-turn telemetry for the one property that cannot be a status.
 *
 * Interruptibility ("can reality still change the runtime?") cannot be a checkbox —
 * claiming it falsifies it. It can only be evidenced by INSTANCES of having-been-changed.
 * This module computes the measurable trace of those instances, per turn:
 *
 *   - friction : did the member correct / redirect / reject? (the ledger EVENT)
 *   - novelty  : did the response move, or restate? (cosine drop to prior responses)
 *   - elegance : lexical diversity / entropy / sentence-length variance (context)
 *
 * DISCIPLINE (load-bearing, not decoration):
 *   - Sanctuary turns are refused outright (returns null). No content, no telemetry. Absolute.
 *   - These are HEURISTIC SURFACE SIGNALS, not verdicts. A friction marker is a CANDIDATE
 *     interruption, validated downstream (Loop C), never a diagnosis of the member.
 *   - Operator-facing AGGREGATE only. Nothing here is surfaced to the member. Per-member
 *     diagnosis is the inversion failure mode and is out of scope by construction.
 *   - The ledger answers "when, exactly, were we last changed?" — never "are we open?"
 *
 * Wired: app/api/sovereign/app/maia/list/route.ts (fire-and-forget, agent_runs.meta,
 * agent_name='interruption-ledger', kill-switch INTERRUPTION_LEDGER_ENABLED='0').
 * No raw member/assistant content is persisted — scores and markers only.
 */

export interface TurnInput {
  memberMessage: string;
  assistantResponse: string;
  priorResponses: string[]; // recent prior assistant responses (any order)
  sanctuary?: boolean;
}

export interface FrictionSignals {
  correction: boolean;
  redirect: boolean;
  rejection: boolean;
  score: number; // 0..1 = distinct friction kinds / 3
  markers: string[];
}

export interface EleganceProxy {
  typeTokenRatio: number; // lexical diversity
  tokenEntropy: number; // bits
  sentenceLengthVariance: number;
}

export interface InterruptionMetadata {
  novelty: number; // 0..1, 1 = fully novel, low = restatement
  friction: FrictionSignals;
  elegance: EleganceProxy;
  isInterruption: boolean; // CANDIDATE: member friction present this turn (validated downstream)
}

// ---------- tokenization ----------
function tokenize(text: string): string[] {
  return text.toLowerCase().match(/[a-z0-9']+/g) ?? [];
}

function termFreq(tokens: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const t of tokens) m.set(t, (m.get(t) ?? 0) + 1);
  return m;
}

function cosine(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0;
  for (const [k, v] of a) {
    const w = b.get(k);
    if (w) dot += v * w;
  }
  let na = 0;
  for (const v of a.values()) na += v * v;
  let nb = 0;
  for (const v of b.values()) nb += v * v;
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/** 1 - max cosine similarity to any recent prior response. Low = restatement. */
export function noveltyScore(response: string, priors: string[]): number {
  const cur = termFreq(tokenize(response));
  if (cur.size === 0 || priors.length === 0) return 1;
  let maxSim = 0;
  for (const p of priors) {
    const sim = cosine(cur, termFreq(tokenize(p)));
    if (sim > maxSim) maxSim = sim;
  }
  return 1 - maxSim;
}

// ---------- friction (the ledger event) ----------
const CORRECTION =
  /\b(no|nope|not quite|that'?s not|that is not|actually|i meant|you'?re missing|wrong|incorrect|misread|misunderstood)\b/i;
const REDIRECT =
  /\b(instead|rather|let'?s|forget|drop that|move on|different|change of|back up|step back|refocus)\b/i;
const REJECTION =
  /\b(stop|don'?t|do not|never ?mind|that'?s enough|not what i|not helpful|disagree)\b/i;

export function frictionSignals(memberMessage: string): FrictionSignals {
  const markers: string[] = [];
  const correction = CORRECTION.test(memberMessage);
  const redirect = REDIRECT.test(memberMessage);
  const rejection = REJECTION.test(memberMessage);
  if (correction) markers.push('correction');
  if (redirect) markers.push('redirect');
  if (rejection) markers.push('rejection');
  return { correction, redirect, rejection, score: markers.length / 3, markers };
}

// ---------- elegance proxy ----------
export function eleganceProxy(text: string): EleganceProxy {
  const tokens = tokenize(text);
  const ttr = tokens.length ? new Set(tokens).size / tokens.length : 0;
  const tf = termFreq(tokens);
  let entropy = 0;
  for (const v of tf.values()) {
    const p = v / tokens.length;
    entropy -= p * Math.log2(p);
  }
  const lens = text
    .split(/[.!?]+/)
    .map((s) => tokenize(s).length)
    .filter((n) => n > 0);
  const mean = lens.length ? lens.reduce((a, b) => a + b, 0) / lens.length : 0;
  const variance = lens.length
    ? lens.reduce((a, b) => a + (b - mean) ** 2, 0) / lens.length
    : 0;
  return { typeTokenRatio: ttr, tokenEntropy: entropy, sentenceLengthVariance: variance };
}

// ---------- entry point ----------
/**
 * Per-turn interruption-ledger row. Returns null for Sanctuary turns (refused outright).
 * The ledger EVENT is friction; novelty and elegance are context, not the event.
 */
export function computeInterruptionMetadata(turn: TurnInput): InterruptionMetadata | null {
  if (turn.sanctuary) return null; // Sanctuary: no content, no telemetry. Non-negotiable.
  const friction = frictionSignals(turn.memberMessage);
  return {
    novelty: noveltyScore(turn.assistantResponse, turn.priorResponses),
    friction,
    elegance: eleganceProxy(turn.assistantResponse),
    isInterruption: friction.markers.length > 0,
  };
}
