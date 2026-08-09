# AIN — Deep Memory, Relational Continuity & Connection Architecture Audit

**Date**: 2026-08-09 · **Type**: read-only architectural investigation · **Status**: evidence for founder ruling
**Scope**: `/Users/soullab/MAIA-SOVEREIGN` @ `feature/labtools-redesign` · production DB `maia_consciousness` on minisforum
**Nothing was implemented, migrated, refactored, or fixed.**

> **Orientation check (PROJECT_ORIENTATION.md)**: memory is a **level-5 supporting capability**. This audit is authorized by the current phase (*"complete capability audits"*) and is explicitly **not** a roadmap. Per *Forbidden drift*: nothing here authorizes a memory subsystem to generate its own roadmap.

---

## 0. Headline

**AIN already has the primitives for relational and trajectory memory. Almost none of them are connected, and the one that genuinely works has never been named as memory.**

Three findings dominate everything else:

1. **`memory_links` is the generic relational primitive the proposition asks for. It already exists, with the right link vocabulary (`supports · contradicts · evolves · repeats · triggers · derives_from`) and a `created_by` provenance column. It has zero importers in the codebase and 0 rows in production.** Do not build this. It is built.
2. **`member_relationships` + `relationship_entries` is a live, four-month-deep, member-owned relational thread substrate — 1,157 entries across 43 relationships, with `rupture` and `repair` and `threshold` as first-class kinds.** It is Cat 6. It has never appeared in any memory framing in `CLAUDE.md`, MEMORY.md, or the memory-service matrices. This is inverse drift of the exact kind the project already named.
3. **`conversation_memory_uses` has 72,168 production rows and is written from the live MAIA path.** It records *which memory was retrieved, into which turn, scored how, used as what*. It is a `memory ↔ turn ↔ time` spine — the closest existing thing to a trajectory substrate — and it is currently classified as retrieval debug telemetry.

The deep-memory proposition **survives falsification**, but in a weaker and more useful form than stated. See §13.

---

## 1. Existing Memory Ecology

437 migrations; ~460 tables. Memory-relevant substrates, grouped by the ten lenses. Production row counts are exact `count(*)` taken 2026-08-09.

| Lens | Substrate | Rows (prod) | Verdict |
|---|---|---|---|
| Archive | `conversation_turns` | 39,555 | live |
| Archive | `maia_turns` | 1,713 | live |
| Archive | `agent_runs` | 33,985 | live (Corpus Callosum) |
| Semantic | `member_memory_atoms` | 142 (10 members) | live |
| Semantic | `members`, `member_settings`, `member_keep_preferences` | live | live |
| Episodic | `episodic_memories` | 115 (21 members, 2026-06-09 → 2026-08-08) | live |
| Episodic | `episodes` (bardic) | **0** | parallel, unused |
| Episodic | `member_daily_anchors` | **0** | schema live, no member use (recorded correction stands) |
| Relational | `member_relationships` | 43 | **live, unnamed** |
| Relational | `relationship_entries` | **1,157** | **live, unnamed** |
| Relational | `practitioner_clients` | 13 | live |
| Relational | `client_relationships` | 0 | unused |
| Developmental | `member_spiral_state` | 9 (last write 2026-05-20) | live but *state*, not trajectory |
| Developmental | `spiral_stage_transitions` | **0** | unwired |
| Developmental | `threshold_passages`, `threshold_events` | **0** | unwired |
| Developmental | `practice_field_revisions` | 2 | barely live |
| Affective | `episodic_memories.emotional_intensity/emotional_vector` | present, mostly unused | column-level |
| Somatic | `somatic_memories` | **0** | Cat 4 (Later, per matrix) |
| Symbolic | `vault_symbols`, `vault_symbol_links`, `dream_entries`, `archetype_wisdom_library` | present | out of live turn path |
| Symbolic | `episodic_memories.archetypal_resonances` | column, unused | column-level |
| Contextual/field | `field_records` (1), `coherence_field_readings` (0), `field_state_snapshots` | ~0 | Cat 3/5, frozen |
| Metacognitive | `interpretive_ledger` | **0** | unwired |
| Metacognitive | `selflet_reinterpretations` | **0** | unwired |
| Metacognitive | `accumulating_hypotheses` / `hypothesis_contradictions` | **0** | unwired |
| Identity/narrative | `soul_portraits`, `story_revisions` (0), `recognitions` (0) | mixed | mostly unwired |
| **Connection** | **`memory_links`** | **0** | **built, zero importers** |
| Connection | `episode_links` | **0** | bardic-only, unused |
| Connection | `pattern_connections` | **0** | unwired |
| Retrieval trace | **`conversation_memory_uses`** | **72,168** | **live, misclassified** |
| Consent/provenance | `memory_contracts` (0), `provenance_tombstones` (0), `deletion_manifests` (1) | ~0 | designed, unexercised |

