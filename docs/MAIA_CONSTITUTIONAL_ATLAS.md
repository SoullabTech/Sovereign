# MAIA Constitutional Atlas

> **STATUS: WORKING DRAFT — governance cartography, NOT canon.**
> Built on an explicitly authored Decide→Build crossing (Kelly, 2026-06-17). This document **maps what already exists**; it does **not** create law, amend the Constitution, or elevate any document beyond its current authority. Any promotion of its contents into governing documents is a **separate authored crossing that belongs to Kelly.** Until then this is a map, not a mandate.
>
> Leveling below marked _(proposed)_ is provisional cartography from document titles + this session's record — confirming it requires reading each document's contents (the "freeze" pass, step 1 of constitutionalization). It is offered for review, not asserted as settled.

---

## What this is

The Atlas is the **navigation layer** for the project. Its job is to make the existing constitutional order **legible** — so any artifact (a UI decision, a route, a doc, a line of code) can be traced back to a first principle.

For **any** artifact, the Atlas should answer four questions:

1. **What level is this?** (Constitution · Jurisprudence · Protocol · Architecture · Implementation; Strategy sits *adjacent*)
2. **What higher authority does it derive from?**
3. **What lower artifacts derive from it?**
4. **What constitutional articles govern it?**

If every document can answer those four, the project has what most software lacks: a traceable chain from code back to first principles.

---

## The five levels

```
                MAIA CONSTITUTION
                        │
      ┌─────────────────┼─────────────────┐
      │                 │                 │
  Jurisprudence    Rights & Tests     Warrant Law
      │                 │                 │
      └─────────────────┼─────────────────┘
                        │
                  Domain Protocols
     Discovery · Studio · Memory · Engineering · …
                        │
                  Architecture
                        │
                  Implementation
                        │
                  Live Observation
                        │
                  Constitutional Review
```

| Level | Answers | Changes | Lives in |
|---|---|---|---|
| **Constitution** | *What is always true?* | rarely (only on demonstrated insufficiency) | `docs/canon/` (filed) + articulated-in-memory (unfiled) |
| **Jurisprudence** | *How do we interpret the Constitution in new situations?* | grows with experience | precedents (currently in memory + conversation; no filed `02_*` doc yet) |
| **Protocol** | *How is the interpretation enacted in a domain?* | per domain | scattered across `docs/canon/` + code (no unified `03_PROTOCOLS/` yet) |
| **Architecture** | *What structures implement the protocol?* | per build | `docs/architecture/` |
| **Implementation** | *What code realizes the architecture?* | continuously | `app/`, `lib/`, `database/` |
| *(Strategy — adjacent)* | *Where are we taking the product?* | freely | `docs/strategy/` |

---

## LEVEL 1 — Constitution

### 1a. The Law (small, articulated this session — **not yet filed**)

These are articulated in memory (`feedback_earn_before_name_epistemology`) and the 2026-06-17 conversations. **Authority status: ARTICULATED, proposed for a future `01_MAIA_CONSTITUTION.md`, not yet filed canon.** Promotion is Kelly's authored crossing.

- **Preserve human authorship** over increasing levels of commitment. *(the purpose beneath the law)*
- **Irreversibility requires the appropriate warrant** — the warrant differs by domain, the discipline does not:

  | Domain | Irreversible crossing | Warrant |
  |---|---|---|
  | Meaning | Naming | reality has stabilized |
  | Action | Acting | evidence warrants |
  | Future | Committing | **authorship** has appeared |

- **Sovereignty outweighs optimization** — correctness is not authority.
- **Permission before obligation** — never silently convert a permission into an obligation.

### 1b. Filed constitutional canon _(proposed leveling — verified real files)_

| Document | Reads as | Note |
|---|---|---|
| `docs/canon/MAIA_OATH.md` | the irreducible vow | CLAUDE.md: "any change that violates the oath is invalid" |
| `docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md` | relational constitution | constraints on relational power |
| `docs/canon/MAIA_CANON_v1.1.md` | governing constraints | "governs all changes" |
| `docs/canon/MAIA_IDENTITY_ONTOLOGY.md` | what MAIA is / is not | |
| `docs/canon/MAIA_PROMISE_v1.0.md` | enforceable commitments | |
| `docs/canon/MAIA_FAILURE_BOUNDARIES_v1.0.md` | failure-mode boundaries | |
| `docs/canon/RIGHT_TO_REMAIN_UNPOSSESSED.md` | a named freedom | candidate "article" |

### 1c. Governance / meta-constitutional instruments _(proposed)_

