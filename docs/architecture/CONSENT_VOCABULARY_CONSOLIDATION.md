# Consent vocabulary — consolidation ruling

**Type: vocabulary governance. Not a feature design.**
**Status: CANDIDATE — proposed, awaiting founder ratification.** No schema, API, or code change is authorized by this document. Implementation impact is recorded as future guidance only.

**Purpose:** one concept, one name. This document exists so that a future implementation *cannot accidentally create a third synonym* for a consent question the platform has already answered twice.

Related: `COMMITMENTS_SCHEMA_AND_LINK_CONTRACT.md` §7.2 (the held decision this resolves) · `docs/canon/THE_HOUSE.md` · CLAUDE.md *"Consent for memory — there is no stealth memory."*

---

## 1. The concept being named

> **Under what circumstances may this member-owned object appear to the member without the member going to get it?**

That is one question. It is asked today of memory atoms and daily anchors, and Commitments will ask it third — which is precisely why it must be settled before a third spelling exists.

**Shared value vocabulary** (identical in both live implementations):

| Value | Meaning |
|---|---|
| `member_pulled` | Appears only when the member explicitly pulls it. Structurally excluded from ambient surfacing. |
| `contextual_doorway` | The member opted in to ambient contextual surfacing — MAIA may offer it when the proximity filter passes. |
| `ritual_review_opt_in` | The member opted in to review-ritual surfacing. |

---

## 2. Inventory (verified against `origin/clean-main-no-secrets`)

### 2.1 Columns — exactly two, and only two

| Column | Table | Default | Migration |
|---|---|---|---|
| `return_preference` | `member_memory_atoms` | **`contextual_doorway`** | `20260521000001:115`, default changed by `20260523000001:19` |
| `surface_preference` | `member_daily_anchors` | **`member_pulled`** | `20260702000003:44-45` |

A grep for `*_preference TEXT` across all migrations returns these two and nothing else.

### 2.2 The triple is spelled out in 19 files

2 migrations · 6 `lib/` · 4 `app/` · 1 test · 5 docs · 1 script — with **four parallel TypeScript unions of the same three strings**:

- `lib/anchor/surfacePreference.ts:13` — `AnchorSurfacePreference` (+ `VALID_…:19`, `AMBIENT_ELIGIBLE_…:24`)
- `lib/psyche/types.ts:107` — `ReturnPreference`
- `lib/maia/memoryAtomsLoader.ts:72` — `MemoryAtomReturnPreference`
- `app/maia/anchor/history/page.tsx:26` — `SurfacePreference`, declared inline
- plus a bare inline array in `app/api/psyche/portfolio/atoms/[id]/gesture/route.ts:36`

**Four names for one type is the drift this ruling exists to stop.** Nobody decided this; it accreted.

### 2.3 Read gates — the predicate is duplicated, not shared

| File:line | Predicate |
|---|---|
| `lib/anchor/loadRecentAnchors.ts:66` | `AND surface_preference IN ('contextual_doorway','ritual_review_opt_in')` |
| `lib/maia/memoryAtomsLoader.ts:279` | `AND return_preference IN ('contextual_doorway','ritual_review_opt_in')` |
| `scripts/verify-constitution-memory.ts:144,160` | same, duplicated twice |
| `tests/…/refusal-08-anchor-consent-gated-surfacing.ts:39,47` | R08 greps the literal |

The gate is a SQL predicate in every case — good (it cannot be bypassed by application logic), but it is written out five times.

---

## 3. Same concept, or distinct intentions?

**Same concept. Declared so, in the code, in writing.**

- `20260702000003:9` — *"This mirrors the member_memory_atoms consent model (return_preference)"*
- `20260702000003:20-21, :24` — *"mirrored here **verbatim** in value vocabulary"*, *"VALUE VOCABULARY (verbatim from member_memory_atoms.return_preference)"*
- `lib/anchor/surfacePreference.ts:6` — the vocabulary is verbatim *"so there is one shared consent grammar"*

The intent to have one grammar is already stated in the codebase. The two column names contradict that stated intent. **The rename was drift during a deliberate mirror, not a semantic distinction.**

### 3.1 ⚠️ But the defaults have diverged — and that divergence is legitimate

This is the one place the two are genuinely *not* interchangeable, and it must not be flattened by a consolidation:

| Object | Default | Stated reason |
|---|---|---|
| `member_memory_atoms` | `contextual_doorway` | *"Keeping is the consent act. Return is the default meaning of keeping."* (`20260523000001`) — a member who **kept** something has already performed an act meaning *I want this back*. |
| `member_daily_anchors` | `member_pulled` | Answering a daily prompt is **not** a consent act for ambient surfacing. Eligibility must originate from a separate member act. |

**These are different because the prior consenting act differs, not because the concept differs.** Keeping is intrinsically an act of wanting return; answering a prompt is not.

**Therefore the ruling unifies the *vocabulary and type*, and explicitly preserves *per-object defaults* as a deliberate, separately-justified policy choice.** Any new table adopting this grammar must state its default's reasoning in the migration header — the default is where the consent question actually gets decided, and it must never be inherited by copy-paste.

