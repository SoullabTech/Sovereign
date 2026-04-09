/**
 * Pattern detection v2 — structural, not lexical
 *
 * Detects relational *dynamics* in a user message, not just relational *nouns*.
 *
 * Discipline (see: memory/project_relational_context_bridge.md):
 *   • Structural. Co-occurrence + polarity + role assignment, not keyword bags.
 *   • Verifiable from text alone. No inference beyond what is expressed.
 *   • Low cardinality. Five patterns, conservatively seeded. Not ten, not fifteen.
 *   • Stored, not interpreted. The detector writes observations; it does not
 *     populate MAIA's prompt and it does not claim to know what the user feels.
 *   • Multiple concurrent hits. Relational dynamics overlap; collapsing early
 *     throws away signal the downstream system may need.
 *   • Confidence decay is handled at write time (expires_at), not here.
 *
 * Signal philosophy: the detector should fire when the *shape* of what the
 * user said matches a dynamic. It should not fire when only the vocabulary
 * is suggestive. "Mother" is not attachment theory. "He shut down" is not
 * pursue-withdraw. The dynamic is the co-occurrence of approach and retreat,
 * the polarity, the directionality. That's what the regex groups encode.
 *
 * Confidence is intentionally capped at 0.85. This is an observation layer,
 * not a verdict. Certainty is reserved for the member themselves.
 */

export type PatternId =
  | 'pursue_withdraw'
  | 'overfunctioning'
  | 'withdrawal'
  | 'escalation'
  | 'projection';

export interface PatternDetection {
  patternId: PatternId;
  confidence: number;
  /** Short snippet of what matched, for observation/debugging. Never shown to user. */
  evidence: string;
}

// ─── Shared regex fragments ────────────────────────────────────────────────
// Written as small, reviewable pieces so future refinement stays honest.

// Optional single-adverb gap between a subject pronoun and the verb phrase.
// Closed set — we do not accept arbitrary intervening words, because that
// introduces false positives like "I told him shut down" → withdrawal.
const ADV = '(?:\\s+(?:just|really|kind\\s+of|sort\\s+of|completely|totally|finally|then|eventually|basically|literally|actually|honestly|simply|fully|entirely|absolutely|almost))?';

/** Build a subject-verb regex with an optional single-adverb gap. */
function sv(subject: string, verbPhrase: string): RegExp {
  return new RegExp(`\\b${subject}${ADV}\\s+${verbPhrase}\\b`, 'i');
}

// First-person approach toward the other
const SELF_APPROACH = [
  sv('I', '(?:tried|try|kept\\s+trying|keep\\s+trying)'),
  sv('I', '(?:asked|ask|kept\\s+asking|keep\\s+asking)'),
  sv('I', '(?:reached\\s+out|reach\\s+out|kept\\s+reaching)'),
  sv('I', '(?:brought\\s+up|bring\\s+up|raised\\s+it)'),
  sv('I', '(?:wanted\\s+to\\s+talk|want\\s+to\\s+talk|tried\\s+to\\s+talk)'),
  sv('I', '(?:pressed|pushed|leaned\\s+in)'),
  sv('I', '(?:tried\\s+to\\s+(?:fix|connect|reach))'),
];

// Third-person withdrawal from the user
const OTHER_WITHDRAWAL = [
  sv('(?:he|she|they)', '(?:shuts?\\s+down|shut\\s+down)'),
  sv('(?:he|she|they)', '(?:pulls?\\s+away|pulled\\s+away)'),
  sv('(?:he|she|they)', '(?:went|goes|gets?)\\s+(?:quiet|silent|cold|distant)'),
  sv('(?:he|she|they)', '(?:doesn[\'’]?t|didn[\'’]?t)\\s+(?:respond|engage|answer)'),
  sv('(?:he|she|they)', '(?:stopped|stops)\\s+talking'),
  sv('(?:he|she|they)', '(?:walked|walks)\\s+away'),
  sv('(?:he|she|they)', '(?:checked?)\\s+out'),
];

// First-person self-withdrawal — same subject, retreating movement
const SELF_WITHDRAWAL = [
  sv('I', '(?:shut\\s+down|shuts?\\s+down)'),
  sv('I', '(?:went|go)\\s+(?:quiet|silent|blank|cold)'),
  sv('I', '(?:checked?|check)\\s+out'),
  sv('I', '(?:couldn[\'’]?t|can[\'’]?t)\\s+(?:respond|speak|say\\s+anything)'),
  sv('I', '(?:stopped|stop)\\s+talking'),
  sv('I', '(?:froze|freeze|shut\\s+off)'),
  sv('I', '(?:disengaged|disengage)'),
  sv('I', 'didn[\'’]?t\\s+know\\s+what\\s+to\\s+say'),
];

