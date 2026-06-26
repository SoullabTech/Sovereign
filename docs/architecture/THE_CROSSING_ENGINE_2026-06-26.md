# The Crossing Engine — Constitution of the Shared Recognition Primitive

**Date:** 2026-06-26
**Status:** Architecture — **constitution** governing the shared `CenterOfInquiry` Crossing primitive. Governs **both** Field Notes (`center: person`) and Vision Studio (`center: project`). Cat-1 for the project-center instance; the person-center instance is **partly built** (see §10). **Candidate Conditions-of-Encounter canon** — flagged for steward ratification, not self-promoted.
**Reads with:** `docs/specs/FIELD_LAB_CONVERSATIONAL_INTERVIEW_SPEC_2026-06-26.md` (the person-center *implementation* spec), `PERSISTENCE_GOVERNANCE_ROOM_VS_PERSON_2026-06-25.md` (§9 scope), `PRACTICE_SOURCE_AND_TRANSLATION_STUDIO_2026-06-25.md`, `CAPTURE_BRIDGE_CONVERSATION_TO_STUDIO_2026-06-25.md`, `ARCHITECTURAL_TRANSLATION_STUDY_2026-06-25.md` (§10.3 emergence), `docs/adr/003-…`.
**Governed by:** `MAIA_SOVEREIGNTY_INVARIANTS.md`, `MARKETING_CLAIM_DISCIPLINE.md`.

---

## 0. Why this exists before (more) code
This constitution is the **why/invariants**; the per-instance build specs are the **how**. One instance — person-center — was already built in parallel (`FIELD_LAB…SPEC`, commit `9890793af`, "no persistence"), and it independently honors these principles. This document is the **shared layer above both instances**, so a single architecture — not two systems — governs Field Notes and Vision Studio.

## 1. The primitive
One architecture, two centers:

```
CenterOfInquiry = "person" | "project"
   Conversation → Proposal → Authorship → Crossing
```

- **Field Notes** = `CenterOfInquiry: person` — *"Who are you becoming?"*
- **Vision Studio** = `CenterOfInquiry: project` — *"What are we bringing into the world together?"*

The primitive comes **before** either instance claims it. (Refactor implication: extract the shared `CenterOfInquiry` engine so Field Notes and Vision Studio are *instances*, not parallel builds. Centering the *project* models the **work** — ontology-legitimate, `PERSISTENCE_GOVERNANCE` §3; centering the *person* is legitimate only because the output is **authored**, never an inferred model — §6.)

## 2. It is a recognition engine
Not an interview engine, not a journaling engine, not a memory engine. **Its only purpose: create the conditions in which a member recognizes something meaningful enough to willingly author it.** Everything else serves that moment.

## 3. The product
The product is **the member-authored crossing** — not the conversation, the transcript, or MAIA's reflections.

## 4. Stopping condition — recognition, not the clock
The conversation continues only while recognition is still emerging. It ends when **either**: (1) the member authors thread(s) they wish to carry forward, **or** (2) the member chooses to author nothing today. **Both are successful.** Two identical conversations may end at ten minutes or an hour — the crossing decides, not the clock. The engine must **never manufacture a crossing because a session occurred.**

## 5. Success — and the freedom that defines it
Success is measured **only** by whether an authored crossing genuinely occurred — never by length, engagement, completion, or number of threads proposed.

> **The member always remains free to leave with nothing. That freedom is part of the architecture.**

This is the operational peak of *waits-more-than-speaks* + *gift-not-fuel*, and the standing guard against engagement optimization. It is **measurable** via the person-center spec's instrumentation: **edit-rate** (precision — are proposals right?) + **origination-rate** (recall — do members still add their own?), active-acceptance only.

## 6. The field beneath is a field of *possibility*, not a model of the person
As the conversation unfolds there are many possible patterns; most fade, a few strengthen because the member returns to them, some dissolve because the member rejects them. **Nothing is real until co-authored.** A sculpture, not a database: revealed by removing the inessential; the member is the sculptor; MAIA illuminates where the next cut might be.

