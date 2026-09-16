# WS-HANDWRITING-OCR-REPAIR-01 · TRUTHFUL HANDWRITING BOUNDARY

**Branch:** `feature/ws-handwriting-ocr-repair-01-20260916`  
**Base:** `8765a7cdc5c4e3869cc5e35ce410a1856f791b6b` (Hallmark)  
**Status:** **AUTOMATIC HANDWRITING OCR HELD · ORIGINAL + MANUAL TRANSCRIPTION OPEN · BLANK-WORK RELEASE INDEPENDENT · PRODUCTION UNTOUCHED.**

---

## 1 · Question adjudicated

Writer's Studio had a sovereign OCR execution path, but its presence was not
evidence that it could faithfully read a writer's handwriting. This lane asks a
narrow question:

> Can Studio responsibly promise automatic handwriting transcription on the
> fixed lived samples, with the original preserved and the writer reviewing a
> draft?

The answer on 2026-09-16 is **no**. The upload/custody path remains useful, but
automatic handwriting recognition must not be represented as ready.

This decision is independent of the first-work repair at Hallmark
`8765a7cdc`: a writer with no Work can still begin on a blank editable page.

---

## 2 · Fixed witnesses

The writer's pages are private evidence and are not committed. Their hashes bind
this record to the exact bytes evaluated.

### Gate A — lists and fragments

| Page | SHA-256 |
|---|---|
| `IMG_9381.JPG` | `5974eb70fd0a0b87625046edfef8346779dd22bffd18f2213cbbcc1a37ab654b` |
| `IMG_9382.JPG` | `deaf6b21eedfc0ad1ceb7de0108d68906f056b053eab59f1dab852386c51acb7c` |
| `IMG_9383.JPG` | `3eba84b9dfd579c4b3a03ff5251053804e886204f2cb52e57589972d56a05532` |
| `IMG_9384.JPG` | `d9bd79883a49ab7058e825ad98364b6cb6116563d9da5533b27c5cb2c1f3b7e3` |

These pages test short lines, bullets, specialist terms, crossings-out and
variable spacing. They are **not** evidence about continuous prose.

### Gate B — visualization prose

| Page | SHA-256 |
|---|---|
| `IMG_9386.JPG` | `fed7e14594a546b306b1c6bba97142e1276ce9dabef94dfe9c1b1674283f0314` |
| `IMG_9387.JPG` | `78a97d94fed7570b272f67131c67a4b232127d901e3d96086847b2eea6f30f2d` |
| `IMG_9388.JPG` | `f9e6f77253fbbbabd3fb10d3a242a4514c5f731750fb98364277aeac41d536f0` |

The writer identified these as writing from a visualization. They form three
connected pages of sustained prose and test sentence continuity, paragraph
order, insertions, strike-throughs and semantic substitutions. A provisional
human transcript was used locally for scoring; uncertain/crossed-out fragments
were identified separately rather than silently normalized. The transcript is
not committed with this record.

---

## 3 · Engines and preprocessing evaluated

### Installed path — Tesseract 5.3.4

The current production implementation invokes local Tesseract with English and
page segmentation mode 6. On Gate A it preserved the meaning of only 2 of 50
content lines under a generous manual reading. A 64-run matrix over original,
gray/contrast, deskew/upscale and threshold preprocessing with PSM 4/6/11/12 did
not rescue it:

| Tesseract setting | Mean CER | Mean WER |
|---|---:|---:|
| current: original + PSM 6 | 0.737 | 1.166 |
| best tested: gray/contrast + PSM 11 | 0.706 | 1.142 |

On Gate B the installed path destroyed sentence meaning and reading order. It is
not a handwriting transcription engine for these pages.

### PP-OCRv5 mobile candidate

