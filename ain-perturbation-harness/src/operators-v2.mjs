/**
 * Domain B v2 operators — SELF-CONTAINED. v1 modules are never imported or edited.
 *
 * ============================================================================
 * THE v2 ONTOLOGY — stated in corpus language, independent of any scorer
 * ============================================================================
 * These definitions are the contract. `characterize()` below must implement
 * them; it does not define them. A reader given only the rendered text must be
 * able to assign each category without knowing this file exists.
 *
 *   third_party_added
 *     A third person TAKES PART IN THE ACT — they carry it out together with
 *     the agent. The act itself is different because of them. In the text:
 *     "A and C together betrayed B … and C took part in it."
 *
 *   witness_bound_to_agent / witness_bound_to_recipient
 *     A third person TAKES NO PART in the act. They observe it, and they are
 *     affiliated with exactly one named participant. The act is unchanged by
 *     their presence; only the surrounding situation is. In the text:
 *     "C took no part in it, but saw it happen; C is close to B."
 *     The suffix names whose side the observer is on AT THE END STATE — agent
 *     or recipient of the act as it then stands.
 *
 * The v1 defect these replace: v1's W added a visible new person while the
 * ground truth recorded only a witness token, so `third_party_added` was
 * defensible from the text and still scored wrong. Both models supplied it.
 * The ontology was malformed, not the cognition.
 *
 * ============================================================================
 * APPLICABILITY — a three-way distinction, both blocking modes populated
 * ============================================================================
 *   DEFINED       precondition holds; the result differs from the input.
 *   UNDEFINED     blocked by ABSENCE — what the operation needs is not there.
 *   INAPPLICABLE  blocked by PRESENCE — what it would introduce already is.
 *
 * This maps exactly onto v1's 24 recorded-but-unprobed pairs: D∘D and D∘V are
 * absence-blocked; T∘T and W∘W are presence-blocked. Both categories therefore
 * have real instances rather than one being a definition with no members.
 */

const clone = (o) => JSON.parse(JSON.stringify(o));
const HARM = new Set(['betrays', 'breaks_promise', 'withholds']);
const isHarm = (t) => HARM.has(t);

function flip(slot, newType, newDetail) {
  if (slot._prev !== undefined) {
    const p = slot._prev;
    delete slot._prev;
    slot.type = p.type;
    slot.detail = p.detail;
    return;
  }
  slot._prev = { type: slot.type, detail: slot.detail };
  slot.type = newType;
  slot.detail = newDetail;
}

/** Human-readable operation descriptions — used verbatim in applicability probes. */
export const OP_DESCRIPTION = {
  R: 'Swap the two people: whoever did the act now receives it, and whoever responded is now responded to.',
  V: 'Reverse the direction of the response: if the responder moved away, make them move toward the other person, and vice versa.',
  A: 'Reverse the nature of the act: if it was harmful, make it protective, and vice versa.',
  T: 'Add a third person who takes part in the act alongside the person who did it.',
  W: 'Add a third person who takes no part in the act, but observes it and is close to one of the two people.',
  D: 'Remove the response entirely, so only the act remains.',
};

export const OPERATORS = {
  R: {
    involution: true,
    blocked: () => null,
    apply: (ep) => {
      const e = clone(ep);
      [e.act.agent, e.act.recipient] = [ep.act.recipient, ep.act.agent];
      if (e.response) [e.response.agent, e.response.target] = [ep.response.target, ep.response.agent];
      return e;
    },
  },
  V: {
    involution: true,
    blocked: (ep) => (ep.response ? null : 'UNDEFINED'),   // absence
    apply: (ep) => {
      const e = clone(ep);
      const away = e.response.type === 'withdraws' || e.response.type === 'confronts';
      flip(e.response,
        away ? 'approaches' : 'withdraws',
        away ? 'started reaching out more often' : 'stopped initiating contact');
      return e;
    },
  },
  A: {
    involution: true,
    blocked: () => null,
    apply: (ep) => {
      const e = clone(ep);
      const harmful = isHarm(ep.act.type);
      flip(e.act,
        harmful ? 'protects' : 'betrays',
        harmful
          ? 'absorbed something difficult on their behalf'
          : 'repeated something told in confidence to a mutual acquaintance');
      return e;
    },
  },
  /** T — third person TAKES PART in the act. */
  T: {
    involution: false,
    blocked: (ep) => (ep.act.participant ? 'INAPPLICABLE' : null),   // presence
    apply: (ep) => {
      const e = clone(ep);
      e.participants.P = { name: 'Ada', gender: 'f' };
      e.act.participant = 'P';
      return e;
    },
  },
  /** W — third person TAKES NO PART; observes, bound to the current recipient. */
  W: {
    involution: false,
    blocked: (ep) => (ep.witness_of ? 'INAPPLICABLE' : null),        // presence
    apply: (ep) => {
      const e = clone(ep);
      e.participants.O = { name: 'Bo', gender: 'nb' };
      e.observer = 'O';
      e.witness_of = e.act.recipient;
      return e;
    },
  },
  D: {
    involution: false,
    blocked: (ep) => (ep.response ? null : 'UNDEFINED'),             // absence
    apply: (ep) => {
      const e = clone(ep);
      delete e.response;
      return e;
    },
  },
};

