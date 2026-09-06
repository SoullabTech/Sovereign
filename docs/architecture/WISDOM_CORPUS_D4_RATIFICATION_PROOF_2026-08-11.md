# Wisdom Corpus D4 — Compositional ratification proof

**Date:** 2026-08-11 · **Mode:** READ ONLY — no status updates, no ratification, no exclusion, no migration, no deployment.
**Upstream:** the earlier D2 Maya-scoped provenance pass, whose document was
subsequently **withdrawn** and is not part of this repository. Nothing in this
proof rests on it: §8's finding is self-evidenced — the four sources were
re-read from production in this pass and the rows are reproduced inline — and
the provenance analysis proper belongs to
`WISDOM_CORPUS_D3_PROVENANCE_AUDIT_2026-08-11.md`, as §8 itself states.

---

## Headline

The doctrine is **strong, explicit, and table-wide**: *"Only ratified material
may compose into MAIA context. Only the practitioner's gesture ratifies — AI
suggestions never advance state."*

Production holds **2,228 sources with exactly one distinct `review_status`
value: `'uploaded'`. Zero ratified. Zero `ratified_at`. Zero `ratified_by`.**

Therefore: **no source in the platform corpus is presently authorized for
member-facing composition — Books included, all 2,228.**

And the gate is **not enforced on the retrieval path**. `LibraryService` never
reads `review_status`. The doctrine binds the house corpus by its own words; the
only mechanism that can satisfy it cannot reach the house corpus at all.

⚠️ **Scope note:** three unrelated columns share this name and must not be
conflated — `studio_agent_tasks.review_status`
(`pending_review|approved|rejected|needs_changes`, migration `20260202000001`)
and `bounded_agent_runs.human_review_status` (`20260405100001`). Only
`library_sources.review_status` is in scope here.

---

## 1. Exact semantics of `review_status`

Defined once: migration `20260714000001_practitioner_program_platform.sql:36`,
`TEXT NOT NULL DEFAULT 'uploaded'`, CHECK-constrained to
`uploaded | processed | reviewed | ratified | archived`, indexed (line 61).

**Governing text — column COMMENT (lines 64–67), verbatim:**

> `Ratification lifecycle: uploaded → processed → reviewed → ratified → archived.`
> `Only ratified material may compose into MAIA context. Only the practitioner's`
> `gesture ratifies — AI suggestions never advance state.`

**Migration header (lines 8–10):**

> *"library_sources gains practitioner scoping + a ratification lifecycle — only
> RATIFIED material may ever compose into MAIA context. AI never advances state;
> only the practitioner's gesture ratifies."*

**Pre-platform clause (lines 44–45)** — verified verbatim, and it is explicitly
*about the house corpus*:

> *"Pre-existing rows (house corpus, pre-platform) default to 'uploaded' — they
> were never practitioner-ratified and must not silently become composable."*

**Classification (Phase 1 question):** `ratified` is **an epistemic admission
decision, specifically authorization for member-facing composition** — that is
what the text says. It is *not* an ingestion lifecycle state: `ingestion_status`
is a separate column and moves independently.

⚠️ **But it is simultaneously UNDER-SPECIFIED for house sources** — see §7. The
contradiction is preserved, not resolved: the *rule* is table-wide, the
*mechanism* is practitioner-only.

Member-facing lifecycle copy (`app/studio/materials/page.tsx:29-44`) restates it
unambiguously — `reviewed`: *"you have read it — ratify to let MAIA draw on
it"*; `ratified`: *"MAIA may draw on this in your field"*; and the reverse
gesture from `ratified` is labelled **"Withdraw from MAIA."**

## 2. Production status distribution (Phase 2)

| review_status | ingestion_status | top-level folder | count |
|---|---|---|---:|
| `uploaded` | completed | Soullab Dev Team | 1,112 |
| `uploaded` | completed | AIN | 516 |
| `uploaded` | **skipped** | Soullab Dev Team | 475 |
| `uploaded` | completed | Books | 121 |
| `uploaded` | completed | `.` | 3 |
| `uploaded` | **failed** | Books | 1 |

