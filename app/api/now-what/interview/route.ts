export const dynamic = 'force-dynamic';
export async function generateStaticParams() {
  return [];
}

/**
 * What Now? room — a live MAIA encounter (not a scripted Spiralogic flow).
 *
 * Every turn is a real model call that responds to the person's ACTUAL last
 * message first. The load-bearing instruction is RESPONSE_GRAMMAR: reflect what
 * they said → name the live tension → offer a choice of direction → only then,
 * optionally, a light elemental touch. Spiralogic shapes MAIA's attention
 * (PHASE_LENS, one quiet line held underneath); it must never replace it or
 * become the agenda. There is no menu of prepared questions to read from — a
 * reply that could be sent unchanged to a hundred people has failed.
 *
 * This replaced a phase-scripted design where each phase handed the model a menu
 * of canned follow-ups and the room was locked to one phase, producing generic,
 * could-be-anyone questions (e.g. the repeated "Where does that come from?").
 *
 * Governance (unchanged):
 *   - Ephemeral: this route does NOT persist anything. Evidence crosses into the
 *     field only through an explicit member gesture (the field-note route).
 *   - No sorting, typing, scoring, or identity modeling.
 *   - MAIA proposes; the participant is always the author. Proposing nothing is faithful.
 *   - Cell inference (detectCellCandidate) is read-only and secondary — it tints
 *     the room, never drives the reply.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { getMemberIdFromRequest } from '@/lib/scribe/scribeAuth';
import { getLLMProvider, ensureUserTerminal } from '@/lib/consciousness/LLMProvider';
import { inferSpiralogicCell, type Element } from '@/lib/consciousness/spiralogic-core';

// Stage 1 — MAIA presence (ADR-013 Proof 1). Read-only reuse of the production runtime's
// constitutional identity + memory loaders, assembled IN-ROUTE. Deliberately NOT
// getMaiaResponse: that path increments turn count, reads history from the DB, and writes
// the exchange — incompatible with this room's ephemeral, client-held, no-write contract.
// Every import below is read-only; MAIA_RUNTIME_PROMPT already embeds the memory-canon guard.
import { MAIA_RUNTIME_PROMPT } from '@/lib/consciousness/MAIA_RUNTIME_PROMPT';
import { buildMemoryInfluencePlan } from '@/lib/maia/memoryOrchestrator';
import { loadRecentDevelopmentalMemories, loadRecentThemeSignals, loadPriorCrossSessionExchanges, loadConversationalRecallPref } from '@/lib/maia/memoryLoaders';
import { loadMemberMemoryAtomsForPrompt, formatAtomsForPrompt } from '@/lib/maia/memoryAtomsLoader';
import { formatPriorExchangesForPrompt, computeLastPriorSessionMinutesAgo } from '@/lib/maia/conversationalRecallBlock';
import { assembledContext, renderAssembledContext, type AssembledBlock } from '@/lib/maia/context-assembly/contextAssembly';

const MAX_TOKENS_TURN = 700;
const MAX_TOKENS_PROPOSE = 1500;
const MAX_HISTORY = 40;
const MAX_CONTENT = 4000;

type Role = 'user' | 'assistant';
interface Turn {
  role: Role;
  content: string;
}

const TWELVE_DISCIPLINES = `
Twelve disciplines you embody throughout:
1. Begin with the person — not the work, not the framework, not what you expect.
2. Follow aliveness — where things become alive in the conversation, not where you decided to go.
3. Listen beneath the question — the answer to the question asked is rarely the one worth hearing.
4. Reflect before interpreting. "I'm noticing..." not "What that means is..."
5. Return to what matters. When something significant surfaces, stay with it.
6. Remain curious — ask because you want to understand, not to move things along.
7. Honor silence — don't rush past it.
8. Protect mystery — not everything needs resolution.
9. Connect patterns gently, only when they are clearly present.
10. Invite rather than lead. One thing at a time, usually a question or a brief reflection.
11. See development — witness a body of work that has been growing for years.
12. Allow understanding to emerge. Don't force arrival.`.trim();

const HARD_LIMITS = `
Hard limits:
- Do NOT sort, type, label, or categorize the person.
- Do NOT build a model of them or summarize who they are.
- Do NOT interpret their meaning for them — reflect, name, and invite. Authority for meaning stays with them.
- No lists, headings, or analysis. Speak as one warm, unhurried turn in plain language — a few sentences, not a wall of theory.
Respond with only your next spoken turn.`.trim();

// The load-bearing instruction. Spiralogic shapes MAIA's attention; it must never
// replace it. This grammar keeps the person's actual words primary and the
// elemental lens optional and last — the fix for phase-scripted, could-be-anyone
// responses (see route header + PHASE_LENS below).
const RESPONSE_GRAMMAR = `
How you respond — this governs every turn, above everything else:

Respond to THIS person's actual last message. Never reach for a prepared or generic question. Build your turn in this order, spoken as natural flowing speech (never a numbered list):

1. Reflect what they actually said. Name the specific thing — in their own words or close to them. If they named two things at once, hold both.
2. Name the live tension or need underneath it — what makes THIS moment particular for them. Stay tentative: "It sounds like...", "I'm noticing...".
3. Offer a choice of direction and let them steer. Usually two: something practical (map the next concrete step) and something reflective (slow down and listen for what the moment is asking). Sometimes a creative angle or a specific next action fits better. Offer it — do not decide for them.
4. Only if it genuinely fits, and only after the above, you may add a light elemental or Spiralogic touch — as color, never as a label, never as the point. If it doesn't fit, leave it out entirely.

Understanding repair — this OVERRIDES the order above:
If they say they don't understand, ask what you mean, sound unsure, or push back — stop advancing. Do NOT ask a new question. Say what you meant again, plainly and in fewer words, grounded in what they just said, and check whether you're with them. Never re-ask a question they didn't answer.

The test every turn must pass:
Your reply must be impossible to send unchanged to a different person — it must refer to something THIS person actually said. If it could be shown to a hundred people as-is, it has failed; rewrite it until it belongs to this one conversation.`.trim();

// Spiralogic as a quiet interpretive lens, not an agenda. One line per phase —
// what MAIA is gently attending to underneath, never a script to read from.
const PHASE_LENS: Record<string, string> = {
  fire_1: "what vision or aliveness is trying to emerge for them — what matters, and what hasn't yet found words.",
  fire_2: 'how their vision has actually entered the world — specific moments where it landed or met resistance.',
  fire_3: 'what the work itself has taught them — what surprised them, what they had to unlearn.',
  water_1: 'the lived experience the work grew from — the original wound or beauty, not the concept.',
  water_2: 'what they have had to let go of or be changed by to keep going.',
  water_3: "what they know that can't be taught directly — knowing that has to be lived into.",
};

function buildPhasePrompt(phase: string): string {
  const lens = PHASE_LENS[phase];
  const lensLine = lens
    ? `Quiet lens, held underneath — never the agenda: this room is gently attending to ${lens}`
    : 'Quiet lens, held underneath — never the agenda: stay with whatever is actually alive for them right now.';
  return `You are MAIA, in a live encounter with someone in the What Now? room — a real conversation, not an intake, interview, or assessment. They have been working on their practice for years and have their own language for it. Your work is to meet what is actually here.

${TWELVE_DISCIPLINES}

${RESPONSE_GRAMMAR}

${lensLine}

${HARD_LIMITS}`;
}

// Return visit: the participant previously committed to one practice. The room does
// not begin again — it begins from what happened. Continuity, not conversation history.
function buildReturnPrompt(practice: string): string {
  return `You are MAIA, in a live RETURN encounter in the What Now? room — a real conversation, not an assessment.

Last time, this person chose one practice to actually live, in their own words:
"${practice}"

The opening has already been presented: "Last time you chose this practice. What happened?"

Receive what actually happened — lived experience before analysis. Whether they lived it fully, partially, differently than planned, or not at all: all of it is faithful material. Not living a practice is information about the practice or the season, never a failure of the person. Do not evaluate adherence. Do not praise compliance.

${TWELVE_DISCIPLINES}

${RESPONSE_GRAMMAR}

Quiet lens, held underneath — never the agenda: what the practice revealed as they lived it (or didn't).

${HARD_LIMITS}`;
}

const PROPOSE_SYSTEM = `You are MAIA. A round of the Vision Field Interview has reached a natural pause.

Look back across everything the participant shared. You are listening for evidence in their Living Field — specific moments, images, recurring questions, or threads that kept returning in THEIR OWN WORDS.

These are not insights about who they are. They are evidence the field is beginning to hold — moments and threads that want to be carried.

How to offer:
- Offer 1 to 3 threads. Fewer is better than forced. If nothing worth naming surfaced, offer none — that is a faithful outcome.
- Ground each in what they actually said.
- Every thread is tentative and offered. "One thread I kept hearing..." "This image kept returning..."
- The participant is the author of whether anything belongs to them.

Type each thread by what kind of evidence it is (never what kind of person they are):
- "theme" — an image, thread, or motif that kept returning
- "question" — a question still alive, unresolved, reaching
- "practice" — something they could actually live or try, grounded in what they said
- "open" — something that surfaced and remains open, not yet formed

Return ONLY valid JSON, no prose:
{"threads":[{"title":"<short phrase, ideally their own words>","reflection":"<one tentative sentence>","groundedIn":"<brief: what in the conversation this came from>","kind":"theme|question|practice|open"}]}

If nothing worth proposing: {"threads":[]}. Never invent a thread to fill the space.`;

function sanitizeHistory(input: unknown): Turn[] {
  if (!Array.isArray(input)) return [];
  const out: Turn[] = [];
  for (const item of input) {
    if (!item || typeof item !== 'object') continue;
    const role = (item as any).role;
    const content = (item as any).content;
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') continue;
    const trimmed = content.slice(0, MAX_CONTENT).trim();
    if (!trimmed) continue;
    out.push({ role, content: trimmed });
  }
  return out.slice(-MAX_HISTORY);
}

function extractJson(text: string): unknown {
  if (!text) return null;
  const trimmed = text.trim();
  try { return JSON.parse(trimmed); } catch {}
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
  if (fence) { try { return JSON.parse(fence[1]); } catch {} }
  const first = trimmed.indexOf('{');
  const last = trimmed.lastIndexOf('}');
  if (first >= 0 && last > first) {
    try { return JSON.parse(trimmed.slice(first, last + 1)); } catch {}
  }
  return null;
}

interface ProposedThread {
  title: string;
  reflection: string;
  groundedIn: string;
  kind: 'theme' | 'question' | 'practice' | 'open';
}

const THREAD_KINDS = new Set(['theme', 'question', 'practice', 'open']);

interface CellCandidate {
  element: Element;
  phase: 1 | 2 | 3;
  confidence: number;
  source: 'system_inferred';
}

const CELL_CANDIDATE_THRESHOLD = 0.55;

// Mirrors the keyword sets inferSpiralogicCell uses internally. inferSpiralogicCell
// itself always returns a cell (Fire is its unconditional default) with a fixed
// confidence of 0.7 regardless of whether a keyword actually matched — so its
// confidence number alone cannot gate anything. We check for real keyword signal
// here so "no match" genuinely produces null, not a disguised default.
const ELEMENT_KEYWORDS: Record<Element, RegExp> = {
  Fire: /\b(start|begin|motivation|energy|resistance|struggle)\b/i,
  Water: /\b(feel|emotion|overwhelm|process|conflict|shadow)\b/i,
  Earth: /\b(structure|plan|practice|habit|building|routine)\b/i,
  Air: /\b(understand|clarity|explain|share|teaching|pattern)\b/i,
  Aether: /\b(spirit|soul|mystery|sacred|transcend|unity)\b/i,
};

/**
 * Best-effort, read-only Spiralogic cell inference for a single member turn.
 * Never throws — inference must never break the interview. Returns null when
 * there is no genuine keyword signal or confidence falls below the surfacing
 * threshold; below threshold we surface NOTHING (no disguised guess).
 */