**Note on episodic duplication**: two independent episodic substrates exist — `episodic_memories` (live, 115 rows) and the bardic `episodes`/`episode_links` family (0 rows). They do not reference each other.

---

## 2. Actual Runtime Memory Paths

Traced by read/write, not filename.

### 2.1 The live turn path

`app/api/sovereign/app/maia/list/route.ts` → `lib/sovereign/maiaService.ts` → prompt builders.

Six memory loaders fire per turn (`route.ts:114-129`, `:809-919`):

| Loader | Source | Emits |
|---|---|---|
| `loadRecentDevelopmentalMemories` | developmental | text block |
| `loadRecentThemeSignals` | `member_theme_signals` | text block |
| `loadPriorCrossSessionExchanges` | `conversation_turns` | text block |
| `loadMemberMemoryAtomsForPrompt` | `member_memory_atoms` | text block |
| `loadRecentMarkedEpisodes` | `episodic_memories` | text block |
| `buildMemoryHealth` | all of the above | observability only |

**Capture → representation → persistence → relationship → retrieval → interpretation → presentation → correction**

- **capture**: live for turns, atoms (member gesture), episodes (member mark), relationship entries.
- **representation**: per-substrate, rich, with provenance columns on atoms.
- **persistence**: live.
- **relationship**: **the step is missing.** No loader reads or writes any link table.
- **retrieval**: six independent queries, no cross-references.
- **interpretation/presentation**: each loader's result is flattened by a `format*ForPrompt` function into an independent bulleted list of strings, prefixed with a *relative* time phrase (`lib/maia/memoryAtomsLoader.ts:361`, `lib/maia/episodicRecallBlock.ts:86,152`, `lib/maia/conversationalRecallBlock.ts:80,146`).
- **correction/forgetting**: declarative 42-table manifest in `app/api/members/delete-account/route.ts` — genuinely good, see §7.

### 2.2 The dead path

`app/api/oracle/conversation/route.ts` → `MemoryPalaceOrchestrator` → `EpisodicMemoryService`. Per `CLAUDE.md`, this route receives ~zero live traffic. **This is the only route from which `EpisodicMemoryService.connectEpisodes()` is reachable** (`lib/consciousness/memory/EpisodicMemoryService.ts:167-190`). 0 rows in production confirms it has never fired for a member.

### 2.3 The unnamed live path

`lib/sovereign/maiaService.ts:730` (`recordRetrievedCandidates`) and `:3113-3121` (`recordBatch`) → `ConversationMemoryUsesStore` → `conversation_memory_uses`. 72,168 rows. This runs on every live turn.

---

## 3. Memory Depth Matrix

Classification: **A** works · **B** exists but disconnected · **C** conceptual, no runtime substrate · **D** genuinely absent · **E** should not exist.