PP-OCRv5 was selected for a local candidate run because its official algorithm
description explicitly reports improved English handwriting recognition. The
official browser SDK can run the model client-side and return line text,
locations and confidence. Those are relevant architectural properties, but
neither constitutes acceptance on Andrea's handwriting. See the
[PP-OCRv5 algorithm documentation](https://github.com/PaddlePaddle/PaddleOCR/blob/main/docs/version3.x/algorithm/PP-OCRv5/PP-OCRv5.en.md)
and the [official browser SDK documentation](https://github.com/PaddlePaddle/PaddleOCR/blob/main/docs/version3.x/inference_deployment/cross_platform/browser.en.md).

The reproducible local harness used `paddleocr@1.2.0` with the redistributed
PP-OCRv5 mobile ONNX weights in `pdfmarkdown-ppocrv5-models@1.0.0`. It is a
candidate benchmark, **not** a production dependency or a claim that the
official browser SDK itself was witnessed.

| Gate / setting | CER | WER |
|---|---:|---:|
| A · original, detection max side 960 | **0.446** | **0.904** |
| A · original, max side 1600 | 0.529 | 0.918 |
| A · normalized + sharpened, max side 1600 | 0.556 | 0.938 |
| B · original, detection max side 960 | **0.293** | 0.741 |
| B · original, max side 1600 | 0.335 | **0.735** |
| B · normalized + sharpened, max side 1600 | 0.354 | 0.747 |

The candidate recovered recognizable spans, but substitutions remained
meaning-changing and correction would require reconstructing most words. Higher
resolution and contrast/sharpening did not establish an acceptable result.

TrOCR remains a research candidate, not a conclusion. Its published handwritten
model is intended for **single text-line images**, so a trustworthy full-page
test first requires a witnessed line-segmentation stage. See the
[TrOCR paper](https://arxiv.org/abs/2109.10282) and
[model card](https://huggingface.co/microsoft/trocr-base-handwritten).

---

## 4 · Release separation implemented

`WRITERS_STUDIO_HANDWRITING_OCR_ENABLED` is a server flag and is **off by
default**. Only the exact value `1` enables automatic OCR for photographed pages
and image-only PDFs.

When the flag is off:

1. the original is written to persistent custody first;
2. no OCR process is invoked;
3. the source upload returns successfully in an honest manual-transcription
   state;
4. Studio shows the original beside an empty transcription field;
5. the writer may type or paste a transcription and explicitly accept it;
6. nothing becomes manuscript merely because it was uploaded or transcribed.

Text, Markdown, DOCX and text-bearing PDFs retain their existing local
extraction paths. Image-only PDFs are conservatively held with photographed
pages because their contents cannot be assumed to be printed text before
recognition.

The member-facing claim that handwritten pages "are transcribed locally" was
removed. The surface now says that originals remain intact, automatic reading
produces only a draft when available, and manual entry is always possible.

⛔ Do not enable the flag merely because an OCR binary or model is installed.
Enablement requires a new Gate A + Gate B witness showing manageable correction,
preserved order and no consequential silent substitutions.

---

## 5 · Verification

- Writer's Studio + Workbench population: **682 passed · 0 failed**.
- Exact member-scoped source route: **3 passed · 0 failed**.
- First-work regression suites were included in the 682 population and also
  rerun in the exact route composition.
- TypeScript no-regression gate: **229 errors vs baseline 239 · 0 new
  diagnostics · exit 0**.
- Design canon: **passed**.
- Provider governance: **passed**.
- Direct Anthropic boundary: **passed**.
- Supabase boundary: **passed**.
- PHI response checker: **exit 0**; five existing warnings outside this lane.

`bd` was unavailable in the execution environment, so no tracker mutation is
claimed by this record.

---

## 6 · Standing

**WS-HANDWRITING-OCR-REPAIR-01 · BOTH LIVED GATES FAIL AUTOMATIC OCR · DEFAULT-OFF
GATE BUILT · ORIGINAL + MANUAL TRANSCRIPTION PRESERVED · FIRST-WORK REPAIR
SEPARABLE · MERGE/DEPLOY NOT YET AUTHORIZED · PRODUCTION UNTOUCHED.**
