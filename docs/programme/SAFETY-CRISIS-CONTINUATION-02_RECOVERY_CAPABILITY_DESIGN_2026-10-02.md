# SAFETY-CRISIS-CONTINUATION-02 — Restart-Safe Recovery Capability Design

**Date:** 2026-10-02
**Class:** A — member safety / authority
**Base:** `32d5acb38f4c5c9d74b7b67bd01f2a4d4ad3da30`
**Predecessor:** SAFETY-CRISIS-CONTINUATION-01 R1 / PR #1743
**Status:** design only
**Runtime mutation:** none
**Secret creation:** not authorized
**Production deployment:** not authorized

## 1. Why this design exists

PR #1743 makes crisis continuation session-bound and defeats the immediate
cross-session bleed. Its remaining limitation is L1: the pending check-in lives
only in the `maia-sovereign` Node process.

Current production topology is one public `maia-sovereign` container behind
Caddy. There is no MAIA replica set or shared Redis/Valkey-style ephemeral
store in `docker-compose.production.yml`.

Therefore L1 is not ordinary load-balancer drift today. It is a
**restart/recreate/deploy boundary**:

`AMBIGUOUS -> MAIA asks direct safety question -> container replaced -> contextual reply`

The in-memory check-in disappears at the replacement.

## 2. Rejected direct-token design

A server-signed or encrypted token that directly restores “pending check-in”
authority looks attractive because it survives a server restart.

It is rejected as the first design.

A stateless token can be replayed while valid. If it directly authorizes a
context-dependent affirmative reply to become CLEAR, an old token can restore
an escalation state after the member has already answered negatively or the
state otherwise should have cleared.

Preventing that replay requires new shared revocation/monotonic state, which
would recreate the persistence problem the token was meant to avoid.

## 3. Admitted design candidate — recovery, not escalation

The proposed client-carried capability has one narrow authority:

> **A valid recovery capability may cause the server to re-establish an
> AMBIGUOUS safety check-in posture. It may never by itself establish CLEAR.**

This distinction is load-bearing.

Normal path, with live in-process state:

`AMBIGUOUS -> direct question -> in-memory check-in -> affirmative -> CLEAR`

Recovery path, after process state is lost:

`valid recovery capability + contextual reply -> AMBIGUOUS recovery posture -> direct question again`

Only the newly asked, server-authored direct question can create a fresh
in-memory check-in from which a later affirmative reply can become CLEAR.

A replayed recovery capability can therefore cause, at worst, another bounded
direct safety question inside the same session and TTL. It cannot manufacture
a CLEAR referral or human disclosure.

## 4. Capability contents

The capability is opaque to product code and encrypted/authenticated by the
server.

Plaintext claims, before encryption:

- `v = 1`
- `kind = "crisis_checkin_recovery"`
- `session_id`
- `issued_at`
- `expires_at`

It contains **no**:

- member message;
- MAIA message;
- diagnosis;
- crisis level;
- prompt text;
- member biography;
- human-alert status;
- model/provider instruction.

Recommended cryptographic primitive: AES-256-GCM using Node's existing
`crypto.createCipheriv/createDecipheriv` pattern.

The primitive may reuse implementation style from existing repository
AES-GCM code. It may **not reuse those modules' secrets or authority domains**.

## 5. Dedicated key boundary

If implementation is later authorized, it requires a dedicated secret:

`CRISIS_CONTINUATION_CAPABILITY_KEY_V1`

Requirements:

- 32 random bytes, encoded for environment custody;
- dedicated solely to this capability domain;
- present on every MAIA instance that must verify recovery capabilities;
- never exposed to client code;
- never logged;
- never reused as session, consent, webhook, Twilio, alert, audit, or PHI key;
- versioned so rotation can be explicit rather than implicit.

This design does **not** authorize generating, installing, rotating, or
deploying that secret.

## 6. Request/response membrane

The capability must be a dedicated top-level transport field, not prompt meta.

Server response after an AMBIGUOUS turn where MAIA actually asked a direct
safety question may include:

