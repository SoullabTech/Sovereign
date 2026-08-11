/**
 * Domain A transformations + ground-truth derivation.
 *
 * THE LOAD-BEARING DESIGN DECISION
 *   Ground truth is DERIVED from structure, never authored per item. That is what
 *   makes structural transforms self-validating: reverse the roles and the correct
 *   answers move automatically, because they were always a function of the roles.
 *   A hand-written answer key could disagree with its own transform; a derivation
 *   cannot.
 *
 * THE NULL-VARIANT PROBLEM (spec R1)
 *   With a deterministic renderer, a "no change" null is the IDENTICAL string, so a
 *   deterministic system scores null stability = 1.0 trivially and the noise floor
 *   measures nothing. The null must therefore be semantically vacuous but textually
 *   real: punctuation, filler, sentence-initial particles. At temperature > 0 it also
 *   absorbs sampling noise. Both effects are wanted; neither is a structural change.
 */

/* ---------- ground truth (derived, spec §2) ---------- */

const HARM_ACTS = new Set(['betrays', 'breaks_promise', 'withholds']);

/** @returns {{P1:string,P2:string,P3:string}} participant KEYS ('X'|'Y') or 'neither'. */
export function groundTruth(ep) {
  const harmful = HARM_ACTS.has(ep.act.type);

  // P1 — whose trust was violated: the recipient of a harmful act; nobody otherwise.
  const P1 = harmful ? ep.act.recipient : 'neither';

  // P2 — who is more likely to initiate contact next: the party NOT currently moving away.
  //      withdraws/confronts leave the ball with the act's agent; approaches means the
  //      responder is already the one moving.
  const P2 = ep.response.type === 'approaches' ? ep.response.agent : ep.act.agent;

  // P3 — who owes repair: the agent of a harmful act; nobody otherwise.
  const P3 = harmful ? ep.act.agent : 'neither';

  return { P1, P2, P3 };
}

/* ---------- structural transforms (change the geometry) ---------- */

const clone = (o) => JSON.parse(JSON.stringify(o));

export const STRUCTURAL = {
  /** A-S1 role reversal — an involution: applying twice must return the original. */
  'A-S1': (ep) => {
    const e = clone(ep);
    [e.act.agent, e.act.recipient] = [ep.act.recipient, ep.act.agent];
    [e.response.agent, e.response.target] = [ep.response.target, ep.response.agent];
    return e;
  },
  /** A-S2 response reversal — withdrawal becomes approach. Also an involution. */
  'A-S2': (ep) => {
    const e = clone(ep);
    e.response.type = ep.response.type === 'approaches' ? 'withdraws' : 'approaches';
    e.response.detail = ep.response.type === 'approaches'
      ? 'stopped initiating contact'
      : 'started reaching out more often';
    return e;
  },
  /** A-S3 act substitution — harm becomes protection. P1/P3 must become inapplicable. */
  'A-S3': (ep) => {
    const e = clone(ep);
    e.act.type = HARM_ACTS.has(ep.act.type) ? 'protects' : 'betrays';
    e.act.detail = HARM_ACTS.has(ep.act.type)
      ? 'absorbed something difficult on their behalf'
      : 'repeated something told in confidence to a mutual acquaintance';
    return e;
  },
};

/* ---------- presentation transforms (must NOT change the geometry) ---------- */

/** Structural-level presentation edits: rename, gender, setting. */
export const PRESENTATION_STRUCT = {
  'A-P1': (ep, ctx) => {                       // rename — gender-congruent (see A-P2 note)
    const e = clone(ep);
    const pick = (g, k) => {
      const pool = ctx.namePool.filter((p) => p.gender === g);
      return pool.length ? pool[k % pool.length].name : null;
    };
    e.participants.X.name = pick(ep.participants.X.gender, ctx.i) ?? ep.participants.X.name;
    e.participants.Y.name = pick(ep.participants.Y.gender, ctx.i + 1) ?? ep.participants.Y.name;
    return e;
  },
  'A-P2': (ep, ctx) => {                       // gender / pronoun change
    const e = clone(ep);
    const rot = { m: 'f', f: 'nb', nb: 'm' };
    // Rotate to DIFFERENT genders so the renderer's pronoun path stays active and
    // A-P2 is observable. Collision bump is deterministic.
    const gx = rot[ep.participants.X.gender];
    let gy = rot[rot[ep.participants.Y.gender]];
    if (gx === gy) gy = rot[gy];

    // Names must move WITH gender. Rotating gender while keeping the original name
    // produces name/pronoun incongruence ("Marcus ... she"), which would perturb a
    // system for reasons unrelated to relational structure — a confound worse than
    // the one A-P2 exists to test. Congruent names make this a clean presentation
    // change. Partial redundancy with A-P1 is harmless: composed presentation
    // transforms must be invariant anyway.
    const pick = (g, k) => {
      const pool = ctx.namePool.filter((p) => p.gender === g);
      return pool.length ? pool[k % pool.length].name : ep.participants[k === 0 ? 'X' : 'Y'].name;
    };
    e.participants.X = { name: pick(gx, ctx.i), gender: gx };
    e.participants.Y = { name: pick(gy, ctx.i + 1), gender: gy };
    return e;
  },
  'A-P3': (ep, ctx) => {                       // setting change
    const e = clone(ep);
    const pool = ctx.settingPool.filter((s) => s !== ep.setting);
    e.setting = pool[ctx.i % pool.length];
    return e;
  },
};

/** Render-level presentation edits: register, order, intensity, voice. */
export const PRESENTATION_RENDER = {
  'A-P4': { register: 'clinical' },
  'A-P6': { order: 'retro' },
  'A-P7': { intensity: 'vivid' },
  'A-P8': { voice: 'passive' },
};

/**
 * A-P5 (metaphor) and literary register are DEFERRED from corpus v1: they cannot be
 * rendered mechanically without a generator model, which would reintroduce the
 * confound this design exists to remove. Declared, not silently dropped.
 */
export const DEFERRED = ['A-P5-metaphor', 'A-P4-literary'];

/* ---------- null control (spec R1) ---------- */

export const NULL_EDITS = [
  (s) => s.replace(' — ', ', and '),
  (s) => `So — ${s.charAt(0).toLowerCase()}${s.slice(1)}`,
  (s) => s.replace(/^(\S+)/, '$1,').replace(',,', ','),
  (s) => `${s} That is the situation.`,
];
