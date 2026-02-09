# Incident Log — MAIA Youth Pilot

## Purpose

This log records safety events detected by MAIA's teen safety pipeline.
**Metadata only. No content. No quotes. No paraphrase.**

The incident log exists to:
1. Track that the system detected something and a human responded
2. Identify patterns (false positives, repeat triggers, calibration needs)
3. Provide an audit trail that protects both the teen and Soullab

---

## Incident Record Template

Copy this template for each incident.

```
INCIDENT RECORD
===============

Incident ID:        [auto or manual, e.g. INC-2026-001]
Date/time detected: [system timestamp]
Date/time reviewed: [human review timestamp]

TEEN PROFILE
------------
Teen identifier:    [first name or test alias — no full name in log]
Tier:               [tier2 / tier3]
Age:                [age at time of incident]

DETECTION
---------
Trigger type(s):    [ ] Crisis   [ ] Self-harm   [ ] ED
                    [ ] Abuse    [ ] Burnout     [ ] Isolation
                    [ ] Other: ___________

Co-occurring flags: [e.g., "crisis + isolation" or "ED + burnout"]
Confidence:         [ ] Pattern match only
                    [ ] Multiple patterns
                    [ ] High-signal (explicit language)

SYSTEM RESPONSE
---------------
Resources displayed in chat:    [ ] Yes  [ ] No
Crisis resource card shown:     [ ] Yes  [ ] No
Conversation blocked (abuse):   [ ] Yes  [ ] No
System prompt modified:         [ ] Yes  [ ] No

HUMAN RESPONSE
--------------
Guardian contacted:     [ ] Yes  [ ] No    Time: ___________
Teen contacted:         [ ] Yes  [ ] No    Time: ___________
                        (Default: No, unless policy supports it)
Referral recommended:   [ ] Yes  [ ] No    To: ___________

OUTCOME
-------
Status:     [ ] Resolved
            [ ] Pending review
            [ ] Escalated
            [ ] False positive
            [ ] True positive, no action needed

Follow-up required:     [ ] Yes  [ ] No    By date: ___________

REVIEWER
--------
Reviewed by:        [name]
Review notes:       [metadata only — e.g., "Second burnout flag this week,
                     may indicate pattern. No content recorded."]
```

---

## Definitions

**Resolved:** Human reviewed, appropriate action taken (or no action needed), case closed.

**Pending review:** Flag detected but not yet reviewed by a human.

**Escalated:** Requires a second reviewer or external consultation (e.g., clinical advisor).

**False positive:** System flagged but human review determined no actual concern.

**True positive, no action needed:** Concern was real but teen appeared to have support (e.g., mentioned they told a trusted adult).

---

## Retention

Incident logs are retained for 90 days after the pilot concludes, then deleted unless required for ongoing safety review. Content is never stored in this log.
