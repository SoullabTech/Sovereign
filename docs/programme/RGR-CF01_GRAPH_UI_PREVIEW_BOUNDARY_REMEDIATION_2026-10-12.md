# RGR-CF01 — Graph/UI Boundary Determination and Preview Remediation

**Date:** 2026-10-12
**Programme:** RELATIONAL-GEOMETRY-REASONING
**Parent commit:** f2f5a39a35fb20ba272f1e35d09fec3f46703993
**Repair branch:** fix/rgr-cf01-preview-boundary-20261012
**Standing:** Isolated repair candidate; builder red/green and compatibility PASS; exact-successor independent review PENDING
**Authority:** No merge, installation, production action, MAIA change, member data, model research or Work Unit advancement.

## I. Graph/UI trust boundary — upstream validation is adequate on examined caller paths

The exact frozen commit has one production Graph constructor call in scripts/builder/founder-workspace/desktop-viewmodel.mjs:160 and one production RGR-CF01 reader call in that assembler at line 158. The assembler first replaces the canonical Work Unit's research_snapshot using readRgrCf01ResearchIntake, then builds Graph. The work-unit adapter does not copy arbitrary research_snapshot properties from local records. The desktop's jarvis:workspace-viewmodel IPC handler (jarvis-desktop/src/main.js:711-760) generates or reuses its own view-model; renderer callers can provide only an evidence_ref and boolean refresh flags (preload.js:13-24). No arbitrary caller-provided snapshot crosses that IPC seam.

A direct synthetic call to pure buildEvidenceGraph accepted a fabricated OBSERVED snapshot with format-valid but false source SHA/commit. That function-level result does not establish any member-controlled or remotely reachable path. No such injection path was found in the examined desktop assembly. The existing source-reader SHA and frozen stage checks are retained; duplicating them throughout Graph/UI is not justified by this caller audit.

Caller inventory and exact Git source fingerprints:
~/JARVIS-handoffs/RGR-CF01-review-f2f5a39a-20261012/GRAPH_UI_BOUNDARY_CALLER_AUDIT_2026-10-12.json

## II. Separately reproduced preview-time local symlink redirection

The host-assembled view-model may remain cached while the user requests evidence preview. In the earlier readEvidencePreview implementation, the general local-file branch used statSync and readFileSync on the originally admitted lexical file path. A local actor able to replace that file with a symlink after its source ref was admitted could redirect preview outside the allowed root.

A disposable synthetic test used a harmless marker outside the temporary workspace. The admitted reference remained in the Graph, and preview followed the symlink to that benign marker. This was a **local filesystem substitution test only**, not an attack on members, a remote exploit, or evidence of production compromise.

Fixture receipt:
~/JARVIS-handoffs/RGR-CF01-review-f2f5a39a-20261012/GRAPH_UI_PREVIEW_SYMLINK_SYNTHETIC_2026-10-12.json

Two independently prompted local reviewers agreed on REVISE for the preview scope. GPT-OSS made an untrue claim that the test read /etc/passwd; only the synthetic marker was read. Qwen's ancillary description of the Graph checks was also broader than the code warrants. Those assertions are excluded; only the independently reproduced, directly observed defect is admitted.

## III. Minimal change

Only the noncanonical local evidence-preview branch in scripts/builder/founder-workspace/desktop-viewmodel.mjs is changed. It now validates the canonical target at preview time, refuses outside-root paths and final-component symlinks, requires O_NOFOLLOW, and opens a regular file via a pinned descriptor before reading. It closes the descriptor after preview. Relative canonical Git-blob previews are not changed.

The previous C1/C2 frozen source reader, Graph, renderer, research intake and Work Unit remain unchanged. The repair does not claim a full defense against concurrent privileged replacement of ancestor directory entries; that would require a separate, stronger filesystem isolation design.

## IV. Red/green evidence and compatibility

- New synthetic preview test file: tests/constitutional/founder-workspace/rgr-cf01-preview-boundary.mjs
- Pre-fix: **3/5 PASS, 2/5 FAIL** (final-file and parent-directory outside symlink substitutions exposed).
- Post-fix: **5/5 PASS**, preserving ordinary admitted preview while refusing the two substituted paths, unlisted source and outside absolute source.
- Focused RGR / B5 / B7 / Writer beta checks: **29/29 PASS**.
- Complete Founder Workspace matrix in the separate compatible newer-JARVIS test worktree (base ceb6be1860def4ffb4e26b7ade46f9aae6c17838): **49/49 PASS**.
- Headless Chrome development browser: all five rooms PASS, zero page errors and zero external requests. The bridge is synthetic, not the installed desktop.
- JavaScript syntax and diff whitespace checks: PASS.

The compatibility worktree is not a combined release commit, an approved merge, or installed JARVIS.

## V. Next independent review and Founder authority

Review the exact successor commit with independent file-read traces and tool-generated source citations. Test the actual open/realpath/no-follow behavior and check the remaining narrow race limitations. Require a substantive PASS/REVISE/HOLD, with all invalid attempts retained. A valid PASS returns to the Founder for a separate acceptance decision. No merge, deployment, model research, MAIA or production authority follows from this record.
