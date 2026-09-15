# MAIA-WISDOM-01 — Wisdom Architecture

**Status: CHARTER CANDIDATE. ⛔ LANE NOT OPENED. ⛔ NOTHING AUTHORIZED.**
**Date:** 2026-09-15
**Authored by:** session act, against a founder proposal to open a wisdom-architecture
programme parallel to the Jarvis knowledge plane.
**What this document is:** a reconciliation of that proposal against existing ratified
canon, plus a specified read-only first act. It opens nothing. Opening MAIA-WISDOM-01
requires an explicit founder act.

---

## 0. The decisive finding

**The proposal was written as if this were greenfield. It is not.**

MAIA's wisdom architecture is **already constituted in ratified canon**, and has been
for over six months at the governance layer and for ten days at the identity layer:

| Document | Date | Status | What it already settles |
|---|---|---|---|
| `docs/canon/MAIA_SOUL_CORPUS.md` | 2026-09-05 | **RATIFIED CANON** | Subtitled *"The Second Brain."* Establishes what the corpus **is**, whom it serves, that it is an *inheritance rather than an authority over the member*, that it is not a ceiling, and that neither it nor any model is the centre. |
| `docs/canon/ORACLE_CORPUS_DESIGN_v1.0.md` | 2026-02-28 | Canon | Three knowledge states — **Working (hot, `~/Obsidian/Soullab-Vault`, never indexed)** · **Curated (`/data/oracle-corpus`, indexed)** · **Archive (`/data/archive`, never indexed)**. Governing principle: *retrieval quality is determined at ingestion, not at query.* |
| `docs/canon/CORPUS_WEIGHTING_SCHEMA_v1.0.md` | 2026-02-28 | Canon | Four tiers — Voice · Core Frameworks · (t3) · (t4) — applied at folder level during indexing. *"MAIA must sound like itself before it sounds like anything else."* |
| `docs/canon/CORPUS_DISCIPLINE_PROTOCOL_v1.0.md` | 2026-02-28 | Canon | **Required per-document frontmatter**: `tier · authority · source_type · title · author · version · date_added · status · safe_for_retrieval`. |
| `docs/canon/MAIA_KNOWLEDGE_FIELD_v1.0.md` + `..._12_DOMAIN_MAP.md` | — | Canon | The twelve domains, and the rules *name the tradition · do not collapse distinct systems · integration over accumulation.* |
| `docs/canon/INTELLIGENCE_FIELD_ACCESS_MAP.md` | 2026-05-20 | Working audit | The existing method for answering *can MAIA actually reach this field while she is speaking?* |

⭐ **The proposal's three knowledge classes, its provenance metadata block, its
source-vault-before-index layering and its Obsidian-as-human-interface position are all
rediscoveries of decisions already ratified — in different vocabulary.**

⛔ **A parallel vocabulary for an already-governed object is the primary risk this lane
carries, and it is larger than the disorder in the corpus.** *Canon/Library/Living* is
not obviously the same partition as *Working/Curated/Archive* × *tier 1–4*, and if both
vocabularies survive, nobody will be able to say which one is authoritative. The census
must therefore be **two-sided**: the corpus on disk, and the ratified governance the
corpus must satisfy.

---

## 1. Runtime state — ⛔ THIS SECTION IS WRONG AND IS SUPERSEDED

> ⚠️ **SUPERSEDED 2026-09-15 by `MAIA-WISDOM-01_ACT1_AIN_CORPUS_CENSUS_2026-09-15.md`.**
> The finding below was reached by grepping for `oracle-corpus|soulCorpus` alone and
> concluding absence. The ACT 1 census verified the negative and **disproved it**: there
> are 739 AIN source files in `data/ain/source`, three migrated vector schemas, a working
> local-embedding ingestion pipeline, and live retrieval code — all wired to routes that do
> not serve members. **The substrate is not zero; it is disconnected.**
>
> ⛔ **Kept verbatim rather than deleted.** It is the evidence of what a naming-based
> negative finding costs, and the reason the founder's ACT 1 brief says *"do not assume
> absence from naming alone; verify negative findings."* Read everything below as the
> mistaken reading it was.

### 1.x (superseded) — original text

Verified in this session, read-only, against the repository at `53cd1852`:

- `/data/oracle-corpus` — **not present in the repository.**
- `grep -rl "oracle-corpus|oracleCorpus|soulCorpus|soul_corpus"` over `lib/`, `app/`,
  `scripts/` — **zero matches.** No ingestion, no index, no resolver, no retrieval call.
- `MAIA_SOUL_CORPUS.md` §6 says so in its own words: *"It does not authorize retrieval
  into the ordinary conversational turn."*

