# Keep/Capture → Semantic Atoms Audit

**Date**: 2026-05-26
**Author**: Audit pass following Kelly directive (same date)
**Scope**: every Keep / Capture write path in `app/` and `lib/`, classified against the atom-substrate rule

---

## 0. Rule under audit (Kelly 2026-05-26)

> *Keep/Capture is the member gesture. Semantic atoms are the memory substrate. They should not be parallel systems — Keep/Capture should be the front door into semantic memory atoms.*

Operational corollary:

> *No Keep/Capture without an atom.*
> *No atom without member gesture.*
> *No surfacing without recall consent.*

Source tables (`reflection_capsules`, `memory_tool_store`, `journal_memory_packets`, `case_memory_chunks`, `conversation_memory_uses`, etc.) are allowed to persist as detail stores. What must **not** be allowed is for a member gesture to land in a source table without an accompanying row in `member_memory_atoms` carrying `source_type` + `source_id` back to it.

The atom is the **canonical continuity anchor**; the source row is **detail**.

---

## 1. What "Keep" and "Capture" actually mean in code today

Two distinct vocabularies, two distinct architectural spaces:

| Verb | Space | Where it lives | Writes atom? |
|------|-------|----------------|--------------|
| **Keep** | Psyche/Portfolio | `/api/psyche/portfolio/keep` → `lib/psyche/portfolio.ts::keepSource` | **Yes** ✅ — INSERTs `member_memory_atoms` |
| **Capture** (v1) | Legacy session capture | `/api/v1/capture/*` → capture sessions/notes tables | **No** ⚠️ |
| **Capture** (capsule) | Reflection Capsules | `/api/capsules/*` → `lib/capsules/capsuleService.ts::createCapsule` | **No** ⚠️ |
| **Capture** (studio) | Studio field input | `/api/studio/field/capture` | **No** ⚠️ |
| **Capture** (ideas) | Idea inbox | `/api/ideas/capture` → `member_ideas` | **No** ⚠️ |
| **Mark Still Alive / Touch / Mark Breakthrough** | Atom gestures | `/api/psyche/portfolio/atoms/[id]/gesture`, `/api/sovereign/atoms/[id]/breakthrough`, `/api/psyche/portfolio/atoms/[id]/lens-passes` | **Updates** existing atoms ✅ |

The "Keep" gesture is currently the **only** member action that produces a canonical atom. Every other gesture labelled "capture" writes to a source table and stops.

This is the gap the audit is naming.

---

## 2. A — Atom write paths ✅

Paths that produce or mutate `member_memory_atoms` rows.

| Path | What it does | Source linkage |
|------|--------------|----------------|
| [`app/api/psyche/portfolio/keep/route.ts:114`](app/api/psyche/portfolio/keep/route.ts:114) | `await keepSource(memberId, { ...validated, memberId })` — explicit member-keep gesture. The formation event. | `source_type` + `source_id` from validated input; required by DB CHECK for non-`spontaneous` types |
| [`lib/psyche/portfolio.ts:334`](lib/psyche/portfolio.ts:334) | `keepSource()` — INSERT into `member_memory_atoms` with `status='active'`, `kept_at=NOW()`. Source service. | Enforces: `'spontaneous'` requires `body`; all other source types require `sourceId` |
| [`app/api/psyche/portfolio/atoms/[id]/gesture/route.ts`](app/api/psyche/portfolio/atoms/[id]/gesture/route.ts) | Atom mutations via `applyAtomGesture()` — set return preference, thread binding, lens edits, mark still alive. The only mutation surface besides keepSource. | n/a (acts on existing atom) |
| [`app/api/sovereign/atoms/[id]/breakthrough/route.ts:88`](app/api/sovereign/atoms/[id]/breakthrough/route.ts:88) | Writes `is_breakthrough=true` + `marked_breakthrough_at=NOW()`. **System never sets** — member-only. Schema constraint `breakthrough_flag_timestamp_coherent` enforces alignment. | n/a |
| [`app/api/psyche/portfolio/atoms/[id]/lens-passes/route.ts`](app/api/psyche/portfolio/atoms/[id]/lens-passes/route.ts) | INSERT `member_lens_passes` + UPDATE atom `last_touched_at`. Records elemental-lens encounter. | n/a |

