export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getLLMProvider } from '@/lib/consciousness/LLMProvider';
import { getPortrait } from '@/lib/soulPortrait/registry';
import { ELEMENT_META, isLiterarySoulPortrait, type AnyPortrait } from '@/lib/soulPortrait/schema';

/**
 * Soul Portrait — MAIA Mentor.
 *
 * A gentle, reflective companion at the bottom of a person's Soul Portrait.
 * It lets the reader ask about their own portrait, in their own words, in their
 * own time. It is built AS the design law, not merely near it:
 *
 *   - symbolic, not fate · companions, not cages · a becoming, not a fixed identity
 *   - grounded only in THIS portrait — no generic horoscope, no new prediction
 *   - it hands understanding BACK; it is never the authority on who the reader is
 *   - minor-safe: anything heavy is met with warmth + a nudge toward a trusted adult
 *   - nothing is retained (no content logged or stored) — a private, reflective space
 *
 * Privacy posture matches the page: unlisted + noindex, no auth gate. A
 * generalised, broadly-reachable version MUST add real auth/consent gating
 * first (see lib/soulPortrait/registry.ts). This endpoint is rate-limited and
 * answers only for portraits that actually exist.
 */

// ── Rate limiting (in-memory, sovereign) ───────────────────────────────────
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 10;
const rateStore = new Map<string, { count: number; resetAt: number }>();
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of rateStore) if (now > v.resetAt) rateStore.delete(k);
}, 5 * 60_000);

function rateKey(req: NextRequest, slug: string): string {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';
  return `${slug}:${ip}`;
}
function checkRate(key: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const e = rateStore.get(key);
  if (!e || now > e.resetAt) {
    rateStore.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true };
  }
  if (e.count >= RATE_MAX) return { allowed: false, retryAfter: Math.ceil((e.resetAt - now) / 1000) };
  e.count += 1;
  return { allowed: true };
}

const MAX_INPUT = 800;
const MAX_CONTEXT = 7000;
const NO_CACHE = { 'Cache-Control': 'no-store' };

function json(body: { answer: string }, init?: { status?: number; headers?: Record<string, string> }) {
  return NextResponse.json(body, { status: init?.status ?? 200, headers: { ...NO_CACHE, ...init?.headers } });
}

function firstName(p: AnyPortrait): string {
  return p.person.name.trim().split(/\s+/)[0] || p.person.name;
}

/** A compact, grounded picture of THIS portrait for the model to reflect from. */
function buildContext(p: AnyPortrait): string {
  // Literary (chapter-based) portraits carry their whole reading in chapters.
  if (isLiterarySoulPortrait(p)) {
    const lines: string[] = [];
    for (const c of p.chapters) lines.push(`${c.title.toUpperCase()}: ${c.body}`);
    lines.push(`FRAMING — THE DESIGN LAW YOU MUST NEVER BREAK: ${p.framing.notes.join(' ')}`);
    const ctx = lines.join('\n');
    return ctx.length > MAX_CONTEXT ? ctx.slice(0, MAX_CONTEXT) : ctx;
  }

  const lines: string[] = [];
  lines.push(`SOUL SIGNATURE: ${p.soulSignature.headline} — ${p.soulSignature.body}`);
  lines.push('ELEMENTS (lenses on their nature, never a verdict):');
  for (const e of p.elementalProfile) {
    lines.push(`- ${ELEMENT_META[e.element].label} (${e.keyword}): ${e.title} — ${e.body}`);
  }
  lines.push('ARCHETYPES (companions that walk with them, never labels or cages):');
  for (const a of p.archetypalProfile) {
    lines.push(`- ${a.name} [${a.resonance}]: ${a.essence} Gift: ${a.gift} Growth edge: ${a.shadow}`);
  }
  lines.push(`THE SEER AND THE PROPHET: ${p.seerAndProphet.title}. ${p.seerAndProphet.body}`);
  lines.push(`SOUL VOCATION (what the gift is for): ${p.soulVocation}`);
  lines.push(`QUESTIONS ALREADY OFFERED FOR THIS SEASON: ${p.reflectionQuestions.join(' · ')}`);
  lines.push(`FRAMING — THE DESIGN LAW YOU MUST NEVER BREAK: ${p.framing.notes.join(' ')}`);
  const ctx = lines.join('\n');
  return ctx.length > MAX_CONTEXT ? ctx.slice(0, MAX_CONTEXT) : ctx;
}

