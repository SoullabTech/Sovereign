# Personal Wisdom Library — Implementation Spec

**Status:** [DESIGNED] — not built. No code authorized by this document; it records *how* the architecture would be realized on the current stack.
**Date:** 2026-06-27
**Architecture (the "what"):** `docs/architecture/PERSONAL_WISDOM_LIBRARY.md`. This spec is the "how," and is intentionally PostgreSQL/Next-specific. If the architecture and this spec disagree, the architecture wins.

> Marker convention: **[LIVE]** wired + production · **[BUILT·UNWIRED]** exists, 0 live callers · **[DESIGNED]** specified here.

---

## Orthogonality Reference (read before adding anything)

Each concern owns one responsibility. The **Does not own** column is the warning label — *do not put it here.* (Refs point to the architecture doc.)

| Concern | Owns | Does not own |
|---|---|---|
| **Usage authority** (arch §4) | What MAIA may do | Meaning, maturity, presentation |
| **Provenance** (arch §5 / §9) | Where the item came from | What the member thinks of it |
| **Lifecycle** (arch §6) | What has happened in practice | Permission, meaning, UI |
| **Member intent / relationship** (arch §6A) | What it means to the member | System state |
| **Experience / presentation** (arch §6B) | How the same state is rendered | Permission or lifecycle |

> **Single-concern test:** If expressing one idea requires coordinated changes across multiple concerns, the representation is probably at the wrong level.

---

## 0. Organizing principle — members act in intents; the system stores axes

**The member never thinks in axes.** The five axes (§3) are the *internal representation*. The member expresses **intents** (acts), and an **intent interpreter** is the seam that maps them to axis changes:

```
Member intent   ("Keep this"; later "Practice this" / "Let this go")
      │
      ▼
Intent interpreter         ← the only place human vocabulary lives
      │
      ▼
Axes  (scope / owner / steward / visibility / usage-authority / status)
      │
      ▼
Retrieval · memory · governance
```

Two commitments follow:
- **The seam decouples vocabulary from representation.** If members say "Treasure this" instead of "Keep this," only the interpreter changes — the axes are untouched. If a new axis is added, the intents are untouched. The two evolve independently.
- **v1's "Keep this" is the first interpreter mapping** (§5): intent `Keep this` → `lifecycle_state=kept`; the usage-authority selector is the one place a member tunes an axis *in intent terms* ("how should MAIA use this?"), never as `usage_authority=…`.

**What this earns vs. what it doesn't.** The *seam* above is an **earned implementation pattern** — adopt it. The broader **invariant** it suggests — *the language of encounter and the language of implementation should be independently revisable* (generalizing "people express intentions; systems manage state") — is **held as a watch-candidate, not promoted.** Promotion needs independent convergence across *unrelated* subsystems (book-writing, calendar, practitioner studio) **and** evidence the interpreter stays a *simplifying* seam — one that compresses complexity, not one that sprawls into v2 → v3 rule-piles. Tracked in memory `project_intent_over_axes_candidate`.

---

## 1. Verification baseline (grounded 2026-06-27)

**The engine is [LIVE]:**
- `library_chunks.embedding` is pgvector; `library_chunks.content_tsv` is a tsvector → hybrid semantic + full-text retrieval.
- Distillation: `library_distillates` (with `reviewed_by`, `reviewed_at`, `quality_score`).
- Consent sublayer on `library_sources`: `consent_required`, `consent_granted`, `consent_granted_at`, `consent_granted_by`.
- Retrieval: `lib/library/LibraryService.ts` (`semanticSearch`, `search`).
- Ingest: `app/api/books/integrate/route.ts` → delegates to `scripts/wisdom-book-integrator.py` / `enhanced-book-integrator.py` / `add-books-to-maia.sh`.

**The scope layer is absent [GAP]:**
- Ingest accepts only `{ mode, maxBooks, resetProgress }` — no owner/scope.
- `LibraryService` retrieval filters only `WHERE s.ingestion_status='completed' AND c.embedding IS NOT NULL` — no owner/scope predicate.
- `library_search_log.member_id` and `ain_knowledge_retrievals.user_id` are **logging-only** — never in a WHERE clause.
- No `owner_*` / `scope` / `visibility` column on `library_sources`, `library_chunks`, `library_distillates`, or `ain_knowledge_chunks`.

**Second engine:** `ain_knowledge_chunks` + `lib/ain/knowledge/RetrievalService.ts` — also global, also pgvector, `user_id` tracking-only.

---

## 2. Decision: canonicalize on `library_*`, deprecate `ain_knowledge_*`

**Context:** two parallel RAG engines exist; both global. Two retrieval stacks drift.
**Decision:** extend `library_*` (richer: distillates, search-log, consent, review). Declare `ain_knowledge_*` **legacy**; migrate its callers to `library_*` incrementally; retire when caller count reaches zero. Do **not** delete abruptly.
**Consequences:** one retrieval path to scope-filter and maintain; a transitional period where both run; a caller-migration checklist (enumerate importers of `lib/ain/knowledge/RetrievalService.ts`).
> If preferred, this section can be promoted to a standalone ADR (`docs/adr/00X-canonicalize-knowledge-pipeline.md`). Left here to avoid doc proliferation until requested.

