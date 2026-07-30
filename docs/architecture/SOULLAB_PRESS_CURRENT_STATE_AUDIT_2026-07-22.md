# Soullab Press / Book Studio — Current-State Audit (Document #1)

**Date:** 2026-07-22 · **Genre:** FACT, not direction · **Branch audited:** `feature/practitioner-program-platform` (this worktree)
**Method:** four read-only code slices (data model & auth · editorial surfaces · rendering & publication · generation & constitutional). Every claim is verified in code, not inferred from labels. Classification per capability: **Built & production-capable · Built but founder-only · Partial · Schema-capable-not-surfaced · Mock/placeholder · Missing · Obsolete/duplicated.**

This is the checkpoint the [direction candidate](./CREATOR_WORLD_STUDIO_DIRECTION_CANDIDATE_2026-07-22.md) is gated behind. **It corrects the narrative in five load-bearing ways.**

> **⚠️ BRANCH RECONCILIATION — added 2026-07-22, after this audit was written. READ FIRST.**
> This audit ran on `feature/practitioner-program-platform`, which **diverged before PR #673**. The **production** deploy branch `clean-main-no-secrets` (live at soullab.life) **does** contain a real, DB-backed **Manuscript Room** — PR #673 + fix #676 (`fix/manuscript-room-mechanical`): `app/press/manuscript/page.tsx`, five routes under `app/api/sovereign/manuscripts/*`, and migration `20260721000003_press_manuscript_room.sql` with exactly five tables: `member_manuscripts` · `manuscript_sections` · `manuscript_keeps` · `manuscript_collections` · `manuscript_collection_items`.
> **Memory was correct; this audit was branch-blind.** The "thin spine / no Manuscript Room" finding below is accurate *for the audited feature branch* but **understates production**, which has a genuine member-scoped **manuscript + keeps + collections** model. Everything below must be read through this banner. **The honest next factual step is to re-audit the deploy branch** — is the Manuscript Room fully wired, member-facing, and mechanical (rung ≤3)? Until then, treat the production substrate as *larger and richer* than the feature-branch spine described here.

---

## Corrections to the prior narrative (read first)

