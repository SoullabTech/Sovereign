/**
 * Domain B — structural operators, change characterization, and composition.
 *
 * THE TEST THIS EXISTS FOR
 *   If relational transformations are real structure rather than a labelling habit,
 *   sequential transformations must compose predictably. The decisive failure mode:
 *
 *       characterize(S0 -> S1)   CORRECT
 *       characterize(S1 -> S2)   CORRECT
 *       characterize(S0 -> S2)   WRONG
 *
 *   A system can be right about every local step and wrong about the global relation.
 *   R∘R is the sharpest case: two correct "roles reversed" steps whose composite is
 *   NOTHING CHANGED. Local pattern-matching fails it; structural reasoning cannot.
 *
 * WHAT IS NOT ASSUMED
 *   Closure is not an acceptance criterion. Operators may be undefined on a state,
 *   order-sensitive, or information-destroying. Those outcomes are FINDINGS about
 *   which algebraic structure obtains (group / monoid / category / dynamical / none),
 *   not defects to be engineered away. Composition class is DERIVED per pair, never
 *   declared in advance.
 */

const clone = (o) => JSON.parse(JSON.stringify(o));

/**
 * Flip helper for involutions. Stashes the outgoing {type, detail} so a second
 * application restores BOTH exactly.
 *
 * Type must be stashed, not just detail: the flips are many-to-one. V maps both
 * `withdraws` and `confronts` to `approaches`; A maps `betrays`, `breaks_promise`
 * and `withholds` all to `protects`. Flipping back therefore lands on a canonical
 * type rather than the original one, and V∘V reports "nothing changed" (the coarse
 * away/harm classes do match) while the rendered text differs. verify-b caught this
 * twice — first for detail, then for type.
 *
 * The stash is invisible to render() and characterize().
 */
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

const HARM = new Set(['betrays', 'breaks_promise', 'withholds']);
const isHarm = (t) => HARM.has(t);

/* ---------- operators ---------- */
/* Each: { apply(ep) -> ep', defined(ep) -> bool, involution: bool } */

export const OPERATORS = {
  /** R — role reversal. Involution. */
  R: {
    involution: true,
    defined: () => true,
    apply: (ep) => {
      const e = clone(ep);
      [e.act.agent, e.act.recipient] = [ep.act.recipient, ep.act.agent];
      if (e.response) [e.response.agent, e.response.target] = [ep.response.target, ep.response.agent];
      return e;
    },
  },

  /** V — response valence flip. Involution. UNDEFINED when there is no response. */
  V: {
    involution: true,
    defined: (ep) => !!ep.response,
    apply: (ep) => {
      const e = clone(ep);
      const away = e.response.type === 'withdraws' || e.response.type === 'confronts';
      flip(e.response,
        away ? 'approaches' : 'withdraws',
        away ? 'started reaching out more often' : 'stopped initiating contact');
      return e;
    },
  },

  /** A — act polarity flip. Involution. */
  A: {
    involution: true,
    defined: () => true,
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

  /** T — third party added as instigator. NOT invertible (information-adding).
   *      UNDEFINED when an instigator already exists. */
  T: {
    involution: false,
    defined: (ep) => !ep.act.instigator,
    apply: (ep) => {
      const e = clone(ep);
      e.participants.C = { name: 'Ada', gender: 'f' };
      e.act.instigator = 'C';
      return e;
    },
  },

  /** W — witness added, BOUND TO THE CURRENT RECIPIENT. NOT invertible.
   *      UNDEFINED when a witness already exists.
   *
   *      This operator exists because the other five all commute: without a
   *      role-dependent operator, Domain B cannot DETECT order-sensitivity, and an
   *      untestable class is a gap rather than a finding. W's effect depends on who
   *      the recipient is at the moment it is applied, so W∘R ≠ R∘W — the witness
   *      ends up bound to the agent in one order and the recipient in the other. */
  W: {
    involution: false,
    defined: (ep) => !ep.witness_of,
    apply: (ep) => {
      const e = clone(ep);
      e.participants.C = { name: 'Ada', gender: 'f' };
      e.witness_of = e.act.recipient;
      return e;
    },
  },

  /** D — response removed. NOT invertible (information-destroying).
   *      UNDEFINED when there is no response to remove. */
  D: {
    involution: false,
    defined: (ep) => !!ep.response,
    apply: (ep) => {
      const e = clone(ep);
      delete e.response;
      return e;
    },
  },
};

/* ---------- change characterization (DERIVED by comparing two states) ---------- */

export const CHANGE_VOCAB = [
  'roles_reversed', 'response_flipped', 'act_flipped',
  'third_party_added', 'response_removed',
  // Role-RELATIVE tokens. Order-sensitivity is only detectable if the vocabulary
  // records what the witness ended up bound to, not merely that one was added.
  'witness_bound_to_agent', 'witness_bound_to_recipient',
];

/**
 * Characterize what changed between two episode states.
 * Returns a SORTED token array. Empty array = nothing changed.
 * Derived by structural comparison — never asserted.
 */
export function characterize(a, b) {
  const t = [];

  if (a.act.agent !== b.act.agent || a.act.recipient !== b.act.recipient) t.push('roles_reversed');
  if (isHarm(a.act.type) !== isHarm(b.act.type)) t.push('act_flipped');
  if (!a.act.instigator && b.act.instigator) t.push('third_party_added');
  if (!a.witness_of && b.witness_of) {
    t.push(b.witness_of === b.act.agent ? 'witness_bound_to_agent' : 'witness_bound_to_recipient');
  }

  if (a.response && !b.response) t.push('response_removed');
  else if (a.response && b.response) {
    const away = (r) => r.type === 'withdraws' || r.type === 'confronts';
    if (away(a.response) !== away(b.response)) t.push('response_flipped');
  }

  return t.sort();
}

/* ---------- composition ---------- */

export const CLASS = {
  IDENTITY:     'composition_returns_identity',
  DEFINED:      'composition_defined',
  UNDEFINED:    'composition_undefined',
  ORDER_SENSITIVE: 'composition_order_sensitive',
  INFO_LOSING:  'composition_information_losing',
};

/**
 * Apply t1 then t2 to S0 and derive everything about the pair.
 * Returns null when the pair is undefined on this state — the caller records that
 * as a finding, not an error.
 */
export function composePair(S0, t1, t2) {
  const o1 = OPERATORS[t1];
  const o2 = OPERATORS[t2];

  if (!o1.defined(S0)) return { class: CLASS.UNDEFINED, undefined_at: 'tau1', t1, t2 };
  const S1 = o1.apply(S0);
  if (!o2.defined(S1)) return { class: CLASS.UNDEFINED, undefined_at: 'tau2', t1, t2, S1 };
  const S2 = o2.apply(S1);

  const c1 = characterize(S0, S1);
  const c2 = characterize(S1, S2);
  const cComposite = characterize(S0, S2);

  // Order sensitivity: does the reverse order reach a different composite?
  let reverseComposite = null;
  if (o2.defined(S0)) {
    const R1 = o2.apply(S0);
    if (o1.defined(R1)) reverseComposite = characterize(S0, o1.apply(R1));
  }
  const orderSensitive =
    reverseComposite !== null && JSON.stringify(reverseComposite) !== JSON.stringify(cComposite);

  // Information loss: a change present in a step is absent from the composite,
  // and not because it was undone by an involution pair.
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
    class: klass,
    t1, t2, S1, S2,
    step1_change: c1,
    step2_change: c2,
    composite_change: cComposite,
    reverse_composite_change: reverseComposite,
    order_sensitive: orderSensitive,
    information_lost: infoLosing ? lost : [],
  };
}
