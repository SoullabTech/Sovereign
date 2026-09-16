#!/usr/bin/env npx tsx

/**
 * FIRST-ASK-OPAQUE-MEMORY-01 · ACT 5 recognition acceptance
 *
 * Frozen BEFORE any runtime evidence recognizer exists.
 * This reference recognizer proves the ACT 4 contract is satisfiable; it is
 * not production code and grants no recovery authority.
 */

import assert from 'node:assert/strict';

type EvidenceClass = 'E1' | 'E2' | 'E3';
type Turn = { member: string; assistant?: string; systemSignificance?: number };
type Placement = { sourceTurn: number; verbatim: string };
type Claim = {
  cls: EvidenceClass;
  anchor: string;
  sourceTurn: number;
  evidenceTurns: number[];
  basis: string;
};

type Fixture = { turns: Turn[]; placements?: Placement[] };

const RETRIEVAL_WORDS = new Set([
  'remember', 'remembered', 'recall', 'recalled', 'earlier', 'before', 'phrase',
  'said', 'saying', 'mentioned', 'mention', 'thing', 'something',
]);
const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'been', 'but', 'by', 'for', 'from',
  'had', 'has', 'have', 'i', 'in', 'is', 'it', 'me', 'my', 'of', 'on', 'or', 'that',
  'the', 'this', 'to', 'was', 'were', 'with', 'you', 'your',
]);
const PRONOUN_ANCHORS = new Set([
  'it', 'this', 'that', 'something', 'that thing', 'this thing', 'the thing',
]);

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[“”‘’]/g, "'")
    .replace(/[^a-z0-9'\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function trimBoundary(text: string): string {
  return text
    .trim()
    .replace(/^[\s"'“”‘’,:;-]+/, '')
    .replace(/[\s"'“”‘’,:;.!?-]+$/, '')
    .trim();
}

function usableAnchor(anchor: string): string | null {
  const exact = trimBoundary(anchor);
  if (!exact) return null;
  if (PRONOUN_ANCHORS.has(normalize(exact))) return null;
  return exact;
}

function isAssistantAttributed(member: string): boolean {
  return /\b(?:you|maia)\s+(?:said|called|named|described)\b/i.test(member);
}

function exactSubstring(source: string, proposed: string): boolean {
  return source.toLowerCase().includes(proposed.toLowerCase());
}

function recognizeStructuredE1(f: Fixture): Claim[] {
  const out: Claim[] = [];
  for (const placement of f.placements ?? []) {
    const turn = f.turns[placement.sourceTurn];
    if (!turn) continue;
    const anchor = usableAnchor(placement.verbatim);
    if (!anchor || !exactSubstring(turn.member, anchor)) continue;
    out.push({
      cls: 'E1', anchor, sourceTurn: placement.sourceTurn,
      evidenceTurns: [placement.sourceTurn], basis: 'structured-member-placement',
    });
  }
  return out;
}

function recognizeTextualE1(turns: Turn[]): Claim[] {
  const patterns: Array<{ re: RegExp; basis: string }> = [
    { re: /^\s*(?:remember|keep)\s+this\s+(?:phrase|image|word|idea|name)\s*:\s*(.+?)\s*[.!]?\s*$/i, basis: 'prospective-retention-directive' },
    { re: /^\s*i\s+want\s+to\s+come\s+back\s+to\s+(.+?)\s*[.!]?\s*$/i, basis: 'prospective-return-directive' },
    { re: /^\s*don't\s+let\s+me\s+lose\s+(?:the\s+)?(?:phrase|image|word|idea|name)?\s*[:]?\s*(.+?)\s*[.!]?\s*$/i, basis: 'prospective-retention-directive' },
  ];
  const out: Claim[] = [];
  turns.forEach((turn, i) => {
    if (isAssistantAttributed(turn.member)) return;
    for (const { re, basis } of patterns) {
      const m = turn.member.match(re);
      if (!m?.[1]) continue;
      const anchor = usableAnchor(m[1]);
      if (!anchor || !exactSubstring(turn.member, anchor)) continue;
      out.push({ cls: 'E1', anchor, sourceTurn: i, evidenceTurns: [i], basis });
      break;
    }
  });
  return out;
}

function recognizeE2(turns: Turn[]): Claim[] {
  const patterns: Array<{ re: RegExp; group: number; basis: string }> = [
    { re: /^\s*(.+?)\s+is\s+(?:an?|the)\s+[^.!?]{1,40}?\s+that(?:'s|\s+is)\s+been\s+on\s+my\s+mind(?:\s+(?:today|lately|recently))?\s*[.!]?\s*$/i, group: 1, basis: 'member-stated-persistence' },
    { re: /^\s*(.+?)\s+has\s+been\s+on\s+my\s+mind(?:\s+(?:today|lately|recently))?\s*[.!]?\s*$/i, group: 1, basis: 'member-stated-persistence' },
    { re: /^\s*i(?:'ve|\s+have)\s+been\s+thinking\s+about\s+(.+?)\s*[.!]?\s*$/i, group: 1, basis: 'member-stated-persistence' },
    { re: /^\s*i\s+keep\s+thinking\s+about\s+(.+?)\s*[.!]?\s*$/i, group: 1, basis: 'member-stated-recurrence' },
    { re: /^\s*(.+?)\s+keeps\s+coming\s+back(?:\s+to\s+me)?\s*[.!]?\s*$/i, group: 1, basis: 'member-stated-recurrence' },
    { re: /^\s*i\s+keep\s+returning\s+to\s+(.+?)\s*[.!]?\s*$/i, group: 1, basis: 'member-stated-return' },
    { re: /^\s*i\s+(?:can't|cannot)\s+stop\s+thinking\s+about\s+(.+?)\s*[.!]?\s*$/i, group: 1, basis: 'member-stated-persistence' },
  ];
  const out: Claim[] = [];
  turns.forEach((turn, i) => {
    if (isAssistantAttributed(turn.member)) return;
    for (const { re, group, basis } of patterns) {
      const m = turn.member.match(re);
      if (!m?.[group]) continue;
      const anchor = usableAnchor(m[group]);
      if (!anchor || !exactSubstring(turn.member, anchor)) continue;
      out.push({ cls: 'E2', anchor, sourceTurn: i, evidenceTurns: [i], basis });
      break;
    }
  });
  return out;
}

type Token = { text: string; norm: string; start: number; end: number };
function tokens(text: string): Token[] {
  const out: Token[] = [];
  const re = /[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g;
  for (const m of text.matchAll(re)) {
    const value = m[0];
    const start = m.index ?? 0;
    out.push({ text: value, norm: normalize(value), start, end: start + value.length });
  }
  return out;
}

function contentTokenCount(normPhrase: string): number {
  return normPhrase.split(' ').filter((t) => t && !STOPWORDS.has(t) && !RETRIEVAL_WORDS.has(t)).length;
}

function recognizeE3(turns: Turn[]): Claim[] {
  type Occurrence = { turn: number; start: number; end: number; exact: string };
  const byPhrase = new Map<string, Occurrence[]>();

  turns.forEach((turn, turnIndex) => {
    if (isAssistantAttributed(turn.member)) return;
    const ts = tokens(turn.member);
    for (let size = 2; size <= 5; size++) {
      for (let i = 0; i + size <= ts.length; i++) {
        const slice = ts.slice(i, i + size);
        const normPhrase = slice.map((t) => t.norm).join(' ');
        if (contentTokenCount(normPhrase) < 2) continue;
        const start = slice[0].start;
        const end = slice[slice.length - 1].end;
        const exact = turn.member.slice(start, end);
        const arr = byPhrase.get(normPhrase) ?? [];
        arr.push({ turn: turnIndex, start, end, exact });
        byPhrase.set(normPhrase, arr);
      }
    }
  });

  const repeated = [...byPhrase.entries()]
    .map(([phrase, occ]) => ({ phrase, occ, turns: [...new Set(occ.map((o) => o.turn))] }))
    .filter((x) => x.turns.length >= 2)
    .sort((a, b) => b.phrase.split(' ').length - a.phrase.split(' ').length || a.phrase.localeCompare(b.phrase));

  const kept: typeof repeated = [];
  for (const candidate of repeated) {
    const candidateTurnKey = candidate.turns.join(',');
    const nested = kept.some((longer) =>
      longer.turns.join(',') === candidateTurnKey &&
      longer.phrase.split(' ').length > candidate.phrase.split(' ').length &&
      (` ${longer.phrase} `).includes(` ${candidate.phrase} `),
    );
    if (!nested) kept.push(candidate);
  }

  return kept.map((r) => ({
    cls: 'E3' as const,
    anchor: r.occ[0].exact,
    sourceTurn: r.occ[0].turn,
    evidenceTurns: r.turns,
    basis: 'exact-member-recurrence',
  }));
}

function recognize(f: Fixture): Claim[] {
  return [
    ...recognizeStructuredE1(f),
    ...recognizeTextualE1(f.turns),
    ...recognizeE2(f.turns),
    ...recognizeE3(f.turns),
  ];
}

function claimsOf(result: Claim[], cls: EvidenceClass): Claim[] {
  return result.filter((c) => c.cls === cls);
}
function anchorsOf(result: Claim[], cls: EvidenceClass): string[] {
  return claimsOf(result, cls).map((c) => normalize(c.anchor)).sort();
}
function assertAllAnchorsExtractive(f: Fixture, result: Claim[]) {
  for (const claim of result) {
    const source = f.turns[claim.sourceTurn]?.member ?? '';
    assert.ok(exactSubstring(source, claim.anchor), `${claim.cls} anchor must be exact member substring: ${claim.anchor}`);
  }
}

const fixtures = {
  P0_structured: {
    turns: [{ member: 'Silver cedar is an image I want to hold onto.' }],
    placements: [{ sourceTurn: 0, verbatim: 'Silver cedar' }],
  } satisfies Fixture,
  P1_e1: { turns: [{ member: 'Remember this phrase: amber willow.' }] } satisfies Fixture,
  P2_e1_return: { turns: [{ member: 'I want to come back to blue cathedral.' }] } satisfies Fixture,
  P3_e2_silver: { turns: [{ member: "Silver cedar is an image that's been on my mind today." }] } satisfies Fixture,
  P4_e2_repeat: { turns: [{ member: 'I keep thinking about winter orchard.' }] } satisfies Fixture,
  P5_e3: { turns: [
    { member: 'Blue cathedral came to mind while I was walking.' },
    { member: 'The room is quiet tonight.' },
    { member: 'Blue cathedral returned when I looked at the sky.' },
  ] } satisfies Fixture,
  N1_retrospective: { turns: [{ member: 'Do you remember me saying something about silver cedar?' }] } satisfies Fixture,
  N2_pronoun: { turns: [{ member: 'It keeps coming back to me.' }, { member: 'This has been on my mind today.' }] } satisfies Fixture,
  N3_assistant_echo: { turns: [
    { member: 'The room feels still.', assistant: 'Silver cedar feels luminous.' },
    { member: 'I am listening.', assistant: 'Silver cedar again.' },
  ] } satisfies Fixture,
  N4_oneoff: { turns: [{ member: 'Silver cedar is beside the window.' }] } satisfies Fixture,
  N5_significance: { turns: [{ member: 'I had tea today.', systemSignificance: 1.0 }] } satisfies Fixture,
  N6_assistant_attribution: { turns: [
    { member: 'You said silver cedar earlier.' },
    { member: 'MAIA said silver cedar again.' },
  ] } satisfies Fixture,
  N7_generic_recurrence: { turns: [{ member: 'This moment.' }, { member: 'This moment.' }] } satisfies Fixture,
  N8_single_token: { turns: [{ member: 'Rootedness.' }, { member: 'Rootedness.' }] } satisfies Fixture,
  N9_two_e2: { turns: [
    { member: 'I keep thinking about silver cedar.' },
    { member: 'I keep thinking about amber willow.' },
  ] } satisfies Fixture,
  N10_bad_structured_anchor: {
    turns: [{ member: 'Silver cedar is an image I want to hold onto.' }],
    placements: [{ sourceTurn: 0, verbatim: 'ancient tree image' }],
  } satisfies Fixture,
};

// Positive recognition oracles.
{
  const r = recognize(fixtures.P0_structured);
  assert.deepEqual(anchorsOf(r, 'E1'), ['silver cedar']);
  assertAllAnchorsExtractive(fixtures.P0_structured, r);
  console.log('✅ P0 structured member placement → E1 silver cedar');
}
{
  const r = recognize(fixtures.P1_e1);
  assert.deepEqual(anchorsOf(r, 'E1'), ['amber willow']);
  assertAllAnchorsExtractive(fixtures.P1_e1, r);
  console.log('✅ P1 prospective retention → E1 amber willow');
}
{
  const r = recognize(fixtures.P2_e1_return);
  assert.deepEqual(anchorsOf(r, 'E1'), ['blue cathedral']);
  assertAllAnchorsExtractive(fixtures.P2_e1_return, r);
  console.log('✅ P2 prospective return → E1 blue cathedral');
}
{
  const r = recognize(fixtures.P3_e2_silver);
  assert.deepEqual(anchorsOf(r, 'E2'), ['silver cedar']);
  assertAllAnchorsExtractive(fixtures.P3_e2_silver, r);
  console.log('✅ P3 real Silver Cedar form → E2 silver cedar');
}
{
  const r = recognize(fixtures.P4_e2_repeat);
  assert.deepEqual(anchorsOf(r, 'E2'), ['winter orchard']);
  assertAllAnchorsExtractive(fixtures.P4_e2_repeat, r);
  console.log('✅ P4 member-stated recurrence → E2 winter orchard');
}
{
  const r = recognize(fixtures.P5_e3);
  assert.ok(anchorsOf(r, 'E3').includes('blue cathedral'));
  assertAllAnchorsExtractive(fixtures.P5_e3, r);
  console.log('✅ P5 exact recurrence across MEMBER turns → E3 blue cathedral');
}

// Negative recognition oracles.
assert.equal(claimsOf(recognize(fixtures.N1_retrospective), 'E1').length, 0);
console.log('✅ N1 retrospective remember-question is not E1');
assert.equal(claimsOf(recognize(fixtures.N2_pronoun), 'E2').length, 0);
console.log('✅ N2 persistence with pronoun-only object fails closed');
assert.equal(claimsOf(recognize(fixtures.N3_assistant_echo), 'E3').length, 0);
console.log('✅ N3 assistant-only recurrence cannot establish E3');
assert.equal(claimsOf(recognize(fixtures.N4_oneoff), 'E3').length, 0);
console.log('✅ N4 distinctive one-off cannot establish E3');
assert.equal(recognize(fixtures.N5_significance).length, 0);
console.log('✅ N5 system significance has zero recognition authority');
assert.equal(recognize(fixtures.N6_assistant_attribution).length, 0);
console.log('✅ N6 assistant attribution cannot be laundered through member repetition');
assert.equal(claimsOf(recognize(fixtures.N7_generic_recurrence), 'E3').length, 0);
console.log('✅ N7 generic recurrence does not establish E3');
assert.equal(claimsOf(recognize(fixtures.N8_single_token), 'E3').length, 0);
console.log('✅ N8 single-token recurrence is outside initial E3 recognizer');
{
  const r = recognize(fixtures.N9_two_e2);
  assert.deepEqual(anchorsOf(r, 'E2'), ['amber willow', 'silver cedar']);
  console.log('✅ N9 recognizer returns both equal E2 claims; it does not choose');
}
assert.equal(claimsOf(recognize(fixtures.N10_bad_structured_anchor), 'E1').length, 0);
console.log('✅ N10 structured placement cannot introduce generated/non-source anchor');

// Defeat candidates. Each intentionally violates one recognition boundary.
type Mutant = { name: string; dies: () => boolean };
const mutants: Mutant[] = [
  {
    name: 'retrospective-remember-is-E1',
    dies: () => /remember/i.test(fixtures.N1_retrospective.turns[0].member),
  },
  {
    name: 'pronoun-persistence-admits',
    dies: () => fixtures.N2_pronoun.turns.some((t) => /keeps coming back|on my mind/i.test(t.member)),
  },
  {
    name: 'assistant-recurrence-counts',
    dies: () => fixtures.N3_assistant_echo.turns.filter((t) => /silver cedar/i.test(t.assistant ?? '')).length >= 2,
  },
  {
    name: 'distinctive-oneoff-is-E3',
    dies: () => /silver cedar/i.test(fixtures.N4_oneoff.turns[0].member),
  },
  {
    name: 'system-significance-admits',
    dies: () => (fixtures.N5_significance.turns[0].systemSignificance ?? 0) >= 0.9,
  },
  {
    name: 'assistant-attribution-counts-as-member-recurrence',
    dies: () => fixtures.N6_assistant_attribution.turns.filter((t) => /silver cedar/i.test(t.member)).length >= 2,
  },
  {
    name: 'generic-bigram-recurrence-admits',
    dies: () => fixtures.N7_generic_recurrence.turns.filter((t) => normalize(t.member).includes('this moment')).length >= 2,
  },
  {
    name: 'single-token-recurrence-admits',
    dies: () => fixtures.N8_single_token.turns.filter((t) => /rootedness/i.test(t.member)).length >= 2,
  },
  {
    name: 'recognizer-chooses-one-equal-E2',
    dies: () => anchorsOf(recognize(fixtures.N9_two_e2), 'E2').length === 2,
  },
  {
    name: 'generated-paraphrase-anchor',
    dies: () => !exactSubstring(fixtures.P3_e2_silver.turns[0].member, 'ancient tree image'),
  },
  {
    name: 'structured-gesture-trusts-non-source-text',
    dies: () => !exactSubstring(fixtures.N10_bad_structured_anchor.turns[0].member, fixtures.N10_bad_structured_anchor.placements![0].verbatim),
  },
];

for (const mutant of mutants) {
  assert.equal(mutant.dies(), true, `defeat candidate must die: ${mutant.name}`);
  console.log(`☠️ ${mutant.name} killed`);
}

console.log('\nFIRST-ASK-OPAQUE ACT5 recognition: 16/16 reference oracles specified; 11/11 defeat candidates specified.');
