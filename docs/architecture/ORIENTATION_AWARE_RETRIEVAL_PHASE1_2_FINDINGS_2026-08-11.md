# Orientation-Aware Wisdom Retrieval — Phase 1/2 Findings (read-only)

**Date:** 2026-08-11 · **Status:** investigation only, no code changed, nothing deployed
**Work unit:** MAIA Orientation-Aware Wisdom Retrieval (founder-issued)
**Verdict:** ⛔ **STOP before Phase 3.** Two premise-level corrections and one
authority decision are required first.

---

## 0. Headline

The work unit is well-formed, and its central principle — *orientation narrows the
field before similarity ranks it* — is the right one. But **two of its stated
premises do not survive contact with production**, and one of them is
disqualifying for the current corpus.

| Premise as stated | Production reality | Grade |
|---|---|---|
| 2,228 platform-origin sources | 2,228 rows; **1,752 completed**, 475 skipped, 1 failed | PARTIAL |
| 55,760 embedded chunks, 100% coverage | 55,760 chunks, **55,760 embedded** — correct | REAL |
| — (implied) all 2,228 searchable | **1,751 sources** actually carry chunks (79%) | CORRECTION |
| corpus rows uniformly platform-origin/unowned | `practitioner_member_id`=0, `vault_file_id`=0 — correct **today** | REAL |
| "the platform Wisdom Corpus" | **majority is internal Soullab org material, not wisdom literature** | ⛔ BLOCKER |

---

## 1. ⛔ BLOCKER — the corpus is not predominantly a wisdom corpus

Top-level folder rollup, completed sources only:

| Top-level folder | Sources | What it actually is |
|---|---:|---|
| `Soullab Dev Team` | **1,112 (63%)** | internal org material |
| `AIN` | 516 (29%) | internal framework docs |
| `Books` | **121 (7%)** | actual outside literature |
| `.` | 3 | — |

Representative `Soullab Dev Team/*` subfolders: *Market and Marketing* (21),
*Pitches* (13), *Bolt.new* (17), *Design and Development* (23), *Team
Collaboration* (15), *Note Taker App and Plugin* (12), *Soullab.ai* (21),
*Coaching Platform* (27), *podcast Interview material* (13).

**Consequence:** wiring `semanticSearch` to the live turn path today, ranked by
similarity over the whole corpus, would make MAIA liable to surface **pitch
decks, marketing copy, and engineering notes** into member conversation. The
Jungian/attachment/somatic material the founder ruling is actually about lives
almost entirely in the 121-source `Books` folder — **7% of the corpus.**

This is not a tuning problem. Orientation-narrowing does not fix it, because
there is no metadata to narrow *on* (§2).

## 2. Corpus filterability: near zero

`library_sources.meta` carries exactly four keys across all 2,228 rows:
`folder`, `filename`, `ingested_by`, `chunking_version`.

| Candidate filter axis | State | Usable for v1? |
|---|---|---|
| `meta->>'folder'` | populated 100% | ✅ **only viable axis** |
| `type` | 100% `'txt'` — no discrimination | ❌ |
| `field_slug` | **0 rows set** (column exists, migration `20260714000001`) | ❌ DORMANT |
| `author` | non-null on 1,029/2,228 (46%), 818 distinct — **and values are extraction garbage**: observed `"of this"`, `"what they"`, `"rulers and"`, `"any means"`, `"the Internet"`, `"reconnecting us"` | ❌ WRONG-AXIS |
| `title` | populated, but scribd-ID-prefixed filenames (`"329520202 Archetypal Cosmology Past And Present By Richard T"`) | ⚠️ PARTIAL, dirty |
| `tags` / `tradition` / `category` / `modality` | **do not exist** | ❌ MISSING |
| chunk `meta` | `startChar`, `endChar`, `sectionHint` only | ❌ |

**`author` cannot be the orientation filter.** The "filter by author = Jung"
design is not available. Folder is the only curator-authored taxonomy present.

## 3. Orientation substrate that already exists

**Do not build a new schema.** The nearest real substrate is already shipped:

`lib/types/practiceField.ts` → `FieldGuidance.preferred_language`:
> *"vocabulary/framework the practitioner works in (IFS, somatic, contemplative…)"*

