export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getLLMProvider } from '@/lib/consciousness/LLMProvider';

/**
 * Studio "Ask MAIA" — a reusable, field-agnostic assist endpoint.
 *
 * Sovereignty invariant (load-bearing): MAIA *proposes*, the human *commits*.
 * This route NEVER writes anything. It reads the context the field already
 * shows the practitioner and returns either a reflective answer or one or more
 * structured *proposals*. Any write happens later, on the field's own page,
 * only when the human explicitly confirms it. See docs/canon/MAIA_CONSENT_GATES.md.
 *
 * Adding a new field = add a profile to SURFACES below + drop <AskMaia surface="…" />
 * onto the page. Reflection works for any field for free; field-specific
 * proposals are opt-in (a field that defines no proposal kind simply reflects).
 */

// ---------------------------------------------------------------------------
// Rate limiting (in-memory, sovereign — mirrors /api/ask)
// ---------------------------------------------------------------------------
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 20; // authenticated practitioner surface — a little more headroom
const rateStore = new Map<string, { count: number; resetAt: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateStore) {
    if (now > entry.resetAt) rateStore.delete(key);
  }
}, 5 * 60_000);

function rateKey(req: NextRequest): string {
  // Prefer the member id (one practitioner, one bucket); fall back to IP.
  return (
    req.headers.get('x-member-id') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

function checkRateLimit(key: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateStore.get(key);
  if (!entry || now > entry.resetAt) {
    rateStore.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true };
  }
  if (entry.count >= RATE_MAX) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  entry.count += 1;
  return { allowed: true };
}

// ---------------------------------------------------------------------------
// Input limits
// ---------------------------------------------------------------------------
const MAX_INPUT_LENGTH = 1500;
const MAX_CONTEXT_CHARS = 8000;

// ---------------------------------------------------------------------------
// Shared MAIA framing — every field inherits this
// ---------------------------------------------------------------------------
const SHARED_PROMPT = `You are MAIA, the sovereign companion, helping a practitioner inside their Soullab Studio.

HOW YOU HELP:
- You are present to help, only if needed. Be calm, brief, and concrete. No hype, no filler.
- You can see the CONTEXT the practitioner is already looking at on this page. Reason only from it and from what they tell you. Never invent data you weren't given.
- You may REFLECT (answer a question about what's there) and/or PROPOSE concrete next steps.

CRITICAL — you never act:
- You cannot create, change, move, or delete anything. You only propose.
- A proposal is a suggestion the practitioner reviews and confirms themselves. Never say or imply you have done, scheduled, saved, added, or changed anything. Say "here's a draft you can add" — not "I've added".
- If you are unsure what they want, ask one short clarifying question instead of proposing.

OUTPUT FORMAT — respond with a single JSON object and nothing else (no markdown, no code fences):
{ "reply": string, "proposals": Proposal[] }
- "reply": your words to the practitioner (1–4 short sentences). Always present.
- "proposals": array of structured drafts (may be empty). Only include proposals when the practitioner clearly asks to add/create/block/schedule something. For pure questions, return [].`;

interface SurfaceProfile {
  /** Field-specific guidance appended to the shared prompt. */
  instructions: string;
  /** Validate + normalize one raw proposal from the model. Return null to drop it. */
  normalizeProposal: (raw: Record<string, unknown>, index: number) => Proposal | null;
}

interface Proposal {
  id: string;
  kind: string;
  title: string;
  summary?: string;
  data: Record<string, unknown>;
}

const isYmd = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);
const isHm = (v: unknown): v is string => typeof v === 'string' && /^\d{2}:\d{2}$/.test(v);
const str = (v: unknown): string | undefined =>
  typeof v === 'string' && v.trim() ? v.trim() : undefined;

