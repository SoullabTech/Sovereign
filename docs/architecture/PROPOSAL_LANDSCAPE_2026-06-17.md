# The Proposal Landscape

**Status:** Exploration / map — **Cat 1 (preserved direction).** Authorizes nothing. Grounded in a read-only substrate survey (2026-06-17). One vertical (calendar) is live-on-branch ([PR #477](https://github.com/SoullabTech/Sovereign/pull/477)); everything else here is *territory*, not commitment.

**Companion to** [`MAIA_CONSENT_GATES.md`](../canon/MAIA_CONSENT_GATES.md) (the constitution) — this is the breadth-map complementing the calendar depth-vertical. *"Approach B."*

---

## 0. What this is

The calendar loop proved the *pipe*: `propose → edit → consent → execute → write`, with tools structurally unable to act. This document maps **everything else that pipe can carry** — every candidate proposal type, scored by what substrate already exists, mapped onto the consent-gates frame (faculty · tier · window · executor · governor).

The point is to choose deepening order with the whole territory visible — and to refuse building what already exists.

---

## 1. The frame (from the constitution)

- **Two surfacings:** Field Note (attention, resting) · Proposal (attention + latent action + consent gate, excited).
- **Three faculties** (one consent vow each): **Memory** (retain — Sanctuary) · **Attention** (notice — Externalization) · **Action** (enact — Proposal gate).
- **Three governors of escalation:** Standing · Scarcity · Window. `FieldNote → Proposal iff Standing ∧ Scarcity ∧ Window`.
- **The discriminator:** *no window → it can only ever be a Field Note.* This splits the landscape (below) more than anything else.
- **Externalization:** read what the member externalized (calendar, tasks, messages, notes); never watch the person.

---

## 2. The Action-faculty landscape (propose → confirm → execute → write)

Readiness: **LIVE** (shipped) · **SURFACE** (substrate live; needs only the propose/confirm wrapper) · **BUILD-DEPLOY** (built but dark) · **BUILD-NEW**.

| Proposal | Trigger (example) | Tier | Window | Executor target (exists?) | Readiness |
|---|---|---|---|---|---|
| **calendar_event** | "schedule lunch with Nathan" | 1 | event-anchored (computable) | `calendar_events` ✓ | **LIVE** (PR #477) |
| **task** | "remind me to finish the deck" | 1–2 | event-anchored | `focus_tasks` ✓ (live) | **SURFACE** |
| **reminder** | "nudge me to follow up" | 1 | decay/event | `focus_reminders` ✓ (email live; push/in-app scaffold) · session-reminders ✓ (Twilio SMS/WhatsApp/Telegram) | **SURFACE** |
| **message** | "text Nathan the time" | 1 | decay (social latency) | SMS/email/in-app DM defined; **no unified `send_message`** | **SURFACE + BUILD** (executor glue) |
| **reach_out** | "you mentioned Sophie 3×" | **3** | decay | needs a **mention-fact store** | **BUILD-NEW** |
| **practice** | "you've been circling grief" | **3** | *windowless* → resting | practice library + `routePractice` ✓; `ea_practice_events` (post-hoc); StateCard surfaces read-only | **SURFACE + BUILD** (continuity table) |
| **protect_time** | "protect Thursday recovery" | **3** (artifact-derived: packed calendar) | event-anchored | reuse `calendar_events`; intent substrate (`trajectory_focus`, `member_energy_state`) ✓ | **BUILD-NEW** (time-blocking) |
| **project** | "this idea keeps recurring" | 2–3 | *windowless* → resting | no `studio_projects` (cousins: `studio_changes`, `studio_decisions` ✓) | **BUILD-NEW** |

**Relationship signal detection is already LIVE** (`member_relational_signals`, `detectRelationalSignal`) — the *input* for message/reach_out exists; the *propose→act* layer doesn't.

---

## 3. The Memory-faculty landscape (consent-to-retain; sibling to Sanctuary)

| Proposal | Trigger | Tier | Executor target (status) | Readiness |
|---|---|---|---|---|
| **keep** | "shall I keep this?" | 2 | `member_memory_atoms` (**Cat 6 LIVE** — currently a *gesture*) | **SURFACE** (wrap gesture as proposal) |
| **breakthrough** | "did this feel like a breakthrough?" | 2 | `is_breakthrough` flag (**Cat 6 LIVE** — currently a *flag*) | **SURFACE** |
| **remember (episodic)** | "remember this?" | 2 | `episodic_memories` (**Cat 3** — producer dark, recall unwired) | **BUILD-DEPLOY** — *the threshold gate* |
| **field_note** | "this feels alive — hold it?" | 1–3 | no member field-note table (`field_*` are collective infra) | **BUILD-NEW** — *the keystone* |

**Two structural notes:**
- **Field Note is the resting state of the whole primitive.** Building it = building the attention surface every declined Proposal de-escalates *to*. It's not one proposal among many; it's the floor.
- **Keep & Breakthrough are already Cat 6** — wrapping them as proposals is surface engineering, not substrate work. The Memory faculty is the furthest along.
- **Episodic gates the continuity story** (per the constitution): until it ships, "MAIA remembers a life unfolding" stays metaphor.

---

## 4. The governor / covenant layer (the invisible constitution) — mostly greenfield

| Governor | What exists today | Net-new |
|---|---|---|
| **Standing / Grants** | binary consent toggles: `conversational_recall_enabled`, `astrology_consent`, `storage_consent` (`/api/members/recall-preferences`) — the **seed** | `member_standing_grants` (domain-scoped, revocable, **decaying**) |
| **Scarcity** | — | rate/consent-fatigue enforcement |
| **Window** | computed for calendar (`event − lead`) | schema for non-computable windows |
| **Covenant** (Ganesha ADHD "single named support covenant") | design-only | `member_covenants` (named pattern → bundled scoped grants) |
| **Sanctuary** | documented memory-consent gate | audit runtime enforcement |

**The consent toggles are the primitive form of standing** — domain-scoped binary consents. The grant system generalizes them into named, revocable, decaying covenants.

---

## 5. The load-bearing split: reactive vs. proactive

This is the most important line in the landscape:

```
REACTIVE  (user asks → MAIA proposes)   needs NO governor layer.
PROACTIVE (MAIA notices → proposes)     needs the WHOLE governor layer first.
```

- Every **reactive** vertical in §2–§3 (calendar, task, reminder, message, keep, breakthrough…) is buildable **today**, cheaply, with zero new governance — they're propose/confirm wrappers over live substrate.
- Every **proactive** ("you mentioned Sophie", "protect recovery", "you've been circling grief") requires Standing + Scarcity + Window + (for ADHD) Covenants — the §4 greenfield — *and* the externalization filter (§6).

**So the territory has two halves**: a cheap reactive harvest, and a foundational proactive build. They are not the same project.

---

## 6. The externalization filter on Tier-3 (what stays frozen)

The dormant Tier-3 services — `QuantumFieldMemory`, `CoherenceFieldService`, `SomaticMemoryService`, `MorphicPatternService` (Cat 3/4) — are **person-watching** candidates. Per Art. 3 they mostly **stay frozen**: lawful Tier-3 is *artifact-derived* (packed calendar → "protect recovery"; mention history → "reach out"), never continuous observation of the person. The landscape does not route proposals through these services.

---

## 7. Implied deepening paths (options, not authorized)

- **Cheap reactive harvest** (fastest proofs, same pattern as calendar, no governance): `task`, `reminder`, `keep`, `breakthrough`. Each ≈ a propose tool + confirm route + executor over existing live tables.
- **Threshold path**: deploy episodic producer → wire recall → `propose_remember`. Unlocks continuity claims.
- **Keystone**: build the member **Field Note** — the resting surface the whole primitive needs.
- **Foundation** (gates all proactivity): the governor layer (§4) — Standing/Scarcity/Window/Covenant — starting from the consent-toggle seed. Required before any "you mentioned Sophie" proposal is lawful.

Each path inherits the proven pipe and the constitution's enforcement (Art. 8: structural where possible, legible otherwise, never promise-only).

---

## 8. What this map deliberately does NOT do

- Authorize any build (it's a map; each vertical is its own explicit go).
- Route any proposal through person-watching (Art. 3).
- Treat windowless observations as timed proposals — practice/keep/project/field-note are **Field-Note-resting offers**, escalated by the member, not pushed.
- Collapse reactive and proactive into one effort.

---

## 9. The centrality loop (the dynamics) — and its one guard

§1–8 is static topology. The dynamics that would turn it into a roadmap:

**Reservoirs create the conditions under which outlets become intelligent** (stronger than "more important"). Without a reservoir a proposal is *transactional* (current turn → propose → execute). With one it is *developmental* (accumulated attention → current moment → propose): the action answers the person's unfolding continuity, not merely the request. That is the architectural line between an **assistant and a companion** — and the answer to the founding question (the screenshot): outlets alone make a very good assistant; reservoirs are what make it more than a chatbot.

Field Note and Episodic are **one reservoir at two timescales** (synchronic / diachronic). The continuity "threshold" is the moment enough has accumulated that continuity can be *perceived* — dimensional, not categorical.

The loop:

```text
PERSON → externalizations → { reservoirs · outlets } → harvest marks (keep / breakthrough)
       → centrality observation (where attention accumulates) → informs future topology
```

Reservoirs are not central because they are philosophically privileged. They become central **iff members repeatedly externalize them as central** — empirical, not design. The instrumentation inherits the Externalization Principle: significance is not inferred, it is *observed being declared*.

**The one guard (the loop's only failure mode): instrumentation must MEASURE, never OPTIMIZE.** The instant "centrality informs topology" becomes "maximize the centrality signal," keep/breakthrough stop being sensors and become KPIs — the engagement engine returning through the back door, wearing the member's own marks as the target. Members' marks tell you where to deepen *for them*, never how to extract more marks. The tell that you've crossed it: A/B-testing a surface to raise keep-rate. *"What becomes alive?"* must mean alive **for the person**, never alive **as a metric** — a system optimizing for keeps would score maximally "alive" by this very loop while violating *"reduce the system's psychological centrality over time."*

**Division of labor (why this is the stopping point):**

```text
Topology    → what could exist?    complete before anyone arrives  → permission to BUILD
Observation → what becomes alive?  earned only after people walk it → permission to PRIORITIZE
```

The map gives permission to build — the one move that doesn't force the sequence is the **sensors** (keep/breakthrough harvest), which expand the proven pattern *and* instrument the Field. Observation gives permission to prioritize. The next meaningful input is not reasoning; it is watching what members choose to keep.
