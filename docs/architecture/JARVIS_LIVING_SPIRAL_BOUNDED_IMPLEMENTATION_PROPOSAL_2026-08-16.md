# Living Spiral — bounded implementation proposal (Slice 1)

**Status:** `PROPOSED` — ⛔ paper only. No code, schema, emitter, store, surface, or deployment.
**Produced under:** [`JARVIS_LIVING_SPIRAL_PROGRAMME_DIRECTIVE_2026-08-16.md`](../governance/JARVIS_LIVING_SPIRAL_PROGRAMME_DIRECTIVE_2026-08-16.md)
— founder addendum: *"produce a bounded implementation proposal before touching code."*
**Governing upstream:** [`JARVIS_LIVING_SPIRAL_SEMANTIC_CONTRACT_2026-08-16.md`](./JARVIS_LIVING_SPIRAL_SEMANTIC_CONTRACT_2026-08-16.md) — `ACCEPTED`, unamended here.
**Research phase:** [`…PHASE0_RECONCILIATION_2026-08-16.md`](./JARVIS_LIVING_SPIRAL_PHASE0_RECONCILIATION_2026-08-16.md) — performed, not repeated.

```text
PROTOTYPE ACCEPTANCE   AWAITING_AUTHORITY — this proposal does not clear it
BUILD SLICE 1          NOT AUTHORIZED — requested by this document, not granted by it
LIVE TELEMETRY         NOT AUTHORIZED
ASSERTION SUBSTRATE    NOT CREATED — Slice 1 is designed to need none
DEPLOYMENT             NOT AUTHORIZED
```

---

## §0 The bounding principle

The directive's §17.1 lists eight components for a first slice. Eight is not a slice; it is the
product. The bound applied here is narrower and chosen for a reason:

> **Slice 1 exists to convert `SPECIFIED_DERIVATION` into `PERFORMED_DERIVATION` (directive §2.7)
> for a named, finite assertion set — and nothing else.**

That is the programme's one genuinely unproven claim. Every document to date — contract, atlas,
nine frames, Phase 0 — establishes that the semantics are *coherent* and *renderable*. None
establishes that a single assertion can actually be **read out of a real source in this repository
today**. Until one is, the cockpit is a specification of a derivation, which §2.7 says is not the
derivation.

Three consequences follow, and they are what make this bounded:

1. **No UI.** A visual cockpit over an unperformed derivation renders invented state beautifully.
   The nine frames already discharge the grammar question. Navigation is Slice 2.
2. **No persistence.** Assertions are computed at read time and thrown away. This is not a
   limitation — it is what keeps Slice 1 inside `RUN / ASSERTION SUBSTRATE: NOT CREATED`.
3. **No new vocabulary.** Slice 1 emits only values from the accepted contract. It therefore does
   not depend on any of the four items sitting `RULING_REQUIRED` (C2, C3, C7, C8) and cannot be
   blocked by them — nor can building it quietly adopt them.

## §1 Scope — two capabilities, not five

The directive §27 names five pilots. Slice 1 takes the two that discriminate hardest and require
no human encounter to evaluate; the other three are named for Slice 2 with their reason.

| Capability | Why in Slice 1 | What it is designed to break |
|---|---|---|
| **MAIA identity / field continuity** | Exercises directive §11 congruence across three independent resolvers. A real recorded failure already exists in-corpus (`docs/ops/JARVIS_SUBJECT_IDENTITY_FAILURE.md`) to test against. | If the harness reports `CONGRUENT` where the recorded failure says otherwise, the derivation is confirmed unsound before anything is built on it. |
| **Astrology → MAIA relation** | The directive's own discriminating example (§10): a subsystem may be entirely healthy while MAIA cannot receive its field. | If the harness cannot separate *subsystem operates* from *field reaches MAIA*, the `maia_relation` axis is not derivable and should not be adopted. |

**Deferred to Slice 2, with cause** — Pro Studio House restoration (requires human witness + witness
apparatus cleanup, directive §20; a witness lane is not a derivation lane) · Voice (requires device
witness across PWA/iOS) · Memory / Anamnesis (largest distributed evidence surface; belongs after
the derivation is proven on two).

## §2 What Slice 1 is, concretely

