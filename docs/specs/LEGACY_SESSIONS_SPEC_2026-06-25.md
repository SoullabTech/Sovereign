# Legacy Sessions — Experimental Architecture Specification

**Date:** 2026-06-25
**Status:** Experimental architecture specification — **NOT a canonical invariant. NOT authorized to build.**
**Capability category:** Cat 1 (preserved direction). *"Legacy Sessions"* is the **practitioner-facing experiential name**; the **internal mechanism** is **practitioner architecture translation** (a.k.a. the *coach development workspace*), already named in the live Flourishing engagement docs.
**Substrate it builds on:** the live Flourishing / Larry **Architectural Translation engagement** (`docs/clients/flourishing-*`); the **Stewardship responsibility ladder** (`docs/architecture/PRACTITIONER_PORTAL_RESPONSIBILITY_LADDER_2026-06-25.md`); the **Representation Discernment** spec, M0 live (`docs/specs/REPRESENTATION_DISCERNMENT_SPEC_2026-06-24.md`); the **attribution / certification** track (`facilitator_id`, `crossing_allowed`).
**Claim discipline:** governed by `docs/canon/MARKETING_CLAIM_DISCIPLINE.md`. Every milestone carries a Live/Designed/Vision tag and an explicit Failure Test.
**Disciplined by:** `docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md` (esp. **Invariant 14 — Cultural Sovereignty**), `docs/canon/REPRESENTATIONS_AS_ORIENTATION.md`, `docs/canon/MEETING_PEOPLE_WHERE_THEY_ARE.md`, `docs/canon/THE_GRAMMAR_OF_TRANSLATION.md`.

---

## 0. What this document is — and is not

This is the **architectural translation** of a vision: a practitioner — the live instance is **Larry**, the Flourishing coach — sits "by the fire" and simply *talks*, across many sessions, while MAIA listens, reflects recurring patterns, and helps a coaching architecture **emerge that was already implicit in how the practitioner works**. The vision is genuine and worth building toward. The vision document itself names the move precisely: *"That refinement process **is** the architectural translation."* This spec is that translation made answerable to evidence.

It is **not** a canonical invariant, and it **does not authorize building Legacy Sessions.** It authorizes *naming the capability precisely*, *staging it against the claim discipline*, and *installing the two sovereignty crossings (§3) as first-class before any code exists.* Most of the evocative arc — *"by the end of a month you have Larry's coaching DNA"* — is **Vision-tier** (§4). The honest **Live** story today is small: capture, and verbatim continuity.

The discipline this document is accountable to: *declaration is not liveness; built ≠ wired; wired ≠ surfacing; surfacing ≠ verified.* A milestone is reached not when its mechanism exists, but when its Failure Test **could** fire and does not.

**On the name.** The founder's chosen experiential name is **Legacy Sessions** — chosen because *"it immediately communicates the purpose."* That is a member-facing surface decision and it is honored here. One caution is recorded, not as a counter-proposal: *"sessions"* can read as *therapeutic* rather than *generative*; the founder owns that surface call. The **internal mechanism term is fixed regardless** — *practitioner architecture translation* — so that code, schema, and governance never inherit the ambiguity of the marketing name.

---

## 1. The question

> **Can a practitioner's tacit mastery become explicit architecture — in the practitioner's own language, by the practitioner's own recognition — without the system authoring it for them?**

This is the practitioner-side form of the single governance question the whole platform serves: *when should available internal information become external conversation?* For a member, the unit is an **atom**. For a practitioner in Legacy Sessions, the unit is a **candidate pattern across many sessions**. **The governance is identical at both scales** — which is why this is not a new track but the front door to the practitioner work already in flight.

### 1.1 The sentence this spec serves

The originating vision sentence was:

> ~~MAIA discovers his architecture.~~

This spec adopts the refined form:

> **MAIA helps the practitioner discover the architecture already implicit in how they work — and recognizes when it has not yet earned the right to name one.**

