# Elemental Alchemy as Governed Knowledge Source — Bounded Specification

**Date**: 2026-07-27
**Status**: CONDITIONALLY APPROVED (Kelly, 2026-07-27) — this revision incorporates the three required corrections (null-safe ratified SQL scoping · concrete semantic consultation mechanism · structured testable response provenance). Awaiting ratification. **Implementation boundary remains CLOSED.**
**Ruling basis**: Kelly's rulings of 2026-07-27 (session record). Durable principle:

> **MAIA may know the book, but must always know that it is a book — and whose book it is.**

## 1. What this is and is not

Elemental Alchemy (Kelly Nezat) becomes a **governed MAIA knowledge source** — a distinct class, different in kind from:

- **Member memory** — a particular person's lived continuity;
- **General Library** — external traditions and reference works (John of the Cross, von Franz, Burckhardt, …).

It is founder-authored source material that partly defines MAIA's own elemental language. Greater authority inside the system → more explicit provenance and more restraint, not less.

**Not in this slice**: any surfacing to members other than Kelly; any change to `/book/ask` or `/book/companion`; any reclassification of the existing messy EA-adjacent library sources (curation is a separate task); any new retrieval pipeline.

## 2. Architecture decision (per ruling)

Reuse the **Library retrieval infrastructure** (`lib/library/LibraryService.ts` — semantic search over `library_chunks` with pgvector + Ollama embeddings). Do **not** add an `AskTheBookService` branch to the conversation route unless the Library substrate proves insufficient. One retrieval pipeline; no second hidden route by which MAIA acquires knowledge.

### 2.1 Source class

New `library_sources.type` value: **`founder_authored_canon`** — **RATIFIED by Kelly 2026-07-27**. The name is explicit and does not falsely imply that every founder utterance is canonical: canon status attaches only to deliberately ingested and ratified works.

The existing schema already carries what we need — **no new columns required**:

| Existing column | Use for this class |
|---|---|
| `type` | `founder_authored_canon` |
| `practitioner_member_id` | Kelly's member UUID → author scoping (see §4) |
| `title` / `author` / `meta` | Exact book title, author, **edition**, publication year, ISBN in `meta` |
| `review_status` / `ratified_at` / `ratified_by` | Kelly ratifies the ingested source before it becomes retrievable |
| `checksum` | Integrity of the authoritative manuscript file |
| `consent_required` / `consent_granted` | Set granted-by-Kelly at ingestion (he is the author) |

Gate: a `founder_authored_canon` source is retrievable **only when `review_status` is ratified**. Ingestion alone does not make it live.

### 2.2 Chunk provenance (per ruling — every retrieved passage preserves)

Stored in `library_chunks.meta` (jsonb), required keys for this source class:

```json
{
  "book": "Elemental Alchemy: The Ancient Art of Living a Phenomenal Life",
  "edition": "<edition string>",
  "chapter": "<chapter number + title>",
  "section": "<section heading, if any>",
  "passage_id": "EA1.<ch>.<para>",
  "page": "<page number if stable in the edition>",
  "text_status": "published_text"
}
```

- `passage_id` is the **stable passage identifier**: edition-prefixed chapter.paragraph. It survives re-chunking; page numbers are secondary (edition-dependent).
- `text_status: "published_text"` distinguishes the published book from any later ingestion of Kelly's conversational elaborations (`"authorial_elaboration"` — **not ingested in this slice**, but the field exists from day one so the distinction is structural, not retrofitted).

### 2.3 Quoting vs paraphrasing vs interpreting — structured, not prose-only

The distinction is chosen at response time, but it must be **represented in observable metadata, not merely requested in a prompt instruction** (correction 3, Kelly 2026-07-27). Two layers:

**(a) Structured provenance from retrieval.** The retrieval result hands the response composer typed objects, one per passage:

```ts
interface CanonProvenance {
  sourceClass: 'founder_authored_canon';
  title: string;          // exact book title
  editionId: string;
  passageId: string;      // e.g. "EA1.3.12"
  textStatus: 'published_text' | 'authorial_elaboration';
  useMode?: 'quote' | 'paraphrase' | 'interpret';  // filled during composition
}
```

