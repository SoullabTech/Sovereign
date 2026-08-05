# Operational Memory & Staged Rebuild Charter

**Date:** 2026-08-04 · **Authority:** founder direction (this date), building on the formally-ruled staged trajectory (`docs/governance/MEMORY_SELECTION_PHILOSOPHY_RULING_INSTRUMENT_2026-08-04.md`, Ruling record) · **Evidence base:** Phase 1 report + Phase 2 gap map (both `docs/ops/`, cited at deployed SHA `57b0324fd`) · **Status:** charter. Sprints are sequenced and scoped here; ⛔ code begins only on a dedicated lane branch (see §VII).

## I. The governing reframe

> The architecture has memory capabilities, but it lacks a live relationship between the present encounter and those capabilities. That is the difference between an archive and a companion.

The layer hierarchy is strict — higher layers depend on lower:

```
1. Operational continuity   "Did something important remain alive?"
2. Relational continuity    "What does this person care about?"
3. Developmental continuity "How are they changing over time?"
4. Wisdom reflection        "What patterns or possibilities might be useful?"
```

**Before MAIA can help a person discover who they are becoming, she must reliably remember what they have entrusted to her today.**

## II. The operational window today (measured, SHA `57b0324fd`)

The entire operational layer currently rides on one channel: `loadPriorCrossSessionExchanges` (`lib/maia/memoryLoaders.ts:195–226`):

```sql
SELECT session_id, role, created_at, LEFT(content, 600) AS content
FROM conversation_turns
WHERE user_id = $1 AND session_id IS NOT NULL AND session_id <> current
ORDER BY created_at DESC LIMIT 6
```

Six **turns** (both roles → ~3 exchanges), truncated at 600 chars, pure recency. Therefore the operational memory contract today is exactly: **"MAIA carries the last ~3 exchanges of your most recent prior conversation, nothing more."**

**Prediction for the acceptance test** ("My sister Karen sees her oncologist tomorrow" → next day → "The appointment went well"):
- PASSES only if the disclosure sits in the final ~3 exchanges of the prior session and survives 600-char truncation.
- FAILS if the disclosure came early in a longer Day-1 conversation, or if any session intervened (each new session's turns push older ones out of the window).
- No other channel rescues it: atoms require a member Keep gesture; episodes require a member mark; significance never participates in any selection. The system cannot distinguish "my sister has cancer" from small talk — **continuity is currently luck of recency.**

This prediction is falsifiable and should be verified as the test's baseline run before Sprint 2 changes anything.

## III. Memory vs Thread (the missing object)

| Memory | Thread |
|---|---|
| past event | living continuity |
| stored | active |
| retrieved | resumed |
| information | relationship |

Humans are thread-based rememberers: they forget details but retain what someone is going through, waiting for, and what remains unfinished. **Memory is not primarily what is stored. Memory is what remains in relationship.** No thread object exists at the SHA (`unresolvedThreads.ts` is relationship-page-only, BUILT-UNWIRED; no open-loop/commitment table for member memory — gap map §II).

## IV. Sprint sequence

### Sprint 1 — Truth (Stages 1–2 of the ruled trajectory)
Preserve current retrieval behavior exactly. Add:
1. **Policy declaration** at the loader — the current policy named as known-policy ("consent-bounded · breakthrough-first · recency-sovereign · take-8, until a more context-sensitive model is proven"). Binding declaration text lives in the docket. ⛔ The loader commit belongs to the ACTIVE LANE only.
2. **MemoryTransitionRecord** — internal record per conversation: `available_count / retrieved_count / eligible_count / offered_count / injected_count`, `selection_policy_version`, per-source presence, and **reasons as sentences** ("consent boundary", "recency priority", "explicit member request"). ⛔ Not a scoring system — never `relevance: 0.87` (the `wisdomSynthesisQuality: 0.89` anti-pattern). The question it answers: *why did this cross the boundary?*
3. **Truthful telemetry** — `semantic:` relabeled to what it is (e.g. `memory: { atomsAvailable, atomsRetrieved, semanticSearch: false, semanticIndex: unavailable }`). Principle: **never give a capability a name before the capability exists.** A system cannot become self-aware while its own dashboard lies.

**Sprint 1 outcome:** MAIA can truthfully say *"I had 133 memories available. Eight entered this response because of the current policy."*

### Sprint 2 — Continuity (operational relational memory)
1. **RelationalThread object**: `member_id · subject · state · started · last_referenced · importance (member-declared ONLY) · status (active/resolved/withdrawn)`.
2. Detection: conversation → significant thread detected → thread created → status maintained → future conversation can reconnect. Reconnection needs no semantic genius — it resumes the thread.
3. **Acceptance test** (§II scenario, and variants: father's surgery; daughter's baby): Day 2, MAIA recognizes *"this connects to something you shared with me"* — not because she inferred a narrative, but because the thread remained alive.

Sovereignty constraints carried in: importance is member-declared only; threads are subject + state, never interpretation; `withdrawn` is a member act; threads obey the same consent boundaries as atoms.

### Sprint 3 — Intelligence (only after 1–2)
- **Encounter Interpreter** ("what kind of remembering is invited?") feeding the Memory Orchestrator — the missing synapse between WisdomRouter's message-side and the loaders' memory-side. Constraint: **navigation, never meaning-attribution.** Allowed: *"the user asked about our beginnings."* Not allowed: *"the user is entering a transformation phase."*
- Invitation-based retrieval (C′, Keep pattern: notice-before / explore-after-acceptance).
- Developmental reflection in invitation form only.

### Future selection order (⛔ NOT coded until governed)
`1 consent · 2 explicit user request · 3 active relational threads · 4 current conversation relevance · 5 developmental continuity · 6 significant moments · 7 recency`. The current ordering is not wrong — incomplete. Reordering waits on its own governance act per the ruling instrument (observability precedes any reordering).

## V. The central rule

**Do not make MAIA remember more until she can explain what she is remembering and why.** The missing thing is not another organ. It is the nervous system's ability to say: *"This is what I noticed. This is why it became available. This is what I cannot know. This remains yours."*

## VI. Standing guards (unchanged)

No recall maximization · no numeric relevance scores surfaced · no usage inference (USED stays unknown until observed) · no personality profiles · wisdom ⊥ memory never collapse · every capability increase carries provenance + restraint + transparency + ownership boundary.

## VII. Preconditions before first commit

1. Dedicated lane branch off current trunk (this working tree is on `feature/labtools-redesign` with unrelated uncommitted work — ⛔ not a valid lane home).
2. Confirm ACTIVE-LANE ownership for the loader-adjacent commits (concurrent sessions are working the governance side; the ruling record reserves the loader commit to the active lane).
3. Baseline run of the §II acceptance test against current behavior, recorded before Sprint 2 changes anything.
