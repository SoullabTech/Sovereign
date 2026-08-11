# House-Source Admissibility Record — minimum implementation plan

**Date:** 2026-08-11 · **Status:** PLAN ONLY — no schema or data mutation performed.
**Authorizing ruling:** D4 Founder Ruling — House Corpus Admission (2026-08-11).
**Proofs this rests on:** `WISDOM_CORPUS_D4_RATIFICATION_PROOF_2026-08-11.md`,
`WISDOM_CORPUS_D2_CONVERSATION_WITH_MAYA_PROVENANCE_2026-08-11.md`,
`ORIENTATION_AWARE_RETRIEVAL_PHASE1_2_FINDINGS_2026-08-11.md`.

---

## 0. Two findings that shape the design

**(a) The house authority already exists — no new auth is needed.**
`lib/founder/founderAuth.ts` → `requireFounder()` checks the server session
against the `FOUNDER_MEMBER_IDS` env allowlist and **fails closed** when unset
(*"forgetting to set the env var should fail closed, not open"*). Verified in
production: the allowlist is **set with 2 entries** (presence and count only —
values not read). Ruling item 2 is therefore implementable with an existing,
already-hardened primitive.

**(b) Rule 4 can be made structural rather than procedural.** If the gate joins
on `admission.source_checksum = library_sources.checksum`, a content change
breaks the join and admission goes inert **by itself** — no sweep job, no
`superseded` batch process, nothing to forget. `superseded` then becomes a
*recorded observation for the review queue*, not the load-bearing mechanism.
This is the single most important choice in the plan: it makes *"a changed
source does not inherit prior admission"* unforgettable rather than
well-intentioned.

---

## 1. Schema — one new table, no ALTER on `library_sources`

`database/migrations/20260812000001_house_source_admissibility.sql`

Keeping this **out of** `library_sources` is the point of ruling item 1: the
practitioner ratification lifecycle and the house admission record stay two
governance systems in two places, and neither can be mistaken for the other.

```
library_source_admissions
  id                  UUID PK
  source_id           UUID NOT NULL REFERENCES library_sources(id) ON DELETE RESTRICT
  source_checksum     TEXT NOT NULL            -- the exact artifact admitted
  admissibility_state TEXT NOT NULL CHECK IN ('unreviewed','admitted','excluded','superseded')
  admitted_by         UUID REFERENCES members(id)   -- NOT NULL when state='admitted'
  admitted_at         TIMESTAMPTZ                   -- NOT NULL when state='admitted'
  admission_basis     TEXT NOT NULL            -- why; free text, required in every state
  admitted_title      TEXT                     -- the admitting human's naming of the artifact
  admitted_author     TEXT                     -- ⛔ never copied from library_sources.author
  scope               TEXT NOT NULL DEFAULT 'member_wisdom_retrieval'
                        CHECK (scope IN ('member_wisdom_retrieval'))   -- canonical vocabulary, not folklore
  use_constraint      TEXT NOT NULL DEFAULT 'synthesis_only'           -- see §10
                        CHECK (use_constraint IN ('synthesis_only','synthesis_and_short_quote','unrestricted'))
  version             INT NOT NULL             -- per-source revision, 1-based
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
  UNIQUE (source_id, version)
```

**Append-only.** Every decision inserts a new row; nothing is updated or
deleted. Current state = highest `version` per `source_id`. This reuses the
repo's existing structural-incapacity pattern (`practice_field_revisions`,
`field_program_revisions`: *"nothing the practitioner changes erases what came
before"*) — an admission and a later reversal are both permanently legible.

**Constraints worth writing into the migration:**
- `CHECK (admissibility_state <> 'admitted' OR (admitted_by IS NOT NULL AND admitted_at IS NOT NULL))` — an admission cannot exist without a named human and a time.
- `ON DELETE RESTRICT` — a source with an admission history cannot be silently deleted out from under it.
- Partial index on `(source_id, source_checksum) WHERE admissibility_state='admitted'` — the gate's access path.
- `CHECK (scope IN ('member_wisdom_retrieval'))` — see §9. A single-value CHECK looks redundant; it is the point.