**Invariant observed in `keepSource` (preserve in any adapter)**: `crossing_allowed` defaults to `FALSE` at the DB level and is **never written** by the service. DB CHECK constraint will reject any attempt to flip it from application code.

---

## 3. B — Source-only write paths ⚠️ (the gap)

Paths that record member intent but never reach the atom layer. **These are the orphans.**

| Path | Writes to | Missing atom linkage |
|------|-----------|----------------------|
| [`app/api/capsules/from-text/route.ts`](app/api/capsules/from-text/route.ts) → [`lib/capsules/capsuleService.ts:70`](lib/capsules/capsuleService.ts:70) | `INSERT INTO reflection_capsules` | Should also call `keepSource(memberId, { sourceType: 'reflection', sourceId: capsule.id, title, ... })` |
| [`app/api/capsules/from-chat-window/route.ts`](app/api/capsules/from-chat-window/route.ts) | `reflection_capsules` (via LLM distillation) | Same — no atom row |
| [`app/api/capsules/[id]/route.ts`](app/api/capsules/[id]/route.ts) (PATCH) | `reflection_capsules` (pin, archive, edit) | These are post-keep state changes on a capsule, but the underlying atom that should mirror them does not exist |
| [`app/api/v1/capture/note/route.ts:78`](app/api/v1/capture/note/route.ts:78) | `addNote()` → `capture_sessions`/`capture_notes` (legacy) | No atom; no `source_type='capture_note'` exists in the atom union either |
| [`app/api/studio/field/capture/route.ts`](app/api/studio/field/capture/route.ts) | Studio field capture store | No atom |
| [`app/api/ideas/capture/route.ts`](app/api/ideas/capture/route.ts) | `member_ideas` | Ideas only become atoms when explicitly kept via `/api/psyche/portfolio/keep` with `sourceType: 'idea'` — there is no auto-promotion |

### Headline finding

**Reflection Capsules — the UI surface I just shipped element filtering for at `/labtools/reflections` — does not produce semantic atoms.** Every capsule the member has created is invisible to:

- `loadMemberMemoryAtomsForPrompt()` ([`lib/maia/memoryAtomsLoader.ts`](lib/maia/memoryAtomsLoader.ts)) → does not feed FAST/CORE conversational prompts
- Portfolio listing / lens passes / breakthrough marking
- Cross-session recall via the atoms loader
- The `is_breakthrough` member gesture (no atom to mark)

The capsule is *arrival*. There is no *keeping*.

This is exactly the architectural drift the rule was written to prevent.

---

## 4. C — Read-only atom paths (no writes, FYI)

| Path | Surface |
|------|---------|
| [`lib/maia/memoryAtomsLoader.ts:168`](lib/maia/memoryAtomsLoader.ts:168) | `loadMemberMemoryAtomsForPrompt()` — consent-gated prompt loader. Filters: `status IN ('active','still_alive')`, `return_preference IN ('contextual_doorway','ritual_review_opt_in')`, **NOT** `'sacred_protected'` register. Default `return_preference` is `'member_pulled'` → atoms do not auto-surface until member opts up. |
| [`lib/psyche/portfolio.ts:135`](lib/psyche/portfolio.ts:135) | `getAtom()`, `listAtoms()`, `listLensPasses()` — read services |
| [`app/api/consciousness/analyze/route.ts`](app/api/consciousness/analyze/route.ts) | Reads atoms for breakthrough state + profile |
| [`app/api/oracle/conversation/route.ts`](app/api/oracle/conversation/route.ts) | Reads atoms via loader for prompt context (CUT 1 Phase 1 Psyche Engagement Layer) |

