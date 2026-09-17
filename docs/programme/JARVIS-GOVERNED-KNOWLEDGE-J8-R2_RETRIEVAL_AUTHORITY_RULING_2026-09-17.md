# JARVIS Governed Knowledge Flow · J8-R2 · Retrieval Authority & Representation Contract

**Date:** 2026-09-17
**Status:** FOUNDER DESIGN RULING — recorded, not implemented
**Input:** J8-R1 retrieval census `ae59f880`, pinned to sealed J6 state `97c7d946`
**Class:** documentary. No source, schema, migration, route, digest, or production state changed.
**Implementation:** ⛔ NOT AUTHORIZED · **Production:** UNTOUCHED

## Governing sentence

> **Authorization decides what knowledge may belong. Content identity proves what it is.
> Representation describes it. Retrieval decides when it may be used.
> No one of those authorities may silently impersonate another.**

---

## 0. The six terms, fixed

The lane has until now used one word — *knowledge* — for six different authorities. They are separated
here, and every later act in this lane must name which one it is touching.

| Term | Definition | Where it lives at `97c7d946` | Who may decide it |
|---|---|---|---|
| **Corpus authority** | May this material belong to MAIA's knowledge universe at all | `data/ain/corpus-admission.json`, `lib/corpus/admission.ts`, `docs/corpus-authority/elemental-alchemy.md` | rights-holder + governed admission act |
| **Content identity** | Are these the exact governed chunks of the exact admitted source | `EA_INGEST_CONTRACT.sourceSha256`, `chunkSetDigest()` (`lib/corpus/eaIngestContract.ts:54`) | sealed at J6; ⛔ not reopened here |
| **Representation metadata** | Derived description of admitted material | `classifySource()` → `domain`, `categories` (`lib/ain/knowledge/ChunkingService.ts:84`) | a classifier — **derived, never authoritative** |
| **Retrieval eligibility** | May this governed chunk become a candidate | today: `WHERE embedding IS NOT NULL` + `domain`/`categories` (`lib/ain/knowledge/RetrievalService.ts`) | governed source admission (R3) |
| **Retrieval behavior** | Which candidates are actually returned, in what order, under which mode | `MODE_FILTERS`, `minSimilarity`, `limit`, ordering | a governed retrieval contract (R3 docket) |
| **Behavioral attestation** | Proof that retrieval behavior has not silently changed | **does not exist** | R4 — a *separate* digest |

⭐ The J8-R1 defect stated in this vocabulary: **representation metadata is currently exercising
retrieval eligibility, and content identity is being read as evidence for retrieval behavior.**

---

## R1 — The canonical route receives a governed retrieval seam, eventually, and not the current reader

**Ruled: YES — but not `retrieveKnowledge` as constituted.**

`app/api/sovereign/app/maia/list/route.ts` → `getMaiaResponse` must ultimately consume **one governed
retrieval facade**, never a table-specific reader whose eligibility semantics are accidental.

Target:

```
canonical MAIA turn → governed knowledge facade → authority / corpus eligibility
   → candidate retrieval → representation / ranking → bounded knowledge result
```

The facade exists to make retrieval policy **inspectable and singular**. The quiet-path readers found by
R1 — `lib/consciousness/maiaOrchestrator.ts:478`, `app/api/ain/knowledge/route.ts`, and the J6-gated
`LibraryService` path reached from `/api/oracle/conversation`, `LibraryOfAlexandria`, `lib/maia/use-frames`
— should eventually converge on the same authority rather than leaving several incompatible definitions of
*knowledge available to MAIA*.

⛔ **No convergence work is authorized in R2.** ⛔ No seam is wired.

## R2 — `domain` and `categories` are not corpus authority

They arise from regex over filename plus the first 5,000 characters. They are **derived representations**.

> **An admitted and authorized source must not become unavailable merely because an ungoverned classifier
> called it the wrong thing.**

Elemental Alchemy neither gains nor loses corpus standing because `/alchemy/i` meets the `jungian` branch
of `DOMAIN_PATTERNS` before any other. Default `talk` eligibility must not depend on whether the opening
5,000 characters satisfy one of five unrelated category patterns.

## R3 — Eligibility derives from governed source admission, not classifier output

Ruled direction:

```
governed source authority → admitted chunk membership → retrieval candidate
```

⛔ Not: `chunk row → regex-derived labels → eligibility`.

A chunk is potentially retrievable because its source is governed and admitted, its identity matches the
admitted authority, it belongs to the governed chunk set, and scope permits the read — **not** because
`domain == expected && categories && modeCategories`.

Derived metadata may assist explanation, organization, optional separately-governed facet filtering, or
ranking. It may not silently decide whether the item exists for retrieval.

⛔ **Do not duplicate corpus authority into independently editable per-chunk classifier labels.** This
also forecloses the obvious shortcut — an `authorized boolean` on the chunk row — which is the prohibited
shape this programme has refused before.

**⚠️ See §C1: the four-part binding is not constructible against `ain_knowledge_chunks` today.**

## R4 — Do not widen the sealed `chunkSetSha256`