How canon is evaluated and changed (governs the Constitution's own evolution):
`CONSTITUTIONAL_AUDIT_PROCESS.md` · `MARKETING_CLAIM_DISCIPLINE.md` · `CHANGES_SECTION_EPISTEMIC_DISCIPLINE.md` · `SESSION_REVIEW_LENS_CONSTITUTIONS.md` · `RECOGNITION_INTEGRITY.md`

> **Review flag:** memory references `docs/canon/GOVERNANCE_REVIEW_INSTRUMENTS.md`, but it is **not present in `docs/canon/` on clean-main**. Either unfiled, on another branch, or a memory artifact — to resolve in the freeze pass.

---

## LEVEL 2 — Jurisprudence

### 2a. Precedents articulated this session (**in memory + conversation; no filed doc yet**)

Interpretations of the law, not new law. Proposed for a future `02_CONSTITUTIONAL_JURISPRUDENCE.md`:

- **Correctness is not authority** (a right prediction still can't license a commitment).
- **Declaration is not liveness / representation is not reality** (verify against reality, not the build log).
- **Remaining where you are is constitutional fidelity** (not hesitation) when no warrant has appeared.
- **Unobserved is not unbuilt** (an unobserved item is not a build trigger).
- **The confirm-step is the authorship event** (consent gates establish the commitment-warrant).
- **The agency gradient** (the system does most in Reveal, least in Commit; more consequence → more it's the person's).
- **Leak diagnostics** (Pulse-as-backlog → Reveal collapsed · Workspace-as-task-manager → Curate collapsed · Commit-automatic → authorship collapsed).

### 2b. Filed canon that reads as jurisprudence _(proposed)_

`MAIA_AS_MIRROR_INFRASTRUCTURE.md` · `INTERFACE_HUMILITY.md` · `MAIA_ATTENTION_DOCTRINE.md` · `DISCIPLINED_NON_COLLAPSE.md` · `MAIA_FOUNDATIONAL_CONTEXT.md` · `SACREDNESS_AS_ARCHITECTURAL_ORIENTATION.md` · `THE_SACRED_AND_ITS_ARCHITECTURE.md` · `TRANSPARENT_ENCHANTMENT.md` · `SYMBOLIC_GUIDANCE_LAYER_DOCTRINE.md` · `SOULLAB_VOICE_DOCTRINE_DAOIST.md` · `MEDIA_FIELD_AND_RELATIONAL_FIELD_BOUNDARIES.md` · `FOUR_LAYER_SUBSTITUTION.md` · `MAIA_SPOKEN_MANIFESTO.md`

> **Review flag:** these are *filed in `docs/canon/`* but read as interpretation, not foundational law. The freeze pass decides whether they are Constitution or Jurisprudence. The Atlas only proposes.

---

## LEVEL 3 — Domain Protocols

Each domain enacts the law as a **warrant-loop**. Most protocols are **not yet written as unified `03_PROTOCOLS/` docs** — the behavior currently lives in code + scattered canon docs.

| Protocol | Warrant-loop | Filed canon (proposed) | Implementation (verified this session) |
|---|---|---|---|
| **Discovery** | Observe → Interpret → Test → Observe | `DISCIPLINED_NON_COLLAPSE` | (epistemic discipline; in memory) |
| **Studio** | Reveal → Curate → Commit → Live → Reveal | `FIS_FIELD_STATE_PRIMITIVE`, `FIELD_GRAVITY_ARCHITECTURE` | `app/studio/field/*` (live, prod `8c36bd757`) |
| **Engineering** | Observe → Decide → Build → Deploy → Observe | `MAIA_WIRING_AUDIT_v1.0` | the deploy pipeline + this Atlas's own gate |
| **Memory** | (consent → write → recall) | `MAIA_MEMORY_CANON_v1.0`, `CORPUS_DISCIPLINE_PROTOCOL_v1.0`, `CORPUS_WEIGHTING_SCHEMA_v1.0`, `LONGITUDINAL_MEMORY_CATEGORY_GRADIENT`, `SOVEREIGN_STORAGE_SOP_v1.0`, `ORACLE_CORPUS_DESIGN_v1.0` | `lib/sovereign/*`, atoms loader |
| **Field / Relational** | (reveal → access → federate) | `CIRCLE_FIELD_DOCTRINE`, `INTELLIGENCE_FIELD_ACCESS_MAP`, `FEDERATED_RELATIONAL_ARCHITECTURE`, `MAIA_KNOWLEDGE_FIELD_v1.0`, `MAIA_KNOWLEDGE_FIELD_12_DOMAIN_MAP` | `lib/fieldProtocol/*` |
| **Consent / Commitment** | propose → confirm (authorship) → act | `MAIA_CONSENT_GATES` _(Cat 2 — vision, NOT live runtime)_, `MAIA_SANCTUARY_ECONOMY` | `lib/maia/proposals/*`, `app/api/sovereign/proposals/calendar/confirm` |
| **Calendar (Commit surface)** | member authors → `calendar_events` → syncs out | — | `app/api/studio/calendar/events`, `lib/calendar/GoogleCalendarService.ts`, CalDAV (verified live + synced) |
| **Engagement / Ask** | — | `MAIA_ASK_LAYER`, `MAIA_CONNECTOR_EXPERIENCE`, `MAIA_EPISTEMIC_TONE_SPEC_v1.0` | `app/api/oracle/*`, `app/api/sovereign/*` |
| **Continuity / Signal** | — | `SPIRAL_CONTINUITY_ENGINE`, `NEXT_SIGNAL_LOOP_SPEC`, `RECOGNITION_INTEGRITY` | `lib/consciousness/spiralStatePersistence.ts` |

---

## LEVEL 4 — Architecture

- `docs/architecture/` — the active working-design corpus (per-file placement is part of the full cartography pass; not enumerated here to avoid citing unverified paths).
- Audit/structural snapshots filed in canon: `MAIA_SYSTEM_MAP.md` · `MAIA_CURRENT_STATE_v1.0.md` · `MAIA_WIRING_AUDIT_v1.0.md`.

## LEVEL 5 — Implementation

- `app/` (routes + pages) · `lib/` (services) · `database/migrations/` (schema).
- `docs/specs/` — per-feature build plans (Architecture↔Implementation bridge).
- Verified anchors this session: Studio field (`app/studio/field/*`, `app/api/studio/field/*`, tables `field_attention`/`field_events`/`field_people`); calendar/proposals (`calendar_events`, `lib/maia/proposals/*`).

## Adjacent — Strategy

`docs/strategy/` (verified real, 5 files): `MAIA_STUDIO_ARCHITECTURE.md` _(the Reveal/Curate/Commit + MAIA-Assist frame — **strategy, deliberately adjacent to canon so it stays answerable to the Constitution while free to evolve**)_ · `ain-content-community-strategy.md` · `beta-steward-invitation.md` · `beta-steward-program.md` · `field-letter-week-1.md`.

---

## Worked navigation examples (the four questions applied)

| Artifact | 1. Level | 2. Derives from | 3. Governs | 4. Governing articles |
|---|---|---|---|---|
| Personal Field home (`app/studio/field/page.tsx`) | Implementation | Studio Protocol | the three lenses' UI | preserve-authorship · permission-before-obligation |
| Workspace / Pulse switcher | Architecture→Impl | Studio Protocol (Reveal/Curate) | field rendering | sovereignty>optimization (lens is a choice) |
| Consent gate (`proposals/calendar/confirm`) | Implementation | Consent Protocol | calendar writes | irreversibility-requires-warrant (authorship) |
| `MAIA_STUDIO_ARCHITECTURE.md` | Strategy (adjacent) | the Constitution | Studio Protocol | preserve-authorship |
| "Correctness is not authority" | Jurisprudence | sovereignty>optimization | feature reviews | (interprets) sovereignty article |
| `MAIA_OATH.md` | Constitution | — (root) | everything | (is an article) |

---

## Review flags (surfaced, not resolved — for the freeze pass)

1. **No `01_/02_/03_` docs exist yet.** The Law (1a) and Jurisprudence (2a) live in memory + conversation. Filing them is Kelly's authored crossing.
2. **`GOVERNANCE_REVIEW_INSTRUMENTS.md`** is referenced in memory but absent from `docs/canon/` on clean-main — locate or reconcile.
3. **Canon may be over-broad.** 52 files are filed under `docs/canon/`; several read as jurisprudence, protocol, or architecture (flagged above). The freeze step decides what is *actually* constitutional. The Constitution should end up **small.**
4. **Leveling is provisional** — derived from titles + this session, not full content reads.
5. **The inventory pass found hallucinated filenames** in an automated sweep; every path in this Atlas was ground-truthed against clean-main. Future passes must do the same.

---

## How this becomes the governing structure

Once Kelly authors (a) the freeze, (b) a filed `01_MAIA_CONSTITUTION.md` + `02_CONSTITUTIONAL_JURISPRUDENCE.md`, and (c) per-domain protocol docs that open with a **"Constitutional Authority"** header, every document in the repo can answer the four questions — and the Constitution stops being inspiring and starts **governing**.

*This Atlas is the map. The territory's promotion into canon remains an authored act.*
