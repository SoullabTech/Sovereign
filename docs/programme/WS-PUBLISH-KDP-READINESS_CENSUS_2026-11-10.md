# WS Publish → Amazon KDP readiness: census (read-only)

**Date:** 2026-11-10 · **Canonical bound:** `origin/clean-main-no-secrets` = `c3798a42088d17b88536f93b0d6d9b661fbd5334` (`git ls-remote`, this session). Every repo claim below is read from that SHA by `git show`, not from a worktree.
**State:** `DISCOVERED`. Nothing built, nothing deployed, no hold touched, no member data read. **STOPPED for founder review.**
**Governing holds (unchanged):** HOLD #1938 (Writer release ledger), owner record #1800, PDF/EPUB hold record **#1899**, author-proof approvals #1897, recovery/erasure #1891, Class A #1969.

## 0. Headline

Publish is **not missing**. Canonical already has a real KDP-shaped pipeline: a 6×9 mirrored-margin PDF interior, an EPUB3 with navigation, embedded fonts, a copyright preflight, a KDP paperback cover/spine calculator that matches KDP's formula exactly, and a Publish room that names KDP Paperback / Hardcover / Kindle as paths. A fictional render from canonical (section 4) produced a file that meets KDP's interior rules on every crossing I could measure.

What stands between a writer and KDP is not the renderer. It is:
1. **Delivery is held on purpose**, at two layers (app hard-off and Caddy edge 423). The record is #1899.
2. **Canonical is not production.** #1899 records production on a frozen release source with `exportReleasePolicy.ts` and print profile `hallmark-6x9-v2`. Neither exists at `c3798a420`, which has `memberBookExportRelease.ts` and `hallmark-6x9-v1`. Building KDP work on canonical before that is reconciled would create a second source line, which is a stop condition.
3. **A known P0 isolation gap** on canonical: member Markdown reaches Chromium with raw HTML enabled (#1899, 2026-10-22).
4. **Covers are a study, not a file.** No KDP cover PDF can leave Studio.
5. **Garbage in, book out.** The render is verbatim over sections, so the open print-file import defect (`dd1a3718…`) would publish as a malformed book.

## 1. What exists (recovered, by SHA `c3798a420`)

| Piece | Path | What it does |
|---|---|---|
| Publish room | `app/dev/writers-studio-pc3-live/P4R1PublishRoom.tsx` | Mounted by `/writers-studio?mode=publish&m=…`. Composes InteriorProof, CoverStudy and ProducePanel. `exportsCertified` is read from server release authority. |
| Produce panel | `…/P4R1ProducePanel.tsx` | Paths `kdp-paperback`, `kdp-hardcover`, `kindle`, `print-pdf`, `soullab-press`. Preflight (title, section count, source authority/revision, blocking issues). Shows "Planned KDP interior profile · not a KDP approval". Paperback step 7 computes cover and spine from the rendered page count. Hardcover links out to KDP's template generator ("Studio will not approximate it"). |
| Interior proof | `…/P4R1InteriorProof.tsx` | On-screen reading view in Literary, Classic or Contemporary styles. Self-described as "NOT printed pagination, a PDF proof … or an export." |
| Cover study | `…/P4R1CoverStudy.tsx` + `lib/writersStudio/publish/coverDesignSession.ts` | In-memory front/back/Kindle composition, undo/redo. "No save, no file export, no KDP approval." No ISBN, no asset upload. |
| KDP cover geometry | `lib/writersStudio/publish/kdpCoverGeometry.ts` | 6×9, 0.125″ bleed, white 0.002252″/page, cream 0.0025″/page, spine text if pages > 79. Tested. |
| Page-flow check | `lib/writersStudio/publish/printPageQuality.ts` | Flags empty or sparse pages for human proofing. Content-free output. |
| Member renderer | `lib/manuscript/render/renderMemberBook.ts` | Pandoc → HTML → Paged.js/Puppeteer PDF at 6×9 with page-size assertion. Pandoc EPUB3 with `--toc --toc-depth=2`. Embeds pinned Spectral woff2. Publication roles come from heading words plus stored depth, never body prose. `inspectBookProduction` blocks ungoverned or duplicate copyright. Profile `hallmark-6x9-v1`. |
| Print stylesheet | `lib/manuscript/render/print-book.css` | `@page` 6in×9in. Recto margins T0.75 R0.6 B0.75 L0.9 (inside 0.9). Verso mirrored. Folio bottom-centre, none on `:first`. |
| Render route | `app/api/sovereign/manuscripts/[id]/render/route.ts` | GET is the preflight. POST `{format: pdf|epub}` gives 401 / 404 for a foreign Work / 409 if stale / **423 `MEMBER_BOOK_EXPORT_HELD`** before any prose is read, while `isMemberBookExportReleased()` returns `false` (hard-coded). Even past that gate it requires `writerReleaseAuthority().exportsCertified[format]`, which is `{pdf:false, epub:false}` in manifest `writer-full-beta-encrypted-source-intake-released-20261102`. |

**Write's `Export` tool:** I did not find an `Export` control in `app/writers-studio/full-redesign/*.tsx` or `app/dev/writers-studio-pc3-live/*.tsx` at `c3798a420`. This is an absence in the search, not proof the tool doesn't exist. The founder should say where they saw it before anyone relies on this.

**Preserve branches checked** (ahead/behind against `c3798a420`):
- `feature/ws-publish-preview-20261010`: 143 ahead / 1088 behind. Safe Publish preview and device copy, sitting on the old ws-beta stack. Its preview looks superseded by the canonical room; I did not diff it file by file.
- `claude/chapter-10-kdp-revision-fee7ot`: 2 ahead. Embeds static EB Garamond for the **founder** book script (`scripts/render-book-print.ts`). The member path already embeds Spectral.
- `book-studio/isbn-hardcover-update`: 1 ahead. The founder book's hardcover ISBN in a doc. Not product code.
- `book-studio/page-proof-v2-renderer`: 1 ahead. Legacy canvas. Do not build into it.

## 2. Where the holds live

- **App layer, on canonical:** `lib/manuscript/render/memberBookExportRelease.ts` returns `false` ("A plan, tier, query parameter, browser state, or environment variable cannot certify member book delivery."). `releaseAuthority.ts` has `exportsCertified` false for both formats.
- **Edge layer, production:** #1899 records "All-caller Caddy POST 423 for `/api/sovereign/manuscripts/:id/render` on apex and several hostnames", re-witnessed 2026-10-22 (R8 follow-up, fictional UUID → 423).
- ⚠️ **The 423 text you quoted is not in git.** "Book file downloads are awaiting certification" and "Book rendering is awaiting authorization review" appear in no tracked file on any branch (`git log --all -S`, `git grep` at `c3798a420`). The tracked `Caddyfile` and `infra/Caddyfile` contain no such matcher. So the production Caddy hold config sits **outside repository custody**. I did not read production Caddy, and I make no claim about its contents beyond #1899's record.
- **Record of the holds:** #1899, "Writer's Studio PDF/EPUB — private draft download admission and separate certified edition release [HOLD]". Its Track A lists owner-admitted repairs owed before even a limited private-copy beta. KDP or edition release is explicitly a separate, later track.

## 3. KDP requirements against Studio, crossing by crossing

Legend: **WORKING** = present on canonical and witnessed in section 4 · **CODE-ONLY** = present, not witnessed · **BROKEN** = present but wrong or unsafe · **ABSENT** · **HELD** = works but deliberately blocked.

| # | KDP requirement (source) | Studio state | Evidence |
|---|---|---|---|
| 1 | Interior is a PDF at the chosen trim (Trim/Bleed/Margins [K1]) | **WORKING · HELD** | Fictional render: 432×648 pt = 6×9 in, 43 pp. Member delivery 423. |
| 2 | Trim size: 6×9 is the US standard; many others allowed [K1] | **WORKING (6×9 only)** | Hard-coded in the CSS, `pagedPdf`, `kdpCoverGeometry` and ProducePanel. No other trim offered. Disclosed truthfully in the UI. |
| 3 | Page count within the trim's min/max (6×9 B&W white 24–828, cream 24–776) [K1] | **ABSENT as a check** | The render reports `pageCount`, but nothing compares it to KDP's range. |
| 4 | Inside (gutter) margin by page count, 0.375″ up to 0.875″ (701–828 pp) [K1][K2] | **WORKING** | Fixed 0.9″ inside covers every band to 828 pp. Measured: verso inside ≥0.99″, recto inside 0.90″. |
| 5 | Top, bottom and outside ≥0.25″ without bleed [K1][K2] | **WORKING** | Measured outside 0.60″, top 0.73″, bottom to folio 0.286″ (passes, tight). |
| 6 | Bleed: if one page bleeds, the whole file must [K1] | **WORKING (no-bleed by design)** | No-bleed profile only. Images are not full-bleed. The UI says "No bleed". |
| 7 | Pagination: sequential, even left / odd right [K2] | **CODE-ONLY** | CSS mirrors `:left`/`:right` and uses a `counter(page)` folio. Measured margins alternate correctly. Odd/even folio side not individually verified. |
| 8 | Fonts embedded, min 7 pt [K2] | **WORKING** | `pdffonts`: Spectral Regular and SemiBold, emb=yes, sub=yes. Body 11 pt, folio 9 pt. |
| 9 | No bookmarks, comments or metadata in submitted files [K2] | **BROKEN (minor, unproven)** | PDF Info carries `Title` (and Skia Producer). KDP's wording forbids "metadata". Whether KDP actually rejects an Info title is unverified. |
| 10 | Not encrypted, no missing or excessive blank pages [K3 checklist][K2] | **WORKING / CODE-ONLY** | `Encrypted: no`. Blank and sparse pages are flagged by `printPageQuality` for the human, but nothing is enforced. |
| 11 | Front matter: title page with title and author; copyright optional (eBook guide [K4]) | **WORKING** | p1 shows title and author from metadata. The copyright section is the author's own, and a duplicate or ungoverned one blocks preflight. |
| 12 | Table of contents: eBook needs one (Heading 1 → TOC [K4]); print is optional | **EPUB WORKING · PDF ABSENT** | EPUB `nav.xhtml` lists all sections plus a title page. The print PDF has no contents page. KDP doesn't require one in print, but nonfiction readers expect it. |
| 13 | Structure: chapter titles as Heading 1 [K4] | **WORKING, upstream-dependent** | Depth comes from stored `headingDepth`. An unconfirmed heading renders at level 4. **The import-fidelity defect on `dd1a3718…` (merged front matter, truncated headings, bibliography as duplicate chapters) passes straight through**, because Publish uses the same sections. |
| 14 | eBook file (EPUB accepted by KDP) [K4] | **WORKING · HELD** | EPUB3 produced. #1899 records EPUBCheck 5.4.0 PASS on fictional books in the production image. |
| 15 | Paperback cover: one PDF of back+spine+front, 0.125″ bleed, spine = pages × paper factor, spine text only >79 pp [K3] | **Geometry WORKING · file ABSENT** | `kdpCoverGeometry` matches K3's formulas exactly for white and cream. No color papers (premium 0.002347, standard 0.002252). Cover Study cannot export a file, has no artwork upload, and no barcode zone. |
| 16 | Cover PDF: 300 DPI, fonts embedded, flattened, no template text [K3] | **ABSENT** | No cover file exists. |
| 17 | Hardcover case-wrap cover | **ABSENT (deliberately deferred to KDP)** | Link to KDP's template generator. |
| 18 | Kindle cover (separate image) | **ABSENT** | Study only, no image export. |
| 19 | Metadata: title, subtitle, author and series on the cover must match the KDP fields [K5] | **ABSENT as a check** | Title comes from the Work, author from the profile. The cover-study title is free text and nothing compares it. Description, keywords and categories are entered in KDP's own form, so they're out of scope. |
| 20 | ISBN: KDP can assign a free one | **ABSENT (correctly)** | No ISBN handling. The UI reserves a "barcode" area. |
| 21 | Delivering the file to the author | **HELD** | App hard-off plus edge 423 (section 2). |
| 22 | Safe rendering of untrusted member Markdown | **BROKEN (P0, recorded)** | `renderPdf` uses `pandoc -f markdown` with raw HTML on and no `--sandbox`, into Chromium loaded from `file://` (#1899, 2026-10-22). Unchanged at `c3798a420`. |

## 4. Witness: fictional render from canonical

- A detached worktree at `c3798a420` (scratchpad, `node_modules` symlinked) called `renderMemberBook` directly. The book was invented: *The Ledger of Gulls* by "Wren Halloway", with Copyright and Dedication sections and 8 chapters. **No member manuscript, no database, no route, no production.**
- Results:
  - PDF 43 pp, 432×648 pt, `hallmark-6x9-v1`.
  - Spectral subsets embedded.
  - Not encrypted.
  - Margins measured from text boxes on pp 6–9: inside 0.90″, outside 0.60″, top 0.73″, folio 0.29″ from the bottom.
  - EPUB3: nav contains every section plus the title page.
  - `inspectBookProduction` returned `[]`.
- **Caveats:**
  - The local Pandoc is 3.8.2.1. The container's is 2.17.1.1, and this run raised deprecation warnings.
  - This is a *renderer* witness, not a route, delivery or production witness.
  - No F6 writer walk was done: production answers 423, and delivery is held.

## 5. Gaps and smallest repairs (proposed, not built)

Ordered by what blocks a real KDP upload first.

| Gap | Smallest repair | Authority needed |
|---|---|---|
| **G0 Canonical ≠ production source** (#1899: prod `exportReleasePolicy.ts` / `v2`; canonical `memberBookExportRelease.ts` / `v1`) | None by me. The single Writer source owner reconciles which line is the base for any Publish work. | Owner (#1800). **Blocks everything below.** |
| **G1 Raw-HTML / `file://` isolation (P0)** | Change Pandoc input to `-f markdown-raw_html-raw_attribute` and add `--sandbox` in `renderPdf` and `renderEpub`. #1899 R2/R4 already tested both, with one caveat: `--sandbox` was negative on Pandoc 2.17 for EPUB. | Owner admission under #1899 Track A |
| **G2 Delivery held** | Nothing. This is #1899 Track A, then certification. Not a KDP task. | Founder/owner. Not lifted here. |
| **G3 Import fidelity** (`dd1a3718…`) | Fix it in import, not in Publish. Until then, Publish preflight could refuse when sections carry no confirmed depth. | #1800 finding. Source-write hold (423) blocks retest. |
| **G4 Page count vs KDP range** | One pure function `kdpPageCountWithin(trim, paper, pages)` in `lib/writersStudio/publish/` (6×9 white 24–828, cream 24–776), shown in step 7. Test it at 23, 24, 828, 829. | Product (small) |
| **G5 Cover file** | Smallest honest path: keep geometry, keep linking KDP's template and Cover Creator, and say plainly that the cover file is made outside Studio. Building a 300-DPI cover PDF exporter is a new capability. | Founder ruling |
| **G6 Metadata match** | Show "your cover must read exactly: *title* / *author*" in step 7. Make no claim of KDP approval. | Product (small) |
| **G7 Print contents page** | Optional. Add a generated contents page from depth-1 headings with Paged.js `target-counter`, at the author's choice. | Founder (design) |
| **G8 PDF Info metadata** | Strip Title/Producer after render, or leave it. KDP rejection is unproven. Test with one KDP proof upload first. | Founder (does a proof upload) |
| **G9 Color papers, other trims** | Leave for now. 6×9 B&W is disclosed truthfully. | None |

## 6. One question for the founder

**Should KDP readiness be pursued as an extension of the #1899 private-copy track (same renderer, same owner, after the canonical/production source is reconciled), rather than as a new Publish lane on canonical?**
Recommended answer: **yes.** The renderer already meets KDP's interior rules. The real blockers are G0 (source line), G1 (isolation) and G2 (certification), and #1899 already owns all three. A separate lane would create the second source owner the release ledger forbids. Once that's settled, G4 and G6 are small and safe, and G5 (cover file) needs its own ruling.

### Founder ruling (2026-11-10, in session)

**Answer: yes, fold into #1899.** KDP readiness is now part of the #1899 PDF/EPUB track. It is not a new Publish lane. That means:
- the same renderer;
- the same single Writer source owner;
- G0 (source reconciliation), G1 (isolation) and G2 (certification) stay owned by #1899;
- G4 and G6 run as small follow-ons inside that track, **after G0**;
- G5 (cover file) still needs its own ruling.

The ruling authorizes **no** implementation, merge, deploy or hold change.

## Sources (KDP, fetched 2026-11-10)

- [K1] Set Trim Size, Bleed, and Margins: https://kdp.amazon.com/en_US/help/topic/GVBQ3CMEQW3W2VL6
- [K2] Paperback Submission Guidelines: https://kdp.amazon.com/en_US/help/topic/G201857950
- [K3] Create a Paperback Cover: https://kdp.amazon.com/en_US/help/topic/G201953020
- [K4] eBook Manuscript Formatting Guide: https://kdp.amazon.com/en_US/help/topic/G200645680
- [K5] Metadata Guidelines for Books: https://kdp.amazon.com/en_US/help/topic/G201097560
