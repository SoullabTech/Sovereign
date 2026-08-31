# MAIA Intelligence Field Census

**Program:** `MAIA-WHOLE-INTELLIGENCE-CONVERGENCE-01` — **Phases 1 (census) and 4 (turn-composition)**
**Charter:** `docs/programs/MAIA_WHOLE_INTELLIGENCE_CONVERGENCE_01_CHARTER.md`
**Companion:** `docs/architecture/MAIA_INTELLIGENCE_AUTHORITY_AND_EMBODIMENT_2026-08-31.md` (Phases 2, 3, 5, 6)
**Status:** READ ONLY · static census · **no repair authorized by this document**
**Created:** 2026-08-31
**Audited route:** `app/api/sovereign/app/maia/list/route.ts` (the live member turn)
**Audited cognition:** `lib/sovereign/maiaService.ts` → `getMaiaResponse()` (FAST / CORE / DEEP)
**Supersedes as route-of-record:** `docs/canon/INTELLIGENCE_FIELD_ACCESS_MAP.md` (audits `app/api/oracle/conversation/route.ts`, which CLAUDE.md records as receiving ~zero live traffic)

---

## 0. What this census is, and what it refuses to be

This is not a feature inventory. It answers one question:

> **For one real member turn, what intelligence is available, what is consulted, what reaches cognition, what is restrained, what fails, and what is merely nominally present?**

Three questions are kept **separate** throughout, because collapsing them is how the memory confusion was produced in the first place:

1. **Does the intelligence exist?** (schema / service on disk)
2. **Can the active runtime retrieve it?** (loader runs, backing store present)
3. **Does it actually influence *this* turn?** (reaches a prompt seam at the tier that ran)

`retrieved ✅ / consulted ❌` is a different condition from `available ✅ / restrained ✅`, and both are different from `broken`. The desired end state is **not** all lights green on every turn. It is:

> Everything that should be available is healthy; only what belongs in this human moment participates.

**Two disciplines held for the duration of this census:**

- **No store is created to satisfy a query.** A query against a nonexistent table does not prove the table is canonical architecture. It may prove the query is obsolete. Adjudication is deferred.
- **No repair is opened from this document.** Sequencing lives in §7.

---

## 1. Status legend

| Status | Meaning |
|---|---|
| **LIVE** | Data exists, is retrieved, and reaches cognition on at least one tier |
| **AVAILABLE** | Works, legitimately unused this turn |
| **RESTRAINED** | Deliberately held back by a gate that is working as designed |
| **CONSENT_GATED** | Member has not authorized surfacing |
| **NOT_ACTIVATED** | Intentionally future |
| **BROKEN** | Expected path fails |
| **ORPHANED** | Implementation exists, active turn never reaches it |
| **REDUNDANT** | Duplicates another intelligence path |
| **UNKNOWN** | Not yet bound — requires runtime evidence this census did not collect |

**Evidence discipline:** every row cites `file:line` or a migration count. Rows whose truth requires production runtime are marked **UNKNOWN (runtime)** with the exact probe in §6. This census did not run those probes; it does not claim their answers.

---

## 2. The census table

Tier columns mean *reaches a prompt seam on that tier*, not *loaded*.

