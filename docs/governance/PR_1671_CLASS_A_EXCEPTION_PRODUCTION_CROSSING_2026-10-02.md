# PR #1671 — Class A admission exception: production crossing

**Date:** 2026-10-02
**PR:** #1671 — `fix(safety): add independent human delivery fallback`
**Canonical merge commit:** `15a9175fb917cd9aa84a2735f7b3cf91a964b49b`
**Production witness UTC:** `2026-10-02T12:55:34Z`
**Observed production SHA:** `d4655e647`

## Purpose

This record updates the *deployment standing* of the already-recorded Class-A
canonical-admission exception. It does not erase, supersede, or retroactively
cure `docs/governance/PR_1671_CLASS_A_ADMISSION_EXCEPTION_2026-10-02.md`.

That earlier record established that #1671 entered canonical without evidenced
second-human custody concurrence. At its own post-merge witness, the exception
had not yet crossed production. This record establishes that it now has.

## Production ancestry

Read-only ancestry check:

```text
merge  15a9175fb917cd9aa84a2735f7b3cf91a964b49b
prod   d4655e647
git merge-base --is-ancestor <merge> <prod>  -> 0
```

Therefore #1671 is now contained in the production artifact.

This is a **fact of deployment**, not a ratification of the admission exception.

## Safety-delivery standing after production crossing

A read-only production env/key-presence witness found:

```text
SAFETY_ALERT_PHONE=UNSET
SAFETY_ALERT_SLACK_WEBHOOK_URL=UNSET
```

Twilio transport credentials are present in production, but the explicit safety
destination is not. The deployed #1671 code therefore has an independent human
delivery mechanism available in principle but no designated human recipient.

The production witness wrapper was then run against the exact deployed SHA:

```text
scripts/witness/safety-human-delivery-witness.sh d4655e647
```

Observed result:

```text
artifact identity                    PASS
Twilio account                       set
Twilio auth token                    set
Twilio sender                        set
safety recipient                     missing
Slack                                not ready
overall                              NOT READY
witness                              STOP before sending
```

No safety test alert was sent. This is the intended fail-closed behavior.

**Consequence:** production crossing does not close E2, S1, S2, or S3. It
changes their standing from "repair not yet deployed" to "mechanism deployed,
delivery/config/reachability witness still owed."

## Mail transport standing

The production container still has `RESEND_API_KEY` set, but an authenticated
read-only `GET /domains` request from inside `maia-sovereign` returned:

```text
HTTP 400
validation_error
API key is invalid
```

E1 therefore remains a confirmed live outage. #1671 production deployment did
not rotate or repair the provider credential.

## Operations standing

Read-only environment census:

```text
INTERNAL_ALERT_TOKEN=UNSET
ALERT_SMTP_HOST=UNSET
ALERT_FROM=UNSET
SLACK_WEBHOOK_URL=UNSET
TELEGRAM_BOT_TOKEN=SET
TELEGRAM_CHAT_ID=UNSET
```

The O1 control-flow hardening from #1671 is in the production artifact, but no
complete required or redundant build-alert destination is configured.

Read-only database/infrastructure witness:

```text
pg_stat_replication count = 0
ubuntu-8gb-fsn1-2 = offline, last seen 8d ago
```

O2 therefore remains open and confirmed.

## Governance consequence

#1671 has now crossed both:

1. canonical admission, and
2. production deployment.

The original admission-exception standing remains **OPEN**. Production crossing
does not supply the missing distinct-human custody concurrence and does not make
the historical admission compliant at the time it occurred.

A post-facto governed review must still decide whether the admitted/deployed
substantive state is affirmed, amended, or reverted after a valid second human
custodian is constituted.

This record grants **no rollback authority** and **no new deployment authority**.
It records the production fact so the exception cannot remain described as
canonical-only after that ceased to be true.
