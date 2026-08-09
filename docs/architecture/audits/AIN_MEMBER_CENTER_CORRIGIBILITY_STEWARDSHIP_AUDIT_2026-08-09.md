# AIN / MAIA — Member-is-Center, Corrigibility, Stewardship & Developmental Continuity

## Architectural Evidence Audit

**Date:** 2026-08-09
**Authorization:** Founder-directed architectural investigation (read-only; §22 of the governing prompt)
**Branch / commit at audit time:** `feature/labtools-redesign` @ `851c2e73a`
**Production evidence host:** minisforum · `maia-postgres` · `maia_consciousness`
**Implementation changes made:** **NONE.** No file was edited, no migration written, no production state mutated. All database access was `SELECT`-only. Two existing Jest suites were executed (both read-only static/mocked suites).

> **Filename note.** The governing prompt suggested a `2026-08-08` filename. This audit was performed on 2026-08-09 and is dated accordingly. `docs/architecture/audits/` did not previously exist; it was created because no governed audit directory existed and `docs/architecture/` already holds ~20 loose `*_AUDIT_*.md` files with no index. This audit is placed in a subdirectory so the Paper III evidence lane is separable from ordinary architecture notes.

---

## A. Executive finding

**The founder's claim is substantially — but unevenly — correct, and it is correct in a way that is materially different from the way it is usually stated.**

What AIN has built, and can prove at the database level, is a **provenance and containment architecture**: the system knows what kind of thing each stored item is, who authored it, under what consent posture it was minted, and it refuses — at the level of Postgres CHECK constraints and fail-closed read paths — to let system-authored material pass itself off as member-authored, or to let practitioner-facing surfaces carry system inference about a member. That is real, enforced, and in some places adversarially tested. It is the strongest thing in the system and it is stronger than the documentation claims for it.

What AIN has **not** yet done is close the loop from provenance to **authority**. The subsystem designed to make a member's correction change what MAIA presently believes — the COGOS interpretive ledger — is fully designed, fully migrated, fully typed, and **completely unwired**. Nothing writes to it, nothing reads it into routing, and in production it holds **zero rows across all four of its tables**. There is no correction channel in the live prompt-assembly path. On the live route, corrigibility exists as **one sentence of prompt instruction** delegated to the model provider.

- **Genuinely present and verified:** provenance integrity (member-authored vs. system-authored vs. practitioner-witnessed), consent-posture minting, practitioner inference containment, honest account-deletion refusal.
- **Partially present:** stewardship (access/authority separation is real for practitioners, absent for exit), relational intelligence (relational objects exist; relational *rights* do not), continuity (real but thin: 142 atoms, 115 episodes, 7 member-marked, across 87 members).
- **Verified:** the provenance constraints and the containment pins — by DB constraint inspection, by production row inspection, and by a passing 23-test pin suite.
- **Aspirational:** Member-is-Center as a named architectural property (the phrase appears **nowhere** in the repository), corrigibility as an enforced state transition, developmental release, portability.
- **Most consequential gap:** *a member's correction has no durable effect on MAIA's present epistemic authority.* It affects the current context window and nothing else.
- **Sharpest defect found:** `app/api/sovereignty/delete-my-memory/route.ts` returns `success: true` with `"Memory deletion request processed successfully"` when its backing service is unavailable — a false completion claim, on a sovereignty endpoint, in direct contradiction to the honest refusal discipline the neighbouring deletion route enforces and tests.
- **Can Paper III responsibly claim these properties today?** **Provenance integrity and inference containment: yes, as verified.** Member-is-Center, corrigibility, stewardship, developmental intelligence, portability: **no, not as verified** — see the evidence ledger in §J for the wording that is defensible.

---

## B. Architecture map — the actual path

```
member turn
   │
   ├─ auth: getMemberFromRequest / serverSessions → memberId
   │
   ▼
POST /api/sovereign/app/maia/list          ← THE live route (app/api/sovereign/app/maia/list/route.ts)
   │
   ├── consent gates read FIRST:
   │     loadConversationalRecallPref(userId)   → members.conversational_recall_enabled
   │     loadEpisodicRecallPref(userId)         → members.episodic_recall_enabled
   │
   ├── memory loaders (lib/maia/memoryLoaders.ts, lib/maia/memoryAtomsLoader.ts)
   │     loadRecentDevelopmentalMemories   ORDER BY significance DESC, formed_at DESC LIMIT n
   │     loadPriorCrossSessionExchanges    ORDER BY created_at DESC              LIMIT n
   │     loadRecentMarkedEpisodes          ORDER BY created_at DESC              LIMIT n
   │     loadMemberMemoryAtomsForPrompt
   │
   ├── formatters → addenda strings
   │     formatAtomsForPrompt · formatPriorExchangesForPrompt · formatMarkedEpisodesForPrompt
   │
   ├── buildMaiaRuntimeContext(...)  (lib/maia/maiaRuntimeContext.ts) — OBSERVER, not orchestrator
   │     summarizePromptBlock() counts exactly these addenda:
   │        memoryInfluence · forwardReadiness · atoms · memberWeb · astrology
   │        studio · knowledgeGate · wuxing · conversational · episodic
   │     ⛔ there is NO `ledger`, `corrections`, `supersessions`, or `provenance` addendum
   │
   ▼
lib/sovereign/maiaService.ts  →  FAST | CORE | DEEP
   │   FAST: contextPrompt = memoryContext + recentThread + ainKnowledge + instruction + input
   │   CORE: buildMaiaWisePrompt        (lib/sovereign/maiaVoice.ts)
   │   DEEP: buildComprehensiveVoicePrompt (lib/sovereign/intelligentVoiceAdaptation.ts)
   │
   ▼
Anthropic Claude  ← corrigibility is enforced HERE, by instruction, or nowhere
```

