# Elemental / Corpus Callosum substrate — whole-organism map page

**Phase:** 1 (JARVIS-HUMAN-EXPERIENCE-MASTER-RUN-v1 §5) · **Date:** 2026-09-06 · **Method:** read-only
census of code, prompts, copy, migrations and dated records. **Stop rule:** a defect found here
creates no permission to repair it. Nothing in this page changes MAIA.

**Evidence classes:** A = replicated external research · B = single/vendor/conceptual · C = human
witness under study ethics · D = interpretive doctrine · E = runtime fact (code path, migration,
production record). **Observation status:** WALKED (runtime witnessed, dated) · READ (code/prompt/
copy read at a named path) · UNKNOWN (with the reason). **Category:** Cat 1–6 (six-category typology).

**Tree read:** `cf6d9ebf`. Line numbers are for this tree. Sibling page: `01_canonical_turn.md`
(the collapse points are catalogued there; this page follows the *elemental* readings specifically).

## 0 · What this subsystem is (E, READ) — paths, entry points, what is live vs designed vs dormant

| Part | Path | Status | Cat |
|---|---|---|---|
| Trace writer | `lib/services/corpusCallosumService.ts` — `logAgentRun` `:111`, `logIntegrationPass` `:172`, `logCorpusCallosumTrace` `:317–524`; Sanctuary refused at the service (`contentWritable` `:115`, `:175`, SANC-20260614-01) | live | 6 |
| Tables | `agent_runs` (baseline `database/baseline/0001_baseline_2026-09-01.sql:4747`; columns `database/migrations/20260122000002_fix_agent_runs_schema.sql`; `origin_route`/`processing_profile` `20260112000010_…sql`); `integration_passes` (baseline `:10547`). `bounded_agent_runs` (`20260405100001_agent_runs.sql`) is an **unrelated** content-pipeline table — name collision only | live | 6 |
| Producer of the elemental readings | `lib/bridges/elemental-oracle-bridge.ts` — `ElementalOracleBridge.processAll` `:205`; **every live caller passes `fastMode: true`** (`maiaService.ts:853`, `:1656`, `:2208`) → `processAllFast` `:328`: keyword regex per element (`:335` fire …), `dominant` = max match count `:383–385`, each "voice" is the template `[Fast] Fire resonance detected (N signals)` `:396`, `symbols` = first 3 matched member words `:399`, one "harmonic" = the first two co-occurring elements at constant `resonance: 0.7` `:422`, `integrationMethod: 'fast_pattern_match'` `:452`. The LLM path (`processElement` `:463`, `synthesizeElements` `:606`) is present and **never called by the serving lane** | live (regex); LLM path dormant | 6 / 4 |
| Wire into the turn | FAST `maiaService.ts:842–863`; CORE `:1616–1665` (in `Promise.all` with memory loads); DEEP `:2196–2221` (timeout). Result stored `(meta as any).elementalResult` "for corpus callosum logging" `:863`, `:1680`, `:2221` | live | 6 |
| Trace emission | `maiaService.ts:3822–3892`, **after** `text` exists; gate `CORPUS_CALLOSUM_ENABLED !== '0'` `:3824`. Rows written: `MythicAtlas` (`source: 'atlas-stub'` `corpusCallosumService.ts:338`), `MaiaVoice` (**member-facing response text, first 500 chars** `:376`), `WisdomRouter` `:395`, one row per elemental agent `:427–449`, one `integration_passes` row `:462–516` | live | 6 |
| Voice-distinction scorer | `lib/spiralogic/VoiceDistinctionScorer.ts:30` (lexical keyword signatures `:35–60`; thresholds `:31–33`); called `maiaService.ts:3875–3897`, logged as `(uncalibrated) … scope=lexical-only(not-generativity)` | live, log-only | 6 |
| Mythic Atlas | `lib/services/mythicAtlasService.ts:66` → HTTP `MYTHIC_ATLAS_URL \|\| 'http://localhost:8000/api/mythic-atlas'` `:49`; result feeds memory recall facet `maiaService.ts:2973–2977` and memory integration `:3566–3570` | live call; backend reachability UNKNOWN | 6 / ? |
| WisdomRouter | `lib/consciousness/WisdomRouter.ts:313` `routeWisdom` → one pattern → one agent-voice `promptInjection`; **enters the prompt** on all three tiers (`maiaService.ts:1262–1268` + slot `:1464`; `:1879–1884`; `:2106–2112`) | live, response-affecting | 6 |
| `between/chat` lane | `lib/consciousness/maiaOrchestrator.ts` logs `gebser-analysis` `:627`, `elemental-field` `:677`, `elemental-field-summary` `:722`, `conversational-elemental` `:773`; integration `'narrative_synthesis'` `:804–828` | code live; record says **zero BETWEEN rows** (`docs/specs/FIELD_TRANSITION_RECORD_PROPOSAL_2026-08-04.md:239–243`; `docs/programme/MAIA_JARVIS_MEMORY_ORGANISM_FULL_OPERATIONALIZATION.md:293`) | 6 (unobserved) |
| Dormant elemental agent families | `lib/elemental-agents/{fire,water,earth,air,aether}-agent.ts` (LIDA/SOAR/ACT-R/MicroPsi; importers only `VoiceCognitiveArchitecture`, `cognitiveVoiceAnalysis`, `sacred-oracle-constellation` — none in the `getMaiaResponse` lane); `lib/agents/elemental/*Agent.ts` (`ArchetypeAgent`) via `PersonalOracleAgent` → `app/api/maia/chat/route.ts` (no client reference found); `lib/maia/complete-agent-field-system.ts` "Telesphorus" 13 agents incl. `ShadowAgent` `:298` — `@ts-nocheck` prototype `:1`; its importer `lib/services/MaiaOrchestrator.ts` has no importers | dormant | 4 |
| `lib/consciousness/**` | 350 `.ts` files; `ElementalProcessors/index.ts` has no importers | mostly dormant; only `processingProfiles`, `WisdomRouter`, `conversation-elemental-tracker`, `cognitiveProfileService`, `MAIA_RUNTIME_PROMPT`, `maiaOrchestrator` touched by the turn | 4 (bulk) |
| `lib/maia/spiralogicReference.ts` | 8-line prompt constant; imported only by `lib/soulPortrait/schema.ts` — **not in the turn** | dormant for this subsystem | 4 |

