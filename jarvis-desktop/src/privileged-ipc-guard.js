'use strict';

// JOM-01 R3E-R1 — Candidate only. Untrusted renderer messages are never
// evidence of human intent, source authority, provider grants or lifecycle state.
// This module deliberately has no Electron import or repository/storage I/O.
const { createHash, randomUUID } = require('node:crypto');

const CONSENT_ACTIONS = Object.freeze([
  'canonical-authorize',
  'canonical-authorize-execution-once',
  'canonical-confirm-execute',
  'canonical-adjudicate',
  'canonical-close',
  'authorize-execution-once',
  'confirm-execute',
  'run-provider',
]);
const SENSITIVE = new Set(CONSENT_ACTIONS);
const REFUSAL = Object.freeze({
  ok: false,
  status: 'REFUSED',
  reason: 'HUMAN_APPROVAL_BOUNDARY_REFUSED',
});

function sameMainFrame(event, window, expectedURL) {
  if (!window || window.isDestroyed?.() !== false) return false;
  const contents = window.webContents;
  if (!contents || contents.isDestroyed?.() !== false) return false;
  if (typeof expectedURL !== 'string' || !expectedURL.startsWith('file://')) return false;
  if (!event || event.sender !== contents || !event.senderFrame) return false;
  if (event.senderFrame !== contents.mainFrame) return false;
  if (event.senderFrame.url !== expectedURL) return false;
  if (contents.getURL?.() !== expectedURL) return false;
  return true;
}

function installLocalPagePolicy(window, expectedURL) {
  if (!window?.webContents || !expectedURL?.startsWith('file://')) {
    throw new Error('JOM_IPC_PAGE_POLICY_INVALID');
  }
  const wc = window.webContents;
  wc.setWindowOpenHandler(() => ({ action: 'deny' }));
  const denyOther = (event, detailsOrURL) => {
    const destination = typeof detailsOrURL === 'string'
      ? detailsOrURL
      : (detailsOrURL?.url || event?.url);
    if (destination !== expectedURL) event.preventDefault();
  };
  wc.on('will-navigate', denyOther);
  wc.on('will-frame-navigate', (event, detailsOrURL) => {
    // A local JARVIS window has no authorized subframes.
    const details = detailsOrURL && typeof detailsOrURL === 'object'
      ? detailsOrURL : event;
    if (details?.isMainFrame !== true || details?.url !== expectedURL) {
      event.preventDefault();
    }
  });
  wc.on('will-redirect', denyOther);
  wc.on('will-attach-webview', (event) => event.preventDefault());
}

function stableDigest(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}
function pretty(value, max = 105) {
  return String(value == null ? 'not recorded' : value).replace(/[\x00-\x1f\x7f]/g, ' ').slice(0, max);
}
function promptDetails(action, context) {
  const fields = [
    ['Action', action],
    ['Work Unit', context.work_unit_id],
    ['Source revision', context.source_revision],
    ['Bound revision', context.bound_revision],
    ['Lifecycle', context.lifecycle_state],
    ['Evidence class', context.evidence_class],
    ['Route digest', context.route_digest],
    ['Provider', context.provider_id],
    ['Model', context.model_id],
    ['Provider grant', context.grant_id],
    ['Grant standing', context.grant_standing],
    ['Route participant', context.subject?.request?.route_participant_id],
    ['Adjudication decision', context.subject?.request?.decision],
    ['Evidence basis', (context.subject?.request?.basis_refs || []).slice(0, 6).join(', ')],
    ['Network permission', context.network_external],
    ['Spend permission', context.provider_spend],
    ['Disclosure', context.disclosure],
  ];
  return fields.map(([k,v]) => k + ': ' + pretty(v)).join('\n');
}

function createConsentBoundary({ now = Date.now, ttlMs = 60000 } = {}) {
  if (!Number.isInteger(ttlMs) || ttlMs <= 0 || ttlMs > 120000) {
    throw new Error('CONSENT_TTL_INVALID');
  }
  const busy = new Set();
  const consumed = new Set();
  async function guard({ event, window, expectedURL, action, workUnitId,
    readContext, present, perform }) {
    if (!SENSITIVE.has(action) || typeof readContext !== 'function'
        || typeof present !== 'function' || typeof perform !== 'function'
        || !/^[a-z0-9][a-z0-9-]{2,63}$/.test(String(workUnitId || ''))
        || !sameMainFrame(event, window, expectedURL)) {
      return { ...REFUSAL, reason: 'INVALID_CONSENT_REQUEST_OR_SENDER' };
    }
    // Lock the entire Work Unit rather than just the verb. No overlap while a
    // native approval is open, and a decision can execute at most once.
    if (window.isFocused?.() !== true) {
      return { ...REFUSAL, reason: 'HUMAN_APPROVAL_WINDOW_NOT_FOCUSED' };
    }
    if (busy.has(workUnitId)) {
      return { ...REFUSAL, reason: 'WORK_UNIT_APPROVAL_ALREADY_PENDING' };
    }
    busy.add(workUnitId);
    try {
      const first = await readContext();
      if (!first?.ok || first.context?.work_unit_id !== workUnitId) {
        return { ...REFUSAL, reason: 'APPROVAL_CONTEXT_UNAVAILABLE' };
      }
      const before = stableDigest(first.context);
      const consent = {
        id: randomUUID(),
        action,
        workUnitId,
        digest: before,
        issuedAt: now(),
        expiresAt: now() + ttlMs,
      };
      // This dialog result is a *new main-owned decision*, never a boolean,
      // nonce or model-authored permission returned from the renderer.
      const result = await present({
        title: 'JARVIS — confirm consequential action',
        message: 'Approve this exact JARVIS action?',
        detail: promptDetails(action, first.context)
          + '\n\nApproval is one-time. Cancel leaves state unchanged.',
        type: 'warning',
        buttons: ['Approve once', 'Cancel'],
        defaultId: 1, cancelId: 1, noLink: true,
      });
      if (!result || result.response !== 0) {
        return { ...REFUSAL, reason: 'HUMAN_APPROVAL_DECLINED' };
      }
      if (now() > consent.expiresAt || consumed.has(consent.id)) {
        return { ...REFUSAL, reason: 'HUMAN_APPROVAL_EXPIRED_OR_REPLAYED' };
      }
      if (!sameMainFrame(event, window, expectedURL)) {
        return { ...REFUSAL, reason: 'APPROVAL_SENDER_CHANGED' };
      }
      const after = await readContext();
      if (!after?.ok || stableDigest(after.context) !== consent.digest) {
        return { ...REFUSAL, reason: 'APPROVAL_BOUND_STATE_CHANGED' };
      }
      consumed.add(consent.id);
      if (consumed.size > 512) consumed.clear(); // No consent identifier leaves main process.
      return await perform();
    } catch {
      // A failed native dialog or evidence read must never fall through to a
      // provider/Work Unit act or leak a private filesystem error to a page.
      return { ...REFUSAL, reason: 'APPROVAL_GUARD_FAILED_CLOSED' };
    } finally {
      busy.delete(workUnitId);
    }
  }
  return Object.freeze({ guard });
}

module.exports = Object.freeze({
  CONSENT_ACTIONS, sameMainFrame, installLocalPagePolicy,
  createConsentBoundary, promptDetails,
});