**(b) Observable `useMode`.** MAIA's prompt addendum instructs the marking (quote = verbatim + quotation marks + passage_id; paraphrase = attributed restatement; interpret = MAIA's own reading, explicitly framed as distinct from the text). The composed response's usage is then recorded as `CanonProvenance[]` with `useMode` filled, persisted in the turn's stored metadata and in the consultation log entry (§5) — so tests and tracing can assert whether MAIA distinguished quotation from interpretation, rather than trusting prose compliance.

MAIA must never present the book's content as its own unattributed knowledge, and never present its interpretation as the book's text. This is the operational form of the durable principle.

## 3. Ingestion slice

### 3.0 Authoritative Designation Record (required before ingestion)

The designation is an explicit act, not an assumption. It is recorded in this document (and mirrored in `library_sources.meta`) as:

```yaml
designation:
  canonical_source_file: <exact path or Drive ID>
  edition_id: <e.g. "EA1-print-2026" / "EA1-ebook-2026">
  publication_state: <published_first_edition | published_revised_edition | founder_working_master | prepublication_review>
  designation_basis: <published_artifact | founder_designation | editorial_master>
  fingerprint: <sha256 of the designated file>
  designated_on: <date>
  designated_by: Kelly Nezat (Founder)
  passage_id_scheme: <e.g. "EA1.<chapter>.<paragraph>">
```

- `publication_state` documents the **editorial lifecycle** — explicit, mutually exclusive states, not a published/draft binary.
- `designation_basis` answers a different question: *why this artifact is authoritative* (it is the published artifact; or the founder designated it despite another candidate; or it is the editorial master, accepted as such).
- **Immutability rule (Kelly, 2026-07-27)**: the designation references an immutable artifact. A living editorial workspace (the Google Doc master) is *not* designatable — the spec establishes a stable retrieval corpus, not an editorial mirror. **Any future edition (e.g. the planned Soullab Press re-edition) becomes a new designation with its own edition_id; it never silently updates an existing one.** Provenance is preserved across editions, not overwritten by them.

Everything downstream — fragment reconciliation, ingestion, retrieval — derives from this artifact. **Status: NOT YET DESIGNATED** (candidate inventory: session record 2026-07-27; Kelly designates the artifact corresponding to the published first edition — print PDF or EPUB, whichever is authoritative for the text).

1. **Authoritative source artifact** — **RULED (Kelly 2026-07-27)**: the legacy JSON is **not** authority. The source must be the exact manuscript used for the published edition — or the final production interior from which that edition was made — designated by Kelly. The ingestion record must capture: title · edition · publication state · ISBN where applicable · source-file checksum · ingestion date · ratifier · passage-ID scheme. `elemental-alchemy-full.json` may be used only after its text is **mechanically reconciled** against the designated artifact. Remaining blocker: Kelly designates the file.
2. **Chunking** — chapter-aware chunking (respect chapter/section boundaries; target the same token range LibraryService already uses), each chunk stamped with the §2.2 meta. Assign `passage_id` deterministically from document structure.
3. **Embedding** — same local pipeline as existing library ingestion (Ollama/nomic — sovereignty-compliant, no cloud embedding).
4. **Ratification step** — after ingestion, Kelly reviews a sample (chunk count, spot-check provenance stamps) and sets `review_status` → ratified. Until then the source is dark.
5. **Pre-existing EA sources in the library — both held out of canon (updated 2026-07-27 after the ingestion audit; see `docs/defects/LIBRARY_INGESTION_IDENTITY_DEFECT_2026-07-27.md`)**:
   - `5c20ee56…` — **the complete book** (3,676 chunks, 922,989 tokens, fully embedded), ingested 2026-01-30 from the founder **working master** (.md derived from the Google Doc) with its identity destroyed at ingest (title `#`, author `would like`). Because it derives from the editorial master, not the published edition, it can never be ratified as canon itself — it serves as **reconciliation input** against the designated artifact, then is quarantined from any future general-library retrieval.
   - `58c87fb5…` — a 3-chunk, 577-token *note about* the book carrying a book-shaped title. RULED: quarantine from retrieval pending reconciliation; not deleted blindly; provenance preserved; compared against the authoritative edition during ingestion.
6. **Ingestion-integrity precondition**: the founder-canon ingest path must satisfy the defect's acceptance criteria (explicit complete/fail, expected-vs-actual chunk count from the designated artifact, persisted status, partial/identity-invalid never retrievable) **before** the canon ingest runs. The defect record is the authority on those criteria.

## 4. Scope: author-only (structural, not prompt-level)