This **is the persistence framework re-expressed at the relationship scale** — transient internal richness is permitted *precisely because* nothing is reified or persisted as truth without authorship (`PERSISTENCE_GOVERNANCE` §8.1 promotion; §12.1 reification). It resolves the hidden-ontology tension: the field is not a secret profile; it is provisional candidates the member disposes.

**Therefore: zero background inference in the crossing.** No elemental tagging, no identity model, no developmental score *inside* C3 — that is unconsented model-building of the person (the scope gate, §9; *"adapt to the encounter, do not model the person"*). The person-center spec states this directly: *"C3 contains zero background categorization."* Elemental organization, longitudinal patterns, the living field — **earned later**, behind their own gates.

## 7. Emergence, and the governing design principle
*"Where two or three are gathered"* — something can become present in the encounter that neither party produced alone. This is a **relational** claim, not a possessive one. Emergence's authorship is **shared** (`ARCHITECTURAL_TRANSLATION_STUDY` §10.3), and the member **disposes** (keep / reshape / reject). So MAIA never claims *"I discovered your true self."*

> **MAIA does not reveal the member. MAIA creates the conditions in which the member's deeper coherence can reveal itself.**

Most meaningful insight, in good therapy, direction, or friendship, *becomes visible in the relationship* rather than being *given* by the other. The engine is modeled on that: **recognition, not discovery** — the authorship stays the member's.

## 8. The web and the mirrors (Vision-tier — earned later)
A life is not a list; it is a web where one thread changes the significance of others (Indra's net). But:
- **The web is not built by MAIA — it is revealed through the member's ongoing authorship**, and it is **earned only after** the single-session crossing proves itself. Cross-session / cross-arena synthesis is deferred (person-center spec: Model B).
- Any **MAIA-proposed** connection across sessions or arenas (*"today's grief and that decision five years ago…"*) is the **highest-risk operation** (cross-temporal surfacing, studio §7.1): **offer-not-assert, rare, candidate, follows-not-leads, member-inspectable/revisable/rejectable.** The member connects; MAIA at most offers a door.
- **The mirrors:** each arena (Field Notes=self · Vision Studio=work · Relationship · Family · Team · Sanctuary · Journey) reflects the same life from a different angle. **No arena owns the truth; each contributes evidence; no arena overwrites another.** Sanctuary's absoluteness (canon #6) holds — it contributes nothing it retains.

## 9. Developmental — grow up *with* the person, not ahead
For a developing person (e.g., a young member), the purpose is not to *discover* their purpose but to help them *grow into* it. **MAIA reflects only what has been lived, chosen, revised, and recognized — it never projects a destiny.** Threads are **retrodictive, never predictive.** The field is developmental — *"these are the possibilities you've been choosing into"* — not *"this is who you are."* The strongest reflection is the member's **own authorship trail** returned to them (*"you revised this three times before choosing these words"*) — autobiographical, not psychological. Guidance matures because the *person* deepens, not because MAIA grows more confident. Highest stakes for the young: never shape who they become; leave room for surprise (Meeting-People: no imposed telos).

## 10. The two instances + build order
- **Person-center (Field Notes)** — *partly built* (`FIELD_LAB…SPEC` + commit `9890793af`: the recognition interview room, **no persistence**; save + events + instrumentation and the threads migration are pending; **not yet audited for run-correctness / constitution-fidelity-in-code**).
- **Project-center (Vision Studio)** — *buildable, not built*: the same primitive with `center: project`, the project ontology (purpose / audience / offer / problem / promise / constraints / next experiments…) held as **quiet, transient candidates** surfaced only as offered threads the client authors. First scope: a single-session crossing → one authored project thread. Deferred (by this constitution): longitudinal project field, roadmap generation, task management, dashboard, persistent project memory, cross-session synthesis, maturity ratings.
- **Order:** the shared primitive is extracted/owned first; both instances answer to this constitution. Do not let Field Notes and Vision Studio drift into two systems.

## 11. Status
Constitution = governing principles, **candidate Conditions-of-Encounter canon** (steward ratification pending). The person-center crossing is partly built and aligned-on-paper (audit pending). Vision Studio is buildable on the primitive but unbuilt. The web, the living field, longitudinal/developmental-over-time reflection, and any elemental layer are **earned-later** — each behind its own gate, each resting on something the member has already claimed as their own.
