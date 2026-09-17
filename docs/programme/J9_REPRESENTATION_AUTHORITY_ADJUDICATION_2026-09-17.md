# FOUNDER ADJUDICATION — J9 REPRESENTATION AUTHORITY

**Status:** RULED by founder act 2026-09-17. Documentary corrections applied in this commit.
**Canon produced:** `docs/canon/REPRESENTATION_AUTHORITY_LAW.md`
**Gate:** J9 at **J4**. ⛔ Implementation NOT authorized. ⛔ No predicate repair authorized.

---

## 1. Interface Humility — RETAINED, not widened

**RULING: retain `INTERFACE_HUMILITY.md` in its present doctrinal scope.**

The two doctrines overlap and do not govern the same referent:

- **Interface Humility** — *how* representations are held (epistemic/relational posture).
- **Representation Authority** — *what* representations may do (governed authority).

Interface Humility is **neither withdrawn, nor broadened into a general computational law, nor reduced to an
implementation-specific child of the new law.** Widening it would have saved one canonical document at the
cost of making a relational/epistemic doctrine carry system-governance machinery it was never designed to
carry.

⚠️ **My "genus / person-facing species" framing is withdrawn** — it performed exactly the reduction this
ruling forbids. Corrected in the law at §2.

## 2. Rename — RULED

`AIN_REPRESENTATION_LAW.md` → **`REPRESENTATION_AUTHORITY_LAW.md`** (structural `git mv`; heading changed).

Representation is not the constitutional problem; a representation *silently acquiring authority* is. The
`AIN` prefix is dropped: the law governs all six convergent lanes, and **J9 is its proving ground, not its
semantic boundary.**

## 3. Canonical formulation — narrowed to authority

Recorded verbatim in the law §1. Descriptive by default; authority requires **a governed grant AND a failing
attestation**. Computation, presentation, similarity, salience, classification and table membership grant
nothing.

## 4. Defeater — RATIFIED

**Substitution → Grant → Attestation**, in that order, recorded at law §3. The law is not complete without it.

## 5. Authority classes — three, ratified

**DESCRIPTIVE** (default) · **SELECTIVE** (may narrow a valid candidate set under explicit governed
authorization) · **AUTHORITATIVE** (may establish or alter governed state). Promotion is never inferred from
usefulness, accuracy, confidence, salience, convenience or repeated use.

⚠️ **Vocabulary collision recorded, not silently merged:** `J8-R3 §VII` carries a **four**-class taxonomy on
the same axis (AUTHORITATIVE / DERIVED-GOVERNED / DESCRIPTIVE / EXPERIMENTAL). `DERIVED-GOVERNED` ≠
`SELECTIVE` on its face, and `EXPERIMENTAL` has no counterpart in the ratified three. R4's rule — one
canonical term, one canonical referent — makes the reconciliation **owed before either reaches
implementation.**

---

## 6. `RetrievalService.ts` — PRESENTLY NON-CONFORMING (evidence preserved)

`lib/ain/knowledge/RetrievalService.ts`, `retrieveKnowledge()`. Four authority-bearing substitutions:

| # | Predicate | The authority-bearing act |
|---|---|---|
| 1 | `WHERE embedding IS NOT NULL` | **Representation availability has become eligibility.** The existence of a computed representation determines whether otherwise-valid corpus material exists for retrieval. |
| 2 | `domain = ANY(...)` | A classification label participates directly in **inclusion and exclusion**. The label is therefore not merely descriptive. |
| 3 | `categories && ...` | A **second** representation independently participates in inclusion and exclusion. Descriptive metadata has become an operative gate. |
| 4 | `similarity >= 0.3` | **A ranking representation becomes an existence boundary.** Material below threshold is not ranked lower — it disappears from the candidate set. Ranking presently participates in eligibility. |

### 7. The deeper defect precedes all four

The function begins from `ain_knowledge_chunks` **as though presence in that table already establishes corpus
authority.** The read path does not first establish

```text
source identity → admission → rights authority → eligible corpus
```

before applying retrieval selection. **There is no authority-plane join establishing those conditions.
Table membership presently substitutes for corpus authority.**

⭐ **This is the deepest J9 finding.**