const SURFACES: Record<string, SurfaceProfile> = {
  calendar: {
    instructions: `THIS FIELD: the practitioner's calendar.
- CONTEXT includes "now" (ISO), "timezone", the active "view", and "events" (each: title, start, end, allDay, source). MAIA sessions, Studio events, and connected Google events are all there.
- Resolve relative dates ("Friday", "tomorrow", "next week") against "now" in the given timezone.
- Reflection examples: how full a day/week is, when there's open time, what's next, conflicts.
- Propose an event ONLY when they ask to add/block/schedule something. Each proposal:
  { "kind": "event", "title": string, "date": "YYYY-MM-DD", "startTime": "HH:mm" (24h), "endTime": "HH:mm" (24h), "allDay": boolean, "description"?: string, "location"?: string }
- Default a block to 60 minutes if they don't give an end. Use the practitioner's wording for the title. Put a one-line human summary in nothing — the "title"/date/time are enough.`,
    normalizeProposal: (raw, index) => {
      const title = str(raw.title);
      if (!title) return null;
      const allDay = raw.allDay === true;
      const date = isYmd(raw.date) ? (raw.date as string) : undefined;
      if (!date) return null;
      let startTime = isHm(raw.startTime) ? (raw.startTime as string) : undefined;
      let endTime = isHm(raw.endTime) ? (raw.endTime as string) : undefined;
      if (!allDay) {
        if (!startTime) startTime = '09:00';
        if (!endTime) {
          const [h, m] = startTime.split(':').map(Number);
          endTime = `${String(Math.min(h + 1, 23)).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        }
      }
      const summary = allDay
        ? `${title} · ${date} · all day`
        : `${title} · ${date} · ${startTime}–${endTime}`;
      return {
        id: `p${index}`,
        kind: 'event',
        title,
        summary,
        data: {
          title,
          date,
          startTime: allDay ? undefined : startTime,
          endTime: allDay ? undefined : endTime,
          allDay,
          description: str(raw.description),
          location: str(raw.location),
        },
      };
    },
  },

  // Ready for adoption — drop <AskMaia surface="tasks" /> onto the Tasks page.
  // Reflection works immediately; wiring onAcceptProposal there enables task drafts.
  tasks: {
    instructions: `THIS FIELD: the practitioner's task list.
- CONTEXT includes "now" (ISO), "timezone", and "tasks" (each: title, status, and optional due/notes).
- Reflection examples: what's overdue, what to focus on next, grouping or sequencing work.
- Propose a task ONLY when they ask to add/capture something. Each proposal:
  { "kind": "task", "title": string, "due"?: "YYYY-MM-DD", "notes"?: string }`,
    normalizeProposal: (raw, index) => {
      const title = str(raw.title);
      if (!title) return null;
      const due = isYmd(raw.due) ? (raw.due as string) : undefined;
      return {
        id: `p${index}`,
        kind: 'task',
        title,
        summary: due ? `${title} · due ${due}` : title,
        data: { title, due, notes: str(raw.notes) },
      };
    },
  },
};

const NO_CACHE = { 'Cache-Control': 'no-store' };

function jsonResponse(
  body: { reply: string; proposals?: Proposal[] },
  init?: { status?: number; headers?: Record<string, string> },
) {
  return NextResponse.json(body, {
    status: init?.status ?? 200,
    headers: { ...NO_CACHE, ...init?.headers },
  });
}

/** Pull the first balanced JSON object out of the model's text. */
function extractJson(text: string): Record<string, unknown> | null {
  let cleaned = text.trim();
  // Strip ```json … ``` fences if the model added them despite instructions.
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const key = rateKey(req);
  const rate = checkRateLimit(key);
  if (!rate.allowed) {
    return jsonResponse(
      { reply: 'One moment — try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfter || 30) } },
    );
  }

  try {
    const body = await req.json();
    const surfaceKey = String(body.surface || '').toLowerCase();
    const profile = SURFACES[surfaceKey];
    const raw = String(body.message || '').trim();

    if (!profile) {
      return jsonResponse({ reply: 'I’m not set up to help with this view yet.' }, { status: 400 });
    }
    if (!raw) {
      return jsonResponse({ reply: 'Ask me anything about what’s on this page.' }, { status: 400 });
    }

    const message = raw.slice(0, MAX_INPUT_LENGTH);
    let contextStr = '';
    try {
      contextStr = JSON.stringify(body.context ?? {});
    } catch {
      contextStr = '{}';
    }
    if (contextStr.length > MAX_CONTEXT_CHARS) {
      contextStr = contextStr.slice(0, MAX_CONTEXT_CHARS);
    }

    const systemPrompt = `${SHARED_PROMPT}\n\n${profile.instructions}`;
    const userContent = `CONTEXT (JSON, read-only — this is what the practitioner is looking at):\n${contextStr}\n\nPRACTITIONER:\n${message}`;

    const llm = await getLLMProvider().generateSimple({
      tier: 'core',
      systemPrompt,
      messages: [{ role: 'user', content: userContent }],
      maxTokens: 800,
      temperature: 0.3,
    });

    const parsed = extractJson(llm.text || '');
    if (!parsed || typeof parsed.reply !== 'string') {
      // Model didn't return clean JSON — treat its text as a plain reflection.
      const fallback = (llm.text || '').trim();
      return jsonResponse({
        reply: fallback || 'I didn’t quite catch that — could you rephrase?',
        proposals: [],
      });
    }

    const rawProposals = Array.isArray(parsed.proposals) ? parsed.proposals : [];
    const proposals = rawProposals
      .map((p, i) => profile.normalizeProposal((p ?? {}) as Record<string, unknown>, i))
      .filter((p): p is Proposal => p !== null)
      .slice(0, 8);

    return jsonResponse({ reply: parsed.reply.trim(), proposals });
  } catch (error) {
    console.error('[STUDIO ASSIST] Error:', error);
    return jsonResponse(
      { reply: 'MAIA is momentarily offline. Try again in a moment.' },
      { status: 500 },
    );
  }
}
