# RGR-CF01 / REV-03 — Source-bound judgments and deterministic evidence joins

**Date:** 2026-10-12
**Exact research candidate:** `f2f5a39a35fb20ba272f1e35d09fec3f46703993`
**Research standing:** DRAFT, documentary hypotheses only
**Review standing:** instrument candidate, independently replayable; no human or W4 ratification
**Model pair:** local GPT-OSS 20B primary; local Qwen3 Coder challenger, separate contexts and distinct model families
**Authority:** read-only source audit and local model inference; no merge, production, installation, member data, MAIA, research benchmark or model experiments.

## Why REV-03 follows the failed attempts

REV-01 proved that models could request all ten exact source excerpts, but both failed the literal quote-copying requirement. REV-02 proved the same read-based custody using verifier-issued 16-character line tokens, but Qwen's final token/report fields were inadmissible and GPT-OSS's final tool call encountered local Ollama HTTP 500. Both attempts were **HOLD_MODEL_REVIEW_EVIDENCE_INCOMPLETE**. Their original local receipts, model calls, and failures remain retained outside the repository.

These failures are evidence that asking a model to *format its own citations* is not a reliable independent verifier. They do not invalidate the source-custody engineering or entitle anyone to weaken the evidence boundary.

## Single bounded change

REV-03 leaves the independently versioned REV-01/REV-02 instruments untouched and reuses their proven exact-commit and `read_source` engine. Each reviewer must still personally request the ten mandatory bounded excerpts of the six changed files. The underlying model read calls are stored with exact source bytes, line ranges, per-row tokens, message identities, a SHA-256 event chain and a replayable read manifest.

After reads, the model produces **structured JSON judgments** rather than a complicated `submit_review` function call or self-typed citations. The five required checks are: `CF01-C1`, `CF01-C2`, `graph_ui`, `test_scope`, and `authority`. Each must include status PASS/CONCERN/UNCERTAIN, an assessment, and a concrete defeat test. Findings require severity, the associated check, defect mechanism, falsifier and remedy; limitations must be explicit.

**Crucial constraint:** The deterministic source verifier—not the model—then attaches exact Git source excerpts for each review check, using a frozen evidence-join map and only actual model-requested receipts. It refuses a final verdict if any required region was not personally requested or its source could not be verified. The model cannot cite nonexistent line numbers because source paths and line ranges are never model-authored in the final answer.

## Independent replay

A separate read-only `audit` action rereads every chunk from `git show`, proves model tool-call identity and temporal order, reconstructs the SHA-256 event chain, validates the exact final JSON as the content of a previously observed model response, revalidates the five checks/findings, and reproduces the source evidence join.

A forged transcript, changed read line, missing model tool call, different final JSON, invalid review check, or contradictory PASS must fail. A verified model result is still a model interpretation, not a scientific finding, independent human endorsement or permission to advance JARVIS's DRAFT Work Unit.

## Scope and gates

- **Technical readiness:** REV-01 had 15/15 synthetic falsifiers; REV-02 had 16/16; REV-03 adds 8/8 source-join and final-model-origin falsifiers.
- **Local model audit:** both distinct reviewers must return structurally and mechanically valid judgments. Identical PASS results yield `MODEL_REVIEW_READY_FOR_FOUNDER_ADJUDICATION`, not acceptance.
- **Substantive challenge:** any CONCERN, UNCERTAIN, REVISE, HOLD, invalid evidence or transport failure remains held, with all failed attempts preserved.
- **Human governance:** only the Founder can adjudicate a subsequently validated review. Canonical W4, merge, installation and MAIA integration remain separate explicit decisions.

This is a **final-format repair** to the review process; it is not another change to the completed CF01-C1/C2 source custody.