| Dimension | Substrate | Captured | Connected | Temporal | Provenance | Sovereign | Retrieved | Class | Loss surface |
|---|---|---|---|---|---|---|---|---|---|
| Archive | `conversation_turns` | ✅ | ❌ | ✅ | partial | ✅ delete | ✅ | **A** | turns never link to what they produced |
| Semantic | `member_memory_atoms` | ✅ | ⚠️ `thread_ids` exists, **0% populated** | ✅ | ✅ strong | ✅ | ✅ | **B** | atom↔atom relation impossible; 130/142 `unattributed-historical` |
| Episodic | `episodic_memories` | ✅ | ⚠️ 3 connection columns, **0% populated** | ✅ | ✅ `marked_by_member`, `source_turn_id` | ✅ | ✅ | **B** | recurrence of the same episode is invisible |
| Episodic (bardic) | `episodes`/`episode_links` | ❌ | schema only | ✅ | ⚠️ | ✅ | ❌ | **B** | duplicate ontology, zero use |
| Relational | `relationship_entries` | ✅ | ✅ via `relationship_id` | ✅ | ⚠️ `maia_reflection` sits beside `free_text` | ✅ | ❌ **not in turn path** | **B** | **the richest relational history in the system never reaches MAIA** |
| Developmental | `member_spiral_state` | ✅ | ❌ | ⚠️ upsert overwrites | ❌ | ✅ | ✅ conductor | **B** | prior states destroyed on write |
| Developmental | `spiral_stage_transitions` | ❌ | schema supports `from→to` | ✅ | ❌ | ✅ | ❌ | **B** | trajectory schema exists, nothing writes it |
| Affective | `emotional_intensity`, `significance` | ⚠️ | ❌ | fixed at write | ❌ | ✅ | ❌ | **B/E** | significance cannot change over time |
| Symbolic | vault/dream/archetype | ⚠️ | ❌ | ✅ | ⚠️ | ✅ | ❌ | **B** | symbolic recurrence unrepresented in turn path |
| Contextual/field | `field_records`, coherence | ❌ | ❌ | ✅ | ⚠️ | ✅ | ❌ | **C** (frozen, Cat 5) | — |
| Metacognitive | `interpretive_ledger` | ❌ | ❌ | ✅ | ✅ designed | ✅ | ❌ | **B** | change in *how* the member understands is uncaptured |
| Identity/narrative | `soul_portraits`, `recognitions` | ⚠️ | ❌ | ⚠️ | ⚠️ | ✅ | ❌ | **B** | portrait risks becoming a frozen profile (see §11) |
| **Connection** | **`memory_links`** | ❌ | ✅ **schema is correct** | ✅ | ✅ `created_by` | ✅ in delete manifest | ❌ | **B** | **zero importers — the whole axis is dark** |
| **Retrieval trace** | **`conversation_memory_uses`** | ✅ 72k | ✅ polymorphic ref | ✅ | ✅ scores + `used_as` | ✅ | write-only | **B** | **never read back; the trajectory is being recorded and discarded** |

**Genuinely absent (D)**: nothing in the ten lenses is class D. Every dimension has at least a schema. **This is the audit's most important negative result.**

---

## 4. Connection & Relationship Map

Thirteen questions from Phase 2, answered against the live substrates.

| # | Question | Answer |
|---|---|---|
| 1 | Belongs to whom? | ✅ every table is `member_id`/`user_id` scoped |
| 2 | What produced it? | ⚠️ atoms: `source_type`/`source_id`/`generated_by` ✅. Episodes: `source_turn_id` ✅. `relationship_entries`: ❌ no producer column — `maia_reflection` and `free_text` are adjacent columns with no epistemic tag |
| 3 | Provenance preserved? | ⚠️ atoms have `provenance jsonb` but **12/142 populated**; 130 are `unattributed-historical` |
| 4 | Temporal context? | ✅ universally |
| 5 | Reference another memory? | **`memory_links` can (0 rows). `episodic_memories.related_episodes` can (0 rows). `atoms.thread_ids` can (0 rows). In practice: no.** |
| 6 | Reference another entity? | ✅ atoms carry `facilitator_id`, `team_id`, `client_id`, `encounter_id` — genuinely good |
| 7 | Participate in a sequence? | ⚠️ only `relationship_entries` (ordered by `created_at` within a `relationship_id`) |
| 8 | Contradictions coexist? | **Schema: yes** (`memory_links.link_type='contradicts'`, `hypothesis_contradictions`). **Runtime: never tested — both empty** |
| 9 | Reinterpret without rewriting? | **Schema: yes** (`memory_links.evolves`, `selflet_reinterpretations`, `story_revisions`). **Runtime: no writer exists** |
| 10 | Significance changes over time? | ❌ `significance`/`emotional_intensity` are write-once integers on the episode row. Re-scoring would overwrite history |
| 11 | Relationship has its own history? | ✅ **yes — `relationship_entries` is exactly this, and it works** |
| 12 | Member can inspect/correct/remove? | ✅ delete ✅; inspect ⚠️ partial; **correct ❌ — no correction gesture exists on any memory object** |
| 13 | Retrieval preserves relationships? | ❌ **No. Every loader terminates in a `format*ForPrompt` that emits an independent bulleted list of quoted strings with relative timestamps. Six blocks reach the prompt with no reference to each other.** |

