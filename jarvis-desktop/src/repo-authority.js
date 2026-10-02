// JARVIS O5-R4 — explicit repository binding required for authority-bearing acts.
'use strict';

const EXPLICIT_RESOLUTIONS = Object.freeze(new Set([
  'explicit-env',
  'explicit-config',
  'dev-walk',
]));

function authorityBinding(resolved) {
  const root = resolved?.root || null;
  const resolution = resolved?.resolution || 'unresolved';

  if (!root) {
    return Object.freeze({
      ok: false,
      status: 'NO_SUBSTRATE',
      reason: 'No execution substrate is bound.',
      root: null,
      resolution,
    });
  }

  if (!EXPLICIT_RESOLUTIONS.has(resolution)) {
    return Object.freeze({
      ok: false,
      status: 'HELD_FOR_EXPLICIT_REPOSITORY_BINDING',
      reason: 'Authority-bearing Desktop acts require an explicitly bound repository; implicit fallback is read-only.',
      root,
      resolution,
    });
  }

  return Object.freeze({ ok: true, status: 'ADMITTED', reason: null, root, resolution });
}

module.exports = { EXPLICIT_RESOLUTIONS, authorityBinding };
