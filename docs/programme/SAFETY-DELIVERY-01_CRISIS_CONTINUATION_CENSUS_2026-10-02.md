# SAFETY-DELIVERY-01 — Crisis Continuation Census

Date: 2026-10-02
Canonical base: `56cc22f01386b189a57088d71812458ae061af74`
Status: design/reachability census only
Runtime mutation: none

## Question

After a member utterance triggers the deterministic live-crisis contract proposed in #1715, what keeps the NEXT member turn inside a lawful crisis posture when that next utterance is context-dependent language such as:

- "yes"
- "yes, I do"
- "no, but I'm alone"
- "I already did"

rather than another standalone crisis phrase?

## Finding

The current #1715 contract is a strong **current-utterance boundary**, but it does not establish server-owned cross-turn crisis continuity.

That scope must remain explicit.

A first-turn deterministic response is not evidence that the next turn remains governed by the same safety posture.

## Client behavior

The browser currently maintains `crisisStateRef`.

When the local detector fires:
- `crisisStateRef.current` is set;
- care mode is selected;
- the crisis intervention is recorded and may be spoken;
- the original member turn is still sent to the server.

On later sends, the browser includes:

`maiaMode: { mode: 'care', subMode: 'crisis', crisisLevel, systemPromptModifier }`

while the ref remains active.

This is useful UI continuity.

It is not lawful server authority.

## Server behavior

The canonical serving boundary strips known client prompt-bearing keys before model cognition.

`clientPromptAuthority.ts` explicitly strips top-level:
- `systemPrompt`
- `systemPromptModifier`
- `crisisSafetyAddendum`
- `maiaModeAddendum`
- other prompt-bearing fields

The nested client `maiaMode.systemPromptModifier` is not currently converted into a model prompt by the canonical route or `maiaService`.

The route uses client-carried `maiaMode` only in non-authoritative mode/telemetry contexts found by this census.

Therefore this census does NOT establish a current nested-prompt injection path through `maiaMode.systemPromptModifier`.

It also establishes that client crisis carry is not presently a server-owned continuation mechanism.
## Why the next turn can fall through

The shared detector classifies the CURRENT utterance.

A first turn such as:

`I'm thinking about suicide`

can trigger the explicit crisis contract.

If MAIA then asks:

`Do you have a plan to hurt yourself right now?`

a reply such as:

`yes, I do`

does not independently contain the lexical evidence needed to recreate the original crisis classification.

Without an independently established continuation state, ordinary processing can resume even though the conversational meaning is still safety-critical.

This is a relational/temporal safety gap, not a defect in the first-turn detector.

## Existing persistence substrates

### TurnsStore

The durable turn store preserves conversation content for lawful non-Sanctuary sessions.

It does not expose a dedicated safety-state field.

Inferring safety posture from the text of prior assistant responses would be brittle and would make wording itself an authority token.

Disposition: NOT SUITABLE as the primary continuation mechanism.

### maia_sessions.maia_mode

The schema already has `maia_mode`.

But its active contract is member/client-declared relational mode:
- normal
- patient
- scribe

The session-start endpoint normalizes those exact values.

Using this field for crisis state would collapse member-declared relational mode and server-established safety standing.

Disposition: DO NOT OVERLOAD.

### Durable crisis labels in generic session storage

Persisting a crisis label would create sensitive health/safety metadata with retention and Sanctuary implications.

Sanctuary explicitly exists so content and interpretive residue are not carried forward.

Disposition: NOT AUTHORIZED by this census.
## Candidate mechanism — server-signed continuation capability

The smallest promising mechanism is a short-lived, server-signed, session-bound continuation capability.

Conceptually:

`server detects crisis -> mints opaque signed continuation token -> client returns token -> server verifies -> server authors continuation posture`

Properties required:

1. **Server-authored**
   - client cannot mint or alter claims.

2. **Session-bound**
   - token applies only to the session that triggered it.

3. **Short-lived**
   - it is a turn-continuity capability, not durable identity or health memory.

4. **Minimal claims**
   - version
   - session identity
   - crisis level / continuation stage only as needed
   - expiry

5. **No message content**
   - no user text
   - no diagnosis
   - no inferred biography

6. **No prompt text**
   - the token carries state, never instructions.

7. **Server-authored response posture**
   - verified claims select fixed house-authored safety behavior.
   - client-provided `systemPromptModifier` remains irrelevant.

8. **Separate from disclosure**
   - continuation of member response does not itself authorize human notification.

9. **Sanctuary-compatible**
   - token is stateless and expiring rather than durable server memory.

## Secret boundary

The repository contains HMAC capability precedents such as encounter threshold tokens.

However, this census found no existing secret whose domain can be reused for crisis continuation without conflating authorities.

Do NOT casually reuse:
- client-session signing secrets
- consent/threshold authority
- Twilio credentials
- alert tokens
- unrelated webhook secrets

If the signed-capability design is admitted, it should receive an explicitly governed signing boundary.

Whether that means a dedicated secret or another formally shared capability-signing root requires separate admission.

This census does not choose the secret.
## Rejected alternatives

### Trust client `maiaMode`

Rejected.

The browser may describe UI state but cannot establish server safety standing.

### Reuse nested `systemPromptModifier`

Rejected.

Prompt authority remains server-side.

### Infer continuation from previous assistant wording

Rejected.

A prose string is not a safety capability.

### Store a durable crisis profile automatically

Rejected.

This would create new persistence, privacy, personhood, and Sanctuary obligations far beyond the present-turn contract.

### Keep the crisis flag forever in the client

Rejected as server authority.

It may remain a UI aid, but it cannot prove safety standing to the server.

## Required implementation questions before code

A future Class A implementation must answer:

1. What exact event clears or downgrades the continuation?
2. How long may a continuation capability live?
3. What states are actually needed beyond level?
4. How are affirmative/negative answers interpreted without creating a fragile clinical state machine?
5. Does every continuation turn remain deterministic, or does a verified token authorize a bounded server-authored model addendum?
6. What happens if signing capability is unavailable?
7. What information, if any, is logged?
8. How is Sanctuary proven free of durable crisis-state residue?
9. How does voice and text share the same server truth?
10. How does the contract avoid turning ordinary distress into an immortal crisis session?

## Lethal falsifiers

C1 — "yes, I do" after an active crisis prompt falls into ordinary symbolic/depth processing.

C2 — a client can fabricate crisis continuation authority by editing request JSON.

C3 — a client can inject prompt text through a continuation field.

C4 — a crisis token can be replayed across sessions.

C5 — expired continuation remains authoritative.

C6 — Sanctuary writes durable crisis-state metadata.

C7 — continuation automatically authorizes human disclosure.

C8 — crisis state can never lawfully clear.

C9 — an ordinary member can cause another member's session to inherit crisis state.

C10 — a server signing failure silently falls back to trusting client state.

Any C1-C10 occurrence defeats the continuation design.

## Relation to #1715

#1715 should be described narrowly:

**deterministic current-utterance crisis recognition and member response**

It should not be represented as a complete cross-turn crisis-session state machine.

That limitation does not invalidate #1715.

It identifies the next Class A boundary honestly.

## Disposition

OPEN DESIGN GAP.

No runtime implementation is authorized by this record.

Next lawful act:
- admit the continuation architecture;
- write falsifiers first;
- then open a separate Class A implementation lane.

Human disclosure remains separately governed by the merged #1671 substrate and its recipient/witness requirements.