A **read-only derivation harness** — one script under `scripts/builder/`, in the shape of the
existing `orient.mjs` / `epistemic-guard.mjs` lineage (Phase 0 §H names these as reuse, not rebuild).

It takes a capability identity and prints, for each assertion it can form:

```text
assertion
  operational_element[]   accepted contract §2 values only
  epistemic_status        §9
  temporal_status         §8
  presence_value          §7
  observation_status      §7
  provenance              §10 — the source read, and the read that was performed
  ecology                 PROPOSED axis, rendered in a separate block, never merged above
  maia_relation           PROPOSED axis, rendered in a separate block, never merged above

  ESTABLISHES             what this evidence actually establishes
  DOES NOT ESTABLISH      explicit, not omitted
  FAILING IMPLEMENTATION  what a broken version would print instead
```

and then, separately and always:

```text
APERTURES
  <domain> · <missing observation> · <possible instrument> · <authority to instrument>
  THEREFORE NOT CLAIMABLE: <claims mechanically prevented>
```

⛔ **Explicitly out of scope for Slice 1:** any table, migration, emitter, telemetry write,
`agent_runs` insert, API route, page, component, graph, dependency weave, health value, lifecycle
value, error class, scalar, ranking, or founder-facing board.

## §3 Sources Slice 1 may read

Confined to sources that already exist and are already read elsewhere in this repo — no new
instrument is created, which is what keeps this below the telemetry bar.

| Source | Slice 1 use | Bound (directive §12) |
|---|---|---|
| Git (local refs, `git archive`-visible tree) | custody assertions | ⛔ establishes nothing about execution, deployment, or encounter |
| Repository source | declared wiring, contracts | ⛔ establishes nothing about liveness |
| Running container `GIT_COMMIT` | deployed referent | ⛔ read-only; ⚠️ see aperture A1 |
| Existing tables, `SELECT` only | recorded events | ⛔ silence establishes nothing |
| Founder rulings in `docs/governance/` | intention / authority | ⛔ establishes that work was authorized, never that it was done |

⛔ **No writes to any store, in any environment.** ⛔ No production mutation. ⛔ No `--no-verify`,
no hook bypass (directive §21).

## §4 Apertures carried in, not closed

| | Aperture | Why it matters | Therefore not claimable |
|---|---|---|---|
| **A1** | Deployed referent is **PARTIALLY BOUND** — Phase 0 §A.3, 1 of 5 criteria met | Every runtime assertion inherits this partiality | ⛔ No Slice 1 output may say a capability is *deployed and working*; the strongest available is a bound `GIT_COMMIT` with the other four criteria named unmet |
| **A2** | Programme artifacts are **UNTRACKED** — see §6 | This proposal's own upstream citations are not in commit custody | ⛔ No Slice 1 output may treat a `docs/` citation as canonical without a custody read at time of use |
| **A3** | No encounter record exists as a readable source | Directive §2.3: witness cannot be synthesized from source activity | ⛔ Slice 1 may never emit `WITNESS_OWED: cleared`, in any form, for any capability |

## §5 Acceptance criteria — falsifiable, and testable without a UI

Slice 1 is accepted only if all six hold. Each is written so that a plausible wrong implementation
fails it rather than passes it quietly.

1. **Derivation performed, not specified.** For each of the two capabilities, at least one assertion
   is produced whose provenance names the exact source read and the read performed. ⛔ A hand-written
   fixture presented as a derivation fails this.
2. **Negative control holds.** Run against a capability identity that does not exist. It must produce
   apertures and zero assertions — ⛔ not an empty success, ⛔ not `HEALTHY`, ⛔ not a crash.
3. **The recorded identity failure reproduces.** Against `JARVIS_SUBJECT_IDENTITY_FAILURE.md`, the
   harness must report `DIVERGENT` or `CANNOT ESTABLISH`. ⛔ Reporting `CONGRUENT` fails Slice 1
   outright and is not a bug to fix — it falsifies the derivation.
4. **Astrology separates.** The harness distinguishes *Astrology subsystem operates* from *the field
   reaches MAIA*, or it reports that it cannot. ⛔ Collapsing the two fails.
5. **Empty means something.** Every empty field resolves to a named `presence_value` /
   `observation_status` pair or a named aperture. ⛔ No field may be blank for the reason that
   nothing was written there (directive §28.15).
