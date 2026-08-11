# JARVIS Knowledge Layer — Orientation & Differentiation Vertical Slice

**Unit:** knowledge-layer orientation / specification (read-only)
**Date:** 2026-08-10
**Mode:** corpus walk + specification. No Vault migration, no ingestion, no ontology implementation, no product comparison.
**Status:** ⛔ **Not a work unit.** Per §22.1 each slice requires its own Work Unit boundary and governance classification. This document is input to that, not a substitute.

---

## 0. Orientation finding — governing canon for this already exists

**Read before treating anything below as new.** Three governing artifacts were ratified *before* this unit and were not cited in the request that produced it:

| Artifact | Bearing |
|---|---|
| `docs/governance/FOUNDER_RULING_SUPER_LEARNER_S22_2026-08-10.md` | **RATIFIED today.** Lifts the knowledge-graph prohibition *in part*. *"JARVIS is authorized to become a learner. It is not authorized to become an authority."* |
| `docs/architecture/JARVIS_SUPER_LEARNER_PROGRAM_2026-08-10.md` | Charter, 259 lines. §4 already records a concept field **including `differentiation`**. §5 already specifies the contradiction engine. |
| `docs/canon/CORPUS_WEIGHTING_SCHEMA_v1.0.md` + `CORPUS_DISCIPLINE_PROTOCOL_v1.0.md` | Existing corpus authority vocabulary: `tier` 1–4, **`authority`**, `source_type`, `status`, `safe_for_retrieval`. |

The requested object list — sources · passages · concepts · assertions · relationships · provenance · authority · versions · contradictions · dependencies · unresolved questions — is **almost verbatim §22.1**. That is convergence, not coincidence, and it means the correct posture here is **recovery, not authorship**. §22.3 is explicit: identify the existing primitive, establish what it knows, name the precise missing capability, extend or compose, and introduce a new primitive **only** when the existing architecture cannot represent the requirement.

Two constraints from §22 bind everything below:

- **§22.4 — four epistemic questions must stay distinct.** Proof ladder · rehabilitation disposition · work-unit lifecycle · source/authority class. ⛔ *"Do not manufacture a single universal status enum."* A claim may simultaneously be strongly-proven + retained + implementation-complete + Founder-canonical. Four predicates, not one.
- **§22.5 — exact authority vocabulary is to be RECOVERED through implementation, not invented.** A recovery finding is already recorded there noting that `CORPUS_WEIGHTING_SCHEMA`'s tiers answer *"how much should this shape MAIA's voice?"* while the Super Learner's axis asks *"what authority does this claim carry for reasoning?"* — **adjacent, not identical, and deliberately unreconciled.**

---

## CURRENT VAULT

**What exists.** Two Obsidian vaults are registered in `~/Library/Application Support/obsidian/obsidian.json`:

| Vault | Path | Scale |
|---|---|---|
| **AIN (iCloud)** — currently open, newer timestamp | `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/AIN` | **7,466 .md**, 50 PDF, ~7 MB |
| **AIN (local)** | `~/Documents/AIN` | 559 .md, 1 PDF, 5.0 MB |

Additional corpora outside the vaults: `MAIA-SOVEREIGN` repo — **2,331 tracked .md**, of which `docs/` holds 1,120 and `docs/canon/` holds 88. Further Spiralogic/Soullab material exists under `~/Documents/Soullab Dev Team/` and iCloud `Spiralogic/` (not inventoried here).

**Source formats.** Markdown, PDF (51 across both vaults), plus transcript-style conversational notes. No audio references found in the sampled walk.

**Current organization.** iCloud vault top level: `Elemental Alchemy` · `The Ancient Art of Living a Phenomenal Life` · `_MAIA_SYSTEM` · `SecondBrain` · `Library` · `Books` · `01-Sources` · `04-AIN` · `_EA-Working-Vault-2024-11_to_2025-02` · `MAIA Conversations` · `_ARCHIVE_CLEANUP` · `ain conscoiusness` *(sic)*. Mixed schemes: numbered (`01-Sources`, `04-AIN`), underscore-private (`_MAIA_SYSTEM`), archival (`_ARCHIVE_CLEANUP`), dated working copies, and one directory with a typo. **Folder position is therefore not a reliable authority signal** — which is exactly what the spec's canonicality rule already warns against.

