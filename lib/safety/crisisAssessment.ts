/**
 * SAFETY-CRISIS-01 — server-side crisis assessment (pure, deterministic).
 *
 * Founder ruling 2026-10-01 (Option A): there is no human alert channel. We are
 * not the alert. Crisis response is in-product:
 *   - CLEAR signals (explicit intent to end one's life, an act already under way,
 *     final arrangements, or a death wish together with means or a farewell) get
 *     a deterministic referral to 988 and the Crisis Text Line, plus safety
 *     context for MAIA.
 *   - AMBIGUOUS signals get safety context for MAIA only. MAIA answers
 *     relationally and checks in. There is no script and no hotline list.
 *   - Everything else gets nothing. Most conversations trigger nothing.
 *
 * False positives are a safety cost, not a free margin: each one teaches the
 * member that MAIA overreacts, so a real moment is more likely to be dismissed.
 * The corpus in `__fixtures__/crisisCorpus.ts` holds false-positive cases to the
 * same standard as misses.
 *
 * Properties this module guarantees:
 *   - It is PURE: no I/O, no logging, no persistence. Callers decide what to log,
 *     and may log only `tier` and `signals`, never member text.
 *   - Its output contains NO member text. Signals are closed category codes, so
 *     a log line or telemetry event built from an assessment cannot leak content.
 *   - It reads only the text it is given. It is single-turn by construction.
 *     Cross-turn context (for example, a bare "yes" answering MAIA's check-in)
 *     is carried by MAIA's conversation history, and the ambiguous addendum
 *     instructs MAIA accordingly. Cross-turn classification is not done here.
 *   - It never claims a person was notified, and its copy says plainly that no
 *     person monitors conversations.
 */

export type CrisisTier = 'none' | 'ambiguous' | 'clear';

export type CrisisSignal =
  // CLEAR
  | 'explicit_intent'          // first-person intent to kill oneself or end one's life
  | 'ideation_disclosed'       // "I'm suicidal", "I've been thinking about suicide"
  | 'act_under_way'            // overdose or ingestion already taken
  | 'final_arrangements'       // suicide note, goodbye letters written
  | 'wish_with_means_or_farewell' // an ambiguous death wish alongside means or a farewell
  // AMBIGUOUS
  | 'death_wish'               // "I want to die", "I wish I were dead"
  | 'hopelessness'             // "no reason to live", "better off without me", "I'm a burden"
  | 'self_harm'                // urge or act of self-injury
  | 'negated_or_hypothetical'; // a clear phrase that is negated or hyperbolic ("I'd never kill myself")

export interface CrisisAssessment {
  tier: CrisisTier;
  /** Closed category codes, deduplicated. Never member text. */
  signals: CrisisSignal[];
}

// ─── Normalization ──────────────────────────────────────────────────────────

