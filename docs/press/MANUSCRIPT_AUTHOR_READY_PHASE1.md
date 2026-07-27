# Soullab Press — Manuscript Room, author-ready (Phase 1)

**Status:** implemented on `feature/press-author-ready` (branched from
`clean-main-no-secrets`), not merged, not deployed. Awaiting the founder's
one-author walk before any merge/deploy decision.

## Why this exists

Founder ruling (2026-07-26): turn the Manuscript Room from a *recognition*
surface into a **minimum end-to-end author path**. Success criterion, verbatim:

> One ordinary author uploads a Word manuscript, works entirely within Soullab
> Press, and leaves with a publication-quality PDF/EPUB that is unmistakably
> their own work — authorship, provenance, and approvals preserved.

Then stop, put it in front of one real writer, and let their experience decide
Phase 2. Writer C ("has a substantially complete manuscript, needs to finish")
is served first.

## What it does (the three gaps closed)

- **G1 — ingest**: the Manuscript Room now accepts `.docx` and `.pdf` in
  addition to `.txt`/`.md`. `.docx` is converted to Markdown so Word heading
  styles (Heading 1/2) survive as `#`/`##` and feed the existing mechanical
  segmenter; `.pdf` yields its text layer, and a scanned/image PDF is reported
  plainly (no OCR — deliberately out of scope). Extraction is server-side and
  member-scoped; the extracted text is shown to the member to review before
  anything is saved.
- **G2 — member render**: a member's saved manuscript can be rendered into a
  book from their own sections, in order, verbatim — reusing the proven render
  engine (pandoc → HTML → Paged.js/Puppeteer for PDF; pandoc epub3 for EPUB)
  with **all founder coupling stripped** (no Elemental Alchemy source, no
  canonical plates, no Atlas QR, no Soullab imprint). CSS comments are stripped
  so no founder identity is embedded in the member's file.
- **G3 — export**: the member downloads the rendered PDF/EPUB. The bytes are
  rendered to a temp file, streamed as an attachment, and deleted — a member's
  manuscript is never written to a public/served path.

## Constitutional lines (must hold)

- **Authorship never moves.** The book is 100% the author's own words. Nothing
  is generated, woven, summarized, or inferred. Ingest and render are
  deterministic (mammoth, pdf-parse, pandoc, Puppeteer) — no AI provider added.
- **The book is theirs.** Only the author's own title and name appear. No
  Soullab imprint/colophon is stamped into the private book by default (a
  colophon would be a separate per-surface founder ruling).
- **Private by construction.** Member-scoped auth (`getMemberIdFromRequest` →
  401); render/download is ownership-gated (404 on another member's manuscript,
  no existence leak). No share/publish path; the room is not linked in nav.
- **Provenance + approval.** Each render records an approval/provenance row
  (`manuscript_renders`): manuscript, member, format, source section count, a
  sha256 of the exact source sections, page count, and when the member
  authorized it. Counts + hash only — never content, never interpretation.

## Surface

- Ingest: `POST /api/sovereign/manuscripts/ingest` (multipart) →
  `{ text, warnings, title }`. Helpers: `lib/manuscript/ingest/parseUpload.ts`,
  `lib/manuscript/ingest/segment.ts` (segmentation extracted from the existing
  save route, unchanged).
- Render: `POST /api/sovereign/manuscripts/[id]/render` `{ format }` → streams
  the file. Engine: `lib/manuscript/render/renderMemberBook.ts`.
- Schema: `database/migrations/20260726000001_manuscript_renders.sql`.
- UI: a "Your Book" tab in `app/press/manuscript/page.tsx` (PDF · EPUB), plus
  `.docx`/`.pdf` upload and scanned-PDF warnings.

## Deferred (explicitly out of this slice)

G6 deeper recognition (DOCX heading mapping incidentally improves sectioning,
but it is not a build target) · G4 sharing · G5 nav discoverability ·
KDP/distribution · payments · any AI drafting/weaving/summarizing · OCR for
scanned PDFs.

## The author walk (acceptance)

Requires the production/container runtime (pandoc + Chromium, both already in
the `maia-sovereign` image). End-to-end render was smoke-verified locally
(pandoc 3.x + Puppeteer): DOCX → sections → PDF (multi-page) + EPUB, author
content present, zero founder content. The acceptance event is a real author
signing in, uploading a Word manuscript, and downloading a book that is
unmistakably theirs.
