# MAIA-MEMORY-ATTRIBUTION-01 / R0 — Current-Canonical Reconciliation

```text
STANDING            EVIDENCE · normative authority NONE
BASE                clean-main-no-secrets @ 4ad29690cdbd6839e16c3028aa65a9c9e04099bf
DONOR INSPECTED     3e31bc0ff4e050f9cfd35bdc68c70fbcb772e56c (Path B, fetched by SHA, read-only)
INHERITS            AIN-STANDING-01 R1/R2 (closed: shared implementation NOT EARNED; local repairs only)
DATE                2026-10-01
CODE / SCHEMA       none changed · nothing deployed · production not read
```

R0 asked one question:

> Can the live FAST memory path be made truthfully attributed by recovering/reconciling
> already-governed P6/CMT mechanisms, without opening M3 or introducing a new standing vocabulary?

**Answer: the question is already owned. A governed dependency chain exists and is the
binding authority; R0 opens no new lane.** The rest of this record is the evidence.

---

## 1. Where the "absent" P6 went

The umbrella charter (`MAIA_JARVIS_MEMORY_ORGANISM_FULL_OPERATIONALIZATION.md` §8–§11) names the
P6 substrate. It is absent from canonical **because it was never in canonical lineage** — it
lives on Path B, which is still recoverable by SHA:

| Artifact | Canonical `4ad29690` | Path B `3e31bc0ff` |
|---|---|---|
| `lib/psyche/returnAuthority.ts` | ABSENT | present (166 l) |
| `lib/maia/participationGate.ts` | ABSENT | present (193 l) |
| `lib/maia/consentGates.ts` | ABSENT | present (178 l) |
| `lib/memory/breakthroughParticipation.ts` | ABSENT | present (124 l) |
| `lib/maia/sovereignDisposition.ts` (P1c) | ABSENT | present (1069 l) |
| `lib/maia/turn/*` (8 modules) | ABSENT | present |
| `database/migrations/20260903000001_return_authority_fail_closed.sql` | **ABSENT** | present |
| `docs/specs/MIPA_PHASE_0_SOVEREIGNTY_PREREQUISITES_SPEC.md` | ABSENT | present (1780 l) |
| CMT spec | at `docs/programme/MAIA_CANONICAL_TURN_ARCHITECTURE_SPEC_v0.1.md` | at `docs/architecture/…` |

⚠️ The charter's citation `docs/architecture/MAIA_CANONICAL_TURN_ARCHITECTURE_SPEC_v0.1.md` and
`docs/specs/MIPA_PHASE_0_…` do not resolve on canonical. Citation defect, recorded, not repaired.

## 2. The lineage decision was already made

`JARVIS-MEMORY-ORGANISM-PASS1-DIVINATION-01.md` header, founder directive 2026-09-03:

> **Lineage**: the one that lives — `lib/maia/canonical-turn/**`, pdc-1 participation
> vocabulary, current `/list` canonical shadow. **No Path B constructor. No second shadow.**

So Path B's status is **DONOR**, never lineage. Its turn constructor (`lib/maia/turn/*`) is
**superseded** by `lib/maia/canonical-turn/**`. The charter's §11 step 1 ("decide the turn
boundary") reads as open; the downstream lane record shows it was taken.

## 3. Classification of the Path B material

| Class | Items | Basis |
|---|---|---|
| **SUPERSEDED historical mechanism** | `lib/maia/turn/*` constructor, providers, profiles, Path-B shadow | §2 lineage ruling; a second shadow is forbidden |
| **Possibly-applicable donor mechanism** | `returnAuthority.ts`, `participationGate.ts`, `consentGates.ts`, `breakthroughParticipation.ts`, `sovereignDisposition.ts` (P1c) | Certified on Path B against Path B's types; **never certified against `canonical-turn` or pdc-1**. Donor ≠ admissible: each would need re-certification in the kept lineage |
| **Missing canonical functionality** | practitioner-observation return authority; machine-inferred attribution in FAST; computed vs member-marked breakthrough separation | R1 G2/G4 + charter §9 findings 2–3 |

## 4. A sharper finding than R1 carried: schema and repository disagree

- Path B migration `20260903000001` sets `member_memory_atoms.return_preference` DEFAULT to
  `'member_pulled'` and flips existing practitioner rows from `'contextual_doorway'`.
