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
      'Rotate the invalid production Resend API key. Read-only production witness at running SHA 56d0cd679 returned HTTP 400 · validation_error · API key is invalid.',
      'Designate the independent safety recipient: production Twilio credentials are already live, but SAFETY_ALERT_PHONE is unset. Set that intentionally (or configure a safety Slack webhook), then run npm run check:safety-human-delivery until it reports READY.',
    ]),
    in_motion: Object.freeze([
      'PR #1671 gives adult crisis/high-risk, teen crisis, and Stellium safety failures one content-free human fallback.',
      'The uptime monitor now fails its own test unless SMS or Slack accepts both DOWN and RECOVERED alerts.',
      'E6 reply routing is being structurally repaired: practitioner-authored mail replies to the practitioner; system booking notices reply to the Soullab support mailbox.',
    ]),
    watching: Object.freeze([
      'After merge and configuration, witness a real test alert reaching a human before closing S1-S3 or E2.',
    ]),
    unresolved: Object.freeze([
      'Production Twilio transport credentials are present, but no designated SAFETY_ALERT_PHONE or safety Slack webhook is configured.',
      'Resend outage E1 remains a separate open delivery problem.',
      'Guardian delivery for teen safety remains separately governed Phase 2 work.',
      'S4 circuit-breaker state is truthful but still non-delivering: live field integrations log critical/emergency human notifications without a delivering callback.',
      'O1 build/deploy alerts remain unconfigured in production: the required internal token and SMTP alert settings are absent.',
      'O2 Postgres standby remains down: replication count is 0 and ubuntu-8gb-fsn1-2 is offline, last seen 7 days ago.',
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
