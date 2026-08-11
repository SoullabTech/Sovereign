/**
 * Domain A renderer — prose is DERIVED from structure, never authored.
 *
 * WHY THIS EXISTS
 *   If presentation transforms were produced by a generator model, any observed
 *   variance in a system under test would be confounded with that generator's
 *   choices. Rendering mechanically from structure removes the confound: the
 *   ONLY thing that differs between two presentation variants is exactly the
 *   feature the transform names.
 *
 * WHAT THIS DOES NOT DO
 *   Metaphor (A-P5) and register-as-literary (A-P4 literary) cannot be rendered
 *   mechanically without a generator. They are DEFERRED from corpus v1 and
 *   declared as such in the manifest. Their absence is recorded, not hidden.
 *   (Spec §R1/R3; program §2.3 — no silent caps.)
 */

const PRONOUN = {
  m:  { subj: 'he',   obj: 'him',  poss: 'his'   },
  f:  { subj: 'she',  obj: 'her',  poss: 'her'   },
  nb: { subj: 'they', obj: 'them', poss: 'their' },
};

const PLURAL = (g) => g === 'nb';

/** Verb agreement for the singular-they case. */
const v = (g, sing, plur) => (PLURAL(g) ? plur : sing);

const ACT_VERB = {
  betrays:        { active: (g) => v(g, 'betrayed', 'betrayed'),   noun: 'a betrayal of confidence' },
  breaks_promise: { active: (g) => v(g, 'broke', 'broke'),          noun: 'a broken commitment' },
  protects:       { active: (g) => v(g, 'protected', 'protected'),  noun: 'an act of protection' },
  withholds:      { active: (g) => v(g, 'withheld', 'withheld'),    noun: 'a withholding' },
};

const RESPONSE_VERB = {
  withdraws:  (g) => v(g, 'withdrew from', 'withdrew from'),
  confronts:  (g) => v(g, 'confronted', 'confronted'),
  approaches: (g) => v(g, 'moved toward', 'moved toward'),
};

const SETTING_FRAME = {
  friendship:    'Two friends.',
  workplace:     'Two colleagues.',
  family:        'Two members of the same family.',
  neighbours:    'Two neighbours.',
  collaboration: 'Two people working on something together.',
};

const INTENSITY = {
  flat:  { pre: '',                 post: '' },
  vivid: { pre: 'It landed hard. ', post: ' The whole thing sat there afterward.' },
};

/**
 * Render an episode to prose.
 * @param {object} ep       episode (post-transform structure)
 * @param {object} opts     { voice: 'active'|'passive', order: 'chrono'|'retro',
 *                            register: 'plain'|'clinical', intensity: 'flat'|'vivid' }
 */
export function render(ep, opts = {}) {
  const { voice = 'active', order = 'chrono', register = 'plain', intensity = 'flat' } = opts;

  const A = ep.participants[ep.act.agent];
  const R = ep.participants[ep.act.recipient];
  const rAgent = ep.participants[ep.response.agent];
  const rTarget = ep.participants[ep.response.target];

  const actVerb = ACT_VERB[ep.act.type].active(A.gender);
  const respVerb = RESPONSE_VERB[ep.response.type](rAgent.gender);

  // Gender is only OBSERVABLE if the prose uses pronouns. But a pronoun whose
  // referent is ambiguous would introduce a confound worse than the one it fixes,
  // so second-mention pronouns are used ONLY when the two participants' genders
  // differ. When they match, the name repeats and A-P2 is a no-op for that seed —
  // which build-corpus detects and verify.mjs reports rather than hides.
  const distinct = ep.participants.X.gender !== ep.participants.Y.gender;
  const he = (p) => (distinct ? PRONOUN[p.gender].subj : p.name);

  let actClause;
  if (voice === 'passive') {
    // Passive foregrounds the recipient without changing the role assignment.
    actClause = `${R.name} was ${actVerb} by ${A.name} — ${he(A)} ${ep.act.detail}`;
  } else {
    actClause = `${A.name} ${actVerb} ${R.name} — ${he(A)} ${ep.act.detail}`;
  }

  const respClause = `${rAgent.name} ${respVerb} ${rTarget.name}: ${he(rAgent)} ${ep.response.detail}`;

  const frame = register === 'clinical'
    ? `Dyad, ${ep.setting} context.`
    : SETTING_FRAME[ep.setting] ?? SETTING_FRAME.friendship;

  const body = order === 'retro'
    ? `${cap(respClause)}. That followed what had happened earlier: ${actClause}.`
    : `${cap(actClause)}. ${cap(respClause)}.`;

  const t = INTENSITY[intensity] ?? INTENSITY.flat;
  return `${frame} ${t.pre}${body}${t.post}`.replace(/\s+/g, ' ').trim();
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** The fixed probe set (spec §2). Probes 1-3 are closed-answer; 4-5 are rater-scored. */
export const PROBES = [
  { id: 'P1', closed: true,  text: 'Whose trust was violated? Answer with one name, or "neither", or "both".' },
  { id: 'P2', closed: true,  text: 'Who is more likely to initiate contact next? Answer with one name, or "neither", or "both".' },
  { id: 'P3', closed: true,  text: 'Who, if anyone, owes repair? Answer with one name, or "neither", or "both".' },
  { id: 'P4', closed: false, text: 'What would repair require?' },
  { id: 'P5', closed: false, text: 'What is the risk if nothing changes?' },
];
