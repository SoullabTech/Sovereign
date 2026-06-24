# Direct Recall Resolver — First Cut Spec

**Date:** 2026-06-04
**Status:** SPEC — Cat-1 preserved direction, first evidence-bearing cut. **Read-only.** Not authorized for deploy or conversational wiring until §7 Verification Gate is met.
**Originator:** Kelly (directive 2026-06-04) + the CeCe-Keep trace (same day).
**Pattern:** follows `CONVERSATIONAL_LAYER_PHASE_2_SPEC_2026-05-24.md` (locked-answer table → safeguards → falsifiable gate → "does not authorize").

> **Governing sentence:** Do not teach MAIA to sound like it can retrieve. Give it a retrieval verb.

---

## §0 Context — the bug this fixes

On 2026-06-04 a member (Kelly, `ce284751`) Kept a MAIA reflection about CeCe as a facilitator and, ~70 min later in the same session, asked MAIA to "pull it up." MAIA could not — it offered retrieval, then said *"I don't have the Keep content visible."*

The trace proved the failure is **not** capture and **not** ranking:
- **Captured successfully:** `member_ideas` `5116c2ef` (18:33) + `member_idea_blocks` `0eaa5280` (`maia_reflection`, 18:34) + `breakthrough_moments` `8d09814e` (18:26) — all under Kelly's id.
- **Unreachable by recall:** `atoms_registered` for that idea/block = **0**; the conversational recall path reads only `member_memory_atoms` (newest row 2026-05-23).

The deeper finding: **MAIA has no first-class "retrieve" verb.** "Pull up that Keep," "what did I decide," "what changed last month," "show me my notes on onboarding" all degrade to ordinary conversational turns. This cut introduces the missing verb — and nothing else.

See memory: `project_keep_capture_atoms_registry_gap`.

---

## §1 Scope — locate + materialize only

This cut is **direct recall**: a member explicitly asks for something they saved → MAIA finds it across eligible member-owned sources → returns a provenance-aware offer → fetches the real content only if the member chooses.

