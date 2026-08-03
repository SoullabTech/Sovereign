/**
 * detectRelationalSignal — Lightweight relational surface-reading.
 *
 * This is the v1 bridge between live conversation and the
 * RelationshipFieldCard on /maia. It is intentionally shallow:
 *
 *   - keyword-based, not LLM-based
 *   - descriptive, not diagnostic
 *   - partial by default — if we cannot read a dimension, we return null
 *   - silent below the confidence threshold
 *
 * What we do NOT do here:
 *   - infer attachment style
 *   - assign a pattern to a specific person
 *   - generate any interpretation text for the UI
 *   - store conversation content
 *
 * See CLAUDE.md §Sovereignty Invariants and canon §4 (no authority).
 */

import type {
  CounterpartLabel,
  DetectedSignal,
  DynamicTag,
  RelationshipTone,
  RuptureState,
} from './types';
import { SIGNAL_CONFIDENCE_THRESHOLD } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// KEYWORD REGISTRIES
// Each list is intentionally narrow — quality over quantity. These surface
// *possible* signals; the card frames everything as "possible".
// ─────────────────────────────────────────────────────────────────────────────

const COUNTERPART_KEYWORDS: Record<CounterpartLabel, string[]> = {
  partner: [
    'partner', 'husband', 'wife', 'spouse',
    'boyfriend', 'girlfriend', 'fiance', 'fiancée', 'fiancee',
    'my man', 'my woman', 'my love', 'my lover',
  ],
  mother: ['my mother', 'my mom', 'my mum', 'my mama'],
  father: ['my father', 'my dad', 'my papa'],
  child: ['my son', 'my daughter', 'my kid', 'my child'],
  sibling: ['my brother', 'my sister', 'my sibling'],
  family: ['my family', 'my aunt', 'my uncle', 'my cousin',
           'my grandmother', 'my grandfather', 'my grandma', 'my grandpa'],
  friend: ['my friend', 'my best friend', 'a friend of mine'],
  professional: [
    'my boss', 'my colleague', 'my coworker', 'my client',
    'my therapist', 'my mentor', 'my teacher',
  ],
  ex: ['my ex', 'my ex-partner', 'my ex-husband', 'my ex-wife'],
  inner: [
    'inner critic', 'inner child', 'my shadow',
    'part of me', 'a part of me', 'the voice in my head',
  ],
  unspecified: [],
};

const TONE_LANGUAGE: Record<RelationshipTone, string[]> = {
  tense: [
    'tense', 'tension', 'pressure between', 'on edge',
    'fight', 'fighting', 'argument', 'arguing', 'yelled', 'yelling',
    'braced',
  ],
  warm: [
    'warm', 'warmth', 'close', 'tender', 'loving', 'held',
    'affection', 'affectionate', 'good to see',
  ],
  distant: [
    'distant', 'far apart', 'drift', 'drifting', 'cold',
    'a gap between', 'barely talk', "don't talk",
  ],
  unresolved: [
    'unresolved', 'unfinished', "didn't finish", "haven't finished",
    'still open', 'hanging', 'not closed',
  ],
  fragile: [
    'fragile', 'walking on eggshells', 'easily hurt',
    'careful with', "could break",
  ],
  quiet: [
    'quiet between', 'nothing much', 'steady', 'low key', 'calm enough',
  ],
  open: [
    'open between', 'real conversation', 'actually heard',
    'honest conversation', 'connected', 'feel met',
  ],
  contracted: [
    'shut down', 'closed off', 'pulled back', 'withdrawn',
    'gone cold', 'walled off',
  ],
  active: [
    'a lot happening', 'things moving', 'in motion',
    'really stirred', 'charged',
  ],
  unclear: [
    "can't read", 'hard to read', 'not sure what',
    "don't know where",
  ],
};