| # | Intelligence | Store / source | Retrieval | Consent gate | FAST | CORE | DEEP | Ranking / authority | Status | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **Session / recent turns** | `TurnsStore` | ✅ per turn | session-scoped | ✅ | ✅ | ✅ | single | **LIVE** | `route.ts:401`, `MemoryBundle.ts:217,234` |
| 2 | **Conversational recall** (prior cross-session exchanges) | turns via `loadPriorCrossSessionExchanges` | ✅ | `conversational_recall_enabled` + Sanctuary | ✅ | ✅ | ⚠️ consultation lane only | formatter-side suppression | **LIVE** | `route.ts:979-1004`; `maiaVoice.ts:427`; DEEP `maiaService.ts:2329` |
| 3 | **Episodic recall** (member-marked moments) | `episodic_memories` (4 migrations) | ✅ | `episodic_recall_enabled` + Sanctuary | ✅ | ✅ | ⚠️ consultation lane only | member-marked only, no inference | **LIVE** | `route.ts:1007-1023`; `maiaVoice.ts:428` |
| 4 | **Memory atoms** (member-placed portfolio) | `memory_atoms` (15 migrations) | ✅ | per-atom `return_preference` | ✅ | ✅ | ⚠️ consultation lane only | `is_breakthrough DESC` | **LIVE** | `route.ts:961-968`; `maiaVoice.ts:429` |
| 5 | **Developmental memory** | `developmental_memories` (1 migration) | ✅ every turn | — | ✅ | ❌ | ❌ | `buildMemoryInfluencePlan` | **LIVE (FAST only)** | `route.ts:929-957`; **absent from `ADDENDA_SPECS`** `maiaVoice.ts:406-430` |
| 6 | **Relational context** (member-handed-off relationship) | `relationship_entries` (3 migrations) | ✅ | member handoff | ✅ | ✅ | ⚠️ consultation lane only | single | **LIVE** | `route.ts:879`; `maiaVoice.ts:430` |
| 7 | **Relationship anamnesis / essence** | essence store | ✅ read + write | — | ✅ | ✅ | ✅ | single | **LIVE** | `route.ts:1477-1503` |
| 8 | **MemoryBundle** (cross-session synthesis) | turns + local embeddings | ✅ 5s timeout | Sanctuary + `memoryMode` | ✅ | ⚠️ | ⚠️ | own ranker | **LIVE (FAST-primary)** | `route.ts:531-553`; `maiaService.ts:974-1002` |
| 9 | **Member live context** (summaries, themes, journals) | `MemberLiveContext` | ✅ | — | ✅ | ✅ | ❌ | single | **LIVE (FAST+CORE)** | `route.ts:732`; `maiaVoice.ts:424` |
| 10 | **Spiral / elemental orientation** | `member_spiral_state` | ✅ | — | ✅ | ✅ | ✅ | conductor hysteresis | **LIVE** | `maiaVoice.ts:413` |
| 11 | **Wu Xing / BaZi + astrology** | `pool.query` birth data | ✅ parallel leg | — | ✅ | ✅ | ✅ | single | **LIVE** | `route.ts:531,567,600,624` |
| 12 | **Practice Field context** | practice field service | ✅ | space-scoped | ✅ | ✅ | ❌ | single | **LIVE (FAST+CORE)** | `route.ts:782-791`; not in `ADDENDA_SPECS` |
| 13 | **Knowledge gate / AIN source wells** | `scoreKnowledgeGate` | ✅ | — | ✅ | ✅ | ✅ | scored | **LIVE** | `route.ts:147`; `maiaVoice.ts:423` |
| 14 | **Knowledge field (12-domain)** | detector | ✅ | — | ✅ | ❌ | ❌ | single | **LIVE (FAST only)** | `maiaService.ts:1218`; not in `ADDENDA_SPECS` |
| 15 | **Forward readiness** | `detectForwardReadiness` | ✅ | — | ✅ | ❌ | ❌ | single | **LIVE (FAST only)** | `route.ts:1053`; not in `ADDENDA_SPECS` |
| 16 | **Field wisdom (collective)** | field service | ✅ | — | ✅ | ✅ | ✅ | single | **LIVE** | `maiaVoice.ts:425` |
| 17 | **Corpus Callosum** (8-voice parallel emission) | `agent_runs` (7 mig) / `integration_passes` (2 mig) | ✅ default-on | — | ✅ | ✅ | ❓ | `WisdomRouter` selective (~49%) | **LIVE (substrate)** | `maiaOrchestrator.ts:590,640,685,736` |
| 18 | **MythicAtlas / archetypal** | **in-network Docker service** `http://mythic-atlas:8088` (probe-confirmed) | ⚠️ invoked, 422 witnessed | — | ❌ | ❌ | ❓ | advisory | **BROKEN (contract drift)** | `mythicAtlasService.ts:49,79,95`; probe fact 3 |
| 19 | **RCN / RLM** | **relative URL** `'/api/rlm'` | ❌ fails server-side | — | ❌ | ❌ | ❌ | advisory | **BROKEN (structural)** | `lib/rlm/client.ts:188,271,302` |
| 20 | **Semantic retrieval** | `semantic_memory_vectors` — **0 migrations** | **write-only**: `INSERT` exists, **no `SELECT` anywhere** | — | ❌ | ❌ | ❌ | — | **BROKEN / ORPHANED** | `maiaService.ts:3522-3524`; `grep "FROM semantic_memory_vectors"` → ∅ |
| 21 | **Pattern / resonance lattice** | `lattice_nodes` — **0 migrations** | reads + writes coded | — | ❌ | ❌ | ❌ | — | **BROKEN / UNKNOWN adjudication** | `ConsciousnessMemoryLattice.ts:500,583,716,747`; `maiaService.ts:3432` |
| 22 | **Relational signal observation** | `member_relational_signals` | write path, `.catch()` swallowed | observation-only by canon | n/a | n/a | n/a | — | **UNKNOWN (runtime)** — writes may be failing silently | `relationalObserver.ts:139-140,223` |
| 23 | **Memory transition records** | `memory_transition_records` | fire-and-forget INSERT | — | n/a | n/a | n/a | — | **LIVE** — 3992 rows (probe) | `memoryTransitionRecord.ts:185`; probe fact 6 |
| 24 | **Conversation memory uses** | `conversation_memory_uses` (4 mig) | records **retrieved candidates**, not uses | — | n/a | n/a | n/a | — | **LIVE but misnamed** | `ConversationMemoryUsesStore.ts:148,206` |
| 25 | **Somatic intelligence** | `SomaticMemoryService` | ❌ never called on turn | — | ❌ | ❌ | ❌ | — | **ORPHANED** | 0 refs in route + service |
| 26 | **Coherence / field layer** | `CoherenceFieldService` | ❌ never called on turn | — | ❌ | ❌ | ❌ | — | **RESTRAINED (frozen plan)** | 0 refs; `COHERENCE_FIELD_WIRE_UP_SPEC §0.C` |
| 27 | **Morphic pattern** | `MorphicPatternService` | ❌ | consent + aggregation gate unmet | ❌ | ❌ | ❌ | — | **NOT_ACTIVATED** | 0 refs |
| 28 | **Quantum field memory** | `QuantumFieldMemory` (810 LOC, 0 persistence) | ❌ | — | ❌ | ❌ | ❌ | — | **ORPHANED** | 0 refs |
| 29 | **Corpus / manuscript / teachings** | manuscripts routes | ❌ not on member turn | — | ❌ | ❌ | ❌ | — | **ORPHANED (from turn)** | 0 refs in route + service |
| 30 | **Model routing + fallback** | `modelService.generateText` | Anthropic primary (default), Ollama `qwen2.5:7b` fallback | — | ✅ | ✅ | ✅ | `MAIA_TEXT_PROVIDER` unset → default | **LIVE** (probe-confirmed) | probe fact 3; `modelService.ts:49-58` |
| 31 | **Memory health telemetry** | `buildMemoryHealth` | ✅ every turn | — | n/a | n/a | n/a | see §4 | **BROKEN (truthfulness)** | `memoryHealth.ts:122-130,141-146` |
| 32 | **Ranking authority** | ≥12 independent implementations | — | — | — | — | — | **no single authority** | **REDUNDANT** | see §5 |