**Requested totals:**

| Metric | Count |
|---|---:|
| Total ratified sources | **0** |
| Ratified `Books` | **0** |
| Ratified `AIN` | **0** |
| Ratified `Soullab Dev Team` | **0** |
| Ratified practitioner/member/vault sources | **0** (none exist: 0 rows have `practitioner_member_id`, `vault_file_id`, or `field_slug`) |
| `ratified_at` non-null | **0** |
| `ratified_by` non-null | **0** |
| Distinct `review_status` values in production | **`uploaded`** (one value) |

Consistent with the independent prior measurement recorded in
`docs/design/practitioner-portal/PRACTITIONER_PUBLISHING_PRODUCTION_MEASUREMENT_2026-08-06.md`
(`review_status = uploaded   practitioner_scoped = false   count = 2228`).

> **Citation provenance — this document is not on trunk.** It is *not* reachable from
> `clean-main-no-secrets` and is therefore not present in this PR's tree. It is preserved on two
> unmerged branches, `chore/practitioner-publishing-phase` (`de2baadda`) and
> `chore/rehabilitation-corpus-provenance` (`c42cfe4a3`), which carry the **byte-identical**
> blob `cd91d457f1e3ae2d6828a5301d8c08b0f334a397`. Retrieve it with:
>
> ```
> git show cd91d457f1e3ae2d6828a5301d8c08b0f334a397
> ```
>
> The measured line is at that blob's §"Lifecycle distribution". The citation is bound to the
> blob rather than to a line number in an unreachable path, so it resolves independently of
> whether either branch is ever merged. **This is corroboration, not load-bearing evidence:**
> the same figure is measured directly and independently by this proof's own §2 table above, so
> nothing here depends on the cited document being merged.

## 3. Who/what can write `ratified` (Phase 1 — transition authority)

**Single writer:** `PATCH /api/practitioner/materials/[id]`
(`app/api/practitioner/materials/[id]/route.ts`), driven by the Studio Materials
UI (`app/studio/materials/page.tsx:107`).

Authority chain, as implemented:

- `getMemberIdFromRequest` → 401 if absent.
- No authored practice field → **403 "No authored field — this surface belongs
  to the field holder."**
- Route doc (lines 6–9): *"status moves one honest step: uploaded→processed→
  reviewed→ratified … Ratify is the practitioner's gesture alone — nothing
  automated."*
- Lifecycle rule (`lib/practiceField/programAuthoringService.ts:84-85`):
  *"forward one honest path; archive from anywhere; restore to reviewed (never
  straight back to ratified — un-archiving is not re-ratifying)."*

⛔ **No other writer exists.** No script, job, ingest path, or admin route writes
`review_status`. `ingestTxtSources.ts` does not set it — the 2,228 rows carry the
column DEFAULT.

**Consequence (the central D4 finding):** ratification is reachable **only** by a
member who holds an authored practice field, acting on material scoped to that
field. The house corpus has **no practitioner owner** — so **no actor in the
system can currently ratify a house source at all.** The gate is not merely
unsatisfied; for these 2,228 rows it is unsatisfiable through the existing
mechanism.

## 4. Actual consumers of ratification state (Phase 3)

15 files reference `library_sources` (excluding worktrees/node_modules). **Two**
mention `review_status`/`ratified`:

| Consumer | Reads ratification? | Behavioral consequence |
|---|---|---|
| `lib/practiceField/programAuthoringService.ts` | ✅ yes | Practitioner program-authoring lane: material attachment to lessons. This is the doctrine's real enforcement site. |
| `scripts/eval/program-platform-probes.ts` | ✅ yes | Eval probe only. |
| **`lib/library/LibraryService.ts`** | ⛔ **no** | **The corpus→MAIA retrieval path. Does not read `review_status` anywhere in the file.** |
| `lib/wisdom/wisdomGraphService.ts`, `lib/maia/use-frames/index.ts`, 11 scripts | ⛔ no | ingest/repair/audit/health utilities |

