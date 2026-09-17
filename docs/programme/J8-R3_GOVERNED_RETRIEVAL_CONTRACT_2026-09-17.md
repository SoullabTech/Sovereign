# JARVIS-GOVERNED-KNOWLEDGE-FLOW-01 · J8-R3 — Governed Retrieval Contract

**Status:** CANDIDATE DESIGN CONTRACT (founder-authored). Recorded verbatim in substance.
**Implementation:** ⛔ NOT AUTHORIZED. No schema, no facade, no reader migration, no seam.
**Parent:** J8-R2 Retrieval Authority & Representation Contract
**In custody here:** `docs/programme/JARVIS-GOVERNED-KNOWLEDGE-J6_BOUNDARY_2026-09-17.md`

---

## §0 — Custody note

⚠️ **J8-R1 and J8-R2 are NOT in this repository.** R3 names them as parents; neither is present. This is the
same parallel-session custody gap recorded in `MAVEN-CUSTODY-01_RECONCILIATION_2026-09-17.md`, now observed a
second time. ⛔ Neither reconstructed. **J6 IS in custody** and is cited below as the production-state witness.

⭐ This record therefore does two things: it lands R3's contract, and it **tests R3 against the live reader**
rather than accepting its premises. The test is the part R3 could not do for itself.

---

## §1 — The contract (as authored)

> A retrieval system must be able to explain why a source was eligible, why a result was selected, what
> representation influenced the selection, and which authority permitted the use.

```text
AUTHORIZED CORPUS → SOURCE ELIGIBILITY → CHUNK MEMBERSHIP → REPRESENTATION
   → CANDIDATE GENERATION → RANKING → USE POLICY → BOUNDED RESULT
```

Each stage inspectable. Load-bearing sub-laws: authority precedes ranking · `embedding present ≠ authorized`
and `embedding absent ≠ unauthorized` · candidate generation may narrow the search space but may not redefine
corpus authority · retrieval and use are separate · representation is classified **AUTHORITATIVE /
DERIVED-GOVERNED / DESCRIPTIVE / EXPERIMENTAL** and regex-derived `domain`/`categories` may not silently
occupy the first class.

**Governing sentence:**

> Governed retrieval begins with authority, not similarity. Representation helps MAIA find knowledge; it does
> not decide what knowledge is allowed to exist.

---

## §2 — ⭐⭐ CONFORMANCE WITNESS — the live reader violates R3 four times in one function

`lib/ain/knowledge/RetrievalService.ts` (290 lines), `retrieveKnowledge()`. The query it builds:

```sql
SELECT id, source_title, source_file, chunk_text, domain, categories,
       1 - (embedding <=> $1::vector) AS similarity
FROM ain_knowledge_chunks
WHERE embedding IS NOT NULL                       -- (a)
  AND domain = ANY($n)                            -- (b)
  AND categories && $n                            -- (c)
  AND 1 - (embedding <=> $1::vector) >= $n        -- (d)
ORDER BY embedding <=> $1::vector
LIMIT $n
```

| # | Clause | R3 stage violated | What it actually does |
|---|---|---|---|
| a | `WHERE embedding IS NOT NULL` | §VI | **A missing embedding IS corpus exclusion.** R3's F4 is not hypothetical — it is the first line of the WHERE. |
| b/c | `domain = ANY` · `categories &&` | §VII | The **regex-derived labels are OPERATIVE**, gating eligibility. They are in the AUTHORITATIVE class today, by default and without a ruling. |
| d | `similarity >= minSimilarity` (default `0.3`) | §IX | A **ranking score used as an eligibility filter**. R3 warns that higher score must not become higher authority; here **lower score becomes non-existence.** |

### ⭐ And the deepest finding, which R3's stage list surfaces but does not name

**Stages 1 and 2 are absent entirely.** The query has no join to `library_sources`, no admission-state
predicate, no rights-holder check, no scope check. **Corpus authority is not enforced — it is assumed by table
membership.** Everything in `ain_knowledge_chunks` is implicitly authorized.

⚠️ This is currently harmless **only because production is empty**: the J6/J5 witness records
`ain_knowledge_chunks: 0 rows / 0 sources` and EA production ingestion **CLOSED**. ⭐ That makes this the
right moment — the architecture has not yet had the chance to treat table membership as authority for a single
real row.

### §2a — F2 confirmed statically, with a concrete prediction

R3's F2 mutates Elemental Alchemy's `domain` from `jungian` to `alchemy`, source and chunks unchanged.

Repository truth: in `MODE_FILTERS`, the seven `domains` arrays are `therapeutic · somatic · jungian ·
consciousness · philosophy · divination`. **`alchemy` appears ONLY in `categories`, never as a domain.**

