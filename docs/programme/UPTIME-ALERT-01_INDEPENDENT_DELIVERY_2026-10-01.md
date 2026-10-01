# UPTIME-ALERT-01 — Independent Delivery

**Date:** 2026-10-01
**Status:** repair candidate · not deployed · human receipt witness owed

## Problem

The canonical uptime monitor can send alert email through Resend. During E1,
Resend itself is unavailable, so email cannot be the only operational delivery
path for the monitor that should reveal an outage.

E2 closes only when an alert reaches a human over a channel independent of
Resend and that delivery is witnessed while Resend is unavailable or ignored.

## Scope

This lane changes **operations monitoring only**.

It does not add or authorize:
- member-crisis paging;
- practitioner/guardian disclosure;
- teen alerts;
- automatic emergency contact;
- any member-content transport.

This split is deliberate. The member-safety pager work on #1671 conflicts with
the recorded Option A safety authority and is not imported here.

## Repair

`scripts/maia-monitor.js` now treats Twilio SMS and Slack webhook delivery as
independent channels.

Compatibility:
- existing `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM` and
  `ALERT_PHONES` continue to work;
- `TWILIO_FROM_NUMBER` is accepted as the main-app naming variant;
- `UPTIME_ALERT_PHONE` can hold one monitor-specific destination;
- `UPTIME_ALERT_SLACK_WEBHOOK_URL` is the monitor-specific Slack channel;
- legacy `SLACK_WEBHOOK_URL` is accepted as a compatibility alias.

Resend email may still be sent as a secondary channel. It does not count as
independent delivery.

## Non-vacuous witness

`node scripts/maia-monitor.js --test` sends both DOWN and RECOVERED.

The command exits nonzero unless at least one SMS or Slack channel reports a
2xx acceptance for **each** alert. A console print or attempted send does not
count.

A successful transport acceptance is still not human receipt. Closing E2
requires the operator to confirm that a person actually received both alerts.

## Failure direction

With no independent transport configured, `--test` fails closed.

If Resend succeeds but SMS/Slack do not, `--test` still fails.

If DOWN is accepted but RECOVERED is not, `--test` fails.

The monitor therefore cannot certify itself green merely because it printed
"test done" or because the same mail provider it is meant to survive accepted
an email.

## Admission / production boundary

This PR may be merged after normal CI and review.

It does **not** authorize production configuration changes or prove E2 closed.
Production follow-up is a separate operator act:

1. configure Twilio SMS or the uptime Slack webhook;
2. run the monitor test with Resend unavailable or intentionally ignored;
3. verify both DOWN and RECOVERED reached a human;
4. record the witness and only then retire E2 from the non-delivery register.