### 2b. Supplementary census dimensions

The Phase 1 mandate asks four questions the main table does not carry. Answered here for every intelligence that participates in a turn.

| Intelligence | Writer | Conductor sees it? | Can independently alter output? | Fails honestly? |
|---|---|---|---|---|
| Session / recent turns | `TurnsStore` | n/a — always present | no | ✅ |
| Conversational recall | turn writer | ❌ no Conductor exists | no — advisory string | ⚠️ logs, but `'empty'` == absent store |
| Episodic recall | member mark gesture | ❌ | no | ⚠️ same |
| Memory atoms | member place gesture | ❌ | no | ⚠️ same |
| Developmental memory | `MemoryWriteback` | ❌ | no | ❌ silently absent on CORE/DEEP |
| Relational context | member handoff | ❌ | no | ⚠️ |
| Relationship anamnesis | `saveRelationshipEssence` | ❌ | no | ✅ |
| MemoryBundle | derived | ❌ | no | ✅ 5s timeout, logged |
| Spiral / elemental | conductor hysteresis + upsert | ⚠️ `lib/voice/conductor.ts` governs element only | no | ✅ |
| Wu Xing / astrology | birth data | ❌ | no | ✅ |
| Corpus Callosum (8 voices) | `logAgentRun` | ⚠️ `WisdomRouter` ≈49% selective | **no** — integration pass, not direct emission | ✅ rows are the evidence |
| MythicAtlas | external service | ❌ | no — advisory | ✅ throws on non-2xx |
| RCN / RLM | external service | ❌ | no — advisory | ❌ relative-URL failure is indistinguishable from "no result" |
| Semantic retrieval | `INSERT` at `maiaService.ts:3524` | ❌ | no | ❌ nothing reads it; failure is invisible by construction |
| Pattern / lattice | `ConsciousnessMemoryLattice` | ❌ | no | ❌ |
| Relational observation | `relationalObserver` | n/a — write-only | n/a | ❌ `.catch()` swallows |

