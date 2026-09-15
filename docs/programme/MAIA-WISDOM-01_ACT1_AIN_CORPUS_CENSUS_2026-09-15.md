# MAIA-WISDOM-01 · ACT 1 — AIN Wisdom Corpus Census

**Status: CENSUS COMPLETE (repository side) · READ-ONLY · ⛔ NOTHING AUTHORIZED.**
**Date:** 2026-09-15
**Repository:** `soullabtech/sovereign` @ `53cd1852`, branch `claude/loving-ramanujan-mlka7d`
**Method:** read-only inspection of the repository filesystem, schema, dependency graph
and code. ⛔ No file moved, renamed, deleted or reorganized. ⛔ No ingestion, embedding,
graph data, migration, ontology or UI. ⛔ No canon declared. ⛔ No retrieval or memory
system altered. ⛔ No corpus content transmitted anywhere.

**Evidence discipline:** presence, not content. Counts, paths, schema and wiring only.
⛔ No excerpt or summary of any source document's contents appears in this record.

---

## 0. The headline, before the detail

**The instruction was *"do not assume absence from naming alone; verify negative findings."*
Verification overturned this session's own first reading.**

An early pass in this session grepped for `oracle-corpus|soulCorpus` only, found nothing,
and concluded the wisdom runtime was *"honestly zero."* ⛔ **That conclusion was wrong and
is corrected here rather than deleted.** The substrate is not absent — it is **extensive,
partly built, partly populated, and largely unreachable from the route that actually
serves members.**

⭐⭐ **THE DECISIVE FINDING — THE WISDOM LAYER IS WIRED TO A DEAD ROUTE.**