**Parallel substrate, not on this path:**

```
lib/consciousness/observationExtractor.ts   ── 0 importers ──┐
        │ extractObservations()                              │
        ▼                                                    │  the entire
lib/consciousness/hypothesisBuffer.ts       ── 2 importers   │  corrigibility
        │ enqueueObservation / enqueueContradiction          │  pipeline is
        ▼                                                    │  disconnected
lib/consciousness/gateEvaluator.ts          ── 1 importer    │  at the head
        │ runGateSequence / isPromotionEligible              │
        ▼                                                    │
lib/consciousness/interpretiveLedger.ts     ── 3 importers ──┘
          promoteToLedger()        → 0 callers
          loadLedgerForRouting()   → 0 callers   ⛔ never reaches a prompt
          loadLedgerSummaries()    → 0 callers
          markOffered/Declined/Accepted → 0 callers
          upsertCalibration()      → 0 callers
          loadLedgerForMember()    → 1 (GET /api/members/ledger)
          addMemberAnnotation()    → 1 (POST /api/members/ledger/annotate)
          applyDecay()             → 2 (scripts/sweep-stale-sessions.ts)
```

The only importers outside the module cluster are `scripts/sweep-stale-sessions.ts` (a script, not a runtime path) and two member-facing routes that **read and annotate an empty table**.

---

## C. Principle-to-mechanism matrix

Levels per §18: 0 Articulated · 1 Implemented · 2 Verified (observed runtime/deterministic test) · 3 Adversarially verified.

