// JARVIS Desktop — founder-facing intent posture.
// Pure presentation logic: chooses task SHAPE, never model authority.
'use strict';

(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.JarvisOperatorFlow = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const LOCAL = 'local';
  const FRONTIER = 'frontier';
  const LOCAL_MAX_CHARS = 4000; // must match router.mjs C1_MAX_INPUT_CHARS

  function normalizeIntent(value) {
    return typeof value === 'string' ? value.trim() : '';
  }

  function validate({ intent, posture }) {
    const text = normalizeIntent(intent);
    const errors = [];
    if (!text) errors.push('Tell JARVIS what you want to happen.');
    if (![LOCAL, FRONTIER].includes(posture)) errors.push('Choose local or frontier reasoning.');
    if (posture === LOCAL && text.length > LOCAL_MAX_CHARS) {
      errors.push(`Local JARVIS work is bounded to ${LOCAL_MAX_CHARS} characters. Narrow this request rather than silently escalating it.`);
    }
    return { ok: errors.length === 0, intent: text, posture, errors };
  }

  function buildTask({ intent, posture, externalOk = false }) {
    const checked = validate({ intent, posture });
    if (!checked.ok) return { ok: false, errors: checked.errors, task: null };
    if (posture === LOCAL) {
      return {
        ok: true,
        errors: [],
        task: {
          bounded_for_local: true,
          input_chars: checked.intent.length,
          prompt: checked.intent,
          operator_posture: LOCAL,
        },
      };
    }
    return {
      ok: true,
      errors: [],
      task: {
        description: checked.intent,
        external_ok: externalOk === true,
        operator_posture: FRONTIER,
      },
    };
  }

  function plan({ posture, externalOk = false }) {
    if (posture === FRONTIER) {
      return {
        title: 'External frontier reasoning',
        execution: externalOk ? 'Route first; external execution still requires your explicit Run action.' : 'Route only; external execution remains held.',
        privacy: 'Task text only. No repository, continuity, member data, or filesystem context is attached.',
        model: 'Nemotron 3 Ultra when explicitly released.',
      };
    }
    return {
      title: 'Keep this local',
      execution: 'Bounded local reasoning on this Mac.',
      privacy: 'No external model call.',
      model: 'Local worker through the existing C1 path.',
    };
  }

  return { LOCAL, FRONTIER, LOCAL_MAX_CHARS, normalizeIntent, validate, buildTask, plan };
});
