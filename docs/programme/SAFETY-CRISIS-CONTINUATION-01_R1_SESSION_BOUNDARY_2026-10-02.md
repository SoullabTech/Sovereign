# SAFETY-CRISIS-CONTINUATION-01 — R1 Session Boundary

**Date:** 2026-10-02
**Class:** A — member safety / safety authority
**Base:** `f1c1f96f8531a1812630311cc8d36559995d5e80`
**Predecessor census:** commit:`873a614179e28080e2b366367486bd82b871bf90`
**Runtime scope:** short-lived crisis check-in continuity only
**Production authority:** none

## Finding

The October 2 continuation census correctly identified that a current-turn crisis
detector is not by itself a cross-turn safety contract. Since that census was
written, PR #1633 merged and canonical now contains a server-owned continuation
mechanism in `lib/safety/crisisCheckIn.ts`.

That mechanism materially changes the standing.

When an ambiguous turn causes MAIA to ask a direct safety question, the server
holds a content-free pending check-in. An affirmative reply on the following
turn can therefore become CLEAR even when the reply is context-dependent.

The state contains only:

- a key;
- a remaining-turn count;
- an expiry timestamp.

It contains no member message, MAIA message, diagnosis, prompt text, or durable
health record.
## R1 defect

The merged route chose the continuation key as:

`acceptedSessionId ?? member:<userId>`

The member fallback is too broad.

If a request arrives without a session ID, one session can establish pending
safety standing that a different session for the same member can consume.

That violates the census requirement that continuation be session-bound.

R1 removes that fallback.

The only authoritative key is now:

`acceptedSessionId ?? ''`

No session ID means no cross-turn carry. The system falls back to current-turn
assessment rather than widening continuation authority.

## Existing bounded semantics

Canonical already provides:

- **turn budget:** two turns;
- **TTL:** fifteen minutes;
- **explicit clear:** `clearSafetyCheckIn()`;
- **negative-answer clear:** the route clears pending standing on a negative;
- **server authorship:** clients cannot directly write the in-memory map;
- **no prompt token:** continuation state carries no instructions;
- **no durable persistence:** process memory only;
- **Sanctuary compatibility:** no crisis-state row or retained content is written;
- **human-delivery separation:** continuation does not call the human safety
  delivery membrane.

## C1–C10 adjudication

The R1 falsifier matrix is
`tests/constitutional/safety-crisis-continuation/matrix.ts`.

It applies the census's ten lethal conditions to the mechanism that actually
exists after #1633:

| Falsifier | R1 standing |
|---|---|
| C1 contextual affirmative falls into ordinary processing | defeated while the pending server check-in exists |
| C2 client fabricates continuation authority | defeated; no client continuation field is admitted |
| C3 client injects prompt text | defeated by the prompt-authority strip boundary |
| C4 continuation replays across sessions | defeated by session-only keying |
| C5 expired continuation remains authoritative | defeated by TTL |
| C6 Sanctuary creates durable crisis-state residue | defeated; state is process memory only |
| C7 continuation automatically authorizes human disclosure | defeated; no delivery coupling |
| C8 state can never clear | defeated by explicit clear, negative clear, TTL and turn budget |
| C9 another session/member inherits standing | defeated by key isolation |
| C10 missing server state trusts client state | defeated; missing state returns to current-turn assessment |

## Declared open limitation — L1

Process memory is not cross-process continuity.

A process restart, replacement container, or request routed to another server
instance can lose the pending check-in. That failure is **fail-closed in
authority**: it never invents a crisis standing. But it can produce a **safety
miss in continuity** when a context-dependent reply arrives after state loss.

R1 does not hide this limitation and does not call the problem solved across
process boundaries.

## Why R1 does not mint a signed token

The predecessor census proposed a short-lived server-signed client-carried
capability as a possible stateless mechanism. That remains a reasonable future
architecture if cross-process continuity is required.

R1 does **not** implement it because the signing authority is not yet admitted.

A signed capability would require a separately governed decision about:

- signing-key domain and custody;
- rotation;
- expiry;
- replay semantics;
- session binding;
- failure behavior when signing/verification is unavailable;
- multi-instance verification;
- whether the capability is necessary given the actual deployment topology.

Reusing an unrelated session, consent, webhook, Twilio, or alert secret is not
authorized.

## Authority boundary

This change authorizes only the smallest correction to the mechanism already
canonical:

1. continuation state may be keyed only by a real session ID;
2. absence of session identity means no continuation state;
3. C1–C10 are mechanically falsified;
4. L1 remains open and explicit.

It does **not** authorize:

- durable crisis metadata;
- a new signing secret;
- a client-authored safety token;
- human disclosure;
- production deployment.

## Next decision after R1

After R1 is admitted, the remaining question is operational rather than hidden:

**Must crisis continuation survive process/container/instance changes?**

If yes, open a separate Class A signed-capability design with the secret boundary
decided first. If no, record acceptance of L1 against the actual deployment
topology and its failure semantics.