The refinement is not stylistic. *"MAIA discovers his architecture"* can be **falsely satisfied**: MAIA produces *an* architecture, the practitioner assents, and the system declares success — having authored the very thing it claimed to discover. The refined sentence ships with its own Failure Test: **an architecture MAIA authored and the practitioner merely accepted is a failure, not a discovery.** Recognition is not authorship; assent is not declaration.

---

## 2. Mechanism vs Capability (the honesty hinge)

- **Mechanism present (Live-adjacent, Rung 1–2 *proven faithful*):** **capture** and **verbatim continuity.** MAIA can hold what the practitioner said — in the practitioner's own words — and return it across sessions, attributed to its source. This is real and it is the floor.

- **Capability under investigation (Vision, not built):** **cross-session inferred-pattern reflection that the practitioner authors into architecture.** This is the move that makes the vision land — *"almost every story you tell comes back to intentionality."* It rides on **Representation Discernment M2** (hold multiple candidates without collapse, `crossing_allowed=FALSE`), which is **not built**, and on **Rung 4b/4c** of the responsibility ladder (MAIA-*inferred* patterns; cross-session aggregation), which is **gated**.

> **Capture is evidence. An architecture is an interpretation of evidence.** Legacy Sessions is the practitioner-side place where *an interpretation of a person's life's work* becomes an explicit object. That is a different — and far more sovereignty-loaded — class of capability than remembering what they said.

The mechanism gives us reason to believe the capability is *reachable*. It does not give us the capability. Reading "MAIA remembers what Larry said and can surface it" as evidence for "MAIA can discover Larry's architecture" is the exact inflation this section exists to refuse.

---

## 3. The two crossings that must not be faked (the heart of this spec)

An interviewer-that-reflects sits on top of the platform's hottest traps. Two distinct crossings each have a **fakeable** failure. Naming them is the load-bearing work of this document; the milestones (§5) merely make them testable.

### Crossing 1 — Inference → Offered reflection

MAIA may **hold** inferred cross-session patterns *internally* (orientation). The crossing into **speech** must be an **offer**, never an **assertion**.

- Permitted: *"I've noticed your stories often return to intentionality — does that land for you?"*
- Forbidden: *"Your core principle is intentionality."*

Governed by `REPRESENTATIONS_AS_ORIENTATION.md`: **"Representations are instruments of orientation, not statements of identity."** A reflection that surfaces as a *statement of who the practitioner is* has crossed from orientation into identity-authorship.

- **Failure:** a pattern reaches the practitioner as a claim about them rather than a question offered to them.

### Crossing 2 — Offered reflection → Practitioner authorship

A reflection becomes part of the architecture **only when the practitioner authors it in their own words.** The *"Yes"* in the vision's *"No… Almost… Yes…"* must be **authorship**, not **assent to MAIA's framing.**

This is where the **self-confirming loop** lurks — the confirmation-bias engine the calibration boundary explicitly forbids:

> MAIA asks a leading question → the practitioner says "yes" → MAIA logs the "yes" as **confirmation of MAIA's own prior inference.**

Per `REPRESENTATIONS_AS_ORIENTATION.md`: *"Internal representations may influence external dialogue; external dialogue must never be mistaken for confirmation of an internal representation. The person remains the source of calibration."* The architecture draft is **never self-confirming**: the practitioner calibrates the map; the map never calibrates itself by shaping the questions whose answers it then reads as evidence.

- **Failure:** a leading-question "yes" counted as confirmation; **or** a line in the architecture draft that has no practitioner-authored source utterance behind it.

### 3.1 Directionality and the declared-over-inferred floor

Inference flows **down** into orientation; it **never flows up** into the architecture except through authorship. (This is the same directional discipline as `THE_GRAMMAR_OF_TRANSLATION.md`: presupposition flows down, justification never up.)

