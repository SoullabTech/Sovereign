# AIN Semantic Primitives v0.1

**Status: CANDIDATE — not ratified.** No implementation is authorized by this document.
**Date:** 2026-07-29
**Governance lifecycle stage:** Candidate (→ Reconcile → Ratify → Living)
**Companion:** `AIN_VISUAL_LANGUAGE_CANDIDATE_2026-07-29.md` (the program this vocabulary serves)

---

## 0. Why this exists before any illustration work

An audit of member-facing surfaces (2026-07-29) found that AIN's visual system is not
under-built — it is **over-speaking without a vocabulary**. The same 2-second pulse
currently means four unrelated things:

| Meaning | Site |
|---|---|
| healthy / connected | `app/maia/page.tsx:1356`, `AskWidget.tsx:92` |
| loading | `app/maia/page.tsx:2114` |
| **recording in progress** | `components/maia/MaiaCapture.tsx:134` |
| critical / emergency | `app/labtools/EmergencyControls.tsx:62`, `GuardianStatus.tsx:110` |

"Breathing" is inverted between rooms: *idle presence* in `RoomHoloflower.tsx:136`,
*active listening* in `MaiaCenterField.tsx:51`. Loading has ~6 incompatible spellings
with no shared primitive.

The diagnosis, stated plainly:

> **AIN has a large amount of unauthored motion that actively misinforms.**

Illustrating an incoherent language beautifully makes the incoherence more persuasive,
not less. Semantics precede grammar; grammar precedes identity.

---

## 1. The admissibility gate

Every proposed semantic primitive passes through four layers **in order**. Design never
outruns governance.

```text
Proposed semantic primitive
        ↓
1. AUTHORITY TEST      — Who has standing to make this claim?
        ↓
2. EVIDENCE TEST       — What observable, member-originated evidence supports it?
        ↓
3. CONTESTABILITY TEST — Could a reasonable member say "No, that's not what happened"?
        ↓
4. VISUAL EXPRESSION   — Only now: colour, motion, typography, illustration.
```

### The one-question form

> **A primitive is admissible when it depicts an act that has an author.
> It is inadmissible when it asserts a state that has none.**

Operational test: *Could the member reasonably say "No, that's not what happened"?*
If yes, the primitive requires member-authored evidence or explicit confirmation before
it may exist at all.

### Why visual form raises the bar rather than lowering it

A sentence can be argued with. A recurring visual form that appears identically across
every studio becomes ambient and unmarked — it reads as a fact about the member rather
than a claim by the system, and it is therefore **harder** to contest. This is the
`CONSTITUTIONAL_DIRECTION_OF_AUTHORITY` constraint: authority moves upward through
authored experience and never manufactures higher-order meaning. Visual indirection
does not launder a violation of it.

---

## 2. Admissible primitives (v0.1)

Five primitives pass all four layers. Each depicts an act with a member author.

| Primitive | Authority | Evidence required |
|---|---|---|
| **Threshold** | Member | Member crossed a boundary (entered/left a room, opened/closed a session) |
| **Returning** | Member | Member came back to something they previously touched |
| **Carrying** | Member | Member explicitly moved something forward (a Keep, an adoption) |
| **Witnessing** | Member or named human | Someone observed or acknowledged; the witness is identifiable |
| **Release** | Member | Member intentionally released, completed, or let go |

**Each primitive must carry, before implementation:**
- one canonical meaning (never more)
- prohibited meanings it must never be reused for
- duration range and easing
- a reduced-motion equivalent that preserves the meaning without the motion
- a non-motion fallback (the meaning must never be motion-only)

**Not yet specified.** v0.1 ratifies the *set* and the *gate*. Per-primitive motion
specifications belong to Track C (Motion Grammar) and are deliberately absent here so
that vocabulary is agreed before behaviour.

---

## 3. Held primitives — ⛔ do not implement

These name developmental meaning the system has no standing to author. They are
**Cat-1 preserved direction**, not rejected ideas.

| Primitive | Why held |
|---|---|
| **Recognition** | The system cannot author recognition. A form that means "recognised" *everywhere* is a system-wide claim to name development. This is the frozen Patterns line. |
| **Becoming** | An interpretation of a person's development. No member authored it. |
| **Ripening** | Implies maturation the system cannot verify. |
| **Dormancy** | Asserts an internal state rather than an observable act. (Distinguish: "not touched since <date>" is an *observable fact* and may be expressible — "dormant" is an interpretation of it.) |