**Where connection information is lost — the precise seam:**

> Connection is not lost at capture and not lost at persistence. **It is lost because it is never created.** Six loaders each run one flat query and each flatten to one text block. There is no stage in the live path — none — at which a relationship between two memory objects is either written or read.

The corollary matters for §12: this is *not* a schema deficiency.

---

## 5. Trajectory Capability Analysis

**Can the architecture distinguish state from change?**

Primitives found that can express `A → B`:

| Primitive | Location | Expresses | Live |
|---|---|---|---|
| `memory_links.link_type='evolves'` | `20251231_memory_architecture_enhancements.sql` | any memory → any memory | ❌ 0 |
| `spiral_stage_transitions.from_stage/to_stage` + `transition_type` | `20241202000001` | developmental stage change | ❌ 0 |
| `selflet_reinterpretations` | `20251229000001` | later understanding of earlier self-record | ❌ 0 |
| `story_revisions`, `working_draft_revisions`, `practice_field_revisions` | various | versioned supersession | 2 rows total |
| `personal_living_field_versions` | — | field version lineage | 1 |
| `attempt_lineage` | `20260118000003` | creative attempt derivation | ❌ 0, **0 code refs** |
| `episodic_memories.connection_types='progression'` | live table | episode → episode progression | ❌ 0 |
| `conversation_memory_uses` | live | **memory → turn → time, with scores** | ✅ **72,168** |
| `relationship_entries` | live | **relationship → event sequence over 4 months** | ✅ **1,157** |

**Verdict: AIN already possesses the primitives necessary for trajectory memory, and two of them are already running in production.** No subsystem names them that way.

The two live ones are the finding. `conversation_memory_uses` answers *"when did this memory become relevant, and how did its relevance score change across turns?"* — a trajectory question — from data already on disk. `relationship_entries` answers *"how has this relationship moved through rupture and repair?"* — also from data already on disk.

**What is genuinely missing is not a trajectory table. It is a reader.**

---

## 6. Relational Thread Analysis

### 6.1 What works

`member_relationships` (43 rows) + `relationship_entries` (1,157 rows) is a real relational-thread implementation:

- The relationship is a **first-class entity** (`member_relationships.id`), not an attribute of either person.
- Events attach to the **relationship**, not to a person (`relationship_entries.relationship_id`).
- `kind` vocabulary: `note` (575) · `reflection` (277) · `threshold` (185) · `rupture` (104) · `checkin` (14) · `repair` (2).
- Temporal spread: **2026-04-03 → 2026-08-09**, continuous.
- Depth distribution is real, not synthetic: one relationship has 774 entries; then 68, 62, 47, 28, 23, 20, 18, 18, 16, 13 — a long tail consistent with organic use.

**`rupture` and `repair` as durable, member-owned, relationship-scoped event kinds is precisely the "relationship has its own history" capability the audit was sent to look for. It exists and it has four months of data.**

### 6.2 What is wrong with it

Three defects, in severity order:

1. **It never reaches MAIA.** No memory loader in the live turn path queries `relationship_entries`. The richest relational history in the system is invisible to the companion.
2. **Provenance is ambiguous by column adjacency.** `free_text` (member) and `maia_reflection` / `pattern_hint` / `suggested_movement` (system) sit as sibling columns on the same row with no epistemic tag. A later reader cannot distinguish what the member said from what MAIA suggested without knowing the column semantics. This is a **live violation of guardrail 6**, on the substrate with the most data.
3. **`repair` = 2 against `rupture` = 104.** Not necessarily an architecture problem — but if the interface makes rupture easy to record and repair hard, the substrate is accumulating a one-sided relational history. Worth a design look; **not** a memory fix.

### 6.3 Can the primitives generalize?

`member_relationships` is typed by `realm` + `bond_type` and holds only `person ↔ person`. `member_memory_atoms` independently carries `facilitator_id`, `team_id`, `client_id`, `encounter_id` — entity references without relationship history.

So AIN has **relationship-with-history for people** and **entity-reference-without-history for everything else**. The generalization to `person ↔ place / project / practice / symbol / idea` is *structurally available* (`memory_links` is table-polymorphic: `from_table`/`from_id`/`to_table`/`to_id`).