---

## 5. D — Dead/dormant paths

| Path | Why dormant |
|------|-------------|
| [`app/api/v1/capture/status/route.ts`](app/api/v1/capture/status/route.ts) | Legacy v1 capture session lookup; no atom involvement |
| [`app/api/v1/capture/export/route.ts`](app/api/v1/capture/export/route.ts) | Exports v1 capture notes; no atom involvement |

These are not actively harmful but should be marked dormant in any cleanup pass following the adapter landing.

---

## 6. Source-type union: is the slot already there?

`MemoryAtomSourceType` ([`lib/psyche/types.ts:33`](lib/psyche/types.ts:33), mirrored at [`lib/maia/memoryAtomsLoader.ts:73`](lib/maia/memoryAtomsLoader.ts:73)):

```
'idea' | 'idea_block' | 'journal' | 'dream' | 'reflection' |
'decision' | 'change' | 'session_excerpt' | 'spontaneous'
```

**`'reflection'` is already in the union.** Reflection Capsules have a designated source slot in the atom substrate — no schema motion required. The slot is empty because no code populates it.

Other source types named in the union but with no corresponding capture path that writes through `keepSource`:

- `'journal'` — does `journal_memory_packets` write a `keepSource(... sourceType: 'journal')` companion? Audit suggests no — needs separate verification pass before claiming so.
- `'dream'`, `'decision'`, `'change'`, `'session_excerpt'` — same question, scoped beyond this pass.

This audit asserts only what it has verified: **capsule creation does not write an atom**.

---

## 7. Proposed adapter shape (contract, not implementation)

A single adapter function used by every Keep/Capture surface that intends to be a member gesture:

```
createMemberMemoryAtomFromKeep({
  memberId,
  sourceType,    // MemoryAtomSourceType (must be in the union)
  sourceId,      // PK of the row in the source table (required unless 'spontaneous')
  title,         // human-meaningful anchor; usually source.title
  body?,         // optional summary or excerpt; required if sourceType='spontaneous'
  primaryRegister?, registers?, elementalLenses?, threadIds?,  // optional shape, defaults to []
}) → CrystallizedMemory
```

### Contract