6. **No forbidden emission.** ⛔ Zero scalars, percentages, scores, rankings, pulses, aggregate
   counts-as-judgement; ⛔ zero `HEALTHY`; ⛔ zero lifecycle values; ⛔ zero unevidenced edges. A
   mechanical check over the harness output, not a review opinion.

**Reporting rule (directive §19).** Slice 1 results are reported as *which check · against what tree
or SHA · what it establishes · what it does not*. ⛔ "It works" is not a result.

## §6 ⚠️ Custody finding — `DISCOVERED`, recorded, not repaired

Measured 2026-08-16 in `/Users/soullab/MAIA-SOVEREIGN` on `chore/jarvis-epistemic-custody-2026-08-16`
@ `90fb1c98a`:

```text
TRACKED (commit custody held)
  JARVIS_LIVING_SPIRAL_SEMANTIC_CONTRACT_2026-08-16.md        the ACCEPTED contract
  FOUNDER_RULING_LIVING_SPIRAL_CONTRACT_AMENDMENT_2026-08-16.md
  docs/architecture/evidence/living-spiral-prototype/          the nine frames

UNTRACKED (⚠️ no commit custody — exist only in a shared working tree)
  JARVIS_LIVING_SPIRAL_PHASE0_RECONCILIATION_2026-08-16.md     the research phase itself
  JARVIS_LIVING_SPIRAL_ATLAS_STRUCTURE_2026-08-16.md
  JARVIS_LIVING_SPIRAL_ATLAS_PROPOSAL_RECONCILIATION_2026-08-16.md
  JARVIS_LIVING_SPIRAL_FRAME_REVIEW_AGAINST_COCKPIT_2026-08-16.md
  JARVIS_LIVING_SPIRAL_JURISDICTION_2026-08-16.md
  FOUNDER_RULING_LIVING_SPIRAL_SEMANTIC_JURISDICTION_2026-08-16.md
  JARVIS_STEWARDSHIP_CONSTITUTION_2026-08-12.md
  JARVIS_FOUNDER_ESCALATION_CONTRACT_2026-08-12.md
```

The working tree holds **786 changed / 686 untracked** paths overall. This repository has three
recorded defects in this exact class — `SHARED CHECKOUT SOURCE CUSTODY RACE` (`f9a3139cf`),
`SHARED LOCAL DATABASE CUSTODY RACE` (`74c7680fe`), `SHARED GIT HOOK CUSTODY RACE` (`062e4559f`).

Two things follow, and only two:

- The directive's own §22 distinction is live here: `UNTRACKED` is more precise than `UNCOMMITTED`,
  and the programme's research phase currently sits at the weakest link in the custody chain.
- ⛔ **Per directive §2.10 and JARVIS CORE §A, this is an observation, not homework.** ⛔ These files
  are not attributed to this lane — 686 untracked paths in a shared checkout cannot be attributed
  without evidence (§13.1). ⛔ No blanket commit is proposed or performed.

## §7 Disposition

```text
THIS PROPOSAL          PROPOSED — produced under founder instruction; grants nothing
SLICE 1 BUILD          NOT AUTHORIZED — the next gate, and it is the founder's to open
SLICE 2 (navigation)   NOT PROPOSED — depends on Slice 1 acceptance criteria 1–6 holding
SEMANTIC CONTRACT      UNCHANGED — ACCEPTED, unamended
PROTOTYPE ACCEPTANCE   AWAITING_AUTHORITY — untouched by this document
C2 · C3 · C7 · C8      RULING_REQUIRED — unchanged; Slice 1 is built to not depend on them
CUSTODY FINDING §6     DISCOVERED — recorded, unrepaired, unattributed
```

**Sequencing note, below the authority boundary and therefore not asked as a question:** the nine
frames are still `AWAITING_AUTHORITY` for prototype acceptance. Slice 1 as scoped here does not
depend on that review — it produces data, not a rendering — so the two can proceed independently.
⛔ But Slice 2 depends on both, and starting Slice 2 before the frame review would produce a second
visual grammar and no decision — the failure the atlas reconciliation §5 already named.

⛔ **Nothing in this document authorizes any code, schema, telemetry, emitter, store, surface, or
deployment.**