**Recommendation: do not generalize the schema.** See §12 and guardrail 7. The polymorphic primitive already exists; the question is whether anything should write it, not whether more shapes should be added.

---

## 7. Sovereignty / Provenance Analysis

### 7.1 Strong

- **Deletion**: `app/api/members/delete-account/route.ts` is a declarative 42-table manifest with per-table `column` and member-facing `label`. It **includes the unused link tables** (`memory_links:38`, `episode_links:94`, `pattern_connections:98`, `spiral_stage_transitions:102`). Someone thought about derived-relationship propagation before the relationships existed. `lib/auth/__tests__/accountDeletionHonesty.test.ts` guards it.
- **Consent gating**: `loadConversationalRecallPref`, `loadEpisodicRecallPref`, `member_daily_anchors.surface_preference`, atoms' `return_preference` / `crossing_allowed` / `memory_scope`. Consent is per-layer and member-authored.
- **Epistemic vocabulary discipline**: `lib/ain/portable/projectKeep.ts:225` **refuses** unknown `epistemological_status` values (`unknown_vocabulary`) rather than coercing. Test at `projectKeep.test.ts:210` proves `'confirmed'` is rejected. This is the strongest single piece of provenance engineering in the repo.

### 7.2 Weak

- **Provenance is optional in practice.** 130 of 142 atoms are `unattributed-historical` with `epistemological_status` NULL. The vocabulary is enforced *when present* and absent most of the time.
- **`relationship_entries` has no provenance column at all** (§6.2).
- **`memory_links.created_by` allows `'maia'` and `'system'`** — meaning an inferred connection would persist in the same table, same shape, as a member-confirmed one, distinguished only by that column. That is adequate *only if every reader filters on it*. There are no readers yet, so the discipline is untested. **This is the single highest-risk seam if links are ever activated.**
- **No correction gesture exists.** A member can delete everything, or nothing. There is no "that's not what I meant" on any memory object. Guardrail 3 (reinterpretation must not rewrite history) is satisfied *vacuously* — reinterpretation is impossible.
- **`memory_contracts` (0 rows) and `provenance_tombstones` (0 rows)** — the consent-and-forgetting infrastructure for derived memory is designed and unexercised.

---

## 8. Memory Loss Surfaces

Ranked by what is actually being lost, per turn, today:

1. **Retrieval trajectory is written and discarded.** 72,168 rows in `conversation_memory_uses`, zero read paths back into any member-facing or prompt-facing surface.
2. **Relational history is invisible to the companion.** 1,157 relationship entries including 104 ruptures; MAIA cannot see any of them.
3. **Episode recurrence is unrepresentable in practice.** The same theme returning five times is five unconnected rows. `connection_types='progression'` exists for exactly this and is empty.
4. **Spiral state overwrites its own history.** `member_spiral_state` upserts; `spiral_stage_transitions` (which would preserve `from→to`) is empty. Development is stored as a current position with no path.
5. **Prompt-time flattening.** Six blocks of quoted strings with relative timestamps. Even where a relationship *could* be inferred by the model, the absolute time anchors needed to do so are stripped by the formatters.
6. **Significance is frozen at write.** An episode that becomes important six months later cannot become important.
7. **Metacognitive change is uncaptured.** `interpretive_ledger` empty — no record of the member's *way of understanding* shifting.
8. **Two episodic ontologies, neither aware of the other.** 115 rows in one, 0 in the other, no bridge, both in the delete manifest.

---

## 9. Existing-but-Disconnected Capabilities (Class B)

The complete list, with the cost of connection:

| Capability | Substrate | What's missing | Cost |
|---|---|---|---|
| Generic memory→memory linking | `memory_links` | any importer at all | **store exists** (`lib/memory/stores/MemoryLinksStore.ts`), zero callers |
| Relational thread → MAIA | `relationship_entries` | a loader | one loader, same shape as the other six |
| Retrieval trajectory readback | `conversation_memory_uses` | a reader | store already has query methods (`:243,:274,:318,:356`) |
| Episode↔episode connection | `episodic_memories.related_episodes` | live caller for `connectEpisodes()` | method exists, reachable only from the dead oracle route |
| Developmental transitions | `spiral_stage_transitions` | writer at the spiral-state upsert site | one insert beside an existing upsert |
| Atom threading | `atoms.thread_ids` | writer | column exists |
| Metacognitive continuity | `interpretive_ledger` | writer | service exists (`lib/consciousness/interpretiveLedger.ts`) |
| Reinterpretation | `selflet_reinterpretations` | writer + member gesture | schema exists |
| Contradiction | `hypothesis_contradictions`, `link_type='contradicts'` | writer | schema exists |
| Pattern evidence chains | `pattern_evidence`, `pattern_ledger` | rows | routes exist |

