---
level: protocol
---

# Oracle Corpus Design v1.0

**Status:** Canon
**Date:** 2026-02-28
**Depends on:** SOVEREIGN_STORAGE_SOP_v1.0.md

---

## Governing Principle

**Retrieval quality is determined at ingestion, not at query.**

If the corpus is mixed, unfinished, contradictory, or emotionally unprocessed, no prompt engineering or vector tuning will fix the felt quality of MAIA's responses. The corpus is not a storage location. It is MAIA's epistemic field.

Everything placed in `/data/oracle-corpus` becomes:
- Retrievable
- Weight-bearing in responses
- Part of MAIA's voice
- Part of the psychological environment members experience

**Design priority: Coherence > completeness**

---

## 1. The Three Knowledge States

This distinction prevents accidental contamination of the retrieval layer.

### State 1 — Working (Hot)

**Location:** `~/Obsidian/Soullab-Vault` and active project folders

Characteristics:
- Drafts
- Exploratory thinking
- Contradictions
- Emotional processing
- Unfinished frameworks

**Never indexed.** This is the exploration layer. Contradiction and incompleteness are healthy here.

### State 2 — Curated (Cold)

**Location:** `/data/oracle-corpus`

Criteria:
- Conceptually stable
- Emotionally integrated
- Aligned with the current model
- Safe to influence MAIA responses

**This is the only indexed layer.**

### State 3 — Archive

**Location:** `/data/archive`

For:
- Deprecated models
- Outdated frameworks
- Historical material you want to keep but not propagate

**Never indexed.** Archive material is for human reference only.

---

## 2. Inclusion Criteria

A document belongs in `/data/oracle-corpus` if it is:

- **Stable** — unlikely to change substantially
- **Coherent** — internally consistent
- **Endorsed** — you stand behind it as current understanding
- **Signal-dense** — teaches something; not just notes
- **Safe if surfaced unexpectedly** — would not confuse or mislead if retrieved mid-conversation

**Practical test:** *If you would give this to a student as teaching material, it can enter the corpus. Otherwise, it stays in the working layer.*

Examples that qualify:
- Final book chapters
- Teaching frameworks
- Completed course material
- Mature essays
- Refined model descriptions
- Ritual language and practice guides

---

## 3. Exclusion Criteria

Do not include:

- Daily notes
- Journals and personal processing material
- Brain dumps
- Idea fragments
- Contradictory drafts
- Research you haven't metabolized
- Raw PDFs you haven't evaluated
- Material you are actively revising

**Why:** Raw material creates semantic noise and leads to scattered MAIA responses, inconsistent voice, cognitive density spikes, and loss of presence quality. There is no retrieval-time fix for ingestion-time noise.

---

## 4. Corpus Organization

```
/data/oracle-corpus
  /core-frameworks        ← Spiralogic, AIN, elemental model
  /books                  ← Final or near-final manuscript sections
  /teachings              ← Completed course and teaching material
  /rituals-practices      ← Ritual language, ceremony guides
  /psychology             ← Depth psychology frameworks MAIA works with
  /research-curated       ← Research you have metabolized and endorse
  /voice-tone-examples    ← Reference material for MAIA's voice and register
```

Keep this structure stable. Future indexing pipelines depend on predictable paths, and weighting (see Corpus Weighting Schema) is applied at the folder level.

---

## 5. Promotion Workflow

Nothing enters the corpus automatically. The path is always:

```
Working (hot vault)
    ↓  [review: is this stable, coherent, endorsed?]
_corpus-ready/ folder in Obsidian
    ↓  [Syncthing]
/data/oracle-corpus on MinisForum
    ↓  [indexing job, when retrieval is enabled]
PostgreSQL
    ↓
MAIA retrieval
```

The `_corpus-ready/` folder in the Obsidian vault is the explicit promotion gate. Moving a document there is a deliberate act, not an automatic sync. This keeps the curation discipline in the workflow rather than in a policy document no one reads.

---

## 6. Retrieval Philosophy

MAIA should retrieve:
- Fewer documents
- Higher signal
- Emotionally coherent material

Not:
- Everything that matches a keyword
- All material tagged with a theme
- The most recent thing that touched a topic

This keeps Field responses calm, consistent, and psychologically grounded. **When in doubt, retrieve less.**

---

## 7. Failure Modes This Prevents

**Without corpus curation:**
- MAIA contradicts itself across sessions
- Tone shifts unpredictably
- Responses become analytical instead of present
- Long retrieval blocks increase Field latency
- "Knowledge density creep" — responses get denser but less clear

**With corpus curation:**
- MAIA feels intentional, coherent, and trustworthy
- Voice remains stable across topics
- Field regulation arc is supported rather than disrupted by retrieval

---

## 8. Governance Rule

> If corpus quality drops, reduce retrieval — do not expand it.

Never compensate for noise with more retrieval. More retrieval from a noisy corpus amplifies the problem. The correct response to degraded response quality is to audit the corpus, not to tune the query.

---

## 9. The Isomorphism

This mirrors the Storage SOP and MAIA's data layer:

| Layer | Principle |
|---|---|
| Working vault | Exploration allowed, contradiction healthy |
| `_corpus-ready/` folder | Explicit curation gate |
| `/data/oracle-corpus` | Curated boundary — only stable, endorsed material |
| Indexing pipeline | Only curated knowledge enters retrieval |
| Field experience | Calm, coherent presence |

Same pattern everywhere: **exploration inside, curation at the boundary, stability in the field.**

The corpus design is not a technical decision. It is a relational one. What MAIA retrieves shapes what members experience. Curation is the act of deciding what kind of presence MAIA is.
