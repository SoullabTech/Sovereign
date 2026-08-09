# MAIA Relational Memory Integrity — Stage 1 Reconciliation (2026-08-04)

**Status**: Investigation deliverable. No code, no schema, no wiring changes. Produced on branch `feature/labtools-redesign` @ `0cf6696ab` (dirty tree — see Provenance). Implementation requires the dedicated lane branch per the Staged Rebuild Charter preconditions.

**Mission served**: "MAIA Relational Memory Integrity Implementation" — Stage 1 (Truth). First implementation task: (1) current-state pathway map, (2) thread substrate audit, (3) gap list, (4) smallest change. This doc reconciles that mission against work the lane produced **earlier today** — three of the four deliverables already exist and must not be duplicated.

**Provenance**: All file citations verified committed at `0cf6696ab` **except** `app/api/sovereign/app/maia/list/route.ts`, which is working-tree-modified in this checkout; its line refs describe the working tree, not the deployed referent (`57b0324fd` per the Selection Reality Report).

---

## 0. Deliverable → canonical home map (do not reconstruct these)

| Mission deliverable | Canonical home | Coverage |
|---|---|---|
| (1) Pathway map | `docs/ops/MAIA_MEMORY_SELECTION_REALITY_REPORT_2026-08-04.md` | **Complete** (route → loader → SQL → FAST/CORE injection; DEEP-primary excluded; 133 stored → 128 eligible → 8 injected) |
| (2) Thread substrate audit | **§2 of this doc** (new) + inventory seed in Gap Map §II | Completed here |
| (3) Gap list | `docs/ops/MAIA_MEMORY_INTEGRITY_GAP_MAP_2026-08-04.md` | **Complete**; §3 below adds only net-new findings |
| (4) Smallest change | `docs/ops/MAIA_OPERATIONAL_MEMORY_STAGED_REBUILD_CHARTER_2026-08-04.md` (Sprint 1) + `docs/ops/MAIA_MEMORY_RESTORATION_VERIFICATION_LANE_2026-08-04.md` (build order) | **Complete**; §4 below confirms alignment with the mission's Stage 1 |
| Mission's state ladder `stored→retrieved→eligible→offered→injected→used` | Matches Gap Map §I lifecycle. ELIGIBLE→OFFERED is the ungoverned transition; OFFERED is unrecorded; INJECTED→USED is uninstrumented. | Confirmed |
| Mission's thread states `introduced/active/awaiting/resolved/withdrawn` | Restoration Lane already rules `introduced·active·awaiting·resolved·revisited·withdrawn` | Lane's set governs (superset) |
| Mission's forbidden scores (`importance_score` etc.) | Restoration Lane "schema PROHIBITED columns" | Already binding |

`docs/architecture/MAIA_RELATIONAL_MEMORY_ARCHITECTURE_DIRECTION_2026-08-04.md` is **Cat 1 — preserved direction, authorizes no implementation**; it must not leak into this lane's scope.

---

## 1. Pathway map — confirmations from independent code audit

The code audit independently confirmed the Selection Reality Report's chain and added the addenda mechanics: atoms/episodic/conversational addenda ride `meta` from `app/api/sovereign/app/maia/list/route.ts` (imports ~L114–124) into the concatenated system prompt at `lib/sovereign/maiaService.ts:1283`. `RelationshipAnamnesisPostgres.ts` is on the live path (route L98, L1237–1266). `lib/oracle/relational/RelationalMemory.ts` is wired only into the **dead oracle lane** — do not cite it as live capability.

---

## 2. Thread substrate audit — "does the organism already have a thread system that is unwired?"

**Answer: yes — five distinct thread-like substrates exist; none reaches the live MAIA prompt. One of them is already half-wired from the live route (write side only).**

