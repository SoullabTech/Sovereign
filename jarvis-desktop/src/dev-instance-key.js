'use strict';

const KEY_RE = /^[a-zA-Z0-9._-]{1,64}$/;

function resolveDevUserDataName(env = process.env) {
  const key = String(env.JARVIS_DEV_INSTANCE_KEY || '').trim();
  if (!key) return 'jarvis-desktop-dev';
  if (!KEY_RE.test(key)) throw new Error('JARVIS_DEV_INSTANCE_KEY_INVALID');
  return 'jarvis-desktop-dev-' + key;
}

module.exports = { KEY_RE, resolveDevUserDataName };
