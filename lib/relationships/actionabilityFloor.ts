/**
 * The actionability floor — observability, not correction.
 *
 * GOVERNING LAW (founder, 2026-08-10): correctly refusing to psychologize or
 * mutualize danger is necessary but insufficient. The member must leave the
 * response with some reachable increase in safety, agency, orientation, or
 * support. Not advice. Not "call the authorities". But more than another
 * reflective question handed back.
 *
 * THE OBSERVED DEFECT. Sexual-coercion disclosure. MAIA's stance was correct —
 * she believed the member and refused every mutualizing move — then closed on
 * "What do you think it makes you?". Validation, then the question returned.
 * Other cases surfaced support only after a prompt amendment, which means the
 * floor held by chance rather than by construction.
 *
 * ── WHY THIS MODULE ONLY DETECTS ────────────────────────────────────────────
 * The floor is a property of GENERATION, and the two corrections available at
 * a completed-reply boundary are both prohibited:
 *   • writing a reachable element ourselves = fabricating replacement text;
 *   • appending a resource = a referral dispenser, which is actively dangerous.
 *     Resources are jurisdiction- and culture-bound (Invariant 14); leaving is
 *     the most dangerous period in coercive control; police involvement can
 *     escalate and is not universally available. A canned block appended to a
 *     disclosure also reads as the room withdrawing at the moment it matters.
 * So enforcement here would have to invent or command, and MAIA does neither.
 * What IS available structurally is making the absence VISIBLE, so the floor
 * stops being invisible when it fails. Correction stays prompt-side.
 *
 * ⛔ This module never alters a reply. It returns an assessment.
 */

/**
 * Danger markers in THE MEMBER'S OWN WORDS — never in MAIA's reply, and never
 * inferred. Tuned for precision: ordinary conflict (a recurring argument, a
 * curfew, critical feedback) must not register, because treating ordinary
 * asymmetry as danger is its own harm.
 */
