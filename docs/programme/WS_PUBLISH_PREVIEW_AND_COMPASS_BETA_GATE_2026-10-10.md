# Writer's Studio — Publish preview + Living Compass beta candidate

Date: 2026-10-10. Status: **engineering candidate only; NOT authorized for beta rollout or production cutover**.

## Intent

The small beta may show the writer where a Work could lead while honestly distinguishing preparation from publication. The book-edition Publish experience is optional and does not create a manuscript, submit a file, accept a publishing agreement, transfer rights, or contact a publisher.

## Candidate custody

- Isolated worktree: `/Users/soullab/ws-publish-preview-20261010`.
- Branch: `feature/ws-publish-preview-20261010`, based on source commit `6a731b459f` (Listen, section return, target-aware Publish, earlier beta release records).
- Integrates the optional Living Compass prompts and MAIA role boundary from the separate October 10 local engineering work, without creating a second Work-purpose record.
- Existing source worktree, canonical code, live application, database, uploads, and beta entitlements were not modified through this patch.

## Beta interface contract

- The Home entry is **Publish · Preview** for a Work with exactly one selected manuscript.
- The panel shows the current source/revision, preliminary structural issues, and five intended paths: Amazon KDP paperback, Amazon KDP hardcover, Kindle/EPUB, print-interior PDF, and optional Soullab Press.
- `exportsCertified` defaults to `false` and is not granted by the Home caller. The visible PDF/EPUB controls are genuinely disabled, and `make()` separately refuses an export while false. Preliminary structural success is not retailer approval or file proof.
- The positive PDF and EPUB render-flow tests use `exportsCertified: true` **only inside their mocked test harness** to preserve the existing future verified path.
- This is a **UI/product availability boundary**, not a server entitlement or replacement for the renderer's own authorization checks. The existing owner-scoped render API remains unchanged; it must be reviewed separately before any full export offer is called certified.
- Soullab Press remains a possible human path and never implies automatic submission, publication, acceptance, or rights transfer.
- For other writing forms, the panel explicitly states that book editions are the first publishing form and other form-specific paths are planned.

## Local proof

- Existing Publish tests passed before edits: 5/5.
- Revised Publish tests: 8/8. They test preview GET-only behavior, disabled exports, negative preflight, optional Soullab Press, positive mocked PDF and EPUB paths, and Home placement.
- Combined Publish, Compass, writer-role, section-return and voice tests: 24/24, five suites.
- Unified canonical route test: 6/6 after test-only CSS module mapping was added.
- Original broader Studio baseline and candidate were compared; no newly failing assertion was identified. A House-arrival test was updated to preserve the actual offline-Cabin branch instead of changing its product behavior.
- **Full build, actual file download/proof, cross-member browser rehearsal and production migration safety are not certified by these unit tests.**

## Mandatory release stop

Do not enable `exportsCertified` in the live Studio or invite ordinary beta writers until the final frozen image and member-owned source safety are approved. Pending production schema migrations, old/new reader compatibility, crash-safe source upload custody, Caddy ingress fence, rollback, non-founder member access/isolation, Safari, Scarlett Listen acceptance, and a complete writer save/reopen journey must be evidenced independently.

An intentionally limited Publish preview is *not* a waiver of those release gates.

## Future acceptance before exports

1. Generate PDF and EPUB from an isolated synthetic or explicitly consented Work using the exact release image, not a mock.
2. Download/reopen each file, prove headings, pagination, fonts and reflow, and check KDP-specific interior requirements separately from cover requirements.
3. Verify download failure/timeout, ownership refusal, provenance, and no unintended manuscript or source mutation.
4. Promote export capability only by a separate reviewed release change. Keep publisher submissions and Soullab Press conversations explicit author decisions.

## Final local verification addendum (October 10)

- Full targeted Writer's Studio Jest set at this engineering tree after correcting the stale Cabin arrival test: **1,998 passed, 14 failed, 2,012 total; 174 suites passed, 11 failed, 185 total.** The 14 failing assertions were also present in the untouched source-branch baseline; no new assertion failures from this patch were found. This remains an open broad-regression gate.
- Untouched source-branch broad baseline: **1,982 passed, 15 failed, 1,997 total** (the additional run failure was a CSS-module import that the isolated candidate's Jest-only mock repaired).
- Exact member-scoped render route tests: **12/12 passed**, including authorization, ownership, provenance and file cleanup with mocked renderer.
- Modified Publish UI tests: **8/8 passed**; optional Compass tests: **6/6 passed**. Targeted Publish/Compass/voice/section/role subset: **24/24 passed**; canonical Studio route suite: **6/6 passed**.
- TypeScript full check completed with **exit code 2** and **932 project-wide TS diagnostic lines**, with none naming the modified Publish, Compass or Studio-host files. Modified TS/TSX files separately passed syntax/transpilation. Do not call this a clean build; reconcile against the exact final build baseline and finish compile certification.
- All results are local engineering evidence, not a release, invitation, file download acceptance or production approval.
