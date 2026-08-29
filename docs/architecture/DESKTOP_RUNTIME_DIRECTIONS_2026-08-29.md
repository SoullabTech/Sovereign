# Desktop Runtime — Preserved Direction

```text
CAT 1 — PRESERVED DIRECTION
NON-CANONICAL
NON-IMPLEMENTING
NO RUNTIME COMMITMENT
```

**Founder-authorized 2026-08-29** for preservation only. Nothing in this document
authorizes work, ratifies a principle, or describes a capability that exists.
It records a direction so it is not lost and not silently converted into a
claim. Citing this file is never evidence that a behaviour is built, wired,
surfacing, or verified.

---

## 0. What Desktop actually is today

⛔ **Read this section before any other.** The rest of this document describes a
runtime MAIA does not have. This section is the only part of it that is a
statement about the present.

```text
Desktop shell
→ browser engine
→ same React / web component tree as the PWA
→ components/voice/ContinuousConversation.tsx owns capture
→ component refs own the microphone lifecycle
→ unmount revokes the sovereign capture
```

Two consequences follow, and both are load-bearing:

- **Window lifetime is still capture lifetime.** `revokeSovereignCapture('unmount')`
  fires when the component unmounts. There is no process that survives the
  window, and no conversational state living outside it.
- **What `DESKTOP-SOVEREIGN-STT-01` changed was which capture path Desktop
  selects, not where conversational state lives.** Desktop is routed to
  MediaRecorder + local Whisper by CLASSIFICATION, not by capability —
  Chromium has Web Speech; the sovereign path was chosen despite that.

A persistent supervisor, an IPC surface, and a window that attaches to state it
does not own are a **separate architectural phase**. None of it is near.

---

## 1. The four-state model

| State          | What MAIA is doing                                                                       |
| -------------- | ---------------------------------------------------------------------------------------- |
| **Present**    | Available, holds the ongoing context of the day, microphone **not** capturing            |
| **Attending**  | Member has invoked her; actively listening; a thought is allowed to unfold naturally     |
| **Conversing** | Fluid back-and-forth; interruption / barge-in supported; continuity preserved            |
| **Quiet**      | Recedes without disappearing; resumable later without starting over                      |

The member must be able to tell which state holds **at a glance**. That is a
sovereignty property, not a UI nicety: a state model the member cannot read is
not a boundary they can rely on.

## 2. The seven conversational conventions

1. **Presence without surveillance** — available without covert or continuous capture.
2. **Thought ownership** — the human decides when a thought is complete; MAIA does not rush them.
3. **Conversational continuity** — returning after three hours does not require rebuilding the situation.
4. **Interruptibility** — the member can interrupt MAIA naturally, and she yields.
5. **Variable tempo** — some exchanges are rapid; others hold long speech, silence, reflection, wandering.
6. **Graceful dormancy** — MAIA can be quiet for hours without the relationship feeling terminated.
7. **Contextual re-entry** — *"where were we?"* should actually work.

## 3. Lifetime tiering

```text
MAIA
│
├── relationship continuity       months / years   ← existing/ongoing memory architecture
├── day context                   hours            ← conversational continuity / memory work
├── active conversation           minutes          ← active conversational state
└── individual speaking turn      seconds          ← capture + response lifecycle
```

Application ≠ session ≠ conversation ≠ context. A conversation may end without
MAIA disappearing; a day may end without the relationship resetting.

⛔ **A Desktop supervisor would supply a durable runtime CONTAINER for these
tiers. It does not produce their contents.** The relationship and day tiers are
the conversational and episodic memory layers; the episodic layer has no spec.
Runtime work cannot close a semantic gap, and must never be cited as having
closed one.

## 4. Persistent availability ≠ persistent capture

The long-term goal is **an always-available relationship, not an always-on
microphone**. A native runtime makes an always-on microphone *technically
easier*; that ease is not an argument for it. MAIA can be present all day
without listening all day.

---

## 5. Two guardrails (stated strongly, deliberately)

These are the constraints under which the two most attractive voice
improvements stay compatible with member sovereignty. They are recorded here as
direction; neither is ratified, and neither authorizes building the feature it
constrains.

### 5.1 Semantic endpointing is EXTENSION-ONLY

```text
semantic evidence MAY:
    extend listening

semantic evidence MAY NEVER:
    terminate the member's turn early
```

⛔ **Why the asymmetry is the whole point.** "Intelligent endpointing" that can
also decide *"that sounded complete, send now"* does not remove the defect
`DESKTOP-SOVEREIGN-STT-UTTERANCE-LIMIT-01` repaired — it re-implements it with
better technology. `timer says you're done` becomes `model says you're done`,
and the member has lost the same authority either way. Silence, explicit member
action, and interruption remain the enders.

### 5.2 Barge-in listening is ENERGY-ONLY, and must be VISIBLE

```text
during MAIA playback:
  mic may be live
  → energy-only VAD
  → no transcription
  → no semantic processing
  → no network transmission
  → no retention

member begins an actual turn:
  → playback yields
  → ordinary sovereign capture begins
```

⛔ **The UI must show the microphone's true state.** A "Speaking" indicator must
not visually imply "microphone closed" while the microphone is in fact open for
interruption detection. This is a sovereignty requirement, not cosmetic: a
member who cannot see that the mic is live has lost the glance-legibility that
makes §1 a boundary rather than a diagram.

---

## 6. HEARD-TO-COMPLETION — pointer only

> **HEARD-TO-COMPLETION** — candidate platform conversational invariant;
> canonical placement unresolved. **This document does not ratify or locate it.**

It governs PWA, iOS, Desktop and any later voice substrate. Placing it inside a
Desktop architecture document would subordinate a platform-wide conversational
principle to one client implementation, which is precisely the error to avoid.

Its normative form, when a home is established, is expected to be approximately:

> The member retains authority over completion of their speaking turn. Silence,
> explicit member action, interruption, or a disclosed finite safety/resource
> ceiling may end capture. Semantic inference may extend listening but must not
> terminate a turn earlier than those member-legible boundaries.

Before a home is chosen, the existing canon must be inspected for the instrument
that already holds MAIA-wide conversational authority. Inventing another
authority document is the last resort, not the first move.

---

## 7. What this document is not

Not canon. Not a spec. Not a plan. Not an authorization. Not a description of
any built or wired behaviour. It does not lift any freeze, does not settle
HEARD-TO-COMPLETION, and does not license a Desktop supervisor, an IPC surface,
semantic endpointing, or barge-in. Each of those remains its own bounded job
with its own authority and its own witness.

## 8. Related

- `docs/ops/MAIA-D01_NATIVE_VOICE_DESKTOP_WITNESS_2026-08-25.md` §XII — the sovereign-Desktop STT ruling
- `docs/design/contracts/conversation-room-provisional-speech.md` — the provisional-text row
- `lib/voice/desktopUtteranceLimits.ts` — the Desktop safety ceiling and why 8 s was an ontology error
- `docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md` — the relational constitution HEARD-TO-COMPLETION may eventually join
