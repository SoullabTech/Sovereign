# JARVIS Governed Knowledge Flow · J8-R1 Governed Retrieval Repair · Census

**Date:** 2026-09-17
**Lane:** `JARVIS-GOVERNED-KNOWLEDGE-FLOW-01 / J8-R1` — a lane inside the existing flow, **not** a new JARVIS flow.
**Pinned SHA:** `97c7d946` (canonical `clean-main-no-secrets` tip carrying J6).
**Class:** read-only repository census. No source, schema, migration, route, or production state was changed.
**Predecessor of record:** `JARVIS-GOVERNED-KNOWLEDGE-J6_BOUNDARY_2026-09-17.md`.

## 0. Standing of the predecessor stages

J7 (governed ingestion) and the J8 STOP were established by founder act. **No J7 or J8 record exists in
the repository at the pinned SHA**, and this census does not manufacture one. Nothing below is asserted
on the strength of a J7/J8 finding I did not witness; every finding here is repository truth read
directly at `97c7d946`. ⛔ No live or shadow database was read.

## 1. Why J8-R1 exists

The governing question of the flow is unchanged:

> By what authority may knowledge cross into MAIA, and what has actually been proved at each stage?

J8 exposed a defect **inside** that crossing. The census finds the defect is not one defect but three,
and they sit at three different altitudes — which is why the founder's A/B/C decomposition holds.

The real architecture, as the census confirms it:

```
SOURCE IDENTITY  →  CHUNK IDENTITY  →  RETRIEVAL METADATA
      →  RETRIEVAL POLICY  →  CANONICAL MEMBER ROUTE  →  MAIA COGNITION
```

J0–J7 govern the first two terms. **Nothing governs the last four.**

## 2. Part A finding — the canonical member route has no knowledge retrieval seam at all

`app/api/sovereign/app/maia/list/route.ts` → `getMaiaResponse` (`lib/sovereign/maiaService.ts`).

Neither `lib/sovereign/maiaService.ts` nor `lib/sovereign/maiaVoice.ts` imports `RetrievalService`,
`LibraryService`, or any reader of `ain_knowledge_chunks`. The only knowledge-shaped import on that path
is `PLATFORM_KNOWLEDGE_ADDENDUM` — static authored prose in `lib/sovereign/platformKnowledge.ts`
(241 lines; its single `LibraryService` occurrence is a comment at line 60, not a coupling).

Every live AIN-knowledge reader is somewhere else:

| Reader | Reached from | Authority gate |
|---|---|---|
| `lib/consciousness/maiaOrchestrator.ts:478` (`retrieveForMode`) | `app/api/between/chat` only | none |
| `app/api/ain/knowledge/route.ts` | direct corridor, `betaSession` | declared in `config/accessMatrix.ts` at `51bc60ad`; **declared ≠ enforced**, unverified here |
| `LibraryService.search()` | `/api/oracle/conversation`, `LibraryOfAlexandria`, `/api/library/*`, `lib/maia/use-frames` | J6 `globalRetrievalAuthority` (path + checksum) |

⭐ **The decisive consequence:** the authorized Elemental Alchemy subject can be ingested, embedded,
chunk-identical to its frozen digest, and globally authorized under J6 — and still never reach the route
every member actually uses. J6 gated a read boundary the canonical route does not cross, because the
canonical route performs no governed knowledge read at all.

⚠️ Note the asymmetry this creates with the CLAUDE.md record: `/api/oracle/conversation` — which *does*
cross the J6-gated Library seam — is documented as receiving ~zero live traffic. **The governed reader is
on the quiet path; the busy path is ungoverned by having no reader.**

## 3. Part B finding — `ain_knowledge_chunks` retrieval carries no authority gate

`retrieveKnowledge()` (`lib/ain/knowledge/RetrievalService.ts`) selects on:

```sql
FROM ain_knowledge_chunks WHERE embedding IS NOT NULL
  [AND domain = ANY($n)] [AND categories && $n] AND similarity >= $n
```

There is no admission binding, no governed source checksum, no authority-stream test, no scope exclusion.
This is **precisely the defect J6C repaired for `library_sources`, left unrepaired for the other knowledge
table.** After J6, `embedded + completed` is no longer authority in the Library; in `ain_knowledge_chunks`,
`embedding IS NOT NULL` still is.

### 3b. The eligibility metadata is heuristic, not governed

`classifySource(filename, content)` (`lib/ain/knowledge/ChunkingService.ts:84`) assigns `domain` and
`categories` by regex over the filename plus the **first 5,000 characters** of the source.

For the authorized EA subject: the filename matches `/alchemy/i`, so `categories` gains `alchemy`;
`DOMAIN_PATTERNS` is iterated in insertion order and breaks on first match, where `jungian` also carries
`/alchemy/i` — therefore **EA is classified `domain = 'jungian'` by a regex over its title.**