**WALKED (dated):** `agent_runs` / `integration_passes` rows exist in production — 44 + 5 rows
deleted in the 2026-06-14 Sanctuary cleanup (`docs/incidents/INCIDENT_2026-06-14_SANCTUARY_PERSISTENCE.md:150–158`);
Cat 6 record 2026-05-24/25 (CLAUDE.md: 8 voices same-second, "2,382 lifetime turns per elemental
voice", WisdomRouter ~49 %). DEEP rows zero, BETWEEN rows zero, member-facing effect unmeasured
(CLAUDE.md Cat 6 entry). No row counts read this pass (no DB access).

## 1 · The founder's question for this subsystem

> *Is parallel knowing occurring before interpretation, after it, or merely being logged?*

**Answer (E, READ): merely logged — and what is logged is keyword counting, not knowing.**
One turn, in order:

```text
input → router (one profile)                                   maiaService.ts:3083
     → tier function
        → ElementalOracleBridge.processAll({fastMode:true})     :842 / :1650 / :2198   ← regex, ~50 ms, no model
          result → (meta as any).elementalResult                 :863 / :1680 / :2221   ← "for corpus callosum logging"
        → prompt built                                          :1464 / maiaVoice.ts:549 / :965
          · the five readings are NOT in the prompt on any tier
          · CORE only: the collapsed `dominant` scalar enters buildFieldContext({ element })  :1914
            and a SECOND, independent element inference (conversationElementalTracker :1730)
            enters as "Current elemental resonance: X"            maiaVoice.ts:739
        → model call → text
     → logCorpusCallosumTrace(...)                              :3822–3892   ← AFTER cognition
        → agent_runs (one row per element) + integration_passes
```

Concretely:

1. **Before interpretation?** The scoring runs before the model call, but it is not a reading: each
   "agent" is a regex over the member's words producing a fixed sentence and a count
   (`elemental-oracle-bridge.ts:335–399`). No hypothesis about the member's cognitive, affective,
   somatic, volitional or relational state is formed (v0.2 §2.11's stated purpose); only lexical
   presence is tallied. The LLM-backed elemental path exists (`:463`, `:606`) and is never reached.
2. **Feeds the response?** Not the readings. On FAST and DEEP nothing elemental from the bridge
   reaches the prompt. On CORE, one scalar (`dominant`) enters the field-context input
   (`:1914`); whether `formatFieldAddendum` prints it depends on the field orchestrator
   (`lib/field/fieldOrchestrator.ts:47,123,205,217` carry element fields — READ, output string not
   traced). The other elemental fact in the CORE prompt comes from a different tracker
   (`conversation-elemental-tracker.ts:289`). The two are never reconciled; their disagreement is
   not represented anywhere.
3. **The one "agent" that does feed the response** is `WisdomRouter` — a single pattern → single
   voice injection (`WisdomRouter.ts:313–360`). It is selective, not parallel; it is an
   undisclosed voice substitution, not a preserved disagreement.
4. **What the audit trail asserts vs. what happened.** `integration_passes` rows carry
   `tensionsNamed` derived from element *presence* (`corpusCallosumService.ts:477–483`),
   `paradoxesHeld: ['elemental_oppositions_held']` as a constant whenever any tension is named
   (`:496`), `confidence: 0.85` constant (`:500`), and a comment calling this "the REAL parallel
   processing!" (`:427`). The `MythicAtlas` row's `source` is literally `'atlas-stub'` (`:338`).
   The rows are real; the knowing they name is not performed by any mechanism in the trace.
5. **Relative to H1/H2** (`ELEMENTAL_PARALLEL_PROCESSING_HYPOTHESIS_2026-09-06.md:15–37, 157–168`):
   the live substrate tests neither. Prior Jarvis reading agrees — *"parallelism after cognition
   … not evidence for [the hypothesis]"* (`:202–214`; `…ARCHITECTURE_HYPOTHESIS…:155–170`).
   This page adds: it is not even parallelism *after* cognition in any epistemic sense; it is
   parallel *logging* of one regex pass.

**Position of the substrate against the founder's CURRENT → NEXT diagram (master run §5):** the
system is at CURRENT (*human expression → language-model interpretation → response*), with an
elemental audit trail bolted on after the response. Nothing at the NEXT shape (*Fire · Water ·
Earth · Air observations in parallel → Field → preserve disagreement → discernment → cognition*)
exists in the serving lane; the FIS primitive (Cat 2) has no runtime authority; the Deep-Intelligence
Gate and CMT-01 are the constraints any such thing would have to enter through.

## 2 · The nine questions

1. **Human phenomenon.** v0.2 §1.1 — felt understanding can be produced by an inaccurate model; §2.11 — the Elements as a machine-facing parallel representation to avoid *"reducing a living, dynamically contradictory human being to the part … easiest for language models to understand"*. Hierarchy: **Self** (representation of the person's state); Relationship only insofar as the reading shapes MAIA's attunement. (D, READ)
2. **Principles.** Nominally serves P11 and §2.11. Operationally: supports **claim-discipline** in one place (scorer self-labels `uncalibrated · lexical-only` `maiaService.ts:3891`) and violates it in others (`'atlas-stub'`, `paradoxesHeld` constant, "REAL parallel processing" — §2.12 laundering of product maturity into epistemic claim). P11: not supported (dominant-by-max is synthesis before differentiation). AP17: not triggered (rows never read back into a turn). (E, READ)
3. **Self / World capacity.** No member-facing surface; neither capacity is touched by this substrate today. Dashboards proposed (`docs/specs/ADMIN_DIAGNOSTIC_SURFACE_2026-05-27.md:98,358`) are operator-facing. (E, READ)
4. **Influence (P4′ 1–9).** The substrate itself exerts none on the member (log-only). The two leaks that do: WisdomRouter voice injection — c1 intent transparency **absent** (selection undisclosed); CORE dominant-element scalar — c4 inspectability **absent** to the member. 3 no relational feedback optimization: **met** (no feedback loop from rows to prompt). 5–9: n/a / unknown. (E, READ)
5. **What it remembers.** Per turn: `agent_runs.output_text` = MAIA's response text ≤500 chars (`corpusCallosumService.ts:376`); per-element rows with `meta.symbols` = **up to 3 matched member words** (`elemental-oracle-bridge.ts:399` → `:441–446`), `intensity`, `archetype` label; `input_summary` "never raw user text" by comment (`:55`); `integration_passes.final_text` ≤200 chars (`:490`); `origin_route`, `processing_profile`, `user_id`, `session_id`. Sanctuary: refused at the service (`:115`, `:175`) — WALKED via the 2026-06-14 cleanup that motivated it. No consumer reads these rows back into any turn (grep: `corpusCallosumService` importers = writers only). (E, READ)
6. **Authority of that information.** `confidence` = `intensity` = `min(1, matches/5)` (`elemental-oracle-bridge.ts:389`, `corpusCallosumService.ts:438`) — a keyword density presented as confidence; integration `confidence` constant `0.85/0.7` (`:500`). Authority × Time: state-at-turn, `created_at` only; authority over the member = zero (never surfaced); authority over *claims about MAIA* = high (it is the evidence base for "8 voices firing"). Verbatim beneath derived: the rows are derived with the verbatim (member words) partially inside them as `symbols`. (E, READ)
7. **Useful difference vs validation drift.** No member-facing output → neither. The scorer measures lexical *difference between voices*, not difference offered to the member. UNKNOWN for WisdomRouter injections (no transcript instrument). (E, READ)
8. **Elementally differentiated or reductive (H1 descriptive).** Nominally elemental, operationally reductive: five regex counters collapsed to one `dominant` by max before any use; "differentiation" measured only lexically (`VoiceDistinctionScorer.ts:35–60`). (E, READ)
9. **Human evidence.** None (class C). CLAUDE.md Cat 6 entry: "member-facing experiential effect unmeasured".

## 3 · R11 design audit (each: FOUND / NOT FOUND / UNKNOWN, with path)

| Item | Status | Path / reason |
|---|---|---|
| agreement drift | NOT FOUND (in substrate) | log-only; no member-facing output |
| validation loops | NOT FOUND | no row is read back into a turn |
| memory-amplified sycophancy | NOT FOUND | rows are not memory for the turn |
| hidden shaping objectives | **FOUND** (adjacent) | WisdomRouter single-voice `promptInjection` selected on a detected pattern, undisclosed (`WisdomRouter.ts:313–360`; `maiaService.ts:1262–1268`) |
| approval optimization | NOT FOUND | no reward signal; `coherenceScore`/`confidence` are constants or densities, not feedback (`corpusCallosumService.ts:497–500`) |
| emotional capture | NOT FOUND | — |
| excessive reassurance | NOT FOUND | — |
| historical pattern becoming identity | NOT FOUND (substrate) / FOUND (sibling) | rows are per-turn and unconsumed; the session-level `conversationElementalTracker` dominant element does reach the CORE prompt (`maiaService.ts:1738–1741`) — recorded on page 01 |
| "you said before" becoming leverage | NOT FOUND | — |
| MAIA becoming more central | UNKNOWN | the substrate's function is to certify MAIA's inner plurality to operators; whether that certification later shapes member-facing claims is a claim-discipline question (§5) |

## 4 · Embodies v0.2 (what already does the right thing, with path)

- **Routing invariant — context vs cause**: `origin_route`/`processing_profile` "flow inward as explicit parameters … NEVER inferred from ambient state"; correlation IDs are "WITNESSES, not DRIVERS" (`corpusCallosumService.ts:16–29`) — provenance discipline, P13.
- **Observability with no feedback into behavior**: trace runs after the response, in an isolated try, "cannot affect the trace path" (`maiaService.ts:3868–3874`, `:3898`) — P4′ c3.
- **Sanctuary refused at the service, not the caller** (`:111–117`, `:172–178`; SANC-20260614-01) — consent vow, structural not policy.
- **Claim discipline in the scorer log line**: `(uncalibrated) … scope=lexical-only(not-generativity)` (`maiaService.ts:3891`) and the scorer's own caveat "NOT a generativity/affordance proof" (`:3878`).
- **Differentiation-before-merger stated as intent** (`VoiceDistinctionScorer.ts:6–10`) — matches §2.11; aspiration, not mechanism.
- **Prior Jarvis reading already refuses to count the substrate as evidence for H1/H2** (`ELEMENTAL_PARALLEL_PROCESSING_HYPOTHESIS_2026-09-06.md:202–214`).

## 5 · Contradicts v0.2 (what does the wrong thing, with path and the principle/AP violated)

| Finding | Path | Violates |
|---|---|---|
| Regex keyword counts labelled "parallel knowing" / "the REAL parallel processing" | `corpusCallosumService.ts:5`, `:427` | §2.12 (kinds of truth kept apart), claim discipline, "Soullab does not present the Elements as validated" |
| `paradoxesHeld: ['elemental_oppositions_held']` constant; `tensionsNamed` from mere co-presence; `confidence: 0.85` constant | `:477–483`, `:496`, `:500` | P11 falsely reported as performed; §2.12 |
| `MythicAtlas` rows with `source: 'atlas-stub'` under a real agent name | `:338` | claim discipline (inverse-drift: a stub counted as a voice) |
| Atlas absent → facet defaulted to `EARTH-1` for memory integration | `maiaService.ts:3566–3570` | Interface Humility ("do not synthesize over the gap"); R12 derived-retains-evidence; P8 |
| Synthesis-by-max (`dominant`) is the *only* elemental fact that can reach cognition | `elemental-oracle-bridge.ts:383–385`; `maiaService.ts:1914` | §2.11 "differentiation before synthesis" inverted; P11 |
| Two independent element inferences per CORE turn, unreconciled | `maiaService.ts:1650–1658` vs `:1730` | P11 (disagreement exists and is discarded) |
| Member words stored as `symbols` in an "audit" table without a consent basis named | `elemental-oracle-bridge.ts:399` → `corpusCallosumService.ts:444` | consent-for-memory vow (Sanctuary is honoured; ordinary-mode basis is not named in the registry — `producerRegistry.ts` has no `agent_runs` consumer or producer) |
| WisdomRouter voice substitution undisclosed | `WisdomRouter.ts:313–360` | P4′ c1, P12 clause 5 |
| Dormant agent families carry elemental "cognitive architecture" claims (LIDA/SOAR/ACT-R/MicroPsi; 13-agent field) with no liveness | `lib/elemental-agents/fire-agent.ts:1–68`; `lib/maia/complete-agent-field-system.ts:1–60` | inflation drift if ever cited; recorded as Cat 4 |

## 6 · Unknown (what cannot be known from reading; what instrument would answer it)

| Unknown | Instrument |
|---|---|
| Whether `MYTHIC_ATLAS_URL` is reachable in production; hence whether the `EARTH-1` default is the common path | read-only `agent_runs` census: `agent_name='MythicAtlas'` × `status`, latency, `output_json.primary='UNKNOWN::UNKNOWN'` |
| Current production row volumes by `origin_route × processing_profile × agent_name` since 2026-05 | the CLAUDE.md ops diagnostic SQL (read-only) — not run this pass |
| Whether `formatFieldAddendum` prints the dominant element into the CORE prompt | trace `lib/field/fieldOrchestrator.ts` output string (not read end-to-end) |
| Whether `between/chat` layers (gebser, elemental-field) feed the response or only rows | `maiaOrchestrator.ts` end-to-end read (not done) + the zero-rows finding |
| H1 (descriptive validity of elemental readings) | E5 — offline inter-rater on consented transcripts; nothing in the substrate answers it |
| H2 (relational validity) | E6 — registered shadow producer, zero response diff, then blind raters |
| Whether WisdomRouter injections change felt understanding or add unrequested framing | transcript instrument under consent (E4/E9 style) |

## 7 · Smallest evidence-producing intervention per gap

| Gap | Principle/AP | Human impact (1–5) | Architectural leverage (1–5) | Risk (1–5, never 0; higher = riskier) | Evidence state (observed / inferred / unknown) | Confidence (high / medium / low) | Smallest intervention | Experiment it feeds (E1–E10 or new) |
|---|---|---|---|---|---|---|---|---|
| G1 Parallel elemental readings exist only as post-cognition keyword logs; nothing at the NEXT shape exists | H1, H2, P11, §2.11 | 3 (today: no member-facing effect; would be 5 if H2 holds) | 5 | 1 | observed (code `:842–863`, `:3822–3892`; rows WALKED 2026-06-14) | high | E5 first (offline, consented transcripts, inter-rater vs a unitary intent model). Then E6 in its smallest form: one registered producer `inferred.elemental_shadow` (CMT-01 registry, `authority: 'infer'`) emitted in the manifest as counts/digests under `[MAIA/elemental-shadow]`, `cognitionPath: 'shadow'`, zero response diff — the marker does not yet exist in code (grep) | E5 → E6 |
| G2 Audit rows assert paradox-holding, tension and confidence that no mechanism performs | §2.12, claim discipline | 2 | 2 | 1 | observed (code `:477–500`); row values inferred from code, not read | high | Read-only SQL census of `integration_passes.paradoxes_held` / `tensions_named` / `confidence` distinct values to show they are constants (no writes; `scripts/witness/` style) | new (claim-ledger input) · E6 design |
| G3 Atlas stub + `EARTH-1` default facet written into memory integration | P8, R12, Interface Humility | 3 | 3 | 1 | observed (code `:3566–3570`, `:338`); Atlas reachability unknown | high (code) / unknown (rate) | Read-only count of memory integrations that used the default facet vs an Atlas facet (log/DB) | E7 · E9 |
| G4 `dominant` scalar and a second tracker's element both reach the CORE prompt, unreconciled | P11, AP17 | 3 | 3 | 1 | observed (`:1914`, `:1730–1741`); field-addendum rendering inferred | medium | Shadow digest per CORE turn: (score vector, dominant, tracker element, agreement flag); zero prompt change | E6 |
| G5 WisdomRouter single-voice injection undisclosed | P4′ c1, P12 | 3 | 2 | 1 | observed (code); ~49 % activation WALKED 2026-05-24 (CLAUDE.md) | high | Read-only activation-rate census by pattern (`agent_runs.agent_name='WisdomRouter'`) + copy audit of `agentIntroduction` strings | E4 · E3 |
| G6 Member words stored as `symbols` in an audit table without a named consent basis | consent-for-memory vow | 2 | 2 | 2 | observed (code `:399` → `:444`); stored rate unknown | high (code) / unknown (rate) | Read-only census of `agent_runs.meta->'symbols'` non-empty rate; registry question for Phase 4 (does an audit table need a producer/consumer entry?) | Phase 4 consent design |
| G7 Voice-distinction "firewall" is lexical and uncalibrated but named as integrity | H1 | 1 | 2 | 1 | observed (`VoiceDistinctionScorer.ts:30–60`; self-labelled) | high | Fold into E5: compare scorer separation with human inter-rater on the same transcripts | E5 |
| G8 Dormant elemental agent families (Cat 4) risk inflation if cited | claim discipline | 1 | 1 | 1 | observed (importer greps) | medium (liveness by import graph only) | None — record in the ranked map as Cat 4; no lane | — |

## 8 · Provenance — files read, records cited, commit

**Commit:** `cf6d9ebf`. **Files read (READ):** `lib/services/corpusCallosumService.ts` (:1–125, :172–178, :228–524); `lib/bridges/elemental-oracle-bridge.ts` (:1–95, :328–460, method map); `lib/sovereign/maiaService.ts` (:832–870, :1258–1272, :1616–1700, :1728–1745, :1900–1925, :2190–2240, :2530–2560, :2940–2985, :3020–3065, :3560–3575, :3790–3900); `lib/consciousness/WisdomRouter.ts` (:1–60, :300–360); `lib/consciousness/maiaOrchestrator.ts` (:585–640, :800–830; agent names by grep); `lib/spiralogic/VoiceDistinctionScorer.ts:1–60`; `lib/services/mythicAtlasService.ts` (grep); `lib/consciousness/conversation-elemental-tracker.ts:289`; `lib/field/fieldOrchestrator.ts` (grep); `lib/elemental-agents/fire-agent.ts:1–68`; `lib/maia/complete-agent-field-system.ts:1–60` + class list; `lib/maia/spiralogicReference.ts`; importer greps for `lib/elemental-agents`, `lib/agents/elemental`, `complete-agent-field-system`, `services/MaiaOrchestrator`, `ElementalProcessors`, `spiralogicReference`, `corpusCallosumService`; migrations `20260405100001_agent_runs.sql`, `20260112000010_add_origin_route_and_processing_profile.sql`, `20260122000002_fix_agent_runs_schema.sql`; baseline `0001_baseline_2026-09-01.sql` (table positions). **Records cited:** `docs/incidents/INCIDENT_2026-06-14_SANCTUARY_PERSISTENCE.md:150–158` (WALKED); CLAUDE.md Cat 6 Corpus Callosum entry (2026-05-24/25); `docs/specs/FIELD_TRANSITION_RECORD_PROPOSAL_2026-08-04.md:239–243`; `docs/programme/MAIA_JARVIS_MEMORY_ORGANISM_FULL_OPERATIONALIZATION.md:293`; `docs/research/human-experience/frameworks/elemental-experience/ELEMENTAL_PARALLEL_PROCESSING_HYPOTHESIS_2026-09-06.md` (§1, §8, §10); `…ELEMENTAL_PARALLEL_ARCHITECTURE_HYPOTHESIS_2026-09-06.md` (standing note); `docs/design/relational-field/inquiry/JRF-08-CORPUS-CALLOSUM-SYNTHESIS.md` (header only; PROPOSED — NOT RATIFIED); `MAIA_CANONICAL_TURN_CURRENT_STATE_CENSUS.md` §7 row "Corpus Callosum"; `SYNTHESIS_v0.2_2026-09-06.md` §2.11, §2.12, §4. **Not read:** production database or logs; `maiaOrchestrator.ts` end-to-end; `fieldOrchestrator.ts` output formatting; `docs/programme/CORPUS_CALLOSUM_ARCHITECTURE_MAP_2026-08-04.md` (listed in this session's brief as a prior record — **does not exist in this tree**).