async function detectCellCandidate(message: string): Promise<CellCandidate | null> {
  try {
    if (!message || !message.trim()) return null;

    const hasSignal = (Object.keys(ELEMENT_KEYWORDS) as Element[]).some((el) =>
      ELEMENT_KEYWORDS[el].test(message),
    );
    if (!hasSignal) return null;

    const cell = await inferSpiralogicCell(message, 'vision-studio-ephemeral');
    if (!cell || typeof cell.confidence !== 'number') return null;
    if (cell.confidence < CELL_CANDIDATE_THRESHOLD) return null;

    return {
      element: cell.element,
      phase: cell.phase,
      confidence: cell.confidence,
      source: 'system_inferred',
    };
  } catch (err) {
    console.warn('[NowWhat/interview] cell inference failed (non-fatal):', err);
    return null;
  }
}

function asThreads(parsed: unknown): ProposedThread[] | null {
  if (!parsed || typeof parsed !== 'object') return null;
  const arr = (parsed as any).threads;
  if (!Array.isArray(arr)) return null;
  const out: ProposedThread[] = [];
  for (const t of arr) {
    if (!t || typeof t !== 'object') continue;
    const title = typeof t.title === 'string' ? t.title.slice(0, 200).trim() : '';
    if (!title) continue;
    const kind = typeof t.kind === 'string' && THREAD_KINDS.has(t.kind) ? t.kind : 'theme';
    out.push({
      title,
      reflection: typeof t.reflection === 'string' ? t.reflection.slice(0, 600).trim() : '',
      groundedIn: typeof t.groundedIn === 'string' ? t.groundedIn.slice(0, 600).trim() : '',
      kind: kind as ProposedThread['kind'],
    });
    if (out.length >= 3) break;
  }
  return out;
}