## 5. Does ratification currently govern retrieval? (Phase 3 proof)

**No.** Proven, not inferred:

```
SOURCE STATUS ──✗──> RETRIEVAL ELIGIBILITY ──✗──> COMPOSITIONAL ELIGIBILITY
```

- **Status → retrieval eligibility: NOT ENFORCED.** `semanticSearch()` and
  `fullTextSearch()` filter on `ingestion_status='completed'`,
  `identity_valid IS DISTINCT FROM false`, embedding/tsv presence, and (as of
  2026-08-11) `PLATFORM_ONLY_PREDICATE`. `review_status` appears in neither.
- **`search()` and `askJeeves()`** delegate to those two methods and add no
  status filter of their own.
- **Retrieval → compositional eligibility: NOT ENFORCED, AND CURRENTLY MOOT.**
  Nothing wires LibraryService to the live member turn path today (per the
  Phase 1/2 findings). Composition is blocked by *absence of a wire*, not by
  the ratification gate.

**The gate is documentary with respect to the wisdom corpus, and load-bearing
only in the practitioner program-authoring lane.** If the Books wire were built
today exactly as scoped, it would compose 121 unratified sources into
member-facing MAIA without touching a single line that mentions ratification —
in direct contradiction of the column's own COMMENT.

## 6. Is any source presently authorized for member-facing composition?

**No. Zero sources, of 2,228.** Under the doctrine as written, the entire
corpus — Books, AIN, Soullab Dev Team alike — is unauthorized for composition.

This is the correct fail-closed posture, but note what it is **not**: it is not
evidence of curation or of any considered judgment about these sources. Every
row is `uploaded` because that is the column DEFAULT and nothing ever moved it.
**Uniform non-authorization is indistinguishable from an unused mechanism.**

## 7. Treatment required for legacy / pre-platform imports (Phase 4)

The pre-platform clause is real, verbatim, and explicitly names the house
corpus (§1). Its governing semantics:

- The January 2026 imports are **not** grandfathered. They *default* to
  `uploaded`; the migration author anticipated precisely this population and
  denied it composability.
- *"must not silently become composable"* is a **prohibition on inference from
  default state** — the same failure shape as inferring consent from folder
  placement (D2). Structurally identical to the founder's standing rule.

**Answer to the Phase 4 question — do the January imports require an
affirmative ratification gesture before member-facing use?** By the doctrine:
**yes.** By the mechanism: **there is no gesture they can receive** (§3).

That gap is the D4 deliverable. It is not a bug in either artifact — the
migration governs a practitioner-materials platform and its rule generalized to
the whole table; the house corpus predates it and has no field holder. Resolving
it requires naming a **house-corpus ratification authority**, which does not
exist today.

## 8. Would proper ratification enforcement have prevented D2? (Phase 5)

**Yes — and this is confirmed, not inferred.** Current state of the four
`Conversation with Maya` sources, re-read this pass, unmodified:

| id | review_status | ratified_at | ratified_by |
|---|---|---|---|
| `10db25b4-81cf-4883-8b98-1f313d9ca490` | `uploaded` | NULL | NULL |
| `0f05134f-52b7-4361-8886-65b5583b36a5` | `uploaded` | NULL | NULL |
| `558e315c-b570-4301-8bb3-a5bd910970cb` | `uploaded` | NULL | NULL |
| `50c416a8-c001-4796-9df2-198cac94291a` | `uploaded` | NULL | NULL |

A retrieval filter of `review_status='ratified'` would have excluded all four.