**⭐ Admission identity beats source metadata** (founder ruling, 2026-08-11):

```
source metadata    = what ingestion extracted
admission identity = what the admitting human says this artifact actually is
```

The latter governs. `admitted_title` / `admitted_author` therefore live on the
admission record and are **required to be entered by the admitting human** — the
route must not default them from `library_sources.title`/`.author`. D3 measured
why: 68% of Books authors are implausible extractions (`'stoking the'`,
`'reconnecting us'`), and the title field is H1-derived, which is exactly how a
conversation transcript came to be titled like a book. **Any member-facing
attribution reads these columns, never the source row.** Evidence:
`FOUNDER_RIGHTS_DECLARATION_2026-08-11.md`.

**`unreviewed`:** absence of a row **is** unreviewed. Explicit `unreviewed` rows
are permitted for populating a review queue with notes. Either way the gate
tests `state='admitted'`, so both are fail-closed.

Per `database/migrations/README.md`: idempotent, self-protecting, order-
independent, and shipped in the same PR as its reader.

## 2. Enforcement — a separate entry point, not a flag

⚠️ **Do not add `admittedOnly?: boolean` to `search()`.** A default-off flag can
be forgotten at the wire site; a default-on flag breaks
`/api/library/search`, `ask-jeeves`, `stats`, and the ingest/audit scripts,
which legitimately read the whole house corpus.

**Recommended shape:** a distinct method — `LibraryService.searchAdmitted()` —
that the member-facing path must call by name. The unrestricted `search()`
stays as-is for admin/ingest/audit. The member path then *cannot* reach
unadmitted material by omission; it would have to call a different method.

This mirrors the distinction already established in `LibraryService`:

| Predicate | Kind | Applies to |
|---|---|---|
| `PLATFORM_ONLY_PREDICATE` (shipped 2026-08-11) | **safety invariant** | ALL callers, unconditionally |
| admission gate | **scope** | member-facing wisdom retrieval only |

**Gate predicate** (joined, not subqueried, so the checksum binding is visible):

```
JOIN library_source_admissions a
  ON a.source_id = s.id
 AND a.source_checksum = s.checksum          -- ← rule 4, structurally enforced
 AND a.admissibility_state = 'admitted'
 AND a.scope = 'member_wisdom_retrieval'
 AND a.version = (SELECT max(version) FROM library_source_admissions
                   WHERE source_id = s.id AND scope = a.scope)
```

Applied to **both** read paths — `semanticSearch()` and `fullTextSearch()`.
⚠️ The fallback path is not optional: `search()` falls through to full-text when
semantic returns nothing, and that is exactly when a missing gate would go
unnoticed. This is the same hole found in the ownership predicate.

## 3. Writer — founder-gated, no automated path

`app/api/founder/library-admissions/route.ts`

- `POST` — insert a new admission row. `requireFounder()` first; 401/403 typed
  results already provided by the helper.
- `admitted_by` is taken from `auth.memberId` — **never** from the request body.
- `source_checksum` is read server-side from `library_sources` at write time and
  **echoed back in the response**, so the founder can see exactly which artifact
  version was admitted.
- `admission_basis` required and non-empty in every state, including `excluded`.
- `GET` — the review queue (§5).

**Ruling item 6 — no automated process may advance a source into `admitted`.**
Enforced three ways: (1) `requireFounder()` needs a real session, so no script
or job can authenticate; (2) `admitted_by` is session-derived; (3) recommended
hardening — extend `scripts/check-*` guards with a repo scan rejecting any
`INSERT INTO library_source_admissions` outside this one route. That third is
optional for v1 but is what makes the rule structural rather than conventional.

## 4. First content — the D2 exclusions (ruling item 11)

