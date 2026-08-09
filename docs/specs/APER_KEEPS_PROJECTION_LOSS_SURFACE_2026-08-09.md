# APER v1 — Keeps Projection Proof: Exact Loss Surface

**Date**: 2026-08-09
**Authorized by**: founder, 2026-08-09 — Step 2, Keeps only
**Governed by**: `docs/specs/AIN_PORTABLE_EPISTEMIC_RECORD_SPEC_2026-08-09.md`
**Status**: proof complete · **STOPPED at the authorized boundary**

---

## 1. What was built

| Path | Role |
|---|---|
| `lib/ain/portable/types.ts` | APER v1 envelope types + closed vocabularies + refusal codes |
| `lib/ain/portable/projectKeep.ts` | `projectKeep(row, projectedAt)` — pure, no I/O · `authorityOf(record)` |
| `lib/ain/portable/__tests__/projectKeep.test.ts` | 33 tests — §16 obligations, §9 A1–A8, §0.1 envelope guard |

**Result**: 33/33 pass. `npm run typecheck` — no regressions (237 errors vs. 239 baseline; 2 fixed, 0 new).

`projectKeep` performs no I/O, writes no files, and contains no reference to Obsidian or any destination. Per §0, that is the test of the contract: if it could not be satisfied without destination-specific mechanics, the contract would be wrong.

---

## 2. The §16 obligation — verified

Each preserved, with the test that proves it:

| Must not lose | How it survives | Test |
|---|---|---|
| Canonical identity | `ain://member_memory_atoms/<id>` — tombstone-compatible (I7) | *preserves canonical identity* |
| Epistemic status | `declared` for member-placed keeps; §3.5 mapping for practitioner atoms | *preserves epistemic status*, §3.5 suite |
| Provenance | status-conditional: `authoredBy`/`observedBy`/`derivedFrom` — refuse if absent | A2 suite |
| Authorship | `authoredBy: {ref, role: member}` + `authoredAt` from `kept_at` | *preserves authorship* |
| Source relationship | `contentDisposition: referenced` + `sourceRef`; **content does not travel** | *preserves the source relationship* |
| Consent / visibility | `visibility` from scope+status; `circulation` from `return_preference` | *preserves consent/visibility* |
| Member-marked significance | `marked[]` from `is_breakthrough` / `still_alive` / `protected` only | *preserves member-marked significance* |

**A7, the adversarial test, holds.** Five separate attempts to launder a `derived` keep into a `declared` one all fail — including editing the projected record externally and reading it back. The tampered artifact may *look* declared (nothing stops a text editor), but AIN's canonical row is unmoved, re-projection still yields `derived`, and the tampered record's own `ainRef` points at the row that contradicts it. **The external environment is not an authority-upgrade channel.**

---

## 3. THE LOSS SURFACE — every field intentionally omitted

This is the deliverable. Nothing here is a bug; each is a decision, with its reason.

### 3.1 Omitted rather than distorted

| Canonical field | Why omitted |
|---|---|
| `registers[]` / `primary_register` | Member-placed **vantage points**, not marks and not categories. Forcing into `marked` would misrepresent them as significance; a `tags` field would let a destination treat them as system taxonomy. Both distort. §10.2. |
| `elemental_lenses[]` | Same reasoning. A lens is a way of seeing, not a property of the record. |
| `thread_ids[]` | Connective tissue across atoms. Projecting one side of a graph edge produces a dangling reference in an environment that cannot resolve it. |
| `surface_count` / `last_surfaced_at` | System-side usage telemetry, not member memory. Projecting it would export behavioral observation the member never authored. |
| `last_touched_at` | Interaction telemetry. Same reasoning. |
| `crossing_allowed` | Constrained `FALSE` system-wide. Nothing yet to represent. |
| `marked_breakthrough_at` | The mark travels in `marked[]`; the timestamp is Keep-internal detail. Carrying it would drift toward §0.1 envelope bloat. |

Test `registers and elemental lenses do NOT appear in the envelope` asserts these are absent from the serialized record — not merely unused.

### 3.2 Compressed — recoverable only via `ainRef`