**Existing metadata.** `CORPUS_DISCIPLINE_PROTOCOL_v1.0.md` defines required frontmatter (`tier`, `authority`, `source_type`, `status`, `safe_for_retrieval`). ⚠️ **Whether the Vault actually carries it is NOT established here** — the protocol governs the repo corpus; Vault frontmatter conformance was not measured and must not be assumed.

**Existing machine indexing / graph / embeddings.** Obsidian's own backlink graph over wikilinks. Repo-side semantic memory exists (`memoryHealth.semantic`, `sem: ok`) but is **member-memory substrate, not corpus indexing** — per §22.2 the knowledge layer must not become a second memory architecture or a replacement for it. **No corpus-wide embedding index over the Vault was found.**

**Current authoritative-source model.** `tier` 1–4 + `authority` per `CORPUS_WEIGHTING_SCHEMA` / `CORPUS_DISCIPLINE_PROTOCOL` — repo-scoped, voice-influence-oriented, and per §22.5 **not yet reconciled** with a reasoning-authority axis.

---

## DIFFERENTIATION — the vertical slice

Measured, not assumed. Occurrence of `differentiat*` across corpora:

| Corpus | Files with hits | of total |
|---|---|---|
| iCloud vault | **83** | 7,466 |
| local vault | **52** | 559 |
| repo `docs/` | **105** | 1,120 |

**Distribution — iCloud vault:** `_MAIA_SYSTEM` **74** · root 5 · *The Ancient Art of Living a Phenomenal Life* 2 · **Elemental Alchemy 2**.

**Distribution — repo `docs/`:** architecture 22 · canon 17 · root 10 · specs 9 · design 9 · pitch 5 · fields 5 · press 4 · book-studio 4.

### ⭐ Headline finding — the corpus does not mean what the design anchor assumed

The anchoring example framed Differentiation relationally: *boundaries, attachment, autonomy, intimacy, Bowen, Earth/Air*, with the question *"Where does it appear in Elemental Alchemy?"*

**The corpus answer is: barely — 2 files.** The dominant sense across the actual body of work is **architectural / consciousness-theoretic**, not relational-psychological:

> *"consciousness emerges from **maintained differentiation** enforced through architectural firewalls… mysterium coniunctionis — union through maintained opposites… McGilchrist's corpus callosum as inhibitory structure"*
> — `_MAIA_SYSTEM/…/🌊✨🔥 The Full Team Paper - Convergence Document 1.md` (**71 hits — highest density in the corpus**)

> *"awareness emerges from differentiated processes held in creative tension, not from their merger"* — ibid.

> *"the understanding that consciousness requires differentiation, not merger"* — ibid., quoted founder speech

A dedicated document exists: **`The Holders- Differentiation Before Synthesis- A Field Theory of Participatory Intelligence.md`** (19 hits) — title alone asserts a load-bearing ordering claim (*differentiation precedes synthesis*).

Charter §4 lists `differentiation` under **RELATIONSHIP (attachment · Bowen · …)**. The corpus weight sits under **CONSCIOUSNESS (McGilchrist · phenomenology)**. **This is a real tension between the recorded concept field and the authored corpus, and it is precisely the kind of thing the machine layer exists to surface rather than silently pick a side on.** It is recorded here unresolved.

**Canonical sources:** ⚠️ **none established.** A definitional grep (`differentiation is|means|:|defines`) across `docs/canon/` and `docs/architecture/` returned **zero** matches. The concept is used constantly and **defined canonically nowhere in the repo.** The strongest candidates are Vault documents (`The Holders…`, `Full Team Paper`) whose authority class is unassigned.

**Definitions:** operative, not declared — *maintained separation that enables coherence*; *differentiation, not merger*; *differentiation before synthesis*.

**Aliases (observed):** maintained differentiation · differentiated processes · separation · non-merger · Fire-Fire differentiation. ⚠️ `separation` is context-dependent and must not be auto-aliased.

**Related concepts (observed):** corpus callosum · inhibitory firewall · InhibitionMatrix · Separator · Coherence Gate · stereoscopic consciousness · mysterium coniunctionis · creative tension · field intelligence · participatory intelligence · synthesis.

**Contrasts (observed):** merger · integration · collapse · fusion · flattening. Note the corpus explicitly inverts a common assumption: *"They're building integration when consciousness requires separation."*