| Substrate | Location | Grade |
|---|---|---|
| `FieldGuidance.preferred_language` | `lib/types/practiceField.ts`; enforced narrow-only in `lib/practiceField/fieldGuidance.ts` | **PARTIAL** — free text, prompt-guidance only, never a retrieval filter |
| `practice_fields.about_practice` | `20260701000001` — comment literally says *"free text: modality, approach, philosophy"* | PARTIAL (unstructured) |
| `practice_fields.orientation_style` | `minimal\|guided\|relationship_first\|tour` | **WRONG-AXIS** — threshold/arrival style, *not* intellectual orientation. Name collision; do not reuse. |
| `library_sources.field_slug` | column exists, 0 rows | **DORMANT** — the intended join to `practice_fields.field_slug` |
| `LIBRARY_TRIGGERS` + `shouldConsultLibrary()` | `lib/library/LibraryService.ts:143,168` | **REAL** — a working Phase-3 relevance gate already exists (substring match; includes `'jungian'`, `'spiralogic'`, `'shadow work'`, `'archetypal'`) |
| member-level durable orientation preference | — | **MISSING** entirely |

**Smallest viable v1 orientation source:** `FieldGuidance.preferred_language`
(practitioner-authored, already consented, already narrow-only) — mapped to
`meta->>'folder'` prefixes. Nothing new needs to be built to *carry* orientation.
What is missing is a corpus that can be *filtered* by it.

## 4. ⛔ Live retrieval has no ownership boundary

`LibraryService.semanticSearch` (`lib/library/LibraryService.ts:253`) filters on
**only**:

```sql
WHERE s.ingestion_status = 'completed'
  AND s.identity_valid IS DISTINCT FROM false
  AND c.embedding IS NOT NULL
```

`practitioner_member_id` and `vault_file_id` — added by migration
`20260714000001_practitioner_program_platform.sql` — are **never excluded**.
Today this is harmless (both are 0 rows). The moment one practitioner-owned or
vault source reaches `completed`, it becomes retrievable by every member.

**Required before any live wiring**, per work-unit Phase 5:
`AND practitioner_member_id IS NULL AND vault_file_id IS NULL`.

`governedRetrieval.ts` does **not** exist on disk — commits `d5517904b`,
`da6e719d3`, `d2847a94a` only. The work unit is right not to resurrect it; the
platform-only predicate is three lines.

## 5. Canonical live route — resolved, and the usual evidence is invalid

⚠️ **`agent_runs.origin_route` cannot identify the route.** It is a *constant*,
not evidence:

- `lib/sovereign/maiaService.ts:3489` — `originRoute: originRoute ?? '/api/sovereign/app/maia'`
- Neither `list/route.ts:1051` nor `app/maia/route.ts:279` passes `originRoute`
  into `getMaiaResponse` → **both fall through to the same fallback string.**
- The one `originRoute: '/api/sovereign/app/maia/list'` in `/list` (line 1249) is
  on an unrelated `logAgentRun` for the interruption-ledger.

So the 7-day `agent_runs` figures (`/api/sovereign/app/maia` — CORE 1,519 · FAST
353) prove **traffic volume and tier mix**, and prove nothing about which file
served it. Any prior claim keyed to that column's value is unfounded.

**Actual route evidence — container logs, 48h:** `/api/sovereign/app/maia/list/route`
× 220; no non-list entries observed.

| Route | Lines | Evidence |
|---|---:|---|
| `app/api/sovereign/app/maia/list/route.ts` | 1,583 | ✅ 220 log hits/48h; `force-dynamic`; the de-frag runtime contract lives here | 
| `app/api/sovereign/app/maia/route.ts` | 459 | no log hits observed; calls `getMaiaResponse` |
| `app/api/oracle/conversation/route.ts` | — | ⛔ **retired, returns 410** (line 449). Already wired to `shouldConsultLibrary` at line 1021 — **that wire is dead.** Do not use it as a pattern. |

**Conclusion:** `/list` is the canonical live seam — matching CLAUDE.md — but on
log evidence, *not* on the `agent_runs` column. Held open: whether the non-list
route carries residual traffic outside the 48h window.

## 6. Prompt injection seam — already exists, reusable

`appendAllContextAddenda()` (`lib/sovereign/maiaVoice.ts:488`, applied at 912 and
1044) is the shared CORE/DEEP addenda seam; FAST is served by the
`maiaService.ts` base template. `lib/sovereign/platformKnowledge.ts` already uses
exactly this seam for authored static knowledge.

