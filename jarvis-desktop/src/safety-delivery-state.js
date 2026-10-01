'use strict';

(function(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.KellySafetyDelivery = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  const SNAPSHOT = Object.freeze({
    as_of: '2026-10-01',
    standing: 'REPAIR_CANDIDATE',
    source: 'PR #1671 · fix/safety-human-delivery-r1-20261001',
    canonical_base: 'a999932df7aa3d4052ee78f044878026aa4f680b',
    live_telemetry: false,
    needs_kelly: Object.freeze([
      'Configure at least one independent human alert channel: Twilio SMS or Slack webhook.',
    ]),
    in_motion: Object.freeze([
      'PR #1671 gives adult crisis/high-risk, teen crisis, and Stellium safety failures one content-free human fallback.',
      'The uptime monitor now fails its own test unless SMS or Slack accepts both DOWN and RECOVERED alerts.',
    ]),
    watching: Object.freeze([
      'After merge and configuration, witness a real test alert reaching a human before closing S1-S3 or E2.',
    ]),
    unresolved: Object.freeze([
      'No Twilio or Slack safety transport was configured in the inspected production environment.',
      'Resend outage E1 remains a separate open delivery problem.',
      'Guardian delivery for teen safety remains separately governed Phase 2 work.',
    ]),
  });

  function snapshot() {
    return {
      ...SNAPSHOT,
      needs_kelly: [...SNAPSHOT.needs_kelly],
      in_motion: [...SNAPSHOT.in_motion],
      watching: [...SNAPSHOT.watching],
      unresolved: [...SNAPSHOT.unresolved],
    };
  }

  return { snapshot };
});
