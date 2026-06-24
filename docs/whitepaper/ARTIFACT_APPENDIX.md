# MAIA Founder Whitepaper — Artifact Appendix (Evidence Ledger)

**Version:** 0.1
**Date:** 2026-06-02
**Status of this document:** Working ledger. Precedes the whitepaper draft by design.

---

## Purpose

This appendix is the evidence base for the MAIA Founder Whitepaper. The paper is permitted to make a claim only where this ledger can back it — with a named artifact, a real path, and an honest status. Where an artifact cannot yet carry a claim, that is recorded *here, in the same table as the ones that can.*

The reason for building this first is structural. It determines whether the paper documents a **pattern of behavior** or merely expresses **aspirations**. For the intended skeptical reader, the difference is everything.

### The recursive principle

This ledger obeys the status discipline it documents. It does not inflate. It marks its own not-yets. A reader should be able to watch the project distinguish *shipped* from *planned*, *built* from *surfacing*, *observed* from *interpreted* — in real time, in this file.

That behavior — not the architecture — is the evidence the paper is actually offering.

The paper therefore never says *"MAIA is a fundamentally different path."* It says: *MAIA emerged from the same technological lineage that produced engagement optimization, persuasive design, and increasingly agentic systems. The question is not whether those trajectories exist, but whether alternative design constraints can be made operational. The project began not with capabilities but with prohibitions.* — and then points here.

### Status legend

| Tag | Meaning |
|-----|---------|
| **CANON** | Binding constitutional text. Violations are invalid regardless of technical merit. |
| **DOCTRINE** | Operational discipline in active use by the team. |
| **LIVE** | Has production runtime receipts. |
| **WIRED** | Built and connected; surfacing or verification still pending. |
| **BUILT** | Exists in repo; not yet deployed or wired to a live path. |
| **HELD** | Preserved direction; explicitly *not* authorized. The "does not authorize" language is itself a constraint. |

Liveness is never assumed. The project's standing distinction: *declaration is not liveness; built ≠ wired; wired ≠ surfacing; surfacing ≠ verified.*

---

## Section A — Governance artifacts
*Documents that limit claims and constrain interpretation. Written for the team, before any external audience existed. That provenance is why they function as evidence rather than marketing.*

| Artifact | What it is | Path | Claim it can carry | Status |
|----------|-----------|------|--------------------|--------|
| **The MAIA Oath** | The irreducible standard. First-person vows: *"I exist to support, not to substitute… I do not optimize for engagement over sovereignty… I serve the person, not the model."* | `docs/canon/MAIA_OATH.md` | The system holds a binding self-limitation against substitution, attachment, and engagement optimization. | CANON |
| **MAIA Canon v1.1 — Absolute Prohibitions** | Enumerated prohibitions: MAIA must never persuade; never optimize for convergence; never model or reinforce enemies. *"Even when persuasion appears benevolent, it is forbidden."* | `docs/canon/MAIA_CANON_v1.1.md` | Persuasion and convergence-optimization — the core mechanisms of the trajectories the reader distrusts — are prohibited at the constitutional layer. | CANON |
| **Sovereignty Invariants for Relationship** | Constitutional constraints on *relational power* — what happens once the system is good enough that people start relating to it. Invariant 1 (Authority Return): the center of knowing must end closer to the user. Invariant 2 (No Exclusive Bond). | `docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md` | The project anticipated relational gravity and constrained it *in advance*, not after harm. | CANON |
| **The Spiral of Risk** *(within Invariants)* | Names the specific progression the invariants defend against: Center Dilution → Unearned Bond → **Builder Capture** → Mission Drift. Explicitly names *the founder protecting the being instead of the mission* as a failure mode. | `docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md` | **The strongest single artifact for this reader.** The team has named and instrumented against its own capture. This is the mechanism that constrains the vision from becoming what it opposes. | CANON |
| **FIS Field State Primitive** | A canonical primitive with *no runtime authority* — an interface target deliberately kept out of the live decision path. | `docs/canon/FIS_FIELD_STATE_PRIMITIVE.md` | The project distinguishes canonical concepts from runtime power, and declines to grant authority it hasn't earned. | CANON (Cat 2: primitive, no runtime authority) |

---

## Section B — Operational doctrines
*Disciplines that force the team to earn conclusions rather than assume them. These are how the constraints in Section A are kept honest day to day.*

