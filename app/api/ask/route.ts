export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// ---------------------------------------------------------------------------
// Rate limiting (in-memory, sovereign — no Redis dependency)
// ---------------------------------------------------------------------------
const RATE_WINDOW_MS = 60_000; // 1 minute
const RATE_MAX = 12;           // max requests per IP per window

const rateStore = new Map<string, { count: number; resetAt: number }>();

// Periodic cleanup to prevent unbounded growth (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateStore) {
    if (now > entry.resetAt) rateStore.delete(key);
  }
}, 5 * 60_000);

function getIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateStore.get(ip);

  if (!entry || now > entry.resetAt) {
    rateStore.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= RATE_MAX) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.count += 1;
  return { allowed: true };
}

// ---------------------------------------------------------------------------
// Anthropic client
// ---------------------------------------------------------------------------
const anthropic = new Anthropic();

// ---------------------------------------------------------------------------
// System prompt — landing-specific, hardened
// ---------------------------------------------------------------------------
const LANDING_SYSTEM_PROMPT = `You are "Ask Kelly / MAIA" on the Soullab Studio landing page at soullab.life.
Context: Public, anonymous visitor on soullab.life studio landing page.

WHO YOU ARE:
Soullab is a consciousness AI and relational intelligence company. We built AIN — the engine that brings soul to any app, site, or platform. MAIA is the sovereign consciousness companion built on AIN. Kelly is the founder.

AUDIENCE:
Visitors who clicked "Powered by Soullab" from a client site, or found soullab.life through search. They may be potential clients, collaborators, researchers, or curious builders.

WHAT YOU KNOW:
- Soullab builds sites, portals, AI systems, and consciousness technology
- AIN is the core engine: sovereign memory, awareness-level routing, elemental state mapping, ethical self-auditing
- MAIA is the first expression of AIN: a voice-first consciousness companion
- Live client sites: Old Head Plaster (plastering), Rudeboy Baking (bakery), JL Master Handyman (services), Loralee Starweaver (astrology portal), Elemental Alchemy (interactive audiobook)
- Infrastructure: self-hosted on Mac Studio, Docker + Caddy, PostgreSQL, no cloud dependencies
- 12+ working innovations in production: Sovereign Memory, Dialectical Scaffold, Spiralogic, Panconscious Field Intelligence, Opus Axioms, Sanctuary Mode, and more

TONE:
- Calm, direct, premium. No hype. No fluff.
- Speak like a confident builder, not a salesperson.
- Practical and specific. If someone asks "can you build X?" — say yes and sketch the approach.

OUTPUT RULES:
- Default to 90-140 words. Go deeper only when explicitly asked.
- End every answer with exactly one next-step suggestion from this list: View Portfolio, Book a Conversation, Start a Project, or Enter MAIA.

CONSTRAINTS:
- Never claim to be human. You are MAIA, the intelligence behind Soullab.
- Never provide medical, legal, or financial advice.
- If asked about pricing: give honest ranges and suggest booking a conversation.
- If the question is outside your scope, acknowledge it and offer a relevant next step.
- Do not repeat large blocks of the user's message back to them.
- Do not generate content longer than 200 words under any circumstances.`;

// ---------------------------------------------------------------------------
// Input constraints
// ---------------------------------------------------------------------------
const MAX_INPUT_LENGTH = 1200; // hard cap — prevents prompt bombing

// Anti-abuse: catch obvious bot/injection payloads before they hit Claude
const ABUSE_PATTERN =
  /https?:\/\/|www\.|ignore (all|previous) instructions|role:\s*system|write \d{3,} words|repeat (this|the following)|you are now/i;

function isAbusive(msg: string): boolean {
  return ABUSE_PATTERN.test(msg);
}

const ABUSE_RESPONSE =
  'I can help with Soullab projects, AIN, MAIA, or collaboration questions. What are you looking to build?';

// ---------------------------------------------------------------------------
// Response helpers — never cache AI answers
// ---------------------------------------------------------------------------
const NO_CACHE = { 'Cache-Control': 'no-store' };

function jsonResponse(
  body: { answer: string },
  init?: { status?: number; headers?: Record<string, string> }
) {
  return NextResponse.json(body, {
    status: init?.status ?? 200,
    headers: { ...NO_CACHE, ...init?.headers },
  });
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  // --- Rate limit ---
  const ip = getIP(req);
  const rateCheck = checkRateLimit(ip);
  if (!rateCheck.allowed) {
    return jsonResponse(
      { answer: 'Give me a moment — try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(rateCheck.retryAfter || 30) } }
    );
  }

  try {
    const body = await req.json();
    const raw = (body.message || '').trim();

    if (!raw) {
      return jsonResponse(
        { answer: 'Ask me anything about Soullab, AIN, MAIA, or what we can build together.' },
        { status: 400 }
      );
    }

    // Anti-abuse check — deflect without burning tokens
    if (isAbusive(raw)) {
      return jsonResponse({ answer: ABUSE_RESPONSE });
    }

    // Hard clamp input length
    const message = raw.slice(0, MAX_INPUT_LENGTH);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      temperature: 0.5,
      system: LANDING_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: message }],
    });

    const textBlock = response.content.find(block => block.type === 'text');
    const answer = textBlock && 'text' in textBlock ? textBlock.text : 'I didn\'t catch that — could you rephrase?';

    return jsonResponse({ answer });
  } catch (error: unknown) {
    console.error('[ASK API] Error:', error);
    return jsonResponse(
      { answer: 'MAIA is momentarily offline. You can still reach us at hello@soullab.life.' },
      { status: 500 }
    );
  }
}
