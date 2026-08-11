/**
 * Article III — STRUCTURAL enforcement on the conversational reply path.
 *
 * WHY A SEPARATE ADAPTER RATHER THAN REUSING `articleIIIBoundary.ts`.
 * That module DROPS offending sentences. On the check-in/read path that is
 * safe: the material is MAIA's own stored reflection. On the live conversational
 * path it is catastrophic. When a member discloses "he told me he would take
 * the kids if I left" and MAIA reflects it back, drop-semantics would delete
 * the disclosure at the exact moment it matters most. A guardrail that silences
 * disclosure is worse than no guardrail. Policy vocabulary is shared in spirit;
 * correction semantics cannot be.
 *
 * THE VERIFIED FAILURE THIS EXISTS FOR. Member: "I say she keeps score."
 * MAIA: "She probably does keep a running tally." / "people don't track things
 * obsessively unless something feels genuinely at risk to them" / "What do you
 * think she's actually afraid isn't getting through to you." Three crossings:
 * the member's interpretation asserted as fact about the wife, amplified, and
 * given an invented motive — none of it grounded in anything supplied.
 *
 * ── THE LOAD-BEARING DISTINCTION ────────────────────────────────────────────
 * A sentence is constrained ONLY when a third-party PERSON is the subject of a
 * MENTAL-STATE or CHARACTER predicate. Actions and reported speech are NEVER
 * constrained — they are the channel through which harm is disclosed:
 *     "He told me he would take the kids."      → untouched (speech act)
 *     "He checks your phone most nights."       → untouched (action)
 *     "That is a threat."                       → untouched (subject is "that")
 *     "She is resentful."                       → constrained (mental state)
 *     "Your boss is the powerful one."          → constrained (character)
 * This is also what keeps CONTEXTUAL FACT intact while catching PERSONAL
 * CHARACTERIZATION: "He holds formal power over your review" has no
 * mental-state or character predicate, so it passes.
 *
 * ── CORRECTION SEMANTICS ────────────────────────────────────────────────────
 * Declaratives are MARKED, not deleted: an unowned assertion becomes an openly
 * marked wondering, built only from words already present. Nothing is added
 * about the member ("you experience her as…" would fabricate a member reading
 * they may never have had) and nothing is added about the other person.
 * Interrogatives that PRESUPPOSE the other person's interior are dropped —
 * they are MAIA's own speculation, never the member's material, so removing
 * them loses nothing the member supplied.
 *
 * Deterministic, LLM-free, and unit-testable in isolation.
 */

export type ArticleIIIAction =
  | { kind: 'kept'; sentence: string }
  | { kind: 'marked'; sentence: string; original: string; reason: string }
  | { kind: 'dropped'; original: string; reason: string };

export interface ArticleIIIResult {
  text: string;
  fired: boolean;
  actions: ArticleIIIAction[];
}

/** Third-party PERSON as grammatical subject. Never "that", "this", "it". */
const THIRD_PARTY_SUBJECT =
  '(?:he|she|they|him|her|them|your\\s+(?:mother|father|mom|dad|parent|partner|husband|wife|spouse|boss|manager|friend|sister|brother|son|daughter|child|colleague|ex|grandmother|grandfather|teen|kid))';

/**
 * MENTAL STATE — the interior we have no access to.
 * ⛔ Deliberately excludes every action and speech verb.
 */
const MENTAL_STATE =
  '(?:feels?|felt|wants?|wanted|fears?|feared|thinks?|thought|believes?|believed|intends?|intended|means?|meant|knows?|knew|understands?|understood|agreed|agrees|decided|decides|resents?|resented|needs?|needed|expects?|expected|assumes?|assumed|hopes?|hoped|wishes|wished|is\\s+afraid|was\\s+afraid|is\\s+trying|was\\s+trying|does\\s?n[\'’]?t\\s+care|doesn[\'’]?t\\s+want)';

/**
 * CHARACTER / ATTRIBUTED STATE — who the person supposedly IS, or what they
 * are supposedly feeling. The `{0,2}` gap catches intervening adverbs, which
 * is how "she is actually afraid" slipped past an earlier draft of this rule.
 */
