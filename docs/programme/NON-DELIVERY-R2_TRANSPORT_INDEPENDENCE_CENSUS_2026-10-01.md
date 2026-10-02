# NON-DELIVERY-R2 — Transport Independence Census

Date: 2026-10-01
Scope: uptime-monitor transport independence only
Runtime mutation: none
Secret values inspected: no

## Question

Does the production uptime monitor have a notification path whose failure domain is independent of Resend?

## Source inspection

scripts/maia-monitor.js defines two alert transports in parallel:

- Twilio SMS
- Resend email

sendAlerts() dispatches configured SMS and email deliveries independently through Promise.all().

Therefore the source-level statement "the monitor alerts only through Resend" is not correct for the current canonical code.

## Runtime configuration witness

The private production monitor configuration was inspected by boolean presence only. No credential values were printed or copied into this record.

Observed:

- scripts/.env.monitor exists
- TWILIO_ACCOUNT_SID configured
- TWILIO_AUTH_TOKEN configured
- TWILIO_FROM configured
- ALERT_PHONES configured
- one SMS recipient configured
- RESEND_API_KEY configured
- ALERT_EMAILS configured
- one email recipient configured
- CHECK_URL configured

This establishes configured transport independence at runtime.

It does not establish successful SMS delivery.
## Process witness

The production monitor process is running under launchd:

- label: life.soullab.maia-monitor
- program: Node running scripts/maia-monitor.js
- state: running
- KeepAlive: true
- process has not exited since the observed launch
- stdout: /tmp/maia-monitor.log
- stderr: /tmp/maia-monitor.error.log

The monitor reports the configured health endpoint UP every five minutes during the observed window.

No DOWN or RECOVERED event occurred in the available current log window.

Therefore no alert transport was exercised in that window.

## Delivery-standing result

SOURCE PRESENT:
yes

INDEPENDENT TRANSPORT CONFIGURED:
yes — Twilio SMS is separate from Resend email.

INDEPENDENT TRANSPORT DELIVERY WITNESSED:
no

E2 disposition:
OPEN · configured, unwitnessed

This distinction matters:

configured != available
available != transport accepted
transport accepted != recipient reached
recipient reached != human acknowledged
## Register correction

The existing E2 row says the monitor went silent with Resend because alerts go through Resend.

That statement is too strong for current canonical code/runtime configuration.

Correct current standing:

The monitor has both Resend email and Twilio SMS paths, and production configuration includes one SMS recipient. The available monitor log has no DOWN/RECOVERED event, so independent SMS delivery has not yet been witnessed. Historical silence during the Resend outage may therefore have resulted from a prior configuration state, failed SMS transport, or another cause not established by current evidence.

Do not infer historical delivery from present configuration.

## Closure condition

E2 should retain its existing closure criterion:

The monitor alerts over a channel independent of Resend, witnessed while Resend is down or simulated down.

A lawful witness may use a controlled test/simulation, but sending a real external SMS is an action requiring explicit operational authorization.

## No implementation earned yet

This census does not earn a new pager, webhook, or transport adapter.

The independent transport mechanism already exists.

Next lawful act:

1. establish a controlled Resend-down/simulated-down witness;
2. verify Twilio transport acceptance and recipient delivery semantics;
3. only build new mechanism if that witness fails for a reason the existing substrate cannot repair.

## Relation to consequence truth

This record follows CONSEQUENCE-TRUTH:

configuration is not delivery.

The register remains OPEN until the real-world consequence is witnessed.
