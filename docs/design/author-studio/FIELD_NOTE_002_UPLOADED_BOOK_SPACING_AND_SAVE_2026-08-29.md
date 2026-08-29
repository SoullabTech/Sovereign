# Field Note 002 — "Do I correct the spacing, or is that the upload?"

**Date**: 2026-08-29
**Source**: Beta writer, working through their own uploaded book in the Studio.
**Status**: Both findings fixed on `claude/writers-studio-spacing-save-1meh7v`.

## What they said

> as I'm going through the uploaded version of the book, do I correct the
> spacing or is the sometimes weird spacing a function of uploading it to the
> author studio? It's telling me it can't save my changes?

Two separate defects, and the first one matters more than it looks: a writer
was spending their writing time hand-correcting spacing that was ours, while
unsure whose it was. That uncertainty is the finding. A member should never
have to guess whether what is on the page came from their work or from our
pipeline.

## Finding 1 — the spacing was the upload

Reproduced against a Word file carrying what Word actually writes (fixture:
`lib/manuscript/ingest/__tests__/fixtures/word-spacing.docx`, its
`document.xml` kept alongside it so the fixture is readable). Extraction
carried through, verbatim:

| Artifact | Where it comes from | How it reads in the writing surface |
|---|---|---|
| Leading `\t` | Word's first-line indent | A wide gap; in markdown, a code block |
| U+00A0 non-breaking space | Word autocorrect | A space that will not wrap |
| U+00AD soft hyphen | Word's optional break | An invisible character mid-word |
| Trailing spaces | Word paragraph ends | The caret lands past the last letter |
| Stacked empty paragraphs | Return pressed for spacing | Chapter gaps of unequal height |

None of it is writing. `lib/manuscript/ingest/normalizeWhitespace.ts` now
normalizes it as the last step of every extraction — docx, PDF text layer, and
plain text alike.

**The line it holds.** Only whitespace is touched; not one letter, digit, or
punctuation mark is added, removed, or reordered. Spacing the author can *see*
survives: two spaces after a period stay two spaces, space indentation stays
(it may be a markdown list), and a shift+enter break keeps its two trailing
spaces. Zero-width joiner and non-joiner are deliberately **not** stripped —
they are load-bearing inside emoji and in several writing systems, and an
invisible character is only removable when it is invisible everywhere
(Invariant 14).

**Provenance.** The extraction identity in `lib/manuscript/source/custody.ts`
is bumped to `+ws-normalize` / `+ws1`. An arrival records the decoder that
produced it, and the source text an arrival holds is now the normalizer's
output — so pre-change and post-change arrivals are genuinely different
extractions of the same bytes and must say so. The artifact bytes are
unchanged and remain in custody, which is what keeps the earlier extraction
reproducible from the later row.

**Not fixed by this**: a manuscript already imported still carries the
artifacts in its saved draft. Nothing here rewrites words a member has already
saved. Re-importing brings the file in clean; correcting by hand is theirs to
decide.

## Finding 2 — "can't save" was a sign-in, described as a glitch

`putDraft` mapped **401** into the generic `error` result. A session that
expired mid-manuscript — exactly the case for a writer returning after time
away — therefore surfaced as *"Could not save just now"* with a **Save now**
button that could never succeed, for as long as they kept typing.

`SaveResult` and `SaverState` now carry `unauthorized` as its own case:

- It does **not** stop the saver the way a conflict does. A conflict is
  unresolvable by retry; this one resolves the moment the writer signs in, and
  the same queued content then saves.
- The content is never dequeued. Nothing typed while signed out is dropped.
- All three surfaces (`WorkingDraftEditor`, `Worktable`, `WritingSurface`) say
  what happened, say that nothing was lost, and offer sign-in **in a new tab** —
  the load-bearing detail, since navigating the draft tab away is the one thing
  that would actually lose the words.
- The failed-save line is no longer dim. In `WritingSurface` the whole margin
  toolbar lifts to full opacity, because CSS opacity compounds and a bright
  child inside a 45% parent is still 45% (W-4).

## Sovereignty check

- **Agency**: increases. A writer can recover their own work instead of being
  told a falsehood about why it will not save.
- **Provenance**: increases with the capability — the extraction identity now
  names the whole pipeline.
- **Restraint**: the normalizer's scope is the narrowest reading of "the
  author's words, unchanged" that fixes the reported problem, and the member
  still reviews the extracted text in an editable field before anything saves.

## Verification

- `npx jest lib/manuscript app/press app/writers-studio` — 199 passed.
- `npm run typecheck` — no regressions.
- `npm run check:no-supabase`, `check:member-owned-boundary` — clean.
- Not yet verified under production load: this is branch state, not Live.