export const CHANGE_VOCAB = [
  'roles_reversed', 'response_flipped', 'act_flipped',
  'third_party_added', 'response_removed',
  'witness_bound_to_agent', 'witness_bound_to_recipient',
  // Found by the reader-determinability test BEFORE model contact: when an
  // observer already exists and the roles then reverse, the observer's
  // affiliation flips from recipient-side to agent-side. That is visible in the
  // prose and had no vocabulary term — the exact defect class that voided v1's
  // order_sensitive dimension, recurring one level down. A model reporting the
  // flip would have been right and scored wrong. Given a term instead.
  'witness_rebound',
];

export const APPLICABILITY_VALUES = ['DEFINED', 'UNDEFINED', 'INAPPLICABLE'];

/** Derived by structural comparison. Implements the ontology above; never defines it. */
export function characterize(a, b) {
  const t = [];
  if (a.act.agent !== b.act.agent || a.act.recipient !== b.act.recipient) t.push('roles_reversed');
  if (isHarm(a.act.type) !== isHarm(b.act.type)) t.push('act_flipped');
  if (!a.act.participant && b.act.participant) t.push('third_party_added');
  if (!a.witness_of && b.witness_of) {
    t.push(b.witness_of === b.act.agent ? 'witness_bound_to_agent' : 'witness_bound_to_recipient');
  } else if (a.witness_of && b.witness_of) {
    const side = (s) => (s.witness_of === s.act.agent ? 'agent' : 'recipient');
    if (side(a) !== side(b)) t.push('witness_rebound');
  }
  if (a.response && !b.response) t.push('response_removed');
  else if (a.response && b.response) {
    const away = (r) => r.type === 'withdraws' || r.type === 'confronts';
    if (away(a.response) !== away(b.response)) t.push('response_flipped');
  }
  return t.sort();
}

export const CLASS = {
  IDENTITY:        'composition_returns_identity',
  DEFINED:         'composition_defined',
  ORDER_SENSITIVE: 'composition_order_sensitive',
  INFO_LOSING:     'composition_information_losing',
};

export function composePair(S0, t1, t2) {
  const o1 = OPERATORS[t1];
  const o2 = OPERATORS[t2];

  const b1 = o1.blocked(S0);
  if (b1) return { blocked: b1, blocked_at: 'tau1', t1, t2 };
  const S1 = o1.apply(S0);
  const b2 = o2.blocked(S1);
  if (b2) return { blocked: b2, blocked_at: 'tau2', t1, t2, S1 };
  const S2 = o2.apply(S1);

  const c1 = characterize(S0, S1);
  const c2 = characterize(S1, S2);
  const cComposite = characterize(S0, S2);

  let reverseComposite = null;
  if (!o2.blocked(S0)) {
    const R1 = o2.apply(S0);
    if (!o1.blocked(R1)) reverseComposite = characterize(S0, o1.apply(R1));
  }
  const orderSensitive =
    reverseComposite !== null && JSON.stringify(reverseComposite) !== JSON.stringify(cComposite);

  const stepTokens = new Set([...c1, ...c2]);
  const compTokens = new Set(cComposite);
  const undone = t1 === t2 && OPERATORS[t1].involution;
  const lost = [...stepTokens].filter((x) => !compTokens.has(x));
  const infoLosing = !undone && lost.length > 0;

  let klass = CLASS.DEFINED;
  if (cComposite.length === 0) klass = CLASS.IDENTITY;
  else if (infoLosing) klass = CLASS.INFO_LOSING;
  else if (orderSensitive) klass = CLASS.ORDER_SENSITIVE;

  return {
    class: klass, t1, t2, S1, S2,
    step1_change: c1, step2_change: c2, composite_change: cComposite,
    reverse_composite_change: reverseComposite,
    order_sensitive: orderSensitive,
    information_lost: infoLosing ? lost : [],
  };
}