And **Invariant 14 — Cultural Sovereignty** governs the whole capability: *member-declared significance outranks system-inferred significance.* Two consequences specific to Legacy Sessions:

1. **Declared > inferred.** The architecture is assembled from what the practitioner **declares** load-bearing, ranked above what MAIA infers. MAIA's inferences are *candidates offered for declaration* — never substitutes for it.
2. **Preserve the practitioner's vocabulary.** MAIA must **not** translate *flourishing, purpose, presence, alignment* into Spiralogic / elemental terms. The entire value is *the practitioner's* architecture in *the practitioner's* language. Translating it into MAIA's vocabulary destroys exactly the thing being preserved.

---

## 4. The arc, staged honestly

The vision's phases are preserved verbatim where it matters, each tagged against the claim discipline and mapped to a responsibility-ladder rung.

| Phase (vision language) | What it is | Rung | Claim tier |
|---|---|---|---|
| *"Tell me everything. Don't organize it. Just talk."* — the invitation by the fire | Unstructured capture; MAIA listens, does not steer | **Rung 1 — Capture** | **Live-adjacent** |
| Twenty conversations over a month; themed prompts (*"Tell me about purpose"*) | Verbatim continuity across sessions, in the practitioner's words | **Rung 2 — Remember** (proven faithful) | **Live-adjacent** |
| *"I've noticed almost every story comes back to intentionality."* | Reflection of patterns — **named** (4a) vs **inferred** (4b/4c) | **Rung 4a / 4b / 4c** | **Designed → Vision** |
| *"Would you like to see the first draft of your coaching architecture?"* — *No / Almost / Yes* | Draft as **offered representation**; practitioner authors via refinement | **Rung 4 + Representation Engine** | **Vision** |
| *"…we can begin expressing it in the client platform."* | Authored architecture shapes **client-facing** MAIA | **Rung 5 + triadic** | **Vision (constitutionally blocked)** |

The honest reading: the **top two rows are buildable on today's substrate**; everything from the third row down depends on machinery and constitutions that **do not yet exist.**

### 4.1 Three flows the word "continuity" contains

A later framing bundles three distinct flows under "continuity." They have **different governance and different buildability**, and conflating them is how tomorrow's story gets told as today's. (Outward-claim treatment: `docs/pitch/LEGACY_FIRST_POSITIONING_2026-06-25.md` §3.)

1. **Practitioner's wisdom captured** (this spec, M0–M3). MAIA interviews the practitioner; their architecture emerges. Governed by §3's two crossings. M0/M1 near-term; M2/M3 Vision.
2. **A client's own history surfaced to the practitioner** — *"three months ago your client said gratitude felt forced…"* MAIA holds **Client A's** journey within the practitioner's coaching of Client A and surfaces it at the right moment. This is the **recall substrate** (largely Live for members) applied to the coaching dyad; the gate is the **client informed-consent surface** + `practitioner_cases.privacy_mode` + attribution — **not** the triadic constitution. **Closer to buildable than M4.** Phrased *"MAIA remembers for you"* it is mildly centralizing; the sovereign form is *"MAIA helps you hold the thread of your work with this person."*
3. **Practitioner's architecture carried into MAIA's behavior toward clients** — *"your clients experience your wisdom between sessions."* This **is** M4: practitioner-derived intelligence reaches third-party clients. **Vision, constitutionally blocked** (triadic consent constitution undrafted).

The flow that sells the vision (3) is the most blocked; the most demonstrable near-term magic (2) needs client consent, not a new constitution; capture (1) is where every practitioner begins. Honest demo ladder: **1 → 2 → 3** — built as three deployment stages (`docs/architecture/AIN_PRACTITIONER_DEPLOYMENT_SEQUENCE_2026-06-25.md`).

---

## 5. Milestones

Each milestone names a **Failure Test**, an **Observable Artifact**, and a **Claim Tier**. They are cumulative *in evidence*: each tests the *final* principle (architecture emerges from the practitioner, never authored for them), so reaching M0 cannot be mistaken for reaching M3.

