# Native Session Room — Phase A Refusal Tests

**Status:** CANDIDATE (specification of refusals — not yet implemented; authorizes no build/deploy)
**Date:** 2026-07-05
**Parent spec:** `docs/specs/NATIVE_SESSION_ROOM_PHASE1_SPEC_2026-07-05.md`
**Registry target:** `docs/architecture/REFUSAL_REGISTRY.md` · `tests/constitutional/refusal-registry/` (`npm run check:refusals`)

---

## Purpose

> Define what the system must **refuse** before it proves what it **can do.**

Each refusal below turns an ontological line from the parent spec into an **executable
guardrail**. The rule (Constitutional Completion): a capability and its refusal ship
together — Phase A does not build a capability until its refusal is structurally enforced
and tested. This document *specifies* the six refusals; implementing them (registry entry +
falsification test) is the first work of Phase A.

**Grades** (authority location — lower letter = harder to defeat):
- **A** — no code path exists to do the forbidden thing (structure).
- **B** — a code gate blocks it (guarded path).
- **C** — only prompt text / convention forbids it (a fork edits a string). Not acceptable as
  a terminal state for anything here.

**Hostile-fork test** for each: *could a developer with commit access enable the forbidden
behavior by editing a single string / flipping one boolean, with no new code path?* If yes,
it is Grade C and not done.

---

## The six refusals

| ID | The system must refuse to… | Enforces (spec §) | Grade target |
|----|-----------------------------|-------------------|--------------|
| **R‑A1** | begin recording before a client consent row exists | §3 Threshold | A |
| **R‑A2** | write to an Encounter from a transport-only room (no Encounter bound) | §1.4 only sink | A/B |
| **R‑A3** | create Memory from raw/live call state (not derived from a persisted Encounter) | §1.4 · §2 | A/B |
| **R‑A4** | treat membership as constituting a Relationship | §4 | A/B |
| **R‑A5** | route media through a third party unless explicitly authorized | §6 sovereignty | B |
| **R‑A6** | assert speaker identity as fact before attribution + provenance exist | §2.3 | A/B |

---

### R‑A1 — No recording before consent
- **Invariant:** an Encounter *begins* with mutual agreement; consent is the threshold.
- **Refusal:** the audio-capture path is **unreachable** until a client-authored consent row
  exists for this session. Not a checkbox the practitioner ticks for the client.
- **Falsification (test must fail-closed):** attempt `startCapture()` with no consent row →
  throws / returns refusal; **zero** audio tracks opened, zero chunks uploaded. Attempt with
  a practitioner-authored consent row standing in for the client → still refused.
- **Grade A path:** capture function requires a `consentId` argument that can only be
  produced by the client-consent write endpoint; no default, no bypass constructor.

### R‑A2 — No Encounter write from a transport-only room
- **Invariant:** the Room is ephemeral transport; the Encounter is the only sink.
- **Refusal:** a Session Room that is not bound to an Encounter cannot persist anything. The
  Room writes *into* an Encounter; it never holds.
- **Falsification:** construct a room with peer/media state but no `encounterId` → any
  persist call (transcript, media, marker) refuses. Room teardown discards all transport
  identifiers (peer IDs, ICE candidates, room tokens); assert none survive in storage.
- **Grade A/B:** persistence layer takes `encounterId` as a required, non-null FK; there is
  no code path that writes a record keyed by a room/transport id.

### R‑A3 — No Memory from raw call state
- **Invariant:** Memory is *derived from* the Encounter — never from live/raw transport state.
- **Refusal:** memory creation refuses any source that is not a persisted Encounter record.
  Raw call state (live audio buffers, peer streams, in-flight transcript) is not a memory
  source.
- **Falsification:** call the memory-creation path with a live-room/raw-state handle →
  refuses. Only a committed Encounter (with its evidentiary layers, §2) is an admissible
  source. Guards against the layer-masquerade where raw audio is treated as reflection.
- **Grade A/B:** memory writer accepts only an `encounterId` of a committed Encounter; no
  overload accepts a stream/room handle.

### R‑A4 — Membership does not constitute Relationship
- **Invariant:** *Relationship invites membership; membership acknowledges an existing
  relationship — it never constitutes one.*
- **Refusal:** no code path creates a Relationship as a side effect of registration /
  membership. Membership may **bind to** an existing relationship (claim a guest side, §4);
  it may not **create** one.
- **Falsification:** run the membership/registration flow in isolation → assert zero
  Relationship rows created. Guest-claim flow → binds the new member to the *pre-existing*
  relationship/Encounter; asserts no new relationship minted.
- **Grade A/B:** registration service has no dependency on / no call into relationship
  creation; the claim path only updates ownership tokens on existing rows.
- *Note:* R‑A4 enforces a **governance CANDIDATE** (parent §7). The test can still exist; if
  the principle is later revised, the test changes with it. Documented so its status is
  honest, not smuggled in as ontology.

### R‑A5 — No third-party media routing unless explicitly authorized
- **Invariant:** sovereignty = control of signaling, relay, storage, lifecycle. A managed
  SFU/relay inside the media path puts a third party in the sacred field.
- **Refusal:** the default media path uses only self-hosted signaling + self-hosted TURN.
  Any third-party relay is refused unless an explicit, recorded authorization exists.
- **Falsification:** inspect the ICE/relay configuration the room hands to the peer
  connection → assert only self-hosted endpoints unless an `externalRelayAuthorization`
  record is present. No env var / config default silently enables an external relay.
- **Grade B:** config builder refuses to emit a non-self-hosted ICE server without the
  authorization record. (Grade A is impractical while WebRTC needs *some* relay config; the
  gate is the honest terminal grade.)

### R‑A6 — No speaker identity as fact before provenance
- **Invariant:** speaker attribution is observation/inference, correctable — never
  member-authored truth.
- **Refusal:** the system refuses to represent a speaker label as *fact* (e.g. surface it as
  authored, feed it to memory as identity) unless attribution carries provenance and a human
  has confirmed it. "Speaker 1 = practitioner" is a guess until confirmed.
- **Falsification:** auto-generated attribution → carries `authored_by = system` +
  observation `authority_class`; attempt to consume it as member-authored identity → refused.
  Only after human confirmation does its authority elevate.
- **Grade A/B:** attribution records are two-field-provenance stamped at creation; consumers
  may elevate authority only on a confirmation event, never reinterpret authorship.

---

## Status

All six are **PENDING** — specified here, none implemented. Phase A order of work:
1. For each refusal: add a registry entry to `docs/architecture/REFUSAL_REGISTRY.md` with its
   grade and hostile-fork note.
2. Write the falsification test in `tests/constitutional/refusal-registry/`; confirm it
   **fails** against a stub that lacks the guard (proves the test bites), then passes once the
   guard exists.
3. Only then build the corresponding capability (Constitutional Completion).

- **Proven:** nothing — specification only.
- **Not proven:** that any refusal is enforced; grades are *targets*, not achieved states.
- **Pending:** registry entries; falsification tests; then Phase A capability build. No push,
  no deploy.
