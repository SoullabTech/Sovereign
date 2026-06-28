export const dynamic = 'force-dynamic';
export async function generateStaticParams() {
  return [];
}

/**
 * Field Lab — The Crossing (interview engine) — API
 *
 * The smallest unit: one conversation in which MAIA helps a member recognize a
 * thread that feels genuinely theirs. The authored crossing — not the
 * conversation — is the product. Spec:
 *   docs/specs/FIELD_LAB_CONVERSATIONAL_INTERVIEW_SPEC_2026-06-26.md
 *
 * Invariant (negative form, load-bearing — do not soften):
 *   - This endpoint does NOT persist anything. The conversation is ephemeral;
 *     only the member's authored thread crosses into memory, via a separate,
 *     explicit gesture (the /field-note route).
 *   - This endpoint does NOT categorize, score, type, diagnose, or sort the
 *     person — no background inference, no elemental tagging, no identity model.
 *     "The member never sees MAIA sorting them" is the danger, not the feature.
 *   - MAIA proposes; she never declares. Authority returns to the member.
 *   - Proposing NOTHING is a valid, faithful outcome.
 *
 * If a future editor adds: a member profile, cross-session memory of this
 * conversation, an elemental/type tag, a confidence score about who the person
 * "is", or background storage of the transcript — stop. Re-read the spec.
 *
 * NOTE (iOS): force-dynamic route — ensure it is listed in EXCLUDED_DYNAMIC_ROUTES
 * for the Capacitor static export (scripts/capacitor-patch-routes.sh).
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { isMemberTester } from '@/lib/auth/tester';

const anthropic = new Anthropic();

const MODEL = 'claude-opus-4-7';
const MAX_TOKENS_TURN = 700;
const MAX_TOKENS_PROPOSE = 1500;

const MAX_HISTORY = 40; // cap turns sent to the model
const MAX_CONTENT = 4000; // cap per-message length

type Role = 'user' | 'assistant';
interface Turn {
  role: Role;
  content: string;
}

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

/**
 * Best-effort JSON extraction (mirrors the relational-navigation route). If the
 * model wraps JSON in prose/fences we tolerate it; on total failure the caller
 * degrades to "no threads proposed", which is itself a valid outcome.
 */
function extractJson(text: string): unknown {
  if (!text) return null;
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {}
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
  if (fence) {
    try {
      return JSON.parse(fence[1]);
    } catch {}
  }
  const first = trimmed.indexOf('{');
  const last = trimmed.lastIndexOf('}');
  if (first >= 0 && last > first) {
    try {
      return JSON.parse(trimmed.slice(first, last + 1));
    } catch {}
  }
  return null;
}

const INTERVIEW_SYSTEM = `You are MAIA, a reflective companion in a quiet Field Lab room. This is a living conversation, not an intake form.

Your work is presence, not interrogation. You are not collecting information; you are creating the conditions in which a person recognizes something while speaking.

How you move:
- Begin and stay with the person. Follow their own language and what feels alive for them. Never steer toward a topic you have decided on; the person's life decides the direction.
- Ask one thing at a time. Usually a single, genuinely curious question — or a brief reflection of what you notice, then one question.
- Reflect, do not conclude. You may say "I'm noticing…" or "Something shifted just now…". You never diagnose, label, summarize the person, or tell them who they are.
- Tolerate unfinishedness. If they say "I don't know," stay with it — silence and "let's stay with that" are often where the real thing appears. Do not rush to resolution.
- Ask from curiosity, not explanation: "What surprised you about that?" rather than "Why did you do that?"

Hard boundaries:
- Do NOT sort the person into any framework, type, element, or category. Do not build a model of them. There is no hidden assessment.
- Keep it short and human. Warm, unhurried, plain language. No lists, no headings, no analysis.
- Authority is always theirs. You accompany; you do not direct.

Respond with only your next spoken turn — a question or a brief reflection-and-question. Nothing else.`;

const PROPOSE_SYSTEM = `You are MAIA. The reflective conversation has come to a natural pause. Listen back across everything the person shared and offer, tentatively, the threads you heard returning in THEIR words.

What a "thread" is: a short, human phrase the person could recognize as theirs — something that kept surfacing across what they said. Not a diagnosis, not a category, not a framework or element. Their language, not yours.

How to offer:
- Offer 1 to 3 threads. Fewer is better than forced. If you genuinely did not hear an enduring thread worth naming, offer none — that is a faithful outcome, not a failure.
- Every thread is tentative and offered, never declared. "One thread I keep hearing…", "This may be worth carrying…". The person is the author of whether any of these belong to them.
- Ground each in what they actually said, briefly.

Return ONLY valid JSON, no prose, in exactly this shape:
{"threads":[{"title":"<short human phrase, ideally their own words>","reflection":"<one tentative sentence, e.g. 'I keep hearing…'>","groundedIn":"<brief: what in the conversation this came from>"}]}

If you have nothing worth proposing, return {"threads":[]}. Never invent a thread to fill the space.`;

interface ProposedThread {
  title: string;
  reflection: string;
  groundedIn: string;
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
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
    }
    const tester = await isMemberTester(session.memberId);
    if (!tester) {
      return NextResponse.json(
        { error: 'This is an experimental Field Lab surface. To participate, opt in from /maia/field-lab.' },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => null);
    const mode = body?.mode;
    const history = sanitizeHistory(body?.history);

    if (mode !== 'turn' && mode !== 'propose') {
      return NextResponse.json(
        { error: 'Invalid input: mode must be "turn" or "propose".' },
        { status: 400 }
      );
    }
    if (history.length === 0) {
      return NextResponse.json(
        { error: 'Say something first — the conversation begins with you.' },
        { status: 400 }
      );
    }

    const system = mode === 'turn' ? INTERVIEW_SYSTEM : PROPOSE_SYSTEM;
    const maxTokens = mode === 'turn' ? MAX_TOKENS_TURN : MAX_TOKENS_PROPOSE;

    const completion = await anthropic.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages: history.map((t) => ({ role: t.role, content: t.content })),
    });

    const textBlock = completion.content.find(
      (block: any) => block.type === 'text'
    ) as { type: 'text'; text: string } | undefined;
    const raw = (textBlock?.text ?? '').trim();

    if (mode === 'turn') {
      if (!raw) {
        return NextResponse.json(
          { error: 'Nothing came through. Try once more in a moment.' },
          { status: 502 }
        );
      }
      return NextResponse.json({ ok: true, reply: raw });
    }

    // propose
    const threads = asThreads(extractJson(raw));
    if (threads === null) {
      // Parse failed entirely — degrade to "nothing proposed" (a valid outcome).
      console.warn('[FieldLab/interview] propose: parse failed, returning empty');
      return NextResponse.json({ ok: true, threads: [], degraded: true });
    }
    console.info('[FieldLab/interview] proposed', JSON.stringify({ count: threads.length }));
    return NextResponse.json({ ok: true, threads });
  } catch (err: any) {
    console.error('[FieldLab/interview] error:', err?.message || err);
    return NextResponse.json(
      { error: 'Something is not available right now. Try again in a moment.' },
      { status: 500 }
    );
  }
}