`chunkSetDigest()` covers `{sourceFile, chunkIndex, sha256(chunkText)}`. That it omits `domain`/`categories`
is **not itself the defect**. The defect is treating a content digest as though it also proved retrieval
behavior.

> **Preserve the sealed content identity. Add a separate behavioral/representation attestation for anything
> capable of changing retrieval behavior.**

Redefining `chunkSetSha256` would make a later representation-policy change retroactively alter what the
J6 seal meant, and would invalidate the sealed EA identity `87b0cbaa076cdb6d374597b75fb652ac87313b1eda1ad87fce4a8490cf61d852`.
⛔ Refused.

A second attestation — conceptually `retrievalRepresentationDigest` / `retrievalPolicyDigest`, **name not
authorized** — must bind every governed input whose silent change could alter candidate eligibility, source
inclusion, mode-based availability, retrieval filtering, or deterministic representation-dependent ordering.

If `domain`/`categories` remain capable of affecting returned results, their operative representation is
covered by that attestation. If they become purely descriptive with no retrieval effect, they need not
touch content identity at all.

## R5 — Mode must not become covert corpus authority

Mode may shape posture, prompt composition, the kind of supporting material wanted, ranking preference, and
explicitly governed retrieval facets. It may not make an admitted item disappear because an accidental
classifier failed to emit the category that mode expects.

Mode-specific knowledge subsets, if genuinely needed, require an explicit governed representation contract —
⛔ never reconstruction from filename regexes or incidental opening-text matches.

> **Mode can shape retrieval. Mode cannot silently redefine admission.**

## R6 — Derived classification must identify itself as derived

Wherever `classifySource()` or a successor survives, its output must carry no ambiguous standing: an
*authorized source fact* and a *derived classifier representation* must not be confusable by any downstream
consumer.

Provenance shape (classifier identity, version, derivation basis) is ⛔ not authorized here — R2 authorizes
no schema. The law is sufficient:

> **Derived representation never impersonates corpus authority.**

## R7 — Two independent attestation questions

- **Question A — Content.** *Are these still the exact chunks belonging to the exact authorized source?*
  Answered by the sealed source/chunk identity chain.
- **Question B — Behavior.** *Has anything changed that can alter which governed chunks MAIA can actually
  retrieve, or how representation policy filters them?* Answered by the separate attestation of R4.

⛔ **A PASS on Question A must never be presented as evidence for Question B.** That is precisely the
defect J8-R1 exposed.

## R8 — Required falsifier

The eventual repair must carry a falsifier built to kill a system that stays green while retrieval behavior
changes. Controlled subject: the admitted Elemental Alchemy corpus. Mutation class:

```
source bytes · sourceSha256 · chunk text · chunkSetSha256 · governed admission   UNCHANGED
classifier pattern order  |  derived domain/categories  |  mode filter representation   CHANGED
```

Exactly two legitimate outcomes:

- **Outcome A** — metadata non-authoritative: EA's governed candidate eligibility **does not change**.
- **Outcome B** — representation legitimately affects retrieval: the separate representation/retrieval
  attestation **must turn red before the changed behavior can be accepted**.

Prohibited, and the mutant that must die:

```
retrieval behavior changes  +  all attestations remain green
```

## R9 — Default-mode Elemental Alchemy witness

When repair is authorized, the evidence must prove the **authority path**, not a lucky query:

```
governed source admitted → eligible governed chunks exist
   → canonical retrieval facade can retrieve them → source/provenance remains attributable
```

It must not depend on accidental `jungian` / `alchemy` classification for admission. ⚠️ This witness
presumes EA chunks exist in production, which is **founder-held standing (J7), not repository truth** — see
R12 and §C4.

## R10 — No canonical-route seam before representation governance

J8-R1's sequencing recommendation is **ratified**. ⛔ Do not wire
`/api/sovereign/app/maia/list → retrieveKnowledge` and govern it afterward; that exposes every canonical
member turn to eligibility semantics already known to be accidental.

```
J8-R1 census → PASS → J8-R2 authority + representation ruling → J8-R3 bounded retrieval contract / repair design
   → falsification → governed reader witness → only then canonical MAIA seam
```

## R11 — J6 remains sealed

Nothing here reopens the J6 authorization decision or the sealed EA content identity. J8 governs **how
authorized knowledge becomes retrievable**; it does not re-decide **whether** Elemental Alchemy is
authorized. This separation is load-bearing.

## R12 — Repository-history discipline

Repository truth for this programme ends at sealed J6 plus J8-R1. ⛔ J7 and any prior J8 findings are **not**
to be manufactured as repository history from founder-held summaries, and ⛔ nothing is backdated or
represented as a previously sealed tranche. Founder-held findings may be cited **as founder context,
labelled as such**. J8-R1 remains the first repository-held J8 record.

---

## Contradictions returned for founder adjudication

These arose from reconciling the ruling against exact repository symbols. ⛔ None is repaired here.

### ⚠️ C1 — R3's four-part binding is not constructible against `ain_knowledge_chunks` today