**The column that matters most is the last one.** Six of sixteen intelligences **cannot fail honestly**. That is the same defect as F3, seen from the source side rather than the telemetry side — and it is why Wave A precedes everything.

**The column with the best news is the third.** *No intelligence source can independently alter MAIA's answer.* Every one arrives as an advisory string on a single prompt. Whatever else is wrong, MAIA does not have subsystems speaking over her.


---

## 3. The turn-composition map (Phase 4)

What actually composes a live member turn, in order:

```text
MEMBER TURN  →  app/api/sovereign/app/maia/list/route.ts
    │
    ├─ identity ............ resolveMemberIdentity            LIVE
    ├─ sanctuary posture ... TurnPosture / MemoryGate         LIVE  (hard gate)
    ├─ session ............. ensureSession / TurnsStore       LIVE
    │
    ├─ PARALLEL LEG (route.ts:531)
    │     ├─ MemoryBundle (5s timeout, non-blocking)          LIVE
    │     ├─ WuXing / BaZi                                    LIVE
    │     └─ astrology                                        LIVE
    │
    ├─ MEMORY ORCHESTRATOR BLOCK (route.ts:~920-1080)
    │     ├─ developmental ..... loaded → memoryInfluenceAddendum
    │     ├─ atoms ............. loaded → atomsAddendum
    │     ├─ conversational .... loaded → conversationalRecallAddendum
    │     ├─ episodic .......... loaded → episodicRecallAddendum
    │     ├─ relational ........ loaded → relationalContextAddendum
    │     └─ forward readiness . detected → forwardReadinessAddendum
    │
    ├─ memoryHealth (route.ts:1086) ......... 8 of 12 layers fed; 4 hardcoded empty
    ├─ buildMaiaRuntimeContext (route.ts:1127) .. observer, NOT orchestrator
    │
    ▼
getMaiaResponse()  →  tier split
    │
    ├─ FAST  (maiaService.ts:709)   ── 19 addenda injected inline ── RICHEST TIER
    ├─ CORE  (maiaService.ts:1512)  ── buildMaiaWisePrompt → appendAllContextAddenda (24 specs)
    └─ DEEP  (maiaService.ts:1947)
          ├─ primary: consciousnessOrchestrator  ── NO prompt seam by construction
          │     └─ consultation lane: 4 recall addenda only (maiaService.ts:2329)
          └─ repair:  buildMaiaComprehensivePrompt → appendAllContextAddenda
    │
    ▼
response shaping → scrubMemoryAmnesia → finalizeMemberFacingText
    │
    ▼
WRITE-BACK (post-response, fire-and-forget)
    ├─ MemoryWriteback ............ LIVE
    ├─ relationship essence ....... LIVE
    ├─ relational observation ..... swallowed .catch()  → UNKNOWN
    ├─ semantic_memory_vectors .... INSERT into table with no migration → BROKEN
    └─ lattice_nodes .............. INSERT into table with no migration → BROKEN
```

### 3b. Per-source state ledger for one witnessed turn

The Phase 4 discipline: distinguish **AVAILABLE → RETRIEVED → CONSULTED → USED**, with **RESTRAINED / REJECTED / FAILED** as terminal branches. This is what the current instrumentation can and cannot tell us.