| Substrate | Location | Shape | Wiring verdict |
|---|---|---|---|
| **openLoops** | `lib/memory/MemoryWriteback.ts:52,519–533`; also `lib/scribe/sovereignSummarizer.ts:30,145`, `lib/maia/sessionProcessor.ts:348,592` | "unresolved threads they may return to" — computed per session | **CORRECTED (see §6): COMPUTE-ONLY on the live route** — since Storage X4 (2026-04-09), `buildCapsule` computes openLoops but they are "NO LONGER written to content_text" (`MemoryWriteback.ts:497–499`); the live route extracts and **discards** them. The one persisting path (`sessionProcessor.persistEpisodicMemory`, L591–592 → `episodic_memories.experience_description`) hangs off `/api/maia/session/process`, which has **no in-repo caller**. |
| `detectUnresolvedThreads` | `lib/consciousness/unresolvedThreads.ts:28–91` | Pure per-request derivation (`rupture_without_repair` / `repeating_tension` / `charged_then_silent`); no persistence | **LIVE as Relationships UI only** (`app/api/relationships/[id]/route.ts:12,92` → `app/relationships/[id]/page.tsx`). Absent from `lib/sovereign/`, `lib/maia/`, `app/api/sovereign/`. |
| `ArchetypalThread` | `lib/consciousness/LightweightRelationalMemory.ts:25–36,174–244,301–326` | Real state machine (`emerging→active→integrating→resolved`), max-3-active eviction, `formatAsUnspokenPresence()` prompt formatter | **BUILT-UNWIRED — 0 importers.** ⛔ **Supabase-backed** (`archetypal_threads`, `breakthrough_memories`, `relationship_essence` tables) — cannot be wired as-is under the no-Supabase invariant; candidate for removal-or-port, not adoption. |
| `StoryThreadEngine` | `lib/story-thread-engine.ts` (~667 lines) | Resonance-scored thread weaving | **BUILT-UNWIRED — 0 importers.** Resonance scoring likely collides with the forbidden-scores rule if ever considered. |
| `thread_id` recognition | `lib/maia/decisionChangeRecognition.ts:54,554–611` | Thread-scoped recognition events | **LIVE on the Ideas surface only** (`app/api/ideas/[id]/blocks/*`). Not member-memory. |

Supporting facts:
- **Closest existing state machine** for member-entrusted content: `lib/psyche/types.ts:96–125` — `MemoryAtomStatus = active|still_alive|set_aside|protected|archived` + `ReturnPreference` + `MemberResponseStatus` (only `rejected` has a runtime writer); transitions in `lib/psyche/portfolio.ts:430–560`. **LIVE.** No `introduced/awaiting/resolved/withdrawn` machine exists anywhere for entrusted content — the Restoration Lane's thread-state set is genuinely new object territory (Charter Sprint 2, gated).
- `EpisodicMemoryService` (`lib/consciousness/memory/`) remains **BUILT-UNWIRED**; the live episodic lane is member-marked via `app/api/sovereign/episodes/mark/route.ts`.
- Capture side (`lib/capture/captureStore.ts:138–152` → `SignificantMomentsService.ts:80`) is separate and not atom-linked — consistent with the UNRULED Capture⇄Keep boundary.

---

## 3. Net-new gaps (additive to the Gap Map — do not re-derive its list)