⚠️ It is presently **non-operative rather than harmlessly correct**: the J6 production witness establishes
**zero rows** and Elemental Alchemy ingestion remains **CLOSED**. That production state prevents present
corpus exposure. **It does not make the retrieval architecture conforming.**

### 8. F2 is a valid falsification witness

`alchemy` appears within category filters but **not within the mode domain sets**. A legitimate chunk whose
domain representation changes to `alchemy` becomes unretrievable in every present mode, while source, content,
checksum and rights state remain unchanged. That is exactly what SUBSTITUTION is built to expose: *the
represented thing remains constant; changing the representation changes authoritative visibility.*

⛔ **This does not prove** that any present EA chunk is so classified. **It proves the architecture permits
descriptive taxonomy to determine corpus existence.**

### 9. Q3 surviving is architecturally significant

Content identity survived falsification because **J6 sealed it independently of retrieval representation.**
That is not incidental — it demonstrates the correct direction. Ranking, embedding model, taxonomy, labels and
retrieval strategy may all change; none may silently rewrite what source was admitted, what content belongs to
it, who holds rights, whether it is authorized, or its canonical identity. **This supports the proposed digest
and authority separation.**

### 10. ⛔ No predicate repair authorized

- Removing `embedding IS NOT NULL` without establishing candidate-generation behavior **converts exclusion
  into failure.**
- Removing domain/category restrictions before establishing corpus authority **replaces wrongful selection
  with indiscriminate selection.**
- Removing the similarity threshold without specifying the ranking boundary **merely moves the ambiguity.**

Order stands:

```text
authority plane → valid candidate corpus → governed selection → ranking → presentation
```

> Representation must never manufacture authority upstream.

### 12. J8 custody gap

**J8-R1 and J8-R2 remain NOT IN CUSTODY.** ⛔ Not reconstructed · ⛔ not paraphrased from memory · ⛔ not cited
as support for this ruling. This law is adjudicated from evidence actually in custody: **J6** and the
**directly inspected runtime architecture**. ⛔ **No claim of J8 reconciliation is permitted until those
records are recovered.**

---

## 13. Gate disposition

`d577d1b0` was documentation-only. This commit applies the six required documentary corrections:

| # | Correction | Status |
|---|---|---|
| 1 | structural rename to Representation Authority Law | ✅ `git mv` + heading |
| 2 | formulation narrowed to authority, not representation generally | ✅ law §1 |
| 3 | Interface Humility retained, not widened; species framing withdrawn | ✅ law §2 |
| 4 | Substitution → Grant → Attestation recorded as operative defeater | ✅ law §3 |
| 5 | live `RetrievalService` findings preserved as non-conformance evidence | ✅ §6–§9 above; J8-R3 record retained |
| 6 | J8 custody gap explicit | ✅ §12 above; law carries no J8-R1/R2 citation |

**J9 J4 may close on this record.**

### The next act

⛔ **Not predicate repair.** The next act is to **specify the authority-plane contract that must be true
before retrieval is allowed to decide among corpus material at all.**

> Before asking *"which knowledge is relevant?"*, the system must know *"which knowledge is legitimately
> here?"*

Admission and rights establish the corpus; selection operates only inside that corpus; ranking orders only
inside that selection. **No score, embedding, taxonomy or regex gets to smuggle itself upward into authority.**

---

## Standing

```text
REPRESENTATION AUTHORITY LAW   CANON · scope general · J9 is proving ground, not boundary
INTERFACE HUMILITY             RETAINED in present scope · independently authoritative
DEFEATER                       RATIFIED — Substitution → Grant → Attestation
CLASSES                        3 ratified · ⚠️ 4-class J8-R3 §VII collision OWED
RetrievalService               ⛔ NON-CONFORMING · 4 substitutions · authority plane ABSENT
F2                             VALID FALSIFICATION WITNESS (architectural, not instance)
J8-R1 / J8-R2                  ⛔ NOT IN CUSTODY · not reconstructed · not cited
PRODUCTION                     0 rows · EA ingestion CLOSED · UNTOUCHED
J9                             J4 MAY CLOSE ON THIS RECORD
IMPLEMENTATION                 ⛔ NOT AUTHORIZED · ⛔ NO PREDICATE REPAIR
NEXT ACT                       authority-plane contract specification
```