**A retrieved-wisdom block should ride this same seam.** No new injection
architecture is required — which satisfies the work unit's "reuse existing
architecture where real" discipline and keeps Phase 6 epistemic separation
enforceable at one place.

---

## 7. Founder decisions required (work unit says STOP here)

1. **Corpus scope.** The wisdom corpus MAIA should consult is ~121 `Books`
   sources, not 2,228. Options: (a) restrict v1 to `meta->>'folder' LIKE 'Books%'`;
   (b) authorize a curation pass tagging the subset; (c) something else.
   ⛔ The work unit forbids bulk-classifying 2,228 sources by inferred school
   without explicit authorization — and §2 shows there is nothing to classify
   *from* except folder and dirty titles.
2. **Should internal `Soullab Dev Team` material (1,112 sources — pitches,
   marketing, dev notes) be reachable by MAIA in member conversation at all?**
   This is a representation/claim-discipline question, not a retrieval question.
3. **Orientation axis.** Confirm `FieldGuidance.preferred_language` → folder
   mapping as the v1 orientation carrier, or name another.
4. **`author` remediation.** Accept that author is unusable, or authorize a
   metadata repair pass. (Repair is deterministic-ish for the `Books` subset via
   filename; not for the rest.)
5. **Member-level durable orientation** — MISSING. Confirm it is out of v1
   scope (work unit already discourages building practitioner settings UX).

## 8. What is safe to do without further authorization

- Add the platform-only predicate (§4) to `semanticSearch` — closes a real
  ownership hole, changes nothing today (0 affected rows).
- Nothing else. Phases 3–10 all depend on decision 1.

---

---

# ADDENDUM — Founder ruling + post-ruling evidence (2026-08-11)

## 9. FOUNDER RULING — WISDOM CORPUS V1 (accepted, in force)

1. Member-facing live corpus retrieval restricted to completed `Books` sources for v1.
2. No retrieval from `Soullab Dev Team` or broad `AIN` in ordinary member conversation.
3. No corpus-wide curation/tagging in this work unit.
4. Explicit platform-only ownership predicate — **required now**.
5. Reuse `shouldConsultLibrary()` as the relevance gate.
6. Reuse `FieldGuidance.preferred_language`; create no new orientation schema.
7. Do not claim orientation-aware filtering in v1 — metadata cannot support it.
8. v1 = relevance gate → Books-only platform corpus → semantic search → provenance-preserving context → MAIA.
9. Preserve extension path: explicit present-turn orientation → `preferred_language` → curated tradition/source-class filter → semantic ranking.
10. Internal Soullab/AIN requires separate epistemic classification first.
11. `agent_runs.origin_route` is non-evidence for route identity.

**Governing rationale (founder):** the three folders have *different epistemic
status* and must not share one retrieval pool — *"If MAIA can retrieve a pitch
deck, dev note, or internal product claim and present it in a member
conversation as though it were wisdom, you get claim contamination."*

## 10. ✅ AIN exclusion — independently confirmed after the ruling

A 22-source random sample of `AIN/*` returned effectively zero wisdom material.
Representative titles: *"🔍 Complete Code Verification"*, *"📄 Proposed Paper
Structure"*, *"🌌 Elemental Dev Console"*, *"🌌 Spiral Report - Week 42"*,
*"WHAT THE ABSOLUTE FUCK!!"*, *"Just log these, don't optimize for them yet"*,
*"🔬💬🗣️🧠📖🎓40 Beta Testers"*, *"Loralee Starweaver - Scope"*.

⚠️ That last one is a **client scope document**. `18 sources` sit under
client-named folders (`AIN/Clients/…`) corpus-wide. The Books-only ruling
excludes them — but their presence in a retrievable table is itself worth a
separate look.

## 11. ⛔ STOP TRIGGERED — `Books` is not cleanly "external/reference wisdom"

The ruling's own stop condition fires: *"STOP if implementing Books-only
retrieval requires any unruled … copyright, provenance, or source-classification
decision."* All three are now required. Composition of the 121 `Books` sources:

| Signal | Count | Why it matters |
|---|---:|---|
| Title prefixed with a 6+ digit scribd ID | **114 / 121 (94%)** | These are **commercially published, in-copyright books** — *Mysterium Coniunctionis*, Grof *The Holotropic Mind*, Von Franz *On Active Imagination*, Neumann, Tarnas, Hollis. Retrieving excerpts into member conversation is a **copyright decision**, unruled. |
| `"Conversation with Maya"` | **4** | ⛔ **MAIA conversation transcripts filed as books.** Provenance and consent unknown. If any originated from a member session, this is a Sanctuary/consent boundary, not a corpus question. |
| `"Untitled (1)"` / numeric-only titles | 2 | Unidentifiable provenance; cannot be attributed in a citation. |

