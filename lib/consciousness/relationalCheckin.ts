/**
 * Relational Check-In Engine
 *
 * The heart of the Relationship Field.
 * Takes felt signals + free text, returns structured reflection.
 *
 * Design principles:
 * - Too vague = useless. Too interpretive = invasive. Just right = catalytic.
 * - No diagnosis. No advice. No optimization.
 * - Stabilize perception. Organize inner data. Reflect pattern. Name the field.
 * - One honest next move, not a list of options.
 * - For inner figures: honor them as real presences, not problems to fix.
 */

import Anthropic from '@anthropic-ai/sdk';

export interface CheckInInput {
  relationshipName: string;
  realm: 'outer' | 'inner' | 'transpersonal';
  bondType: string | null;
  feltSignals: string[];
  freeText?: string;
  lastFieldTone?: string | null;
  recentEntries?: Array<{
    kind: string;
    content?: string | null;
    freeText?: string | null;
    feltSignals?: string[] | null;
    maiaReflection?: string | null;
    createdAt: string;
  }>;
}

export interface CheckInResult {
  reflection: string;
  patternHint: string;
  fieldTone: string;
  suggestedMovement: string;
}

// ── Closed field tone vocabulary ──
// Free-form tone from Claude is mapped to the nearest canonical tone.
// This prevents UI fragmentation and keeps the field legible over time.
export const CANONICAL_TONES = [
  'open', 'contracted', 'unclear', 'tense', 'warm',
  'distant', 'fragile', 'active', 'quiet', 'unresolved',
] as const;

export type CanonicalTone = typeof CANONICAL_TONES[number];

// Synonyms → canonical mapping
const TONE_SYNONYMS: Record<string, CanonicalTone> = {
  // open
  open: 'open', opening: 'open', receptive: 'open', available: 'open', spacious: 'open',
  // contracted
  contracted: 'contracted', closed: 'contracted', shut: 'contracted', tight: 'contracted', constricted: 'contracted', withdrawn: 'contracted',
  // unclear
  unclear: 'unclear', ambiguous: 'unclear', murky: 'unclear', confused: 'unclear', foggy: 'unclear', uncertain: 'unclear', unknown: 'unclear',
  // tense
  tense: 'tense', pressurized: 'tense', charged: 'tense', strained: 'tense', agitated: 'tense', volatile: 'tense', conflicted: 'tense', combative: 'tense', reactive: 'tense', defensive: 'tense',
  // warm
  warm: 'warm', tender: 'warm', loving: 'warm', affectionate: 'warm', gentle: 'warm', caring: 'warm', nourishing: 'warm',
  // distant
  distant: 'distant', remote: 'distant', detached: 'distant', disconnected: 'distant', cool: 'distant', removed: 'distant',
  // fragile
  fragile: 'fragile', delicate: 'fragile', vulnerable: 'fragile', brittle: 'fragile', tentative: 'fragile',
  // active
  active: 'active', alive: 'active', dynamic: 'active', moving: 'active', energized: 'active', vibrant: 'active',
  // quiet
  quiet: 'quiet', still: 'quiet', calm: 'quiet', peaceful: 'quiet', settled: 'quiet', resting: 'quiet',
  // unresolved
  unresolved: 'unresolved', unfinished: 'unresolved', incomplete: 'unresolved', suspended: 'unresolved', pending: 'unresolved', lingering: 'unresolved',
};

function normalizeFieldTone(raw: string): CanonicalTone {
  const cleaned = raw.toLowerCase().replace(/[^a-z\s]/g, '').trim();

  // Exact match
  if (TONE_SYNONYMS[cleaned]) return TONE_SYNONYMS[cleaned];

  // Check if any synonym word appears in the raw output
  for (const [synonym, canonical] of Object.entries(TONE_SYNONYMS)) {
    if (cleaned.includes(synonym)) return canonical;
  }

  // Fallback
  return 'unclear';
}

// ── Length enforcement ──
function truncateToSentences(text: string, maxSentences: number): string {
  const sentences = text.match(/[^.!?]+[.!?]+/g);
  if (!sentences) return text.substring(0, 200);
  return sentences.slice(0, maxSentences).join(' ').trim();
}