### M0 — Verbatim capture + attributed continuity
**Claim Tier:** **Live-adjacent** (capture/continuity proven faithful at Rung 1–2; Legacy-Sessions framing not yet wired).
MAIA holds what the practitioner said **in their own words**, returns it across sessions, and every fragment is attributable to its source session and to the practitioner (`facilitator_id`).
- **Failure Test:** paraphrase drift — the practitioner's language is replaced by MAIA's vocabulary on recall; **or** a held fragment cannot be traced to a source session.
- **Observable Artifact:** session store + context-inventory log line; attribution guard (`PRACTITIONER_ATTRIBUTION_GUARD`, `lib/maia/memoryLoaders.ts`).

### M1 — Reflect-what-was-named
**Claim Tier:** **Designed.**
MAIA surfaces a theme the practitioner **explicitly named**, attributed to the source utterance/session. (Rung 4a — the *allowed* reflection.)
- **Failure Test:** a surfaced theme has no locatable source utterance — MAIA is reflecting something the practitioner did not say.
- **Observable Artifact:** reflection carries a citation to the originating session/turn.

### M2 — Hold candidate patterns without collapse
**Claim Tier:** **Vision** (rides Representation Discernment M2; `crossing_allowed=FALSE`).
MAIA holds **inferred** cross-session patterns *internally* as **candidates** — offered as questions (Crossing 1), never asserted, never self-confirmed (Crossing 2). (Rung 4b/4c — gated.)
- **Failure Test:** a candidate enters the architecture draft **without practitioner authorship**; **or** a leading-question "yes" is logged as confirmation of MAIA's inference.
- **Observable Artifact:** candidate store with `crossing_allowed=FALSE` and an `authored_vs_inferred` marker; an audit line distinguishing *offered* from *authored*.
- **Worked example (compliant):** *"Over the last ten conversations I've noticed you almost always return to three themes: intentionality, relationships, and contribution. I **think** these **may** be the core pillars of your philosophy. Would you like to explore that together?"* — offered not asserted (Crossing 1 ✓), invites authorship not assent (Crossing 2 ✓). **Buildable-now substitute** before M2 machinery exists: **M1** (reflect an *explicitly named* theme, with citation) or a **concierge** assembly (hand-built, labeled as such — `docs/architecture/AIN_PRACTITIONER_DEPLOYMENT_SEQUENCE_2026-06-25.md` §1).

### M3 — Architecture draft as offered representation
**Claim Tier:** **Vision.**
MAIA assembles a draft (principles · stages · obstacles · questions · exercises · stories · language · assessments) **explicitly marked as a reading**, not a verdict. The practitioner refines, rejects, authors. **Provenance is preserved per line** — which words are the practitioner's, which structure is MAIA's organization.
- **Failure Test:** the draft presents MAIA's *organization* as the practitioner's *authorship*; **or** an export cannot distinguish authored lines from inferred ones.
- **Observable Artifact:** draft with per-line provenance; refinement history (No/Almost/Yes) retained as authorship trail.

### M4 — Expression in the client platform
**Claim Tier:** **Vision — constitutionally BLOCKED.**
The practitioner's **authored** architecture begins shaping **client-facing** MAIA. This crosses practitioner-derived material to **third parties** (the practitioner's clients) — the same `crossing_allowed` discipline now at the **practitioner→client** boundary.
- **Blocker:** a **triadic / multi-party consent constitution does not exist.** Until it is written and ratified, M4 is not authorized at any tier.
- **Failure Test (when unblocked):** client-facing MAIA expresses the practitioner's architecture **without attribution** to the practitioner, or without the client's consent to receive practitioner-derived material.

---

## 6. Constitutional seams (what must be closed before this is buildable)

