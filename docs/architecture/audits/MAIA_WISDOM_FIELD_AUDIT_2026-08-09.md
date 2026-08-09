# MAIA Wisdom Field Audit — 2026-08-09

**Part of the MAIA High-Target Tester Readiness Audit.** Scope: everything MAIA can potentially draw on as wisdom (AIN vault/knowledge base, Library, Elemental Alchemy/Spiralogic, practices, archetypal material) versus what is actually reachable on the live conversation route. Evidence: code audit + production DB probes (minisforum, container `b1399f693`).

**Headline**: MAIA's wisdom corpus is genuinely built — pgvector, chunked, attributed — but the live conversation route receives only its *shadow*: weights, domain labels, and element classifications. **No wisdom content reaches any live MAIA conversation prompt.** And the one retrieval pipeline that is wired (to the near-dead between/chat path) points at a production table that is **empty**.

---

## 1. Production reality (measured 2026-08-09)

| Table | Rows | Meaning |
|---|---|---|
| `ain_knowledge_chunks` | **0** | The AIN knowledge base was never embedded in production. Even the wired retrieval path would return nothing. |
| `library_chunks` | **55,760** | The Library corpus is real and substantial — |
| `library_sources` | **2,228** | — but wired only to the Library room, never the companion. |
| `wisdom_entries`, `wisdom_events`, `wisdom_nodes`, `wisdom_labels`, `wisdom_submissions` | 0 | Dead wisdom-graph family. |
| `vault_symbols`, `vault_symbol_links`, `vault_query_patterns`, `vault_symbol_misses` | 0 | Vault symbol substrate empty. |
| `archetype_wisdom_library` | 0 | Zero callers, zero rows. |
| `wisdom_field_*` (circles, works, memberships, contributions, …) | 0 | Wisdom-field community substrate unused. |

## 2. Source inventory

| Source | Storage | Retrieval | Live callers | Prompt destination | Verdict |
|---|---|---|---|---|---|
| **AIN knowledge base** (108+ texts in `data/ain/source/`) | `ain_knowledge_chunks`, pgvector 768-d nomic, author/title/domain metadata (`database/migrations/20260107000004_ain_knowledge_base.sql:8-60`); ingest `scripts/embed-ain-knowledge.ts:21` | cosine similarity + threshold, mode-aware (`lib/ain/knowledge/RetrievalService.ts:119-144,186`) | only `lib/consciousness/maiaOrchestrator.ts:452,507` → `/api/between/chat` path — **not** the live sovereign route | `maiaService.ts:811-853` reads `meta.ainKnowledgeContext`, set only by the orchestrator | **Wired to a near-dead route, against an empty table.** Doubly unreachable in production. |
| **Knowledge Gate** (source-well weighting) | none — weights only (`lib/ain/knowledge-gate.ts:219-250`) | direct resolution | **live route** `app/api/sovereign/app/maia/list/route.ts:728-750` | `knowledgeGateAddendum` (`maiaService.ts:1168,1293`) | **Live — but injects proportions, zero content** ("Draw from these knowledge wells in proportion") |
| **Knowledge Field** (12-domain registry) | static in-code (`lib/maia/knowledge/knowledgeField.ts`) | keyword detection, non-ambient | `maiaService.ts:1076` (FAST), `:2023` (DEEP) | `${knowledgeFieldAddendum}` | **Live** — ~1-line domain summaries, not corpus content |
| **WisdomRouter agents** | static in-code | keyword pattern → `routeWisdom(input)` | `maiaService.ts:1100-1106` (FAST) | `${wisdomInjection}` | **Live** (~49% activation) — short framing text |
| **Spiralogic reference** | `lib/maia/spiralogicReference.ts` — 7-line blurb | n/a | **zero importers** | none | **Dead export.** Elemental framing reaches prompts via static mode text in `maiaVoice.ts:626-670` instead. |
| **Elemental agents** (Fire/Water/Earth/Air/Aether) | static code `lib/agents/elemental/` | `elementalOracle.processAll` | `maiaService.ts:760-773` (FAST), `:1404-1468` (CORE) | element *signal* only → `meta.elementalResult` + Corpus Callosum observability | **Live as classifier, not as wisdom source** |
| **MythicAtlas** | Python service; prod container is a **deterministic keyword stub** (`docker-compose.production.yml:685`) | HTTP classify (`lib/services/mythicAtlasService.ts:66`) | `maiaService.ts:2640` | facet/element metadata only | **Live but stubbed; no archetypal content** |
| **Library Intelligence** | `library_sources/chunks/distillates`, pgvector + tsvector, checksum integrity (`20260130000001`) | semantic + FTS fallback (`lib/library/LibraryService.ts:204-355`) | `app/api/library/ask-jeeves/route.ts:71` + search/stats; plus **dead** `app/api/oracle/conversation/route.ts:1019` | Library room only | **Live in a side room; unwired to the companion.** 55,760 chunks. |
| **Elemental Alchemy book** | `askTheBook` (`app/api/elemental-alchemy/ask/route.ts:15`) | book-specific | book/community pages | book surface only | **Side surface only** |
| **Practices** | static `lib/elemental-alchemy/practices.ts` + `practice_worlds/insights/sessions` tables | `getAllPractices` imported at `maiaService.ts:95`; practice-router | EA community pages + `/api/practice/*`; `practiceFieldAddendum` reaches the live prompt (`list/route.ts:703-717`) | partial | **Partially wired** — practice-field context reaches prompts; the practice library itself is surface-scoped |
| **Kelly's Obsidian vaults** | hardcoded Mac-only paths (`lib/knowledge/VaultWisdomLoader.ts:14-28`) | fs keyword scan | one caller (`lib/agents/PersonalOracleAgent.ts:1492`, `_backend`-only lane) | none | **Dead in production** (paths don't exist in the container) |
| Dead families | `corpus_documents/chunks`, `archetype_wisdom_library`, `wisdom_events/nodes` (wisdomGraphService — zero callers), `wisdom-vault-ingestion.ts` (trainer-loop only) | — | — | — | **Dead** |

