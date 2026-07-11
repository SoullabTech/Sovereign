# DOCS-TREE RECONCILIATION — 2026-07-11 (Codex session 2)

**Ref**: `18c08257b` on `feature/now-what-maia-presence` (census freeze lineage: evidence `92026feaf`, closures `a61d6d1c1`).
**Companion**: `SYSTEM_CENSUS_2026-07-11.md` (session 1 — code-side baseline). This document is the docs-side reconciliation: (a) authority map, (b) doc-vs-doc contradictions, (c) doc-vs-code drift.
**Standing header**: findings bind to this ref. Nothing here is ratified until Kelly's pass. Recommendations are proposals, not actions taken — except the CLAUDE.md count correction, recorded below.

---

## 1. Headline: the tree polices itself

The docs tree is heavily claim-disciplined. Nearly every spec carries a correct LIVE/DESIGNED/VISION or CANDIDATE/PROPOSED stamp that already agrees with the census; architecture docs actively enforce the dormant-layer posture ("0 live consumers / Wire 1st", "must not be claimed live"). Across hundreds of documents, doc-vs-code drift totals **two findings**, both in older or outlying documents. The Codex can say this plainly: *the constitution is not aspirational documentation.*

---

## 2. Doc-vs-code drift (census as baseline)

| # | Exposure | Finding | Disposition |
|---|---|---|---|
| D1 | HIGH (outward) | `docs/PHASE2_USER_FEATURES_COMPLETE.md` presents Shadow Work as a completed, trackable feature ("makes shadow work tangible and trackable" :341; `ShadowIntegrationTracker.ts ~850 LOC` in its deliverables table :609). Census + `a61d6d1c1`: Shadow Work rendered fabricated data, now an honest threshold; nothing persists. | **Recommend: retract or move to an `archive/` with a superseded banner.** A root-level "COMPLETE" status doc contradicting live state is exactly the artifact the Failure Test exists for. |
| D2 | MEDIUM (pitch) | `docs/pitch/PITCH_DECK_OUTLINE.md:166` — Continuity pricing tier: "MAIA remembers alongside you. **Patterns across time.**" — no Designed/Vision qualifier, while longitudinal/episodic memory is Cat 3 dormant. The same beat is correctly hedged in `CASE_STUDY_LIBRARY.md:155` and the Publishing candidate :169 — this row is the outlier. | **Recommend: stamp the tier line Designed** (or reword to the census-honest "conversational continuity" that is live). Kelly's call — outward copy. |
| — | — | Checked clean: Soul Comms (absent from docs entirely), self-serve fields (Path B spec explicitly "NOT self-serve"), portrait generation (gated everywhere), session video (all specs "not built"), attention layer (PROPOSED, "nothing Live yet"), dormant memory layers (enforced dormant). | No action. |

**Service-status matrix** (`MEMORY_SERVICE_STATUS_MATRIX_2026-05-24.md`, unread in session 1 — now read): substantially still true; all nine `lib/consciousness/memory/*` services remain zero-live-path. **One overtaken recommendation**: it ranks `CoherenceFieldService` "Wire 2nd," but the observation-freeze (`COHERENCE_FIELD_WIRE_UP_SPEC` §0.C) has since made coherence doctrinally frozen, not next-in-line. Recommend a one-line supersession note on the matrix.

---

## 3. Resolved record items

1. **PARTICIPATION_WITHOUT_FORECLOSURE §10 count: 7, definitively.** The record's "10" was a misread of the *section ordinal* (`# 10. Held Directions`) as a tally. The section holds exactly seven bullets (:391–397) and states no count of its own. CLAUDE.md's Cat 1 line corrected in this commit. Memory index already carries 7 via the census.
2. **WISDOM_IS_RECOVERED.md**: cited only at `REFUSAL_REGISTRY.md:109`, which *self-corrects in the same line* ("could not be found in the repo, so grounding was updated to verified canon"). File confirmed absent repo-wide. Recommend striking the dangling half of the line at the registry's next edit — not touched here, since the registry is a candidate governance instrument.

---

## 4. Doc-vs-doc contradictions (most load-bearing first)

