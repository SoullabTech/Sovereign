# SAFETY-DISCLOSURE-01 · R9 — Canonical Human-Delivery Membrane Reconciliation

**Date:** 2026-10-02
**Status:** RECONCILIATION · no new delivery authority · no transport change
**Parent:** SAFETY-DISCLOSURE-01 authority contract + canonical PR #1671

## Why R9 exists

SAFETY-DISCLOSURE-01 originally described explicit member act as the only currently executable disclosure basis.

That became too broad after canonical admitted PR #1671 at merge commit `15a9175fb917cd9aa84a2735f7b3cf91a964b49b`.

#1671 established a separate human-safety delivery membrane with content-free SMS / Slack fallback for specifically governed safety paths.

R9 reconciles the two authorities rather than pretending one erased the other.

## Canonical composition

The current safety architecture has three separate membranes:

1. **Recognition** — canonical SAFETY-CRISIS-01 classifies the member's current turn at `/api/sovereign/app/maia/list`.
2. **Member response** — canonical SAFETY-CRISIS-01 owns the deterministic CLEAR referral and server-authored safety context supplied to MAIA.
3. **Human delivery** — canonical #1671 owns whether a specifically governed safety path attempts content-free human delivery and whether a provider accepted that attempt.

The cognition path must not infer the state of the delivery membrane.

## Canonical /list standing

The general live `/list` crisis path does not call `deliverHumanSafetyAlert()`.

It therefore does not automatically page a human merely because the crisis classifier returns CLEAR or AMBIGUOUS.

Its member-facing copy truthfully says MAIA is not an emergency service and must not be relied on to contact help.

## #1671 delivery membrane

#1671 preserves / provides:

- `deliverHumanSafetyAlert()`;
- independent SMS / Slack transport;
- authenticated `/api/safety/human-alert`;
- prototype/practitioner fallback seams;
- teen/abuse delivery seams when those dormant paths are reached;
- truthful `delivered` only when at least one configured provider accepts the alert.

The payload is intended to be content-free operational metadata, not raw member message text.

## Reachability standing re-read in current canonical

### Prototype MAIA safety pipeline

`MAIASafetyPipeline` can fall back to `deliverHumanSafetyAlert()`, but its known `PersonalOracleAgent` importer remains source-marked outside the ship path and canonical `/list` does not import it.

Therefore automatic human delivery from that prototype is **not established as canonical member-turn ingress**.

### Teen alert helper

`alertSoullabTeam()` now posts to `/api/safety/human-alert`, but the current source census found **no caller** outside its definition.

### Abuse alert helper

`alertTeamAboutAbuse()` now posts classification metadata to `/api/safety/human-alert`, but the current source census found **no caller** outside its definition.

### Stellium / portal safety message

The between-session safety-message path is different:

- the member authors the message;
- the member selects `safety_concern` urgency;
- practitioner email is attempted;
- if practitioner lookup/email/provider delivery fails, canonical #1671 may attempt content-free SMS/Slack paging to the Soullab safety recipient.

That fallback changes the human recipient from practitioner to Soullab safety operations. Its authority already exists in canonical #1671 and is not created by SAFETY-DISCLOSURE-01.

## SAFETY-DISCLOSURE-01 scope after reconciliation

The executable resolver in this programme now governs only **future member-initiated disclosure/off-ramp acts**.

It does not model the whole platform's human-delivery authority.

Inside that resolver:

- crisis severity does not create a new off-ramp grant;
- present explicit member act is required for `may_cross`;
- unresolved imminent/legal/minor-vulnerable-adult exception classes remain `review_required`;
- the resolver performs no recipient lookup, persistence, network I/O, or send.

Canonical #1671 remains separately authoritative until explicitly amended or superseded by another founder act.

## Non-claims

R9 does not:

- revoke #1671;
- expand #1671;
- authorize automatic paging from canonical `/list`;
- declare dormant teen/abuse paths live;
- declare production human delivery witnessed;
- select R7 Stage A or Phase 2B;
- authorize the future `Message my practitioner` off-ramp.

## Founder-facing implication

The open founder question in SAFETY-DISCLOSURE-01 is no longer 'does any non-member-act human delivery exist?' Canonical #1671 answers that for its own governed membrane.

The remaining question is narrower:

> Should Soullab create any **new** disclosure exception or new member-controlled handoff authority beyond the canonical membranes already in force?

Any change to #1671 itself is a separate Class A amendment, not an implicit effect of approving SAFETY-DISCLOSURE-01.

## Standing

**CANONICAL #1671 PRESERVED · /list CRISIS CLASSIFICATION DOES NOT AUTO-PAGE · MEMBER-INITIATED RESOLVER NARROWED TO NEW OFF-RAMP AUTHORITY · NO NEW DELIVERY AUTHORITY ADDED.**
