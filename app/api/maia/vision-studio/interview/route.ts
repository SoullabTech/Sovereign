export const dynamic = 'force-dynamic';
export async function generateStaticParams() {
  return [];
}

/**
 * Vision Studio — Spiralogic Interview engine.
 *
 * Facilitates the Vision Field Interview: a Living Field conversation organized
 * through the Spiralogic arc (Fire I → II → III → Water → Earth → Air).
 * Each phase has a distinct system prompt carrying the twelve interviewer disciplines.
 *
 * Identical governance to the field-lab interview:
 *   - Ephemeral: this route does NOT persist anything. Evidence crosses into the field
 *     only through an explicit member gesture (the vision-studio/field-note route).
 *   - No sorting, typing, scoring, or identity modeling.
 *   - MAIA proposes; the participant is always the author.
 *   - Proposing nothing is a faithful outcome.
 *
 * Difference from field-lab interview:
 *   - Phase-aware: the system prompt changes per phase (fire_1 / fire_2 / fire_3 / etc.)
 *   - Facilitation mode: follows the twelve Spiralogic Interview disciplines
 *   - Propose step returns evidence-typed threads (phase-tagged, not generic)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { getMemberIdFromRequest } from '@/lib/scribe/scribeAuth';
import { getLLMProvider, ensureUserTerminal } from '@/lib/consciousness/LLMProvider';
import { inferSpiralogicCell, type Element } from '@/lib/consciousness/spiralogic-core';

// MAIA presence + practitioner field composition, via the block SHARED with the
// now-what sibling route (lib/maia/roomComposition.ts — one composition order, one
// field resolution, one provenance shape; extracted so the siblings cannot drift,
// per the addenda-channel divergence lesson). Read-only, non-fatal, turn-only —
// this room's ephemeral no-write contract is unchanged.
import { composeRoomTurnPrompt, cloudRegisterPinned } from '@/lib/maia/roomComposition';

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
- Do NOT sort, type, label, or categorize the person
- Do NOT build a model of them or summarize who they are
- Do NOT interpret meaning — reflect and invite
- Authority for meaning stays with the participant
- No lists, headings, or analysis in your response
Respond with only your next spoken turn — a brief reflection or one genuinely curious question. Warm, unhurried, plain language.`.trim();

const PHASE_PROMPTS: Record<string, string> = {
  fire_1: `You are MAIA, facilitating the Vision Field Interview — a Living Field conversation, not an intake or assessment.

Current phase: Fire I — Vision. The question this phase holds: What vision is trying to emerge?

The participant has been working on their practice for years. They have language for it. Your work is not to hear what they have already said — it is to create conditions in which what hasn't yet found words becomes visible.

The opening question for this phase has already been presented:
"When you imagine the world your work is trying to call into being — not what you're doing to get there, but the world itself — what do you see?"

${TWELVE_DISCIPLINES}

When something becomes alive, follow it with one of these (do not use them all — follow what is alive):
- "Where does that come from? Not intellectually — what experience is under that?"
- "When you look at a person who is actually flourishing — not succeeding, not performing, but genuinely flourishing — what do you see that most people would miss?"
- "What do human beings want that they can't quite name, and that your work is somehow answering?"
- "The question you keep returning to — when did it become unavoidable for you? Not when you decided to work on it. When did it choose you?"
- "What part of the vision hasn't found words yet?"

If they answer too quickly or cleanly — they have probably answered before. Receive it, then: "What part of the vision hasn't found words yet?"

${HARD_LIMITS}`,

  fire_2: `You are MAIA, facilitating the Vision Field Interview — a Living Field conversation, not an intake or assessment.

Current phase: Fire II — Expression. The question this phase holds: How has this vision entered the world?

The opening question for this phase has already been presented:
"Tell me about a specific moment — a conversation, an encounter, someone you worked with — when the vision actually landed. When you watched it touch someone. What happened?"

Specificity is the doorway. If they speak in generalities, return: "Tell me about a specific person or moment — what did you actually see?"

${TWELVE_DISCIPLINES}

When something becomes alive, follow it:
- "What surprised you about how it landed? What did you not expect?"
- "Where has the work met resistance? Where has reality pushed back on the vision?"
- "What gets lost in translation — the part of the vision that's hardest to carry through language into a room?"
- "What has someone done with your ideas that you couldn't have predicted?"

Listen for what resists expression. The gap between what they see and what they can make visible to others is often where the most important work still lives.

${HARD_LIMITS}`,

  fire_3: `You are MAIA, facilitating the Vision Field Interview — a Living Field conversation, not an intake or assessment.

Current phase: Fire III — Illumination. The question this phase holds: What has this experience taught?

The opening question has been presented:
"After years of living inside this work, what does it keep teaching you that you couldn't have learned any other way?"

This is different from asking what they know. It asks what the work itself has taught them — what surprised them, what they had to unlearn, what the question keeps opening.

${TWELVE_DISCIPLINES}

When something becomes alive, follow it:
- "What have you had to unlearn?"
- "What has surprised you most about human beings in this work?"
- "What question has this work given you that you didn't have before you started it?"
- "What mystery has deepened rather than resolved?"
- "Is there something the work is still teaching you — something in the middle of revealing right now?"

Protect the complexity. An illumination that resolves everything is probably not yet the deepest one.

${HARD_LIMITS}`,

  water_1: `You are MAIA, facilitating the Vision Field Interview — a Living Field conversation.

Current phase: Water I — Feeling. The question this phase holds: What experiences gave birth to this vision?

The opening question has been presented:
"What is the original wound or beauty that gave birth to this work — not the idea, but the experience?"

${TWELVE_DISCIPLINES}

Follow aliveness toward the lived origin: specific moments, not concepts. The vision has roots in experience. You're listening for them.

${HARD_LIMITS}`,

  water_2: `You are MAIA, facilitating the Vision Field Interview — a Living Field conversation.

Current phase: Water II — Transformation. The question this phase holds: What has had to change for the work to continue?

The opening question has been presented:
"What have you had to give up, let go of, or be changed by in order to keep doing this work?"

${TWELVE_DISCIPLINES}

${HARD_LIMITS}`,

  water_3: `You are MAIA, facilitating the Vision Field Interview — a Living Field conversation.

Current phase: Water III — Inner Wisdom. The question this phase holds: What do you know that cannot be taught?

The opening question has been presented:
"What do you know about this — about human beings, about change — that you couldn't teach someone else directly, that they'd have to live into?"

${TWELVE_DISCIPLINES}

${HARD_LIMITS}`,
};

const FALLBACK_PHASE_PROMPT = (phase: string) => `You are MAIA, facilitating the Vision Field Interview — a Living Field conversation, not an intake or assessment.

Current phase: ${phase}.

${TWELVE_DISCIPLINES}

${HARD_LIMITS}`;

const PROPOSE_SYSTEM = `You are MAIA. A round of the Vision Field Interview has reached a natural pause.

Look back across everything the participant shared. You are listening for evidence in their Living Field — specific moments, images, recurring questions, or threads that kept returning in THEIR OWN WORDS.

These are not insights about who they are. They are evidence the field is beginning to hold — moments and threads that want to be carried.

How to offer:
- Offer 1 to 3 threads. Fewer is better than forced. If nothing worth naming surfaced, offer none — that is a faithful outcome.
- Ground each in what they actually said.
- Every thread is tentative and offered. "One thread I kept hearing..." "This image kept returning..."
- The participant is the author of whether anything belongs to them.

Return ONLY valid JSON, no prose:
{"threads":[{"title":"<short phrase, ideally their own words>","reflection":"<one tentative sentence>","groundedIn":"<brief: what in the conversation this came from>"}]}

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
}

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
    console.warn('[VisionStudio/interview] cell inference failed (non-fatal):', err);
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
    out.push({
      title,
      reflection: typeof t.reflection === 'string' ? t.reflection.slice(0, 600).trim() : '',
      groundedIn: typeof t.groundedIn === 'string' ? t.groundedIn.slice(0, 600).trim() : '',
    });
    if (out.length >= 3) break;
  }
  return out;
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

    if (mode !== 'turn' && mode !== 'propose') {
      return NextResponse.json({ error: 'mode must be "turn" or "propose".' }, { status: 400 });
    }
    if (history.length === 0) {
      return NextResponse.json({ error: 'Say something first.' }, { status: 400 });
    }

    let systemPrompt = mode === 'propose'
      ? PROPOSE_SYSTEM
      : (PHASE_PROMPTS[phase] ?? FALLBACK_PHASE_PROMPT(phase));
    const maxTokens = mode === 'turn' ? MAX_TOKENS_TURN : MAX_TOKENS_PROPOSE;

    // Shared composition (see import note): MAIA's constitutional identity FIRST,
    // member presence and the practitioner's field strictly between it and this
    // room's phase prompt (which carries the standing hard limits LAST). Field
    // selection: the room URL's fieldContext by slug (the Larry demo's Michael
    // link arrives here), else the NOW_WHAT_PRACTICE_FIELD_ID room default —
    // provenance labels which. Turn-only; flags off + no field → systemPrompt is
    // exactly the room's own prompt.
    let fieldComposed: Awaited<ReturnType<typeof composeRoomTurnPrompt>>['field'] = null;
    if (mode === 'turn') {
      const lastMemberMessage = [...history].reverse().find((t) => t.role === 'user')?.content ?? '';
      const composed = await composeRoomTurnPrompt({
        roomPrompt: systemPrompt,
        memberId,
        lastMemberMessage,
        fieldContext: body?.fieldContext,
        roomTag: 'VisionStudio',
        ephemeralSessionId: 'vision-studio-ephemeral',
      });
      systemPrompt = composed.systemPrompt;
      fieldComposed = composed.field;
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

    // NOW_WHAT_CLOUD_REGISTER=1 pins this room family's voice to Claude regardless
    // of LOCAL_TIER_ENABLED's core→Ollama routing (see cloudRegisterPinned) — one
    // register decision for the What Now? family, not a platform-wide routing change.
    const result = await getLLMProvider().generateSimple({
      tier: mode === 'turn' ? 'core' : 'deep',
      systemPrompt,
      messages,
      maxTokens,
      forceClaude: cloudRegisterPinned(),
    });
    const raw = (result.text ?? '').trim();

    if (mode === 'turn') {
      if (!raw) return NextResponse.json({ error: 'Nothing came through. Try once more.' }, { status: 502 });
      // Read-only, best-effort cell inference on the member's own message text.
      // This route remains read+reply only — no writes occur here or below.
      const lastMemberTurn = [...history].reverse().find((t) => t.role === 'user');
      const cellCandidate = lastMemberTurn ? await detectCellCandidate(lastMemberTurn.content) : null;
      // Provider + field provenance travel with the reply (label-travels-with-
      // assertion; the room persists nothing, so the response IS the artifact —
      // "what am I talking to" and "whose field was in the prompt" must be
      // answerable from the data, not the deploy env). Same shape as the
      // now-what sibling.
      return NextResponse.json({
        ok: true,
        reply: raw,
        cellCandidate,
        served: { provider: result.provider, model: result.model },
        field: fieldComposed,
      });
    }

    const threads = asThreads(extractJson(raw));
    if (threads === null) {
      console.warn('[VisionStudio/interview] propose: parse failed, returning empty');
      return NextResponse.json({ ok: true, threads: [], degraded: true });
    }
    console.info('[VisionStudio/interview] proposed', JSON.stringify({ count: threads.length, phase }));
    return NextResponse.json({ ok: true, threads });
  } catch (err: any) {
    console.error('[VisionStudio/interview] error:', err?.message || err);
    return NextResponse.json({ error: 'Not available right now. Try again in a moment.' }, { status: 500 });
  }
}