| Doctrine | What it does | Where it lives | Claim it can carry | Status |
|----------|-------------|----------------|--------------------|--------|
| **Six-category artifact typology** | Sorts every component into: preserved direction / canonical primitive / built substrate / dormant service / frozen plan / live runtime authority. Collapsing categories 1–5 into 6 is the named "inflation drift." | `CLAUDE.md` §State of the system; session memory | The project has a working vocabulary that *prevents* the conflation of vision with capability. | DOCTRINE |
| **Three verification ladders** | Inference (observation→capability, stop at earned rung) · Liveness (built→wired→surfacing→verified) · Action (capability→availability→initiative). A feature is evaluated against all three. | `docs/architecture/*`; session memory | Claims are graded; the system refuses to skip rungs it hasn't earned. | DOCTRINE |
| **Evidence-type substitution** | The unified diagnostic for *both* inflation and deflation drift: every drift is answering one question's axis with another axis's evidence-type. Governance questions are unqueryable — the next receipt is a declaration, not a discovery. | session memory; substrate work | The project polices its own over- *and* under-claiming with a single rule. | DOCTRINE |
| **Interface Humility guardrail** | Named consolidation of epistemic canon into a standing prompt rule + a deterministic (non-LLM-judge) evaluator. *Do not collapse the interface into the reality* — applies equally to astrology, symbol, memory, dashboards, CSAT. | commit `57c7e9e70`; `appendAllContextAddenda` | The non-totalizing posture is enforced mechanically, not just stated. | DOCTRINE + partial LIVE |
| **Differentiation before synthesis** | The project's non-negotiable: preserve polyphonic differentiation before any convergence. Build rests on the testable operational claim, not the metaphysical one. | `docs/architecture/DIFFERENTIATION_BEFORE_SYNTHESIS_WORKING_SESSION_2026-05-30.md` | The system resists the harmonizing/convergence move at the design level. | DOCTRINE |
| **Name for evidence, not aspiration** | Features are named for what the evidence supports, not the hope. *"Continuity context," not "relationship intelligence."* | session memory | The project's own naming is held to the evidence standard. | DOCTRINE |
| **Provenance honesty before argument continuity** | When MAIA holds a conclusion it never received the basis for, it must mark the boundary rather than confabulate. Orchestrator-enforced against the retrieval manifest — *not* self-reported by the generative layer. | `docs/architecture/EXECUTIVE_DISCERNMENT_PROVENANCE_MAP_2026-06-02.md`; session memory | The system is being built to admit what it doesn't know rather than fabricate a chain. | DOCTRINE (observed at n=1; held until replicated) |

---

## Section C — Architectural constraints
*Code-level limits on system authority. Where the doctrines touch the runtime.*

| Constraint | What it does | Path | Claim it can carry | Status |
|-----------|-------------|------|--------------------|--------|
| **Sanctuary Mode** | Conversations useful in the moment that never enter long-term memory. Absolute boundary: nothing can be saved, inferred, or converted to memory — *including by user request during the session.* Default off; explicit opt-in. | `docs/canon` (invariant); referenced across `lib/memory/stores/*`, `lib/settings/accountSettings.ts` | The architecture provides a hard, non-negotiable no-retention boundary — the proof that the system serves the person, not the data model. | CANON + WIRED |
| **Self-hosted, no third-party intermediary** | Local PostgreSQL; Claude primary + local Ollama fallback; no Supabase, no OpenAI, no managed cloud. Enforced by `npm run check:no-supabase` in the pre-commit hook. | `lib/db/postgres.ts`; `CLAUDE.md`; pre-commit hook | No third party sits between the user and their data; the constraint is enforced mechanically at commit time. | LIVE (enforced) |
| **Member-marked, not system-inferred** | The breakthrough flag is set *by the member*, never inferred by the system. Renders as "marked as a breakthrough by the member." No synthesis. | `app/api/sovereign/atoms/[id]/breakthrough/route.ts` | Significance is authored by the human; the system does not decide what mattered. | WIRED (column + API exist; first surfacing under live load not yet verified) |
| **Authority Return at the Conductor layer** | Significant guidance interactions must end with a question only the user can answer, a choice they own, or a real-world action they take. | `docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md` (Invariant 1); Conductor layer | Agency is pushed back to the user structurally, per exchange. | CANON (enforcement point named; runtime audit pending) |
| **No engagement / convergence optimization** | There is no runtime optimization on resonance or agreement. Backed by Oath + Canon prohibitions. | `docs/canon/MAIA_OATH.md`, `MAIA_CANON_v1.1.md` | The system does not have, and is forbidden from having, an engagement objective function. | CANON |

---

