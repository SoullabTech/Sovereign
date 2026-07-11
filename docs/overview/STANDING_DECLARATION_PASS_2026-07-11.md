# STANDING DECLARATION PASS — 2026-07-11 (proposal, awaiting Kelly's red-line)

**Ref**: `831a0ca24`. **Status of this document**: PROPOSAL — nothing below executes until Kelly red-lines the table and gates the pass open. One signature, one commit, header-level edits only; no semantic content touched.

**The defect this closes** (per `DOCS_RECONCILIATION_2026-07-11.md` §4–5): standing conferred by *position* rather than *declaration* — unstatused docs in `canon/`, unstatused twins, location-status mismatches, and a certification instrument grounding on an unstatused sibling are one species. This pass makes the authority chain self-describing top to bottom.

---

## 1. Status-line format (one line, inserted at top of each doc, below the title)

```
**Status**: <Ratified | Candidate | Working | Historical> — <one clause>. Declared 2026-07-11 (standing declaration pass, Kelly).
```

Vocabulary:
- **Ratified** — settled doctrine others may rely on; changes require Kelly.
- **Candidate** — proposes doctrine; not yet authority; may be cited only as candidate.
- **Working** — maintained reference/map/instrument; authoritative for facts, not for doctrine.
- **Historical** — point-in-time record; retained for lineage; do not cite as current.

## 2. Supersession banner (for duplicate-title twins)

```
> **Superseded**: governed by `<path-to-governing-doc>`. Retained for lineage — do not cite as authority. (2026-07-11)
```

Applies to:
- `docs/architecture/RESONANT_FIELD_INTELLIGENCE_2026-06-24.md` → governed by `RESONANT_FIELD_INTELLIGENCE.md` (Cat 1 held)
- `docs/specs/SPIRALOGIC_REGISTRATION_GRAMMAR_2026-07-09.md` → governed by `SPIRALOGIC_REGISTRATION_GRAMMAR_SPEC_2026-07-09.md` (FULLY RATIFIED)

## 3. Archive banner (for D1)

```
> **Historical — claims retracted**: This document described Shadow Work as a shipped,
> trackable feature. It never persisted data; the surface rendered fabricated values and
> was converted to an honest threshold at `a61d6d1c1` (census audit item 4). Retained for
> lineage — none of its completion claims are current. (2026-07-11)
```

Applies to: `docs/PHASE2_USER_FEATURES_COMPLETE.md` (move to `docs/archive/` with banner).

## 4. The other batched items (execute in the same commit)

- **D2**: `docs/pitch/PITCH_DECK_OUTLINE.md:166` — stamp the Continuity-tier line `(Designed — not yet live; conversational continuity is live)` or Kelly's preferred wording.
- **Matrix supersession note**: one line on `MEMORY_SERVICE_STATUS_MATRIX_2026-05-24.md`: CoherenceFieldService "Wire 2nd" ranking overtaken by `COHERENCE_FIELD_WIRE_UP_SPEC` §0.C freeze.
- **Location fixes by status line, not file moves** (moves churn citations): `WHY_MAIA_REJECTED_CLASSICAL_COGNITIVE_ARCHITECTURES.md` gets its status declared in place; `MAIA_AS_MIRROR_INFRASTRUCTURE.md` gets `Working — internal architecture paper` despite sitting in `canon/`.
- **Refusal Registry grounding**: when `SPIRAL_CONTINUITY_ENGINE.md` receives its status line, add the strike-through on the dangling `WISDOM_IS_RECOVERED.md` half of `REFUSAL_REGISTRY.md:109` — the registry's own chain then reads clean.

## 5. Proposal table (derived from doc content at `831a0ca24` — red-line the middle column)

Rows with `A ? B` carry a genuine tiebreaker (TB) for Kelly; all others are proposed with confidence.

### canon/ (23)