`safetyContinuation: "<opaque capability>"`

The client may return that exact opaque value on the next turn.

The route must destructure it before `...meta` is formed. It must never enter
`maiaService`, prompt construction, memory writeback, telemetry payloads, or
human-delivery payloads.

Verification order:

1. require a real `acceptedSessionId`;
2. authenticate/decrypt capability;
3. require `kind` and version;
4. require token session equals `acceptedSessionId`;
5. require not expired;
6. if live in-memory state exists, use the live state and ignore recovery;
7. if live state is absent and the capability is valid, select
   **AMBIGUOUS recovery posture only**;
8. never turn a contextual affirmative directly into CLEAR from the capability.

## 7. Clearing and client behavior

The server remains authoritative even if the client misbehaves.

A negative answer clears live in-memory state as today.

The response should instruct the client to discard the recovery capability
after:

- CLEAR;
- explicit negative;
- expiry;
- session change.

But server safety must not depend on client deletion. Replaying a still-valid
capability remains bounded to re-asking the direct safety question.

Client storage should be the narrowest surface needed to survive a server
replacement. Initial implementation should prefer in-memory application state.
Persisting the opaque capability in browser session storage is a separate
privacy decision, not implied by this design.

## 8. Sanctuary

The design is compatible with Sanctuary because the server stores no durable
crisis state.

The capability is client-carried opaque ciphertext and expires quickly.

Sanctuary implementation must prove:

- no capability plaintext is persisted;
- no capability ciphertext is written to durable conversation/memory stores;
- no capability is logged;
- no human disclosure is authorized;
- restarting the server does not create any server-side Sanctuary residue.

## 9. Failure semantics

If the dedicated key is missing, malformed, or verification fails:

- do not trust the capability;
- do not fall back to client state;
- do not infer CLEAR;
- continue current-utterance assessment;
- retain existing in-memory continuation if it still exists.

This is fail-closed in authority.

A failure may lose restart continuity, but it may never widen safety authority.

## 10. Lethal falsifiers

The implementation is defeated by any of the following.

**R1 — Direct escalation from recovery token**
A contextual reply becomes CLEAR solely because a recovery capability exists.

**R2 — Cross-session replay**
A capability minted for session A is accepted in session B.

**R3 — Expired acceptance**
An expired capability changes safety posture.

**R4 — Prompt injection**
Capability bytes or decoded claims enter prompt text or client-authored prompt
authority.

**R5 — Content leakage**
Member or MAIA text appears inside the capability claims, logs, telemetry,
human-delivery payloads, or durable records.

**R6 — Secret-domain reuse**
An existing session/consent/webhook/Twilio/alert/audit/PHI secret is reused.

**R7 — Missing-key widening**
Absent or invalid key causes trust of client state or escalation.

**R8 — Human-disclosure coupling**
Recovery capability authorizes or triggers human notification.

**R9 — Sanctuary residue**
Capability or decoded safety state is durably stored under Sanctuary.

**R10 — Client deletion required for safety**
An old capability can create CLEAR merely because the client failed to erase it.

**R11 — Multi-instance key drift silently accepted**
Instances with different keys silently trust unverifiable recovery state.

**R12 — Capability becomes identity**
The token is accepted without matching the current server-resolved session.

Any R1-R12 occurrence defeats the design.

## 11. Acceptance law for a future implementation

A future Class A implementation is admissible only if:

- R1-R12 are mechanically falsified;
- original crisis corpus remains 86/86;
- cross-turn reference remains 12/12;
- DC-1 through DC-13 remain dead;
- #1743 C1-C10 remain green;
- no new persistent crisis-state schema is added;
- no secret value is committed;
- no production secret is created without a separate founder act;
- no production deployment is implied by merge.

## 12. Standing

**DESIGN CANDIDATE ONLY.**

The currently deployed/canonical safety contract remains #1743's
session-bound in-memory continuation with L1 explicit.

The next founder decision is whether restart-safe continuity warrants creating
the dedicated capability-key authority and opening a separate implementation
lane.

Until that act, no runtime code or secret changes are authorized.