| Principle | Articulated | Implemented | Verified | Adversarially verified | Evidence |
|---|---|---|---|---|---|
| **Member-is-Center** | ⚠️ **not under this name** | Partial | Partial | ❌ | Literal string `member-is-center` / `memberIsCenter`: **0 hits** repo-wide (`rg -il`, excl. `node_modules`). Cognate mechanisms: `docs/canon/AUTHORITY_IS_AUTHORED_OR_HELD_2026-08-06.md`, `docs/canon/CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md`, `lib/studio/containment/inferenceContainment.ts`, `episodic_member_marked_requires_verbatim` CHECK. |
| **Corrigibility** | ✅ | ⚠️ **built, unwired** | ❌ | ❌ | Design: `database/migrations/20260311000002_interpretive_ledger.sql`, `lib/types/interpretive-ledger.ts` (`CONTRADICTION_WEIGHTS.user_correction = 0.95`, `FalsifiabilityAnchor`). Wiring: `extractObservations` has **0 importers**; `promoteToLedger`/`loadLedgerForRouting` **0 callers**. Production: `interpretive_ledger` **0 rows**. Repo's own verifier: `checkCorrigibilityPending()` → `[PENDING] Corrigibility cannot yet be verified at deployment time` (`scripts/verify-constitution-maia.ts:271-278`). |
| **Stewardship** | ✅ | Partial | Partial | ❌ | Access/authority split: `lib/studio/containment/inferenceContainment.ts` (read-paths only, deletes nothing). Exit stewardship: `app/api/members/export-data/route.ts` covers **5 tables of 622**. `docs/architecture/MEMBER_CONTENT_RETENTION_INVENTORY.md` documents owner-orphaned residue. |
| **Relational intelligence** | ✅ | ✅ (objects) | Partial | ❌ | Relationship objects real: `practitioners`, `practitioner_client_notes`, `member_field_note_threads.center`, `sessions.team_id` (`lib/team/sessionTeamScope.ts` — fails loudly rather than landing a booking in someone else's Co-Lab). Relational *rights* (who may revoke, what survives relationship end): not represented. |
| **Developmental intelligence** | ✅ | ⚠️ **storage only** | ❌ | ❌ | `developmental_memories` (1,456 rows) is chronological storage ranked `ORDER BY significance DESC`. The mechanism designed for release — `FalsifiabilityAnchor.decay_conditions`, `cogos_surfacing_status = 'cleared_by_member'`, `applyDecay()` — exists and is unreachable from runtime. |
| **Continuity** | ✅ | ✅ | ✅ | ❌ | Cross-session recall wired and consent-gated: `[MAIA] conversational-block` / `[MAIA] episodic-block` log markers; `loadConversationalRecallPref` / `loadEpisodicRecallPref`. Production: `member_memory_atoms` 142, `episodic_memories` 115, `member_sessions` 707, `agent_runs` 33,985. |
| **Provenance integrity** | ✅ | ✅ | ✅ | ⚠️ partial | **Strongest area.** `episodic_member_marked_requires_verbatim` iff-CHECK; `member_memory_atoms_source_type_check` incl. `practitioner_observation`; `runtime_consent_state` (802 rows) + `deletion_manifests` + `provenance_tombstones` + restore-refusal triggers (`20260718000001_s5_provenance_substrate.sql`). Adversarial: 23/23 pins pass in `__tests__/practitioner-authority-boundaries.test.ts`. |
| **Model independence** | ✅ | Partial | ❌ | ❌ | Stored state is provider-independent (self-hosted Postgres). But the *behaviour* under audit — accepting correction — is delegated entirely to the provider via one prompt line (`lib/sovereign/maiaVoice.ts:470`). |
| **Portability** | ✅ | ⚠️ minimal | ❌ | ❌ | `app/api/members/export-data/route.ts` exports `members`, `member_settings`, `member_sessions`, `developmental_memories`, `google_calendar_credentials`. Excludes atoms, episodes, turns, anchors, field notes, consent state, relational records. |

---

## D. Corrigibility trace (T0 → T4)

### T0 — how could "Kelly withdraws during emotionally intense conflict" exist?

Three mechanisms could hold such a representation. Only one is live.

| Path | Status | Evidence |
|---|---|---|
| `interpretive_ledger` entry, promoted from `accumulating_hypotheses` through `runGateSequence` | **Designed, unreachable** | `promoteToLedger()` 0 callers; `accumulating_hypotheses` 0 rows in production |
| `developmental_memories` row (`content`, `significance`, `vector_embedding`) surfaced via `loadRecentDevelopmentalMemories` | **LIVE** | 1,456 rows in production; `ORDER BY significance DESC, formed_at DESC` — no recency-authority, no supersession filter |
| Purely in-context inference by Claude within the current window | **LIVE, unpersisted** | no representation exists to correct |

So in the current system such an interpretation most plausibly lives as **either** a high-`significance` `developmental_memories` row **or** a transient model inference. Neither carries a falsifiability anchor, a confidence value, or a correction hook.

### T1 — Kelly says: "That used to be true. It no longer represents me."

Traced end to end. What actually happens:

| Stage | Behaviour |
|---|---|
| Raw turn | Persisted to `conversation_turns` as ordinary turn text |
| Memory extraction | `extractObservations()` — **never invoked**; nothing classifies this as a correction |
| Hypothesis buffer | `enqueueContradiction()` — **never invoked** from any runtime path |
| Interpretive ledger | no entry exists to weaken; `CONTRADICTION_WEIGHTS.user_correction = 0.95` is never applied |
| Provenance | none of the provenance columns distinguish *correction* from ordinary member speech |
| Retrieval | the correction becomes one more retrievable turn, competing on recency alone |
| Context assembly | enters (if at all) through the `conversational` addendum, undifferentiated |
| Subsequent prompts | no marker tells MAIA this turn revises anything |

**Result: T1 produces no state transition.** The correction is stored as content, not as an authority event.

### T2 — a later session

Whichever of the two representations survives is chosen by `significance DESC, created_at DESC` — **not** by epistemic recency. A high-`significance` older interpretation therefore outranks a lower-`significance` newer correction by construction. The correction's authority is represented **nowhere**.

### T3 — under context pressure

The failure is structural rather than probabilistic. Because the correction carries no distinguishing marker, no ranking stage can preserve it preferentially: it can only survive by being recent enough to fall inside `LIMIT n`. Every loader on the live path is a fixed-`LIMIT`, single-`ORDER BY` window with no reserved slot for corrections and no supersession join. **Under sustained conversation the correction ages out while the interpretation, if it carries higher `significance`, does not.**

### T4 — "conflict is not an important developmental theme for me anymore"

The mechanism for this exact act is fully designed and entirely unreachable:

- `FalsifiabilityAnchor.decay_conditions` — *"What developmental shift would make this interpretation irrelevant"*
- `cogos_surfacing_status` enum member `'cleared_by_member'`
- `interpretive_ledger.routing_influence_weight` — *"Reduced by decay, contradictions, and member revocation. **Evidence is preserved regardless of this value.**"*

That comment is a precise architectural statement of *continuity of history without continuity of identity*. It is the correct answer to the central question. It is not wired, and its table is empty.

**Corrigibility verdict:** the *concept* is architected to an unusually high standard. The *capability* does not exist in the runtime. On the live path, corrigibility is one instruction — `lib/sovereign/maiaVoice.ts:470`: *"Hold every interpretation as provisional and correctable; confidence names how much is still uncertain."* The richer corrigibility language (*"Make corrigibility audible"*, *"Treat 'no, more like…' as the conversation working, not failing"*) lives in `app/api/oracle/conversation/route.ts:2724-2728` — a route CLAUDE.md documents as receiving approximately zero live traffic.

---

## E. Failure-mode results

### Failure 1 — Stale-authority regression — **CONFIRMED (structural)**

Not a bug; an absence. There is no supersession relation anywhere in the live path, so a superseded interpretation cannot lose authority — there is no authority field to lose. `developmental_memories` retrieval is `ORDER BY significance DESC, formed_at DESC` with no `superseded_by`, `valid_until`, or `contradicted_at` predicate. *Evidence:* `lib/maia/memoryLoaders.ts:87-106`; `interpretive_ledger` 0 rows.

### Failure 2 — Provenance collapse — **NOT CONFIRMED at the storage boundary; UNRESOLVED at the prompt boundary**

At storage, provenance is enforced by the database and cannot be bypassed by application code:

```sql
-- database/migrations/20260531000001_episodic_member_marked_provenance.sql
CHECK (
  (marked_by_member = TRUE  AND verbatim_text IS NOT NULL AND length(btrim(verbatim_text)) > 0)
  OR
  (marked_by_member = FALSE AND verbatim_text IS NULL)
);
```

This is an **iff** constraint: member-marked ⇒ must carry the member's own words; not member-marked ⇒ the verbatim channel stays NULL. System-authored text cannot be smuggled into the member's voice at the storage layer. Production confirms both sides are populated (`marked_by_member=true`: 7; `false`: 108), so the constraint is under live load, not merely declared.

Similarly `member_memory_atoms.source_type` is CHECK-constrained, and `practitioner_observation` is a distinct register — 12 such rows in production alongside 130 member-authored, with the migration stating the intent explicitly: *"approved practitioner observations enter memory as 'witnessed' … (facilitator saw this, not: this is unquestioned truth about the member)."*

**Where it is unresolved:** once the formatters (`formatAtomsForPrompt`, `formatPriorExchangesForPrompt`, `formatMarkedEpisodesForPrompt`) render these into addenda strings, the typed distinction becomes prose. `summarizePromptBlock()` counts characters per addendum, not provenance classes. Whether the rendered prose preserves the register — and whether the model honours it — is **not tested anywhere**. That is the highest-value unclaimed verification in the system.

### Failure 3 — Context-pressure inversion — **CONFIRMED (by construction)**

Member-is-Center is not represented at the point the model receives context. The addenda enumeration in `maiaRuntimeContext.ts:284-307` is the complete set of what reaches the prompt, and it contains no authority-bearing layer. Ranking is per-loader recency/significance with fixed `LIMIT`s and no cross-layer arbitration. There is no reserved capacity for member declarations and no truncation policy that protects them. **The constitutional hierarchy exists in the database and in canon; it does not exist in the prompt.**

### Failure 4 — Developmental freezing — **CONFIRMED (no release mechanism reachable)**

Covered at T4. `applyDecay()` is called only by `scripts/sweep-stale-sessions.ts`, against an empty table.

### Additional failure modes

| Mode | Result | Evidence |
|---|---|---|
| **Authority inversion (practitioner over member)** | **Actively defended** | `lib/studio/containment/inferenceContainment.ts` — *"Visibility, acknowledgment, confidence, recurrence, and professional role never create authorship or permission."* Practitioner pattern-ledger route **fails closed before any read**. 23/23 pins pass. |
| **Historical erasure** | **Not present** — design explicitly avoids it | `routing_influence_weight` comment: *"Evidence is preserved regardless of this value."* (unwired) |
| **Contradictory-memory accumulation** | **CONFIRMED** | Corrections accumulate as undifferentiated turns; no present-authority arbiter exists |
| **Inference laundering** | **Blocked at storage; untested at prompt** | `source_type` CHECK + episodic iff-CHECK prevent reclassification in the DB. No test covers the rendered prompt. |
| **Summary laundering** | **UNRESOLVED — no test exists** | `member_sessions.summary` is exported and stored; nothing constrains whether a summariser converts hedged material into declarative claims |
| **Relational-rights collapse** | **UNRESOLVED** | No revocation, no relationship-end semantics, no post-relationship obligation representation found |
| **Practitioner/client conflation** | **Blocked** | Distinct `source_type`; distinct tables; containment pins |
| **Silent reinterpretation** | **UNRESOLVED — unmeasurable today** | Requires behavioural testing; `checkNonAuthoritarianBehaviorPending()` is `[PENDING]` for the same reason |
| **Telemetry promotion** | **Blocked by declaration rule** | Containment ruling: *"Everything crossing from a person's sovereign field into a shared developmental commitment must be an explicit declaration by that person — never an observation, inference, score, pattern, telemetry event, or system-authored claim."* |
| **Model-dependent identity** | **CONFIRMED** | Corrigibility behaviour is 100% provider-side; see §H |
| **Non-portable interpretive context** | **CONFIRMED** | See §F |

---

## F. Exit-Soullab stress-test

**Scenario:** Kelly stops paying today and never returns.

### What he can obtain today

`GET /api/members/export-data` → a browser-downloadable JSON attachment (`maia-data-export-YYYY-MM-DD.json`) containing exactly:

| Included | Source |
|---|---|
| Profile | `members` (id, username, name, email, passkey, bio, timezone, onboarded, created_at, last_sign_in) |
| Settings | `member_settings` (all columns) |
| Session index | `member_sessions` (id, started_at, ended_at, mode, message_count, **summary**) |
| Developmental memories | `developmental_memories` (facet_code, event_type, cognitive_level, intensity, content, `has_embedding` boolean, created_at) |
| Google credential metadata | timestamps only, sanitised |

### What does **not** travel

Confirmed absent from the export route: `member_memory_atoms` (142 rows — including the 12 practitioner-witnessed observations), `episodic_memories` (115 — including all 7 member-marked verbatim moments), `conversation_turns` / `maia_turns` / `transcript_turns` (the actual conversations), `member_daily_anchors`, `member_field_note_threads`, `runtime_consent_state` (802 rows — his own consent history), `practitioner_client_notes`, `interpretive_ledger` (empty, but structurally excluded), `deletion_manifests`, team/Co-Lab membership, files and artifacts, model routing state.

**The export covers 5 tables. The schema has 622.** The single most member-authored artifact in the entire system — the 7 verbatim episodes the member explicitly marked, protected by a dedicated DB constraint — **cannot be exported.**

### What travels but is not meaningful elsewhere

`developmental_memories.content` travels as free text with `has_embedding: true` but **not the embedding**. `member_sessions.summary` travels — system-authored prose about the member, with no provenance marker in the export to say so. A recipient system cannot distinguish it from Kelly's own words. **The export flattens the provenance distinction that the database is architected to protect.** This is the single clearest instance of Failure 2 in the system, and it occurs at the exit boundary.

### Can a non-engineer use it?

No. It is an undocumented JSON dump with raw table shapes, no schema, no README, no provenance key, no rendered form.

### Could another developer reconstruct meaningful continuity?

Partially. Sessions, settings, and developmental memory text would reconstruct a thin chronology. The relational field, the marked moments, the consent history, and the conversations themselves are not in the bundle.

### Could another AIN implementation ingest it?

**No conforming implementation exists.** There is no published AIN schema, no protocol version, no conformance suite. The export has no format identifier.

### Multi-party material

Unresolved. `practitioner_client_notes` (3 rows in production) and practitioner-authored `member_memory_atoms` are *about* a member and *authored by* another person. No rule exists in code determining what Kelly may carry. The containment layer decides what a practitioner may **see**; nothing decides what a member may **take**. **This is a governance question, not a defect** — the architecture correctly declines to answer it, and correctly does not fabricate an answer.

### Deletion

Two contradictory lanes exist:

1. **`POST /api/members/delete-account` — honest and tested.** Refuses with HTTP 409 when governed content exists, deletes nothing, issues no mutating SQL, states plainly that nothing changed, names every retained class, and gives a next step. 11/11 tests pass (`lib/auth/__tests__/accountDeletionHonesty.test.ts`, run 2026-08-09). It makes no completeness claim — the suite asserts the strings *"all associated data"* and *"permanently deleted"* cannot appear.

2. **`POST /api/sovereignty/delete-my-memory` — dishonest on the failure path.** When its backing service is unavailable it returns:
   ```json
   { "success": true,
     "message": "Memory deletion request processed successfully",
     "details": "User data sovereignty service is initializing - your request has been queued",
     "support_message": "Please contact support to confirm deletion was completed" }
   ```
   Nothing was deleted and nothing was queued. `success: true` on an unfulfilled sovereignty request is the exact inverse of the discipline lane 1 enforces. **Documented, not fixed, per §22.**

---

## G. Relational-rights findings

**What exists and works.** Relationship is a first-class object, not an inference from conversation. `practitioners`, `sessions.team_id` (NOT NULL, Co-Lab-scoped), `practitioner_client_notes`, `member_field_note_threads.center` (`person` | `project`, commented *"Provenance only — never an inferred attribute of the person or project"*). `lib/team/sessionTeamScope.ts` refuses to route a booking into an arbitrary team rather than landing it somewhere plausible — an explicit fail-loud choice against scope leak.

**The strongest single finding in this audit.** `lib/studio/containment/inferenceContainment.ts` is a founder-authored containment layer (2026-08-06) that closes practitioner-facing read paths carrying system inference about members, without deleting the underlying substrate:

> *"Nothing has been deleted — this view is closed until a member-declared crossing exists."*
> *"Do not 'resolve' a containment by softening a label, hiding a score while keeping the claim, or relabelling inferred material as observed. Absence is the honest state."*

It is enforced by 23 passing pins (`__tests__/practitioner-authority-boundaries.test.ts`, run 2026-08-09, 23/23) that verify structurally — via `git grep` over the source tree — that the caseload store never reaches MAIA prompt building, that `practitioner_growth` has not spread beyond two known files, and that consult routes fail closed. This is **Level 3 adversarial verification** for that property, and it is the one place in the system where a property is defended against future drift rather than merely implemented.

**Caveat that must accompany the claim:** `pattern_ledger` has **0 rows** in production. The containment currently contains an empty substrate. That makes the containment *correct* but not *stress-tested under load* — its adversarial verification is of the code boundary, not of the data flow.

**Testing "payment cannot confer sovereignty over another person's relational field."**

- **Articulated:** yes — the containment ruling's authorship principle states it in general form.
- **Implemented:** partially and *indirectly*. Practitioner reach is bounded by role and by declaration-crossing, not by payment status. No code path was found in which subscription, tier, or account ownership grants authority over another person's material.
- **Verified:** no. There is no test asserting the negative, and no entitlements-to-relational-authority audit exists. The proposition currently holds because **no such linkage was built**, not because a mechanism prevents one from being built.

---

## H. Continuity decomposition

| Layer | What lives here | Survives a model change? |
|---|---|---|
| **AIN-governed** | `member_memory_atoms` (142), `episodic_memories` (115, 7 member-marked), `developmental_memories` (1,456), `member_sessions` (707), `runtime_consent_state` (802), consent flags on `members`, deletion manifests/tombstones | ✅ yes — self-hosted Postgres, provider-independent |
| **MAIA-specific** | addenda formatters, `buildMaiaWisePrompt`, `buildComprehensiveVoicePrompt`, mode/tier routing, `MAIA_ROUTE_REGISTRY` | ⚠️ survives provider change, but is MAIA product logic — not portable to another AIN implementation |
| **Model-provider** | **corrigibility**, non-authoritarian posture, refusal to interpret, tone, restraint — everything the canon calls constitutional behaviour | ❌ **no** — `scripts/verify-constitution-maia.ts:8-11` states this outright: *"MAIA's constitutional behavior is primarily runtime — it lives in prompts, response patterns, and relational posture, not in database rows."* |
| **Session-local** | `recentContext`, `conversationHistory.slice(-6)`, in-window inference | ❌ gone at session end |
| **Implicit** | continuity the member *experiences* that is reconstructed probabilistically from whatever addenda happened to fit | ❌ not represented anywhere; not measured |

**The decisive observation.** MAIA's *memories* are model-independent. MAIA's *character* — including its corrigibility — is not. The repository says so itself, and marks the corresponding checks `[PENDING]` rather than claiming them. That is intellectually honest and it is also the precise boundary Paper III must not blur: **AIN today governs what is remembered, not how it is deferred to.**

---

## I. Open-source implications

For each sovereignty claim, what must be open for it to be technically meaningful:

**Protocol sovereignty** requires: the provenance vocabulary (`source_type` enumeration, `marked_by_member` semantics, the consent-posture model), the crossing/declaration rule, the falsifiability-anchor schema, and a versioned export format. Today the vocabulary exists only as migration DDL inside a private repo, and the export format has no identifier.

**Implementation sovereignty** requires: the schema for the member-centred tables, the loader/consent-gate contract, and a conformance suite. `__tests__/practitioner-authority-boundaries.test.ts` and `scripts/verify-constitution-maia.ts` are the closest existing artifacts and are the natural seeds.

**Personal sovereignty** requires: an export covering the member-authored classes (currently 5 of 622 tables) plus a provenance key so a receiving system can tell declaration from inference.

### Candidate boundary classification

| Component | Classification |
|---|---|
| Provenance vocabulary + CHECK constraints (`20260531000001`, `20260624000001/2`) | **Likely AIN commons** |
| S5 provenance/consent substrate (`20260718000001`) | **Likely AIN commons** |
| COGOS corrigibility schema + gate model (`20260311000001/2/3`, `lib/types/interpretive-ledger.ts`) | **Likely AIN commons** — and note it is *unwired*, so opening it costs nothing operationally |
| Crossing/declaration rule + containment pattern | **Likely AIN commons** (governance primitive) |
| `lib/studio/containment/inferenceContainment.ts` | **Unclear** — the *pattern* is commons; the specific containments are Soullab product decisions |
| Loaders / formatters / `maiaRuntimeContext` | **MAIA-specific** |
| `maiaVoice.ts`, `intelligentVoiceAdaptation.ts`, prompt corpus | **MAIA-specific / Soullab commercial** |
| Corpus Callosum multi-agent substrate | **Soullab commercial** |
| Studio, Co-Lab, practitioner surfaces | **Soullab commercial** |
| Export format + conformance suite | **Founder decision required — does not yet exist** |

No licensing decision is made or implied here.

---

## J. Paper III evidence ledger

| Proposed Paper III claim | Evidence level | Evidence | Safe wording today |
|---|---|---|---|
| AIN distinguishes member declaration from system inference from practitioner observation | **2 — Verified** (approaching 3 at storage) | `episodic_member_marked_requires_verbatim` iff-CHECK; `member_memory_atoms_source_type_check`; production: 130 member-authored / 12 practitioner_observation atoms; 7 member-marked / 108 legacy episodes | *"AIN enforces provenance at the database layer: system-authored text cannot occupy the member's verbatim channel — this is a constraint, not a convention."* |
| System inference cannot silently reach a practitioner as fact about a member | **3 — Adversarially verified** (code boundary) | `inferenceContainment.ts` fails closed; 23/23 pins pass 2026-08-09 | *"Practitioner-facing surfaces are contained: inferred material is closed off until the member declares a crossing, and the boundary is defended by a structural test suite."* Add: the contained substrate currently holds no rows. |
| Payment does not confer authority over another person's relational field | **0–1 — Articulated, incidentally implemented** | Containment ruling; no entitlement→authority path found | *"No mechanism in AIN links payment to authority over another person's material. We have not yet built a test that would prevent one from being introduced."* |
| Members can correct MAIA and the correction remains authoritative | **0 — Articulated only** | COGOS designed; 0 callers; 0 rows; `checkCorrigibilityPending()` `[PENDING]` | ⛔ **Do not claim.** *"We have designed a corrigibility architecture — falsifiability anchors, weighted contradiction, member-revocable routing influence that preserves evidence. It is not yet wired into the runtime."* |
| History is preserved without becoming identity | **0 — Articulated only** | `routing_influence_weight` comment; `'cleared_by_member'`; `decay_conditions` — all unreachable | ⛔ **Do not claim as operative.** Safe: *"This is the principle the architecture is built toward, expressed in schema we have not yet activated."* |
| Member-is-Center is an architectural property | **0 — not present under this name** | 0 repo hits | ⛔ **Do not claim.** Either name the implemented cognate (authority-is-authored-or-held) or state Member-is-Center as the governing intention. |
| MAIA's continuity is model-independent | **1 — Partial; contradicted for behaviour** | Memory in self-hosted Postgres ✅; constitutional behaviour provider-side ❌ (`verify-constitution-maia.ts:8-11`) | *"Members' memory is model-independent by construction. MAIA's constitutional behaviour is not — it currently lives in prompts."* |
| Members can leave with their relational and developmental continuity | **1 — Implemented minimally; contradicted in practice** | Export = 5 of 622 tables; excludes atoms, episodes, turns, consent history | ⛔ **Currently contradicted by evidence.** Safe: *"A data export exists. It does not yet carry the member-authored classes we consider most theirs."* |
| Deletion is honest about what it cannot do | **2 — Verified for one lane; contradicted by another** | 11/11 tests on `delete-account`; `delete-my-memory` returns `success: true` on failure | *"Our account-deletion path refuses rather than over-claiming, and is tested for that. A second, older sovereignty endpoint does not meet that standard and is a known defect."* |
| Consent is per-turn, content-free, and governs what may be written | **2 — Verified** | S5 substrate; `runtime_consent_state` 802 rows in production; mint gates + restore-refusal triggers | *"Sanctuary is a per-turn posture recorded content-free, and no durable object may be minted without knowing the posture that governed its creation."* |

---

## K. Gaps (classified — not fixed)

| # | Gap | Class |
|---|---|---|
| 1 | COGOS corrigibility pipeline has no runtime entry point (`extractObservations` 0 importers) | **Architectural gap** |
| 2 | No authority/supersession layer in prompt assembly (`summarizePromptBlock` has no such addendum) | **Architectural gap** |
| 3 | `delete-my-memory` returns `success: true` on service failure | **Implementation defect** (member-facing, sovereignty-critical) |
| 4 | Export covers 5 of 622 tables; excludes all member-marked verbatim content | **Product decision + architectural gap** |
| 5 | Export flattens provenance — system-authored `summary` indistinguishable from member text | **Implementation defect** |
| 6 | No test that provenance survives formatter → prompt rendering | **Verification gap** (highest value; cheapest to close) |
| 7 | No behavioural corrigibility harness; repo's own verifier says so | **Verification gap** |
| 8 | Summary laundering unconstrained and untested | **Verification gap** |
| 9 | No relational-rights model: revocation, relationship end, post-relationship obligation | **Governance question** |
| 10 | Multi-party export entitlement undecided | **Founder decision** |
| 11 | "Member-is-Center" named nowhere; cognates scattered across ≥3 canon documents | **Documentation gap** |
| 12 | No AIN protocol version, export format identifier, or conformance suite | **Future ecosystem dependency** |
| 13 | `member_daily_anchors` = **0 rows** in production, against CLAUDE.md's *"shipped + verified LIVE (2026-07-03)"* | **Verification gap — observed discrepancy, cause not investigated** |
| 14 | `pattern_ledger` = 0 rows; containment protects an empty substrate | **Verification gap** |
| 15 | Continuity substrate is thin (7 member-marked episodes / 87 members) — claims about lived continuity outrun the data | **Verification gap** |

---

## L. Recommended next decisions (no implementation)

The evidence makes these decisions necessary, in this order:

1. **Decide whether corrigibility is a runtime property or a prompt posture.** Everything else in this audit follows from that answer. Wiring COGOS is a substantial architectural act, not a patch — §4 of the governing prompt applies, and the correct move is a decision, not a diff.
2. **Rule on the `delete-my-memory` false-success path.** It is a live member-facing sovereignty claim that is untrue on its failure path. This is the one finding that arguably should not wait for the broader lane.
3. **Rule on export scope and provenance fidelity.** Specifically: do member-marked verbatim episodes travel, and does the export carry a provenance key?
4. **Rule on multi-party material at exit** — what a member may carry when another person authored it about them.
5. **Authorize the cheapest verification first:** a test that provenance registers survive the formatter → prompt boundary. It closes Gap 6, it is deterministic, and it is the difference between "we store provenance" and "MAIA receives provenance."
6. **Decide the name.** Either adopt *Member-is-Center* into canon and code, or retire it in favour of *authority is authored or held*, which is what is actually implemented. Paper III should not introduce a term the architecture does not use.
7. **Decide what Paper III claims** against §J — specifically, whether to lead with provenance and containment (verified, defensible, and genuinely uncommon) rather than with corrigibility (designed, unwired).

---

## Verification-readiness appendix

Reproducible commands. All read-only.

```bash
# 1. "Member-is-Center" appears nowhere
cd /Users/soullab/MAIA-SOVEREIGN
rg -il --glob '!node_modules' -e 'member[- _]?is[- _]?center' -e 'memberIsCenter' .
# expected: no output

# 2. Corrigibility pipeline has no runtime entry point
rg -ln --glob '!node_modules' -g '*.ts' 'consciousness/observationExtractor' . | grep -v 'lib/consciousness/observationExtractor.ts'
# expected: no output

# 3. Ledger promotion / routing never called
rg -n --glob '!node_modules' -g '*.ts' '\b(promoteToLedger|loadLedgerForRouting|loadLedgerSummaries)\b' . | grep -v 'lib/consciousness/interpretiveLedger.ts'
# expected: no output

# 4. Complete set of addenda reaching the prompt
sed -n '281,310p' lib/maia/maiaRuntimeContext.ts
# expected: memoryInfluence, forwardReadiness, atoms, memberWeb, astrology,
#           studio, knowledgeGate, wuxing, conversational, episodic — no ledger

# 5. The repo's own verdict on corrigibility
sed -n '271,278p' scripts/verify-constitution-maia.ts
# expected: [PENDING] Corrigibility cannot yet be verified at deployment time

# 6. Provenance constraint is a real DB constraint
rg -n -A12 'episodic_member_marked_requires_verbatim' database/migrations/20260531000001_episodic_member_marked_provenance.sql

# 7. Containment pins (23 tests)
npx jest __tests__/practitioner-authority-boundaries.test.ts
# observed 2026-08-09: 23 passed, 23 total

# 8. Deletion honesty (11 tests)
npx jest lib/auth/__tests__/accountDeletionHonesty.test.ts
# observed 2026-08-09: 11 passed, 11 total

# 9. Export scope — count the tables
rg -n 'FROM \w+' app/api/members/export-data/route.ts
# expected: members, member_settings, member_sessions, developmental_memories,
#           google_calendar_credentials  (5)
```

```bash
# 10. Production evidence (read-only SELECTs, run from Mac Studio)
ssh soullab@minisforum 'docker exec maia-postgres psql -U soullab maia_consciousness -tAc "
SELECT '\''atoms='\''||(SELECT count(*) FROM member_memory_atoms)
     ||'\'' episodic='\''||(SELECT count(*) FROM episodic_memories)
     ||'\'' members='\''||(SELECT count(*) FROM members)
     ||'\'' anchors='\''||(SELECT count(*) FROM member_daily_anchors)
     ||'\'' ledger='\''||(SELECT count(*) FROM interpretive_ledger)
     ||'\'' hypoth='\''||(SELECT count(*) FROM accumulating_hypotheses)
     ||'\'' calib='\''||(SELECT count(*) FROM relational_calibration)
     ||'\'' consent='\''||(SELECT count(*) FROM runtime_consent_state);"'
# observed 2026-08-09:
#   atoms=142 episodic=115 members=87 anchors=0
#   ledger=0 hypoth=0 calib=0 consent=802
```

### Limitations of this audit — stated plainly

1. **No live conversational runtime was exercised.** T0–T4 were traced through code and schema, not driven through an authenticated production session. Doing so would have required writing to a real member's relational history; §21 forbids it and no isolated member fixture with populated memory exists. **The T3 context-pressure finding is therefore Level-1 structural reasoning, not Level-2 observation** — though the absence of any supersession predicate in the loaders makes the structural conclusion difficult to escape.
2. **The prompt boundary was not instrumented.** No rendered system prompt was captured, so the Failure-2 question at the prompt boundary is genuinely open in both directions.
3. **`n_live_tup` estimates were initially stale** (reported 15 atoms against an actual 142). All figures in this document are exact `count(*)` values.
4. **Coverage is partial.** 622 tables exist; this audit examined the subsystems on the live MAIA path plus the practitioner and exit surfaces. Absence of a finding in an unexamined subsystem is not evidence of absence.
5. **This is an internal audit and is not independent verification.** §17 readiness is provided so that it can be checked, not so that it can be trusted.

### Contradictions preserved rather than resolved (§20)

- The system is **simultaneously** more disciplined than its documentation claims (S5 consent substrate, containment pins, deletion honesty are barely narrated) and less capable than its documentation implies (corrigibility, anchors). Both are true.
- Two deletion lanes hold **opposite** standards of honesty. Neither has been reconciled.
- The corrigibility schema contains the single most precise statement of the audit's central principle — *"Evidence is preserved regardless of this value"* — and it is dead code. The best thinking in the system is in the part that does not run.

---

*Read-only audit. No implementation changes were made.*