const CHARACTER_TRAIT =
  '(?:(?:is|was|are|were|seems?|sounds?)\\s+(?:the\\s+)?(?:\\w+\\s+){0,2}?(?:resentful|jealous|angry|bitter|controlling|manipulative|narcissistic|toxic|abusive|selfish|cruel|insecure|defensive|avoidant|passive[- ]aggressive|powerful|dominant|afraid|scared|frightened|worried|ashamed|guilty|hurt|threatened|the\\s+powerful\\s+one))';

/** Ownership markers — the claim already belongs to the member. */
const OWNERSHIP =
  /\b(?:you(?:'re| are)?\s+(?:experienc\w+|read\w*|feel\w*|sens\w*|wonder\w*|imagin\w*|describ\w*|said|say|told|think|thought|notic\w+)|in your experience|it sounds (?:like|as though) you|your (?:read|sense|experience|interpretation)|what you(?:'re| are)? (?:imagining|reading|experiencing))\b/i;

/**
 * MAIA's own explicitly-marked hypothesis (T8) — permitted.
 *
 * ⚠️ Must be SENTENCE-INITIAL, so the marker scopes the whole claim. An earlier
 * draft accepted "do you think" anywhere, which exempted the exact verified
 * failure — "What do you think she is actually afraid isn't getting through to
 * you?" — because a question addressed to the member was treated as marking,
 * when it in fact PRESUPPOSES the other person's fear. Asking the member to
 * elaborate on an interior state is not the same as wondering whether it exists.
 */
