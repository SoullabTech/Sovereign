# RGR-CF01 / REV-01 — Governed, Evidence-Verifiable Source Review

**Date:** 2026-10-12
**Purpose:** A narrowly authorized, independently checkable local-model source review of the exact RGR-CF01 custody repair, after earlier GPT-OSS/Qwen review PASS narratives failed citation quality.
**Research programme:** existing `RELATIONAL-GEOMETRY-REASONING`
**Exact six-file reviewed commit:** `f2f5a39a35fb20ba272f1e35d09fec3f46703993`
**Parent:** `0b6578fc8585304805a9c7cd71264e9955d2b0f0`
**Research Work Unit:** `v2-rgr-cf01-research-intake-20261012` — must remain DRAFT and without read/write, shell, network, deploy or production authority.
**Reviewer identities:** local Ollama `gpt-oss:20b` (primary) and distinct `jarvis-qwen3-coder:65k` (challenger).
**Authority:** The user's explicit instruction to establish a read-only independently verifiable review lane permits this bounded review instrument and local inference. It **does not** grant the existing DRAFT W0.v2 research Work Unit execution authority, create a W4 attempt, authorize external model requests, or promote any scientific/MAIA claim.

## 1 · Boundary between builder, reviewer and verification

REV-01 has three logically distinct layers:

1. **Builder / bounded reader:** exact `git show <commit>:<allowlisted_file>` returns line-numbered chunks of at most 24 lines, only when the local reviewer model requests them through `read_source`.
2. **Distinct models:** independent primary/challenger conversations, distinct model families; the output of one is not injected into the other's source context. Models may call `submit_review` only after required critical source regions have been returned.
3. **Deterministic independent replay:** a separate invocation of `audit` rereads the pinned Git blobs, reconstructs each displayed chunk, validates receipt IDs, line quotes, each model tool-call identity and order, the final submit operation, and the SHA-256 hash chain. The model never declares its own verification to be true.

This instrument is not a human review, a canonical W4 append into the DRAFT Research Work Unit, a review of the complete application, or a deployment rehearsal. It is a source-grounded model evaluation and a mechanically verifiable evidence record.

## 2 · Read capability membrane

- One exact Git commit; six exact changed paths, checked against the `diff-tree`.
- Preflight refuses dirty target, unexpected parent or changed work-unit authority.
- `read_source(file_id,start,end)` accepts only declared symbolic file IDs and integer ranges within actual committed line counts. It rejects paths, negative/bool/out-of-bounds arguments and chunks beyond 24 lines.
- The model does not receive arbitrary shell, filesystem, HTTP or repository-edit tools. The harness calls only local `http://127.0.0.1:11434/api/chat` to execute user-authorized local reviewer inference.
- The test/review apparatus lives on an isolated engineering branch. Review outputs are written exclusively under `~/JARVIS-handoffs`, outside tracked source, and each run gets a new folder rather than overwriting previous attempts.

## 3 · Required observed reads

Mandatory excerpts cover the exact documentation, renderer, graph, frozen stage constants, index-validation logic, compiled digest/commit pins, source-byte verification, browser witness, and synthetic defeat tests. A model must actually request at least ten specific bounded source regions, including four distinct critical reader regions (source commit pin, frozen gate definitions, index field validation, and source byte comparison). A preloaded source summary or `git show` on the builder's side alone does not satisfy this condition.

Each successful model call creates a receipt with the symbolic file ID, exact commit/path, full-file SHA-256, line bounds, literal line content, row digest and event ID. The transcript includes the actual model-origin tool-call object. The audit refuses any receipt that cannot be tied to a preceding `read_source` call.

## 4 · Verdict admissibility

The final `submit_review` must state **PASS / REVISE / HOLD**, a substantial summary, 6–22 exact citations across all six files, coverage of all four reader proof regions, five named checks, material findings with falsifiers and remediations where applicable, and explicit review limitations.

A citation is valid only if its receipt exists, its exact line is in that receipt, and its literal quote appears on that exact original committed source line. A citation to an unrequested or nonexistent line is invalid. The audit rejects a PASS that contradicts a high/medium/critical finding or an uncertain/negative named check. It also validates that the verdict came from the model's actual `submit_review` tool call rather than a parser fabricating a submission.

Earlier malformed PASS outputs remain historic negative review-quality evidence. They are not silently converted to evidence by using a normalized auditor-derived line number.

## 5 · Two-model evidence gate

- **MODEL_REVIEW_READY_FOR_FOUNDER_ADJUDICATION** requires a separately replay-validated PASS from both distinct models. This is *model evidence readiness*, not substantive independent human approval or canonical W4 standing.
- A technically valid REVISE/HOLD from either reviewer produces **HOLD_OR_REVISE_MODEL_CHALLENGE**.
- An omitted review, malformed citation/receipt, bad hash chain, tool-call provenance failure, expired budget or incomplete reading produces **HOLD_MODEL_REVIEW_EVIDENCE_INCOMPLETE**.

Every verdict is preserved along with its source receipts, rejected calls and failed-review history. Only a separate Founder act can decide whether this technical model evidence suffices for engineering candidate acceptance under existing law.

## 6 · Falsification requirements

The synthetic review validator must kill: invented receipt IDs, invented lines, invented quotes, missing required source reads, unauthorized tool arguments/path traversal, model PASS with material defects, model PASS with uncertain checks, broken hash chains, forged receipt content, and forged read events that have no prior model-origin tool call. Positive synthetic evidence must replay successfully without touching target Git or production.

## 7 · Independence and security limits

The models are from separate local families, but both are still software whose outputs may be wrong. The mechanical validator checks **the claim's linkage to committed source**, not correctness of the model's interpretation. The receipt hash chain is tamper-evident against accidental/unsynchronized modification, not a signed third-party log. True institutional human independence, if required by the constitutional gate, still needs a distinct reviewer/human act.

REV-01 cannot confer model consciousness, relational transformation, MAIA personhood, new member evaluation permissions or any RGR statistical support. Any future change to the review harness itself requires another version/commit and a new separately attributable review run.

## 8 · Execution, audit, and stop

After the review mechanism has passed its own synthetic falsifiers and normal repository governance checks, a separately recorded run may invoke:

```text
python3 scripts/builder/rgr-cf01-source-review-v1.py run all
```

The completed artifact can be replay-audited without Ollama:

```text
python3 scripts/builder/rgr-cf01-source-review-v1.py audit /Users/soullab/JARVIS-handoffs/<exact-reviewed-output-directory>
```

The harness must stop on any unexpected commit, source path, authority, model family identity, source-read quota, invalid cited line, malformed review or reviewer dispute. No merge, push, installation, MAIA change, member data, benchmark or research experiment is authorized.