---

## 3. Schema — additive (the five axes + status)

Add to `library_sources` (the object), propagating `scope` to `library_chunks` for query-time filtering:

| Column | Type | Default | Axis |
|---|---|---|---|
| `scope` | enum(`platform`,`practitioner`,`member`) | `platform` | Scope |
| `owner_type` | enum(`platform`,`practitioner`,`member`) | `platform` | Owner |
| `owner_id` | uuid (nullable) | null | Owner |
| `steward_id` | uuid (nullable) | null | Steward |
| `visibility` | enum(`private`,`shared`,`published`) | `published` if platform else `private` | Visibility |
| `usage_authority` | enum(`store_only`,`only_when_i_ask`,`reflect_with_me`,`use_in_guidance`) | `only_when_i_ask` | Usage authority |
| `provenance` | text/enum (`transcript`,`manual`,`book`,`paper`,`workshop`,`personal_insight`,`clinical`,`tradition`,`maia_conversation`) | — | provenance |
| `lifecycle_state` | enum(`kept`,`curated`,`trusted`,`active`,`retired`) | `kept` | Status (maturity) |

**Migration is non-destructive:** existing rows default to `scope='platform'`, `owner_type='platform'`, `visibility='published'`. The current 246-file corpus becomes the platform scope **untouched** — no data movement.

`library_chunks` carries a denormalized `scope` (+ optional `owner_id`) copied from its source, so the retrieval filter stays index-friendly.

**Usage-authority invariant (enforced by the default):** `usage_authority` defaults to `only_when_i_ask`; reaching `use_in_guidance` requires a deliberate member act — *no kept item is guidance-authoritative by default.* Usage authority is **orthogonal to `lifecycle_state`** (maturity): a member may fully trust a piece (`trusted`) yet set `usage_authority='store_only'`. Note `store_only` is the member-facing "private vault" — distinct from the **"Keep this"** verb, which is the intent to preserve (architecture §6), not a usage level. And `store_only` is a deliberate **vault state, never the default** — the default is `only_when_i_ask`.

---

## 4. Retrieval predicate

In `LibraryService.semanticSearch` / `search`, add an authorization predicate alongside the existing `ingestion_status='completed' AND embedding IS NOT NULL`:

```
AND (
      scope = 'platform'
   OR (scope = 'member'       AND owner_id = :viewerId)
   OR (scope = 'practitioner' AND owner_id IN (:viewerPractitionerGrants))
   OR visibility = 'shared'   AND <reviewer/grant predicate>
)
```

`:viewerId` is already in scope (the `memberId` param exists, currently logging-only). Default allowed set for a member = `platform ∪ own member-scope`. Practitioner grants are deferred (§7) but the predicate slot is reserved now.

---

## 5. V1 — the "Keep this" primitive (member write path)

The v1 deliverable is the member write path itself — **not** a Clean Language feature (that becomes a downstream use; see §6). Member-facing verb: **"Keep this"** (an intent declaration, per architecture §6).

**UX:**
- inputs: text note · quote/passage · uploaded document/transcript
- a **source/provenance** field — captured even though Offer is deferred, so it's ready
- a required **"How should MAIA use this?"** selector (the usage-authority axis), **default `only_when_i_ask`**, a monotonic ladder of MAIA's initiative:
  1. **Store only** — stored for the member; MAIA never uses it, *even on request*. A private vault — the home for a raw transcript or copyrighted manual held but not yet worked with.
  2. **Only when I ask** *(default)* — MAIA uses it solely on explicit member invocation; never proactively.
  3. **Reflect with me** — MAIA may surface it unprompted, but only as the member's prior language (mirror, non-directive).
  4. **Use in guidance** — MAIA may actively draw on it to shape responses.

**Fixed in v1:** `scope='member'`, `visibility='private'`, **Offer deferred** (no upward promotion path yet).

**Write path:** a member entrypoint (e.g. `POST /api/library/keep`) writes a `library_sources` row (`owner_id=:member`, `scope='member'`, `visibility='private'`, `usage_authority=:selected`) and runs the **same** chunk → embed path as the platform engine. Retrieval honors `usage_authority` at query time (architecture §4 mapping: `store_only` never retrieved into the prompt; `only_when_i_ask` gated behind an explicit request; `reflect_with_me` = mirror context; `use_in_guidance` = active). Embedding dim must match `library_chunks`. **Sanctuary guard:** no "Keep this" inside a sanctuary session. Accepted file types / size limits: TBD.

---

## 6. First *content* on the primitive — Clean Language for Jondi

Clean Language is the first *use* of the §5 "Keep this" primitive — **not** the v1 mechanism. It exercises the layers, member scope:

