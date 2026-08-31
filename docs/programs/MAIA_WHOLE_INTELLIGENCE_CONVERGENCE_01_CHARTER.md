# MAIA-WHOLE-INTELLIGENCE-CONVERGENCE-01 — Program Charter

**State:** `INTEGRATING` (packet P0 only) — Phase 7 ratified 2026-08-31
**Opened:** 2026-08-31
**Posture:** Packet **P0 authorized and delivered** (type architecture only, zero runtime behavior change). Every other packet remains **HELD**. No route convergence has begun.

```text
Phase 0   BIND                        CLOSED
Phase 1   FIELD CENSUS                COMPLETE
Phase 2   AUTHORITY MAP               COMPLETE
Phase 3   CANONICAL MODEL             COMPLETE
Phase 4   TURN-COMPOSITION MAP        COMPLETE
Phase 5   EMBODIMENT MATRIX           COMPLETE
Phase 6   DRIFT CLASSIFICATION        COMPLETE
Phase 7   ONE MIND, MANY EMBODIMENTS  RATIFIED / CLOSED
Phase 8   CONDUCTOR ARCHITECTURE      PACKETIZED

  P0        EVIDENCE CONTRACT         ✅ DELIVERED 2026-08-31
  §6 probes RUNTIME FACTS             READY — scripts/wic01-runtime-boundary-probes.sh
  P1+                                 HELD pending required facts
```
**Ratified canon:** `docs/canon/MAIA_ONE_MIND_MANY_EMBODIMENTS.md`
**Lane:** `claude/maia-intelligence-census-6aav7v`

---

## Governing proposition

> **One MAIA intelligence field, many embodiments.**
>
> Web, PWA, Desktop, mobile, Studio, Practitioner, Now What?, Session Room, voice, text, and future surfaces may differ in interaction, permissions, available senses, and expression. **They may not silently instantiate different MAIA minds.**

This extends the established voice doctrine — *different capture path, not a different mind* (`docs/canon/MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md`) — from the voice transport to the whole platform.

## What this program is not

- Not a memory cleanup. Memory is one organ.
- Not a feature inventory.
- Not a repair sweep. **A finding is not permission to repair.**

## Constitutional constraints (inherited, not authored here)

1. **Protection / consent gates eligibility.** Sanctuary is absolute.
2. **Member-authored experience outranks system inference.** Member-declared significance outranks system-derived significance.
3. **Availability never creates an obligation to speak.** Integration is composed and restrained participation, not maximum inference.
4. **Authority moves upward only** through authored experience (`docs/canon/CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md`). The member may loop freely; the system may not skip a layer.
5. **Name the mechanism, not the mythology.** Metaphor after measurement.

---

## Phase 0 — BIND (complete)

### Custody

| Item | Value |
|---|---|
| Repository | `SoullabTech/Sovereign` |
| Program branch | `claude/maia-intelligence-census-6aav7v` |
| Branch base / HEAD at bind | `fc66b47` (2026-08-31) |
| Integration branch | `clean-main-no-secrets` |
| Production SHA | **UNKNOWN** — requires `ssh soullab@minisforum 'docker exec maia-sovereign printenv GIT_COMMIT'` |
| Production host | minisforum (`192.168.0.104`), Docker + Caddy |

**Custody gap recorded, not guessed:** this census was performed against `fc66b47`, not against verified production. Any row whose truth depends on deployed state is marked `UNKNOWN (runtime)`. The census does not assume branch state equals production state.

### Frozen vocabulary

These words are load-bearing and are used in exactly these senses for the life of the program.

| Term | Definition |
|---|---|
| **CAPABILITY** | Something MAIA can potentially use |
| **SOURCE** | Where intelligence/data originates |
| **STORE** | Where it persists |
| **WRITER** | What puts data into the store |
| **RETRIEVAL** | How it becomes available to a turn |
| **ELIGIBILITY** | Consent + provenance test deciding whether it *may* be used |
| **AUTHORITY** | What may outrank what |
| **CONDUCTOR** | What decides whether and how a source participates |
| **COGNITION** | The model call that produces MAIA's understanding |
| **EMBODIMENT** | Where MAIA appears to the member (a surface) |
| **MEDIUM** | Text / voice / visual / session / studio |

**The distinction the vocabulary exists to protect:** *"memory exists"* ≠ *"memory was retrieved"* ≠ *"memory was consulted"* ≠ *"MAIA used memory."*

### Per-source state vocabulary (Phase 4)

```
AVAILABLE   → RETRIEVED → CONSULTED → USED
                   ↓           ↓
              RESTRAINED    REJECTED
                   ↓
                FAILED
```

### Per-capability status vocabulary (Phase 1)

`LIVE` · `AVAILABLE` · `RESTRAINED` · `CONSENT_GATED` · `NOT_ACTIVATED` · `BROKEN` · `ORPHANED` · `REDUNDANT` · `UNKNOWN`

### Per-finding verdict vocabulary (Phase 6)

`MISSING` · `BROKEN` · `ORPHANED` · `DIVERGENT` · `REDUNDANT` · `MIS-RANKED` · `UNOBSERVABLE` · `INTENTIONALLY_RESTRAINED` · `CONSENT_GATED` · `CORRECT`

---

## Program state machine