⭐ **Therefore F2's mutation makes Elemental Alchemy unretrievable in EVERY mode** — the domain filter excludes
it before the category filter is consulted — **with no change to source identity, chunk set, checksum, rights
authority or admission state.** The corpus would be intact and invisible.

⛔ Not executed against data (production has no rows); established from source. **F2 needs no new instrument —
it needs a row.**

---

## §3 — Disposition of the falsification classes

| Class | Standing against the live reader |
|---|---|
| F1 classifier reorder | ⛔ would **silently change canonical behavior** — classifier is operative and unattested |
| F2 category mutation | ⛔ **CONFIRMED statically** (§2a) — silent, total exclusion |
| F3 mode filter removal | ⛔ operative; no attestation would move |
| F4 embedding deletion | ⛔ **CONFIRMED by clause (a)** — deletion reads as ungoverned |
| F5 unauthorized source injection | ⛔ **no authority stage exists to refuse it**; admission is table membership |
| F6 authorized misclassification | ⛔ representation error **does** erase retrievability (§2a) |
| F7 ranking manipulation | ⛔ no ranking-policy version exists to expose the change |

**7 of 7 would fail today.** ⭐ R3 is not over-engineered for its subject; it is under-built relative to it.

---

## §4 — R3's acceptance questions, answered against the CURRENT system

R3 §XXIX asks these of the future design. Answered against what exists:

| # | Question | Today |
|---|---|---|
| 1 | Authorized source retrievable if a derived classifier changes? | ⛔ **NO** (§2a) |
| 2 | Unauthorized source retrievable solely through ranking? | ⛔ **Unrefusable** — no authority stage |
| 3 | Content identity sealed while retrieval policy evolves? | ✅ yes — J6 digest is independent |
| 4 | Behavior-changing policy changes visible? | ⛔ **NO** — no behavioral attestation exists |
| 5 | Canonical route consumes retrieval without table internals? | ⛔ no facade |
| 6 | Provenance explains authority *and* representation? | ⛔ neither is returned |

⭐ **Only #3 passes — and it passes because J6 already did its work.** That is the evidence that the
content/behavior digest split R3 §XVIII insists on is the correct architecture: the one question that survives
is the one a prior tranche sealed.

---

## §5 — Reader census (R3 §XXII classes, advisory only)

Six TypeScript readers touch `ain_knowledge_chunks`:

| Reader | Class (proposed) |
|---|---|
| `lib/ain/knowledge/RetrievalService.ts` | **LEGACY** — behavior differs on four counts; the migration subject |
| `lib/ain/knowledge/ChunkingService.ts` | ADAPTER — writes `categories` (`:90`); representation producer, not reader |
| `lib/corpus/eaIngestTransaction.ts` | CONFORMING — governed ingestion, J5/J6 lineage |
| `scripts/embed-ain-knowledge.ts` | ADAPTER — representation producer |
| `lib/corpus/__tests__/*` (2) | test custody, not readers |

⭐ **Exactly one legacy reader.** ⛔ Do not force convergence before understanding why each exists (R3 §XXII).
The classifier itself lives partly in `lib/library/spiralogicTagger.ts` (`detectDomain`, regex `domainPatterns`)
— **a different module from the one that consumes its output**, which is how the label acquired authority
without anyone granting it.

---

## §6 — What this record does NOT do

⛔ No facade · no interface · no table · no digest algorithm · no embedding model · no ranking algorithm ·
no ruling on whether `domain`/`categories` survive · no reader migrated · no seam on the canonical route ·
no repair of the four violations · production untouched (and empty).

⭐ The four violations are **reported, not repaired**, for R3's own reason: repairing `WHERE embedding IS NOT
NULL` without a candidate-generation alternative converts exclusion into an error, and repairing the domain
filter without an authority stage converts a wrong filter into no filter. **The stages must arrive in order.**

---

## Standing

```text
J8-R3                  CANDIDATE CONTRACT RECORDED
J8-R1 / J8-R2          ⛔ UNRESOLVED CUSTODY (second occurrence of the parallel-session gap)
J6                     ✅ IN CUSTODY — cited as production witness
LIVE CONFORMANCE       ⛔ 4 violations in one function · stages 1–2 ABSENT
F1–F7                  ⛔ 7 of 7 would fail today · F2 CONFIRMED statically
ACCEPTANCE Q1–Q6       1 of 6 passes (Q3, by J6's prior work)
PRODUCTION CORPUS      0 rows / 0 sources · EA ingestion CLOSED
IMPLEMENTATION         ⛔ NOT AUTHORIZED
```