| Source | AVAILABLE | RETRIEVED | CONSULTED | USED | Notes |
|---|---|---|---|---|---|
| Conversational recall | ✅ | ✅ logged | ✅ if block emitted | **UNKNOWN** | no signal distinguishes "in prompt" from "influenced answer" |
| Episodic recall | ✅ | ✅ logged | ✅ if block emitted | **UNKNOWN** | same |
| Atoms | ✅ | ✅ logged | ✅ if block emitted | **UNKNOWN** | same |
| Developmental | ✅ | ✅ logged | ✅ FAST / ❌ CORE+DEEP | **UNKNOWN** | consulted state is tier-dependent and unlogged as such |
| Relational context | ✅ | ✅ | ✅ | **UNKNOWN** | |
| Semantic | ❌ | **FAILED** (silent) | — | — | reports as `'empty'` |
| Pattern / lattice | ❌ | **FAILED** (silent) | — | — | reports as `'empty'` |
| MythicAtlas | ⚠️ env | **FAILED** (422) | — | — | fails honestly, but nothing aggregates it |
| RCN / RLM | ❌ | **FAILED** (structural) | — | — | |
| Corpus / manuscript | ❌ | — | — | — | never reaches the turn |
| Somatic / morphic / coherence | ✅ built | — | — | — | **RESTRAINED** by frozen plan — correct |

**Finding F5 — the `USED` column is empty for every source, and cannot currently be filled.** `ConversationMemoryUsesStore` is named for this question but records *retrieved candidates* (`ConversationMemoryUsesStore.ts:148`). `recordMemoryTransitions` reaches `offered`, which is prompt-injection, not use.

Nothing in the system observes whether an injected memory changed MAIA's answer. **Every claim about memory "working" currently rests on `offered`, one full step short of the claim being made.** This is not a wiring defect; it is a measurement that has never been built — and it is the honest reason the program's Phase 9 is *cross-medium witnessing* rather than another log line.


---

## 4. The structural findings

### F1 — There is no single tier-invariant cognition. There are three minds.

The Deep-Intelligence Gate requires spoken and typed turns to converge before cognition. They do. **But cognition itself then forks three ways, and the forks are not equivalent.**

`appendAllContextAddenda` (`maiaVoice.ts:406-430`) is the shared 24-spec injector that CORE and DEEP-repair use. **Five addenda are not in it** and are injected only inline on FAST:

| Addendum | FAST | CORE | DEEP |
|---|---|---|---|
| `memoryInfluenceAddendum` (**developmental memory**) | ✅ | ❌ | ❌ |
| `forwardReadinessAddendum` | ✅ | ❌ | ❌ |
| `knowledgeFieldAddendum` (12-domain) | ✅ | ❌ | ❌ |
| `practiceFieldAddendum` | ✅ | ✅ (separate) | ❌ |
| `memberWebAddendum` | ✅ | ✅ | ❌ |

**Consequence:** *the deeper the tier, the less memory MAIA has.* A member who asks for depth gets a MAIA who has lost her developmental memory. This inverts the intuition the architecture is named for.

**DEEP is the sharpest case.** DEEP-primary runs `consciousnessOrchestrator`, which the code itself documents as having *"no prompt seam by construction — it weaves templates, it does not read a system prompt."* Its only context channel is the consultation lane, which carries exactly 4 addenda (`maiaService.ts:2329-2332`). The 24-spec path is reached only on the *repair* branch.

### F2 — Two stores are queried that have no migration. Do not create them.

| Store | Code | Migrations | Direction |
|---|---|---|---|
| `semantic_memory_vectors` | 1 `INSERT` + 2 GDPR/migration refs | **0** | **write-only — there is no `SELECT` anywhere in the codebase** |
| `lattice_nodes` | reads *and* writes in `ConsciousnessMemoryLattice.ts` | **0** | bidirectional |

`semantic_memory_vectors` is the more revealing of the two: even if the table existed, **nothing would ever read it.** This is not a missing table. It is a write path to nowhere, and the strong prior is that the *writer* is obsolete, not that the table is owed.

`lattice_nodes` is genuinely undecided and is left **UNKNOWN**. Adjudication belongs to a ruling, not to a `CREATE TABLE`.

### F3 — Health telemetry cannot report the failures it exists to report.

`deriveStatus` (`memoryHealth.ts:122-130`) maps a loader that returned nothing to `'empty'`, and only an explicit `error` flag to `'error'`. `isBaseChainDegraded` fires only on **>1 `'error'`** across the base chain (`recentTurns`, `episodic`, `semantic`, `relational`, `developmental`).

A query against a **nonexistent table** is caught by the loader, returns 0 rows, and reports `'empty'` — *indistinguishable from a member who simply has no history.* Degradation never fires.