const DISCLOSURE_RISK: Array<{ re: RegExp; label: string }> = [
  { re: /\b(?:take|takes|taking)\s+(?:the\s+)?(?:kids|children)\b|\bleave\s+with\s+nothing\b|\bmake\s+sure\s+(?:i|you)\s+(?:had|have|left|leave)\s+nothing\b/i, label: 'threat of loss/removal' },
  { re: /\b(?:goes?|went|going)\s+through\s+my\s+phone\b|\bchecks?\s+my\s+(?:phone|messages|email|location)\b|\btracks?\s+my\b|\bknows?\s+my\s+(?:new\s+)?schedule\b/i, label: 'surveillance/monitoring' },
  { re: /\bhit\s+me\b|\bgrabbed\s+me\b|\bthrew\s+\w+\s+at\s+me\b|\bthreatened?\s+(?:me|to)\b|\bafraid\s+(?:of\s+him|of\s+her|of\s+them|he|she|they)\b|\bscared\s+of\s+(?:him|her|them)\b/i, label: 'violence or threat' },
  { re: /\bkeeps?\s+asking\s+until\s+i\s+(?:say\s+)?yes\b|\beasier\s+than\s+(?:the\s+)?(?:sulking|silence|not\s+speaking|two\s+days)\b|\bsaid\s+yes\b[^.]*\bdid\s?n[’']?t\s+want\b|\bconsent(?:ed)?\b[^.]*\btechnically\b/i, label: 'sexual coercion' },
  { re: /\bblocked\s+(?:him|her|them)\b[^.]*\b(?:new|different|unknown)\s+numbers?\b|\bkeeps?\s+(?:turning|showing)\s+up\b|\bfollow(?:s|ed|ing)\s+me\b|\boutside\s+my\s+(?:building|house|work)\b/i, label: 'stalking' },
  { re: /\bafter\s+i\s+(?:reported|complained|went\s+to\s+hr|raised)\b|\bretaliat/i, label: 'retaliation' },
  { re: /\bwon[’']?t\s+let\s+me\b|\bcontrols?\s+(?:my|the)\s+(?:money|finances|visa|passport|access)\b|\bnot\s+allowed\s+to\b/i, label: 'coercive control' },

  /**
   * THREAT-CONDITIONED COMPLIANCE — "if I didn't … he'd …".
   *
   * The highest-severity point on the consent spectrum was invisible: the
   * sexual-coercion pattern matched only wear-down phrasing, so a reported
   * threat used to obtain compliance registered nothing at all.
   *
   * ⚠️ The conditional ALONE is far too broad — "if I didn't do the dishes
   * she'd be annoyed" is ordinary life. So the consequence must ALSO be a
   * reported ACTION the other person would take, from a bounded list.
   * Emotional consequences (annoyed, upset, hurt, disappointed) are
   * deliberately absent: emotional severity does not establish safety risk.
   */
  {
    re: /(?:\bif\s+i\s+(?:did\s?n[’']?t|do\s?n[’']?t|refused?|said\s+no|say\s+no|left|leave|stopped?)\b[^.?!]{0,90}?\b(?:he|she|they)(?:[’']d|\s+would|\s+will|\s+was\s+going\s+to)\b|\b(?:he|she|they)\s+(?:said|told\s+me)\s+(?:that\s+)?if\s+i\b)[^.?!]{0,90}?\b(?:(?:tell|telling|show|send|post|share)\s+(?:my|his|her|their|everyone|people|them\s+(?:what|about)|(?:the\s+)?(?:photos?|pictures?|videos?|messages?|screenshots?))|expose|out\s+me|take\s+(?:the\s+)?(?:kids|children|everything)|hurt|hit|kill|report\s+me|fire\s+me|evict|kick\s+me\s+out|throw\s+me\s+out|cut\s+me\s+off|stop\s+paying|ruin|destroy|make\s+sure|leave\s+me\s+with\s+nothing)\b/i,
    label: 'threat-conditioned compliance',
  },

  /**
   * FORECLOSED CHOICE — "I couldn't say no", "no wasn't an option".
   *
   * A reported condition about whether refusal was AVAILABLE, not a feeling
   * about it. "I didn't want to say no" is preference, not capacity, and is
   * deliberately excluded.
   */
  {
    re: /\b(?:could\s?n[’']?t|could\s+not|was\s?n[’']?t\s+able\s+to|not\s+able\s+to|not\s+allowed\s+to|no\s+way\s+to)\s+(?:have\s+)?(?:said?|say)\s+no\b|\b(?:did\s?n[’']?t|do\s?n[’']?t)\s+think\s+i\s+could\s+(?:have\s+)?(?:said?|say)\s+no\b|\bno\s+was\s?n[’']?t\s+(?:really\s+)?an\s+option\b|\bsaying\s+no\s+was\s?n[’']?t\s+(?:really\s+)?(?:an\s+option|possible|safe)\b/i,
    label: 'foreclosed choice',
  },
];

/**
 * A reachable element — something the member can DO, HAVE, or TURN TO.
 *
 * Deliberately broad about form: a question qualifies when it opens a door
 * ("is there anyone who already knows") and not when it closes an
 * introspective loop ("what do you think that makes you"). What is being
 * detected is orientation and agency, never a directive.
 */
const REACHABLE: Array<{ re: RegExp; label: string }> = [
  { re: /\b(?:anyone|someone|somebody|a friend|family member|people)\b[^.?!]{0,60}\b(?:knows?|trust|tell|told|talk to|in your (?:life|corner))\b/i, label: 'someone who could know' },
  { re: /\b(?:tell|telling|talk to|reach out to|confide in)\b[^.?!]{0,40}\b(?:someone|anyone|a friend|family|sister|brother|colleague)\b/i, label: 'someone to tell' },
  { re: /\b(?:writ|record|document|note down|keep a|timeline|dates|screenshots?|save the)\w*\b/i, label: 'a record they could keep' },
  { re: /\b(?:options?|choices?|what(?:'s| is) available|what you can do|within reach|what would (?:help|make)\b)/i, label: 'options named' },
  { re: /\b(?:safe|safer|safety)\b/i, label: 'safety oriented' },
  { re: /\bwhat (?:do )?you (?:need|want)\b|\bwhat would you\b[^.?!]{0,40}\b(?:need|want|like)\b/i, label: 'their own need surfaced' },
  { re: /\bsupport|resources?|helpline|advocate|counsell?or|lawyer|union|hr\b/i, label: 'support named' },
];

/** Introspective loops — recorded to explain WHY a reply lacked a floor. */
const INTROSPECTIVE_CLOSE =
  /\bwhat (?:do )?you think (?:that |it |this )?(?:makes you|means about you)\b|\bwhat does that (?:make|say about) you\b|\bwhat(?:'s| is) the quiet answer\b/i;

export interface FloorAssessment {
  /** Did the member's OWN words carry credible danger markers? */
  disclosureRisk: boolean;
  riskLabels: string[];
  /** Did MAIA's reply offer anything reachable? */
  hasReachable: boolean;
  reachableLabels: string[];
  /** Risk present and nothing reachable offered — the floor was not met. */
  floorMissed: boolean;
  closedIntrospectively: boolean;
}

export function assessActionabilityFloor(reply: string, memberText: string): FloorAssessment {
  const riskLabels = DISCLOSURE_RISK.filter((d) => d.re.test(memberText || '')).map((d) => d.label);
  const reachableLabels = REACHABLE.filter((r) => r.re.test(reply || '')).map((r) => r.label);
  const disclosureRisk = riskLabels.length > 0;
  const hasReachable = reachableLabels.length > 0;

  return {
    disclosureRisk,
    riskLabels,
    hasReachable,
    reachableLabels,
    floorMissed: disclosureRisk && !hasReachable,
    closedIntrospectively: INTROSPECTIVE_CLOSE.test(reply || ''),
  };
}