⚠️ **Do not over-read this.** That same filter excludes **all 2,228 sources
equally**. Ratification would have prevented D2 only in the way a closed door
prevents every entry — it is **not a discriminating instrument** and provides no
evidence that anything in the corpus was ever evaluated. D2's real defect (a
transcript classified as a book, consent never evaluated) is a **provenance and
ingest-path** failure, and belongs to D3.

## 9. Minimum safe admission rule for Wisdom Corpus v1

Smallest rule consistent with everything proven above — an **explicit
admissibility list**, not a status inference:

> A source may participate in live member-facing wisdom retrieval only if it is
> (a) platform-owned (`PLATFORM_ONLY_PREDICATE`, already applied), (b)
> `ingestion_status='completed'`, and (c) **named on an explicit, versioned
> admissibility record** carrying its id + checksum and the authority that
> admitted it. Folder membership, ingestion status, embedding presence, and
> `review_status` default state are each insufficient, individually and jointly.

Rationale: `review_status='ratified'` **cannot** serve as the v1 admission
predicate, because no house source can be moved to it (§3). Reusing it would
either require inventing a house-ratification authority (a founder decision, §10)
or writing `ratified` by script — which the doctrine forbids outright (*"AI
suggestions never advance state"*).

Checksums are the durable anchor: the four source ids and their checksums are
recorded in `docs/specs/HOUSE_SOURCE_ADMISSIBILITY_RECORD_PLAN_2026-08-11.md` §4,
so admission can be re-verified against content rather than trusting ids. (The
withdrawn D2 document is not the record for this and is not relied on.)

## 10. Founder decisions required before D3 (Phase 6 — kept separate)

Deliberately **not** collapsed into one "approved" flag:

| | Concern | Status after D2+D4 | Decision needed |
|---|---|---|---|
| **A** | **Source ownership** | ✅ **RESOLVED** — `PLATFORM_ONLY_PREDICATE` applied to both read paths; 0 owned rows exist | none |
| **B** | **Source provenance** | ⛔ open — one transcript found and classified; ingest path derives title from content, author by regex, class from directory | **D3** |
| **C** | **Copyright / use constraints** | ⛔ open — 114 in-copyright commercial works | **D1**, separate from consent per founder ruling |
| **D** | **Review / ratification** | ⚠️ **doctrine binds, mechanism cannot reach** | **D4-DECISION (below)** |
| **E** | **Conversational relevance** | ⛔ open — `shouldConsultLibrary()` exists, unvalidated against this corpus | after D1 |

**D4-DECISION — the one decision this proof actually forces:**

> **Who may admit a house/platform corpus source to member-facing composition,
> and by what gesture?**

Three shapes, not ranked as equivalents:

1. **Founder-as-house-authority** — extend the ratification gesture so
   platform-owned sources are ratifiable by the founder rather than a field
   holder. Reuses the existing lifecycle and its "one honest step" discipline;
   requires a writer path that does not 403 on "no authored field."
2. **Separate admissibility record** — leave `review_status` untouched as
   practitioner-only, and admit house sources via a distinct explicit list
   (§9). Keeps the two authority models from contaminating each other; adds a
   second instrument.
3. **Defer** — leave the corpus unadmitted and unwired. Costs nothing; blocks
   the wisdom-retrieval feature indefinitely.

⚠️ Whichever is chosen, one thing is already settled by the doctrine and needs
no further ruling: **nothing automated may advance admission state.** Any
implementation that writes `ratified` from a script violates the column's own
governing comment.

**Recommended sequence unchanged:** D4 ✅ → D3 (provenance / ingest-path defect)
→ D1 (copyright-use policy) → live integration. D4-DECISION can be taken in
parallel with D3; it does not block it.

---

## Evidence

Production `maia-postgres` on minisforum, read-only `SELECT` only, 2026-08-11.
Code references: working tree on `feature/labtools-redesign`; worktrees and
`node_modules` excluded from all traces. No row was modified in this pass.