The mechanism *is* the exclusion mechanism; no special-case code path is needed.
Four `excluded` rows, `admission_basis` citing the D2 proof, inserted through the
founder route by an explicit gesture — **not** by migration seed data, which
would be an automated write.

```
10db25b4-81cf-4883-8b98-1f313d9ca490   checksum 3b3607c7df9e…
0f05134f-52b7-4361-8886-65b5583b36a5   checksum 50bf8399f190…
558e315c-b570-4301-8bb3-a5bd910970cb   checksum 02ec3cf2df62…
50c416a8-c001-4796-9df2-198cac94291a   checksum a6fa12d361af…
```

Note the ordering property this produces: because the gate is
allowlist-shaped (`state='admitted'`), those four are already excluded by
default today. The explicit `excluded` rows add the *record of the judgment* —
so a later reviewer sees a decision, not an omission.

## 5. Review queue — the founder's admission instrument (feeds D3)

`GET /api/founder/library-admissions?scope=member_wisdom_retrieval` returns one
row per candidate source: `source_id`, title, folder, checksum, current
admissibility state (or `unreviewed`), and — once D3 lands — its provenance
classification, identity confidence, duplicate flag, and transcript-like flag.

D3 populates the evidence columns; **D3 admits nothing.** The founder acts on the
queue. This is the shape requested in the ruling's worked example.

## 6. What this plan deliberately does NOT do

- ⛔ No bulk admission of `Books` (ruling item 7). No batch gesture in v1.
- ⛔ No write to `library_sources.review_status`, and no repurposing of it (item 1).
- ⛔ No live wisdom-corpus wire (item 12) — this ships the *gate*, not the feature.
- ⛔ No inference of admission from folder, `ingestion_status`, embedding coverage, or `review_status` (item 8).
- ⛔ No deletion, move, reclassification, or retagging of any existing source.

## 7. File manifest (minimum)

| # | Path | Purpose |
|---|---|---|
| 1 | `database/migrations/20260812000001_house_source_admissibility.sql` | the table |
| 2 | `lib/library/admissibility.ts` | state type, gate predicate constant, current-state resolver |
| 3 | `lib/library/LibraryService.ts` | `searchAdmitted()` + gate applied to both read paths |
| 4 | `app/api/founder/library-admissions/route.ts` | founder-gated POST/GET |
| 5 | `lib/library/__tests__/admissibility.test.ts` | see §8 |
| 6 | `docs/canon/` or spec addendum | what `admitted` means / does not mean (ruling item 5), authored verbatim |

Six files. No UI in v1 — the route is sufficient to admit sources and to prove
the gate. A Studio-style surface can follow once D3 gives the queue real content.

## 8. Acceptance tests (the properties that must not rot)

1. Unadmitted source → **not** returned by `searchAdmitted()`; still returned by `search()`.
2. Admitted source → returned by `searchAdmitted()`.
3. **Admitted, then source content changes (checksum differs) → NOT returned.** The rule-4 proof.
4. Admitted then later `excluded` (higher `version`) → not returned; both rows still present.
5. `POST` without a founder session → 403; no row written.
6. Fallback path: force semantic search to return zero → full-text path is gated identically.
7. `admitted` row cannot be inserted with NULL `admitted_by`/`admitted_at`.

Test 3 and test 6 are the two that justify the design; if either is dropped, the
plan has been implemented in name only.

## 9. `scope` — RESOLVED (founder ruling, 2026-08-11)

**Ruling:** keep the column. V1 admits exact source versions specifically for
`member_wisdom_retrieval`. **No other surface inherits that admission
automatically.**

Governing principle, as stated: admission is not *"this source is good forever,
everywhere"* — it is a **bounded authority statement**: *"this exact source
version is admitted for this particular compositional use."* An admission for
member-facing wisdom retrieval must not silently become eligibility for
practitioner program authoring, public/community publication,
training/distillation, automated synthesis, admin tooling, or any future MAIA
background process. Letting it would recreate the authority-collapse problem one
level up.

