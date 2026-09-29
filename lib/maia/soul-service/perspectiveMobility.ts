import { enforceIdentityPredicateConstraint } from '@/lib/sovereign/identityPredicateGuard';

export const SOUL_SERVICE_PERSPECTIVES = [
  'Time',
  'Scale',
  'Evidence',
  'Relation',
  'Agency',
  'Possibility',
] as const;

export type SoulServicePerspective = (typeof SOUL_SERVICE_PERSPECTIVES)[number];

export type SoulServicePerspectiveResponse = {
  perspective: SoulServicePerspective;
  foreground: string;
  question: string;
  boundary: string;
};

type ModelPerspectiveQuestion = {
  perspective: SoulServicePerspective;
  question: string;
};

export type SoulServicePerspectiveValidation =
  | { ok: true; response: SoulServicePerspectiveResponse }
  | { ok: false; reasons: string[] };

const MAX_SOURCE_CHARS = 4000;
const MAX_FRAME_CHARS = 100;
const MAX_QUESTION_CHARS = 180;

const DISALLOWED: Array<{ id: string; pattern: RegExp }> = [
  { id: 'second-person-identity', pattern: /\b(?:you are|you're|you have|your pattern|you tend to|who you are)\b/i },
  { id: 'diagnosis', pattern: /\b(?:diagnos|patholog|disorder|syndrome|narciss|bipolar|borderline|adhd|autis(?:m|tic)|depress(?:ion|ed)|anxi(?:ety|ous))\b/i },
  { id: 'motive-as-fact', pattern: /\b(?:avoidant|avoidance|self[- ]?sabotag\w*|perfectionism|perfectionist(?:ic)?|fear[- ]based|ego[- ]driven|resistance|trauma response|attachment style)\b/i },
  { id: 'authored-pattern-claim', pattern: /\byour\b[^.?!]{0,32}\b(?:pattern|trait|identity|nature)\b/i },
  { id: 'ranked-perspective', pattern: /\b(?:better perspective|deeper perspective|healthier perspective|wiser perspective|more evolved|truer view|real issue|actual issue)\b/i },
  { id: 'prescription', pattern: /\b(?:you should|you must|you need to)\b/i },
  { id: 'overcertainty', pattern: /\b(?:definitively|conclusively|certainly|prove|guarantee|guaranteed)\b/i },
  { id: 'other-mind-claim', pattern: /\b(?:they feel|they think|they want|they need|they are afraid|they believe)\b/i },
];

const GROUNDED_ROLE_TERMS = [
  'team',
  'teams',
  'user',
  'users',
  'reader',
  'readers',
  'stakeholder',
  'stakeholders',
  'client',
  'clients',
  'partner',
  'partners',
  'market',
  'markets',
  'funding',
  'resources',
  'audience',
  'audiences',
] as const;

const PERSPECTIVE_GROUNDING: Record<
  SoulServicePerspective,
  { foreground: string; boundary: string }
> = {
  Time: {
    foreground:
      'This aperture distinguishes what is stated now from earlier or future context that is not present in the source.',
    boundary:
      'No past sequence, developmental story, or future outcome is established by this source.',
  },
  Scale: {
    foreground:
      'This aperture holds the current project-level question while making room to examine a narrower or wider scale.',
    boundary:
      'The source does not establish that any larger pattern or smaller moment explains the whole.',
  },
  Evidence: {
    foreground:
      'This aperture separates the source statement from evidence that could support, complicate, or change the current view.',
    boundary:
      'The source does not establish readiness, quality, motive, cause, or future outcome.',
  },
  Relation: {
    foreground:
      'This aperture asks what explicitly known relationships or roles may be relevant without attributing unspoken states to anyone.',
    boundary:
      'No other person, role, motive, feeling, or view is established unless the source names it.',
  },
  Agency: {
    foreground:
      'This aperture distinguishes possible influence, constraint, and acceptance without assuming which one applies.',
    boundary:
      'The source alone does not establish what is controllable, constrained, or outside influence.',
  },
  Possibility: {
    foreground:
      'This aperture widens beyond the current binary without predicting which path will occur.',
    boundary:
      'No future outcome, available resource, or unstated option is established by the source.',
  },
};

export const SOUL_SERVICE_PERSPECTIVE_SYSTEM_PROMPT = `
You are MAIA operating inside a narrowly governed Soul-Service perspective-mobility pilot.

PURPOSE
The member explicitly chooses one perspective dimension. Your ONLY generative act is to offer one open question inside that chosen aperture.

AUTHORITY
- Current-turn only.
- No autobiographical memory.
- The perspective dimension is chosen by the member; do not substitute another one.
- An optional member-selected frame may be present. Treat it as a current-turn member ruling, not a permanent fact.
- Do not infer facts, roles, people, events, motives, traits, pathology, developmental stage, identity, or another person's inner state.
- Do not name a team, users, readers, stakeholders, clients, partners, market, funding, resources, or other context unless the source itself names them.
- Do not prescribe what should be done.
- Do not ask a why-question that presupposes an unestablished cause or motive.
- Preserve uncertainty.
- Do not promise definitive, conclusive, guaranteed, or certain resolution.

PERSPECTIVE MEANINGS
Time: ask about then, now, or possible future without narrating causation.
Scale: ask about another scale without assuming one scale explains another.
Evidence: ask what evidence would support, complicate, or change the current view.
Relation: ask what explicitly known relationship or role context may matter, without mind-reading.
Agency: ask what can be influenced, constrained, or left unresolved without assuming which applies.
Possibility: ask what other path could be considered without prediction or recommendation.

OUTPUT
Return ONLY valid JSON with exactly these two fields:
{
  "perspective": "<one exact allowed perspective>",
  "question": "...?"
}

CONSTRAINTS
- perspective must exactly match the member-selected dimension.
- question: one natural open question, maximum 24 words, ending with "?".
- The question must not assert any fact that is not in the source.
- no markdown, no code fence, no extra keys, no prose outside JSON.

GOOD EXAMPLE
Selected perspective: Evidence
Source: "Should this project keep being refined or finally be released?"
{
  "perspective": "Evidence",
  "question": "What evidence would materially change the current judgment about whether to refine or release?"
}
`.trim();

export function normalizePerspectiveSource(source: unknown): string | null {
  if (typeof source !== 'string') return null;
  const normalized = source.trim().replace(/\s+/g, ' ');
  if (normalized.length < 4 || normalized.length > MAX_SOURCE_CHARS) return null;
  return normalized;
}

export function normalizePerspective(value: unknown): SoulServicePerspective | null {
  if (typeof value !== 'string') return null;
  return (SOUL_SERVICE_PERSPECTIVES as readonly string[]).includes(value)
    ? (value as SoulServicePerspective)
    : null;
}

export function normalizeCurrentFrame(value: unknown): string | null {
  if (value == null || value === '') return null;
  if (typeof value !== 'string') return null;
  const normalized = value.trim().replace(/\s+/g, ' ');
  if (!normalized || normalized.length > MAX_FRAME_CHARS) return null;
  for (const probe of DISALLOWED) {
    if (probe.pattern.test(normalized)) return null;
  }
  const guarded = enforceIdentityPredicateConstraint(normalized);
  return guarded.wasConstrained ? null : normalized;
}

function extractJsonObject(text: string): string | null {
  if (!text) return null;
  const trimmed = text.trim().replace(/^\`\`\`(?:json)?\s*/i, '').replace(/\s*\`\`\`$/i, '');
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  return trimmed.slice(start, end + 1);
}

export function parseModelPerspectiveQuestion(text: string): ModelPerspectiveQuestion | null {
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
  const expected = ['perspective', 'question'];
  if (keys.length !== expected.length || keys.some((key, index) => key !== expected[index])) {
    return null;
  }

  const perspective = normalizePerspective(record.perspective);
  if (!perspective || typeof record.question !== 'string') return null;

  return {
    perspective,
    question: record.question.trim(),
  };
}

function validateText(label: string, text: string, max: number): string[] {
  const reasons: string[] = [];
  if (!text || text.length > max) reasons.push(`${label}:length`);
  if (/\r|\n/.test(text)) reasons.push(`${label}:multiline`);
  for (const probe of DISALLOWED) {
    if (probe.pattern.test(text)) reasons.push(`${label}:${probe.id}`);
  }
  const guarded = enforceIdentityPredicateConstraint(text);
  if (guarded.wasConstrained) reasons.push(`${label}:identity-predicate`);
  return reasons;
}

function unsupportedRoleTerms(question: string, source: string): string[] {
  const q = question.toLowerCase();
  const s = source.toLowerCase();
  return GROUNDED_ROLE_TERMS.filter((term) => {
    const probe = new RegExp(`\\b${term}\\b`, 'i');
    return probe.test(q) && !probe.test(s);
  });
}

export function composeSoulServicePerspectiveResponse(
  model: ModelPerspectiveQuestion,
): SoulServicePerspectiveResponse {
  const grounding = PERSPECTIVE_GROUNDING[model.perspective];
  return {
    perspective: model.perspective,
    foreground: grounding.foreground,
    question: model.question,
    boundary: grounding.boundary,
  };
}

export function validateModelPerspectiveQuestion(
  response: ModelPerspectiveQuestion,
  requestedPerspective: SoulServicePerspective,
  source: string,
): SoulServicePerspectiveValidation {
  const reasons = [...validateText('question', response.question, MAX_QUESTION_CHARS)];

  if (response.perspective !== requestedPerspective) {
    reasons.push('perspective:changed-by-model');
  }
  if (!response.question.endsWith('?')) {
    reasons.push('question:not-open-question');
  }
  if (/^\s*why\b/i.test(response.question)) {
    reasons.push('question:causal-presupposition');
  }

  for (const term of unsupportedRoleTerms(response.question, source)) {
    reasons.push(`question:unsupported-role:${term}`);
  }

  return reasons.length
    ? { ok: false, reasons: Array.from(new Set(reasons)).sort() }
    : { ok: true, response: composeSoulServicePerspectiveResponse(response) };
}

export function buildPerspectiveUserInput(args: {
  source: string;
  perspective: SoulServicePerspective;
  currentFrame?: string | null;
}): string {
  const lines = [
    'SOURCE STATEMENT',
    args.source,
    '',
    'MEMBER-SELECTED PERSPECTIVE',
    args.perspective,
  ];

  if (args.currentFrame) {
    lines.push('', 'CURRENT-TURN MEMBER FRAME', args.currentFrame);
  }

  lines.push('', 'Respond only inside the member-selected perspective.');
  return lines.join('\n');
}

export function buildPerspectiveAbstention(
  perspective: SoulServicePerspective,
): SoulServicePerspectiveResponse {
  const grounding = PERSPECTIVE_GROUNDING[perspective];
  return {
    perspective,
    foreground: grounding.foreground,
    question: 'What additional evidence or context would make this perspective genuinely useful?',
    boundary: grounding.boundary,
  };
}
