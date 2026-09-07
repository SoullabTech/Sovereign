# Export exports the current draft — repair record

**Lane**: Writer's Studio · export semantics
**Branch**: `fix/export-current-draft` (from `origin/clean-main-no-secrets`)
**Founder ruling**: 2026-09-07 — *"`.docx` / `.pdf` should export the current draft"*, then **"Take A"**
**Status**: BUILT · tests green · ⛔ NOT MERGED · ⛔ NOT DEPLOYED · ⛔ NOT WITNESSED

---

## 1 · The defect

`POST /api/sovereign/manuscripts/[id]/render` read `manuscript_sections` — the **Source**. A writer
could revise a chapter in WRITE, export, and receive the **pre-revision text**. The export
succeeded. Nothing refused. Census: `docs/programme/WS-EXPORT-SEMANTICS_CENSUS_2026-09-07.md`.

## 2 · Take A, as ruled

`heading = null`, `body = exact manuscript_draft_sections.text`. No stripping. No inferred
first-line heading. No reconstruction from Source metadata.

Three branches, in order:

| draft state | exported |
|---|---|
| section-addressable draft | one entry per `manuscript_draft_sections` row, `ORDER BY position ASC`, `heading: null`, `body: text` |
| continuous draft | one span: `heading: null`, `body: content` — a continuous draft has no section identity and is not cut into invented ones |
| **no draft has ever existed** | the Source, with its own `heading` — not a stale fallback: with no draft, the Source **is** the current state |

⛔ **`heading` is NULL by ruling, not by gap.** `manuscript_draft_sections` has no heading column by
decision: the stored text *contains* its heading bytes. write-state's `heading` is a **prefix match
against the Source** — a reading of the text, not a field beside it — so passing it would print
every chapter title twice, once from the renderer's `# ` and once from the writer's own characters.
The alternative, stripping a matched prefix, **silently eats a chapter's first line when the match
is wrong**. Visible limitation accepted over invisible destruction:

> Export the writer's characters before beautifying the writer's structure.

## 3 · Export is not keeping

No revision, no checkpoint, no kept version is minted. A version the writer did not choose to keep
is still not a kept version, so export must not obtain a frozen one by making it.

`draftVersion` (optional, number) is the settle guard: a caller that **names** the version it
believes it settled is refused **409 `unsettled_draft`** if the draft moved under it, rather than
handed a state nobody was looking at. A caller that omits it gets no settle guarantee — *the server
cannot flush a client's autosave; it can only decline to disagree with one.*

⛔ **NO CALLER SENDS IT YET.** `app/press/manuscript/page.tsx:563` posts `{ format }` only. The
guard is real and unreached — the mirror of this lane's recurring "the command exists, the door
doesn't". Recorded rather than claimed; wiring it is a separate act.

## 4 · Correction to the census

The census wrote "render `.docx`/`.pdf`". **The route renders `pdf` and `epub`.** `.docx` appears in
that surface only on the **import** accept list (`.txt,.md,.markdown,.docx,.pdf`). The defect and
the repair are unchanged; the format names in that row were wrong and are corrected here rather
than edited there.

## 5 · Evidence — class L (laboratory) only

- `app/api/sovereign/manuscripts/[id]/render/__tests__/currentDraftExport.test.ts` — source scan,
  comments stripped first (Circles C21), with the strip **proven** load-bearing rather than assumed.
- `app/api/sovereign/manuscripts/[id]/render/__tests__/route.test.ts` — behaviour: the draft is
  rendered and **the Source read never happens**; text travels code point for code point
  (`# Chapter One`, `—`, `“café”`, `𝄞`, trailing space); a continuous draft exports as one span;
  409 on an overtaken `draftVersion` with **nothing rendered and nothing recorded**; 400 on a
  non-numeric `draftVersion` and on a whitespace-only draft.
- `24 passed · 0 failed` (both suites) · `npm run typecheck` **229 vs baseline 239 · 0 regressions**
  · `npm run check:no-supabase` clean.

### Fixture note, worth keeping

The four pre-existing render tests failed with **500** the moment the draft read was added — not
because the route broke, but because their `mockResolvedValueOnce` chain had shifted one place and
the manuscript row was being handed to the section reader. They now dispatch **by table**, and an
unrecognized query **throws** rather than returning `{ rows: [] }`: a silent empty answer for a read
nobody anticipated is how a route under test quietly stops exercising the path the test names.

A test-only over-reach was also corrected in the making: `not.toMatch(/heading: (?!null)/)` failed
the route for its **own legitimate Source fallback**. Replaced with an enumeration of every
`heading:` in the file, so a NEW source of one turns the list red without banning the one place a
heading is genuinely the member's.

## 6 · What this does not do

⛔ Not merged · ⛔ not deployed · ⛔ no production witness · ⛔ no schema change · ⛔ no migration ·
⛔ no client wiring of `draftVersion` · ⛔ inline marks remain unaddressed (an export that reads the
draft at all was the prerequisite; marks are the next sequence step, not part of this act).

**Invariant 5 of the ruling is now satisfied in code and only in code**: a source-backed
`.pdf`/`.epub` can no longer masquerade as the current manuscript — *on this branch*. Deployed ≠
demonstrated.
