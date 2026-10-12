# RGR-CF01 / REV-02 — Verifier-issued source-line tokens

**Date:** 2026-10-12
**Standing:** BOUNDED REVIEW-INSTRUMENT CORRECTION, NOT RESEARCH/PRODUCT APPROVAL
**Frozen candidate:** `f2f5a39a35fb20ba272f1e35d09fec3f46703993`
**Parent review instrument:** REV-01, commit `32ec8302171414790f975bd31b06a0a20c2debc2`
**Work Unit:** `v2-rgr-cf01-research-intake-20261012`, still DRAFT, no authority changes

## Defeat evidence from REV-01

The first actually executed tool-use review proved that both distinct local model families could request all ten required committed source excerpts through `read_source`. The local app produced bounded source receipts and chained read events.

Both models nevertheless failed the final `submit_review` evidence contract: GPT-OSS and Qwen reproduced some quoted source lines incorrectly, omitted precise quote fields or mismatched citations, and exhausted the bounded invalid-submission budget. The mechanical gate correctly produced `HOLD_MODEL_REVIEW_EVIDENCE_INCOMPLETE`; no model PASS was accepted. This is an observed **review format failure**, not a new RGR-CF01 custody defect.

The exact REV-01 failed attempt remains under `~/JARVIS-handoffs/RGR-CF01-REV01-GOVERNED-SOURCE-REVIEW-20261012`. It must not be overwritten or retroactively relabeled.

## One isolated protocol repair

REV-02 preserves the same exact six-file commit, mandatory ten `read_source` regions, local-only model families, finite read and turn quotas, authority restrictions, model-origin tool-call ledger, hash chain, and separate no-model `audit` replay.

The only change to the model-facing citation contract is that literal source-quote retyping becomes **verifier-issued line-token copying**:

- Each actual read response includes the exact committed `text` and a 16-character `line_token` derived from the full-file SHA-256, pinned commit, line number and exact line content.
- `submit_review` supplies `receipt_id`, `line`, `line_token` and a reviewer-authored `claim`.
- The deterministic validator requires that the model previously requested the receipt, that the line is within it, that the token matches the exact line, and that each changed file and all four reader-critical sections are cited.
- After a valid submission, the verifier generates `verified-source-citations.json`, supplying exact committed source lines directly from Git. No model-written quotation can be promoted to source authority.

This preserves the important independence boundary: the model still chooses to request and interpret specific source spans, but it is not judged on byte-for-byte prose transcription. Missing, invented or cross-receipt tokens must be rejected.

## Falsification and acceptance

The v2 test suite adds cross-receipt line-token substitution to the 15 existing read/authority/source/receipt/audit defeat checks. Passing all 16 is necessary before any new local model attempt. The exact committed v2 instrument must pass the ordinary sovereignty Git hooks, and each actual review run must have its own new output directory and SHA-pinned instrumentation identity.

Reviewer verdicts remain `PASS`, `REVISE` or `HOLD`. Two distinct mechanically replay-validated PASS results may yield `MODEL_REVIEW_READY_FOR_FOUNDER_ADJUDICATION`, never automatic Founder acceptance. Any model challenge, missing proof or format failure must preserve the prior hold.

**No merge, JARVIS installation, MAIA change, member data, scientific benchmark, RGR model training or public deployment is authorized.**