Explicitly **not** in this cut:
- Not associative recall / resonance (that is `MemoryBundle`'s job — untouched).
- Not prompt injection, not "memory personality," not synthesis, not lineage inference, not ranking sophistication.
- Not chat behavior. No conversational wiring until §7 passes.
- Not model-dependent. Deterministic + SQL.

The two headless primitives:

```ts
locateMemoryObjects(memberId, query, context): MemoryObjectRef[]
materializeMemoryObject(memberId, ref): MaterializedMemoryObject
```

---

## §2 Locked-answer table

| Question | Locked answer |
|---|---|
| Is this a rebuild? | No |
| Does it alter associative `MemoryBundle`? | No |
| Does it change prompt / memory behavior in chat? | No |
| Does it write new memory? | No |
| Does it change any schema? | No (read-only; optional `VIEW`) |
| Does it retrieve Sanctuary material? | No |
| Does it cross members? | No |
| Does it return raw clinical/private content automatically? | No — offer first |
| Does it require a new model? | No — deterministic + SQL |
| Is it reversible? | Yes — read-only, behind a flag, removable with zero data effect |
| What does it fix? | Explicit member-directed recall |

---

## §3 Architecture decision — federation, not registry

Two ways to "merge access":

- **Write-time index** — extend `member_memory_atoms` so every doorway registers a pointer. **Rejected for this cut.** This is precisely the mechanism that *silently drifted*: the CeCe idea never registered → `atoms_registered = 0`. It needs a registration hook on every doorway, a backfill, and it can desync again.
- **Read-time federation** — the resolver queries each native source at recall time and normalizes to a common ref. **Chosen.** No registration step → nothing to drift. It is also the faithful *completion* of the atoms schema's own commitment: atoms deliberately do **not** duplicate source content ("the source remains in its native table"). Federation finishes that "reference, don't duplicate, fetch from source" design.

**Principle: merge access, not stores.** Provenance and lineage are preserved (each ref carries its source); only *access* is unified. A materialized index is reconsidered **only later**, if associative ranking ever needs one — not now.

---

## §4 Public contract (canonical shapes — Kelly, 2026-06-04)

```ts
MemoryObjectRef {
  source: 'idea' | 'idea_block' | 'breakthrough' | 'conversation_turn'
        | 'maia_turn' | 'episode' | 'atom' | 'decision' | 'change'
  sourceId: string
  memberId: string
  title?: string
  excerpt?: string            // short snippet for the offer — NOT full content
  createdAt: Date
  provenance: {
    sourceTable: string
    sourceKind: string
    sessionId?: string
    parentId?: string
  }
  eligibility: {
    directRecall: boolean
    associativeRecall: boolean
    sanctuaryExcluded: boolean
    reason?: string
  }
  confidence: number          // match strength vs the member's query
}

MaterializedMemoryObject {
  ref: MemoryObjectRef
  title?: string
  body: string                // the actual saved content
  createdAt: Date
  provenance: Provenance
}
```

`locate` returns refs (cheap — title/excerpt only). `materialize` returns the real object for the **one** ref the member chooses. Full content is never carried in a locate result.

---

## §5 Source adapters

Each adapter is a self-contained module that, for a given `memberId` + `query`, returns `MemoryObjectRef[]` in the common shape. Per-source mapping (columns confirmed via `information_schema`, 2026-06-04):

| Source | owner column | locate `title` | locate `excerpt` | materialize `body` | eligibility inputs |
|---|---|---|---|---|---|
| `member_ideas` | `member_id` | `title` | `framing` (snip) | `framing` | `status` |
| `member_idea_blocks` | `member_id` | parent idea `title` (join) | `content` (snip) | `content` | `block_type`, `status` |
| `breakthrough_moments` | `user_id` | `insight` (snip) | `insight` (snip) | `insight` | `integrated` (non-gating) |
| `conversation_turns` | `user_id` | derived | `content` (snip) | `content` | **`visibility`, session sanctuary state** |
| `maia_turns` | **`session_id` → member map** | derived | `maia_text`/`user_text` (snip) | `maia_text`/`user_text` | session memoryMode/sanctuary |
| `episodic_memories` | `user_id` | `experience_title` | `experience_description` (snip) | `verbatim_text` | `marked_by_member` (table currently 0 rows) |
| `member_memory_atoms` | `member_id` | `title` | — | **pointer → follow `source_type`/`source_id` to the underlying source; never title-only** | `status`, `return_preference`, `registers` (sacred_protected) |

**Member-column heterogeneity is the central hazard** and the reason the invariant (§6) lives *inside each adapter*, not at the route: ownership is `member_id` for ideas/blocks/atoms, `user_id` for breakthroughs/turns/episodes, and **absent** for `maia_turns` (only `session_id` — requires a session→member resolution). A single adapter that forgets its scoping, or resolves a session to the wrong member, is the most likely path to a cross-member leak. If a `maia_turn`'s member cannot be resolved, the adapter **fails closed** (excludes the row).

**Confirmed sources (first cut):** ideas, idea_blocks, breakthrough_moments, conversation_turns, maia_turns, episodic_memories, atoms.
**Deferred — in the target list, adapter pending table identification:** `decisions`, `changes`. No table named `decisions`/`changes` was confirmed in the 2026-06-04 schema probe; candidates to investigate include `field_ideas.promoted_to_decision_id` / `promoted_to_kanban_id` lineage. Do **not** spec column mappings for these until the backing tables are confirmed.

---

## §6 Eligibility gate — the sovereignty line

Every candidate must pass, **computed inside each adapter** (not at the route, not in the model):

```
member_id = current member            (owner-scoped per the adapter's real owner column)
AND not sanctuary-excluded
AND not sacred_protected (registers)  unless explicitly allowed
AND visibility permits direct recall
AND consent boundary permits this context
```

- **Unified recall ≠ omnivorous recall.** Unified across *eligible* memory.
- **Invariant #1 — enforced once, per adapter, never per call site:** never return another member's object; never return a sanctuary or otherwise ineligible object. The resolver refuses to register any adapter that does not declare an owner-scoping + eligibility implementation.
- **Fail closed.** If sanctuary/visibility/ownership state cannot be determined for a row, exclude it. Absence of a positive eligibility signal is treated as ineligible.
- **Sanctuary is currently enforced at retrieval time** (the `MemoryBundle` skip on the live route). This resolver is a *new* retrieval surface and MUST re-inherit that enforcement directly — it cannot assume write-time exclusion.
- **Mode distinction (why `eligibility` has two booleans).** The hard boundaries (ownership, sanctuary, sacred-unless-allowed, visibility) are identical for both modes. They differ on `member_memory_atoms.return_preference`:
  - **associativeRecall** keeps the existing gate (`return_preference IN (contextual_doorway, ritual_review_opt_in)`) — MAIA may *offer* these unprompted.
  - **directRecall** does **not** exclude on `return_preference`: a `member_pulled` atom is eligible because the member is doing the pulling. This is the whole point of a direct verb.
- **Clinical / practitioner-private** (e.g., `practitioner_ai_conversations`) → `directRecall: true` but **offer-first**, never auto-materialized; out of the confirmed first-cut source set regardless.

---

## §7 Verification gate — the falsifiable proof (headless, no model, no chat)

The resolver ships as headless functions, proven before anything user-facing moves:

```
locateMemoryObjects(Kelly, "CeCe facilitator")
  → returns refs for idea 5116c2ef + block 0eaa5280 + breakthrough 8d09814e

materializeMemoryObject(Kelly, <idea_block ref 0eaa5280>)
  → returns the actual saved Keep content (member_idea_blocks.content)
```

Plus the two negative tests that make the gate real:
- **Cross-member negative:** the same query under a *different* member returns **none** of Kelly's objects.
- **Sanctuary/ineligible negative:** a sanctuary-flagged or visibility-restricted row never appears in `locate` results.
- **Intent-negative (deferred to §10):** ordinary conversation does not trigger recall.

**Stage language (contact-fidelity — do not let an earlier rung inflate into a later one):**
- functions written = **built**
- returns `5116c2ef` under Kelly's scope **with both negatives passing** = **reachable**
- wired behind a flag on the live route = **wired**
- a member's "pull it up" surfaces the offer in production = **surfacing**
- repeated correct direct recalls across members/turns = **verified**

---

## §8 What this does NOT authorize

- No change to `MemoryBundle`, associative recall, or prompt assembly.
- No new writes, no registration index, no schema changes (read-only; optional `VIEW` only).
- No synthesis, lineage inference ("this began as a Keep, later a breakthrough"), ranking sophistication, or memory personality.
- No conversational/intent wiring until §7 passes (this cut is headless).
- No member-facing surface beyond the eventual disambiguating offer (§10).
- No model-selection / second-model work until §10 step 5.
- `decisions` / `changes` adapters until their backing tables are confirmed.

---

## §9 Safeguards

1. **Member-scoping per adapter** (Invariant #1) — the resolver rejects any adapter lacking it.
2. **Eligibility gate before egress** — no candidate leaves `locate` without passing §6; fail-closed on unknowns.
3. **Offer-first** — `materialize` runs only on an explicit member choice; full content never rides in a `locate` result.
4. **Reversible** — behind `DIRECT_RECALL_ENABLED`; read-only; removable with zero data effect.

---

## §10 After this passes — the wiring (separate, later cuts)

Only once §7 is green:

1. **Retrieval-intent detector (v1 deterministic, three-way):** `direct` / `ambiguous-offer` / `conversational`. Triggers: "pull up…", "find the Keep…", "what did I save about…", "show me the note…", "what did I decide…", "didn't I capture…", "what was that thing about…". Softer forms ("Didn't I already work through this?") → `ambiguous-offer`. When uncertain, prefer the offer; never a silent guess or a silent ignore. No LLM judge for v1.
2. **Wire:** `intent → locate → provenance-aware offer → materialize if member says yes`.
3. **Offer copy (target):** *"I found a Keep-related note from earlier today about CeCe and facilitation. I can show the full text, summarize it, or help you work from it."* — This sentence is also the **state-awareness repair** for the original rupture: check before claiming, offer before searching.
4. **Disambiguation** when multiple candidates: surface the top + "or N others," never auto-dump, never synthesize in v1.
5. **Only then** compare models (Claude / Qwen / split) on how elegantly they use what `locate` returns. Pre-model infrastructure first.

---

## §11 Governing principle

> **Capture may be plural. Recall must be unified — across what the member is allowed to retrieve.**

> Do not teach MAIA to sound like it can retrieve. Give it a retrieval verb.
