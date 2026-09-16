# WS Andrea + Source Intake Integration — 2026-09-16

**Hallmark base:** `afc5d85dc03f451b303fbdd0da90e3de6833c465`

## Purpose

Integrate two beta findings without weakening the current Hallmark Writer's Studio:

1. A first-time writer with no Work can press **Begin a new work** and enter Write immediately.
2. A writer may bring handwritten pages, notes, scans, drafts, and reference material into Studio without those sources silently becoming manuscript text.

## Integrated candidates

- First-work repair: `cc465085911b4c09ee89e0f2c27415f1439fcfc1`
- Sovereign source intake: `46dcbf68a0498b9351aa7e9baea36630d9d667c5`
- Both were replayed onto Hallmark base `afc5d85dc`; the only original overlap was `HomeView.tsx`, and the composed behavior preserves both acts.

## Laws preserved

- Empty Studio: Begin is one act — unnamed Work + blank manuscript + declared expression + canonical Write room.
- Populated Studio: starting another Work may still use the optional naming step.
- Upload is custody, not belonging.
- OCR/extraction output is draft until the writer reviews it when review is required.
- `source_upload` may feed a Work only after review and only through an explicit member gesture.
- A source that feeds a Work remains source material; it does not become manuscript text.

## Custody repairs in integration

- Writer source bytes persist at `/app/data/workbench` on the `workbench_data` production volume.
- OCR failure preserves the original and records an error rather than deleting the source.
- Writer-facing source deletion removes stored bytes, removes that source's `living_work_materials` relationships in the member's Works, and removes the source record.
- Manual reviewed transcription is bounded to 5,000,000 characters.

## Evidence

- Targeted integration/Hallmark suites: **14 suites · 148 tests · 0 failures**.
- Includes Hallmark render route, render pipeline, and rebuild-model suites in addition to Studio arrival/source/material tests.
- TypeScript no-regression: **229 errors vs baseline 239; no regressions**.
- Design canon working-tree gate: PASS.
- Production Compose parse: PASS; `workbench_data` resolves to `/app/data/workbench`.
- Local sovereign OCR witness, image path: PASS.
- Local sovereign OCR witness, scanned-PDF path: PASS.
- Both witnesses returned exactly:
  - `The river taught me to listen.`
  - `This belongs beside chapter four.`
  - `Andrea notebook page.`

## Explicitly not yet accepted

- The OCR specimen is rendered text, not Andrea's actual handwriting. Real handwriting recognition quality remains **OWED**.
- No authenticated Brave desktop walk of upload → review/correct → accept → bring to Work → return to Write has been performed on this integration head. **OWED**.
- No authenticated mobile walk has been performed on this integration head. **OWED**.
- No production deployment is authorized by this record.

## Merge boundary

This branch may be reviewed and merged only after its normal repository gates pass. Merge alone does not claim the two lived witnesses above and does not authorize production deployment.
