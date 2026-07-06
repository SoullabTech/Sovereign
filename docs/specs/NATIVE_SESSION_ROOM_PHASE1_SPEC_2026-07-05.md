# Native Session Room — Phase 1 Spec

> **Session Room is not a video conferencing feature. It is the living environment in which
> an Encounter takes place. Every technical decision serves the integrity of that Encounter —
> preserving presence, consent, continuity, and relationship — while remaining independent of
> the underlying media transport.**
>
> *This statement is the constitutional center. Everything below is implementation in service
> of it. Once it is established, WebRTC, transcripts, recording, speaker attribution, and MAIA
> become implementation details in service of the Encounter — never definitions of it.*

**Status:** CANDIDATE (governance standing — not ratified canon; does not authorize build)
**Date:** 2026-07-05
**Author:** Kelly Nezat (direction) · captured under architectural-integrity review
**Supersedes model:** tab-audio capture (`getDisplayMedia`) in `lib/studio/RecordingContext.tsx`
**Depends on:** Encounter as Primitive · Practitioner/client privacy model · Co-Lab release gate

---

## 0. Why this exists

The current Session Room is a *recorder watching someone else's meeting* — it depends on
fragile browser tab-audio capture, and the remote participant's audio can fail silently.

Native Session Room makes Soullab **the meeting room itself**: both people join Soullab,
each mic is captured directly, an Encounter begins with mutual consent, and the record
belongs to the Encounter.

**Product principle (Candidate, not yet canon):**
> The relational field should live inside Soullab, not inside Microsoft, Zoom, or Google.

This principle becomes canon only after Phase 1 is Live — not before. (Canon Freeze is
operative; framing may not outrun the build.)

---

## 1. The constitutional center: the Encounter

The audio isn't the product. The transcript isn't the product. The reflection isn't the
product. **The Encounter is the product.** Everything else exists because an Encounter
occurred.

**The deeper invariant — an Encounter is relational before it is informational.**
- Treat an Encounter as *a recording* → transcripts become primary.
- Treat it as *a conversation* → media becomes primary.
- Treat it as *an exchange of information* → artifacts become primary.

None of those are true. An Encounter is first **a relationship unfolding through time.**
Everything else is *evidence that the relationship unfolded.*

```
Relationship
    │
    ▼
Encounter
    │
    ├── Presence
    ├── Consent (Threshold)
    ├── Participants
    ├── Session Room
    ├── Media
    ├── Transcript
    ├── Artifacts
    ├── Reflections
    └── Memory
```

The Encounter is the constitutional primitive. A Relationship gives rise to Encounters;
everything under an Encounter exists in service of it, never beside it.

**Presence** is first deliberately. It is not a database object — it is what
constitutionally distinguishes an Encounter from communication. Two people can exchange
messages; only when they become genuinely present to one another does the exchange become
an Encounter in the Soullab sense. Presence keeps future engineering honest: the schema
*serves* presence, it does not manufacture it.

### 1.1 Session Room is the living expression of an Encounter

Session Room is not beside the Encounter — it *is* the Encounter, alive and in presence.
When the room closes, the Encounter remains. The room is the environment in which the
Encounter takes place; it is not a separate object, and it owns nothing durable.

**Session Room is an environment for relational presence. Communication is one expression
of that presence — not the purpose of the room.** This is the guardrail against drift toward
another Zoom or Teams clone: a feature is admitted only insofar as it deepens presence,
never merely to move information between people.

### 1.2 Experience Layer vs Infrastructure Layer

"Transport" is an engineering word. Constitutionally, two layers must stay distinct so a
practitioner never has to think in terms of infrastructure:

```
Experience Layer        Session Room        belongs to the practitioner
Infrastructure Layer    Media Transport     belongs to engineering
```

Session Room is the lived experience; WebRTC / TURN / ICE are infrastructure beneath it.

### 1.3 Infrastructure may change without altering the Encounter

Strengthened invariant (was "Transport is not Encounter"):