## Section D — Verified / runtime practices
*Things with production receipts. Includes the project's own self-corrections — which are themselves the strongest evidence of the posture.*

| Practice | What it is | Path | Claim it can carry | Status |
|----------|-----------|------|--------------------|--------|
| **Substrate Monitor** | A live instrument that reports each memory layer's status. `deriveStatus` gates on declared wiring *before* counting runtime evidence; raw ok/empty/err counts are shown, not inflated percentages. "Watched-and-empty" is distinguished from "unwatched." | `app/admin/maia/substrate/` + `app/api/admin/maia/substrate/route.ts` | The project measures its own liveness with an instrument designed to refuse false positives. | LIVE |
| **Corpus Callosum — corrected claim** | Parallel multi-agent epistemic emission (8 voices) fires under production traffic. The team initially read this as "selective integration emerging operationally," then **verified it is telemetry, not influence** — voices are logged, not integrated — and corrected the record. | `docs/architecture/EXECUTIVE_DISCERNMENT_PROVENANCE_MAP_2026-06-02.md`; session memory | **A documented self-correction from a stronger claim to a weaker, true one.** This is the behavior pattern the whole paper is documenting. | LIVE substrate; influence *unproven* (correction recorded) |
| **Contextual return default** | Returning members get continuity context by default, framed as *"assume conversational continuity,"* not *"relationship is underway."* | commit `0fa544bc4`; live path | Cross-session continuity is real and is named at the lowest claim the evidence supports. | LIVE |
| **Theme signals** | Recurring-theme detection writing rows under production load (lexical, detection-gated). | `member_theme_signals`; live | A substrate for recurrence exists and is producing rows — surfaced honestly, not yet a "recurrence" product claim. | LIVE (producer); surfacing held |

---

## Section E — Held open / unresolved territory
*Explicitly aspirational. Marked so the reader can see the boundary the project draws around its own future.*

| Item | Honest status | Why it's here |
|------|--------------|---------------|
| **Member-facing recall consent toggle** (`conversational_recall_enabled` / `episodic_recall_enabled`) | **HELD / planned — not in code.** Repo-wide search returns no matches. | The consent *opt-out surface* is designed but not yet built. Listing it here, unbuilt, is the ledger demonstrating its own discipline. |
| **Episodic memory** | BUILT, fully wired end-to-end, ungated — **dark solely because undeployed.** | The threshold layer where "MAIA remembers a life unfolding" becomes testable. Not yet field-verified. |
| **Recurrence surfacing** | Producer LIVE; member-facing surface HELD. | Substrate exists; the experience does not yet. |
| **Collective intelligence / AIN** | Cat 1 — preserved direction. | Roadmap, not runtime. Field-not-model; explicitly not built. |
| **RFI / UFI, coherence/field, morphic, somatic** | HELD under freeze, with named lift conditions. | *"You are not behind because RFI/UFI are not built. You are safer because you now know they are not built."* |
| **Symbolic / astrological / morphic framings** | Deliberately *not* foregrounded in the main paper. | They are not the strongest first proof. They appear only after the discipline has been established, marked as exploratory. |

---

## How the paper draws on this ledger

The whitepaper's structure is ordered so the system appears *only after* the constraints — demonstrating that the architecture emerged from the safeguards, not the reverse:

| Paper section | Backed by |
|---------------|-----------|
| 1. The problem of human attention and agency | (thesis — no claim to back) |
| 2. Why existing AI trajectories create legitimate concern | (names the lineage honestly) |
| 3. The design challenge: assist without displacing | Oath; Canon prohibitions (§A) |
| 4. The governance constraints required *before* such a system should exist | **Section A** |
| 5. The operational disciplines that enforce them | **Section B** |
| 6. The resulting architecture | **Sections C + D** |
| 7. Open questions and unresolved territory | **Section E** |

**Teleology the paper points toward** (only after the evidence of discipline): *not* AI as replacement, optimizer, or companion, but AI as a scaffold that helps people re-engage the neglected dimensions of their own consciousness, relationship, embodiment, imagination, emotion, meaning-making, and participation in nature — the restoration of attention to the dimensions through which human beings develop agency.

---

## Open ledger tasks

- [ ] Confirm Authority Return runtime enforcement (Conductor audit) — currently CANON-stated, not runtime-verified.
- [ ] Read the Sanctuary enforcement path end-to-end to upgrade WIRED → verified no-retention.
- [ ] Episodic deploy + field receipt → moves it out of Section E.
- [ ] Decide whether the recall consent toggle ships before or with the paper (changes its status from HELD).
