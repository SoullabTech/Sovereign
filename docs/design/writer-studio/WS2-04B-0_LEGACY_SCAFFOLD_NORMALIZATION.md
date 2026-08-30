# WS2-04B-0 — Legacy scaffold normalization

**Status:** built and witnessed. **Not run against production.**
**Authorized:** founder, 2026-08-30, on the evidence in `0dbe857f8`.

## Why this may run without asking

> The platform may remove a byte without asking only when it can prove that
> byte was introduced by the platform itself, prove the exact intended
> replacement from repository history, and preserve the prior state.
> Otherwise the writer decides.

For this class the proof exists and is not an inference:

```
old draft            === historical composer(Source)     byte-identical
body differences     === 0
every headed section === "# " + that section's Source heading
normalised draft     === current composer(Source)
```

Soullab put those characters there. `5f50f6790` (2026-08-05) records the exact
intended replacement. This is a **correction of system-authored representation,
not an edit of member authorship** — which is what separates it from every
other byte-changing operation on a draft.

## Distinct from conversion, permanently

Conversion promises the member's bytes are unchanged. This changes 346 of them.
They cannot share a transaction without one of them lying. 04B-0 runs **after**
04A conversion, never inside it.

## Preconditions — all of them, or it does not run

```
classification              LEGACY_COMPOSER_VARIANT
whole old draft             exact historical-composer output
body differences            0
legacy headings             H/H exact "# " transforms
boundaries                  N/N resolved
pre-normalization revision  preserved
proposed result             exact current-composer output
transform                   removes only historical "# " prefixes
transaction                 atomic
```

Re-established from the draft's own bytes at run time, never from a
classification recorded earlier.

## The inverse proof

Checking that the output looks like the current composer's would only show the
result is *plausible*. The proof that matters:

```
addHistoricalScaffold(normalized) === the exact pre-normalization draft
```

Byte for byte. This shows the transform changed **nothing else** — a stray
character, a normalised newline, a trimmed heading all surface here and nowhere
else. `addHistoricalScaffold` lives beside the strip so the two cannot drift
into being inverses in name only.

## The one-bad-heading rule

If a single heading fails the exact historical form, normalization does not
run — not for that heading, not for the rest. The draft leaves this class and
requires explicit treatment. Normalising "the parts we're sure about" would
accept a draft whose provenance cannot be proven.

## What the writer is told — afterwards

> **Older formatting was cleaned up.**
> Writer's Studio removed heading markers added by an earlier version. Your
> words were unchanged.

No modal. No decision theatre. A **Details** affordance may expose provenance.

## Witness

174 sections, 357,242 chars in legacy form, against PostgreSQL 16.13:

```
✓ 04A conversion succeeds on a legacy draft
  ⏱  normalizeLegacyScaffoldForDraft   215.3 ms
✓ normalisation succeeds
✓ removed exactly 2 chars per heading (346 for 173)
✓ draft is now exactly the current composer output
✓ no "# " remains
✓ sections still flatten to content (DB invariant held)
✓ scaffolded draft preserved as a revision, byte-identical
✓ revision is labelled
✓ second call refuses: already_normalized

9 passed · 0 failed
```

**346 characters over 173 headings** — the real Elemental Alchemy's exact
numbers. 30 unit tests cover the refusals, the inverse proof, and awkward
manuscripts (a heading that itself starts with `#`, unicode, empty bodies,
blank runs, no headings at all).

## Held

- running it against any production draft
- any draft outside `LEGACY_COMPOSER_VARIANT`
- the `Details` affordance's content (04B UI)
