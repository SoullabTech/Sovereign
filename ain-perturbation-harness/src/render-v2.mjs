/**
 * Domain B v2 renderer — SELF-CONTAINED BY DESIGN.
 *
 * This duplicates logic from render.mjs rather than importing it. That is
 * deliberate: Domain A v1 (d30a95a50e4364c8) and Domain B v1 (d4110fc014386aca)
 * are frozen and historical, and no v2 edit may be able to move their bytes even
 * by accident. Shared code would make that possible; duplication makes it
 * structurally impossible.
 *
 * THE v2 PROSE CONTRACT
 *   v1's ambiguity was that operator W added a visible new person while the
 *   ground truth recorded only a witness token — so `third_party_added` was
 *   defensible from the text and scored wrong. v2 fixes the ONTOLOGY, not the
 *   scorer: the two categories are now distinguishable from the rendered prose
 *   alone, by explicit clauses.
 *
 *     third_party_added        the third person TAKES PART in the act
 *     witness_bound_to_<role>  the third person TAKES NO PART, only observes,
 *                              and is affiliated with one named participant
 *
 *   The witness clause states non-participation explicitly ("took no part in
 *   it"). A reader with only the text can therefore assign the category without
 *   knowing anything about characterize().
 */

const PRONOUN = {
  m:  { subj: 'he',   obj: 'him',  poss: 'his'   },
  f:  { subj: 'she',  obj: 'her',  poss: 'her'   },
  nb: { subj: 'they', obj: 'them', poss: 'their' },
};

const ACT_VERB = {
  betrays:        'betrayed',
  breaks_promise: 'broke a promise to',
  protects:       'protected',
  withholds:      'withheld something from',
};

const RESPONSE_VERB = {
  withdraws:  'withdrew from',
  confronts:  'confronted',
  approaches: 'moved toward',
};

const SETTING_FRAME = {
  friendship:    'Two friends.',
  workplace:     'Two colleagues.',
  family:        'Two members of the same family.',
  neighbours:    'Two neighbours.',
  collaboration: 'Two people working on something together.',
};

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export function renderV2(ep) {
  const A = ep.participants[ep.act.agent];
  const R = ep.participants[ep.act.recipient];
  const distinct = ep.participants.X.gender !== ep.participants.Y.gender;
  const he = (p) => (distinct ? PRONOUN[p.gender].subj : p.name);

  let actClause = `${A.name} ${ACT_VERB[ep.act.type]} ${R.name} — ${he(A)} ${ep.act.detail}`;

  // PARTICIPANT: takes part in the act itself.
  if (ep.act.participant) {
    const P = ep.participants[ep.act.participant];
    actClause = `${A.name} and ${P.name} together ${ACT_VERB[ep.act.type]} ${R.name} — `
      + `${he(A)} ${ep.act.detail}, and ${P.name} took part in it`;
  }

  const parts = [cap(actClause) + '.'];

  if (ep.response) {
    const rAgent = ep.participants[ep.response.agent];
    const rTarget = ep.participants[ep.response.target];
    parts.push(
      cap(`${rAgent.name} ${RESPONSE_VERB[ep.response.type]} ${rTarget.name}: `
        + `${he(rAgent)} ${ep.response.detail}`) + '.',
    );
  }

  // OBSERVER: explicitly takes no part; affiliated with one named participant.
  if (ep.witness_of) {
    const W = ep.participants[ep.witness_of];
    const O = ep.participants[ep.observer];
    parts.push(`${O.name} took no part in it, but saw it happen; ${O.name} is close to ${W.name}.`);
  }

  const frame = SETTING_FRAME[ep.setting] ?? SETTING_FRAME.friendship;
  return `${frame} ${parts.join(' ')}`.replace(/\s+/g, ' ').trim();
}

/** The v2 change probe — unchanged in form from v1. */
export const CHANGE_PROBE = (vocab) =>
  `Which of the following changed between the first and the second? `
  + `Reply with ONLY a JSON object.\n\nAllowed values: ${vocab.join(', ')}\n\n`
  + `If nothing changed, return an empty list.\n\nFormat: {"changed": ["...", "..."]}`;

/**
 * The v2 APPLICABILITY probe — asked BEFORE any transformation judgment.
 * A system must not be allowed to silently coerce a non-performable operation
 * into an ordinary answer, so this is a separate, prior question.
 */
export const APPLICABILITY_PROBE = (text, opDescription) =>
`Read this description of something that happened between people.

${text}

Now consider this operation:

${opDescription}

Answer with exactly one of:
  DEFINED       — the operation can be carried out on this description, and doing so would change it.
  UNDEFINED     — the operation cannot be carried out, because what it needs is ABSENT from the description.
  INAPPLICABLE  — the operation cannot be carried out, because what it would introduce is ALREADY PRESENT.

Reply with ONLY a JSON object. Format: {"applicability": "DEFINED"}`;