**L1 — preference.** A member preference "Clean Language support" (default **off**, consent-logged). Copy the `conversational_recall_enabled` pattern exactly:
- column on `members` → `GET/PATCH` API mirroring `app/api/members/recall-preferences/route.ts` → loader in `lib/maia/memoryLoaders.ts` → gated addendum.

**L2 — corpus object.** A member-scope `library_sources` row: David Grove / Philip Harland "Clean Language / Trust the Patient," `provenance='tradition'` (imported), `owner_id=:jondi`, `visibility='private'`, `lifecycle_state='active'`.

**L3 — active practice.** When enabled **and** the object is `active`, a Clean Language instruction reaches the prompt via the established seam:
- FAST: template literal in `lib/sovereign/maiaService.ts` (~1245–1255).
- CORE: add an entry to `ADDENDA_SPECS` in `lib/sovereign/maiaVoice.ts` → injected by `appendAllContextAddenda`.
- DEEP: blocked by the addenda-channel divergence (`docs/architecture/ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md`) — out of scope for v1.

**Behavior module** `lib/maia/supportModes/cleanLanguage.ts`:
- `buildCleanLanguageInstruction(memberName?)` — the preamble (preserve exact words; clean, non-leading questions; no diagnosis; elemental/interpretive only when invited).
- `cleanLanguageQuestionBank` — the clean-question set ("And when there's a glass wall, what kind of glass wall is that?").
- `detectMetaphorOrFeltSense(input)` — **soft signal only**, never a classification that switches a fixed mode (per the sovereignty choice: member-enabled gate, detection only foregrounds).
- Tests: metaphor detection, clean-question selection, no-diagnosis guard, exact-wording preservation, elemental-only-after-invitation.

**Blocker — Jondi identity (resolved 2026-06-27):**
- **Canonical member identity = `jondiwhitis@icloud.com` (`3946706a-3082-47e6-8d72-b627a8f22b55`)** — onboarded, 7 auth sessions since 2026-01-23, has `member_voice_preferences`. Seed L1/L2 against this id.
- `jondiwhitis@mac.com` (`35f18704-f11e-4e98-ac5a-b13ab1fff451`) is a **stray duplicate created 2026-06-27**, stuck at onboarding step `faq`, 0 atoms. Retire/merge into the canonical id **only after confirming it was not an intentional re-signup** (member-account mutation — not auto-executed).
- **Practitioner identity already exists separately:** `practitioners` row `5ec9b705-a1e7-443a-9584-83e86fe666b0` "Jondi Whitis" — a **distinct UUID**, currently unlinked to her member identity. (Verify whether `practitioners` carries a member/user FK when building the identity link.)
- **Platform "Master's Field" not built** — no `wisdom_fields` row for her; it remains the extraction-pipeline target (see memory `user_jondi_voice.md`).

**Reference-case finding (feeds the architecture's identity ⊥ stewardship):** Jondi already occupies all three scopes as three *unlinked* identities (≥1 member row + 1 practitioner row + a future platform field). The missing piece is an **explicit identity link** binding them as one person while each scope stays independently governed. Designing that link is a prerequisite to her practitioner/platform scopes (not to the member-scope first slice).

---

## 7. Open implementation questions

1. Embedding model/dimension for member uploads (must match `library_chunks`).
2. Lifecycle granularity for v1 — full `imported→curated→trusted→active→retired`, or `active/retired` only?
3. Accepted file types + size limits; transcript ingestion path (text only).
4. Practitioner grant model (the `:viewerPractitionerGrants` set) — design when practitioner behavior is built.
5. `ain_knowledge_*` caller-migration checklist + retirement criteria.
6. Jondi member-row dedupe.
7. **Bulk vault import (Obsidian / markdown corpus).** The need that surfaced this thread (Kelly, 2026-06-27: MAIA could not engage Robert Kane's work) is *importing an existing curated corpus wholesale* — a member's Obsidian vault of papers/books/manuals — not one-at-a-time "Keep this" (§5). Maps to **member-scope batch upload**: enumerate vault files, one `library_sources` row each (`provenance` per source type — `paper`/`book`/`manual`), frontmatter/wikilinks → source `meta`; **read-only ingestion**, distinct from the existing write-only Obsidian *export* connector (`lib/connectors/obsidian/obsidianExport.ts`). Governance unchanged: an imported vault lands at the `usage_authority` default (`only_when_i_ask`) — a freshly imported corpus is never silently guidance-authoritative (§3 invariant), so MAIA's honest "I don't have that in front of me" persists until the member both imports *and* elevates authority. **Sequenced as connector #2 (Kelly, 2026-06-27):** built only after the §5 `Keep this` primitive + §4 governed retrieval are verified with Jondi — Obsidian must not become the architecture; it is the connector that proves the gates generalize. Default lands at `only_when_i_ask`; folder/tag-level authority overrides deferred to that point. Open: per-source vs per-vault authority at import; whether to introduce a connector abstraction (Obsidian/PDF/Kindle/Telegram) or just a markdown-batch path for v1 — lean **batch path first, abstraction only when a second connector earns it** (no premature concept, per architecture §0).
