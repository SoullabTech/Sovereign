# SAFETY-DELIVERY-01 — Post-deploy production witness

**Date:** 2026-10-02
**Scope:** read-only witness of the production state after PR #1671 canonical admission and deployment.
**No secrets recorded.**

## Artifact and ancestry

Production witness:

```text
running_sha=d4655e6477fa40b8f94c5f8f91be47198288d2af
container_created=2026-10-02T12:08:26.421055868Z
health=healthy
```

Repository ancestry check:

```text
#1671 merge = 15a9175fb917cd9aa84a2735f7b3cf91a964b49b
merge-base --is-ancestor <#1671 merge> <running_sha> = true
```

Therefore PR #1671 has crossed both canonical admission and production deployment.

## Independent human safety delivery

Executed inside the running `maia-sovereign` container:

```text
Twilio: NOT READY
  account: set
  auth token: set
  sender: set
  safety recipient: missing
Slack: NOT READY
Overall: NOT READY
exit=2
```

Interpretation:

- Twilio transport credentials are present in production.
- No designated `SAFETY_ALERT_PHONE` is configured.
- No safety Slack webhook is configured.
- The deployed **member-safety pager** code is present, but no independent human destination is currently complete.
- Provider/human delivery for the member-safety pager is therefore **not witnessed** and must not be inferred.

## Mac Studio uptime monitor — separate E2 transport

The operational uptime monitor is a separate process from the production app safety pager.

Read-only Mac Studio witness:

```text
launchd label: life.soullab.maia-monitor
process: running
config: scripts/.env.monitor
Twilio account/auth/from: set
ALERT_PHONES: set
ALERT_EMAILS: set
safety-app SAFETY_ALERT_PHONE: unset (not the monitor destination)
```

Recent live monitor logs show a real outage/recovery sequence:

```text
2026-10-02T10:23:15Z  DOWN 502
SMS provider status: 201

2026-10-02T10:28:15Z  RECOVERED 200
SMS provider status: 201
```

This establishes:

- the uptime monitor is live under launchd;
- its independent Twilio destination is configured through `ALERT_PHONES`;
- Twilio accepted both a DOWN alert and the subsequent RECOVERED alert;
- **human receipt is not established by this record**.

Do not use the monitor's `ALERT_PHONES` as authority for member-safety paging.
The production app's safety recipient remains separately unset.

## Resend transport

Read-only authenticated request from inside the running container:

```text
GET https://api.resend.com/domains
HTTP 400
name=validation_error
message=API key is invalid
```

Interpretation:

- `RESEND_API_KEY` is present in production.
- The provider rejects it as invalid.
- E1 remains a confirmed live outage.

## Structural Reply-To repair (E6)

The production SHA contains #1671, including the R6 Reply-To repair:

- practitioner-branded booking mail replies to the practitioner;
- system booking notices reply to the Soullab support mailbox;
- scheduled practitioner-authored sends use practitioner email with support fallback;
- session follow-ups resolve practitioner email with support fallback.

The structural E6 closure condition was “candidate merged; R6 ruling structurally implemented.” That condition is now met and deployed. Mailbox reachability is a separate E5 concern, and Resend availability is the separate E1 outage.

**Disposition:** E6 may leave the non-delivery register in the same change that cites this witness.

## Operations re-witness

### O1 · build/deploy alert path

Current production environment-key presence:

```text
INTERNAL_ALERT_TOKEN=UNSET
ALERT_SMTP_HOST=UNSET
ALERT_FROM=UNSET
SLACK_WEBHOOK_URL=UNSET
TELEGRAM_BOT_TOKEN=SET
TELEGRAM_CHAT_ID=UNSET
```

The #1671 control-flow repair is deployed, so missing required SMTP no longer suppresses optional Slack/Telegram attempts. Production still has no complete configured human destination for O1.

### O2 · Postgres standby

Current production witness:

```text
replication_rows=0
ubuntu-8gb-fsn1-2  offline, last seen 8d ago
```

The standby remains non-streaming and offline.

## Governance consequence

The canonical governance exception record for #1671 previously stated that the exception had crossed canonical admission but not production. That statement is now stale.

This witness establishes that the admitted Class-A state has crossed production deployment. It does not erase or cure the admission exception. Governance remediation and post-facto custody review remain open under the existing exception record.

## Standing

- #1671 engineering state: **DEPLOYED**
- E1 Resend: **OPEN · confirmed outage**
- E2 uptime monitor: **LIVE · independent Twilio transport accepted DOWN + RECOVERED · human receipt unconfirmed**; production app safety pager remains separately **config-blocked**
- S1: **DEPLOYED DORMANT/PROTOTYPE REPAIR · live reachability not established**
- S2: **DEPLOYED DORMANT REPAIR · no live caller established**
- S3: **DEPLOYED REPAIR · independent destination + human witness owed**
- S4: **OPEN · truthful non-delivery · legacy/dormant population · ordinary member-path reachability not established**
- E6: **CLOSED structurally**
- O1: **DEPLOYED REPAIR · config + human witness owed**
- O2: **OPEN · confirmed standby outage**
- Governance exception: **OPEN · now crossed production**