const MARKED_HYPOTHESIS =
  /^\s*(?:i wonder|i'?m wondering|i am wondering|i'?m curious whether|it'?s possible that|it is possible that|one possibility|could it be|might it be|perhaps)\b/i;

/** Assertive adverbs that contradict a marked wondering. Removing MAIA's own over-claim is not fabrication. */
const FALSE_AUTHORITY = /\b(probably|clearly|obviously|definitely|certainly|surely|undoubtedly)\s+/gi;

/**
 * FABRICATED CIRCUMSTANCE — a closed set of details MAIA has been observed
 * inventing ("at 2 in the morning", "a room full of people"). Flagged only when
 * absent from what the member actually supplied.
 */
const CIRCUMSTANCE_PATTERNS: Array<{ re: RegExp; label: string }> = [
  { re: /\b\d{1,2}\s*(?::\d{2})?\s*(?:in the (?:morning|afternoon|evening)|a\.?m\.?|p\.?m\.?|o'?clock)\b/i, label: 'clock time' },
  { re: /\b(?:a\s+)?room\s+full\s+of\s+\w+/i, label: 'audience' },
  { re: /\bin front of (?:everyone|everybody|the (?:whole )?\w+)\b/i, label: 'audience' },
  { re: /\b(?:in the )?middle of the night\b/i, label: 'time of day' },
];

const isQuestion = (s: string) => /\?\s*$/.test(s.trim());

function splitSentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
}

/** Normalised bag of the member's own words, for grounding checks. */
function memberVocabulary(memberText: string): string {
  return ` ${memberText.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ')} `;
}

/**
 * LAUNDERING — the member's own interpretation restated as fact about the
 * other person.
 *
 * This is the verified failure and it is invisible to interiority rules,
 * because "keeps score" is a behaviour, not a mental state. What makes it a
 * crossing is that the MEMBER framed it as their reading ("I say she keeps
 * score") and MAIA dropped the frame ("She probably does keep a running
 * tally"). So the grounding evidence is the member's own sentence: we take the
 * verb they attached to their I-framed claim and refuse to let it come back
 * unowned.
 */
const MEMBER_OWNED_READING =
  /\bi\s+(?:say|said|think|thought|feel\s+like|felt\s+like|believe|believed|suspect|suspected|reckon|assume)\s+(?:that\s+)?(?:she|he|they)\s+([a-z]+)/gi;

function stem(word: string): string {
  return word.toLowerCase().replace(/(?:ies|es|s|ed|ing)$/, '');
}

function launderedReadings(memberText: string): string[] {
  const stems: string[] = [];
  for (const m of memberText.matchAll(MEMBER_OWNED_READING)) {
    const s = stem(m[1]);
    if (s.length >= 3) stems.push(s);
  }
  return stems;
}

/**
 * A wh-question PRESUPPOSES what it asks about; a polar question does not.
 *   "Do you think she is afraid?"        — asks WHETHER. Legitimate.
 *   "What is she actually afraid of?"    — asserts she IS afraid, asks only
 *                                          for the content. A crossing.
 * The verified failure took the second form and hid behind "do you think",
 * which an earlier draft read as member-ownership. Presupposition is checked
 * BEFORE the ownership and hypothesis exemptions for exactly that reason.
 */
const PRESUPPOSING_WH = /^\s*(?:what|why|how|when|where|which)\b/i;

/**
 * Contractions are expanded for DETECTION ONLY — never for output.
 * "she's actually afraid" would otherwise slip past every subject pattern,
 * because `she` is not followed by whitespace. That single gap kept the
 * verified failure alive through two rounds of fixes.
 */
function normalizeForDetection(text: string): string {
  return text
    .replace(/([A-Za-z])['']s\b/g, '$1 is')
    .replace(/([A-Za-z])['']re\b/g, '$1 are')
    .replace(/n['']t\b/g, ' not')
    .replace(/\s+/g, ' ');
}

/**
 * GENERIC ANTECEDENT — "they" that means "people in general", not this person.
 *
 * Caught live degrading a stalking disclosure: "It often shows up when someone
 * has been told their perception is wrong enough times that they start to
 * believe it" was flagged because "they … believe" matched, though "they"
 * refers to the generic "someone". A guardrail that mangles a true-positive
 * safety reply has made a high-consequence case worse, so bare plural pronouns
 * are not treated as this relationship's third party when a generic antecedent
 * is present.
 */
const GENERIC_ANTECEDENT = /\b(?:someone|somebody|anyone|anybody|people|a person|others|one)\b/i;

function crossesInteriority(raw: string): string | null {
  const sentence = normalizeForDetection(raw);
  const s = sentence.toLowerCase();
  if (GENERIC_ANTECEDENT.test(sentence) && !/\b(?:he|she|him|her|your\s+\w+)\b/i.test(sentence)) {
    return null;
  }
  // ⚠️ Punctuation is NOT part of this test. MAIA frequently ends questions
  // with a period, and requiring a "?" here let the verified failure through
  // verbatim: "What do you think she's actually afraid isn't getting through
  // to you." fell to the declarative branch, where "you think" read as member
  // ownership. A wh-clause presupposes what it asks about however it is typed.
  const presupposing = PRESUPPOSING_WH.test(sentence);
  if (!presupposing) {
    if (OWNERSHIP.test(s)) return null;          // already the member's claim
    if (MARKED_HYPOTHESIS.test(s)) return null;  // already marked as not-knowledge
  }

  const mental = new RegExp(`\\b${THIRD_PARTY_SUBJECT}\\s+(?:\\w+\\s+){0,2}?${MENTAL_STATE}\\b`, 'i');
  if (mental.test(sentence)) return 'asserts the other person\'s inner state';

  const trait = new RegExp(`\\b${THIRD_PARTY_SUBJECT}\\s+${CHARACTER_TRAIT}`, 'i');
  if (trait.test(sentence)) return 'asserts what the other person IS';

  // Possessive interiority: "her fear", "his need to control", "what she's afraid of"
  if (/\b(?:her|his|their)\s+(?:fear|anxiety|insecurity|resentment|jealousy|shame|guilt|need to \w+|motive|agenda)\b/i.test(sentence)) {
    return 'attributes an interior motive to the other person';
  }
  return null;
}

function fabricatesCircumstance(sentence: string, vocab: string): string | null {
  for (const { re, label } of CIRCUMSTANCE_PATTERNS) {
    const m = sentence.match(re);
    if (!m) continue;
    const core = m[0].toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
    const supplied = core.split(' ').filter((w) => w.length > 2).every((w) => vocab.includes(` ${w} `));
    if (!supplied) return `invented ${label} the member never supplied`;
  }
  return null;
}

/** Turn an unowned assertion into an openly marked wondering, adding no new content. */
function markAsWondering(sentence: string): string {
  let s = sentence.trim().replace(FALSE_AUTHORITY, '');
  // Lowercase the opening word so the marker reads as one sentence. "I" is
  // left alone; a live run produced "I wonder whether It often shows up…"
  // because only third-party pronouns were being lowercased.
  if (!/^I\b/.test(s)) s = s[0].toLowerCase() + s.slice(1);
  return `I wonder whether ${s}`;
}

/**
 * Apply Article III to a completed conversational reply.
 *
 * @param reply       MAIA's finished text, before it becomes user-visible.
 * @param memberText  What the member actually supplied this turn — the only
 *                    grounding evidence, used solely to avoid flagging details
 *                    they themselves provided.
 */
export function enforceArticleIIIConversational(
  reply: string,
  memberText: string,
): ArticleIIIResult {
  if (!reply || !reply.trim()) return { text: reply, fired: false, actions: [] };

  const vocab = memberVocabulary(memberText || '');
  const launderStems = launderedReadings(memberText || '');
  const actions: ArticleIIIAction[] = [];
  const out: string[] = [];

  const launders = (raw: string): string | null => {
    // Quoted spans are the member's own words being handed back to them, not
    // MAIA asserting anything. Caught live: MAIA quoting "you keep score" was
    // flagged as laundering the very phrase it was quoting.
    const sentence = normalizeForDetection(raw).replace(/["“”'‘’][^"“”]*?["“”]/g, ' ');
    if (OWNERSHIP.test(sentence) || MARKED_HYPOTHESIS.test(sentence)) return null;
    if (GENERIC_ANTECEDENT.test(sentence) && !/\b(?:he|she|him|her|your\s+\w+)\b/i.test(sentence)) return null;
    const subject = new RegExp(`\\b${THIRD_PARTY_SUBJECT}\\b`, 'i');
    if (!subject.test(sentence)) return null;
    for (const st of launderStems) {
      if (new RegExp(`\\b${st}(?:s|es|ed|ing)?\\b`, 'i').test(sentence)) {
        return 'restates your own reading as fact about them';
      }
    }
    return null;
  };

  for (const sentence of splitSentences(reply)) {
    const fabricated = fabricatesCircumstance(sentence, vocab);
    if (fabricated) {
      // Always MAIA's own invention — removing it loses nothing the member gave.
      actions.push({ kind: 'dropped', original: sentence, reason: fabricated });
      continue;
    }

    const crossing = crossesInteriority(sentence) || launders(sentence);
    if (!crossing) {
      out.push(sentence);
      actions.push({ kind: 'kept', sentence });
      continue;
    }

    // MAIA's own speculation — never the member's disclosure — so removing it
    // loses nothing they supplied. Includes wh-questions typed with a period,
    // which cannot be grammatically prefixed as a wondering anyway.
    if (isQuestion(sentence) || PRESUPPOSING_WH.test(sentence)) {
      actions.push({ kind: 'dropped', original: sentence, reason: `${crossing} (question presupposing it)` });
      continue;
    }

    const marked = markAsWondering(sentence);
    out.push(marked);
    actions.push({ kind: 'marked', sentence: marked, original: sentence, reason: crossing });
  }

  const text = out.join(' ').replace(/\s+/g, ' ').trim();
  const fired = actions.some((a) => a.kind !== 'kept');

  if (!text) {
    // ⚠️ Everything was removed. An earlier draft returned the ORIGINAL reply
    // here "so the member is not left with silence" — which quietly handed back
    // the exact content the guardrail had just rejected, and reported
    // fired:false while doing it. That is a false green: the enforcement
    // appeared to pass because its own escape hatch undid it.
    //
    // The reply is now a single fixed, pre-authored line. It asserts nothing
    // about anyone, invents no circumstance, motive, label or judgement, and
    // returns the turn to what the member actually said.
    return {
      text: 'I want to stay with what you actually told me rather than fill in what I do not know. Can you say more about what happened?',
      fired: true,
      actions,
    };
  }

  return { text, fired, actions };
}