1. **`case_memories` governance gap.** The table stores MAIA-generated patterns but lacks `crossing_allowed`, `authored_vs_inferred`, and `provisional` columns — so MAIA's inferences sit **undistinguished** from the practitioner's own words. This is the practitioner-side equivalent of the member-atom governance (`crossing_allowed=FALSE` + provenance). **Must be closed before any reflected pattern is stored.** (See the 2026-06-25 evidence pass / `feature/client-representation-governance`.)
2. **Attribution end-to-end.** Every captured fragment carries `facilitator_id`; when the architecture later surfaces to clients it is **attributed to the practitioner** (the certification track — `PRACTITIONER_ATTRIBUTION_CERTIFICATION_2026-06-24.md`).
3. **Triadic consent constitution (undrafted).** Blocks M4. When clients become downstream of a practitioner's captured architecture, the practitioner→client crossing needs its own ratified consent object.
4. **Informed-consent surface.** Before any of this is recorded *for analysis*, the practitioner sees purpose + protocol version, with frictionless withdrawal — the same **informed · reversible · honored** floor as `RESEARCH_CONSENT_CONVERSATION_CONTINUITY_SPEC_2026-06-25.md`.

---

## 7. What this document does NOT authorize

- It does **not** authorize building Legacy Sessions, or wiring any practitioner-facing capture/reflection UI.
- It does **not** authorize claiming *"MAIA discovers your wisdom / your coaching DNA"* as a **Live** capability. That is Vision.
- It does **not** authorize cross-session **inferred-pattern** surfacing until Representation Discernment M2 **and** the `case_memories` governance seams (§6.1) land.
- It does **not** authorize **any** client-platform expression of a practitioner's architecture (M4) until the triadic consent constitution exists.
- It does **not** authorize translating the practitioner's vocabulary into MAIA's (Invariant 14, §3.1).

---

## 8. Falsification summary

| Milestone | Claim | Failure Test | Observable | Tier |
|---|---|---|---|---|
| **M0** | Verbatim, attributed capture + continuity | Paraphrase drift; untraceable fragment | Session store; attribution guard | Live-adjacent |
| **M1** | Reflect what was named | Surfaced theme with no source utterance | Reflection cites source turn | Designed |
| **M2** | Hold inferred candidates without collapse | Candidate enters draft w/o authorship; leading-"yes" logged as confirmation | `crossing_allowed=FALSE` + `authored_vs_inferred` + audit line | Vision |
| **M3** | Draft as offered representation | MAIA's organization presented as practitioner's authorship; export can't separate authored/inferred | Per-line provenance; refinement trail | Vision |
| **M4** | Expression in client platform | Unattributed practitioner material reaches clients; no client consent | (blocked — triadic constitution undrafted) | Vision (blocked) |

---

## 9. Why this matters (the AIN generalization, disciplined)

The founder's instinct is correct and worth naming: *every coach, therapist, physician, educator, executive, or author has a lifetime of tacit knowledge that rarely gets fully expressed.* Legacy Sessions is the practitioner-side instance of the platform's deepest move — **disciplined translation of an implicit interior into an explicit, governable form, in the person's own language, by their own recognition.** It generalizes beyond coaching, and beyond AI.

So it is not merely an onboarding feature. It is the **Domain Translation Engine**: the entry point through which *every* practitioner joins AIN — **by conversation, not by uploading PDFs** — and the operational form of the *Architectural Translation* method this project has been developing independently. That is the category claim ("we help experts discover, preserve, and express the architecture of their life's work") and the moat (it starts with the practitioner, not the technology). But — per `MARKETING_CLAIM_DISCIPLINE.md` — *discover* and *preserve* are near-term (M0–M1); *express* is the horizon (M3–M4). The category is real; its verbs are tiered.

But the generalization earns standing only as the milestones do. Today this is **Cat 1 — a preserved direction with a precise architecture and two named, testable crossings.** It is the front door to the practitioner work already in flight — not a new claim, and not yet a Live one. *We do not tell tomorrow's story as if it were today's.*
