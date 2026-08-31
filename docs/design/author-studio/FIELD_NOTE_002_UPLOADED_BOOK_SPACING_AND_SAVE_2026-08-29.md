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

## Finding 1 — the spacing IS the upload, and none of it is ours to remove

Reproduced against a Word file carrying what Word actually writes (fixture:
`lib/manuscript/ingest/__tests__/fixtures/word-spacing.docx`, its
`document.xml` kept alongside it so the fixture is readable). Extraction carries
all of this through:

| Artifact | Where it comes from | How it reads in the writing surface |
|---|---|---|
| Leading `\t` | Someone pressed Tab | A wide gap; in markdown, a code block |
| U+00A0 non-breaking space | Word autocorrect, or typed | A space that will not wrap |
| U+00AD soft hyphen | Word's optional break | An invisible character mid-word |
| Trailing spaces | Word paragraph ends | The caret lands past the last letter |
| Stacked blank lines | Return pressed for spacing | Chapter gaps of unequal height |

**The diagnosis stands. Every proposed repair was withdrawn.** The governing
rule, and it did the work here:

> Do not decide which of a manuscript's visible spacing was authored and which
> was import furniture unless the source format gives us the evidence for that
> distinction.

### Two attempts, both withdrawn

**First: normalize whitespace across all three formats.** Overbroad, withdrawn
2026-08-31. `Scene one.\n\n\n\nScene two.` may be a deliberate scene break; a
leading tab in a `.txt` may be the author's own indent; and U+00AD, U+200B,
U+2060 and U+FEFF are characters, so removing them is a decision about content,
not about spacing.

**Second: drop only Word's first-line indent tab, on the document tree.** The
argument was that a `<w:tab/>` standing before a paragraph's first word is
presentation the DOCX structure proves. **It is not, and the claim was false.**
Withdrawn the same day.

The predicate the code actually ran was *"a tab node before the first text
node"* — position, not provenance. It deleted two tabs from a doubly-indented
paragraph on the reasoning that they appeared early.

### What the format actually contains — settled, not argued

Tested directly (fixture: `indent-kinds.docx`, with its `document.xml`):

```text
<w:pPr><w:ind w:firstLine="720"/></w:pPr>   →  NO text emitted
<w:pPr><w:pStyle …indent-carrying…/></w:pPr> →  NO text emitted
<w:r><w:tab/></w:r>                          →  "\t"
```

A true paragraph-format indent produces **no text through mammoth at all**. So
there is no seam where a formatting property is being wrongly materialized as a
character — the repair that would have been legitimate does not have a defect to
repair. And it follows that **a tab which does reach the text is a tab a person
typed.** Deleting it is an authorship inference wearing a provenance argument.

A test pins this, so the transform is not rediscovered as a good idea.

### The durable finding

> **The source survives correctly; Writer's Studio rendering can misinterpret
> that surviving source as Markdown code.**
> — founder, 2026-08-31

That is the sentence this lane produced, and it relocates the problem: what
remains is a **future rendering** problem, not an import-normalization one. The
writer's complaint is still real — a tab-led paragraph reads as a code block, so
their opening paragraph arrives in a monospace slab — and the honest repair is on
the other side of the seam: preserve the author's tab as source, and stop the
Studio's rendering from reading a tab-indented paragraph as code. Not built, not
authorized, named here so it is not lost.

The residue this leaves — non-breaking spaces, blank-line runs, trailing spaces
— stays residue. A member-invoked *"tidy the spacing"* gesture, on their own
Work, with the change visible before it is taken, is a different lane and is not
proposed here.

### An already-imported Work is NOT to be re-imported for this

**Prohibited.** Once a Work is section-addressable, its section UUIDs are
working identities — frozen structural proposals reference them, and the
Writer's Studio reading is built on them. Re-importing to clean spacing would
mint new identities and orphan that work.

For the reporting writer, the answer to their question is the whole of it: the
spacing came from the upload, not from their manuscript, and we are not going to
silently decide which of it they meant.

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
- **Provenance**: unchanged, because the capability was withdrawn. No extractor
  identity moves; every reading is still what its decoder produced.
- **Restraint**: the whole spacing repair was given up rather than shipped on an
  inference. The member still reviews the extracted text in an editable field
  before anything saves, which is where a decision about their spacing belongs.

## Ruling of record (founder, 2026-08-31)

```text
401 / expired-session repair      PASS
queued-content recovery           PASS
writer-facing recovery copy       PASS

DOCX spacing diagnosis            PASS
global normalization policy       WITHDRAWN
plain-text normalization          WITHDRAWN · was overbroad
PDF normalization                 WITHDRAWN · insufficient provenance
DOCX indent-tab deletion          WITHDRAWN · provenance disproved
  → no formatting property is materialized as text; a tab in the
    text was typed. Nothing ships from this finding.
tab-led paragraph renders as code NAMED · a future RENDERING problem,
                                  not an import-normalization one.
                                  Not built.
existing Work re-import           PROHIBITED
```

## Verification

- `npx jest lib/manuscript app/press` — 138 passed.
- `npm run typecheck` — no regressions.
- `npm run check:no-supabase`, `check:member-owned-boundary` — clean.
- Not yet verified under production load: this is branch state, not Live.