**Practices / applications:** InhibitionMatrix · Separator · Coherence Gate · separation scores (0.85) · Corpus Callosum substrate (Cat 6, per `CLAUDE.md`) — i.e. **the concept is already instantiated in shipping code**, which makes the concept→implementation link (below) concrete rather than speculative.

**Historical revisions:** not reconstructible. Vault files carry mtime, not semantic version history.

**Contradictions / tensions:** (1) relational vs architectural sense, above; (2) *differentiation before synthesis* vs integration-oriented framings elsewhere; (3) no canonical definition against heavy canonical *use*.

**Unknowns:** Vault frontmatter conformance · whether `The Holders…` is Founder-authored or collaborative · whether the relational sense exists substantially in Elemental Alchemy under other vocabulary · whether the two vaults duplicate or diverge.

---

## PROPOSED MACHINE OBJECTS

Per §22.3, each is stated as **recover / extend / new** — not asserted fresh.

| Object | Disposition | Basis |
|---|---|---|
| **Source** | **RECOVER + EXTEND** | `CORPUS_DISCIPLINE_PROTOCOL` already defines `tier`/`authority`/`source_type`/`status`/`safe_for_retrieval`. Missing: stable identity across edits (`content_hash`), Vault-side coverage. |
| **Passage** | **NEW (justified)** | No existing primitive addresses a region of a source. Required for provenance below document granularity. Locator must survive ordinary editing — heading-path + content-hash, **not** line numbers. |
| **Concept** | **RECOVER** | Charter §4 concept field exists and is explicitly *"not frozen"*. Do not create a second list. |
| **Assertion** | **NEW (justified)** | The Differentiation walk is the argument: the concept has no canonical definition but many attributable claims. Meaning lives in provenanced assertions, not in a concept record. |
| **Relation** | **NEW, minimal** | See below. Derive from corpus need, not from a universal ontology (§22.2). |
| **Version** | **EXTEND** | Vault gives mtime only. Semantic lineage (`old → challenged → revised → current`) is charter §5's correction lineage — reuse it, don't re-specify. |
| **Provenance** | **RECOVER** | `docs/canon/EVIDENCE_PROVENANCE_DURABILITY_2026-08-09.md` + existing provenance machinery. ⛔ Do not invent parallel vocabulary (§22.5). |
| **Authority** | ⛔ **DEFER — recovery phase §22.20** | Whether the reasoning-authority axis extends, reuses, or differs from `tier`/`authority` is **explicitly assigned elsewhere and must not be settled by assumption.** |

---

## MINIMUM RELATION TYPES

Only those the Differentiation slice actually demanded:

`DEFINED_BY` · `ELABORATES` · `EXEMPLIFIES` · `CONTRASTS_WITH` · `RELATED_TO` · `INSTANTIATED_BY` (concept → code/product) · `TENSIONS_WITH` · `SUPERSEDES` · `CITES` (external scholarship) · `ALIAS_OF`

Deliberately **not** included yet: `IS_A`, `PART_OF`, `DEPENDS_ON`, `ENABLES`, `APPLIES_TO`, `DERIVED_FROM`. The walk did not require them; adding them now would be ontology-first.

Every relation carries provenance. `INSTANTIATED_BY` is retained because Differentiation → InhibitionMatrix/Separator/Coherence Gate is **already true in shipped code**, making the concept↔implementation link demonstrable rather than aspirational.

---

## INGESTION CONTRACT

```
human source (unchanged, authoritative)
 → identify + version   (path + content_hash; re-ingest of unchanged source is a no-op)
 → address passages     (heading-path + hash; never line numbers)
 → extract candidates   (concepts / assertions / relations)
 → attach provenance    (source, passage, author, time)
 → classify epistemic status
 → validate against existing knowledge (contradiction ⇒ record, never resolve)
 → upsert machine layer
```

**Invariants.** Vault files are never written. Idempotent on unchanged content. Changed content creates traceable updates, not duplicates. Extraction is repeatable and re-runnable.

⚠️ **Extraction is itself an epistemic act.** Anything JARVIS extracts is `JARVIS inference` until a human authority confirms it — never `Founder canon` by virtue of having been found in a founder-authored file.

---

## CORRECTION CONTRACT

*"That is not what I mean by differentiation."*