⭐ The founder's reading is confirmed by the code: `domain` and `categories` are **not incidental labels**.
They are the operative retrieval-eligibility fields, and today they are produced by keyword accident over a
5,000-character window rather than by the admission record that authorized the subject.

### 3c. `MODE_FILTERS` can silently exclude the authorized subject

`MODE_FILTERS` ANDs domain against categories. EA (`domain='jungian'`, `categories` including `alchemy`)
is admissible under `scribe` and `archetypal`, whose category lists contain `alchemy`. Under `talk` — the
default `sessionMode` in `maiaOrchestrator.ts:472` — the category list is
`[jungian, consciousness, divided_brain, mythology, flow]`, which contains no `alchemy`. EA therefore
reaches default-mode retrieval **only if its first 5,000 characters happened to trip one of those five
patterns.** No declaration records that outcome; no test pins it.

## 4. Part C finding — the attestation does not cover the fields that decide retrievability

`chunkSetDigest()` (`lib/corpus/eaIngestContract.ts:54`) hashes exactly:

```
{ sourceFile, chunkIndex, sha256(chunkText) }
```

`domain` and `categories` are **absent from the frozen chunk-set digest.** They are checked only in
`verifyDatabaseRowsAgainstChunks()`, row-against-computed-chunk — i.e. the ingest proves the database
agrees with whatever the classifier emitted *on that run*, never that the classifier emitted what was
authorized.

⭐⭐ **The load-bearing consequence: a change to `CATEGORY_PATTERNS` / `DOMAIN_PATTERNS` — a new regex, a
reordered map — would change what MAIA can retrieve while `sourceSha256`, chunk count, and
`chunkSetSha256` all stay green.** The attestation would pass across a silent change in representation.
This is the same defect family the flow has refused throughout: authority arriving through a convenient
adjacent field, and a green instrument that does not ask the question that matters.

## 5. What the three parts are actually asking

- **A · canonical retrieval seam** — a *reachability* question. Not "is the gate correct" but "is there a
  read here at all". Answer today: no.
- **B · retrieval metadata authority** — a *provenance* question. Who decides `domain`/`categories`, and by
  what authority, given that they decide retrievability. Answer today: a regex, by none.
- **C · retrieval attestation** — an *evidence* question. Do the frozen fields cover the fields that
  determine what MAIA can retrieve. Answer today: no.

They are not three tasks in a sequence; B and C are each meaningless without a ruling on the other, and A
must not be built before both — **wiring a seam into the canonical member route before the eligibility
fields are governed would put ungoverned metadata directly in front of every member.** That ordering is
the census's one structural recommendation, ⛔ not a decision taken.

## 6. Founder docket — decisions owed before any J8-R1 repair

1. **Does the canonical member route get a governed AIN retrieval seam, or does AIN knowledge remain
   out of the canonical turn?** Both are coherent answers. The second is not a defect if ruled.
2. **Is `domain`/`categories` retrieval metadata, or is it corpus authority?** If the latter, it must be
   declared in `data/ain/corpus-admission.json` per admitted source and the classifier stops deciding it.
3. **Does eligibility belong in the chunk row at all**, or is it derived at read time from the admission
   declaration (the J6 `globalRetrievalAuthority` shape, which binds path + checksum rather than trusting
   a stored column)? The J6 precedent argues for derivation; ⛔ precedent is not a ruling.
4. **Must `chunkSetSha256` be widened to cover eligibility fields, or does eligibility get its own
   attestation?** Widening the existing digest invalidates the frozen EA identity
   (`87b0cbaa…`) and would re-open a sealed J6 witness — a cost that must be paid deliberately, never
   absorbed.
5. **What is the falsifier that fails a repair which restores retrieval but re-admits ungoverned
   metadata?** The lane's central risk is a fix that makes EA reachable and thereby makes 2,228 legacy
   rows' worth of classification logic load-bearing again.

## 7. Non-authorizations

This census does not authorize: any change to `RetrievalService`, `ChunkingService`, `classifySource`,
`MODE_FILTERS`, `eaIngestContract`, the canonical route, or `maiaService`; any migration or schema change;
re-attestation or re-freezing of EA identity; production ingestion; production read; deployment; or
reclassification of any legacy Library row.

**Standing: J8-R1 OPEN · CENSUS COMPLETE (READ-ONLY) · A/B/C FINDINGS ESTABLISHED IN REPOSITORY TRUTH ·
FOUNDER DOCKET OWED · ⛔ DESIGN NOT OPENED · ⛔ REPAIR NOT AUTHORIZED · PRODUCTION UNTOUCHED.**
