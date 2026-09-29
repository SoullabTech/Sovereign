import { enforceIdentityPredicateConstraint } from '@/lib/sovereign/identityPredicateGuard';

export type SoulServiceFrameProposal = {
  possibleFrame: string;
  possibleRationale: string;
  alternativeFrame: string;
  alternativeRationale: string;
};

export type SoulServiceFrameValidation =
  | { ok: true; proposal: SoulServiceFrameProposal }
  | { ok: false; reasons: string[] };

const MAX_SOURCE_CHARS = 4000;
const MAX_FRAME_CHARS = 80;
const MAX_RATIONALE_CHARS = 220;

const DIAGNOSTIC_OR_IDENTITY_PATTERNS: Array<{ id: string; pattern: RegExp }> = [
  { id: 'second-person-identity', pattern: /\b(?:you are|you're|you have|your pattern|you tend to|who you are)\b/i },
  { id: 'diagnosis', pattern: /\b(?:diagnos|patholog|disorder|syndrome|narciss|bipolar|borderline|adhd|autis(?:m|tic)|depress(?:ion|ed)|anxi(?:ety|ous))\b/i },
  { id: 'motive-as-fact', pattern: /\b(?:avoidant|avoidance|self[- ]?sabotag|perfectionis|fear[- ]based|ego[- ]driven|resistance|trauma response|attachment style)\b/i },
  { id: 'ranked-perspective', pattern: /\b(?:better frame|deeper frame|healthier frame|wiser frame|more evolved|truer frame|real issue|actual issue)\b/i },
  { id: 'prescription', pattern: /\b(?:you should|you must|you need to)\b/i },
];

export const SOUL_SERVICE_FRAME_SYSTEM_PROMPT = `
You are MAIA operating inside a narrowly governed Soul-Service frame-detection pilot.

PURPOSE
Help the member see a current question from more than one possible aperture without diagnosing, steering, ranking, or defining the member.

CURRENT-TURN AUTHORITY ONLY
- You receive one source statement and no autobiographical memory.
- Do not infer enduring traits, motives, pathology, developmental stage, hidden meaning, or identity.
- Do not claim that either frame is the "real", "deeper", "healthier", "better", or "truer" view.
- Do not prescribe what the member should choose.
- Do not address the member as "you" inside the frame labels or rationales.
- Describe the structure of the inquiry, not the person.
- Preserve "unknown" when evidence is insufficient.

OUTPUT
Return ONLY valid JSON with exactly these four string fields:
{
  "possibleFrame": "...",
  "possibleRationale": "...",
  "alternativeFrame": "...",
  "alternativeRationale": "..."
}

CONSTRAINTS
- Each frame label: 2-8 ordinary words, situational, non-diagnostic.
- Each frame label must sound like a natural phrase a person could say aloud; do not output compressed keywords or metadata-style noun bundles.
- Prefer an ordinary question fragment or human-readable phrase when possible.
- Each rationale: one short sentence, at most 28 words.
- The alternative must materially change what enters the foreground.
- Frames are not conclusions.
- No markdown, no code fence, no extra keys, no prose outside the JSON.

GOOD EXAMPLE
Source: "Should this project keep being refined or finally be released?"
{
  "possibleFrame": "continue or release",
  "possibleRationale": "The question is currently organized around a two-way decision.",
  "alternativeFrame": "what would make it ready enough",
  "alternativeRationale": "This view foregrounds release conditions, timing, and threshold rather than a binary choice."
}
`.trim();

export function normalizeSoulServiceSource(source: unknown): string | null {
  if (typeof source !== 'string') return null;
  const normalized = source.trim().replace(/\s+/g, ' ');
  if (normalized.length < 4 || normalized.length > MAX_SOURCE_CHARS) return null;
  return normalized;
}

function extractJsonObject(text: string): string | null {
  if (!text) return null;
  const trimmed = text.trim().replace(/^\`\`\`(?:json)?\s*/i, '').replace(/\s*\`\`\`$/i, '');
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  return trimmed.slice(start, end + 1);
}

export function parseSoulServiceFrameProposal(text: string): SoulServiceFrameProposal | null {
  const json = extractJsonObject(text);
  if (!json) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return null;
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
  const record = parsed as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  const expected = [
    'alternativeFrame',
    'alternativeRationale',
    'possibleFrame',
    'possibleRationale',
  ];
  if (keys.length !== expected.length || keys.some((key, index) => key !== expected[index])) return null;

  const possibleFrame = record.possibleFrame;
  const possibleRationale = record.possibleRationale;
  const alternativeFrame = record.alternativeFrame;
  const alternativeRationale = record.alternativeRationale;

  if (
    typeof possibleFrame !== 'string' ||
    typeof possibleRationale !== 'string' ||
    typeof alternativeFrame !== 'string' ||
    typeof alternativeRationale !== 'string'
  ) {
    return null;
  }

  return {
    possibleFrame: possibleFrame.trim(),
    possibleRationale: possibleRationale.trim(),
    alternativeFrame: alternativeFrame.trim(),
    alternativeRationale: alternativeRationale.trim(),
  };
}

function normalizedComparison(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function textViolations(label: string, text: string, maxChars: number): string[] {
  const reasons: string[] = [];
  if (!text || text.length > maxChars) reasons.push(`${label}:length`);
  if (/\r|\n/.test(text)) reasons.push(`${label}:multiline`);
  for (const probe of DIAGNOSTIC_OR_IDENTITY_PATTERNS) {
    if (probe.pattern.test(text)) reasons.push(`${label}:${probe.id}`);
  }

  const guarded = enforceIdentityPredicateConstraint(text);
  if (guarded.wasConstrained) reasons.push(`${label}:identity-predicate`);

  return reasons;
}

export function validateSoulServiceFrameProposal(
  proposal: SoulServiceFrameProposal,
): SoulServiceFrameValidation {
  const reasons = [
    ...textViolations('possibleFrame', proposal.possibleFrame, MAX_FRAME_CHARS),
    ...textViolations('possibleRationale', proposal.possibleRationale, MAX_RATIONALE_CHARS),
    ...textViolations('alternativeFrame', proposal.alternativeFrame, MAX_FRAME_CHARS),
    ...textViolations('alternativeRationale', proposal.alternativeRationale, MAX_RATIONALE_CHARS),
  ];

  if (
    normalizedComparison(proposal.possibleFrame) ===
    normalizedComparison(proposal.alternativeFrame)
  ) {
    reasons.push('frames:not-materially-distinct');
  }

  return reasons.length > 0
    ? { ok: false, reasons: Array.from(new Set(reasons)).sort() }
    : { ok: true, proposal };
}

export function buildSoulServiceFrameUserInput(source: string): string {
  return [
    'SOURCE STATEMENT',
    source,
    '',
    'Offer two situational apertures under the Soul-Service rules.',
  ].join('\n');
}

export function buildSoulServiceAbstentionProposal(): SoulServiceFrameProposal {
  return {
    possibleFrame: 'stay with the source',
    possibleRationale: 'The available wording does not support a more specific situational frame without adding interpretation.',
    alternativeFrame: 'what is still unknown',
    alternativeRationale: 'This view keeps missing context visible rather than filling it with an inference.',
  };
}