Compounding it, the route passes the **atoms row count** into the field named `semantic` (`route.ts:1093-1095`), with an in-code comment acknowledging *"no semantic retrieval exists on this path."* And four of the twelve layers — `pattern`, `somatic`, `field`, `meta` — are never passed at all, so they report `'empty'` permanently by construction.

**The telemetry is structurally incapable of saying "a dependency is down."** This is the highest-leverage finding in the census, because it is the instrument every other repair would be measured by.

### F4 — Two auxiliary intelligences fail for ordinary, unrelated reasons.

- **RLM/RCN** (`lib/rlm/client.ts:188`) defaults `baseUrl` to the **relative** `'/api/rlm'` and calls `fetch('/api/rlm/process')`. Relative URLs cannot be resolved by server-side `fetch` in Node. This fails 100% of the time in the container, deterministically — not a flake.
- **MythicAtlas** (`mythicAtlasService.ts:49`) targets `MYTHIC_ATLAS_URL` or falls back to `http://localhost:8000` — an **external Python service outside the Docker stack listed in CLAUDE.md**. The witnessed **422** is a schema mismatch, i.e. the service was *reached* and *rejected the request body* — a contract drift, distinct from an absent service.

Both are advisory inputs. Neither can independently alter MAIA's answer. That is the one piece of good news in §5.

---

## 5. Composition authority — is there one MAIA mind?

The census question behind the census: *is each system advisory input to a Conductor, or can it independently alter MAIA's answer?*

**Answer: composition authority is single at the prompt seam, and plural at the ranking layer.**

- **Single authority — prompt assembly.** Every intelligence in the table reaches cognition as an *addendum string appended to one prompt*, assembled by one function per tier. No subsystem writes the member-facing response directly. Corpus Callosum's 8 voices emit in parallel but pass through `WisdomRouter` selective integration (~49%), and MythicAtlas/RLM are advisory. **There is one mouth.**
- **Plural authority — ranking.** At least **12** independent implementations of relevance/significance/ranking exist (`MemoryBundle`, `DevelopmentalMemory`, `MemoryIntegration`, `MemoryWriteback`, `MemoryCompressor`, `MemoryManager`, `mem0`, `SignificantMomentsService`, `RelationshipMemoryService`, `confidenceDecay`, `PatternMemoryStore`, `PreferenceConfirmationStore`). Each decides *what matters* by its own rule, and nothing reconciles them. **There is one mouth and twelve appetites.**

So the failure mode is not subsystems leaking into the response. It is **incoherent salience**: what surfaces is decided by whichever loader ran, under whichever local rule, with no arbiter — and the tier split (F1) then silently drops a different subset per tier.

---

## 6. Runtime gaps — **CLOSED 2026-08-31**

Probes run from Kelly's Mac Studio against minisforum. Full results and the P1 adjudication: `docs/programs/WIC01_RUNTIME_PROBE_RESULTS.md`.

**Custody confirmed:** production `GIT_COMMIT=fc66b477a` matches the census SHA `fc66b47`. **This census describes code members are actually running.** No finding is invalidated.

**The result that changes priorities:** 7-day tier distribution is `CORE 1935 (72.9%) · FAST 721 (27.1%) · DEEP 0`. Developmental memory, forward-readiness, knowledge-field and youth-support are `absent_unratified` on CORE — so **finding D7 costs roughly three of every four production turns and escalates to P0**, while D8 (DEEP) de-escalates to P2 on zero measured DEEP traffic.

Nine of ten facts settled. Fact 9 (`memoryHealth` log markers) stays **UNKNOWN** — zero markers in the probe hour is most simply explained by no traffic after the 17:11 deploy, but the probe cannot distinguish that from broken logging. Follow-up named in the results doc.

The original probe table is retained below for reference.

| Gap | Probe |
|---|---|
| Are relational observation writes actually failing? | `docker exec maia-postgres psql -U soullab maia_consciousness -c "SELECT count(*), max(created_at) FROM member_relational_signals;"` |
| Do `memory_transition_records` rows exist? | same, table `memory_transition_records` |
| Do `semantic_memory_vectors` / `lattice_nodes` exist in the deployed DB despite 0 migrations? | `\dt semantic_memory_vectors` · `\dt lattice_nodes` |
| Is a model fallback configured in production? | `docker exec maia-sovereign printenv MAIA_TEXT_PROVIDER OLLAMA_BASE_URL MYTHIC_ATLAS_URL` |
| Tier distribution of real turns (how often is DEEP actually taken?) | `SELECT processing_profile, count(*) FROM agent_runs WHERE created_at > NOW() - INTERVAL '7 days' GROUP BY 1;` |
| Does DEEP emit Corpus Callosum rows at all? | same query, inspect for `DEEP` |
| Per-turn addenda actually injected | `docker logs maia-sovereign --since 1h 2>&1 \| grep -E "conversational-block\|episodic-block\|atoms loaded\|memoryHealth\|deep-consultation"` |