**Every row in this table is a connection, not a construction.**

---

## 10. Genuine Architectural Absences (Class D)

After tracing all ten lenses: **there are no class-D absences in the memory domain.**

Four things are absent but are **not memory substrates**:

1. **A member correction gesture** — a UI/consent affordance, not a table.
2. **A retrieval layer that reads relationships** — the loaders are the gap; `memory_links` is not.
3. **Mutable-over-time significance** — requires a decision about whether significance is a property of the record or of a link *to* the record. **This is a founder question, not an engineering one.**
4. **A single episodic ontology** — a consolidation decision (`episodic_memories` vs. bardic `episodes`), not new capability.

**The audit found no case where the correct response is a new memory table.**

---

## 11. Things AIN Should Explicitly Refuse to Remember or Infer (Class E)

Proposed for founder ratification. Each is grounded in an existing invariant.

1. **System-inferred emotional or somatic state as member fact.** `episodic_memories.emotional_vector` / `somatic_vector` / `emotional_intensity` are inference-shaped columns with no provenance tag. If they are ever populated by a model, they must carry epistemic status or they must not persist. *(Guardrail 1; Sovereignty rider in `INHABITABLE_ARCHITECTURE.md`.)*
2. **Inferred `memory_links` presented as member-authored.** `created_by='maia'` links must be filterable and must never enter a prompt without their provenance surviving into the text. *(Guardrail 6; the §7.2 risk seam.)*
3. **Cross-member pattern aggregation.** `morphic_pattern_memories`, `collective_breakthroughs`, `community_field_state` — already Cat 4 "Later with named gate". Deep memory must not become the reason to lift that gate.
4. **Trait-form identity claims.** No substrate should ever hold `member is X`. `soul_portraits` and `member_patterns` are the two that could drift there. Prefer `at T, in context C, the member expressed X`. *(Guardrail 2.)*
5. **Retroactive significance rescoring by the system.** If significance becomes mutable, only a member gesture may move it. A model deciding an old memory "matters more now" is interpretive displacement.
6. **Deriving relational state from `relationship_entries`.** 104 ruptures and 2 repairs must never be read as a claim about the health of a relationship. The entries are witnessed records; the summary would be an inference about a third party who never consented. *(Guardrail 1 + Invariant 14.)*
7. **Reconstructing deleted memory from `conversation_memory_uses`.** The retrieval trace holds `memory_table` + `memory_id` for 72,168 retrievals. If a member deletes a memory, the trace must not become a shadow copy of what was forgotten. **The delete manifest already covers this table (`:83`) — this is a rule to preserve, not to add.** *(Guardrail 5.)*

Item 7 is the sharpest: **the most valuable trajectory substrate in the system is also the most dangerous forgetting-surface.** Any activation of `conversation_memory_uses` as memory rather than telemetry must be paired with an explicit forgetting proof.

---

## 12. Minimal Architectural Unification Opportunities

Stated as findings, **not as a roadmap**, per guardrail 8 and PROJECT_ORIENTATION's forbidden drift.

**The unification is a reader, not a schema.**

Every one of the six live loaders has the same shape: `load*(userId, n) → rows → format*ForPrompt(rows) → string`. The relationship axis is absent because the shape has no slot for it, not because the data can't express it.

Three observations, in order of how much they would prove per unit of change:

- **U1 — One loader would test the whole proposition.** Adding `relationship_entries` to the live path is the same shape as the six existing loaders, uses a substrate with four months of real data, and is the only change that would let the deep-memory proposition be evaluated against member experience rather than against schemas. It requires no new table, no link activation, and no inference. *It also requires solving §6.2 defect 2 first — provenance on that substrate is currently ambiguous.*
- **U2 — The `format*ForPrompt` layer is the actual chokepoint.** Six independent flatteners with no shared contract. Whatever is decided about relationships, it lands here. This is the analogue of the `appendAllContextAddenda` seam already documented in `ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md` §V — **same architectural defect, one layer up.** That prior finding should be read together with this one.
- **U3 — `memory_links` should not be activated first.** It is the most general primitive and the least constrained; activating it before any specific relationship has proven useful in a prompt would generate inferred links with no reader discipline (§7.2, §11.2). The generic primitive is the *last* thing to turn on, not the first.

**Explicitly refused by this audit**: no knowledge graph, no ontology engine, no vector-store replacement, no universal nodes/edges layer. `memory_links` already is the polymorphic edge table, and the finding is that it is premature — proposing a *second*, more general one would be the exact failure guardrail 7 names.

---

## 13. Falsification of the Deep-Memory Proposition

### Proposition 1

> *AIN should not merely preserve what the member has said or done. It should be capable, under member sovereignty, of preserving meaningful continuity among experiences, relationships, understandings and transformations through time.*

**Attempted falsification**: if the architecture systematically resisted continuity, the proposition would demand a rebuild.

**Result: does not falsify — and the reason is uncomfortable.** The architecture does not resist continuity; it has *thirteen* substrates for it, and the member-facing system has never used any of them. The proposition is not blocked by architecture. It is unexercised.

**What it forbids** (the more useful question): it forbids continuity that is not member-sovereign. Under this proposition, `conversation_memory_uses` — 72,168 rows of continuity data accumulated with no member gesture, no consent surface, and no inspection path — is **already a violation in waiting**. The proposition constrains the system's most trajectory-rich substrate more tightly than any absent capability.

### Proposition 2 (the stronger one)

> *The fundamental unit of deep memory may not always be the memory object. In some cases it may be the relationship or trajectory connecting multiple witnessed records.*

**Attempted falsification against the existing ontology**: three tests.

1. *Does any live substrate treat a relationship as the unit?* **Yes.** `member_relationships` + `relationship_entries` — the relationship holds identity, the events attach to it, neither person owns the history. 1,157 rows. **Confirms.**
2. *Does making relationships primary break provenance?* **It already has.** On the one substrate where the relationship *is* the unit, `free_text` and `maia_reflection` are indistinguishable siblings (§6.2). **This is evidence for a real cost, not a refutation** — but it means the proposition, if ratified, obligates a provenance model for *links and threads*, not just for records. `memory_links.created_by` is the beginning of one; `relationship_entries` has none.
3. *Does it break forgetting?* **Potentially, and this is the strongest objection.** If the unit of memory is a relationship among records, deleting one record leaves a thread referencing a void. The delete manifest deletes link rows by `user_id` — which works for member-owned single-party links and **does not obviously work for `member_relationships`, where the thread concerns a second person who is not the account holder.** No test covers this case.

**Verdict: Proposition 2 survives, in a narrowed form.**

> The relationship or trajectory can be the unit of memory — **but only where the thread carries its own provenance and its own forgetting semantics.** Today exactly one substrate treats relationships as primary, and it has neither.

**What Proposition 2 forbids**: it forbids treating a link as a lightweight annotation. If a relationship can be the unit of memory, then every link is itself a memory object requiring provenance, consent, inspection, correction, and deletion. That constraint **disqualifies the cheapest possible implementation** of every item in §9 — including simply switching on `memory_links`.

---

## 14. Recommended Sequence, If Intervention Is Warranted

**No intervention is recommended by this audit.** Per PROJECT_ORIENTATION, memory is level 5 and may not generate its own roadmap. What follows is the *ordering constraint* that would apply if the founder authorizes work — offered so that a future decision is not made in the wrong order.

**Ordering constraints (not a plan):**