## 3. Relevance architecture

Partial and **inverted**. The *gating* machinery exists live: knowledge-gate proportional weighting, detection-gated Knowledge Field, mode-aware `retrieveForMode` with similarity thresholds and `ain_knowledge_retrievals` logging. But the *content retrieval* runs only on the between/orchestrator path — the live route gets **gates without content**. Against the desired sequence (present moment → relational understanding → relevant memory → optional wisdom retrieval → synthesis), the system is roughly half-built: relational context and gating reach the prompt; wisdom text does not, anywhere, on any live route.

The feared failure mode (keyword → vector search → doctrine dump → lecture) is structurally impossible today — but only because retrieval is disconnected, not because restraint is designed. When content is wired in, the relevance gate must already be standing.

## 4. Provenance and permissions

- `ain_knowledge_chunks` carries author/title/domain, but the injection template instructs *"draw upon naturally, don't cite directly"* (`maiaService.ts:837`) — attribution deliberately stripped at the prompt boundary. Knowledge Field constraints, by contrast, mandate naming traditions (`lib/maia/prompts/knowledgeFieldBlock.ts`).
- **No practitioner-IP boundary on wisdom tables** — contrast the team scoping enforced elsewhere (caseload, sessions).
- Prior same-day audit (`AIN_OBSIDIAN_ARCHITECTURE_AUDIT_2026-08-09.md` §I.D, §IV) is consistent: the vault is a sink not a source; epistemic character is destroyed at the export boundary.

## 5. Scorecard inputs

| Dimension | Score | Basis |
|---|---|---|
| Vault access (live route) | **ABSENT** | no content retrieval wired; prod KB table empty |
| Vault access (any route) | **BROKEN** | wired path targets empty table on near-dead route |
| Library corpus | **PARTIAL** | real (55.8k chunks), reachable in Library room only |
| Wisdom relevance gating | **PARTIAL** | gate machinery live; nothing behind the gate |
| Elemental/Spiralogic | **PARTIAL** | live as classification + static mode text; no retrieved material; canonical reference file dead |
| Wisdom provenance | **PARTIAL** | metadata exists; stripped at prompt; no IP boundary |

## 6. What would change the picture fastest

1. **Run the existing embed script against production** (`scripts/embed-ain-knowledge.ts`) — the pipeline, schema, and retrieval service all exist; the table is simply empty.
2. **Wire `RetrievalService` into the live sovereign route** behind the already-live knowledge gate, so the gate finally has content to gate.
3. Decide whether the Library corpus (already embedded, 55.8k chunks) should be companion-reachable — it is the largest wisdom asset in the system and currently answers only direct Library-room queries.

*(Recommendations only — no implementation in this audit.)*
