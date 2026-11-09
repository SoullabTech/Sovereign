// LISTEN-01 · Sound Studio review conversation, phase 1 (founder rulings 2026-11-09).
//
// Pure module: validation, limits, prompts and parsing. No I/O, no model calls, no database.
// The review guide is NOT MAIA. It sees only this conversation and the work's public description, never MAIA's
// memory, and nothing it hears is saved until the reviewer confirms the summary lines.
// Design: docs/programme/LISTEN-01_SOUND_STUDIO_REVIEW_CONVERSATION_DESIGN_DRAFT_2026-11-09.md

export const REVIEW_CONSENT_VERSION = 'sound-studio-review-v1-2026-11-09';
export const REVIEW_GUIDE_NAME = 'Sound Studio review';

export const REVIEWABLE_WORKS: Readonly<Record<string, string>> = Object.freeze({
  'open-ground-432-v1': 'Open Ground',
  'night-ground-01-guided-arrival-v0.1': 'Night Ground 01 — Guided Arrival',
  'night-ground-01-nicole-first-night-v0.1': 'Night Ground 01 — Nicole First Night',
  'night-ground-01-extended-night-v0.1': 'Night Ground 01 — Extended Night',
  'night-ground-01-music-only-v0.1': 'Night Ground 01 — Music Only',
});

export const MAX_MESSAGES = 24;          // guide + reviewer messages in one conversation
export const MAX_MESSAGE_CHARS = 2000;
export const SUGGEST_FINISH_AFTER = 6;   // reviewer replies before the guide offers to wrap up
export const MAX_LINES = 12;
export const MAX_LINE_CHARS = 500;

export type ReviewRole = 'guide' | 'reviewer';
export type ReviewTurn = { role: ReviewRole; text: string };
export type ReviewLineKind = 'observation' | 'experience' | 'suggestion';
export type ReviewLine = { kind: ReviewLineKind; text: string };
const LINE_KINDS: ReadonlySet<string> = new Set(['observation', 'experience', 'suggestion']);

export const PAUSE_TOKEN = '[[PAUSE_REVIEW]]';
export const SUPPORT_MESSAGE =
  "Let's pause the review here. This is a conversation about the sound, not support, and what you're carrying " +
  'matters more than any feedback. If you are struggling, please reach out to someone you trust or a local ' +
  'crisis line. Nothing from this conversation has been saved.';

export function isReviewableWork(workId: unknown): workId is string {
  return typeof workId === 'string' && Object.prototype.hasOwnProperty.call(REVIEWABLE_WORKS, workId);
}

/** The guide always opens the same way: one open, non-leading question. No model call is needed for it. */
export function openingQuestion(workId: string): string {
  return `What stood out to you in ${REVIEWABLE_WORKS[workId] ?? 'this work'}? Anything at all: a moment, a sound, a feeling, something that bothered you.`;
}

function cleanText(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null;
  const text = value.replace(/\u0000/g, '').trim();
  if (!text || text.length > max) return null;
  return text;
}

/**
 * Accept a client transcript only if it is well formed: alternating turns starting with the guide,
 * within limits. `endWith` is the role the last turn must have.
 */
export function validateTranscript(raw: unknown, endWith: ReviewRole): ReviewTurn[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_MESSAGES) return null;
  const turns: ReviewTurn[] = [];
  for (let i = 0; i < raw.length; i += 1) {
    const item = raw[i] as Record<string, unknown> | null;
    if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
    const keys = Object.keys(item);
    if (keys.length !== 2 || !keys.includes('role') || !keys.includes('text')) return null;
    const expected: ReviewRole = i % 2 === 0 ? 'guide' : 'reviewer';
    if (item.role !== expected) return null;
    const text = cleanText(item.text, MAX_MESSAGE_CHARS);
    if (text === null) return null;
    turns.push({ role: expected, text });
  }
  if (turns[turns.length - 1]?.role !== endWith) return null;
  return turns;
}

export function reviewerReplyCount(turns: readonly ReviewTurn[]): number {
  return turns.filter(t => t.role === 'reviewer').length;
}

export function renderTranscript(turns: readonly ReviewTurn[]): string {
  return turns.map(t => `${t.role === 'guide' ? 'GUIDE' : 'REVIEWER'}: ${t.text}`).join('\n\n');
}

export function guideSystemPrompt(workId: string, description: string): string {
  const title = REVIEWABLE_WORKS[workId] ?? 'a Sound Studio work';
  return [
    `You are "${REVIEW_GUIDE_NAME}", a product-review guide for Soullab's Sound Studio. You are NOT MAIA and must never call yourself MAIA.`,
    `The reviewer is a professional beta tester who just listened to "${title}". About the work: ${description}`,
    'Your job: help them give clear, useful feedback on the work and the listening room, in their own words.',
    'Rules:',
    '- Ask exactly ONE short, open, non-leading question per reply. Never suggest an answer.',
    '- Follow up on what they actually said. Ask for the specific moment, passage or minute when it helps.',
    '- Over the conversation, cover craft (mix, level, tone, voice, edits, loop or ending), arc, whether it suits its purpose, and the room (starting, pausing, stopping, leaving), but only as their answers make room for it.',
    '- Keep their professional vocabulary. Do not translate it into spiritual or Soullab language.',
    '- Never praise or defend the work, never argue, never explain design intent.',
    '- Never ask about health, healing, therapy, brainwaves or effects on the body, and never claim any.',
    '- You do not remember anything beyond this conversation and must not imply that you do.',
    `- If the reviewer expresses distress, crisis or a wish to harm themselves, reply with exactly ${PAUSE_TOKEN} and nothing else.`,
    '- Reply in plain text, at most three sentences.',
  ].join('\n');
}

