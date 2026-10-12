# RGR-CF01 — Documentary custody repair evidence

**Date:** 2026-10-12
**Programme:** `RELATIONAL-GEOMETRY-REASONING` (existing programme only)
**Research subject:** `RGR-CF01`, counterfactual relational geometry intake
**Repair branch:** `fix/rgr-cf01-custody-attestation-20261012`
**Exact parent candidate:** `0b6578fc8585304805a9c7cd71264e9955d2b0f0`
**Standing:** BUILDER VERIFICATION PASS · INDEPENDENT REVIEW NOT PERFORMED · FOUNDER ADJUDICATION PENDING
**Authority:** isolated implementation, synthetic tests and read-only compatibility/browser witness only. No merge, push, install, deployment, model/benchmark execution, member-data use, clinical inference, or MAIA change.

## 1. Findings repaired

### CF01-C1 — Gate-standing text and status could be changed

Prior: `rgr-research-intake-reader.mjs` checked identity and only four of six gate standings. It accepted altered standing for hypotheses/falsification and arbitrary display labels or explanatory text. A falsified free-text review assertion could therefore appear under an apparently healthy source receipt.

Repair: six exact, frozen objects define `id`, `label`, `plain`, and `standing`, compared structurally and in order against the read sidecar. The reader rejects altered gate statuses, labels, explanatory text, extra keys, and re-dated provenance. The returned UI data derives from the frozen source constants, not free-form local sidecar text. Any future genuinely changed standing must use a separately governed new evidentiary event/version.

New adversarial checks: stage 1 promoted to `documented`, stage 2 promoted to `documented`, review explanatory text claiming acceptance, changed hypothesis label, extra stage key, modified timestamp and injected top-level verdict. All refuse `UNVERIFIED`.

### CF01-C2 — Locally co-edited document and sidecar could appear source-verified

Prior: source bytes were compared only against `meta.source_sha256` supplied by the same mutable local index. A coordinated rewrite of both could pass.

Repair: compile-time trusted anchors `RGR_CF_SOURCE_COMMIT=0b6578fc8585304805a9c7cd71264e9955d2b0f0` and `RGR_CF_SOURCE_SHA256=98991c78a57d06ec4b234531d3ea1a56e59cfc23b6af1cb0353da639dd62efab`. The test suite independently obtains the exact intake blob bytes with `git show COMMIT:path` and proves the pinned SHA. The **runtime reader remains filesystem-only, with no Git subprocess or model/network call** and requires both a matching local index pin and the actual document hash against the compiled constant. Thus co-altering index and document cannot pass. An observed local match means only `LOCAL_BYTES_MATCH_PINNED_COMMIT_DOCUMENT`, not current branch identity, independent review, or scientific support.

The pre-existing local JARVIS orientation index at `~/.claude/ain-delegation/projections/rgr-cf01-research-intake.v1.json` was updated atomically with exactly one `source_commit` field. Its `recorded_at`, source digest, six stages, and `NOT_AUTHORIZED` controls were preserved. The canonical W0.v2 DRAFT Work Unit remains unmodified.

The pure Graph join and UI also require a pinned-commit custody marker before exposing a verified research edge/card. Kelly's World displays the short original commit and source digest as documentary provenance; it does not report a live Git/production review or accepted hypothesis.

## 2. Verified exact source

The source file `docs/programme/RGR-CF01_COUNTERFACTUAL_RELATIONAL_GEOMETRY_INTAKE_2026-10-12.md` remains byte-identical to its original `0b6578fc85` committed version. None of RGR-00, RGR-03, frozen RGR-04, RGR-06, RGR-05A, or RGR-05B governing material was modified.

## 3. Checks and evidence

| Check | Result | Scope / limits |
|---|---|---|
| Exact committed source hash | PASS | `git show 0b6578fc...:docs/programme/RGR-CF01_...md` SHA-256 matches compiled pin |
| C1/C2 custody adversarial tests | 12/12 PASS | Missing index, symlink, single and co-tamper, forged standing/text, false timestamps, authority, Graph edge |
| Existing Writer's Studio source-witness regressions | 9/9 PASS | Synthetic, no release authority |
| Focused regression | 22/22 PASS | RGR-CF01 and Writer’s Studio tests |
| **Full Founder Workspace matrix on isolated compatibility worktree** | **44/44 PASS** | Combines source changes *without merge or commit* with newer JARVIS branch `ceb6be1860def4ffb4e26b7ade46f9aae6c17838` |
| Five-room Chrome browser walk | PASS | Today, Work, Graph, Monitor, System; pinned commit visible; evidence panel opened; zero page errors and zero HTTP requests |
| Read-only reader restriction | PASS | No subprocess, network, model/provider call, timer or write in CF01 reader |
| `git diff --check` | PASS | No whitespace defects in repair or compatible test projection |

**Compatibility approach:** `/Users/soullab/rgr-cf01-compat-proof-20261012` is an isolated worktree at the sibling commit `ceb6be1860`. It temporarily holds CF01's eight-source-file patch and this candidate repair's code changes as uncommitted local files. It preserves the newer bounded storage-census and B5R3 test fixes, which have no changed-file path overlap with CF01. This proves compatibility, **not** an approved Git merge, CI run, independent review, or desktop installation.

The actual installed JARVIS remains separate; the earlier observed substrate was `~/.jarvis/runtime/sovereign-canonical` at `c6102a347af1`. The browser witness used an isolated development view-model with a synthetic window bridge and may not be described as installed-product acceptance.

## 4. Scope and residual gate

- **Technical CF01-C1/C2 remediation:** BUILDER-CANDIDATE PASS.
- **Independent, source-grounded reviewer:** NOT RUN on this exact successor. The original read-only challenge is a builder-side self-audit and is not independent.
- **Founder acceptance:** NOT RECORDED.
- **Model probing, relational experiment, MAIA integration:** NOT AUTHORIZED.
- **Merge, installed Kelly's World update, publication or deployment:** NOT AUTHORIZED.

A distinct reviewer must inspect the exact successor commit and returned file-read trace, attack the anchor/checkpoint semantics, confirm test validity and inspect coexistence with the newer JARVIS substrate. Then founder adjudication can decide whether to admit and integrate the candidate. No experimental authority is implied by a passing software test.