// ── Strip markdown artifacts ──
function cleanOutput(text: string): string {
  return text.replace(/\*{1,2}/g, '').replace(/^#+\s*/gm, '').trim();
}

function buildRecentContext(entries: CheckInInput['recentEntries']): string {
  if (!entries || entries.length === 0) return 'No previous entries.';

  return entries.slice(0, 3).map(e => {
    const parts: string[] = [];
    if (e.kind === 'checkin' && e.feltSignals?.length) {
      parts.push(`Check-in (${e.feltSignals.join(', ')})`);
      if (e.freeText) parts.push(`Sensing: "${e.freeText}"`);
      if (e.maiaReflection) parts.push(`Reflected: ${e.maiaReflection}`);
    } else if (e.content) {
      parts.push(`${e.kind}: "${e.content.substring(0, 200)}"`);
    }
    return parts.join(' — ');
  }).join('\n');
}

function buildPrompt(input: CheckInInput): string {
  const realmGuide = {
    outer: 'This is a relationship with another person. Focus on the interpersonal field — what is spoken and unspoken between two people.',
    inner: 'This is a relationship with an inner figure or part of the psyche. Focus on the intrapsychic field — what this part carries, what it protects, what it needs, how the member relates to it. Honor inner figures as real presences, not problems to fix.',
    transpersonal: 'This is a relationship with something larger — the sacred, vocation, nature, ancestors. Focus on the quality of connection — devotion, awe, resistance, longing, calling. Do not theologize.',
  };

  return `You are reflecting on a relational field — the living space between a person and ${input.relationshipName}${input.bondType ? ` (${input.bondType})` : ''}.

Realm: ${input.realm}
${realmGuide[input.realm]}

Current signals: ${input.feltSignals.join(', ')}
${input.freeText ? `What they are sensing: "${input.freeText}"` : ''}
${input.lastFieldTone ? `Previous field tone: ${input.lastFieldTone}` : 'No previous field tone recorded.'}

Recent history:
${buildRecentContext(input.recentEntries)}

Respond with exactly four labeled sections. Each should be 1-2 sentences maximum.

REFLECTION: Mirror back what you notice. Not analysis. Not interpretation. Just clear seeing.
PATTERN: If something repeats across entries, name it simply. If not enough history, say "Not enough history yet."
FIELD_TONE: One word or short phrase for the current atmosphere in this field.
MOVEMENT: One grounded next step. Not advice. The next honest move.

FIELD_TONE must be exactly one of: open, contracted, unclear, tense, warm, distant, fragile, active, quiet, unresolved. Choose the closest match.

Constraints:
- Do not diagnose. Do not prescribe. Do not flatten.
- Language should feel like clear water, not clinical assessment.
- Do not fabricate patterns where insufficient data exists.
- The movement should feel like something a wise friend might quietly suggest.
- Keep each section to 1-2 sentences. Brevity is clarity.
- Match your depth to the input depth. If the input is one signal with no free text, reflect simply. Do not add metaphor or richness that the input does not support.
- Do not use markdown formatting (no ** or ## or *).`;
}

function parseResponse(text: string, entryCount: number): CheckInResult {
  const sections: Record<string, string> = {};

  const labels = ['REFLECTION', 'PATTERN', 'FIELD_TONE', 'MOVEMENT'];
  for (const label of labels) {
    const regex = new RegExp(`${label}:\\s*(.+?)(?=\\n(?:${labels.join('|')}):|\$)`, 's');
    const match = text.match(regex);
    sections[label] = match ? match[1].trim() : '';
  }

  // ── Hard guards ──

  // Reflection: max 2 sentences, strip markdown
  let reflection = cleanOutput(sections.REFLECTION || 'Something is present here, even if not yet clear.');
  reflection = truncateToSentences(reflection, 2);

  // Pattern: enforce honesty with low data
  let patternHint = cleanOutput(sections.PATTERN || 'Not enough history yet.');
  if (entryCount < 3) {
    patternHint = 'Not enough history yet.';
  } else {
    patternHint = truncateToSentences(patternHint, 1);
  }

  // Field tone: normalize to closed vocabulary
  const fieldTone = normalizeFieldTone(cleanOutput(sections.FIELD_TONE || 'unclear'));

  // Movement: max 1 sentence, strip markdown
  let suggestedMovement = cleanOutput(sections.MOVEMENT || 'Pause and notice what you are feeling.');
  suggestedMovement = truncateToSentences(suggestedMovement, 1);

  return { reflection, patternHint, fieldTone, suggestedMovement };
}

export async function performRelationalCheckin(input: CheckInInput): Promise<CheckInResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('[relationalCheckin] No ANTHROPIC_API_KEY');
    return {
      reflection: 'The reflection service is temporarily unavailable.',
      patternHint: 'Not enough history yet.',
      fieldTone: 'unknown',
      suggestedMovement: 'Sit with what you are sensing. That is enough for now.',
    };
  }

  try {
    const client = new Anthropic({ apiKey });
    const prompt = buildPrompt(input);

    const response = await client.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 400,
      // Sonnet 5 runs adaptive thinking by default; disable it so the small
      // token budget goes entirely to the four labeled sections. The installed
      // SDK (0.27.x) predates the `thinking` param, hence the assertion — the
      // SDK forwards it to the API untouched.
      thinking: { type: 'disabled' },
      messages: [{ role: 'user', content: prompt }],
    } as Anthropic.MessageCreateParamsNonStreaming);

    const text = response.content[0]?.type === 'text' ? response.content[0].text : '';
    const entryCount = input.recentEntries?.length ?? 0;
    return parseResponse(text, entryCount);
  } catch (error) {
    console.error('[relationalCheckin] API error:', error);
    return {
      reflection: 'The reflection could not be generated right now.',
      patternHint: 'Not enough history yet.',
      fieldTone: 'unknown',
      suggestedMovement: 'Stay with what you noticed. That noticing itself is the work.',
    };
  }
}