- Canonical writer `app/api/studio/with-me/sessions/[sessionId]/route.ts:148` still INSERTs the
  literal `'contextual_doorway'`, overriding any default.
- The charter (§6 row, §9 finding 2) **records** the migration as applied to the production
  schema. ⛔ R0 did not read production; this is a **recorded claim, not witnessed here**.

If the recorded claim holds, two consequences follow, both now stated plainly:

1. **Repository provenance gap.** Production `schema_migrations` carries a migration that no
   canonical file reproduces. A disposable shadow built from canonical would not match
   production on this column default. Same family as the 2026-09-07 schema-drift finding.
2. **The P6 violation is still being written.** Every practitioner observation inserted after
   that migration bypasses the fail-closed default by explicit literal — i.e. the writer
   confers return authority the member never conferred. The charter's product doctrine
   (*confer broadly via Continuity Mode, then remember*) does not license this: Continuity Mode
   is not built, so no member act exists to carry the authority.

## 5. Governing chain for attribution (binding authority, already recorded)

```text
MEMORY-PRODUCER-PARTITION-01        "prerequisite to P6 proper. Not P6."
        ↓
MAIA-UNIFIED-COGNITION-CONVERGENCE-01
   Cut 1A  BUILT · local PASS · PRODUCTION WITNESS PENDING (§9.7, founder ruling 2026-09-05:
           declared identity AND runtime artifact attestation both required)
   Cut 1B  NOT OPENED
        ↓
P6 (attribution framing)            CLOSED until the prerequisite is built AND witnessed
        ↓
M3 cutover                          UNAUTHORIZED
```

No later record on canonical reports the Cut 1A production witness
(`CI-EXACT-SHA-CHECKS-01.md` still says Cut 1A "requires its own separate sign-off").
**Cut 1A stands UNWITNESSED; P6 stands CLOSED.**

⚠️ **Naming collision, recorded not resolved:** "P6" names two things — MIPA Phase 0 P6
(practitioner return authority, certified on Path B) and the later "P6 attribution framing"
gated by the convergence lane. The charter's §11 step 2 bundles both. They have different
gates and must not be adjudicated as one.

## 6. R0 disposition per AIN-STANDING local gap

| Gap | Owner | Standing after R0 |
|---|---|---|
| G1 developmental source-turn ancestry | none | FOUND · NOT OPENED · not P6 · no authority exists to open it |
| G2 MemoryBundle → FAST attribution | CONVERGENCE-01 → P6 | **BLOCKED on Cut 1A production witness.** Recovering Path B code here would bypass a founder-ruled gate |
| G3 `retrieved.member_web` mixed authorship | MEMORY-PRODUCER-PARTITION-01 | unchanged; excluded from attribution closure per §9.6 |
| G4 computed vs member-marked breakthrough | MIPA P3/P6 donor + canon | donor exists (`breakthroughParticipation.ts`); admission waits on the same chain |
| G5 programme status/custody index | JEV (named, not opened) | unchanged |
| **NEW G6** practitioner-observation writer vs P6 schema | MIPA P6 (donor `returnAuthority.ts`) | **FOUND · decision owed.** Not gated by Cut 1A: it is a writer-side return-authority defect, not prompt attribution |

## 7. What R0 does not establish

- that the P6 migration is applied in production (recorded claim only);
- that any Path B module is admissible in the kept lineage;
- that Cut 1A has or has not run in production — only that no canonical record witnesses it;
- any repair, schema, deploy, or M3 authority.

## 8. Next lawful acts (founder-owned, none taken)

1. **G6 — one read-only production witness**, before anything else: does
   `schema_migrations` contain `20260903000001`; what is the current `return_preference`
   default; how many `practitioner_observation` rows carry `contextual_doorway` with
   `created_at` after that migration's apply time. Two outcomes:
   - applied → canonical must either carry the migration file (provenance) and stop the
     literal override, or record a ruling that practitioner return is conferred otherwise;
   - not applied → the charter's finding 2 is false as recorded and is corrected in place.
2. **Cut 1A production witness** under its §9.7 bar. Until then G2/G4 attribution work is
   not lawful, and recovering Path B code to do it would be the bypass this chain exists to
   prevent.

*R0 is evidence. It reconciles the record with the tree; it does not rule.*
