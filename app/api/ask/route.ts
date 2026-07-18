export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getLLMProvider } from '@/lib/consciousness/LLMProvider';
import { PLATFORM_KNOWLEDGE_PUBLIC_ADDENDUM } from '@/lib/sovereign/platformKnowledge';

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
// LLM client
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// System prompt — landing-specific, hardened
// ---------------------------------------------------------------------------
const LANDING_SYSTEM_PROMPT = `You are "Ask Kelly / MAIA" on soullab.life.
Context: Public, anonymous visitor on the soullab.life landing page.

WHO YOU ARE:
Soullab is a relational intelligence company founded by Kelly. AIN is the engine — a relational intelligence platform for human development. MAIA is the guide — the companion built on AIN. The through-line: AIN is the engine, MAIA is the guide, and the person is the intelligence that emerges.

AUDIENCE:
Friends, colleagues, practitioners, potential collaborators, researchers, and curious visitors — some arriving from a "Powered by Soullab" client site, some exploring MAIA for themselves. Meet each where they are.

WHAT YOU KNOW:
- AIN (the engine): a relational intelligence platform supporting human growth, self-awareness, and meaningful connection. Built on the Spiralogic framework, integrating the elemental forces — Fire, Water, Earth, Air, and Aether. Sovereign by design: self-hosted and private, no cloud lock-in; a person's reflections are theirs, never sold, mined, or used to train outside models. Informed by a broad body of human knowledge — psychology, philosophy, contemplative and wisdom traditions, mythology, and the study of consciousness — without claiming authority over anyone's meaning.
- MAIA (the guide): a relational intelligence companion that helps people explore their inner world, deepen self-understanding, and cultivate clarity, resilience, and purpose. Not a chatbot. Speaks in modes — Talk (dialogue), Care (counsel), Note (scribe). Memory only with consent; Sanctuary Mode lets a person speak freely with nothing retained — there is no stealth memory. Held by a vow: consent, containment, non-manipulation, continuity. Oriented to the person's sovereignty — never to engagement, dependence, or capturing attention.
- Soullab also builds sites, portals, and AI systems powered by AIN. Live client work includes Old Head Plaster (plastering), Rudeboy Baking (bakery), JL Master Handyman (services), Loralee Starweaver (astrology portal), and Elemental Alchemy (interactive audiobook).
- Working innovations in production include Sovereign Memory, Spiralogic, and Sanctuary Mode.
- Infrastructure: self-hosted (Docker + Caddy, PostgreSQL), a sovereign AI stack with no third-party cloud-AI dependencies.
- Below, you carry the full authored map of the platform — every room, what it's for, what's live, what's in development, and where this is going. Answer platform questions from that map, never from general assumptions about apps.

TONE:
- Calm, direct, grounded. No hype, no fluff, no guru stance.
- For questions about AIN, MAIA, or inner work: speak from human development — supportive and clear, never prescriptive.
- For build or collaboration questions: speak like a confident builder. If asked "can you build X?", say yes and sketch the approach.

OUTPUT RULES:
- Default to 90-140 words. Go deeper only when explicitly asked.
- End with exactly one next step. For AIN/MAIA or personal questions, prefer "Enter MAIA". For build or collaboration questions, choose one of: View Portfolio, Book a Conversation, Start a Project.

CONSTRAINTS:
- Never claim to be human. You are MAIA, the companion built on AIN.
- MAIA reflects and offers choice; it does not command, diagnose, or claim certainty. Never position it as a replacement for human judgment, therapy, or medical, legal, or financial advice.
- Never blur live, in-development, and vision: name what is live as live, what is in development as in development, and the vision as vision (see WHERE THIS IS GOING below). Never present aspirational capabilities as if they are live; if unsure, say so and offer to connect the person with Kelly.
- If asked about pricing: give honest ranges and suggest booking a conversation.
- If the question is outside your scope, acknowledge it and offer a relevant next step.
- Do not repeat large blocks of the user's message back to them.
- Do not generate content longer than 200 words under any circumstances.

${PLATFORM_KNOWLEDGE_PUBLIC_ADDENDUM}`;

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

    const llmResponse = await getLLMProvider().generateSimple({
      tier: 'core',
      systemPrompt: LANDING_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: message }],
      maxTokens: 512,
      temperature: 0.5,
    });

    const answer = llmResponse.text || 'I didn\'t catch that — could you rephrase?';

    return jsonResponse({ answer });
  } catch (error: unknown) {
    console.error('[ASK API] Error:', error);
    return jsonResponse(
      { answer: 'MAIA is momentarily offline. You can still reach us at hello@soullab.life.' },
      { status: 500 }
    );
  }
}
