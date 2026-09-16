# WS-SOURCE-INTAKE-01 — Writer Source Intake

**Date:** 2026-09-16
**Base:** `892c88ee449cb6f18086659105ae9202ae6f5616`
**Status:** implementation candidate · not merged · not deployed

## Lived finding

Andrea Fagan arrives as a writer whose primary source is handwritten. Writer's Studio could import an already-digital manuscript, but it had no honest path for photographed notebook pages, notes, scans, or reference material that should support a Work without becoming the manuscript.

## Governing distinction

> Bringing material into a Work does not make it manuscript.

Three acts remain separate:

1. **Custody** — the writer brings a source into Studio; the original is preserved.
2. **Transcription review** — extraction/OCR produces a draft; for scanned or handwritten material, the writer corrects and accepts it.
3. **Belonging** — the writer explicitly says the reviewed source feeds a particular Living Work.

No upload, OCR result, similarity signal, or MAIA inference may perform act 3.

## Implemented slice

- `/writers-studio/sources` accepts `.txt`, `.md`, `.docx`, text/scanned `.pdf`, JPG/PNG/HEIC/HEIF/TIFF/WebP.
- Handwritten images are OCR'd locally with Tesseract; HEIC/HEIF can be normalized locally with ffmpeg.
- Image-only PDFs are rasterized locally with `pdftoppm` and OCR'd page-by-page.
- OCR/extracted drafts remain `draft` until writer review.
- OCR failure preserves the original and records an honest error state; manual transcription remains possible.
- Reviewed sources may cross into a Living Work only through `materialType = source_upload` and only when member-owned, reviewed, and non-Sanctuary.
- The source-intake page offers the explicit **Bring this to the Work** gesture and an optional writer-authored relationship sentence.
- Existing Materials UI recognizes and can bring reviewed source uploads.
- The canonical rebuilt Write room renders actual source materials belonging to the current Work and a real intake door.

## Persistence repair

The pre-existing Workbench filesystem path lived inside the container image and had no production volume. That contradicted the Workbench custody promise. This slice introduces `WORKBENCH_UPLOADS_DIR=/app/data/workbench` and a dedicated `workbench_data` volume so originals and transcription files survive container replacement.

The production image adds only local runtime tools: `tesseract-ocr`, English OCR data, and `poppler-utils`. No source upload is sent to a third-party OCR provider.

## Refusals / invariants

- ⛔ OCR output never enters a Work before review.
- ⛔ Sanctuary source material cannot cross into a Work.
- ⛔ Source material does not become manuscript text through the belonging gesture.
- ⛔ OCR failure never deletes the original.
- ⛔ Unknown file types are refused rather than treated as read.
- ⛔ A Work relationship is never inferred from upload.

## Evidence

Targeted Jest suite: **71 passed · 0 failed** across source intake, Work-material crossing, Home composition, rebuilt-rail honesty, Workbench usability, and Studio map.

Local OCR witness:

```text
IMAGE="The river taught me to listen.\nThis belongs beside chapter four.\nAndrea notebook page."
PDF="The river taught me to listen.\nThis belongs beside chapter four.\nAndrea notebook page."
```

The scanned-PDF witness found and repaired a macOS `/tmp` symlink incompatibility in Homebrew Tesseract/Leptonica by resolving the canonical source path before process invocation.

**Evidence limit:** the OCR witness used a photographed/rasterized text specimen, not Andrea Fagan's actual handwriting. The local OCR execution path is proven; handwriting recognition quality is **not yet accepted**. A real handwriting specimen plus an authenticated desktop/mobile browser walk of the review flow are owed before production acceptance.

## Not authorized by this slice

No merge, production deploy, automatic MAIA reading of all materials, automatic manuscript insertion, semantic clustering, generated relationship sentence, or background ingestion is authorized by this record.
