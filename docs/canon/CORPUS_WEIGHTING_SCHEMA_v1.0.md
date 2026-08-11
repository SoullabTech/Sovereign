# Corpus Weighting Schema v1.0

**Status:** Canon
**Date:** 2026-02-28
**Depends on:** ORACLE_CORPUS_DESIGN_v1.0.md, SOVEREIGN_STORAGE_SOP_v1.0.md

---

## ⚠️ Implementation status — founder ruling 2026-08-11

**This schema is retained as designed canon. It does not describe current machine behavior.**

```
canonical status:            retained
implementation status:       specified_not_operational
known code consumers:        0
reasoning-authority function: NONE
```

Verified 2026-08-10: `grep -rl "CORPUS_WEIGHTING|corpus_weight|corpusWeight"` across `*.ts`, `*.tsx`, `*.mjs`, `*.js`, `*.sql` returns **zero files**. The only `Tier 1–4` occurrences in code are an unrelated field-safety altitude tier (`app/api/debug/field-safety/route.ts`).

**Why this notice exists.** A Canon document with no consumers creates an authority expectation the system does not honor — a future session could reasonably infer from the existence of canon that weighting already governs retrieval. It does not.

**Scope of this schema — and its boundary.** What is specified here answers: *how strongly should a corpus region shape MAIA's **voice** and intellectual orientation?* It does **not** answer *in what domain may a claim legitimately govern reasoning?* That second question belongs to `authority_scope` (a separate primitive, design authorized 2026-08-11, implementation not yet authorized).

The two may coexist and **neither derives from the other**: high corpus weight does not imply broad authority scope, and low corpus weight does not imply weak truth within the appropriate scope.

**Disposition:** ⛔ not activated · ⛔ not retired. Retained. The substantive design below is unchanged by this notice.

**Lineage:** `docs/architecture/JARVIS_SUPER_LEARNER_AUTHORITY_CLASS_RECOVERY_2026-08-11.md` · `docs/governance/FOUNDER_RULING_SUPER_LEARNER_S22_2026-08-10.md`

---

## Purpose

Not all corpus material should influence MAIA equally. This schema ensures that MAIA sounds like Soullab — not like a library.

The goal is not to suppress material. It is to ensure that the **voice anchors, core frameworks, and regulation language** carry more weight than general research — the same way a teacher's own formulations carry more authority than their reading list.

---

## The Weighting Model

Four tiers, applied at the folder level during indexing.

### Tier 1 — Voice (Highest Weight)

**Folder:** `/data/oracle-corpus/voice-tone-examples`

What belongs here:
- Exemplary MAIA responses (human-curated as "this is the voice")
- Transcripts of conversations where presence was achieved
- Tone reference passages written specifically for MAIA's register
- Manifesto and oath language

**Why highest weight:** MAIA must sound like itself before it sounds like anything else. When retrieved, Tier 1 material functions as a voice anchor — it pulls the response register toward presence rather than analysis.

**Volume expectation:** Small. Dozens of documents, not hundreds. Quality over quantity here is essential.

---

### Tier 2 — Core Frameworks (High Weight)

**Folder:** `/data/oracle-corpus/core-frameworks`

What belongs here:
- Spiralogic reference (12-phase system)
- AIN ontological framework
- Five-element model
- Relational maturation model (orientation → capacity → autonomy → seasonal return)
- Sovereignty principles
- The MAIA Canon

**Why high weight:** These are the structural lenses MAIA applies when making meaning. They should be strongly present in retrieval — they are the grammar of MAIA's thinking, not just its vocabulary.

**Volume expectation:** Moderate. These documents should be few, precise, and stable. A framework document that changes frequently should not be in this tier.

---

### Tier 3 — Teachings and Practice (Standard Weight)

**Folders:**
- `/data/oracle-corpus/books`
- `/data/oracle-corpus/teachings`
- `/data/oracle-corpus/rituals-practices`
- `/data/oracle-corpus/psychology`

What belongs here:
- Completed manuscript chapters
- Course material and teaching sequences
- Ritual and ceremony language
- Depth psychology frameworks MAIA works with