Correction must alter machine interpretation while preserving: original source (untouched) · prior machine interpretation (retained, marked superseded) · correction provenance (who, when, why) · current authoritative state.

Reuses charter §5 — `old → challenged → revised → current`, **never erasure**. A founder ruling that settles a tension is recorded **as its own act** and does not overwrite the tension it resolved.

---

## RETRIEVAL CONTRACT

Six modes, kept distinct (embeddings serve *one* of them):

| Mode | Question | Differentiation example |
|---|---|---|
| Lexical | literal mention? | 83 / 52 / 105 files |
| Semantic | idea without the word? | "merger", "firewall", "non-collapse" |
| Relational | what connects? | corpus callosum, Coherence Gate, synthesis |
| Authoritative | strongest source for current meaning? | ⚠️ **currently unanswerable — no canonical definition** |
| Historical | how did it evolve? | ⚠️ **currently unanswerable — no semantic version history** |
| Contradiction | where does the corpus disagree? | relational vs architectural sense |
| Applicative | where instantiated? | InhibitionMatrix, Separator, Coherence Gate |

That two modes are **currently unanswerable** is the clearest statement of what the layer is for.

---

## STORAGE FIT

**Existing infrastructure usable:** likely yes. Self-hosted PostgreSQL (`lib/db/postgres.ts`) supports sources, passages, concepts, assertions, and edges as relational tables with explicit edge rows. Embeddings already exist in-stack for member memory.

**Missing primitives:** stable passage addressing; corpus-scope embedding index (distinct from member memory); contradiction records; correction lineage.

**New persistence required:** **NO** — on present evidence. A graph database is not indicated. Per §22.2, *"the graph is an implementation consequence, not the founding ambition."* Relational tables + explicit edges + embeddings is the expected shape.

⛔ The knowledge layer must not become a second memory architecture or a replacement for System Field / AIN member memory (§22.2).

---

## VAULT MIGRATION REQUIRED: **NO**

No blocker was demonstrated. Stable identity is achievable via path + content-hash without changing the Vault. Programmatic access is plain filesystem Markdown.

⚠️ Two operational facts to carry forward, neither a migration argument: the primary vault is **iCloud-resident**, and full-corpus grep is slow enough that it had to be backgrounded during this walk — ingestion must be incremental and hash-gated, not full-scan. And **428 zero-length .md files** exist in it, which any ingestion pass must skip rather than record as empty sources.

## EXTERNAL TOOL COMPARISON REQUIRED: **NO**

No missing capability was found that Obsidian withholds. The gaps — canonical definition, semantic version history, contradiction records, authority class — are **absent from the corpus itself**, and no editor supplies them.

---

## RECOMMENDED NEXT UNIT

**Not** the generalized layer. Two candidates, in order:

1. **Recovery unit (§22.20)** — settle whether the reasoning-authority axis extends, reuses, or differs from `tier`/`authority` in `CORPUS_WEIGHTING_SCHEMA` / `CORPUS_DISCIPLINE_PROTOCOL`. §22.5 assigns this explicitly and forbids settling it by assumption. **Everything else depends on it.**
2. **Differentiation single-concept slice** — the smallest machine representation that answers the anchor questions *for this one concept only*, over the ~240 files already identified. It should be able to say plainly: *"there is no canonical definition; here is who asserted what, where, and where the corpus disagrees with itself."*

⛔ Both require their own Work Unit boundary and governance classification (§22.1). Neither is authorized by this document.

---

## SUCCESS TEST — current standing

*Can JARVIS answer "What do I mean by Differentiation?"*

| Requirement | Now |
|---|---|
| what the Founder actually wrote | ⚠️ partial — passages located, authorship unverified |
| which source is canonical | ❌ **no canonical definition exists** |
| how the idea changed | ❌ no semantic version history |
| what related ideas surround it | ✅ recoverable |
| what tensions remain | ✅ three identified, unresolved |
| what JARVIS itself inferred | ✅ everything in this document is JARVIS inference |
| exactly where every claim came from | ✅ every claim above is path-attributed |

**The most valuable result of this walk is a negative one:** the corpus uses Differentiation as a load-bearing architectural principle, has shipped code instantiating it, and **has never canonically defined it.** A pile of searchable chunks would have returned 240 confident hits and concealed that.