Retrieval boundary enforced **in SQL**, not in prompt instructions. Per correction 1 (Kelly 2026-07-27), the predicate is null-safe and states the ratification requirement directly rather than relying on an assumed upstream filter:

```sql
WHERE s.review_status = 'ratified'
  AND (
    s.type IS DISTINCT FROM 'founder_authored_canon'
    OR s.practitioner_member_id = $memberId
  )
```

- `IS DISTINCT FROM` (not `<>`) because existing Library rows may carry `type = NULL`: `NULL <> 'founder_authored_canon'` evaluates to *unknown* and would silently drop ordinary Library sources. Null-typed ratified sources must retain their existing behavior.
- With `$memberId` NULL/absent, the canon arm (`practitioner_member_id = NULL`) evaluates unknown → founder canon **fails closed**, while ordinary ratified Library material still passes via the first arm.
- ⚠️ Migration note: `review_status = 'ratified'` becomes a condition on **all** library retrieval. Before wiring, verify the `review_status` values of existing sources (backfill legacy rows to a ratified/grandfathered status by explicit decision, not by loosening the predicate) — otherwise this predicate would dark the whole existing library. This backfill is part of the slice and gets its own check in tests.

Applied inside `LibraryService.semanticSearch`/`fullTextSearch` (search methods gain a `memberId`-aware filter; `search()` already receives `memberId`).

- Kelly's member UUID comes from `library_sources.practitioner_member_id` set at ingestion — no env-var identity, no hardcoded UUID in code.
- Later openings (book-companion readers → opted-in members → general conversation) are **each a separate Kelly ruling**, implemented as explicit grants, never a default flip. This slice builds no machinery for them beyond the fact that the filter is data-driven.

## 5. Wire site: sovereign conversation route

`app/api/sovereign/app/maia/list/route.ts` — the route the /maia surface actually uses (verified 2026-07-27; the existing library gate in `app/api/oracle/conversation/route.ts:997` is on a route /maia never calls, and `library_search_log` shows no production searches since 2026-04-26).

- **Consultation mechanism (correction 2 — the concrete decision rule)**: two operations are distinct — *whether retrieval runs* and *which passages return*. For this source class both are handled by one bounded mechanism: **always-search-with-strict-threshold**.
  1. *Eligibility (cheap, per turn)*: does this member have ≥1 ratified `founder_authored_canon` source scoped to them? (One indexed query; cacheable per session.) If no — nothing happens; this is the common case for every member except Kelly today.
  2. *Search (eligible members only)*: embed the turn (local Ollama/nomic, same pipeline as ingestion) and run the §4-bounded vector search against canon chunks **every eligible turn** — no keyword or classifier pre-gate. `shouldConsultLibrary()` / `LIBRARY_TRIGGERS` are explicitly NOT in this path ("elemental" fires constantly in ordinary MAIA conversation; a keyword gate is both over- and under-inclusive here).
  3. *Injection threshold (strict)*: inject the addendum only if top-passage cosine similarity ≥ **θ**. **θ is explicitly provisional** — the starting value (0.55 with nomic-embed cosine) is a placeholder to make the mechanism runnable, nothing more. Governing rule (Kelly, 2026-07-27): *the threshold is empirically calibrated against living verification, not chosen philosophically.* Calibration happens during Kelly's walks against logged scores, and must happen before any scope expansion. Below θ: no injection, but the consultation and its top score are still logged — so threshold tuning is data-driven, and "ingested perfectly but never consulted" is visible in the log rather than silent.
  
  Rationale for this mechanism over the alternatives Kelly listed: a semantic preflight against source *descriptions* adds a second embedding space with its own failure modes, and a retrieval-intent classifier is new governed machinery — both are more surface for no gain at N=1 eligible member. Revisit the mechanism choice at the scope-expansion ruling, where eligible-member count changes the cost calculus.