| path | proposed | basis |
|---|---|---|
| CIRCLE_FIELD_DOCTRINE.md | Ratified | self-labeled governing doctrine; cited |
| DISCIPLINED_NON_COLLAPSE.md | Ratified | "Phase 0 canon"; cited 7× |
| ENCOUNTER_AS_PRIMITIVE.md | Ratified | "Foundational ontology"; cited 5× |
| MAIA_AS_MIRROR_INFRASTRUCTURE.md | Working ? Ratified | self-describes internal paper; TB: cited as binding or as explanation? |
| MAIA_ASK_LAYER.md | Working ? Candidate | capability + roadmap; TB: layer live or proposed? |
| MAIA_CONNECTOR_EXPERIENCE.md | Candidate | draft, uncited |
| MAIA_FOUNDATIONAL_CONTEXT.md | Working | self-labels "orienting scaffold, not doctrine" |
| MAIA_KNOWLEDGE_FIELD_12_DOMAIN_MAP.md | Working | living domain map |
| MAIA_MEMORY_ROADMAP.md | Working | "single source of truth," governance-read |
| MAIA_OATH.md | Ratified | the Oath; most-cited (20×) |
| MAIA_SPOKEN_MANIFESTO.md | Ratified | settled declaration |
| MAIA_SYSTEM_MAP.md | Working | structural map/reference |
| MEDIA_FIELD_AND_RELATIONAL_FIELD_BOUNDARIES.md | Candidate | self-marked "Canon — DRAFT" |
| RIGHT_TO_REMAIN_UNPOSSESSED.md | Ratified | doctrine; cited 14× |
| SACREDNESS_AS_ARCHITECTURAL_ORIENTATION.md | Ratified | self-labeled protective doctrine |
| SESSION_ROOM_LIVING_ENCOUNTER.md | Ratified | "architectural north star"; cited |
| SOULLAB_THEME.md | Working | maintained design-token reference |
| SOULLAB_VOICE_DOCTRINE_DAOIST.md | Ratified | "operating system for all Oracle responses" |
| SPIRAL_CONTINUITY_ENGINE.md | Ratified | continuity doctrine; cited 14×; unlocks Refusal Registry chain (§4) |
| SYMBOLIC_GUIDANCE_LAYER_DOCTRINE.md | Ratified | self-labeled integration doctrine |
| THE_CLEARING.md | Ratified | "what architecture is answerable to"; cited 14× |
| THE_SACRED_AND_ITS_ARCHITECTURE.md | Working | self-labeled "working paper — internal" |
| TRANSPARENT_ENCHANTMENT.md | Ratified | carries "Status: Canon" in body |

### architecture/ (16)

| path | proposed | basis |
|---|---|---|
| AI_ENGINE_PARTICIPATION_AUDIT_2026-05-26.md | Historical | dated audit |
| FRAMEWORK_ACCESS_MAP_2026-05-25.md | Working ? Historical | TB: wiring kept current? |
| INTERPRETIVE_COUNCIL.md | Working | self-labeled architecture reference |
| KEEP_CAPTURE_TO_ATOMS_AUDIT_2026-05-26.md | Historical | dated audit, uncited |
| MEMORY_SERVICE_STATUS_MATRIX_2026-05-24.md | Working ? Historical | TB: updated in place or snapshot? Census note: content re-verified still-true 2026-07-11; supersession note on Wire-2nd rides in this pass either way |
| MOVE_2_DIAGNOSTIC_2026-05-24.md | Historical | dated read-only diagnostic |
| OPENAI_QUARANTINE_LEDGER.md | Working | living ledger; defers to Provider Governance |
| RESONANT_FIELD_INTELLIGENCE_2026-06-24.md | Historical | census note: supersession banner (§2) already assigns governance to the Cat-1 twin — Historical follows |
| SEMANTIC_MEMORY_SURFACEABILITY_DIAGNOSTIC.md | Historical | dated diagnostic |
| SOUL_PORTRAIT_DEPLOY_POSTURE.md | Working ? Ratified | governs deploy gates; TB: settled or evolving? |
| SOUL_PORTRAIT_PATH_B_SPEC.md | Candidate | "awaiting Kelly's explicit go" |
| SOUL_PORTRAIT_THRESHOLD.md | Candidate | draft closing design |
| SOVEREIGNTY_LAYER_STATE_2026_05_23.md | Historical | dated state snapshot |
| WHAT_MAIA_IS_FIELD_FIRST_ARCHITECTURE.md | Ratified | "canonical reference"; cited 5× |
| WHAT_NOW_ENCOUNTER_INTELLIGENCE_AUDIT_2026-07-08.md | Historical | dated audit/report |
| WRITING_PROJECT_LAYER.md | Candidate | draft framing, uncited |