The 12-domain Knowledge Field reaches the prompt through
`app/api/oracle/conversation/route.ts`. CLAUDE.md's own 2026-05-24 record establishes that
this route *"receives ~zero live traffic"* — the wire-site error already diagnosed once for
conversational Phase 2. It is additionally behind `knowledgeFieldLayer`, which is
**`false` by default** (`lib/utils/feature-flags.ts:62`, commented *"Off — Phase 1: enable
after oracle route wired + tested"*).

The live member route — `app/api/sovereign/app/maia/list/route.ts` — contains **no AIN
knowledge retrieval, no corpus retrieval and no library retrieval.** Its only knowledge
import is `scoreKnowledgeGate`, which **scores** a gate; it does not retrieve wisdom.

AIN chunk retrieval (`retrieveForMode`) exists and is called — in
`lib/consciousness/maiaOrchestrator.ts:478`, which serves `/api/between/chat` and
`PersonalOracleAgent`, **not the live route.**

> **MAIA has a second brain. The turn that talks to members is not connected to it.**

This is the same defect class as the 2026-05-24 wire-site error and the 2026-09-07 voice
transcript defect: *the capability was built, and the path that serves people went
somewhere else.*

---

## 1. Where the AIN corpus actually is

⚠️ **The directory named in the programme brief —
`_MAIA_SYSTEM/05-Soullab-Dev-Team/AIN Consciousness Intelligence System 1` — does not
exist in this repository and is not reachable from this container.** This session holds a
fresh clone of `soullabtech/sovereign` and nothing else. That tree lives on the founder's
machine. Its census is therefore **owed and unrun**; §8 delivers the instrument.

**What IS in the repository:**

| Location | Files | Size | What it is |
|---|---|---|---|
| `data/ain/source/` | 739 | **66 MB** | 603 `.md` + 136 `.txt`. ⭐ **The AIN corpus, in the repository, flat.** Soullab-authored material and third-party clinical texts in one undifferentiated directory. |
| `data/sacred-texts/` | 4 | 16 MB | Bible/Torah (Hebrew·Aramaic·Arabic), Bhagavad Gita, Milarepa, Qur'an commentary |
| `data/library-sources/mystics/` | 5 | 2.2 MB | John of the Cross — ⭐ the only sub-corpus with a README and a `.skiplist` |
| `data/qdrant/` | 2 | 16 KB | Qdrant `raft_state.json` + aliases. Cluster metadata only — **no vectors** |
| `.ain/` | 2 | 16 KB | Jarvis epistemic ledger (`epistemic-ledger.jsonl`, genesis 2026-08-16) — **operational, not wisdom** |
| `docs/canon/` | 80 | — | The ratified constitutional layer (§3) |
| `books/`, `training-data/`, `maia_notes/` | — | — | Further carriers, uncensused this pass |

⚠️ **`data/ain/source` is flat — one directory, 739 files, no subdivision.** Authorship,
standing, tradition and rights are not expressed anywhere in the layout. Two filenames
observed in the same listing: `Handbook-of-Personality-Disorders.txt` (third-party
clinical reference) and `How do we protect, serve, and empower conscious sovereignty?.md`
(Soullab-authored). ⛔ **Nothing in the corpus distinguishes them.**

---

## 2. What code exists (verified, not inferred)

| Path | Files | State |
|---|---|---|
| `lib/knowledge/` | 24 | `WisdomIntegrationSystem`, `ElementalAlchemyKnowledge`, `SpiralogicDeepWisdom`, `FamilyConstellationWisdom`, `MaiaInsightsLoader` — **hard-coded knowledge in TypeScript** |
| `lib/ain/knowledge/` | 3 | `RetrievalService` + `ChunkingService` — ⭐ **real vector retrieval, wired to maiaOrchestrator only** |
| `lib/maia/knowledge/` | 2 | `knowledgeField.ts` (12-domain detection) + tests — reaches prompt via the dead route, flag-off |
| `lib/wisdom/` | 17 | `wisdomSources`, `sacredTexts/` (Zohar, Qur'an, `SacredEncounterService`), `WisdomQuotes` |
| `lib/wisdom-engines/` | 3 | `WisdomSynthesisEngine`, `consciousness-intelligence-engine`, `ai-intelligence-bridge` |
| `lib/ain-recall/` | 5 | ⭐ `PatternResonanceGraph`, `AugmentedReflection`, `ReflectionPortals` — **graph-adjacent prior art** |
| `lib/secondbrain/` | 4 | ⚠️ **NAME COLLISION — a personal *capture* classifier** (raw thought → 4 buckets via Claude). Not the wisdom corpus. |
| `lib/anamnesis/` | 4 | `AnamnesisField`, `DecentralizedMemory`, `CollectiveConsciousnessBridge` |
| `packages/ain-engine/`, `services/wisdom-engine/`, `mcp-servers/ain/` | 20 | Separate engines/servers, incl. an MCP `knowledge-gate` tool |
| `app/api/ain/knowledge/route.ts` | 1 | Live API surface over `RetrievalService` |

**Ingestion pipeline — exists and is runnable:**
- `scripts/build-ain-corpus.ts` — `data/ain/source` → `data/ain/build/ain_compiled.md` + `toc.json`
- `scripts/embed-ain-knowledge.ts` — chunks → **local Ollama `nomic-embed-text` (768-dim)** → PostgreSQL
- `scripts/ingest-library.ts`, `build-library-index.ts`, `retag-library-chunks.ts`, `test-library-search.ts`, `benchmark-embeddings.ts`, `spotcheck-embeddings.ts`

---

## 3. Schema: three parallel corpora already migrated

| Migration | Tables | Vector |
|---|---|---|
| `20260107000004_ain_knowledge_base.sql` | `ain_knowledge_chunks`, `ain_knowledge_retrievals` | `vector(768)` |
| `20260112000001_corpus_environment.sql` | `corpora`, `corpus_documents`, `corpus_chunks`, `corpus_ingestions`, `corpus_retrievals` | `vector(768)` |
| `20260130000001_library_intelligence.sql` | `library_sources`, `library_chunks`, `library_distillates`, `library_search_log` | `vector(768)` + `tsvector` hybrid |

⚠️ **Three independent corpus schemas, three chunk tables, three retrieval-log tables.**
None references another. ⛔ **This is the substrate-level form of the same vocabulary
collision the Circles lane found in *"Commons"*** — and it is now also true of
*"Second Brain."*

⭐ **`library_sources` is the strongest existing precedent and should be preserved, not
rebuilt.** It alone carries: SHA256 `checksum` dedupe · `type` CHECK vocabulary ·
`meta JSONB` documented for `{folder, tags[], tradition, lineage}` · ingestion status +
error · and ⭐⭐ **a consent gate — `consent_required` / `consent_granted` /
`consent_granted_by → members(id)`, commented *"for user journals — never ingest without
explicit consent."*** The boundary between knowledge and member memory is **already built
into the schema.**

⚠️ **`ain_knowledge_chunks` carries only** `source_file · source_title · chunk_index ·
author · publication_year · domain · categories[]`. ⛔ **No stable source identity**
(`source_file` is a filename and drifts), ⛔ no `authority`, ⛔ no `tier`, ⛔ no `status`,
⛔ no `safe_for_retrieval`, ⛔ no rights field, ⛔ no relationship table anywhere.

---

## 4. The ratified governance this programme must satisfy

**The wisdom architecture is already constituted in canon.** The programme brief's three
knowledge classes, its provenance metadata block, its source-vault-before-index layering
and its Obsidian-as-human-interface position are **rediscoveries of ratified decisions, in
different vocabulary.**

| Canon | Date | What it already settles |
|---|---|---|
| `MAIA_SOUL_CORPUS.md` | **RATIFIED 2026-09-05** | Subtitled ***"The Second Brain."*** The corpus is *an inheritance, not an authority over the member*; not a ceiling; neither it nor any model is the centre. §6: ⛔ *"does not authorize retrieval into the ordinary conversational turn."* |
| `ORACLE_CORPUS_DESIGN_v1.0.md` | 2026-02-28 | Three states — **Working** (`~/Obsidian/Soullab-Vault`, ⛔ never indexed) · **Curated** (`/data/oracle-corpus`, indexed) · **Archive** (⛔ never indexed). *"Retrieval quality is determined at ingestion, not at query."* |
| `CORPUS_WEIGHTING_SCHEMA_v1.0.md` | 2026-02-28 | Four tiers, folder-level at indexing. *"MAIA must sound like itself before it sounds like anything else."* |
| `CORPUS_DISCIPLINE_PROTOCOL_v1.0.md` | 2026-02-28 | **Required frontmatter:** `tier · authority · source_type · title · author · version · date_added · status · safe_for_retrieval` |
| `MAIA_KNOWLEDGE_FIELD_v1.0.md` + `_12_DOMAIN_MAP.md` | — | The twelve domains; *name the tradition · do not collapse distinct systems* |
| `PROVIDER_GOVERNANCE.md` | — | 53 OpenAI files on tracked allowlist, burning to zero |
| `CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md` | RATIFIED 2026-07-01 | Invariant 16 — see §5 |

⚠️ **`/data/oracle-corpus` — the ratified Curated location — does not exist.** The corpus
sits at `data/ain/source`, governed by none of the above. **The discipline was ratified;
the corpus never moved into it.**

⚠️ **Embedding provider constraint:** `scripts/embed-ain-knowledge.ts` correctly uses
local Ollama. But six modules call `openai.embeddings.create()` — `lib/vectors/soulIndex`,
`lib/semantic/index`, `lib/services/FileIngestionService`, `lib/consciousness/WeQIngestionQueue`,
`lib/multi-tenant/TenantKnowledgeBase`, and `lib/sovereignty/LocalVectorDB` (so named).
`npm run check:no-openai` **passes** — these are tracked migration debt, not new surface.
⛔ **Any path this programme builds must use `lib/ai/localEmbeddingClient.ts`; touching the
allowlisted modules would grow debt the governance is burning down.**

---

## 5. ⛔⛔ The constitutional constraint the brief does not name

`CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md` (Invariant 16): **authority may only move
upward through authored experience — Encounter → Reflection → Recognition → Living Field →
Developmental Ecology — never skipping a layer, never manufacturing higher-order meaning.**

A Wisdom Resolver answering *"what wisdom bears upon this member's situation?"* and
returning Jung on projection **injects Recognition-tier meaning about a member from a
source the member never authored.** That is the prohibited move, arriving through a
retrieval pipeline instead of a prompt.

⭐ **PROPOSED FOR RATIFICATION BEFORE ANY RESOLVER IS DESIGNED — ⛔ not ratified here:**

> **Library material may inform *how MAIA thinks*. It may never supply *Recognition about
> the member*.** A source may shape vocabulary, questions, register and restraint. It may
> never originate a claim about who this member is, what they are doing, or what their
> experience means. Recognition is authored upward by the member or it does not exist.

⚠️ **This failure mode will *feel* like success.** A resolver naming the right tradition at
the right moment reads as depth. It is the same act. `RECOGNITION_INTEGRITY.md`,
`RIGHT_TO_REMAIN_UNPOSSESSED.md` and `INTERFACE_HUMILITY.md` all point here; the wisdom
corpus is a new and unusually well-disguised route to violating them.

**Two further constraints, from the brief's own candidate distinctions:**

- ⛔ **"Living Knowledge → member conversations" is a consent breach as written.** Sanctuary
  invariant 6 is absolute. Ratified `ORACLE_CORPUS_DESIGN` already makes Working state
  never-indexed, and `library_sources.consent_required` already encodes it. Member
  conversational content is **out of scope for the wisdom corpus at any standing.** The two
  corpora may be queried in one turn; ⛔ they may never be one corpus.
- ⚠️ **"Canon / Library / Living" collapses two orthogonal axes** — *authorship* (Soullab
  vs third-party) and *standing* (doctrine · reference · observation · superseded). Kelly's
  exploratory notes are Soullab-authored and not doctrine; an adopted external framework is
  third-party and high standing. ⭐ **CMT-01 Decision 2 already ruled against one scalar**
  (`authoredBy` + `participationClass` + `authority`), and the ratified corpus protocol
  already agrees, carrying `author`, `source_type`, `authority` and `tier` as four fields.

---

## 6. ⭐ The image, measured against substrate

Per the brief: the concept image is a **visual north star only**. Each node measured:

| Node in image | Substrate state |
|---|---|
| **MAIA (centre)** | ⭐ **LIVE** — `app/api/sovereign/app/maia/list/route.ts` |
| **Relational Memory** | ⭐ **LIVE** — atoms, `is_breakthrough`, spiral state, consent gates. The only spoke actually reaching a member turn. |
| **Symbolic & Elemental Intelligence** | ⭐ **LIVE** — Spiralogic, conductor, elemental voices, Corpus Callosum |
| **Wisdom Library** | ⚠️ **CORPUS + SCHEMA + EMBEDDER EXIST · RETRIEVAL NOT ON THE LIVE TURN** |
| **MAIA Canon** | ⚠️ **RATIFIED AS CANON (80 docs) · NOT A RETRIEVABLE CORPUS** — governs code, not accessible to MAIA |
| **Knowledge Architecture** → *Sources / Provenance* | ⚠️ **PARTIAL** — `library_sources` strong; `ain_knowledge_chunks` weak; no stable source id |
| **Knowledge Architecture** → *Semantic Retrieval* | ⚠️ **BUILT, OFF-PATH** — `RetrievalService`, flag-off, dead route |
| **Knowledge Architecture** → *Concept Graph* | ⛔ **DOES NOT EXIST** — no concept table, no relation table, no extraction. Nearest prior art: `lib/ain-recall/PatternResonanceGraph.ts` |
| **Knowledge Architecture** → *Resolver / Synthesis* | ⛔ **DOES NOT EXIST** |
| **Living Knowledge** | ⛔ **NOT CONSTITUTED** — and ⚠️ as drawn it includes member content (§5) |
| **Meaning-Making** (Shadow & Gold, Projection, Soul…) | ⛔ **CONCEPTUAL ONLY** — these are *concepts*, and the concept layer does not exist |
| **Cross-domain edges** (all of them) | ⛔ **DECORATIVE.** No relationship data exists anywhere in the repository. |

⭐⭐ **The image's centre and three spokes are real. Every single edge in it is not.**
The graph is precisely the thing with no substrate — which is why ACT 4 cannot be
approached as drawing, and why §7-F names the evidence it needs first.

**Visualization dependencies present:** `d3@7.9.0`, `three@0.182.0`. ⛔ No graph library
(no sigma, cytoscape, react-force-graph, graphology, neo4j). Nothing to uninstall.

---

## 7. Required closing answers

### A. What knowledge organism currently exists?

**A well-governed constitution, a large ungoverned corpus, three parallel half-built
retrieval substrates, and no connective tissue.** 80 canon documents (five directly
governing the corpus, one ratified ten days ago). 739 AIN source files (66 MB) flat in one
directory. 18 MB of sacred texts and mystics. Three migrated vector schemas that do not
know about each other. A working local-embedding ingestion pipeline. Roughly 90 TypeScript
modules across ten `knowledge`/`wisdom`/`ain` directories. ⛔ **Zero concept objects, zero
relationships, zero resolver.**

### B. What can MAIA actually access today?

**On the live member turn: relational memory, Spiralogic/elemental intelligence, Corpus
Callosum — and no wisdom corpus at all.**

- `retrieveForMode` → `maiaOrchestrator` → `/api/between/chat` + `PersonalOracleAgent` — **not the live route**
- `knowledgeFieldBlock` → `app/api/oracle/conversation/route.ts` — **the ~zero-traffic route**, behind `knowledgeFieldLayer: false`
- `lib/knowledge/*` hard-coded modules — reachable by import, not corpus-derived
- `MAIA_SOUL_CORPUS.md` §6 — ⛔ retrieval into the ordinary turn **is not authorized**

⚠️ **Whether `ain_knowledge_chunks` / `library_chunks` hold rows in production is UNREAD.**
No production database was contacted. ⛔ **Do not infer population from the pipeline's
existence.** A production count is owed (§8.2).

### C. What valuable knowledge is present but effectively inaccessible?

1. ⭐⭐ **The 80-document canon** — MAIA is *governed by* the Oath, the Invariants, the
   Direction of Authority, and cannot *read* any of them. The most authoritative body of
   Soullab knowledge is the one least accessible to MAIA.
2. ⭐ **All 739 AIN files on the live turn** — flag off, route dead, §6 unlifted.
3. **18 MB of sacred texts and mystics** — reachable only through bespoke per-tradition
   services, not as a corpus.
4. ⚠️ **Whatever lives under `_MAIA_SYSTEM/.../AIN Consciousness Intelligence System 1`** —
   outside the repository, therefore outside every gate, backup and governance instrument
   described here.
5. **`books/`, `training-data/`, `maia_notes/`** — uncensused this pass; named so their
   absence from the findings is not read as absence of content.

### D. What structures already exist that should be preserved rather than rebuilt?

1. ⭐⭐ **`library_sources`** — checksum dedupe, typed vocabulary, `meta.tradition/lineage`,
   ingestion status, **and the member-consent gate.** The knowledge/memory boundary is
   already schema-enforced. **Build from this, not beside it.**
2. ⭐ **The ratified frontmatter** (`CORPUS_DISCIPLINE_PROTOCOL_v1.0`) — nine fields already
   law. ⛔ Extending it is a governed act, not an ingestion detail.
3. ⭐ **Local embedding path** — `lib/ai/localEmbeddingClient.ts`, `nomic-embed-text`,
   768-dim, consistent across all three schemas. Sovereign by construction.
4. **`RetrievalService` + `ChunkingService`** — working retrieval; the defect is *where it
   is wired*, not what it does.
5. **`.skiplist`** — a working, human-editable ingestion exclusion precedent.
6. **`lib/ain-recall/PatternResonanceGraph.ts`** — the only relationship-shaped prior art.
7. ⭐ **The 12-domain map** — already ratified; ⛔ do not author a thirteenth taxonomy.
8. **`INTELLIGENCE_FIELD_ACCESS_MAP.md`** — the project's existing method for exactly the
   question this census asked. Reuse its status legend.

### E. Which image distinctions exist in substrate, and which are conceptual only?

**In substrate:** MAIA centre · Relational Memory · Symbolic & Elemental Intelligence ·
(partially) Wisdom Library storage + retrieval · (partially) Sources & Provenance.

**Conceptual only:** Concept Graph · Resolver · Synthesis-as-object · Living Knowledge ·
Meaning-Making · **every edge in the image** · the Canon-as-retrievable-corpus ·
Canon↔Library comparison · "explore the wisdom behind this."

⚠️ **The four-class legend (Canon · Library · Living · Relational) exists in canon as a
*different* partition** — Working/Curated/Archive × tier 1–4. ⛔ Two vocabularies for one
object is the primary risk this programme carries, and it is larger than the disorder in
the corpus.

### F. What evidence is necessary before designing the live knowledge graph?

⛔ **None of the following is authorized by this census.** Each is a founder act.

1. **The external AIN census must actually run** (§8.1). Scale is currently unknown, and
   every downstream cost estimate depends on it.
2. **Production population counts** (§8.2) — rows in `ain_knowledge_chunks`,
   `corpus_chunks`, `library_chunks`. Built ≠ populated.
3. ⭐⭐ **A concept-extraction feasibility finding.** *Can concepts be extracted from this
   corpus at acceptable cost and acceptable authority?* ⛔ **This is a finding, not a
   premise, and it is where the programme dies if skipped.** Hand-authoring a concept graph
   over an unknown corpus is unbounded. A model-inferred relationship is ⛔ not canonical —
   the brief says so itself.
4. **A vocabulary ruling** — one partition, or an explicit ruling that two are needed and
   which governs. Until then ⛔ no table may be named `concept`, `canon` or `standing`.
5. **A rights census.** Third-party clinical and copyrighted texts sit in `data/ain/source`
   with no rights field anywhere in any schema. ⛔ A retrieval surface that quotes them is
   a legal exposure, not only a design question.
6. ⭐ **The §5 Recognition line ratified** — ⛔ **before** ACT 2, not before ACT 6. It
   constrains the data model (whether a concept may carry an *interpretation of a person*),
   not merely the resolver.
7. **A wire-site ruling** — which route serves members, and what §6 of `MAIA_SOUL_CORPUS.md`
   would need in order to be lifted. ⛔ Building ACTs 2–5 without this rebuilds the defect
   this census found.
8. **A falsifier for the central claim.** The claim *"MAIA draws on the wisdom corpus"* is
   falsified by: a live member turn whose response is produced with zero retrieved chunks
   while the corpus contains material a competent reader would call relevant. ⛔ Until that
   test can run, "Live" is not available to any surface, per `MARKETING_CLAIM_DISCIPLINE.md`.

---

## 8. What is owed, and the instrument delivered

**8.1 — External AIN census (⛔ unrun, cannot run here).** Instrument delivered:
`scripts/witness/ain-corpus-census.mjs` — no dependencies, Node ≥ 18, read-only by
construction (it **refuses to start** if `--out` resolves inside `--root`, and never
follows symlinks out of the tree). It reports counts, extensions, sizes, content hashes,
duplicate clusters, ratified-frontmatter field presence, machine-readability and
12-domain term signal. ⛔ No excerpt, no content summary. The founder's run is the evidence
of record:

```bash
node scripts/witness/ain-corpus-census.mjs \
  --root "/path/to/_MAIA_SYSTEM/05-Soullab-Dev-Team/AIN Consciousness Intelligence System 1" \
  --out  ~/ain-census-2026-09-15
```

It is equally valid against `data/ain/source` for a same-shape reading of the in-repo corpus.

**8.2 — Production population witness (⛔ unrun).** Read-only, counts only:

```sql
SELECT 'ain_knowledge_chunks' t, count(*), count(embedding) embedded FROM ain_knowledge_chunks
UNION ALL SELECT 'corpus_chunks', count(*), count(embedding) FROM corpus_chunks
UNION ALL SELECT 'library_chunks', count(*), count(embedding) FROM library_chunks
UNION ALL SELECT 'library_sources', count(*), count(*) FILTER (WHERE ingestion_status='completed') FROM library_sources;
```

**8.3 — Uncensused carriers:** `books/`, `training-data/`, `maia_notes/`,
`Community-Commons/`, `docs/research/`. Named as a known gap, ⛔ not as an absence.

---

## 9. Standing

**MAIA-WISDOM-01 · ACT 1 COMPLETE (repository side) · ⛔ EXTERNAL AIN CENSUS OWED ·
⛔ PRODUCTION COUNTS OWED · ⛔ ACT 2 NOT OPENED · ⛔ NO ARCHITECTURE PROPOSED AS AUTHORIZED ·
⛔ NO CANON AUTHORED OR AMENDED · ⛔ NO FILE MOVED · ⛔ NO INGESTION · ⛔ NO EMBEDDING ·
⛔ NO SCHEMA · ⛔ NO UI · ⛔ NO RETRIEVAL OR MEMORY ALTERED · PRODUCTION UNTOUCHED.**

**STOP. Returned for founder adjudication.**

> *The corpus is not missing. The connection is. And every edge in the picture is the part
> that does not exist yet.*

---

**Companion:** `MAIA-WISDOM-01_CHARTER_CANDIDATE_2026-09-15.md` — canon reconciliation
drafted earlier in this session. ⚠️ Its §1 asserts the wisdom runtime is *"honestly zero,"*
which **this census disproves**; that section is corrected in place there and is preserved
rather than deleted, as evidence of what a naming-based negative finding costs.