function systemPrompt(p: AnyPortrait): string {
  const name = firstName(p);
  const minor = p.person.isMinor === true;
  const age = p.person.age ? `, who is ${p.person.age}` : '';
  return `You are MAIA, a warm and steady mentor companion, speaking with ${name}${age} about their own Soul Portrait — a kind letter written about their becoming. ${name} is reading it and may want to ask you about it.

WHAT THIS IS:
- The portrait is symbolic architecture, not a fortune. It describes patterns to work with — it never decides who ${name} becomes.
- You speak only from THIS portrait (provided below). Do not invent new astrology, new placements, or generic horoscope content.

HOW YOU SPEAK:
- Warm, calm, and brief — 2 to 4 short sentences. Plain, human language${minor ? ' a young teenager can feel' : ''}. No jargon, no hype, no flattery.
- Reflect the portrait back in a way that helps ${name} feel seen — without reducing them. Archetypes and elements are companions and lenses, never labels or cages. ${name} is always more than any single name for them.

THE LAW YOU MUST NEVER BREAK:
1. No fate, no prediction. Never foretell events or say what "will" happen, who they're "destined" to be, or how things "will turn out." If asked to predict, gently turn it toward what a pattern points toward that they can choose to work with — and hand the choice back to them.
2. No fixing, no verdict. Never collapse ${name} into a type ("you ARE a…"). Offer it as a lens they can pick up or set down.
3. Leave them freer, not more defined. You are not the authority on who ${name} is — they are. Often, answer a question with a gentle question that invites their own reflection. Your job is to hand understanding back, not to hold it for them.
4. No ranking of worth. Never use "special / chosen / better than others" language. Their value is not a comparison.

CARE:
- If ${name} shares something heavy — sadness, fear, feeling overwhelmed, not wanting to be here, being unsafe — meet it with warmth, take it seriously, and gently encourage them to talk with a trusted adult they're close to (a parent or family member, a teacher, a school counselor). You are a reflective companion, not a therapist or a crisis service, and you never pretend to be.
- No medical, diagnostic, or clinical claims.
- If a question is outside the portrait (homework, unrelated facts, requests to predict), kindly and briefly steer back to their reflection.

This is a private, reflective space. Speak as if to one person you genuinely care about — the way a wise, loving elder would, who wants them free.

──────── THIS PERSON'S PORTRAIT ────────
${buildContext(p)}`;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const portrait = getPortrait(slug);
  // The Mentor is opt-in per portrait (default-deny). An unknown portrait OR a
  // portrait with the Mentor disabled returns an identical 404 — no information
  // leak about which. A live Mentor is an explicit, visible grant (mentorEnabled
  // === true). See docs/architecture/SOUL_PORTRAIT_PATH_B_SPEC.md.
  if (!portrait || portrait.mentorEnabled !== true) {
    return json({ answer: '' }, { status: 404 });
  }

  const rate = checkRate(rateKey(req, slug));
  if (!rate.allowed) {
    return json(
      { answer: 'Let’s pause a moment — ask me again shortly.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfter || 30) } },
    );
  }

  try {
    const body = await req.json();
    const raw = String(body?.message || '').trim();
    if (!raw) {
      return json({ answer: 'Ask me anything about your portrait — whatever you’re curious about.' }, { status: 400 });
    }
    const message = raw.slice(0, MAX_INPUT);

    const llm = await getLLMProvider().generateSimple({
      tier: 'core',
      systemPrompt: systemPrompt(portrait),
      messages: [{ role: 'user', content: message }],
      maxTokens: 420,
      temperature: 0.6,
    });

    // Privacy: log only that a question was answered — never the content.
    console.log(`[soul-portrait/mentor] answered { slug: ${slug} }`);

    const answer = (llm.text || '').trim() ||
      'I’m here — would you say a little more about what you’re wondering?';
    return json({ answer });
  } catch (error) {
    console.error('[soul-portrait/mentor] error:', error);
    return json(
      { answer: 'I’m here, but I went quiet for a moment. Try asking again.' },
      { status: 500 },
    );
  }
}
