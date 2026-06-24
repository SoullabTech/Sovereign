/**
 * Natural Language Capture — intent parser
 *
 * Maps a member's messy, natural language into candidate structured objects — the
 * bridge from received human language into calendar / field / workspace objects.
 * It is the structuring half of the Marran/Kane arrival flow: Marran receives and
 * reflects (store-nothing); this parser turns *consented* language into candidates;
 * Kane creates them via existing writers only after the member confirms.
 *
 * Constitutional constraints, enforced here:
 *  - PARSE ONLY. This module never writes, never creates, never persists. Creation
 *    happens elsewhere, on an explicit member gesture, via existing writers
 *    (calendar/events, focus/triage, field/records). Mirrors the studio/assist/ask
 *    invariant: "MAIA proposes, the human commits."
 *  - It does not turn every utterance into a task. `kind: 'accompaniment'` means
 *    "this wants to be received, not structured" — the caller must route it back to
 *    reception (Marran), never forward to Kane.
 *  - MAIA inquires; the human discerns. low confidence reflects possible
 *    interpretations rather than deciding; medium asks ONE clarifying question.
 *  - It never assigns meaning the member did not state, and never invents fields.
 *    Preserve the autonomy of emergence: extract only what the language already
 *    contains — no forced form-filling.
 *
 * Reuses the proven shape of `app/api/studio/assist/ask` (LLM-extract →
 * schema-validate → propose → human pre-fills → commits via an existing writer),
 * generalized from one-surface-one-kind to one-input-many-kinds with confidence.
 */
import { z } from 'zod';
import { getLLMProvider } from '@/lib/consciousness/LLMProvider';
import { parseDraftJsonWithRepair } from '@/lib/studio/followups/parseDraftJsonWithRepair';

export const CAPTURE_KINDS = [
  'calendar_event',
  'reminder',
  'field_note',
  'workspace_item',
  'commitment',
  'contact_reference',
  'location_reference',
  'project_reference',
  'conversation_continuation',
  'accompaniment',
] as const;
export type CaptureKind = (typeof CAPTURE_KINDS)[number];
export type Confidence = 'high' | 'medium' | 'low';

const CandidateSchema = z.object({
  kind: z.enum(CAPTURE_KINDS),
  confidence: z.enum(['high', 'medium', 'low']),
  title: z.string().trim().min(1).optional(),
  fields: z.record(z.any()).default({}),
  /** high: a single sentence the member can say yes to. */
  confirmation: z.string().trim().min(1).optional(),
  /** medium: ONE question for the single missing critical field. */
  clarifyingQuestion: z.string().trim().min(1).optional(),
  /** low: 2–3 readings, offered without choosing. */
  possibleInterpretations: z.array(z.string().trim().min(1)).optional(),
});
export type CaptureCandidate = z.infer<typeof CandidateSchema>;

const ParseResultSchema = z.object({
  candidates: z.array(CandidateSchema).max(5).default([]),
});

export interface ParseCaptureResult {
  candidates: CaptureCandidate[];
  rawInput: string;
}

export interface ParseCaptureOptions {
  /** ISO timestamp used to resolve relative dates ("today", "Friday"). */
  now: string;
  /** IANA timezone, e.g. "America/New_York". Defaults to UTC. */
  timezone?: string;
}

const YMD = /^\d{4}-\d{2}-\d{2}$/;
const HM = /^([01]\d|2[0-3]):[0-5]\d$/;