| Canonical | Projected | Loss |
|---|---|---|
| `epistemological_status` (5 values) | `epistemic_status` (3 values) | `reported`/`claimed` → both `declared`; `inferred`/`provisional` → both `derived`. Distinction recoverable only by following `ainRef` back to the row. |
| `status` (5 values) | `marked[]` + refusal | `active` vs. `set_aside` vs. `archived` all project identically. `set_aside` (parked, lower weight) and `archived` (removed from active recall) become indistinguishable in transport. |

**This is intentional under §0.1** — APER carries the transport-stable partition, not the full governed vocabulary. The consequence to state plainly: **a projected record is never a substitute for the canonical row.** It is a pointer with enough epistemic character to be safely read.

### 3.3 Not populated in v1

| Field | Why |
|---|---|
| `about[]` | Always `[]`. A Keep has no canonical subject-link column. Populating it would require inferring subjects from content — exactly F7 (identity collapse) plus an inference AIN has no authority to make. Empty rather than guessed. |

### 3.4 Refused entirely — never projected

| Refusal | Scope of loss |
|---|---|
| `sacred_protected` register | Non-circulating. A different medium does not change that. |
| `status = 'protected'` | Held without circulation. |
| `memory_scope != 'personal'` | **Whole classes of Keeps do not project in v1**: every `colab`, `client`, and `encounter` atom. These belong to shared containers whose boundary the loader enforces structurally in SQL; projecting one into an individual's environment would cross it. Refused rather than decided. |
| `practitioner_observation` without `facilitator_id` | Mirrors `PRACTITIONER_ATTRIBUTION_GUARD` — would present "a practitioner observed…" with nothing behind it. |
| Unknown enum values | I6 — refuse, never coerce to nearest match. |
| Sourcing-discipline violations | Mirrors the DB CHECK. |

Refusal reasons are asserted never to quote member content or titles (A8).

---

## 4. Findings that changed the spec

Two things surfaced during grounding that the spec, as originally written, had wrong. Both are amended in place.

**4.1 — AIN already has an epistemic vocabulary.** `member_memory_atoms.epistemological_status` (migration `20260624000001`, live in `lib/maia/memoryAtomsLoader.ts:111-116`) carries five values: `observed · reported · inferred · provisional · claimed`. The spec was drafted as though AIN were epistemically silent. It is not. APER v1 is now defined as a **projection of the governed vocabulary**, not a new one — which is the §0.1 envelope amendment applied to the spec itself. Recorded as §3.5.

**4.2 — a name collision, flagged not resolved.** AIN's `observed` means *a facilitator witnessed this in session*. APER's `observed` means *a recorded occurrence*. They coincide for practitioner atoms but are not the same concept, and the shared spelling will mislead anyone who knows one and not the other. Renaming a live column is out of scope; the collision is documented at §3.5 with the standing rule that **any future third use of the word must be checked against both**.

A third finding of note: the loader's `MemoryAtomSnapshot` is **prompt-shaped** and drops `memory_scope`, `source_id`, and `updated_at`. Projecting from it would have silently lost the consent axis. `projectKeep` therefore takes a structural `KeepRow` over the canonical columns instead.

---

## 5. Still unresolved — unchanged by this work

- **F3 staleness** — `sourceUpdatedAt` detects divergence. Nothing reconciles it. Accepted for v1 (§15.1).
- **F8 deletion survivorship** — no mechanism retracts a projection. Deferred to separate sovereignty ruling (§15.2). The tombstone-compatible `ainRef` shape means projections are *identifiable*; whether they can be *acted on* is undecided.

Neither blocked this step, per the ruling.

---

## 6. Stopped here

Per §16, work stops at the Keeps projection proof.

**Not built, not started, requiring separate authorization**: traversal · traversal-to-ingestion · round-trip mutation · sync · any destination writer (including Obsidian) · any other `ain_type` · adapter cleanup (audit §I.F) · any automatic or scheduled projection.

**No member gesture is wired.** `projectKeep` has no caller. Under project stage-language this is **built and proven**, not wired and not live. I8 requires that any future caller be gated on an explicit member act — never a config flag, never `autoExport`, never a side effect.

---

## 7. Claim discipline

- **Live**: nothing.
- **Designed**: `projectKeep` — pure function, 33 passing tests, no caller.
- **Vision**: everything else in the spec.

**Failure test unchanged**: if this ships and members' external environments accumulate records where MAIA-derived content is indistinguishable from their own declarations, the design has failed and must be withdrawn, not patched.