**Conceptual identity of an admission:**

```
source_id + source_checksum + scope + latest append-only judgment
```

⇒ **Admission is source-version-specific AND purpose-specific.**

**`scope` is CHECK-constrained, not a free-form string** (founder design
preference). Even with one value in v1, the constraint prevents
`member_wisdom`, `member-wisdom`, `wisdom_member` and similar folklore from
accumulating.

⭐ The constraint also does governance work beyond spelling: because the CHECK
lives in the schema, **adding a scope requires a new migration** — which under
`database/migrations/README.md` is ledgered, checksummed, reviewed, and never
editable after apply. So *"future scopes require an explicit governance
decision"* becomes a structural fact rather than a convention someone has to
remember. Same principle as the checksum join in §0(b): make the safe behavior
unavoidable rather than memorable.

## 10. `use_constraint` — founder ruling, 2026-08-11 (D1)

**SOURCE ADMITTED ≠ ANY OUTPUT USE PERMITTED.** Admission says MAIA *may consult*
a source; `use_constraint` says what she may *do with what she finds*. Held on
the admission record — ⛔ never in `library_sources.meta`, which is
importer-written (D3 defect #4 is what happens when a governance value takes an
importer default).

| Value | Meaning (founder-defined, conservative) |
|---|---|
| `synthesis_only` | MAIA may retrieve internally and use the source to ground her own explanation, comparison, interpretation, or synthesis, but **must not reproduce source text** except incidental unavoidable fragments. |
| `synthesis_and_short_quote` | MAIA may synthesize **and** reproduce brief attributed quotations where useful — but must still **reject location-based or reconstruction-style requests**. |
| `unrestricted` | Reserved for sources where the house **actually controls the rights**, or the material is clearly public domain **in the relevant edition and use context**. |

⚠️ **`unrestricted` means unrestricted *within MAIA's defined product uses* — NOT
"free of copyright restrictions"** (founder refinement, 2026-08-11). Admitting a
founder-authored work at `unrestricted` grants MAIA broad permission to use it;
it does **not** transfer ownership, place the work in the public domain, license
it to third parties, or authorize any use outside the admitted `scope`. The
author retains the copyright in full. The value names a *permission granted to
this system*, not a *property of the work*. Any UI, log line, or export that
renders `unrestricted` must not imply otherwise.

⛔ **`unrestricted` is never assigned because a source merely seems old.** The
edition-verification pass proved why: three Manly P. Hall titles in the corpus
carry first-publication years of 1928, 1962, and 2000. Author identity predicted
nothing.

**DEFAULT is `synthesis_only`** — the most restrictive value, so a row created
without a deliberate choice fails safe. Same discipline as `scope`: CHECK-
constrained, and widening the vocabulary requires a migration, which is a
governed act.

**Three layers, kept apart** (D1 §5):

```
SOURCE ADMISSION  → use_constraint      (per-source, on the admission record)
REQUEST           → what is being asked (runtime)
OUTPUT POLICY     → what may be emitted (runtime)
```

Two runtime rules apply uniformly regardless of `use_constraint`, and belong to
the request/output layer, not to any source:

1. ⛔ Refuse location-based and reconstruction-style requests for in-copyright
   works — *"give me chapter 7"*, *"pages 20–40"*, *"continue the passage"*,
   and repeated chunk-by-chunk reconstruction across turns.
2. ⛔ Never surface raw retrieved chunks as output merely because retrieval
   returned them. Retrieval is input to cognition, not a display surface.

⚠️ Any numeric quotation limit is a **risk-reduction heuristic, not a legal
threshold** — the Copyright Office is explicit that no word count is safe by
rule. Internal language must not drift into treating a cap as compliance.

---

**Sequence position:** this plan satisfies D4-DECISION. It does not unblock the
live wire, which per ruling item 12 additionally requires D3 (provenance) and
D1 (copyright/use policy). D3 may begin in parallel.