1. **There is no "Manuscript Room" *on this feature branch*** — but there is on production. `/press/manuscript` does not exist on `feature/practitioner-program-platform`; here `app/press/` is only a public marketing landing (`app/press/page.tsx`), and the real editorial system is `/book-studio`, founder-gated. **RECONCILED (see banner above): the Manuscript Room is live on `clean-main-no-secrets` / production** (PR #673 + #676), a real member-scoped manuscript+keeps+collections system. Memory was correct. This correction applies only to the audited branch.

2. **Most "primitives" are static markdown about one book, not data structures.** `passages`, `illustrations`, `design-system`, `read`, `book` are `StudioMarkdown file="EA_*.md"` readers pointed at fixed Elemental Alchemy files (`app/book-studio/passages/page.tsx` etc.). They are not a general content model with EA as its first row — they are a bespoke reader for one book. `passages` in particular is a placeholder ("34 doorways from Ch5–9" hardcoded in markdown; no DB).

3. **"Drafts" are not AI-generated. Nothing on this surface calls any AI provider.** A provider grep across `app/api/book-studio`, `app/book-studio`, `lib/workbench` returned **zero hits**. `drafts/from-idea` wraps the creator's own content in a markdown template; `drafts/from-group` (`lib/workbench/graduate.ts:graduateGroup`) mechanically concatenates the creator's own cards **in the order the arranger placed them**. Zero synthesis. (Constitutionally: excellent — see §4.)

4. **"MAIA notes" in book-studio do not exist.** My earlier claim was a grep false-positive. Repo-wide, book-studio/press has none. Instead the code carries explicit anti-interpretation guardrails (§4).

5. **The generalizable substrate is real but much smaller than implied.** It is essentially: the workbench (2 tables), the mechanical assembler, the generic render *engine*, DOCX import, and the reading-moments pattern. That's the durable spine. Everything else is static EA content or absent.

---

## What is genuinely durable & artifact-neutral (the real spine)

| Capability | Evidence | Class | Note |
|---|---|---|---|
| **Workbench ingestion** | `workbench_uploads` (`arranger_id`→members); `api/book-studio/workbench/uploads` | Built, founder-only | generic file ingest + text extraction (txt/docx/pdf) + FTS; no book column |
| **Workbench arrangement** | `workbench_tables.layout` JSON of `{source, ref}` card pointers (`arranger_id`) | Built, founder-only | **source-agnostic arrangement primitive** — the strongest durable object |
| **Mechanical assembly** | `lib/workbench/graduate.ts:graduateGroup` | Built, founder-only | concatenates creator's own material by arranger order; Sanctuary refs skipped |
| **DOCX import** | `api/book-studio/import-docx` (pandoc) | Built, founder-only | input side; artifact-neutral |
| **Render ENGINE** | `lib/manuscript/render/pagedPdf.ts:renderHtmlToPdf(html, opts)` | Built, production-capable | **consumes arbitrary HTML + page dims** — could render a deck/workbook; coupling lives in the route, not the engine |
| **Reading-moments pattern** | `reading_moments` (highlight/note/question/insight over segmented text) | Built (audiobook-coupled) | reusable annotation primitive |

**Load-bearing answer — member-scoped or book-scoped?** The *persisted* substrate is **member-scoped (body-of-work-shaped), dominantly.** Every real editorial table keys on a person (`arranger_id`/`member_id`→`members`). Book-scoping exists only as `audiobook_chapters.book_slug` — a bare TEXT column, no FK, defaulting to one title. **No book / project / world container row exists anywhere.** This is the one schema fact that supports the Body-of-Work thesis: a container would be *additive*, and nothing welds material to a book today.

---

## What is book-locked, static, or partial

| Capability | Evidence | Class |
|---|---|---|
| `read` · `book` · `passages` · `illustrations` · `design-system` | static `StudioMarkdown` EA files | Built (static reader) — **EA-coupled**; `passages` = Mock/placeholder |
| Manuscript "source of truth" | a single JSON file `…/elemental-alchemy-book.json` via `lib/manuscript/adapters/*` | Built — **EA-coupled, file not table** |
| PDF render **route** | `api/book-studio/render/route.ts` — no request body, hardcoded EA md path, EA metadata, plates F00–F09 | Built, founder-only — **book-locked route over a generic engine** |
| EPUB | `render/epub` (pandoc `-t epub3`) | Built, founder-only — self-described "working draft: no cover, no illustrations, no ISBN" |
| `canvas` | iframe → `public/book-studio-canvas.html`; localStorage state, `window.print()` | **Partial** (self-labeled "Phase A0"; DB/pandoc "Pending Phase C") |
| Workbench `shelf` non-uploaded sources (ideas/keep/journals/decisions) | declared valid, adapters unlit ("Slice 3") | **Schema-capable, not surfaced** |

---

## Publication, versioning, audio — mostly absent

- **Publication metadata:** essentially none. EPUB passes hardcoded title/author/publisher; **no ISBN, no distribution, no proofs.** No edition/ISBN tables exist.
- **Versioning / editions:** none. Both renderers overwrite one fixed output path; only a `generatedAt` timestamp. Single current-state.
- **Audio:** **not real as a pipeline.** Two disconnected systems — (1) DB tables `audiobook_chapters/segments/reading_moments` + `/api/reader/{moments,ask}` routes, but **no ingestion/TTS ever populates them** (`audio_url` never written); (2) `labtools/elemental-alchemy` plays *static* manifest MP3s and never touches the DB. `public/audiobook` empty/absent. **No audio-generation exists.** Class: Schema-capable-not-surfaced + Mock UI.

---

## Constitutional state — conservative by construction (the good news)

The Book Studio today sits **entirely at Mechanical / Descriptive**, with one clean **Recognition-supporting** typographic surface (`StudioMarkdown.tsx:54` tags a blockquote-after-heading as an epigraph by structural recognition of the author's own formatting). **No interpretive, synthetic, or directive surface exists. No line crosses or blurs the meaning-authoring boundary.**

The code actively *defends* the boundary:
- `app/book-studio/workbench/page.tsx:9` — *"No commentary, no suggested clusters, no synthesis. That silence is structural, not stylistic."*
- `app/book-studio/book/BookReader.tsx:23` — *"No competing voice — no MAIA surface, no interpretive affordances."*

**Implication:** the constitutional risk is not present-tense crossing — it is the *first future addition* of a generative "draft" / "theme" / "MAIA note" layer, which would be simultaneously (a) the first AI provider call on this surface and (b) the first interpretive affordance. That single future PR is where the [witness protocol](../ops/SOULLAB_PRESS_WITNESS_PROTOCOL_2026-07-22.md) constraint and the "never author the desire" lock must bite.

---

## One present-tense finding to flag (not a leak, but note it)

`config/accessMatrix.ts` marks `/book-studio`, `/book-studio/read`, `/passages`, `/illustrations`, `/design-system` as `public: true`; real gating happens only where a page/layout calls `requireFounder` (`lib/founder/founderAuth.ts`, env `FOUNDER_MEMBER_IDS`, fail-closed). Net effect: the **static EA reader surfaces are publicly reachable** while all write-surfaces are founder-only. No member data is exposed (the content is one book's published-ish text), but the matrix and the gate disagree, which is worth reconciling before any multi-member surface ships.

---

## What this means for documents #2–#10

- **The Body-of-Work thesis (#2) survives — but narrower and more additive than it looked.** The durable, member-scoped, artifact-neutral core is genuinely there (workbench arrangement + generic render engine), and no book container fights it. But it is a *thin spine*, not a rich platform with EA as its first specimen. Most surfaces are bespoke-static. So #2 should be written as *"the small real substrate + the container that is missing,"* not *"generalize the existing primitives."*
- **The artifact-engine idea (#6) has real evidence under it:** `renderHtmlToPdf(html)` is already artifact-agnostic; the EA coupling is one route. That is the single most reusable thing in the codebase.
- **Collaboration (#7), publication (#8), versioning, audio, migration (#9)** are largely **greenfield** — there is almost nothing to audit because almost nothing exists. Designing them now is pure speculation with no code to correct it. **Strongest candidates to hold until a walk.**
- **The constitutional matrix (#3)** is worth writing now precisely *because* the surface is currently clean — it defines the boundary the first generative PR must respect, before that PR is tempting.

**Recommendation:** on this verified ground, the walk-independent, safe-to-write-now set is **#2 (rewritten as spine-plus-missing-container) and #3 (constitutional matrix)**. Everything else (#4–#10) is either greenfield speculation or belongs after the first walk. That is a much smaller "now" than the ten-document package — and it is the honest one.

---

## Deploy-branch pre-flight finding (2026-07-22) — one crossing at the Discovery supply line

Read-only verification of the production Manuscript Room (`origin/clean-main-no-secrets`, via `git show`). **Clean, with one crossing.**

**Clean:** all routes member-scoped (`getMemberIdFromRequest`, 401 anon — not founder-only); create→`member_manuscripts`+`manuscript_sections`, keeps→`manuscript_keeps` (verbatim re-verified), collections→`manuscript_collections`/`_items` — all persist, real read path. Emerging Books groups the member's own keeps and **asks** *"What relationship, if any, do you notice?"* (`page.tsx:733`) = rung 3, exemplary. Provenance = manuscript→section→verbatim text (section-granular; char offsets computed but not persisted). Provider = `anthropic|ollama|mixed`, never OpenAI. Member-facing copy clean; only the room-frame is evocative ("lines that still feel alive").

**Crossing (rung ~4–5), at the Discovery flow only:** `POST /api/sovereign/manuscripts/[id]/candidates` → `lib/analysis/extractQuotes.ts:127` calls an **LLM** that assigns hidden **resonance + score 1–10** per passage and **ranks/truncates by score** (`:167-168,:178-180`). Score is hidden; member sees verbatim + provenance, nothing persists without a Keep. **But which of the member's passages surface is chosen by a model judgment of what "feels alive."** Rung 3 requires member-*selected* evidence; here the *model* selects. Mitigations (hidden score, Keep-gate, verbatim-only) reduce the visible surface but don't resolve it; the hidden criterion is ungovernable by the member. A *thoughtful* crossing (doctrine comments, `-mechanical` fix branch) that landed just over the line on the one flow that reads meaning rather than moving words.

**Two consequences (Kelly's rulings, not patched — freeze holds):**
1. *Constitutional:* whether the LLM candidate-extractor is admissible is a ruling to make deliberately, post-walk — not a rushed fix.
2. *Experimental:* the Discovery flow **contaminates founder-walk evidence** — "keeps passages he did not expect" is confounded if a model pre-filtered for resonance. **Recommendation: walk the mechanical paths (keeps/collections/Emerging-Books from the member's own sections); skip Discovery.** No code change; uncontaminated evidence.

---

**Pen remains down on construction.** This document authorizes nothing. Next mark is still a walk.
