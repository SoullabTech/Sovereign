'use strict';

(function(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.KellySafetyDelivery = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  const SNAPSHOT = Object.freeze({
    as_of: '2026-10-02',
    standing: 'MERGED_WITNESS_OWED',
    source: 'PR #1671 merged as 15a9175fb917cd9aa84a2735f7b3cf91a964b49b; PR #1686 closed unmerged; PR #1716 custody floor open',
    canonical_base: '15a9175fb917cd9aa84a2735f7b3cf91a964b49b',
    live_telemetry: false,
    needs_kelly: Object.freeze([
      'Constitute the genuinely distinct second human custodian required by canonical Class-A admission law. PR #1709 records the #1671 admission exception; do not treat a second GitHub credential alone as sufficient human custody.',
      'Adjudicate whether PR #1716 repository-level Axis 1 custody enforcement is accepted as an interim safeguard. The preferred organization-level ruleset placement is unavailable on the current SoullabTech Free-plan entitlement; do not treat the weaker interim floor as final Architecture B without this ruling.',
      'Rotate the invalid production Resend API key. Read-only production witness at running SHA 56d0cd679 returned HTTP 400 · validation_error · API key is invalid.',
      'Designate the independent safety recipient: production Twilio credentials are already live, but SAFETY_ALERT_PHONE is unset. Set that intentionally (or configure a safety Slack webhook), then run npm run check:safety-human-delivery until it reports READY.',
      'Verify the currently published support, privacy, problem, and hello mailboxes with a present-day external delivery witness; repository publication is current, but mailbox reachability is not established.',
    ]),
    in_motion: Object.freeze([
      'PR #1671 is merged: adult crisis/high-risk, teen safety fallback semantics, Stellium failure fallback, E2 monitor hardening, E6 reply routing, and O1 redundant-channel preservation are canonical code now; production configuration and human receipt witnesses remain owed.',
      'The uptime monitor now fails its own test unless SMS or Slack accepts both DOWN and RECOVERED alerts.',
      'E6 reply routing is being structurally repaired: practitioner-authored mail replies to the practitioner; system booking notices reply to the Soullab support mailbox.',
      'O1 build/deploy alerts are being hardened so missing required SMTP no longer suppresses optional Slack or Telegram attempts; SMTP still remains required for a successful response.',
      'PR #1716 installs the immediate Class-A custody floor inside required Axis 1 so self-authored sacred changes fail closed without a governed exact-head custodian approval.',
    ]),
    watching: Object.freeze([
      'After production configuration, witness a real test alert reaching a human before closing S1-S3 or E2.',
      'S4 remains open after #1686 closed unmerged; if the implementation is resumed, witness an exercised critical/emergency circuit-breaker alert reaching the configured human channel before closing S4.',
    ]),
    unresolved: Object.freeze([
      'Production Twilio transport credentials are present, but no designated SAFETY_ALERT_PHONE or safety Slack webhook is configured.',
      'Resend outage E1 remains a separate open delivery problem.',
      'Guardian delivery for teen safety remains separately governed Phase 2 work.',
      'S4 human-delivery implementation PR #1686 is closed unmerged; its tested branch remains provenance, not canonical behavior.',
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
