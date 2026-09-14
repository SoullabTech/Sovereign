# House-Source Admission — what `admitted` means

**Status:** governing definition · **Ratified:** founder, 2026-08-11
**Mechanism:** `database/migrations/20260812000001_house_source_admissibility.sql` · `lib/library/admissibility.ts`
**Plan:** `docs/specs/HOUSE_SOURCE_ADMISSIBILITY_RECORD_PLAN_2026-08-11.md`

---

## The distinction this document exists to protect

> **Admission says MAIA may consult this source.**
> **`use_constraint` says what MAIA may do with what she finds.**

These are separate gates. Collapsing them is the failure this mechanism was built
to prevent — the same shape as the failures already measured in this corpus:
directory placement standing in for source class, extracted metadata standing in
for identity, a column DEFAULT standing in for a judgment.

## What `admitted` means

A named human with house authority has judged **this exact content version** of
**this source** eligible to participate in **one named purpose**.

Admission identity is:

```
source_id + source_checksum + scope + latest append-only judgment
```

⇒ **source-version-specific AND purpose-specific.**

## What `admitted` does NOT mean

- ⛔ **Not** "always retrieve this." Relevance is a separate, later gate.
- ⛔ **Not** "this source is true," and not MAIA's endorsement of any proposition in it.
- ⛔ **Not** permission to reproduce. That is `use_constraint`.
- ⛔ **Not** copyright clearance beyond what the admitting human actually held.
- ⛔ **Not** eligibility for any other surface — practitioner authoring, publication, training, distillation, admin tooling, or a future background process. A new scope requires a migration, which is a governed act.
- ⛔ **Not** permission to override member testimony. What the member said outranks what a source says.
- ⛔ **Not** entry into member memory. Corpus material is external knowledge; it is never presented as something the member said or as a remembered relational event.
- ⛔ **Not** permanent. A later judgment supersedes; changed content revokes automatically.

## What `unrestricted` does NOT mean

⚠️ `unrestricted` is the **broadest permission granted to this system within the
admitted scope**. It is not a statement about the work.

It does **not** mean public domain, relinquished copyright, transferred
ownership, third-party licensing, or permission outside the admitted scope. The
author retains copyright in full. Any UI, log line, or export that renders this
value must not imply otherwise.

## Only a human admits

*"AI suggestions never advance state"* (migration `20260714000001`, carried to the
house corpus by founder ruling 2026-08-11). No script, job, migration seed, or
model output may move a source into `admitted`. The writer requires a founder
session; `admitted_by` is session-derived; a body-supplied value is **rejected,
not ignored**.

## Admission identity beats source metadata

```
source metadata    = what ingestion extracted
admission identity = what the admitting human says this artifact actually is
```

The latter governs. `admitted_title` / `admitted_author` are entered by the
admitting human and are never defaulted from `library_sources`. Member-facing
attribution reads the admission record.

The reason is measured, not theoretical: 68% of `Books` author values are
implausible extractions, and titles are H1-derived — which is exactly how a
Kelly↔MAIA conversation transcript came to be stored with a book's title.

## Absence is a state

No admission row means **`unreviewed`**, and `unreviewed` is not eligible.
Everything fails closed: no row, a non-`admitted` latest judgment, a changed
checksum, an unrecognised scope. Eligibility is an allowlist, never a denylist.

## Two runtime rules, independent of any source

These belong to the request/output layer and apply regardless of `use_constraint`:

1. ⛔ Refuse location-based and reconstruction-style requests for in-copyright
   works — *"give me chapter 7"*, *"pages 20–40"*, *"continue the passage"*, and
   repeated chunk-by-chunk reconstruction across turns.
2. ⛔ Never surface raw retrieved chunks as output merely because retrieval
   returned them. **Retrieval is input to cognition, not a display surface.**

⚠️ Any numeric quotation limit is a risk-reduction heuristic, **not a legal
threshold** — the U.S. Copyright Office is explicit that no word count is safe by
rule. Internal language must not drift into treating a cap as compliance.
