# WS2-04A — Compatibility contract

**Status:** substrate implemented, **no production draft converted.**
**Authorized:** founder, 2026-08-30, on `87f07543c`.

## The rule that governs everything here

> A draft is section-addressable **only when the section-aware write path is
> the writing authority for it.**

The current writing UI edits one continuous string, `manuscript_working_drafts
.content`. Seeding sections while that editor still writes only `content`
would create two writable truths and they would drift on the writer's next
keystroke — which is the exact problem this unit exists to eliminate. So the
converter exists, is tested, and is **not invoked against production data**.
Conversion happens at the WS2-04B handoff, per draft, when the section-aware
write path takes over.

## What is built

| artifact | what it does |
|---|---|
| `database/migrations/20260830000001_manuscript_draft_sections.sql` | additive table + two nullable columns + the round-trip constraint triggers |
| `lib/manuscript/sections/seedInvariant.ts` | `flatten` / `verifyRoundTrip` / `assertRoundTrip` |
| `lib/manuscript/sections/convertDraft.ts` | `planConversion` (pure) + `convertDraftToSections` (transactional) |
| `lib/manuscript/sections/draftProof.ts` · `composers.ts` · `myers.ts` | the classification rule, moved out of `scripts/` — production conversion must not depend on instrumentation code |
| `scripts/ws2-04a-substrate-witness.ts` | the acceptance witness: schema, conversion, idempotency, both trigger directions, cascade, source untouched |

## Witness result

Two runs against a throwaway PostgreSQL **16.13**, 2026-08-30.

| run | shape | result |
|---|---|---|
| synthetic | 4 sections | **24 passed · 0 failed** |
| copy path | **185 sections, 669,064 chars** | **26 passed · 0 failed** |

The second copies a real manuscript's sections and draft into a disposable
one, converts the copy, and proves the original byte-identical and unconverted
afterwards.

### Timings at book scale — is `string_agg` affordable?

| step | ms |
|---|---|
| copy into disposable manuscript | 51.4 |
| `convertDraftToSections` (one-time) | 307.0 |
| second call, idempotent | 13.8 |
| content-only write → abort | 10.2 |
| section-only delete → abort | 4.4 |
| **consistent two-sided write → commit** | **9.4** |
| delete manuscript, cascade | 10.4 |

The number that matters for 04B is the last-but-one: **~9 ms for a checked
write on a 669 KB, 185-section draft**, including the round trip. The
invariant is affordable on a live writing surface at a debounced autosave
cadence. It is NOT free per keystroke, and the cost grows with draft size —
04B should keep autosave debounced rather than fire a save per character.

Conversion at 307 ms is one-time per draft and runs behind the "your draft is
now navigable by section" moment, not in the typing path.

Caveat on the shape: the 185-section book was synthetic (uniform paragraphs),
which is representative for byte-level timing but not for pathological section
size distribution.

## The invariant is enforced in the database, not only in code

Once `section_addressable_at` is set, `content` must equal the flattening of
that draft's sections. Two `CONSTRAINT TRIGGER`s, `DEFERRABLE INITIALLY
DEFERRED`, check it at COMMIT from both sides — a section write and a content
write each verify the same equality.

Deferring to commit is what lets one legitimate transaction touch sections and
content in either order. Checking at all is what makes drift **impossible to
commit** rather than a condition to detect later.

The comparison is raw `text` equality: no trim, no whitespace normalisation.
"Close enough" is the failure this exists to prevent.

One deliberate exemption: if the draft row is gone (manuscript deletion
cascade) the check returns without complaint. Member deletion sovereignty
outranks this invariant, as it already outranks the append-only guarantee on
`working_draft_revisions`.

## Legacy scaffolding is NOT removed during conversion

Founder correction, and it is a contradiction rather than a preference:

```
flatten(sections) === the old continuous draft     ← the invariant
strip "# " from headings                           ← changes those bytes
```

Both cannot be true of one transaction.

So a legacy draft **seeds like any other — byte-exactly, with its `# `
scaffolding intact.** The boundary of a rewritten heading is still uniquely
located (it is the line that replaced it), so the partition is exact either
way. What the member's draft contains is what the sections contain.

Scaffold **removal** is held, permanently outside conversion: it is a separate
transform, with its own proof and its own disclosure, because it changes the
member's bytes and conversion promises it does not.

Production has zero drafts in this class today, so nothing here is exercised
against real data.

## Every refusal, and why it refuses

| refusal | meaning |
|---|---|
| `draft_not_found` | no draft for that manuscript and member |
| `withheld_instruments_disagree` | the proof's two passes disagree — nobody acts, the instrument gets fixed |
| `no_source_sections` | no boundaries exist to derive; the writer creates structure |
| `boundary_moved` | a heading rewritten or deleted — only the writer can say where the break now falls |
| `boundary_offsets_incomplete` | a boundary could not be located in the current draft, or the alignment ran backwards |
| `leading_text_before_first_boundary` | text sits above every boundary; absorbing it would attribute it to section 0, dropping it would lose it |
| `already_converted_inconsistently` | sections exist but no longer flatten to the draft — reported, never silently repaired |

The service converts **without asking the member**, so a refusal is the
feature. Every case where the structure is not already proven has to stop.

## Idempotency

A second call never creates a second set of sections. It verifies the existing
sections still flatten to the draft and returns `already_converted`, or stops
with `already_converted_inconsistently`. It does not repair: a disagreement
between the two representations is a finding, and quietly rewriting one to
match the other would destroy the evidence of whichever is wrong.

## Ordering inside the transaction

1. `SELECT … FOR UPDATE` the draft — a concurrent save waits rather than landing between the proof and the partition
2. re-prove classification against the **locked** content (nothing from an earlier census is carried in)
3. refuse per the table above
4. derive cut offsets **in the member's current draft**, never in a recomposed Source
5. `assertRoundTrip` — throws, so a lossy partition rolls back
6. insert sections
7. write the exact pre-conversion draft into the existing `working_draft_revisions` lineage
8. set `section_addressable_at` and `section_conversion_version`
9. commit — where the deferred triggers re-check the invariant independently

Step 4 is load-bearing for the two production `EDITED` books: cutting a
recomposition of the Source instead of their own text would silently discard
everything they wrote.

## Held, not built

- production bulk backfill
- Structure Adoption UI
- `NO_SOURCE` automatic structuring
- legacy scaffold removal (permanently outside conversion, per above)
- WS2-04B chapter-click UI

## Open finding — four `book-print-kdp-final` drafts

Three of the four share content hash `661173f91e62` under **three different
manuscript ids**. That is duplication at the content level; it is **not** yet
evidence that any row is disposable. Different provenance, Works, revisions,
Keeps, collections, or member intent may attach to each.

**No merge, no delete, no canonical-id guess.** Before any bulk conversion, a
read-only provenance census across all four: creation times, member ownership,
source identity and hash, revision histories, Work relationships,
Keeps/collections, import provenance.

It does not block substrate work, because bulk conversion is held anyway.