**Until these run, every row marked UNKNOWN stays UNKNOWN.** A census that guesses is worse than one with holes in it.

---

## 7. Sequencing — superseded by the program

The original standalone sequencing in this section has been **superseded** by the integration waves of `MAIA-WHOLE-INTELLIGENCE-CONVERGENCE-01`. Repairs are packetized only after Phase 7 architecture ratification.

```text
WAVE A — TRUTH                D1 D2 D14 D16 D21
   health telemetry · retrieved ≠ consulted ≠ used · schema/runtime truth
WAVE B — CANONICAL COGNITION  D3 D4 D5 D6 D7 D8 D13
   FAST/CORE/DEEP convergence · shared intelligence contract · one Conductor seam
WAVE C — PERSONAL CONTINUITY  D10 D11 D12
   episodic · semantic · developmental · member significance · ranking authority
WAVE D — RELATIONAL           D16 provenance · encounters · collective eligibility
WAVE E — SYMBOLIC / PATTERN   D9 D15 D17
WAVE F — EMBODIMENT           surface convergence per §5 matrix
WAVE G — RESTRAINT            prove availability ≠ obligation to speak
```

**Wave A is non-negotiably first.** A repair verified by a broken instrument is not verified — and D1 means the instrument currently cannot report a failed dependency at all.

**Wave G is not cleanup.** Without it, "fully integrated" becomes MAIA spraying every capability into every response, and the program will have destroyed the thing it was run to protect.

**§6 runtime probes gate Wave A.** They have not been run.

---

## 8. Census verdict

MAIA has **one mouth and twelve appetites**, her memory thins as her thinking deepens, and there is more than one of her.

The intelligences that are LIVE are genuinely live — atoms, conversational recall, episodic marks, developmental memory, relational context, spiral state, Wu Xing, astrology, Corpus Callosum emission — and they are consent-gated as canon requires. That is real, and it is more than earlier framings credited. **Sanctuary and member-declared-significance are structurally correct**, which is the part of the architecture it would have been most costly to get wrong.

Five things are true at once. The census exists so they can be held together without collapsing into either inflation or despair:

1. **The tier split is an undisclosed capability gradient.** Nothing in code or canon says "DEEP has less memory than FAST." It is emergent from `ADDENDA_SPECS` membership, and no test pins it.
2. **The health layer cannot see its own failures.** `'empty'` and `'the table does not exist'` are the same value. Six of sixteen intelligences cannot fail honestly.
3. **Two write paths write to tables that were never migrated**, and one of them is never read by anything.
4. **`USED` has never been measured.** Every claim that memory is "working" rests on `offered` — one step short of the claim.
5. **There is more than one MAIA mind.** `/api/between/chat` (2,665 lines) and `/api/voice/stream-conversation` (1,639 lines) are full parallel cognition implementations, and the primary interface component defaults to the first of them.

None of these are ontological problems. All five are ordinary wiring, instrumentation, and accretion defects — **which is itself the finding.**

> The gap between MAIA's described mind and her operating mind is made of plumbing, not metaphysics.

That is good news of a specific and unglamorous kind. It means convergence is achievable by engineering rather than by discovery. It also means the work is larger than a memory cleanup: what has been built is a large amount of genuine intelligence that has never been composed under a single authority, because **the authority itself — the Conductor — was never built** (`AUTHORITY_AND_EMBODIMENT §3`, finding A3).

**Phrasing discipline applied throughout** (per CLAUDE.md inverse-drift rule): this document names mechanisms, not mythology. Nothing here authorizes a claim about coherence, field state, or resonance. Equally, nothing here permits the opposite error — the LIVE rows are Cat 6 and are named as such.

**This census does not authorize a single repair.** It establishes reality so that Phase 7 can decide what should exist.