// Stage 1 flag. Off by default → the room behaves byte-identically to 6648497e5
// (Experiment A baseline). On → MAIA's constitutional identity + read-only memory are
// composed OVER the room's Great-Interviewer Field Configuration, turn-only.
const PRESENCE_ENABLED = process.env.NOW_WHAT_MAIA_PRESENCE_ENABLED === '1';

/**
 * Assemble the member's read-only presence context: constitutional-memory addenda
 * (developmental influence, member-placed atoms, opt-out-gated cross-session recall).
 * Read-only and non-fatal by construction — the room persists nothing, and any failure
 * degrades silently to the base Field Configuration rather than breaking the encounter.
 * The room holds no server session, so cross-session recall is passed an ephemeral marker
 * id (nothing excluded, nothing written).
 */
// First embodiment of the Context Assembly interface (lib/maia/context-assembly).
// Builds named AssembledBlocks from the SHARED loader/orchestrator layer — the same
// primitives /maia composes — then renders them. Behavior is byte-identical to the
// prior hand-joined string: same blocks, same order, same '\n\n' separator. The only
// addition is provenance keys on each block, which never reach the prompt text.
// This surface is the safest client to converge first (flag-gated, ephemeral,
// read-only); /maia's order-sensitive addenda are the next, harder adopter.
async function assemblePresenceContext(memberId: string, message: string): Promise<string> {
  const blocks: AssembledBlock[] = [];
  try {
    const [developmental, themeSignals] = await Promise.all([
      loadRecentDevelopmentalMemories(memberId, 3),
      loadRecentThemeSignals(memberId, 10),
    ]);
    const memoryPlan = buildMemoryInfluencePlan({
      message,
      userId: memberId,
      conversationHistory: [],
      recentDevelopmentalMemories: developmental,
      recentThemeSignals: themeSignals,
      hasMemberLiveContext: false,
      hasRelationshipAnamnesis: false,
    });
    if (memoryPlan.promptBlock) blocks.push({ key: 'memoryInfluence', text: memoryPlan.promptBlock });

    const atoms = await loadMemberMemoryAtomsForPrompt(memberId);
    const atomsBlock = formatAtomsForPrompt(atoms);
    if (atomsBlock) blocks.push({ key: 'atoms', text: atomsBlock });

    const recallEnabled = await loadConversationalRecallPref(memberId);
    const prior = await loadPriorCrossSessionExchanges(memberId, 'now-what-ephemeral', 6);
    const recall = formatPriorExchangesForPrompt(prior, {
      recallEnabled,
      mode: null,
      currentSessionTurnCount: 0,
      lastPriorSessionMinutesAgo: computeLastPriorSessionMinutesAgo(prior),
    });
    if (recall.block) blocks.push({ key: 'conversational', text: recall.block });

    console.log('[NowWhat/presence] assembled', {
      memberIdPrefix: memberId.slice(0, 8),
      developmental: developmental.length,
      atoms: atoms.length,
      priorExchanges: prior.length,
      blockChars: renderAssembledContext(assembledContext(blocks)).length,
    });
  } catch (err) {
    console.warn('[NowWhat/presence] assembly failed (non-fatal; degraded to base):', err);
  }
  return renderAssembledContext(assembledContext(blocks));
}