1. **"Cat 6" definitional strain inside canon.** Ratified instruments (`CONSTITUTIONAL_AUDIT_PROCESS.md:61`, `MARKETING_CLAIM_DISCIPLINE.md:33`) use Cat 6 = "verified live runtime participation" as a clean rung; candidate `THE_GOVERNING_UNCERTAINTY.md:82` §5 argues the ordinal ladder is a flawed projection of three independent axes and "Cat 6" a category error. Ratified canon thus uses a label a candidate doc calls malformed. **Not a defect to fix by edit** — it is a live doctrinal question for Kelly: either ratify the three-axis refinement or note the candidate as dissent. The six-category *count* is consistent everywhere.
2. **"Living Field" scope drift.** Ratified (`CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md:83`): the member's own Living Field, personal. Candidate (`ECOLOGY_OF_MIRRORS.md:110`): widens to "an ontological entity with a developmental trajectory, memory, and relationships" — flagged Vision by its own text. **The ratified personal definition remains authoritative**; the Codex must use it and may cite the widening only as Vision.
3. **Jurisdiction fragmentation — context assembly**: four docs share the domain (ADR-013 Proposed, invariant candidate, seam-gap report, encounter audit). Internally consistent but no single governing doc. Recommend ADR-013's ratification consolidate the chain.
4. **Duplicate-title pairs**: `RESONANT_FIELD_INTELLIGENCE.md` (Cat 1 held) vs `RESONANT_FIELD_INTELLIGENCE_2026-06-24.md` (UNMARKED); `SPIRALOGIC_REGISTRATION_GRAMMAR_2026-07-09.md` (UNMARKED) vs `..._GRAMMAR_SPEC_2026-07-09.md` (FULLY RATIFIED — governs). Recommend supersession banners on the unstatused twins.
5. **Status-vs-location drift**: `WHY_MAIA_REJECTED_CLASSICAL_COGNITIVE_ARCHITECTURES.md` self-marks "Canonical" but lives in `architecture/`; `MAIA_AS_MIRROR_INFRASTRUCTURE.md` self-describes as an internal architecture paper but sits in `canon/` with no status line.
6. **Historical note kept visible**: `CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md:159` records the Recognition-Integrity citation-downgrade-then-ratification arc (now Invariant 16). Invariant ledger confirmed at 16 — no count contradiction.

---

## 5. The unmarked ledger (drift risk, by location severity)

**In `canon/` with no status line (highest risk — location implies authority the text doesn't claim):** 23 documents, including load-bearing ones: **MAIA_OATH** (root vow, unstatused), **RIGHT_TO_REMAIN_UNPOSSESSED** (cited as "sibling canon" by 5+ docs, carries no status itself), **SPIRAL_CONTINUITY_ENGINE** (cited as grounding by the Refusal Registry §7), ENCOUNTER_AS_PRIMITIVE, DISCIPLINED_NON_COLLAPSE, THE_CLEARING, SESSION_ROOM_LIVING_ENCOUNTER, MEDIA_FIELD_AND_RELATIONAL_FIELD_BOUNDARIES, and 15 more (full list in the session-2 agent record).

**In `architecture/` unstatused:** 17 including MEMORY_SERVICE_STATUS_MATRIX (cited as authority elsewhere), KEEP_CAPTURE_TO_ATOMS_AUDIT, SOUL_PORTRAIT_{DEPLOY_POSTURE,PATH_B_SPEC,THRESHOLD}, SOVEREIGNTY_LAYER_STATE.

**In `specs/` unstatused or status-line-absent:** 11+ including COMMS_HONEST_SURFACE, SESSION_ROOM_VIDEO_{SPEC,PHASE1_SCOPE}, SPIRALOGIC_JOURNEY_FRAMEWORK.

**Recommendation (single mechanical pass, Kelly-gated):** a status-line sweep adding one header line per unmarked doc — `Status: Ratified | Candidate | Working | Historical` — starting with the canon/ 23. The Oath being unstatused is a formality (nothing questions its authority) but the formality matters for exactly the reason this reconciliation exists: **location must not silently confer status.**

---

## 6. Authority map (condensed)

| Domain | Governing doc | Overlaps / notes |
|---|---|---|
| Authority direction | CONSTITUTIONAL_DIRECTION_OF_AUTHORITY (ratified) | overlaps ENCOUNTER_AS_PRIMITIVE (unmarked), DEVELOPMENTAL_ECOLOGY (candidate) |
| Relational power | MAIA_SOVEREIGNTY_INVARIANTS (16, constitutional) | Inv 16 = Recognition Integrity |
| Provider/infra | PROVIDER_GOVERNANCE (ratified, machine-enforced) | + OPENAI_QUARANTINE_LEDGER (unmarked) |
| Claims/representation | MARKETING_CLAIM_DISCIPLINE + CORPUS_DISCIPLINE + CONSTITUTIONAL_AUDIT_PROCESS | Cat-6 vocabulary contested by GOVERNING_UNCERTAINTY §5 (candidate) |
| Memory formation | MAIA_MEMORY_CANON v1.0 | 4-way overlap: gradient doc, status matrix (unmarked), expansion plan (frozen) |
| Context assembly | ADR-013 (Proposed) | 4-doc fragmentation; consolidate at ratification |
| Field ontology | CONSTITUTIONAL_DIRECTION (personal, ratified) | heaviest term-overlap cluster; ECOLOGY_OF_MIRRORS widening = Vision only |
| Refusal certification | REFUSAL_REGISTRY (candidate instrument) | grounds partly on unstatused SPIRAL_CONTINUITY_ENGINE |

---

## 7. What session 3 inherits

- Verify the two pre-ratification closures (journal bridge consent gate; Shadow honest threshold) in the member-arc trace.
- Formalize the Sanctuary-periphery pattern (census §6 items 1–3).
- The Cat-6 / three-axis question (contradiction 1) shapes how the trace *reports* liveness — flag, don't resolve.
- Teen-gating absence (census item 10) — constitutional question awaiting Kelly's stamp.
