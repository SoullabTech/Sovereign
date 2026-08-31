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

## Finding 1 — the spacing is the upload, and only one part of it is ours to fix

Reproduced against a Word file carrying what Word actually writes (fixture:
`lib/manuscript/ingest/__tests__/fixtures/word-spacing.docx`, its
`document.xml` kept alongside it so the fixture is readable). Extraction
carried all of this through, verbatim:

| Artifact | Where it comes from | How it reads in the writing surface |
|---|---|---|
| Leading `\t` | Word's first-line indent | A wide gap; in markdown, a code block |
| U+00A0 non-breaking space | Word autocorrect | A space that will not wrap |
| U+00AD soft hyphen | Word's optional break | An invisible character mid-word |
| Trailing spaces | Word paragraph ends | The caret lands past the last letter |
| Stacked blank lines | Return pressed for spacing | Chapter gaps of unequal height |

The first draft of this repair normalized all of it, in every format. **That was
overbroad and was withdrawn** (founder ruling, 2026-08-31). The governing rule:

> Do not decide which of a manuscript's visible spacing was authored and which
> was import furniture unless the source format gives us the evidence for that
> distinction.

Under that rule most of the table above is the author's text until proven
otherwise. In a `.txt` manuscript, `Scene one.\n\n\n\nScene two.` may be a
deliberate scene break; a leading tab may be the author's own indent; and
U+00AD, U+200B, U+2060, U+FEFF are characters, so removing them is a decision
about content and not about spacing at all.

### What ships: one row of that table

Word's first-line indent arrives as a `<w:tab/>` element standing before the
paragraph's first word. The DOCX structure *proves* that is presentation rather
than a typed character — so `lib/manuscript/ingest/docxIndentTabs.ts` drops it
on mammoth's **document tree**, before the file is flattened. Once it is a
string, a tab is just a tab and the evidence is gone; the tree is the only place
the judgement can honestly be made.

It also fixes a rendering corruption rather than a preference: a line beginning
with a tab is a markdown code block, so the author's opening paragraph arrived
in a monospace slab.

### What was written and withdrawn

- Tabs **between** words — a column the author may have built. Untouched.
- Blank-line runs — possibly a scene break. Untouched.
- Non-breaking, thin and ideographic spaces — characters. Untouched.
- Soft hyphens, ZWSP, word joiner, BOM — characters. Untouched.
- Trailing whitespace — invisible, but authored. Untouched.
- **PDF and plain text are not transformed at all.** A PDF text layer has no
  reliable distinction between authored spacing and typesetting, and in a `.txt`
  or `.md` manuscript the whitespace *is* the source.

Two tests hold this boundary from both sides: one asserts the indent tab is
gone, the next asserts every other artifact in the same file survives.

**Provenance.** Only the DOCX identity in `lib/manuscript/source/custody.ts`
changes, to `mammoth-convertToMarkdown+drop-indent-tabs` /
`mammoth@1.12.0+indent1`. PDF and text keep their original identities because
nothing was added to them. The artifact bytes are unchanged and remain in
custody, which is what keeps the earlier extraction reproducible from the later
row.

### An already-imported Work is NOT to be re-imported for this

**Prohibited.** Once a Work is section-addressable, its section UUIDs are
working identities — frozen structural proposals reference them, and the
Writer's Studio reading is built on them. Re-importing to clean spacing would
mint new identities and orphan that work. This repair applies to imports made
after it ships and to nothing else.

For the reporting writer's existing book, the honest answer is the first half of
their question: the spacing they were correcting came from the upload, not from
their manuscript. Whether to keep correcting it by hand is theirs to decide, and
the residue this repair does not remove (non-breaking spaces, blank-line runs)
stays residue. A member-invoked "tidy the spacing" gesture — the writer asking,
on their own Work, with the change visible — is a different lane and is not
proposed here.

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
- **Provenance**: increases with the capability — the DOCX extraction identity
  names the one transform it performs, and the formats that transform nothing
  say nothing.
- **Restraint**: the transform runs only where the source format proves the
  distinction it depends on. Everything the format leaves ambiguous is left to
  the author, and the member still reviews the extracted text in an editable
  field before anything saves.

## Ruling of record (founder, 2026-08-31)

```text
401 / expired-session repair      PASS
queued-content recovery           PASS
writer-facing recovery copy       PASS

DOCX spacing diagnosis            PASS
global normalization policy       WITHDRAWN
plain-text normalization          WITHDRAWN · was overbroad
PDF normalization                 WITHDRAWN · insufficient provenance
DOCX indent tab, on the tree      SHIPS · the format proves it
existing Work re-import           PROHIBITED
```

## Verification

- `npx jest lib/manuscript app/press` — 138 passed.
- `npm run typecheck` — no regressions.
- `npm run check:no-supabase`, `check:member-owned-boundary` — clean.
- Not yet verified under production load: this is branch state, not Live.