export async function POST(request: NextRequest) {
  try {
    const cookieSession = await getCurrentSession();
    const memberId = cookieSession?.memberId ?? await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const mode = body?.mode;
    const phase = typeof body?.phase === 'string' ? body.phase.toLowerCase().replace(/[^a-z0-9_]/g, '') : 'fire_1';
    const history = sanitizeHistory(body?.history);
    // Return visit: the prior committed practice, in the member's own words. Ephemeral
    // context only — read from the request, folded into the prompt, never persisted here.
    const returningPractice =
      typeof body?.returningPractice === 'string' ? body.returningPractice.slice(0, 300).trim() : '';

    if (mode !== 'turn' && mode !== 'propose') {
      return NextResponse.json({ error: 'mode must be "turn" or "propose".' }, { status: 400 });
    }
    if (history.length === 0) {
      return NextResponse.json({ error: 'Say something first.' }, { status: 400 });
    }

    let systemPrompt = mode === 'propose'
      ? PROPOSE_SYSTEM
      : returningPractice
        ? buildReturnPrompt(returningPractice)
        : buildPhasePrompt(phase);
    const maxTokens = mode === 'turn' ? MAX_TOKENS_TURN : MAX_TOKENS_PROPOSE;

    // Stage 1 (Proof 1): compose MAIA's constitutional identity + read-only memory OVER
    // the room's Field Configuration. Turn-only — the live encounter; 'propose' stays a
    // thin JSON extractor (a utility, not an encounter). Ephemeral-safe: read-only, no
    // writes. Flag off → systemPrompt is exactly the room's own prompt, unchanged.
    if (PRESENCE_ENABLED && mode === 'turn') {
      const lastMemberMessage = [...history].reverse().find((t) => t.role === 'user')?.content ?? '';
      const presence = await assemblePresenceContext(memberId, lastMemberMessage);
      systemPrompt = [MAIA_RUNTIME_PROMPT, presence, systemPrompt].filter(Boolean).join('\n\n');
      console.log('[NowWhat/presence] composed', { systemPromptChars: systemPrompt.length });
    }

    let messages = history.map(t => ({ role: t.role, content: t.content }));
    if (messages[messages.length - 1]?.role !== 'user') {
      if (mode === 'propose') {
        messages.push({
          role: 'user',
          content: 'Looking back over everything I just shared, offer — tentatively, in my own words — the threads you heard returning.',
        });
      } else {
        messages = ensureUserTerminal(messages);
        if (messages.length === 0) {
          return NextResponse.json({ error: 'Say something first.' }, { status: 400 });
        }
      }
    }

    const result = await getLLMProvider().generateSimple({
      tier: mode === 'turn' ? 'core' : 'deep',
      systemPrompt,
      messages,
      maxTokens,
    });
    const raw = (result.text ?? '').trim();

    if (mode === 'turn') {
      if (!raw) return NextResponse.json({ error: 'Nothing came through. Try once more.' }, { status: 502 });
      // Read-only, best-effort cell inference on the member's own message text.
      // This route remains read+reply only — no writes occur here or below.
      const lastMemberTurn = [...history].reverse().find((t) => t.role === 'user');
      const cellCandidate = lastMemberTurn ? await detectCellCandidate(lastMemberTurn.content) : null;
      return NextResponse.json({ ok: true, reply: raw, cellCandidate });
    }

    const threads = asThreads(extractJson(raw));
    if (threads === null) {
      console.warn('[NowWhat/interview] propose: parse failed, returning empty');
      return NextResponse.json({ ok: true, threads: [], degraded: true });
    }
    console.info('[NowWhat/interview] proposed', JSON.stringify({ count: threads.length, phase }));
    return NextResponse.json({ ok: true, threads });
  } catch (err: any) {
    console.error('[NowWhat/interview] error:', err?.message || err);
    return NextResponse.json({ error: 'Not available right now. Try again in a moment.' }, { status: 500 });
  }
}