⚠️ Note for whoever implements: `20260523000001` changed the atoms default **with no backfill**, so rows created before it retain `member_pulled`. A consolidation must not "correct" that; those rows reflect the consent regime in force when they were written.

---

## 4. THE RULING

> ### Canonical vocabulary: **`surface_preference`**
>
> **Reason.** Both columns answer one question and already share a verbatim value vocabulary, so one name is required; the choice between them is decided by collision, not seniority. `surface` is already the operational verb *inside the very table that spells the column `return_preference`* — its siblings are `last_surfaced_at` and `surface_count`. More decisively, `return` is being claimed in the opposite direction by the House's own developmental grammar: `commitment_returns` and `becoming_returns` mean *a member returning to something*, an act moving member → object, whereas this column governs an object surfacing to a member, moving object → member. Keeping `return_preference` would make "return" name two opposite motions inside one capability. `surface_preference` also already carries the canonical module (`lib/anchor/surfacePreference.ts`) and the sentence declaring the shared grammar.
>
> **Superseded terms.**
> - `return_preference` (column, `member_memory_atoms`)
> - `ReturnPreference` (`lib/psyche/types.ts:107`)
> - `MemoryAtomReturnPreference` (`lib/maia/memoryAtomsLoader.ts:72`)
> - `SurfacePreference` declared inline (`app/maia/anchor/history/page.tsx:26`) — superseded as a *duplicate declaration*, not as a name
> - the bare inline array (`app/api/psyche/portfolio/atoms/[id]/gesture/route.ts:36`)
>
> **Retained and promoted:** `AnchorSurfacePreference` → to be renamed `SurfacePreference` and re-homed as the single exported type when implementation is authorized.
>
> **Preserved, not unified:** per-object **defaults** (§3.1). Unifying the name must not unify the default.
>
> **Implementation impact: DEFERRED** until implementation is authorized. See §6.

---

## 5. Explicitly EXCLUDED — adjacent mechanisms that are different questions

These govern real consent, and none answers *"may this object appear to me unbidden?"* **None may be folded into this vocabulary.**

| Mechanism | Governs | Why different |
|---|---|---|
| **Sanctuary Mode** (`mode IN ('continuity','sanctuary')`) | whether a session is recorded **at all** | An absolute boundary at capture time, upstream of any surfacing question. |
| `members.episodic_recall_enabled` (+ `conversational_recall_enabled`, `recurrence_recall_enabled`) | account-wide recall opt-**out** | A global switch, not per-object standing consent. |
| `developmental_memories.visibility` + `share_scope` | who **else** may see it | Audience, not self-surfacing. |
| `crossing_allowed` / `crossing_must_be_false` | whether material may be **combined for inference** | An inference ban, not a display rule. |
| `member_settings.storage_consent`, `StorageDecision` (`lib/storage/sovereign.ts:11`, an `interface`) | whether bytes are persisted server-side | Persistence, not surfacing. |
| `member_keep_preferences` / `KeepPreferences` (`lib/psyche/keep-governor.ts:50`) | offer **pacing** — `offersPaused`, `declineStreak` | Whether MAIA may *ask*, not what the member already decided. Complementary; keep separate. |
| Practitioner/client `share_scope`, `scribe_sessions.consent_status` | third-party sharing | A different party entirely. |

---

## 6. Implementation guidance (future only — nothing authorized here)

When implementation is authorized:

1. **Commitments adopts `surface_preference`** with the same three values. Its default requires its own stated reasoning (§3.1) — do not copy either existing default without deciding.
2. **One exported type, one module.** A single `SurfacePreference` type, its valid-values const, and its ambient-eligible subset live in one place; the four parallel declarations collapse into imports.
3. **One shared read-gate predicate**, so the SQL is not written a sixth time.
4. **Renaming `member_memory_atoms.return_preference`** is a migration with live callers (`memoryAtomsLoader`, `portfolio.ts:540`, the gesture route, `verify-constitution-memory.ts`, R08). It is **optional** and separable — the ruling binds *new* surfaces immediately and can be applied to atoms later. ⚠️ R08 and `verify-constitution-memory.ts` grep these literals; a rename must update them or the Co-Lab release gate will fail.
5. **Do not backfill** the pre-`20260523000001` atoms rows (§3.1).

---

## 7. The guard — how a third synonym is prevented

The purpose of this document. When implementation is authorized, these become tests:

- **No new column** may use the value triple under a name other than `surface_preference`. A structural test over `database/migrations/**` asserting that any CHECK containing `member_pulled` sits on a column named `surface_preference`.
- **The value strings appear in exactly two kinds of place**: migrations, and the one canonical type module. A test asserting no *new* file declares the triple inline.
- **New tables adopting the grammar must state their default's reasoning** in the migration header — enforceable by review, recorded here as the standard.

⚠️ Precedent worth naming: the parallel-declaration drift (four type names) happened *while a comment in the codebase asserted there was one shared grammar*. **A stated intention did not prevent it; only a test will.**