const RUPTURE_SIGNALS: Record<RuptureState, string[]> = {
  ruptured: [
    'betrayed', 'broken', 'ended it', 'cut off', 'cut him off', 'cut her off',
    'no contact', 'estranged', 'fell apart', "it's over", "we're done",
    'divorce', 'break up', 'breakup', 'broke up',
  ],
  strained: [
    'tension', 'hurt me', 'hurt them', 'hurt him', 'hurt her',
    'upset with', 'frustrated with', 'silent treatment',
    'not speaking', 'stormed out', 'walked out',
  ],
  none: [],
  unclear: [],
};

const REPAIR_SIGNALS = [
  'repair', 'apologi', 'forgive', 'forgave', 'make up', 'made up',
  'talk it through', 'worked it out', 'working it out', 'reach out',
];

const DYNAMIC_SIGNALS: Record<DynamicTag, string[]> = {
  'pursue-withdraw': [
    'i reach out', 'i keep reaching', 'they pull back',
    'he withdraws', 'she withdraws', 'i chase', 'they run',
    'the more i push', "the more they",
  ],
  'over-under-function': [
    'do everything for', 'take care of everything',
    "carrying it all", 'they depend on me',
    'i check out', 'they manage', "i can't keep up",
  ],
  'projection-loop': [
    'reminds me of', 'same thing my', "like my father", "like my mother",
    'i see myself in', 'project onto',
  ],
  triangulation: [
    'in the middle', 'pulled into', 'third party',
    'caught between', 'playing us off',
  ],
  'parts-polarization': [
    'part of me wants', 'another part', 'one side of me',
    'the other side of me', 'torn inside',
  ],
  'protest-withdrawal': [
    'gave up trying', 'stopped trying', 'done reaching',
    'no point anymore',
  ],
  'differentiation-crisis': [
    'becoming myself', 'losing myself', 'who i am without',
    "can't stay myself", 'being different is',
  ],
  'nervous-system-mismatch': [
    'flooded', 'overwhelmed', 'shut down', 'frozen',
    'activated', 'dysregulated', 'nervous system',
  ],
};

/**
 * Framework-ID → signal phrases. Uses ids from relationshipResources.ts.
 * When a phrase matches, we tag the framework as "touched by the language".
 * This does NOT claim the framework describes the member — it just says
 * "the language used here is the language that tradition uses."
 */