The J6 Library gate was buildable without schema because `library_sources` already carried the columns it
needed. `ain_knowledge_chunks` does not:

| R3 requires | `library_sources` (J6) | `ain_knowledge_chunks` (`20260107000004`) |
|---|---|---|
| admitted repository path | `file_path` ✅ | `source_file` = **bare filename only** ⚠️ |
| source byte identity | `checksum` ✅ | **no checksum column** ❌ |
| scope exclusion | `practitioner_member_id`, `field_slug` ✅ | **no scope columns** ❌ |

Consequences:

1. **Identity can be bound only by name.** `EA_INGEST_CONTRACT` writes `sourceFile` as the bare filename,
   while `sourcePath` (`data/ain/source/…`) is never persisted. A read gate can therefore assert *a row
   claiming this filename* — ⛔ not *a row derived from these authorized bytes*. Two files of the same name
   in different directories are indistinguishable at the read boundary.
2. **Scope is safe by absence, not by construction.** No scoped rows can exist because no scope column
   exists. That is a true statement about today and ⛔ not a structural guarantee.
3. **R3 forecloses the cheap repair.** An `authorized` column, or copying admission facts onto the chunk
   row, is exactly the duplication R3 prohibits.

⭐ **One non-schema route exists and is named, ⛔ not chosen:** `chunk_text` is persisted, so per-row
membership in the governed chunk set is *recomputable at read time* by hashing it against the frozen digest
material. That binds content, not provenance, and its cost is per-query hashing. **Whether R3's binding is
achieved by derivation-at-read, by a governed identity column, or by a narrower claim than four-part
binding, is a founder decision owed to R3.**

### ⚠️ C2 — R4's second attestation has no stable input set while the classifier is in-tree

`retrievalRepresentationDigest` must bind "every governed input whose silent change could alter" behavior.
At `97c7d946` those inputs are **source code**, not data: `CATEGORY_PATTERNS`, `DOMAIN_PATTERNS`, their
iteration order, `MODE_FILTERS`, and the `minSimilarity`/`limit` defaults. A digest over source text is
brittle (any comment edit reds it); a digest over *evaluated output* requires the classifier to be run
against a fixed corpus to have anything to hash. **R3 must rule what the attestation's subject is: the
policy source, its evaluated output over the admitted corpus, or a declared policy artifact that replaces
the in-tree tables.** The third makes the digest natural and is, on the evidence, the only one whose red
means what R8 needs it to mean — ⛔ recommended, not taken.

### ⚠️ C3 — R1's convergence target and R5 are in tension on the quiet path

`retrieveKnowledge`'s mode filtering is what R5 forbids; but `MODE_FILTERS` is live today on
`/api/between/chat`. Governing eligibility per R3 without also ruling that path's mode behavior would leave
the same defect running at a lower volume. ⛔ R2 authorizes no change there. **R3 should state whether the
governed contract is adopted by quiet readers in the same act, or whether `/api/between/chat` runs
knowingly ungoverned until the canonical seam lands.** Leaving it unnamed is how a known defect becomes
permanent.

### ⚠️ C4 — R9's witness depends on standing the repository does not hold

The J6 record states EA production ingestion is CLOSED and `ain_knowledge_chunks` is 0 rows. J7 is
founder-held. R9's witness is unrunnable against repository truth alone, and per R12 that gap must not be
closed by assumption. **R3 should state whether the governed reader witness runs against a disposable
shadow with a locally ingested EA, or waits on a production read that is separately authorized.**

---

## Required next-design docket — R3

**The question R3 exists to answer:**

> What is the single governed retrieval contract that both the current quiet readers and the eventual
> canonical MAIA seam should consume?

R3 specifies **interface and evidence contract before any application code changes**. Minimum it must settle:

1. The facade's typed boundary — what a caller may ask for, and what it may never pass (⛔ no
   caller-supplied eligibility, per the S3 precedent that client-supplied authority is refused at the type
   level).
2. **C1** — how source/chunk identity binds without duplicating corpus authority onto the chunk row.
3. **C2** — the subject of the behavioral attestation.
4. **C3** — whether quiet readers converge in the same act.
5. **C4** — where the R9 witness runs.
6. The R8 falsifier's shape, and the defeat candidate it must kill: *a facade that governs eligibility
   correctly and still lets `MODE_FILTERS` silently exclude an admitted source.*

---

## Containment

⛔ No change to `/api/sovereign/app/maia/list` · `getMaiaResponse` · `retrieveKnowledge` · `classifySource` ·
`MODE_FILTERS` · `ain_knowledge_chunks` · `library_sources` · corpus admission · digest computation · schema ·
migrations · production.

**Standing: J8-R2 RULED AND RECORDED · SIX AUTHORITIES SEPARATED · J6 SEAL INTACT · `chunkSetSha256` NOT
WIDENED · FOUR CONTRADICTIONS RETURNED · R3 DOCKET SET · ⛔ R3 NOT OPENED · ⛔ IMPLEMENTATION NOT AUTHORIZED ·
⛔ NO CANONICAL SEAM · PRODUCTION UNTOUCHED.**