1. **Idempotent on `(member_id, source_type, source_id)`.** Re-keeping the same source must not create duplicate atoms. Use UPSERT with an appropriate unique constraint (or check-then-insert with a transaction). DB constraint should be added if not already present.
2. **`crossing_allowed` MUST NOT be touched.** DB default `FALSE`; service never writes. This is the sovereignty seam — preserve it.
3. **`return_preference` defaults to `'member_pulled'`** (the loader's silent default). Capsule keeping does NOT auto-promote to `'contextual_doorway'`. The member must explicitly opt up via the atom-gesture surface. *No surfacing without recall consent.*
4. **`status = 'active'`, `kept_at = NOW()`, `last_touched_at = NOW()`.** Same as `keepSource`.
5. **Fire-and-forget at the call site is acceptable** (mirrors `voiceSovereignty` and `upsertSpiralState` patterns), but a failed atom write must be logged with a marker the ops grep contract reads — propose `[atoms-adapter] keep-from-source failure-empty { sourceType, sourceId, error }` to keep the failure-empty discipline from the atoms-loader fix. *(Per [project_observability_emission_plus_discoverability](memory:project_observability_emission_plus_discoverability) — emission alone isn't observability; the marker must match the grep contract.)*
6. **Reflection Capsules + capsule edits**: `from-text` and `from-chat-window` should call the adapter on success. PATCH on `[id]` (pin/archive/edit) should `applyAtomGesture` or `touchAtom` to keep `last_touched_at` aligned.

### Where the adapter lives

`lib/psyche/keepFromSource.ts` (new file) — thin wrapper around `keepSource` that handles the source-table → atom translation per source type. Re-exports through `lib/psyche/index.ts`.

Importantly, `keepSource` already enforces the right invariants — the adapter is mostly:
- correct source_type mapping
- idempotency check
- failure observability

It is **not** a re-implementation of `keepSource`.

---

## 8. Sovereignty invariants the adapter must preserve

Carried forward from `keepSource` and from the canonical principles in [`docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md`](docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md):

| Invariant | Mechanism |
|-----------|-----------|
| Arrival ≠ keeping | Adapter fires only on the **member's** keep gesture, not on arrival in the source table. (For capsules: the existing `POST /api/capsules/from-*` *is* a member gesture — a button press to capture — so it qualifies. Background/system inserts must not call the adapter.) |
| No stealth memory | `return_preference` defaults to `'member_pulled'` — surfacing requires explicit opt-up |
| Sanctuary preserved | Sanctuary sessions must short-circuit the adapter at the route level; sanctuary inputs do not become source rows in the first place |
| Member-only breakthrough | Adapter never sets `is_breakthrough` — that remains the `/api/sovereign/atoms/[id]/breakthrough` member surface |
| `crossing_allowed` immutable from app code | Adapter never writes it; DB CHECK rejects any attempt |

---

## 9. Verification claims (load-bearing facts confirmed before writing this doc)

Per the memory discipline *"a memory that names a specific function or file is a claim that it existed when the memory was written — verify before recommending"*:

- ✅ `keepSource` exists at `lib/psyche/portfolio.ts:334` and INSERTs `member_memory_atoms`
- ✅ `'reflection'` is in `MemoryAtomSourceType` union (`lib/psyche/types.ts:33`)
- ✅ Three capsule routes (`from-text`, `from-chat-window`, `[id]`) plus index `route.ts` exist under `app/api/capsules/`
- ✅ `grep -rEn 'member_memory_atoms|keepSource|createMemberMemoryAtom' app/api/capsules/ lib/capsules/` returns zero hits
- ✅ `createCapsule` at `lib/capsules/capsuleService.ts:51` INSERTs only into `reflection_capsules`
- ✅ `loadMemberMemoryAtomsForPrompt` exists at `lib/maia/memoryAtomsLoader.ts` and is consent-gated as documented

---

## 10. What this audit does NOT claim

- Does **not** claim the adapter is implemented. Architectural fix proposed only; no code changes in this pass.
- Does **not** claim the other source-only paths (`/api/v1/capture/*`, `/api/studio/field/capture`, `/api/ideas/capture`) follow identical fix shapes. Each needs its own short audit on top of this one — particularly to verify whether `'journal'`, `'dream'`, etc. union slots are already populated by something else this pass didn't find.
- Does **not** claim Reflection Capsules surfacing through atoms will produce felt continuity for the member. That is the [contact-fidelity Stage 4 → Stage 5](memory:project_contact_fidelity_threshold) question, answerable only post-deploy with sustained authenticated load.
- Does **not** authorize lifting any [observation-phase freeze](memory:project_observation_phase_freeze_doctrine) gates on the broader memory field. The adapter wires arrival → atom for an existing source; it does not add a new substrate or new ontology.

---

## 11. Status after this audit

- **Cat 6 (live runtime authority)**: `keepSource` + atoms loader + `is_breakthrough` flag — confirmed
- **Cat 3 (built substrate, 0 live callers from capsule path)**: Reflection Capsules → atoms — the adapter slot is empty
- **Decision needed (Kelly)**: implement the adapter? Scope is small and reversible — single new file, two call-site additions (from-text, from-chat-window), idempotency constraint at DB. Touches Phase 2 fork sequencing only if the deploy is bundled.

Open question for next pass: are `journal_memory_packets`, `case_memory_chunks`, `conversation_memory_uses` themselves source rows that should also be keep-able into atoms, or are they orthogonal infrastructure (telemetry / aggregation) that don't represent member gestures? The vocabulary suggests *some* of them might be source-only-by-design.