1. **openLoops write/read asymmetry** — the live route already *pays the cost* of extracting open loops every session and then discards the benefit. This is the single most "already-there, unwired" continuity capability. Reading it back is Sprint-2-shaped work (it creates an offering channel), **not** a Stage 1 quick win.
2. **`memoryHealth` cannot express the mission's ladder** — `LayerStatus = 'ok'|'empty'|'error'` (`lib/maia/memoryHealth.ts:38`). "ok" collapses stored/retrieved/eligible/offered/injected. This is the concrete carrier for the Gap Map's "`sem: ok` is a miscue" finding. Loaded-vs-injected is only partially split (`atomsLoadedCount` route ~L1060; `maiaService.ts:2870` `{injected, chars}`).
3. **Supabase liability inside candidate substrate** — `LightweightRelationalMemory.ts` violates the no-Supabase invariant; per project rule it should be removed or ported, never consolidated. Flag before anyone treats it as the thread foundation.
4. Standing (already recorded, restated for the mission's frame): OFFERED unrecorded; USED uninstrumented; session-resumption suppression **HELD UNRULED — own PR, do not bundle**; retrieval-shape mismatch (recency-shaped selection makes distant-past questions structurally unanswerable — this is why the mission's Entrusted Thread Test is predicted to fail today, per the Charter's falsifiable prediction).

---

## 4. Smallest change (confirmation, not invention)

The mission's Stage 1 ("truthful memory-state observability") and the lane's existing sequencing **converge on the same first move**, already chartered:

> **Charter Sprint 1**: policy declaration + `MemoryTransitionRecord` (record stored→retrieved→eligible→offered→injected transitions) + telemetry relabel so `memoryHealth` stops saying "ok" where it means "rows exist."
> **Restoration Lane build order**: 1. Memory Integrity Instrument → 2. Relational Thread Layer → 3. Encounter-to-Memory Routing → 4. only then richer retrieval.

Nothing in this audit changes that order. The openLoops read-back (§3.1) is the natural Sprint 2 seed — it satisfies the mission's "does the organism already have a thread system that is unwired?" with a concrete wire target — but it is an *offering channel* and therefore comes **after** the observability instrument exists to witness it.

**Preconditions before first commit** (Charter, restated): dedicated lane branch (this session is on `feature/labtools-redesign` — not the lane); ACTIVE-LANE ownership of loader commits; baseline run of the Entrusted Thread Test to record the predicted failure **before** any change.

---

## 5A. §6 — The bridge question (founder-posed, 2026-08-04 follow-up)

> *"Can we turn an existing unresolved thread extraction pathway into a member-controlled continuity pathway without adding interpretation?"*

**Answer: yes — and the bridge is shorter than the Stage 1 audit first reported, but the audit's "write-only" verdict was wrong in a load-bearing way.**

Corrected openLoops facts (verified in source this session):

1. **Live route extraction persists nothing.** `MemoryWriteback.buildCapsule` (live route) computes openLoops via verbatim regex capture (`Question: <first 80 chars>`, `Commitment: <matched phrase>`) — genuinely non-interpretive — then discards them (Storage X4, `MemoryWriteback.ts:497–499`). The founder diagram's "stored somewhere" step does not exist on the live path.
2. **The only persisting path is orphaned.** `sessionProcessor.persistEpisodicMemory` writes openLoops into `episodic_memories.experience_description` ("Open threads: …") — but its endpoint `/api/maia/session/process` has no in-repo caller. It also computes a system significance score (`5 + openLoops·2 + nextStep·1`, `sessionProcessor.ts:599–601`) that brushes the forbidden-scores boundary; do not adopt that path as-is.
3. **The member-controlled read path already exists and is constitutionally shaped.** `loadRecentMarkedEpisodes` (`memoryLoaders.ts:283–315`) reads `episodic_memories WHERE marked_by_member = TRUE`, returns `verbatim_text`, consent-gated by `episodic_recall_enabled`, and reaches the live prompt via `episodicRecallBlock`. Verbatim + member-marked + consent-gated + live: this is exactly the contract the mission requires.

**Therefore the bridge is not a read-back wire. Both ends exist. The missing middle is the member gesture**: nothing today lets the member *see* an extracted open loop and choose to entrust it. The smallest interpretation-free loop is:

```
verbatim extraction (exists, live, discarded)
        ↓
offer to member as candidate        ← the missing piece; "the crossing IS the consent event"
        ↓                              (same pattern as the ruled Capture→candidate→Keep path)
member confirms → marked/entrusted  ← member act creates the memory, mirroring marked_by_member
        ↓
consent-gated verbatim recall (exists, live)
```

No step interprets: extraction is substring capture, the offer quotes verbatim, the member's confirmation is the only significance signal, recall is verbatim. What this loop *cannot* yet express is time-relation (`awaiting → resolved/withdrawn`) — that is the Sprint 2 `RelationalThread` object per the Charter, and the offer surface itself is an offering channel, so it still comes **after** Sprint 1 observability. This section changes the *content* of Sprint 2, not the order.

**Sprint 1 note on #958**: the founder's sequence lists "merge/complete #958." Per lane state, #958 is green and awaiting **Class A signoff** — a founder act, in its own lane; it must not be downgraded or bundled here.

## 5B. §7 — Founder ratification of the corrected architecture (2026-08-04, later same day)

The founder ratified §6's corrected pathway and refined it. Recorded verbatim-in-substance:

1. **The governing loop is `notice → invite → remember → return`.** The system may notice ("there appears to be something unresolved here"); it may not declare ("this is important to you"). The member's act remains the authority transition — the missing synapse is between *"I noticed something"* and *"Would you like me to carry this with you?"*
2. **`RelationalThread` starts as a container, not a judgment.** Founder-sketched starting fields: `origin, source, created_by (member/system-candidate), entrusted_at, state, member_confirmation, withdrawal/resolution, last_offered`. ⛔ It does **not** start with `importance / meaning / significance / priority` — those invite the system to become an interpreter.
3. **The baseline test splits into two pathways, kept separate** (different capabilities; do not collapse):
   - **Keep pathway** (member chooses → atom exists → retrieval under current selection policy): *Can MAIA find and offer something intentionally kept after time passes?*
   - **Candidate/open-loop pathway** (member shares → system notices candidate → no entrustment yet): *Can MAIA offer the opportunity to preserve without assuming?*
4. **Ratified order**: (1) **#960 Truth layer** → (2) baseline both pathways → (3) smallest invitation/confirmation bridge → (4) thread lifecycle → (5) only later, richer context selection.
5. **Anti-drift line to protect**: *"Do not let 'relational memory' become another synonym for 'better prediction.'"* The breakthrough is not that MAIA predicts the member better; it is that MAIA can hold a place where the member can return.

**Second-pass sharpening (founder, same day):**

6. **Baseline pathway names and what each tests** — **Path A: Intentional retention** ("Keep this" → atom exists → retrieval under current policy) tests *continuity of consent*. **Path B: Invitation to preserve** ("My sister has cancer" → system notices a possible thread, no entrustment yet) tests *whether the system can offer care without converting observation into ownership*. ⛔ Combining them erases the boundary the architecture protects.
7. **Container fields (refined)**: `subject, origin, created_at, state, entrusted_at, last_offered, resolution_status, withdrawn_at`. **Forbidden fields (expanded)**: `meaning, importance_score, emotional_weight, life_lesson, what_this_represents` — those belong to the member. The system can hold *"Kelly mentioned her sister's appointment was upcoming"*; it cannot silently upgrade that into *"this represents her relationship to mortality and caregiving."* **That is the difference between continuity and profiling.**
8. **Execution contract**: merge #960 → deploy through migration-aware path → observe transition records → run baseline (both pathways) → design Sprint 2 from evidence. **Sprint 2 opens with** *"What did the existing system fail to carry?"* — never *"What features should we add?"*
9. **The milestone**: not richer retrieval — the first production transition record confirming MAIA can truthfully account for her own remembering ("here is what I had access to, here is what I offered, here is what remains unknown").
10. **Lane map** (referents corrected): #958 member-facing truth correction, MERGED · #960 memory self-knowledge/observability, awaiting merge · #961 governance/philosophy docs, open · Sprint 2 relational continuity, gated on baseline.

**Third-pass (founder, post-deploy — #960 now MERGED + DEPLOYED `f46a4fde4`, table live and empty):**

11. **Milestone boundary held**: *deployed ≠ proven in lived use.* The next member turn is the first time the system can demonstrate whether the architecture can accurately describe itself **while serving a person**.
12. **The first transition record is a baseline artifact, not a success signal.** Whatever it shows — expected (`available: ~133, eligible: ~128, injected: 8`) or unexpected — is equally valuable. What separates it from ordinary telemetry is the column that answers *"what did she NOT claim?"* (unknown recorded as `null`, never guessed).
13. **Path B language constraint (binding for the bridge design)**: recognition ≠ interpretation; offer ≠ declare. MAIA may say *"I noticed this has come up several times. Would you like to carry it forward?"* She may not say *"This is an important unresolved issue in your life."* The first preserves agency; the second creates authorship.
14. **Observation protocol**: one genuine member interaction, one intentional Keep gesture if appropriate, then **observe the record rather than trying to make the result happen**. The empty table pre-encounter is itself correct: the contract was never "create records so we know the system works" — it was *"when memory participates in a real encounter, can MAIA truthfully account for what happened?"* The first row is not a test fixture; it is the first observation. *(Evidence note, deploy+90min: 0 rows was disambiguated by log check — zero memory-pipeline activity since deploy, so this is Case A "no encounter occurred," not Case B "encounter unrecorded." First validation of the truth-layer principle: the system did not manufacture a record just because the capability exists — capability was not confused with experience.)*
15. **Pre-committed inspection rubric for the first record** — check that the fields preserve the fought-for distinctions (available = what existed as possibility · eligible = what the system was allowed to consider · retrieved = what was brought forward · offered = what was presented to the encounter · injected = what entered the response context), and watch for the four old collapses: **available→used · stored→meaningful · retrieved→remembered · offered→adopted**. Pass = the record can say *"this existed, was available, was considered, was offered — and was not necessarily used."*
16. **Cross-lane isomorphism (founder)**: the first memory transition and the first Writer's Field crossing test the same boundary from different sides — memory: *can MAIA remember without claiming ownership of meaning?* · writing: *can MAIA assist without claiming ownership of authorship?* Shared principle: **the system can hold continuity; the human supplies significance.**

---

## §8 — FIRST OBSERVATION (baseline artifact, 2026-08-05 23:38–23:39 UTC)

First production transition records, from a genuine founder-as-member conversation (deployed image `7cb69d20a`, which contains truth layer `f46a4fde4`). Three turns × four sources = 12 rows, every row stamped `consent-bounded.breakthrough-first.recency-sovereign.take-8.v1`. Per-turn shape (identical across the three turns):

| source | available | retrieved | eligible | offered | injected |
|---|---|---|---|---|---|
| member_memory_atoms | 133 | 8 | 128 | 8 | **null** |
| conversational | **null** | 6 | **null** | 6 | **null** |
| episodic | **null** | 4 | **null** | 4 | **null** |
| developmental | **null** | 3 | **null** | 3 | **null** |

**Rubric verdict — all four collapses avoided:**
- *available→used*: NOT collapsed — 133 available vs 8 offered, the 120-atom drop now measured per-turn in production, no longer inferred.
- *stored→meaningful*: NOT collapsed — no meaning fields anywhere; only the named policy.
- *retrieved→remembered*: NOT collapsed — `injected` is **null on every row**: the system does not claim the model used what it was handed.
- *offered→adopted*: NOT collapsed — no adoption claim exists in the schema.

**The "what did she not claim" column works**: nulls appear exactly where the writer has no knowledge (injection outcome; available/eligible totals for the three non-atom sources). Unknown was recorded as unknown, not guessed.

**Lived-use evidence**: in the same encounter, MAIA referenced the prior day's session ("You said yesterday it was time") — the conversational source (6 retrieved/offered) visibly doing relational work in the exact turns the records account for. The milestone as defined: *the architecture accurately described itself while serving a person.*

**Stability (n=4 turns)**: a fourth turn later the same session produced the identical shape (atoms 133/128/8/8, `injected` null; conversational 6, episodic 4, developmental 3). The artifact is reproducible, not a single lucky row.

**Sprint 2 evidence seeded**: `retrieved == offered` on every source — ELIGIBLE→OFFERED is currently an identity transition after LIMIT 8; the selection moment has no independent policy. And the 128→8 recency-shaped cut is exactly the mechanism predicted to fail Path A (something Kept long ago sits structurally outside the offered set). The baseline tests can now measure against these numbers.

---

## §9 — Founder reading of the first observation (2026-08-05)

**Ratified**: what matters is not the counts but that *the system produced a truthful observational vocabulary about its own behavior during a real interaction, without claiming knowledge it does not possess.* The four boundaries held simultaneously; `injected = null` is named the strongest part of the design — *it refuses to convert an implementation handoff into an epistemic claim.* The governing sentence: **this is the separation that prevents telemetry from quietly becoming narrative.**

**Evidential weight, correctly bounded**: telemetry and visible behavior describe the same event from two perspectives, and *the measurement survived contact with an actual interaction* — qualitatively stronger than a unit test. ⛔ It still does **not** establish that retrieved material *caused* the response; that non-causality is exactly what `injected = null` preserves. Do not upgrade correlation into causation in any later summary.

**⚠️⚠️ REFERENT COLLISION — Path A / Path B now name two different pairs. Resolve before any baseline is run.**
- **Sense 1 (§7.6, earlier ratification — *capability* axis)**: Path A = intentional retention ("Keep this" → can the system carry it across time?); Path B = invitation to preserve (can MAIA notice without owning?).
- **Sense 2 (§9, this pass — *selection-policy* axis)**: Path A = recency-only behavior; Path B = recency plus an alternate selection policy.

These are orthogonal axes, not competing definitions — Sense 2 is a policy comparison that could be run *within* Sense 1's Path A. The collapse would produce a baseline that measures one axis while reporting the other.

**✅ RULED (founder, 2026-08-05) — two namespaces, ⛔⛔ never overload a constitutional term:**
- **`Path *` = member capability architecture** — Path A intentional retention · Path B invitation to preserve. Already ratified; ⛔ do not re-point these names.
- **`Policy-*` = retrieval-selection policies** — **Policy-R** (recency-only) · **Policy-R+** (recency plus an additional selection policy). The family may grow (Policy-C, Policy-H, …); `Policy-*` is now the namespace for retrieval policy, `Path *` for member capability.

Rationale recorded: reusing a name that already carries ratified meaning would create *slow constitutional drift where later readers must infer which axis a document meant*. The underlying insight stands: with `offered` = "first N after ordering," there is no explicit representation of selection, so comparing **Policy-R against Policy-R+** measures *a genuine architectural decision rather than a truncation point*.

**Decision hygiene (ratified)**: the telemetry milestone and the memory-custody question are **not coupled** — one is an implementation milestone, the other a constitutional custody decision. They coincided in time only. See the custody evidence note in the session record; the governing question there is not file size but *whether the index can still reliably serve as the canonical reference*.

**Lane status at time of writing**: [PR #960](https://github.com/soullab/MAIA-SOVEREIGN/pull/960) (`feature/memory-truth-layer`) is OPEN and implements Sprint 1 faithfully — `memorySelectionPolicy` (versioned declared policy `consent-bounded.breakthrough-first.recency-sovereign.take-8.v1`), `memoryTransitionRecord` (+ migration + tests; reasons are sentences, never scores; unknown = `null`), memoryHealth truth repair (`sem:` → `atoms:` + `semantic_retrieval: false`), observability-only route wiring. Self-classified **Class B**, release unit = writer + migration (full deploy path required). [#958](https://github.com/soullab/MAIA-SOVEREIGN/pull/958) (amnesia guard on live route) is **MERGED**. That lane owns `feature/memory-truth-layer`; this checkout must not mutate it.

## 5. What Stage 1 still needs a founder ruling on

- Session-resumption suppression (`conversationalRecallBlock.ts:97`) — HELD UNRULED, own PR.
- Whether `ArchetypalThread` / `StoryThreadEngine` are removed, ported, or left dormant — removal touches the no-Supabase enforcement; adoption is ⛔ until the thread object is governed (Sprint 2 gate).
- ELIGIBLE→OFFERED governance (the ungoverned transition) — the observability instrument records it; ruling on *policy* for it is separate.