// First-person obligation/burden phrasing
const SELF_OBLIGATION = [
  /\bI\s+(?:have\s+to|had\s+to)\b/i,
  /\bI['’]?m\s+the\s+one\s+who\b/i,
  /\bI\s+always\b/i,
  /\bI\s+(?:end|ended)\s+up\b/i,
  /\bI\s+keep\s+(?:having\s+to|needing\s+to)\b/i,
  /\bI['’]?m\s+responsible\s+for\b/i,
  /\bI\s+(?:carry|manage|handle|hold)\s+(?:everything|it\s+all|all\s+of\s+it)\b/i,
];

// Possessive or object pronoun referring to the other — lets us detect
// "I have to X his Y" or "I always do it for him" shape.
const THIRD_PERSON_OBJECT = [
  /\b(?:him|her|them|his|hers|their|theirs)\b/i,
];

// Escalation / feedback-loop markers
const ESCALATION_MARKERS = [
  /\b(?:again\s+and\s+again|over\s+and\s+over)\b/i,
  /\b(?:it|things)\s+(?:got|kept\s+getting|keeps\s+getting)\s+worse\b/i,
  /\bescalat(?:ed|es|ing)\b/i,
  /\b(?:finally|eventually)\s+(?:exploded|snapped|blew\s+up|lost\s+(?:it|my\s+(?:cool|temper)))\b/i,
  /\bthe\s+more\s+I\b.*\bthe\s+more\s+(?:he|she|they)\b/i,
  /\bwe\s+(?:both\s+)?kept\s+(?:going|fighting|arguing|pushing)\b/i,
  /\bevery\s+time\s+I\b.*\b(?:he|she|they)\b/i,
];

// Affect attribution to the other — strong inner-state claim
const OTHER_AFFECT_ATTRIBUTION = [
  /\b(?:he|she|they)\s+(?:is|are|'s|'re)\s+(?:angry|furious|enraged|jealous|resentful|bitter|disgusted|disappointed|contemptuous|cold|hateful)\b/i,
  /\b(?:he|she|they)\s+(?:hates?|resents?|despises?|can['’]?t\s+stand)\s+me\b/i,
  /\b(?:he|she|they)\s+(?:doesn['’]?t|don['’]?t)\s+(?:love|care\s+about|respect|want|need)\s+me\b/i,
  /\b(?:he|she|they)\s+thinks?\s+I['’]?m\b/i,
  /\b(?:he|she|they)\s+(?:has|have)\s+(?:no|zero)\s+respect\s+for\s+me\b/i,
];

// Reported behavior from the other — concrete observable act
const OTHER_REPORTED_BEHAVIOR = [
  /\b(?:he|she|they)\s+(?:said|told|asked|wrote|texted|called|emailed)\b/i,
  /\b(?:he|she|they)\s+(?:yelled|screamed|shouted|cried|sobbed)\b/i,
  /\b(?:he|she|they)\s+(?:walked|walks)\s+(?:out|away)\b/i,
  /\b(?:he|she|they)\s+(?:hung|hangs)\s+up\b/i,
  /\b(?:he|she|they)\s+(?:slammed|threw|kicked|hit|pushed)\b/i,
  /\b(?:he|she|they)\s+(?:left|leaves|packed|moved\s+out)\b/i,
  /\b(?:he|she|they)\s+(?:stopped|stops|started|starts)\s+\w+/i,
];

// ─── Helpers ───────────────────────────────────────────────────────────────

function matchesAny(text: string, patterns: RegExp[]): { hit: boolean; evidence: string } {
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return { hit: true, evidence: m[0] };
  }
  return { hit: false, evidence: '' };
}

function snippet(a: string, b: string): string {
  // Trim evidence to something readable without exposing full context
  const joined = [a, b].filter(Boolean).join(' · ');
  return joined.length > 140 ? joined.slice(0, 137) + '…' : joined;
}

// ─── Individual pattern detectors ─────────────────────────────────────────

/**
 * pursue-withdraw: first-person approach + third-person withdrawal in the
 * same message. Requires BOTH polarities to fire. Single-polarity matches
 * fall through to `withdrawal` (if self) or do not fire at all (if other
 * alone — the field doesn't tell us what the user was doing).
 */
function detectPursueWithdraw(text: string): PatternDetection | null {
  const approach = matchesAny(text, SELF_APPROACH);
  const withdrawal = matchesAny(text, OTHER_WITHDRAWAL);
  if (!approach.hit || !withdrawal.hit) return null;
  return {
    patternId: 'pursue_withdraw',
    confidence: 0.75,
    evidence: snippet(approach.evidence, withdrawal.evidence),
  };
}

/**
 * overfunctioning: first-person obligation phrase + third-person object in
 * the same message. Conservative — a first-person "I have to" without any
 * reference to the other is just burden, not overfunctioning.
 */
function detectOverfunctioning(text: string): PatternDetection | null {
  const obligation = matchesAny(text, SELF_OBLIGATION);
  if (!obligation.hit) return null;
  const thirdPerson = matchesAny(text, THIRD_PERSON_OBJECT);
  if (!thirdPerson.hit) return null;
  return {
    patternId: 'overfunctioning',
    confidence: 0.6,
    evidence: snippet(obligation.evidence, thirdPerson.evidence),
  };
}

/**
 * withdrawal (self): first-person retreat without a corresponding pursue.
 * Distinct from pursue-withdraw because the subject of the retreat is self,
 * not other. If both self-withdrawal AND other-withdrawal appear, both patterns
 * will fire — that's fine, we record both.
 */
function detectWithdrawal(text: string): PatternDetection | null {
  const self = matchesAny(text, SELF_WITHDRAWAL);
  if (!self.hit) return null;
  return {
    patternId: 'withdrawal',
    confidence: 0.65,
    evidence: self.evidence,
  };
}

/**
 * escalation: feedback-loop / intensification markers. Any single marker fires
 * low, the "the more I… the more they…" shape fires higher because it encodes
 * the loop structure explicitly.
 */
function detectEscalation(text: string): PatternDetection | null {
  const feedbackLoop = /\bthe\s+more\s+I\b.*\bthe\s+more\s+(?:he|she|they)\b/i;
  if (feedbackLoop.test(text)) {
    const m = text.match(feedbackLoop);
    return {
      patternId: 'escalation',
      confidence: 0.8,
      evidence: m?.[0] ?? 'feedback_loop',
    };
  }
  const marker = matchesAny(text, ESCALATION_MARKERS);
  if (!marker.hit) return null;
  return {
    patternId: 'escalation',
    confidence: 0.6,
    evidence: marker.evidence,
  };
}

/**
 * projection: strong affect attribution to other WITHOUT accompanying
 * reported behavior. Conservative by design — this is the shakiest of the
 * five. If the user says "he said he's angry" we do NOT fire (that's a
 * report, not a projection). If the user says "he is angry at me" with no
 * reported speech or action, we fire at 0.5.
 */
function detectProjection(text: string): PatternDetection | null {
  const attribution = matchesAny(text, OTHER_AFFECT_ATTRIBUTION);
  if (!attribution.hit) return null;
  const reportedBehavior = matchesAny(text, OTHER_REPORTED_BEHAVIOR);
  if (reportedBehavior.hit) return null; // reported, not projected
  return {
    patternId: 'projection',
    confidence: 0.5,
    evidence: attribution.evidence,
  };
}

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * Detect all patterns present in a single user message.
 *
 * Returns an array of PatternDetection, sorted by confidence descending.
 * May return an empty array — that's the healthy default. Empty means
 * "no structural pattern visible in this turn," not "nothing is happening."
 *
 * This function:
 *   • Does not call an LLM
 *   • Does not hit the database
 *   • Does not consider prior conversation turns
 *   • Does not look at MAIA's response
 *
 * All of those are future extensions. v1 is deliberately local.
 */
export function detectPatterns(userMessage: string): PatternDetection[] {
  if (!userMessage || userMessage.trim().length < 8) return [];

  const detectors: Array<(t: string) => PatternDetection | null> = [
    detectPursueWithdraw,
    detectOverfunctioning,
    detectWithdrawal,
    detectEscalation,
    detectProjection,
  ];

  const hits: PatternDetection[] = [];
  for (const d of detectors) {
    const result = d(userMessage);
    if (result) hits.push(result);
  }

  return hits.sort((a, b) => b.confidence - a.confidence);
}

/**
 * v1 default decay: 30 days from detection. Early data has a natural shelf
 * life so the observation window doesn't accumulate stale signal. Downstream
 * readers should filter on expires_at > NOW() (or the idx_rel_entry_patterns_active
 * partial index, which already does this).
 */
export const DEFAULT_PATTERN_TTL_DAYS = 30;