**Why standard weight:** This is the content layer — the domain knowledge that makes MAIA substantive. It should be retrievable but not dominant. When this material surfaces, it should feel like MAIA drawing on wisdom, not citing sources.

**Volume expectation:** Growing over time. This is where the knowledge corpus expands as work matures.

---

### Tier 4 — Research (Lower Weight)

**Folder:** `/data/oracle-corpus/research-curated`

What belongs here:
- Peer-reviewed material you have metabolized and endorse
- Books and papers that inform the framework without being the framework
- Supporting evidence for claims MAIA might make

**Why lower weight:** Research informs the framework but is not the voice. When research surfaces in retrieval without being filtered through the framework, responses become analytical and dense. Lower weight keeps research in a supporting role.

**Curation discipline is highest here:** only research that has been actively read, evaluated, and integrated belongs in this folder. A PDF you scanned and intended to read does not qualify.

---

## Implementation Notes

### How weighting is applied

At indexing time, each document receives a `weight` metadata field corresponding to its tier:

```
Tier 1 (Voice):           weight = 2.0
Tier 2 (Core Frameworks): weight = 1.5
Tier 3 (Teachings):       weight = 1.0
Tier 4 (Research):        weight = 0.6
```

At query time, retrieved chunks are re-ranked by multiplying semantic similarity score by document weight before selecting the top-k chunks for context injection.

This is a simple multiplicative re-ranking — no ML required, no additional infrastructure.

### What this prevents

Without weighting, vector similarity alone will surface whatever happens to be semantically closest to the query — which may be a dense research paper rather than a voice anchor, or a general framework rather than a specific teaching that fits the moment. Weighting ensures that the **right kind of material** surfaces, not just the most similar.

### Tuning

If MAIA responses feel:
- **Too analytical** → increase Tier 1 and 2 weight, decrease Tier 4 retrieval count
- **Too abstract** → move more concrete teaching material into Tier 3, review Tier 2 for over-abstraction
- **Inconsistent voice** → audit Tier 1 for mixed tone; reduce Tier 1 volume to only the clearest exemplars
- **Dense / heavy** → reduce total retrieved chunks from 5 to 3; check Tier 4 for over-inclusion

The tuning feedback loop is: **observe response quality → adjust weights or retrieval count → re-evaluate**. Do not adjust prompts to compensate for corpus problems.

---

## Governance Rules

1. **Tier 1 is frozen except by explicit decision.** Voice anchors are not updated casually. A Tier 1 update requires reading the existing tier and deciding deliberately to replace or extend it.

2. **Tier 2 is stable.** Core framework documents are updated when the framework changes — not when a new interpretation emerges. The corpus reflects the current canonical model, not the exploration process.

3. **Tier 3 and 4 grow.** As work matures and research is metabolized, these tiers expand. This is the healthy growth path.

4. **Nothing moves backward.** If a Tier 2 framework document becomes outdated, it moves to `/data/archive` — not back to working. The corpus never degrades silently.

---

## The Full Stack (For Reference)

```
MAIA's epistemic environment, from most to least influence:

1. System prompt (highest — always present, not retrieved)
2. Tier 1: Voice anchors (retrieved, weight 2.0)
3. Tier 2: Core frameworks (retrieved, weight 1.5)
4. Tier 3: Teachings and practice (retrieved, weight 1.0)
5. Tier 4: Research (retrieved, weight 0.6)
6. Conversation history (always present, not retrieved)
```

The system prompt and conversation history are the fixed poles. Retrieval fills the middle. Weighting ensures that what fills the middle feels like Soullab, not like a search result.

---

## Design Intention

This schema exists because there is a failure mode specific to knowledge systems: **the librarian problem.**

A system with access to a large corpus and no weighting becomes a librarian — it retrieves what is relevant without regard for what is *right for this moment*. Presence requires more than relevance. It requires that the right register, the right weight, the right voice arrive — not just the right content.

Weighting is how the system knows the difference between what is true and what is helpful to surface right now.