export function guideUserInput(turns: readonly ReviewTurn[]): string {
  const offerWrap = reviewerReplyCount(turns) >= SUGGEST_FINISH_AFTER;
  return [
    'Conversation so far:',
    renderTranscript(turns),
    '',
    offerWrap
      ? 'Write the guide\'s next reply. They have said a lot; ask whether there is anything else, or whether they are ready to see the summary.'
      : 'Write the guide\'s next reply.',
  ].join('\n');
}

export type GuideReply = { kind: 'question'; text: string } | { kind: 'paused'; text: string };

/** Model output is untrusted: detect the pause token, strip markup, bound length. */
export function parseGuideReply(raw: string): GuideReply {
  if (typeof raw !== 'string' || raw.includes(PAUSE_TOKEN)) return { kind: 'paused', text: SUPPORT_MESSAGE };
  const text = raw.replace(/\[\[[^\]]*\]\]/g, '').replace(/\s+\n/g, '\n').trim().slice(0, 600);
  if (!text) return { kind: 'question', text: 'Is there anything else you would like to add?' };
  return { kind: 'question', text };
}

export function summarySystemPrompt(): string {
  return [
    `You are "${REVIEW_GUIDE_NAME}". Turn a finished review conversation into short summary lines for the reviewer to check.`,
    'Use ONLY what the REVIEWER said. Never add, infer or soften. Keep their words and vocabulary where you can.',
    'Each line has a kind: "observation" (what they heard or noticed), "experience" (how it felt to them), or "suggestion" (a change they proposed).',
    `Return JSON only: {"lines":[{"kind":"observation","text":"..."}]}, at most ${MAX_LINES} lines, each under ${MAX_LINE_CHARS} characters.`,
    'If the reviewer said nothing substantive, return {"lines":[]}.',
  ].join('\n');
}

export function summaryUserInput(turns: readonly ReviewTurn[]): string {
  return `Review conversation:\n${renderTranscript(turns)}`;
}

/** Validate reviewer-confirmed (or model-proposed) lines. Returns null if anything is out of bounds. */
export function validateLines(raw: unknown): ReviewLine[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_LINES) return null;
  const lines: ReviewLine[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
    const rec = item as Record<string, unknown>;
    if (Object.keys(rec).some(k => k !== 'kind' && k !== 'text')) return null;
    if (typeof rec.kind !== 'string' || !LINE_KINDS.has(rec.kind)) return null;
    const text = cleanText(rec.text, MAX_LINE_CHARS);
    if (text === null) return null;
    lines.push({ kind: rec.kind as ReviewLineKind, text });
  }
  return lines;
}

/** Parse the model's proposed summary. Invalid output yields an empty proposal, never an error the reviewer sees. */
export function parseSummary(raw: string): ReviewLine[] {
  if (typeof raw !== 'string') return [];
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start < 0 || end <= start) return [];
  try {
    const parsed = JSON.parse(raw.slice(start, end + 1)) as { lines?: unknown };
    if (Array.isArray(parsed.lines) && parsed.lines.length === 0) return [];
    return validateLines(parsed.lines) ?? [];
  } catch {
    return [];
  }
}

export type SaveRequest = {
  workId: string;
  lines: ReviewLine[];
  transcript: ReviewTurn[] | null;
  passageLabel: string | null;
  elapsedMs: number | null;
  consentVersion: string;
};

/** Validate a save body. The consent version must be the current one; extra keys are refused. */
export function validateSaveRequest(raw: unknown): SaveRequest | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const body = raw as Record<string, unknown>;
  const allowed = new Set(['workId', 'lines', 'transcript', 'keepTranscript', 'passageLabel', 'elapsedMs', 'consentVersion']);
  if (Object.keys(body).some(k => !allowed.has(k))) return null;
  if (!isReviewableWork(body.workId)) return null;
  if (body.consentVersion !== REVIEW_CONSENT_VERSION) return null;
  const lines = validateLines(body.lines);
  if (!lines) return null;
  let transcript: ReviewTurn[] | null = null;
  if (body.keepTranscript === true) {
    const lastRole: ReviewRole = Array.isArray(body.transcript) && body.transcript.length % 2 === 0 ? 'reviewer' : 'guide';
    transcript = validateTranscript(body.transcript, lastRole);
    if (!transcript) return null;
  } else if (body.keepTranscript !== undefined && body.keepTranscript !== false) {
    return null;
  }
  const passageLabel = body.passageLabel == null ? null : cleanText(body.passageLabel, 120);
  if (body.passageLabel != null && passageLabel === null) return null;
  let elapsedMs: number | null = null;
  if (body.elapsedMs != null) {
    if (typeof body.elapsedMs !== 'number' || !Number.isInteger(body.elapsedMs) || body.elapsedMs < 0 || body.elapsedMs > 86_400_000) return null;
    elapsedMs = body.elapsedMs;
  }
  return { workId: body.workId as string, lines, transcript, passageLabel, elapsedMs, consentVersion: REVIEW_CONSENT_VERSION };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID.test(value);
}