> **Infrastructure may change without altering the Encounter.**

Today WebRTC. Tomorrow: SFU · LAN · satellite · local-first · peer mesh. **The Encounter
shouldn't know.** No Encounter field, table, or type may reference a media mechanism.
Infrastructure identifiers (peer IDs, ICE candidates, room tokens) live only in the
ephemeral Session Room layer and are discarded when the room closes.

### 1.4 The Encounter is the only sink

- Session Room = live presence (ephemeral).
- Encounter = what persists.
- Memory = derived *from* the Encounter.

**Invariant:** Session Room MUST NOT own transcripts or memories. If the room ever persists
a record directly, a second constitutional object is competing with the Encounter — a
violation. The room writes *into* the Encounter; it does not hold.

### 1.5 Jurisdiction chain

The voice is **not** owned by a Field. Three separate concerns, never collapsed:

```
Encounter        owns the record       (raw audio · transcript · attribution)
Relationship     governs access        (who may open it, and in what capacity)
Personal Field   receives artifacts    (derived reflections, later, if authored)
```

**Invariant:** A consumer may elevate authority (Relationship grants access) but may never
reinterpret authorship (the Encounter's record is what happened). Two-field provenance on
every persisted artifact: `authored_by` + `authority_class`.

---

## 2. Four evidentiary layers inside the Encounter

Even with perfect WebRTC separation, mics change, people join briefly, labels get edited.
The system must keep these four distinct and never let a lower layer masquerade as a higher:

1. **Raw audio** — the captured signal. Ground truth of *sound*.
2. **Transcript** — text derived from audio. Derived, correctable.
3. **Speaker attribution** — *observation/inference*, always correctable, never asserted as
   member-authored truth. "Speaker 1 = practitioner" is a guess, editable by a human.
4. **Reflection** — meaning made later (MAIA summary, practitioner reflection).
   System-derived reflection is marked as such; it is **Reflection layer at most** and may
   never manufacture Recognition.

---

## 3. The Threshold — where an Encounter begins

Consent is not merely a gate. It is **the threshold** — the act of mutual agreement with
which an Encounter begins. An Encounter does not *have* a consent check bolted onto its
front; it *begins* with one.

```
Threshold
    Consent
    Identity
    Permissions
        │
        ▼
    Encounter begins
```

A **second human** is now recorded, so the threshold is load-bearing.

**Invariant (structural, Grade A/B — not prompt, not a checkbox the practitioner clicks
for the client):**
> No audio track opens before the client's consent row exists.

The prerequisite object (a consent event, authored by the client, at the threshold) must
exist in the database before any capture path is reachable. The system *cannot* begin
recording because the precondition object does not yet exist — an architectural guarantee,
stronger than "ask permission."

- Practitioner consent and client consent are **separate recorded events.**
- Client consent is authored by the client at the threshold (waiting/entry screen).
- This refusal earns an entry in `docs/architecture/REFUSAL_REGISTRY.md` and a test in
  `tests/constitutional/refusal-registry/` (`npm run check:refusals`): *audio capture is
  unreachable without a client consent row.*

---

## 4. Client identity — Guest now, upgradeable

Constitutional principle (Candidate — governance, not ontology; earns canon through
repeated use across domains, not preference):

> **Relationship invites membership. Membership acknowledges an existing relationship —
> it never constitutes one.**

"Invites" rather than "precedes": the point is not chronological order (someone may join
first and the relationship deepen later) — it is that **membership never constitutes the
relationship.** The relationship is primary; membership is recognition and stewardship.

A person should never have to create an account before they can be met. Chosen over
"guest-only" and "full-member-required" because it preserves the developmental path: no one
must become a Soullab member before their first conversation, and that conversation must not
become an orphan.

- Client joins via **unique session link**, no account required.
- Consent event + Encounter record are designed so a guest can **later claim their side**
  if they become a member — membership *recognizing* the relationship that already occurred.
- Until claimed: the Encounter's record sits under the practitioner's stewardship
  (Relationship governs access); the guest's consent is recorded and honored.
- Design requirement: guest-side records carry a stable, claimable identity token so a
  future member account can be bound to them without rewriting history.

---

## 5. Phase scope

### Phase 1 — Native two-person audio room
- Unique session link
- Client waiting / entry screen (the threshold — §3)
- Explicit client recording consent (§3 guarantee)
- Both microphones captured **independently** (per-speaker streams)
- Live recording state
- Transcript with speaker separation (attribution = §2.3 observation, correctable)
- Audio file saved **to the Encounter** (§1.4)

### Phase 2 — Live transcription
- Real-time transcript · speaker labels · session notes
- MAIA session summary (Reflection layer, system-derived, §2.4)
- Practitioner reflection after session

### Phase 3 — Studio integration
- Client profile · Encounter record · session history · developmental themes
- Homework/follow-up · practitioner notes · client-facing recap when appropriate
- Access always mediated by Relationship (§1.5)

---

## 6. Open decision (the one remaining fork)

**Media transport for Phase 1.** Recommendation: **peer-to-peer WebRTC with self-hosted
signaling + self-hosted TURN (coturn on minisforum).**

- Sovereignty is not a property of WebRTC. It comes from controlling the **signaling, relay,
  storage, and lifecycle** — that is what keeps the Encounter within Soullab's own
  stewardship while leaving room to evolve the infrastructure later (§1.3).
- Two-party P2P needs no SFU. A self-hosted TURN relay handles NAT traversal.
- **A managed SFU (Twilio / Daily / cloud) puts a third party inside the sacred field — a
  direct violation of the self-hosted vow.** Not an option for the media path.
- Because the model is infrastructure-agnostic (§1.3), a future SFU for group rooms can be
  added without touching the Encounter. This decision is reversible by construction.

This is the bulk of Phase 1's engineering — the UI is the easy part.

---

## 7. Constitutional status of the principles surfaced here

Status discipline — **observe freely, canonize reluctantly** (Canon Freeze operative). This
spec *records* the following determinations; actual promotion to `docs/canon/` is a separate
ratification artifact, not performed here.

**Ontological invariants (canon-grade — hard to imagine future evidence overturning them
without breaking the platform's identity):**
- **Consent is the threshold** (§3) — an Encounter *begins* with mutual agreement.
- **Infrastructure is not the Encounter** (§1.3) — media may change; the Encounter must not.

**Governance principle (remains CANDIDATE — must earn canon through repeated use across
domains):**
- **Relationship invites membership** (§4) — elegant and consistent with the direction, but
  a governance principle, not an ontological one. Observe it holding across Studio,
  Relationship Space, and practitioner tools before canonizing.

**Platform-level candidate (transcends this spec):**
> Soullab exists to steward human encounters. Every other capability exists to deepen,
> preserve, or respectfully reflect those encounters without replacing the living
> relationship from which they arise.

This sentence reaches beyond Session Room — it would explain MAIA, Studio, Memory,
Reflection, Vision Studio, Relationship Space, and future practitioner tools as one organism.
If promoted, it belongs at the root of `docs/canon/`, not inside a Phase 1 spec.

---

## 8. Gates before code

- **Co-Lab release gate**: cross-member visibility → `scripts/verify-colab-boundaries.ts`
  must pass 31/31 in production before any tester invite.
- **Constitutional Completion**: capability + its refusal ship together. The recording
  capability does not ship without the consent-gate refusal structurally enforced + tested.
- **No push / no deploy** under standing order. This spec authorizes nothing to be built or
  deployed; it defines what must be true when we do.

---

## 9. Proof discipline (fill in as work lands)

- **Proven:** (nothing yet — spec only)
- **Not proven:** that the consent gate is structurally unreachable-without-row; that media
  stays sovereign; that guest records are claimable.
- **Pending:** transport decision ratification; migration design for Encounter + consent +
  claimable-guest-token; refusal-registry entry + test; Co-Lab gate re-run.