```text
BOUND ──▶ CENSUSING ──▶ MAPPING_AUTHORITY ──▶ DEFINING_CANONICAL_MODEL
   ▲                                                    │
   │                                                    ▼
   │                                          MAPPING_EMBODIMENTS
   │                                                    │
   │                                                    ▼
   │                                            CLASSIFYING_DRIFT
   │                                                    │
   │                                                    ▼
   │                                      ARCHITECTURE_RATIFICATION ◀── HUMAN GATE
   │                                                    │
   │                                                    ▼
   │                                              PACKETIZING
   │                                                    │
   │                                                    ▼
   │                                              INTEGRATING
   │                                                    │
   │                                                    ▼
   │                                       CROSS_MEDIUM_VERIFYING
   │                                                    │
   │                                                    ▼
   │                                               CONVERGED
   │                                                    │
   │                                                    ▼
   └──── INVALIDATED ◀───────────────── CONTINUOUS_GOVERNANCE
        (rebind → re-census affected area only;
         never silently redo settled architecture)
```

**Current state: `PACKETIZING`.** Phases 1–6 delivered; Phase 7 ratified by founder ruling 2026-08-31; Phase 8 packetized as `MAIA_WIC_01_PHASE_8_CONDUCTOR_PACKET_PLAN.md`.

**Still open:** the census §6 runtime probes. They gate packet **P1** (truth instrument), which in turn gates every packet after it — a repair verified by a broken instrument is not verified.

---

## Phase register

| Phase | Name | Artifact | State |
|---|---|---|---|
| 0 | BIND | this charter §Phase 0 | **COMPLETE** (production SHA gap recorded) |
| 1 | CENSUS | `docs/architecture/MAIA_INTELLIGENCE_FIELD_CENSUS_01_2026-08-31.md` | **DRAFT** — static complete, runtime probes open |
| 2 | AUTHORITY MAP | `docs/architecture/MAIA_INTELLIGENCE_AUTHORITY_AND_EMBODIMENT_2026-08-31.md` §2 | **DRAFT (proposal)** |
| 3 | CANONICAL MODEL | same, §3 | **DRAFT (proposal)** |
| 4 | TURN-COMPOSITION MAP | census §3 | **DRAFT** |
| 5 | EMBODIMENT MATRIX | authority/embodiment doc §5 | **DRAFT** |
| 6 | DRIFT CLASSIFICATION | same, §6 | **DRAFT** |
| 7 | ARCHITECTURE RATIFICATION | `docs/canon/MAIA_ONE_MIND_MANY_EMBODIMENTS.md` | **RATIFIED** 2026-08-31 |
| 8 | CONDUCTOR / CANONICAL TURN ARCHITECTURE | `docs/programs/MAIA_WIC_01_PHASE_8_CONDUCTOR_PACKET_PLAN.md` | **PACKETIZED** — P0–P6 defined, none authorized |
| 9 | CROSS-MEDIUM WITNESS | — | NOT STARTED — gated on Phase 8 exit |
| 10 | CONVERGENCE GATES | — | NOT STARTED |

### Phase 7 ruling (summary — full text in canon)

> MAIA has one canonical cognition and composition authority. Surfaces may provide explicit embodiment, task, persona, latency and permission contracts around that cognition. **Any divergence in memory eligibility, relational intelligence, authority hierarchy, consent, provenance, or composition requires an explicit architectural ruling; it may not emerge accidentally from endpoint-specific prompt assembly.**

Three corollaries bind the program:

1. **The tier inversion is architecturally incorrect** — tier is accidentally functioning as identity. D7/D8 are re-scoped as symptoms of D6 and **may not be repaired by copying the five missing addenda into another array.**
2. **Some divergence is sovereignty.** Sanctuary is divergence. Convergence applies to accretion, never to consent, task, or embodiment.
3. **`USED` is architecture, not telemetry.** A memory can be used without being spoken; withholding is participation and is recorded as such.

---

## Phase 10 — the gates this program exists to install (proposed)

Recorded now so the program has a destination, not because any is authorized.

```text
G1  no new MAIA cognition endpoint without registration
G2  no new memory store without provenance + retrieval contract
G3  no surface may create its own independent prompt stack silently
G4  no capability may claim "used" unless cognition received it
G5  no active dependency may fail while health reports healthy
G6  voice/text must converge before cognition          (exists: __tests__/voice-non-degradation.test.ts)
G7  member-declared significance outranks system-inferred
G8  all surface exceptions explicitly registered
```

Terminal artifact: a machine-readable `MAIA_INTELLIGENCE_REGISTRY`, so the question *"what intelligence is MAIA using in Desktop today?"* is answerable without another forensic session.

**G6 is the only gate that already exists.** It is the proof the pattern works, and the template for the other seven.

---

## Definition of success

> Every MAIA embodiment has access to the same canonical intelligence substrate, under the same authority and consent rules, while expressing it appropriately for its medium.

**Architectural test:** *remove the UI label. Can you still tell which "MAIA" answered, from the intelligence that was available to her?* If yes, forks remain.

**Failure mode to refuse:** "fully integrated" becoming MAIA spraying every capability into every response. Wave G (restraint) is not optional cleanup — it is the proof that integration succeeded rather than collapsed.