Content mix in the remainder is also broader than "reference wisdom": genuine
depth-psychology sits beside Human Design (×3), Enneagram (×3), *Flower of
Life*, *Third Eye Code*, *12 Magical Laws of the Universe*, I Ching, and
astrology. Not disqualifying — but v1 must not describe this pool as a
curated therapeutic-tradition corpus.

**Unruled decisions now blocking the Books-only wire:**
- **D1 (copyright)** — may MAIA surface excerpts from in-copyright commercial books in member conversation, and under what quoting limit / attribution rule?
- **D2 (consent)** — what are the 4 `Conversation with Maya` sources, and were they member sessions? Must be resolved before Books is retrievable, not after.
- **D3 (provenance)** — the 2 untitled rows cannot carry provenance; exclude or identify.
- **D4 (ratification)** — migration `20260714000001` states pre-platform house rows default to `review_status='uploaded'` and *"must not silently become composable."* All 2,228 house rows are unratified. Whether Books-only member retrieval is consistent with that comment is a governance call, not an implementation detail.

**Recommendation:** D2 first (cheapest, highest severity), then D1. D3 is a
two-row exclusion. D1–D4 do not require the curation program ruled out in §9.3.

## 12. ✅ Applied — platform-only ownership predicate (ruling item 4)

`lib/library/LibraryService.ts` — new exported `PLATFORM_ONLY_PREDICATE`, applied
to **both** read paths:

- `semanticSearch()` (~line 289)
- `fullTextSearch()` (~line 357) — ⚠️ **this path had the identical hole**, and
  `search()` falls back to it when semantic returns nothing. Patching only the
  semantic path would have left the boundary leaking on every fallback.

```
AND s.practitioner_member_id IS NULL
AND s.vault_file_id IS NULL
AND s.field_slug IS NULL
```

**`field_slug` answered (founder's open question):** yes, it belongs in the
exclusion. On `library_sources` — unlike `practice_fields` — it denotes
*practitioner-field scoping* (migration `20260714000001` §1, "MATERIALS —
practitioner scoping"). Non-NULL = belongs to one practitioner's field, not the
house.

**Scope discipline:** the predicate is a safety invariant applied to *all*
callers. The Books-only *scope* is deliberately **not** baked into the shared
service — admin/search/ingest surfaces legitimately read the whole house corpus.
Scope belongs to the member-conversation caller at wire time.

**Verification:**
- Behaviour-neutral today — prod: **0 sources / 0 chunks** excluded by the new predicate.
- `npm run typecheck` — ✅ no regressions (237 errors vs. baseline 239).
- ⛔ Not deployed. Local commit only.

## 13. Record correction — *claim retained / evidence superseded*

**Claim:** `app/api/sovereign/app/maia/list/route.ts` is the canonical live MAIA route.
**Status:** RETAINED.
**Evidence basis:** SUPERSEDED.

- ❌ Withdrawn: `agent_runs.origin_route = '/api/sovereign/app/maia'`. Both routes
  omit `originRoute` when calling `getMaiaResponse`, so every row falls through
  to the constant at `lib/sovereign/maiaService.ts:3489`. The column records
  **that maiaService ran**, never **which route ran it**.
- ✅ Substituted: container request logs — `/api/sovereign/app/maia/list/route`
  × 220 / 48h, no non-list entries observed.
- ✅ Still valid from `agent_runs`: volume and tier mix (7d: CORE 1,519 · FAST 353).

**Generalized lesson (third instance of this pattern):** a field whose *name*
asserts a fact is not evidence of that fact until you have read what writes it.
Sibling precedents in this repo: `surface_count = 0` (cannot distinguish "never
surfaced" from "counter never incremented"), and `generated_by =
'unattributed-historical'` on all 142 memory atoms. Standing check: **before
citing a column as evidence, grep its write sites and confirm a caller sets it
non-constantly.**

## Evidence

All figures: production `maia-postgres` on minisforum, read-only `SELECT`,
2026-08-11. Route evidence: `docker logs maia-sovereign --since 48h`.
Code references are to the working tree on `feature/labtools-redesign`.
