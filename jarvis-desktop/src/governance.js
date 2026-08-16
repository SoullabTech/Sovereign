// JARVIS Desktop — F2 governed action.
//
// Pure, DOM-free. Loaded by main, renderer, and proof.
//
// AUTHORITY DISCIPLINE — the whole point of this module.
// Desktop creates NO governance authority of its own. It composes argv for the
// SAME `scripts/builder/session.mjs` the terminal invokes, with an allowlist of
// three verbs, and reports the governor's own exit code and stderr verbatim.
// It does not decide whether an act is permitted, does not retry, does not
// re-interpret a refusal, and does not expose `--force` (a safeguard bypass is
// not an Alpha affordance — the governor's refusal text names the correct
// route, usually `reconcile`).
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.JarvisGovernance = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // Mirrors session.mjs CLOSE_STATES. If the governor's list changes, this
  // becomes wrong — the proof asserts they still agree.
  const CLOSE_STATES = ['completed', 'handed-off', 'paused', 'abandoned'];

  const ACTIONS = {
    recover: {
      verb: 'recover',
      needs_reason: true,
      // session.mjs: "recovery is an audited act"
      description: 'Release a stale claim. The governor refuses unless the claim is genuinely stale.',
    },
    reconcile: {
      verb: 'reconcile',
      needs_reason: true,
      description: 'Release an ambiguous-ownership claim whose lease has aged past the threshold.',
    },
    close: {
      verb: 'close',
      needs_reason: false,
      needs_state: true,
      description: 'Close a claim into an explicit end state.',
    },
  };

  /**
   * Which acts the GOVERNOR says are available for this session.
   * Derived from its own liveness flags — never from Desktop's judgement.
   * `close` is always offered; recover/reconcile only when the governor has
   * already marked them possible, so Desktop does not invite a refusal.
   */
  function availableActionsFor(session) {
    const lv = (session && session.liveness) || {};
    const out = [];
    if (lv.recoverable === true) out.push('recover');
    if (lv.reconcilable === true) out.push('reconcile');
    out.push('close');
    return out;
  }

  /**
   * Compose the argv. Returns errors instead of a command when the input
   * cannot possibly be valid — the same pre-submit discipline the C0 lane uses.
   */
  function buildGovernanceArgv(input) {
    const { action, sessionId, reason, state } = input || {};
    const errors = [];
    const spec = ACTIONS[action];

    if (!spec) return { ok: false, argv: null, errors: [`'${action}' is not a governance action Desktop may invoke.`] };

    const id = typeof sessionId === 'string' ? sessionId.trim() : '';
    if (!id) errors.push('A session id is required.');
    else if (!/^s-[0-9a-f]{6,}$/i.test(id)) errors.push(`'${id}' is not a session id.`);

    const why = typeof reason === 'string' ? reason.trim() : '';
    if (spec.needs_reason && !why) errors.push(`${spec.verb} requires a reason — it is an audited act.`);

    let st = typeof state === 'string' ? state.trim() : '';
    if (spec.needs_state) {
      if (!st) errors.push(`close requires a state: ${CLOSE_STATES.join(' | ')}`);
      else if (!CLOSE_STATES.includes(st)) errors.push(`'${st}' is not a close state. Use: ${CLOSE_STATES.join(' | ')}`);
    }

    if (errors.length) return { ok: false, argv: null, errors };

    const argv = ['scripts/builder/session.mjs', spec.verb, '--session', id];
    if (spec.needs_reason) argv.push('--reason', why);
    if (spec.needs_state) argv.push('--state', st);
    // NOTE: --force is deliberately unreachable from Desktop.
    return { ok: true, argv, errors: [] };
  }

  /**
   * session.mjs exit contract:
   *   0 ok · 1 refused · 2 collision · 3 queued · 4 usage/not-found
   *
   * A refusal is reported AS a refusal. Presentation never upgrades an
   * outcome the governor declined.
   */
  function interpretExit(code, stdout, stderr) {
    const detail = (stderr || stdout || '').trim();
    switch (code) {
      case 0: return { outcome: 'ok', label: 'DONE', governed: true, detail };
      case 1: return { outcome: 'refused', label: 'REFUSED BY GOVERNOR', governed: true, detail };
      case 2: return { outcome: 'collision', label: 'COLLISION', governed: true, detail };
      case 3: return { outcome: 'queued', label: 'QUEUED', governed: true, detail };
      case 4: return { outcome: 'usage', label: 'NOT FOUND / BAD USAGE', governed: true, detail };
      default: return { outcome: 'unknown', label: `UNKNOWN EXIT ${code}`, governed: false, detail };
    }
  }

  return { CLOSE_STATES, ACTIONS, availableActionsFor, buildGovernanceArgv, interpretExit };
});