function normalize(text: string): string {
  return ` ${text} `
    .toLowerCase()
    .replace(/[‘’ʼ`]/g, "'")
    .replace(/\bgonna\b/g, 'going to')
    .replace(/\bwanna\b/g, 'want to')
    .replace(/\bim\b/g, "i'm")
    .replace(/\bi am\b/g, "i'm")
    .replace(/\bi have\b/g, "i've")
    .replace(/\bi will\b/g, "i'll")
    .replace(/\bi would\b/g, "i'd")
    .replace(/\s+/g, ' ');
}

// ─── CLEAR ──────────────────────────────────────────────────────────────────

// The act itself, named in the first person.
const SELF_KILL = String.raw`(?:kill(?:ing)? myself|end(?:ing)? my (?:own )?life|tak(?:e|ing) my (?:own )?life|commit(?:ting)? suicide)`;

// A first-person frame that carries intent (not report, not hypothesis).
const INTENT_FRAME = String.raw`(?:i'm (?:going to|about to|planning (?:to|on)|ready to|trying to|thinking (?:about|of)|considering)|i (?:want to|need to|plan to|intend to|have to|decided to|am going to)|i'll|i've (?:decided to|been (?:thinking (?:about|of)|planning(?: to| on)?|wanting to|meaning to)))`;

const RE_EXPLICIT_INTENT = new RegExp(String.raw`\b${INTENT_FRAME} (?:just |really |finally |probably |seriously )?${SELF_KILL}\b`);

// Negated or hyperbolic forms of the same phrase. These downgrade to AMBIGUOUS:
// the subject is on the table, so MAIA gets context, but there is no referral.
const RE_NEGATED_INTENT = new RegExp(
  String.raw`\b(?:i'm not (?:going to |planning (?:to|on) |about to |trying to )?|i (?:don't|do not) (?:want|plan|intend) to |i won't |i'd never |i'll never |i would never |i could never |never going to |i'd |i could )(?:just |really |seriously )?${SELF_KILL}\b`,
);

const RE_IDEATION = /\b(?:i'm (?:feeling |so |really |very )?suicidal|i (?:feel|felt|keep feeling) suicidal|i've been (?:feeling |so )?suicidal|(?:i've been |i keep |i'm )?having suicidal (?:thoughts|feelings)|i(?:'ve|'m)? (?:been |keep |sometimes |often |always |also |still )?(?:think|thinking|thought) (?:about|of) (?:killing myself|ending my life|taking my own life|suicide(?! (?:prevention|awareness|rates?|research|statistics|hotline|squad|bomb)))|(?:i have|i've had|i'm having|i keep having) thoughts of (?:suicide|killing myself|ending my life))\b/;

// Any remaining first-person self-kill language that no intent or ideation frame
// claimed ("I'd rather kill myself than go back"). The subject is on the table,
// so MAIA gets context; without a frame it is not a CLEAR signal.
const RE_SELF_KILL_ANY = new RegExp(String.raw`\b${SELF_KILL}\b`);

// Ingestion already taken. Requires a quantity or definiteness marker, so routine
// medication ("I just took my meds") never matches.
const RE_ACT_UNDER_WAY = /\b(?:i've (?:already |just )?(?:taken|swallowed)|i (?:already |just )?(?:took|swallowed))\s+(?:all (?:of )?(?:my |the )?|a (?:bunch|handful|lot|bottle) of (?:my |the )?|too many |the whole (?:bottle|pack|packet|box)(?: of)? ?|the )(?:[a-z-]+ )?(?:pills|tablets|meds|medication|medicine|bottle|pack|packet|box)\b|\bi(?:'ve)? (?:overdosed|od'?d)\b|\bi (?:took|have taken|'ve taken) an overdose\b/;

const RE_FINAL_ARRANGEMENTS = /\b(?:suicide note|i (?:wrote|'ve written|have written|am writing|'m writing) (?:a |my )?(?:goodbye|farewell) (?:letters?|notes?))\b/;

// Context markers that make an AMBIGUOUS death wish CLEAR when they co-occur in
// the same message. Alone, none of these is a signal ("a knife for the bread").
const RE_MEANS = /\b(?:pills|pill bottle|a gun|my gun|the gun|rope|noose|razor|blade|overdose|the bridge|a bridge|the ledge|the roof)\b/;
const RE_FAREWELL = /\b(?:this is goodbye|goodbye forever|tonight is the night|won't be here tomorrow|by the time you read this)\b/;

// ─── AMBIGUOUS ──────────────────────────────────────────────────────────────

// "I want to die" is a real signal and a common idiom. Idiomatic continuations
// ("die of embarrassment", "die laughing") are excluded outright.
const RE_DEATH_WISH = /\b(?:i (?:just |really |honestly )?want to die\b(?! (?:of|from|laughing|happy|for|in|on|at|with|trying|when|if)\b)|i wish i (?:was|were|had been) dead|i wish i (?:had )?never (?:been born|woke up|existed)|i (?:don't|do not) want to (?:live|be alive|exist|wake up)(?: anymore| any more| like this)?(?= *[.!?,;]| *$| and | but )|i can't (?:live|go on)(?: like this| anymore| any more)?(?= *[.!?,;]| *$| and | but )|i want to end it(?: all)?(?= *[.!?,;]| *$| and | but )|i'm (?:going|about) to end it(?: all)?(?= *[.!?,;]| *$| and | but | tonight| today| now)|end it all\b)/;

const RE_HOPELESSNESS = /\b(?:no reason to (?:live|keep going|go on)|nothing (?:left )?to live for|(?:everyone|they|you|my family|the world) (?:would|'d) be better off without me|better off (?:if i (?:was|were) )?dead|i'm (?:just )?a burden(?: to| on)?|no one would (?:miss|notice|care)(?: if i (?:was|were) gone| if i died| about me| me)|what's the point (?:of|in) (?:living|going on|being alive|staying alive)|(?:sick|tired) of (?:living|being alive)|i want to disappear forever|i can't do this anymore)\b/;

// Self-harm needs an urge, a habit or a deliberate act. A past accident ("I hurt
// myself skiing") and idiom ("cutting myself a break") are not signals.
const RE_SELF_HARM = /\b(?:i (?:want|need|have|feel like i need|feel the urge) to (?:hurt|harm|cut|burn|hit) myself|i'm (?:going|about) to (?:hurt|harm|cut|burn) myself|i've been (?:hurting|harming|cutting|burning) myself|i (?:keep |still |sometimes |often )?(?:cut|burn|harm) myself(?! (?:a break|some slack|off|short))|i (?:cut|burned|burnt|hurt|harmed) myself (?:on purpose|again|deliberately)|i (?:self[- ]harm|have been self[- ]harming|started self[- ]harming)|self[- ]harm(?:ing)? again)\b/;

// Idioms that use self-kill words without meaning them. Removed before any
// self-kill pattern is tested, so they can neither escalate nor reach the
// catch-all.
const RE_SELF_KILL_IDIOM = /\b(?:kill(?:ing)? myself (?:laughing|at the gym|at work|working|to (?:finish|get|make|meet)|over (?:this|it|nothing)|for (?:this|nothing))|killing myself (?:at|to|over|with|for|trying|on)\b)/g;

// ─── Assessment ─────────────────────────────────────────────────────────────

export function assessCrisis(text: string): CrisisAssessment {
  if (typeof text !== 'string' || text.trim().length === 0) {
    return { tier: 'none', signals: [] };
  }
  const t = normalize(text).replace(RE_SELF_KILL_IDIOM, ' ');
  const clear = new Set<CrisisSignal>();
  const ambiguous = new Set<CrisisSignal>();

  const negated = RE_NEGATED_INTENT.test(t);
  if (RE_EXPLICIT_INTENT.test(t)) {
    // The intent phrase and its negated form can overlap ("i'm not going to kill
    // myself" contains "going to kill myself"). Only a phrase that survives with
    // the negated span removed counts as intent.
    const withoutNegated = t.replace(new RegExp(RE_NEGATED_INTENT.source, 'g'), ' ');
    if (RE_EXPLICIT_INTENT.test(withoutNegated)) clear.add('explicit_intent');
    else ambiguous.add('negated_or_hypothetical');
  } else if (negated) {
    ambiguous.add('negated_or_hypothetical');
  }

  if (RE_IDEATION.test(t)) clear.add('ideation_disclosed');
  if (clear.size === 0 && !ambiguous.has('negated_or_hypothetical') && RE_SELF_KILL_ANY.test(t)) {
    ambiguous.add('negated_or_hypothetical');
  }
  if (RE_ACT_UNDER_WAY.test(t)) clear.add('act_under_way');
  if (RE_FINAL_ARRANGEMENTS.test(t)) clear.add('final_arrangements');

  const deathWish = RE_DEATH_WISH.test(t);
  if (deathWish) ambiguous.add('death_wish');
  if (RE_HOPELESSNESS.test(t)) ambiguous.add('hopelessness');
  if (RE_SELF_HARM.test(t)) ambiguous.add('self_harm');

  if (deathWish && (RE_MEANS.test(t) || RE_FAREWELL.test(t))) {
    clear.add('wish_with_means_or_farewell');
  }

  if (clear.size > 0) return { tier: 'clear', signals: [...clear, ...ambiguous] };
  if (ambiguous.size > 0) return { tier: 'ambiguous', signals: [...ambiguous] };
  return { tier: 'none', signals: [] };
}

// ─── Member-facing referral (CLEAR only) ────────────────────────────────────

export interface CrisisResource {
  name: string;
  action: string;
  href: string;
}

/** Shown deterministically to the member on CLEAR, independent of the model. */
export const CRISIS_REFERRAL: {
  heading: string;
  body: string;
  resources: CrisisResource[];
  disclosure: string;
} = {
  heading: 'You deserve support right now',
  body: 'If you are thinking about ending your life, please reach out to someone now.',
  resources: [
    { name: '988 Suicide & Crisis Lifeline', action: 'Call or text 988 (U.S.)', href: 'tel:988' },
    { name: 'Crisis Text Line', action: 'Text HOME to 741741 (U.S.)', href: 'sms:741741?body=HOME' },
    { name: 'Emergency services', action: 'If you are in immediate danger, call 911 or your local emergency number', href: 'tel:911' },
  ],
  disclosure: 'Conversations with MAIA are not monitored by a person. No one has been notified.',
};

// ─── Server-authored safety context for MAIA ────────────────────────────────

export const CRISIS_ADDENDUM: Record<Exclude<CrisisTier, 'none'>, string> = {
  ambiguous: `SAFETY CONTEXT (server-authored, this turn only):
The member's message contains language that can signal thoughts of death or self-harm, and it may also be ordinary speech. Do not switch into a script, do not list hotlines, and do not assume a crisis.
Respond as a skilled, caring practitioner would: stay with what they actually said, and if it fits, check in gently and directly, for example by asking whether they are having thoughts of hurting themselves or of ending their life.
If they confirm such thoughts, take it seriously: stay present, and encourage them to call or text 988 (U.S.) or text HOME to 741741 (Crisis Text Line).
Never say or imply that a person is watching this conversation or has been notified. No one has.`,
  clear: `SAFETY CONTEXT (server-authored, this turn only):
The member has clearly expressed intent to end their life, a plan or means, or that they have already acted. A referral to the 988 Suicide & Crisis Lifeline and the Crisis Text Line is being shown to them separately, outside your reply.
Stay with them warmly and plainly. Tell them you are glad they told you and that you want them to stay safe. Ask directly whether they are safe right now and whether someone can be with them. Encourage them to call or text 988 now, or emergency services if they are in immediate danger.
Do not lecture, moralize, diagnose, or change the subject. Never say or imply that a person is watching this conversation or has been notified. No one has.`,
};

/** A content-free log line. Contains no member text by construction. */
export function crisisLogLine(a: CrisisAssessment, route: string): string {
  return `[SAFETY/crisis] tier=${a.tier} signals=${a.signals.join(',') || '-'} route=${route}`;
}