So in the six-category typology this is **Cat 2 (canonical primitive — interface target,
no runtime authority)** with a **Cat 5 frozen governance stack** beneath it. It is **not**
Cat 3: no substrate was built and left uncalled. There is nothing to un-wire, which is
the one genuinely good piece of news — the lane starts clean.

⚠️ *Declaration is not liveness.* A ratified canon article naming a second brain is not
a second brain.

---

## 2. Three structural corrections to the proposal

### 2.1 The three classes collapse two orthogonal axes — a mistake this project has already ruled against

The proposal offers **MAIA Canon · Wisdom Library · Living Knowledge** as one partition.
It is two axes wearing one name:

- **Authorship** — Soullab/Kelly-authored vs. third-party.
- **Standing** — doctrine vs. reference vs. observation vs. superseded.

They are independent. Kelly's exploratory notes are Soullab-authored and *not* doctrine.
An external framework Soullab has deliberately adopted is third-party-authored and *high*
standing. A member-facing pattern observed fifty times is Soullab-observed and carries
standing of a third kind again.

⭐ **CMT-01 Decision 2 already settled this shape**: `authoredBy` + `participationClass`
+ `authority` — *never one scalar.* The ratified corpus protocol already agrees, carrying
`author`, `source_type`, `authority` and `tier` as **four separate fields**.

**Correction:** do not introduce a `class` field. Extend the ratified frontmatter —
and extending ratified frontmatter is itself a governed act, not an ingestion detail.

### 2.2 ⛔⛔ The constitutional line the proposal does not name

`docs/canon/CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md` (ratified 2026-07-01, Invariant 16):
**authority may only move upward through authored experience — Encounter → Reflection →
Recognition → Living Field → Developmental Ecology — never skipping a layer, never
manufacturing higher-order meaning.**

A Wisdom Resolver that answers *"what wisdom bears upon this member's situation?"* and
returns Jung on projection is **injecting Recognition-tier meaning about a member from a
source the member never authored.** That is the exact prohibited move, arriving through a
retrieval pipeline rather than through a prompt.

⭐ **THE HARD LINE, proposed for ratification before any resolver is designed:**

> **Library material may inform *how MAIA thinks*. It may never supply *Recognition about
> the member*.** A source may shape MAIA's vocabulary, questions, register and restraint.
> It may never be the origin of a claim about who this member is, what they are doing, or
> what their experience means. Recognition is authored upward by the member or it does not
> exist.

`RECOGNITION_INTEGRITY.md`, `RIGHT_TO_REMAIN_UNPOSSESSED.md` and `INTERFACE_HUMILITY.md`
all already point at this; the wisdom corpus is simply a new and unusually well-disguised
route to violating it.

⚠️ This is also the failure mode that will *feel* most like success. A resolver that
names the right tradition at the right moment reads as depth. It is the same act.

### 2.3 ⛔ "Living Knowledge → member conversations" is a consent breach as written

The proposal lists *member conversations · session-derived patterns · field observations*
under Living Knowledge. **Sanctuary Mode invariant 6 is absolute**: nothing from a
sanctuary session can be saved, extracted, inferred or converted into long-term memory,
*including by user request during the session.* The ratified corpus design already handles
this by making Working state **never indexed**.

**Correction:** member conversational content — sanctuary or not — is **out of scope for
the wisdom corpus at any standing.** Member memory has its own substrate, its own consent
gates (`return_preference`, `surface_preference`) and its own frozen roadmap (Authority ×
Time; Episodic Phase 2 unauthored). ⛔ Do not let a wisdom lane become a second, ungated
path to member content. The two corpora may be queried in one turn; they may never be one
corpus.

---

## 3. What the proposal gets right, and should keep

1. **Census before architecture.** Correct, and it is this project's own method.
2. **Do not reorganize AIN manually first.** Correct — and stronger than stated: the
   disorder is evidence, and reorganizing destroys it before it is read.
3. **Source vault preserved intact; index never the only surviving representation.**
   Correct, and it matches ratified State 1/State 2 separation.
4. **Obsidian as the human interface, not MAIA's read path.** ⭐ Already the ratified
   position — `ORACLE_CORPUS_DESIGN_v1.0` names `~/Obsidian/Soullab-Vault` as State 1 and
   never-indexed. The proposal agrees with canon without knowing it did.
5. **Jarvis ≠ MAIA; shared infrastructure, separate corpora.** Endorsed. Operational
   state and wisdom have different epistemic standing and must not be one index.
6. **Embeddings are one retrieval mechanism, not an epistemology.** Endorsed, and it is
   the load-bearing sentence in the whole proposal.

