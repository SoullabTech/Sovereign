'use strict';

const REALMS = Object.freeze({
  maia: Object.freeze({ kind: 'privileged-local', preload: 'maia' }),
  jarvis: Object.freeze({ kind: 'privileged-local', preload: 'jarvis' }),
  platform: Object.freeze({ kind: 'remote-platform', preload: null }),
});

const LEGACY_PRODUCT_ROOTS = Object.freeze(['desktop-app', 'electron']);

function realmPolicy(name) {
  return REALMS[name] || null;
}

function canExposeBridge(realm, bridge) {
  const policy = realmPolicy(realm);
  if (!policy) return false;
  if (realm === 'platform') return false;
  return policy.preload === bridge;
}

function selectPlatformTransport({ mode, localOrigin } = {}) {
  if (mode === 'connected') {
    return { ok: true, mode, origin: 'https://soullab.life' };
  }
  if (mode !== 'sovereign') {
    return { ok: false, mode: null, reason: 'TRANSPORT_MODE_REQUIRED' };
  }
  const raw = typeof localOrigin === 'string' ? localOrigin.trim() : '';
  if (!raw) return { ok: false, mode, reason: 'LOCAL_RUNTIME_REQUIRED' };
  let url;
  try { url = new URL(raw); } catch {
    return { ok: false, mode, reason: 'LOCAL_RUNTIME_INVALID' };
  }
  const loopback = ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname);
  const originOnly = url.pathname === '/' && !url.search && !url.hash && !url.username && !url.password;
  if (url.protocol !== 'http:' || !loopback || !originOnly) {
    return { ok: false, mode, reason: 'LOCAL_RUNTIME_INVALID' };
  }
  return { ok: true, mode, origin: url.origin };
}

function productAuthority(root) {
  if (LEGACY_PRODUCT_ROOTS.includes(root)) return 'legacy-noncanonical';
  if (root === 'maia-desktop') return 'host';
  if (root === 'jarvis-desktop') return 'operator-realm';
  return 'unknown';
}

function stateIdentityChange({ currentProductName, nextProductName, migrationDeclared } = {}) {
  if (!currentProductName || !nextProductName) return { ok: false, reason: 'PRODUCT_IDENTITY_REQUIRED' };
  if (currentProductName !== nextProductName && migrationDeclared !== true) {
    return { ok: false, reason: 'STATE_MIGRATION_REQUIRED' };
  }
  return { ok: true };
}

module.exports = {
  REALMS,
  LEGACY_PRODUCT_ROOTS,
  realmPolicy,
  canExposeBridge,
  selectPlatformTransport,
  productAuthority,
  stateIdentityChange,
};