function buildSystemPrompt({ now, timezone }: { now: string; timezone: string }): string {
  return `You convert a member's messy, natural language into candidate structured objects for a personal field app. Extract only AS MUCH structure as the language already contains — never more.

Now: ${now}
Timezone: ${timezone}
Resolve relative dates/times ("today", "tomorrow", "Friday", "in 20 minutes") against Now in the given timezone.

CLASSIFY the member's intent into one of these kinds:
- calendar_event — a meeting/appointment with a time ("10am meeting", "lunch Friday").
- reminder — a time-anchored nudge to remember or do something ("remind me to call the dentist").
- field_note — something to hold or remember that is NOT time-anchored ("this feels important", "I want to remember…").
- commitment — an intention to act ("I should…"). NEVER treat as settled — always ask before creating.
- workspace_item — a thing to work on, build, or a project task.
- contact_reference / location_reference / project_reference — a person / place / project worth saving.
- conversation_continuation — they want to keep talking or thinking with MAIA.
- accompaniment — they are reflecting, processing, or asking "what do I do with this?" This WANTS TO BE RECEIVED, NOT STRUCTURED. Return kind:"accompaniment" with empty fields. Do not turn reflection into a task.

Intent cues: "I need to remember…" → field_note or reminder; "Schedule…/at 10am…" → calendar_event; "This feels important…" → field_note; "I should…" → commitment (ask first); "What do I do with this?" / venting / processing → accompaniment.

For calendar_event, extract into "fields" only where present: { "date":"YYYY-MM-DD", "startTime":"HH:mm", "endTime":"HH:mm", "person":"", "location":"", "city":"", "travelNote":"", "reminderMinutes": <number> }. Also a concise "title" (e.g. "Meeting with Nathan"). OMIT any field not present — do not guess.

CONFIDENCE:
- "high" — intent is clear and the critical fields are present. Provide "confirmation": one short sentence the member can say yes to, e.g. "I heard: Meeting with Nathan today at 10:00am at Common Ground Coffee Shop in Branford, MA. Add this to your calendar?"
- "medium" — intent is clear but one critical field is missing or ambiguous. Provide ONE "clarifyingQuestion" asking only for that field. Do not fill it yourself.
- "low" — the intent itself is genuinely ambiguous. Provide 2–3 short "possibleInterpretations" and do NOT choose. Reflect; let the member decide.

RULES:
- Never invent facts, names, times, or places not in the input.
- Never assign meaning the member did not state. You inquire; the member discerns.
- Prefer fewer, accurate fields over more, guessed ones. No forced form-filling.
- If two readings are plausible, return up to 3 candidates (most likely first) — do not over-decide.
- When in doubt between structuring and receiving, prefer accompaniment. Reflection is not a task.

Respond with STRICT JSON only, no prose:
{"candidates":[{"kind":"...","confidence":"high|medium|low","title":"...","fields":{...},"confirmation":"...","clarifyingQuestion":"...","possibleInterpretations":["..."]}]}`;
}

/**
 * Validate/normalize a candidate. A `calendar_event` claimed "high" but missing a
 * well-formed date or time is downgraded to "medium" with a clarifying question —
 * MAIA never presents a malformed event as ready to confirm. Pure; unit-tested.
 */
export function normalizeCandidate(c: CaptureCandidate): CaptureCandidate {
  if (c.kind !== 'calendar_event') return c;

  const fields: Record<string, unknown> = { ...c.fields };
  const date = typeof fields.date === 'string' && YMD.test(fields.date) ? fields.date : undefined;
  const startTime =
    typeof fields.startTime === 'string' && HM.test(fields.startTime) ? fields.startTime : undefined;

  if (date) fields.date = date;
  else delete fields.date;
  if (startTime) fields.startTime = startTime;
  else delete fields.startTime;

  if (c.confidence === 'high' && !(date && startTime)) {
    const missing = !date && !startTime ? 'date and time' : !date ? 'date' : 'time';
    return {
      ...c,
      fields,
      confidence: 'medium',
      confirmation: undefined,
      clarifyingQuestion:
        c.clarifyingQuestion ?? `What ${missing} should I use for "${c.title ?? 'this'}"?`,
    };
  }

  return { ...c, fields };
}

/**
 * Parse raw member language into candidate structured objects. Never writes.
 */
export async function parseCapture(
  input: string,
  options: ParseCaptureOptions,
): Promise<ParseCaptureResult> {
  const trimmed = input.trim().slice(0, 4000);
  if (!trimmed) return { candidates: [], rawInput: input };

  const provider = getLLMProvider();
  const systemPrompt = buildSystemPrompt({ now: options.now, timezone: options.timezone ?? 'UTC' });

  const first = await provider.generateSimple({
    tier: 'core',
    systemPrompt,
    messages: [{ role: 'user', content: trimmed }],
    temperature: 0.2,
    maxTokens: 800,
  });

  const parsed = await parseDraftJsonWithRepair({
    rawText: first.text,
    schema: ParseResultSchema,
    repair: async ({ zodError }) => {
      const retry = await provider.generateSimple({
        tier: 'core',
        systemPrompt,
        messages: [
          { role: 'user', content: trimmed },
          { role: 'assistant', content: first.text },
          {
            role: 'user',
            content: `That was not valid against the schema (${zodError}). Reply again with STRICT JSON only, matching the schema exactly.`,
          },
        ],
        temperature: 0,
        maxTokens: 800,
      });
      return retry.text;
    },
  });

  return {
    candidates: parsed.candidates.map(normalizeCandidate),
    rawInput: trimmed,
  };
}