0. **Nothing below is authorized by this document.**
1. **A naming correction comes before any code.** `relationship_entries` (1,157 rows) and `conversation_memory_uses` (72,168 rows) are Cat 6 substrates absent from every memory framing in the project. Per the project's own inverse-drift discipline, *"we didn't see X was Cat 6"* is a recorded failure mode. **The record should be corrected whether or not anything is built.**
2. **Provenance on `relationship_entries` precedes any use of it.** Reading a substrate whose member/system boundary is ambiguous into a prompt would propagate the ambiguity into MAIA's voice. This is a guardrail-6 blocker, not a nice-to-have.
3. **The forgetting question precedes the link question.** §13 test 3 is open: what happens to a two-party relational thread when one party deletes. Until answered, activating any link substrate creates a class of data with no deletion story.
4. **One specific relationship precedes the general primitive.** U1 before U3. `memory_links` is the *end* of this sequence.
5. **Any liveness claim must name which kind it is.** Per the standing rule established 2026-08-09: *"LIVE" means code + schema deployed and exercised; it does not mean in use by members.* Three of the substrates named in this audit are exercised by members today (`relationship_entries`, `episodic_memories`, `conversation_memory_uses`). The rest are schema-only.

---

## Appendix — Evidence Index

**Production counts** (exact `count(*)`, `maia_consciousness` @ minisforum, 2026-08-09): `conversation_memory_uses` 72,168 · `conversation_turns` 39,555 · `agent_runs` 33,985 · `maia_turns` 1,713 · `relationship_entries` 1,157 · `episodic_memories` 115 (21 members) · `member_memory_atoms` 142 (10 members) · `member_relationships` 43 · `practitioner_clients` 13 · `member_spiral_state` 9 · `observations` 1 · **0 rows**: `memory_links`, `episode_links`, `episodes`, `pattern_connections`, `spiral_stage_transitions`, `interpretive_ledger`, `selflet_reinterpretations`, `hypothesis_contradictions`, `memory_contracts`, `provenance_tombstones`, `threshold_passages`, `threshold_events`, `member_patterns`, `pattern_ledger`, `pattern_evidence`, `somatic_memories`, `coherence_field_readings`, `morphic_pattern_memories`, `recognitions`, `story_revisions`, `member_reflections`, `bardic_links`, `member_daily_anchors`.

**Population checks**: `episodic_memories` — 0/115 with `related_episodes`, 0/115 with `connection_types`, 7/115 `marked_by_member`. `member_memory_atoms` — 0/142 with `thread_ids`, 12/142 with `provenance`, 0/142 `is_breakthrough`, 0/142 `surface_count > 0`, 130/142 `generated_by='unattributed-historical'`.

**Schemas**: `memory_links` → `database/migrations/20251231_memory_architecture_enhancements.sql` · `conversation_memory_uses` → same file · `pattern_connections`, `spiral_stage_transitions` → `20241202000001_create_session_memory_tables.sql` · `episode_links` → `20251230000003_episode_links.sql` · `interpretive_ledger` → `20260311000002_interpretive_ledger.sql` · `provenance_tombstones` → `20260718000001_s5_provenance_substrate.sql` · `memory_contracts` → `20260407000001_trust_layer_phase1.sql`.

**Code**: live loaders `app/api/sovereign/app/maia/list/route.ts:114-129, 809-919` · flatteners `lib/maia/memoryAtomsLoader.ts:361`, `lib/maia/episodicRecallBlock.ts:86,152`, `lib/maia/conversationalRecallBlock.ts:80,146` · retrieval trace writers `lib/sovereign/maiaService.ts:730, 3113-3121` → `lib/memory/stores/ConversationMemoryUsesStore.ts:63,132,206` (readers at `:243,274,318,356`, uncalled) · orphan store `lib/memory/stores/MemoryLinksStore.ts` (zero importers) · dead connection path `lib/consciousness/memory/EpisodicMemoryService.ts:167-190` ← `MemoryPalaceOrchestrator` ← `app/api/oracle/conversation/route.ts` (~zero traffic per `CLAUDE.md`) · epistemic refusal `lib/ain/portable/projectKeep.ts:225` + test `projectKeep.test.ts:210` · delete manifest `app/api/members/delete-account/route.ts` (42 tables; links at `:38,94,98,102`; retrieval trace at `:83`) + guard `lib/auth/__tests__/accountDeletionHonesty.test.ts`.

**Related prior records**: `docs/architecture/ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md` §II.B, §V (same defect one layer down) · `docs/architecture/MEMORY_SERVICE_STATUS_MATRIX_2026-05-24.md` · `docs/architecture/audits/AIN_MEMBER_CENTER_CORRIGIBILITY_STEWARDSHIP_AUDIT_2026-08-09.md` §K item 13.

**Stopped here. No implementation, no migration, no abstraction, no refactor.**