---

## 4. ACT 1 — AIN WISDOM CORPUS CENSUS (specified, ⛔ not authorized)

### 4.1 Purpose

Determine what knowledge exists under AIN — where, in what form, at what scale, with what
provenance, with what duplication, and **whether it can satisfy the already-ratified
corpus discipline protocol.**

### 4.2 Authorized (on founder act)

- ✓ walk the corpus tree read-only; inventory paths, extensions, sizes, mtimes
- ✓ detect duplicate and near-duplicate clusters by content hash
- ✓ detect presence/absence of the **ratified** frontmatter fields
- ✓ classify machine-readability (immediately readable / needs conversion / unsuitable)
- ✓ surface the conceptual domains actually present, against the ratified 12-domain map
- ✓ identify apparent authorship class (Soullab-authored vs third-party) **as a reported
  signal, never as a stored classification**
- ✓ emit a single census report **outside the corpus tree**

### 4.3 ⛔ Not authorized

- ⛔ move, rename, delete or deduplicate any file
- ⛔ write anything whatsoever inside the corpus tree
- ⛔ redesign the folder hierarchy
- ⛔ generate embeddings or any index
- ⛔ create database schema or migrations
- ⛔ ingest anything into MAIA
- ⛔ declare canon, assign tier, or assign authority
- ⛔ reconcile conflicting teachings
- ⛔ extend the ratified frontmatter schema
- ⛔ send any corpus content to any model provider
- ⛔ stage any corpus excerpt, digest or fingerprint into a committed record

### 4.4 Evidence discipline

Following `S3-F8-WITNESS-01` discipline **D3 — record presence, not content**: the census
report carries **counts, paths, extensions, hashes and field-presence booleans.** ⛔ No
excerpt, no summary of any document's contents, no digest of authored prose. A census that
cannot be written without quoting the corpus has become an ingestion.

### 4.5 ⚠️ Where it can and cannot run

**The census cannot run from a remote Claude Code container.** This session holds a fresh
clone of `soullabtech/sovereign` and nothing else; the AIN corpus lives on the founder's
machine (`_MAIA_SYSTEM/05-Soullab-Dev-Team/AIN Consciousness Intelligence System 1`) and
is not reachable from here. The census instrument is therefore delivered as a script to be
**run by the founder, locally, read-only** — and the founder's run is the evidence of
record.

Instrument: `scripts/witness/ain-corpus-census.mjs` (no dependencies; Node ≥ 18).

```bash
node scripts/witness/ain-corpus-census.mjs \
  --root "/path/to/AIN Consciousness Intelligence System 1" \
  --out  ~/ain-census-2026-09-15
```

It writes `census.json` + `CENSUS.md` to `--out` and **never writes inside `--root`.**

---

## 5. Sequencing (proposed, ⛔ none authorized)

| Act | Name | Gate |
|---|---|---|
| **1** | AIN corpus census (read-only) | founder act to open |
| **2** | Canon reconciliation — one vocabulary, or an explicit ruling that two are needed | census complete |
| **3** | Frontmatter extension ruling — what `CORPUS_DISCIPLINE_PROTOCOL_v1.0` must carry that it does not | act 2 |
| **4** | The Recognition line (§2.2) ratified as canon | ⭐ **before any resolver design**, not after |
| **5** | Source Vault + Wisdom Registry (layers A–B) | acts 2–4 |
| **6** | Conceptual graph feasibility — *can concepts be extracted at all?*, decided from census evidence, not assumed | act 5 |
| **7** | Semantic index | act 6 |
| **8** | Wisdom Resolver | ⛔ blocked on act 4 |
| **9** | Retrieval into an ordinary MAIA turn | ⛔ requires lifting `MAIA_SOUL_CORPUS.md` §6 — a separate founder act |

⚠️ **Act 6 is where this lane dies if it is skipped.** Hand-authoring a concept graph
across a corpus of unknown scale is unbounded work. Whether concepts can be extracted at
acceptable cost is a *finding*, not a premise.

---

## 6. Standing

**MAIA-WISDOM-01 CHARTER CANDIDATE · ⛔ LANE NOT OPENED · ⛔ ACT 1 NOT AUTHORIZED ·
CENSUS INSTRUMENT DELIVERED, UNRUN · ⛔ NO CANON AUTHORED · ⛔ NO CANON AMENDED ·
⛔ NO CORPUS TOUCHED · ⛔ NO SCHEMA · ⛔ NO INGESTION · PRODUCTION UNTOUCHED ·
MAIA RUNTIME UNTOUCHED.**

> *The disorder in the corpus is evidence. The disorder in the vocabulary is the defect.*