- **Injection**: a clearly-bounded prompt addendum block (following the existing addenda-channel pattern — conversational/episodic/atoms) containing: the retrieved passages **with their passage_ids**, the book/edition line, and the §2.3 quote/paraphrase/interpret instruction. The block states explicitly: *this is the member's own authored book, retrieved because the conversation touches it.*
- **Fire-and-forget logging** to `library_search_log` (already schema'd: `member_id`, `query_text`, `chunks_returned`, `top_source_ids`, `was_used_in_response`), extended for this class with the top similarity score and the composed `CanonProvenance[]` (with `useMode`) — the observable record correction 3 requires.
- **No change** to `/book/ask`, `/book/companion`, `/api/reader/ask`, or the legacy `_backend` tree.

### Provenance exposure in responses

Minimum: passage_ids present in MAIA's answer text when quoting/paraphrasing (per §2.3). Log-side: `library_search_log` row per consultation. A visible UI provenance affordance (e.g. a "from your book" marker) is **out of scope** for this slice — flag for the ruling that opens scope beyond Kelly.

## 6. Tests (required before the slice is called done)

1. **Non-leak (the critical one)**: a conversation turn under a *different* member id, with a message maximally likely to retrieve the book ("tell me about Elemental Alchemy by Kelly Nezat"), yields **zero** `founder_authored_canon` chunks in the retrieval result and zero book passages in the prompt addendum. Also: `memberId` absent → zero canon rows.
2. **Null-type regression**: existing Library sources with `type = NULL` (and ratified/backfilled `review_status`) are still retrieved after the §4 predicate lands — the `IS DISTINCT FROM` guard, exercised.
3. **Ratification boundary**: (a) a canon source with non-ratified `review_status` is never retrieved, even for Kelly; (b) the quarantined 3-chunk fragment returns from no query; (c) the `review_status` backfill left no previously-retrievable ordinary source dark.
4. **Scoped retrieval works**: the book message under Kelly's member id retrieves chunks with complete §2.2 provenance meta.
5. **Threshold gate**: an unrelated turn under Kelly's id ("what should I make for dinner") produces a logged consultation with sub-θ score and **no** prompt injection.
6. **Provenance observability**: a composed response that uses book material carries `CanonProvenance[]` with `useMode` set, in turn metadata and consultation log — assertable, not prose-trusted; a verbatim-quote fixture yields `useMode: 'quote'` with the quoted span matching the passage text.
7. **Provenance integrity**: every ingested chunk has all required §2.2 keys (ingestion-time validation + test).
8. **Existing surfaces untouched**: `/api/elemental-alchemy/ask` and `/api/reader/ask` behavior unchanged (smoke).

## 7. Rulings record + remaining blockers

Ruled 2026-07-27: class name `founder_authored_canon` **ratified** (§2.1) · authoritative artifact = designated published manuscript / production interior, legacy JSON only after mechanical reconciliation (§3.1) · 3-chunk fragment **quarantined pending reconciliation** (§3.5) · EA-adjacent marketing corpus stays **outside this slice** — it is neither the published book nor authorial elaboration; mixing it into founder canon would blur exactly the distinction this spec protects. (Corpus curation remains a separately named task before any general-source gate re-arm.)

Remaining blockers to ingestion (after ratification of this document): **(1)** Kelly designates the authoritative artifact + edition metadata (§3.0); **(2)** the ingestion pipeline demonstrates it can ingest the designated artifact completely and verifiably — Class A defect acceptance criteria met (`docs/defects/LIBRARY_INGESTION_IDENTITY_DEFECT_2026-07-27.md`); **(3)** reconciliation of both pre-existing EA sources against the designated edition (§3.5).

## 8. Acceptance criteria (the observable contract)

Ratification and slice-completion are judged against these five observable outcomes, not against the implementation plan:

1. **Kelly receives relevant book passages when appropriate** — a conversation turn of his that genuinely touches the book (the Anamnesis placement conversation is the reference case) surfaces passages that a reader of the book would judge relevant.
2. **Other members retrieve zero founder-canon passages** — under any query, including naming the book and author directly.
3. **Every retrieved passage carries provenance** — book, edition, passage_id, text_status — end to end: in the retrieval result, the prompt addendum, and the consultation log.
4. **Quote/paraphrase/interpret behavior is observable and testable** — `useMode` present in turn metadata and log; a verbatim quote traceable to its cited passage's actual text.
5. **Existing Library behavior unchanged for non-canon sources** — including NULL-typed legacy rows, after the explicit `review_status` backfill decision.

## 9. Sequence after ratification

Kelly designates artifact → ingest script (+ §2.2 provenance validation + fragment reconciliation + `review_status` backfill decision for existing sources) → ratification pause (Kelly ratifies the ingested source) → §4 SQL boundary in LibraryService → sovereign-route wire (§5 mechanism + structured provenance) → tests (§6) → Kelly walks the actual use case (Anamnesis placement conversation) as living verification, tuning θ against logged scores.
