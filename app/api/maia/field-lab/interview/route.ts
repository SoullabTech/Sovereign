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
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { isMemberTester } from '@/lib/auth/tester';
import { getMemberIdFromRequest } from '@/lib/scribe/scribeAuth';
import { getLLMProvider, ensureUserTerminal } from '@/lib/consciousness/LLMProvider';
import { getCenter } from '@/lib/maia/field-lab/centerOfInquiry';

// Provider abstraction (sovereignty): all generation goes through MultiLLMProvider
// — Claude primary, local Ollama fallback (LOCAL_TIER_ENABLED / DISABLE_CLAUDE).
// No raw Anthropic SDK here, so the room never hard-depends on the cloud.
// turn → 'core' (responsive reflective dialogue); propose → 'deep' (the high-stakes
// listen-back + structured JSON benefits from the strongest tier).
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

// Center-specific system prompts (person → Legacy Field, project → Vision Studio) now
// live in lib/maia/field-lab/centerOfInquiry.ts and are selected per request below. The
// engine is one recognition primitive; the center is configuration, not a rebuild.

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
    // Cookie-based session first; fall back to x-session-token header for iOS Safari/Capacitor
    // where SameSite=Lax cookies are not sent cross-origin from the WebView.
    const cookieSession = await getCurrentSession();
    const memberId = cookieSession?.memberId ?? await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
    }
    const tester = await isMemberTester(memberId);
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

    // Center of Inquiry: person (Legacy Field) or project (Vision Studio). Same engine —
    // the center only selects the framing config. Defaults to person.
    const center = getCenter(body?.center);
    const system = mode === 'turn' ? center.interviewSystem : center.proposeSystem;
    const maxTokens = mode === 'turn' ? MAX_TOKENS_TURN : MAX_TOKENS_PROPOSE;

    // Claude rejects an assistant-terminal messages array (last-assistant-turn "prefill"
    // → 400 "the conversation must end with a user message" on Sonnet/Opus 4.6+). Both
    // modes must be user-terminal before the provider call:
    //   - 'propose' history usually ends on MAIA's reflection → append the member's
    //     implicit "offer what you heard" request so the listen-back has a turn to answer.
    //   - 'turn' history may end on MAIA (continue / regenerate / retry) → trim trailing
    //     assistant turns so MAIA responds to the member's last real message, not a prefill.
    // generateClaude applies the same trim as a structural backstop for every route.
    let messages: Array<{ role: Role; content: string }> = history.map((t) => ({
      role: t.role,
      content: t.content,
    }));
    if (messages[messages.length - 1]?.role !== 'user') {
      if (mode === 'propose') {
        messages.push({
          role: 'user',
          content:
            'Looking back over everything I just shared, offer — tentatively, in my own words — the threads you heard returning.',
        });
      } else {
        messages = ensureUserTerminal(messages);
        if (messages.length === 0) {
          return NextResponse.json(
            { error: 'Say something first — the conversation begins with you.' },
            { status: 400 }
          );
        }
      }
    }

    const result = await getLLMProvider().generateSimple({
      tier: mode === 'turn' ? 'core' : 'deep',
      systemPrompt: system,
      messages,
      maxTokens,
    });
    const raw = (result.text ?? '').trim();

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