const FRAMEWORK_KEYWORDS: Record<string, string[]> = {
  attachment: [
    'attachment', 'anxious attachment', 'avoidant attachment',
    'secure attachment', 'disorganized',
  ],
  ifs: [
    'part of me', 'parts of me', 'protector part',
    'inner critic', 'self-energy',
  ],
  gottman: [
    'criticism', 'contempt', 'defensive', 'defensiveness', 'stonewall',
    'repair attempt',
  ],
  nvc: [
    'nonviolent communication', 'my need is', 'my feeling is',
    'what i am asking', 'observation, feeling',
  ],
  polyvagal: [
    'polyvagal', 'ventral', 'dorsal', 'sympathetic state',
    'co-regulat', 'nervous system',
  ],
  bowen: [
    'differentiation', 'triangulat', 'enmesh', 'cutoff',
    'multigenerational',
  ],
  eft: [
    "hold me tight", 'reach for each other', 'attachment cry',
    'emotionally focused',
  ],
  family_constellations: [
    'family constellation', 'orders of love', 'ancestral',
    'excluded from the family',
  ],
  welwood: [
    'spiritual bypass', 'refugee from love',
    'conscious relationship',
  ],
  perel: [
    'erotic and secure', 'mating in captivity',
    'desire and safety',
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Returns the first key whose keywords appear in `text`. */
function firstMatch<K extends string>(
  text: string,
  registry: Record<K, string[]>,
): K | null {
  for (const key of Object.keys(registry) as K[]) {
    const keywords = registry[key];
    if (keywords.some((kw) => text.includes(kw))) return key;
  }
  return null;
}

/** Returns all keys whose keywords appear in `text`. */
function allMatches<K extends string>(
  text: string,
  registry: Record<K, string[]>,
): K[] {
  const hits: K[] = [];
  for (const key of Object.keys(registry) as K[]) {
    if (key === ('none' as K) || key === ('unclear' as K) || key === ('unspecified' as K)) continue;
    const keywords = registry[key];
    if (keywords.some((kw) => text.includes(kw))) hits.push(key);
  }
  return hits;
}

/** Fast relational-content gate. If nothing here matches, we skip everything. */

// Patch A: word-boundary patterns for short tokens that collide as substrings
// (e.g. "person" → "son", "context" → "ex", "expertise" → "ex").
// Longer multi-word phrases keep includes() — they don't collide.
const PRESENCE_BOUNDARY_PATTERNS: RegExp[] = [
  /\bson\b/i,
  /\bdaughter\b/i,
  /\bfriend\b/i,
  /\bhim\b/i,
  /\bher\b/i,
  /\bthey\b/i,
  /\bmy ex\b/i,
  /\bex[-\s]/i,           // "ex-wife", "ex partner"
];

const PRESENCE_SUBSTRING_WORDS = [
  'partner', 'husband', 'wife', 'spouse',
  'mother', 'father', 'mom', 'dad',
  'sister', 'brother',
  'between us', 'we ', 'relationship',
];

// Patch C: inner-realm presence.
//
// The gate is the sole entry to inference, so its vocabulary must cover every
// realm the downstream registries claim to serve — otherwise a registry is
// authored but unreachable. `RelationshipRealm` (types.ts) names 'inner'
// alongside 'outer', and three registries speak it: COUNTERPART_KEYWORDS.inner,
// DYNAMIC_SIGNALS['parts-polarization'], and FRAMEWORK_KEYWORDS.ifs. Before
// this list existed the gate's vocabulary was entirely interpersonal, so those
// three surfaced only by accident — when an unrelated outer token happened to
// co-occur ("We talked and a part of me…").
//
// This does NOT widen what is inferred. It only lets inner language reach the
// inference that was already written for it. Each phrase is multi-word and
// self-anchoring, so none collide as substrings the way Patch A's short kinship
// tokens do ('person' ⊅ son, 'another' ⊅ 'another part').
//
// Not covered: 'transpersonal'. It is named in RelationshipRealm but no
// counterpart or dynamic registry speaks it, so there is nothing downstream for
// a gate token to reach. Widening for it would admit text the detector cannot
// read.
const PRESENCE_INNER_WORDS = [
  'part of me', 'parts of me',
  'inner critic', 'inner child',
  'my shadow', 'the voice in my head',
];

// Patch B: named entity + interaction context pathway.
// Detects proper names (capitalized, 3+ chars, not sentence-start)
// combined with interaction verbs → relational presence.
const PROPER_NAME_PATTERN = /(?:^|\.\s+|!\s+|\?\s+|,\s+)\s*[A-Z][a-z]{2,}/;
const MIDSENTENCE_NAME_PATTERN = /\s[A-Z][a-z]{2,}\b/;

const INTERACTION_VERBS = [
  'talk', 'meet', 'ask', 'explore', 'help',
  'work with', 'discuss', 'support', 'collaborate',
  'review', 'share', 'conversation with',
  'next talk', 'next meeting', 'wants to',
];

function hasNamedEntityPresence(originalText: string, lowerText: string): boolean {
  const hasName = MIDSENTENCE_NAME_PATTERN.test(originalText);
  if (!hasName) return false;
  return INTERACTION_VERBS.some((v) => lowerText.includes(v));
}

function hasRelationalPresence(text: string, originalText?: string): boolean {
  // Canonical: boundary-aware short tokens
  if (PRESENCE_BOUNDARY_PATTERNS.some((re) => re.test(text))) return true;
  // Canonical: safe substring matches (multi-word, no collision risk)
  if (PRESENCE_SUBSTRING_WORDS.some((w) => text.includes(w))) return true;
  // Patch C: inner-realm presence (the `inner` counterpart's own vocabulary)
  if (PRESENCE_INNER_WORDS.some((w) => text.includes(w))) return true;
  // Patch B: named entity + interaction context
  if (originalText && hasNamedEntityPresence(originalText, text)) return true;
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Detect a lightweight relational signal in a conversation turn.
 *
 * Confidence scoring (v1, intentionally coarse):
 *   +0.25  counterpart label detected
 *   +0.20  tone detected
 *   +0.25  rupture state detected (ruptured/strained)
 *   +0.15  at least one dynamic tag
 *   +0.10  framework language touched
 *   +0.10  "repair" language present
 *
 * Below SIGNAL_CONFIDENCE_THRESHOLD we report `detected: false`.
 */
export function detectRelationalSignal(
  userMessage: string,
  assistantMessage?: string,
): DetectedSignal {
  const userLower = (userMessage || '').toLowerCase();
  const combined = `${userLower} ${(assistantMessage || '').toLowerCase()}`;

  const empty: DetectedSignal = {
    detected: false,
    confidence: 0,
    counterpartLabel: null,
    tone: null,
    ruptureState: null,
    dynamicTags: [],
    frameworksApplied: [],
  };

  if (!userLower.trim() || !hasRelationalPresence(userLower, userMessage)) {
    console.log('[detectRelationalSignal] gate: no relational presence');
    return empty;
  }

  // COUNTERPART — canonical keyword match first, then named-entity fallback
  let counterpartLabel = firstMatch(userLower, COUNTERPART_KEYWORDS);

  // Patch B: if no canonical counterpart but named entity + interaction present,
  // assign neutral 'person' label so the signal isn't structurally empty.
  const namedEntityDetected =
    !counterpartLabel && hasNamedEntityPresence(userMessage, userLower);
  if (namedEntityDetected) {
    counterpartLabel = 'person';
  }

  // TONE
  const tone = firstMatch(combined, TONE_LANGUAGE);

  // RUPTURE STATE
  let ruptureState: RuptureState | null = null;
  if (RUPTURE_SIGNALS.ruptured.some((kw) => userLower.includes(kw))) {
    ruptureState = 'ruptured';
  } else if (RUPTURE_SIGNALS.strained.some((kw) => userLower.includes(kw))) {
    ruptureState = 'strained';
  }

  // DYNAMIC TAGS — pick up to 2 so we don't overstate
  const dynamicTags = allMatches(combined, DYNAMIC_SIGNALS).slice(0, 2);

  // FRAMEWORKS — any matched id
  const frameworksApplied = Object.keys(FRAMEWORK_KEYWORDS).filter((id) =>
    FRAMEWORK_KEYWORDS[id].some((kw) => combined.includes(kw)),
  );

  // CONFIDENCE
  let confidence = 0;
  if (counterpartLabel) confidence += namedEntityDetected ? 0.3 : 0.25;
  if (tone) confidence += 0.2;
  if (ruptureState) confidence += 0.25;
  if (dynamicTags.length > 0) confidence += 0.15;
  if (frameworksApplied.length > 0) confidence += 0.1;
  if (REPAIR_SIGNALS.some((kw) => combined.includes(kw))) confidence += 0.1;

  // Cap at 0.95 — we should never claim certainty
  confidence = Math.min(confidence, 0.95);

  if (confidence < SIGNAL_CONFIDENCE_THRESHOLD) {
    console.log('[detectRelationalSignal] below threshold', {
      confidence,
      counterpart: counterpartLabel,
      tone,
      rupture: ruptureState,
      dynamics: dynamicTags.length,
      frameworks: frameworksApplied.length,
      namedEntity: namedEntityDetected,
    });
    return empty;
  }

  return {
    detected: true,
    confidence,
    counterpartLabel: counterpartLabel ?? 'unspecified',
    tone,
    ruptureState,
    dynamicTags,
    frameworksApplied,
  };
}