### specs/ (16)

| path | proposed | basis |
|---|---|---|
| COMMS_HONEST_SURFACE_2026-06-11.md | Historical | one-time honesty-pass brief (its doctrine now lives in the code + census) |
| CONVERSATIONAL_KEEP_IOS_SMOKE_TEST.md | Working ? Historical | TB: reusable test plan or one-time? |
| ENCOUNTER_EPISTEMIC_VERIFIER.md | Candidate | census note: verifier recorded PENDING in project memory — Candidate until built |
| MAYAN_PROVENANCE_AWARE_ARCHITECTURE_SPEC_2026-06-05.md | Candidate | "PROPOSED (spec only)" |
| PERSONAL_FIELD_REDESIGN_2026-06-15.md | Candidate | "not authorized to build" |
| SESSION_ROOM_PHASE3_PR2_NOTES_2026-06-15.md | Historical | dated PR notes |
| SESSION_ROOM_VIDEO_PHASE1_SCOPE_2026-06-14.md | Working | census note: video still not built (census §2.1), so the scope doc remains the forward plan |
| SESSION_ROOM_VIDEO_SPEC_2026-06-14.md | Working ? Ratified | partly live + amended; TB: amendable spec or fixed canon? |
| SPIRALOGIC_JOURNEY_FRAMEWORK_2026-07-09.md | Candidate | carries "FRAMEWORK CANDIDATE" |
| SPIRALOGIC_REGISTRATION_CONFORMANCE_REPORT_2026-07-09.md | Historical | dated report |
| SPIRALOGIC_REGISTRATION_GRAMMAR_2026-07-09.md | Working | as-built extraction; supersession banner (§2) still applies — SPEC variant governs |
| ATTENTION_SUBSTRATE_GENERALIZATION_2026-06-06.md | Candidate | proposed spec |
| COLAB_ATTENTION_LAYER_SPEC_2026-06-06.md | Candidate | proposed spec, "nothing Live yet" |
| SESSION_ROOM_JOIN_TOKEN_DESIGN_2026-06-14.md | Candidate | "design locked — no code yet" (note: census shows join-token ENFORCED in the open room; consider Working) |
| spiral-patterns-spec.md | Candidate | uncited product spec |
| PSYCHE_ENGAGEMENT_LAYER_SPEC.md | Candidate | draft; "canons remain prior" |

**Open tiebreakers for the red-line (8)**: MAIA_AS_MIRROR_INFRASTRUCTURE · MAIA_ASK_LAYER · FRAMEWORK_ACCESS_MAP · MEMORY_SERVICE_STATUS_MATRIX · SOUL_PORTRAIT_DEPLOY_POSTURE · CONVERSATIONAL_KEEP_IOS_SMOKE_TEST · SESSION_ROOM_VIDEO_SPEC · SESSION_ROOM_JOIN_TOKEN_DESIGN. Three of the reader's original ten were resolved by census facts (annotated in place).

## 6. Execution mechanics (after red-line)

Single commit: `docs(standing): declare status on N docs — standing declaration pass (Kelly-gated)`. No other files touched. Census delta discipline: this pass is header-only and does not invalidate census stamps.