**Lift condition:** member-authored evidence sufficient to ground the claim, plus an
explicit founder ruling. Not lifted by improved visual craft.

**Related standing holds** (unchanged by this document): Coherence/Field wire-up
(`COHERENCE_FIELD_WIRE_UP_SPEC` §0.C), RFI/UFI, any member-facing "field state" or
"coherence" surface, and constellation/living-field navigation that renders inferred
relationships between member artifacts.

---

## 4. Consent-class signals — a separate and stricter class

Some signals are not semantic primitives at all. They are **consent states**, and they
inherit Sanctuary Invariant 4 (*the user must see unambiguous indication*).

**Recording** is the live instance. Its requirements:

1. **Unmistakable** — legible at a glance, without prior training.
2. **Unique** — its visual treatment is reserved. No other state may borrow it.
3. **Never confusable with "healthy"** — it must not share a treatment with any
   ambient/idle/connected indicator.
4. **Not motion-only** — meaning must survive `prefers-reduced-motion: reduce`.

The current implementation fails (2) and (3): `MaiaCapture.tsx:134` uses the same
`animate-pulse` as connection-health dots. **This is a live consent-legibility defect
and is not gated behind the rest of this document** (see Track A).

---

## 5. Utility states carry no semantic claim

**Loading, Error, Success** are machine states, not member states. They must be visually
disjoint from every primitive in §2 and from §4. Specifically:

- Loading must never use breathing (breathing is presence) or pulse (pulse is reserved).
- A single shared `<Loading>` primitive replaces the ~6 current spellings.
- Error currently renders as `text-red-400 text-xs` uniformly — no visual weight
  distinguishes a real failure from a validation hint.

---

## 6. Representation of MAIA — prohibition

> **MAIA may be represented through presence, light, relationship, field, voice,
> typography, or abstract phenomena, but not as a recurring anthropomorphic identity
> intended to become familiar.**

*(Founder wording, 2026-07-29, adopted verbatim.)*

Rationale: a recurring figure a member comes to recognise is attachment capture — the
vow refuses simulated intimacy and psychological bonding. Illustrating **members**,
**conversations**, **books**, **fields**, **journeys**, **relationships**, and
**symbols** remains fully available. Giving MAIA a body does not.

---

## 7. Asset provenance

Any generated visual asset committed to the repo carries sidecar metadata, on the same
discipline as `GIT_COMMIT` provenance and the S5 provenance work:

```yaml
origin:
  tool:         # e.g. ChatGPT Images
  model:
  created:      # ISO date
  prompt:
  edited:       # subsequent edit passes
  approved_by:  # human
  license:
```

**Scope note.** Generating assets that are then committed is development tooling
(same lane as the ratified multi-model workflow). **Runtime** image generation via an
external provider API is a provider-admission question governed by
`docs/canon/PROVIDER_GOVERNANCE.md` and is **not authorized** by this document.

---

## 8. Open rulings

| # | Question | Status |
|---|---|---|
| R1 | Is warm plum (`0dbc48e46`) sanctioned on arrival/threshold surfaces, narrowing the navy invariant — or is it scoped to sign-in/signup only? | **Founder ruling required.** Must be explicit enough that future auditors need not reconstruct intent from commit history. |
| R2 | Are the `community/*` wholesale `purple-500` themes drift, or separately sanctioned? | Open — likely distinct from R1 |
| R3 | Does Track A proceed ahead of Tracks B–D? | Founder indicated "already justified"; explicit go not yet recorded |
| R4 | Ratify the §2 admissible set and the §1 gate | Pending |

**Auditor's note on R1:** the audit found purple on `MaiaArrivalField.tsx:74` and
`ArrivalPrototypeShell.tsx:66-93`. It was **not** reported as a violation, because
commit `0dbc48e46` ("arrival re-tone — graduated field + warm-plum glass") is recent and
deliberate. Evidence of intentional change means the invariant may be narrower than
previously held. The correct output of an audit in that position is a ruling request,
not a correction.
